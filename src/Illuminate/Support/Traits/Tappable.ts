import { tap } from '../helpers'
import { HigherOrderTapProxy } from '../HigherOrderTapProxy'

export class Tappable {
  /**
   * Call the given Closure with this instance then return the instance.
   *
   * @param  {callable}  [callback=undefined]
   * @return {this|\Illuminate\Support\HigherOrderTapProxy}
   */
  public tap <T>(callback?: <P>(instance: P) => unknown): T | HigherOrderTapProxy {
    return tap(this, callback) as T | HigherOrderTapProxy
  }
}
