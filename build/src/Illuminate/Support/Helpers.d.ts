/**
 * Call the given Closure with the given value then return the value.
 *
 * @param  any  value
 * @param  callable|null  callback
 * @return any
 */
export declare const tap: (value: any, callback?: Function | undefined) => any;
/**
 * Returns an array with all keys from array lowercased or uppercased.
 *
 * @param {object} value
 * @param {string} changeCase
 * @returns {object}
 */
export declare const changeKeyCase: (value: Array<any>, changeCase?: string) => any;
export declare const ksort: (value: any) => any;
