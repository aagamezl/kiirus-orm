import { isObject } from '@devnetic/utils'

import { Arr } from './Arr'
import { Collection } from './Collection'

export const collect = (value: unknown): Collection => {
  return new Collection(value)
}

/**
 * Get an item from an array or object using "dot" notation.
 *
 * @param  {unknown}   target
 * @param  {string|Array|number}  key
 * @param  {unknown}   [defaultValue]
 * @return {unknown}
 */
export const dataGet = <T, D>(target: T, key: string | unknown[] | number, defaultValue?: D): unknown => {
  if (key === undefined) {
    return target
  }

  key = Array.isArray(key) ? key : String(key).split('.')

  for (const [i, segment] of key.entries()) {
    key[i] = undefined

    if (segment === undefined) {
      return target
    }

    if (segment === '*') {
      if (target instanceof Collection) {
        target = target.all() as unknown as T
      } else if (!Array.isArray(target)) {
        return value(defaultValue)
      }

      const result = []

      for (const item of Object.values(target)) {
        result.push(dataGet(item, key))
      }

      return key.includes('*') ? Arr.collapse(result) : result
    }

    if (Arr.accessible(target) && Arr.exists(target, segment as any)) {
      target = target[segment as keyof T] as any
    } else if (isObject(target) && target[segment as keyof T] !== undefined) {
      target = target[segment as keyof T] as any
    } else {
      return value(defaultValue)
    }
  }

  return target
}

/**
 * Get the last element of an array. Useful for method chaining.
 *
 * @param  {any}  array
 * @return {any}
 */
export const end = (array: any): any => {
  return array[array.length - 1]
}

/**
 * Get the first element of an array. Useful for method chaining.
 *
 * @param  {any}  value
 * @return {unknown}
 */
export const head = (value: any): unknown => {
  return Array.isArray(value) ? value[0] : Array.from(Object.values(value))[0]
}

/**
 * Get the first element of an array. Useful for method chaining.
 *
 * @param  {any}  array
 * @return {any}
 */
export const reset = (array: any): any => {
  return head(array)
}

/**
 * Return the default value of the given value.
 *
 * @param  {unknown}  target
 * @param {Array} args
 * @return {unknown}
 */
export const value = <T>(target: T, ...args: unknown[]): unknown => {
  return target instanceof Function ? target(...args) : target
}
