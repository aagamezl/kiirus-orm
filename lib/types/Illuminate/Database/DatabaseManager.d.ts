import { Application } from '../Foundation/Application';
import { Connection } from './Connection';
import { ConnectionFactory } from './Connectors/ConnectionFactory';
import { Macroable } from '../Macroable/Traits/Macroable';
export interface DatabaseManager extends Macroable {
}
/**
 * @mixin {\Illuminate\Database\Connection}
 */
export declare class DatabaseManager {
    /**
     * The application instance.
     *
     * @var \Illuminate\Contracts\Foundation\Application
     */
    protected app: Application;
    /**
     * The active connection instances.
     *
     * @member {Record<string, unknown>}
     */
    protected connections: Record<string, Connection>;
    /**
     * The custom connection resolvers.
     *
     * @var array
     */
    protected extensions: Record<string, Function>;
    /**
     * The database connection factory instance.
     *
     * @var \Illuminate\Database\Connectors\ConnectionFactory
     */
    protected factory: ConnectionFactory;
    /**
     * The callback to be executed to reconnect to a database.
     *
     * @var callable
     */
    protected reconnector: Function;
    /**
     * Create a new database manager instance.
     *
     * @param  {\Illuminate\Contracts\Foundation\Application}  app
     * @param  {\Illuminate\Database\Connectors\ConnectionFactory}  factory
     * @return {void}
     */
    constructor(app: Application, factory: ConnectionFactory);
    /**
     * Dynamically pass methods to the default connection.
     *
     * @param  {string}  method
     * @param  {Array}  parameters
     * @return {*}
     */
    __call(method: string, ...parameters: any[]): any;
    /**
     * Get the configuration for a connection.
     *
     * @param  {string}  name
     * @return {Array}
     *
     * @throws {\InvalidArgumentException}
     */
    protected configuration(name: string): Record<string, string>;
    /**
     * Prepare the database connection instance.
     *
     * @param  {\Illuminate\Database\Connection}  connection
     * @param  {string}  type
     * @return {\Illuminate\Database\Connection}
     */
    protected configure(connection: Connection, type: string): Connection;
    /**
     * Get a database connection instance.
     *
     * @param  {string}  [name]
     * @return {\Illuminate\Database\Connection}
     */
    connection(name?: string): Connection;
    /**
     * Disconnect from the given database.
     *
     * @param  {string}  [name]
     * @return {void}
     */
    disconnect(name?: string): void;
    /**
     * Get the default connection name.
     *
     * @return {string}
     */
    getDefaultConnection(): string;
    /**
     * Make the database connection instance.
     *
     * @param  {string}  name
     * @return {\Illuminate\Database\Connection}
     */
    protected makeConnection(name: string): Connection;
    /**
     * Parse the connection into an array of the name and read / write type.
     *
     * @param  {string}  name
     * @return {Array}
     */
    protected parseConnectionName(name?: string): any;
    /**
     * Reconnect to the given database.
     *
     * @param  {string|undefined}  name
     * @return {\Illuminate\Database\Connection}
     */
    reconnect(name?: string): Connection;
    /**
     * Refresh the PDO connections on a given connection.
     *
     * @param  {string}  name
     * @return {\Illuminate\Database\Connection}
     */
    protected refreshNdoConnections(name: string): Connection;
    /**
   * Prepare the read / write mode for database connection instance.
   *
   * @param  {\Illuminate\Database\Connection}  connection
   * @return {\Illuminate\Database\Connection}
   */
    protected setNdo(connection: Connection): Connection;
}
