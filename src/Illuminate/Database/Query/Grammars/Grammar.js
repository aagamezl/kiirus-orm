import { capitalize } from 'lodash'

import { Grammar as BaseGrammar } from './../../Grammar'
import { JoinClause } from './../JoinClause'
import { collect } from './../../../Collections/helpers'

export class Grammar extends BaseGrammar {
  constructor () {
    super()

    /**
     * The grammar specific operators.
     *
     * @type {Array}
     */
    this.operators = []

    /**
     * The components that make up a select clause.
     *
     * @member {Array}
     */
    this.selectComponents = [
      { name: 'aggregate', property: 'aggregateProperty' },
      { name: 'columns', property: 'columns' },
      { name: 'from', property: 'fromProperty' },
      { name: 'joins', property: 'joins' },
      { name: 'wheres', property: 'wheres' },
      { name: 'groups', property: 'groups' },
      { name: 'havings', property: 'havings' },
      { name: 'orders', property: 'orders' },
      { name: 'limit', property: 'limitProperty' },
      { name: 'offset', property: 'offsetProperty' },
      { name: 'lock', property: 'lockProperty' }
    ]
  }

  /**
   * Compile the "select *" portion of the query.
   *
   * @param  {\Illuminate\Database\Query\Builder}  query
   * @param  {Array}  columns
   * @return {string|undefined}
   */
  compileColumns (query, columns) {
    // If the query is actually performing an aggregating select, we will let that
    // compiler handle the building of the select clauses, as it will need some
    // more syntax that is best handled by that function to keep things neat.
    if (query.aggregateProperty) {
      return
    }

    const select = query.distinctProperty ? 'select distinct ' : 'select '

    return select + this.columnize(columns)
  }

  /**
   * Compile the components necessary for a select clause.
   *
   * @param  {\Illuminate\Database\Query\Builder}  query
   * @return {Array}
   */
  compileComponents (query) {
    const sql = []

    for (const { name, property } of this.selectComponents) {
      if (this.isExecutable(query, property)) {
        const method = 'compile' + capitalize(name)

        sql[name] = this[method](query, Reflect.get(query, property))
      }
    }

    return sql
  }

  /**
   * Compile the "from" portion of the query.
   *
   * @param  {\Illuminate\Database\Query\Builder}  query
   * @param  {string}  table
   * @return {string}
   */
  compileFrom (query, table) {
    return 'from ' + this.wrapTable(table)
  }

  /**
 * Compile the "having" portions of the query.
 *
 * @param  {\Illuminate\Database\Query\Builder}  query
 * @param  {Array}  havings
 * @return {string}
 */
  compileHavings (query, havings) {
    const sql = havings.map(having => this.compileHaving(having)).join(' ')

    return sql ? 'having ' + this.removeLeadingBoolean(sql) : ''
  }

  /**
   * Compile the "join" portions of the query.
   *
   * @param  {\Illuminate\Database\Query\Builder}  query
   * @param  {Array}  joins
   * @return {string}
   */
  compileJoins (query, joins) {
    return collect(joins).map((join) => {
      const table = this.wrapTable(join.table)

      const nestedJoins = join.joins.length === 0 ? '' : ' ' + this.compileJoins(query, join.joins)

      const tableAndNestedJoins = join.joins.length === 0 ? table : '(' + table + nestedJoins + ')'

      return `${join.type} join ${tableAndNestedJoins} ${this.compileWheres(join)}`.trim()
    }).implode(' ')
  }

  /**
   * Compile a select query into SQL.
   *
   * @param  {\Illuminate\Database\Query\Builder}  query
   * @return {string}
   */
  compileSelect (query) {
    if ((query.unions.length > 0 || query.havings.length > 0) && query.aggregateProperty) {
      return this.compileUnionAggregate(query)
    }

    // If the query does not have any columns set, we'll set the columns to the
    // * character to just get all of the columns from the database. Then we
    // can build the query and concatenate all the pieces together as one.
    const original = query.columns

    if (query.columns.length === 0) {
      query.columns = ['*']
    }

    // To compile the query, we'll spin through each component of the query and
    // see if that component exists. If it does we'll just call the compiler
    // function for the component which is responsible for making the SQL.
    let sql = this.concatenate(this.compileComponents(query)).trim()

    if (query.unions.length > 0) {
      sql = this.wrapUnion(sql) + ' ' + this.compileUnions(query)
    }

    query.columns = original

    return sql
  }

