import { capitalize } from 'lodash'

import { Blueprint } from './../Blueprint'
import { Fluent } from './../../../Support/Fluent'
import { Grammar as BaseGrammar } from './../../Grammar'
import { throwException } from './../../../Support'

export class Grammar extends BaseGrammar {
  constructor () {
    super()

    /**
     * The grammar table prefix.
     *
     * @member string
     */
    this.tablePrefix = ''

    /**
     * If this Grammar supports schema changes wrapped in a transaction.
     *
     * @member {boolean}
     */
    this.transactions = false

    /**
     * The commands to be executed outside of create or alter command.
     *
     * @member {Array}
     */
    this.fluentCommands = []

    if (new.target === Grammar) {
      throwException('abstract')
    }
  }

  /**
   * Add the column modifiers to the definition.
   *
   * @param  {string}  sql
   * @param  {\Illuminate\Database\Schema\Blueprint}  blueprint
   * @param  {\Illuminate\Support\Fluent}  column
   * @return {string}
   */
  addModifiers (sql, blueprint, column) {
    for (const modifier of this.modifiers) {
      const method = `modify${modifier}`

      if (Reflect.has(this, method)) {
        sql += this[method](blueprint, column) ?? ''
      }
    }

    return sql
  }

  /**
   * Compile a create database command.
   *
   * @param  {string}  name
   * @param  {\Illuminate\Database\Connection}  connection
   * @return {void}
   *
   * @throws {\LogicException}
   */
  compileCreateDatabase (name, connection) {
    throw new Error('LogicException: This database driver does not support creating databases.')
  }

  /**
   * Compile the blueprint's column definitions.
   *
   * @param  {\Illuminate\Database\Schema\Blueprint}  blueprint
   * @return {Array}
   */
  getColumns (blueprint) {
    const columns = []

    for (const column of blueprint.getAddedColumns()) {
      // Each of the column types have their own compiler functions which are tasked
      // with turning the column definition into its SQL format for this platform
      // used by the connection. The column's modifiers are compiled and added.
      const sql = this.wrap(column) + ' ' + this.getType(column)

      columns.push(this.addModifiers(sql, blueprint, column))
    }

    return columns
  }

  /**
   * Get the fluent commands for the grammar.
   *
   * @return {Array}
   */
  getFluentCommands () {
    return this.fluentCommands
  }

  /**
 * Get the SQL for the column data type.
 *
 * @param  {\Illuminate\Support\Fluent}  column
 * @return {string}
 */
  getType (column) {
    return this[`type${capitalize(column.get('type'))}`](column)
  }

  /**
   * Add a prefix to an array of values.
   *
   * @param  {string}  prefix
   * @param  {Array}  values
   * @return {Array}
   */
  prefixArray (prefix, values) {
    return values.map((value) => {
      return `${prefix} ${value}`
    })
  }

  /**
   * Wrap a value in keyword identifiers.
   *
   * @param  {\Illuminate\Database\Query\Expression|string}  value
   * @param  {boolean}  prefixAlias
   * @return {string}
   */
  wrap (value, prefixAlias = false) {
    return super.wrap(
      value instanceof Fluent ? value.get('name') : value, prefixAlias
    )
  }

  /**
   * Wrap a table in keyword identifiers.
   *
   * @param  {*}  table
   * @return {string}
   */
  wrapTable (table) {
    return super.wrapTable(
      table instanceof Blueprint ? table.getTable() : table
    )
  }
}
