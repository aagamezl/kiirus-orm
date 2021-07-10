export class Expression {
  /**
   * The value of the expression.
   *
   * @member any
   */
  protected value;

  /**
   * Create a new raw query expression.
   *
   * @param  {*}  value
   * @returns {void}
   */
  constructor(value: unknown) {
    this.value = value;
  }

  /**
   * Get the value of the expression.
   *
   * @returns {*}
   */
  public getValue(): unknown {
    return this.value;
  }

  /**
   * Get the value of the expression.
   *
   * @return {string}
   */
  public toString(): string {
    return String(this.getValue());
  }
}
