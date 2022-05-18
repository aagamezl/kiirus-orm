export declare class Macroable {
    /**
     * The registered string macros.
     *
     * @var array
     */
    protected static macros: never[];
    /**
     * Checks if macro is registered.
     *
     * @param  {string}  name
     * @return {boolean}
     */
    static hasMacro(name: string): boolean;
    /**
     * Register a custom macro.
     *
     * @param  {string}  name
     * @param  {object|Function}  macro
     * @return {void}
     */
    static macro(name: string, macro: object | Function): void;
    /**
     * Dynamically handle calls to the class.
     *
     * @param  {string}  method
     * @param  {array}  parameters
     * @return {any}
     *
     * @throws \BadMethodCallException
     */
    __call(method: string, parameters: any): any;
}
