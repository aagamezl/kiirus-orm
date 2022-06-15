export class ForwardsCalls {
  /**
   * Forward a method call to the given object.
   *
   * @param  {any}  object
   * @param  {string}  method
   * @param  {any[]}  parameters
   * @return {any}
   *
   * @throws \BadMethodCallException
   */
  protected forwardCallTo (object: any, method: string, parameters: any[]): any {
    try {
      return object[method](...parameters)
    } catch (error) {
      this.throwBadMethodCallException(method)
    }
  }

  /**
 * Throw a bad method call exception for the given method.
 *
 * @param  {string}  method
 * @return {void}
 *
 * @throws {\BadMethodCallException}
 */
  protected throwBadMethodCallException (method: string): void {
    throw new Error(`BadMethodCallException: Call to undefined method ${this.constructor.name}::${method}`)
  }
}
