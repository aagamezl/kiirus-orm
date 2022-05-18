import { Connector } from './Connector';
import { Statement } from './../Statements';
export declare class PostgresConnector extends Connector {
    /**
     * Add the SSL options to the DSN.
     *
     * @param  {string}  dsn
     * @param  {Record<string, unknown>}  config
     * @return {string}
     */
    protected addSslOptions(dsn: string, config: Record<string, string>): string;
    /**
     * Set the schema on the connection.
     *
     * @param  {Statement}  connection
     * @param  {object}  config
     * @return {void}
     */
    protected configureApplicationName(connection: Statement, config: Record<string, string>): Promise<void>;
    /**
     * Set the connection character set and collation.
     *
     * @param  {Statement}  connection
     * @param  {object}  config
     * @return {void}
     */
    protected configureEncoding(connection: Statement, config: Record<string, string>): Promise<void>;
    /**
     * Set the schema on the connection.
     *
     * @param  {Statement}  connection
     * @param  {object}  config
     * @return {void}
     */
    protected configureSchema(connection: Statement, config: Record<string, string>): Promise<void>;
    /**
     * Configure the synchronous_commit setting.
     *
     * @param  {Statement}  connection
     * @param  {object}  config
     * @return {void}
     */
    protected configureSynchronousCommit(connection: Statement, config: Record<string, string>): Promise<void>;
    /**
     * Set the timezone on the connection.
     *
     * @param  {Statement}  connection
     * @param  {object}  config
     * @return {void}
     */
    protected configureTimezone(connection: Statement, config: Record<string, string>): Promise<void>;
    /**
     * Establish a database connection.
     *
     * @param  {Record<string, string>}  config
     * @return {Promise<Statement>}
     */
    connect(config: Record<string, string>): Promise<Statement>;
    /**
     * Create a new PDO connection instance.
     *
     * @param  {string}  dsn
     * @param  {string}  username
     * @param  {string}  password
     * @param  {object}  options
     * @return {Statement}
     */
    protected createNdoConnection(dsn: string, username: string, password: string, options: Record<string, unknown>): Statement;
    /**
     * Format the schema for the DSN.
     *
     * @param  {Array|string}  schema
     * @return {string}
     */
    formatSchema(schema: string | string[]): string;
    /**
     * Create a DSN string from a configuration.
     *
     * @param  {object}  config
     * @return {string}
     */
    getDsn(config: Record<string, string>): string;
}
