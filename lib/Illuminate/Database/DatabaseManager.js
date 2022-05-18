"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseManager = void 0;
const utils_1 = require("@devnetic/utils");
const ConfigurationUrlParser_1 = require("./../Support/ConfigurationUrlParser");
const Macroable_1 = require("../Macroable/Traits/Macroable");
const Str_1 = require("../Support/Str");
const InstanceProxy_1 = require("../Support/Proxies/InstanceProxy");
const use_1 = require("../Support/Traits/use");
/**
 * @mixin {\Illuminate\Database\Connection}
 */
class DatabaseManager {
    /**
     * Create a new database manager instance.
     *
     * @param  {\Illuminate\Contracts\Foundation\Application}  app
     * @param  {\Illuminate\Database\Connectors\ConnectionFactory}  factory
     * @return {void}
     */
    constructor(app, factory) {
        /**
         * The active connection instances.
         *
         * @member {Record<string, unknown>}
         */
        this.connections = {};
        /**
         * The custom connection resolvers.
         *
         * @var array
         */
        this.extensions = {};
        // use(this.constructor, [{ trait: Macroable, as: { __call: 'macroCall' } }])
        (0, use_1.use)(this.constructor, [[Macroable_1.Macroable, { __call: 'macroCall' }]]);
        this.app = app;
        this.factory = factory;
        this.reconnector = (connection) => {
            this.reconnect(connection.getName());
        };
        return (0, InstanceProxy_1.instanceProxy)(this);
    }
    /**
     * Dynamically pass methods to the default connection.
     *
     * @param  {string}  method
     * @param  {Array}  parameters
     * @return {*}
     */
    __call(method, ...parameters) {
        return this.connection()[method](...parameters);
    }
    /**
     * Get the configuration for a connection.
     *
     * @param  {string}  name
     * @return {Array}
     *
     * @throws {\InvalidArgumentException}
     */
    configuration(name) {
        name = name ?? this.getDefaultConnection();
        // To get the database connection configuration, we will just pull each of the
        // connection configurations and get the configurations for the given name.
        // If the configuration doesn't exist, we'll throw an exception and bail.
        const connections = this.app.config.get('database.connections');
        const config = (0, utils_1.getValue)(connections, name);
        if ((0, utils_1.isNil)(config)) {
            throw new Error(`InvalidArgumentException: Database connection [${name}] not configured.`);
        }
        return (new ConfigurationUrlParser_1.ConfigurationUrlParser()).parseConfiguration(config);
    }
    /**
     * Prepare the database connection instance.
     *
     * @param  {\Illuminate\Database\Connection}  connection
     * @param  {string}  type
     * @return {\Illuminate\Database\Connection}
     */
    configure(connection, type) {
        connection = this.setNdo(connection);
        // First we'll set the fetch mode and a few other dependencies of the database
        // connection. This method basically just configures and prepares it to get
        // used by the application. Once we're finished we'll return it back out.
        if (this.app.bound('events')) {
            connection.setEventDispatcher(this.app.events);
        }
        // if (this.app.bound('db.transactions')) {
        //   connection.setTransactionManager(this.app['db.transactions'])
        // }
        // Here we'll set a reconnector callback. This reconnector can be any callable
        // so we will set a Closure to reconnect from this manager with the name of
        // the connection, which will allow us to reconnect from the connections.
        connection.setReconnector(this.reconnector);
        return connection;
    }
    /**
     * Get a database connection instance.
     *
     * @param  {string}  [name]
     * @return {\Illuminate\Database\Connection}
     */
    connection(name) {
        const { database, type } = this.parseConnectionName(name);
        name = (name ?? database);
        // If we haven't created this connection, we'll create it based on the config
        // provided in the application. Once we've created the connections we will
        // set the "fetch mode" for PDO which determines the query return types.
        if (this.connections[name] === undefined) {
            this.connections[name] = this.configure(this.makeConnection(database), type);
        }
        return this.connections[name];
    }
    /**
     * Disconnect from the given database.
     *
     * @param  {string}  [name]
     * @return {void}
     */
    disconnect(name) {
        name = name ?? this.getDefaultConnection();
        if ((0, utils_1.isTruthy)(this.connections[name])) {
            this.connections[name].disconnect();
        }
    }
    /**
     * Get the default connection name.
     *
     * @return {string}
     */
    getDefaultConnection() {
        return this.app.config.get('database.default');
    }
    /**
     * Make the database connection instance.
     *
     * @param  {string}  name
     * @return {\Illuminate\Database\Connection}
     */
    makeConnection(name) {
        const config = this.configuration(name);
        // First we will check by the connection name to see if an extension has been
        // registered specifically for that connection. If it has we will call the
        // Closure and pass it the config allowing it to resolve the connection.
        if (this.extensions[name] !== undefined) {
            return this.extensions[name](config, name);
        }
        // Next we will check to see if an extension has been registered for a driver
        // and will call the Closure if so, which allows us to have a more generic
        // resolver for the drivers themselves which applies to all connections.
        const driver = config.driver;
        if (this.extensions[driver] !== undefined) {
            return this.extensions.driver(config, name);
        }
        return this.factory.make(config, name);
    }
    /**
     * Parse the connection into an array of the name and read / write type.
     *
     * @param  {string}  name
     * @return {Array}
     */
    parseConnectionName(name) {
        name = name ?? this.getDefaultConnection();
        const [database, type] = Str_1.Str.endsWith(name, ['::read', '::write'])
            ? name.split('::', 2)
            : [name, undefined];
        return { database, type };
    }
    /**
     * Reconnect to the given database.
     *
     * @param  {string|undefined}  name
     * @return {\Illuminate\Database\Connection}
     */
    reconnect(name) {
        name = name ?? this.getDefaultConnection();
        this.disconnect(name);
        if ((0, utils_1.isNil)(this.connections[name])) {
            return this.connection(name);
        }
        return this.refreshNdoConnections(name);
    }
    /**
     * Refresh the PDO connections on a given connection.
     *
     * @param  {string}  name
     * @return {\Illuminate\Database\Connection}
     */
    refreshNdoConnections(name) {
        const [database, type] = this.parseConnectionName(name);
        const fresh = this.configure(this.makeConnection(database), type);
        return this.connections[name]
            .setNdo(fresh.getRawPdo());
    }
    /**
   * Prepare the read / write mode for database connection instance.
   *
   * @param  {\Illuminate\Database\Connection}  connection
   * @return {\Illuminate\Database\Connection}
   */
    setNdo(connection) {
        connection.setNdo(connection.getNdo());
        return connection;
    }
}
exports.DatabaseManager = DatabaseManager;
//# sourceMappingURL=DatabaseManager.js.map