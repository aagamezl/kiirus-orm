import { get as getData, isBoolean, isFunction, isInteger, isString } from 'lodash';
import { dateFormat } from '@devnetic/utils';

import { ConnectionInterface } from './ConnectionInterface'
import { Builder } from './Eloquent/Query/Builder';
import { Dispatcher } from '../Contracts/Events';
import { QueryExecuted } from './Events';
import { Grammar as QueryGrammar } from './Query/Grammars';
import { Processor } from './Query/Processors';
import { Statement } from './Statements';

export type Bindings = Record<string | number, any>;

export class Connection implements ConnectionInterface {
  /**
   * The database connection configuration options.
   *
   * @var array
   */
  protected config = [];

  /**
   * The active connection.
   *
   * @var Object|Function
   */
  protected connection;

  /**
   * The name of the connected database.
   *
   * @var string
   */
  protected database: string;

  /**
   * The event dispatcher instance.
   *
   * @var \Illuminate\Contracts\Events\Dispatcher
   */
  protected events?: Dispatcher;

  /**
   * Indicates whether queries are being logged.
   *
   * @var bool
   */
  protected loggingQueries: boolean = false;

  /**
   * The query post processor implementation.
   *
   * @var Processor
   */
  protected postProcessor: Processor = {} as Processor;

  /**
   * Indicates if the connection is in a "dry run".
   *
   * @var bool
   */
  protected pretendingConnection: boolean = false;

  /**
   * The query grammar implementation.
   *
   * @var Grammar
   */
  protected queryGrammar: QueryGrammar = {} as QueryGrammar;

  /**
   * All of the queries run against the connection.
   *
   * @var array
   */
  protected queryLog: Array<Object> = [];

  /**
   * The reconnector instance for the connection.
   *
   * @var Function
   */
  protected reconnector?: Function;

  /**
   * Indicates if changes have been made to the database.
   *
   * @var boolean
   */
  protected recordsModified: boolean = false;

  /**
   * The table prefix for the connection.
   *
   * @var string
   */
  protected tablePrefix = '';

  /**
   * The number of active transactions.
   *
   * @var number
   */
  protected transactions = 0;

  constructor(connection: Object, database = '', tablePrefix = '', config = []) {
    this.connection = connection;

    // First we will setup the default properties. We keep track of the DB
    // name we are connected to since it is needed when some reflective
    // type commands are run such as checking whether a table exists.
    this.database = database;

    this.tablePrefix = tablePrefix;

    this.config = config;

    // We need to initialize a query grammar and the query post processors
    // which are both very important parts of the database abstractions
    // so we initialize these to their default values while starting.
    this.useDefaultQueryGrammar();

    this.useDefaultPostProcessor();
  }

  /**
   * Run an SQL statement and get the number of rows affected.
   *
   * @param  string  query
   * @param  Bindings  bindings
   * @return number
   */
  public affectingStatement(query: string, bindings: Bindings = {}): number {
    return this.run(query, bindings, async (query: string, bindings: Bindings) => {
      if (this.pretending()) {
        return 0;
      }

      // For update or delete statements, we want to get the number of rows affected
      // by the statement and return that back to the developer. We'll first need
      // to execute the statement and then we'll use PDO to fetch the affected.
      const statement = this.prepare(query, this.getConnection());

      this.bindValues(statement, this.prepareBindings(bindings));

      await statement.execute();

      const count = statement.rowCount();

      this.recordsHaveBeenModified(count > 0 );

      return count;
    });
  }

  /**
   * Bind values to their parameters in the given statement.
   *
   * @param  \Illuminate\Database\Statements\Statement  statement
   * @param  Bindings  bindings
   * @return void
   */
  public bindValues(statement: Statement, bindings: Bindings): void {
    for (const [key, value] of Object.entries(bindings)) {
      statement.bindValue(
        isString(key) ? key : key + 1,
        value
      );
    }
  }

  /**
   * Determine if the given exception was caused by a lost connection.
   *
   * @param  Error  error
   * @return boolean
   */
  protected causedByLostConnection(error: Error): boolean {
    const message = error.message;

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
      'SQLSTATE[HY000]: General error: 7 SSL SYSCALL error: No route to host',
    ];

