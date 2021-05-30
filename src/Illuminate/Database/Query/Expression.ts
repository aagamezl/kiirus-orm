export class Expression {
  /**
   * The value of the expression.
   *
   * @var any
   */
  protected value;

  /**
   * Create a new raw query expression.
   *
   * @param  any  value
   * @return void
   */
  constructor(value: any) {
    this.value = value;
  }

  /**
   * Get the value of the expression.
   *
   * @return any
   */
  public getValue(): any {
    return this.value;
  }
}
