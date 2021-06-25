import { AggregateInterface, Builder, UnionInterface, WhereInterface } from '../Builder';
import { Expression } from '../Expression';
import { JoinClause } from '../JoinClause';
import { Grammar as BaseGrammar } from './../../';
interface SelectComponentInterface {
    name: string;
    property: string;
}
export declare class Grammar extends BaseGrammar {
    /**
     * The grammar specific operators.
     *
     * @var array
     */
    protected operators: Array<any>;
    /**
     * The components that make up a select clause.
     *
     * @var string[]
     */
    protected selectComponents: Array<string | SelectComponentInterface>;
    /**
     * Compile an aggregated select clause.
     *
     * @param  \Illuminate\Database\Query\Builder  query
     * @param  array  aggregate
     * @return string
     */
    protected compileAggregate(query: Builder, aggregate: AggregateInterface): string;
    /**
     * Compile a basic having clause.
     *
     * @param  Record<string, any>  having
     * @return string
     */
    protected compileBasicHaving(having: Record<string, any>): string;
    /**
     * Compile the "select *" portion of the query.
     *
     * @param  \Illuminate\Database\Query\Builder  query
     * @param  array  columns
     * @return string|null
     */
    protected compileColumns(query: Builder, columns: Array<any>): string | undefined;
    /**
     * Compile the components necessary for a select clause.
     *
     * @param  \Illuminate\Database\Query\Builder  query
     * @return Record<string, any>
     */
    protected compileComponents(query: Builder): Record<string, any>;
    /**
     * Compile an exists statement into SQL.
     *
     * @param  \Illuminate\Database\Query\Builder  query
     * @return string
     */
    compileExists(query: Builder): string;
    /**
     * Compile the "from" portion of the query.
     *
     * @param  \Illuminate\Database\Query\Builder  query
     * @param  string  table
     * @return string
     */
    protected compileFrom(query: Builder, table: string): string;
    /**
     * Compile the "group by" portions of the query.
     *
     * @param  \Illuminate\Database\Query\Builder  query
     * @param  Array<any>  groups
     * @return string
     */
    protected compileGroups(query: Builder, groups: Array<any>): string;
    /**
     * Compile a single having clause.
     *
     * @param  array  having
     * @return string
     */
    protected compileHaving(having: Record<string, string>): string;
    /**
     * Compile a "between" having clause.
     *
     * @param  array  having
     * @return string
     */
    protected compileHavingBetween(having: Record<string, any>): string;
    /**
     * Compile the "having" portions of the query.
     *
     * @param  \Illuminate\Database\Query\Builder  query
     * @param  Array<any>  havings
     * @return string
     */
    protected compileHavings(query: Builder, havings: Array<any>): string;
    /**
     * Compile an insert statement into SQL.
     *
     * @param  \Illuminate\Database\Query\Builder  query
     * @param  Array<any>  values
     * @return string
     */
    compileInsert(query: Builder, values: Array<any> | any): string;
    /**
     * Compile an insert and get ID statement into SQL.
     *
     * @param  \Illuminate\Database\Query\Builder  query
     * @param  array  values
     * @param  [string]  sequence
     * @return string
     */
    compileInsertGetId(query: Builder, values: Array<any> | any, sequence?: string): string;
    /**
     * Compile an insert ignore statement into SQL.
     *
     * @param  \Illuminate\Database\Query\Builder  query
     * @param  Array<Object>  values
     * @return string
     *
     * @throws \RuntimeException
     */
    compileInsertOrIgnore(query: Builder, values: Array<Object>): string;
    /**
     * Compile an insert statement using a subquery into SQL.
     *
     * @param  \Illuminate\Database\Query\Builder  query
     * @param  Array<string>  columns
     * @param  string  sql
     * @return string
     */
    compileInsertUsing(query: Builder, columns: Array<string>, sql: string): string;
    /**
     * Compile the "join" portions of the query.
     *
     * @param  \Illuminate\Database\Query\Builder  query
     * @param  array  joins
     * @return string
     */
    protected compileJoins(query: Builder, joins: Array<any>): string;
    /**
     * Compile the "limit" portions of the query.
     *
     * @param  \Illuminate\Database\Query\Builder  query
     * @param  number  limit
     * @return string
     */
    protected compileLimit(query: Builder, limit: number): string;
    /**
     * Compile the "offset" portions of the query.
     *
     * @param  \Illuminate\Database\Query\Builder  query
     * @param  number  offset
     * @return string
     */
    protected compileOffset(query: Builder, offset: number): string;
    /**
     * Compile the "order by" portions of the query.
     *
     * @param  \Illuminate\Database\Query\Builder  query
     * @param  array  orders
     * @return string
     */
    protected compileOrders(query: Builder, orders: Array<any>): string;
    /**
     * Compile the query orders to an array.
     *
     * @param  \Illuminate\Database\Query\Builder  query
     * @param  array  orders
     * @return array
     */
    protected compileOrdersToArray(query: Builder, orders: Array<any>): Array<any>;
    /**
     * Compile a select query into SQL.
     *
     * @param  \Illuminate\Database\Query\Builder  query
     * @return string
     */
    compileSelect(query: Builder): string;
    /**
     * Compile a single union statement.
     *
     * @param  array  union
     * @return string
     */
    protected compileUnion(union: UnionInterface): string;
    /**
     * Compile a union aggregate query into SQL.
     *
     * @param  \Illuminate\Database\Query\Builder  query
     * @return string
     */
    protected compileUnionAggregate(query: Builder): string;
    /**
     * Compile the "union" queries attached to the main query.
     *
     * @param  \Illuminate\Database\Query\Builder  query
     * @return string
     */
    protected compileUnions(query: Builder): string;
    /**
     * Compile an update statement into SQL.
     *
     * @param  \Illuminate\Database\Query\Builder  query
     * @param  Array<any> | any  values
     * @return string
     */
    compileUpdate(query: Builder, values: Array<any> | any): string;
    /**
     * Compile the columns for an update statement.
     *
     * @param  \Illuminate\Database\Query\Builder  query
     * @param  Array<any> | any  values
     * @return string
     */
    protected compileUpdateColumns(query: Builder, values: Array<any> | any): string;
    /**
     * Compile an update statement with joins into SQL.
     *
     * @param  \Illuminate\Database\Query\Builder  query
     * @param  string  table
     * @param  string  columns
     * @param  string  where
     * @return string
     */
    protected compileUpdateWithJoins(query: Builder, table: string, columns: string, where: string): string;
    /**
     * Compile an update statement without joins into SQL.
     *
     * @param  \Illuminate\Database\Query\Builder  $query
     * @param  string  table
     * @param  string  columns
     * @param  string  where
     * @return string
     */
    protected compileUpdateWithoutJoins(query: Builder, table: string, columns: string, where: string): string;
    /**
     * Compile an "upsert" statement into SQL.
     *
     * @param  \Illuminate\Database\Query\Builder query
     * @param  Array<any>  values
     * @param  Array<any>  uniqueBy
     * @param  Array<any>  update
     * @return string
     *
     * @throws \RuntimeException
     */
    compileUpsert(query: Builder, values: Array<any>, uniqueBy: Array<any>, update: Array<any>): string;
    /**
     * Compile the "where" portions of the query.
     *
     * @param  \Illuminate\Database\Query\Builder  query
     * @return string
     */
    compileWheres(query: Builder | JoinClause): string;
    /**
     * Get an array of all the where clauses for the query.
     *
     * @param  \Illuminate\Database\Query\Builder  query
     * @return array
     */
    protected compileWheresToArray(query: Builder | JoinClause): Array<any>;
    /**
     * Concatenate an array of segments, removing empties.
     *
     * @param  array  segments
     * @return string
     */
    protected concatenate(segments: Record<string, any>): string;
    /**
     * Format the where clause statements into one string.
     *
     * @param  \Illuminate\Database\Query\Builder  query
     * @param  array  sql
     * @return string
     */
    protected concatenateWhereClauses(query: Builder | JoinClause, sql: Array<any>): string;
    /**
     * Compile a date based where clause.
     *
     * @param  string  type
     * @param  \Illuminate\Database\Query\Builder  query
     * @param  array  where
     * @return string
     */
    protected dateBasedWhere(type: string, query: Builder, where: WhereInterface): string;
    /**
     * Get the grammar specific operators.
     *
     * @return array
     */
    getOperators(): Array<any>;
    protected isExecutable(query: Builder, property: string): boolean;
    /**
     * Determine if the given string is a JSON selector.
     *
     * @param  string  value
     * @return boolean
     */
    protected isJsonSelector(value: string): boolean;
    /**
     * Prepare the bindings for an update statement.
     *
     * @param  array  bindings
     * @param  array  values
     * @return array
     */
    prepareBindingsForUpdate(bindings: Array<any> | any, values: Array<any> | any): any[];
    /**
     * Remove the leading boolean from a statement.
     *
     * @param  string  value
     * @return string
     */
    protected removeLeadingBoolean(value: string): string;
    /**
     * Compile a basic where clause.
     *
     * @param  \Illuminate\Database\Query\Builder  query
     * @param  array  where
     * @return string
     */
    protected whereBasic(query: Builder, where: WhereInterface): string;
    /**
     * Compile a "between" where clause.
     *
     * @param  \Illuminate\Database\Query\Builder  query
     * @param  WhereInterface  where
     * @return string
     */
    protected whereBetween(query: Builder, where: WhereInterface): string;
    /**
     * Compile a "between" where clause.
     *
     * @param  \Illuminate\Database\Query\Builder  query
     * @param  array  where
     * @return string
     */
    protected whereBetweenColumns(query: Builder, where: WhereInterface): string;
    /**
     * Compile a where clause comparing two columns.
     *
     * @param  \Illuminate\Database\Query\Builder  query
     * @param  array  where
     * @return string
     */
    protected whereColumn(query: Builder | JoinClause, where: WhereInterface): string;
    /**
     * Compile a "where date" clause.
     *
     * @param  \Illuminate\Database\Query\Builder  query
     * @param  WhereInterface  where
     * @return string
     */
    protected whereDate(query: Builder, where: WhereInterface): string;
    /**
     * Compile a "where day" clause.
     *
     * @param  \Illuminate\Database\Query\Builder  query
     * @param  array  where
     * @return string
     */
    protected whereDay(query: Builder, where: WhereInterface): string;
    /**
     * Compile a where exists clause.
     *
     * @param  \Illuminate\Database\Query\Builder  query
     * @param  WhereInterface  where
     * @return string
     */
    protected whereExists(query: Builder, where: WhereInterface): string;
    /**
     * Compile a "where in" clause.
     *
     * @param  \Illuminate\Database\Query\Builder  query
     * @param  WhereInterface  where
     * @return string
     */
    protected whereIn(query: Builder, where: WhereInterface): string;
    /**
     * Compile a "where in raw" clause.
     *
     * For safety, whereIntegerInRaw ensures this method is only used with integer values.
     *
     * @param  \Illuminate\Database\Query\Builder  query
     * @param  WhereInterface  where
     * @return string
     */
    protected whereInRaw(query: Builder, where: WhereInterface): string;
    /**
     * Compile a "where month" clause.
     *
     * @param  \Illuminate\Database\Query\Builder  query
     * @param  array  where
     * @return string
     */
    protected whereMonth(query: Builder, where: WhereInterface): string;
    /**
     * Compile a nested where clause.
     *
     * @param  \Illuminate\Database\Query\Builder  query
     * @param  WhereInterface  where
     * @return string
     */
    protected whereNested(query: Builder | JoinClause, where: WhereInterface): string;
    /**
     * Compile a where exists clause.
     *
     * @param  \Illuminate\Database\Query\Builder  query
     * @param  WhereInterface  where
     * @return string
     */
    protected whereNotExists(query: Builder, where: WhereInterface): string;
    /**
     * Compile a "where not in" clause.
     *
     * @param  \Illuminate\Database\Query\Builder  query
     * @param  WhereInterface  where
     * @return string
     */
    protected whereNotIn(query: Builder, where: WhereInterface): string;
    /**
     * Compile a "where not in raw" clause.
     *
     * For safety, whereIntegerInRaw ensures this method is only used with integer values.
     *
     * @param  \Illuminate\Database\Query\Builder  query
     * @param  WhereInterface  where
     * @return string
     */
    protected whereNotInRaw(query: Builder, where: WhereInterface): string;
    /**
     * Compile a "where not null" clause.
     *
     * @param  \Illuminate\Database\Query\Builder  query
     * @param  WhereInterface  where
     * @return string
     */
    protected whereNotNull(query: Builder, where: WhereInterface): string;
    /**
     * Compile a "where null" clause.
     *
     * @param  \Illuminate\Database\Query\Builder  query
     * @param  WhereInterface  where
     * @return string
     */
    protected whereNull(query: Builder, where: WhereInterface): string;
    /**
     * Compile a raw where clause.
     *
     * @param  \Illuminate\Database\Query\Builder  query
     * @param  array  where
     * @return string
     */
    protected whereRaw(query: Builder, where: WhereInterface): string;
    /**
     * Compile a where condition with a sub-select.
     *
     * @param  \Illuminate\Database\Query\Builder  query
     * @param  WhereInterface  where
     * @return string
     */
    protected whereSub(query: Builder, where: WhereInterface): string;
    /**
     * Compile a "where time" clause.
     *
     * @param  \Illuminate\Database\Query\Builder  query
     * @param  WhereInterface  where
     * @return string
     */
    protected whereTime(query: Builder, where: WhereInterface): string;
    /**
     * Compile a "where year" clause.
     *
     * @param  \Illuminate\Database\Query\Builder  query
     * @param  array  where
     * @return string
     */
    protected whereYear(query: Builder, where: WhereInterface): string;
    /**
     * Wrap a value in keyword identifiers.
     *
     * @param  Expression|string  value
     * @param  [boolean]  prefixAlias
     * @return string
     */
    wrap(value: Expression | string, prefixAlias?: boolean): string;
    /**
     * Split the given JSON selector into the field and the optional path and wrap them separately.
     *
     * @param  string  column
     * @return array
     */
    protected wrapJsonFieldAndPath(column: string): Array<string>;
    /**
     * Wrap the given JSON path.
     *
     * @param  string  value
     * @param  string  delimiter
     * @return string
     */
    protected wrapJsonPath(value: string, delimiter?: string): string;
    /**
     * Wrap the given JSON selector.
     *
     * @param  string  value
     * @return string
     *
     * @throws \RuntimeException
     */
    protected wrapJsonSelector(value: string): string;
    /**
     * Wrap a union subquery in parentheses.
     *
     * @param  string  sql
     * @return string
     */
    protected wrapUnion(sql: string): string;
}
export {};
