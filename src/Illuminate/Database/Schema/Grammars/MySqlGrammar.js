import { isInteger, isNil } from 'lodash'

import { Grammar } from './Grammar'
import { addslashes } from './../../../Support'
import { collect } from './../../../Collections/helpers'

export class MySqlGrammar extends Grammar {
  constructor () {
    super()

    /**
     * The possible column modifiers.
     *
     * @member {string[]}
     */
    this.modifiers = [
      'Unsigned', 'Charset', 'Collate', 'VirtualAs', 'StoredAs', 'Nullable',
      'Srid', 'Default', 'Increment', 'Comment', 'After', 'First'
    ]

    /**
     * The possible column serials.
     *
     * @member {string[]}
     */
    this.serials = ['bigInteger', 'integer', 'mediumInteger', 'smallInteger', 'tinyInteger']
  }

  /**
   * Compile an add column command.
   *
   * @param  {\Illuminate\Database\Schema\Blueprint}  blueprint
   * @param  {\Illuminate\Support\Fluent}  command
   * @return {Array}
   */
  compileAdd (blueprint, command) {
    const columns = this.prefixArray('add', this.getColumns(blueprint))

    return Array.from([
      ...['alter table ' + this.wrapTable(blueprint) + ' ' + columns.join(', ')],
      ...this.compileAutoIncrementStartingValues(blueprint)
    ].values())
  }

  /**
   * Compile the auto-incrementing column starting values.
   *
   * @param  {\Illuminate\Database\Schema\Blueprint}  blueprint
   * @return {Array}
   */
  compileAutoIncrementStartingValues (blueprint) {
    return collect(blueprint.autoIncrementingStartingValues()).map((value, column) => {
      return 'alter table ' + this.wrapTable(blueprint.getTable()) + ' auto_increment = ' + value
    }).all()
  }

  /**
   * Compile the query to determine the list of columns.
   *
   * @return {string}
   */
  compileColumnListing () {
    return 'select column_name as `column_name` from information_schema.columns where table_schema = ? and table_name = ?'
  }

  /**
   * Compile a create table command.
   *
   * @param  {\Illuminate\Database\Schema\Blueprint}  blueprint
   * @param  {\Illuminate\Support\Fluent}  command
   * @param  {\Illuminate\Database\Connection}  connection
   * @return {Array}
   */
  compileCreate (blueprint, command, connection) {
    let sql = this.compileCreateTable(
      blueprint, command, connection
    )

    // Once we have the primary SQL, we can add the encoding option to the SQL for
    // the table.  Then, we can check if a storage engine has been supplied for
    // the table. If so, we will add the engine declaration to the SQL query.
    sql = this.compileCreateEncoding(
      sql, connection, blueprint
    )

    // Finally, we will append the engine configuration onto this SQL statement as
    // the final thing we do before returning this finished SQL. Once this gets
    // added the query will be ready to execute against the real connections.
    return Array.from([...[this.compileCreateEngine(sql, connection, blueprint)],
      ...this.compileAutoIncrementStartingValues(blueprint)].filter(item => item).values()
    )
  }

  /**
   * Compile a create database command.
   *
   * @param  {string}  name
   * @param  {\Illuminate\Database\Connection}  connection
   * @return {string}
   */
  compileCreateDatabase (name, connection) {
    const charset = this.wrapValue(connection.getConfig('charset'))
    const collation = this.wrapValue(connection.getConfig('collation'))

    return `create database ${this.wrapValue(name)} default character set ${charset} default collate ${collation}`
  }

