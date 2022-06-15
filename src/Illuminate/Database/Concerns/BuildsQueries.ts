import { Conditionable } from '../../Conditionable/Traits/Conditionable'
import { use } from '../../Support/Traits/use'
import { Model } from '../Eloquent/Model'
import { Builder } from '../Query'

export interface BuildsQueries extends Conditionable { }

export class BuildsQueries {
  /**
   * Execute the query and get the first result.
   *
   * @param  {Array|string}  columns
   * @return {\Illuminate\Database\Eloquent\Model|object|static|undefined}
   */
  public async first (columns: any[] | string = ['*']): Promise<Model | object | this | undefined> {
    const result = await (this as unknown as Builder).take(1).get(columns as any)

    return result.first()
  }

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
