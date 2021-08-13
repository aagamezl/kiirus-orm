import { capitalize, isNil, merge } from 'lodash'

import { Builder } from './Builder'
import { SQLiteConnection } from './../SQLiteConnection'
import { ColumnDefinition } from './ColumnDefinition'
import { Fluent } from './../../Support/Fluent'
import { collect } from '../../Collections/helpers'
import { lcfirst } from '../../Support'

export class Blueprint {
  /**
   * Create a new schema blueprint.
   *
   * @param  {string}  table
   * @param  {Function|null}  callback
   * @param  {string}  prefix
   * @return {void}
   */
  constructor (table, callbackFunction = null, prefix = '') {
    /**
     * The column to add new columns after.
     *
     * @member {string}
     */
    this.after = undefined

    /**
     * The default character set that should be used for the table.
     *
     * @member {string}
     */
    this.charset = undefined

    /**
     * The collation that should be used for the table.
     *
     * @member {string}
     */
    this.collation = undefined

    /**
     * The columns that should be added to the table.
     *
     * @member {\Illuminate\Database\Schema\ColumnDefinition[]}
     */
    this.columns = []

    /**
     * The commands that should be run for the table.
     *
     * @member {\Illuminate\Support\Fluent[]}
     */
    this.commands = []

    /**
     * The storage engine that should be used for the table.
     *
     * @member string
     */
    this.engine = undefined

    /**
     * The prefix of the table.
     *
     * @member {string}
     */
    this.prefix = prefix

    /**
     * The table the blueprint describes.
     *
     * @member {string}
     */
    this.table = table

    /**
     * Whether to make the table temporary.
     *
     * @member {boolean}
     */
    this.temporary = false

    if (!isNil(callbackFunction)) {
      callbackFunction(this)
    }
  }

  /**
   * Add a new command to the blueprint.
   *
   * @param  {string}  name
   * @param  {array}  parameters
   * @return {\Illuminate\Support\Fluent}
   */
  addCommand (name, parameters = []) {
    const command = this.createCommand(name, parameters)

    this.commands.push(command)

    return command
  }

  /**
   * Add the fluent commands specified on any columns.
   *
   * @param  {\Illuminate\Database\Schema\Grammars\Grammar}  grammar
   * @return {void}
   */
  addFluentCommands (grammar) {
    for (const column of this.columns) {
      for (const commandName of grammar.getFluentCommands()) {
        const attributeName = lcfirst(commandName)

        if (column[attributeName] === undefined) {
          continue
        }

        const value = column[attributeName]

        this.addCommand(
          commandName, { value, column }
        )
      }
    }
  }

  /**
   * Add the index commands fluently specified on columns.
   *
   * @return void
   */
  addFluentIndexes () {
    for (const column of this.columns) {
      for (const index of ['primary', 'unique', 'index', 'spatialIndex']) {
        // If the index has been specified on the given column, but is simply equal
        // to "true" (boolean), no name has been specified for this index so the
        // index method can be called without a name and it will generate one.
        if (column.get(index) === true) {
          this[index](column.get('name'))
          column.offsetSet(index, false)

          // continue 2
          continue
        } else if (column.get(index) !== undefined) {
          // If the index has been specified on the given column, and it has a string
          // value, we'll go ahead and call the index method and pass the name for
          // the index since the developer specified the explicit name for this.
          this[index](column.get('name'), column.get(index))
          column[index] = false

          // continue 2
          continue
        }
      }
    }
  }

  /**
   * Add the commands that are implied by the blueprint's state.
   *
   * @param  {\Illuminate\Database\Schema\Grammars\Grammar}  grammar
   * @return {void}
   */
  addImpliedCommands (grammar) {
    if (this.getAddedColumns().length > 0 && !this.creating()) {
      this.commands.unshift(this.createCommand('add'))
    }

    if (this.getChangedColumns().length > 0 && !this.creating()) {
      this.commands.unshift(this.createCommand('change'))
    }

    this.addFluentIndexes()

    this.addFluentCommands(grammar)
  }

  /**
   * Add a new column to the blueprint.
   *
   * @param  {string}  type
   * @param  {string}  name
   * @param  {array}  parameters
   * @return {\Illuminate\Database\Schema\ColumnDefinition}
   */
  addColumn (type, name, parameters = {}) {
    return this.addColumnDefinition(new ColumnDefinition(
      merge({ type, name }, parameters)
    ))
  }

  /**
 * Add a new column definition to the blueprint.
 *
 * @param  {\Illuminate\Database\Schema\ColumnDefinition}  definition
 * @return {\Illuminate\Database\Schema\ColumnDefinition}
 */
  addColumnDefinition (definition) {
    this.columns.push(definition)

    if (this.after) {
      definition.after(this.after)

      this.after = definition.name
    }

    return definition
  }

