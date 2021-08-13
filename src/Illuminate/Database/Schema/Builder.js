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

  static get defaultStringLength () {
    return this.defaultStringLengthProperty ?? 255
  }

  static set defaultStringLength (length) {
    this.defaultStringLengthProperty = length
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
