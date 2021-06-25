import { Builder as QueryBuilder } from '../../Query';
import { WhereInterface } from '../../Query/Builder';
import { Model } from '../Model';
import { Scope } from '../Scope';
export declare class Builder {
    /**
     * The model being queried.
     *
     * @var \Illuminate\Database\Eloquent\Model
     */
    protected model?: Model;
    /**
     * The methods that should be returned from query builder.
     *
     * @var Array<string>
     */
    protected passthru: Array<string>;
    /**
     * The base query builder instance.
     *
     * @var \Illuminate\Database\Query\Builder
     */
    protected query: QueryBuilder;
    /**
     * Applied global scopes.
     *
     * @var Array<any>
     */
    protected scopes: Record<string, Scope>;
    /**
   * Create a new Eloquent query builder instance.
   *
   * @param  \Illuminate\Database\Query\Builder  $query
   * @return void
   */
    constructor(query: QueryBuilder);
    /**
     * Nest where conditions by slicing them at the given where count.
     *
     * @param  \Illuminate\Database\Query\Builder  query
     * @param  Number  originalWhereCount
     * @return void
     */
    protected addNewWheresWithinGroup(query: QueryBuilder, originalWhereCount: number): void;
    /**
     * Apply the scopes to the Eloquent builder instance and return it.
     *
     * @return static
     */
    applyScopes(): this;
    /**
     * Apply the given scope on the current builder instance.
     *
     * @param  Function  scope
     * @param  array  parameters
     * @return Array<any>
     */
    protected callScope(scope: Function, parameters?: Array<any>): any;
    /**
     * Create a where array with nested where conditions.
     *
     * @param  Array<any>  whereSlice
     * @param  string  boolean
     * @return WhereInterface
     */
    protected createNestedWhere(whereSlice: Array<any>, boolean?: string): WhereInterface;
    /**
     * Get the underlying query builder instance.
     *
     * @return \Illuminate\Database\Query\Builder
     */
    getQuery(): QueryBuilder;
    /**
     * Get the model instance being queried.
     *
     * @return \Illuminate\Database\Eloquent\Model|static
     */
    getModel(): Model;
    /**
     * Slice where conditions at the given offset and add them to the query as a nested condition.
     *
     * @param  \Illuminate\Database\Query\Builder  $query
     * @param  Array<any>  whereSlice
     * @return void
     */
    protected groupWhereSliceForScope(query: QueryBuilder, whereSlice: Array<any>): void;
    /**
     * Get a base query builder instance.
     *
     * @return \Illuminate\Database\Query\Builder
     */
    toBase(): QueryBuilder;
}
