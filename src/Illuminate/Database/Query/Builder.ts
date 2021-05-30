import * as utils from '@devnetic/utils';

import { Builder as EloquentBuilder } from '../Eloquent/Query/Builder';
import { Grammar } from './Grammars'
import { Processor } from './Processors'
import { Relation } from '../Eloquent/Relations/Relation';
import { Connection } from '../Connection';
import { Expression } from './Expression';
import { callbackFn } from '../../Support/Types';
import { Arr } from '../../Collections/Arr';
import { collect, head } from '../../Collections/Helpers';
import { JoinClause, TJoinClause } from './JoinClause';
import { Collection } from '../../Collections/Collection';

export interface UnionInterface {
  all: boolean,
  query: Builder;
}

export interface UnionOrderInterface {
  column: Builder | Expression | string,
  direction: string;
}

export interface AggregateInterface {
  function: string,
  columns: Array<any>;
}

export type TBindings = Record<string, Array<string>>;

export interface WhereInterface {
  boolean?: string;
  column?: Function | Expression | string | Array<any>;
  first?: string | Array<any>;
  not?: boolean
  operator?: string;
  query?: Builder;
  second?: string;
  sql?: string;
  type: string;
  value?: any;
  values?: Array<any>;
}

export class Builder {
  /**
   * An aggregate function and column to be run.
   *
   * @var AggregateInterface
   */
  public aggregateProperty?: AggregateInterface;

  /**
   * The callbacks that should be invoked before the query is executed.
   *
   * @var array
   */
  public beforeQueryCallbacks: Array<any> = [];

  /**
   * The current query value bindings.
   *
   * @var object
   */
  public bindings: TBindings = {
    'select': [],
    'from': [],
    'join': [],
    'where': [],
    'groupBy': [],
    'having': [],
    'order': [],
    'union': [],
    'unionOrder': [],
  };

  /**
   * The columns that should be returned.
   *
   * @var array
   */
  public columns: Array<string> = [];

  /**
   * The database connection instance.
   *
   * @var \Illuminate\Database\ConnectionInterface
   */
  public connection;

  /**
   * Indicates if the query returns distinct results.
   *
   * Occasionally contains the columns that should be distinct.
   *
   * @var bool|array
   */
  public distinctProperty: boolean | Array<any> = false;

  /**
   * The table which the query is targeting.
   *
   * @var string
   */
  public fromProperty: string | Expression = '';

  /**
   * The database query grammar instance.
   *
   * @var \Illuminate\Database\Query\Grammars\Grammar
   */
  public grammar: Grammar;

  /**
   * The having constraints for the query.
   *
   * @var array
   */
  public havings: Array<any> = [];

  /**
   * The table joins for the query.
   *
   * @var array
   */
  public joins: Array<any> = [];

  /**
   * The maximum number of records to return.
   *
   * @var number
   */
  public limitProperty: number | undefined;

  /**
   * The number of records to skip.
   *
   * @var number
   */
  public offsetProperty: number | undefined;

  /**
   * All of the available clause operators.
   *
   * @var string[]
   */
  public operators: Array<string> = [
    '=', '<', '>', '<=', '>=', '<>', '!=', '<=>',
    'like', 'like binary', 'not like', 'ilike',
    '&', '|', '^', '<<', '>>',
    'rlike', 'not rlike', 'regexp', 'not regexp',
    '~', '~*', '!~', '!~*', 'similar to',
    'not similar to', 'not ilike', '~~*', '!~~*',
  ];

  /**
   * The database query post processor instance.
   *
   * @var \Illuminate\Database\Query\Processors\Processor
   */
  public processor: Processor;

  /**
   * The query union statements.
   *
   * @var array
   */
  public unions: Array<UnionInterface> = [];

  /**
   * The maximum number of union records to return.
   *
   * @var number
   */
  public unionLimit: number | undefined;

  /**
   * The number of union records to skip.
   *
   * @var number
   */
  public unionOffset: number | undefined;

  /**
   * The orderings for the union query.
   *
   * @var array
   */
  public unionOrders: Array<UnionOrderInterface> = [];

  /**
   * The where constraints for the query.
   *
   * @var array
   */
  public wheres: Array<WhereInterface> = [];

  constructor(
    connection: Connection,
    grammar?: Grammar,
    processor?: Processor
  ) {
    this.connection = connection;
    this.grammar = grammar ?? connection.getQueryGrammar();
    this.processor = processor ?? connection.getPostProcessor();
  }

  /**
   * Add an array of where clauses to the query.
   *
   * @param  array  column
   * @param  string  boolean
   * @param  string  method
   * @return this
   */
  protected addArrayOfWheres(column: Array<any>, boolean: string, method: string = 'where'): Builder {
    return this.whereNested((query: Builder) => {
      for (const [key, value] of Object.entries(column)) {
        if (utils.isNumeric(key) && Array.isArray(value)) {
          (query as any)[method](...value.values());
        } else {
          (query as any)[method](key, '=', value, boolean);
        }
      }
    }, boolean);
  }

