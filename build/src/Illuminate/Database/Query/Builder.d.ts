import { Builder as EloquentBuilder } from '../Eloquent/Query/Builder';
import { Grammar } from './Grammars';
import { Processor } from './Processors';
import { Connection } from '../Connection';
import { Expression } from './Expression';
import { JoinClause } from './internal';
import { Collection } from '../../Collections/Collection';
export interface UnionInterface {
    all: boolean;
    query: Builder;
}
export interface UnionOrderInterface {
    column: Builder | Expression | string;
    direction: string;
}
export interface AggregateInterface {
    function: string;
    columns: Array<any>;
}
export declare type TBindings = Record<string, Array<string>>;
export interface WhereInterface {
    boolean?: string;
    column?: Function | Expression | string | Array<any>;
    first?: string | Array<any>;
    not?: boolean;
    operator?: string;
    query?: Builder | JoinClause;
    second?: string;
    sql?: string;
    type: string;
    value?: any;
    values?: Array<any>;
}
declare global {
    interface ProxyConstructor {
        new <TSource extends object, TTarget extends object>(target: TSource, handler: ProxyHandler<TSource>): TTarget;
    }
}
export declare class Builder {
    /**
     * An aggregate function and column to be run.
     *
     * @var AggregateInterface
     */
    aggregateProperty?: AggregateInterface;
    /**
     * The callbacks that should be invoked before the query is executed.
     *
     * @var array
     */
    beforeQueryCallbacks: Array<any>;
    /**
     * The current query value bindings.
     *
     * @var object
     */
    bindings: TBindings;
    /**
     * The columns that should be returned.
     *
     * @var array
     */
    columns: Array<any>;
    /**
     * The database connection instance.
     *
     * @var \Illuminate\Database\ConnectionInterface
     */
    connection: Connection;
    /**
     * Indicates if the query returns distinct results.
     *
     * Occasionally contains the columns that should be distinct.
     *
     * @var bool|array
     */
    distinctProperty: boolean | Array<any>;
    /**
     * The table which the query is targeting.
     *
     * @var string
     */
    fromProperty: string | Expression;
    /**
     * The database query grammar instance.
     *
     * @var \Illuminate\Database\Query\Grammars\Grammar
     */
    grammar: Grammar;
    /**
     * The groupings for the query.
     *
     * @var Array<any>
     */
    groups: Array<any>;
    /**
     * The having constraints for the query.
     *
     * @var array
     */
    havings: Array<any>;
    /**
     * The table joins for the query.
     *
     * @var array
     */
    joins: Array<any>;
    /**
     * The maximum number of records to return.
     *
     * @var number
     */
    limitProperty: number | undefined;
    /**
     * The number of records to skip.
     *
     * @var number
     */
    offsetProperty: number | undefined;
    /**
     * All of the available clause operators.
     *
     * @var string[]
     */
    operators: Array<string>;
    /**
     * The orderings for the query.
     *
     * @var Array<any>
     */
    orders: Array<any>;
    /**
     * The database query post processor instance.
     *
     * @var \Illuminate\Database\Query\Processors\Processor
     */
    processor: Processor;
    /**
     * The query union statements.
     *
     * @var array
     */
    unions: Array<UnionInterface>;
    /**
     * The maximum number of union records to return.
     *
     * @var number
     */
    unionLimit: number | undefined;
    /**
     * The number of union records to skip.
     *
     * @var number
     */
    unionOffset: number | undefined;
    /**
     * The orderings for the union query.
     *
     * @var array
     */
    unionOrders: Array<UnionOrderInterface>;
    /**
     * The where constraints for the query.
     *
     * @var array
     */
    wheres: Array<WhereInterface>;
    constructor(connection: Connection, grammar?: Grammar, processor?: Processor);
    /**
     * Add an array of where clauses to the query.
     *
     * @param  array  column
     * @param  string  boolean
     * @param  string  method
     * @return this
     */
    protected addArrayOfWheres(column: Array<any> | Object, boolean: string, method?: string): this;
    /**
     * Add a binding to the query.
     *
     * @param  mixed  value
     * @param  string  type
     * @return this
     *
     * @throws \InvalidArgumentException
     */
    addBinding(value: any, type?: string): this;
    /**
     * Add a date based (year, month, day, time) statement to the query.
     *
     * @param  string  type
     * @param  string  column
     * @param  string  operator
     * @param  any  value
     * @param  string  boolean
     * @return Builder
     */
    protected addDateBasedWhere(type: string, column: string, operator: string, value: any, boolean?: string): Builder;
    /**
     * Add another query builder as a nested where to the query builder.
     *
     * @param  \Illuminate\Database\Query\Builder  query
     * @param  string  boolean
     * @return Builder
     */
    addNestedWhereQuery(query: Builder, boolean?: string): this;
    /**
     * Add a new select column to the query.
     *
     * @param  array|mixed  column
     * @return Builder
     */
    addSelect(column: Array<string> | any): Builder;
    /**
     * Add an exists clause to the query.
     *
     * @param  \Illuminate\Database\Query\Builder  query
     * @param  string  boolean
     * @param  boolean  not
     * @return Builder
     */
    addWhereExistsQuery(query: Builder, boolean?: string, not?: boolean): Builder;
    /**
     * Execute an aggregate function on the database.
     *
     * @param  string  functionName
     * @param  Array<any>  columns
     * @return any
     */
    aggregate(functionName: string, columns?: Array<any>): any;
    /**
     * Invoke the "before query" modification callbacks.
     *
     * @return void
     */
    applyBeforeQueryCallbacks(): void;
    /**
     * Remove all of the expressions from a list of bindings.
     *
     * @param  array  bindings
     * @return array
     */
    cleanBindings(bindings: Array<any>): Array<any>;
    /**
     * Clone the query.
     *
     * @return Builder
     */
    clone(): Builder;
    /**
     * Clone the existing query instance for usage in a pagination subquery.
     *
     * @return Builder
     */
    protected cloneForPaginationCount(): Builder;
    /**
     * Clone the query without the given properties.
     *
     * @param  Array<any>  properties
     * @return Builder
     */
    cloneWithout(properties: Array<any>): Builder;
    /**
     * Clone the query without the given bindings.
     *
     * @param  Array<string>  except
     * @return Builder
     */
    cloneWithoutBindings(except: Array<string>): Builder;
    /**
     * Retrieve the "count" result of the query.
     *
     * @param  string  columns
     * @return number
     */
    count(columns?: string): any;
    /**
     * Creates a subquery and parse it.
     *
     * @param  Function|Builder|string  query
     * @return array
     */
    protected createSub(query: Function | Builder | EloquentBuilder | string): Array<any>;
    /**
     * Add a "cross join" clause to the query.
     *
     * @param  string  table
     * @param  [Function|string]  first
     * @param  [string]  operator
     * @param  [string]  second
     * @return Builder
     */
    crossJoin(table: string, first?: Function | string, operator?: string, second?: string): Builder;
    /**
     * Add a subquery cross join to the query.
     *
     * @param  Function|\Illuminate\Database\Query\Builder|string  query
     * @param  string  as
     * @return Builder
     */
    crossJoinSub(query: Function | Builder | string, as: string): Builder;
    /**
     * Force the query to only return distinct results.
     *
     * @return this
     */
    distinct(...columns: any): Builder;
    /**
     * Determine if no rows exist for the current query.
     *
     * @return boolean
     */
    doesntExist(): boolean;
    /**
     * Execute the given callback if rows exist for the current query.
     *
     * @param  Function  callback
     * @return any
     */
    doesntExistOr(callback: Function): any;
    /**
     * Determine if any rows exist for the current query.
     *
     * @return bool
     */
    exists(): boolean;
    /**
     * Execute the given callback if no rows exist for the current query.
     *
     * @param  Function  callback
     * @return any
     */
    existsOr(callback: Function): any;
    /**
     * Execute a query for a single record by ID.
     *
     * @param  number|string  id
     * @param  array  columns
     * @return any|this
     */
    find(id: number | string, columns?: Array<string>): any | this;
    /**
     * Execute the query and get the first result.
     *
     * @param  array|string  columns
     * @return \Illuminate\Database\Eloquent\Model|object|static|undefined
     */
    first(columns?: string[]): any;
    /**
     * Get a scalar type value from an unknown type of input.
     *
     * @param  any  value
     * @return any
     */
    protected flattenValue(value: any): any;
    /**
     * Create a new query instance for nested where condition.
     *
     * @return \Illuminate\Database\Query\Builder
     */
    forNestedWhere(): Builder;
    /**
     * Set the limit and offset for a given page.
     *
     * @param  number  page
     * @param  number  perPage
     * @return Builder
     */
    forPage(page: number, perPage?: number): Builder;
    /**
     * Create a new query instance for a sub-query.
     *
     * @return \Illuminate\Database\Query\Builder
     */
    protected forSubQuery(): Builder;
    /**
     * Set the table which the query is targeting.
     *
     * @param  Function|Builder|string table
     * @param  string as
     * @return this
     */
    from(table: Function | Builder | string | Expression, as?: string): Builder;
    /**
     * Add a raw from clause to the query.
     *
     * @param  string  expression
     * @param  mixed  bindings
     * @return this
     */
    fromRaw(expression: string, bindings?: any): Builder;
    /**
     * Makes "from" fetch from a subquery.
     *
     * @param  Function|Builder|string  query
     * @param  string  as
     * @return this
     *
     * @throws \InvalidArgumentException
     */
    fromSub(query: Function | Builder | string | Expression, as: string): Builder;
    /**
     * Execute the query as a "select" statement.
     *
     * @param  array|string  columns
     * @return \Illuminate\Support\Collection
     */
    get(columns?: Array<any> | string): Collection;
    /**
     * Get the current query value bindings in a flattened array.
     *
     * @return array
     */
    getBindings(): Array<any>;
    /**
     * Get the database connection instance.
     *
     * @return \Illuminate\Database\Connection
     */
    getConnection(): Connection;
    /**
     * Get the count of the total records for the paginator.
     *
     * @param  Array<any>  columns
     * @return number
     */
    getCountForPagination(columns?: string[]): number;
    /**
     * Get the query grammar instance.
     *
     * @return \Illuminate\Database\Query\Grammars\Grammar
     */
    getGrammar(): Grammar;
    /**
     * Get the database query processor instance.
     *
     * @return \Illuminate\Database\Query\Processors\Processor
     */
    getProcessor(): Processor;
    /**
     * Get the raw array of bindings.
     *
     * @return TBindings
     */
    getRawBindings(): TBindings;
    /**
     * Add a "group by" clause to the query.
     *
     * @param  string | Array<any>  ...groups
     * @return Builder
     */
    groupBy(...groups: Array<any>): Builder;
    /**
     * Add a raw groupBy clause to the query.
     *
     * @param  string  sql
     * @param  array  bindings
     * @return Builder
     */
    groupByRaw(sql: string, bindings?: Array<any>): Builder;
    /**
     * Add a "having" clause to the query.
     *
     * @param  string  column
     * @param  [string]  operator
     * @param  [string]  value
     * @param  string  boolean
     * @return Builder
     */
    having(column: string, operator?: any, value?: any, boolean?: string): Builder;
    /**
     * Add a "having between " clause to the query.
     *
     * @param  string  column
     * @param  array  values
     * @param  string  boolean
     * @param  boolean  not
     * @return Builder
     */
    havingBetween(column: string, values: Array<any>, boolean?: string, not?: boolean): Builder;
    /**
     * Add a raw having clause to the query.
     *
     * @param  string  sql
     * @param  array  bindings
     * @param  string  boolean
     * @return Builder
     */
    havingRaw(sql: string, bindings?: Array<any>, boolean?: string): Builder;
    /**
     * Concatenate values of a given column as a string.
     *
     * @param  string  column
     * @param  string  glue
     * @return string
     */
    implode(column: string, glue?: string): string;
    /**
     * Insert new records into the database.
     *
     * @param  Array<any> | any  values
     * @return boolean
     */
    insert(values: Array<any> | any): boolean;
    /**
     * Insert a new record and get the value of the primary key.
     *
     * @param  Array<any> | any  values
     * @param  [string]  sequence
     * @return number
     */
    insertGetId(values: Array<any> | any, sequence?: string): Promise<number>;
    /**
     * Insert new records into the database while ignoring errors.
     *
     * @param  Array<any> | any  values
     * @return number
     */
    insertOrIgnore(values: Array<any> | any): number;
    /**
     * Insert new records into the table using a subquery.
     *
     * @param  array  columns
     * @param  Function|\Illuminate\Database\Query\Builder|string  query
     * @return number
     */
    insertUsing(columns: Array<string>, query: Function | Builder): number;
    /**
     * Determine if the given operator is supported.
     *
     * @param  string  operator
     * @return boolean
     */
    protected invalidOperator(operator: string): boolean;
    /**
     * Determine if the given operator and value combination is legal.
     *
     * Prevents using Null values with invalid operators.
     *
     * @param  string  operator
     * @param  mixed  value
     * @return bool
     */
    protected invalidOperatorAndValue(operator: string, value: any): boolean;
    /**
     * Determine if the value is a query builder instance or a Closure.
     *
     * @param  any  value
     * @return boolean
     */
    protected isQueryable(value: unknown): boolean;
    /**
     * Add a join clause to the query.
     *
     * @param  string  table
     * @param  Function|string  first
     * @param  [string]  operator
     * @param  [string]  second
     * @param  string  type
     * @param  boolean  where
     * @return Builder
     */
    join(table: string | Expression, first: Function | string, operator?: string, second?: unknown, type?: string, where?: boolean): this;
    /**
     * Add a subquery join clause to the query.
     *
     * @param  Function|\Illuminate\Database\Query\Builder|\Illuminate\Database\Eloquent\Builder|string  query
     * @param  string  as
     * @param  Function|string  first
     * @param  string|null  operator
     * @param  string|null  second
     * @param  string  type
     * @param  boolean  where
     * @return this
     *
     * @throws \InvalidArgumentException
     */
    joinSub(query: Function | Builder | EloquentBuilder | string, as: string, first: Function | string, operator?: string, second?: unknown, type?: string, where?: boolean): this;
    /**
     * Add a "join where" clause to the query.
     *
     * @param  string  table
     * @param  Function|string  first
     * @param  string  operator
     * @param  string  second
     * @param  string  type
     * @return this
     */
    joinWhere(table: string, first: Function | string, operator: string, second: string, type?: string): Builder;
    /**
     * Add a left join to the query.
     *
     * @param  string  table
     * @param  Function|string  first
     * @param  [string]  operator
     * @param  [string]  second
     * @return Builder
     */
    leftJoin(table: string, first: Function | string, operator?: string, second?: string): Builder;
    /**
     * Add a subquery left join to the query.
     *
     * @param  Function|\Illuminate\Database\Query\Builder|\Illuminate\Database\Eloquent\Builder|string  query
     * @param  string  as
     * @param  Function|string  first
     * @param  [string]  operator
     * @param  [string]  second
     * @return this
     */
    leftJoinSub(query: Function | Builder | EloquentBuilder | string, as: string, first: Function | string, operator?: string, second?: string): this;
    /**
     * Add a "join where" clause to the query.
     *
     * @param  string  table
     * @param  Function|string  first
     * @param  string  operator
     * @param  string  second
     * @return Builder
     */
    leftJoinWhere(table: string, first: Function | string, operator: string, second: string): Builder;
    /**
     * Set the "limit" value of the query.
     *
     * @param  number  value
     * @return Builder
     */
    limit(value: number): Builder;
    /**
     * Retrieve the maximum value of a given column.
     *
     * @param  string  column
     * @return any
     */
    max(column: string): any;
    /**
     * Retrieve the minimum value of a given column.
     *
     * @param  string  column
     * @return any
     */
    min(column: string): any;
    /**
     * Merge an array of bindings into our bindings.
     *
     * @param  Illuminate\Database\Query\Builder  query
     * @return Builder
     */
    mergeBindings(query: Builder): Builder;
    /**
     * Get a new join clause.
     *
     * @param  \Illuminate\Database\Query\Builder  parentQuery
     * @param  string  type
     * @param  string|Expression  table
     * @return \Illuminate\Database\Query\JoinClause
     */
    protected newJoinClause(parentQuery: Builder, type: string, table: string | Expression): JoinClause;
    /**
     * Get a new instance of the query builder.
     *
     * @return \Illuminate\Database\Query\Builder
     */
    newQuery(): any;
    /**
     * Set the "offset" value of the query.
     *
     * @param  number  value
     * @return Builder
     */
    offset(value: number): Builder;
    /**
     * Execute the given callback while selecting the given columns.
     *
     * After running the callback, the columns are reset to the original value.
     *
     * @param  array  columns
     * @param  Function  callback
     * @return any
     */
    protected onceWithColumns(columns: Array<any>, callback: Function): any;
    /**
     * Add an "order by" clause to the query.
     *
     * @param  Function|\Illuminate\Database\Query\Builder|\Illuminate\Database\Query\Expression|string  column
     * @param  string  direction
     * @return this
     *
     * @throws \InvalidArgumentException
     */
    orderBy(column: Function | Builder | Expression | string, direction?: string): this;
    /**
     * Add a descending "order by" clause to the query.
     *
     * @param  string | Function  column
     * @return Builder
     */
    orderByDesc(column: string | Function): Builder;
    /**
     * Add a raw "order by" clause to the query.
     *
     * @param  string  sql
     * @param  array  bindings
     * @return Builder
     */
    orderByRaw(sql: string, bindings?: Array<any> | unknown): Builder;
    /**
     * Add an "or having" clause to the query.
     *
     * @param  string  column
     * @param  [string]  operator
     * @param  [Builder]  value
     * @return Builder
     */
    orHaving(column: string, operator?: any, value?: any): Builder;
    /**
     * Add a raw or having clause to the query.
     *
     * @param  string  sql
     * @param  Array<any>  bindings
     * @return Builder
     */
    orHavingRaw(sql: string, bindings?: Array<any>): Builder;
    /**
     * Add an "or where" clause to the query.
     *
     * @param  Function|string|Array<any>  column
     * @param  any  operator
     * @param  any  value
     * @return Builder
     */
    orWhere(column: Function | string | Array<any>, operator?: any, value?: any): Builder;
    /**
     * Add an "or where" clause comparing two columns to the query.
     *
     * @param  string|array  first
     * @param  string  operator
     * @param  string  second
     * @return Builder
     */
    orWhereColumn(first: string | Array<any>, operator?: string, second?: string): Builder;
    /**
     * Add an "or where date" statement to the query.
     *
     * @param  string  column
     * @param  string | number  operator
     * @param  [Date|string]  value
     * @return Builder
     */
    orWhereDate(column: string, operator: string | number, value?: Date | string): Builder;
    /**
     * Add an "or where day" statement to the query.
     *
     * @param  string  column
     * @param  string  operator
     * @param  [Date|string]  value
     * @return Builder
     */
    orWhereDay(column: string, operator: any, value?: any): Builder;
    /**
     * Add an or exists clause to the query.
     *
     * @param  Function  callback
     * @param  boolean  not
     * @return Builder
     */
    orWhereExists(callback: Function, not?: boolean): Builder;
    /**
     * Add an "or where in" clause to the query.
     *
     * @param  string  column
     * @param  any  values
     * @return Builder
     */
    orWhereIn(column: string, values: any): Builder;
    /**
     * Add an "or where in raw" clause for integer values to the query.
     *
     * @param  string  column
     * @param  Array<any> values
     * @return Builder
     */
    orWhereIntegerInRaw(column: string, values: Array<any>): Builder;
    /**
     * Add an "or where not in raw" clause for integer values to the query.
     *
     * @param  string  column
     * @param  Array<any>  values
     * @return Builder
     */
    orWhereIntegerNotInRaw(column: string, values: Array<any>): Builder;
    /**
      * Add an "or where month" statement to the query.
      *
      * @param  string  column
      * @param  string | number  operator
      * @param  [Date|string]  value
      * @return Builder
      */
    orWhereMonth(column: string, operator: any, value?: any): Builder;
    /**
     * Add a where not exists clause to the query.
     *
     * @param  Function  callback
     * @return Builder
     */
    orWhereNotExists(callback: Function): Builder;
    /**
     * Add an "or where not in" clause to the query.
     *
     * @param  string  column
     * @param  any  values
     * @return Builder
     */
    orWhereNotIn(column: string, values: Array<any>): Builder;
    /**
     * Add an "or where not null" clause to the query.
     *
     * @param  string | Array<any> column
     * @return Builder
     */
    orWhereNotNull(column: string | Array<any>): Builder;
    /**
     * Add an "or where null" clause to the query.
     *
     * @param  string  column
     * @return Builder
     */
    orWhereNull(column: string | Array<any>): Builder;
    /**
     * Add a raw or where clause to the query.
     *
     * @param  string  sql
     * @param  any  bindings
     * @return Builder
     */
    orWhereRaw(sql: string, bindings?: Array<any>): Builder;
    /**
     * Add an "or where year" statement to the query.
     *
     * @param  string  column
     * @param  string | number  operator
     * @param  [Date|string|number]  value
     * @return Builder
     */
    orWhereYear(column: string, operator: any, value?: any): Builder;
    /**
     * Parse the subquery into SQL and bindings.
     *
     * @param  any  query
     * @return array
     *
     * @throws \InvalidArgumentException
     */
    protected parseSub(query: any): Array<any>;
    /**
     * Get an array with the values of a given column.
     *
     * @param  string  column
     * @param  [string]  key
     * @return \Illuminate\Support\Collection
     */
    pluck(column: string, key?: string): Collection;
    /**
     * Retrieve column values from rows represented as arrays.
     *
     * @param  array  queryResult
     * @param  string  column
     * @param  string  key
     * @return \Illuminate\Support\Collection
     */
    protected pluckFromArrayColumn(queryResult: Array<any>, column: string, key: string): Collection;
    /**
     * Retrieve column values from rows represented as objects.
     *
     * @param  array  queryResult
     * @param  string  column
     * @param  string  key
     * @return \Illuminate\Support\Collection
     */
    protected pluckFromObjectColumn(queryResult: Array<any>, column: string, key: string): Collection;
    /**
     * Prepare the value and operator for a where clause.
     *
     * @param  string  value
     * @param  string  operator
     * @param  boolean  useDefault
     * @return array
     *
     * @throws \InvalidArgumentException
     */
    prepareValueAndOperator(value: string, operator: string, useDefault?: boolean): Array<any>;
    /**
     * Prepend the database name if the given query is on another database.
     *
     * @param  any  query
     * @return any
     */
    protected prependDatabaseNameIfCrossDatabaseQuery(query: any): any;
    /**
     * Remove all existing orders and optionally add a new order.
     *
     * @param  string  column
     * @param  string  direction
     * @return Builder
     */
    reorder(column?: string, direction?: string): Builder;
    /**
     * Add a subquery right join to the query.
     *
     * @param  Function|\Illuminate\Database\Query\Builder|\Illuminate\Database\Eloquent\Builder|string  query
     * @param  string  as
     * @param  Function|string  first
     * @param  [string]  operator
     * @param  [string]  second
     * @return this
     */
    rightJoinSub(query: Function | Builder | EloquentBuilder | string, as: string, first: Function | string, operator?: string, second?: string): this;
    /**
     * Run the query as a "select" statement against the connection.
     *
     * @return array
     */
    protected runSelect(): Array<any>;
    /**
     * Run a pagination count query.
     *
     * @param  Array<any>  columns
     * @return Array<any>
     */
    protected runPaginationCountQuery(columns?: string[]): Array<any>;
    /**
     * Set the columns to be selected.
     *
     * @param  array|mixed  columns
     * @return this
     */
    select(...columns: any): Builder;
    /**
     * Add a new "raw" select expression to the query.
     *
     * @param  string  expression
     * @param  Array<any>  bindings
     * @return this
     */
    selectRaw(expression: string, bindings?: Array<any>): Builder;
    /**
     * Add a subselect expression to the query.
     *
     * @param Function|Builder|EloquentBuilder|string  query
     * @param string  as
     * @return this
     *
     * @throws \InvalidArgumentException
     */
    selectSub(query: Function | Builder | EloquentBuilder | string, as: string): Builder;
    /**
     * Set the aggregate property without running the query.
     *
     * @param  string  functionName
     * @param  Array<string>  columns
     * @return Builder
     */
    protected setAggregate(functionName: string, columns: Array<string>): Builder;
    /**
     * Alias to set the "offset" value of the query.
     *
     * @param  number  value
     * @return Builder
     */
    skip(value: number): Builder;
    /**
     * Strip off the table name or alias from a column identifier.
     *
     * @param  string  column
     * @return string|undefined
     */
    protected stripTableForPluck(column?: string): string | undefined;
    /**
     * Retrieve the sum of the values of a given column.
     *
     * @param  string  column
     * @return any
     */
    sum(column: string): any;
    /**
     * Alias to set the "limit" value of the query.
     *
     * @param  number  value
     * @return Builder
     */
    take(value: number): Builder;
    /**
     * Pass the query to a given callback.
     *
     * @param  Function  callback
     * @return Builder
     */
    tap(callback: Function): Builder;
    /**
     * Get the SQL representation of the query.
     *
     * @return string
     */
    toSql(): string;
    /**
     * Add a union statement to the query.
     *
     * @param  \Illuminate\Database\Query\Builder|\Closure  query
     * @param  boolean  all
     * @return Builder
     */
    union(query: Builder | Function, all?: boolean): Builder;
    /**
     * Add a union all statement to the query.
     *
     * @param  \Illuminate\Database\Query\Builder|\Closure  query
     * @return this
     */
    unionAll(query: Builder): Builder;
    /**
     * Apply the callback's query changes if the given "value" is false.
     *
     * @param  mixed  value
     * @param  Function
     * @param  [Function]  default
     * @return any|Builder
     */
    unless(value: any, callback: Function, defaultCallback?: Function): any | Builder;
    /**
     * Update records in the database.
     *
     * @param  Array<any> | any  values
     * @return number
     */
    update(values: Array<any> | any): number;
    /**
     * Insert new records or update the existing ones.
     *
     * @param  Array<any>  values
     * @param  Array<any> | string  uniqueBy
     * @param  [Array<any>]  update
     * @return Promise<number>
     */
    upsert(values: Array<any> | any, uniqueBy: Array<any> | string, update?: Array<any> | any): number;
    /**
     * Get a single column's value from the first result of a query.
     *
     * @param  string  column
     * @return any
     */
    value(column: string): any;
    /**
   * Apply the callback's query changes if the given "value" is true.
   *
   * @param  mixed  value
   * @param  callable  callback
   * @param  callable|null  default
   * @return mixed|this
   */
    when(value: any, callback: Function, defaultCallback?: Function): Builder;
    /**
     * Add a basic where clause to the query.
     *
     * @param  Function|string|array  column
     * @param  any  operator
     * @param  any  value
     * @param  string  boolean
     * @return Builder
     */
    where(column: Function | Expression | string | Array<any> | any, operator?: any, value?: any, boolean?: string): this;
    /**
     * Add a where between statement to the query.
     *
     * @param  string|\Illuminate\Database\Query\Expression  column
     * @param  array  values
     * @param  string  boolean
     * @param  boolean  not
     * @return Builder
     */
    whereBetween(column: string | Expression, values: Array<any>, boolean?: string, not?: boolean): Builder;
    /**
     * Add a where between statement using columns to the query.
     *
     * @param  string  column
     * @param  array  values
     * @param  string  boolean
     * @param  boolean  not
     * @return Builder
     */
    whereBetweenColumns(column: string, values: Array<any>, boolean?: string, not?: boolean): Builder;
    /**
     * Add a "where" clause comparing two columns to the query.
     *
     * @param  string|array  first
     * @param  string|null  operator
     * @param  string|null  second
     * @param  string|null  boolean
     * @return this
     */
    whereColumn(first: string | Array<any>, operator?: string, second?: string, boolean?: string): this;
    /**
     * Add a "where date" statement to the query.
     *
     * @param  string  column
     * @param  string | number | Expression  operator
     * @param  [Date | string]  value
     * @param  string  boolean
     * @return Builder
     */
    whereDate(column: string, operator: any, value?: any, boolean?: string): Builder;
    /**
     * Add a "where day" statement to the query.
     *
     * @param  string  column
     * @param  string | number | Expression  operator
     * @param  [Date|string|Expression]  value
     * @param  string  boolean
     * @return this
     */
    whereDay(column: string, operator: any, value?: any, boolean?: string): Builder;
    /**
     * Add an exists clause to the query.
     *
     * @param  Function  callback
     * @param  string  boolean
     * @param  boolean  not
     * @return Builder
     */
    whereExists(callback: Function, boolean?: string, not?: boolean): Builder;
    /**
     * Add a "where in" clause to the query.
  *(  * @param  string  column
     * @param  any  values
     * @param  string  boolean
     * @param  boolean  not
     * @return Builder
     */
    whereIn(column: string, values: any, boolean?: string, not?: boolean): this;
    /**
     * Add a "where in raw" clause for integer values to the query.
     *
     * @param  string  column
     * @param  \Illuminate\Contracts\Support\Arrayable|array  values
     * @param  string  boolean
     * @param  boolean  not
     * @return Builder
     */
    whereIntegerInRaw(column: string, values: Array<any>, boolean?: string, not?: boolean): Builder;
    /**
     * Add a "where not in raw" clause for integer values to the query.
     *
     * @param  string  column
     * @param  Array<any>  values
     * @param  string  boolean
     * @return Builder
     */
    whereIntegerNotInRaw(column: string, values: Array<any>, boolean?: string): Builder;
    /**
     * Add a "where month" statement to the query.
     *
     * @param  string  column
     * @param  string | number | Expression  operator
     * @param  Date | string | Expression  value
     * @param  string  boolean
     * @return this
     */
    whereMonth(column: string, operator: any, value?: any, boolean?: string): Builder;
    /**
     * Add a nested where statement to the query.
     *
     * @param  \Function  callback
     * @param  string  boolean
     * @return this
     */
    whereNested(callback: Function, boolean?: string): this;
    /**
     * Add a where not between statement to the query.
     *
     * @param  string  column
     * @param  array  values
     * @param  string  boolean
     * @return Builder
     */
    whereNotBetween(column: string, values: Array<any>, boolean?: string): Builder;
    /**
     * Add a where not between statement using columns to the query.
     *
     * @param  string  column
     * @param  array  values
     * @param  string  boolean
     * @return Builder
     */
    whereNotBetweenColumns(column: string, values: Array<any>, boolean?: string): Builder;
    /**
     * Add a where not exists clause to the query.
     *
     * @param  Function  callback
     * @param  string  boolean
     * @return Buelder
     */
    whereNotExists(callback: Function, boolean?: string): Builder;
    /**
     * Add a "where not in" clause to the query.
     *
     * @param  string  column
     * @param  any  values
     * @param  string  boolean
     * @return Builder
     */
    whereNotIn(column: string, values: any, boolean?: string): Builder;
    /**
     * Add a "where not null" clause to the query.
     *
     * @param  string|Array<any>  columns
     * @param  [string]  boolean
     * @return this
     */
    whereNotNull(columns: string | Array<any>, boolean?: string): Builder;
    /**
     * Add a "where null" clause to the query.
     *
     * @param  string|array  columns
     * @param  string  boolean
     * @param  boolean  not
     * @return this
     */
    whereNull(columns: string | Array<any>, boolean?: string, not?: boolean): this;
    /**
     * Add a raw where clause to the query.
     *
     * @param  string  sql
     * @param  any  bindings
     * @param  string  boolean
     * @return this
     */
    whereRaw(sql: string, bindings?: Array<any>, boolean?: string): Builder;
    /**
     * Add a full sub-select to the query.
     *
     * @param  string  column
     * @param  string  operator
     * @param  Function  callback
     * @param  string  boolean
     * @return this
     */
    protected whereSub(column: string, operator: string, callback: Function, boolean: string): this;
    /**
     * Add a "where time" statement to the query.
     *
     * @param  string  column
     * @param  string  operator
     * @param  Date|string|null  value
     * @param  string  boolean
     * @return this
     */
    whereTime(column: string, operator: any, value?: any, boolean?: string): Builder;
    /**
     * Add a "where year" statement to the query.
     *
     * @param  string  column
     * @param  string | number | Expression  operator
     * @param  [Date|string|Number]  value
     * @param  string  boolean
     * @return this
     */
    whereYear(column: string, operator: any, value?: any, boolean?: string): Builder;
    /**
     * Remove the column aliases since they will break count queries.
     *
     * @param  Array<any>  columns
     * @return Array<any>
     */
    protected withoutSelectAliases(columns: Array<any>): Array<any>;
}
