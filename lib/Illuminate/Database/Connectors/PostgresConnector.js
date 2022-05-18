"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostgresConnector = void 0;
const Connector_1 = require("./Connector");
const Statements_1 = require("./../Statements");
const DEFAULT_PORT = 5432;
class PostgresConnector extends Connector_1.Connector {
    /**
     * Add the SSL options to the DSN.
     *
     * @param  {string}  dsn
     * @param  {Record<string, unknown>}  config
     * @return {string}
     */
    addSslOptions(dsn, config) {
        for (const option of ['sslmode', 'sslcert', 'sslkey', 'sslrootcert']) {
            if (config[option] !== undefined) {
                dsn += `;${option}=${config[option]}`;
            }
        }
        return dsn;
    }
    /**
     * Set the schema on the connection.
     *
     * @param  {Statement}  connection
     * @param  {object}  config
     * @return {void}
     */
    async configureApplicationName(connection, config) {
        if (config.application_name !== undefined) {
            await connection.prepare(`set application_name to '${config.application_name}'`).execute();
        }
    }
    /**
     * Set the connection character set and collation.
     *
     * @param  {Statement}  connection
     * @param  {object}  config
     * @return {void}
     */
    async configureEncoding(connection, config) {
        if (config.charset === undefined) {
            return;
        }
        await connection.prepare(`set names '${config.charset}'`).execute();
    }
    /**
     * Set the schema on the connection.
     *
     * @param  {Statement}  connection
     * @param  {object}  config
     * @return {void}
     */
    async configureSchema(connection, config) {
        if (config.schema !== undefined) {
            const schema = this.formatSchema(config.schema);
            await connection.prepare(`set search_path to ${schema}`).execute();
        }
    }
    /**
     * Configure the synchronous_commit setting.
     *
     * @param  {Statement}  connection
     * @param  {object}  config
     * @return {void}
     */
    async configureSynchronousCommit(connection, config) {
        if (config.synchronous_commit !== undefined) {
            await connection.prepare(`set synchronous_commit to '${config.synchronous_commit}'`).execute();
        }
    }
    /**
     * Set the timezone on the connection.
     *
     * @param  {Statement}  connection
     * @param  {object}  config
     * @return {void}
     */
    async configureTimezone(connection, config) {
        if (config.timezone !== undefined) {
            await connection.prepare(`set time zone '${config.timezone}'`).execute();
        }
    }
    /**
     * Establish a database connection.
     *
     * @param  {Record<string, string>}  config
     * @return {Promise<Statement>}
     */
    async connect(config) {
        // First we'll create the basic DSN and connection instance connecting to the
        // using the configuration option specified by the developer. We will also
        // set the default character set on the connections to UTF-8 by default.
        const connection = this.createConnection(this.getDsn(config), config, this.getOptions(config));
        await this.configureEncoding(connection, config);
        // Next, we will check to see if a timezone has been specified in this config
        // and if it has we will issue a statement to modify the timezone with the
        // database. Setting this DB timezone is an optional configuration item.
        await this.configureTimezone(connection, config);
        await this.configureSchema(connection, config);
        // Postgres allows an application_name to be set by the user and this name is
        // used to when monitoring the application with pg_stat_activity. So we'll
        // determine if the option has been specified and run a statement if so.
        await this.configureApplicationName(connection, config);
        await this.configureSynchronousCommit(connection, config);
        return connection;
    }
    /**
     * Create a new PDO connection instance.
     *
     * @param  {string}  dsn
     * @param  {string}  username
     * @param  {string}  password
     * @param  {object}  options
     * @return {Statement}
     */
    createNdoConnection(dsn, username, password, options) {
        return new Statements_1.PostgresStatement(dsn, username, password, options);
    }
    /**
     * Format the schema for the DSN.
     *
     * @param  {Array|string}  schema
     * @return {string}
     */
    formatSchema(schema) {
        if (Array.isArray(schema)) {
            return '"' + schema.join('", "') + '"';
        }
        return '"' + schema + '"';
    }
    /**
     * Create a DSN string from a configuration.
     *
     * @param  {object}  config
     * @return {string}
     */
    getDsn(config) {
        // First we will create the basic DSN setup as well as the port if it is in
        // in the configuration options. This will give us the basic DSN we will
        // need to establish the PDO connections and return them back for use.
        const { database, username, password, host, port } = config;
        const dsn = `postgresql://${username}:${password}@${host}:${port ?? DEFAULT_PORT}/${database}`;
        return this.addSslOptions(dsn, config);
    }
}
exports.PostgresConnector = PostgresConnector;
//# sourceMappingURL=PostgresConnector.js.map