    for (const needle of messages) {
      if (message.includes(needle)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Fire the given event if possible.
   *
   * @param  any  event
   * @return void
   */
  protected event(event: any): void {
    if (this.events) {
      this.events.dispatch(event);
    }
  }

  /**
   * Get an option from the configuration options.
   *
   * @param  string  option
   * @return mixed
   */
  public getConfig(option: string) {
    return getData(this.config, option);
  }

  /**
   * Get the current PDO connection.
   *
   * @return Object
   */
  public getConnection() {
    if (isFunction(this.connection)) {
      return this.connection = this.connection();
    }

    return this.connection;
  }

  /**
   * Get the name of the connected database.
   *
   * @return string
   */
  public getDatabaseName() {
    return this.database
  }

  /**
   * Get the default post processor instance.
   *
   * @return \Illuminate\Database\Query\Processors\Processor
   */
  protected getDefaultPostProcessor(): Processor {
    return new Processor();
  }

  /**
   * Get the default query grammar instance.
   *
   * @return \Illuminate\Database\Query\Grammars\Grammar
   */
  protected getDefaultQueryGrammar() {
    return new QueryGrammar();
  }

  /**
   * Get the elapsed time since a given starting point.
   *
   * @param  number  start
   * @return number
   */
  protected getElapsedTime(start: number): number {
    return parseFloat(Math.fround((Date.now() - start) * 1000).toPrecision(3));
  }

  /**
   * Get the query post processor used by the connection.
   *
   * @return \Illuminate\Database\Query\Processors\Processor
   */
  public getPostProcessor(): Processor {
    return this.postProcessor;
  }

  /**
   * Get the query grammar used by the connection.
   *
   * @return \Illuminate\Database\Query\Grammars\Grammar
   */
  public getQueryGrammar(): QueryGrammar {
    return this.queryGrammar;
  }

  /**
   * Get the database connection name.
   *
   * @return string|undefined
   */
  public getName(): string | undefined {
    return this.getConfig('name');
  }

  /**
   * Handle a query exception.
   *
   * @param  Error  e
   * @param  string  query
   * @param  Bindings  bindings
   * @param  Function  callback
   * @return any
   *
   * @throws Error
   */
  protected handleQueryException(error: Error, query: string, bindings: Bindings, callback: Function): any {
    if (this.transactions >= 1) {
      throw error;
    }

    return this.tryAgainIfCausedByLostConnection(
      error, query, bindings, callback
    );
  }

  /**
   * Run an insert statement against the database.
   *
   * @param  string  query
   * @param  Bindings  bindings
   * @return boolean
   */
  public insert(query: string, bindings: Bindings = {}): boolean {
    return this.statement(query, bindings);
  }

  /**
   * Log a query in the connection's query log.
   *
   * @param  string  query
   * @param  array  bindings
   * @param  [number]  time
   * @return void
   */
  public logQuery(query: string, bindings: Bindings, time?: number) {
    this.event(new QueryExecuted(query, bindings, this, time));

    if (this.loggingQueries) {
      this.queryLog.push({ query, bindings, time });
    }
  }

  /**
   * Return the prepare statement function.
   *
   * @param  any  query
   * @param  any  connection
   * @return \Illuminate\Database\Statements\Statement
   */
  public prepare(query: string, connection: any): Statement {
    return new Statement(query, connection)
  }

  /**
   * Prepare the query bindings for execution.
   *
   * @param  Bindings  bindings
   * @return Bindings
   */
  public prepareBindings(bindings: Bindings): Bindings {
    const grammar = this.getQueryGrammar();

    for (const [key, value] of Object.entries(bindings)) {
      // We need to transform all instances of DateTimeInterface into the actual
      // date string. Each query grammar maintains its own date string format
      // so we'll just ask the grammar for the format to get from the date.
      if (value instanceof Date) {
        bindings[key] = dateFormat(value, grammar.getDateFormat());
      } else if (isBoolean(value)) {
        bindings[key] = Number(value);
      }
    }

    return bindings;
  }

  /**
   * Determine if the connection is in a "dry run".
   *
   * @return boolean
   */
  public pretending(): boolean {
    return this.pretendingConnection === true;
  }

  /**
   * Reconnect to the database.
   *
   * @return void
   *
   * @throws \LogicException
   */
  public reconnect() {
    if (isFunction(this.reconnector)) {
      return this.reconnector(this);
    }

    throw new Error('LogicException: Lost connection and no reconnector available.');
  }

  /**
   * Reconnect to the database if a PDO connection is missing.
   *
   * @return void
   */
  protected reconnectIfMissingConnection() {
    if (!this.connection) {
      this.reconnect();
    }
  }

  /**
   * Indicate if any records have been modified.
   *
   * @param  boolean  value
   * @return void
   */
  public recordsHaveBeenModified(value: boolean = true): void {
    if (!this.recordsModified) {
      this.recordsModified = value;
    }
  }

  /**
   * Run a SQL statement and log its execution context.
   *
   * @param  string  query
   * @param  Bindings  bindings
   * @param  Function callback
   * @return any
   *
   * @throws \Illuminate\Database\QueryException
   */
  protected run(query: string, bindings: Bindings, callback: Function): any {
    this.reconnectIfMissingConnection();

    const start = Date.now();

    let result;

    // Here we will run this query. If an exception occurs we'll determine if it was
    // caused by a connection that has been lost. If that is the cause, we'll try
    // to re-establish connection and re-run the query with a fresh connection.
    try {
      result = this.runQueryCallback(query, bindings, callback);
    } catch (error) {
      result = this.handleQueryException(
        error, query, bindings, callback
      );
    }

    // Once we have run the query we will calculate the time that it took to run and
    // then log the query, bindings, and execution time so we will report them on
    // the event that the developer needs them. We'll log time in milliseconds.
    this.logQuery(
      query, bindings, this.getElapsedTime(start)
    );

    return result;
  }

  /**
   * Run a SQL statement.
   *
   * @param  string  query
   * @param  Bindings  bindings
   * @param  Function  callback
   * @return any
   *
   * @throws \Illuminate\Database\QueryException
   */
  protected runQueryCallback(query: string, bindings: Bindings, callback: Function): any {
    // To execute the statement, we'll simply call the callback, which will actually
    // run the SQL against the PDO connection. Then we can calculate the time it
    // took to execute and log the query SQL, bindings and time in our memory.
    try {
      const result = callback(query, bindings);

      return result;
    } catch (error) {
      // If an exception occurs when attempting to run a query, we'll format the error
      // message to include the bindings with SQL, which will make this exception a
      // lot more helpful to the developer instead of just the database's errors.
      throw new Error(`QueryException: ${query} - ${this.prepareBindings(bindings)}`);
    }
  }

  /**
   * Run a select statement against the database.
   *
   * @param  string  query
   * @param  array  bindings
   * @return Array<unknown>
   */
  public select(query: string, bindings: Array<string> = []): Array<any> {
    return [];
  }

  /**
   * Run a select statement against the database.
   *
   * @param  string  query
   * @param  array  bindings
   * @return array
   */
  public selectFromWriteConnection(query: string, bindings: Array<any> = []) {
    return this.select(query, bindings);
  }

  /**
   * Execute an SQL statement and return the boolean result.
   *
   * @param  string  query
   * @param  Bindings  bindings
   * @return boolean
   */
  public statement(query: string, bindings: Bindings = {}): boolean {
    return this.run(query, bindings, (query: string, bindings: Bindings) => {
      if (this.pretending()) {
        return true;
      }

      const statement = this.prepare(query, this.getConnection());

      this.bindValues(statement, this.prepareBindings(bindings));

      this.recordsHaveBeenModified();

      return statement.execute();
    });
  }

  /**
   * Handle a query exception that occurred during query execution.
   *
   * @param  \Illuminate\Database\QueryException  e
   * @param  string  query
   * @param  array  bindings
   * @param  \Closure  callback
   * @return mixed
   *
   * @throws \Illuminate\Database\QueryException
   */
  protected tryAgainIfCausedByLostConnection(error: Error, query: string, bindings: Bindings, callback: Function): any {
    if (this.causedByLostConnection(error)) {
      this.reconnect();

      return this.runQueryCallback(query, bindings, callback);
    }

    throw error;
  }

  /**
   * Run an update statement against the database.
   *
   * @param  string  query
   * @param  [Bindings]  bindings
   * @return number
   */
  public update(query: string, bindings: Bindings = {}): number {
    return this.affectingStatement(query, bindings);
  }

  /**
   * Set the query post processor to the default implementation.
   *
   * @return void
   */
  public useDefaultPostProcessor(): void {
    this.postProcessor = this.getDefaultPostProcessor();
  }

  /**
   * Set the query grammar to the default implementation.
   *
   * @return void
   */
  public useDefaultQueryGrammar(): void {
    this.queryGrammar = this.getDefaultQueryGrammar();
  }
}
