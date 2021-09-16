import { Fluent } from './../Fluent'

export const CapsuleManagerTrait = {
  /**
   * The current globally used instance.
   *
   * @member {object}
   */
  instance: undefined,

  /**
   * The container instance.
   *
   * @member {\Illuminate\Contracts\Container\Container}
   */
  container: undefined,

  /**
   * Get the IoC container instance.
   *
   * @return {\Illuminate\Contracts\Container\Container}
   */
  getContainer () {
    return this.container
  },

  /**
   * Make this capsule instance available globally.
   *
   * @return {void}
   */
  setAsGlobal () {
    this.instance = this
  },

  /**
   * Set the IoC container instance.
   *
   * @param  {\Illuminate\Contracts\Container\Container}  container
   * @return {void}
   */
  setContainer (container) {
    this.container = container
  },

  /**
   * Setup the IoC container instance.
   *
   * @param  {\Illuminate\Contracts\Container\Container}  container
   * @return T
   */
  setupContainer (container) {
    this.container = container

    if (!this.container.bound('config')) {
      this.container.instance('config', new Fluent())
    }
  }
}
