import {isObject} from 'lodash';

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
  key?: string | Array<unknown> | number | unknown,
  defaultValue?: unknown
) => {
  if (key === undefined) {
    return target;
  }

  key = Array.isArray(key) ? key : String(key).split('.');

  for (const currentValue of key) {
    const targetValue = Reflect.get(target as object, String(currentValue));

    if (Array.isArray(target)) {
      if (targetValue === undefined) {
        return value(defaultValue);
      }

      target = targetValue;
    } else if (target instanceof Object) {
      if (targetValue === undefined) {
        return value(defaultValue);
      }

      target = targetValue;
    } else if (isObject(target)) {
      if (targetValue === undefined) {
        return value(defaultValue);
      }

      target = targetValue;
    } else {
      return value(defaultValue);
    }
  }

  return target;
};
