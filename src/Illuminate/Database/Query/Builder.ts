import { castArray, clone, dateFormat, isBoolean, isFalsy, isInteger, isNil, isPlainObject, isString, isTruthy } from '@devnetic/utils'

import { Arr } from '../../Collections/Arr'
import { Builder as EloquentBuilder } from '../Eloquent/Builder'
import { BuildsQueries } from '../Concerns/BuildsQueries'
import { Collection } from '../../Collections/Collection'
import { Connection } from '../Connection'
import { Expression, JoinClause } from './internal'
import { Grammar } from '../Query/Grammars'
import { Macroable } from '../../Macroable/Traits/Macroable'
import { Processor } from './Processors'
import { Relation } from '../Eloquent/Relations/Relation'
import { collect, head } from '../../Collections/helpers'
import { tap } from '../../Support'
import { use } from '../../Support/Traits/use'

// type Bindings = Record<string, unknown[]>

export interface Bindings {
  [key: string]: unknown[]
}

export interface Aggregate {
  function: string
  columns: Array<string | Expression>
}

export interface Union {
  all: boolean
  column?: string | Expression | Function | Builder
  direction?: string
  query: Builder
}

export interface Order {
  column: string | Expression | Function | Builder
  direction: string
  sql?: string
}

export interface Builder extends Macroable, BuildsQueries { }

export class Builder {
  /**
   * An aggregate function and column to be run.
   *
   * @member {object}
   */
  public aggregateProperty: Aggregate | undefined = undefined

  /**
   * The current query value bindings.
   *
   * @member {Bindings}
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
    unionOrder: []
  }

  /**
   * The callbacks that should be invoked before the query is executed.
   *
   * @member {Array}
   */
  public beforeQueryCallbacks: Function[] = []

  /**
   * The columns that should be returned.
   *
   * @var unknown[]
   */
  public columns: Array<string | Expression> = []

  /**
   * The database connection instance.
   *
   * @var \Illuminate\Database\ConnectionInterface
   */
  public connection: Connection

  /**
   * Indicates if the query returns distinct results.
   *
   * Occasionally contains the columns that should be distinct.
   *
   * @member {boolean|Array}
   */
  public distinctProperty: boolean | object = false

  /**
   * The table which the query is targeting.
   *
   * @var string
   */
  public fromProperty: string | Expression = ''

  /**
   * The database query grammar instance.
   *
   * @var \Illuminate\Database\Query\Grammars\Grammar
   */
  public grammar: Grammar

  /**
   * The groupings for the query.
   *
   * @member {Array}
   */
  public groups: any[] = []

  /**
   * The having constraints for the query.
   *
   * @member {Array}
   */
  public havings: any[] = []

  /**
   * The table joins for the query.
   *
   * @var array
   */
  public joins: Array<string | object> = []

  /**
   * The maximum number of records to return.
   *
   * @member {number}
   */
  public limitProperty?: number

  /**
   * Indicates whether row locking is being used.
   *
   * @member {string|boolean}
   */
  public lockProperty?: string | boolean

  /**
   * The number of records to skip.
   *
   * @member number
   */
  public offsetProperty?: number

  /**
   * All of the available clause operators.
   *
   * @member {string[]}
   */
  public operators: string[] = [
    '=', '<', '>', '<=', '>=', '<>', '!=', '<=>',
    'like', 'like binary', 'not like', 'ilike',
    '&', '|', '^', '<<', '>>',
    'rlike', 'not rlike', 'regexp', 'not regexp',
    '~', '~*', '!~', '!~*', 'similar to',
    'not similar to', 'not ilike', '~~*', '!~~*'
  ]

  /**
   * The orderings for the query.
   *
   * @member {string[]}
   */
  public orders: Order[] = []

  /**
   * The database query post processor instance.
   *
   * @var \Illuminate\Database\Query\Processors\Processor
   */
  public processor: Processor

  /**
   * The maximum number of union records to return.
   *
   * @member number
   */
  public unionLimit: number | undefined = undefined

  /**
   * The number of union records to skip.
   *
   * @member number
   */
  public unionOffset: number | undefined = undefined

  /**
   * The orderings for the union query.
   *
   * @member {Array}
   */
  public unionOrders: Order[] = []

  /**
   * The query union statements.
   *
   * @member {Array}
   */
  public unions: Union[] = []

  /**
   * The where constraints for the query.
   *
   * @var array
   */
  public wheres: any[] = [] // TODO: verify the correct type

  /**
   * Create a new query builder instance.
   *
   * @constructor
   * @param  {\Illuminate\Database\ConnectionInterface}  connection
   * @param  {\Illuminate\Database\Query\Grammars\Grammar|undefined}  [grammar]
   * @param  {\Illuminate\Database\Query\Processors\Processor|undefined}  [processor]
   * @return {void}
   */
  public constructor (connection: Connection, grammar?: Grammar, processor?: Processor) {
    use(Builder, [Macroable, BuildsQueries])

    this.connection = connection
    this.grammar = grammar ?? connection.getQueryGrammar()
    this.processor = processor ?? connection.getPostProcessor()

    // return proxy
  }

