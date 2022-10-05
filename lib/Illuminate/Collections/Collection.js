"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Collection = void 0;
const utils_1 = require("@devnetic/utils");
const use_1 = require("../Support/Traits/use");
const Arr_1 = require("./Arr");
const EnumeratesValues_1 = require("./Traits/EnumeratesValues");
const Macroable_1 = require("../Macroable/Traits/Macroable");
const helpers_1 = require("./helpers");
const Support_1 = require("../Support");
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
      * Determine if an item exists in the collection.
      *
      * @param  {*}  key
      * @param  {*}  operator
      * @param  {*}  value
      * @return {boolean}
      */
    contains(key, operator, value) {
        if (arguments.length === 1) {
            if (this.useAsCallable(key)) {
                const placeholder = {};
                return this.first(key, placeholder) !== placeholder;
            }
            return this.items.includes(key);
        }
        return this.contains(this.operatorForWhere.apply(null, arguments));
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
     * Create a new collection instance if the value isn't one already.
     *
     * @param  {*}  items
     * @return {static}
     */
    static make(items = []) {
        return new this(items);
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
      * Get an operator checker callback.
      *
      * @param  {string}  key
      * @param  {string|null}  operator
      * @param  {*}  value
      * @return {Function}
      */
    operatorForWhere(key, operator, value) {
        if (arguments.length === 1) {
            value = true;
            operator = '=';
        }
        if (arguments.length === 2) {
            value = operator;
            operator = '=';
        }
        return (item) => {
            const retrieved = (0, helpers_1.dataGet)(item, key);
            const strings = [retrieved, value].filter((value) => {
                return (0, utils_1.isString)(value) || ((0, utils_1.isPlainObject)(value) && Reflect.has(value, 'toString'));
            });
            if (strings.length < 2 && [retrieved, value].filter(utils_1.isPlainObject).length === 1) {
                return ['!=', '<>', '!=='].includes(operator);
            }
            switch (operator) {
                case '=':
                case '==': return retrieved == value; // eslint-disable-line
                case '!=':
                case '<>': return retrieved != value; // eslint-disable-line
                case '<': return retrieved < value;
                case '>': return retrieved > value;
                case '<=': return retrieved <= value;
                case '>=': return retrieved >= value;
                case '===': return retrieved === value;
                case '!==': return retrieved !== value;
                default: return '==';
            }
        };
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
    /**
     * Sort the collection using the given callback.
     *
     * @param  {Function|Array|string}  callback
     * @param  {boolean}  descending
     * @return {this}
     */
    sortBy(callback, descending = false) {
        if (Array.isArray(callback) && !(0, utils_1.isFunction)(callback)) {
            return this.sortByMany(callback);
        }
        let results = new Map();
        callback = this.valueRetriever(callback);
        // First we will loop through the items and get the comparator from a callback
        // function which we were given. Then, we will sort the returned values and
        // and grab the corresponding values for the sorted keys from this array.
        for (const [key, value] of this.items) {
            results.set(key, callback(value, key));
        }
        results = descending
            ? new Map([...results.entries()].sort((a, b) => a[1] - b[1]))
            : new Map([...results.entries()].sort((a, b) => b[1] - a[1]));
        // Once we have sorted all of the keys in the array, we will loop through them
        // and grab the corresponding model so we can set the underlying items list
        // to the sorted version. Then we'll just return the collection instance.
        for (const [key] of results) {
            results.set(key, this.items instanceof Map ? this.items.get(key) : this.items[key]);
        }
        return new Collection(results);
    }
    /**
     * Sort the collection using multiple comparisons.
     *
     * @param  {any[]}  comparisons
     * @return {Collection}
     */
    sortByMany(comparisons = []) {
        const items = this.items;
        items.sort((a, b) => {
            let result;
            for (let comparison of comparisons) {
                comparison = Arr_1.Arr.wrap(comparison);
                const prop = comparison[0];
                const ascending = Arr_1.Arr.get(comparison, 1, true) === true ||
                    Arr_1.Arr.get(comparison, 1, true) === 'asc';
                let values;
                if (!(0, utils_1.isString)(prop) && (0, utils_1.isFunction)(prop)) {
                    result = prop(a, b);
                }
                else {
                    values = [(0, helpers_1.dataGet)(a, prop), (0, helpers_1.dataGet)(b, prop)];
                    if (!ascending) {
                        values = values.reverse();
                    }
                    result = (0, Support_1.spaceship)(values[0], values[1]);
                }
                if (result === 0) {
                    continue;
                }
            }
            return result;
        });
        return new Collection(items);
    }
}
exports.Collection = Collection;
//# sourceMappingURL=Collection.js.map