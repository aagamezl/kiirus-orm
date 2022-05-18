export class HigherOrderTapProxy {
  /**
   * The target being tapped.
   *
   * @var unknown
   */
  public target: unknown

  /**
   * Create a new tap proxy instance.
   *
   * @param  {unknown}  target
   * @return {void}
   */
  constructor (target: unknown) {
    this.target = target
  }
}