  /**
   * Add an array of where clauses to the query.
   *
   * @param  {any}  column
   * @param  {string}  boolean
   * @param  {string}  method
   * @return {this}
   */
  protected addArrayOfWheres (column: any, boolean: string, method: string = 'where'): this { // TODO: verify the correct column param type
    return this.whereNested((query: any) => {
      for (const [key, value] of Object.entries(column)) {
        if (isInteger(parseInt(key, 10)) && Array.isArray(value)) {
          query[method](...value)
        } else {
          query[method](key, '=', value, boolean)
        }
      }
    }, boolean)
  }

  /**
   * Add a binding to the query.
   *
   * @param  {any}  value
   * @param  {string}  type
   * @return {this}
   *
   * @throws {\InvalidArgumentException}
   */
  public addBinding (value: unknown, type: keyof Bindings = 'where'): this {
    if (this.bindings[type] === undefined) {
      throw new Error(`InvalidArgumentException: Invalid binding type: ${type}.`)
    }

    if (Array.isArray(value)) {
      this.bindings[type] = Array.from(Object.values([...this.bindings[type], ...value]))
    } else {
      this.bindings[type].push(value)
    }

    return this
  }

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
  protected addDateBasedWhere (type: string, column: string, operator: string, value: unknown, boolean: string = 'and'): this {
    this.wheres.push({ column, type, boolean, operator, value })

    if (!(value instanceof Expression)) {
      this.addBinding(value, 'where')
    }

    return this
  }

  /**
   * Add another query builder as a nested where to the query builder.
   *
   * @param  {\Illuminate\Database\Query\Builder}  query
   * @param  {string}  [boolean=and]
   * @return {this}
   */
  public addNestedWhereQuery (query: Builder, boolean: string = 'and'): this {
    if (query.wheres.length > 0) {
      const type = 'Nested'

      this.wheres.push({ type, query, boolean })

      this.addBinding(query.getRawBindings().where, 'where')
    }

    return this
  }

  /**
   * Add a new select column to the query.
   *
   * @param  {array|any}  column
   * @return {this}
   */
  public addSelect (column: string | string[] | Expression): this {
    const columns = Array.isArray(column) ? column : [...arguments]

    for (const [as, column] of Arr.iterable(columns)) {
      if (isString(as) && this.isQueryable(column)) {
        if (this.columns.length > 0) {
          this.select(this.fromProperty as string + '.*')
        }

        this.selectSub(column, as)
      } else {
        this.columns.push(column)
      }
    }

    return this
  }

  /**
   * Execute an aggregate function on the database.
   *
   * @param  {string}  functionName
   * @param  {any[]}  columns
   * @return {*}
   */
  public async aggregate (functionName: string, columns: string[] = ['*']): Promise<any> {
    // We need to save the original bindings, because the cloneWithoutBindings
    // method delete them from the builder object
    const bindings = clone(this.bindings)

    const results = await this.cloneWithout(this.unions.length > 0 || this.havings.length > 0 ? [] : ['columns'])
      .cloneWithoutBindings(this.unions.length > 0 || this.havings.length > 0 ? [] : ['select'])
      .setAggregate(functionName, columns)
      .get(columns)

    this.bindings = bindings

    if (!results.isEmpty()) {
      return results.all()[0].aggregate
    }
  }

  /**
   * Invoke the "before query" modification callbacks.
   *
   * @return {void}
   */
  public applyBeforeQueryCallbacks (): void {
    for (const queryCallback of this.beforeQueryCallbacks) {
      queryCallback(this)
    }

    this.beforeQueryCallbacks = []
  }

  /**
   * Remove all of the expressions from a list of bindings.
   *
   * @param  {Array}  bindings
   * @return {Array}
   */
  public cleanBindings (bindings: any[]): any[] {
    return Arr.values(bindings.filter((binding) => {
      return !(binding instanceof Expression)
    }))
  }

  /**
   * Clone the query.
   *
   * @return {Builder}
   */
  public clone (): this {
    const cloned = Object.assign({}, this)

    Object.setPrototypeOf(cloned, Object.getPrototypeOf(this))

    // The cloning process needs to run through Arrays and Maps to ensure that
    // these structured are cloned correctly like new values and not references.
    for (const propertyName of Object.getOwnPropertyNames(cloned)) {
      const property = Reflect.get(cloned, propertyName)

      if (Array.isArray(property) || property instanceof Map) {
        Reflect.set(cloned, propertyName, clone(property))
      }
    }

    return cloned
  }

  /**
   * Clone the query without the given properties.
   *
   * @param  {Array}  properties
   * @return {this}
   */
  public cloneWithout (properties: any[]): this {
    return tap(this.clone(), (clone: any) => {
      for (const property of properties) {
        if (Array.isArray(clone[property])) {
          clone[property] = []
        } else {
          clone[property] = undefined
        }
      }
    }) as this
  }

  /**
   * Clone the query without the given bindings.
   *
   * @param  {Array}  except
   * @return {Builder}
   */
  public cloneWithoutBindings (except: any[]): this {
    return tap(this.clone(), (clone: any) => {
      for (const type of except) {
        clone.bindings[type] = []
      }
    }) as this
  }

  /**
   * Retrieve the "count" result of the query.
   *
   * @param  {string}  [columns=*]
   * @return {number}
   */
  public async count (columns: string = '*'): Promise<number> {
    return await this.aggregate('count', Arr.wrap(columns))
  }

