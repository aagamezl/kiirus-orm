import { Aggregate, Builder, Order, Union } from '../Builder';
import { CompilesJsonPaths } from '../../Concerns/CompilesJsonPaths';
import { Expression } from '../Expression';
import { Grammar as BaseGrammar } from '../../Grammar';
export interface Grammar extends CompilesJsonPaths {
}
export interface Where {
    column: string;
    first: any;
    not: boolean;
    operator: string;
    options: Record<string, any>;
    query: Builder;
    second: any;
    sql: string;
    value: any;
    values: any[];
    columns: string[];
    type?: string;
    boolean: string;
}
export interface Having extends Where {
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
     * Compile a basic having clause.
     *
     * @param  {Having}  having
     * @return {string}
     */
    protected compileBasicHaving(having: Having): string;
    /**
     * Compile the "select *" portion of the query.
     *
     * @param  {\Illuminate\Database\Query\Builder}  query
     * @param  {Array}  columns
     * @return {string|undefined}
     */
    protected compileColumns(query: Builder, columns: Array<string | Expression>): string | undefined;
    /**
     * Compile the components necessary for a select clause.
     *
     * @param  {\Illuminate\Database\Query\Builder}  query
     * @return {Array}
     */
    protected compileComponents(query: Builder): Record<string, string>;
    /**
     * Compile an exists statement into SQL.
     *
     * @param  {\Illuminate\Database\Query\Builder}  query
     * @return {string}
     */
    compileExists(query: Builder): string;
    /**
     * Compile the "from" portion of the query.
     *
     * @param  {\Illuminate\Database\Query\Builder}  query
     * @param  {string}  table
     * @return {string}
     */
    protected compileFrom(query: Builder, table: string): string;
    /**
     * Compile the "group by" portions of the query.
     *
     * @param  {\Illuminate\Database\Query\Builder}  query
     * @param  {string[]}  groups
     * @return {string}
     */
    protected compileGroups(query: Builder, groups: string[]): string;
    /**
     * Compile a single having clause.
     *
     * @param  {Having}  having
     * @return {string}
     */
    protected compileHaving(having: Having): string;
    /**
     * Compile a "between" having clause.
     *
     * @param  {object}  having
     * @return {string}
     */
    protected compileHavingBetween(having: Having): string;
    /**
     * Compile a having clause involving a bit operator.
     *
     * @param  {Having}  having
     * @return {string}
     */
    protected compileHavingBit(having: Having): string;
    /**
     * Compile a having not null clause.
     *
     * @param  {Having}  having
     * @return {string}
     */
    protected compileHavingNotNull(having: Having): string;
    /**
     * Compile a having null clause.
     *
     * @param  {Having}  having
     * @return {string}
     */
    protected compileHavingNull(having: Having): string;
    /**
   * Compile the "having" portions of the query.
   *
   * @param  {\Illuminate\Database\Query\Builder}  query
   * @param  {Builder}  query
   * @return {string}
   */
    protected compileHavings(query: Builder): string;
    /**
     * Compile an insert statement into SQL.
     *
     * @param  {\Illuminate\Database\Query\Builder}  query
     * @param  {Array}  values
     * @return {string}
     */
    compileInsert(query: Builder, values: Record<string, any>): string;
    /**
     * Compile an insert and get ID statement into SQL.
     *
     * @param  {\Illuminate\Database\Query\Builder}  query
     * @param  {Array}  values
     * @param  {string}  [sequence]
     * @return {string}
     */
    compileInsertGetId(query: Builder, values: Record<string, any>, sequence: string): string;
    /**
     * Compile an insert ignore statement into SQL.
     *
     * @param  {\Illuminate\Database\Query\Builder}  query
     * @param  {Record<string, any>}  values
     * @return {string}
     *
     * @throws{ \RuntimeException}
     */
    compileInsertOrIgnore(query: Builder, values: Record<string, any>): string;
    /**
     * Compile an insert statement using a subquery into SQL.
     *
     * @param  {\Illuminate\Database\Query\Builder}  query
     * @param  {any[]}  columns
     * @param  {string}  sql
     * @return {string}
     */
    compileInsertUsing(query: Builder, columns: any[], sql: string): string;
    /**
     * Compile the "join" portions of the query.
     *
     * @param  {\Illuminate\Database\Query\Builder}  query
     * @param  {Builder[]}  joins
     * @return {string}
     */
    protected compileJoins(query: Builder, joins: any[]): string;
    /**
     * Compile the "limit" portions of the query.
     *
     * @param  {\Illuminate\Database\Query\Builder}  query
     * @param  {number}  limit
     * @return {string}
     */
    protected compileLimit(query: Builder, limit: number): string;
    /**
     * Compile a nested having clause.
     *
     * @param  {Having}  having
     * @return {string}
     */
    protected compileNestedHavings(having: Having): string;
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
     * Compile the "where" portions of the query.
     *
     * @param  {\Illuminate\Database\Query\Builder}  query
     * @return {string}
     */
    compileWheres(query: Builder): string;
    /**
     * Get an array of all the where clauses for the query.
     *
     * @param  {\Illuminate\Database\Query\Builder}  query
     * @return {Array}
     */
    protected compileWheresToArray(query: Builder): any[];
    /**
     * Concatenate an array of segments, removing empties.
     *
     * @param  {Record<string, string>}  segments
     * @return {string}
     */
    protected concatenate(segments: Record<string, string>): string;
    /**
     * Format the where clause statements into one string.
     *
     * @param  {\Illuminate\Database\Query\Builder}  query
     * @param  {string[]}  sql
     * @return {string}
     */
    protected concatenateWhereClauses(query: Builder, sql: string[]): string;
    /**
     * Compile a date based where clause.
     *
     * @param  {string}  type
     * @param  {\Illuminate\Database\Query\Builder}  query
     * @param  {Record<string, string>}  where
     * @return {string}
     */
    protected dateBasedWhere(type: string, query: Builder, where: Where): string;
    /**
     * Get the grammar specific bitwise operators.
     *
     * @return {string[]}
     */
    getBitwiseOperators(): string[];
    /**
     * Get the grammar specific operators.
     *
     * @return {Array}
     */
    getOperators(): string[];
    protected isExecutable(query: Builder, property: string): boolean;
    /**
     * Remove the leading boolean from a statement.
     *
     * @param  {string}  value
     * @return {string}
     */
    protected removeLeadingBoolean(value: string): string;
    /**
     * Compile a basic where clause.
     *
     * @param  {\Illuminate\Database\Query\Builder}  query
     * @param  {Record<string, any>}  where
     * @return {string}
     */
    protected whereBasic(query: Builder, where: Where): string;
    /**
     * Compile a "between" where clause.
     *
     * @param  {\Illuminate\Database\Query\Builder}  query
     * @param  {Where}  where
     * @return {string}
     */
    protected whereBetween(query: Builder, where: Where): string;
    /**
     * Compile a "between" where clause.
     *
     * @param  {\Illuminate\Database\Query\Builder}  query
     * @param  {Where}  where
     * @return {string}
     */
    protected whereBetweenColumns(query: Builder, where: Where): string;
    /**
     * Compile a where clause comparing two columns.
     *
     * @param  {\Illuminate\Database\Query\Builder}  query
     * @param  {Array}  where
     * @return {string}
     */
    protected whereColumn(query: Builder, where: Where): string;
    /**
     * Compile a "where date" clause.
     *
     * @param  {\Illuminate\Database\Query\Builder}  query
     * @param  {Array}  where
     * @return {string}
     */
    protected whereDate(query: Builder, where: Where): string;
    /**
     * Compile a "where day" clause.
     *
     * @param  {\Illuminate\Database\Query\Builder}  query
     * @param  {Array}  where
     * @return {string}
     */
    protected whereDay(query: Builder, where: Where): string;
    /**
     * Compile a where exists clause.
     *
     * @param  {\Illuminate\Database\Query\Builder}  query
     * @param  {Where}  where
     * @return {string}
     */
    protected whereExists(query: Builder, where: Where): string;
    /**
     * Compile a "where fulltext" clause.
     *
     * @param  {\Illuminate\Database\Query\Builder}  query
     * @param  {Where}  where
     * @return {string}
     */
    protected whereFulltext(query: Builder, where: Where): string;
    /**
     * Compile a "where in" clause.
     *
     * @param  {\Illuminate\Database\Query\Builder}  query
     * @param  {Where}  where
     * @return {string}
     */
    protected whereIn(query: Builder, where: Where): string;
    /**
     * Compile a "where in raw" clause.
     *
     * For safety, whereIntegerInRaw ensures this method is only used with integer values.
     *
     * @param  {\Illuminate\Database\Query\Builder}  query
     * @param  {Where}  where
     * @return {string}
     */
    protected whereInRaw(query: Builder, where: Where): string;
    /**
     * Compile a "where month" clause.
     *
     * @param  {\Illuminate\Database\Query\Builder}  query
     * @param  {Record<string, string>}  where
     * @return {string}
     */
    protected whereMonth(query: Builder, where: Where): string;
    /**
     * Compile a nested where clause.
     *
     * @param  {\Illuminate\Database\Query\Builder}  query
     * @param  {Where}  where
     * @return {string}
     */
    protected whereNested(query: Builder, where: Where): string;
    /**
     * Compile a where exists clause.
     *
     * @param  {\Illuminate\Database\Query\Builder}  query
     * @param  {Where}  where
     * @return {string}
     */
    protected whereNotExists(query: Builder, where: Where): string;
    /**
     * Compile a "where not in" clause.
     *
     * @param  {\Illuminate\Database\Query\Builder}  query
     * @param  {Where}  where
     * @return {string}
     */
    protected whereNotIn(query: Builder, where: Where): string;
    /**
     * Compile a "where not in raw" clause.
     *
     * For safety, whereIntegerInRaw ensures this method is only used with integer values.
     *
     * @param  {\Illuminate\Database\Query\Builder}  query
     * @param  {Array}  Where
     * @return {string}
     */
    protected whereNotInRaw(query: Builder, where: Where): string;
    /**
     * Compile a "where not null" clause.
     *
     * @param  {\Illuminate\Database\Query\Builder}  query
     * @param  {Where}  where
     * @return {string}
     */
    protected whereNotNull(query: Builder, where: Where): string;
    /**
     * Compile a "where null" clause.
     *
     * @param  {\Illuminate\Database\Query\Builder}  query
     * @param  {Where}  where
     * @return {string}
     */
    protected whereNull(query: Builder, where: Where): string;
    /**
     * Compile a raw where clause.
     *
     * @param  {\Illuminate\Database\Query\Builder}  query
     * @param  {Where}  where
     * @return {string}
     */
    protected whereRaw(query: Builder, where: Where): string;
    /**
     * Compile a where condition with a sub-select.
     *
     * @param  {\Illuminate\Database\Query\Builder}  query
     * @param  {Where}  where
     * @return {string}
     */
    protected whereSub(query: Builder, where: Where): string;
    /**
     * Compile a "where time" clause.
     *
     * @param  {\Illuminate\Database\Query\Builder}  query
     * @param  {Array}  where
     * @return {string}
     */
    protected whereTime(query: Builder, where: Where): string;
    /**
     * Wrap a union subquery in parentheses.
     *
     * @param  {string}  sql
     * @return {string}
     */
    protected wrapUnion(sql: string): string;
    /**
     * Compile a "where year" clause.
     *
     * @param  {\Illuminate\Database\Query\Builder}  query
     * @param  {Record<string, string>}  where
     * @return {string}
     */
    protected whereYear(query: Builder, where: Where): string;
}
