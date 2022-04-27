import { castArray, isNil } from 'lodash'

import { Grammar } from './Grammar'
import { collect } from './../../../Collections/helpers'
import { TableDiff } from './../../../../Doctrine/Schema'
import { tap } from './../../../Support'

export class SQLiteGrammar extends Grammar {
  constructor () {
    super()

    /**
     * The possible column modifiers.
     *
     * @member string[]
     */
    this.modifiers = ['VirtualAs', 'StoredAs', 'Nullable', 'Default', 'Increment']

    /**
     * The columns available as serials.
     *
     * @member string[]
     */
    this.serials = ['bigInteger', 'integer', 'mediumInteger', 'smallInteger', 'tinyInteger']
  }

  /**
   * Get the foreign key syntax for a table creation statement.
   *
   * @param  {\Illuminate\Database\Schema\Blueprint}  blueprint
   * @return {string|undefined}
   */
  addForeignKeys (blueprint) {
    const foreigns = this.getCommandsByName(blueprint, 'foreign')

    return collect(foreigns).reduce((sql, foreign) => {
      // Once we have all the foreign key commands for the table creation statement
      // we'll loop through each of them and add them to the create table SQL we
      // are building, since SQLite needs foreign keys on the tables creation.
      sql += this.getForeignKey(foreign)

      if (!isNil(foreign.onDelete)) {
        sql += ` on delete ${foreign.onDelete}`
      }

      // If this foreign key specifies the action to be taken on update we will add
      // that to the statement here. We'll append it to this SQL and then return
      // the SQL so we can keep adding any other foreign constraints onto this.
      if (!isNil(foreign.onUpdate)) {
        sql += ` on update ${foreign.onUpdate}`
      }

      return sql
    }, '')
  }

  /**
   * Get the primary key syntax for a table creation statement.
   *
   * @param  {\Illuminate\Database\Schema\Blueprint}  blueprint
   * @return {string|undefined}
   */
  addPrimaryKeys (blueprint) {
    const primary = this.getCommandByName(blueprint, 'primary')

    if (!isNil(primary)) {
      return `, primary key (${this.columnize(primary.columns)})`
    }

    return ''
  }

  /**
   * Compile alter table commands for adding columns.
   *
   * @param  {\Illuminate\Database\Schema\Blueprint}  blueprint
   * @param  {\Illuminate\Support\Fluent}  command
   * @return {Array}
   */
  compileAdd (blueprint, command) {
    const columns = this.prefixArray('add column', this.getColumns(blueprint))

    return collect(columns).reject((column) => {
      return column.match(/as \(.*\) stored/) !== null
    }).map((column) => {
      return `alter table ${this.wrapTable(blueprint)} ${column}`
    }).all()
  }

  /**
   * Compile a create table command.
   *
   * @param  {\Illuminate\Database\Schema\Blueprint}  blueprint
   * @param  {\Illuminate\Support\Fluent}  command
   * @return {string}
   */
  compileCreate (blueprint, command) {
    return `${blueprint.temporaryProperty ? 'create temporary' : 'create'} table ${this.wrapTable(blueprint)} (${this.getColumns(blueprint).join(', ')}${String(this.addForeignKeys(blueprint))}${String(this.addPrimaryKeys(blueprint))})`
  }

  /**
   * Compile the command to disable foreign key constraints.
   *
   * @return {string}
   */
  compileDisableForeignKeyConstraints () {
    return 'PRAGMA foreign_keys = OFF;'
  }

  /**
   * Compile the SQL needed to disable a writable schema.
   *
   * @return {string}
   */
  compileDisableWriteableSchema () {
    return 'PRAGMA writable_schema = 0;'
  }

  /**
   * Compile the SQL needed to drop all tables.
   *
   * @return {string}
   */
  compileDropAllTables () {
    return 'delete from sqlite_master where type in (\'table\', \'index\', \'trigger\')'
  }

  /**
   * Compile a drop column command.
   *
   * @param  {\Illuminate\Database\Schema\Blueprint}  blueprint
   * @param  {\Illuminate\Support\Fluent}  command
   * @param  {\Illuminate\Database\Connection}  connection
   * @return {array}
   */
  compileDropColumn (blueprint, command, connection) {
    const schema = connection.getDoctrineSchemaManager()

    const tableDiff = this.getDoctrineTableDiff(
      blueprint, schema
    )

    for (const name of command.columns) {
      tableDiff.removedColumns[name] = connection.getDoctrineColumn(
        this.getTablePrefix().blueprint.getTable(), name
      )
    }

    return schema.getDatabasePlatform().getAlterTableSQL(tableDiff)
  }

  /**
   * Compile the command to enable foreign key constraints.
   *
   * @return {string}
   */
  compileEnableForeignKeyConstraints () {
    return 'PRAGMA foreign_keys = ON;'
  }

  /**
   * Compile the SQL needed to enable a writable schema.
   *
   * @return {string}
   */
  compileEnableWriteableSchema () {
    return 'PRAGMA writable_schema = 1;'
  }

  /**
   * Compile the SQL needed to rebuild the database.
   *
   * @return {string}
   */
  compileRebuild () {
    return 'vacuum'
  }

  /**
   * Create an empty Doctrine DBAL TableDiff from the Blueprint.
   *
   * @param  {\Illuminate\Database\Schema\Blueprint}  blueprint
   * @param  {\Doctrine\DBAL\Schema\AbstractSchemaManager}  schema
   * @return {\Doctrine\DBAL\Schema\TableDiff}
   */
  getDoctrineTableDiff (blueprint, schema) {
    const table = this.getTablePrefix().blueprint.getTable()

    return tap(new TableDiff(table), (tableDiff) => {
      tableDiff.fromTable = schema.listTableDetails(table)
    })
  }

  /**
   * Get the SQL for the foreign key.
   *
   * @param  {\Illuminate\Support\Fluent}  foreign
   * @return {string}
   */
  getForeignKey (foreign) {
    // We need to columnize the columns that the foreign key is being defined for
    // so that it is a properly formatted list. Once we have done this, we can
    // return the foreign key SQL declaration to the calling method for use.
    return `, foreign key(${this.columnize(foreign.columns)}) references ${this.wrapTable(foreign.on)}(${this.columnize(castArray(foreign.references))})`
  }

  /**
   * Get the SQL for a default column modifier.
   *
   * @param  {\Illuminate\Database\Schema\Blueprint}  blueprint
   * @param  {\Illuminate\Support\Fluent}  column
   * @return {string|undefined}
   */
  modifyDefault (blueprint, column) {
    if (!isNil(column.get('default')) && isNil(column.get('virtualAs')) && isNil(column.get('storedAs'))) {
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
    if (this.serials.includes(column.get('type')) && column.get('autoIncrement')) {
      return ' primary key autoincrement'
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
      return column.get('nullable') ? '' : ' not null'
    }

    if (column.get('nullable') === false) {
      return ' not null'
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
 * Create the column definition for an integer type.
 *
 * @param  {\Illuminate\Support\Fluent}  column
 * @return {string}
 */
  typeInteger (column) {
    return 'integer'
  }

  /**
   * Create the column definition for a string type.
   *
   * @param  {\Illuminate\Support\Fluent}  column
   * @return {string}
   */
  typeString (column) {
    return 'varchar'
  }
}