  /**
   * Add a binding to the query.
   *
   * @param  mixed  value
   * @param  string  type
   * @return this
   *
   * @throws \InvalidArgumentException
   */
  public addBinding(value: any, type: string = 'where'): Builder {
    if (!this.bindings[type]) {
      throw new Error(`InvalidArgumentException: Invalid binding type: ${type}.`);
    }

    if (Array.isArray(value)) {
      this.bindings[type] = Object.values([...this.bindings[type], ...value]) as Array<string>;
    } else {
      this.bindings[type].push(value);
    }

    return this;
  }

  /**
   * Add a date based (year, month, day, time) statement to the query.
   *
   * @param  string  type
   * @param  string  column
   * @param  string  operator
   * @param  mixed  value
   * @param  string  boolean
   * @return Builder
   */
  protected addDateBasedWhere(type: string, column: string, operator: string, value: any, boolean: string = 'and'): Builder {
    this.wheres.push({ column, type, boolean, operator, value });

    if (!(value instanceof Expression)) {
      this.addBinding(value, 'where');
    }

    return this;
  }

  /**
   * Add another query builder as a nested where to the query builder.
   *
   * @param  \Illuminate\Database\Query\Builder  query
   * @param  string  boolean
   * @return this
   */
  public addNestedWhereQuery(query: Builder, boolean: string = 'and'): Builder {
    if (query.wheres.length > 0) {
      const type = 'Nested';

      this.wheres.push({ type, query, boolean });

      this.addBinding(query.getRawBindings()['where'], 'where');
    }

    return this;
  }

  /**
   * Add a new select column to the query.
   *
   * @param  array|mixed  column
   * @return this
   */
  public addSelect(column: Array<string> | any): Builder {
    const columns = Array.isArray(column) ? column : [...arguments];

    for (const [as, column] of Object.entries(columns)) {
      if (typeof as === 'string' && this.isQueryable(column)) {
        if (this.columns) {
          this.select(this.fromProperty + '.*');
        }

        this.selectSub(column, as);
      } else {
        this.columns.push(column);
      }
    }

    return this;
  }

  /**
   * Invoke the "before query" modification callbacks.
   *
   * @return void
   */
  public applyBeforeQueryCallbacks() {
    for (const callback of this.beforeQueryCallbacks) {
      callback(this);
    }

    this.beforeQueryCallbacks = [];
  }

  /**
   * Remove all of the expressions from a list of bindings.
   *
   * @param  array  bindings
   * @return array
   */
  public cleanBindings(bindings: Array<any>): Array<any> {
    return Arr.values(bindings.filter((binding: any) => {
      return !(binding instanceof Expression);
    }));
  }

  /**
   * Creates a subquery and parse it.
   *
   * @param  Function|Builder|string  query
   * @return array
   */
  protected createSub(query: Function | Builder | EloquentBuilder | string): Array<any> {
    // If the given query is a Closure, we will execute it while passing in a new
    // query instance to the Closure. This will give the developer a chance to
    // format and work with the query before we cast it to a raw SQL string.
    if (query instanceof Function) {
      const callback = query;
      query = this.forSubQuery();

      callback(query);
    }

    return this.parseSub(query);
  }

  /**
   * Force the query to only return distinct results.
   *
   * @return this
   */
  public distinct(...columns: any): Builder {
    // const columns = [...arguments];

    if (columns.length > 0) {
      this.distinctProperty = Array.isArray(columns[0]) || typeof columns[0] === 'boolean' ? columns[0] : columns;
    } else {
      this.distinctProperty = true;
    }

    return this;
  }

  /**
   * Get a scalar type value from an unknown type of input.
   *
   * @param  any  value
   * @return any
   */
  protected flattenValue(value: any): any {
    return Array.isArray(value) ? head(Arr.flatten(value)) : value;
  }

  /**
   * Create a new query instance for nested where condition.
   *
   * @return \Illuminate\Database\Query\Builder
   */
  public forNestedWhere(): Builder {
    return this.newQuery().from(this.fromProperty as callbackFn | Builder | string);
  }

  /**
   * Create a new query instance for a sub-query.
   *
   * @return \Illuminate\Database\Query\Builder
   */
  protected forSubQuery(): Builder {
    return this.newQuery();
  }

  /**
   * Set the table which the query is targeting.
   *
   * @param  Function|Builder|string table
   * @param  string as
   * @return this
   */
  public from(table: callbackFn | Builder | string, as: string = '') {
    if (this.isQueryable(table)) {
      return this.fromSub(table, as);
    }

    this.fromProperty = (as ? `${table} as ${as}` : table) as string;

    return this;
  }

