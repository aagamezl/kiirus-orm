"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Connection = void 0;
const utils_1 = require("@devnetic/utils");
const Builder_1 = require("./Query/Builder");
const DetectsLostConnections_1 = require("./DetectsLostConnections");
const Grammars_1 = require("./Query/Grammars");
const Processors_1 = require("./Query/Processors");
const QueryExecuted_1 = require("./Events/QueryExecuted");
const StatementPrepared_1 = require("./Events/StatementPrepared");
const use_1 = require("../Support/Traits/use");
class Connection {
    /**
     * Create a new database connection instance.
     *
     * @param  {object|Function}  ndo
     * @param  {string}  database
     * @param  {string}  tablePrefix
     * @param  {object}  config
     * @return {void}
     */
    constructor(ndo, // TODO: verify the real type and remove the any
    database = '', tablePrefix = '', config = {}) {
        /**
         * The database connection configuration options.
         *
         * @member {object}
         */
        this.config = {};
        /**
         * The name of the connected database.
         *
         * @member {string}
         */
        this.database = '';
        /**
         * The event dispatcher instance.
         *
         * @member {\Illuminate\Contracts\Events\Dispatcher}
         */
        this.events = undefined;
        /**
         * The default fetch mode of the connection.
         *
         * @member {string}
         */
        this.fetchMode = 'obj'; // assoc, obj
        /**
         * Indicates whether queries are being logged.
         *
         * @member {boolean}
         */
        this.loggingQueries = false;
        /**
         * The query post processor implementation.
         *
         * @var {\Illuminate\Database\Query\Processors\Processor}
         */
        this.postProcessor = undefined;
        /**
         * Indicates if the connection is in a "dry run".
         *
         * @var {boolean}
         */
        this.pretendingConnection = false;
        /**
         * The query grammar implementation.
         *
         * @member {\Illuminate\Database\Query\Grammars\Grammar}
         */
        this.queryGrammar = undefined;
        /**
         * All of the queries run against the connection.
         *
         * @member {QueryLog[]}
         */
        this.queryLog = [];
        /**
         * The reconnector instance for the connection.
         *
         * @var {Function}
         */
        this.reconnector = () => { };
        /**
         * Indicates if changes have been made to the database.
         *
         * @member {boolean}
         */
        this.recordsModified = false;
        /**
         * The table prefix for the connection.
         *
         * @member {string}
         */
        this.tablePrefix = '';
        /**
         * The number of active transactions.
         *
         * @member {number}
         */
        this.transactions = 0;
        (0, use_1.use)(this.constructor, [DetectsLostConnections_1.DetectsLostConnections]);
        this.ndo = ndo;
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
     * Bind values to their parameters in the given statement.
     *
     * @param  {\Illuminate\Database\Statements\Statement}  statement
     * @param  {object}  bindings
     * @return {void}
     */
    bindValues(statement, bindings) {
        for (const [key, value] of Object.entries(bindings)) {
            statement.bindValue((0, utils_1.isNumeric)(key) ? Number(key) + 1 : key, value);
        }
    }
    /**
     * Disconnect from the underlying PDO connection.
     *
     * @return {void}
     */
    disconnect() {
        this.setNdo(undefined);
        // this.doctrineConnection = null
    }
    /**
     * Fire the given event if possible.
     *
     * @param  {any}  event
     * @return {void}
     */
    event(event) {
        if (this.events !== undefined) {
            this.events.dispatch(event);
        }
    }
    /**
     * Get an option from the configuration options.
     *
     * @param  {string}  [option]
     * @return {unknown}
     */
    getConfig(option) {
        return option === undefined ? this.config : (0, utils_1.getValue)(this.config, option);
    }
    /**
     * Get the name of the connected database.
     *
     * @return {string}
     */
    getDatabaseName() {
        return this.database;
    }
    /**
     * Get the default post processor instance.
     *
     * @return {\Illuminate\Database\Query\Processors\Processor}
     */
    getDefaultPostProcessor() {
        return new Processors_1.Processor();
    }
    /**
     * Get the default query grammar instance.
     *
     * @return {\Illuminate\Database\Query\Grammars\Grammar}
     */
    getDefaultQueryGrammar() {
        return new Grammars_1.Grammar();
    }
    /**
     * Get the elapsed time since a given starting point.
     *
     * @param  {number}  start
     * @return {number}
     */
    getElapsedTime(start) {
        return parseFloat(Math.fround((Date.now() - start) * 1000).toPrecision(2));
    }
    /**
     * Get the database connection name.
     *
     * @return {string|undefined}
     */
    getName() {
        return this.getConfig('name');
    }
    /**
     * Get the current PDO connection.
     *
     * @return {Statement}
     */
    getNdo() {
        if ((0, utils_1.isFunction)(this.ndo)) {
            this.ndo = this.ndo();
            return this.ndo;
        }
        return this.ndo;
    }
    /**
     * Get the NDO connection to use for a select query.
     *
     * @param  {boolean}  [useReadNdo=true]
     * @return {Statement}
     */
    getNdoForSelect() {
        return this.getNdo();
    }
    /**
     * Get the query post processor used by the connection.
     *
     * @return {\Illuminate\Database\Query\Processors\Processor}
     */
    getPostProcessor() {
        return this.postProcessor; // TODO: try to remove the as Processor cast
    }
    /**
     * Get the query grammar used by the connection.
     *
     * @return {\Illuminate\Database\Query\Grammars\Grammar}
     */
    getQueryGrammar() {
        return this.queryGrammar; // TODO: try to remove the as QueryGrammar cast
    }
    /**
     * Get the current PDO connection parameter without executing any reconnect logic.
     *
     * @return {Statement|Function|undefined}
     */
    getRawPdo() {
        return this.ndo;
    }
    /**
     * Get the connection resolver for the given driver.
     *
     * @param  {string}  driver
     * @return {any}
     */
    static getResolver(driver) {
        return this.resolvers[driver] ?? undefined;
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
    handleQueryException(error, query, bindings, callback) {
        if (this.transactions >= 1) {
            throw error;
        }
        return this.tryAgainIfCausedByLostConnection(error, query, bindings, callback);
    }
    /**
     * Log a query in the connection's query log.
     *
     * @param  {string}  query
     * @param  {object}  bindings
     * @param  {number}  time
     * @return {void}
     */
    logQuery(query, bindings, time) {
        this.event(new QueryExecuted_1.QueryExecuted(query, bindings, time, this));
        if (this.loggingQueries) {
            this.queryLog.push({ query, bindings, time });
        }
    }
    /**
     * Prepare the query bindings for execution.
     *
     * @param  {object}  object
     * @return {object}
     */
    prepareBindings(bindings) {
        const grammar = this.getQueryGrammar();
        for (const [key, value] of Object.entries(bindings)) {
            // We need to transform all instances of DateTimeInterface into the actual
            // date string. Each query grammar maintains its own date string format
            // so we'll just ask the grammar for the format to get from the date.
            if (value instanceof Date) {
                bindings[key] = (0, utils_1.dateFormat)(value, grammar.getDateFormat());
            }
            else if ( /* isBoolean(value) */typeof value === 'boolean') {
                bindings[key] = Number(value);
            }
        }
        return bindings;
    }
    /**
     * Configure the prepare statement.
     *
     * @param  {Statement}  statement
     * @return {\Illuminate\Database\Statements\Statement}
     */
    prepared(statement) {
        statement.setFetchMode(this.fetchMode);
        this.event(new StatementPrepared_1.StatementPrepared(this, statement));
        return statement;
    }
    /**
     * Determine if the connection is in a "dry run".
     *
     * @return {boolean}
     */
    pretending() {
        return this.pretendingConnection;
    }
    /**
     * Get a new query builder instance.
     *
     * @return {\Illuminate\Database\Query\Builder}
     */
    query() {
        return new Builder_1.Builder(this, this.getQueryGrammar(), this.getPostProcessor());
    }
    /**
     * Reconnect to the database.
     *
     * @return {void}
     *
     * @throws \LogicException
     */
    reconnect() {
        if ((0, utils_1.isFunction)(this.reconnector)) {
            return this.reconnector(this);
        }
        throw new Error('LogicException: Lost connection and no reconnector available.');
    }
    /**
     * Reconnect to the database if a PDO connection is missing.
     *
     * @return {void}
     */
    reconnectIfMissingConnection() {
        if (this.ndo !== undefined) {
            this.reconnect();
        }
    }
    /**
     * Indicate if any records have been modified.
     *
     * @param  {boolean}  [value=true]
     * @return {void}
     */
    recordsHaveBeenModified(value = true) {
        if (!this.recordsModified) {
            this.recordsModified = value;
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
    async run(query, bindings, callback) {
        this.reconnectIfMissingConnection();
        const start = Date.now();
        let result;
        // Here we will run this query. If an exception occurs we'll determine if it was
        // caused by a connection that has been lost. If that is the cause, we'll try
        // to re-establish connection and re-run the query with a fresh connection.
        try {
            result = await this.runQueryCallback(query, bindings, callback);
        }
        catch (error) {
            result = this.handleQueryException(error, query, bindings, callback);
        }
        // Once we have run the query we will calculate the time that it took to run and
        // then log the query, bindings, and execution time so we will report them on
        // the event that the developer needs them. We'll log time in milliseconds.
        this.logQuery(query, bindings, this.getElapsedTime(start));
        return result;
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
    async runQueryCallback(query, bindings, callback) {
        // To execute the statement, we'll simply call the callback, which will actually
        // run the SQL against the PDO connection. Then we can calculate the time it
        // took to execute and log the query SQL, bindings and time in our memory.
        try {
            const result = await callback(query, bindings);
            return result;
        }
        catch (error) {
            // If an exception occurs when attempting to run a query, we'll format the error
            // message to include the bindings with SQL, which will make this exception a
            // lot more helpful to the developer instead of just the database's errors.
            throw new Error(`QueryException: ${query} - ${JSON.stringify(this.prepareBindings(bindings))}`);
        }
    }
    /**
     * Run a select statement against the database.
     *
     * @param  {string}  query
     * @param  {object}  [bindings]
     * @return {object}
     */
    async select(query, bindings) {
        return await this.run(query, bindings, async (query, bindings) => {
            if (this.pretending()) {
                return [];
            }
            // For select statements, we'll simply execute the query and return an array
            // of the database result set. Each element in the array will be a single
            // row from the database table, and will either be an array or objects.
            const statement = this.prepared(
            // this.connection, query
            this.getNdoForSelect().prepare(query));
            this.bindValues(statement, this.prepareBindings(bindings));
            await statement.execute();
            return statement.fetchAll();
        });
    }
    /**
     * Set the event dispatcher instance on the connection.
     *
     * @param  {\Illuminate\Contracts\Events\Dispatcher}  events
     * @return {this}
     */
    setEventDispatcher(events) {
        this.events = events;
        return this;
    }
    /**
     * Set the PDO connection.
     *
     * @param  {object|Function}  ndo
     * @return {this}
     */
    setNdo(ndo) {
        this.transactions = 0;
        this.ndo = ndo;
        return this;
    }
    /**
     * Set the reconnect instance on the connection.
     *
     * @param  {callable}  reconnector
     * @return {this}
     */
    setReconnector(reconnector) {
        this.reconnector = reconnector;
        return this;
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
    tryAgainIfCausedByLostConnection(error, query, bindings, callback) {
        if (this.causedByLostConnection(error)) {
            this.reconnect();
            return this.runQueryCallback(query, bindings, callback);
        }
        throw error;
    }
    /**
     * Set the query post processor to the default implementation.
     *
     * @return {void}
     */
    useDefaultPostProcessor() {
        this.postProcessor = this.getDefaultPostProcessor();
    }
    /**
   * Set the query grammar to the default implementation.
   *
   * @return {void}
   */
    useDefaultQueryGrammar() {
        this.queryGrammar = this.getDefaultQueryGrammar();
    }
    /**
     * Set the table prefix and return the grammar.
     *
     * @param  {\Illuminate\Database\Grammar}  grammar
     * @return {\Illuminate\Database\Grammar}
     */
    withTablePrefix(grammar) {
        grammar.setTablePrefix(this.tablePrefix);
        return grammar;
    }
}
exports.Connection = Connection;
/**
 * The connection resolvers.
 *
 * @var Record<string, unknown>
 */
Connection.resolvers = {};
//# sourceMappingURL=Connection.js.map