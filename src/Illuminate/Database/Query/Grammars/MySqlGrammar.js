import { Grammar } from './Grammar'

export class MySqlGrammar extends Grammar {
  constructor () {
    super()

    /**
     * The grammar specific operators.
     *
     * @type {Array}
     */
    this.operators = ['sounds like']
  }

  /**
   * Add a "where null" clause to the query.
   *
   * @param  {\Illuminate\Database\Query\Builder}  query
   * @param  {object}  where
   * @return {string}
   */
  whereNull (query, where) {
    if (this.isJsonSelector(where.column)) {
      const [field, path] = this.wrapJsonFieldAndPath(where.column)

      return '(json_extract(' + field + path + ') is null OR json_type(json_extract(' + field + path + ')) = \'NULL\')'
    }

    return super.whereNull(query, where)
  }

  /**
   * Add a "where not null" clause to the query.
   *
   * @param  {\Illuminate\Database\Query\Builder}  query
   * @param  {object}  where
   * @return {string}
   */
  whereNotNull (query, where) {
    if (this.isJsonSelector(where.column)) {
      const [field, path] = this.wrapJsonFieldAndPath(where.column)

      return '(json_extract(' + field + path + ') is not null AND json_type(json_extract(' + field + path + ')) != \'NULL\')'
    }

    return super.whereNotNull(query, where)
  }

  /**
   * Wrap the given JSON selector.
   *
   * @param  {string}  value
   * @return {string}
   */
  wrapJsonSelector (value) {
    const [field, path] = this.wrapJsonFieldAndPath(value)

    return 'json_unquote(json_extract(' + field + path + '))'
  }

  /**
   * Wrap a single string in keyword identifiers.
   *
   * @param  {string}  value
   * @return {string}
   */
  wrapValue (value) {
    return value === '*' ? value : '`' + value.replace('`', '``') + '`'
  }
}
