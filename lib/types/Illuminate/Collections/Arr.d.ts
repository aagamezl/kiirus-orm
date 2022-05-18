export declare class Arr {
    /**
     * Determine whether the given value is array accessible.
     *
     * @param  {unknown}  $value
     * @return {boolean}
     */
    static accessible<T>(value: T): boolean;
    /**
     * Collapse an array of arrays into a single array.
     *
     * @param  {iterable}  array
     * @return [array]
     */
    static collapse<T>(array: T): unknown[];
    /**
     * Determine if the given key exists in the provided array.
     *
     * @param  {ArrayAccess|array}  array
     * @param  {string|number}  key
     * @return {boolean}
     */
    static exists<T>(array: T, key: string | number): boolean;
    /**
     * Explode the "value" and "key" arguments passed to "pluck".
     *
     * @param  {string|Array}  value
     * @param  {string|Array}  [key]
     * @return {Array}
     */
    static explodePluckParameters<V, K>(value: V, key?: K): [V, K];
    /**
     * Return the first element in an array passing a given truth test.
     *
     * @param  {Array}  array
     * @param  {Function}  [callback]
     * @param  {unknown}  [defaultValue]
     * @return {unknown}
     */
    static first(array: unknown[], callback?: Function, defaultValue?: unknown): unknown;
    /**
     * Flatten a multi-dimensional array into a single level.
     *
     * @param  {Array}  array
     * @param  {number}  depth
     * @return {Array}
     */
    static flatten<T>(array: Iterable<T> | object, depth?: number): any[];
    /**
     * Get an item from an array using "dot" notation.
     *
     * @param  {object|Array}  array
     * @param  {string|number|undefined}  key
     * @param  {*}  default
     * @return {*}
     */
    static get(array: any, key?: any, defaultValue?: null): any;
    /**
     *
     *
     * @public static
     * @param {Array | object} value
     * @returns {Array}
     * @memberof Arr
     */
    static iterable(value: any[]): any[];
    /**
     * Return the last element in an array passing a given truth test.
     *
     * @param  {Array}  array
     * @param  {Function|undefined}  callback
     * @param  {*}  defaultValue
     * @return {*}
     */
    static last(array: unknown[], callback?: Function, defaultValue?: unknown): unknown;
    /**
     * Pluck an array of values from an array.
     *
     * @param  {Array}   array
     * @param  {string|Array|number|undefined}  [value]
     * @param  {string|Array|undefined}  [key]
     * @return {Array}
     */
    static pluck<A, V, K>(array: A[], value: V, key?: K): A;
    /**
     * Shuffle the given array and return the result.
     *
     * @param  {Array}  array
     * @return {Array}
     */
    static shuffle(array: any[]): any[];
    /**
     * If the given value is not an array and not null, wrap it in one.
     *
     * @param  {unknown}  value
     * @return {Array}
     */
    static wrap(value: any): any[];
}
