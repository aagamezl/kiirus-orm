import { callbackFn } from '../Support/Types';
export declare class Collection {
    /**
     * The items contained in the collection.
     *
     * @var array
     */
    protected items: Array<any>;
    /**
     * Create a new collection.
     *
     * @param  mixed  items
     * @return void
     */
    constructor(items: Array<any>);
    /**
     * Get all of the items in the collection.
     *
     * @return array
     */
    all(): any;
    /**
     * Determine if an item exists in the collection.
     *
     * @param  any  key
     * @param  [any]  operator
     * @param  [any]  value
     * @return boolean
     */
    contains(key: any, operator?: any, value?: any): boolean;
    /**
     * Count the number of items in the collection.
     *
     * @return number
     */
    count(): number;
    /**
     * Run a filter over each of the items.
     *
     * @param  [callbackFn]  callback
     * @return static
     */
    filter(callback?: callbackFn): any;
    /**
     * Get the first item from the collection passing the given truth test.
     *
     * @param  [callbackFn]  callback
     * @param  [any]  defaultValue
     * @return any
     */
    first(callback?: callbackFn, defaultValue?: any): any;
    /**
     * Results array of items from Collection or Arrayable.
     *
     * @param  any  items
     * @return array
     */
    protected getArrayableItems(items: any): any;
    /**
     * Concatenate values of a given key as a string.
     *
     * @param  string  value
     * @param  [string]  glue
     * @return string
     */
    implode(value: string, glue?: string): string;
    /**
     * Determine if the collection is empty or not.
     *
     * @return boolean
     */
    isEmpty(): boolean;
    /**
   * Join all items from the collection using a string. The final items can use a separate glue string.
   *
   * @param  string  glue
   * @param  string  finalGlue
   * @return string
   */
    join(glue: string, finalGlue?: string): string;
    /**
     * Get the last item from the collection.
     *
     * @param  callable|null  callback
     * @param  mixed  defaultValue
     * @return mixed
     */
    last(callback?: callbackFn, defaultValue?: any): any;
    /**
     * Run a map over each of the items.
     *
     * @param  callable  callback
     * @return static
     */
    map(callback: callbackFn): Collection;
    /**
     * Get an operator checker callback.
     *
     * @param  string  key
     * @param  string  operator
     * @param  any  value
     * @return Function
     */
    protected operatorForWhere(key: string, operator?: string, value?: any): Function;
    /**
     * Get the values of a given key.
     *
     * @param  string|array|int|null  value
     * @param  string|null  key
     * @return static
     */
    pluck(value: string | Array<any> | number, key?: string): Collection;
    /**
     * Get and remove the last item from the collection.
     *
     * @return any
     */
    pop(): any;
    /**
     * Create a collection of all elements that do not pass a given truth test.
     *
     * @param  callbackFn|any  callback
     * @return static
     */
    reject(callback?: callbackFn | any): any;
    /**
     * Determine if the given value is callable, but not a string.
     *
     * @param  unknown  value
     * @return boolean
     */
    protected useAsCallable(value: unknown): boolean;
}
