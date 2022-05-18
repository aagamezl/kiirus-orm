"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Collection = void 0;
const utils_1 = require("@devnetic/utils");
const use_1 = require("../Support/Traits/use");
const Arr_1 = require("./Arr");
const EnumeratesValues_1 = require("./Traits/EnumeratesValues");
const Macroable_1 = require("../Macroable/Traits/Macroable");
class Collection {
    /**
     * Create a new collection.
     *
     * @param  {\Illuminate\Contracts\Support\Arrayable<TKey, TValue>|iterable<TKey, TValue>|null}  items
     * @return {void}
     */
    constructor(items = []) {
        /**
       * The items contained in the collection.
       *
       * @var array<TKey, TValue>
       */
        this.items = [];
        (0, use_1.use)(this.constructor, [EnumeratesValues_1.EnumeratesValues, Macroable_1.Macroable]);
        this.items = this.getArrayableItems(items);
    }
    /**
     * Get all of the items in the collection.
     *
     * @return array<TKey, TValue>
     */
    all() {
        return this.items;
    }
    /**
     * Count the number of items in the collection.
     *
     * @return {number}
     */
    count() {
        if (this.items instanceof Map) {
            return this.items.size;
        }
        return Object.keys(this.items).length;
    }
    /**
     * Get the first item from the collection passing the given truth test.
     *
     * @param  {Function}  [callback]
     * @param  {unknown}  [defaultValue]
     * @return {unknown}
     */
    first(callback, defaultValue) {
        return Arr_1.Arr.first(this.items, callback, defaultValue);
    }
    /**
     * Concatenate values of a given key as a string.
     *
     * @param  {string}  value
     * @param  {string}  [glue]
     * @return {string}
     */
    implode(value, glue) {
        const first = this.first();
        if (Array.isArray(first) || ((0, utils_1.isPlainObject)(first) && typeof first !== 'string')) {
            return this.pluck(value).all().join(glue ?? '');
        }
        return this.items.join(value ?? '');
    }
    /**
     * Determine if the collection is empty or not.
     *
     * @return {boolean}
     */
    isEmpty() {
        return (0, utils_1.getType)(this.items) === 'Map' ? this.items?.size === 0 : this.items?.length === 0;
    }
    /**
     * Join all items from the collection using a string. The final items can use a separate glue string.
     *
     * @param  {string}  glue
     * @param  {string}  finalGlue
     * @return {string}
     */
    join(glue, finalGlue = '') {
        if (finalGlue === '') {
            return this.implode(glue);
        }
        const count = this.count();
        if (count === 0) {
            return '';
        }
        if (count === 1) {
            return this.last();
        }
        const collection = new Collection(this.items);
        const finalItem = collection.pop();
        return collection.implode(glue) + finalGlue + finalItem;
    }
    /**
     * Get the last item from the collection.
     *
     * @param  {Function|undefined}  [callback]
     * @param  {unknown}  [defaultValue]
     * @return {unknown}
     */
    last(callback, defaultValue) {
        return Arr_1.Arr.last(this.items, callback, defaultValue);
    }
    /**
   * Run a map over each of the items.
   *
   * @param  {Function}  callback
   * @return {Collection}
   */
    map(callback) {
        return new Collection(this.items.map((item, key) => {
            if ((0, utils_1.isFunction)(callback)) {
                [key, item] = Array.isArray(item) && item.length > 0 ? item : [key, item];
                return callback(item, key);
            }
            return item;
        }));
    }
    /**
     * Get the values of a given key.
     *
     * @param  {string|Array|number}  value
     * @param  {string|undefined}  key
     * @return {Collection}
     */
    pluck(value, key) {
        return new Collection(Arr_1.Arr.pluck(this.items, value, key));
    }
    /**
     * Get and remove the last N items from the collection.
     *
     * @param  {number}  count
     * @return {static<int, TValue>|TValue|undefined}
     */
    pop(count = 1) {
        if (count === 1) {
            return this.items.pop();
        }
        if (this.isEmpty()) {
            return new Collection();
        }
        const collectionCount = this.count();
        // for (const item of range(1, Math.min(count, collectionCount))) {
        //   results.push(this.items.pop())
        // }
        return new Collection((0, utils_1.range)(1, Math.min(count, collectionCount)).reduce((results) => {
            results.push(this.items.pop());
            return results;
        }, []));
    }
}
exports.Collection = Collection;
//# sourceMappingURL=Collection.js.map