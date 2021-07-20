/** @module Test/SDK/Data */

/**
 *
 *
 * @export
 * @class Animal
 */
export class Animal {
  /**
   * Creates an instance of Animal.
   *
   * @constructor
   * @param {string} type
   * @param {number} age
   * @memberof Animal
   */
  constructor (type, age) {
    /** @member {string} */
    this.type = type

    /** @member {number} */
    this.age = age
  }
}