  /**
   * Append the character set specifications to a command.
   *
   * @param  {string}  sql
   * @param  {\Illuminate\Database\Connection}  connection
   * @param  {\Illuminate\Database\Schema\Blueprint}  blueprint
   * @return {string}
   */
  compileCreateEncoding (sql, connection, blueprint) {
    // First we will set the character set if one has been set on either the create
    // blueprint itself or on the root configuration for the connection that the
    // table is being created on. We will add these to the create table query.
    if (blueprint.charset !== undefined) {
      sql += ' default character set ' + blueprint.charset
    } else {
      const charset = connection.getConfig('charset')

      if (!isNil(charset)) {
        sql += ' default character set ' + charset
      }
    }

    // Next we will add the collation to the create table statement if one has been
    // added to either this create table blueprint or the configuration for this
    // connection that the query is targeting. We'll add it to this SQL query.
    if (blueprint.collation !== undefined) {
      sql += ` collate '${blueprint.collation}'`
    } else {
      const collation = connection.getConfig('collation')

      if (!isNil(collation)) {
        sql += ` collate '${collation}'`
      }
    }

    return sql
  }

  /**
   * Append the engine specifications to a command.
   *
   * @param  {string}  sql
   * @param  {\Illuminate\Database\Connection}  connection
   * @param  {\Illuminate\Database\Schema\Blueprint}  blueprint
   * @return {string}
   */
  compileCreateEngine (sql, connection, blueprint) {
    if (blueprint.engine !== undefined) {
      return sql + ' engine = ' + blueprint.engine
    } else {
      const engine = connection.getConfig('engine')

      if (!isNil(engine)) {
        return sql + ' engine = ' + engine
      }
    }

    return sql
  }

  /**
   * Create the main create table clause.
   *
   * @param  {\Illuminate\Database\Schema\Blueprint}  blueprint
   * @param  {\Illuminate\Support\Fluent}  command
   * @param  {\Illuminate\Database\Connection}  connection
   * @return {Array}
   */
  compileCreateTable (blueprint, command, connection) {
    const create = blueprint.temporaryProperty ? 'create temporary' : 'create'

    return `${create} table ${this.wrapTable(blueprint)} (${this.getColumns(blueprint).join(', ')})`.trim()
  }

  /**
   * Compile the command to disable foreign key constraints.
   *
   * @return {string}
   */
  compileDisableForeignKeyConstraints () {
    return 'SET FOREIGN_KEY_CHECKS=0;'
  }

  /**
   * Compile a drop table command.
   *
   * @param  {\Illuminate\Database\Schema\Blueprint}  blueprint
   * @param  {\Illuminate\Support\Fluent}  command
   * @return {string}
   */
  compileDrop (blueprint, command) {
    return `drop table ${this.wrapTable(blueprint)}`
  }

  /**
   * Compile the SQL needed to drop all tables.
   *
   * @param  {Array}  tables
   * @return {string}
   */
  compileDropAllTables (tables) {
    return `drop table ${this.wrapArray(tables).join(',')}`
  }

  /**
   * Compile the SQL needed to drop all views.
   *
   * @param  {Array}  views
   * @return {string}
   */
  compileDropAllViews (views) {
    return `drop view ${this.wrapArray(views).join(',')}`
  }

  /**
   * Compile a drop column command.
   *
   * @param  {\Illuminate\Database\Schema\Blueprint}  blueprint
   * @param  {\Illuminate\Support\Fluent}  command
   * @return {string}
   */
  compileDropColumn (blueprint, command) {
    const columns = this.prefixArray('drop', this.wrapArray(command.get('columns')))

    return `alter table ${this.wrapTable(blueprint)} ${columns.join(', ')}`
  }

  /**
   * Compile a drop database if exists command.
   *
   * @param  {string}  name
   * @return {string}
   */
  compileDropDatabaseIfExists (name) {
    return `drop database if exists ${this.wrapValue(name)}`
  }

  /**
   * Compile a drop foreign key command.
   *
   * @param  {\Illuminate\Database\Schema\Blueprint}  blueprint
   * @param  {\Illuminate\Support\Fluent}  command
   * @return {string}
   */
  compileDropForeign (blueprint, command) {
    const index = this.wrap(command.get('index'))

    return `alter table ${this.wrapTable(blueprint)} drop foreign key ${index}`
  }

  /**
   * Compile a drop table (if exists) command.
   *
   * @param  {\Illuminate\Database\Schema\Blueprint}  blueprint
   * @param  {\Illuminate\Support\Fluent}  command
   * @return {string}
   */
  compileDropIfExists (blueprint, command) {
    return `drop table if exists ${this.wrapTable(blueprint)}`
  }

