import {
  dateFormat,
  getValue,
  isFunction,
  isNumeric
} from '@devnetic/utils'

import { Builder as QueryBuilder } from './Query/Builder'
import { DetectsLostConnections } from './DetectsLostConnections'
import { Dispatcher } from '../Contracts/Events/Dispatcher'
import { Grammar as QueryGrammar } from './Query/Grammars'
import { Grammar } from './Grammar'
import { Processor } from './Query/Processors'
import { QueryExecuted } from './Events/QueryExecuted'
import { Statement } from './Statements/Statement'
import { StatementPrepared } from './Events/StatementPrepared'
import { use } from '../Support/Traits/use'

export interface QueryLog {
  query: string
  bindings: object
  time: number
}

export interface Connection extends DetectsLostConnections { }

export class Connection {
  /**
   * The database connection configuration options.
   *
   * @member {object}
   */
  protected config: object = {}

  /**
   * The name of the connected database.
   *
   * @member {string}
   */
  protected database: string = ''

  /**
   * The event dispatcher instance.
   *
   * @member {\Illuminate\Contracts\Events\Dispatcher}
   */
  protected events: Dispatcher | undefined = undefined

  /**
   * The default fetch mode of the connection.
   *
   * @member {string}
   */
  protected fetchMode: string = 'obj' // assoc, obj

  /**
   * Indicates whether queries are being logged.
   *
   * @member {boolean}
   */
  protected loggingQueries: boolean = false

  /**
   * The active NDO connection.
   *
   * @member {object|Function}
   */
  protected ndo?: Statement | Function

  /**
   * The query post processor implementation.
   *
   * @var {\Illuminate\Database\Query\Processors\Processor}
   */
  protected postProcessor: Processor | undefined = undefined

  /**
   * Indicates if the connection is in a "dry run".
   *
   * @var {boolean}
   */
  protected pretendingConnection: boolean = false

  /**
   * The query grammar implementation.
   *
   * @member {\Illuminate\Database\Query\Grammars\Grammar}
   */
  protected queryGrammar: QueryGrammar | undefined = undefined

  /**
   * All of the queries run against the connection.
   *
   * @member {QueryLog[]}
   */
  protected queryLog: QueryLog[] = []

  /**
   * The reconnector instance for the connection.
   *
   * @var {Function}
   */
  protected reconnector: Function = (): any => {}

  /**
   * Indicates if changes have been made to the database.
   *
   * @member {boolean}
   */
  protected recordsModified: boolean = false

  /**
   * The connection resolvers.
   *
   * @var Record<string, unknown>
   */
  protected static resolvers: Record<string, unknown> = {}

  /**
   * The table prefix for the connection.
   *
   * @member {string}
   */
  protected tablePrefix: string = ''

  /**
   * The number of active transactions.
   *
   * @member {number}
   */
  protected transactions: number = 0

