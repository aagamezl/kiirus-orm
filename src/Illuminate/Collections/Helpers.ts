import * as utils from '@devnetic/utils'

import { Collection } from './Collection';

export const collect = (items: any): Collection => {
  return new Collection(items)
}

/**
 * Return the default value of the given value.
 *
 * @param  any  value
 * @return any
 */
export const value = (value: any, ...args: any): any => {
  return value instanceof Function ? value(...args) : value;
}

/**
 * Get an item from an array or object using "dot" notation.
 *
 * @param  {any}   target
 * @param  {string|array|number}  key
 * @param  {*}   defaultValue
 * @return {*}
 */
export const dataGet = (target: any, key?: string | Array<any> | number, defaultValue?: any) => {
  if (key === undefined) {
    return target
  }

  key = Array.isArray(key) ? key : String(key).split('.')

  for (const value of key) {
    if (Array.isArray(target)) {
      if (target[value] === undefined) {
        return value(defaultValue)
      }

      target = target[value]
    } else if (target instanceof Object) {
      if (target[value] === undefined) {
        return value(defaultValue)
      }

      target = target[value]
    } else if (utils.getType(target) === 'Object') {
      if (target[value] === undefined) {
        return value(defaultValue)
      }

      target = target[value]
    } else {
      return value(defaultValue)
    }
  }

  return target
}


/**
 * Get the first element of an array. Useful for method chaining.
 *
 * @param  array  array
 * @return any
 */
export const head = (array: Array<any>) => {
  return array[0];
}
