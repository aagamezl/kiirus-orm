import { isObject } from 'lodash'

import { Collection } from './Collection'

export const collect = (items) => {
  return new Collection(items)
}

/**
 * Get an item from an array or object using "dot" notation.
 *
 * @param  {*}   target
 * @param  {string|Array|number}  key
 * @param  {*}   [defaultValue]
 * @return {*}
 */
export const dataGet = (target, key, defaultValue = undefined) => {
  if (key === undefined) {
    return target
  }

  key = Array.isArray(key) ? key : String(key).split('.')

  for (const currentValue of key) {
    const targetValue = Reflect.get(target, currentValue)

    if (Array.isArray(target)) {
      if (targetValue === undefined) {
        return value(defaultValue)
      }

      target = targetValue
    } else if (target instanceof Object) {
      if (targetValue === undefined) {
        return value(defaultValue)
      }

      target = targetValue
    } else if (isObject(target)) {
      if (targetValue === undefined) {
        return value(defaultValue)
      }

      target = targetValue
    } else {
      return value(defaultValue)
    }
  }

  return target
}

/**
 * Return the default value of the given value.
 *
 * @param  {*}  target
 * @param {Array} args
 * @return {*}
 */
export const value = (target, ...args) => target instanceof Function ? target(...args) : value
