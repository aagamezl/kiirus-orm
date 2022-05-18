import { Aggregate, Builder, Order, Union } from '../Builder';
import { CompilesJsonPaths } from '../../Concerns/CompilesJsonPaths';
import { Expression } from '../Expression';
import { Grammar as BaseGrammar } from '../../Grammar';
export interface Grammar extends CompilesJsonPaths {
}
export declare class Grammar extends BaseGrammar {
    /**
   * The grammar specific operators.
   *
   * @var string[]
   */
    protected operators: string[];
    /**
     * The grammar specific bitwise operators.
     *
     * @var array
     */
    protected bitwiseOperators: string[];
    /**
     * The components that make up a select clause.
     *
     * @var string[]
     */
    protected selectComponents: {
        name: string;
        property: string;
    }[];
    constructor();
    /**
     * Compile an aggregated select clause.
     *
     * @param  {\Illuminate\Database\Query\Builder}  query
     * @param  {object}  aggregate
     * @return {string}
     */
    protected compileAggregate(query: Builder, aggregate: Aggregate): string;
    /**
     * Compile the "select *" portion of the query.
     *
     * @param  {\Illuminate\Database\Query\Builder}  query
     * @param  {Array}  columns
     * @return {string|undefined}
     */
    protected compileColumns(query: Builder, columns: Array<string | Expression>): string;
    /**
     * Compile the components necessary for a select clause.
     *
     * @param  {\Illuminate\Database\Query\Builder}  query
     * @return {Array}
     */
    protected compileComponents(query: Builder): Record<string, string>;
    /**
     * Compile the "from" portion of the query.
     *
     * @param  {\Illuminate\Database\Query\Builder}  query
     * @param  {string}  table
     * @return {string}
     */
    protected compileFrom(query: Builder, table: string): string;
    /**
     * Compile the "limit" portions of the query.
     *
     * @param  {\Illuminate\Database\Query\Builder}  query
     * @param  {number}  limit
     * @return {string}
     */
    protected compileLimit(query: Builder, limit: number): string;
    /**
     * Compile the "offset" portions of the query.
     *
     * @param  {\Illuminate\Database\Query\Builder}  query
     * @param  {number}  offset
     * @return {string}
     */
    protected compileOffset(query: Builder, offset: number): string;
    /**
     * Compile the "order by" portions of the query.
     *
     * @param  {\Illuminate\Database\Query\Builder}  query
     * @param  {Array}  orders
     * @return {string}
     */
    protected compileOrders(query: Builder, orders: Order[]): string;
    /**
     * Compile the query orders to an array.
     *
     * @param  {\Illuminate\Database\Query\Builder}  query
     * @param  {Array}  orders
     * @return {Array}
     */
    protected compileOrdersToArray(query: Builder, orders: Order[]): string[];
    /**
     * Compile a select query into SQL.
     *
     * @param  {\Illuminate\Database\Query\Builder}  query
     * @return {string}
     */
    compileSelect(query: Builder): string;
    /**
     * Compile a single union statement.
     *
     * @param  {Array}  union
     * @return {string}
     */
    protected compileUnion(union: Union): string;
    /**
     * Compile a union aggregate query into SQL.
     *
     * @param  {\Illuminate\Database\Query\Builder}  query
     * @return {string}
     */
    protected compileUnionAggregate(query: Builder): string;
    /**
     * Compile the "union" queries attached to the main query.
     *
     * @param  {\Illuminate\Database\Query\Builder}  query
     * @return {string}
     */
    protected compileUnions(query: Builder): string;
    /**
     * Concatenate an array of segments, removing empties.
     *
     * @param  {Record<string, string>}  segments
     * @return {string}
     */
    protected concatenate(segments: Record<string, string>): string;
    protected isExecutable(query: Builder, property: string): boolean;
    /**
     * Wrap a union subquery in parentheses.
     *
     * @param  {string}  sql
     * @return {string}
     */
    protected wrapUnion(sql: string): string;
}