  /**
   * Creates a subquery and parse it.
   *
   * @param  {Function|\Illuminate\Database\Query\Builder|EloquentBuilder|string}  query
   * @return {Array}
   */
  protected createSub (query: Function | Builder | EloquentBuilder | string): [string, unknown[]] {
    // If the given query is a Closure, we will execute it while passing in a new
    // query instance to the Closure. This will give the developer a chance to
    // format and work with the query before we cast it to a raw SQL string.
    if (query instanceof Function) {
      const callback = query
      query = this.forSubQuery()

      callback(query)
    }

    return this.parseSub(query)
  }

  /**
   * Force the query to only return distinct results.
   *
   * @param  {string[]}  columns
   * @return {this}
   */
  public distinct (...columns: string[]): this {
    if (columns.length > 0) {
      this.distinctProperty = Array.isArray(columns[0]) || typeof columns[0] === 'boolean' ? columns[0] : columns
    } else {
      this.distinctProperty = true
    }

    return this
  }

  /**
   * Get a scalar type value from an unknown type of input.
   *
   * @param  {any}  value
   * @return {any}
   */
  protected flattenValue (value: unknown): unknown {
    return Array.isArray(value) ? head(Arr.flatten(value)) : value
  }

  /**
   * Create a new query instance for nested where condition.
   *
   * @return {\Illuminate\Database\Query\Builder}
   */
  public forNestedWhere (): Builder {
    return this.newQuery().from(this.fromProperty as any)
  }

  /**
   * Create a new query instance for a sub-query.
   *
   * @return {\Illuminate\Database\Query\Builder}
   */
  protected forSubQuery (): Builder {
    return this.newQuery()
  }

  /**
   * Set the table which the query is targeting.
   *
   * @param  {Function|\Illuminate\Database\Query\Builder|string}  table
   * @param  {string|undefined}  as
   * @return {this}
   * @memberof Builder
   */
  public from (table: Function | Builder | string, as?: string): this {
    if (this.isQueryable(table)) {
      return this.fromSub(table, as as string)
    }

    this.fromProperty = as !== undefined ? `${String(table)} as ${as}` : String(table)

    return this
  }

  /**
   * Add a raw from clause to the query.
   *
   * @param  {string}  expression
   * @param  {unknown}  [bindings=[]]
   * @return {this}
   */
  public fromRaw (expression: string, bindings: unknown = []): this {
    this.fromProperty = new Expression(expression)

    this.addBinding(bindings, 'from')

    return this
  }

  /**
   * Makes "from" fetch from a subquery.
   *
   * @param  {Function|\Illuminate\Database\Query\Builder|string}  query
   * @param  {string}  as
   * @return {this}
   *
   * @throws {\InvalidArgumentException}
   */
  public fromSub (query: Function | Builder | string, as: string): this {
    let bindings

    [query, bindings] = this.createSub(query)

    return this.fromRaw(`(${query}) as ${this.grammar.wrapTable(as)}`, bindings)
  }

  /**
   * Execute the query as a "select" statement.
   *
   * @param  {Array|string}  columns
   * @return {\Illuminate\Support\Collection}
   */
  public async get (columns = ['*']): Promise<Collection> {
    return collect(await this.onceWithColumns(Arr.wrap(columns), () => {
      return this.processor.processSelect(this, this.runSelect())
    }))
  }

  /**
   * Get the current query value bindings in a flattened array.
   *
   * @return {any[]}
   */
  public getBindings (): any { // TODO: verify the correct type
    return Arr.flatten(this.bindings)
  }

  /**
   * Get the database connection instance.
   *
   * @return {\Illuminate\Database\ConnectionInterface}
   */
  public getConnection (): Connection {
    return this.connection
  }

  /**
   * Get the query grammar instance.
   *
   * @return {\Illuminate\Database\Query\Grammars\Grammar}
   */
  public getGrammar (): Grammar {
    return this.grammar
  }

  /**
   * Get the database query processor instance.
   *
   * @return {\Illuminate\Database\Query\Processors\Processor}
   */
  public getProcessor (): Processor {
    return this.processor
  }

  /**
   * Get the raw array of bindings.
   *
   * @return {Bindings}
   */
  public getRawBindings (): Bindings {
    return this.bindings
  }

  /**
   * Determine if the given operator is supported.
   *
   * @param  {string}  operator
   * @return {boolean}
   */
  protected invalidOperator (operator: string): boolean {
    return !this.operators.includes(operator.toLowerCase()) &&
      !this.grammar.getOperators().includes(operator.toLowerCase())
  }

  /**
   * Determine if the given operator and value combination is legal.
   *
   * Prevents using Null values with invalid operators.
   *
   * @param  {string}  operator
   * @param  {any}  value
   * @return {boolean}
   */
  protected invalidOperatorAndValue (operator: string, value: any): boolean { // TODO: verify the correct type
    return isNil(value) && this.operators.includes(operator) &&
      !['=', '<>', '!='].includes(operator)
  }

