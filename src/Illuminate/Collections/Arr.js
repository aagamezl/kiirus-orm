import { isObject, isPlainObject } from 'lodash'

import { Collection } from './Collection'

import { dataGet, value as getValue } from './helpers'

export class Arr {
  /**
   * Explode the "value" and "key" arguments passed to "pluck".
   *
   * @param  {string|Array}  value
   * @param  {string|Array|undefined}  [key]
   * @return {Array}
   */
  static explodePluckParameters (value, key = undefined) {
    value = Array.isArray(value) ? value : value.split('.')

    key = key === undefined || Array.isArray(key) ? key : key.split('.')

    return [value, key]
  }

  /**
   * Return the first element in an array passing a given truth test.
   *
   * @param  {Array}  array
   * @param  {Function}  [callback]
   * @param  {*}  [defaultValue]
   * @return {*}
   */
  static first (array, callback, defaultValue) {
    if (!callback) {
      if (array.length === 0) {
        return getValue(defaultValue)
      }

      return array[0]
    }

    for (const [key, value] of array.entries()) {
      if (callback && callback(value, key)) {
        return value
      }
    }

    return getValue(defaultValue)
  }

  /**
   * Flatten a multi-dimensional array into a single level.
   *
   * @param  {Array}  array
   * @param  {number}  depth
   * @return {Array}
   */
  static flatten (array, depth = Number.POSITIVE_INFINITY) {
    const result = []

    for (let [, item] of Object.entries(array)) {
      item = item instanceof Collection ? item.all() : item

      if (!Array.isArray(item) && !isPlainObject(item)) {
        result.push(item)
      } else {
        const values = depth === 1
          ? Object.values(item)
          : this.flatten(item, depth - 1)

        for (const value of values) {
          result.push(value)
        }
      }
    }

    return result
  }

  /**
   *
   *
   * @static
   * @param {Array | object} value
   * @returns {Array}
   * @memberof Arr
   */
  static iterable (value) {
    value = Array.isArray(value) ? value : [value]

    return value.reduce((result, column, index) => {
      if (isObject(column)) {
        result.push(...Object.entries(column))
      } else {
        result.push([index, column])
      }

      return result
    }, [])
  }

  /**
   * Pluck an array of values from an array.
   *
   * @param  {Array}   array
   * @param  {string|Array|number|undefined}  [value]
   * @param  {string|Array|undefined}  [key]
   * @return {Array}
   */
  static pluck (array, value, key = undefined) {
    const results = []

    const [pluckValue, pluckKey] = this.explodePluckParameters(value, key)

    for (const item of array) {
      const itemValue = dataGet(item, pluckValue)

      // If the key is "null", we will just append the value to the array and keep
      // looping. Otherwise we will key the array using the value of the key we
      // received from the developer. Then we'll return the final array form.
      if (!pluckKey) {
        results.push(itemValue)
      } else {
        let itemKey = dataGet(item, pluckKey)

        if (isObject(itemKey) && itemKey.toString !== undefined) {
          itemKey = itemKey.toString()
        }

        Reflect.set(results, itemKey, itemValue)
      }
    }

    return results
  }

  static values (array) {
    const values = []

    for (const value of array.values()) {
      values.push(value)
    }

    return values
  }

  /**
   * If the given value is not an array and not null, wrap it in one.
   *
   * @param  {*}  value
   * @return {Array}
   */
  static wrap (value) {
    if (!value) {
      return []
    }

    return Array.isArray(value) ? value : [value]
  }
}
