"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnumeratesValues = void 0;
const utils_1 = require("@devnetic/utils");
const Collection_1 = require("../Collection");
const helpers_1 = require("../helpers");
// export const EnumeratesValues = {
class EnumeratesValues {
    /**
     * Results array of items from Collection or Arrayable.
     *
     * @param  {unknown}  items
     * @return {array<TKey, TValue>}
     */
    getArrayableItems(items) {
        if (Array.isArray(items) || items instanceof Map) {
            return items;
        }
        else if (items instanceof Collection_1.Collection) {
            return items.all();
        }
        else if ((0, utils_1.isPlainObject)(items)) {
            return [items];
        }
        else if (items === undefined) {
            return [];
        }
        return [items];
    }
    /**
     * Determine if the given value is callable, but not a string.
     *
     * @param  {*}  value
     * @return {boolean}
     */
    useAsCallable(value) {
        return !(0, utils_1.isString)(value) && (0, utils_1.isFunction)(value);
    }
    /**
     * Get a value retrieving callback.
     *
     * @param  {Function|string}  [value]
     * @return {Function}
     */
    valueRetriever(value) {
        if (this.useAsCallable(value)) {
            return value;
        }
        return (item) => {
            return (0, helpers_1.dataGet)(item, value);
        };
    }
}
exports.EnumeratesValues = EnumeratesValues;
//# sourceMappingURL=EnumeratesValues.js.map