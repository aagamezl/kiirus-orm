import { Builder as EloquentBuilder } from './../Eloquent/Query/Builder';
import { Grammar } from './Grammars'
import { Processor } from './Processors'
import { Relation } from '../Eloquent/Relations/Relation';
import { Connection } from '../Connection';
import { Expression } from './Expression';
import { callbackFn } from '../../Support/Types';
import { Arr } from '../../Collections/Arr';
import { collect } from '../../Collections/Helpers';

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

export class Builder {
  /**
   * An aggregate function and column to be run.
   *
   * @var AggregateInterface
   */
  public aggregateProperty: AggregateInterface | undefined;

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
  public bindings: Record<string, Array<string>> = {
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
  public distinct: boolean = false;

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
   * Add a binding to the query.
   *
   * @param  mixed  value
   * @param  string  type
   * @return this
   *
   * @throws \InvalidArgumentException
   */
  public addBinding(value: any, type: string = 'where') {
    if (!this.bindings[type]) {
      throw new Error(`InvalidArgumentException: Invalid binding type: ${type}.`);
    }

    if (Array.isArray(value)) {
      this.bindings[type] = Object.values([...this.bindings[type], value]) as Array<string>;
    } else {
      this.bindings[type].push(value);
    }

    return this;
  }

  /**
   * Add a new select column to the query.
   *
   * @param  array|mixed  column
   * @return this
   */
  public addSelect(column: Array<string>|any) {
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
   * Create a new query instance for a sub-query.
   *
   * @return \Illuminate\Database\Query\Builder
   */
  protected forSubQuery() {
    return this.newQuery();
  }

  /**
   * Set the table which the query is targeting.
   *
   * @param  Function|Builder|string table
   * @param  string as
   * @return this
   */
  from(table: callbackFn | Builder | string, as: string = ''): Builder {
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
  public fromRaw(expression: string, bindings: any = []) {
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
  public get(columns: Array<any>|string = ['*']) {
    return collect(this.onceWithColumns(Arr.wrap(columns), () => {
      return this.processor.processSelect(this, this.runSelect());
    }));
  }

  /**
   * Get the current query value bindings in a flattened array.
   *
   * @return array
   */
  public getBindings() {
    return Arr.flatten(this.bindings);
  }

  /**
   * Get the database connection instance.
   *
   * @return \Illuminate\Database\ConnectionInterface
   */
  public getConnection() {
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
   * Get a new instance of the query builder.
   *
   * @return \Illuminate\Database\Query\Builder
   */
  public newQuery() {
    return new this.constructor.prototype(this.connection, this.grammar, this.processor);
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
   * Parse the subquery into SQL and bindings.
   *
   * @param  any  query
   * @return array
   *
   * @throws \InvalidArgumentException
   */
  protected parseSub(query: any): Array<any> {
    if (query instanceof this.constructor.prototype || query instanceof EloquentBuilder || query instanceof Relation) {
      query = this.prependDatabaseNameIfCrossDatabaseQuery(query);

      return [query.toSql(), query.getBindings()];
    } else if(typeof query === 'string') {
      return [query, []];
    } else {
      throw new Error(
        'InvalidArgumentException: A subquery must be a query builder instance, a Closure, or a string.'
      );
    }
  }

  /**
   * Prepend the database name if the given query is on another database.
   *
   * @param  any  query
   * @return any
   */
  protected prependDatabaseNameIfCrossDatabaseQuery(query: any) {
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
  protected runSelect() {
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
  public select(columns: Array<string> | any = ['*']): this {
    this.columns = [];
    this.bindings['select'] = [];
    columns = Array.isArray(columns) ? columns : [...arguments];

    for (const [as, column] of Object.entries(columns)) {
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
  public selectRaw(expression: string, bindings = []) {
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
  public selectSub(query: Function | Builder | EloquentBuilder | string, as: string) {
    const [querySub, bindings] = this.createSub(query);

    return this.selectRaw(
      '(' + querySub + ') as ' + this.grammar.wrap(as), bindings
    );
  }

  /**
   * Get the SQL representation of the query.
   *
   * @return string
   */
  toSql(): string {
    this.applyBeforeQueryCallbacks();

    return this.grammar.compileSelect(this);
  }
}
