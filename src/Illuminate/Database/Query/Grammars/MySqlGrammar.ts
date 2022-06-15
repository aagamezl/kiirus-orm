import { isTruthy } from '@devnetic/utils'

import { Builder } from '../Builder'
import { Grammar, Where } from './Grammar'

export class MySqlGrammar extends Grammar {
  /**
   * The grammar specific operators.
   *
   * @type {string[]}
   */
  protected operators: string[] = ['sounds like']

  /**
   * Compile an insert ignore statement into SQL.
   *
   * @param  {\Illuminate\Database\Query\Builder}  query
   * @param  {Record<string, any>}  values
   * @return {string}
   */
  public compileInsertOrIgnore (query: Builder, values: Record<string, any>): string {
    return this.compileInsert(query, values).replace('insert', 'insert ignore')
  }

  /**
   * Compile a "where fulltext" clause.
   *
   * @param  {\Illuminate\Database\Query\Builder}  query
   * @param  {Where}  where
   * @return {string}
   */
  protected whereFulltext (query: Builder, where: Where): string {
    const columns = this.columnize(where.columns)

    const value = this.parameter(where.value)

    const mode = (where.options.mode ?? []) === 'boolean'
      ? ' in boolean mode'
      : ' in natural language mode'

    const expanded = (isTruthy(where.options.expanded) ?? []) && (where.options.mode ?? []) !== 'boolean'
      ? ' with query expansion'
      : ''

    return `match (${columns}) against (` + value + `${mode}${expanded})`
  }

  /**
   * Add a "where null" clause to the query.
   *
   * @param  {\Illuminate\Database\Query\Builder}  query
   * @param  {Where}  where
   * @return {string}
   */
  protected whereNull (query: Builder, where: Where): string {
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
   * @param  {Where}  where
   * @return {string}
   */
  protected whereNotNull (query: Builder, where: Where): string {
    if (this.isJsonSelector(where.column)) {
      const [field, path] = this.wrapJsonFieldAndPath(where.column)

      return '(json_extract(' + field + path + ') is not null AND json_type(json_extract(' + field + path + ')) != \'NULL\')'
    }

    return super.whereNotNull(query, where)
  }

  /**
   * Wrap the given JSON selector for boolean values.
   *
   * @param  {string}  value
   * @return {string}
   */
  protected wrapJsonBooleanSelector (value: string): string {
    const [field, path] = this.wrapJsonFieldAndPath(value)

    return `json_extract(${field}${path})`
  }

  /**
   * Wrap the given JSON selector.
   *
   * @param  {string}  value
   * @return {string}
   */
  protected wrapJsonSelector (value: string): string {
    const [field, path] = this.wrapJsonFieldAndPath(value)

    return 'json_unquote(json_extract(' + field + path + '))'
  }

  /**
   * Wrap a single string in keyword identifiers.
   *
   * @param  {string}  value
   * @return {string}
   */
  protected wrapValue (value: string): string {
    return value === '*' ? value : '`' + value.replace('`', '``') + '`'
  }
}
