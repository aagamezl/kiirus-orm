import { isNil, isString, merge } from 'lodash'

import { Builder } from './Builder'
import { ColumnDefinition } from './ColumnDefinition'
import { Expression } from './../Query/Expression'
import { Fluent } from './../../Support/Fluent'
import { ForeignIdColumnDefinition } from './ForeignIdColumnDefinition'
import { ForeignKeyDefinition } from './ForeignKeyDefinition'
import { SQLiteConnection } from './../SQLiteConnection'
import { collect } from './../../Collections/helpers'
import { lcfirst, ucfirst } from './../../Support'

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
    this.afterProperty = undefined

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
    this.temporaryProperty = false

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

        if (column.get(attributeName) === undefined) {
          continue
        }

        const value = column.get(attributeName)

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

    if (this.afterProperty) {
      definition.set('after', this.afterProperty)

      this.afterProperty = definition.get('name')
    }

    return definition
  }

  /**
   * Add the columns from the callback after the given column.
   *
   * @param  {string}  column
   * @param  {Function}  callbackFunction
   * @return {void}
   */
  after (column, callbackFunction) {
    this.afterProperty = column

    callbackFunction(this)

    this.afterProperty = undefined
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
    }).filter((column) => column).all()
  }

  /**
   * Create a new auto-incrementing big integer (8-byte) column on the table.
   *
   * @param  {string}  column
   * @return {\Illuminate\Database\Schema\ColumnDefinition}
   */
  bigIncrements (column) {
    return this.unsignedBigInteger(column, true)
  }

  /**
   * Create a new big integer (8-byte) column on the table.
   *
   * @param  {string}  column
   * @param  {boolean}  autoIncrement
   * @param  {boolean}  unsigned
   * @return {\Illuminate\Database\Schema\ColumnDefinition}
   */
  bigInteger (column, autoIncrement = false, unsigned = false) {
    return this.addColumn('bigInteger', column, { autoIncrement, unsigned })
  }

  /**
   * Create a new binary column on the table.
   *
   * @param  {string}  column
   * @return {\Illuminate\Database\Schema\ColumnDefinition}
   */
  binary (column) {
    return this.addColumn('binary', column)
  }

  /**
   * Create a new boolean column on the table.
   *
   * @param  {string}  column
   * @return {\Illuminate\Database\Schema\ColumnDefinition}
   */
  boolean (column) {
    return this.addColumn('boolean', column)
  }

  /**
   * Execute the blueprint against the database.
   *
   * @param  {\Illuminate\Database\Connection}  connection
   * @param  {\Illuminate\Database\Schema\Grammars\Grammar}  grammar
   * @return {void}
   */
  build (connection, grammar) {
    for (const statement of this.toSql(connection, grammar)) {
      connection.statement(statement)
    }
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
   * Create a default index name for the table.
   *
   * @param  {string}  type
   * @param  {Array}  columns
   * @return {string}
   */
  createIndexName (type, columns) {
    const index = (this.prefix + this.table + '_' + columns.join('_') + '_' + type).toLowerCase()

    return index.replace(/[-|.]/g, '_')
  }

  /**
   * Create a new date column on the table.
   *
   * @param  {string}  column
   * @return {\Illuminate\Database\Schema\ColumnDefinition}
   */
  date (column) {
    return this.addColumn('date', column)
  }

  /**
   * Create a new date-time column on the table.
   *
   * @param  {string}  column
   * @param  {number}  precision
   * @return {\Illuminate\Database\Schema\ColumnDefinition}
   */
  dateTime (column, precision = 0) {
    return this.addColumn('dateTime', column, { precision })
  }

  /**
   * Create a new date-time column (with time zone) on the table.
   *
   * @param  {string}  column
   * @param  {number}  precision
   * @return {\Illuminate\Database\Schema\ColumnDefinition}
   */
  dateTimeTz (column, precision = 0) {
    return this.addColumn('dateTimeTz', column, { precision })
  }

  /**
   * Create a new decimal column on the table.
   *
   * @param  {string}  column
   * @param  {number}  total
   * @param  {number}  places
   * @param  {boolean}  unsigned
   * @return {\Illuminate\Database\Schema\ColumnDefinition}
   */
  decimal (column, total = 8, places = 2, unsigned = false) {
    return this.addColumn('decimal', column, { total, places, unsigned })
  }

  /**
   * Create a new double column on the table.
   *
   * @param  {string}  column
   * @param  {number|undefined}  total
   * @param  {number|undefined}  places
   * @param  {boolean}  unsigned
   * @return {\Illuminate\Database\Schema\ColumnDefinition}
   */
  double (column, total = undefined, places = undefined, unsigned = false) {
    return this.addColumn('double', column, { total, places, unsigned })
  }

  /**
   * Indicate that the table should be dropped.
   *
   * @return {\Illuminate\Support\Fluent}
   */
  drop () {
    return this.addCommand('drop')
  }

  /**
   * Indicate that the given columns should be dropped.
   *
   * @param  {Array|*}  columns
   * @return {\Illuminate\Support\Fluent}
   */
  dropColumn (columns) {
    columns = Array.isArray(columns) ? columns : Array.from(arguments)

    return this.addCommand('dropColumn', { columns })
  }

  /**
   * Indicate that the given foreign key should be dropped.
   *
   * @param  {string|Array}  index
   * @return {\Illuminate\Support\Fluent}
   */
  dropForeign (index) {
    return this.dropIndexCommand('dropForeign', 'foreign', index)
  }

  /**
   * Indicate that the table should be dropped if it exists.
   *
   * @return {\Illuminate\Support\Fluent}
   */
  dropIfExists () {
    return this.addCommand('dropIfExists')
  }

  /**
   * Indicate that the given index should be dropped.
   *
   * @param  {string|Array}  index
   * @return {\Illuminate\Support\Fluent}
   */
  dropIndex (index) {
    return this.dropIndexCommand('dropIndex', 'index', index)
  }

  /**
   * Create a new drop index command on the blueprint.
   *
   * @param  {string}  command
   * @param  {string}  type
   * @param  {string|Array}  index
   * @return {\Illuminate\Support\Fluent}
   */
  dropIndexCommand (command, type, index) {
    let columns = []

    // If the given "index" is actually an array of columns, the developer means
    // to drop an index merely by specifying the columns involved without the
    // conventional name, so we will build the index name from the columns.
    if (Array.isArray(index)) {
      columns = index

      index = this.createIndexName(type, columns)
    }

    return this.indexCommand(command, columns, index)
  }

  /**
   * Indicate that the polymorphic columns should be dropped.
   *
   * @param  {string}  name
   * @param  {string|undefined}  indexName
   * @return {void}
   */
  dropMorphs (name, indexName = undefined) {
    this.dropIndex(indexName ?? this.createIndexName('index', [`${name}_type`, `${name}_id`]))

    this.dropColumn(`${name}_type`, `${name}_id`)
  }

  /**
   * Indicate that the given primary key should be dropped.
   *
   * @param  {string|Array|undefined}  index
   * @return {\Illuminate\Support\Fluent}
   */
  dropPrimary (index = undefined) {
    return this.dropIndexCommand('dropPrimary', 'primary', index)
  }

  /**
   * Indicate that the given spatial index should be dropped.
   *
   * @param  {string|Array}  index
   * @return {\Illuminate\Support\Fluent}
   */
  dropSpatialIndex (index) {
    return this.dropIndexCommand('dropSpatialIndex', 'spatialIndex', index)
  }

  /**
   * Indicate that the timestamp columns should be dropped.
   *
   * @return void
   */
  dropTimestamps () {
    this.dropColumn('created_at', 'updated_at')
  }

  /**
   * Indicate that the timestamp columns should be dropped.
   *
   * @return {void}
   */
  dropTimestampsTz () {
    this.dropTimestamps()
  }

  /**
   * Indicate that the given unique key should be dropped.
   *
   * @param  {string|Array}  index
   * @return {\Illuminate\Support\Fluent}
   */
  dropUnique (index) {
    return this.dropIndexCommand('dropUnique', 'unique', index)
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
   * Create a new enum column on the table.
   *
   * @param  {string}  column
   * @param  {Array}  allowed
   * @return {\Illuminate\Database\Schema\ColumnDefinition}
   */
  enum (column, allowed) {
    return this.addColumn('enum', column, { allowed })
  }

  /**
   * Create a new float column on the table.
   *
   * @param  {string}  column
   * @param  {number}  total
   * @param  {number}  places
   * @param  {boolean}  unsigned
   * @return {\Illuminate\Database\Schema\ColumnDefinition}
   */
  float (column, total = 8, places = 2, unsigned = false) {
    return this.addColumn('float', column, { total, places, unsigned })
  }

  /**
   * Specify a foreign key for the table.
   *
   * @param  {string|Array}  columns
   * @param  {string|undefined}  name
   * @return {\Illuminate\Database\Schema\ForeignKeyDefinition}
   */
  foreign (columns, name = undefined) {
    const command = new ForeignKeyDefinition(
      this.indexCommand('foreign', columns, name).getAttributes()
    )

    this.commands[this.commands.length - 1] = command

    return command
  }

  /**
   * Create a new unsigned big integer (8-byte) column on the table.
   *
   * @param  string  column
   * @return {\Illuminate\Database\Schema\ForeignIdColumnDefinition}
   */
  foreignId (column) {
    return this.addColumnDefinition(new ForeignIdColumnDefinition(this, {
      type: 'bigInteger',
      name: column,
      autoIncrement: false,
      unsigned: true
    }))
  }

  /**
   * Create a foreign ID column for the given model.
   *
   * @param  {\Illuminate\Database\Eloquent\Model|string } model
   * @param  {string|undefined}  column
   * @return {\Illuminate\Database\Schema\ForeignIdColumnDefinition}
   */
  foreignIdFor (model, column = undefined) {
    if (isString(model)) {
      model = new model()  // eslint-disable-line
    }

    return model.getKeyType() === 'int' && model.getIncrementing()
      ? this.foreignId(column ?? model.getForeignKey())
      : this.foreignUuid(column ?? model.getForeignKey())
  }

  /**
   * Create a new UUID column on the table with a foreign key constraint.
   *
   * @param  {string}  column
   * @return {\Illuminate\Database\Schema\ForeignIdColumnDefinition}
   */
  foreignUuid (column) {
    return this.addColumnDefinition(new ForeignIdColumnDefinition(this, {
      type: 'uuid',
      name: column
    }))
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
   * Create a new geometry column on the table.
   *
   * @param  {string}  column
   * @return {\Illuminate\Database\Schema\ColumnDefinition}
   */
  geometry (column) {
    return this.addColumn('geometry', column)
  }

  /**
   * Create a new geometrycollection column on the table.
   *
   * @param  {string}  column
   * @return {\Illuminate\Database\Schema\ColumnDefinition}
   */
  geometryCollection (column) {
    return this.addColumn('geometryCollection', column)
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
   * Create a new auto-incrementing big integer (8-byte) column on the table.
   *
   * @param  {string}  column
   * @return {\Illuminate\Database\Schema\ColumnDefinition}
   */
  id (column = 'id') {
    return this.bigIncrements(column)
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
   * Create a new auto-incrementing integer (4-byte) column on the table.
   *
   * @param  string  column
   * @return {\Illuminate\Database\Schema\ColumnDefinition}
   */
  integerIncrements (column) {
    return this.unsignedInteger(column, true)
  }

  /**
   * Specify an index for the table.
   *
   * @param  {string|Array}  columns
   * @param  {string|undefined}  name
   * @param  {string|undefined}  algorithm
   * @return {\Illuminate\Support\Fluent}
   */
  index (columns, name = undefined, algorithm = undefined) {
    return this.indexCommand('index', columns, name, algorithm)
  }

  /**
   * Add a new index command to the blueprint.
   *
   * @param  {string}  type
   * @param  {string|Array}  columns
   * @param  {string}  index
   * @param  {string|undefined}  algorithm
   * @return {\Illuminate\Support\Fluent}
   */
  indexCommand (type, columns, index, algorithm = null) {
    columns = Array.isArray(columns) ? columns : [columns]

    // If no name was specified for this index, we will create one using a basic
    // convention of the table name, followed by the columns, followed by an
    // index type, such as primary or index, which makes the index unique.
    index = index ?? this.createIndexName(type, columns)

    return this.addCommand(
      type, { index, columns, algorithm }
    )
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
   * Create a new IP address column on the table.
   *
   * @param  {string}  column
   * @return \Illuminate\Database\Schema\ColumnDefinition
   */
  ipAddress (column) {
    return this.addColumn('ipAddress', column)
  }

  /**
   * Create a new json column on the table.
   *
   * @param  {string}  column
   * @return {\Illuminate\Database\Schema\ColumnDefinition}
   */
  json (column) {
    return this.addColumn('json', column)
  }

  /**
   * Create a new jsonb column on the table.
   *
   * @param  {string}  column
   * @return {\Illuminate\Database\Schema\ColumnDefinition}
   */
  jsonb (column) {
    return this.addColumn('jsonb', column)
  }

  /**
   * Create a new linestring column on the table.
   *
   * @param  {string}  column
   * @return {\Illuminate\Database\Schema\ColumnDefinition}
   */
  lineString (column) {
    return this.addColumn('lineString', column)
  }

  /**
   * Create a new MAC address column on the table.
   *
   * @param  {string}  column
   * @return {\Illuminate\Database\Schema\ColumnDefinition}
   */
  macAddress (column) {
    return this.addColumn('macAddress', column)
  }

  /**
   * Create a new auto-incrementing medium integer (3-byte) column on the table.
   *
   * @param  {string}  column
   * @return {\Illuminate\Database\Schema\ColumnDefinition}
   */
  mediumIncrements (column) {
    return this.unsignedMediumInteger(column, true)
  }

  /**
   * Create a new medium integer (3-byte) column on the table.
   *
   * @param  {string}  column
   * @param  {boolean}  autoIncrement
   * @param  {boolean}  unsigned
   * @return {\Illuminate\Database\Schema\ColumnDefinition}
   */
  mediumInteger (column, autoIncrement = false, unsigned = false) {
    return this.addColumn('mediumInteger', column, { autoIncrement, unsigned })
  }

  /**
   * Create a new multilinestring column on the table.
   *
   * @param  {string}  column
   * @return {\Illuminate\Database\Schema\ColumnDefinition}
   */
  multiLineString (column) {
    return this.addColumn('multiLineString', column)
  }

  /**
   * Create a new multipoint column on the table.
   *
   * @param  {string}  column
   * @return {\Illuminate\Database\Schema\ColumnDefinition}
   */
  multiPoint (column) {
    return this.addColumn('multiPoint', column)
  }

  /**
   * Create a new multipolygon column on the table.
   *
   * @param  {string}  column
   * @return {\Illuminate\Database\Schema\ColumnDefinition}
   */
  multiPolygon (column) {
    return this.addColumn('multiPolygon', column)
  }

  /**
   * Create a new point column on the table.
   *
   * @param  {string}  column
   * @param  {number|undefined}  srid
   * @return {\Illuminate\Database\Schema\ColumnDefinition}
   */
  point (column, srid = undefined) {
    return this.addColumn('point', column, { srid })
  }

  /**
   * Create a new polygon column on the table.
   *
   * @param  {string}  column
   * @return {\Illuminate\Database\Schema\ColumnDefinition}
   */
  polygon (column) {
    return this.addColumn('polygon', column)
  }

  /**
   * Specify the primary key(s) for the table.
   *
   * @param  {string|array}  columns
   * @param  {string|undefined}  name
   * @param  {string|undefined}  algorithm
   * @return {\Illuminate\Support\Fluent}
   */
  primary (columns, name = undefined, algorithm = undefined) {
    return this.indexCommand('primary', columns, name, algorithm)
  }

  /**
   * Specify a raw index for the table.
   *
   * @param  {string}  expression
   * @param  {string}  name
   * @return {\Illuminate\Support\Fluent}
   */
  rawIndex (expression, name) {
    return this.index([new Expression(expression)], name)
  }

  /**
   * Adds the `remember_token` column to the table.
   *
   * @return {\Illuminate\Database\Schema\ColumnDefinition}
   */
  rememberToken () {
    return this.string('remember_token', 100).nullable()
  }

  /**
   * Rename the table to a given name.
   *
   * @param  {string}  to
   * @return {\Illuminate\Support\Fluent}
   */
  rename (to) {
    return this.addCommand('rename', { to })
  }

  /**
   * Indicate that the given indexes should be renamed.
   *
   * @param  {string}  from
   * @param  {string}  to
   * @return {\Illuminate\Support\Fluent}
   */
  renameIndex (from, to) {
    return this.addCommand('renameIndex', { from, to })
  }

  /**
   * Create a new set column on the table.
   *
   * @param  {string}  column
   * @param  {Array}  allowed
   * @return {\Illuminate\Database\Schema\ColumnDefinition}
   */
  set (column, allowed) {
    return this.addColumn('set', column, { allowed })
  }

  /**
   * Create a new auto-incrementing small integer (2-byte) column on the table.
   *
   * @param  {string}  column
   * @return {\Illuminate\Database\Schema\ColumnDefinition}
   */
  smallIncrements (column) {
    return this.unsignedSmallInteger(column, true)
  }

  /**
   * Create a new small integer (2-byte) column on the table.
   *
   * @param  {string}  column
   * @param  {boolean}  autoIncrement
   * @param  {boolean}  unsigned
   * @return {\Illuminate\Database\Schema\ColumnDefinition}
   */
  smallInteger (column, autoIncrement = false, unsigned = false) {
    return this.addColumn('smallInteger', column, { autoIncrement, unsigned })
  }

  /**
   * Specify a spatial index for the table.
   *
   * @param  {string|Array}  columns
   * @param  {string|undefined}  name
   * @return {\Illuminate\Support\Fluent}
   */
  spatialIndex (columns, name = undefined) {
    return this.indexCommand('spatialIndex', columns, name)
  }

  /**
   * Create a new string column on the table.
   *
   * @param  {string}  column
   * @param  {number|undefined}  length
   * @return {\Illuminate\Database\Schema\ColumnDefinition}
   */
  string (column, length = undefined) {
    length = length ?? Builder.defaultStringLength

    return this.addColumn('string', column, { length })
  }

  /**
   * Indicate that the table needs to be temporary.
   *
   * @return {void}
   */
  temporary () {
    this.temporaryProperty = true
  }

  /**
   * Create a new text column on the table.
   *
   * @param  {string}  column
   * @return {\Illuminate\Database\Schema\ColumnDefinition}
   */
  text (column) {
    return this.addColumn('text', column)
  }

  /**
   * Create a new time column on the table.
   *
   * @param  {string}  column
   * @param  {number}  precision
   * @return {\Illuminate\Database\Schema\ColumnDefinition}
   */
  time (column, precision = 0) {
    return this.addColumn('time', column, { precision })
  }

  /**
   * Create a new time column (with time zone) on the table.
   *
   * @param  {string}  column
   * @param  {number}  precision
   * @return {\Illuminate\Database\Schema\ColumnDefinition}
   */
  timeTz (column, precision = 0) {
    return this.addColumn('timeTz', column, { precision })
  }

  /**
   * Create a new timestamp column on the table.
   *
   * @param  {string}  column
   * @param  {number}  precision
   * @return {\Illuminate\Database\Schema\ColumnDefinition}
   */
  timestamp (column, precision = 0) {
    return this.addColumn('timestamp', column, { precision })
  }

  /**
   * Create a new timestamp (with time zone) column on the table.
   *
   * @param  {string}  column
   * @param  {number}  precision
   * @return {\Illuminate\Database\Schema\ColumnDefinition}
   */
  timestampTz (column, precision = 0) {
    return this.addColumn('timestampTz', column, { precision })
  }

  /**
   * Add nullable creation and update timestamps to the table.
   *
   * @param  {number}  precision
   * @return {void}
   */
  timestamps (precision = 0) {
    this.timestamp('created_at', precision).nullable()

    this.timestamp('updated_at', precision).nullable()
  }

  /**
   * Add creation and update timestampTz columns to the table.
   *
   * @param  {number}  precision
   * @return {void}
   */
  timestampsTz (precision = 0) {
    this.timestampTz('created_at', precision).nullable()

    this.timestampTz('updated_at', precision).nullable()
  }

  /**
   * Create a new auto-incrementing tiny integer (1-byte) column on the table.
   *
   * @param  {string}  column
   * @return {\Illuminate\Database\Schema\ColumnDefinition}
   */
  tinyIncrements (column) {
    return this.unsignedTinyInteger(column, true)
  }

  /**
   * Create a new tiny integer (1-byte) column on the table.
   *
   * @param  {string}  column
   * @param  {boolean}  autoIncrement
   * @param  {boolean}  unsigned
    @return {\Illuminate\Database\Schema\ColumnDefinition}
   */
  tinyInteger (column, autoIncrement = false, unsigned = false) {
    return this.addColumn('tinyInteger', column, { autoIncrement, unsigned })
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
      const method = 'compile' + ucfirst(command.get('name'))

      if (Reflect.has(grammar, method)/*  || grammar.hasMacro(method) */) {
        const sql = grammar[method](this, command, connection)

        if (!isNil(sql)) {
          statements = statements.concat(...[sql])
        }
      }
    }

    return statements
  }

  /**
   * Create a new uuid column on the table.
   *
   * @param  {string}  column
   * @return {\Illuminate\Database\Schema\ColumnDefinition}
   */
  uuid (column) {
    return this.addColumn('uuid', column)
  }

  /**
   * Add the proper columns for a polymorphic table using UUIDs.
   *
   * @param  {string}  name
   * @param  {string|undefined}  indexName
   * @return {void}
   */
  uuidMorphs (name, indexName = undefined) {
    this.string(`${name}_type`)

    this.uuid(`${name}_id`)

    this.index([`${name}_type`, `${name}_id`], indexName)
  }

  /**
   * Specify a unique index for the table.
   *
   * @param  {string|Array}  columns
   * @param  {string|undefined}  name
   * @param  {string|undefined}  algorithm
   * @return {\Illuminate\Support\Fluent}
   */
  unique (columns, name = undefined, algorithm = undefined) {
    return this.indexCommand('unique', columns, name, algorithm)
  }

  /**
   * Create a new unsigned big integer (8-byte) column on the table.
   *
   * @param  {string}  column
   * @param  {boolean}  autoIncrement
   * @return {\Illuminate\Database\Schema\ColumnDefinition}
   */
  unsignedBigInteger (column, autoIncrement = false) {
    return this.bigInteger(column, autoIncrement, true)
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

  /**
   * Create a new unsigned medium integer (3-byte) column on the table.
   *
   * @param  {string}  column
   * @param  {boolean}  autoIncrement
   * @return {\Illuminate\Database\Schema\ColumnDefinition}
   */
  unsignedMediumInteger (column, autoIncrement = false) {
    return this.mediumInteger(column, autoIncrement, true)
  }

  /**
   * Create a new unsigned small integer (2-byte) column on the table.
   *
   * @param  {string}  column
   * @param  {boolean}  autoIncrement
   * @return {\Illuminate\Database\Schema\ColumnDefinition}
   */
  unsignedSmallInteger (column, autoIncrement = false) {
    return this.smallInteger(column, autoIncrement, true)
  }

  /**
   * Create a new unsigned tiny integer (1-byte) column on the table.
   *
   * @param  {string}  column
   * @param  {boolean}  autoIncrement
   * @return {\Illuminate\Database\Schema\ColumnDefinition}
   */
  unsignedTinyInteger (column, autoIncrement = false) {
    return this.tinyInteger(column, autoIncrement, true)
  }

  /**
   * Create a new year column on the table.
   *
   * @param  {string}  column
   * @return {\Illuminate\Database\Schema\ColumnDefinition}
   */
  year (column) {
    return this.addColumn('year', column)
  }
}
