import { isBoolean, isEmpty, isNil } from 'lodash'

import { Grammar } from './Grammar'
import { collect } from '../../../../../lib/Illuminate/Collections/helpers'
import { withGiven } from './../../../Support'

export class PostgresGrammar extends Grammar {
  constructor () {
    super()

    /**
     * If this Grammar supports schema changes wrapped in a transaction.
     *
     * @member {bool}
     */
    this.transactions = true

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
     * The commands to be executed outside of create or alter command.
     *
     * @member {string[]}
     */
    this.fluentCommands = ['Comment']
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
   * Create the column definition for an integer type.
   *
   * @param  {\Illuminate\Support\Fluent}  column
   * @return {string}
   */
  typeInteger (column) {
    return this.generatableColumn('integer', column)
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
}
