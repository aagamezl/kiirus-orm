export const Macroable = {
  /**
   * The registered string macros.
   *
   * @member {Array}
   */
  macros: [],

  __call (target, method, receiver) {
    if (!target.hasMacro(method)) {
      if (typeof method === 'symbol') {
        return target[method]
      }

      throw new Error(
        `BadMethodCallException: Method ${target.constructor.name}.${method} does not exist.`
      )
    }

    let macro = target.macros[method]

    if (macro instanceof Function) {
      macro = macro.bind(null, target.constructor)
    }

    return (...parameters) => {
      return macro(...parameters)
    }
  },

  /**
   * Checks if macro is registered.
   *
   * @param  {string}  name
   * @return {boolean}
   */
  hasMacro (name) {
    return this.macros[name] !== undefined
  },

  /**
   * Register a custom macro.
   *
   * @param  string  name
   * @param  object|callable  macro
   * @return void
   */
  macro (name, macro) {
    this.macros[name] = macro
  }
}
