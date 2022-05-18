"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Connector = void 0;
const DetectsLostConnections_1 = require("../DetectsLostConnections");
const Support_1 = require("./../../Support");
const use_1 = require("../../Support/Traits/use");
class Connector {
    constructor() {
        /**
         * The default PDO connection options.
         *
         * @var Record<string, unknown>
         */
        this.options = {};
        (0, use_1.use)(this.constructor, [DetectsLostConnections_1.DetectsLostConnections]);
    }
    /**
     * Establish a database connection.
     *
     * @param  {object}  config
     * @return {Statement}
     */
    async connect(config) {
        throw new Error('RuntimeException: Implement connect method on concrete class.');
    }
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
    createConnection(dsn, config, options) {
        const [username, password] = [
            config.username ?? undefined, config.password ?? undefined
        ];
        try {
            return this.createNdoConnection(dsn, username, password, options);
        }
        catch (error) {
            return this.tryAgainIfCausedByLostConnection(error, dsn, username, password, options);
        }
    }
    /**
   * Create a new PDO connection instance.
   *
   * @param  {string}  dsn
   * @param  {string}  username
   * @param  {string}  password
   * @param  {object}  options
   * @return {Record<string, unknown>}
   */
    createNdoConnection(dsn, username, password, options) {
        throw new Error('RuntimeException: Implement createNdoConnection method on concrete class.');
    }
    /**
     * Get the PDO options based on the configuration.
     *
     * @param  {object}  config
     * @return {array}
     */
    getOptions(config) {
        const options = config.options ?? {};
        return { ...(0, Support_1.objectDiffKey)(this.options, options), ...options };
    }
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
    tryAgainIfCausedByLostConnection(error, dsn, username, password, options) {
        if (this.causedByLostConnection(error)) {
            return this.createNdoConnection(dsn, username, password, options);
        }
        throw error;
    }
}
exports.Connector = Connector;
//# sourceMappingURL=Connector.js.map