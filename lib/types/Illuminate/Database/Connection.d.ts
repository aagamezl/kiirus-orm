import { Builder as QueryBuilder } from './Query/Builder';
import { DetectsLostConnections } from './DetectsLostConnections';
import { Dispatcher } from '../Contracts/Events/Dispatcher';
import { Grammar as QueryGrammar } from './Query/Grammars';
import { Grammar } from './Grammar';
import { Processor } from './Query/Processors';
import { Statement } from './Statements/Statement';
export interface QueryLog {
    query: string;
    bindings: object;
    time: number;
}
export interface Connection extends DetectsLostConnections {
}
export declare class Connection {
    /**
     * The database connection configuration options.
     *
     * @member {object}
     */
    protected config: object;
    /**
     * The name of the connected database.
     *
     * @member {string}
     */
    protected database: string;
    /**
     * The event dispatcher instance.
     *
     * @member {\Illuminate\Contracts\Events\Dispatcher}
     */
    protected events: Dispatcher | undefined;
    /**
     * The default fetch mode of the connection.
     *
     * @member {string}
     */
    protected fetchMode: string;
    /**
     * Indicates whether queries are being logged.
     *
     * @member {boolean}
     */
    protected loggingQueries: boolean;
    /**
     * The active NDO connection.
     *
     * @member {object|Function}
     */
    protected ndo?: Statement | Function;
    /**
     * The query post processor implementation.
     *
     * @var {\Illuminate\Database\Query\Processors\Processor}
     */
    protected postProcessor: Processor | undefined;
    /**
     * Indicates if the connection is in a "dry run".
     *
     * @var {boolean}
     */
    protected pretendingConnection: boolean;
    /**
     * The query grammar implementation.
     *
     * @member {\Illuminate\Database\Query\Grammars\Grammar}
     */
    protected queryGrammar: QueryGrammar | undefined;
    /**
     * All of the queries run against the connection.
     *
     * @member {QueryLog[]}
     */
    protected queryLog: QueryLog[];
    /**
     * The reconnector instance for the connection.
     *
     * @var {Function}
     */
    protected reconnector: Function;
    /**
     * Indicates if changes have been made to the database.
     *
     * @member {boolean}
     */
    protected recordsModified: boolean;
    /**
     * The connection resolvers.
     *
     * @var Record<string, unknown>
     */
    protected static resolvers: Record<string, unknown>;
    /**
     * The table prefix for the connection.
     *
     * @member {string}
     */
    protected tablePrefix: string;
    /**
     * The number of active transactions.
     *
     * @member {number}
     */
    protected transactions: number;
    /**
     * Create a new database connection instance.
     *
     * @param  {object|Function}  ndo
     * @param  {string}  database
     * @param  {string}  tablePrefix
     * @param  {object}  config
     * @return {void}
     */
    constructor(ndo: Statement | Function | any, // TODO: verify the real type and remove the any
    database?: string, tablePrefix?: string, config?: object);
    /**
     * Bind values to their parameters in the given statement.
     *
     * @param  {\Illuminate\Database\Statements\Statement}  statement
     * @param  {object}  bindings
     * @return {void}
     */
    bindValues(statement: Statement, bindings: object): void;
    /**
     * Disconnect from the underlying PDO connection.
     *
     * @return {void}
     */
    disconnect(): void;
    /**
     * Fire the given event if possible.
     *
     * @param  {any}  event
     * @return {void}
     */
    protected event(event: any): void;
    /**
     * Get an option from the configuration options.
     *
     * @param  {string}  [option]
     * @return {unknown}
     */
    getConfig(option?: string): unknown;
    /**
     * Get the name of the connected database.
     *
     * @return {string}
     */
    getDatabaseName(): string;
    /**
     * Get the default post processor instance.
     *
     * @return {\Illuminate\Database\Query\Processors\Processor}
     */
    protected getDefaultPostProcessor(): Processor;
    /**
     * Get the default query grammar instance.
     *
     * @return {\Illuminate\Database\Query\Grammars\Grammar}
     */
    protected getDefaultQueryGrammar(): QueryGrammar;
    /**
     * Get the elapsed time since a given starting point.
     *
     * @param  {number}  start
     * @return {number}
     */
    protected getElapsedTime(start: number): number;
    /**
     * Get the database connection name.
     *
     * @return {string|undefined}
     */
    getName(): string | undefined;
    /**
     * Get the current PDO connection.
     *
     * @return {Statement}
     */
    getNdo(): Statement;
    /**
     * Get the NDO connection to use for a select query.
     *
     * @param  {boolean}  [useReadNdo=true]
     * @return {Statement}
     */
    protected getNdoForSelect(): Statement;
    /**
     * Get the query post processor used by the connection.
     *
     * @return {\Illuminate\Database\Query\Processors\Processor}
     */
    getPostProcessor(): Processor;
    /**
     * Get the query grammar used by the connection.
     *
     * @return {\Illuminate\Database\Query\Grammars\Grammar}
     */
    getQueryGrammar(): QueryGrammar;
    /**
     * Get the current PDO connection parameter without executing any reconnect logic.
     *
     * @return {Statement|Function|undefined}
     */
    getRawPdo(): Statement | Function | undefined;
    /**
     * Get the connection resolver for the given driver.
     *
     * @param  {string}  driver
     * @return {any}
     */
    static getResolver(driver: string): any;
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
    protected handleQueryException(error: Error, query: string, bindings: object, callback: Function): unknown;
    /**
     * Log a query in the connection's query log.
     *
     * @param  {string}  query
     * @param  {object}  bindings
     * @param  {number}  time
     * @return {void}
     */
    logQuery(query: string, bindings: object, time: number): void;
    /**
     * Prepare the query bindings for execution.
     *
     * @param  {object}  object
     * @return {object}
     */
    prepareBindings(bindings: object): object;
    /**
     * Configure the prepare statement.
     *
     * @param  {Statement}  statement
     * @return {\Illuminate\Database\Statements\Statement}
     */
    protected prepared(statement: Statement): Statement;
    /**
     * Determine if the connection is in a "dry run".
     *
     * @return {boolean}
     */
    pretending(): boolean;
    /**
     * Get a new query builder instance.
     *
     * @return {\Illuminate\Database\Query\Builder}
     */
    query(): QueryBuilder;
    /**
     * Reconnect to the database.
     *
     * @return {void}
     *
     * @throws \LogicException
     */
    reconnect(): void;
    /**
     * Reconnect to the database if a PDO connection is missing.
     *
     * @return {void}
     */
    protected reconnectIfMissingConnection(): void;
    /**
     * Indicate if any records have been modified.
     *
     * @param  {boolean}  [value=true]
     * @return {void}
     */
    recordsHaveBeenModified(value?: boolean): void;
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
    protected run(query: string, bindings: object, callback: Function): Promise<any>;
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
    protected runQueryCallback(query: string, bindings: object, callback: Function): Promise<any>;
    /**
     * Run a select statement against the database.
     *
     * @param  {string}  query
     * @param  {object}  [bindings]
     * @return {object}
     */
    select(query: string, bindings: object): Promise<any>;
    /**
     * Set the event dispatcher instance on the connection.
     *
     * @param  {\Illuminate\Contracts\Events\Dispatcher}  events
     * @return {this}
     */
    setEventDispatcher(events: Dispatcher): this;
    /**
     * Set the PDO connection.
     *
     * @param  {object|Function}  ndo
     * @return {this}
     */
    setNdo(ndo?: Statement | Function): this;
    /**
     * Set the reconnect instance on the connection.
     *
     * @param  {callable}  reconnector
     * @return {this}
     */
    setReconnector(reconnector: Function): this;
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
    protected tryAgainIfCausedByLostConnection(error: Error, query: string, bindings: object, callback: Function): unknown;
    /**
     * Set the query post processor to the default implementation.
     *
     * @return {void}
     */
    protected useDefaultPostProcessor(): void;
    /**
   * Set the query grammar to the default implementation.
   *
   * @return {void}
   */
    useDefaultQueryGrammar(): void;
    /**
     * Set the table prefix and return the grammar.
     *
     * @param  {\Illuminate\Database\Grammar}  grammar
     * @return {\Illuminate\Database\Grammar}
     */
    withTablePrefix(grammar: Grammar): Grammar;
}
