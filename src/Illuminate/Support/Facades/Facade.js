import { isObject } from '@devnetic/utils'

import { Application } from './../../Foundation/Application'
import { instanceProxy } from './../Proxies/InstanceProxy'
import { throwException } from './../helpers'
import { StaticProxy } from './StaticProxy'

class FacadeClass {
  constructor () {
    if (new.target === FacadeClass) {
      throwException('abstract')
    }

    /**
     * The application instance being facaded.
     *
     * @member {\Illuminate\Contracts\Foundation\Application}
     */
    this.app = undefined

    /**
     * The resolved object instances.
     *
     * @member {Array}
     */
    this.resolvedInstance = {}

    return instanceProxy(this)
  }

  /**
   * Handle dynamic, static calls to the object.
   *
   * @param  {string}  method
   * @param  {Array}  args
   * @return {*}
   *
   * @throws {\RuntimeException}
   */
  static callStatic (method, ...args) {
    const instance = this.getFacadeRoot()

    if (!instance) {
      throw new Error('RuntimeException: A facade root has not been set.')
    }

    return instance[method](...args)
  }

  /**
   * Get the registered name of the component.
   *
   * @return {string}
   *
   * @throws \RuntimeException
   */
  static getFacadeAccessor () {
    throw new Error('RuntimeException": Facade does not implement getFacadeAccessor method.')
  }

  /**
   * Get the root object behind the facade.
   *
   * @return {*}
   */
  static getFacadeRoot () {
    return this.resolveFacadeInstance(this.getFacadeAccessor())
  }

  /**
   * Resolve the facade root instance from the container.
   *
   * @param  {object|string}  name
   * @return {*}
   */
  static resolveFacadeInstance (name) {
    if (isObject(name)) {
      return name
    }

    if (this.resolvedInstance[name]) {
      return this.resolvedInstance[name]
    }

    if (this.app) {
      this.resolvedInstance[name] = this.app[name]
    } else {
      const app = new Application()
      this.setFacadeApplication(app)

      this.resolvedInstance[name] = this.app[name]
    }

    return this.resolvedInstance[name]
  }

  /**
   * Set the application instance.
   *
   * @param  {\Illuminate\Contracts\Foundation\Application}  app
   * @return {void}
   */
  static setFacadeApplication (app) {
    this.app = app
  }
}

FacadeClass.app = undefined
FacadeClass.resolvedInstance = {}

export const Facade = StaticProxy(FacadeClass)