  /**
   * Compile a drop index command.
   *
   * @param  {\Illuminate\Database\Schema\Blueprint}  blueprint
   * @param  {\Illuminate\Support\Fluent}  command
   * @return {string}
   */
  compileDropIndex (blueprint, command) {
    const index = this.wrap(command.get('index'))

    return `alter table ${this.wrapTable(blueprint)} drop index ${index}`
  }

  /**
   * Compile a drop primary key command.
   *
   * @param  {\Illuminate\Database\Schema\Blueprint}  blueprint
   * @param  {\Illuminate\Support\Fluent}  command
   * @return {string}
   */
  compileDropPrimary (blueprint, command) {
    return `alter table ${this.wrapTable(blueprint)} drop primary key`
  }

  /**
   * Compile a drop spatial index command.
   *
   * @param  {\Illuminate\Database\Schema\Blueprint}  blueprint
   * @param  {\Illuminate\Support\Fluent}  command
   * @return {string}
   */
  compileDropSpatialIndex (blueprint, command) {
    return this.compileDropIndex(blueprint, command)
  }

  /**
   * Compile a drop unique key command.
   *
   * @param  {\Illuminate\Database\Schema\Blueprint}  blueprint
   * @param  {\Illuminate\Support\Fluent}  command
   * @return {string}
   */
  compileDropUnique (blueprint, command) {
    const index = this.wrap(command.get('index'))

    return `alter table ${this.wrapTable(blueprint)} drop index ${index}`
  }

  /**
   * Compile the command to enable foreign key constraints.
   *
   * @return {string}
   */
  compileEnableForeignKeyConstraints () {
    return 'SET FOREIGN_KEY_CHECKS=1;'
  }

  /**
   * Compile the SQL needed to retrieve all table names.
   *
   * @return {string}
   */
  compileGetAllTables () {
    return 'SHOW FULL TABLES WHERE table_type = \'BASE TABLE\''
  }

  /**
   * Compile the SQL needed to retrieve all view names.
   *
   * @return {string}
   */
  compileGetAllViews () {
    return 'SHOW FULL TABLES WHERE table_type = \'VIEW\''
  }

  /**
   * Compile a plain index key command.
   *
   * @param  {\Illuminate\Database\Schema\Blueprint}  blueprint
   * @param  {\Illuminate\Support\Fluent}  command
   * @return {string}
   */
  compileIndex (blueprint, command) {
    return this.compileKey(blueprint, command, 'index')
  }

  /**
   * Compile an index creation command.
   *
   * @param  {\Illuminate\Database\Schema\Blueprint}  blueprint
   * @param  {\Illuminate\Support\Fluent}  command
   * @param  string  type
   * @return string
   */
  compileKey (blueprint, command, type) {
    return `alter table ${this.wrapTable(blueprint)} add ${type} ${this.wrap(command.get('index'))}${command.get('algorithm') ? ` using ${command.get('algorithm')}` : ''}(${this.columnize(command.get('columns'))})`
  }

  /**
   * Compile a primary key command.
   *
   * @param  {\Illuminate\Database\Schema\Blueprint}  blueprint
   * @param  {\Illuminate\Support\Fluent}  command
   * @return string
   */
  compilePrimary (blueprint, command) {
    command.set('name', undefined)

    return this.compileKey(blueprint, command, 'primary key')
  }

  /**
   * Compile a rename table command.
   *
   * @param  {\Illuminate\Database\Schema\Blueprint}  blueprint
   * @param  {\Illuminate\Support\Fluent}  command
   * @return {string}
   */
  compileRename (blueprint, command) {
    const from = this.wrapTable(blueprint)

    return `rename table ${from} to ${this.wrapTable(command.get('to'))}`
  }

