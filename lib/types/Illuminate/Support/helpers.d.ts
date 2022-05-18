import { HigherOrderTapProxy } from './HigherOrderTapProxy';
export declare const isDirectory: (path: string) => boolean;
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
/**
 * Call the given Closure with the given value then return the value.
 *
 * @param  {unknown}  value
 * @param  {callable}  [callback=undefined]
 * @return {unknown}
 */
export declare const tap: <T>(value: T, callback?: (<T_1>(instance: T_1) => void) | undefined) => HigherOrderTapProxy | T;
