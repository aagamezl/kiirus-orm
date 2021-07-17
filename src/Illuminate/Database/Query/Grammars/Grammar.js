import { capitalize } from 'lodash'

import { Grammar as BaseGrammar } from './../../Grammar'
import { JoinClause } from './../JoinClause'
import { collect, end, reset } from './../../../Collections/helpers'

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
   * Compile the "limit" portions of the query.
   *
   * @param  {\Illuminate\Database\Query\Builder}  query
   * @param  {number}  limit
   * @return {string}
   */
  compileLimit (query, limit) {
    return `limit ${limit}`
  }

  /**
   * Compile the "offset" portions of the query.
   *
   * @param  {\Illuminate\Database\Query\Builder}  query
   * @param  {number}  offset
   * @return {string}
   */
  compileOffset (query, offset) {
    return `offset ${offset}`
  }

  /**
   * Compile the "order by" portions of the query.
   *
   * @param  {\Illuminate\Database\Query\Builder}  query
   * @param  {Array}  orders
   * @return {string}
   */
  compileOrders (query, orders) {
    if (orders.length > 0) {
      return 'order by ' + this.compileOrdersToArray(query, orders).join(', ')
    }

    return ''
  }

  /**
   * Compile the query orders to an array.
   *
   * @param  {\Illuminate\Database\Query\Builder}  query
   * @param  {Array}  orders
   * @return {Array}
   */
  compileOrdersToArray (query, orders) {
    return orders.map((order) => {
      return order.sql ?? this.wrap(order.column) + ' ' + order.direction
    })
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
   * Compile a single union statement.
   *
   * @param  {Array}  union
   * @return {string}
   */
  compileUnion (union) {
    const conjunction = union.all ? ' union all ' : ' union '

    return conjunction + this.wrapUnion(union.query.toSql())
  }

  /**
   * Compile a union aggregate query into SQL.
   *
   * @param  {\Illuminate\Database\Query\Builder}  query
   * @return {string}
   */
  compileUnionAggregate (query) {
    const sql = this.compileAggregate(query, query.aggregateProperty)

    query.aggregateProperty = undefined

    return sql + ' from (' + this.compileSelect(query) + ') as ' + this.wrapTable('temp_table')
  }

  /**
   * Compile the "union" queries attached to the main query.
   *
   * @param  {\Illuminate\Database\Query\Builder}  query
   * @return {string}
   */
  compileUnions (query) {
    let sql = ''

    for (const union of query.unions) {
      sql += this.compileUnion(union)
    }

    if (query.unionOrders.length > 0) {
      sql += ' ' + this.compileOrders(query, query.unionOrders)
    }

    if (query.unionLimit) {
      sql += ' ' + this.compileLimit(query, query.unionLimit)
    }

    if (query.unionOffset) {
      sql += ' ' + this.compileOffset(query, query.unionOffset)
    }

    return sql.trimLeft()
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
   * Compile a date based where clause.
   *
   * @param  {string}  type
   * @param  {\Illuminate\Database\Query\Builder}  query
   * @param  {Array}  where
   * @return {string}
   */
  dateBasedWhere (type, query, where) {
    const value = this.parameter(where.value)

    return type + '(' + this.wrap(where.column) + ') ' + where.operator + ' ' + value
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
   * Compile a basic where clause.
   *
   * @param  {\Illuminate\Database\Query\Builder}  query
   * @param  {Array}  where
   * @return {string}
   */
  whereBasic (query, where) {
    const value = this.parameter(where.value)

    const operator = where.operator.replace('?', '??')

    return this.wrap(where.column) + ' ' + operator + ' ' + value
  }

  /**
   * Compile a "between" where clause.
   *
   * @param  {\Illuminate\Database\Query\Builder}  query
   * @param  {Array}  where
   * @return {string}
   */
  whereBetween (query, where) {
    const between = where.not ? 'not between' : 'between'

    const min = this.parameter(reset(where.values))

    const max = this.parameter(end(where.values))

    return this.wrap(where.column) + ' ' + between + ' ' + min + ' and ' + max
  }

  /**
   * Compile a "between" where clause.
   *
   * @param  {\Illuminate\Database\Query\Builder}  query
   * @param  {Array}  where
   * @return {string}
   */
  whereBetweenColumns (query, where) {
    const between = where.not ? 'not between' : 'between'

    const min = this.wrap(reset(where.values))

    const max = this.wrap(end(where.values))

    return this.wrap(where.column) + ' ' + between + ' ' + min + ' and ' + max
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
   * Compile a "where date" clause.
   *
   * @param  {\Illuminate\Database\Query\Builder}  query
   * @param  {Array}  where
   * @return {string}
   */
  whereDate (query, where) {
    return this.dateBasedWhere('date', query, where)
  }

  /**
   * Compile a "where day" clause.
   *
   * @param  {\Illuminate\Database\Query\Builder}  query
   * @param  {Array}  where
   * @return {string}
   */
  whereDay (query, where) {
    return this.dateBasedWhere('day', query, where)
  }

  /**
   * Compile a where exists clause.
   *
   * @param  {\Illuminate\Database\Query\Builder}  query
   * @param  {Array}  where
   * @return {string}
   */
  whereExists (query, where) {
    return 'exists (' + this.compileSelect(where.query) + ')'
  }

  /**
   * Compile a "where in" clause.
   *
   * @param  {\Illuminate\Database\Query\Builder}  query
   * @param  {Array}  where
   * @return {string}
   */
  whereIn (query, where) {
    if (where.values?.length > 0) {
      return this.wrap(where.column) + ' in (' + this.parameterize(where.values) + ')'
    }

    return '0 = 1'
  }

  /**
   * Compile a "where in raw" clause.
   *
   * For safety, whereIntegerInRaw ensures this method is only used with integer values.
   *
   * @param  {\Illuminate\Database\Query\Builder}  query
   * @param  {Array}  where
   * @return {string}
   */
  whereInRaw (query, where) {
    if (where.values?.length > 0) {
      return this.wrap(where.column) + ' in (' + where.values.join(', ') + ')'
    }

    return '0 = 1'
  }

  /**
   * Compile a "where month" clause.
   *
   * @param  {\Illuminate\Database\Query\Builder}  query
   * @param  {Array}  where
   * @return {string}
   */
  whereMonth (query, where) {
    return this.dateBasedWhere('month', query, where)
  }

  /**
   * Compile a nested where clause.
   *
   * @param  {\Illuminate\Database\Query\Builder}  query
   * @param  {Array}  where
   * @return {string}
   */
  whereNested (query, where) {
    // Here we will calculate what portion of the string we need to remove. If this
    // is a join clause query, we need to remove the "on" portion of the SQL and
    // if it is a normal query we need to take the leading "where" of queries.
    const offset = query instanceof JoinClause ? 3 : 6

    return '(' + this.compileWheres(where.query).substr(offset) + ')'
  }

  /**
   * Compile a "where not in" clause.
   *
   * @param  {\Illuminate\Database\Query\Builder}  query
   * @param  {Array}  where
   * @return {string}
   */
  whereNotIn (query, where) {
    if (where.values.length > 0) {
      return this.wrap(where.column) + ' not in (' + this.parameterize(where.values) + ')'
    }

    return '1 = 1'
  }

  /**
   * Compile a "where not in raw" clause.
   *
   * For safety, whereIntegerInRaw ensures this method is only used with integer values.
   *
   * @param  {\Illuminate\Database\Query\Builder}  query
   * @param  {Array}  where
   * @return {string}
   */
  whereNotInRaw (query, where) {
    if (where.values?.length > 0) {
      return this.wrap(where.column) + ' not in (' + where.values.join(', ') + ')'
    }

    return '1 = 1'
  }

  /**
   * Compile a raw where clause.
   *
   * @param  {\Illuminate\Database\Query\Builder}  query
   * @param  {Array}  where
   * @return {string}
   */
  whereRaw (query, where) {
    return String(where.sql)
  }

  /**
   * Compile a "where time" clause.
   *
   * @param  {\Illuminate\Database\Query\Builder}  query
   * @param  {Array}  where
   * @return {string}
   */
  whereTime (query, where) {
    return this.dateBasedWhere('time', query, where)
  }

  /**
   * Compile a "where year" clause.
   *
   * @param  {\Illuminate\Database\Query\Builder}  query
   * @param  {Array}  where
   * @return {string}
   */
  whereYear (query, where) {
    return this.dateBasedWhere('year', query, where)
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

  /**
   * Wrap a union subquery in parentheses.
   *
   * @param  {string}  sql
   * @return {string}
   */
  wrapUnion (sql) {
    return `(${sql})`
  }
}
