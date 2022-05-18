export class Expression {
  /**
   * The value of the expression.
   *
   * @var unknown
   */
  protected value: unknown

  /**
   * Create a new raw query expression.
   *
   * @param  {any}  value
   * @return {void}
   */
  public constructor (value: any) {
    this.value = value
  }

  /**
   * Get the value of the expression.
   *
   * @return {unknown}
   */
  public getValue (): unknown {
    return this.value
  }

  /**
   * Get the value of the expression.
   *
   * @return {string}
   */
  public toString (): string {
    return String(this.getValue())
  }
}
