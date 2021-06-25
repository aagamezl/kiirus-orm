import { callbackFn } from '../Support/Types';
export declare class Arr {
    /**
     * Explode the "value" and "key" arguments passed to "pluck".
     *
     * @param  {string|array}  value
     * @param  {[string|Array<any>]}  key
     * @return {array}
     */
    static explodePluckParameters(value: string | Array<any>, key?: string | Array<any>): (any[] | undefined)[];
    /**
     * Return the first element in an array passing a given truth test.
     *
     * @param  Array<any>  array
     * @param  [callbackFn]  callback
     * @param  any  defaultValue
     * @return any
     */
    static first(array: Array<any>, callback?: callbackFn, defaultValue?: any): any;
    /**
     * Flatten a multi-dimensional array into a single level.
     *
     * @param  iterable  array
     * @param  int  depth
     * @return array
     */
    static flatten(array: Array<any> | Object, depth?: number): any[];
    /**
     * Return the last element in an array passing a given truth test.
     *
     * @param  array  array
     * @param  callable|null  callback
     * @param  any  defaultValue
     * @return any
     */
    static last(array: Array<any>, callback?: callbackFn, defaultValue?: any): any;
    /**
     * Pluck an array of values from an array.
     *
     * @param  {array}   array
     * @param  {string|array|number}  value
     * @param  {string|array}  key
     * @return {array}
     */
    static pluck(array: Array<any>, value: string | Array<any> | number, key?: string | Array<any>): Array<any>;
    static values(array: Array<any>): Array<any>;
    /**
     * Filter the array using the given callback.
     *
     * @param  Array<any>  array
     * @param  callbackFn  callback
     * @return Array<any>
     */
    static where(array: Array<any>, callback: callbackFn): Array<any>;
    /**
     * If the given value is not an array and not null, wrap it in one.
     *
     * @param  mixed  value
     * @return array
     */
    static wrap(value: any): any[];
}
