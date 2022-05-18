/// <reference types="node" />
interface ParsedUrl {
    hash: string;
    host: string;
    hostname: string;
    href: string;
    origin: string;
    password: string;
    pathname: string;
    port: string;
    protocol: string;
    search: string;
    searchParams: URLSearchParams;
    username: string;
}
export declare class ConfigurationUrlParser {
    /**
     * The drivers aliases map.
     *
     * @member {object}
     */
    protected static driverAliases: Record<string, string>;
    /**
     * Parse the database configuration, hydrating options using a database configuration URL if possible.
     *
     * @param  {object|string}  config
     * @return {object}
     */
    parseConfiguration(config: Record<string, any> | string): Record<string, any>;
    /**
     * Get the database name from the URL.
     *
     * @param  {object}  url
     * @return {string|undefined}
     */
    protected getDatabase(url: ParsedUrl): string | undefined;
    /**
     * Get the database driver from the URL.
     *
     * @param  {object}  url
     * @return {string|undefined}
     */
    protected getDriver(url: ParsedUrl): string | undefined;
    /**
     * Get the primary database connection options.
     *
     * @param  {URL}  url
     * @return {object}
     */
    protected getPrimaryOptions(url: ParsedUrl): object;
    /**
     * Get all of the additional database options from the query string.
     *
     * @param  {object}  url
     * @return {object}
     */
    protected getQueryOptions(url: ParsedUrl): object;
    /**
     * Convert string casted values to their native types.
     *
     * @param  {any}  value
     * @return {object}
     */
    protected parseStringsToNativeTypes(value: any): any;
    /**
     * Parse the string URL to an array of components.
     *
     * @param  {string}  url
     * @return {object}
     *
     * @throws {\InvalidArgumentException}
     */
    protected parseUrl(url: string): ParsedUrl;
}
export {};
