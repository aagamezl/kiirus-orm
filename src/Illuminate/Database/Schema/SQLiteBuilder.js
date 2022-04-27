import fs from 'fs'

import { Builder } from './Builder'

export class SQLiteBuilder extends Builder {
  /**
   * Create a database in the schema.
   *
   * @param  {string}  name
   * @return {boolean}
   */
  createDatabase (name) {
    try {
      fs.writeFileSync(name, '', 'utf8')

      return true
    } catch (error) {
      return false
    }
  }

  /**
   * Drop all views from the database.
   *
   * @return {void}
   */
  dropAllTables () {
    if (this.connection.getDatabaseName() !== ':memory:') {
      return this.refreshDatabaseFile()
    }

    this.connection.select(this.grammar.compileEnableWriteableSchema())

    this.connection.select(this.grammar.compileDropAllTables())

    this.connection.select(this.grammar.compileDisableWriteableSchema())

    this.connection.select(this.grammar.compileRebuild())
  }

  /**
   * Drop a database from the schema if the database exists.
   *
   * @param  {string}  name
   * @return {boolean}
   */
  dropDatabaseIfExists (name) {
    try {
      fs.unlinkSync(name)

      return true
    } catch (error) {
      return false
    }
  }

  /**
   * Empty the database file.
   *
   * @return {void}
   */
  refreshDatabaseFile () {
    fs.writeFileSync(this.connection.getDatabaseName(), '')
  }
}
