import { isString } from 'lodash'

import { Arr } from './../../Collections/Arr'
import { Builder as EloquentBuilder } from './../Eloquent/Query'
import { Expression } from './Expression'
import { JoinClause } from './internal'
import { Relation } from './../Eloquent/Relations'
import { collect } from '../../Collections/helpers'

export class Builder {
  /**
   * Create a new query builder instance.
   *
   * @param  {\Illuminate\Database\ConnectionInterface}  connection
   * @param  {\Illuminate\Database\Query\Grammars\Grammar|undefined}  [grammar]
   * @param  {\Illuminate\Database\Query\Processors\Processor|undefined}  [processor]
   * @return void
   */
  constructor (connection, grammar = undefined, processor = undefined) {
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
    this.bindings = {
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
     * @type {import('./Grammars/Grammar').Grammar}
     */
    this.grammar = grammar ?? connection.getQueryGrammar()

    /**
     * The having constraints for the query.
     *
     * @type {Array}
     */
    this.havings = []

    /**
     * The table joins for the query.
     *
     * @type {Array}
     */
    this.joins = []

    /**
     * All of the available clause operators.
     *
     * @type {Array}
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
     * The database query post processor instance.
     *
     * @type {import('./Processors/Processor').Processor}
     */
    this.processor = processor ?? connection.getPostProcessor()

    /**
     * The query union statements.
     *
     * @member {Array}
     */
    this.unions = []

    /**
     * The where constraints for the query.
     *
     * @type {Array}
     */
    this.wheres = []
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
    if (!this.bindings[type].length === 0) {
      throw new TypeError(`InvalidArgumentException: Invalid binding type: ${type}.`)
    }

    if (Array.isArray(value)) {
      this.bindings[type] = Array.from(Object.values([...this.bindings[type], ...value]))
    } else {
      this.bindings[type].push(value)
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
   */
  from (table, as = undefined) {
    if (this.isQueryable(table)) {
      return this.fromSub(table, as)
    }

    this.fromProperty = as ? `${table} as ${as}` : table

    return this
  }

  /**
   * Execute the query as a "select" statement.
   *
   * @param  {Array|string}  columns
   * @return {\Illuminate\Support\Collection}
   */
  get (columns = ['*']) {
    return collect(this.onceWithColumns(Arr.wrap(columns), () => {
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
   * Get the database connection instance.
   *
   * @return {\Illuminate\Database\Connection}
   */
  getConnection () {
    return this.connection
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
   * @param  {string}  [type='inner']
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
   * Execute the given callback while selecting the given columns.
   *
   * After running the callback, the columns are reset to the original value.
   *
   * @param  {Array}  columns
   * @param  {Function}  callback
   * @return {*}
   */
  onceWithColumns (columns, callback) {
    const original = this.columns

    if (original.length === 0) {
      this.columns = columns
    }

    const result = callback()

    this.columns = original

    return result
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
      throw new TypeError(
        'InvalidArgumentException: A subquery must be a query builder instance, a Closure, or a string.'
      )
    }
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
   * Get the SQL representation of the query.
   *
   * @return {string}
   */
  toSql () {
    this.applyBeforeQueryCallbacks()

    return this.grammar.compileSelect(this)
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
}