  /**
   * Determine if the value is a query builder instance or a Closure.
   *
   * @param  {any}  value
   * @return {boolean}
   */
  protected isQueryable (value: any): boolean { // TODO:: verify the correct type for value param
    return (
      value instanceof Builder ||
      value instanceof EloquentBuilder ||
      value instanceof Relation ||
      value instanceof Function
    )
  }

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
  public join (table: string, first: string | Function, operator?: string, second?: string, type: string = 'inner', where: boolean = false): this {
    const join: any = this.newJoinClause(this, type, table)

    // If the first "column" of the join is really a Closure instance the developer
    // is trying to build a join with a complex "on" clause containing more than
    // one condition, so we'll add the join and call a Closure with the query.
    if (first instanceof Function) {
      first(join)

      this.joins.push(join)

      this.addBinding(join.getBindings(), 'join')
    } else {
      // If the column is simply a string, we can assume the join simply has a basic
      // "on" clause with a single condition. So we will just build the join with
      // this simple join clauses attached to it. There is not a join callback.
      const method = where ? 'where' : 'on'

      this.joins.push(join[method](first, operator, second))

      this.addBinding(join.getBindings(), 'join')
    }

    return this
  }

  /**
   * Set the "limit" value of the query.
   *
   * @param  {number}  value
   * @return {this}
   */
  public limit (value: number): this {
    const property = this.unions.length > 0 ? 'unionLimit' : 'limitProperty'

    if (value >= 0) {
      this[property] = value
    }

    return this
  }

  /**
   * Get a new join clause.
   *
   * @param  {\Illuminate\Database\Query\Builder}  parentQuery
   * @param  {string}  type
   * @param  {string}  table
   * @return {\Illuminate\Database\Query\JoinClause}
   */
  protected newJoinClause (parentQuery: Builder, type: string, table: string): JoinClause {
    return new JoinClause(parentQuery, type, table)
  }

  /**
   * Get a new instance of the query builder.
   *
   * @return {\Illuminate\Database\Query\Builder}
   */
  public newQuery (): Builder {
    return new Builder(this.connection, this.grammar, this.processor)
  }

  /**
   * Set the "offset" value of the query.
   *
   * @param  {number}  value
   * @return {this}
   */
  public offset (value: number): this {
    const property = this.unions.length > 0 ? 'unionOffset' : 'offsetProperty'

    this[property] = Math.max(0, value)

    return this
  }

  /**
   * Execute the given callback while selecting the given columns.
   *
   * After running the callback, the columns are reset to the original value.
   *
   * @param  {Array}  columns
   * @param  {Function}  callback
   * @return {any}
   */
  protected async onceWithColumns (columns: Array<string | Expression>, callback: Function): Promise<unknown> {
    const original = this.columns

    if (original.length === 0) {
      this.columns = columns
    }

    const result = await callback()

    this.columns = original

    return result
  }

  /**
   * Add an "order by" clause to the query.
   *
   * @param  {Function|\Illuminate\Database\Query\Builder|\Illuminate\Database\Query\Expression|string}  column
   * @param  {string}  [direction=asc]
   * @return {this}
   *
   * @throws {\InvalidArgumentException}
   */
  public orderBy (column: Function | Builder | Expression | string, direction: string = 'asc'): this {
    if (this.isQueryable(column)) {
      const [query, bindings] = this.createSub(column as any)

      column = new Expression('(' + query + ')')

      this.addBinding(bindings, this.unions?.length > 0 ? 'unionOrder' : 'order')
    }

    direction = direction.toLowerCase()

    if (!['asc', 'desc'].includes(direction)) {
      throw new Error('InvalidArgumentException: Order direction must be "asc" or "desc".')
    }

    this[this.unions.length > 0 ? 'unionOrders' : 'orders'].push({
      column,
      direction
    })

    return this
  }

  /**
   * Add an "or where" clause to the query.
   *
   * @param  {Function|string|Array}  column
   * @param  {any}  operator
   * @param  {any}  value
   * @return {this}
   */
  public orWhere (column: Function | string | Record<string, any>, operator?: any, value?: any): this {
    [value, operator] = this.prepareValueAndOperator(
      value, operator, arguments.length === 2
    )

    return this.where(column as any, operator, value, 'or')
  }

  /**
   * Add an "or where" clause comparing two columns to the query.
   *
   * @param  {string|string[]}  first
   * @param  {string}  [operator]
   * @param  {string}  [second]
   * @return {this}
   */
  public orWhereColumn (first: string | any[], operator?: string, second?: string): this {
    return this.whereColumn(first, operator, second, 'or')
  }

  /**
   * Add an "or where date" statement to the query.
   *
   * @param  {string}  column
   * @param  {any}  operator
   * @param  {Date|string|undefined}  value
   * @return {this}
   */
  public orWhereDate (column: string, operator: any, value?: Date | string): this {
    [value, operator] = this.prepareValueAndOperator(
      value as any, operator, arguments.length === 2
    )

    return this.whereDate(column, operator, value, 'or')
  }

  /**
   * Add an "or where day" statement to the query.
   *
   * @param  {string}  column
   * @param  {string}  operator
   * @param {Date|unknown} [value]
   * @return {this}
   * @memberof Builder
   */
  public orWhereDay (column: string, operator: any, value?: Date | unknown): this {
    [value, operator] = this.prepareValueAndOperator(
      value as any, operator, arguments.length === 2
    )

    return this.whereDay(column, operator, value, 'or')
  }

