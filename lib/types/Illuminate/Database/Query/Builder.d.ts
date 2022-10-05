import { Builder as EloquentBuilder } from '../Eloquent/Builder';
import { BuildsQueries } from '../Concerns/BuildsQueries';
import { Collection } from '../../Collections/Collection';
import { Connection } from '../Connection';
import { Expression } from './Expression';
import { JoinClause } from './internal';
import { Grammar } from '../Query/Grammars';
import { Macroable } from '../../Macroable/Traits/Macroable';
import { Processor } from './Processors';
export interface Bindings {
    [key: string]: unknown[];
}
export interface Aggregate {
    function: string;
    columns: Array<string | Expression>;
}
export interface Union {
    all: boolean;
    column?: string | Expression | Function | Builder;
    direction?: string;
    query: Builder;
}
export interface Order {
    column?: string | Expression | Function | Builder;
    direction?: string;
    sql?: string;
    type?: string;
}
export interface Builder extends Macroable, BuildsQueries {
}
export declare class Builder {
    /**
     * An aggregate function and column to be run.
     *
     * @member {object}
     */
    aggregateProperty: Aggregate | undefined;
    /**
     * The current query value bindings.
     *
     * @member {Bindings}
     */
    bindings: Bindings;
    /**
     * All of the available bitwise operators.
     *
     * @var string[]
     */
    bitwiseOperators: string[];
    /**
     * The callbacks that should be invoked before the query is executed.
     *
     * @member {Array}
     */
    beforeQueryCallbacks: Function[];
    /**
     * The columns that should be returned.
     *
     * @var unknown[]
     */
    columns: Array<string | Expression | any>;
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
     * @member {boolean|Array}
     */
    distinctProperty: boolean | object;
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
     * @member {Array}
     */
    groups: any[];
    /**
     * The having constraints for the query.
     *
     * @member {Array}
     */
    havings: any[];
    /**
     * The table joins for the query.
     *
     * @var array
     */
    joins: Array<string | object>;
    /**
     * The maximum number of records to return.
     *
     * @member {number}
     */
    limitProperty?: number;
    /**
     * Indicates whether row locking is being used.
     *
     * @member {string|boolean}
     */
    lockProperty?: string | boolean;
    /**
     * The number of records to skip.
     *
     * @member number
     */
    offsetProperty?: number;
    /**
     * All of the available clause operators.
     *
     * @member {string[]}
     */
    operators: string[];
    /**
     * The orderings for the query.
     *
     * @member {string[]}
     */
    orders: Order[];
    /**
     * The database query post processor instance.
     *
     * @var \Illuminate\Database\Query\Processors\Processor
     */
    processor: Processor;
    /**
     * The maximum number of union records to return.
     *
     * @member number
     */
    unionLimit: number | undefined;
    /**
     * The number of union records to skip.
     *
     * @member number
     */
    unionOffset: number | undefined;
    /**
     * The orderings for the union query.
     *
     * @member {Array}
     */
    unionOrders: Order[];
    /**
     * The query union statements.
     *
     * @member {Array}
     */
    unions: Union[];
    /**
     * The where constraints for the query.
     *
     * @var array
     */
    wheres: any[];
    /**
     * Create a new query builder instance.
     *
     * @constructor
     * @param  {\Illuminate\Database\ConnectionInterface}  connection
     * @param  {\Illuminate\Database\Query\Grammars\Grammar|undefined}  [grammar]
     * @param  {\Illuminate\Database\Query\Processors\Processor|undefined}  [processor]
     * @return {void}
     */
    constructor(connection: Connection, grammar?: Grammar, processor?: Processor);
    /**
     * Add an array of where clauses to the query.
     *
     * @param  {any}  column
     * @param  {string}  boolean
     * @param  {string}  method
     * @return {this}
     */
    protected addArrayOfWheres(column: any, boolean: string, method?: string): this;
    /**
     * Add a binding to the query.
     *
     * @param  {any}  value
     * @param  {string}  type
     * @return {this}
     *
     * @throws {\InvalidArgumentException}
     */
    addBinding(value: unknown, type?: keyof Bindings): this;
    /**
     * Add a date based (year, month, day, time) statement to the query.
     *
     * @param  {string}  type
     * @param  {string}  column
     * @param  {string}  operator
     * @param  {unknown}  value
     * @param  {string}  boolean
     * @return {this}
     */
    protected addDateBasedWhere(type: string, column: string, operator: string, value: unknown, boolean?: string): this;
    /**
     * Add another query builder as a nested having to the query builder.
     *
     * @param  {\Illuminate\Database\Query\Builder}  query
     * @param  {string}  boolean
     * @return {this}
     */
    addNestedHavingQuery(query: Builder, boolean?: string): this;
    /**
     * Add another query builder as a nested where to the query builder.
     *
     * @param  {\Illuminate\Database\Query\Builder}  query
     * @param  {string}  [boolean=and]
     * @return {this}
     */
    addNestedWhereQuery(query: Builder, boolean?: string): this;
    /**
     * Add a new select column to the query.
     *
     * @param  {array|any}  column
     * @return {this}
     */
    addSelect(column: string | string[] | Expression): this;
    /**
     * Add an exists clause to the query.
     *
     * @param  {\Illuminate\Database\Query\Builder}  query
     * @param  {string}  boolean
     * @param  {boolean}  not
     * @return {this}
     */
    addWhereExistsQuery(query: Builder, boolean?: string, not?: boolean): this;
    /**
     * Execute an aggregate function on the database.
     *
     * @param  {string}  functionName
     * @param  {any[]}  columns
     * @return {*}
     */
    aggregate(functionName: string, columns?: string[]): Promise<any>;
    /**
     * Invoke the "before query" modification callbacks.
     *
     * @return {void}
     */
    applyBeforeQueryCallbacks(): void;
    /**
     * Remove all of the expressions from a list of bindings.
     *
     * @param  {Array}  bindings
     * @return {Array}
     */
    cleanBindings(bindings: any[]): any[];
    /**
     * Clone the query.
     *
     * @return {Builder}
     */
    clone(): this;
    /**
     * Clone the existing query instance for usage in a pagination subquery.
     *
     * @return {this}
     */
    protected cloneForPaginationCount(): this;
    /**
     * Clone the query without the given properties.
     *
     * @param  {Array}  properties
     * @return {this}
     */
    cloneWithout(properties: any[]): this;
    /**
     * Clone the query without the given bindings.
     *
     * @param  {Array}  except
     * @return {Builder}
     */
    cloneWithoutBindings(except: any[]): this;
    /**
     * Retrieve the "count" result of the query.
     *
     * @param  {string}  [columns=*]
     * @return {number}
     */
    count(columns?: string): Promise<number>;
    /**
     * Creates a subquery and parse it.
     *
     * @param  {Function|\Illuminate\Database\Query\Builder|EloquentBuilder|string}  query
     * @return {Array}
     */
    protected createSub(query: Function | Builder | Expression | EloquentBuilder | string): [string, unknown[]];
    /**
     * Add a "cross join" clause to the query.
     *
     * @param  {string}  table
     * @param  {Function|string}  {first}
     * @param  {string}  [operator=undefined]
     * @param  {string}  [second=undefined]
     * @return {this}
     */
    crossJoin(table: string, first?: string | Function, operator?: string, second?: string): this;
    /**
     * Force the query to only return distinct results.
     *
     * @param  {string[]}  columns
     * @return {this}
     */
    distinct(...columns: string[]): this;
    /**
     * Determine if no rows exist for the current query.
     *
     * @return {Promise<boolean>}
     */
    doesntExist(): Promise<boolean>;
    /**
     * Execute the given callback if rows exist for the current query.
     *
     * @param  {Function}  callback
     * @return {*}
     */
    doesntExistOr(callback: Function): Promise<any>;
    /**
     * Determine if any rows exist for the current query.
     *
     * @return {Promise<boolean>}
     */
    exists(): Promise<boolean>;
    /**
     * Execute the given callback if no rows exist for the current query.
     *
     * @param  {Function}  callback
     * @return {*}
     */
    existsOr(callback: Function): Promise<any>;
    /**
     * Execute a query for a single record by ID.
     *
     * @param  {number|string}  id
     * @param  {string[]}  columns
     * @return {*|this}
     */
    find(id: number | string, columns?: string[]): any | this;
    /**
     * Get a scalar type value from an unknown type of input.
     *
     * @param  {any}  value
     * @return {any}
     */
    protected flattenValue(value: unknown): unknown;
    /**
     * Create a new query instance for nested where condition.
     *
     * @return {\Illuminate\Database\Query\Builder}
     */
    forNestedWhere(): Builder;
    /**
     * Set the limit and offset for a given page.
     *
     * @param  {number}  page
     * @param  {number}  [perPage=15]
     * @return {this}
     */
    forPage(page: number, perPage?: number): this;
    /**
     * Create a new query instance for a sub-query.
     *
     * @return {\Illuminate\Database\Query\Builder}
     */
    protected forSubQuery(): Builder;
    /**
     * Set the table which the query is targeting.
     *
     * @param  {Function|\Illuminate\Database\Query\Builder|string}  table
     * @param  {string|undefined}  as
     * @return {this}
     * @memberof Builder
     */
    from(table: Function | Builder | Expression | string, as?: string): this;
    /**
     * Add a raw from clause to the query.
     *
     * @param  {string}  expression
     * @param  {unknown}  [bindings=[]]
     * @return {this}
     */
    fromRaw(expression: string, bindings?: unknown): this;
    /**
     * Makes "from" fetch from a subquery.
     *
     * @param  {Function|\Illuminate\Database\Query\Builder|string}  query
     * @param  {string}  as
     * @return {this}
     *
     * @throws {\InvalidArgumentException}
     */
    fromSub(query: Function | Builder | Expression | string, as: string): this;
    /**
     * Execute the query as a "select" statement.
     *
     * @param  {Array|string}  columns
     * @return {\Illuminate\Support\Collection}
     */
    get(columns?: string[]): Promise<Collection>;
    /**
     * Get the current query value bindings in a flattened array.
     *
     * @return {any[]}
     */
    getBindings(): any;
    /**
     * Get the database connection instance.
     *
     * @return {\Illuminate\Database\ConnectionInterface}
     */
    getConnection(): Connection;
    /**
     * Get the count of the total records for the paginator.
     *
     * @param  {unknown[]}  [columns=[*]]
     * @return {Promise<number>}
     */
    getCountForPagination(columns?: unknown[]): Promise<number>;
    /**
     * Get the query grammar instance.
     *
     * @return {\Illuminate\Database\Query\Grammars\Grammar}
     */
    getGrammar(): Grammar;
    /**
     * Get the database query processor instance.
     *
     * @return {\Illuminate\Database\Query\Processors\Processor}
     */
    getProcessor(): Processor;
    /**
     * Get the raw array of bindings.
     *
     * @return {Bindings}
     */
    getRawBindings(): Bindings;
    /**
     * Add a "group by" clause to the query.
     *
     * @param  {string|string[]}  groups
     * @return {this}
     */
    groupBy(...groups: any): this;
    /**
     * Add a raw groupBy clause to the query.
     *
     * @param  {string}  sql
     * @param  {string[]}  [bindings=[]]
     * @return {this}
     */
    groupByRaw(sql: string, bindings?: string[]): this;
    /**
     * Add a "having" clause to the query.
     *
     * @param  {Function | string}  column
     * @param  {string}  [operator]
     * @param  {string}  [value]
     * @param  {string}  [boolean]
     * @return {this}
     */
    having(column: Function | string, operator?: unknown, value?: unknown, boolean?: string): this;
    /**
     * Add a "having between " clause to the query.
     *
     * @param  {string}  column
     * @param  {any[]}  values
     * @param  {string}  [boolean=and]
     * @param  {boolean}  [not=and]
     * @return {this}
     */
    havingBetween(column: string, values: any[], boolean?: string, not?: boolean): this;
    /**
     * Add a nested having statement to the query.
     *
     * @param  {Function}  callback
     * @param  {string}  [boolean=and]
     * @return {this}
     */
    havingNested(callback: Function, boolean?: string): this;
    /**
     * Add a "having not null" clause to the query.
     *
     * @param  {string|any[]}  columns
     * @param  {string}  boolean
     * @return {this}
     */
    havingNotNull(columns: string | any[], boolean?: string): this;
    /**
     * Add a "having null" clause to the query.
     *
     * @param  {string | any[]}  columns
     * @param  {string}  boolean
     * @param  {boolean}  not
     * @return {this}
     */
    havingNull(columns: string | any[], boolean?: string, not?: boolean): this;
    /**
     * Add a raw having clause to the query.
     *
     * @param  {string}  sql
     * @param  {string[]}  [bindings=[]]
     * @param  {string}  [boolean='and']
     * @return {Builder}
     */
    havingRaw(sql: string, bindings?: string[], boolean?: string): this;
    /**
     * Concatenate values of a given column as a string.
     *
     * @param  {string}  column
     * @param  {string}  [glue='']
     * @return {string}
     */
    implode(column: string, glue?: string): Promise<string>;
    /**
     * Insert new records into the database.
     *
     * @param  {Array}  values
     * @return {boolean}
     */
    insert(values: Record<string, any>): Promise<boolean>;
    /**
     * Insert a new record and get the value of the primary key.
     *
     * @param  {Array}  values
     * @param  {string|undefined}  [sequence]
     * @return number
     */
    insertGetId(values: Record<string, any>, sequence?: string): Promise<number>;
    /**
     * Insert new records into the database while ignoring errors.
     *
     * @param  {Array}  values
     * @return {number}
     */
    insertOrIgnore(values: Record<string, any>): Promise<number>;
    /**
     * Insert new records into the table using a subquery.
     *
     * @param  {Array}  columns
     * @param  {Function|\Illuminate\Database\Query\Builder|string}  query
     * @return {Promise<number>}
     */
    insertUsing(columns: any[], query: Function | Builder | string): Promise<number>;
    /**
     * Determine if the given operator is supported.
     *
     * @param  {string}  operator
     * @return {boolean}
     */
    protected invalidOperator(operator: string): boolean;
    /**
     * Determine if the given operator and value combination is legal.
     *
     * Prevents using Null values with invalid operators.
     *
     * @param  {string}  operator
     * @param  {any}  value
     * @return {boolean}
     */
    protected invalidOperatorAndValue(operator: string, value: any): boolean;
    /**
     * Determine if the operator is a bitwise operator.
     *
     * @param  {string}  operator
     * @return {boolean}
     */
    protected isBitwiseOperator(operator: string): boolean;
    /**
     * Determine if the value is a query builder instance or a Closure.
     *
     * @param  {any}  value
     * @return {boolean}
     */
    protected isQueryable(value: any): boolean;
    /**
     * Add a join clause to the query.
     *
     * @param  {string}  table
     * @param  {Function|string}  first
     * @param  {string|undefined}  [operator]
     * @param  {string|undefined}  [second]
     * @param  {string}  [type=inner]
     * @param  {boolean}  [where=false]
     * @return {this}
     */
    join(table: string | Expression, first: string | Function, operator?: string, second?: string, type?: string, where?: boolean): this;
    /**
     * Add a subquery join clause to the query.
     *
     * @param  {Function|\Illuminate\Database\Query\Builder|\Illuminate\Database\Eloquent\Builder|string}  query
     * @param  {string}  as
     * @param  {Function|string}  first
     * @param  {string|undefined}  operator
     * @param  {string|undefined}  second
     * @param  {string}  [type=inner]
     * @param  {boolean}  [where=false]
     * @return {this}
     *
     * @throws \InvalidArgumentException
     */
    joinSub(query: Function | Builder | EloquentBuilder | string, as: string, first: Function | string, operator?: string, second?: any, type?: string, where?: boolean): this;
    /**
     * Add a "join where" clause to the query.
     *
     * @param  {string}  table
     * @param  {Function|string}  first
     * @param  {string}  operator
     * @param  {string}  second
     * @param  {string}  [type=inner]
     * @return {this}
     */
    joinWhere(table: string, first: Function | string, operator: string, second: string, type?: string): this;
    /**
     * Set the "limit" value of the query.
     *
     * @param  {number}  value
     * @return {this}
     */
    limit(value: number): this;
    /**
     * Add a left join to the query.
     *
     * @param  {string}  table
     * @param  {Function|string}  first
     * @param  {string}  [operator]
     * @param  {string}  [second]
     * @return {this}
     */
    leftJoin(table: string, first: Function | string, operator?: string, second?: string): this;
    /**
     * Add a subquery left join to the query.
     *
     * @param  {Function|\Illuminate\Database\Query\Builder|\Illuminate\Database\Eloquent\Builder|string}  query
     * @param  {string}  as
     * @param  {Function|string}  first
     * @param  {string}  operator
     * @param  {string}  {second}
     * @return {this}
     */
    leftJoinSub(query: Function | Builder | EloquentBuilder | string, as: string, first: Function | string, operator: string, second: string): this;
    /**
     * Add a "join where" clause to the query.
     *
     * @param  {string}  table
     * @param  {Function|string}  first
     * @param  {string}  operator
     * @param  {string}  second
     * @return {this}
     */
    leftJoinWhere(table: string, first: Function | string, operator: string, second: string): this;
    /**
     * Retrieve the maximum value of a given column.
     *
     * @param  {string}  column
     * @return {*}
     */
    max(column: string): any;
    /**
     * Merge an array of bindings into our bindings.
     *
     * @param  {\Illuminate\Database\Query\Builder}  query
     * @return {this}
     */
    mergeBindings(query: Builder): this;
    /**
     * Retrieve the minimum value of a given column.
     *
     * @param  {string}  column
     * @return {*}
     */
    min(column: string): any;
    /**
     * Get a new join clause.
     *
     * @param  {\Illuminate\Database\Query\Builder}  parentQuery
     * @param  {string}  type
     * @param  {string}  table
     * @return {\Illuminate\Database\Query\JoinClause}
     */
    protected newJoinClause(parentQuery: Builder, type: string, table: string | Expression): JoinClause;
    /**
     * Get a new instance of the query builder.
     *
     * @return {\Illuminate\Database\Query\Builder}
     */
    newQuery(): Builder;
    /**
     * Set the "offset" value of the query.
     *
     * @param  {number}  value
     * @return {this}
     */
    offset(value: number): this;
    /**
     * Execute the given callback while selecting the given columns.
     *
     * After running the callback, the columns are reset to the original value.
     *
     * @param  {Array<string | Expression>}  columns
     * @param  {Function}  callback
     * @return {any}
     */
    protected onceWithColumns(columns: Array<string | Expression>, callback: Function): Promise<any>;
    /**
     * Add an "order by" clause to the query.
     *
     * @param  {Function|\Illuminate\Database\Query\Builder|\Illuminate\Database\Query\Expression|string}  column
     * @param  {string}  [direction=asc]
     * @return {this}
     *
     * @throws {\InvalidArgumentException}
     */
    orderBy(column: Function | Builder | Expression | string, direction?: string): this;
    /**
     * Add a descending "order by" clause to the query.
     *
     * @param  {Function|\Illuminate\Database\Query\Builder|\Illuminate\Database\Query\Expression|string}  column
     * @return {this}
     */
    orderByDesc(column: Function | Builder | Expression | string): this;
    /**
     * Add a raw "order by" clause to the query.
     *
     * @param  {string}  sql
     * @param  {Array}  bindings
     * @return {this}
     */
    orderByRaw(sql: string, bindings?: any): this;
    /**
     * Add an "or having" clause to the query.
     *
     * @param  {Function | string}  column
     * @param  {string}  [operator]
     * @param  {string}  [value]
     * @return {this}
     */
    orHaving(column: Function | string, operator?: unknown, value?: string): this;
    /**
     * Add an "or having not null" clause to the query.
     *
     * @param  {string}  column
     * @return {this}
     */
    orHavingNotNull(column: string): this;
    /**
     * Add an "or having null" clause to the query.
     *
     * @param  {string}  column
     * @return {this}
     */
    orHavingNull(column: string): this;
    /**
     * Add a raw or having clause to the query.
     *
     * @param  {string}  sql
     * @param  {any}  [bindings=[]]
     * @return {this}
     */
    orHavingRaw(sql: string, bindings?: any[]): this;
    /**
     * Add an "or where" clause to the query.
     *
     * @param  {Function|string|Array}  column
     * @param  {any}  operator
     * @param  {any}  value
     * @return {this}
     */
    orWhere(column: Function | string | Record<string, any>, operator?: any, value?: any): this;
    /**
     * Add an "or where" clause comparing two columns to the query.
     *
     * @param  {string|string[]}  first
     * @param  {string}  [operator]
     * @param  {string}  [second]
     * @return {this}
     */
    orWhereColumn(first: string | any[], operator?: string, second?: string): this;
    /**
     * Add an "or where date" statement to the query.
     *
     * @param  {string}  column
     * @param  {any}  operator
     * @param  {Date|string|undefined}  value
     * @return {this}
     */
    orWhereDate(column: string, operator: any, value?: Date | string): this;
    /**
     * Add an "or where day" statement to the query.
     *
     * @param  {string}  column
     * @param  {string}  operator
     * @param {Date|unknown} [value]
     * @return {this}
     * @memberof Builder
     */
    orWhereDay(column: string, operator: any, value?: Date | unknown): this;
    /**
     * Add an or exists clause to the query.
     *
     * @param  {Function}  callback
     * @param  {boolean}  [not=false]
     * @return {this}
     */
    orWhereExists(callback: Function, not?: boolean): this;
    /**
     * Add an "or where in" clause to the query.
     *
     * @param  {string}  column
     * @param  {any}  values
     * @return {this}
     */
    orWhereIn(column: string, values: any): this;
    /**
     * Add an "or where in raw" clause for integer values to the query.
     *
     * @param  {string}  column
     * @param  {any}  values
     * @return {this}
     */
    orWhereIntegerInRaw(column: string, values: any): this;
    /**
     * Add an "or where not in raw" clause for integer values to the query.
     *
     * @param  {string}  column
     * @param  {any}  values
     * @return {this}
     */
    orWhereIntegerNotInRaw(column: string, values: any): this;
    /**
     * Add an "or where month" statement to the query.
     *
     * @param  {string}  column
     * @param  {any}  operator
     * @param  {Date|unknown}  [value]
     * @return {this}
     */
    orWhereMonth(column: string, operator: any, value?: Date | unknown): this;
    /**
     * Add an "or where not" clause to the query.
     *
     * @param  {Function|string|any[]}  column
     * @param  {any}  operator
     * @param  {any}  value
     * @return {this}
     */
    orWhereNot(column: Function | string | any[], operator?: unknown, value?: unknown): this;
    /**
     * Add a where not exists clause to the query.
     *
     * @param  {Function}  callback
     * @return {this}
     */
    orWhereNotExists(callback: Function): this;
    /**
     * Add an "or where not in" clause to the query.
     *
     * @param  {string}  column
     * @param  {any}  values
     * @return {this}
     */
    orWhereNotIn(column: string, values: any): this;
    /**
     * Add an "or where not null" clause to the query.
     *
     * @param  {string} column
     * @return {this}
     */
    orWhereNotNull(column: string | string[]): this;
    /**
     * Add an "or where null" clause to the query.
     *
     * @param  {string}  column
     * @return {this}
     */
    orWhereNull(column: string | string[]): this;
    /**
     * Add a raw or where clause to the query.
     *
     * @param  {string}  sql
     * @param  {any}  bindings
     * @return {this}
     */
    orWhereRaw(sql: string, bindings?: any): this;
    /**
     * Add an "or where year" statement to the query.
     *
     * @param  {string}  column
     * @param  {string}  operator
     * @param  {Date|string|number}  [value]
     * @return {Builder}
     */
    orWhereYear(column: string, operator: any, value?: Date | string | number): this;
    /**
     * Parse the subquery into SQL and bindings.
     *
     * @param  {any}  query
     * @return {Array}
     *
     * @throws {\InvalidArgumentException}
     */
    protected parseSub(query: any): [string, unknown[]];
    /**
     * Get an array with the values of a given column.
     *
     * @param  {string}  column
     * @param  {string|undefined}  key
     * @return {\Illuminate\Support\Collection}
     */
    pluck(column: string, key?: string): Promise<Collection>;
    /**
     * Retrieve column values from rows represented as objects.
     *
     * @param  {any[]}  queryResult
     * @param  {string}  column
     * @param  {string}  key
     * @return {\Illuminate\Support\Collection}
     */
    protected pluckFromObjectColumn(queryResult: any[], column: string, key: string): Collection;
    /**
     * Prepare the value and operator for a where clause.
     *
     * @param  {Date|string|number|undefined}  value
     * @param  {string}  operator
     * @param  {boolean}  useDefault
     * @return {Array}
     *
     * @throws {\InvalidArgumentException}
     */
    prepareValueAndOperator(value: string, operator: string, useDefault?: boolean): any;
    /**
     * Prepend the database name if the given query is on another database.
     *
     * @param  {any}  query
     * @return {any}
     */
    protected prependDatabaseNameIfCrossDatabaseQuery(query: any): any;
    /**
     * Remove all existing orders and optionally add a new order.
     *
     * @param  {string}  [column]
     * @param  {string}  [direction=asc]
     * @return {this}
     */
    reorder(column?: string, direction?: string): this;
    /**
     * Add a subquery right join to the query.
     *
     * @param  {Function|\Illuminate\Database\Query\Builder|\Illuminate\Database\Eloquent\Builder|string}  query
     * @param  {string}  as
     * @param  {Function|string}  first
     * @param  {string|undefined}  [operator=undefined]
     * @param  {string|undefined}  [second=undefined]
     * @return {this}
     */
    rightJoinSub(query: Function | Builder | EloquentBuilder | string, as: string, first: Function | string, operator?: string, second?: string): this;
    /**
     * Run a pagination count query.
     *
     * @param  {Array}  columns
     * @return {Array}
     */
    protected runPaginationCountQuery(columns?: any[]): Promise<any[]>;
    /**
     * Run the query as a "select" statement against the connection.
     *
     * @return {Array}
     */
    protected runSelect(): any;
    /**
     * Set the columns to be selected.
     *
     * @param {Array|any} columns
     * @return {this}
     * @memberof Builder
     */
    select(...columns: any | string[]): this;
    /**
   * Add a new "raw" select expression to the query.
   *
   * @param  {string}  expression
   * @param  {array}  bindings
   * @return {this}
   */
    selectRaw(expression: string, bindings?: unknown[]): this;
    /**
     * Add a subselect expression to the query.
     *
     * @param {Function|\Illuminate\Database\Query\Builder|\Illuminate\Database\Eloquent\Builder|string}  query
     * @param {string}  as
     * @return {this}
     *
     * @throws {\InvalidArgumentException}
     */
    selectSub(query: Function | Builder | EloquentBuilder | string, as: string): this;
    /**
     * Set the aggregate property without running the query.
     *
     * @param  {string}  functionName
     * @param  {Array}  columns
     * @return {this}
     */
    protected setAggregate(functionName: string, columns: Array<string | Expression>): this;
    /**
     * Alias to set the "offset" value of the query.
     *
     * @param  {number}  value
     * @return {Builder}
     */
    skip(value: number): this;
    /**
     * Strip off the table name or alias from a column identifier.
     *
     * @param  {string}  column
     * @return {string|undefined}
     */
    protected stripTableForPluck(column?: string): string | undefined;
    /**
     * Retrieve the sum of the values of a given column.
     *
     * @param  {string}  column
     * @return {*}
     */
    sum(column: string): Promise<any>;
    /**
     * Alias to set the "limit" value of the query.
     *
     * @param  {number}  value
     * @return {Builder}
     */
    take(value: number): this;
    /**
     * Get the SQL representation of the query.
     *
     * @return {string}
     */
    toSql(): string;
    /**
     * Add a union statement to the query.
     *
     * @param  {\Illuminate\Database\Query\Builder|Function}  query
     * @param  {boolean}  [all=false]
     * @return {this}
     */
    union(query: Builder | Function, all?: boolean): this;
    /**
     * Add a union all statement to the query.
     *
     * @param  {\Illuminate\Database\Query\Builder|Function}  query
     * @return {this}
     */
    unionAll(query: Builder | Function): this;
    /**
     * Get a single column's value from the first result of a query.
     *
     * @param  {string}  column
     * @return {*}
     */
    value(column: string): Promise<any>;
    /**
     * Add a basic where clause to the query.
     *
     * @param  {Function|string|Expression|any[]|Record<string, unknown>}  column
     * @param  {any}  [operator]
     * @param  {any}  [value]
     * @param  {string}  boolean
     * @return {this}
     */
    where(column: Function | string | Expression | any[] | Record<string, unknown>, operator?: any, value?: any, boolean?: string): this;
    /**
     * Add a where between statement to the query.
     *
     * @param  {\Illuminate\Database\Query\Expression|string}  column
     * @param  {any[]}  values
     * @param  {string}  boolean
     * @param  {boolean}  not
     * @return {this}
     */
    whereBetween(column: Expression | string, values: any[], boolean?: string, not?: boolean): this;
    /**
     * Add a where between statement using columns to the query.
     *
     * @param  {string}  column
     * @param  {any[]}  values
     * @param  {string}  boolean
     * @param  {boolean}  not
     * @return {this}
     */
    whereBetweenColumns(column: string, values: any[], boolean?: string, not?: boolean): this;
    /**
     * Add a "where" clause comparing two columns to the query.
     *
     * @param  {string|array}  first
     * @param  {string}  [operator]
     * @param  {string}  [second]
     * @param  {string}  [boolean=and]
     * @return {this}
     */
    whereColumn(first: string | unknown[], operator?: string, second?: string, boolean?: string): this;
    /**
     * Add a "where date" statement to the query.
     *
     * @param  {string}  column
     * @param  {any}  operator
     * @param  {Date|unknown}  [value]
     * @param  {string}  [boolean]
     * @return {this}
     */
    whereDate(column: string, operator: any, value?: Date | unknown, boolean?: string): this;
    /**
     * Add a "where day" statement to the query.
     *
     * @param  {string}  column
     * @param  {any}  operator
     * @param  {Date|unknown}  value
     * @param  {string}  boolean
     * @return {this}
     * @memberof Builder
     */
    whereDay(column: string, operator: any, value?: Date | unknown, boolean?: string): this;
    /**
     * Add an exists clause to the query.
     *
     * @param  {Function}  callback
     * @param  {string}  [boolean=and]
     * @param  {boolean}  [not=false]
     * @return {this}
     */
    whereExists(callback: Function, boolean?: string, not?: boolean): this;
    /**
     * Add a "where fulltext" clause to the query.
     *
     * @param  {string|string[]}  columns
     * @param  {string}  value
     * @param  {any[]}  options
     * @param  {string}  boolean
     * @return {this}
     */
    whereFulltext(columns: string | string[], value: string, options?: Record<string, any>, boolean?: string): this;
    /**
     * Add a "where in" clause to the query.
     * @param  {string}  column
     * @param  {any}  values
     * @param  {string}  boolean
     * @param  {boolean}  [not=false]
     * @return {this}
     */
    whereIn(column: string, values: any, boolean?: string, not?: boolean): this;
    /**
     * Add a "where in raw" clause for integer values to the query.
     *
     * @param  {string}  column
     * @param  {Array}  values
     * @param  {string}  [boolean=and]
     * @param  {boolean}  [not=false]
     * @return {this}
     */
    whereIntegerInRaw(column: string, values: any[], boolean?: string, not?: boolean): this;
    /**
     * Add a "where not in raw" clause for integer values to the query.
     *
     * @param  {string}  column
     * @param  {Array}  values
     * @param  {string}  boolean
     * @return {this}
     */
    whereIntegerNotInRaw(column: string, values: any[], boolean?: string): this;
    /**
     * Add a "where month" statement to the query.
     *
     * @param  {string}  column
     * @param  {any}  operator
     * @param  {Date|unknown}  [value]
     * @param  {string}  boolean
     * @return {this}
     */
    whereMonth(column: string, operator: any, value?: Date | unknown, boolean?: string): this;
    /**
     * Add a nested where statement to the query.
     *
     * @param  {Function}  callback
     * @param  {string}  [boolean='and']
     * @return {this}
     */
    whereNested(callback: Function, boolean?: string): this;
    /**
     * Add a basic "where not" clause to the query.
     *
     * @param  {Function|string|any[]}  column
     * @param  {any}  operator
     * @param  {any}  value
     * @param  {string}  boolean
     * @return {this}
     */
    whereNot(column: Function | string | any[], operator?: any, value?: any, boolean?: string): this;
    /**
     * Add a where not between statement to the query.
     *
     * @param  {string}  column
     * @param  {any[]}  values
     * @param  {string}  boolean
     * @return {this}
     */
    whereNotBetween(column: string, values: any[], boolean?: string): this;
    /**
     * Add a where not between statement using columns to the query.
     *
     * @param  {string}  column
     * @param  {any[]}  values
     * @param  {string}  boolean
     * @return {this}
     */
    whereNotBetweenColumns(column: string, values: any[], boolean?: string): this;
    /**
     * Add a where not exists clause to the query.
     *
     * @param  {Function}  callback
     * @param  {string}  [boolean=and]
     * @return {this}
     */
    whereNotExists(callback: Function, boolean?: string): this;
    /**
     * Add a "where not in" clause to the query.
     *
     * @param  {string}  column
     * @param  {any}  values
     * @param  {string}  boolean
     * @return {this}
     */
    whereNotIn(column: string, values: any, boolean?: string): this;
    /**
     * Add a "where not null" clause to the query.
     *
     * @param  {string|Array}  columns
     * @param  {string}  [boolean=and]
     * @return {this}
     */
    whereNotNull(columns: string | string[], boolean?: string): this;
    /**
     * Add a "where null" clause to the query.
     *
     * @param  {string|Array}  columns
     * @param  {string}  [boolean=and]
     * @param  {boolean}  [not=false]
     * @return {this}
     */
    whereNull(columns: string | Record<string, any>, boolean?: string, not?: boolean): this;
    /**
     * Add a raw where clause to the query.
     *
     * @param  {string}  sql
     * @param  {any}  bindings
     * @param  {string}  boolean
     * @return {this}
     */
    whereRaw(sql: string, bindings?: any, boolean?: string): this;
    /**
     * Add a full sub-select to the query.
     *
     * @param  {string}  column
     * @param  {string}  operator
     * @param  {Function}  callback
     * @param  {string}  boolean
     * @return {this}
     */
    protected whereSub(column: string, operator: string, callback: Function, boolean: string): this;
    /**
     * Add a "where time" statement to the query.
     *
     * @param  {string}  column
     * @param  {string}  operator
     * @param  {Date|string}  [value]
     * @param  {string}  [boolean=and]
     * @return {this}
     */
    whereTime(column: string, operator: any, value?: Date | string | number, boolean?: string): this;
    /**
     * Add a "where year" statement to the query.
     *
     * @param  {string}  column
     * @param  {string}  operator
     * @param  {Date|unknown}  value
     * @param  {string}  boolean
     * @return {this}
     */
    whereYear(column: string, operator: any, value?: Date | unknown, boolean?: string): this;
    /**
     * Remove the column aliases since they will break count queries.
     *
     * @param  {any[]}  columns
     * @return {any[]}
     */
    protected withoutSelectAliases(columns: any[]): any[];
}
