import {isObject} from 'lodash';

import {dataGet, value} from './Helpers';

export class Arr {
  /**
   * Explode the "value" and "key" arguments passed to "pluck".
   *
   * @param  {string|Array}  value
   * @param  {string|Array|undefined}  [key]
   * @return {Array}
   */
  public static explodePluckParameters(
    value: string | Array<unknown> | number,
    key?: string | Array<unknown>
  ): Array<unknown> {
    value = Array.isArray(value) ? value : value.split('.');

    key = key === undefined || Array.isArray(key) ? key : key.split('.');

    return [value, key];
  }

  /**
   * Return the first element in an array passing a given truth test.
   *
   * @param  {Array}  array
   * @param  {callbackFn}  [callback]
   * @param  {*}  [defaultValue]
   * @returns {*}
   */
  public static first<T>(
    array: Array<T>,
    callback?: Function,
    defaultValue?: unknown
  ): T {
    if (!callback) {
      if (array.length === 0) {
        return value(defaultValue) as T;
      }

      return array[0];
    }

    for (const [k, v] of array.entries()) {
      if (callback && callback(v, k)) {
        return v;
      }
    }

    return value(defaultValue) as T;
  }

  /**
   * Return the last element in an array passing a given truth test.
   *
   * @param  {Array}  array
   * @param  {Function|undefined}  callback
   * @param  {*}  defaultValue
   * @return {*}
   */
  public static last(
    array: Array<unknown>,
    callback?: Function,
    defaultValue?: unknown
  ): unknown {
    if (!callback) {
      return array.length === 0 ? value(defaultValue) : array[array.length - 1];
    }

    return this.first(array.reverse(), callback, defaultValue);
  }

  /**
   * Pluck an array of values from an array.
   *
   * @param  {array}   array
   * @param  {string|Array|number|undefined}  [value]
   * @param  {string|Array|undefined}  [key]
   * @return {Array}
   */
  public static pluck(
    array: Array<unknown>,
    value: string | Array<unknown> | number,
    key?: string | Array<unknown>
  ): Array<unknown> {
    const results = [];

    const [pluckValue, pluckKey] = this.explodePluckParameters(value, key);

    for (const item of array) {
      const itemValue = dataGet(item, pluckValue);

      // If the key is "null", we will just append the value to the array and keep
      // looping. Otherwise we will key the array using the value of the key we
      // received from the developer. Then we'll return the final array form.
      if (!pluckKey) {
        results.push(itemValue);
      } else {
        let itemKey = dataGet(item, pluckKey);

        if (isObject(itemKey) && itemKey.toString !== undefined) {
          itemKey = itemKey.toString();
        }

        Reflect.set(results, itemKey as string, itemValue);
      }
    }

    return results;
  }
}