  /**
   * Compile a rename index command.
   *
   * @param  {\Illuminate\Database\Schema\Blueprint}  blueprint
   * @param  {\Illuminate\Support\Fluent}  command
   * @return {string}
   */
  compileRenameIndex (blueprint, command) {
    return `alter table ${this.wrapTable(blueprint)} rename index ${this.wrap(command.get('from'))} to ${this.wrap(command.get('to'))}`
  }

  /**
   * Compile a spatial index key command.
   *
   * @param  {\Illuminate\Database\Schema\Blueprint}  blueprint
   * @param  {\Illuminate\Support\Fluent}  command
   * @return {string}
   */
  compileSpatialIndex (blueprint, command) {
    return this.compileKey(blueprint, command, 'spatial index')
  }

  /**
   * Compile the query to determine the list of tables.
   *
   * @return {string}
   */
  compileTableExists () {
    return "select * from information_schema.tables where table_schema = ? and table_name = ? and table_type = 'BASE TABLE'"
  }

  /**
   * Compile a unique key command.
   *
   * @param  {\Illuminate\Database\Schema\Blueprint}  blueprint
   * @param  {\Illuminate\Support\Fluent}  command
   * @return {string}
   */
  compileUnique (blueprint, command) {
    return this.compileKey(blueprint, command, 'unique')
  }

  /**
   * Get the SQL for an "after" column modifier.
   *
   * @param  {\Illuminate\Database\Schema\Blueprint}  blueprint
   * @param  {\Illuminate\Support\Fluent}  column
   * @return {string|undefined}
   */
  modifyAfter (blueprint, column) {
    if (!isNil(column.get('after'))) {
      return ` after ${this.wrap(column.get('after'))}`
    }
  }

  /**
   * Get the SQL for a character set column modifier.
   *
   * @param  {\Illuminate\Database\Schema\Blueprint}  blueprint
   * @param  {\Illuminate\Support\Fluent}  column
   * @return {string}
   */
  modifyCharset (blueprint, column) {
    if (column.get('charset') !== undefined) {
      return ' character set ' + column.get('charset')
    }
  }

  /**
   * Get the SQL for a collation column modifier.
   *
   * @param  {\Illuminate\Database\Schema\Blueprint}  blueprint
   * @param  {\Illuminate\Support\Fluent}  column
   * @return {string|undefined}
   */
  modifyCollate (blueprint, column) {
    if (!isNil(column.get('collation'))) {
      return ` collate '${column.get('collation')}'`
    }
  }

  /**
   * Get the SQL for a "comment" column modifier.
   *
   * @param  {\Illuminate\Database\Schema\Blueprint}  blueprint
   * @param  {\Illuminate\Support\Fluent}  column
   * @return {string|undefined}
   */
  modifyComment (blueprint, column) {
    if (!isNil(column.get('comment'))) {
      return " comment '" + addslashes(column.get('comment')) + "'"
    }
  }

  /**
   * Get the SQL for a default column modifier.
   *
   * @param  {\Illuminate\Database\Schema\Blueprint}  blueprint
   * @param  {\Illuminate\Support\Fluent}  column
   * @return {string|undefined}
   */
  modifyDefault (blueprint, column) {
    if (!isNil(column.get('default'))) {
      return ` default ${this.getDefaultValue(column.get('default'))}`
    }
  }

  /**
   * Get the SQL for a "first" column modifier.
   *
   * @param  {\Illuminate\Database\Schema\Blueprint}  blueprint
   * @param  {\Illuminate\Support\Fluent}  column
   * @return {string|undefined}
   */
  modifyFirst (blueprint, column) {
    if (!isNil(column.get('first'))) {
      return ' first'
    }
  }

  /**
   * Get the SQL for an auto-increment column modifier.
   *
   * @param  {\Illuminate\Database\Schema\Blueprint}  blueprint
   * @param  {\Illuminate\Support\Fluent}  column
   * @return {string|undefined}
   */
  modifyIncrement (blueprint, column) {
    if (this.serials.includes(column.get('type')) && column.get('autoIncrement')) {
      return ' auto_increment primary key'
    }
  }

