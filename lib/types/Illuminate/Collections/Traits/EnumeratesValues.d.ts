export declare class EnumeratesValues {
    /**
     * Results array of items from Collection or Arrayable.
     *
     * @param  {unknown}  items
     * @return {array<TKey, TValue>}
     */
    protected getArrayableItems<T>(items: T): unknown;
    /**
     * Determine if the given value is callable, but not a string.
     *
     * @param  {*}  value
     * @return {boolean}
     */
    protected useAsCallable(value: any): boolean;
    /**
     * Get a value retrieving callback.
     *
     * @param  {Function|string}  [value]
     * @return {Function}
     */
    protected valueRetriever(value: Function | string): Function;
}
