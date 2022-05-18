"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tap = exports.pull = exports.objectDiffKey = exports.isDirectory = void 0;
const fs_1 = require("fs");
const utils_1 = require("@devnetic/utils");
const HigherOrderTapProxy_1 = require("./HigherOrderTapProxy");
const isDirectory = (path) => {
    try {
        return (0, fs_1.lstatSync)(path).isDirectory();
    }
    catch (error) {
        return false;
    }
};
exports.isDirectory = isDirectory;
const objectDiffKey = (target, ...from) => {
    const keys = from.reduce((result, current) => {
        return result.concat(Object.keys(current));
    }, []);
    return Object.entries(target).reduce((result, [key, value]) => {
        if (!keys.includes(key)) {
            result[key] = value;
        }
        return result;
    }, {});
};
exports.objectDiffKey = objectDiffKey;
/**
 * Get a value from the array, and remove it.
 *
 * @param  {Record<string, unknown>}  array
 * @param  {string}  key
 * @param  {any}  [defaultValue=undefined]
 * @return {any}
 */
const pull = (array, key, defaultValue) => {
    const value = (0, utils_1.getValue)(array, key, defaultValue);
    delete array[key]; // eslint-disable-line
    return value;
};
exports.pull = pull;
/**
 * Call the given Closure with the given value then return the value.
 *
 * @param  {unknown}  value
 * @param  {callable}  [callback=undefined]
 * @return {unknown}
 */
const tap = (value, callback) => {
    if (callback === undefined) {
        return new HigherOrderTapProxy_1.HigherOrderTapProxy(value);
    }
    callback(value);
    return value;
};
exports.tap = tap;
//# sourceMappingURL=helpers.js.map