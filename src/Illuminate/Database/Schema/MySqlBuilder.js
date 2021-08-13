import { Builder } from './Builder'

export class MySqlBuilder extends Builder {
  /**
   * Create a database in the schema.
   *
   * @param  {string}  name
   * @return {boolean}
   */
  createDatabase (name) {
    return this.connection.statement(
      this.grammar.compileCreateDatabase(name, this.connection)
    )
  }

  /**
   * Drop a database from the schema if the database exists.
   *
   * @param  {string}  name
   * @return {boolean}
   */
  dropDatabaseIfExists (name) {
    return this.connection.statement(
      this.grammar.compileDropDatabaseIfExists(name)
    )
  }
}
