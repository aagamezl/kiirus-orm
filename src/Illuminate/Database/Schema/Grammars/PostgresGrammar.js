import { isBoolean, isEmpty, isNil } from 'lodash'

import { Grammar } from './Grammar'
import { collect } from '../../../../../lib/Illuminate/Collections/helpers'
import { withGiven } from './../../../Support'

export class PostgresGrammar extends Grammar {
  constructor () {
    super()
    /**
     * The commands to be executed outside of create or alter command.
     *
     * @member {string[]}
     */
    this.fluentCommands = ['Comment']

    /**
     * The possible column modifiers.
     *
     * @member {string[]}
     */
    this.modifiers = ['Collate', 'Increment', 'Nullable', 'Default', 'VirtualAs', 'StoredAs']

    /**
     * The columns available as serials.
     *
     * @member {string[]}
     */
    this.serials = ['bigInteger', 'integer', 'mediumInteger', 'smallInteger', 'tinyInteger']

    /**
     * If this Grammar supports schema changes wrapped in a transaction.
     *
     * @member {bool}
     */
    this.transactions = true
  }

  /**
   * Compile a column addition command.
   *
   * @param  {\Illuminate\Database\Schema\Blueprint}  blueprint
   * @param  {\Illuminate\Support\Fluent}  command
   * @return {string}
   */
  compileAdd (blueprint, command) {
    const sql = `alter table ${this.wrapTable(blueprint)} ${this.prefixArray('add column', this.getColumns(blueprint)).join(', ')}`

    return Array.from([
      ...[sql],
      ...this.compileAutoIncrementStartingValues(blueprint)].filter(item => item).values()
    )
  }

  /**
   * Compile the auto-incrementing column starting values.
   *
   * @param  {\Illuminate\Database\Schema\Blueprint}  blueprint
   * @return {Array}
   */
  compileAutoIncrementStartingValues (blueprint) {
    return collect(blueprint.autoIncrementingStartingValues()).map((value, column) => {
      return `alter sequence ${blueprint.getTable()}_${column}_seq restart with ${value}`
    }).all()
  }

  /**
   * Compile the query to determine the list of columns.
   *
   * @return {string}
   */
  compileColumnListing () {
    return 'select column_name from information_schema.columns where table_schema = ? and table_name = ?'
  }

  /**
   * Compile a comment command.
   *
   * @param  {\Illuminate\Database\Schema\Blueprint}  blueprint
   * @param  {\Illuminate\Support\Fluent}  command
   * @return {string}
   */
  compileComment (blueprint, command) {
    return `comment on column ${this.wrapTable(blueprint)}.${this.wrap(command.get('column').get('name'))} is ${`'${command.get('value').replace("'", "''")}'`}`
  }

  /**
   * Compile a create table command.
   *
   * @param  {\Illuminate\Database\Schema\Blueprint}  blueprint
   * @param  {\Illuminate\Support\Fluent}  command
   * @return {Array}
   */
  compileCreate (blueprint, command) {
    const sql = `${blueprint.temporaryProperty ? 'create temporary' : 'create'} table ${this.wrapTable(blueprint)} (${this.getColumns(blueprint).join(', ')})`

    return Array.from([...[sql], ...this.compileAutoIncrementStartingValues(blueprint)].filter(item => item).values())
  }

  /**
   * Compile a create database command.
   *
   * @param  {string}  name
   * @param  {\Illuminate\Database\Connection}  connection
   * @return {string}
   */
  compileCreateDatabase (name, connection) {
    return `create database ${this.wrapValue(name)} encoding ${this.wrapValue(connection.getConfig('charset'))}`
  }

  /**
   * Compile the command to disable foreign key constraints.
   *
   * @return {string}
   */
  compileDisableForeignKeyConstraints () {
    return 'SET CONSTRAINTS ALL DEFERRED;'
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
    return `drop table "${tables.join('","')}" cascade`
  }