  /**
   * Add an "or where in" clause to the query.
   *
   * @param  {string}  column
   * @param  {any}  values
   * @return {this}
   */
  public orWhereIn (column: string, values: any): this {
    return this.whereIn(column, values, 'or')
  }

  /**
   * Add an "or where in raw" clause for integer values to the query.
   *
   * @param  {string}  column
   * @param  {any}  values
   * @return {this}
   */
  public orWhereIntegerInRaw (column: string, values: any): this {
    return this.whereIntegerInRaw(column, values, 'or')
  }

  /**
   * Add an "or where not in raw" clause for integer values to the query.
   *
   * @param  {string}  column
   * @param  {any}  values
   * @return {this}
   */
  public orWhereIntegerNotInRaw (column: string, values: any): this {
    return this.whereIntegerNotInRaw(column, values, 'or')
  }

  /**
   * Add an "or where month" statement to the query.
   *
   * @param  {string}  column
   * @param  {any}  operator
   * @param  {Date|unknown}  [value]
   * @return {this}
   */
  public orWhereMonth (column: string, operator: any, value?: Date | unknown): this {
    [value, operator] = this.prepareValueAndOperator(
      value as any, operator, arguments.length === 2
    )

    return this.whereMonth(column, operator, value, 'or')
  }

  /**
   * Add an "or where not in" clause to the query.
   *
   * @param  {string}  column
   * @param  {any}  values
   * @return {this}
   */
  public orWhereNotIn (column: string, values: any): this {
    return this.whereNotIn(column, values, 'or')
  }

  /**
   * Add a raw or where clause to the query.
   *
   * @param  {string}  sql
   * @param  {any}  bindings
   * @return {this}
   */
  public orWhereRaw (sql: string, bindings: any = []): this {
    return this.whereRaw(sql, bindings, 'or')
  }

  /**
   * Add an "or where year" statement to the query.
   *
   * @param  {string}  column
   * @param  {string}  operator
   * @param  {Date|string|number}  [value]
   * @return {Builder}
   */
  public orWhereYear (column: string, operator: any, value?: Date | string | number): this {
    [value, operator] = this.prepareValueAndOperator(
      value as any, operator, arguments.length === 2
    )

    return this.whereYear(column, operator, value, 'or')
  }

  /**
   * Parse the subquery into SQL and bindings.
   *
   * @param  {any}  query
   * @return {Array}
   *
   * @throws {\InvalidArgumentException}
   */
  protected parseSub (query: any): [string, unknown[]] {
    if (query instanceof this.constructor ||
      query instanceof EloquentBuilder ||
      query instanceof Relation
    ) {
      query = this.prependDatabaseNameIfCrossDatabaseQuery(query)

      return [query.toSql(), query.getBindings()]
    } else if (typeof query === 'string') {
      return [query, []]
    } else {
      throw new Error(
        'InvalidArgumentException: A subquery must be a query builder instance, a Closure, or a string.'
      )
    }
  }

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
  public prepareValueAndOperator (value: string, operator: string, useDefault: boolean = false): any {
    if (useDefault) {
      return [operator, '=']
    } else if (this.invalidOperatorAndValue(operator, value)) {
      throw new TypeError('InvalidArgumentException: Illegal operator and value combination.')
    }

    return [value, operator]
  }

  /**
   * Prepend the database name if the given query is on another database.
   *
   * @param  {any}  query
   * @return {any}
   */
  protected prependDatabaseNameIfCrossDatabaseQuery (query: any): any {
    if (query.getConnection().getDatabaseName() !== this.getConnection().getDatabaseName()) {
      const databaseName: string = query.getConnection().getDatabaseName()

      if (query.fromProperty.startsWith(databaseName) === false && query.fromProperty.includes('.') === false) {
        query.from(databaseName + '.' + (query.fromProperty as string))
      }
    }

    return query
  }

  /**
   * Run the query as a "select" statement against the connection.
   *
   * @return {Array}
   */
  protected runSelect (): any {
    return this.connection.select(
      this.toSql(), this.getBindings()
    )
  }

  /**
   * Set the columns to be selected.
   *
   * @param {Array|any} columns
   * @return {this}
   * @memberof Builder
   */
  public select (...columns: string[]): this {
    columns = columns.length === 0 ? ['*'] : columns

    this.columns = []
    this.bindings.select = []

    for (const [as, column] of Arr.iterable(columns)) {
      if (isString(as) && this.isQueryable(column)) {
        this.selectSub(column, as)
      } else {
        this.columns.push(column)
      }
    }

    return this
  }

  /**
 * Add a new "raw" select expression to the query.
 *
 * @param  {string}  expression
 * @param  {array}  bindings
 * @return {this}
 */
  public selectRaw (expression: string, bindings: unknown[] = []): this {
    this.addSelect(new Expression(expression))

    if (bindings.length > 0) {
      this.addBinding(bindings, 'select')
    }

    return this
  }

