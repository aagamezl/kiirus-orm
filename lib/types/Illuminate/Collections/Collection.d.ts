import { EnumeratesValues } from './Traits/EnumeratesValues';
import { Macroable } from '../Macroable/Traits/Macroable';
export interface Collection extends EnumeratesValues, Macroable {
}
export declare class Collection {
    /**
   * The items contained in the collection.
   *
   * @var array<TKey, TValue>
   */
    protected items: any;
    /**
     * Create a new collection.
     *
     * @param  {\Illuminate\Contracts\Support\Arrayable<TKey, TValue>|iterable<TKey, TValue>|null}  items
     * @return {void}
     */
    constructor(items?: unknown);
    /**
     * Get all of the items in the collection.
     *
     * @return array<TKey, TValue>
     */
    all(): any[];
    /**
     * Count the number of items in the collection.
     *
     * @return {number}
     */
    count(): number;
    /**
     * Get the first item from the collection passing the given truth test.
     *
     * @param  {Function}  [callback]
     * @param  {unknown}  [defaultValue]
     * @return {unknown}
     */
    first(callback?: (...args: any[]) => void, defaultValue?: unknown): unknown;
    /**
     * Concatenate values of a given key as a string.
     *
     * @param  {string}  value
     * @param  {string}  [glue]
     * @return {string}
     */
    implode(value: string, glue?: string): string;
    /**
     * Determine if the collection is empty or not.
     *
     * @return {boolean}
     */
    isEmpty(): boolean;
    /**
     * Join all items from the collection using a string. The final items can use a separate glue string.
     *
     * @param  {string}  glue
     * @param  {string}  finalGlue
     * @return {string}
     */
    join(glue: string, finalGlue?: string): string;
    /**
     * Get the last item from the collection.
     *
     * @param  {Function|undefined}  [callback]
     * @param  {unknown}  [defaultValue]
     * @return {unknown}
     */
    last(callback?: Function, defaultValue?: unknown): unknown;
    /**
   * Run a map over each of the items.
   *
   * @param  {Function}  callback
   * @return {Collection}
   */
    map(callback: <I, K>(item: I, key: K) => unknown): Collection;
    /**
     * Get the values of a given key.
     *
     * @param  {string|Array|number}  value
     * @param  {string|undefined}  key
     * @return {Collection}
     */
    pluck<T>(value?: T, key?: string): Collection;
    /**
     * Get and remove the last N items from the collection.
     *
     * @param  {number}  count
     * @return {static<int, TValue>|TValue|undefined}
     */
    pop(count?: number): unknown;
}