  /**
   * Compile the SQL needed to drop all types.
   *
   * @param  {Array}  types
   * @return {string}
   */
  compileDropAllTypes (types) {
    return `drop type "${types.join('","')}" cascade`
  }

  /**
   * Compile the SQL needed to drop all views.
   *
   * @param  {Array}  views
   * @return {string}
   */
  compileDropAllViews (views) {
    return `drop view "${views.join('","')}" cascade`
  }

  /**
   * Compile a drop column command.
   *
   * @param  {\Illuminate\Database\Schema\Blueprint}  blueprint
   * @param  {\Illuminate\Support\Fluent}  command
   * @return {string}
   */
  compileDropColumn (blueprint, command) {
    const columns = this.prefixArray('drop column', this.wrapArray(command.get('columns')))

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

    return `alter table ${this.wrapTable(blueprint)} drop constraint ${index}`
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
    return `drop index ${this.wrap(command.get('index'))}`
  }

  /**
   * Compile a drop primary key command.
   *
   * @param  {\Illuminate\Database\Schema\Blueprint}  blueprint
   * @param  {\Illuminate\Support\Fluent}  command
   * @return {string}
   */
  compileDropPrimary (blueprint, command) {
    const index = this.wrap(`${blueprint.getTable()}_pkey`)

    return `alter table ${this.wrapTable(blueprint)} drop constraint ${index}`
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

    return `alter table ${this.wrapTable(blueprint)} drop constraint ${index}`
  }

  /**
   * Compile the command to enable foreign key constraints.
   *
   * @return {string}
   */
  compileEnableForeignKeyConstraints () {
    return 'SET CONSTRAINTS ALL IMMEDIATE;'
  }

  /**
   * Compile a foreign key command.
   *
   * @param  {\Illuminate\Database\Schema\Blueprint}  blueprint
   * @param  {\Illuminate\Support\Fluent}  command
   * @return {string}
   */
  compileForeign (blueprint, command) {
    let sql = super.compileForeign(blueprint, command)

    if (!isNil(command.get('deferrable'))) {
      sql += command.get('deferrable') ? ' deferrable' : ' not deferrable'
    }

    if (command.get('deferrable') && !isNil(command.get('initiallyImmediate'))) {
      sql += command.get('initiallyImmediate') ? ' initially immediate' : ' initially deferred'
    }

    if (!isNil(command.get('notValid'))) {
      sql += ' not valid'
    }

    return sql
  }

  /**
   * Compile the SQL needed to retrieve all table names.
   *
   * @param  {string|Array}  schema
   * @return {string}
   */
  compileGetAllTables (schema) {
    schema = Array.isArray(schema) ? schema : [schema]

    return `select tablename from pg_catalog.pg_tables where schemaname in ('${schema.join("','")}')`
  }

  /**
   * Compile the SQL needed to retrieve all type names.
   *
   * @return {string}
   */
  compileGetAllTypes () {
    return 'select distinct pg_type.typname from pg_type inner join pg_enum on pg_enum.enumtypid = pg_type.oid'
  }

  /**
   * Compile the SQL needed to retrieve all view names.
   *
   * @param  {string|Array}  schema
   * @return {string}
   */
  compileGetAllViews (schema) {
    schema = Array.isArray(schema) ? schema : [schema]

    return `select viewname from pg_catalog.pg_views where schemaname in ('${schema.join("','")}')`
  }

  /**
   * Compile a plain index key command.
   *
   * @param  {\Illuminate\Database\Schema\Blueprint}  blueprint
   * @param  {\Illuminate\Support\Fluent}  command
   * @return {string}
   */
  compileIndex (blueprint, command) {
    return `create index ${this.wrap(command.get('index'))} on ${this.wrapTable(blueprint)}${command.get('algorithm') ? ` using ${command.get('algorithm')}` : ''} (${this.columnize(command.get('columns'))})`
  }