  /**
   * Add a subselect expression to the query.
   *
   * @param {Function|\Illuminate\Database\Query\Builder|\Illuminate\Database\Eloquent\Builder|string}  query
   * @param {string}  as
   * @return {this}
   *
   * @throws {\InvalidArgumentException}
   */
  public selectSub (query: Function | Builder | EloquentBuilder | string, as: string): this {
    const [querySub, bindings] = this.createSub(query)

    return this.selectRaw(
      '(' + querySub + ') as ' + this.grammar.wrap(as), bindings
    )
  }

  /**
   * Set the aggregate property without running the query.
   *
   * @param  {string}  functionName
   * @param  {Array}  columns
   * @return {this}
   */
  protected setAggregate (functionName: string, columns: Array<string | Expression>): this {
    this.aggregateProperty = { function: functionName, columns }

    if (this.groups.length === 0) {
      this.orders = []

      this.bindings.order = []
    }

    return this
  }

  /**
   * Alias to set the "offset" value of the query.
   *
   * @param  {number}  value
   * @return {Builder}
   */
  public skip (value: number): this {
    return this.offset(value)
  }

  /**
   * Alias to set the "limit" value of the query.
   *
   * @param  {number}  value
   * @return {Builder}
   */
  public take (value: number): this {
    return this.limit(value)
  }

  /**
   * Get the SQL representation of the query.
   *
   * @return {string}
   */
  public toSql (): string {
    this.applyBeforeQueryCallbacks()

    return this.grammar.compileSelect(this)
  }

  /**
   * Add a union statement to the query.
   *
   * @param  {\Illuminate\Database\Query\Builder|Function}  query
   * @param  {boolean}  [all=false]
   * @return {this}
   */
  public union (query: Builder | Function, all: boolean = false): this {
    if (query instanceof Function) {
      const callback = query
      query = this.newQuery()

      callback(query)
    }

    this.unions.push({ query: query, all })

    this.addBinding(query.getBindings(), 'union')

    return this
  }

  /**
   * Add a union all statement to the query.
   *
   * @param  {\Illuminate\Database\Query\Builder|Function}  query
   * @return {this}
   */
  public unionAll (query: Builder | Function): this {
    return this.union(query, true)
  }

  /**
   * Add a basic where clause to the query.
   *
   * @param  {Function|string|Expression}  column
   * @param  {any}  [operator]
   * @param  {any}  [value]
   * @param  {string}  boolean
   * @return {this}
   */
  public where (column: Function | string | Expression, operator?: any, value?: any, boolean: string = 'and'): this {
    // If the column is an array, we will assume it is an array of key-value pairs
    // and can add them each as a where clause. We will maintain the boolean we
    // received when the method was called and pass it into the nested where.
    if (Array.isArray(column) || isPlainObject(column)) {
      return this.addArrayOfWheres(column, boolean)
    }

    // Here we will make some assumptions about the operator. If only 2 values are
    // passed to the method, we will assume that the operator is an equals sign
    // and keep going. Otherwise, we'll require the operator to be passed in.
    [value, operator] = this.prepareValueAndOperator(
      value, operator, arguments.length === 2
    )

    // If the columns is actually a Closure instance, we will assume the developer
    // wants to begin a nested where statement which is wrapped in parenthesis.
    // We'll add that Closure to the query then return back out immediately.
    if (column instanceof Function && isFalsy(operator)) {
      return this.whereNested(column, boolean)
    }

    // If the column is a Closure instance and there is an operator value, we will
    // assume the developer wants to run a subquery and then compare the result
    // of that subquery with the given value that was provided to the method.
    if (this.isQueryable(column) && isTruthy(operator)) {
      const [sub, bindings] = this.createSub(column as any)

      return this.addBinding(bindings, 'where')
        .where(new Expression('(' + sub + ')'), operator, value, boolean)
    }

    // If the given operator is not found in the list of valid operators we will
    // assume that the developer is just short-cutting the '=' operators and
    // we will set the operators to '=' and set the values appropriately.
    if (this.invalidOperator(operator)) {
      [value, operator] = [operator, '=']
    }

    // If the value is a Closure, it means the developer is performing an entire
    // sub-select within the query and we will need to compile the sub-select
    // within the where clause to get the appropriate query record results.
    if (value instanceof Function) {
      return this.whereSub(column as string, operator, value, boolean)
    }

    // If the value is "null", we will just assume the developer wants to add a
    // where null clause to the query. So, we will allow a short-cut here to
    // that method for convenience so the developer doesn't have to check.
    if (value === null) {
      return this.whereNull(column, boolean, operator !== '=')
    }

    let type = 'Basic'

    // If the column is making a JSON reference we'll check to see if the value
    // is a boolean. If it is, we'll add the raw boolean string as an actual
    // value to the query to ensure this is properly handled by the query.
    if (String(column).includes('->') && isBoolean(value)) {
      value = new Expression(isTruthy(value) ? 'true' : 'false')

      if (isString(column)) {
        type = 'JsonBoolean'
      }
    }

    // Now that we are working with just a simple query we can put the elements
    // in our array and add the query binding to our array of bindings that
    // will be bound to each SQL statements when it is finally executed.
    this.wheres.push({
      type, column, operator, value, boolean
    })

    if (!(value instanceof Expression)) {
      this.addBinding(this.flattenValue(value), 'where')
    }

    return this
  }

