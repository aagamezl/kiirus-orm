"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Arr = void 0;
const utils_1 = require("@devnetic/utils");
const Support_1 = require("../Support");
const Collection_1 = require("./Collection");
const helpers_1 = require("./helpers");
// eslint-disable-next-line
class Arr {
    /**
     * Determine whether the given value is array accessible.
     *
     * @param  {unknown}  $value
     * @return {boolean}
     */
    static accessible(value) {
        return Array.isArray(value);
    }
    /**
     * Collapse an array of arrays into a single array.
     *
     * @param  {iterable}  array
     * @return [array]
     */
    static collapse(array) {
        const results = [];
        for (let values of Object.values(array)) {
            if (values instanceof Collection_1.Collection) {
                values = values.all();
            }
            else if (!Array.isArray(values)) {
                continue;
            }
            results.push(values);
        }
        return [...[], ...results];
    }
    /**
     * Determine if the given key exists in the provided array.
     *
     * @param  {ArrayAccess|array}  array
     * @param  {string|number}  key
     * @return {boolean}
     */
    static exists(array, key) {
        return array[key] !== undefined;
    }
    /**
     * Explode the "value" and "key" arguments passed to "pluck".
     *
     * @param  {string|Array}  value
     * @param  {string|Array}  [key]
     * @return {Array}
     */
    static explodePluckParameters(value, key) {
        value = Array.isArray(value) ? value : String(key).split('.');
        key = (key === undefined || Array.isArray(key)) ? key : String(key).split('.');
        return [value, key];
    }
    /**
     * Return the first element in an array passing a given truth test.
     *
     * @param  {Array}  array
     * @param  {Function}  [callback]
     * @param  {unknown}  [defaultValue]
     * @return {unknown}
     */
    static first(array, callback, defaultValue) {
        if (callback === undefined) {
            if (array.length === 0) {
                return (0, helpers_1.value)(defaultValue);
            }
            return array[0];
        }
        for (const [key, value] of array.entries()) {
            const isTruthy = Boolean(callback(value, key));
            if (isTruthy) {
                return value;
            }
        }
        return (0, helpers_1.value)(defaultValue);
    }
    /**
     * Flatten a multi-dimensional array into a single level.
     *
     * @param  {Array}  array
     * @param  {number}  depth
     * @return {Array}
     */
    static flatten(array, depth = Number.POSITIVE_INFINITY) {
        const result = [];
        const entries = array instanceof Map ? array.entries() : Object.entries(array);
        for (let [, item] of entries) {
            item = item instanceof Collection_1.Collection ? item.all() : item;
            if (!Array.isArray(item) && !(0, utils_1.isPlainObject)(item)) {
                result.push(item);
            }
            else {
                const values = depth === 1
                    ? Object.values(item)
                    : this.flatten(item, depth - 1);
                for (const value of values) {
                    result.push(value);
                }
            }
        }
        return result;
    }
    /**
     * Get an item from an array using "dot" notation.
     *
     * @param  {object|Array}  array
     * @param  {string|number|undefined}  key
     * @param  {any}  default
     * @return {any}
     */
    static get(array, key, defaultValue) {
        if (key === undefined) {
            return array;
        }
        if (Object.values(array).includes(key)) {
            return array[key];
        }
        return (0, helpers_1.dataGet)(array, key, defaultValue);
    }
    /**
     *
     *
     * @public static
     * @param {Array | object} value
     * @returns {Array}
     * @memberof Arr
     */
    static iterable(value) {
        value = Array.isArray(value) ? value : [value];
        return value.reduce((result, column, index) => {
            if ((0, utils_1.isPlainObject)(column)) {
                result.push(...Object.entries(column));
            }
            else {
                if (Array.isArray(column)) {
                    result.push(...this.iterable(column));
                }
                else {
                    result.push([index, column]);
                }
            }
            return result;
        }, []);
    }
    /**
     * Return the last element in an array passing a given truth test.
     *
     * @param  {Array}  array
     * @param  {Function|undefined}  callback
     * @param  {*}  defaultValue
     * @return {*}
     */
    static last(array, callback, defaultValue) {
        if (callback === undefined) {
            return array.length === 0 ? (0, helpers_1.value)(defaultValue) : array[array.length - 1];
        }
        return this.first(array.reverse(), callback, defaultValue);
    }
    /**
     * Pluck an array of values from an array.
     *
     * @param  {Array}   array
     * @param  {string|Array|number|undefined}  [value]
     * @param  {string|Array|undefined}  [key]
     * @return {Array}
     */
    static pluck(array, value, key) {
        const results = [];
        const [pluckValue, pluckKey] = this.explodePluckParameters(value, key);
        for (const item of array) {
            const itemValue = (0, helpers_1.dataGet)(item, pluckValue);
            // If the key is "null", we will just append the value to the array and keep
            // looping. Otherwise we will key the array using the value of the key we
            // received from the developer. Then we'll return the final array form.
            if (pluckKey === undefined) {
                results.push(itemValue);
            }
            else {
                let itemKey = (0, helpers_1.dataGet)(item, pluckKey);
                if ((0, utils_1.isObject)(itemKey) && itemKey.toString !== undefined) {
                    itemKey = itemKey.toString();
                }
                Reflect.set(results, itemKey, itemValue);
            }
        }
        return results;
    }
    /**
     * Shuffle the given array and return the result.
     *
     * @param  {Array}  array
     * @return {Array}
     */
    static shuffle(array) {
        return array.sort((a, b) => a.localeCompare(b));
    }
    /**
     * Sort the array using the given callback or "dot" notation.
     *
     * @param  {Record<string, any>}  array
     * @param  {Function|Array|string}  callback
     * @return {any[]}
     */
    static sort(target, callback) {
        return Collection_1.Collection.make(target).sortBy(callback).all();
    }
    static values(target) {
        return Object.values(target).reduce((result, value) => {
            result.push(value);
            return result;
        }, []);
    }
    /**
     * If the given value is not an array and not null, wrap it in one.
     *
     * @param  {unknown}  value
     * @return {Array}
     */
    static wrap(value) {
        // eslint-disable-next-line
        if ((0, Support_1.isFalsy)(value)) {
            return [];
        }
        return Array.isArray(value) ? value : [value];
    }
}
exports.Arr = Arr;
//# sourceMappingURL=Arr.js.map