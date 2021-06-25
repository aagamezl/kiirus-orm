"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Collection = void 0;
const lodash_1 = require("lodash");
const Arr_1 = require("./Arr");
class Collection {
    /**
     * Create a new collection.
     *
     * @param  mixed  items
     * @return void
     */
    constructor(items) {
        /**
         * The items contained in the collection.
         *
         * @var array
         */
        this.items = [];
        this.items = this.getArrayableItems(items);
    }
    /**
     * Get all of the items in the collection.
     *
     * @return array
     */
    all() {
        return this.items;
    }
    /**
     * Determine if an item exists in the collection.
     *
     * @param  any  key
     * @param  [any]  operator
     * @param  [any]  value
     * @return boolean
     */
    contains(key, operator, value) {
        if (arguments.length === 1) {
            if (this.useAsCallable(key)) {
                const placeholder = new Object;
                return this.first(key, placeholder) !== placeholder;
            }
            return this.items.includes(key);
        }
        return this.contains(Reflect.apply(this.operatorForWhere, this, arguments));
    }
    /**
     * Count the number of items in the collection.
     *
     * @return number
     */
    count() {
        return this.items.length;
    }
    /**
     * Run a filter over each of the items.
     *
     * @param  [callbackFn]  callback
     * @return static
     */
    filter(callback) {
        if (callback) {
            return new this.constructor(Arr_1.Arr.where(this.items, callback));
        }
        return new this.constructor(this.items.filter(item => item));
    }
    /**
     * Get the first item from the collection passing the given truth test.
     *
     * @param  [callbackFn]  callback
     * @param  [any]  defaultValue
     * @return any
     */
    first(callback, defaultValue) {
        return Arr_1.Arr.first(this.items, callback, defaultValue);
    }
    /**
     * Results array of items from Collection or Arrayable.
     *
     * @param  any  items
     * @return array
     */
    getArrayableItems(items) {
        if (Array.isArray(items)) {
            return items;
        }
        else if (items instanceof Collection) {
            return items.all();
        }
        else if (lodash_1.isPlainObject(items)) {
            return items;
        }
        return items;
    }
    /**
     * Concatenate values of a given key as a string.
     *
     * @param  string  value
     * @param  [string]  glue
     * @return string
     */
    implode(value, glue) {
        const first = this.first();
        if (Array.isArray(first) || (lodash_1.isPlainObject(first) && typeof first !== 'string')) {
            return this.pluck(value).all().join(glue !== null && glue !== void 0 ? glue : '');
        }
        return this.items.join(value !== null && value !== void 0 ? value : '');
    }
    /**
     * Determine if the collection is empty or not.
     *
     * @return boolean
     */
    isEmpty() {
        return !this.items || this.items.length === 0;
    }
    /**
   * Join all items from the collection using a string. The final items can use a separate glue string.
   *
   * @param  string  glue
   * @param  string  finalGlue
   * @return string
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
     * @param  callable|null  callback
     * @param  mixed  defaultValue
     * @return mixed
     */
    last(callback, defaultValue) {
        return Arr_1.Arr.last(this.items, callback, defaultValue);
    }
    /**
     * Run a map over each of the items.
     *
     * @param  callable  callback
     * @return static
     */
    map(callback) {
        return new Collection(this.items.map(callback));
    }
    /**
     * Get an operator checker callback.
     *
     * @param  string  key
     * @param  string  operator
     * @param  any  value
     * @return Function
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
            const retrieved = lodash_1.get(item, key);
            const strings = [retrieved, value].filter((value) => {
                return lodash_1.isString(value) || (lodash_1.isPlainObject(value) && Reflect.has(value, 'toString'));
            });
            if (strings.length < 2 && [retrieved, value].filter(lodash_1.isPlainObject).length == 1) {
                return ['!=', '<>', '!=='].includes(String(operator));
            }
            switch (operator) {
                default:
                case '=':
                case '==': return retrieved == value;
                case '!=':
                case '<>': return retrieved != value;
                case '<': return retrieved < value;
                case '>': return retrieved > value;
                case '<=': return retrieved <= value;
                case '>=': return retrieved >= value;
                case '===': return retrieved === value;
                case '!==': return retrieved !== value;
            }
        };
    }
    /**
     * Get the values of a given key.
     *
     * @param  string|array|int|null  value
     * @param  string|null  key
     * @return static
     */
    pluck(value, key) {
        return new Collection(Arr_1.Arr.pluck(this.items, value, key));
    }
    /**
     * Get and remove the last item from the collection.
     *
     * @return any
     */
    pop() {
        return this.items.pop();
    }
    /**
     * Create a collection of all elements that do not pass a given truth test.
     *
     * @param  callbackFn|any  callback
     * @return static
     */
    reject(callback = true) {
        const useAsCallable = this.useAsCallable(callback);
        return this.filter((value, key) => {
            // return this.filter(([key, value]) => {
            return useAsCallable
                ? !callback(value, key)
                : value != callback;
        });
    }
    /**
     * Determine if the given value is callable, but not a string.
     *
     * @param  unknown  value
     * @return boolean
     */
    useAsCallable(value) {
        return !lodash_1.isString(value) && lodash_1.isFunction(value);
    }
}
exports.Collection = Collection;
//# sourceMappingURL=Collection.js.map