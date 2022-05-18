export declare class Repository {
    protected configFile: string;
    /**
     * All of the configuration items.
     *
     * @var Record<string, unknown>
     */
    protected items: Record<string, unknown>;
    /**
     * Create a new configuration repository.
     *
     * @param  {Array}  items
     * @return {void}
     */
    constructor(items?: Record<string, unknown>);
    /**
     * Get the specified configuration value.
     *
     * @param  {Array|string}  key
     * @param  {*}  defaultValue
     * @return {*}
     */
    get(key: string, defaultValue?: unknown): any;
    /**
     * Get many configuration values.
     *
     * @param  {Array}  keys
     * @return {Array}
     */
    getMany(keys: any[]): Record<string, any>;
}
