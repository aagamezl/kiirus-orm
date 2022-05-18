"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnumeratesValues = void 0;
const utils_1 = require("@devnetic/utils");
const Collection_1 = require("../Collection");
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
}
exports.EnumeratesValues = EnumeratesValues;
//# sourceMappingURL=EnumeratesValues.js.map