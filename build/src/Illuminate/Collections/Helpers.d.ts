import { Collection } from './Collection';
export declare const collect: (items?: any) => Collection;
/**
 * Return the default value of the given value.
 *
 * @param  any  value
 * @return any
 */
export declare const value: (value: any, ...args: any) => any;
/**
 * Get an item from an array or object using "dot" notation.
 *
 * @param  {any}   target
 * @param  {string|array|number}  key
 * @param  {*}   defaultValue
 * @return {*}
 */
export declare const dataGet: (target: any, key?: string | number | any[] | undefined, defaultValue?: any) => any;
/**
 * Get the last element of an array. Useful for method chaining.
 *
 * @param  array  array
 * @return any
 */
export declare const end: (array: Array<any>) => any;
/**
 * Get the first element of an array. Useful for method chaining.
 *
 * @param  array  array
 * @return any
 */
export declare const head: (array: any) => any;
/**
 * Get the last element from an array.
 *
 * @param  array  array
 * @return any
 */
export declare const last: (array: Array<any>) => any;
/**
 * Get the first element of an array. Useful for method chaining.
 *
 * @param  array  array
 * @return any
 */
export declare const reset: (array: any) => any;
