import {
  cloneDeep,
  isBoolean,
  isEmpty,
  isInteger,
  isNil,
  isObjectLike,
  isPlainObject,
  isString,
  merge,
  snakeCase
} from 'lodash'
import { dateFormat } from '@devnetic/utils'

import { Arr } from './../../Collections/Arr'
import { Builder as EloquentBuilder } from './../Eloquent'
import { Expression } from './Expression'
import { JoinClause } from './internal'
import { Relation } from './../Eloquent/Relations'
import { collect, head, last, reset } from './../../Collections/helpers'
import { changeKeyCase, ksort, tap } from './../../Support'

/**
 *
 *
 * @export
 * @class Builder
 */
export class Builder {
  /**
   * Create a new query builder instance.
   *
   * @constructor
   * @param  {\Illuminate\Database\ConnectionInterface}  connection
   * @param  {\Illuminate\Database\Query\Grammars\Grammar|undefined}  [grammar]
   * @param  {\Illuminate\Database\Query\Processors\Processor|undefined}  [processor]
   * @return void
   */
  constructor (connection, grammar = undefined, processor = undefined) {
    /**
     * An aggregate function and column to be run.
     *
     * @member {object}
     */
    this.aggregateProperty = undefined

    /**
     * The database connection instance.
     *
     * @member {\Illuminate\Database\ConnectionInterface}
     */
    this.connection = connection

    /**
     * The callbacks that should be invoked before the query is executed.
     *
     * @member {Array}
     */
    this.beforeQueryCallbacks = []

    /**
     * The current query value bindings.
     *
     * @member {Bindings}
     */
    this.bindings = new Map([
      ['select', []],
      ['from', []],
      ['join', []],
      ['where', []],
      ['groupBy', []],
      ['having', []],
      ['order', []],
      ['union', []],
      ['unionOrder', []]
    ])

    /**
     * The columns that should be returned.
     *
     * @member {Array}
     */
    this.columns = []

    /**
     * Indicates if the query returns distinct results.
     *
     * Occasionally contains the columns that should be distinct.
     *
     * @member {boolean|Array}
     */
    this.distinctProperty = false

    /**
     * The table which the query is targeting.
     *
     * @member {string}
     */
    this.fromProperty = undefined

    /**
     * The database query grammar instance.
     *
     * @member {import('./Grammars/Grammar').Grammar}
     */
    this.grammar = grammar ?? connection.getQueryGrammar()

    /**
     * The groupings for the query.
     *
     * @member {Array}
     */
    this.groups = []

    /**
     * The having constraints for the query.
     *
     * @member {Array}
     */
    this.havings = []

    /**
     * The table joins for the query.
     *
     * @member {Array}
     */
    this.joins = []

    /**
     * The maximum number of records to return.
     *
     * @member {number}
     */
    this.limitProperty = undefined

    /**
     * Indicates whether row locking is being used.
     *
     * @member {string|boolean}
     */
    this.lockProperty = undefined

    /**
     * The number of records to skip.
     *
     * @member number
     */
    this.offsetProperty = undefined

    /**
     * All of the available clause operators.
     *
     * @member {Array}
     */
    this.operators = [
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
     * @member {Array}
     */
    this.orders = []

    /**
     * The database query post processor instance.
     *
     * @member {import('./Processors/Processor').Processor}
     */
    this.processor = processor ?? connection.getPostProcessor()

    /**
     * The query union statements.
     *
     * @member {Array}
     */
    this.unions = []

    /**
     * The maximum number of union records to return.
     *
     * @member number
     */
    this.unionLimit = undefined

    /**
     * The number of union records to skip.
     *
     * @member number
     */
    this.unionOffset = undefined

    /**
     * The orderings for the union query.
     *
     * @member {Array}
     */
    this.unionOrders = []

    /**
     * Whether to use write pdo for the select.
     *
     * @var {boolean}
     */
    this.useWriteNdoProperty = false

    /**
     * The where constraints for the query.
     *
     * @member {Array}
     */
    this.wheres = []

    // const handler = {
    //   get: (target, method, receiver) => {
    //     if (Reflect.has(target, method)) {
    //       return Reflect.get(target, method, receiver)
    //     }

    //     if (isString(method) && method.startsWith(method, 'where')) {
    //       // return (...parameters) => this.dynamicWhere(method, parameters)
    //       return (...parameters) => Reflect.get(target, 'dynamicWhere').apply(target, [method, parameters])
    //     }

    //     if (typeof method === 'symbol') {
    //       return () => ({ next: () => ({ done: true, value: target }) })
    //     }
    //   }
    // }

    // // const proxy = Proxy.revocable(this, handler)
    // const proxy = new Proxy(this, handler)
    // Object.setPrototypeOf(proxy, Object.getPrototypeOf(this))

    // proxy.prototype.valueOf = () => this

    // return proxy
  }

  /**
   * Add an array of where clauses to the query.
   *
   * @param  {Array}  column
   * @param  {string}  boolean
   * @param  {string}  method
   * @return {this}
   */
  addArrayOfWheres (column, boolean, method = 'where') {
    return this.whereNested((query) => {
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
   * @param  {*}  value
   * @param  {string}  type
   * @return {this}
   *
   * @throws {\InvalidArgumentException}
   */
  addBinding (value, type = 'where') {
    if (!this.bindings.get(type).length === 0) {
      throw new Error(`InvalidArgumentException: Invalid binding type: ${type}.`)
    }

    if (Array.isArray(value)) {
      this.bindings.set(type, Array.from(Object.values([...this.bindings.get(type), ...value])))
    } else {
      this.bindings.get(type).push(value)
    }

    return this
  }

  /**
   * Add a date based (year, month, day, time) statement to the query.
   *
   * @param  {string}  type
   * @param  {string}  column
   * @param  {string}  operator
   * @param  {*}  value
   * @param  {string}  boolean
   * @return {this}
   */
  addDateBasedWhere (type, column, operator, value, boolean = 'and') {
    this.wheres.push({ column, type, boolean, operator, value })

    if (!(value instanceof Expression)) {
      this.addBinding(value, 'where')
    }

    return this
  }

  /**
   * Add a single dynamic where clause statement to the query.
   *
   * @param  {string}  segment
   * @param  {string}  connector
   * @param  {Array}  parameters
   * @param  {number}  index
   * @return {void}
   */
  addDynamic (segment, connector, parameters, index) {
    // Once we have parsed out the columns and formatted the boolean operators we
    // are ready to add it to this query as a where clause just like any other
    // clause on the query. Then we'll increment the parameter index values.
    const bool = connector.toLowerCase()

    this.where(snakeCase(segment), '=', parameters[index], bool)
  }

  /**
   * Add another query builder as a nested where to the query builder.
   *
   * @param  {\Illuminate\Database\Query\Builder}  query
   * @param  {string}  [boolean=and]
   * @return {this}
   */
  addNestedWhereQuery (query, boolean = 'and') {
    if (query.wheres.length > 0) {
      const type = 'Nested'

      this.wheres.push({ type, query, boolean })

      this.addBinding(query.getRawBindings().get('where'), 'where')
    }

    return this
  }

  /**
   * Add a new select column to the query.
   *
   * @param  {Array|*}  column
   * @return {this}
   */
  addSelect (column) {
    const columns = Array.isArray(column) ? column : [...arguments]

    for (const [as, column] of Arr.iterable(columns)) {
      if (isString(as) && this.isQueryable(column)) {
        if (this.columns) {
          this.select(this.fromProperty + '.*')
        }

        this.selectSub(column, as)
      } else {
        this.columns.push(column)
      }
    }

    return this
  }

  /**
   * Add an exists clause to the query.
   *
   * @param  {\Illuminate\Database\Query\Builder}  query
   * @param  {string}  boolean
   * @param  {boolean}  not
   * @return {this}
   */
  addWhereExistsQuery (query, boolean = 'and', not = false) {
    const type = not ? 'NotExists' : 'Exists'

    this.wheres.push({ type, query, boolean })

    this.addBinding(query.getBindings(), 'where')

    return this
  }

  /**
   * Execute an aggregate function on the database.
   *
   * @param  {string}  functionName
   * @param  {Array}  columns
   * @return {*}
   */
  async aggregate (functionName, columns = ['*']) {
    // We need to save the original bindings, because the cloneWithoutBindings
    // method delete them from the builder object
    const bindings = new Map(this.bindings.entries())

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
  applyBeforeQueryCallbacks () {
    for (const queryCallback of this.beforeQueryCallbacks) {
      queryCallback(this)
    }

    this.beforeQueryCallbacks = []
  }

  /**
  * Register a closure to be invoked before the query is executed.
  *
  * @param {Function} callback
  * @return {this}
  */
  beforeQuery (callback) {
    this.beforeQueryCallbacks.push(callback)

    return this
  }

  /**
   * Remove all of the expressions from a list of bindings.
   *
   * @param  {Array}  bindings
   * @return {Array}
   */
  cleanBindings (bindings) {
    return Arr.values(bindings.filter((binding) => {
      return !(binding instanceof Expression)
    }))
  }

  /**
   * Clone the query.
   *
   * @return {Builder}
   */
  clone () {
    const cloned = Object.assign({}, this)

    Object.setPrototypeOf(cloned, Object.getPrototypeOf(this))

    // The cloning process needs to run through Arrays and Maps to ensure that
    // these structured are cloned correctly like new values and not references.
    for (const propertyName of Object.getOwnPropertyNames(cloned)) {
      const property = Reflect.get(cloned, propertyName)

      if (Array.isArray(property) || property instanceof Map) {
        Reflect.set(cloned, propertyName, cloneDeep(property))
      }
    }

    return cloned
  }

  /**
   * Clone the existing query instance for usage in a pagination subquery.
   *
   * @return {this}
   */
  cloneForPaginationCount () {
    return this.cloneWithout(['orders', 'limitProperty', 'offsetProperty'])
      .cloneWithoutBindings(['order'])
  }

  /**
   * Clone the query without the given properties.
   *
   * @param  {Array}  properties
   * @return {this}
   */
  cloneWithout (properties) {
    return tap(this.clone(), (clone) => {
      for (const property of properties) {
        if (Array.isArray(clone[property])) {
          clone[property] = []
        } else {
          clone[property] = undefined
        }
      }
    })
  }

  /**
   * Clone the query without the given bindings.
   *
   * @param  {Array}  except
   * @return {Builder}
   */
  cloneWithoutBindings (except) {
    return tap(this.clone(), (clone) => {
      for (const type of except) {
        clone.bindings.set(type, [])
      }
    })
  }

  /**
   * Chunk the results of the query.
   *
   * @param  {numbernt}  count
   * @param  {Function}  callback
   * @return {boolean}
   */
  async chunk (count, callback) {
    this.enforceOrderBy()

    let page = 1
    let hasMore = false

    do {
      // We'll execute the query for the given page and get the results. If there are
      // no results we can just break and return from here. When there are results
      // we will call the callback with the current chunk of these results here.
      let results = await this.forPage(page, count).get()

      const countResults = results.count()

      if (countResults === 0) {
        break
      }

      // On each chunk result set, we will pass them to the callback and then let the
      // developer take care of everything within the callback, which allows us to
      // keep the memory low for spinning through large result sets for working.
      if (callback(results, page) === false) {
        return false
      }

      results = undefined

      page++
      hasMore = countResults === count
    } while (hasMore)

    return true
  }

  /**
   * Chunk the results of a query by comparing IDs.
   *
   * @param  {number}  count
   * @param  {Function}  callback
   * @param  {string|null}  column
   * @param  {string|{null}}  alias
   * @return {boolean}
   */
  async chunkById (count, callback, column = null, alias = null) {
    column = column ?? this.defaultKeyName()

    alias = alias ?? column

    let lastId = null

    let page = 1
    let hasMore = false

    do {
      // We'll execute the query for the given page and get the results. If there are
      // no results we can just break and return from here. When there are results
      // we will call the callback with the current chunk of these results here.
      let results = await this.forPageAfterId(count, lastId, column).get()

      const countResults = results.count()

      if (countResults === 0) {
        break
      }

      // On each chunk result set, we will pass them to the callback and then let the
      // developer take care of everything within the callback, which allows us to
      // keep the memory low for spinning through large result sets for working.
      if (callback(results, page) === false) {
        return false
      }

      lastId = results.last()[alias]

      if (lastId === null) {
        throw new Error(`RuntimeException: The chunkById operation was aborted because the [${alias}] column is not present in the query result.`)
      }

      results = undefined

      page++

      hasMore = countResults === count
    } while (hasMore)

    return true
  }

  /**
   * Retrieve the "count" result of the query.
   *
   * @param  {string}  [columns=*]
   * @return {number}
   */
  count (columns = '*') {
    return this.aggregate('count', Arr.wrap(columns))
  }

  /**
   * Creates a subquery and parse it.
   *
   * @param  {Function|\Illuminate\Database\Query\Builder|string}  query
   * @return {Array}
   */
  createSub (query) {
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
   * Add a "cross join" clause to the query.
   *
   * @param  {string}  table
   * @param  {Function|string|undefined}  first
   * @param  {string}  [operator=undefined]
   * @param  {string}  [second=undefined]
   * @return {this}
   */
  crossJoin (table, first, operator = undefined, second = undefined) {
    if (first) {
      return this.join(table, first, operator, second, 'cross')
    }

    this.joins.push(this.newJoinClause(this, 'cross', table))

    return this
  }

  /**
   * Add a subquery cross join to the query.
   *
   * @param  {Function|\Illuminate\Database\Query\Builder|string}  query
   * @param  {string}  as
   * @return {this}
   */
  crossJoinSub (query, as) {
    let bindings

    [query, bindings] = this.createSub(query)

    const expression = '(' + query + ') as ' + this.grammar.wrapTable(as)

    this.addBinding(bindings, 'join')

    this.joins.push(this.newJoinClause(this, 'cross', new Expression(expression)))

    return this
  }

  /**
   * Get the default key name of the table.
   *
   * @return {string}
   */
  defaultKeyName () {
    return 'id'
  }

  /**
  * Delete records from the database.
  *
  * @param {*} id
  * @return {number}
  */
  delete (id = undefined) {
    // If an ID is passed to the method, we will set the where clause to check the
    // ID to let developers to simply and quickly remove a single row from this
    // database without manually specifying the "where" clauses on the query.
    if (id !== undefined) {
      this.where(this.fromProperty + '.id', '=', id)
    }

    this.applyBeforeQueryCallbacks()

    return this.connection.delete(
      this.grammar.compileDelete(this), this.cleanBindings(
        this.grammar.prepareBindingsForDelete(this.bindings)
      )
    )
  }

  /**
   * Force the query to only return distinct results.
   *
   * @return {this}
   */
  distinct (...columns) {
    if (columns.length > 0) {
      this.distinctProperty = Array.isArray(columns[0]) || typeof columns[0] === 'boolean' ? columns[0] : columns
    } else {
      this.distinctProperty = true
    }

    return this
  }

  /**
   * Determine if no rows exist for the current query.
   *
   * @return {boolean}
   */
  async doesntExist () {
    const result = await this.exists()

    return !result
  }

  /**
   * Execute the given callback if rows exist for the current query.
   *
   * @param  {Function}  callback
   * @return {*}
   */
  async doesntExistOr (callback) {
    return await this.doesntExist() ? true : callback()
  }

  /**
   * Handles dynamic "where" clauses to the query.
   *
   * @param  {string}  method
   * @param  {Array}  parameters
   * @return {this}
   */
  dynamicWhere (method, parameters) {
    const finder = method.substr(5)

    const segments = finder.split(
      /(And|Or)(?=[A-Z])/
    )

    // The connector variable will determine which connector will be used for the
    // query condition. We will change it as we come across new boolean values
    // in the dynamic method strings, which could contain a number of these.
    let connector = 'and'

    let index = 0

    for (const segment of segments) {
      // If the segment is not a boolean connector, we can assume it is a column's name
      // and we will add it to the query as a new constraint as a where clause, then
      // we can keep iterating through the dynamic method string's segments again.
      if (segment !== 'And' && segment !== 'Or') {
        this.addDynamic(segment, connector, parameters, index)

        index++
      } else {
        // Otherwise, we will store the connector so we know how the next where clause we
        // find in the query should be connected to the previous ones, meaning we will
        // have the proper boolean connector to connect the next where clause found.
        connector = segment
      }
    }

    return this
  }

  /**
   * Throw an exception if the query doesn't have an orderBy clause.
   *
   * @return {void}
   *
   * @throws {\RuntimeException}
   */
  enforceOrderBy () {
    if (this.orders.length === 0 && this.unionOrders.length === 0) {
      throw new Error('RuntimeException: You must specify an orderBy clause when using this function.')
    }
  }

  /**
   * Determine if any rows exist for the current query.
   *
   * @return {boolean}
   */
  async exists () {
    this.applyBeforeQueryCallbacks()

    let results = await this.connection.select(
      this.grammar.compileExists(this), this.getBindings()
    )

    // If the results has rows, we will get the row and see if the exists column is a
    // boolean true. If there is no results for this query we will return false as
    // there are no rows for this query at all and we can return that info here.
    if (results[0] !== undefined) {
      results = results[0]

      return Boolean(results.exists)
    }

    return false
  }

  /**
   * Execute the given callback if no rows exist for the current query.
   *
   * @param  {Function}  callback
   * @return {*}
   */
  async existsOr (callback) {
    return await this.exists() ? true : callback()
  }

  /**
   * Execute a query for a single record by ID.
   *
   * @param  {number|string}  id
   * @param  {Array}  columns
   * @return {*|this}
   */
  find (id, columns = ['*']) {
    return this.where('id', '=', id).first(columns)
  }

  /**
   * Execute the query and get the first result.
   *
   * @param  {Array|string}  columns
   * @return \Illuminate\Database\Eloquent\Model|object|static|undefined
   */
  async first (columns = ['*']) {
    const result = await this.take(1).get(columns)

    return result.first()
  }

  /**
   * Get a scalar type value from an unknown type of input.
   *
   * @param  {*}  value
   * @return {*}
   */
  flattenValue (value) {
    return Array.isArray(value) ? head(Arr.flatten(value)) : value
  }

  /**
   * Create a new query instance for nested where condition.
   *
   * @return {\Illuminate\Database\Query\Builder}
   */
  forNestedWhere () {
    return this.newQuery().from(this.fromProperty)
  }

  /**
   * Create a new query instance for a sub-query.
   *
   * @return {\Illuminate\Database\Query\Builder}
   */
  forSubQuery () {
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
  from (table, as = undefined) {
    if (this.isQueryable(table)) {
      return this.fromSub(table, as)
    }

    this.fromProperty = as ? `${table} as ${as}` : table

    return this
  }

  /**
   * Set the limit and offset for a given page.
   *
   * @param  {number}  page
   * @param  {number}  [perPage=15]
   * @return {this}
   */
  forPage (page, perPage = 15) {
    return this.offset((page - 1) * perPage).limit(perPage)
  }

  /**
   * Constrain the query to the next "page" of results after a given ID.
   *
   * @param  {number}  [perPage=15]
   * @param  {number|undefined}  [lastId=0]
   * @param  {string}  [column='id']
   * @return {this}
   */
  forPageAfterId (perPage = 15, lastId = 0, column = 'id') {
    this.orders = this.removeExistingOrdersFor(column)

    if (lastId !== null) {
      this.where(column, '>', lastId)
    }

    return this.orderBy(column, 'asc')
      .limit(perPage)
  }

  /**
   * Add a raw from clause to the query.
   *
   * @param  {string}  expression
   * @param  {*}  [bindings=[]]
   * @return {this}
   */
  fromRaw (expression, bindings = []) {
    this.fromProperty = new Expression(expression)

    this.addBinding(bindings, 'from')

    return this
  }

  /**
   * Makes "from" fetch from a subquery.
   *
   * @param  {\Closure|\Illuminate\Database\Query\Builder|string}  query
   * @param  {string}  as
   * @return {this}
   *
   * @throws {\InvalidArgumentException}
   */
  fromSub (query, as) {
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
  async get (columns = ['*']) {
    return collect(await this.onceWithColumns(Arr.wrap(columns), () => {
      return this.processor.processSelect(this, this.runSelect())
    }))
  }

  /**
   * Get the current query value bindings in a flattened array.
   *
   * @return {Array}
   */
  getBindings () {
    return Arr.flatten(this.bindings)
  }

  /**
   * Get the raw array of bindings.
   *
   * @return {object}
   */
  getRawBindings () {
    return this.bindings
  }

  /**
   * Get the database connection instance.
   *
   * @return {\Illuminate\Database\Connection}
   */
  getConnection () {
    return this.connection
  }

  /**
   * Get the count of the total records for the paginator.
   *
   * @param  {Array}  [columns=[*]]
   * @return {number}
   */
  async getCountForPagination (columns = ['*']) {
    const results = await this.runPaginationCountQuery(columns)

    // Once we have run the pagination count query, we will get the resulting count and
    // take into account what type of query it was. When there is a group by we will
    // just return the count of the entire results set since that will be correct.
    if (!results[0]) {
      return 0
    } else if (isObjectLike(results[0])) {
      return parseInt(results[0]?.aggregate, 10)
    }

    return parseInt(changeKeyCase(results[0]).aggregate, 10)
  }

  /**
   * Get the query grammar instance.
   *
   * @return {\Illuminate\Database\Query\Grammars\Grammar}
   */
  getGrammar () {
    return this.grammar
  }

  /**
   * Get the database query processor instance.
   *
   * @return {\Illuminate\Database\Query\Processors\Processor}
   */
  getProcessor () {
    return this.processor
  }

  /**
   * Add a "group by" clause to the query.
   *
   * @param  {string|Array}  ...groups
   * @return {this}
   */
  groupBy (...groups) {
    for (const group of groups) {
      this.groups = [
        ...this.groups,
        ...Arr.wrap(group)
      ]
    }

    return this
  }

  /**
   * Add a raw groupBy clause to the query.
   *
   * @param  {string}  sql
   * @param  {Array}  [bindings=[]]
   * @return {this}
   */
  groupByRaw (sql, bindings = []) {
    this.groups.push(new Expression(sql))

    this.addBinding(bindings, 'groupBy')

    return this
  }

  /**
   * Add a "having" clause to the query.
   *
   * @param  {string}  column
   * @param  {string}  [operator]
   * @param  {string}  [value]
   * @param  {string}  boolean
   * @return {this}
   */
  having (column, operator, value, boolean = 'and') {
    // Here we will make some assumptions about the operator. If only 2 values are
    // passed to the method, we will assume that the operator is an equals sign
    // and keep going. Otherwise, we'll require the operator to be passed in.
    [value, operator] = this.prepareValueAndOperator(
      value, operator, arguments.length === 2
    )

    const type = 'Basic'

    // If the given operator is not found in the list of valid operators we will
    // assume that the developer is just short-cutting the '=' operators and
    // we will set the operators to '=' and set the values appropriately.
    if (this.invalidOperator(operator)) {
      [value, operator] = [operator, '=']
    }

    this.havings.push({ type, column, operator, value, boolean })

    if (!(value instanceof Expression)) {
      this.addBinding(this.flattenValue(value), 'having')
    }

    return this
  }

  /**
   * Add a "having between " clause to the query.
   *
   * @param  {string}  column
   * @param  {Array}  values
   * @param  {string}  [boolean=and]
   * @param  {boolean}  [not=and]
   * @return {this}
   */
  havingBetween (column, values, boolean = 'and', not = false) {
    const type = 'between'

    this.havings.push({ type, column, values, boolean, not })

    this.addBinding(this.cleanBindings(Arr.flatten(values)).slice(0, 2), 'having')

    return this
  }

  /**
   * Add a raw having clause to the query.
   *
   * @param  {string}  sql
   * @param  {Array}  [bindings=[]]
   * @param  {string}  [boolean='and']
   * @return {Builder}
   */
  havingRaw (sql, bindings = [], boolean = 'and') {
    const type = 'Raw'

    this.havings.push({ type, sql, boolean })

    this.addBinding(bindings, 'having')

    return this
  }

  /**
   * Concatenate values of a given column as a string.
   *
   * @param  {string}  column
   * @param  {string}  [glue='']
   * @return {string}
   */
  async implode (column, glue = '') {
    const result = await this.pluck(column)

    return result.implode(glue)
  }

  /**
   * Insert new records into the database.
   *
   * @param  {Array}  values
   * @return {boolean}
   */
  async insert (values) {
    // Since every insert gets treated like a batch insert, we will make sure the
    // bindings are structured in a way that is convenient when building these
    // inserts statements by verifying these elements are actually an array.
    if (Object.keys(values).length === 0 || values.length === 0) {
      return true
    }

    if (!Array.isArray(reset(values)) && !isPlainObject(reset(values)) && !isPlainObject(values)) {
      values = [values]
    }

    this.applyBeforeQueryCallbacks()

    // Finally, we will run this query against the database connection and return
    // the results. We will need to also flatten these bindings before running
    // the query so they are all in one huge, flattened array for execution.
    return this.connection.insert(
      this.grammar.compileInsert(this, values),
      this.cleanBindings(Arr.flatten(values, 1))
    )
  }

  /**
   * Insert a new record and get the value of the primary key.
   *
   * @param  {Array}  values
   * @param  {string|undefined}  [sequence]
   * @return number
   */
  insertGetId (values, sequence) {
    this.applyBeforeQueryCallbacks()

    if (!Array.isArray(reset(values)) && !isObjectLike(values)) {
      values = [values]
    }

    const sql = this.grammar.compileInsertGetId(this, values, sequence)

    values = this.cleanBindings(Arr.flatten(values, 1))

    return this.processor.processInsertGetId(this, sql, values, sequence)
  }

  /**
   * Insert new records into the database while ignoring errors.
   *
   * @param  {Array}  values
   * @return {number}
   */
  insertOrIgnore (values) {
    if (values.length === 0 || Object.keys(values).length === 0) {
      return 0
    }

    if (!Array.isArray(reset(values)) && !isObjectLike(values)) {
      values = [values]
    }

    this.applyBeforeQueryCallbacks()

    return this.connection.affectingStatement(
      this.grammar.compileInsertOrIgnore(this, values),
      this.cleanBindings(Arr.flatten(values, 1))
    )
  }

  /**
   * Insert new records into the table using a subquery.
   *
   * @param  {Array}  columns
   * @param  {Function|\Illuminate\Database\Query\Builder|string}  query
   * @return {number}
   */
  insertUsing (columns, query) {
    this.applyBeforeQueryCallbacks()

    const [sql, bindings] = this.createSub(query)

    return this.connection.affectingStatement(
      this.grammar.compileInsertUsing(this, columns, sql),
      this.cleanBindings(bindings)
    )
  }

  /**
   * Determine if the given operator is supported.
   *
   * @param  {string}  operator
   * @return {boolean}
   */
  invalidOperator (operator) {
    return !this.operators.includes(operator.toLowerCase()) &&
      !this.grammar.getOperators().includes(operator.toLowerCase())
  }

  /**
   * Determine if the given operator and value combination is legal.
   *
   * Prevents using Null values with invalid operators.
   *
   * @param  {string}  operator
   * @param  {*}  value
   * @return {boolean}
   */
  invalidOperatorAndValue (operator, value) {
    return isNil(value) && this.operators.includes(operator) &&
      !['=', '<>', '!='].includes(operator)
  }

  /**
   * Determine if the value is a query builder instance or a Closure.
   *
   * @param  {*}  value
   * @return {boolean}
   */
  isQueryable (value) {
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
  join (table, first, operator, second, type = 'inner', where = false) {
    const join = this.newJoinClause(this, type, table)

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
  joinSub (query, as, first, operator, second, type = 'inner', where = false) {
    let bindings

    [query, bindings] = this.createSub(query)

    const expression = '(' + query + ') as ' + this.grammar.wrapTable(as)

    this.addBinding(bindings, 'join')

    return this.join(new Expression(expression), first, operator, second, type, where)
  }

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
  joinWhere (table, first, operator, second, type = 'inner') {
    return this.join(table, first, operator, second, type, true)
  }

  /**
   * Add a left join to the query.
   *
   * @param  {string}  table
   * @param  {Function|string}  first
   * @param  {string|undefined}  [operator]
   * @param  {string|undefined}  [second]
   * @return {this}
   */
  leftJoin (table, first, operator, second) {
    return this.join(table, first, operator, second, 'left')
  }

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
  leftJoinSub (query, as, first, operator, second) {
    return this.joinSub(query, as, first, operator, second, 'left')
  }

  /**
   * Add a "join where" clause to the query.
   *
   * @param  {string}  table
   * @param  {Function|string}  first
   * @param  {string}  operator
   * @param  {string}  second
   * @return {this}
   */
  leftJoinWhere (table, first, operator, second) {
    return this.joinWhere(table, first, operator, second, 'left')
  }

  /**
   * Set the "limit" value of the query.
   *
   * @param  {number}  value
   * @return {this}
   */
  limit (value) {
    const property = this.unions.length > 0 ? 'unionLimit' : 'limitProperty'

    if (value >= 0) {
      this[property] = value
    }

    return this
  }

  /**
   * Lock the selected rows in the table.
   *
   * @param  {string|boolean}  value
   * @return {this}
   */
  lock (value = true) {
    this.lockProperty = value

    if (this.lockProperty !== undefined) {
      this.useWriteNdo()
    }

    return this
  }

  /**
   * Retrieve the maximum value of a given column.
   *
   * @param  {string}  column
   * @return {*}
   */
  max (column) {
    return this.aggregate('max', [column])
  }

  /**
   * Merge an array of bindings into our bindings.
   *
   * @param  {\Illuminate\Database\Query\Builder}  query
   * @return {this}
   */
  mergeBindings (query) {
    for (const [key, value] of query.bindings) {
      this.bindings.set(key, this.bindings.get(key).concat(value))
    }

    return this
  }

  /**
   * Merge an array of where clauses and bindings.
   *
   * @param  {Array}  wheres
   * @param  {object}  bindings
   * @return {void}
   */
  mergeWheres (wheres, bindings) {
    this.wheres = [...this.wheres, ...wheres]

    this.bindings.set('where', [...this.bindings.get('where'), ...Object.values(bindings)])
  }

  /**
   * Retrieve the minimum value of a given column.
   *
   * @param  {string}  column
   * @return {*}
   */
  min (column) {
    return this.aggregate('min', [column])
  }

  /**
   * Get a new join clause.
   *
   * @param  {\Illuminate\Database\Query\Builder}  parentQuery
   * @param  {string}  type
   * @param  {string|Expression}  table
   * @return {\Illuminate\Database\Query\JoinClause}
   */
  newJoinClause (parentQuery, type, table) {
    return new JoinClause(parentQuery, type, table)
  }

  /**
   * Get a new instance of the query builder.
   *
   * @return {\Illuminate\Database\Query\Builder}
   */
  newQuery () {
    return new this.constructor(this.connection, this.grammar, this.processor)
  }

  /**
   * Set the "offset" value of the query.
   *
   * @param  {number}  value
   * @return {this}
   */
  offset (value) {
    const property = this.unions.length > 0 ? 'unionOffset' : 'offsetProperty'

    this[property] = Math.max(0, value)

    return this
  }

  /**
   * Add an "order by" clause for a timestamp to the query.
   *
   * @param  {Function|\Illuminate\Database\Query\Builder|\Illuminate\Database\Query\Expression|string}  column
   * @return this
   */
  oldest (column = 'created_at') {
    return this.orderBy(column, 'asc')
  }

  /**
   * Execute the given callback while selecting the given columns.
   *
   * After running the callback, the columns are reset to the original value.
   *
   * @param  {Array}  columns
   * @param  {Function}  callback
   * @return {*}
   */
  async onceWithColumns (columns, callback) {
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
  orderBy (column, direction = 'asc') {
    if (this.isQueryable(column)) {
      const [query, bindings] = this.createSub(column)

      column = new Expression('(' + query + ')')

      this.addBinding(bindings, this.unions ? 'unionOrder' : 'order')
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
   * Add a descending "order by" clause to the query.
   *
   * @param  {Function|\Illuminate\Database\Query\Builder|\Illuminate\Database\Query\Expression|string}  column
   * @return {this}
   */
  orderByDesc (column) {
    return this.orderBy(column, 'desc')
  }

  /**
   * Add a raw "order by" clause to the query.
   *
   * @param  {string}  sql
   * @param  {Array}  bindings
   * @return {this}
   */
  orderByRaw (sql, bindings = []) {
    const type = 'Raw'

    this[this.unions.length > 0 ? 'unionOrders' : 'orders'].push({ type, sql })

    this.addBinding(bindings, this.unions ? 'unionOrder' : 'order')

    return this
  }

  /**
   * Add an "or having" clause to the query.
   *
   * @param  {string}  column
   * @param  {string}  [operator]
   * @param  {Builder}  [value]
   * @return {this}
   */
  orHaving (column, operator, value) {
    [value, operator] = this.prepareValueAndOperator(
      value, operator, arguments.length === 2
    )

    return this.having(column, operator, value, 'or')
  }

  /**
   * Add a raw or having clause to the query.
   *
   * @param  {string}  sql
   * @param  {Array}  [bindings]
   * @return {this}
   */
  orHavingRaw (sql, bindings = []) {
    return this.havingRaw(sql, bindings, 'or')
  }

  /**
   * Add an "or where" clause to the query.
   *
   * @param  {Function|string|Array}  column
   * @param  {*}  operator
   * @param  {*}  value
   * @return {this}
   */
  orWhere (column, operator = undefined, value = undefined) {
    [value, operator] = this.prepareValueAndOperator(
      value, operator, arguments.length === 2
    )

    return this.where(column, operator, value, 'or')
  }

  /**
   * Add an "or where" clause comparing two columns to the query.
   *
   * @param  {string|Array}  first
   * @param  {string}  [operator]
   * @param  {string}  [second]
   * @return {this}
   */
  orWhereColumn (first, operator = undefined, second = undefined) {
    return this.whereColumn(first, operator, second, 'or')
  }

  /**
   * Add an "or where date" statement to the query.
   *
   * @param  {string}  column
   * @param  {string}  operator
   * @param  {Date|string|undefined}  value
   * @return {this}
   */
  orWhereDate (column, operator, value) {
    [value, operator] = this.prepareValueAndOperator(
      String(value), String(operator), arguments.length === 2
    )

    return this.whereDate(column, operator, value, 'or')
  }

  /**
   * Add an "or where day" statement to the query.
   *
   * @param  {string}  column
   * @param  {string}  operator
   * @param {Date|string|undefined} [value=undefined]
   * @return {this}
   * @memberof Builder
   */
  orWhereDay (column, operator, value = undefined) {
    [value, operator] = this.prepareValueAndOperator(
      value, operator, arguments.length === 2
    )

    return this.whereDay(column, operator, value, 'or')
  }

  /**
   * Add an or exists clause to the query.
   *
   * @param  {Function}  callback
   * @param  {boolean}  [not=false]
   * @return {this}
   */
  orWhereExists (callback, not = false) {
    return this.whereExists(callback, 'or', not)
  }

  /**
   * Add an "or where in" clause to the query.
   *
   * @param  {string}  column
   * @param  {*}  values
   * @return {this}
   */
  orWhereIn (column, values) {
    return this.whereIn(column, values, 'or')
  }

  /**
   * Add an "or where JSON length" clause to the query.
   *
   * @param  {string}  column
   * @param  {*}  operator
   * @param  {*}  value
   * @return {this}
   */
  orWhereJsonLength (column, operator, value = null) {
    [value, operator] = this.prepareValueAndOperator(
      value, operator, arguments.length === 2
    )

    return this.whereJsonLength(column, operator, value, 'or')
  }

  /**
   * Add an "or where month" statement to the query.
   *
   * @param  {string}  column
   * @param  {string}  operator
   * @param  {Date|string|undefined}  value
   * @return {this}
   */
  orWhereMonth (column, operator, value) {
    [value, operator] = this.prepareValueAndOperator(
      value, operator, arguments.length === 2
    )

    return this.whereMonth(column, operator, value, 'or')
  }

  /**
   * Add a where not exists clause to the query.
   *
   * @param  {Function}  callback
   * @return {this}
   */
  orWhereNotExists (callback) {
    return this.orWhereExists(callback, true)
  }

  /**
   * Add an "or where not in" clause to the query.
   *
   * @param  {string}  column
   * @param  {*}  values
   * @return {this}
   */
  orWhereNotIn (column, values) {
    return this.whereNotIn(column, values, 'or')
  }

  /**
   * Add an "or where not null" clause to the query.
   *
   * @param  {string} column
   * @return {this}
   */
  orWhereNotNull (column) {
    return this.whereNotNull(column, 'or')
  }

  /**
   * Add an "or where null" clause to the query.
   *
   * @param  {string}  column
   * @return {this}
   */
  orWhereNull (column) {
    return this.whereNull(column, 'or')
  }

  /**
   * Add an "or where in raw" clause for integer values to the query.
   *
   * @param  {string}  column
   * @param  {Array}  values
   * @return {this}
   */
  orWhereIntegerInRaw (column, values) {
    return this.whereIntegerInRaw(column, values, 'or')
  }

  /**
   * Add an "or where not in raw" clause for integer values to the query.
   *
   * @param  {string}  column
   * @param  {Array}  values
   * @return {this}
   */
  orWhereIntegerNotInRaw (column, values) {
    return this.whereIntegerNotInRaw(column, values, 'or')
  }

  /**
   * Add an "or where JSON contains" clause to the query.
   *
   * @param  {string}  column
   * @param  {*}  value
   * @return {this}
   */
  orWhereJsonContains (column, value) {
    return this.whereJsonContains(column, value, 'or')
  }

  /**
   * Add an "or where JSON not contains" clause to the query.
   *
   * @param  {string}  column
   * @param  {*}  value
   * @return {this}
   */
  orWhereJsonDoesntContain (column, value) {
    return this.whereJsonDoesntContain(column, value, 'or')
  }

  /**
   * Add a raw or where clause to the query.
   *
   * @param  {string}  sql
   * @param  {*}  bindings
   * @return {this}
   */
  orWhereRaw (sql, bindings = []) {
    return this.whereRaw(sql, bindings, 'or')
  }

  /**
   * Adds an or where condition using row values.
   *
   * @param  {Array}  columns
   * @param  {string}  operator
   * @param  {Array}  values
   * @return {this}
   */
  orWhereRowValues (columns, operator, values) {
    return this.whereRowValues(columns, operator, values, 'or')
  }

  /**
   * Add an "or where year" statement to the query.
   *
   * @param  {string}  column
   * @param  {string}  operator
   * @param  {Date|string|number|undefined}  [value]
   * @return {Builder}
   */
  orWhereYear (column, operator, value) {
    [value, operator] = this.prepareValueAndOperator(
      value, operator, arguments.length === 2
    )

    return this.whereYear(column, operator, value, 'or')
  }

  /**
   * Paginate the given query into a simple paginator.
   *
   * @param  {number}  perPage
   * @param  {Array}  columns
   * @param  {number|null}  page
   * @return {object}
   */
  async paginate (perPage = 15, columns = ['*'], page = 1) {
    const total = await this.getCountForPagination()

    const results = total ? await this.forPage(page, perPage).get(columns) : collect()

    return this.paginator(results, total, perPage, page)
  }

  /**
   * Create a new length-aware paginator instance.
   *
   * @param  {\Illuminate\Support\Collection}  items
   * @param  {number}  total
   * @param  {number}  perPage
   * @param  {number}  currentPage
   * @return {object}
   */
  paginator (items, total, perPage, currentPage, options) {
    return {
      items, total, perPage, currentPage
    }
  }

  /**
   * Parse the subquery into SQL and bindings.
   *
   * @param  {*}  query
   * @return {Array}
   *
   * @throws {\InvalidArgumentException}
   */
  parseSub (query) {
    if (query instanceof this.constructor ||
      query instanceof Builder ||
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
   * Get an array with the values of a given column.
   *
   * @param  {string}  column
   * @param  {string|undefined}  key
   * @return {\Illuminate\Support\Collection}
   */
  async pluck (column, key = undefined) {
    // First, we will need to select the results of the query accounting for the
    // given columns / key. Once we have the results, we will be able to take
    // the results and get the exact data that was requested for the query.
    const queryResult = await this.onceWithColumns(
      !key ? [column] : [column, key], () => {
        return this.processor.processSelect(
          this, this.runSelect()
        )
      }
    )

    if (queryResult.length === 0) {
      return collect()
    }

    // If the columns are qualified with a table or have an alias, we cannot use
    // those directly in the "pluck" operations since the results from the DB
    // are only keyed by the column itself. We'll strip the table out here.
    column = this.stripTableForPluck(column)

    key = this.stripTableForPluck(key)

    return Array.isArray(queryResult[0])
      ? this.pluckFromArrayColumn(queryResult, column, key)
      : this.pluckFromObjectColumn(queryResult, column, key)
  }

  /**
   * Retrieve column values from rows represented as objects.
   *
   * @param  {Array}  queryResult
   * @param  {string}  column
   * @param  {string}  key
   * @return {\Illuminate\Support\Collection}
   */
  pluckFromObjectColumn (queryResult, column, key) {
    let results

    if (!key) {
      results = []

      for (const row of (queryResult)) {
        results.push(row[column])
      }
    } else {
      results = {}

      for (const row of queryResult) {
        results[row[key]] = row[column]
      }
    }

    return collect(results)
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
  prepareValueAndOperator (value, operator, useDefault = false) {
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
   * @param  {*}  query
   * @return {*}
   */
  prependDatabaseNameIfCrossDatabaseQuery (query) {
    if (query.getConnection().getDatabaseName() !== this.getConnection().getDatabaseName()) {
      const databaseName = query.getConnection().getDatabaseName()

      if (query.fromProperty.indexOf(databaseName) !== 0 && query.from.indexOf('.') === -1) {
        query.from(databaseName + '.' + query.from)
      }
    }

    return query
  }

  /**
   * Get an array with all orders with a given column removed.
   *
   * @param  {string}  column
   * @return {Array}
   */
  removeExistingOrdersFor (column) {
    return collect(this.orders)
      .reject((order) => {
        return order.column !== undefined
          ? order.column === column
          : false
      }).values().all()
  }

  /**
   * Remove all existing orders and optionally add a new order.
   *
   * @param  {string}  [column]
   * @param  {string}  [direction=asc]
   * @return {this}
   */
  reorder (column = '', direction = 'asc') {
    this.orders = []
    this.unionOrders = []
    this.bindings.set('order', [])
    this.bindings.set('unionOrder', [])

    if (column) {
      return this.orderBy(column, direction)
    }

    return this
  }

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
  rightJoinSub (query, as, first, operator, second) {
    return this.joinSub(query, as, first, operator, second, 'right')
  }

  /**
   * Run a pagination count query.
   *
   * @param  {Array}  columns
   * @return {Array}
   */
  async runPaginationCountQuery (columns = ['*']) {
    // We need to save the original bindings, because the cloneWithoutBindings
    // method delete them from the builder object
    const bindings = new Map(this.bindings.entries())

    if (this.groups.length > 0 || this.havings.length > 0) {
      const clone = this.cloneForPaginationCount()

      if (clone.columns.length === 0 && this.joins.length > 0) {
        clone.select(this.fromProperty + '.*')
      }

      const result = await this.newQuery()
        .from(new Expression('(' + clone.toSql() + ') as ' + this.grammar.wrap('aggregate_table')))
        .mergeBindings(clone)
        .setAggregate('count', this.withoutSelectAliases(columns))
        .get()

      this.bindings = bindings

      return result.all()
    }

    const without = this.unions.length > 0
      ? ['orders', 'limitProperty', 'offsetProperty']
      : ['columns', 'orders', 'limitProperty', 'offsetProperty']

    const result = await this.cloneWithout(without)
      .cloneWithoutBindings(this.unions.length > 0 ? ['order'] : ['select', 'order'])
      .setAggregate('count', this.withoutSelectAliases(columns))
      .get()

    this.bindings = bindings

    return result.all()
  }

  /**
   * Run the query as a "select" statement against the connection.
   *
   * @return {Array}
   */
  runSelect () {
    return this.connection.select(
      this.toSql(), this.getBindings()
    )
  }

  /**
   * Set the columns to be selected.
   *
   * @param {Array|*} columns
   * @return {this}
   * @memberof Builder
   */
  select (...columns) {
    columns = columns.length === 0 ? ['*'] : columns

    this.columns = []
    this.bindings.set('select', [])

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
   * @param  {Array}  bindings
   * @return {this}
   */
  selectRaw (expression, bindings = []) {
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
  selectSub (query, as) {
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
  setAggregate (functionName, columns) {
    this.aggregateProperty = { function: functionName, columns }

    if (this.groups.length === 0) {
      this.orders = []

      this.bindings.set('order', [])
    }

    return this
  }

  /**
   * Alias to set the "offset" value of the query.
   *
   * @param  {number}  value
   * @return {Builder}
   */
  skip (value) {
    return this.offset(value)
  }

  /**
   * Strip off the table name or alias from a column identifier.
   *
   * @param  {string}  column
   * @return {string|undefined}
   */
  stripTableForPluck (column) {
    if (!column) {
      return column
    }

    const separator = column.toLowerCase().includes(' as ') !== false ? ' as ' : '\\.'

    return last(column.split('~' + separator + '~i'))
  }

  /**
   * Retrieve the sum of the values of a given column.
   *
   * @param  {string}  column
   * @return {*}
   */
  async sum (column) {
    const result = await this.aggregate('sum', [column])

    return result ?? 0
  }

  /**
   * Alias to set the "limit" value of the query.
   *
   * @param  {number}  value
   * @return {Builder}
   */
  take (value) {
    return this.limit(value)
  }

  /**
   * Pass the query to a given callback.
   *
   * @param  {Function}  callback
   * @return {this}
   */
  tap (callback) {
    return this.when(true, callback)
  }

  /**
   * Get the SQL representation of the query.
   *
   * @return {string}
   */
  toSql () {
    this.applyBeforeQueryCallbacks()

    return this.grammar.compileSelect(this)
  }

  /**
  * Run a truncate statement on the table.
  *
  * @return {void}
  */
  truncate () {
    this.applyBeforeQueryCallbacks()

    for (const [sql, bindings] of Object.entries(this.grammar.compileTruncate(this))) {
      this.connection.statement(sql, bindings)
    }
  }

  /**
   * Add a union statement to the query.
   *
   * @param  {\Illuminate\Database\Query\Builder|Function}  query
   * @param  {boolean}  [all=false]
   * @return {Builder}
   */
  union (query, all = false) {
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
  unionAll (query) {
    return this.union(query, true)
  }

  /**
   * Apply the callback's query changes if the given "value" is false.
   *
   * @param  {*}  value
   * @param  {Function}  callbackFunc
   * @param  {Function}  [defaultCallback]
   * @return {this|*}
   */
  unless (value, callbackFunc, defaultCallback = undefined) {
    if (!value) {
      return callbackFunc(this, value) ?? this
    } else if (defaultCallback) {
      return defaultCallback(this, value) ?? this
    }

    return this
  }

  /**
   * Update records in the database.
   *
   * @param  {Array}  values
   * @return {number}
   */
  async update (values) {
    this.applyBeforeQueryCallbacks()

    const sql = this.grammar.compileUpdate(this, values)

    return this.connection.update(sql, this.cleanBindings(
      this.grammar.prepareBindingsForUpdate(this.bindings, values)
    ))
  }

  /**
   * Insert or update a record matching the attributes, and fill it with values.
   *
   * @param  {Array}  attributes
   * @param  {Array}  values
   * @return {boolean}
   */
  async updateOrInsert (attributes, values = []) {
    const exist = await this.where(attributes).exists()

    if (!exist) {
      return this.insert(merge(attributes, values))
    }

    if (isEmpty(values)) {
      return true
    }

    return Boolean(await this.limit(1).update(values))
  }

  /**
   * Insert new records or update the existing ones.
   *
   * @param  {Array}  values
   * @param  {Array|string}  uniqueBy
   * @param  {Array|undefined}  [update]
   * @return {number}
   */
  upsert (values, uniqueBy, update = undefined) {
    if (Object.keys(values).length === 0 || values.length === 0) {
      return 0
    } else if (update === []) {
      return Number(this.insert(values))
    }

    if (!Array.isArray(reset(values)) && !isPlainObject(reset(values))) {
      values = [values]
    } else {
      for (let [key, value] of Object.entries(values)) {
        value = ksort(value)

        values[key] = value
      }
    }

    if (!update || update?.length === 0) {
      update = Object.keys(reset(values))
    }

    this.applyBeforeQueryCallbacks()

    const bindings = this.cleanBindings([
      ...Arr.flatten(values, 1),
      ...collect(update).reject((value, key) => {
        return isInteger(key)
      }).all()
    ])

    uniqueBy = !Array.isArray(uniqueBy) ? [uniqueBy] : uniqueBy

    return this.connection.affectingStatement(
      this.grammar.compileUpsert(this, values, uniqueBy, update),
      bindings
    )
  }

  /**
   * Use the write pdo for query.
   *
   * @return {this}
   */
  useWriteNdo () {
    this.useWriteNdoProperty = true

    return this
  }

  /**
   * Get a single column's value from the first result of a query.
   *
   * @param  {string}  column
   * @return {*}
   */
  async value (column) {
    const result = await this.first([column])

    return result.length > 0 || Object.keys(result).length > 0 ? reset(result) : null
  }

  /**
   * Apply the callback's query changes if the given "value" is true.
   *
   * @param  {*}  value
   * @param  {Function}  callback
   * @param  {Function|undefined}  [defaultCallback]
   * @return {*|this}
   */
  when (value, callbackFunc, defaultCallback = undefined) {
    if (value) {
      return callbackFunc(this, value) ?? this
    } else if (defaultCallback) {
      return defaultCallback(this, value) ?? this
    }

    return this
  }

  /**
   * Add a basic where clause to the query.
   *
   * @param  {Function|string|Array}  column
   * @param  {*}  [operator]
   * @param  {*}  [value]
   * @param  {string}  boolean
   * @return {this}
   */
  where (column, operator = undefined, value = null, boolean = 'and') {
    // If the column is an array, we will assume it is an array of key-value pairs
    // and can add them each as a where clause. We will maintain the boolean we
    // received when the method was called and pass it into the nested where.
    // if (Array.isArray(column) || isObjectLike(column)) {
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
    if (column instanceof Function && !operator) {
      return this.whereNested(column, boolean)
    }

    // If the column is a Closure instance and there is an operator value, we will
    // assume the developer wants to run a subquery and then compare the result
    // of that subquery with the given value that was provided to the method.
    if (this.isQueryable(column) && operator) {
      const [sub, bindings] = this.createSub(column)

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
      return this.whereSub(column, operator, value, boolean)
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
      value = new Expression(value ? 'true' : 'false')

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
   * @param  {Array}  values
   * @param  {string}  boolean
   * @param  {boolean}  not
   * @return {this}
   */
  whereBetween (column, values, boolean = 'and', not = false) {
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
   * @param  {Array}  values
   * @param  {string}  boolean
   * @param  {boolean}  not
   * @return {this}
   */
  whereBetweenColumns (column, values, boolean = 'and', not = false) {
    const type = 'BetweenColumns'

    this.wheres.push({ type, column, values, boolean, not })

    return this
  }

  /**
   * Add a "where" clause comparing two columns to the query.
   *
   * @param  {string|array}  first
   * @param  {string|undefined}  operator
   * @param  {string|undefined}  second
   * @param  {string|undefined}  [boolean=and]
   * @return {this}
   */
  whereColumn (first, operator = undefined, second = undefined, boolean = 'and') {
    // If the column is an array, we will assume it is an array of key-value pairs
    // and can add them each as a where clause. We will maintain the boolean we
    // received when the method was called and pass it into the nested where.
    if (Array.isArray(first)) {
      return this.addArrayOfWheres(first, boolean, 'whereColumn')
    }

    // If the given operator is not found in the list of valid operators we will
    // assume that the developer is just short-cutting the '=' operators and
    // we will set the operators to '=' and set the values appropriately.
    if (this.invalidOperator(operator)) {
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
   * @param  {string}  operator
   * @param  {Date|string|undefined}  [value]
   * @param  {string}  [boolean]
   * @return {this}
   */
  whereDate (column, operator, value = undefined, boolean = 'and') {
    [value, operator] = this.prepareValueAndOperator(
      value, operator, arguments.length === 2
    )

    value = this.flattenValue(value)

    if (value instanceof Date) {
      value = dateFormat(value, 'Y-m-d')
    }

    return this.addDateBasedWhere('Date', column, operator, value, boolean)
  }

  /**
   * Add a "where day" statement to the query.
   *
   * @param  {string}  column
   * @param  {string}  operator
   * @param  {Date|string|undefined}  value
   * @param  {string}  boolean
   * @return {this}
   * @memberof Builder
   */
  whereDay (column, operator, value, boolean = 'and') {
    [value, operator] = this.prepareValueAndOperator(
      value, operator, arguments.length === 2
    )

    value = this.flattenValue(value)

    if (value instanceof Date) {
      value = dateFormat(value, 'd')
    }

    return this.addDateBasedWhere('Day', column, operator, value, boolean)
  }

  /**
   * Add an exists clause to the query.
   *
   * @param  {Function}  callback
   * @param  {string}  [boolean=and]
   * @param  {boolean}  [not=false]
   * @return {this}
   */
  whereExists (callback, boolean = 'and', not = false) {
    const query = this.forSubQuery()

    // Similar to the sub-select clause, we will create a new query instance so
    // the developer may cleanly specify the entire exists query and we will
    // compile the whole thing in the grammar and insert it into the SQL.
    callback(query)

    return this.addWhereExistsQuery(query, boolean, not)
  }

  /**
   * Add a "where in" clause to the query.
   * @param  {string}  column
   * @param  {*}  values
   * @param  {string}  boolean
   * @param  {boolean}  [not=false]
   * @return {this}
   */
  whereIn (column, values, boolean = 'and', not = false) {
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
  whereIntegerInRaw (column, values, boolean = 'and', not = false) {
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
  whereIntegerNotInRaw (column, values, boolean = 'and') {
    return this.whereIntegerInRaw(column, values, boolean, true)
  }

  /**
   * Add a "where JSON contains" clause to the query.
   *
   * @param  {string}  column
   * @param  {*}  value
   * @param  {string}  boolean
   * @param  {boolean}  not
   * @return {this}
   */
  whereJsonContains (column, value, boolean = 'and', not = false) {
    const type = 'JsonContains'

    this.wheres.push({ type, column, value, boolean, not })

    if (!(value instanceof Expression)) {
      this.addBinding(this.grammar.prepareBindingForJsonContains(value))
    }

    return this
  }

  /**
   * Add a "where JSON not contains" clause to the query.
   *
   * @param  {string}  column
   * @param  {*}  value
   * @param  {string}  boolean
   * @return {this}
   */
  whereJsonDoesntContain (column, value, boolean = 'and') {
    return this.whereJsonContains(column, value, boolean, true)
  }

  /**
   * Add a "where JSON length" clause to the query.
   *
   * @param  {string}  column
   * @param  {*}  operator
   * @param  {*}  value
   * @param  {string}  boolean
   * @return {this}
   */
  whereJsonLength (column, operator, value = null, boolean = 'and') {
    [value, operator] = this.prepareValueAndOperator(
      value, operator, arguments.length === 2
    )

    const type = 'JsonLength'

    this.wheres.push({ type, column, operator, value, boolean })

    if (!(value instanceof Expression)) {
      this.addBinding(parseInt(this.flattenValue(value)))
    }

    return this
  }

  /**
   * Add a "where month" statement to the query.
   *
   * @param  {string}  column
   * @param  {string}  operator
   * @param  {Date|string|undefined}  value
   * @param  {string}  boolean
   * @return {this}
   */
  whereMonth (column, operator, value, boolean = 'and') {
    [value, operator] = this.prepareValueAndOperator(
      value, operator, arguments.length === 2
    )

    value = this.flattenValue(value)

    if (value instanceof Date) {
      value = dateFormat(value, 'm')
    }

    // if (!(value instanceof Expression)) {
    //   value = String(value).padStart(2, '0')
    // }

    return this.addDateBasedWhere('Month', column, operator, value, boolean)
  }

  /**
   * Add a nested where statement to the query.
   *
   * @param  {Function}  callback
   * @param  {string}  [boolean=and]
   * @return {this}
   */
  whereNested (callback, boolean = 'and') {
    const query = this.forNestedWhere()

    callback(query)

    return this.addNestedWhereQuery(query, boolean)
  }

  /**
   * Add a where not between statement to the query.
   *
   * @param  {string}  column
   * @param  {Array}  values
   * @param  {string}  boolean
   * @return {this}
   */
  whereNotBetween (column, values, boolean = 'and') {
    return this.whereBetween(column, values, boolean, true)
  }

  /**
 * Add a where not between statement using columns to the query.
 *
 * @param  {string}  column
 * @param  {Array}  values
 * @param  {string}  boolean
 * @return {this}
 */
  whereNotBetweenColumns (column, values, boolean = 'and') {
    return this.whereBetweenColumns(column, values, boolean, true)
  }

  /**
   * Add a where not exists clause to the query.
   *
   * @param  {Function}  callback
   * @param  {string}  [boolean=and]
   * @return {this}
   */
  whereNotExists (callback, boolean = 'and') {
    return this.whereExists(callback, boolean, true)
  }

  /**
   * Add a "where not in" clause to the query.
   *
   * @param  {string}  column
   * @param  {*}  values
   * @param  {string}  boolean
   * @return {this}
   */
  whereNotIn (column, values, boolean = 'and') {
    return this.whereIn(column, values, boolean, true)
  }

  /**
   * Add a "where not null" clause to the query.
   *
   * @param  {string|Array}  columns
   * @param  {string}  [boolean=and]
   * @return {this}
   */
  whereNotNull (columns, boolean = 'and') {
    return this.whereNull(columns, boolean, true)
  }

  /**
   * Add a "where null" clause to the query.
   *
   * @param  {string|Array}  columns
   * @param  {string}  [boolean=and]
   * @param  {boolean}  [not=false]
   * @return {this}
   */
  whereNull (columns, boolean = 'and', not = false) {
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
   * @param  {*}  bindings
   * @param  {string}  boolean
   * @return {this}
   */
  whereRaw (sql, bindings = [], boolean = 'and') {
    this.wheres.push({ type: 'Raw', sql, boolean })

    this.addBinding(bindings, 'where')

    return this
  }

  /**
   * Adds a where condition using row values.
   *
   * @param  {array}  columns
   * @param  {string}  operator
   * @param  {Array}  values
   * @param  {string}  boolean
   * @return {this}
   *
   * @throws {\InvalidArgumentException}
   */
  whereRowValues (columns, operator, values, boolean = 'and') {
    if (columns.length !== values.length) {
      throw new Error('InvalidArgumentException: The number of columns must match the number of values')
    }

    const type = 'RowValues'

    this.wheres.push({ type, columns, operator, values, boolean })

    this.addBinding(this.cleanBindings(values))

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
  whereSub (column, operator, callback, boolean) {
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
   * @param  {Date|string|undefined}  value
   * @param  {string}  [boolean=and]
   * @return {this}
   */
  whereTime (column, operator, value, boolean = 'and') {
    [value, operator] = this.prepareValueAndOperator(
      value, operator, arguments.length === 2
    )

    value = this.flattenValue(value)

    if (value instanceof Date) {
      value = dateFormat(value, 'H:i:s')
    }

    return this.addDateBasedWhere('Time', column, operator, value, boolean)
  }

  /**
   * Add a "where year" statement to the query.
   *
   * @param  {string}  column
   * @param  {string}  operator
   * @param  {Date|string|number|undefined}  value
   * @param  {string}  boolean
   * @return {this}
   */
  whereYear (column, operator, value, boolean = 'and') {
    [value, operator] = this.prepareValueAndOperator(
      value, operator, arguments.length === 2
    )

    value = this.flattenValue(value)

    if (value instanceof Date) {
      value = dateFormat(value, 'Y')
    }

    return this.addDateBasedWhere('Year', column, operator, value, boolean)
  }

  /**
   * Remove the column aliases since they will break count queries.
   *
   * @param  {Array}  columns
   * @return {Array}
   */
  withoutSelectAliases (columns) {
    return columns.map((column) => {
      const aliasPosition = column.toLowerCase().indexOf(' as ')

      return isString(column) && aliasPosition !== -1
        ? column.substr(0, aliasPosition)
        : column
    })
  }
}
