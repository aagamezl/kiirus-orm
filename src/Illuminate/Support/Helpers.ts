import { HigherOrderTapProxy } from "./HigherOrderTapProxy";

/**
 * Call the given Closure with the given value then return the value.
 *
 * @param  any  value
 * @param  callable|null  callback
 * @return any
 */
export const tap = (value: any, callback?: Function): any => {
  if (!callback) {
    return new HigherOrderTapProxy(value);
  }

  callback(value);

  return value;
}

/**
 * Returns an array with all keys from array lowercased or uppercased.
 *
 * @param {object} value
 * @param {string} changeCase
 * @returns {object}
 */
export const changeKeyCase = (value: Array<any>, changeCase: string = 'CASE_LOWER'): any => {
  const result = {};

  if (value && typeof value === 'object') {
    const casefunction = (!changeCase || changeCase === 'CASE_LOWER') ? 'toLowerCase' : 'toUpperCase';

    for (let key in value) {
      (result as any)[(key as any)[casefunction]()] = value[key];
    }

    return result;
  }
}

export const ksort = (value: any) => Object.keys(value).sort().reduce((result: any, key: string) => {
  result[key] = value[key];

  return result;
}, {});
