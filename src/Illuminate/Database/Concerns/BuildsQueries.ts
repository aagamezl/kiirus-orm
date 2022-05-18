import { Conditionable } from '../../Conditionable/Traits/Conditionable'
import { use } from '../../Support/Traits/use'

export interface BuildsQueries extends Conditionable { }

export class BuildsQueries {
  /**
   * Pass the query to a given callback.
   *
   * @param  {Function}  callback
   * @return {this}
   */
  public tap (callbackFunc: Function): this {
    callbackFunc(this)

    return this
  }
}

use(BuildsQueries, [Conditionable])