  /**
   * Add a where between statement to the query.
   *
   * @param  {\Illuminate\Database\Query\Expression|string}  column
   * @param  {any[]}  values
   * @param  {string}  boolean
   * @param  {boolean}  not
   * @return {this}
   */
  public whereBetween (column: Expression | string, values: any[], boolean: string = 'and', not: boolean = false): this {
    const type = 'Between'

    this.wheres.push({ type, column, values, boolean, not })

    const flatten = Arr.flatten(values)
    this.addBinding(this.cleanBindings(flatten).slice(0, 2), 'where')

    return this
  }

  /**
   * Add a where between statement using columns to the query.
   *
   * @param  {string}  column
   * @param  {any[]}  values
   * @param  {string}  boolean
   * @param  {boolean}  not
   * @return {this}
   */
  public whereBetweenColumns (column: string, values: any[], boolean: string = 'and', not: boolean = false): this {
    const type = 'BetweenColumns'

    this.wheres.push({ type, column, values, boolean, not })

    return this
  }

  /**
   * Add a "where" clause comparing two columns to the query.
   *
   * @param  {string|array}  first
   * @param  {string}  [operator]
   * @param  {string}  [second]
   * @param  {string}  [boolean=and]
   * @return {this}
   */
  public whereColumn (first: string | unknown[], operator?: string, second?: string, boolean: string = 'and'): this {
    // If the column is an array, we will assume it is an array of key-value pairs
    // and can add them each as a where clause. We will maintain the boolean we
    // received when the method was called and pass it into the nested where.
    if (Array.isArray(first)) {
      return this.addArrayOfWheres(first, boolean, 'whereColumn')
    }

    // If the given operator is not found in the list of valid operators we will
    // assume that the developer is just short-cutting the '=' operators and
    // we will set the operators to '=' and set the values appropriately.
    if (this.invalidOperator(operator as string)) {
      [second, operator] = [operator, '=']
    }

    // Finally, we will add this where clause into this array of clauses that we
    // are building for the query. All of them will be compiled via a grammar
    // once the query is about to be executed and run against the database.
    const type = 'Column'

    this.wheres.push({
      type, first, operator, second, boolean
    })

    return this
  }

  /**
   * Add a "where date" statement to the query.
   *
   * @param  {string}  column
   * @param  {any}  operator
   * @param  {Date|unknown}  [value]
   * @param  {string}  [boolean]
   * @return {this}
   */
  public whereDate (column: string, operator: any, value?: Date | unknown, boolean: string = 'and'): this {
    [value, operator] = this.prepareValueAndOperator(
      value as any, operator, arguments.length === 2
    )

    value = this.flattenValue(value) as any

    if (value instanceof Date) {
      value = dateFormat(value, 'YYYY-MM-dd')
    }

    return this.addDateBasedWhere('Date', column, operator, value, boolean)
  }

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
  public whereDay (column: string, operator: any, value?: Date | unknown, boolean: string = 'and'): this {
    [value, operator] = this.prepareValueAndOperator(
      value as any, operator, arguments.length === 2
    )

    value = this.flattenValue(value) as any

    if (value instanceof Date) {
      value = dateFormat(value, 'dd')
    }

    return this.addDateBasedWhere('Day', column, operator, value, boolean)
  }

  /**
   * Add a "where fulltext" clause to the query.
   *
   * @param  {string|string[]}  columns
   * @param  {string}  value
   * @param  {any[]}  options
   * @param  {string}  boolean
   * @return {this}
   */
  public whereFulltext (columns: string | string[], value: string, options: Record<string, any> = {}, boolean: string = 'and'): this {
    const type = 'Fulltext'

    columns = castArray(columns)

    this.wheres.push({ type, columns, value, options, boolean })

    this.addBinding(value)

    return this
  }

  /**
   * Add a "where in" clause to the query.
   * @param  {string}  column
   * @param  {any}  values
   * @param  {string}  boolean
   * @param  {boolean}  [not=false]
   * @return {this}
   */
  public whereIn (column: string, values: any, boolean: string = 'and', not: boolean = false): this {
    const type = not ? 'NotIn' : 'In'

    // If the value is a query builder instance we will assume the developer wants to
    // look for any values that exists within this given query. So we will add the
    // query accordingly so that this query is properly executed when it is run.
    if (this.isQueryable(values)) {
      const [query, bindings] = this.createSub(values)

      values = [new Expression(query)]

      this.addBinding(bindings, 'where')
    }

    this.wheres.push({ type, column, values, boolean })

    // Finally we'll add a binding for each values unless that value is an expression
    // in which case we will just skip over it since it will be the query as a raw
    // string and not as a parameterized place-holder to be replaced by the PDO.
    this.addBinding(this.cleanBindings(values), 'where')

    return this
  }

  /**
   * Add a "where in raw" clause for integer values to the query.
   *
   * @param  {string}  column
   * @param  {Array}  values
   * @param  {string}  [boolean=and]
   * @param  {boolean}  [not=false]
   * @return {this}
   */
  public whereIntegerInRaw (column: string, values: any[], boolean: string = 'and', not = false): this {
    const type = not ? 'NotInRaw' : 'InRaw'

    values = values.map(value => parseInt(value, 10))

    this.wheres.push({ type, column, values, boolean })

    return this
  }

