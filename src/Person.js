/** @module Test/SDK/Data */

import { Animal } from './Animal'

/**
 *
 * @export
 * @class Person
 */
export class Person {
  /**
   * Creates an instance of Person.
   *
   * @constructor
   * @param {*} name
   * @param {*} age
   * @memberof Person
   */
  constructor (name, age) {
    this.name = name
    this.age = age

    /** @member {Animal} */
    this.pet = new Animal('Dog', 1)
  }

  /**
   * Return the person name
   *
   * @method
   * @return {string}
   * @memberof Person
   */
  getName () {
    return this.name
  }

  /**
   * Return the person age
   *
   * @return {number}
   * @memberof Person
   */
  getAge () {
    return this.age
  }

  /**
   * Return the persona animal
   *
   * @method
   * @return Animal
   */
  getPet () {
    return this.pet
  }
}
