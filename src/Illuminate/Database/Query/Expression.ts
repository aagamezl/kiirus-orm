export class Expression {
  constructor(protected value: unknown) {
  }

  /**
   * Get the value of the expression.
   *
   * @return mixed
   */
  public getValue(): any {
    return this.value;
  }
}