  /**
   * Add a "where not in raw" clause for integer values to the query.
   *
   * @param  {string}  column
   * @param  {Array}  values
   * @param  {string}  boolean
   * @return {this}
   */
  public whereIntegerNotInRaw (column: string, values: any[], boolean: string = 'and'): this {
    return this.whereIntegerInRaw(column, values, boolean, true)
  }

  /**
   * Add a "where month" statement to the query.
   *
   * @param  {string}  column
   * @param  {any}  operator
   * @param  {Date|unknown}  [value]
   * @param  {string}  boolean
   * @return {this}
   */
  public whereMonth (column: string, operator: any, value?: Date | unknown, boolean: string = 'and'): this {
    [value, operator] = this.prepareValueAndOperator(
      value as any, operator, arguments.length === 2
    )

    value = this.flattenValue(value) as any

    if (value instanceof Date) {
      value = dateFormat(value, 'MM')
    }

    if (!(value as any instanceof Expression)) {
      value = String(value).padStart(2, '0')
    }

    return this.addDateBasedWhere('Month', column, operator, value, boolean)
  }

  /**
   * Add a nested where statement to the query.
   *
   * @param  {Function}  callback
   * @param  {string}  [boolean='and']
   * @return {this}
   */
  public whereNested (callback: Function, boolean: string = 'and'): this {
    const query = this.forNestedWhere()

    callback(query)

    return this.addNestedWhereQuery(query, boolean)
  }

  /**
   * Add a where not between statement to the query.
   *
   * @param  {string}  column
   * @param  {any[]}  values
   * @param  {string}  boolean
   * @return {this}
   */
  public whereNotBetween (column: string, values: any[], boolean: string = 'and'): this {
    return this.whereBetween(column, values, boolean, true)
  }

  /**
   * Add a where not between statement using columns to the query.
   *
   * @param  {string}  column
   * @param  {any[]}  values
   * @param  {string}  boolean
   * @return {this}
   */
  public whereNotBetweenColumns (column: string, values: any[], boolean: string = 'and'): this {
    return this.whereBetweenColumns(column, values, boolean, true)
  }

  /**
   * Add a "where not in" clause to the query.
   *
   * @param  {string}  column
   * @param  {any}  values
   * @param  {string}  boolean
   * @return {this}
   */
  public whereNotIn (column: string, values: any, boolean: string = 'and'): this {
    return this.whereIn(column, values, boolean, true)
  }

  /**
   * Add a "where null" clause to the query.
   *
   * @param  {string|Array}  columns
   * @param  {string}  [boolean=and]
   * @param  {boolean}  [not=false]
   * @return {this}
   */
  public whereNull (columns: string | Record<string, any>, boolean: string = 'and', not: boolean = false): this {
    const type = not ? 'NotNull' : 'Null'

    for (const column of Arr.wrap(columns)) {
      this.wheres.push({ type, column, boolean })
    }

    return this
  }

  /**
   * Add a raw where clause to the query.
   *
   * @param  {string}  sql
   * @param  {any}  bindings
   * @param  {string}  boolean
   * @return {this}
   */
  public whereRaw (sql: string, bindings: any = [], boolean: string = 'and'): this {
    this.wheres.push({ type: 'Raw', sql, boolean })

    this.addBinding(bindings, 'where')

    return this
  }

  /**
   * Add a full sub-select to the query.
   *
   * @param  {string}  column
   * @param  {string}  operator
   * @param  {Function}  callback
   * @param  {string}  boolean
   * @return {this}
   */
  protected whereSub (column: string, operator: string, callback: Function, boolean: string): this {
    const type = 'Sub'

    // Once we have the query instance we can simply execute it so it can add all
    // of the sub-select's conditions to itself, and then we can cache it off
    // in the array of where clauses for the "main" parent query instance.
    const query = this.forSubQuery()
    callback(query)

    this.wheres.push({
      type, column, operator, query, boolean
    })

    this.addBinding(query.getBindings(), 'where')

    return this
  }

  /**
   * Add a "where time" statement to the query.
   *
   * @param  {string}  column
   * @param  {string}  operator
   * @param  {Date|string}  [value]
   * @param  {string}  [boolean=and]
   * @return {this}
   */
  public whereTime (column: string, operator: any, value?: Date | string | number, boolean: string = 'and'): this {
    [value, operator] = this.prepareValueAndOperator(
      value as any, operator, arguments.length === 2
    )

    value = this.flattenValue(value) as any

    if (value instanceof Date) {
      value = dateFormat(value, 'HH:mm:ss')
    }

    return this.addDateBasedWhere('Time', column, operator, value, boolean)
  }

  /**
   * Add a "where year" statement to the query.
   *
   * @param  {string}  column
   * @param  {string}  operator
   * @param  {Date|unknown}  value
   * @param  {string}  boolean
   * @return {this}
   */
  public whereYear (column: string, operator: any, value?: Date | unknown, boolean: string = 'and'): this {
    [value, operator] = this.prepareValueAndOperator(
      value as any, operator, arguments.length === 2
    )

    value = this.flattenValue(value) as any

    if (value instanceof Date) {
      value = dateFormat(value, 'YYYY')
    }

    return this.addDateBasedWhere('Year', column, operator, value, boolean)
  }
}
