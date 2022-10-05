import { Collection } from './Collection';
export declare const collect: (value?: unknown) => Collection;
/**
 * Get an item from an array or object using "dot" notation.
 *
 * @param  {unknown}   target
 * @param  {string|Array|number}  key
 * @param  {unknown}   [defaultValue]
 * @return {unknown}
 */
export declare const dataGet: <T, D>(target: T, key: string | unknown[] | number, defaultValue?: D | undefined) => unknown;
/**
 * Get the last element of an array. Useful for method chaining.
 *
 * @param  {any}  array
 * @return {any}
 */
export declare const end: (array: any) => any;
/**
 * Get the first element of an array. Useful for method chaining.
 *
 * @param  {any}  value
 * @return {unknown}
 */
export declare const head: (value: any) => unknown;
/**
 * Get the last element from an array.
 *
 * @param  {Array}  array
 * @return {*}
 */
export declare const last: (array: any) => any;
/**
 * Get the first element of an array. Useful for method chaining.
 *
 * @param  {any}  array
 * @return {any}
 */
export declare const reset: (array: any) => any;
/**
 * Return the default value of the given value.
 *
 * @param  {unknown}  target
 * @param {Array} args
 * @return {unknown}
 */
export declare const value: <T>(target: T, ...args: unknown[]) => unknown;
