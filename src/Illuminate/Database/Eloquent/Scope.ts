import {Model} from './Model';
import {Builder} from './Query/Builder';

export abstract class Scope {
  /**
   * Apply the scope to a given Eloquent query builder.
   *
   * @param  \Illuminate\Database\Eloquent\Builder  builder
   * @param  \Illuminate\Database\Eloquent\Model  model
   * @return void
   */
  public apply(builder: Builder, model: Model): void {}
}