  /**
   * Add a raw from clause to the query.
   *
   * @param  string  expression
   * @param  mixed  bindings
   * @return this
   */
  public fromRaw(expression: string, bindings: any = []): Builder {
    this.fromProperty = new Expression(expression);

    this.addBinding(bindings, 'from');

    return this;
  }

  /**
   * Makes "from" fetch from a subquery.
   *
   * @param  Function|Builder|string  query
   * @param  string  as
   * @return this
   *
   * @throws \InvalidArgumentException
   */
  public fromSub(query: callbackFn | Builder | string, as: string): Builder {
    const [newQuery, bindings] = this.createSub(query);

    return this.fromRaw('(' + newQuery + ') as ' + this.grammar.wrapTable(as), bindings);
  }

  /**
   * Execute the query as a "select" statement.
   *
   * @param  array|string  columns
   * @return \Illuminate\Support\Collection
   */
  public get(columns: Array<any> | string = ['*']): Collection {
    return collect(this.onceWithColumns(Arr.wrap(columns), () => {
      return this.processor.processSelect(this, this.runSelect());
    }));
  }

  /**
   * Get the current query value bindings in a flattened array.
   *
   * @return array
   */
  public getBindings(): Array<any> {
    return Arr.flatten(this.bindings);
  }

  /**
   * Get the database connection instance.
   *
   * @return \Illuminate\Database\Connection
   */
  public getConnection(): Connection {
    return this.connection;
  }

  /**
   * Get the query grammar instance.
   *
   * @return \Illuminate\Database\Query\Grammars\Grammar
   */
  public getGrammar(): Grammar {
    return this.grammar;
  }

  /**
   * Get the database query processor instance.
   *
   * @return \Illuminate\Database\Query\Processors\Processor
   */
  public getProcessor(): Processor {
    return this.processor;
  }

  /**
   * Get the raw array of bindings.
   *
   * @return TBindings
   */
  public getRawBindings(): TBindings {
    return this.bindings;
  }

  /**
   * Determine if the given operator is supported.
   *
   * @param  string  operator
   * @return boolean
   */
  protected invalidOperator(operator: string): boolean {
    return !this.operators.includes(operator.toLowerCase()) &&
      !this.grammar.getOperators().includes(operator.toLowerCase());
  }

  /**
   * Determine if the given operator and value combination is legal.
   *
   * Prevents using Null values with invalid operators.
   *
   * @param  string  operator
   * @param  mixed  value
   * @return bool
   */
  protected invalidOperatorAndValue(operator: string, value: any): boolean {
    return !value && this.operators.includes(operator) &&
      !['=', '<>', '!='].includes(operator);
  }

  /**
   * Determine if the value is a query builder instance or a Closure.
   *
   * @param  mixed  value
   * @return bool
   */
  protected isQueryable(value: unknown): boolean {
    return value instanceof Builder ||
      value instanceof EloquentBuilder ||
      value instanceof Relation ||
      value instanceof Function;
  }

  /**
   * Add a join clause to the query.
   *
   * @param  string  table
   * @param  \Function|string  first
   * @param  string|null  operator
   * @param  string|null  second
   * @param  string  type
   * @param  bool  where
   * @return this
   */
  public join(
    table: string,
    first: Function | string,
    operator?: string,
    second?: string,
    type: string = 'inner',
    where: boolean = false
  ): Builder {
    const join: TJoinClause = this.newJoinClause(this, type, table);

    // If the first "column" of the join is really a Closure instance the developer
    // is trying to build a join with a complex "on" clause containing more than
    // one condition, so we'll add the join and call a Closure with the query.
    if (first instanceof Function) {
      first(join);

      this.joins.push(join);

      this.addBinding(join.getBindings(), 'join');
    }

    // If the column is simply a string, we can assume the join simply has a basic
    // "on" clause with a single condition. So we will just build the join with
    // this simple join clauses attached to it. There is not a join callback.
    else {
      const method = where ? 'where' : 'on';

      this.joins.push((join as any)[method](first, operator, second));

      this.addBinding(join.getBindings(), 'join');
    }

    return this;
  }

  /**
   * Set the "limit" value of the query.
   *
   * @param  number  value
   * @return Builder
   */
  public limit(value: number): Builder {
    const property = this.unions.length > 0 ? 'unionLimit' : 'limitProperty';

    if (value >= 0) {
      (this as any)[property] = value;
    }

    return this;
  }

  /**
   * Get a new join clause.
   *
   * @param  \Illuminate\Database\Query\Builder  parentQuery
   * @param  string  type
   * @param  string  table
   * @return \Illuminate\Database\Query\JoinClause
   */
  protected newJoinClause(parentQuery: Builder, type: string, table: string): TJoinClause {
    return new JoinClause(parentQuery, type, table) as TJoinClause;
  }

  /**
   * Get a new instance of the query builder.
   *
   * @return \Illuminate\Database\Query\Builder
   */
  public newQuery(): Builder {
    return new (this.constructor as any)(this.connection, this.grammar, this.processor);
  }

