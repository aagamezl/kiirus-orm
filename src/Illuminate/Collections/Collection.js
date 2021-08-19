import {
  isFunction,
  isPlainObject,
  isString
} from 'lodash'

import { Arr } from './Arr'
import { dataGet } from './helpers'

export class Collection {
  /**
   * Create a new collection.
   *
   * @param  {*}  items
   * @return {void}
   */
  constructor (items) {
    /**
     * The items contained in the collection.
     *
     * @member Array
     */
    this.items = this.getArrayableItems(items)
  }

  valueOf () {
    return this.items
  }

  /**
   * Get all of the items in the collection.
   *
   * @return {Array}
   */
  all () {
    return this.items
  }

  /**
   * Determine if an item exists in the collection.
   *
   * @param  {*}  key
   * @param  {*}  operator
   * @param  {*}  value
   * @return {boolean}
   */
  contains (key, operator = null, value = null) {
    if (arguments.length === 1) {
      if (this.useAsCallable(key)) {
        const placeholder = {}

        return this.first(key, placeholder) !== placeholder
      }

      return this.items.includes(key)
    }

    return this.contains(this.operatorForWhere(...arguments))
  }

  /**
   * Count the number of items in the collection.
   *
   * @return {number}
   */
  count () {
    if (Array.isArray(this.items)) {
      return this.items.length
    }

    if (this.items instanceof Map) {
      return this.items.size
    }
  }

  /**
   * Run a filter over each of the items.
   *
   * @param  {Function|undefined}  [callback]
   * @return {static}
   */
  filter (callback = undefined) {
    if (callback) {
      return new this.constructor(Arr.where(this.items, callback))
    }

    return new this.constructor(this.items.filter(item => item))
  }

  /**
   * Get the first item from the collection passing the given truth test.
   *
   * @param  {Function}  [callback]
   * @param  {*}  [defaultValue]
   * @return {*}
   */
  first (callback, defaultValue) {
    return Arr.first(this.items, callback, defaultValue)
  }

  /**
   * Results array of items from Collection or Arrayable.
   *
   * @param  {*}  items
   * @return {Array}
   */
  getArrayableItems (items) {
    if (Array.isArray(items) || items instanceof Map) {
      return items
    } else if (items instanceof Collection) {
      return items.all()
    } else if (isPlainObject(items)) {
      return [items]
    } else if (items === undefined) {
      return []
    }

    return [items]
  }

  /**
   * Concatenate values of a given key as a string.
   *
   * @param  {string}  value
   * @param  {string}  [glue]
   * @return {string}
   */
  implode (value, glue = undefined) {
    const first = this.first()

    if (Array.isArray(first) || (isPlainObject(first) && typeof first !== 'string')) {
      return this.pluck(value).all().join(glue ?? '')
    }

    return this.items.join(value ?? '')
  }

  /**
   * Determine if the collection is empty or not.
   *
   * @return {boolean}
   */
  isEmpty () {
    return !this.items || this.items.length === 0
  }

  /**
   * Join all items from the collection using a string. The final items can use a separate glue string.
   *
   * @param  {string}  glue
   * @param  {string}  finalGlue
   * @return {string}
   */
  join (glue, finalGlue = '') {
    if (finalGlue === '') {
      return this.implode(glue)
    }

    const count = this.count()

    if (count === 0) {
      return ''
    }

    if (count === 1) {
      return this.last()
    }

    const collection = new Collection(this.items)

    const finalItem = collection.pop()

    return collection.implode(glue) + finalGlue + finalItem
  }

  /**
   * Get the last item from the collection.
   *
   * @param  {Function|undefined}  callback
   * @param  {*}  defaultValue
   * @return {*}
   */
  last (callback = undefined, defaultValue = undefined) {
    return Arr.last(this.items, callback, defaultValue)
  }

  /**
   * Create a new collection instance if the value isn't one already.
   *
   * @param  {*}  items
   * @return {static}
   */
  static make (items = []) {
    return new this(items)
  }

  /**
   * Merge the collection with the given items.
   *
   * @param  {*}  items
   * @return {static}
   */
  merge (items) {
    // return new this.constructor(merge(this.items, this.getArrayableItems(items)))
    return new this.constructor([...this.items, ...this.getArrayableItems(Object.entries(items))])
  }

