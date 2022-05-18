import { DetectsLostConnections } from '../DetectsLostConnections';
import { Statement } from '../Statements/Statement';
export interface Connector extends DetectsLostConnections {
}
export declare class Connector {
    /**
     * The default PDO connection options.
     *
     * @var Record<string, unknown>
     */
    protected options: Record<string, unknown>;
    constructor();
    /**
     * Establish a database connection.
     *
     * @param  {object}  config
     * @return {Statement}
     */
    connect(config: Record<string, string>): Promise<Statement>;
    /**
     * Create a new PDO connection.
     *
     * @param  {string}  dsn
     * @param  {object}  config
     * @param  {Record<string, string>}  options
     * @return {Statement}
     *
     * @throws \Exception
     */
    createConnection(dsn: string, config: Record<string, string>, options: Record<string, string>): Statement;
    /**
   * Create a new PDO connection instance.
   *
   * @param  {string}  dsn
   * @param  {string}  username
   * @param  {string}  password
   * @param  {object}  options
   * @return {Record<string, unknown>}
   */
    protected createNdoConnection(dsn: string, username: string, password: string, options: Record<string, unknown>): Statement;
    /**
     * Get the PDO options based on the configuration.
     *
     * @param  {object}  config
     * @return {array}
     */
    getOptions(config: Record<string, any>): Record<string, string>;
    /**
     * Handle an exception that occurred during connect execution.
     *
     * @param  {Error}   error
     * @param  {string}  dsn
     * @param  {string}  username
     * @param  {string}  password
     * @param  {Record<string, unknown>}  options
     * @return {Statement}
     *
     * @throws \Exception
     */
    protected tryAgainIfCausedByLostConnection(error: Error, dsn: string, username: string, password: string, options: Record<string, unknown>): Statement;
}
