import {isInteger} from 'lodash';

import {Builder as EloquentBuilder} from '../Eloquent/Query/Builder';
import {Connection} from '../Connection';
import {Expression} from './Expression';
import {Grammar} from './Grammars';
import {Processor} from './Processors';
import {Relation} from '../Eloquent/Relations';

export type Bindings = Record<string, Array<string>>;

export class Builder {
  /**
   * The current query value bindings.
   *
   * @member Bindings
   */
  public bindings: Bindings = {
    select: [],
    from: [],
    join: [],
    where: [],
    groupBy: [],
    having: [],
    order: [],
    union: [],
    unionOrder: [],
  };

  /**
   * The columns that should be returned.
   *
   * @member Array
   */
  public columns: Array<unknown> = [];

  /**
   * The database connection instance.
   *
   * @member \Illuminate\Database\ConnectionInterface
   */
  public connection;

  /**
   * The table which the query is targeting.
   *
   * @member string
   */
  public fromProperty: string | Expression = '';

  /**
   * The database query grammar instance.
   *
   * @member \Illuminate\Database\Query\Grammars\Grammar
   */
  public grammar: Grammar;

  /**
   * The database query post processor instance.
   *
   * @member \Illuminate\Database\Query\Processors\Processor
   */
  public processor: Processor;

  /**
   * Create a new query builder instance.
   *
   * @param  {\Illuminate\Database\ConnectionInterface}  connection
   * @param  {\Illuminate\Database\Query\Grammars\Grammar|undefined}  [grammar]
   * @param  {\Illuminate\Database\Query\Processors\Processor|undefined}  [processor]
   * @returns void
   */
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
   * @param  {*}  value
   * @param  {string}  type
   * @return {this}
   *
   * @throws {\InvalidArgumentException}
   */
  public addBinding(value: unknown, type = 'where'): this {
    if (!this.bindings[type]) {
      throw new TypeError(
        `InvalidArgumentException: Invalid binding type: ${type}.`
      );
    }

    if (Array.isArray(value)) {
      this.bindings[type] = Array.from(
        Object.values([...this.bindings[type], ...value])
      );
    } else {
      this.bindings[type].push(value);
    }

    return this;
  }