  /**
   * Compile a primary key command.
   *
   * @param  {\Illuminate\Database\Schema\Blueprint  }blueprint
   * @param  {\Illuminate\Support\Fluent}  command
   * @return {string}
   */
  compilePrimary (blueprint, command) {
    const columns = this.columnize(command.get('columns'))

    return `alter table ${this.wrapTable(blueprint)} add primary key (${columns})`
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

    return `alter table ${from} rename to ${this.wrapTable(command.get('to'))}`
  }

  /**
   * Compile a rename index command.
   *
   * @param  {\Illuminate\Database\Schema\Blueprint}  blueprint
   * @param  {\Illuminate\Support\Fluent}  command
   * @return {string}
   */
  compileRenameIndex (blueprint, command) {
    return `alter index ${this.wrap(command.get('from'))} rename to ${this.wrap(command.get('to'))}`
  }

  /**
   * Compile a spatial index key command.
   *
   * @param  {\Illuminate\Database\Schema\Blueprint}  blueprint
   * @param  {\Illuminate\Support\Fluent}  command
   * @return {string}
   */
  compileSpatialIndex (blueprint, command) {
    command.set('algorithm', 'gist')

    return this.compileIndex(blueprint, command)
  }

  /**
   * Compile the query to determine if a table exists.
   *
   * @return {string}
   */
  compileTableExists () {
    return 'select * from information_schema.tables where table_schema = ? and table_name = ? and table_type = \'BASE TABLE\''
  }

  /**
   * Compile a unique key command.
   *
   * @param  {\Illuminate\Database\Schema\Blueprint}  blueprint
   * @param  {\Illuminate\Support\Fluent}  command
   * @return {string}
   */
  compileUnique (blueprint, command) {
    return `alter table ${this.wrapTable(blueprint)} add constraint ${this.wrap(command.get('index'))} unique (${this.columnize(command.get('columns'))})`
  }

  /**
   * Format the column definition for a PostGIS spatial type.
   *
   * @param  {string}  type
   * @param  {\Illuminate\Support\Fluent}  column
   * @return {string}
   */
  formatPostGisType (type, column) {
    if (column.get('isGeometry') === undefined) {
      return `geography(${type}, ${column.get('projection') ?? '4326'})`
    }

    if (column.get('projection') !== undefined) {
      return `geometry(${type}, ${column.get('projection')})`
    }

    return `geometry(${type})`
  }

