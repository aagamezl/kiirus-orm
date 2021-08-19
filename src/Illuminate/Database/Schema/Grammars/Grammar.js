import { isBoolean, isNil } from 'lodash'

import { Blueprint } from './../Blueprint'
import { Expression } from './../../Query/Expression'
import { Fluent } from './../../../Support/Fluent'
import { Grammar as BaseGrammar } from './../../Grammar'
import { throwException, ucfirst } from './../../../Support'

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
   * Compile a foreign key command.
   *
   * @param  {\Illuminate\Database\Schema\Blueprint}  blueprint
   * @param  {\Illuminate\Support\Fluent}  command
   * @return {string}
   */
  compileForeign (blueprint, command) {
    // We need to prepare several of the elements of the foreign key definition
    // before we can create the SQL, such as wrapping the tables and convert
    // an array of columns to comma-delimited strings for the SQL queries.
    let sql = `alter table ${this.wrapTable(blueprint)} add constraint ${this.wrap(command.get('index'))} `

    // Once we have the initial portion of the SQL statement we will add on the
    // key name, table name, and referenced columns. These will complete the
    // main portion of the SQL statement and this SQL will almost be done.
    const references = Array.isArray(command.get('references')) ? command.get('references') : [command.get('references')]
    sql += `foreign key (${this.columnize(command.get('columns'))}) references ${this.wrapTable(command.get('on'))} (${this.columnize(references)})`

    // Once we have the basic foreign key creation statement constructed we can
    // build out the syntax for what should happen on an update or delete of
    // the affected columns, which will get something like "cascade", etc.
    if (!isNil(command.get('onDelete'))) {
      sql += ` on delete ${command.get('onDelete')}`
    }

    if (!isNil(command.get('onUpdate'))) {
      sql += ` on update ${command.get('onUpdate')}`
    }

    return sql
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
   * Format a value so that it can be used in "default" clauses.
   *
   * @param  {*}  value
   * @return {string}
   */
  getDefaultValue (value) {
    if (value instanceof Expression) {
      return value
    }

    return isBoolean(value)
      ? `'${parseInt(value, 10)}'`
      : `'${String(value)}'`
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
    return this[`type${ucfirst(column.get('type'))}`](column)
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