  /**
   * Execute the given callback while selecting the given columns.
   *
   * After running the callback, the columns are reset to the original value.
   *
   * @param  array  columns
   * @param  callable  callback
   * @return mixed
   */
  protected onceWithColumns(columns: Array<any>, callback: Function) {
    const original = this.columns;

    if (!original) {
      this.columns = columns;
    }

    const result = callback();

    this.columns = original;

    return result;
  }

  /**
   * Set the "offset" value of the query.
   *
   * @param  number  value
   * @return Builder
   */
  public offset(value: number): Builder {
    const property = this.unions ? 'unionOffset' : 'offsetProperty';

    (this as any)[property] = Math.max(0, value);

    return this;
  }

  /**
   * Add an "order by" clause to the query.
   *
   * @param  Function|\Illuminate\Database\Query\Builder|\Illuminate\Database\Query\Expression|string  column
   * @param  string  direction
   * @return this
   *
   * @throws \InvalidArgumentException
   */
  public orderBy(column: Function | Builder | Expression | string, direction: string = 'asc') {
    if (this.isQueryable(column)) {
      const [query, bindings] = this.createSub(column);

      column = new Expression('(' + query + ')');

      this.addBinding(bindings, this.unions ? 'unionOrder' : 'order');
    }

    direction = direction.toLowerCase();

    if (!['asc', 'desc'].includes(direction)) {
      throw new Error('InvalidArgumentException: Order direction must be "asc" or "desc".');
    }

    (this as any)[this.unions.length > 0 ? 'unionOrders' : 'orders'].push({
      column,
      direction,
    });

    return this;
  }

  /**
   * Add an "or where" clause to the query.
   *
   * @param  Function|string|Array<any>  column
   * @param  any  operator
   * @param  any  value
   * @return Builder
   */
  public orWhere(column: Function | string | Array < any >, operator ?: any, value ?: any): Builder {
    [value, operator] = this.prepareValueAndOperator(
      value, operator, arguments.length === 2
    );

    return this.where(column, operator, value, 'or');
  }

  /**
   * Add an "or where" clause comparing two columns to the query.
   *
   * @param  string|array  first
   * @param  string  operator
   * @param  string  second
   * @return Builder
   */
  public orWhereColumn(first: string | Array < any >, operator ?: string, second ?: string): Builder {
    return this.whereColumn(first, operator, second, 'or');
  }

  /**
   * Add an "or where date" statement to the query.
   *
   * @param  string  column
   * @param  string | number  operator
   * @param  [Date|string]  value
   * @return this
   */
  public orWhereDate(column: string, operator: string | number, value ?: Date | string): Builder {
    [value, operator] = this.prepareValueAndOperator(
      String(value), String(operator), arguments.length === 2
    );

    return this.whereDate(column, operator, value, 'or');
  }

  /**
   * Add an "or where day" statement to the query.
   *
   * @param  string  column
   * @param  string  operator
   * @param  [Date|string]  value
   * @return Builder
   */
  public orWhereDay(column: string, operator: any, value ?: any): Builder {
    [value, operator] = this.prepareValueAndOperator(
      value, operator, arguments.length === 2
    );

    return this.whereDay(column, operator, value, 'or');
  }

  /**
 * Add an "or where month" statement to the query.
 *
 * @param  string  column
 * @param  string | number  operator
 * @param  [Date|string]  value
 * @return Builder
 */
  public orWhereMonth(column: string, operator: any, value ?: any): Builder {
    [value, operator] = this.prepareValueAndOperator(
      value, operator, arguments.length === 2
    );

    return this.whereMonth(column, operator, value, 'or');
  }

  /**
   * Add an "or where in" clause to the query.
   *
   * @param  string  column
   * @param  any  values
   * @return Builder
   */
  public orWhereIn(column: string, values: any): Builder {
    return this.whereIn(column, values, 'or');
  }

  /**
   * Add an "or where in raw" clause for integer values to the query.
   *
   * @param  string  column
   * @param  Array<any> values
   * @return Builder
   */
  public orWhereIntegerInRaw(column: string, values: Array<any>): Builder {
    return this.whereIntegerInRaw(column, values, 'or');
  }

  /**
   * Add an "or where not in raw" clause for integer values to the query.
   *
   * @param  string  column
   * @param  Array<any>  values
   * @return Builder
   */
  public orWhereIntegerNotInRaw(column: string, values: Array<any>): Builder {
    return this.whereIntegerNotInRaw(column, values, 'or');
  }

  /**
   * Add an "or where not in" clause to the query.
   *
   * @param  string  column
   * @param  any  values
   * @return Builder
   */
  public orWhereNotIn(column: string, values: Array<any>): Builder {
    return this.whereNotIn(column, values, 'or');
  }

