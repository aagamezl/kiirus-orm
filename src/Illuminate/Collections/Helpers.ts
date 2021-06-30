import * as utils from '@devnetic/utils';

import {Collection} from './Collection';

export const collect = <T>(items?: T): Collection<T> => new Collection(items);

/**
 * Return the default value of the given value.
 *
 * @param  {*}  target
 * @param {Array} args
 * @returns {*}
 */
export const value = (target: unknown, ...args: Array<unknown>): unknown =>
  target instanceof Function ? target(...args) : value;

/**
 * Get an item from an array or object using "dot" notation.
 *
 * @param  {*}   target
 * @param  {string|Array|number}  key
 * @param  {*}   defaultValue
 * @returns {*}
 */
export const dataGet = (
  target: unknown,
  key?: string | Array<unknown> | number,
  defaultValue?: unknown
) => {
  if (key === undefined) {
    return target;
  }

  key = Array.isArray(key) ? key : String(key).split('.');

  for (const value of key) {
    if (Array.isArray(target)) {
      if (target[value] === undefined) {
        return value(defaultValue);
      }

      target = target[value];
    } else if (target instanceof Object) {
      if (target[value] === undefined) {
        return value(defaultValue);
      }

      target = target[value];
    } else if (utils.getType(target) === 'Object') {
      if (target[value] === undefined) {
        return value(defaultValue);
      }

      target = target[value];
    } else {
      return value(defaultValue);
    }
  }

  return target;
};

/**
 * Get the last element of an array. Useful for method chaining.
 *
 * @param  array  array
 * @return any
 */
export const end = (array: Array<any>) => {
  return array[array.length - 1];
};

/**
 * Get the first element of an array. Useful for method chaining.
 *
 * @param  array  array
 * @return any
 */
export const head = (array: any) => {
  return Array.isArray(array) ? array[0] : Array.from(Object.values(array))[0];
};

/**
 * Get the last element from an array.
 *
 * @param  array  array
 * @return any
 */
export const last = (array: Array<any>) => {
  return end(array);
};

/**
 * Get the first element of an array. Useful for method chaining.
 *
 * @param  array  array
 * @return any
 */
export const reset = (array: any) => {
  return head(array);
};
