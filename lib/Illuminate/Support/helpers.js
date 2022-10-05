"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tap = exports.spaceship = exports.pull = exports.objectDiffKey = exports.isTruthy = exports.isFalsy = exports.isBoolean = exports.isDirectory = exports.changeKeyCase = exports.castArray = void 0;
const fs_1 = require("fs");
const utils_1 = require("@devnetic/utils");
const HigherOrderTapProxy_1 = require("./HigherOrderTapProxy");
const castArray = (value) => {
    if (value === undefined) {
        return [];
    }
    return Array.isArray(value) ? value : [value];
};
exports.castArray = castArray;
/**
 * Returns an array with all keys from array lowercased or uppercased.
 *
 * @param {Record<string, unknown>} value
 * @param {string} [changeCase=CAMEL_CASE]
 * @returns {Record<string, unknown>}
 */
const changeKeyCase = (value, changeCase = 'CASE_LOWER') => {
    const result = {};
    if ((0, exports.isTruthy)(value) && typeof value === 'object') {
        const casefunction = ((0, exports.isFalsy)(changeCase) || changeCase === 'CASE_LOWER') ? 'toLowerCase' : 'toUpperCase';
        for (const key in value) {
            result[key[casefunction]()] = value[key];
        }
        return result;
    }
    return value;
};
exports.changeKeyCase = changeKeyCase;
const isDirectory = (path) => {
    try {
        return (0, fs_1.lstatSync)(path).isDirectory();
    }
    catch (error) {
        return false;
    }
};
exports.isDirectory = isDirectory;
const isBoolean = (value) => {
    return typeof value === 'boolean';
};
exports.isBoolean = isBoolean;
const isFalsy = (value) => {
    return !value; // eslint-disable-line
};
exports.isFalsy = isFalsy;
const isTruthy = (value) => {
    return !(0, exports.isFalsy)(value);
};
exports.isTruthy = isTruthy;
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
const spaceship = (a, b) => {
    if (a === b) {
        return 0;
    }
    if (a > b || a === null || b === null || a === undefined || b === undefined) {
        return 1;
    }
    if (a < b) {
        return -1;
    }
    throw new Error(`Spaceship failed on ${a} and ${b}`);
};
exports.spaceship = spaceship;
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