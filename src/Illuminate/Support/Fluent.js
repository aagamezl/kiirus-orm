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

    // return new Proxy(this, this)
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
   * Set the value at the given offset.
   *
   * @param  {string}  offset
   * @param  {*}  value
   * @return {void}
   */
  offsetSet (offset, value) {
    this.attributes[offset] = value
  }

  // get (target, method) {
  //   if (Reflect.has(target, method)) {
  //     return Reflect.get(target, method)
  //   }

  //   console.log(arguments)
  //   // return (...parameters) => {
  //   //   this.attributes[method] = parameters.length > 0 ? parameters[0] : true

  //   //   return this
  //   // }
  // }
}
