"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Repository = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
const utils_1 = require("@devnetic/utils");
const Arr_1 = require("../Collections/Arr");
class Repository {
    /**
     * Create a new configuration repository.
     *
     * @param  {Array}  items
     * @return {void}
     */
    constructor(items = {}) {
        /**
         * All of the configuration items.
         *
         * @var Record<string, unknown>
         */
        this.items = {};
        this.configFile = 'config.json';
        try {
            const path = (0, path_1.join)(process.cwd(), this.configFile);
            const config = JSON.parse((0, fs_1.readFileSync)(path, { encoding: 'utf8' }));
            this.items = { ...config, ...items };
        }
        catch (error) {
            throw new Error(`Could not load ${this.configFile}`);
        }
    }
    /**
     * Get the specified configuration value.
     *
     * @param  {Array|string}  key
     * @param  {*}  defaultValue
     * @return {*}
     */
    get(key, defaultValue = undefined) {
        if (Array.isArray(key)) {
            return this.getMany(key);
        }
        return (0, utils_1.getValue)(this.items, key, defaultValue);
    }
    /**
     * Get many configuration values.
     *
     * @param  {Array}  keys
     * @return {Array}
     */
    getMany(keys) {
        const config = {};
        for (let [key, defaultValue] of keys) {
            if ((0, utils_1.isNumeric)(key)) {
                [key, defaultValue] = [defaultValue, null];
            }
            config[key] = Arr_1.Arr.get(this.items, key, defaultValue);
        }
        return config;
    }
}
exports.Repository = Repository;
//# sourceMappingURL=Repository.js.map