  /**
   * Get the SQL for a nullable column modifier.
   *
   * @param  {\Illuminate\Database\Schema\Blueprint}  blueprint
   * @param  {\Illuminate\Support\Fluent}  column
   * @return {string|undefined}
   */
  modifyNullable (blueprint, column) {
    if (isNil(column.get('virtualAs')) && isNil(column.get('storedAs'))) {
      return column.get('nullable') ? ' null' : ' not null'
    }

    if (column.get('nullable') === false) {
      return ' not null'
    }
  }

  /**
   * Get the SQL for a SRID column modifier.
   *
   * @param  {\Illuminate\Database\Schema\Blueprint}  blueprint
   * @param  {\Illuminate\Support\Fluent}  column
   * @return {string|undefined}
   */
  modifySrid (blueprint, column) {
    if (!isNil(column.srid) && isInteger(column.get('srid')) && column.get('srid') > 0) {
      return ` srid ${column.get('srid')}`
    }
  }

  /**
   * Get the SQL for a generated stored column modifier.
   *
   * @param  {\Illuminate\Database\Schema\Blueprint}  blueprint
   * @param  {\Illuminate\Support\Fluent}  column
   * @return {string|undefined}
   */
  modifyStoredAs (blueprint, column) {
    if (!isNil(column.get('storedAs'))) {
      return ` as (${column.get('storedAs')}) stored`
    }
  }

  /**
   * Get the SQL for an unsigned column modifier.
   *
   * @param  {\Illuminate\Database\Schema\Blueprint}  blueprint
   * @param  {\Illuminate\Support\Fluent}  column
   * @return {string|undefined}
   */
  modifyUnsigned (blueprint, column) {
    if (column.get('unsigned')) {
      return ' unsigned'
    }
  }

  /**
   * Get the SQL for a generated virtual column modifier.
   *
   * @param  {\Illuminate\Database\Schema\Blueprint}  blueprint
   * @param  {\Illuminate\Support\Fluent}  column
   * @return {string|undefined}
   */
  modifyVirtualAs (blueprint, column) {
    if (!isNil(column.get('virtualAs'))) {
      return ` as (${column.get('virtualAs')})`
    }
  }

  /**
   * Create the column definition for a big integer type.
   *
   * @param  {\Illuminate\Support\Fluent}  column
   * @return {string}
   */
  typeBigInteger (column) {
    return 'bigint'
  }

  /**
   * Create the column definition for a binary type.
   *
   * @param  {\Illuminate\Support\Fluent}  column
   * @return {string}
   */
  typeBinary (column) {
    return 'blob'
  }

  /**
   * Create the column definition for a boolean type.
   *
   * @param  {\Illuminate\Support\Fluent}  column
   * @return {string}
   */
  typeBoolean (column) {
    return 'tinyint(1)'
  }

  /**
   * Create the column definition for a char type.
   *
   * @param  {\Illuminate\Support\Fluent}  column
   * @return {string}
   */
  typeChar (column) {
    return `char(${column.get('length')})`
  }

  /**
   * Create the column definition for a generated, computed column type.
   *
   * @param  {\Illuminate\Support\Fluent}  column
   * @return {void}
   *
   * @throws {\RuntimeException}
   */
  typeComputed (column) {
    throw new Error('RuntimeException: This database driver requires a type, see the virtualAs / storedAs modifiers.')
  }

  /**
   * Create the column definition for a date type.
   *
   * @param  {\Illuminate\Support\Fluent}  column
   * @return {string}
   */
  typeDate (column) {
    return 'date'
  }

  /**
   * Create the column definition for a date-time type.
   *
   * @param  {\Illuminate\Support\Fluent}  column
   * @return {string}
   */
  typeDateTime (column) {
    let columnType = column.get('precision') ? `datetime(${column.get('precision')})` : 'datetime'

    const current = column.get('precision') ? `CURRENT_TIMESTAMP(${column.get('precision')})` : 'CURRENT_TIMESTAMP'

    columnType = column.get('useCurrent') ? `${columnType} default ${current}` : columnType

    return column.get('useCurrentOnUpdate') ? `${columnType} on update ${current}` : columnType
  }

