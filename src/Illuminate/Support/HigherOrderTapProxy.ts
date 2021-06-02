export class HigherOrderTapProxy {
  /**
   * The target being tapped.
   *
   * @var any
   */
  public target: any;

  /**
   * Create a new tap proxy instance.
   *
   * @param  any  target
   * @return void
   */
  public constructor(target: any) {
    this.target = target;
  }

  /**
   * Dynamically pass method calls to the target.
   *
   * @param  string  method
   * @param  array  parameters
   * @return any
   */
  public get(method: string, parameters: Array<any>): any {
    return this.target[method](...parameters)
  }

  // /**
  //  * Dynamically pass method calls to the target.
  //  *
  //  * @param  string  method
  //  * @param  array  parameters
  //  * @return any
  //  */
  // public function __call(method, parameters) {
  //   this.target.{ method }(...parameters);

  //   return this.target;
  // }
}