  /**
   * Run a map over each of the items.
   *
   * @param  {Function}  callback
   * @return {Collection}
   */
  map (callback) {
    return new Collection(this.items.map((item, key) => {
      if (isFunction(callback)) {
        [key, item] = Array.isArray(item) && item.length > 0 ? item : [key, item]

        return callback(item, key)
      }

      return item
    }))
  }

  /**
   * Run an associative map over each of the items.
   *
   * The callback should return an associative array with a single key/value pair.
   *
   * @param  {Function}  callback
   * @return {this}
   */
  mapWithKeys (callback) {
    const result = []

    for (const [key, value] of Object.entries(this.items)) {
      const assoc = callback(value, key)

      for (const [mapKey, mapValue] of Object.entries(assoc)) {
        result.push([mapKey, mapValue])
      }
    }

    return new this.constructor(result)
  }

  /**
   * Get an operator checker callback.
   *
   * @param  {string}  key
   * @param  {string|null}  operator
   * @param  {*}  value
   * @return {Function}
   */
  operatorForWhere (key, operator = null, value = null) {
    if (arguments.length === 1) {
      value = true

      operator = '='
    }

    if (arguments.length === 2) {
      value = operator

      operator = '='
    }

    return (item) => {
      const retrieved = dataGet(item, key)

      const strings = [retrieved, value].filter((value) => {
        return isString(value) || (isPlainObject(value) && Reflect.has(value, 'toString'))
      })

      if (strings.length < 2 && [retrieved, value].filter(isPlainObject).length === 1) {
        return ['!=', '<>', '!=='].includes(operator)
      }

      switch (operator) {
        case '=':
        case '==': return retrieved == value // eslint-disable-line
        case '!=':
        case '<>': return retrieved != value // eslint-disable-line
        case '<': return retrieved < value
        case '>': return retrieved > value
        case '<=': return retrieved <= value
        case '>=': return retrieved >= value
        case '===': return retrieved === value
        case '!==': return retrieved !== value
        default: return '=='
      }
    }
  }

  /**
   * Get the values of a given key.
   *
   * @param  {string|Array|int|undefined}  $value
   * @param  {string|undefined}  $key
   * @return static
   */
  pluck (value, key = undefined) {
    return new this.constructor(Arr.pluck(this.items, value, key))
  }

  /**
   * Create a collection of all elements that do not pass a given truth test.
   *
   * @param  {callbackFn|any}  callback
   * @return {static}
   */
  reject (callback = true) {
    const useAsCallable = this.useAsCallable(callback)

    return this.filter((value, key) => {
      return useAsCallable
        ? !callback(value, key)
        : value !== callback
    })
  }

  /**
   * Sort the collection using the given callback.
   *
   * @param  {Function|Array|string}  callback
   * @param  {boolean}  descending
   * @return {this}
   */
  sortBy (callback, descending = false) {
    if (Array.isArray(callback) && !isFunction(callback)) {
      return this.sortByMany(callback)
    }

    let results = new Map()

    callback = this.valueRetriever(callback)

    // First we will loop through the items and get the comparator from a callback
    // function which we were given. Then, we will sort the returned values and
    // and grab the corresponding values for the sorted keys from this array.
    for (const [key, value] of this.items) {
      results.set(key, callback(value, key))
    }

    results = descending
      ? new Map([...results.entries()].sort((a, b) => a[1] - b[1]))
      : new Map([...results.entries()].sort((a, b) => b[1] - a[1]))

    // Once we have sorted all of the keys in the array, we will loop through them
    // and grab the corresponding model so we can set the underlying items list
    // to the sorted version. Then we'll just return the collection instance.
    for (const [key] of results) {
      results.set(key, this.items instanceof Map ? this.items.get(key) : this.items[key])
    }

    return new this.constructor(results)
  }

  /**
   * Determine if the given value is callable, but not a string.
   *
   * @param  {*}  value
   * @return {boolean}
   */
  useAsCallable (value) {
    return !isString(value) && isFunction(value)
  }

  /**
   * Get a value retrieving callback.
   *
   * @param  {Function|string|undefined}  value
   * @return {Function}
   */
  valueRetriever (value) {
    if (this.useAsCallable(value)) {
      return value
    }

    return (item) => {
      return dataGet(item, value)
    }
  }

  /**
   * Reset the keys on the underlying array.
   *
   * @return {this}
   */
  values () {
    return new this.constructor([...this.items.values()])
  }
}
