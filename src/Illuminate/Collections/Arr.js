// const { isObject } = require('lodash')
import { isObject } from 'lodash'

// const { dataGet, value: getValue } = require('./helpers')
// const { dataGet, value: getValue } = require('./internal')
// import { Collection } from './Collection';
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
}

// module.exports = Arr
