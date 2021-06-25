import { ConnectionInterface } from './ConnectionInterface';
import { Dispatcher } from '../Contracts/Events';
import { Grammar as QueryGrammar } from './Query/Grammars';
import { Processor } from './Query/Processors';
import { Statement } from './Statements';
export declare type Bindings = Record<string | number, any>;
export declare class Connection implements ConnectionInterface {
    /**
     * The database connection configuration options.
     *
     * @var array
     */
    protected config: never[];
    /**
     * The active connection.
     *
     * @var Object|Function
     */
    protected connection: Object;
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
    protected loggingQueries: boolean;
    /**
     * The query post processor implementation.
     *
     * @var Processor
     */
    protected postProcessor: Processor;
    /**
     * Indicates if the connection is in a "dry run".
     *
     * @var bool
     */
    protected pretendingConnection: boolean;
    /**
     * The query grammar implementation.
     *
     * @var Grammar
     */
    protected queryGrammar: QueryGrammar;
    /**
     * All of the queries run against the connection.
     *
     * @var array
     */
    protected queryLog: Array<Object>;
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
    protected recordsModified: boolean;
    /**
     * The table prefix for the connection.
     *
     * @var string
     */
    protected tablePrefix: string;
    /**
     * The number of active transactions.
     *
     * @var number
     */
    protected transactions: number;
    constructor(connection: Object, database?: string, tablePrefix?: string, config?: never[]);
    /**
     * Run an SQL statement and get the number of rows affected.
     *
     * @param  string  query
     * @param  Bindings  bindings
     * @return number
     */
    affectingStatement(query: string, bindings?: Bindings): number;
    /**
     * Bind values to their parameters in the given statement.
     *
     * @param  \Illuminate\Database\Statements\Statement  statement
     * @param  Bindings  bindings
     * @return void
     */
    bindValues(statement: Statement, bindings: Bindings): void;
    /**
     * Determine if the given exception was caused by a lost connection.
     *
     * @param  Error  error
     * @return boolean
     */
    protected causedByLostConnection(error: Error): boolean;
    /**
     * Fire the given event if possible.
     *
     * @param  any  event
     * @return void
     */
    protected event(event: any): void;
    /**
     * Get an option from the configuration options.
     *
     * @param  string  option
     * @return mixed
     */
    getConfig(option: string): any;
    /**
     * Get the current PDO connection.
     *
     * @return Object
     */
    getConnection(): any;
    /**
     * Get the name of the connected database.
     *
     * @return string
     */
    getDatabaseName(): string;
    /**
     * Get the default post processor instance.
     *
     * @return \Illuminate\Database\Query\Processors\Processor
     */
    protected getDefaultPostProcessor(): Processor;
    /**
     * Get the default query grammar instance.
     *
     * @return \Illuminate\Database\Query\Grammars\Grammar
     */
    protected getDefaultQueryGrammar(): QueryGrammar;
    /**
     * Get the elapsed time since a given starting point.
     *
     * @param  number  start
     * @return number
     */
    protected getElapsedTime(start: number): number;
    /**
     * Get the query post processor used by the connection.
     *
     * @return \Illuminate\Database\Query\Processors\Processor
     */
    getPostProcessor(): Processor;
    /**
     * Get the query grammar used by the connection.
     *
     * @return \Illuminate\Database\Query\Grammars\Grammar
     */
    getQueryGrammar(): QueryGrammar;
    /**
     * Get the database connection name.
     *
     * @return string|undefined
     */
    getName(): string | undefined;
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
    protected handleQueryException(error: Error, query: string, bindings: Bindings, callback: Function): any;
    /**
     * Run an insert statement against the database.
     *
     * @param  string  query
     * @param  Bindings  bindings
     * @return boolean
     */
    insert(query: string, bindings?: Bindings): boolean;
    /**
     * Log a query in the connection's query log.
     *
     * @param  string  query
     * @param  array  bindings
     * @param  [number]  time
     * @return void
     */
    logQuery(query: string, bindings: Bindings, time?: number): void;
    /**
     * Return the prepare statement function.
     *
     * @param  any  query
     * @param  any  connection
     * @return \Illuminate\Database\Statements\Statement
     */
    prepare(query: string, connection: any): Statement;
    /**
     * Prepare the query bindings for execution.
     *
     * @param  Bindings  bindings
     * @return Bindings
     */
    prepareBindings(bindings: Bindings): Bindings;
    /**
     * Determine if the connection is in a "dry run".
     *
     * @return boolean
     */
    pretending(): boolean;
    /**
     * Reconnect to the database.
     *
     * @return void
     *
     * @throws \LogicException
     */
    reconnect(): any;
    /**
     * Reconnect to the database if a PDO connection is missing.
     *
     * @return void
     */
    protected reconnectIfMissingConnection(): void;
    /**
     * Indicate if any records have been modified.
     *
     * @param  boolean  value
     * @return void
     */
    recordsHaveBeenModified(value?: boolean): void;
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
    protected run(query: string, bindings: Bindings, callback: Function): any;
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
    protected runQueryCallback(query: string, bindings: Bindings, callback: Function): any;
    /**
     * Run a select statement against the database.
     *
     * @param  string  query
     * @param  array  bindings
     * @return Array<unknown>
     */
    select(query: string, bindings?: Array<string>): Array<any>;
    /**
     * Run a select statement against the database.
     *
     * @param  string  query
     * @param  array  bindings
     * @return array
     */
    selectFromWriteConnection(query: string, bindings?: Array<any>): any[];
    /**
     * Execute an SQL statement and return the boolean result.
     *
     * @param  string  query
     * @param  Bindings  bindings
     * @return boolean
     */
    statement(query: string, bindings?: Bindings): boolean;
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
    protected tryAgainIfCausedByLostConnection(error: Error, query: string, bindings: Bindings, callback: Function): any;
    /**
     * Run an update statement against the database.
     *
     * @param  string  query
     * @param  [Bindings]  bindings
     * @return number
     */
    update(query: string, bindings?: Bindings): number;
    /**
     * Set the query post processor to the default implementation.
     *
     * @return void
     */
    useDefaultPostProcessor(): void;
    /**
     * Set the query grammar to the default implementation.
     *
     * @return void
     */
    useDefaultQueryGrammar(): void;
}
