"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.value = exports.dataGet = exports.collect = void 0;
const utils_1 = require("@devnetic/utils");
const Arr_1 = require("./Arr");
const Collection_1 = require("./Collection");
const collect = (value) => {
    return new Collection_1.Collection(value);
};
exports.collect = collect;
/**
 * Get an item from an array or object using "dot" notation.
 *
 * @param  {unknown}   target
 * @param  {string|Array|number}  key
 * @param  {unknown}   [defaultValue]
 * @return {unknown}
 */
const dataGet = (target, key, defaultValue) => {
    if (key === undefined) {
        return target;
    }
    key = Array.isArray(key) ? key : String(key).split('.');
    for (const [i, segment] of key.entries()) {
        key[i] = undefined;
        if (segment === undefined) {
            return target;
        }
        if (segment === '*') {
            if (target instanceof Collection_1.Collection) {
                target = target.all();
            }
            else if (!Array.isArray(target)) {
                return (0, exports.value)(defaultValue);
            }
            const result = [];
            for (const item of Object.values(target)) {
                result.push((0, exports.dataGet)(item, key));
            }
            return key.includes('*') ? Arr_1.Arr.collapse(result) : result;
        }
        if (Arr_1.Arr.accessible(target) && Arr_1.Arr.exists(target, segment)) {
            target = target[segment];
        }
        else if ((0, utils_1.isObject)(target) && target[segment] !== undefined) {
            target = target[segment];
        }
        else {
            return (0, exports.value)(defaultValue);
        }
    }
    return target;
};
exports.dataGet = dataGet;
/**
 * Return the default value of the given value.
 *
 * @param  {unknown}  target
 * @param {Array} args
 * @return {unknown}
 */
const value = (target, ...args) => {
    return target instanceof Function ? target(...args) : target;
};
exports.value = value;
//# sourceMappingURL=helpers.js.map