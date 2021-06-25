"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reset = exports.last = exports.head = exports.end = exports.dataGet = exports.value = exports.collect = void 0;
const utils = require("@devnetic/utils");
const Collection_1 = require("./Collection");
const collect = (items) => {
    return new Collection_1.Collection(items);
};
exports.collect = collect;
/**
 * Return the default value of the given value.
 *
 * @param  any  value
 * @return any
 */
const value = (value, ...args) => {
    return value instanceof Function ? value(...args) : value;
};
exports.value = value;
/**
 * Get an item from an array or object using "dot" notation.
 *
 * @param  {any}   target
 * @param  {string|array|number}  key
 * @param  {*}   defaultValue
 * @return {*}
 */
const dataGet = (target, key, defaultValue) => {
    if (key === undefined) {
        return target;
    }
    key = Array.isArray(key) ? key : String(key).split('.');
    for (const value of key) {
        if (Array.isArray(target)) {
            if (target[value] === undefined) {
                return value(defaultValue);
            }
            target = target[value];
        }
        else if (target instanceof Object) {
            if (target[value] === undefined) {
                return value(defaultValue);
            }
            target = target[value];
        }
        else if (utils.getType(target) === 'Object') {
            if (target[value] === undefined) {
                return value(defaultValue);
            }
            target = target[value];
        }
        else {
            return value(defaultValue);
        }
    }
    return target;
};
exports.dataGet = dataGet;
/**
 * Get the last element of an array. Useful for method chaining.
 *
 * @param  array  array
 * @return any
 */
const end = (array) => {
    return array[array.length - 1];
};
exports.end = end;
/**
 * Get the first element of an array. Useful for method chaining.
 *
 * @param  array  array
 * @return any
 */
const head = (array) => {
    return Array.isArray(array) ? array[0] : Array.from(Object.values(array))[0];
};
exports.head = head;
/**
 * Get the last element from an array.
 *
 * @param  array  array
 * @return any
 */
const last = (array) => {
    return exports.end(array);
};
exports.last = last;
/**
 * Get the first element of an array. Useful for method chaining.
 *
 * @param  array  array
 * @return any
 */
const reset = (array) => {
    return exports.head(array);
};
exports.reset = reset;
//# sourceMappingURL=Helpers.js.map