  /**
   * Add a raw or where clause to the query.
   *
   * @param  string  sql
   * @param  any  bindings
   * @return Builder
   */
  public orWhereRaw(sql: string, bindings: Array < any > =[]): Builder {
    return this.whereRaw(sql, bindings, 'or');
  }

  /**
   * Add an "or where year" statement to the query.
   *
   * @param  string  column
   * @param  string | number  operator
   * @param  [Date|string|number]  value
   * @return Builder
   */
  public orWhereYear(column: string, operator: any, value ?: any): Builder {
    [value, operator] = this.prepareValueAndOperator(
      value, operator, arguments.length === 2
    );

    return this.whereYear(column, operator, value, 'or');
  }

  /**
   * Parse the subquery into SQL and bindings.
   *
   * @param  any  query
   * @return array
   *
   * @throws \InvalidArgumentException
   */
  protected parseSub(query: any): Array < any > {
    if(query instanceof this.constructor.prototype || query instanceof EloquentBuilder || query instanceof Relation) {
      query = this.prependDatabaseNameIfCrossDatabaseQuery(query);

      return [query.toSql(), query.getBindings()];
    } else if (typeof query === 'string') {
      return [query, []];
    } else {
      throw new Error(
        'InvalidArgumentException: A subquery must be a query builder instance, a Closure, or a string.'
      );
    }
  }

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
  public prepareValueAndOperator(value: string, operator: string, useDefault: boolean = false): Array < any > {
    if(useDefault) {
      return [operator, '='];
    } else if(this.invalidOperatorAndValue(operator, value)) {
      throw new Error('InvalidArgumentException: Illegal operator and value combination.');
    }

    return [value, operator];
  }

  /**
   * Prepend the database name if the given query is on another database.
   *
   * @param  any  query
   * @return any
   */
  protected prependDatabaseNameIfCrossDatabaseQuery(query: any): any {
    if (query.getConnection().getDatabaseName() !== this.getConnection().getDatabaseName()) {
      const databaseName = query.getConnection().getDatabaseName();

      if (query.from.indexOf(databaseName) !== 0 && query.from.indexOf('.') === -1) {
        query.from(databaseName + '.' + query.from);
      }
    }

    return query;
  }

  /**
   * Run the query as a "select" statement against the connection.
   *
   * @return array
   */
  protected runSelect(): Array < any > {
    return this.connection.select(
      this.toSql(), this.getBindings()
    );
  }

  /**
   * Set the columns to be selected.
   *
   * @param  array|mixed  columns
   * @return this
   */
  public select(...columns: Array<string> | any): Builder {
    this.columns = [];
    this.bindings['select'] = [];
    columns = Array.isArray(columns) ? columns : [...arguments];

    for(const [as, column] of Object.entries(columns)) {
      if (typeof as === 'string' && this.isQueryable(column)) {
        this.selectSub(String(column), as);
      } else {
        this.columns.push(String(column));
      }
    }

    return this;
  }

  /**
   * Add a new "raw" select expression to the query.
   *
   * @param  string  expression
   * @param  array  bindings
   * @return this
   */
  public selectRaw(expression: string, bindings = []): Builder {
    this.addSelect(new Expression(expression));

    if (bindings) {
      this.addBinding(bindings, 'select');
    }

    return this;
  }

  /**
   * Add a subselect expression to the query.
   *
   * @param Function|Builder|EloquentBuilder|string  query
   * @param string  as
   * @return this
   *
   * @throws \InvalidArgumentException
   */
  public selectSub(query: Function | Builder | EloquentBuilder | string, as: string): Builder {
    const [querySub, bindings] = this.createSub(query);

    return this.selectRaw(
      '(' + querySub + ') as ' + this.grammar.wrap(as), bindings
    );
  }

  /**
   * Alias to set the "offset" value of the query.
   *
   * @param  number  value
   * @return Builder
   */
  public skip(value: number): Builder {
    return this.offset(value);
  }

  /**
   * Alias to set the "limit" value of the query.
   *
   * @param  number  value
   * @return Builder
   */
  public take(value: number): Builder {
    return this.limit(value);
  }

  /**
   * Pass the query to a given callback.
   *
   * @param  Function  callback
   * @return Builder
   */
  public tap(callback: Function): Builder {
    return this.when(true, callback);
  }

  /**
   * Get the SQL representation of the query.
   *
   * @return string
   */
  public toSql(): string {
    this.applyBeforeQueryCallbacks();

    return this.grammar.compileSelect(this);
  }

  /**
   * Add a union statement to the query.
   *
   * @param  \Illuminate\Database\Query\Builder|\Closure  query
   * @param  boolean  all
   * @return Builder
   */
  public union(query: Builder | Function, all: boolean = false): Builder {
    if (query instanceof Function) {
      query(query = this.newQuery());
    }

    this.unions.push({ query, all });

    this.addBinding(query.getBindings(), 'union');

    return this;
  }

