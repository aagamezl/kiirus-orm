import { ForwardsCalls } from '../../Support/Traits/ForwardsCalls';
import { BuildsQueries } from '../Concerns/BuildsQueries';
import { Where } from '../Query/Grammars';
import { Builder as QueryBuilder } from './../Query/Builder';
import { Model } from './Model';
export interface Builder extends BuildsQueries, ForwardsCalls {
}
export declare class Builder {
    /**
     * All of the locally registered builder macros.
     *
     * @var Record<string, any>
     */
    protected localMacros: Record<string, any>;
    /**
     * All of the globally registered builder macros.
     *
     * @var Record<string, any>
     */
    protected static macros: Record<string, any>;
    /**
     * The model being queried.
     *
     * @var \Illuminate\Database\Eloquent\Model
     */
    protected model: Model;
    /**
     * The methods that should be returned from query builder.
     *
     * @var string[]
     */
    protected passthru: string[];
    /**
     * The base query builder instance.
     *
     * @var \Illuminate\Database\Query\Builder
     */
    protected query: QueryBuilder;
    /**
     * Applied global scopes.
     *
     * @var Record<string, any>
     */
    protected scopes: Record<string, any>;
    /**
     * Create a new Eloquent query builder instance.
     *
     * @param  {\Illuminate\Database\Query\Builder}  query
     * @return {void}
     */
    constructor(query: QueryBuilder);
    /**
   * Dynamically handle calls into the query instance.
   *
   * @param  {string}  method
   * @param  {any[]}  parameters
   * @return {any}
   */
    __call(method: string, ...parameters: any[]): any;
    /**
     * Nest where conditions by slicing them at the given where count.
     *
     * @param  {\Illuminate\Database\Query\Builder}  query
     * @param  {number}  originalWhereCount
     * @return {void}
     */
    protected addNewWheresWithinGroup(query: QueryBuilder, originalWhereCount: number): void;
    /**
      * Apply the scopes to the Eloquent builder instance and return it.
      *
      * @return static
      */
    applyScopes(): Builder;
    /**
     * Apply the given named scope on the current builder instance.
     *
     * @param  {string}  scope
     * @param  {any[]}  parameters
     * @return {any}
     */
    protected callNamedScope(scope: string, parameters?: any[]): any;
    /**
     * Apply the given scope on the current builder instance.
     *
     * @param  {Function}  scope
     * @param  {any[]}  parameters
     * @return {any}
     */
    protected callScope(scope: Function, ...parameters: any[]): any;
    /**
     * Create a where array with nested where conditions.
     *
     * @param  {Where[]}  whereSlice
     * @param  {string}  boolean
     * @return {array}
     */
    protected createNestedWhere(whereSlice: Where[], boolean?: string): Where;
    /**
     * Get the model instance being queried.
     *
     * @return {\Illuminate\Database\Eloquent\Model|static}
     */
    getModel(): Model | this;
    /**
     * Get the underlying query builder instance.
     *
     * @return {\Illuminate\Database\Query\Builder}
     */
    getQuery(): QueryBuilder;
    /**
     * Slice where conditions at the given offset and add them to the query as a nested condition.
     *
     * @param  {\Illuminate\Database\Query\Builder}  query
     * @param  {Where[]}  whereSlice
     * @return {void}
     */
    protected groupWhereSliceForScope(query: QueryBuilder, whereSlice: Where[]): void;
    /**
     * Checks if a global macro is registered.
     *
     * @param  {string}  name
     * @return {boolean}
     */
    static hasGlobalMacro(name: string): boolean;
    /**
     * Checks if a macro is registered.
     *
     * @param  {string}  name
     * @return {boolean}
     */
    hasMacro(name: string): boolean;
    /**
     * Determine if the given model has a scope.
     *
     * @param  {string}  scope
     * @return {boolean}
     */
    hasNamedScope(scope: string): boolean;
    /**
     * Get a base query builder instance.
     *
     * @return {\Illuminate\Database\Query\Builder}
     */
    toBase(): QueryBuilder;
}
