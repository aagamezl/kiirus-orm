import { isPlainObject } from 'lodash'

import { Arr } from './../../../Collections/Arr'
import { Grammar } from './Grammar'
import { collect, last } from './../../../Collections/helpers'
import { isNumeric } from './../../../Support'

export class PostgresGrammar extends Grammar {
  constructor () {
    super()

    /**
     * All of the available clause operators.
     *
     * @var string[]
     */
    this.operators = [
      '=', '<', '>', '<=', '>=', '<>', '!=',
      'like', 'not like', 'between', 'ilike', 'not ilike',
      '~', '&', '|', '#', '<<', '>>', '<<=', '>>=',
      '&&', '@>', '<@', '?', '?|', '?&', '||', '-', '@?', '@@', '#-',
      'is distinct from', 'is not distinct from'
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
    // If the query is actually performing an aggregating select, we will let that
    // compiler handle the building of the select clauses, as it will need some
    // more syntax that is best handled by that to keep things neat.
    if (query.aggregateProperty) {
      return
    }

    let select

    if (Array.isArray(query.distinctProperty)) {
      select = 'select distinct on (' + this.columnize(query.distinctProperty) + ') '
    } else if (query.distinctProperty) {
      select = 'select distinct '
    } else {
      select = 'select '
    }

    return select + this.columnize(columns)
  }

  /**
   * Compile an insert and get ID statement into SQL.
   *
   * @param  {\Illuminate\Database\Query\Builder}  query
   * @param  {Array}  values
   * @param  string  sequence
   * @return {string}
   */
  compileInsertGetId (query, values, sequence) {
    return this.compileInsert(query, values) + ' returning ' + this.wrap(sequence ?? 'id')
  }

  /**
   * Compile an insert ignore statement into SQL.
   *
   * @param  {\Illuminate\Database\Query\Builder}  query
   * @param  {Array}  values
   * @return {string}
   */
  compileInsertOrIgnore (query, values) {
    return this.compileInsert(query, values) + ' on conflict do nothing'
  }

  /**
  * Prepares a JSON column being updated using the JSONB_SET function.
  *
  * @param string key
  * @param mixed value
  * @return string
  */
  compileJsonUpdateColumn (key, value) {
    const segments = key.explit('->')

    const field = this.wrap(segments.shift())

    const path = '\'{"' + segments.join('","') + '"}\''

    return `${field} = jsonb_set(${field}::jsonb, ${path}, ${this.parameter(value)})`
  }

  /**
  * Compile an update statement into SQL.
  *
  * @param \Illuminate\Database\Query\Builder query
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
  * @param {\Illuminate\Database\Query\Builder} query
  * @param {Array} values
  * @return {string}
  */
  compileUpdateColumns (query, values) {
    // return collect(values).map(([key, value]) => {
    return collect(values).map((value, key) => {
      const column = last(key.split('.'))

      if (this.isJsonSelector(key)) {
        return this.compileJsonUpdateColumn(column, value)
      }

      return this.wrap(column) + ' = ' + this.parameter(value)
    }).implode(', ')
  }

  /**
  * Compile an update statement with joins or limit into SQL.
  *
  * @param {\Illuminate\Database\Query\Builder} query
  * @param {Array} values
  * @return {string}
  */
  compileUpdateWithJoinsOrLimit (query, values) {
    const table = this.wrapTable(query.fromProperty)

    // const columns = this.compileUpdateColumns(query, values)
    const columns = this.compileUpdateColumns(query, Object.entries(values))

    const alias = last(query.fromProperty.split(/\s+as\s+/i))

    const selectSql = this.compileSelect(query.select(alias + '.ctid'))

    return `update ${table} set ${columns} where ${this.wrap('ctid')} in (${selectSql})`
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
   * @param  {\Illuminate\Database\Query\Builder}  query
   * @param  {Array}  where
   * @return {string}
   */
  dateBasedWhere (type, query, where) {
    const value = this.parameter(where.value)

    return 'extract(' + type + ' from ' + this.wrap(where.column) + ') ' + where.operator + ' ' + value
  }

  /**
   * Prepare the bindings for an update statement.
   *
   * @param  {Array}  bindings
   * @param  {Array}  values
   * @return {Array}
   */
  prepareBindingsForUpdate (bindings, values) {
    values = collect(Object.entries(values)).map((value, column) => {
    // values = collect(Object.entries(values)).map(([column, value]) => {
      return isPlainObject(value) || (this.isJsonSelector(column) && !this.isExpression(value))
        ? JSON.parse(value)
        : value
    }).all()

    const cleanBindings = Arr.except(bindings, 'select')

    return Arr.values([
      ...values,
      ...Arr.flatten(cleanBindings)
    ])
  }

  /**
   * {@inheritdoc}
   *
   * @param  {\Illuminate\Database\Query\Builder}  query
   * @param  {Array}  where
   * @return {string}
   */
  whereBasic (query, where) {
    if (where.operator?.toLowerCase().includes('like')) {
      return `${this.wrap(where.column)}::text ${where.operator} ${this.parameter(where.value)}`
    }

    return super.whereBasic(query, where)
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

    return this.wrap(where.column) + '::date ' + where.operator + ' ' + value
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

    return this.wrap(where.column) + '::time ' + where.operator + ' ' + value
  }
}
