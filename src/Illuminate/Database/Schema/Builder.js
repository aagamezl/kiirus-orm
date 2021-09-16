import { Blueprint } from './Blueprint'
import { tap } from './../../Support'

export class Builder {
  /**
   * Create a new database Schema manager.
   *
   * @param  {\Illuminate\Database\Connection}  connection
   * @return {void}
   */
  constructor (connection) {
    /**
     * The database connection instance.
     *
     * @member {\Illuminate\Database\Connection}
     */
    this.connection = connection

    /**
     * The schema grammar instance.
     *
     * @member {\Illuminate\Database\Schema\Grammars\Grammar}
     */
    this.grammar = connection.getSchemaGrammar()

    /**
     * The default string length for migrations.
     *
     * @member {number}
     */
    this.constructor.defaultStringLengthProperty = 255
  }

  /**
   * Execute the blueprint to build / modify the table.
   *
   * @param  {\Illuminate\Database\Schema\Blueprint}  blueprint
   * @return {void}
   */
  build (blueprint) {
    blueprint.build(this.connection, this.grammar)
  }

  static get defaultStringLength () {
    return this.defaultStringLengthProperty ?? 255
  }

  static set defaultStringLength (length) {
    this.defaultStringLengthProperty = length
  }

  /**
   * Create a new table on the schema.
   *
   * @param  {string}  table
   * @param  {Function}  callback
   * @return {void}
   */
  create (table, callback) {
    this.build(tap(this.createBlueprint(table), (blueprint) => {
      blueprint.create()

      callback(blueprint)
    }))
  }

  /**
   * Create a new command set with a Closure.
   *
   * @param  {string}  table
   * @param  {Function|undefined}  [callback=undefined]
   * @return {\Illuminate\Database\Schema\Blueprint}
   */
  createBlueprint (table, callback = undefined) {
    const prefix = this.connection.getConfig('prefix_indexes')
      ? this.connection.getConfig('prefix')
      : ''

    if (this.resolver) {
      return this.resolver(table, callback, prefix)
    }

    return new Blueprint(table, callback, prefix)
  }

  /**
   * Create a database in the schema.
   *
   * @param  {string}  name
   * @return {boolean}
   *
   * @throws {\LogicException}
   */
  createDatabase (name) {
    throw new Error('LogicException: This database driver does not support creating databases.')
  }

  /**
   * Drop a database from the schema if the database exists.
   *
   * @param  {string}  name
   * @return [boolean]
   *
   * @throws {\LogicException}
   */
  dropDatabaseIfExists (name) {
    throw new Error('LogicException: This database driver does not support dropping databases.')
  }
}
