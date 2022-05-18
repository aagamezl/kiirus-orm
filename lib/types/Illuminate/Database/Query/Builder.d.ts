import { Builder as EloquentBuilder } from '../Eloquent/Builder';
import { Collection } from '../../Collections/Collection';
import { Connection } from '../Connection';
import { Grammar } from '../Query/Grammars';
import { Expression, JoinClause } from './internal';
import { Macroable } from '../../Macroable/Traits/Macroable';
import { Processor } from './Processors';
declare type Bindings = Record<string, unknown[]>;
export interface Aggregate {
    function: string;
    columns: Array<string | Expression>;
}
export interface Union {
    all: boolean;
    query: Builder;
}
export interface Order {
    column: string | Expression;
    direction: string;
    sql: string;
}
export interface Builder extends Macroable {
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
    columns: Array<string | Expression>;
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
     * The having constraints for the query.
     *
     * @member {Array}
     */
    havings: never[];
    /**
     * The table joins for the query.
     *
     * @var array
     */
    joins: Array<string | object>;
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
     * Add a binding to the query.
     *
     * @param  {*}  value
     * @param  {string}  type
     * @return {this}
     *
     * @throws {\InvalidArgumentException}
     */
    addBinding(value: unknown, type?: keyof Bindings): this;
    /**
     * Add a new select column to the query.
     *
     * @param  {array|any}  column
     * @return {this}
     */
    addSelect(column: string | string[] | Expression): this;
    /**
     * Invoke the "before query" modification callbacks.
     *
     * @return {void}
     */
    applyBeforeQueryCallbacks(): void;
    /**
     * Creates a subquery and parse it.
     *
     * @param  {Function|\Illuminate\Database\Query\Builder|EloquentBuilder|string}  query
     * @return {Array}
     */
    protected createSub(query: Function | Builder | EloquentBuilder | string): [string, unknown[]];
    /**
     * Force the query to only return distinct results.
     *
     * @param  {string[]}  columns
     * @return {this}
     */
    distinct(...columns: string[]): this;
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
    from(table: Function | Builder | string, as?: string): this;
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
    fromSub(query: Function | Builder | string, as: string): this;
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
    join(table: string, first: string | Function, operator?: string, second?: string, type?: string, where?: boolean): this;
    /**
     * Get a new join clause.
     *
     * @param  {\Illuminate\Database\Query\Builder}  parentQuery
     * @param  {string}  type
     * @param  {string}  table
     * @return {\Illuminate\Database\Query\JoinClause}
     */
    protected newJoinClause(parentQuery: Builder, type: string, table: string): JoinClause;
    /**
     * Get a new instance of the query builder.
     *
     * @return {\Illuminate\Database\Query\Builder}
     */
    newQuery(): Builder;
    /**
     * Execute the given callback while selecting the given columns.
     *
     * After running the callback, the columns are reset to the original value.
     *
     * @param  {Array}  columns
     * @param  {Function}  callback
     * @return {*}
     */
    protected onceWithColumns(columns: Array<string | Expression>, callback: Function): Promise<unknown>;
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
     * Prepend the database name if the given query is on another database.
     *
     * @param  {any}  query
     * @return {any}
     */
    protected prependDatabaseNameIfCrossDatabaseQuery(query: any): any;
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
    select(...columns: string[]): this;
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
     * Get the SQL representation of the query.
     *
     * @return {string}
     */
    toSql(): string;
}
export {};
