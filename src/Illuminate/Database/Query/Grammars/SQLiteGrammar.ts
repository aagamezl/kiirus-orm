import { Builder } from '../Builder'
import { Grammar, Where } from './Grammar'

export class SQLiteGrammar extends Grammar {
  /**
   * All of the available clause operators.
   *
   * @var string[]
   */
  protected operators: string[] = [
    '=', '<', '>', '<=', '>=', '<>', '!=',
    'like', 'not like', 'ilike',
    '&', '|', '<<', '>>'
  ]

  /**
   * Compile a date based where clause.
   *
   * @param  {string}  type
   * @param  {{\Illuminate\Database\Query\Builder}}  query
   * @param  {Where}  where
   * @return {string}
   */
  protected dateBasedWhere (type: string, query: Builder, where: Where): string {
    const value = this.parameter(where.value)

    return `strftime('${type}', ${this.wrap(where.column)}) ${where.operator as string} cast(${value} as text)`
  }

  /**
   * Compile a "where date" clause.
   *
   * @param  {\Illuminate\Database\Query\Builder}  query
   * @param  {Where}  where
   * @return {string}
   */
  protected whereDate (query: Builder, where: Where): string {
    return this.dateBasedWhere('%Y-%m-%d', query, where)
  }

  /**
   * Compile a "where day" clause.
   *
   * @param  {\Illuminate\Database\Query\Builder}  query
   * @param  {Where}  where
   * @return {string}
   */
  protected whereDay (query: Builder, where: Where): string {
    return this.dateBasedWhere('%d', query, where)
  }

  /**
   * Compile a "where month" clause.
   *
   * @param  {\Illuminate\Database\Query\Builder}  query
   * @param  {Where}  where
   * @return {string}
   */
  protected whereMonth (query: Builder, where: Where): string {
    return this.dateBasedWhere('%m', query, where)
  }

  /**
   * Compile a "where time" clause.
   *
   * @param  {\Illuminate\Database\Query\Builder}  query
   * @param  {Where}  where
   * @return {string}
   */
  protected whereTime (query: Builder, where: Where): string {
    return this.dateBasedWhere('%H:%M:%S', query, where)
  }

  /**
   * Compile a "where year" clause.
   *
   * @param  {\Illuminate\Database\Query\Builder}  query
   * @param  {Where}  where
   * @return {string}
   */
  protected whereYear (query: Builder, where: Where): string {
    return this.dateBasedWhere('%Y', query, where)
  }

  /**
   * Wrap a union subquery in parentheses.
   *
   * @param  {string}  sql
   * @return {string}
   */
  protected wrapUnion (sql: string): string {
    return `select * from (${sql})`
  }
}