  /**
   * Create the column definition for a date-time (with time zone) type.
   *
   * @param  {\Illuminate\Support\Fluent}  column
   * @return {string}
   */
  typeDateTimeTz (column) {
    return this.typeDateTime(column)
  }

  /**
   * Create the column definition for a decimal type.
   *
   * @param  {\Illuminate\Support\Fluent}  column
   * @return {string}
   */
  typeDecimal (column) {
    return `decimal(${column.get('total')}, ${column.get('places')})`
  }

  /**
   * Create the column definition for a double type.
   *
   * @param  {\Illuminate\Support\Fluent}  column
   * @return {string}
   */
  typeDouble (column) {
    if (column.get('total') && column.get('places')) {
      return `double(${column.get('total')}, ${column.get('places')})`
    }

    return 'double'
  }

  /**
   * Create the column definition for an enumeration type.
   *
   * @param  {\Illuminate\Support\Fluent}  column
   * @return {string}
   */
  typeEnum (column) {
    return `enum(${this.quoteString(column.get('allowed'))})`
  }

  /**
   * Create the column definition for a float type.
   *
   * @param  {\Illuminate\Support\Fluent}  column
   * @return {string}
   */
  typeFloat (column) {
    return this.typeDouble(column)
  }

  /**
   * Create the column definition for a spatial Geometry type.
   *
   * @param  {\Illuminate\Support\Fluent}  column
   * @return {string}
   */
  typeGeometry (column) {
    return 'geometry'
  }

  /**
   * Create the column definition for a spatial GeometryCollection type.
   *
   * @param  {\Illuminate\Support\Fluent } column
   * @return {string}
   */
  typeGeometryCollection (column) {
    return 'geometrycollection'
  }

  /**
   * Create the column definition for an integer type.
   *
   * @param  {\Illuminate\Support\Fluent}  column
   * @return {string}
   */
  typeInteger (column) {
    return 'int'
  }

  /**
   * Create the column definition for an IP address type.
   *
   * @param  {\Illuminate\Support\Fluent}  column
   * @return {string}
   */
  typeIpAddress (column) {
    return 'varchar(45)'
  }

  /**
   * Create the column definition for a json type.
   *
   * @param  {\Illuminate\Support\Fluent} column
   * @return {string}
   */
  typeJson (column) {
    return 'json'
  }

  /**
   * Create the column definition for a jsonb type.
   *
   * @param  {\Illuminate\Support\Fluent} column
   * @return {string}
   */
  typeJsonb (column) {
    return 'json'
  }

  /**
   * Create the column definition for a spatial LineString type.
   *
   * @param  {\Illuminate\Support\Fluent}  $column
   * @return {string}
   */
  typeLineString (column) {
    return 'linestring'
  }

  /**
   * Create the column definition for a long text type.
   *
   * @param  {\Illuminate\Support\Fluent}  column
   * @return {string}
   */
  typeLongText (column) {
    return 'longtext'
  }

  /**
   * Create the column definition for a MAC address type.
   *
   * @param  {\Illuminate\Support\Fluent}  column
   * @return {string}
   */
  typeMacAddress (column) {
    return 'varchar(17)'
  }

  /**
   * Create the column definition for a medium integer type.
   *
   * @param  {\Illuminate\Support\Fluent}  column
   * @return {string}
   */
  typeMediumInteger (column) {
    return 'mediumint'
  }

  /**
   * Create the column definition for a medium text type.
   *
   * @param  {\Illuminate\Support\Fluent}  column
   * @return {string}
   */
  typeMediumText (column) {
    return 'mediumtext'
  }

  /**
   * Create the column definition for a spatial MultiLineString type.
   *
   * @param  {\Illuminate\Support\Fluent } column
   * @return {string}
   */
  typeMultiLineString (column) {
    return 'multilinestring'
  }

  /**
   * Create the column definition for a spatial MultiPoint type.
   *
   * @param  {\Illuminate\Support\Fluent}  column
   * @return {string}
   */
  typeMultiPoint (column) {
    return 'multipoint'
  }

