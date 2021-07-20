export class HigherOrderTapProxy {
  /**
   * Create a new tap proxy instance.
   *
   * @param  {*}  target
   * @return {void}
   */
  constructor (target) {
    /**
     * The target being tapped.
     *
     * @type {*}
     */
    this.target = target

    const handler = {
      get: (target, method) => Reflect.get(target, method)
    }

    return new Proxy(target, handler)
  }
}
