import { Grammar } from './Grammar'

export class SQLiteGrammar extends Grammar {
  constructor () {
    super()

    /**
     * All of the available clause operators.
     *
     * @var Array<string>
     */
    this.operators = [
      '=', '<', '>', '<=', '>=', '<>', '!=',
      'like', 'not like', 'ilike',
      '&', '|', '<<', '>>'
    ]
  }

  /**
   * Compile a date based where clause.
   *
   * @param  {string}  type
   * @param  {{\Illuminate\Database\Query\Builder}}  query
   * @param  {Array}  where
   * @return {string}
   */
  dateBasedWhere (type, query, where) {
    const value = this.parameter(where.value)

    return `strftime('${type}', ${this.wrap(where.column)}) ${where.operator} cast(${value} as text)`
  }

  /**
 * Compile a "where date" clause.
 *
 * @param  {\Illuminate\Database\Query\Builder}  query
 * @param  {Array}  where
 * @return {string}
 */
  whereDate (query, where) {
    return this.dateBasedWhere('%Y-%m-%d', query, where)
  }

  /**
   * Compile a "where day" clause.
   *
   * @param  {\Illuminate\Database\Query\Builder}  query
   * @param  {Array}  where
   * @return {string}
   */
  whereDay (query, where) {
    return this.dateBasedWhere('%d', query, where)
  }

  /**
 * Compile a "where month" clause.
 *
 * @param  {\Illuminate\Database\Query\Builder}  query
 * @param  {Array}  where
 * @return {string}
 */
  whereMonth (query, where) {
    return this.dateBasedWhere('%m', query, where)
  }

  /**
   * Compile a "where time" clause.
   *
   * @param  {\Illuminate\Database\Query\Builder}  query
   * @param  {Array}  where
   * @return {string}
   */
  whereTime (query, where) {
    return this.dateBasedWhere('%H:%M:%S', query, where)
  }

  /**
   * Compile a "where year" clause.
   *
   * @param  {\Illuminate\Database\Query\Builder}  query
   * @param  {Array}  where
   * @return {string}
   */
  whereYear (query, where) {
    return this.dateBasedWhere('%Y', query, where)
  }

  /**
   * Wrap a union subquery in parentheses.
   *
   * @param  string  sql
   * @return {string}
   */
  wrapUnion (sql) {
    return `select * from (${sql})`
  }
}
