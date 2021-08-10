import { isBoolean, isPlainObject, isString } from 'lodash'
import { isNumeric } from '@devnetic/utils'

import { Grammar } from './Grammar'
import { collect } from '../../../Collections/helpers'

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
  * Compile a delete query that does not use joins.
  *
  * @param {\Illuminate\Database\Query\Builder} query
  * @param {string} table
  * @param {string} where
  * @return {string}
  */
  compileDeleteWithoutJoins (query, table, where) {
    let sql = super.compileDeleteWithoutJoins(query, table, where)

    // When using MySQL, delete statements may contain order by statements and limits
    // so we will compile both of those here. Once we have finished compiling this
    // we will return the completed SQL statement so it will be executed for us.
    if (query.orders.length > 0) {
      sql += ' ' + this.compileOrders(query, query.orders)
    }

    if (query.limitProperty !== undefined) {
      sql += ' ' + this.compileLimit(query, query.limitProperty)
    }

    return sql
  }

  /**
   * Compile an insert statement into SQL.
   *
   * @param  {\Illuminate\Database\Query\Builder}  query
   * @param  {Array}  values
   * @return {string}
   */
  compileInsert (query, values) {
    if (values.length === 0) {
      values = [[]]
    }

    return super.compileInsert(query, values)
  }

  /**
   * Compile an insert ignore statement into SQL.
   *
   * @param  {\Illuminate\Database\Query\Builder}  query
   * @param  {Array}  values
   * @return {string}
   */
  compileInsertOrIgnore (query, values) {
    return this.compileInsert(query, values).replace('insert', 'insert ignore')
  }

  /**
   * Compile a "JSON contains" statement into SQL.
   *
   * @param  {string}  column
   * @param  {string}  value
   * @return {string}
   */
  compileJsonContains (column, value) {
    const [field, path] = this.wrapJsonFieldAndPath(column)

    return `json_contains(${field}, ${value}${path})`
  }

  /**
   * Compile a "JSON length" statement into SQL.
   *
   * @param  string  column
   * @param  string  operator
   * @param  string  value
   * @return string
   */
  compileJsonLength (column, operator, value) {
    const [field, path] = this.wrapJsonFieldAndPath(column)

    return `json_length(${field}${path}) ${operator} ${value}`
  }

  /**
   * Prepare a JSON column being updated using the JSON_SET function.
   *
   * @param  {string}  key
   * @param  {*}  value
   * @return {string}
   */
  compileJsonUpdateColumn (key, value) {
    if (isBoolean(value)) {
      value = value ? 'true' : 'false'
    } else if (Array.isArray(value)) {
      value = 'cast(? as json)'
    } else {
      value = this.parameter(value)
    }

    const [field, path] = this.wrapJsonFieldAndPath(key)

    return `${field} = json_set(${field}${path}, ${value})`
  }

  /**
   * Compile the lock into SQL.
   *
   * @param  {\Illuminate\Database\Query\Builder}  query
   * @param  {boolean|string}  value
   * @return {string}
   */
  compileLock (query, value) {
    if (!isString(value)) {
      return value ? 'for update' : 'lock in share mode'
    }

    return value
  }

  /**
   * Compile the columns for an update statement.
   *
   * @param  {\Illuminate\Database\Query\Builder}  query
   * @param  {Array}  values
   * @return {string}
   */
  compileUpdateColumns (query, values) {
    return collect(values).map((value, key) => {
      if (this.isJsonSelector(key)) {
        return this.compileJsonUpdateColumn(key, value)
      }

      return this.wrap(key) + ' = ' + this.parameter(value)
    }).join(', ')
  }

  /**
   * Compile an update statement without joins into SQL.
   *
   * @param  {\Illuminate\Database\Query\Builder}  query
   * @param  {string}  table
   * @param  {string}  columns
   * @param  {string}  where
   * @return {string}
   */
  compileUpdateWithoutJoins (query, table, columns, where) {
    let sql = super.compileUpdateWithoutJoins(query, table, columns, where)

    if (query.orders.length > 0) {
      sql += ' ' + this.compileOrders(query, query.orders)
    }

    if (query.limitProperty) {
      sql += ' ' + this.compileLimit(query, query.limitProperty)
    }

    return sql
  }

  /**
   * Compile an "upsert" statement into SQL.
   *
   * @param  {\Illuminate\Database\Query\Builder} query
   * @param  {Array}  values
   * @param  {Array}  uniqueBy
   * @param  {Array}  update
   * @return {string}
   *
   * @throws \RuntimeException
   */
  compileUpsert (query, values, uniqueBy, update) {
    const sql = this.compileInsert(query, values) + ' on duplicate key update '

    const columns = collect(update).map((value, key) => {
      return isNumeric(key)
        ? this.wrap(value) + ' = values(' + this.wrap(value) + ')'
        : this.wrap(key) + ' = ' + this.parameter(value)
    }).implode(', ')

    return sql + columns
  }

  /**
   * Prepare the bindings for an update statement.
   *
   * Booleans, integers, and doubles are inserted into JSON updates as raw values.
   *
   * @param  {object}  bindings
   * @param  {Array}  values
   * @return {Array}
   */
  prepareBindingsForUpdate (bindings, values) {
    values = collect(Object.entries(values)).reject((value, column) => {
      return this.isJsonSelector(column) && isBoolean(value)
    }).map(value => {
      return (isPlainObject(value) || Array.isArray(value)) ? JSON.stringify(value) : value
    }).all()

    return super.prepareBindingsForUpdate(bindings, values)
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
   * Wrap the given JSON selector for boolean values.
   *
   * @param  string  $value
   * @return string
   */
  wrapJsonBooleanSelector (value) {
    const [field, path] = this.wrapJsonFieldAndPath(value)

    return `json_extract(${field}${path})`
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
