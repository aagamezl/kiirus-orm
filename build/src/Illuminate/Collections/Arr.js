"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Arr = void 0;
const utils = require("@devnetic/utils");
const lodash_1 = require("lodash");
const Collection_1 = require("./Collection");
const Helpers_1 = require("./Helpers");
class Arr {
    /**
     * Explode the "value" and "key" arguments passed to "pluck".
     *
     * @param  {string|array}  value
     * @param  {[string|Array<any>]}  key
     * @return {array}
     */
    static explodePluckParameters(value, key) {
        value = Array.isArray(value) ? value : value.split('.');
        key = key === undefined || Array.isArray(key) ? key : key.split('.');
        return [value, key];
    }
    /**
     * Return the first element in an array passing a given truth test.
     *
     * @param  Array<any>  array
     * @param  [callbackFn]  callback
     * @param  any  defaultValue
     * @return any
     */
    static first(array, callback, defaultValue) {
        if (!callback) {
            if (array.length === 0) {
                return Helpers_1.value(defaultValue);
            }
            for (const item of array) {
                return item;
            }
        }
        for (const [key, value] of array) {
            if (callback && callback(value, key)) {
                return value;
            }
        }
        return Helpers_1.value(defaultValue);
    }
    /**
     * Flatten a multi-dimensional array into a single level.
     *
     * @param  iterable  array
     * @param  int  depth
     * @return array
     */
    static flatten(array, depth = Number.POSITIVE_INFINITY) {
        const result = [];
        for (let [, item] of Object.entries(array)) {
            item = item instanceof Collection_1.Collection ? item.all() : item;
            if (!Array.isArray(item) && !lodash_1.isPlainObject(item)) {
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
     * Return the last element in an array passing a given truth test.
     *
     * @param  array  array
     * @param  callable|null  callback
     * @param  any  defaultValue
     * @return any
     */
    static last(array, callback, defaultValue) {
        if (!callback) {
            return array.length === 0 ? Helpers_1.value(defaultValue) : array[array.length - 1];
        }
        return this.first(array.reverse(), callback, defaultValue);
    }
    /**
     * Pluck an array of values from an array.
     *
     * @param  {array}   array
     * @param  {string|array|number}  value
     * @param  {string|array}  key
     * @return {array}
     */
    static pluck(array, value, key) {
        const results = [];
        [value, key] = this.explodePluckParameters(value, key);
        for (const item of array) {
            const itemValue = Helpers_1.dataGet(item, value);
            // If the key is "null", we will just append the value to the array and keep
            // looping. Otherwise we will key the array using the value of the key we
            // received from the developer. Then we'll return the final array form.
            if (!key) {
                results.push(itemValue);
            }
            else {
                let itemKey = Helpers_1.dataGet(item, key);
                if (utils.getType(itemKey) === 'Object' && itemKey.toString !== undefined) {
                    itemKey = itemKey.toString();
                }
                results[itemKey] = itemValue;
            }
        }
        return results;
    }
    static values(array) {
        const values = [];
        for (const value of array.values()) {
            values.push(value);
        }
        return values;
    }
    /**
     * Filter the array using the given callback.
     *
     * @param  Array<any>  array
     * @param  callbackFn  callback
     * @return Array<any>
     */
    static where(array, callback) {
        return array.filter((item, index) => {
            if (!Array.isArray(item)) {
                return callback(item, index);
            }
            // const [key, value] = Object.entries(item)[0];
            const [key, value] = item;
            return callback(value, key);
        });
    }
    /**
     * If the given value is not an array and not null, wrap it in one.
     *
     * @param  mixed  value
     * @return array
     */
    static wrap(value) {
        if (!value) {
            return [];
        }
        return Array.isArray(value) ? value : [value];
    }
}
exports.Arr = Arr;
//# sourceMappingURL=Arr.js.map