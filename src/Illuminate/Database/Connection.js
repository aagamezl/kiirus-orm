import { Grammar as QueryGrammar } from './Query/Grammars'
import { Processor } from './Query/Processors'

/**
 *
 * @export
 * @class Connection
 */
export class Connection {
  /**
   * Create a new database connection instance.
   *
   * @constructs
   * @param  {object|Function}  connection
   * @param  {string}  database
   * @param  {string}  tablePrefix
   * @param  {Array}  config
   * @return {void}
   */
  constructor (connection, database = '', tablePrefix = '', config = []) {
    this.connection = connection

    // First we will setup the default properties. We keep track of the DB
    // name we are connected to since it is needed when some reflective
    // type commands are run such as checking whether a table exists.
    this.database = database

    this.tablePrefix = tablePrefix

    this.config = config

    // We need to initialize a query grammar and the query post processors
    // which are both very important parts of the database abstractions
    // so we initialize these to their default values while starting.
    this.useDefaultQueryGrammar()

    this.useDefaultPostProcessor()
  }

  /**
   * Run an SQL statement and get the number of rows affected.
   *
   * @param  {string}  query
   * @param  {object}  bindings
   * @return {number}
   */
  affectingStatement (query, bindings = {}) {
    return this.run(query, bindings, async (query, bindings) => {
      if (this.pretending()) {
        return 0
      }

      // For update or delete statements, we want to get the number of rows affected
      // by the statement and return that back to the developer. We'll first need
      // to execute the statement and then we'll use PDO to fetch the affected.
      const statement = this.prepare(query, this.getConnection())

      this.bindValues(statement, this.prepareBindings(bindings))

      await statement.execute()

      const count = statement.rowCount()

      this.recordsHaveBeenModified(count > 0)

      return count
    })
  }

  /**
   * Get the name of the connected database.
   *
   * @return {string}
   */
  getDatabaseName () {
    return this.database
  }

  /**
   * Get the default post processor instance.
   *
   * @return {\Illuminate\Database\Query\Processors\Processor}
   */
  getDefaultPostProcessor () {
    return new Processor()
  }

  /**
   * Get the default query grammar instance.
   *
   * @return {\Illuminate\Database\Query\Grammars\Grammar}
   */
  getDefaultQueryGrammar () {
    return new QueryGrammar()
  }

  /**
   * Run an insert statement against the database.
   *
   * @param  {string}  query
   * @param  {object}  bindings
   * @return {boolean}
   */
  insert (query, bindings = {}) {
    return this.statement(query, bindings)
  }

  /**
   * Run a select statement against the database.
   *
   * @param  {string}  query
   * @param  {Array}  [bindings]
   * @return {Array}
   */
  select (query, bindings = []) {
    return []
  }

  /**
   * Set the query post processor to the default implementation.
   *
   * @return {void}
   */
  useDefaultPostProcessor () {
    this.postProcessor = this.getDefaultPostProcessor()
  }

  /**
   * Set the query grammar to the default implementation.
   *
   * @return {void}
   */
  useDefaultQueryGrammar () {
    this.queryGrammar = this.getDefaultQueryGrammar()
  }
}
