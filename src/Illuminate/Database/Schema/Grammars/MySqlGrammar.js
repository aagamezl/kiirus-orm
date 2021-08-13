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
    const create = blueprint.temporary ? 'create temporary' : 'create'

    return `${create} table ${this.wrapTable(blueprint)} (${this.getColumns(blueprint).join(', ')})`.trim()
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
   * Create the column definition for an integer type.
   *
   * @param  {\Illuminate\Support\Fluent}  column
   * @return {string}
   */
  typeInteger (column) {
    return 'int'
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
