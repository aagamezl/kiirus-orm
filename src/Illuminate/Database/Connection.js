import { dateFormat } from '@devnetic/utils'
import { get as getData, isBoolean, isFunction, isString } from 'lodash'

import { Grammar as QueryGrammar } from './Query/Grammars'
import { Processor } from './Query/Processors'
import { QueryExecuted, StatementPrepared } from './Events'
import { Statement } from './Statements'

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
   * @param  {string}  [database='']
   * @param  {string}  [tablePrefix='']
   * @param  {Array}  [config={}]
   * @return {void}
   */
  constructor (ndo, database = '', tablePrefix = '', config = {}) {
    /**
     * The active NDO connection.
     *
     * @member {object|Function}
     */
    this.ndo = ndo

    /**
     * The database connection configuration options.
     *
     * @member object
     */
    this.config = config

    // this.connection = this.getConnection(config)

    // First we will setup the default properties. We keep track of the DB
    // name we are connected to since it is needed when some reflective
    // type commands are run such as checking whether a table exists.

    /**
     * The name of the connected database.
     *
     * @member string
     */
    this.database = database

    /**
     * The event dispatcher instance.
     *
     * @member \Illuminate\Contracts\Events\Dispatcher
     */
    this.events = undefined

    /**
     * The default fetch mode of the connection.
     *
     * @member string
     */
    this.fetchMode = undefined

    /**
     * Indicates whether queries are being logged.
     *
     * @member boolean
     */
    this.loggingQueries = false

    /**
     * Indicates if the connection is in a "dry run".
     *
     * @member {boolean}
     */
    this.pretendingConnection = false

    /**
     * The query grammar implementation.
     *
     * @member {\Illuminate\Database\Query\Grammars\Grammar}
     */
    this.queryGrammar = undefined

    /**
     * The query post processor implementation.
     *
     * @var {\Illuminate\Database\Query\Processors\Processor}
     */
    this.postProcessor = undefined

    /**
     * All of the queries run against the connection.
     *
     * @member array
     */
    this.queryLog = []

    /**
     * The active PDO connection used for reads.
     *
     * @member object|Function
     */
    this.readNdo = undefined

    /**
     * Indicates if the connection should use the "write" PDO connection.
     *
     * @member boolean
     */
    this.readOnWriteConnection = false

    /**
     * Indicates if changes have been made to the database.
     *
     * @member boolean
     */
    this.recordsModified = false

    /**
     * The table prefix for the connection.
     *
     * @member string
     */
    this.tablePrefix = tablePrefix

    /**
     * The number of active transactions.
     *
     * @member number
     */
    this.transactions = 0

    // We need to initialize a query grammar and the query post processors
    // which are both very important parts of the database abstractions
    // so we initialize these to their default values while starting.
    this.useDefaultQueryGrammar()

    this.useDefaultPostProcessor()
  }

  /**
   * The connection resolvers.
   *
   * @member {array}
   */
  static get resolvers () {
    if (this.constructor.resolvers === undefined) {
      this.constructor.resolvers = []
    }

    return this.constructor.resolvers
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
      const statement = this.prepared(this.getConnection(), query)

      this.bindValues(statement, this.prepareBindings(bindings))

      await statement.execute()

      const count = statement.rowCount()

      this.recordsHaveBeenModified(count > 0)

      return count
    })
  }

  /**
   * Bind values to their parameters in the given statement.
   *
   * @param  {\Illuminate\Database\Statements\Statement}  statement
   * @param  {object}  bindings
   * @return void
   */
  bindValues (statement, bindings) {
    for (const [key, value] of Object.entries(bindings)) {
      statement.bindValue(
        isString(key) ? key : key + 1,
        value
      )
    }
  }

  /**
   * Determine if the given exception was caused by a lost connection.
   *
   * @param  {Error}  error
   * @return boolean
   */
  causedByLostConnection (error) {
    const message = error.message

    const messages = [
      'server has gone away',
      'no connection to the server',
      'Lost connection',
      'is dead or not enabled',
      'Error while sending',
      'decryption failed or bad record mac',
      'server closed the connection unexpectedly',
      'SSL connection has been closed unexpectedly',
      'Error writing data to the connection',
      'Resource deadlock avoided',
      'Transaction() on null',
      'child connection forced to terminate due to client_idle_limit',
      'query_wait_timeout',
      'reset by peer',
      'Physical connection is not usable',
      'TCP Provider: Error code 0x68',
      'ORA-03114',
      'Packets out of order. Expected',
      'Adaptive Server connection failed',
      'Communication link failure',
      'connection is no longer usable',
      'Login timeout expired',
      'SQLSTATE[HY000] [2002] Connection refused',
      'running with the --read-only option so it cannot execute this statement',
      'The connection is broken and recovery is not possible. The connection is marked by the client driver as unrecoverable. No attempt was made to restore the connection.',
      'SQLSTATE[HY000] [2002] php_network_getaddresses: getaddrinfo failed: Try again',
      'SQLSTATE[HY000] [2002] php_network_getaddresses: getaddrinfo failed: Name or service not known',
      'SQLSTATE[HY000]: General error: 7 SSL SYSCALL error: EOF detected',
      'SQLSTATE[HY000] [2002] Connection timed out',
      'SSL: Connection timed out',
      'SQLSTATE[HY000]: General error: 1105 The last transaction was aborted due to Seamless Scaling. Please retry.',
      'Temporary failure in name resolution',
      'SSL: Broken pipe',
      'SQLSTATE[08S01]: Communication link failure',
      'SQLSTATE[08006] [7] could not connect to server: Connection refused Is the server running on host',
      'SQLSTATE[HY000]: General error: 7 SSL SYSCALL error: No route to host'
    ]

    for (const needle of messages) {
      if (message.includes(needle)) {
        return true
      }
    }

    return false
  }

  /**
   * Fire the given event if possible.
   *
   * @param  {*}  event
   * @return void
   */
  event (event) {
    if (this.events) {
      this.events.dispatch(event)
    }
  }

  /**
   * Get an option from the configuration options.
   *
   * @param  {string}  option
   * @return {*}
   */
  getConfig (option) {
    return getData(this.config, option)
  }

  getNdo () {
    if (isFunction(this.ndo)) {
      this.ndo = this.ndo()

      return this.ndo
    }

    return this.ndo
  }

  /**
   * Get the NDO connection to use for a select query.
   *
   * @param  {boolean}  [useReadNdo=true]
   * @return {object}
   */
  getNdoForSelect (useReadNdo = true) {
    return useReadNdo ? this.getReadNdo() : this.getNdo()
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
   * Get the elapsed time since a given starting point.
   *
   * @param  {number}  start
   * @return {number}
   */
  getElapsedTime (start) {
    return parseFloat(Math.fround((Date.now() - start) * 1000).toPrecision(3))
  }

  /**
   * Get the database connection name.
   *
   * @return {string|undefined}
   */
  getName () {
    return this.getConfig('name')
  }

  /**
   * Get the query grammar used by the connection.
   *
   * @return {\Illuminate\Database\Query\Grammars\Grammar}
   */
  getQueryGrammar () {
    return this.queryGrammar
  }

  /**
   * Get the query post processor used by the connection.
   *
   * @return {\Illuminate\Database\Query\Processors\Processor}
   */
  getPostProcessor () {
    return this.postProcessor
  }

  /**
   *
   *
   * @param {string} query
   * @return {object}
   * @memberof PostgresConnection
   */
  getPrepareStatement (connection, query) {
    return new Statement(connection, query)
  }

  /**
   * Get the current PDO connection used for reading.
   *
   * @return {object}
   */
  getReadNdo () {
    if (this.transactions > 0) {
      return this.getNdo()
    }

    if (this.readOnWriteConnection ||
      (this.recordsModified && this.getConfig('sticky'))) {
      return this.getNdo()
    }

    if (isFunction(this.readPdo)) {
      this.readNdo = this.readNdo()

      return this.readNdo
    }

    return this.readNdo ?? this.getNdo()
  }

  /**
   * Get the connection resolver for the given driver.
   *
   * @param  {string}  driver
   * @return {*}
   */
  static getResolver (driver) {
    return this.resolvers[driver] ?? undefined
  }

  /**
   * Handle a query exception.
   *
   * @param  {Error}  error
   * @param  {string}  query
   * @param  {Bindings}  bindings
   * @param  {Function}  callback
   * @return {*}
   *
   * @throws Error
   */
  handleQueryException (error, query, bindings, callback) {
    if (this.transactions >= 1) {
      throw error
    }

    return this.tryAgainIfCausedByLostConnection(
      error, query, bindings, callback
    )
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
   * Log a query in the connection's query log.
   *
   * @param  {string}  query
   * @param  {object}  bindings
   * @param  {number|undefined}  [time]
   * @return void
   */
  logQuery (query, bindings, time = undefined) {
    this.event(new QueryExecuted(query, bindings, this, time))

    if (this.loggingQueries) {
      this.queryLog.push({ query, bindings, time })
    }
  }

  /**
   * Prepare the query bindings for execution.
   *
   * @param  {object}  object
   * @return {object}
   */
  prepareBindings (bindings) {
    const grammar = this.getQueryGrammar()

    for (const [key, value] of Object.entries(bindings)) {
      // We need to transform all instances of DateTimeInterface into the actual
      // date string. Each query grammar maintains its own date string format
      // so we'll just ask the grammar for the format to get from the date.
      if (value instanceof Date) {
        bindings[key] = dateFormat(value, grammar.getDateFormat())
      } else if (isBoolean(value)) {
        bindings[key] = Number(value)
      }
    }

    return bindings
  }

  /**
   * Configure the prepare statement.
   *
   * @param  {object}  connection
   * @param  {string}  query
   * @return {\Illuminate\Database\Statements\Statement}
   */
  prepared (statement, query) {
    // return this.getPrepareStatement(connection, query)

    statement.setFetchMode(this.fetchMode)

    this.event(new StatementPrepared(
      this, statement
    ))

    return statement
  }

  /**
   * Determine if the connection is in a "dry run".
   *
   * @return boolean
   */
  pretending () {
    return this.pretendingConnection === true
  }

  /**
   * Reconnect to the database.
   *
   * @return void
   *
   * @throws \LogicException
   */
  reconnect () {
    if (isFunction(this.reconnector)) {
      return this.reconnector(this)
    }

    throw new Error('LogicException: Lost connection and no reconnector available.')
  }

  /**
   * Reconnect to the database if a PDO connection is missing.
   *
   * @return void
   */
  reconnectIfMissingConnection () {
    if (!this.ndo) {
      this.reconnect()
    }
  }

  /**
   * Indicate if any records have been modified.
   *
   * @param  {boolean}  [value=true]
   * @return {void}
   */
  recordsHaveBeenModified (value = true) {
    if (!this.recordsModified) {
      this.recordsModified = value
    }
  }

  /**
   * Run a SQL statement and log its execution context.
   *
   * @param  {string}  query
   * @param  {object}  bindings
   * @param  {Function} callback
   * @return {*}
   *
   * @throws \Illuminate\Database\QueryException
   */
  async run (query, bindings, callback) {
    this.reconnectIfMissingConnection()

    const start = Date.now()

    let result

    // Here we will run this query. If an exception occurs we'll determine if it was
    // caused by a connection that has been lost. If that is the cause, we'll try
    // to re-establish connection and re-run the query with a fresh connection.
    try {
      result = await this.runQueryCallback(query, bindings, callback)
    } catch (error) {
      result = this.handleQueryException(
        error, query, bindings, callback
      )
    }

    // Once we have run the query we will calculate the time that it took to run and
    // then log the query, bindings, and execution time so we will report them on
    // the event that the developer needs them. We'll log time in milliseconds.
    this.logQuery(
      query, bindings, this.getElapsedTime(start)
    )

    return result
  }

  /**
   * Run a SQL statement.
   *
   * @param  {string}  query
   * @param  {object}  bindings
   * @param  {Function}  callback
   * @return {*}
   *
   * @throws \Illuminate\Database\QueryException
   */
  async runQueryCallback (query, bindings, callback) {
    // To execute the statement, we'll simply call the callback, which will actually
    // run the SQL against the PDO connection. Then we can calculate the time it
    // took to execute and log the query SQL, bindings and time in our memory.
    try {
      const result = await callback(query, bindings)

      return result
    } catch (error) {
      // If an exception occurs when attempting to run a query, we'll format the error
      // message to include the bindings with SQL, which will make this exception a
      // lot more helpful to the developer instead of just the database's errors.
      throw new Error(
        `QueryException: ${query} - ${this.prepareBindings(bindings)}`
      )
    }
  }

  /**
   * Run a select statement against the database.
   *
   * @param  {string}  query
   * @param  {object}  [bindings]
   * @param  {boolean}  [useReadPdo=true]
   * @return {object}
   */
  select (query, bindings = [], useReadPdo = true) {
    return this.run(query, bindings, async (query, bindings) => {
      if (this.pretending()) {
        return []
      }

      // For select statements, we'll simply execute the query and return an array
      // of the database result set. Each element in the array will be a single
      // row from the database table, and will either be an array or objects.
      const statement = this.prepared(
        // this.connection, query
        this.getNdoForSelect(useReadPdo).prepare(query)
      )

      this.bindValues(statement, this.prepareBindings(bindings))

      await statement.execute()

      return statement.fetchAll()
    })
  }

  /**
   * Execute an SQL statement and return the boolean result.
   *
   * @param  {string}  query
   * @param  {object}  bindings
   * @return {boolean}
   */
  statement (query, bindings = {}) {
    return this.run(query, bindings, async (query, bindings) => {
      if (this.pretending()) {
        return true
      }

      const statement = this.prepared(this.getConnection(), query)

      this.bindValues(statement, this.prepareBindings(bindings))

      this.recordsHaveBeenModified()

      const result = await statement.execute()

      return result
    })
  }

  /**
   * Handle a query exception that occurred during query execution.
   *
   * @param  {\Illuminate\Database\QueryException}  error
   * @param  {string}  query
   * @param  {array}  bindings
   * @param  {Function}  callback
   * @return {*}
   *
   * @throws \Illuminate\Database\QueryException
   */
  tryAgainIfCausedByLostConnection (error, query, bindings, callback) {
    if (this.causedByLostConnection(error)) {
      this.reconnect()

      return this.runQueryCallback(query, bindings, callback)
    }

    throw error
  }

  /**
   * Run an update statement against the database.
   *
   * @param  {string}  query
   * @param  {Array}  {bindings}
   * @return {number}
   */
  update (query, bindings = {}) {
    return this.affectingStatement(query, bindings)
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

  /**
   * Set the table prefix and return the grammar.
   *
   * @param  {\Illuminate\Database\Grammar}  grammar
   * @return {\Illuminate\Database\Grammar}
   */
  withTablePrefix (grammar) {
    grammar.setTablePrefix(this.tablePrefix)

    return grammar
  }
}
