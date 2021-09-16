import { castArray, isEmpty } from 'lodash'

import { Builder } from './Builder'

export class PostgresBuilder extends Builder {
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
   * Drop all tables from the database.
   *
   * @return {void}
   */
  dropAllTables () {
    const tables = []

    const excludedTables = this.connection.getConfig('dont_drop') ?? ['spatial_ref_sys']

    for (let row of this.getAllTables()) {
      row = castArray(row)

      const table = row[0]

      if (!excludedTables.includes(table)) {
        tables.push(table)
      }
    }

    if (isEmpty(tables)) {
      return
    }

    this.connection.statement(
      this.grammar.compileDropAllTables(tables)
    )
  }

  /**
   * Drop all types from the database.
   *
   * @return {void}
   */
  dropAllTypes () {
    const types = []

    for (let row of this.getAllTypes()) {
      row = castArray(row)

      types.push(row[0])
    }

    if (isEmpty(types)) {
      return
    }

    this.connection.statement(
      this.grammar.compileDropAllTypes(types)
    )
  }

  /**
   * Drop all views from the database.
   *
   * @return {void}
   */
  dropAllViews () {
    const views = []

    for (let row of this.getAllViews()) {
      row = castArray(row)

      views.push(row[0])
    }

    if (isEmpty(views)) {
      return
    }

    this.connection.statement(
      this.grammar.compileDropAllViews(views)
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

  /**
   * Get all of the table names for the database.
   *
   * @return {Array}
   */
  getAllTables () {
    return this.connection.select(
      this.grammar.compileGetAllTables(this.connection.getConfig('schema'))
    )
  }

  /**
   * Get all of the type names for the database.
   *
   * @return {Array}
   */
  getAllTypes () {
    return this.connection.select(
      this.grammar.compileGetAllTypes()
    )
  }

  /**
   * Get all of the view names for the database.
   *
   * @return {Array}
   */
  getAllViews () {
    return this.connection.select(
      this.grammar.compileGetAllViews(this.connection.getConfig('schema'))
    )
  }

  /**
   * Get the column listing for a given table.
   *
   * @param  {string}  table
   * @return {Array}
   */
  getColumnListing (table) {
    let [schema, tableName] = this.parseSchemaAndTable(table)

    tableName = this.connection.getTablePrefix() + tableName

    const results = this.connection.select(
      this.grammar.compileColumnListing(), [schema, tableName]
    )

    return this.connection.getPostProcessor().processColumnListing(results)
  }

  /**
   * Determine if the given table exists.
   *
   * @param  {string}  table
   * @return {boolean}
   */
  hasTable (table) {
    let [schema, tableName] = this.parseSchemaAndTable(table)

    tableName = this.connection.getTablePrefix() + tableName

    return this.connection.select(
      this.grammar.compileTableExists(), [schema, tableName]
    ).length > 0
  }

  /**
   * Parse the table name and extract the schema and table.
   *
   * @param  {string}  table
   * @return {Array}
   */
  parseSchemaAndTable (table) {
    table = table.split('.')

    let schema = this.connection.getConfig('schema')

    if (Array.isArray(schema)) {
      if (schema.includes(table[0])) {
        return [table.shift(), table.join('.')]
      }

      schema = schema[0]
    }

    return [schema ?? 'public', table.join('.')]
  }
}