  /**
   * Compile the "where" portions of the query.
   *
   * @param  {\Illuminate\Database\Query\Builder}  query
   * @return {string}
   */
  compileWheres (query) {
    // Each type of where clauses has its own compiler function which is responsible
    // for actually creating the where clauses SQL. This helps keep the code nice
    // and maintainable since each clause has a very small method that it uses.
    if (query.wheres.length === 0) {
      return ''
    }

    // If we actually have some where clauses, we will strip off the first boolean
    // operator, which is added by the query builders for convenience so we can
    // avoid checking for the first clauses in each of the compilers methods.
    const sql = this.compileWheresToArray(query)

    if (sql.length > 0) {
      return this.concatenateWhereClauses(query, sql)
    }

    return ''
  }

  /**
   * Get an array of all the where clauses for the query.
   *
   * @param  {\Illuminate\Database\Query\Builder}  query
   * @return {Array}
   */
  compileWheresToArray (query) {
    return collect(query.wheres).map((where) => {
      return where.boolean + ' ' + this[`where${where.type}`](query, where)
    }).all()
  }

  /**
   * Concatenate an array of segments, removing empties.
   *
   * @param  {Array}  segments
   * @return {string}
   */
  concatenate (segments) {
    return Object.values(segments).filter((value) => {
      return String(value) !== ''
    }).join(' ')
  }

  /**
   * Format the where clause statements into one string.
   *
   * @param  {\Illuminate\Database\Query\Builder}  query
   * @param  {Array}  sql
   * @return {string}
   */
  concatenateWhereClauses (query, sql) {
    const conjunction = query instanceof JoinClause ? 'on' : 'where'

    return conjunction + ' ' + this.removeLeadingBoolean(sql.join(' '))
  }

  /**
   * Get the grammar specific operators.
   *
   * @return {Array}
   */
  getOperators () {
    return this.operators
  }

  isExecutable (query, property) {
    const subject = Reflect.get(query, property)

    if (subject === undefined || subject === '') {
      return false
    }

    if (Array.isArray(subject) && subject.length === 0) {
      return false
    }

    return true
  }

  /**
   * Determine if the given string is a JSON selector.
   *
   * @param  {string}  value
   * @return {boolean}
   */
  isJsonSelector (value) {
    return value.includes('->')
  }

  /**
   * Remove the leading boolean from a statement.
   *
   * @param  {string}  value
   * @return {string}
   */
  removeLeadingBoolean (value) {
    return value.replace(/and |or /i, '')
  }

  /**
   * Compile a where clause comparing two columns.
   *
   * @param  {\Illuminate\Database\Query\Builder}  query
   * @param  {Array}  where
   * @return {string}
   */
  whereColumn (query, where) {
    return this.wrap(where.first) + ' ' + where.operator + ' ' + this.wrap(where.second)
  }

  /**
   * Wrap a value in keyword identifiers.
   *
   * @param  {\Illuminate\Database\Query\Expression|string}  value
   * @param  {boolean}  prefixAlias
   * @return {string}
   */
  wrap (value, prefixAlias = false) {
    if (this.isExpression(value)) {
      return this.getValue(value)
    }

    // If the value being wrapped has a column alias we will need to separate out
    // the pieces so we can wrap each of the segments of the expression on its
    // own, and then join these both back together using the "as" connector.
    if (/\sas\s/i.test(value) !== false) {
      return this.wrapAliasedValue(value, prefixAlias)
    }

    // If the given value is a JSON selector we will wrap it differently than a
    // traditional value. We will need to split this path and wrap each part
    // wrapped, etc. Otherwise, we will simply wrap the value as a string.
    if (this.isJsonSelector(value)) {
      return this.wrapJsonSelector(value)
    }

    return this.wrapSegments(value.split('.'))
  }
}
