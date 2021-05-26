import * as utils from '@devnetic/utils';

import { callbackFn } from '../Support/Types';
import { Collection } from './Collection';
import { dataGet, value } from './Helpers';

export class Arr {
  /**
   * Explode the "value" and "key" arguments passed to "pluck".
   *
   * @param  {string|array}  value
   * @param  {[string|Array<any>]}  key
   * @return {array}
   */
  public static explodePluckParameters(value: string | Array<any>, key?: string | Array<any>) {
    value = Array.isArray(value) ? value : value.split('.')

    key = key === undefined || Array.isArray(key) ? key : key.split('.')

    return [value, key]
  }

  /**
   * Return the first element in an array passing a given truth test.
   *
   * @param  Array<any>  array
   * @param  [callbackFn]  callback
   * @param  any  defaultValue
   * @return any
   */
  public static first(array: Array<any>, callback?: callbackFn, defaultValue?: any): any {
    if (!callback) {
      if (array.length === 0) {
        return value(defaultValue);
      }

      for (const item of array) {
        return item;
      }
    }

    for (const [key, value] of array) {
      if (callback && callback(value, key)) {
        return value;
      }
    }

    return value(defaultValue);
  }

  /**
   * Flatten a multi-dimensional array into a single level.
   *
   * @param  iterable  array
   * @param  int  depth
   * @return array
   */
  public static flatten(array: Array<any> | Object, depth: number = Number.MAX_SAFE_INTEGER) {
    const result = [];

    for (let [key, item] of Object.entries(array)) {
      item = item instanceof Collection ? item.all() : item;

      if (!Array.isArray(item)) {
        result.push(item);
      } else {
        const values: Array<any> = depth === 1
          ? item
          : this.flatten(item, depth - 1);

        for (const value of values) {
          result.push(value);
        }
      }
    }

    return result;
  }

  /**
   * Return the last element in an array passing a given truth test.
   *
   * @param  array  array
   * @param  callable|null  callback
   * @param  any  defaultValue
   * @return any
   */
  public static last(array: Array<any>, callback?: callbackFn, defaultValue?: any): any {
    if (!callback) {
      return array.length === 0 ? value(defaultValue) : array[array.length - 1];
    }

    return this.first(array.reverse(), callback, defaultValue);
  }

  /**
   * Pluck an array of values from an array.
   *
   * @param  {array}   array
   * @param  {string|array|number}  value
   * @param  {string|array}  key
   * @return {array}
   */
  public static pluck(
    array: Array<any>,
    value: string | Array<any> | number,
    key?: string | Array<any>
  ): Array<any> {
    const results = [];

    [value, key] = this.explodePluckParameters(value as Array<any>, key) as Array<any>;

    for (const item of array) {
      const itemValue = dataGet(item, value);

      // If the key is "null", we will just append the value to the array and keep
      // looping. Otherwise we will key the array using the value of the key we
      // received from the developer. Then we'll return the final array form.
      if (!key) {
        results.push(itemValue);
      } else {
        let itemKey = dataGet(item, key);

        if (utils.getType(itemKey) === 'Object' && itemKey.toString !== undefined) {
          itemKey = itemKey.toString();
        }

        results[itemKey] = itemValue;
      }
    }

    return results;
  }

  /**
   * If the given value is not an array and not null, wrap it in one.
   *
   * @param  mixed  value
   * @return array
   */
  public static wrap(value: any) {
    if (!value) {
      return [];
    }

    return Array.isArray(value) ? value : [value];
  }
}
