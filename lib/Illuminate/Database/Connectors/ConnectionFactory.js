"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectionFactory = void 0;
const utils_1 = require("@devnetic/utils");
const Arr_1 = require("../../Collections/Arr");
const Connection_1 = require("../Connection");
const MySqlConnection_1 = require("./../MySqlConnection");
const MySqlConnector_1 = require("./MySqlConnector");
const PostgresConnection_1 = require("./../PostgresConnection");
const PostgresConnector_1 = require("./PostgresConnector");
const SQLiteConnection_1 = require("./../SQLiteConnection");
const SQLiteConnector_1 = require("./SQLiteConnector");
const SqlServerConnection_1 = require("./../SqlServerConnection");
const SqlServerConnector_1 = require("./SqlServerConnector");
const Support_1 = require("../../Support");
class ConnectionFactory {
    /**
     * Create a new connection instance.
     *
     * @param  {string}  driver
     * @param  {object|Function}  connection
     * @param  {string}  database
     * @param  {string}  [prefix='']
     * @param  {object}  [config={}]
     * @return {\Illuminate\Database\Connection}
     *
     * @throws \InvalidArgumentException
     */
    createConnection(driver, connection, database, prefix = '', config = {}) {
        const resolver = Connection_1.Connection.getResolver(driver);
        if ((0, Support_1.isTruthy)(resolver)) {
            return resolver(connection, database, prefix, config);
        }
        switch (driver) {
            case 'mysql':
                return new MySqlConnection_1.MySqlConnection(connection, database, prefix, config);
            case 'pgsql':
                return new PostgresConnection_1.PostgresConnection(connection, database, prefix, config);
            case 'sqlite':
                return new SQLiteConnection_1.SQLiteConnection(connection, database, prefix, config);
            case 'sqlsrv':
                return new SqlServerConnection_1.SqlServerConnection(connection, database, prefix, config);
        }
        throw new Error(`InvalidArgumentException: Unsupported driver [${driver}].`);
    }
    /**
     * Create a connector instance based on the configuration.
     *
     * @param  {object}  config
     * @return {\Illuminate\Database\Connectors\Connector}
     *
     * @throws \InvalidArgumentException
     */
    createConnector(config) {
        if ((0, utils_1.isNil)(config.driver)) {
            throw new Error('InvalidArgumentException: A driver must be specified.');
        }
        switch (config.driver) {
            case 'mysql':
                return new MySqlConnector_1.MySqlConnector();
            case 'pgsql':
                return new PostgresConnector_1.PostgresConnector();
            case 'sqlite':
                return new SQLiteConnector_1.SQLiteConnector();
            case 'sqlsrv':
                return new SqlServerConnector_1.SqlServerConnector();
        }
        throw new Error(`InvalidArgumentException: Unsupported driver [${config.driver}].`);
    }
    /**
     * Create a new Closure that resolves to a NDO instance.
     *
     * @param  {object}  config
     * @return {Function}
     */
    createResolver(config) {
        return config.host !== undefined
            ? this.createResolverWithHosts(config)
            : this.createResolverWithoutHosts(config);
    }
    /**
     * Create a new Closure that resolves to a PDO instance with a specific host or an array of hosts.
     *
     * @param  {Record<string, string>}  config
     * @return {Function}
     *
     * @throws NDOException
     */
    createResolverWithHosts(config) {
        return async () => {
            const hosts = this.parseHosts(config);
            for (const host of Arr_1.Arr.shuffle(hosts)) {
                config.host = host;
                try {
                    return await this.createConnector(config).connect(config);
                }
                catch (error) {
                    continue;
                }
            }
            throw new Error('NDOException: Unable to create resolver with hosts.');
        };
    }
    /**
     * Create a new Closure that resolves to a PDO instance where there is no configured host.
     *
     * @param  {object}  config
     * @return {Function}
     */
    createResolverWithoutHosts(config) {
        return async () => {
            return await this.createConnector(config).connect(config);
        };
    }
    /**
     * Create a single database connection instance.
     *
     * @param  {object}  config
     * @return {\Illuminate\Database\Connection}
     */
    createSingleConnection(config) {
        const resolver = this.createResolver(config);
        return this.createConnection(config.driver, resolver, config.database, config.prefix, config);
    }
    /**
     * Establish a PDO connection based on the configuration.
     *
     * @param  {object}  config
     * @param  {string|undefined}  [name=undefined]
     * @return {\Illuminate\Database\Connection}
     */
    make(config, name = '') {
        config = this.parseConfig(config, name);
        return this.createSingleConnection(config);
    }
    /**
     * Parse and prepare the database configuration.
     *
     * @param  {Record<string, string>}  config
     * @param  {string}  name
     * @return {Record<string, string>}
     */
    parseConfig(config, name) {
        return (0, utils_1.setValue)((0, utils_1.setValue)(config, 'prefix', ''), 'name', name);
    }
    /**
     * Parse the hosts configuration item into an array.
     *
     * @param  {object}  config
     * @return {array}
     *
     * @throws \InvalidArgumentException
     */
    parseHosts(config) {
        const hosts = Arr_1.Arr.wrap(config.host);
        if (hosts.length === 0) {
            throw new Error('InvalidArgumentException: Database hosts array is empty.');
        }
        return hosts;
    }
}
exports.ConnectionFactory = ConnectionFactory;
//# sourceMappingURL=ConnectionFactory.js.map