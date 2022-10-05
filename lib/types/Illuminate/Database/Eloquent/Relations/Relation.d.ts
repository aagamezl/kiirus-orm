import { Builder } from '../Builder';
import { Model } from '../Model';
export declare class Relation {
    /**
     * The Eloquent query builder instance.
     *
     * @var \Illuminate\Database\Eloquent\Builder
     */
    protected query: Builder;
    /**
   * Create a new relation instance.
   *
   * @param  \Illuminate\Database\Eloquent\Builder  query
   * @param  \Illuminate\Database\Eloquent\Model  parent
   * @return void
   */
    constructor(query: Builder, parent: Model);
}
