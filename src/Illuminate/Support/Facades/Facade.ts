import { isNil } from '@devnetic/utils'

import { Application } from './../../Foundation/Application'
import { instanceProxy } from './../Proxies/InstanceProxy'
import { StaticProxy } from './../Proxies/StaticProxy'

// eslint-disable-next-line
export abstract class FacadeClass {
  /**
   * The application instance being facaded.
   *
   * @var \Illuminate\Contracts\Foundation\Application
   */
  protected static app: Application = undefined as any

  /**
   * Indicates if the resolved instance should be cached.
   *
   * @var boolean
   */
  protected static cached = true

  /**
   * The resolved object instances.
   *
   * @var Record<string, any>
   */
  protected static resolvedInstance: Record<string, any> = {}

  constructor () {
    if (new.target === FacadeClass) {
      throw new Error('Cannot create an instance of an abstract class.')
    }

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
  public static __callStatic (method: string, ...args: any[]): any {
    const instance = this.getFacadeRoot()

    if (isNil(instance)) {
      throw new Error('RuntimeException: A facade root has not been set.')
    }

    return instance[method](...args)
  }

  /**
   * Get the registered name of the component.
   *
   * @return string
   *
   * @throws \RuntimeException
   */
  protected static getFacadeAccessor (): string {
    throw new Error('RuntimeException: Facade does not implement getFacadeAccessor method.')
  }

  /**
   * Get the root object behind the facade.
   *
   * @return {*}
   */
  public static getFacadeRoot (): any {
    return this.resolveFacadeInstance(this.getFacadeAccessor())
  }

  /**
   * Resolve the facade root instance from the container.
   *
   * @param  {string}  name
   * @return {*}
   */
  public static resolveFacadeInstance (name: string): any {
    if (!isNil(this.resolvedInstance[name])) {
      return this.resolvedInstance[name]
    }

    if (!isNil(this.app)) {
      if (this.cached) {
        this.resolvedInstance[name] = this.app[name]

        // return this.resolvedInstance[name]
      }
    } else {
      const app = new Application()
      this.setFacadeApplication(app)

      this.resolvedInstance[name] = this.app[name]
    }

    return this.app[name]
  }

  /**
   * Set the application instance.
   *
   * @param  {\Illuminate\Contracts\Foundation\Application}  app
   * @return {void}
   */
  public static setFacadeApplication (app: Application): void {
    this.app = app
  }
}

export const Facade = StaticProxy(FacadeClass) as unknown as typeof FacadeClass