  /**
   * Add a union all statement to the query.
   *
   * @param  \Illuminate\Database\Query\Builder|\Closure  query
   * @return this
   */
  public unionAll(query: Builder): Builder {
    return this.union(query, true);
  }

  /**
   * Apply the callback's query changes if the given "value" is false.
   *
   * @param  mixed  value
   * @param  Function
   * @param  [Function]  default
   * @return any|Builder
   */
  public unless(value: any, callback: Function, defaultCallback ?: Function): any | Builder {
    if (!value) {
      return callback(this, value) ?? this;
    } else if (defaultCallback) {
      return defaultCallback(this, value) ?? this;
    }

    return this;
  }

  /**
 * Apply the callback's query changes if the given "value" is true.
 *
 * @param  mixed  value
 * @param  callable  callback
 * @param  callable|null  default
 * @return mixed|this
 */
  public when(value: any, callback: Function, defaultCallback ?: Function): Builder {
    if (value) {
      return callback(this, value) ?? this;
    } else if (defaultCallback) {
      return defaultCallback(this, value) ?? this;
    }

    return this;
  }

  /**
   * Add a basic where clause to the query.
   *
   * @param  Function|string|array  column
   * @param  any  operator
   * @param  any  value
   * @param  string  boolean
   * @return Builder
   */
  public where(column: Function | Expression | string | Array < any >, operator ?: any, value ?: any, boolean: string = 'and'): Builder {
    // If the column is an array, we will assume it is an array of key-value pairs
    // and can add them each as a where clause. We will maintain the boolean we
    // received when the method was called and pass it into the nested where.
    if (Array.isArray(column)) {
      return this.addArrayOfWheres(column, boolean);
    }

    // Here we will make some assumptions about the operator. If only 2 values are
    // passed to the method, we will assume that the operator is an equals sign
    // and keep going. Otherwise, we'll require the operator to be passed in.
    [value, operator] = this.prepareValueAndOperator(
      value, operator, arguments.length === 2
    );

    // If the columns is actually a Closure instance, we will assume the developer
    // wants to begin a nested where statement which is wrapped in parenthesis.
    // We'll add that Closure to the query then return back out immediately.
    if (column instanceof Function && !operator) {
      return this.whereNested(column, boolean);
    }

    // If the column is a Closure instance and there is an operator value, we will
    // assume the developer wants to run a subquery and then compare the result
    // of that subquery with the given value that was provided to the method.
    if (this.isQueryable(column) && operator) {
      const [sub, bindings] = this.createSub(column);

      return this.addBinding(bindings, 'where')
        .where(new Expression('(' + sub + ')'), operator, value, boolean);
    }

    // If the given operator is not found in the list of valid operators we will
    // assume that the developer is just short-cutting the '=' operators and
    // we will set the operators to '=' and set the values appropriately.
    if (this.invalidOperator(operator)) {
      [value, operator] = [operator, '='];
    }

    // If the value is a Closure, it means the developer is performing an entire
    // sub-select within the query and we will need to compile the sub-select
    // within the where clause to get the appropriate query record results.
    if (value instanceof Function) {
      return this.whereSub(String(column), operator, value, boolean);
    }

    // If the value is "null", we will just assume the developer wants to add a
    // where null clause to the query. So, we will allow a short-cut here to
    // that method for convenience so the developer doesn't have to check.
    if (!value) {
      return this.whereNull(String(column), boolean, operator !== '=');
    }

    let type = 'Basic';

    // If the column is making a JSON reference we'll check to see if the value
    // is a boolean. If it is, we'll add the raw boolean string as an actual
    // value to the query to ensure this is properly handled by the query.
    if (String(column).includes('.') && utils.getType(value) === 'Boolean') {
      value = new Expression(value ? 'true' : 'false');

      if (utils.getType(column) === 'String') {
        type = 'JsonBoolean';
      }
    }

    // Now that we are working with just a simple query we can put the elements
    // in our array and add the query binding to our array of bindings that
    // will be bound to each SQL statements when it is finally executed.
    this.wheres.push({
      type, column, operator, value, boolean
    });

    if (!(value instanceof Expression)) {
      this.addBinding(this.flattenValue(value), 'where');
    }

    return this;
  }

  /**
   * Add a where between statement to the query.
   *
   * @param  string|\Illuminate\Database\Query\Expression  column
   * @param  array  values
   * @param  string  boolean
   * @param  boolean  not
   * @return Builder
   */
  public whereBetween(column: string | Expression, values: Array < any >, boolean: string = 'and', not: boolean = false): Builder {
    const type = 'Between';

    this.wheres.push({ type, column, values, boolean, not });

    this.addBinding(this.cleanBindings(Arr.flatten(values)).slice(0, 2), 'where');

    return this;
  }

