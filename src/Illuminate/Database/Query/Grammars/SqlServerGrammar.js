import { clone } from 'lodash'
import { isNumeric } from '@devnetic/utils'

import { Grammar } from './Grammar'

export class SqlServerGrammar extends Grammar {
  constructor () {
    super()

    /**
     * All of the available clause operators.
     *
     * @type {Array}
     */
    this.operators = [
      '=', '<', '>', '<=', '>=', '!<', '!>', '<>', '!=',
      'like', 'not like', 'ilike',
      '&', '&=', '|', '|=', '^', '^='
    ]
  }

  /**
   * Compile the "select *" portion of the query.
   *
   * @param  {\Illuminate\Database\Query\Builder}  query
   * @param  {Array}  columns
   * @return {string|undefined}
   */
  compileColumns (query, columns) {
    if (query.aggregateProperty) {
      return
    }

    let select = query.distinctProperty ? 'select distinct ' : 'select '

    const limit = Number(query.limitProperty ?? 0)
    const offset = Number(query.offsetProperty ?? 0)

    // If there is a limit on the query, but not an offset, we will add the top
    // clause to the query, which serves as a "limit" type clause within the
    // SQL Server system similar to the limit keywords available in MySQL.
    if (isNumeric(query.limitProperty) && limit > 0 && offset <= 0) {
      select += `top ${limit} `
    }

    return select + this.columnize(columns)
  }

  /**
   * Compile an exists statement into SQL.
   *
   * @param  {\Illuminate\Database\Query\Builder } query
   * @return {string}
   */
  compileExists (query) {
    const existsQuery = clone(query)

    existsQuery.columns = []

    return this.compileSelect(existsQuery.selectRaw('1 [exists]').limit(1))
  }

  /**
   * Compile the "limit" portions of the query.
   *
   * @param  {\Illuminate\Database\Query\Builder}  query
   * @param  {number}  limit
   * @return {string}
   */
  compileLimit (query, limit) {
    return ''
  }

  /**
   * Compile the "offset" portions of the query.
   *
   * @param  {\Illuminate\Database\Query\Builder}  query
   * @param  {number}  offset
   * @return {string}
   */
  compileOffset (query, offset) {
    return ''
  }

  /**
   * Compile a select query into SQL.
   *
   * @param  {\Illuminate\Database\Query\Builder}  query
   * @return {string}
   */
  compileSelect (query) {
    if (!query.offsetProperty) {
      return super.compileSelect(query)
    }

    // If an offset is present on the query, we will need to wrap the query in
    // a big "ANSI" offset syntax block. This is very nasty compared to the
    // other database systems but is necessary for implementing features.
    if (query.columns.length === 0) {
      query.columns = ['*']
    }

    return this.compileAnsiOffset(
      query, this.compileComponents(query)
    )
  }

  /**
   * Compile a "where date" clause.
   *
   * @param  {\Illuminate\Database\Query\Builder}  query
   * @param  {Array}  where
   * @return {string}
   */
  whereDate (query, where) {
    const value = this.parameter(where.value)

    return 'cast(' + this.wrap(where.column) + ' as date) ' + where.operator + ' ' + value
  }

  /**
   * Compile a "where time" clause.
   *
   * @param  {\Illuminate\Database\Query\Builder}  query
   * @param  {Array}  where
   * @return {string}
   */
  whereTime (query, where) {
    const value = this.parameter(where.value)

    return 'cast(' + this.wrap(where.column) + ' as time) ' + where.operator + ' ' + value
  }

  /**
   * Wrap a table in keyword identifiers.
   *
   * @param  {string}  table
   * @return {string}
   */
  wrapTableValuedFunction (table) {
    const matches = [...table.matchAll(/^(.+?)(\(.*?\))]/g)]
    if (matches.length > 0) {
      table = matches[1] + ']' + matches[2]
    }

    return table
  }

  /**
   * Wrap a union subquery in parentheses.
   *
   * @param  {string}  sql
   * @return {string}
   */
  wrapUnion (sql) {
    return 'select * from (' + sql + ') as ' + this.wrapTable('temp_table')
  }

  /**
   * Wrap a single string in keyword identifiers.
   *
   * @param  {string}  value
   * @return {string}
   */
  wrapValue (value) {
    return value === '*' ? value : '[' + value.replace(']', ']]') + ']'
  }
}