  /**
   * Create the column definition for a generatable column.
   *
   * @param  {string}  type
   * @param  {\Illuminate\Support\Fluent}  column
   * @return {string}
   */
  generatableColumn (type, column) {
    if (!column.get('autoIncrement') && isNil(column.get('generatedAs'))) {
      return type
    }

    if (column.autoIncrement && isNil(column.get('generatedAs'))) {
      return withGiven({
        integer: 'serial',
        bigint: 'bigserial',
        smallint: 'smallserial'
      })[type]
    }

    let options = ''

    if (!isBoolean(column.get('generatedAs')) && !isEmpty(column.get('generatedAs'))) {
      options = ` (${column.get('generatedAs')})`
    }

    return `${type} generated ${column.get('always') ? 'always' : 'by default'} as identity${options}`
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
      return ` collate ${this.wrapValue(column.get('collation'))}`
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
   * Get the SQL for an auto-increment column modifier.
   *
   * @param  {\Illuminate\Database\Schema\Blueprint}  blueprint
   * @param  {\Illuminate\Support\Fluent}  column
   * @return {string|undefined}
   */
  modifyIncrement (blueprint, column) {
    if ((this.serials.includes(column.get('type')) ||
      (column.get('generatedAs') !== undefined)) &&
      column.get('autoIncrement')
    ) {
      return ' primary key'
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
    return column.get('nullable') ? ' null' : ' not null'
  }

  /**
   * Get the SQL for a generated stored column modifier.
   *
   * @param  {\Illuminate\Database\Schema\Blueprint}  blueprint
   * @param  {\Illuminate\Support\Fluent}  column
   * @return {string|undefined}
   */
  modifyStoredAs (blueprint, column) {
    if (column.get('storedAs') !== undefined) {
      return ` generated always as (${column.get('storedAs')}) stored`
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
    if (column.get('virtualAs') !== undefined) {
      return ` generated always as (${column.get('virtualAs')})`
    }
  }

  /**
   * Create the column definition for a big integer type.
   *
   * @param  {\Illuminate\Support\Fluent}  column
   * @return {string}
   */
  typeBigInteger (column) {
    return this.generatableColumn('bigint', column)
  }

  /**
   * Create the column definition for a binary type.
   *
   * @param  {\Illuminate\Support\Fluent}  column
   * @return {string}
   */
  typeBinary (column) {
    return 'bytea'
  }

  /**
   * Create the column definition for a boolean type.
   *
   * @param  {\Illuminate\Support\Fluent}  column
   * @return {string}
   */
  typeBoolean (column) {
    return 'boolean'
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
    return this.typeTimestamp(column)
  }

  /**
   * Create the column definition for a date-time (with time zone) type.
   *
   * @param  {\Illuminate\Support\Fluent}  column
   * @return {string}
   */
  typeDateTimeTz (column) {
    return this.typeTimestampTz(column)
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
    return 'double precision'
  }

  /**
   * Create the column definition for an enumeration type.
   *
   * @param  {\Illuminate\Support\Fluent}  column
   * @return {string}
   */
  typeEnum (column) {
    return `varchar(255) check ("${column.get('name')}" in (${this.quoteString(column.get('allowed'))}))`
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
    return this.formatPostGisType('geometry', column)
  }

  /**
   * Create the column definition for a spatial GeometryCollection type.
   *
   * @param  {\Illuminate\Support\Fluent}  column
   * @return {string}
   */
  typeGeometryCollection (column) {
    return this.formatPostGisType('geometrycollection', column)
  }

  /**
   * Create the column definition for an integer type.
   *
   * @param  {\Illuminate\Support\Fluent}  column
   * @return {string}
   */
  typeInteger (column) {
    return this.generatableColumn('integer', column)
  }

  /**
   * Create the column definition for an IP address type.
   *
   * @param  {\Illuminate\Support\Fluent}  column
   * @return {string}
   */
  typeIpAddress (column) {
    return 'inet'
  }

  /**
   * Create the column definition for a json type.
   *
   * @param  {\Illuminate\Support\Fluent}  column
   * @return {string}
   */
  typeJson (column) {
    return 'json'
  }

  /**
   * Create the column definition for a jsonb type.
   *
   * @param  {\Illuminate\Support\Fluent}  column
   * @return {string}
   */
  typeJsonb (column) {
    return 'jsonb'
  }

  /**
   * Create the column definition for a spatial LineString type.
   *
   * @param  {\Illuminate\Support\Fluent}  column
   * @return {string}
   */
  typeLineString (column) {
    return this.formatPostGisType('linestring', column)
  }

  /**
   * Create the column definition for a long text type.
   *
   * @param  {\Illuminate\Support\Fluent}  column
   * @return {string}
   */
  typeLongText (column) {
    return 'text'
  }

  /**
   * Create the column definition for a MAC address type.
   *
   * @param  {\Illuminate\Support\Fluent}  column
   * @return {string}
   */
  typeMacAddress (column) {
    return 'macaddr'
  }

  /**
   * Create the column definition for a medium integer type.
   *
   * @param  {\Illuminate\Support\Fluent}  column
   * @return {string}
   */
  typeMediumInteger (column) {
    return this.generatableColumn('integer', column)
  }

  /**
   * Create the column definition for a medium text type.
   *
   * @param  {\Illuminate\Support\Fluent}  column
   * @return {string}
   */
  typeMediumText (column) {
    return 'text'
  }

  /**
   * Create the column definition for a spatial MultiLineString type.
   *
   * @param  {\Illuminate\Support\Fluent}  column
   * @return {string}
   */
  typeMultiLineString (column) {
    return this.formatPostGisType('multilinestring', column)
  }

  /**
   * Create the column definition for a spatial MultiPoint type.
   *
   * @param  {\Illuminate\Support\Fluent}  column
   * @return {string}
   */
  typeMultiPoint (column) {
    return this.formatPostGisType('multipoint', column)
  }

  /**
   * Create the column definition for a spatial MultiPolygon type.
   *
   * @param  {\Illuminate\Support\Fluent}  column
   * @return {string}
   */
  typeMultiPolygon (column) {
    return this.formatPostGisType('multipolygon', column)
  }

  /**
   * Create the column definition for a spatial MultiPolygonZ type.
   *
   * @param  {\Illuminate\Support\Fluent}  column
   * @return {string}
   */
  typeMultiPolygonZ (column) {
    return this.formatPostGisType('multipolygonz', column)
  }

  /**
   * Create the column definition for a spatial Point type.
   *
   * @param  {\Illuminate\Support\Fluent}  column
   * @return {string}
   */
  typePoint (column) {
    return this.formatPostGisType('point', column)
  }

  /**
   * Create the column definition for a spatial Polygon type.
   *
   * @param  {\Illuminate\Support\Fluent}  column
   * @return {string}
   */
  typePolygon (column) {
    return this.formatPostGisType('polygon', column)
  }

  /**
   * Create the column definition for a real type.
   *
   * @param  {\Illuminate\Support\Fluent}  column
   * @return {string}
   */
  typeReal (column) {
    return 'real'
  }

  /**
   * Create the column definition for a small integer type.
   *
   * @param  {\Illuminate\Support\Fluent}  column
   * @return {string}
   */
  typeSmallInteger (column) {
    return this.generatableColumn('smallint', column)
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
    return `time${(isNil(column.get('precision')) ? '' : `(${column.get('precision')})`)} without time zone`
  }

  /**
   * Create the column definition for a time (with time zone) type.
   *
   * @param  {\Illuminate\Support\Fluent}  column
   * @return {string}
   */
  typeTimeTz (column) {
    return `time${(isNil(column.get('precision')) ? '' : `(${column.get('precision')})`)} with time zone`
  }

  /**
   * Create the column definition for a timestamp type.
   *
   * @param  {\Illuminate\Support\Fluent}  column
   * @return {string}
   */
  typeTimestamp (column) {
    const columnType = `timestamp${(isNil(column.get('precision')) ? '' : `(${column.get('precision')})`)} without time zone`

    return column.get('useCurrent') ? 'columnType default CURRENT_TIMESTAMP' : columnType
  }

  /**
   * Create the column definition for a timestamp (with time zone) type.
   *
   * @param  {\Illuminate\Support\Fluent}  column
   * @return {string}
   */
  typeTimestampTz (column) {
    const columnType = `timestamp${(isNil(column.get('precision')) ? '' : `(${column.get('precision')})`)} with time zone`

    return column.get('useCurrent') ? 'columnType default CURRENT_TIMESTAMP' : columnType
  }

  /**
   * Create the column definition for a tiny integer type.
   *
   * @param  {\Illuminate\Support\Fluent}  column
   * @return {string}
   */
  typeTinyInteger (column) {
    return this.generatableColumn('smallint', column)
  }

  /**
   * Create the column definition for a tiny text type.
   *
   * @param  {\Illuminate\Support\Fluent}  column
   * @return {string}
   */
  typeTinyText (column) {
    return 'varchar(255)'
  }

  /**
   * Create the column definition for a uuid type.
   *
   * @param  {\Illuminate\Support\Fluent}  column
   * @return {string}
   */
  typeUuid (column) {
    return 'uuid'
  }

  /**
 * Create the column definition for a year type.
 *
 * @param  {\Illuminate\Support\Fluent}  column
 * @return {string}
 */
  typeYear (column) {
    return this.typeInteger(column)
  }
}
