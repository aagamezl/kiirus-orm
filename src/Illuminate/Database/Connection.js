import { Grammar as QueryGrammar } from './Query/Grammars'
import { Processor } from './Query/Processors'

export class Connection {
  /**
   * Create a new database connection instance.
   *
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
