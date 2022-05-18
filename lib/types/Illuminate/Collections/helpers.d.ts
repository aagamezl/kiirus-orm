import { Collection } from './Collection';
export declare const collect: (value: unknown) => Collection;
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
 * Return the default value of the given value.
 *
 * @param  {unknown}  target
 * @param {Array} args
 * @return {unknown}
 */
export declare const value: <T>(target: T, ...args: unknown[]) => unknown;
