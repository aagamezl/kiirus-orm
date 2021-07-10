// const { Builder: EloquentBuilder } = require('./../Eloquent/Query')
// const { Relation } = require('./../Eloquent/Relations')
// const { isNumeric } = require('./../../Support/helpers')
import { Builder as EloquentBuilder } from './../Eloquent/Query'
import { Relation } from './../Eloquent/Relations'
import { isNumeric } from './../../Support/helpers'

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
     * @member \Illuminate\Database\ConnectionInterface
     */
    this.connection = connection

    /**
     * The database query grammar instance.
     *
     * @type {\Illuminate\Database\Query\Grammars\Grammar}
     */
    this.grammar = grammar ?? connection.getQueryGrammar()

    /**
     * The database query post processor instance.
     *
     * @member \Illuminate\Database\Query\Processors\Processor
     */
    this.processor = processor ?? connection.getPostProcessor()

    /**
     * The callbacks that should be invoked before the query is executed.
     *
     * @member Array
     */
    this.beforeQueryCallbacks = []

    /**
     * The current query value bindings.
     *
     * @member Bindings
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
     * @member Array
     */
    this.column = []

    /**
     * The table which the query is targeting.
     *
     * @member {string}
     */
    this.fromProperty = undefined

    /**
     * The having constraints for the query.
     *
     * @var array
     */
    this.havings = []

    /**
     * The query union statements.
     *
     * @member array
     */
    this.unions = []
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
   * Set the columns to be selected.
   *
   * @param  {array|*}  columns
   * @return {this}
   */
  select (columns = ['*']) {
    this.columns = []
    this.bindings.select = []
    columns = Array.isArray(columns) ? columns : Array.from(arguments)

    for (const item of columns) {
      const [as, column] = Object.entries(item)[0]

      if (!isNumeric(as) && this.isQueryable(column)) {
        this.selectSub(column, as)
      } else {
        this.columns.push(column)
      }
    }

    return this
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
}

// module.exports = Builder