  /**
   * Get the auto-increment column starting values.
   *
   * @return {Array}
   */
  autoIncrementingStartingValues () {
    if (!this.hasAutoIncrementColumn()) {
      return []
    }

    return collect(this.getAddedColumns()).mapWithKeys((column) => {
      return column.get('autoIncrement') === true
        ? { [column.get('name')]: column.get('startingValue', column.get('from')) }
        : { [column.get('name')]: undefined }
    }).filter().all()
  }

  /**
   * Indicate that the table needs to be created.
   *
   * @return {\Illuminate\Support\Fluent}
   */
  create () {
    return this.addCommand('create')
  }

  /**
   * Determine if the blueprint has a create command.
   *
   * @return {boolean}
   */
  creating () {
    return collect(this.commands).contains((command) => {
      return command.get('name') === 'create'
    })
  }

  /**
   * Create a new Fluent command.
   *
   * @param  {string}  name
   * @param  {array}  parameters
   * @return {\Illuminate\Support\Fluent}
   */
  createCommand (name, parameters = []) {
    return new Fluent(merge({ name }, parameters))
  }

  /**
   * Ensure the commands on the blueprint are valid for the connection type.
   *
   * @param  {\Illuminate\Database\Connection}  connection
   * @return {void}
   *
   * @throws {\BadMethodCallException}
   */
  ensureCommandsAreValid (connection) {
    if (connection instanceof SQLiteConnection) {
      if (this.commandsNamed(['dropColumn', 'renameColumn']).count() > 1) {
        throw new Error(
          'BadMethodCallException: SQLite doesn\'t support multiple calls to dropColumn / renameColumn in a single modification.'
        )
      }

      if (this.commandsNamed(['dropForeign']).count() > 0) {
        throw new Error(
          'BadMethodCallException: SQLite doesn\'t support dropping foreign keys (you would need to re-create the table).'
        )
      }
    }
  }

  /**
   * Get the columns on the blueprint that should be added.
   *
   * @return {\Illuminate\Database\Schema\ColumnDefinition[]}
   */
  getAddedColumns () {
    return this.columns.filter((column) => {
      return !column.get('change')
    })
  }

  /**
   * Get the columns on the blueprint that should be changed.
   *
   * @return {\Illuminate\Database\Schema\ColumnDefinition[]}
   */
  getChangedColumns () {
    return this.columns.filter((column) => {
      return Boolean(column.get('change'))
    })
  }

  /**
   * Get the table the blueprint describes.
   *
   * @return string
   */
  getTable () {
    return this.table
  }

  /**
   * Determine if the blueprint has auto-increment columns.
   *
   * @return {boolean}
   */
  hasAutoIncrementColumn () {
    return collect(this.getAddedColumns()).first((column) => {
      return column.get('autoIncrement') === true
    }) !== undefined
  }

  /**
   * Create a new auto-incrementing integer (4-byte) column on the table.
   *
   * @param  {string}  column
   * @return {\Illuminate\Database\Schema\ColumnDefinition}
   */
  increments (column) {
    return this.unsignedInteger(column, true)
  }

  /**
   * Create a new integer (4-byte) column on the table.
   *
   * @param  {string}  column
   * @param  {boolean}  autoIncrement
   * @param  {boolean}  unsigned
   * @return {\Illuminate\Database\Schema\ColumnDefinition}
   */
  integer (column, autoIncrement = false, unsigned = false) {
    return this.addColumn('integer', column, { autoIncrement, unsigned })
  }

  /**
   * Create a new string column on the table.
   *
   * @param  {string}  column
   * @param  {number|null}  length
   * @return {\Illuminate\Database\Schema\ColumnDefinition}
   */
  string (column, length = null) {
    length = length ?? Builder.defaultStringLength

    return this.addColumn('string', column, { length })
  }

  /**
   * Get the raw SQL statements for the blueprint.
   *
   * @param  {\Illuminate\Database\Connection}  connection
   * @param  {\Illuminate\Database\Schema\Grammars\Grammar}  grammar
   * @return {Array}
   */
  toSql (connection, grammar) {
    this.addImpliedCommands(grammar)

    let statements = []

    // Each type of command has a corresponding compiler function on the schema
    // grammar which is used to build the necessary SQL statements to build
    // the blueprint element, so we'll just call that compilers function.
    this.ensureCommandsAreValid(connection)

    for (const command of this.commands) {
      const method = 'compile' + capitalize(command.get('name'))

      if (Reflect.has(grammar, method)/*  || grammar.hasMacro(method) */) {
        const sql = grammar[method](this, command, connection)

        if (!isNil(sql)) {
          statements = merge(statements, sql)
        }
      }
    }

    return statements
  }

  /**
   * Create a new unsigned integer (4-byte) column on the table.
   *
   * @param  {string}  column
   * @param  {boolean}  autoIncrement
   * @return {\Illuminate\Database\Schema\ColumnDefinition}
   */
  unsignedInteger (column, autoIncrement = false) {
    return this.integer(column, autoIncrement, true)
  }
}