  /**
   * Add a new select column to the query.
   *
   * @param  {Array|*}  column
   * @returns {Builder}
   */
  public addSelect(column: unknown | Array<string>): Builder {
    const columns = Array.isArray(column) ? column : [...column];

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
   * Creates a subquery and parse it.
   *
   * @param  {Function|Builder|string}  query
   * @returns {Array}
   */
  protected createSub(
    query: Function | Builder | EloquentBuilder | string
  ): Array<any> {
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
   * @returns {\Illuminate\Database\Query\Builder}
   */
  protected forSubQuery(): Builder {
    return this.newQuery();
  }

  /**
   * Set the table which the query is targeting.
   *
   * @param  {Function|Builder|string} table
   * @param  {string} as
   * @returns {this}
   */
  public from(
    table: Function | Builder | string | Expression,
    as = ''
  ): Builder {
    if (this.isQueryable(table)) {
      return this.fromSub(table, as);
    }

    this.fromProperty = (as ? `${table} as ${as}` : table) as string;

    return this;
  }

  /**
   * Add a raw from clause to the query.
   *
   * @param  {string}  expression
   * @param  {*}  bindings
   * @returns this
   */
  public fromRaw(expression: string, bindings: any = []): Builder {
    this.fromProperty = new Expression(expression);

    this.addBinding(bindings, 'from');

    return this;
  }

  /**
   * Makes "from" fetch from a subquery.
   *
   * @param  {Function|Builder|string}  query
   * @param  {string}  as
   * @returns this
   *
   * @throws \InvalidArgumentException
   */
  public fromSub(
    query: Function | Builder | string | Expression,
    as: string
  ): Builder {
    const [newQuery, bindings] = this.createSub(query);

    return this.fromRaw(
      '(' + newQuery + ') as ' + this.grammar.wrapTable(as),
      bindings
    );
  }

  /**
   * Get the database connection instance.
   *
   * @returns {\Illuminate\Database\Connection}
   */
  public getConnection(): Connection {
    return this.connection;
  }

  /**
   * Determine if the value is a query builder instance or a Closure.
   *
   * @param  {*}  value
   * @returns {boolean}
   */
  protected isQueryable(value: unknown): boolean {
    return (
      value instanceof Builder ||
      value instanceof EloquentBuilder ||
      value instanceof Relation ||
      value instanceof Function
    );
  }

  /**
   * Get a new instance of the query builder.
   *
   * @returns {\Illuminate\Database\Query\Builder}
   */
  public newQuery() {
    return new (this.constructor as any)(
      this.connection,
      this.grammar,
      this.processor
    );
  }

  /**
   * Parse the subquery into SQL and bindings.
   *
   * @param  {*}  query
   * @returns {Array}
   *
   * @throws {\InvalidArgumentException}
   */
  protected parseSub(query: any): Array<any> {
    if (
      query instanceof this.constructor ||
      query instanceof Builder ||
      query instanceof EloquentBuilder ||
      query instanceof Relation
    ) {
      query = this.prependDatabaseNameIfCrossDatabaseQuery(query);

      return [query.toSql(), query.getBindings()];
    } else if (typeof query === 'string') {
      return [query, []];
    } else {
      throw new TypeError(
        'InvalidArgumentException: A subquery must be a query builder instance, a Closure, or a string.'
      );
    }
  }

  /**
   * Prepend the database name if the given query is on another database.
   *
   * @param  {*}  query
   * @returns {*}
   */
  protected prependDatabaseNameIfCrossDatabaseQuery(query: any): any {
    if (
      query.getConnection().getDatabaseName() !==
      this.getConnection().getDatabaseName()
    ) {
      const databaseName = query.getConnection().getDatabaseName();

      if (
        query.from.indexOf(databaseName) !== 0 &&
        query.from.indexOf('.') === -1
      ) {
        query.from(databaseName + '.' + query.from);
      }
    }

    return query;
  }

  /**
   * Set the columns to be selected.
   *
   * @param  {Array|*}  columns
   * @returns this
   */
  public select(...columns: Array<unknown>): Builder {
    this.columns = [];
    this.bindings['select'] = [];

    columns = Array.isArray(columns) ? columns.flat() : [...columns];

    for (const [as, column] of Array.from(Object.entries(columns))) {
      if (!isInteger(as) && this.isQueryable(column)) {
        this.selectSub(String(column), as);
      } else {
        this.columns.push(column);
      }
    }

    return this;
  }

  /**
   * Add a new "raw" select expression to the query.
   *
   * @param  {string}  expression
   * @param  {Array}  bindings
   * @returns {Builder}
   */
  public selectRaw(expression: string, bindings: Array<unknown> = []): Builder {
    this.addSelect(new Expression(expression));

    if (bindings.length > 0) {
      this.addBinding(bindings, 'select');
    }

    return this;
  }

  /**
   * Add a subselect expression to the query.
   *
   * @param {Function|Builder|EloquentBuilder|string}  query
   * @param {string}  as
   * @returns {Builder}
   *
   * @throws {\InvalidArgumentException}
   */
  public selectSub(
    query: Function | Builder | EloquentBuilder | string,
    as: string
  ): Builder {
    const [querySub, bindings] = this.createSub(query);

    return this.selectRaw(
      '(' + querySub + ') as ' + this.grammar.wrap(as),
      bindings
    );
  }

  /**
   * Get the SQL representation of the query.
   *
   * @returns string
   */
  public toSql(): string {
    this.applyBeforeQueryCallbacks();

    return this.grammar.compileSelect(this);
  }
}
