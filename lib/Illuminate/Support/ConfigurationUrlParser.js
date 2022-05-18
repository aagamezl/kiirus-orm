"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigurationUrlParser = void 0;
const utils_1 = require("@devnetic/utils");
const helpers_1 = require("./helpers");
class ConfigurationUrlParser {
    /**
     * Parse the database configuration, hydrating options using a database configuration URL if possible.
     *
     * @param  {object|string}  config
     * @return {object}
     */
    parseConfiguration(config) {
        if ((0, utils_1.isString)(config)) {
            config = { url: config };
        }
        const url = (0, helpers_1.pull)(config, 'url');
        if ((0, utils_1.isNil)(url)) {
            return config;
        }
        const rawComponents = this.parseUrl(url);
        const decodedComponents = this.parseStringsToNativeTypes(Object.values(rawComponents).reduce((components, value) => {
            components[value] = decodeURI(value);
            return components;
        }, {}));
        return {
            ...config,
            ...this.getPrimaryOptions(decodedComponents),
            ...this.getQueryOptions(rawComponents)
        };
    }
    /**
     * Get the database name from the URL.
     *
     * @param  {object}  url
     * @return {string|undefined}
     */
    getDatabase(url) {
        const path = url.pathname ?? undefined;
        return path !== '/' ? path.substring(1) : undefined;
    }
    /**
     * Get the database driver from the URL.
     *
     * @param  {object}  url
     * @return {string|undefined}
     */
    getDriver(url) {
        const alias = url.protocol ?? undefined;
        if ((0, utils_1.isNil)(alias)) {
            return;
        }
        return ConfigurationUrlParser.driverAliases[alias] ?? alias;
    }
    /**
     * Get the primary database connection options.
     *
     * @param  {URL}  url
     * @return {object}
     */
    getPrimaryOptions(url) {
        return Object.entries({
            driver: this.getDriver(url),
            database: this.getDatabase(url),
            host: url.host ?? undefined,
            port: url.port ?? undefined,
            username: url.username ?? undefined,
            password: url.password ?? undefined
        }).filter(([, value]) => {
            return !(0, utils_1.isNil)(value);
        });
    }
    /**
     * Get all of the additional database options from the query string.
     *
     * @param  {object}  url
     * @return {object}
     */
    getQueryOptions(url) {
        const queryString = url.searchParams ?? undefined;
        if ((0, utils_1.isNil)(queryString)) {
            return {};
        }
        const query = Object.fromEntries(queryString.entries());
        return this.parseStringsToNativeTypes(query);
    }
    /**
     * Convert string casted values to their native types.
     *
     * @param  {any}  value
     * @return {object}
     */
    parseStringsToNativeTypes(value) {
        // if (Array.isArray(value)) {
        //   return value.map(this.parseStringsToNativeTypes)
        // }
        if (!(0, utils_1.isString)(value)) {
            return value;
        }
        try {
            return JSON.parse(value);
        }
        catch (error) {
            return value;
        }
    }
    /**
     * Parse the string URL to an array of components.
     *
     * @param  {string}  url
     * @return {object}
     *
     * @throws {\InvalidArgumentException}
     */
    parseUrl(url) {
        url = url.replace(/#^(sqlite3?):\/\/\/#/gm, '1://null/');
        const properties = [
            'hash',
            'host',
            'hostname',
            'href',
            'origin',
            'password',
            'pathname',
            'port',
            'protocol',
            'search',
            'searchParams',
            'username'
        ];
        try {
            const parsedUrl = new URL(url);
            return properties.reduce((components, property) => {
                components[property] = parsedUrl[property];
                return components;
            }, {});
            // return new URL(url)
        }
        catch (error) {
            throw new Error('InvalidArgumentException: The database configuration URL is malformed.');
        }
    }
}
exports.ConfigurationUrlParser = ConfigurationUrlParser;
/**
 * The drivers aliases map.
 *
 * @member {object}
 */
ConfigurationUrlParser.driverAliases = {
    mssql: 'sqlsrv',
    mysql2: 'mysql',
    postgres: 'pgsql',
    postgresql: 'pgsql',
    sqlite3: 'sqlite',
    redis: 'tcp',
    rediss: 'tls'
};
//# sourceMappingURL=ConfigurationUrlParser.js.map