  /**
   * Add a where between statement using columns to the query.
   *
   * @param  string  column
   * @param  array  values
   * @param  string  boolean
   * @param  boolean  not
   * @return Builder
   */
  public whereBetweenColumns(column: string, values: Array < any >, boolean: string = 'and', not: boolean = false): Builder {
    const type = 'BetweenColumns';

    this.wheres.push({ type, column, values, boolean, not });

    return this;
  }

  /**
   * Add a "where" clause comparing two columns to the query.
   *
   * @param  string|array  first
   * @param  string|null  operator
   * @param  string|null  second
   * @param  string|null  boolean
   * @return this
   */
  public whereColumn(first: string | Array < any >, operator ?: string, second ?: string, boolean: string = 'and'): Builder {
    // If the column is an array, we will assume it is an array of key-value pairs
    // and can add them each as a where clause. We will maintain the boolean we
    // received when the method was called and pass it into the nested where.
    if (Array.isArray(first)) {
      return this.addArrayOfWheres(first, boolean, 'whereColumn');
    }

    // If the given operator is not found in the list of valid operators we will
    // assume that the developer is just short-cutting the '=' operators and
    // we will set the operators to '=' and set the values appropriately.
    if (this.invalidOperator(String(operator))) {
      [second, operator] = [operator, '='];
    }

    // Finally, we will add this where clause into this array of clauses that we
    // are building for the query. All of them will be compiled via a grammar
    // once the query is about to be executed and run against the database.
    const type = 'Column';

    this.wheres.push({
      type, first, operator, second, boolean
    });

    return this;
  }

  /**
   * Add a "where date" statement to the query.
   *
   * @param  string  column
   * @param  string | number | Expression  operator
   * @param  [Date | string]  value
   * @param  string  boolean
   * @return Builder
   */
  public whereDate(column: string, operator: any, value ?: any, boolean: string = 'and'): Builder {
    [value, operator] = this.prepareValueAndOperator(
      value, operator, arguments.length === 2
    );

    value = this.flattenValue(value);

    if (value instanceof Date) {
      value = utils.dateFormat(value, 'Y-m-d');
    }

    return this.addDateBasedWhere('Date', column, operator, value, boolean);
  }

  /**
   * Add a "where day" statement to the query.
   *
   * @param  string  column
   * @param  string | number | Expression  operator
   * @param  [Date|string|Expression]  value
   * @param  string  boolean
   * @return this
   */
  public whereDay(column: string, operator: any, value ?: any, boolean: string = 'and'): Builder {
    [value, operator] = this.prepareValueAndOperator(
      value, operator, arguments.length === 2
    );

    value = this.flattenValue(value);

    if (value instanceof Date) {
      value = utils.dateFormat(value, 'd');
    }

    // if (!(value instanceof Expression)) {
    //   value = String(value)?.padStart(2, '0');
    // }

    return this.addDateBasedWhere('Day', column, operator, value, boolean);
  }

  /**
   * Add a "where in" clause to the query.
   *
   * @param  string  column
   * @param  mixed  values
   * @param  string  boolean
   * @param  boolean  not
   * @return Builder
   */
  public whereIn(column: string, values: any, boolean: string = 'and', not: boolean = false): Builder {
    const type = not ? 'NotIn' : 'In';

    // If the value is a query builder instance we will assume the developer wants to
    // look for any values that exists within this given query. So we will add the
    // query accordingly so that this query is properly executed when it is run.
    if (this.isQueryable(values)) {
      const [query, bindings] = this.createSub(values);

      values = [new Expression(query)];

      this.addBinding(bindings, 'where');
    }

    // Next, if the value is Arrayable we need to cast it to its raw array form so we
    // have the underlying array value instead of an Arrayable object which is not
    // able to be added as a binding, etc. We will then add to the wheres array.
    // if (values instanceof Arrayable) {
    //   values = values.toArray();
    // }

    this.wheres.push({ type, column, values, boolean });

    // Finally we'll add a binding for each values unless that value is an expression
    // in which case we will just skip over it since it will be the query as a raw
    // string and not as a parameterized place-holder to be replaced by the PDO.
    this.addBinding(this.cleanBindings(values), 'where');

    return this;
  }

  /**
   * Add a "where in raw" clause for integer values to the query.
   *
   * @param  string  column
   * @param  \Illuminate\Contracts\Support\Arrayable|array  values
   * @param  string  boolean
   * @param  boolean  not
   * @return Builder
   */
  public whereIntegerInRaw(column: string, values: Array < any >, boolean: string = 'and', not: boolean = false): Builder {
    const type = not ? 'NotInRaw' : 'InRaw';

    // if (values instanceof Arrayable) {
    //   values = values.toArray();
    // }

    values = values.map(value => parseInt(value, 10));

    this.wheres.push({ type, column, values, boolean });

    return this;
  }

  /**
   * Add a "where not in raw" clause for integer values to the query.
   *
   * @param  string  column
   * @param  Array<any>  values
   * @param  string  boolean
   * @return Builder
   */
  public whereIntegerNotInRaw(column: string, values: Array < any >, boolean: string = 'and'): Builder {
    return this.whereIntegerInRaw(column, values, boolean, true);
  }

