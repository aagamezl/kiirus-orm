import { isNumeric } from '@devnetic/utils'
import { isPlainObject, set } from 'lodash'

import { Arr } from '../../../Collections/Arr'
import { Grammar } from './Grammar'
import { Str } from '../../../Support'
import { collect, last } from './../../../Collections/helpers'

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
  * Compile a delete statement into SQL.
  *
  * @param {\Illuminate\Database\Query\Builder} query
  * @return {string}
  */
  compileDelete (query) {
    if (query.joins.length > 0 || query.limitProperty !== undefined) {
      return this.compileDeleteWithJoinsOrLimit(query)
    }

    return super.compileDelete(query)
  }

  /**
  * Compile a delete statement with joins or limit into SQL.
  *
  * @param {\Illuminate\Database\Query\Builder} query
  * @return {string}
  */
  compileDeleteWithJoinsOrLimit (query) {
    const table = this.wrapTable(query.fromProperty)

    const alias = last(query.fromProperty.split(/\s+as\s+/i))

    const selectSql = this.compileSelect(query.select(alias + '.rowid'))

    return `delete from ${table} where ${this.wrap('rowid')} in (${selectSql})`
  }

  /**
   * Compile an insert ignore statement into SQL.
   *
   * @param  {\Illuminate\Database\Query\Builder}  query
   * @param  {Array}  values
   * @return {string}
   */
  compileInsertOrIgnore (query, values) {
    return this.compileInsert(query, values).replace('insert', 'insert or ignore')
  }

  /**
   * Compile a "JSON length" statement into SQL.
   *
   * @param  {string}  column
   * @param  {string}  operator
   * @param  {string}  value
   * @return {string}
   */
  compileJsonLength (column, operator, value) {
    const [field, path] = this.wrapJsonFieldAndPath(column)

    return `json_array_length(${field}${path}) ${operator} ${value}`
  }

  /**
  * Compile a "JSON" patch statement into SQL.
  *
  * @param {string} column
  * @param {*} value
  * @return {string}
  */
  compileJsonPatch (column, value) {
    return `json_patch(ifnull(${this.wrap(column)}, json('{}')), json(${this.parameter(value)}))`
  }

  /**
   * Compile a truncate table statement into SQL.
   *
   * @param  {\Illuminate\Database\Query\Builder}  query
   * @return {Array}
   */
  compileTruncate (query) {
    return [
      { 'delete from sqlite_sequence where name = ?': [query.fromProperty] },
      { ['delete from ' + this.wrapTable(query.fromProperty)]: [] }
    ]
  }

  /**
  * Compile an update statement into SQL.
  *
  * @param {\Illuminate\Database\Query\Builder} query
  * @param {Array} values
  * @return {string}
  */
  compileUpdate (query, values) {
    if (query.joins.length > 0 || query.limitProperty !== undefined) {
      return this.compileUpdateWithJoinsOrLimit(query, values)
    }

    return super.compileUpdate(query, values)
  }

  /**
   * Compile the columns for an update statement.
   *
   * @param  {\Illuminate\Database\Query\Builder}  query
   * @param  {Array}  values
   * @return {string}
   */
  compileUpdateColumns (query, values) {
    const jsonGroups = this.groupJsonColumnsForUpdate(values)

    return collect(values).reject((value, key) => {
      return this.isJsonSelector(key)
    }).merge(jsonGroups).map((value, key) => {
      const column = last(key.split('.'))
      value = jsonGroups[key] !== undefined ? this.compileJsonPatch(column, value) : this.parameter(value)

      return this.wrap(column) + ' = ' + value
    }).join(', ')
  }

  /**
   * Compile an update statement with joins or limit into SQL.
   *
   * @param  {\Illuminate\Database\Query\Builder}  query
   * @param  {array}  values
   * @return {string}
   */
  compileUpdateWithJoinsOrLimit (query, values) {
    const table = this.wrapTable(query.fromProperty)

    const columns = this.compileUpdateColumns(query, Object.entries(values))

    const alias = last(query.fromProperty.split(/\s+as\s+/i))

    const selectSql = this.compileSelect(query.select(alias + '.rowid'))

    return `update ${table} set ${columns} where ${this.wrap('rowid')} in (${selectSql})`
  }

  /**
   * Compile an "upsert" statement into SQL.
   *
   * @param  {\Illuminate\Database\Query\Builder}  query
   * @param  {Array}  values
   * @param  {Array}  uniqueBy
   * @param  {Array}  update
   * @return {string}
   */
  compileUpsert (query, values, uniqueBy, update) {
    let sql = this.compileInsert(query, values)

    sql += ' on conflict (' + this.columnize(uniqueBy) + ') do update set '

    const columns = collect(update).map((value, key) => {
      return isNumeric(key)
        ? this.wrap(value) + ' = ' + this.wrapValue('excluded') + '.' + this.wrap(value)
        : this.wrap(key) + ' = ' + this.parameter(value)
    }).implode(', ')

    return sql + columns
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
   * Group the nested JSON columns.
   *
   * @param  {Array}  values
   * @return {object}
   */
  groupJsonColumnsForUpdate (values) {
    const groups = {}

    for (const [key, value] of values) {
      if (this.isJsonSelector(key)) {
        set(groups, Str.after(key, '.').replace(/->/g, '.'), value)
      }
    }

    return groups
  }

  /**
   * Prepare the bindings for an update statement.
   *
   * @param {Array} bindings
   * @param {Array} values
   * @return {Array}
   */
  prepareBindingsForUpdate (bindings, values) {
    const groups = this.groupJsonColumnsForUpdate(Object.entries(values))

    values = collect(Object.entries(values)).reject((value, key) => {
      return this.isJsonSelector(key)
    }).merge(groups).map((value) => {
      return (isPlainObject(value) || Array.isArray(value)) ? JSON.stringify(value) : value
    }).all()

    const cleanBindings = Arr.except(bindings, 'select')

    return [
      ...values,
      ...Arr.flatten(cleanBindings)
    ]
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
   * Wrap the given JSON selector.
   *
   * @param  {string}  value
   * @return {string}
   */
  wrapJsonSelector (value) {
    const [field, path] = this.wrapJsonFieldAndPath(value)

    return `json_extract(${field}${path})`
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
