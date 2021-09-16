import { value } from '../Collections/helpers'

export class Fluent {
  /**
   * Create a new fluent instance.
   *
   * @param  {array|object}  attributes
   * @return {void}
   */
  constructor (attributes = {}) {
    /**
     * All of the attributes set on the fluent instance.
     *
     * @member {object}
     */
    this.attributes = {}

    for (const [key, value] of Object.entries(attributes)) {
      this.attributes[key] = value
    }

    const handler = {
      get (target, method, receiver) {
        if (Reflect.has(target, method)) {
          return target[method]
        }

        return new Proxy(() => { }, {
          get: handler.get,
          apply: (target, thisArg, parameters) => {
            thisArg.attributes[method] = parameters.length > 0 ? parameters[0] : true

            return thisArg
          }
        })
      },
      getPrototypeOf (target) {
        return Object.getPrototypeOf(target)
      }
    }

    return new Proxy(this, handler)
  }

  /**
   * Get an attribute from the fluent instance.
   *
   * @param  {string}  key
   * @param  {*}  default
   * @return {*}
   */
  get (key, defaultValue = undefined) {
    if (Reflect.has(this.attributes, key)) {
      return this.attributes[key]
    }

    return value(defaultValue)
  }

  /**
   * Get the attributes from the fluent instance.
   *
   * @return {Array}
   */
  getAttributes () {
    return this.attributes
  }

  /**
   * Set the value at the given offset.
   *
   * @param  {string}  offset
   * @param  {*}  value
   * @return {void}
   */
  offsetSet (offset, value) {
    this.attributes[offset] = value

    return this
  }

  set (key, value = true) {
    return this.offsetSet(key, value)
  }
}
