"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ksort = exports.changeKeyCase = exports.tap = void 0;
const HigherOrderTapProxy_1 = require("./HigherOrderTapProxy");
/**
 * Call the given Closure with the given value then return the value.
 *
 * @param  any  value
 * @param  callable|null  callback
 * @return any
 */
const tap = (value, callback) => {
    if (!callback) {
        return new HigherOrderTapProxy_1.HigherOrderTapProxy(value);
    }
    callback(value);
    return value;
};
exports.tap = tap;
/**
 * Returns an array with all keys from array lowercased or uppercased.
 *
 * @param {object} value
 * @param {string} changeCase
 * @returns {object}
 */
const changeKeyCase = (value, changeCase = 'CASE_LOWER') => {
    const result = {};
    if (value && typeof value === 'object') {
        const casefunction = (!changeCase || changeCase === 'CASE_LOWER') ? 'toLowerCase' : 'toUpperCase';
        for (let key in value) {
            result[key[casefunction]()] = value[key];
        }
        return result;
    }
};
exports.changeKeyCase = changeKeyCase;
const ksort = (value) => Object.keys(value).sort().reduce((result, key) => {
    result[key] = value[key];
    return result;
}, {});
exports.ksort = ksort;
//# sourceMappingURL=Helpers.js.map