import { Builder } from '../Builder'
import { Model } from '../Model'

export class Relation {
  /**
   * The Eloquent query builder instance.
   *
   * @var \Illuminate\Database\Eloquent\Builder
   */
  protected query: Builder

  /**
 * Create a new relation instance.
 *
 * @param  \Illuminate\Database\Eloquent\Builder  query
 * @param  \Illuminate\Database\Eloquent\Model  parent
 * @return void
 */
  public constructor (query: Builder, parent: Model) {
    this.query = query
    // this.parent = parent
    // this.related = query.getModel()

    // this.addConstraints()
  }
}