  /**
   * Create a new database connection instance.
   *
   * @param  {object|Function}  ndo
   * @param  {string}  database
   * @param  {string}  tablePrefix
   * @param  {object}  config
   * @return {void}
   */
  public constructor (
    ndo: Statement | Function | any, // TODO: verify the real type and remove the any
    database: string = '',
    tablePrefix: string = '',
    config: object = {}
  ) {
    use(this.constructor, [DetectsLostConnections])

    this.ndo = ndo

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
   * Bind values to their parameters in the given statement.
   *
   * @param  {\Illuminate\Database\Statements\Statement}  statement
   * @param  {object}  bindings
   * @return {void}
   */
  public bindValues (statement: Statement, bindings: object): void {
    for (const [key, value] of Object.entries(bindings)) {
      statement.bindValue(
        isNumeric(key) ? Number(key) + 1 : key,
        value
      )
    }
  }

  /**
   * Disconnect from the underlying PDO connection.
   *
   * @return {void}
   */
  public disconnect (): void {
    this.setNdo(undefined)

    // this.doctrineConnection = null
  }

  /**
   * Fire the given event if possible.
   *
   * @param  {any}  event
   * @return {void}
   */
  protected event (event: any): void {
    if (this.events !== undefined) {
      this.events.dispatch(event)
    }
  }

  /**
   * Get an option from the configuration options.
   *
   * @param  {string}  [option]
   * @return {unknown}
   */
  public getConfig (option?: string): unknown {
    return option === undefined ? this.config : getValue(this.config, option)
  }

  /**
   * Get the name of the connected database.
   *
   * @return {string}
   */
  public getDatabaseName (): string {
    return this.database
  }

  /**
   * Get the default post processor instance.
   *
   * @return {\Illuminate\Database\Query\Processors\Processor}
   */
  protected getDefaultPostProcessor (): Processor {
    return new Processor()
  }

  /**
   * Get the default query grammar instance.
   *
   * @return {\Illuminate\Database\Query\Grammars\Grammar}
   */
  protected getDefaultQueryGrammar (): QueryGrammar {
    return new QueryGrammar()
  }

  /**
   * Get the elapsed time since a given starting point.
   *
   * @param  {number}  start
   * @return {number}
   */
  protected getElapsedTime (start: number): number {
    return parseFloat(Math.fround((Date.now() - start) * 1000).toPrecision(2))
  }

  /**
   * Get the database connection name.
   *
   * @return {string|undefined}
   */
  public getName (): string | undefined {
    return this.getConfig('name') as string
  }

  /**
   * Get the current PDO connection.
   *
   * @return {Statement}
   */
  public getNdo (): Statement {
    if (isFunction(this.ndo)) {
      this.ndo = (this.ndo as Function)()

      return this.ndo as Statement
    }

    return this.ndo as Statement
  }

  /**
   * Get the NDO connection to use for a select query.
   *
   * @param  {boolean}  [useReadNdo=true]
   * @return {Statement}
   */
  protected getNdoForSelect (): Statement {
    return this.getNdo()
  }

  /**
   * Get the query post processor used by the connection.
   *
   * @return {\Illuminate\Database\Query\Processors\Processor}
   */
  public getPostProcessor (): Processor {
    return this.postProcessor as Processor // TODO: try to remove the as Processor cast
  }

  /**
   * Get the query grammar used by the connection.
   *
   * @return {\Illuminate\Database\Query\Grammars\Grammar}
   */
  public getQueryGrammar (): QueryGrammar {
    return this.queryGrammar as QueryGrammar // TODO: try to remove the as QueryGrammar cast
  }

  /**
   * Get the current PDO connection parameter without executing any reconnect logic.
   *
   * @return {Statement|Function|undefined}
   */
  public getRawPdo (): Statement | Function | undefined {
    return this.ndo
  }

  /**
   * Get the connection resolver for the given driver.
   *
   * @param  {string}  driver
   * @return {any}
   */
  public static getResolver (driver: string): any {
    return this.resolvers[driver] ?? undefined
  }

  /**
   * Handle a query exception.
   *
   * @param  {Error}  error
   * @param  {string}  query
   * @param  {Bindings}  bindings
   * @param  {Function}  callback
   * @return {unknown}
   *
   * @throws {Error}
   */
  protected handleQueryException (error: Error, query: string, bindings: object, callback: Function): unknown {
    if (this.transactions >= 1) {
      throw error
    }

    return this.tryAgainIfCausedByLostConnection(
      error, query, bindings, callback
    )
  }

  /**
   * Log a query in the connection's query log.
   *
   * @param  {string}  query
   * @param  {object}  bindings
   * @param  {number}  time
   * @return {void}
   */
  public logQuery (query: string, bindings: object, time: number): void {
    this.event(new QueryExecuted(query, bindings, time, this))

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
  public prepareBindings (bindings: object): object {
    const grammar = this.getQueryGrammar()

    for (const [key, value] of Object.entries(bindings) as [keyof typeof bindings, any]) {
      // We need to transform all instances of DateTimeInterface into the actual
      // date string. Each query grammar maintains its own date string format
      // so we'll just ask the grammar for the format to get from the date.
      if (value instanceof Date) {
        (bindings as any)[key] = dateFormat(value, grammar.getDateFormat())
      } else if (/* isBoolean(value) */typeof value === 'boolean') {
        (bindings as any)[key] = Number(value)
      }
    }

    return bindings
  }

  /**
   * Configure the prepare statement.
   *
   * @param  {Statement}  statement
   * @return {\Illuminate\Database\Statements\Statement}
   */
  protected prepared (statement: Statement): Statement {
    statement.setFetchMode(this.fetchMode)

    this.event(new StatementPrepared(
      this, statement
    ))

    return statement
  }

  /**
   * Determine if the connection is in a "dry run".
   *
   * @return {boolean}
   */
  public pretending (): boolean {
    return this.pretendingConnection
  }

  /**
   * Get a new query builder instance.
   *
   * @return {\Illuminate\Database\Query\Builder}
   */
  public query (): QueryBuilder {
    return new QueryBuilder(
      this, this.getQueryGrammar(), this.getPostProcessor()
    )
  }

  /**
   * Reconnect to the database.
   *
   * @return {void}
   *
   * @throws \LogicException
   */
  public reconnect (): void {
    if (isFunction(this.reconnector)) {
      return this.reconnector(this)
    }

    throw new Error('LogicException: Lost connection and no reconnector available.')
  }

  /**
   * Reconnect to the database if a PDO connection is missing.
   *
   * @return {void}
   */
  protected reconnectIfMissingConnection (): void {
    if (this.ndo !== undefined) {
      this.reconnect()
    }
  }

  /**
   * Indicate if any records have been modified.
   *
   * @param  {boolean}  [value=true]
   * @return {void}
   */
  public recordsHaveBeenModified (value = true): void {
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
   * @return {Promise<any>}
   *
   * @throws {\Illuminate\Database\QueryException}
   */
  protected async run (query: string, bindings: object, callback: Function): Promise<any> {
    this.reconnectIfMissingConnection()

    const start = Date.now()

    let result

    // Here we will run this query. If an exception occurs we'll determine if it was
    // caused by a connection that has been lost. If that is the cause, we'll try
    // to re-establish connection and re-run the query with a fresh connection.
    try {
      result = await this.runQueryCallback(query, bindings, callback)
    } catch (error: any) {
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
   * @throws {\Illuminate\Database\QueryException}
   */
  protected async runQueryCallback (query: string, bindings: object, callback: Function): Promise<any> {
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
        `QueryException: ${query} - ${JSON.stringify(this.prepareBindings(bindings))}`
      )
    }
  }

  /**
   * Run a select statement against the database.
   *
   * @param  {string}  query
   * @param  {object}  [bindings]
   * @return {object}
   */
  public async select (query: string, bindings: object): Promise<any> {
    return await this.run(query, bindings, async (query: string, bindings: object) => {
      if (this.pretending()) {
        return []
      }

      // For select statements, we'll simply execute the query and return an array
      // of the database result set. Each element in the array will be a single
      // row from the database table, and will either be an array or objects.
      const statement = this.prepared(
        // this.connection, query
        this.getNdoForSelect().prepare(query)
      )

      this.bindValues(statement, this.prepareBindings(bindings))

      await statement.execute()

      return statement.fetchAll()
    })
  }

  /**
   * Set the event dispatcher instance on the connection.
   *
   * @param  {\Illuminate\Contracts\Events\Dispatcher}  events
   * @return {this}
   */
  public setEventDispatcher (events: Dispatcher): this {
    this.events = events

    return this
  }

  /**
   * Set the PDO connection.
   *
   * @param  {object|Function}  ndo
   * @return {this}
   */
  public setNdo (ndo?: Statement | Function): this {
    this.transactions = 0

    this.ndo = ndo

    return this
  }

  /**
   * Set the reconnect instance on the connection.
   *
   * @param  {callable}  reconnector
   * @return {this}
   */
  public setReconnector (reconnector: Function): this {
    this.reconnector = reconnector

    return this
  }

  /**
   * Handle a query exception that occurred during query execution.
   *
   * @param  {Error}  error
   * @param  {string}  query
   * @param  {object}  bindings
   * @param  {Function}  callback
   * @return {unknown}
   *
   * @throws \Illuminate\Database\QueryException
   */
  protected tryAgainIfCausedByLostConnection (error: Error, query: string, bindings: object, callback: Function): unknown {
    if (this.causedByLostConnection(error)) {
      this.reconnect()

      return this.runQueryCallback(query, bindings, callback)
    }

    throw error
  }

  /**
   * Set the query post processor to the default implementation.
   *
   * @return {void}
   */
  protected useDefaultPostProcessor (): void {
    this.postProcessor = this.getDefaultPostProcessor()
  }

  /**
 * Set the query grammar to the default implementation.
 *
 * @return {void}
 */
  public useDefaultQueryGrammar (): void {
    this.queryGrammar = this.getDefaultQueryGrammar()
  }

  /**
   * Set the table prefix and return the grammar.
   *
   * @param  {\Illuminate\Database\Grammar}  grammar
   * @return {\Illuminate\Database\Grammar}
   */
  public withTablePrefix (grammar: Grammar): Grammar {
    grammar.setTablePrefix(this.tablePrefix)

    return grammar
  }
}
