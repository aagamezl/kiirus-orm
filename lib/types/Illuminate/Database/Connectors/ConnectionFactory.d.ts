import { Connection } from '../Connection';
import { Connector } from './Connector';
export declare class ConnectionFactory {
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
    protected createConnection(driver: string, connection: object | Function, database: string, prefix?: string, config?: Record<string, unknown>): Connection;
    /**
     * Create a connector instance based on the configuration.
     *
     * @param  {object}  config
     * @return {\Illuminate\Database\Connectors\Connector}
     *
     * @throws \InvalidArgumentException
     */
    createConnector(config: Record<string, string>): Connector;
    /**
     * Create a new Closure that resolves to a NDO instance.
     *
     * @param  {object}  config
     * @return {Function}
     */
    protected createResolver(config: Record<string, string>): Function;
    /**
     * Create a new Closure that resolves to a PDO instance with a specific host or an array of hosts.
     *
     * @param  {Record<string, string>}  config
     * @return {Function}
     *
     * @throws NDOException
     */
    protected createResolverWithHosts(config: Record<string, string>): Function;
    /**
     * Create a new Closure that resolves to a PDO instance where there is no configured host.
     *
     * @param  {object}  config
     * @return {Function}
     */
    protected createResolverWithoutHosts(config: Record<string, string>): Function;
    /**
     * Create a single database connection instance.
     *
     * @param  {object}  config
     * @return {\Illuminate\Database\Connection}
     */
    protected createSingleConnection(config: Record<string, string>): Connection;
    /**
     * Establish a PDO connection based on the configuration.
     *
     * @param  {object}  config
     * @param  {string|undefined}  [name=undefined]
     * @return {\Illuminate\Database\Connection}
     */
    make(config: Record<string, string>, name?: string): Connection;
    /**
     * Parse and prepare the database configuration.
     *
     * @param  {Record<string, string>}  config
     * @param  {string}  name
     * @return {Record<string, string>}
     */
    protected parseConfig(config: Record<string, string>, name: string): Record<string, string>;
    /**
     * Parse the hosts configuration item into an array.
     *
     * @param  {object}  config
     * @return {array}
     *
     * @throws \InvalidArgumentException
     */
    protected parseHosts(config: Record<string, string>): string[];
}
