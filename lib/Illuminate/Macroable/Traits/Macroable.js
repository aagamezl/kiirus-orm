"use strict";
// export const Macroable = {
//   /**
//    * The registered string macros.
//    *
//    * @var array
//    */
//   macros: {}
// }
Object.defineProperty(exports, "__esModule", { value: true });
exports.Macroable = void 0;
class Macroable {
    /**
     * Checks if macro is registered.
     *
     * @param  {string}  name
     * @return {boolean}
     */
    static hasMacro(name) {
        return this.macros[name] !== undefined;
    }
    /**
     * Register a custom macro.
     *
     * @param  {string}  name
     * @param  {object|Function}  macro
     * @return {void}
     */
    static macro(name, macro) {
        this.macros[name] = macro;
    }
    /**
     * Dynamically handle calls to the class.
     *
     * @param  {string}  method
     * @param  {array}  parameters
     * @return {any}
     *
     * @throws \BadMethodCallException
     */
    __call(method, parameters) {
        // if ((this.constructor as any).hasMacro(method) === false) {
        if (this.hasMacro(method) === false) {
            throw new Error(`BadMethodCallException: Method ${this.constructor.name}::${method} does not exist.`);
        }
        let macro = this.constructor.macros[method];
        if (macro instanceof Function) {
            macro = macro.bindTo(this, this.constructor.name);
        }
        return macro(...parameters);
    }
}
exports.Macroable = Macroable;
/**
 * The registered string macros.
 *
 * @var array
 */
Macroable.macros = [];
//# sourceMappingURL=Macroable.js.map