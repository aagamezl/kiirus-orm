// export const Macroable = {
//   /**
//    * The registered string macros.
//    *
//    * @var array
//    */
//   macros: {}
// }

export class Macroable {
  /**
   * The registered string macros.
   *
   * @var array
   */
  protected static macros = []

  /**
   * Checks if macro is registered.
   *
   * @param  {string}  name
   * @return {boolean}
   */
  public static hasMacro (name: string): boolean {
    return (this.macros as any)[name] !== undefined
  }

  /**
   * Register a custom macro.
   *
   * @param  {string}  name
   * @param  {object|Function}  macro
   * @return {void}
   */
  public static macro (name: string, macro: object | Function): void {
    (this.macros as any)[name] = macro
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
  public __call (method: string, parameters: any): any {
    // if ((this.constructor as any).hasMacro(method) === false) {
    if ((this as any).hasMacro(method) === false) {
      throw new Error(
        `BadMethodCallException: Method ${this.constructor.name}::${method} does not exist.`
      )
    }

    let macro = (this.constructor as any).macros[method]

    if (macro instanceof Function) {
      macro = macro.bindTo(this, this.constructor.name)
    }

    return macro(...parameters)
  }
}
