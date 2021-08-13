export class Expression {
  /**
   * Create a new raw query expression.
   *
   * @param  {*}  value
   * @return {void}
   */
  constructor (value) {
    /**
     * The value of the expression.
     *
     * @member *
     */
    this.value = value
  }

  /**
   * Get the value of the expression.
   *
   * @return {*}
   */
  getValue () {
    return this.value
  }

  /**
   * Get the value of the expression.
   *
   * @return string
   */
  toString () {
    return this.getValue()
  }
}
