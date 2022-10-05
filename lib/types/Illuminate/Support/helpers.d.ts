import { HigherOrderTapProxy } from './HigherOrderTapProxy';
export declare const castArray: <T>(value?: T | T[] | undefined) => T[];
/**
 * Returns an array with all keys from array lowercased or uppercased.
 *
 * @param {Record<string, unknown>} value
 * @param {string} [changeCase=CAMEL_CASE]
 * @returns {Record<string, unknown>}
 */
export declare const changeKeyCase: (value: Record<string, unknown>, changeCase?: string) => Record<string, unknown>;
export declare const isDirectory: (path: string) => boolean;
export declare const isBoolean: (value: unknown) => boolean;
export declare const isFalsy: (value: unknown) => boolean;
export declare const isTruthy: (value: unknown) => boolean;
export declare const objectDiffKey: (target: object, ...from: Array<Record<string, unknown>>) => object;
/**
 * Get a value from the array, and remove it.
 *
 * @param  {Record<string, unknown>}  array
 * @param  {string}  key
 * @param  {any}  [defaultValue=undefined]
 * @return {any}
 */
export declare const pull: <T extends Record<string, unknown>>(array: T, key: string, defaultValue?: unknown) => unknown;
export declare const spaceship: (a: any, b: any) => number;
/**
 * Call the given Closure with the given value then return the value.
 *
 * @param  {unknown}  value
 * @param  {callable}  [callback=undefined]
 * @return {unknown}
 */
export declare const tap: <T>(value: T, callback?: (<T_1>(instance: T_1) => void) | undefined) => HigherOrderTapProxy | T;
