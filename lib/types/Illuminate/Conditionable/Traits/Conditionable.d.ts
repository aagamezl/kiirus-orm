export declare class Conditionable {
    /**
     * Apply the callback's query changes if the given "value" is false.
     *
     * @param  {*}  value
     * @param  {Function}  callbackFunc
     * @param  {Function}  [defaultCallback]
     * @return {this|*}
     */
    unless(value: unknown, callbackFunc?: Function, defaultCallback?: Function): this;
    /**
     * Apply the callback's query changes if the given "value" is true.
     *
     * @param  {unknown}  value
     * @param  {Function}  callback
     * @param  {Function|undefined}  [defaultCallback]
     * @return {*|this}
     */
    when(value: unknown, callbackFunc?: Function, defaultCallback?: Function): this;
}