  /**
   * Create the column definition for a spatial MultiPolygon type.
   *
   * @param  {\Illuminate\Support\Fluent}  column
   * @return {string}
   */
  typeMultiPolygon (column) {
    return 'multipolygon'
  }

  /**
   * Create the column definition for a spatial Point type.
   *
   * @param  {\Illuminate\Support\Fluent}  column
   * @return {string}
   */
  typePoint (column) {
    return 'point'
  }

  /**
   * Create the column definition for a spatial Polygon type.
   *
   * @param  {\Illuminate\Support\Fluent}  $column
   * @return {string}
   */
  typePolygon (column) {
    return 'polygon'
  }

  /**
   * Create the column definition for a set enumeration type.
   *
   * @param  {\Illuminate\Support\Fluent}  column
   * @return {string}
   */
  typeSet (column) {
    return `set(${this.quoteString(column.get('allowed'))})`
  }

  /**
   * Create the column definition for a small integer type.
   *
   * @param  {\Illuminate\Support\Fluent}  column
   * @return {string}
   */
  typeSmallInteger (column) {
    return 'smallint'
  }

  /**
   * Create the column definition for a string type.
   *
   * @param  {\Illuminate\Support\Fluent}  column
   * @return {string}
   */
  typeString (column) {
    return `varchar(${column.get('length')})`
  }

  /**
   * Create the column definition for a text type.
   *
   * @param  {\Illuminate\Support\Fluent}  column
   * @return {string}
   */
  typeText (column) {
    return 'text'
  }

  /**
   * Create the column definition for a time type.
   *
   * @param  {\Illuminate\Support\Fluent}  column
   * @return {string}
   */
  typeTime (column) {
    return column.get('precision') ? `time(${column.get('precision')})` : 'time'
  }

  /**
   * Create the column definition for a timestamp type.
   *
   * @param  {\Illuminate\Support\Fluent}  column
   * @return {string}
   */
  typeTimestamp (column) {
    let columnType = column.get('precision') ? `timestamp(${column.get('precision')})` : 'timestamp'

    const current = column.get('precision') ? `CURRENT_TIMESTAMP(${column.get('precision')})` : 'CURRENT_TIMESTAMP'

    columnType = column.get('useCurrent') ? `${columnType} default ${current}` : columnType

    return column.get('useCurrentOnUpdate') ? `${columnType} on update ${current}` : columnType
  }

  /**
   * Create the column definition for a timestamp (with time zone) type.
   *
   * @param  {\Illuminate\Support\Fluent}  column
   * @return {string}
   */
  typeTimestampTz (column) {
    return this.typeTimestamp(column)
  }

  /**
   * Create the column definition for a time (with time zone) type.
   *
   * @param  {\Illuminate\Support\Fluent}  column
   * @return {string}
   */
  typeTimeTz (column) {
    return this.typeTime(column)
  }

  /**
   * Create the column definition for a tiny integer type.
   *
   * @param  {\Illuminate\Support\Fluent}  column
   * @return {string}
   */
  typeTinyInteger (column) {
    return 'tinyint'
  }

  /**
   * Create the column definition for a tiny text type.
   *
   * @param  {\Illuminate\Support\Fluent}  column
   * @return {string}
   */
  typeTinyText (column) {
    return 'tinytext'
  }

  /**
   * Create the column definition for a uuid type.
   *
   * @param  {\Illuminate\Support\Fluent}  column
   * @return {string}
   */
  typeUuid (column) {
    return 'char(36)'
  }

  /**
   * Create the column definition for a year type.
   *
   * @param  {\Illuminate\Support\Fluent}  column
   * @return {string}
   */
  typeYear (column) {
    return 'year'
  }

  /**
   * Wrap a single string in keyword identifiers.
   *
   * @param  {string}  value
   * @return {string}
   */
  wrapValue (value) {
    if (value !== '*') {
      return '`' + value.replace('`', '``') + '`'
    }

    return value
  }
}
