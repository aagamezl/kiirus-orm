import {HigherOrderTapProxy} from './HigherOrderTapProxy';

/**
 * Call the given Closure with the given value then return the value.
 *
 * @param  {object}  value
 * @param  {Function}  [callback]
 * @returns {object}
 */
export const tap = <TargetType>(
  value: object,
  callback?: Function
): TargetType => {
  if (!callback) {
    return new HigherOrderTapProxy(value) as unknown as TargetType;
  }

  callback(value);

  return value as unknown as TargetType;
};

/**
 * Returns an array with all keys from array lowercased or uppercased.
 *
 * @param {object} value
 * @param {string} changeCase
 * @returns {object}
 */
export const changeKeyCase = (
  value: object,
  changeCase = 'CASE_LOWER'
): Object => {
  const result = {};

  if (value && typeof value === 'object') {
    const casefunction =
      !changeCase || changeCase === 'CASE_LOWER'
        ? (key: string) => key.toLowerCase()
        : (key: string) => key.toUpperCase();

    for (const key in value) {
      if (Reflect.has(value, key)) {
        Reflect.set(result, casefunction(key), Reflect.get(value, key));
      }
    }

    return result;
  }

  return value;
};

export const ksort = (value: object): object =>
  Object.keys(value)
    .sort()
    .reduce((result: object, key: string) => {
      Reflect.set(result, key, Reflect.get(value, key));

      return result;
    }, {});