  /**
   * Add a "where month" statement to the query.
   *
   * @param  string  column
   * @param  string | number | Expression  operator
   * @param  Date | string | Expression  value
   * @param  string  boolean
   * @return this
   */
  public whereMonth(column: string, operator: any, value ?: any, boolean: string = 'and'): Builder {
    [value, operator] = this.prepareValueAndOperator(
      value, operator, arguments.length === 2
    );

    value = this.flattenValue(value);

    if (value instanceof Date) {
      value = utils.dateFormat(value, 'm');
    }

    // if (!(value instanceof Expression)) {
    //   value = String(value)?.padStart(2, '0');
    // }

    return this.addDateBasedWhere('Month', column, operator, value, boolean);
  }

  /**
   * Add a nested where statement to the query.
   *
   * @param  \Function  callback
   * @param  string  boolean
   * @return this
   */
  public whereNested(callback: Function, boolean: string = 'and'): Builder {
    const query = this.forNestedWhere();

    callback(query);

    return this.addNestedWhereQuery(query, boolean);
  }

  /**
   * Add a where not between statement to the query.
   *
   * @param  string  column
   * @param  array  values
   * @param  string  boolean
   * @return Builder
   */
  public whereNotBetween(column: string, values: Array < any >, boolean: string = 'and'): Builder {
    return this.whereBetween(column, values, boolean, true);
  }

  /**
   * Add a where not between statement using columns to the query.
   *
   * @param  string  column
   * @param  array  values
   * @param  string  boolean
   * @return Builder
   */
  public whereNotBetweenColumns(column: string, values: Array < any >, boolean: string = 'and'): Builder {
    return this.whereBetweenColumns(column, values, boolean, true);
  }

  /**
   * Add a "where not in" clause to the query.
   *
   * @param  string  column
   * @param  any  values
   * @param  string  boolean
   * @return Builder
   */
  public whereNotIn(column: string, values: Array < any >, boolean: string = 'and'): Builder {
    return this.whereIn(column, values, boolean, true);
  }

  /**
   * Add a "where null" clause to the query.
   *
   * @param  string|array  columns
   * @param  string  boolean
   * @param  boolean  not
   * @return this
   */
  public whereNull(columns: string | Array < any >, boolean: string = 'and', not: boolean = false): Builder {
    const type = not ? 'NotNull' : 'Null';

    for (const column of Arr.wrap(columns)) {
      this.wheres.push({ type, column, boolean });
    }

    return this;
  }

  /**
   * Add a raw where clause to the query.
   *
   * @param  string  sql
   * @param  any  bindings
   * @param  string  boolean
   * @return this
   */
  public whereRaw(sql: string, bindings: Array < any > =[], boolean: string = 'and'): Builder {
    this.wheres.push({ type: 'Raw', sql, boolean });

    this.addBinding(bindings, 'where');

    return this;
  }

  /**
   * Add a full sub-select to the query.
   *
   * @param  string  column
   * @param  string  operator
   * @param  Function  callback
   * @param  string  boolean
   * @return this
   */
  protected whereSub(column: string, operator: string, callback: Function, boolean: string): Builder {
    const type = 'Sub';

    // Once we have the query instance we can simply execute it so it can add all
    // of the sub-select's conditions to itself, and then we can cache it off
    // in the array of where clauses for the "main" parent query instance.
    const query = this.forSubQuery();
    callback(query);

    this.wheres.push({
      type, column, operator, query, boolean
    });

    this.addBinding(query.getBindings(), 'where');

    return this;
  }

  /**
   * Add a "where time" statement to the query.
   *
   * @param  string  column
   * @param  string  operator
   * @param  Date|string|null  value
   * @param  string  boolean
   * @return this
   */
  public whereTime(column: string, operator: any, value ?: any, boolean: string = 'and'): Builder {
    [value, operator] = this.prepareValueAndOperator(
      value, operator, arguments.length === 2
    );

    value = this.flattenValue(value);

    if (value instanceof Date) {
      value = utils.dateFormat(value, 'H:i:s');
    }

    return this.addDateBasedWhere('Time', column, operator, value, boolean);
  }

  /**
   * Add a "where year" statement to the query.
   *
   * @param  string  column
   * @param  string | number | Expression  operator
   * @param  [Date|string|Number]  value
   * @param  string  boolean
   * @return this
   */
  public whereYear(column: string, operator: any, value ?: any, boolean: string = 'and'): Builder {
    [value, operator] = this.prepareValueAndOperator(
      value, operator, arguments.length === 2
    );

    value = this.flattenValue(value);

    if (value instanceof Date) {
      value = utils.dateFormat(value, 'Y');
    }

    return this.addDateBasedWhere('Year', column, operator, value, boolean);
  }
}
