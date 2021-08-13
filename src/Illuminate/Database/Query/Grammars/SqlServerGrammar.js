import { clone, isBoolean, isString } from 'lodash'
import { isNumeric } from '@devnetic/utils'

import { Arr } from './../../../Collections/Arr'
import { Grammar } from './Grammar'
import { collect, last, reset } from './../../../Collections/helpers'

export class SqlServerGrammar extends Grammar {
  constructor () {
    super()

    /**
     * All of the available clause operators.
     *
     * @member {Array}
     */
    this.operators = [
      '=', '<', '>', '<=', '>=', '!<', '!>', '<>', '!=',
      'like', 'not like', 'ilike',
      '&', '&=', '|', '|=', '^', '^='
    ]
  }

  /**
   * Create a full ANSI offset clause for the query.
   *
   * @param  {\Illuminate\Database\Query\Builder}  query
   * @param  {object}  components
   * @return {string}
   */
  compileAnsiOffset (query, components) {
    // An ORDER BY clause is required to make this offset query work, so if one does
    // not exist we'll just create a dummy clause to trick the database and so it
    // does not complain about the queries for not having an "order by" clause.
    if (components.orders === undefined) {
      components.orders = 'order by (select 0)'
    }

    // We need to add the row number to the query so we can compare it to the offset
    // and limit values given for the statements. So we will add an expression to
    // the "select" that will give back the row numbers on each of the records.
    components.columns += this.compileOver(components.orders)

    components.orders = []

    if (this.queryOrderContainsSubquery(query)) {
      query.bindings = this.sortBindingsForSubqueryOrderBy(query)
    }

    // Next we need to calculate the constraints that should be placed on the query
    // to get the right offset and limit from our query but if there is no limit
    // set we will just handle the offset only since that is all that matters.
    const sql = this.concatenate(components)

    return this.compileTableExpression(sql, query)
  }

  /**
   * Compile the "select *" portion of the query.
   *
   * @param  {\Illuminate\Database\Query\Builder}  query
   * @param  {Array}  columns
   * @return {string|undefined}
   */
  compileColumns (query, columns) {
    if (query.aggregateProperty) {
      return
    }

    let select = query.distinctProperty ? 'select distinct ' : 'select '

    const limit = Number(query.limitProperty ?? 0)
    const offset = Number(query.offsetProperty ?? 0)

    // If there is a limit on the query, but not an offset, we will add the top
    // clause to the query, which serves as a "limit" type clause within the
    // SQL Server system similar to the limit keywords available in MySQL.
    if (isNumeric(query.limitProperty) && limit > 0 && offset <= 0) {
      select += `top ${limit} `
    }

    return select + this.columnize(columns)
  }

  /**
  * Compile a delete statement without joins into SQL.
  *
  * @param {\Illuminate\Database\Query\Builder} query
  * @param {string} table
  * @param {string} where
  * @return {string}
  */
  compileDeleteWithoutJoins (query, table, where) {
    const sql = super.compileDeleteWithoutJoins(query, table, where)

    return query.limitProperty !== undefined &&
      query.limitProperty > 0 &&
      (query.offsetProperty === undefined || query.offsetProperty <= 0)
      ? sql.replace('delete', 'delete top (' + query.limitProperty + ')')
      : sql
  }

  /**
   * Compile an exists statement into SQL.
   *
   * @param  {\Illuminate\Database\Query\Builder } query
   * @return {string}
   */
  compileExists (query) {
    const existsQuery = clone(query)

    existsQuery.columns = []

    return this.compileSelect(existsQuery.selectRaw('1 [exists]').limit(1))
  }

  /**
   * Compile the "from" portion of the query.
   *
   * @param  {\Illuminate\Database\Query\Builder}  query
   * @param  {string}  table
   * @return {string}
   */
  compileFrom (query, table) {
    const from = super.compileFrom(query, table)

    if (isString(query.lockProperty)) {
      return from + ' ' + query.lockProperty
    }

    if (query.lockProperty !== undefined) {
      return from + ' with(rowlock,' + (query.lockProperty ? 'updlock,' : '') + 'holdlock)'
    }

    return from
  }

  /**
   * Compile a "JSON contains" statement into SQL.
   *
   * @param  {string}  column
   * @param  {string}  value
   * @return {string}
   */
  compileJsonContains (column, value) {
    const [field, path] = this.wrapJsonFieldAndPath(column)

    return `${value} in (select [value] from openjson(${field}${path}))`
  }

  /**
   * Compile a "JSON length" statement into SQL.
   *
   * @param  {string}  column
   * @param  {string}  operator
   * @param  {string}  value
   * @return {string}
   */
  compileJsonLength (column, operator, value) {
    const [field, path] = this.wrapJsonFieldAndPath(column)

    return `(select count(*) from openjson(${field}${path})) ${operator} ${value}`
  }

  /**
   * Compile the "limit" portions of the query.
   *
   * @param  {\Illuminate\Database\Query\Builder}  query
   * @param  {number}  limit
   * @return {string}
   */
  compileLimit (query, limit) {
    return ''
  }

  /**
   * Compile the lock into SQL.
   *
   * @param  {\Illuminate\Database\Query\Builder}  query
   * @param  {boolean|string}  value
   * @return {string}
   */
  compileLock (query, value) {
    return ''
  }

  /**
   * Compile the "offset" portions of the query.
   *
   * @param  {\Illuminate\Database\Query\Builder}  query
   * @param  {number}  offset
   * @return {string}
   */
  compileOffset (query, offset) {
    return ''
  }

  /**
   * Compile the over statement for a table expression.
   *
   * @param  {string}  orderings
   * @return {string}
   */
  compileOver (orderings) {
    return `, row_number() over (${orderings}) as row_num`
  }

  /**
   * Compile the limit / offset row constraint for a query.
   *
   * @param  {\Illuminate\Database\Query\Builder}  query
   * @return {string}
   */
  compileRowConstraint (query) {
    const start = Number(query.offsetProperty) + 1

    if (Number(query.limitProperty) > 0) {
      const finish = Number(query.offsetProperty) + Number(query.limitProperty)

      return `between ${start} and ${finish}`
    }

    return `>= ${start}`
  }

  /**
   * Compile a select query into SQL.
   *
   * @param  {\Illuminate\Database\Query\Builder}  query
   * @return {string}
   */
  compileSelect (query) {
    if (!query.offsetProperty) {
      return super.compileSelect(query)
    }

    // If an offset is present on the query, we will need to wrap the query in
    // a big "ANSI" offset syntax block. This is very nasty compared to the
    // other database systems but is necessary for implementing features.
    if (query.columns.length === 0) {
      query.columns = ['*']
    }

    return this.compileAnsiOffset(
      query, this.compileComponents(query)
    )
  }

  /**
   * Compile a common table expression for a query.
   *
   * @param  {string}  sql
   * @param  {\Illuminate\Database\Query\Builder}  query
   * @return {string}
   */
  compileTableExpression (sql, query) {
    const constraint = this.compileRowConstraint(query)

    return `select * from (${sql}) as temp_table where row_num ${constraint} order by row_num`
  }

  /**
   * Compile an update statement with joins into SQL.
   *
   * @param  {\Illuminate\Database\Query\Builder}  query
   * @param  {string}  table
   * @param  {string}  columns
   * @param  {string}  where
   * @return {string}
   */
  compileUpdateWithJoins (query, table, columns, where) {
    const alias = last(table.split(' as '))

    const joins = this.compileJoins(query, query.joins)

    return `update ${alias} set ${columns} from ${table} ${joins} ${where}`
  }

  /**
   * Compile an "upsert" statement into SQL.
   *
   * @param  {\Illuminate\Database\Query\Builder}  query
   * @param  {Array}  values
   * @param  {Array}  uniqueBy
   * @param  {Array}  update
   * @return {string}
   */
  compileUpsert (query, values, uniqueBy, update) {
    const columns = this.columnize(Object.keys(reset(values)))

    let sql = 'merge ' + this.wrapTable(query.fromProperty) + ' '

    const parameters = collect(values).map((record) => {
      return '(' + this.parameterize(record) + ')'
    }).implode(', ')

    sql += 'using (values ' + parameters + ') ' + this.wrapTable('laravel_source') + ' (' + columns + ') '

    const on = collect(uniqueBy).map((column) => {
      return this.wrap('laravel_source.' + column) + ' = ' + this.wrap(query.fromProperty + '.' + column)
    }).implode(' and ')

    sql += 'on ' + on + ' '

    if (update.length > 0) {
      const updateSql = collect(update).map((value, key) => {
        return isNumeric(key)
          ? this.wrap(value) + ' = ' + this.wrap('laravel_source.' + value)
          : this.wrap(key) + ' = ' + this.parameter(value)
      }).implode(', ')

      sql += 'when matched then update set ' + updateSql + ' '
    }

    sql += 'when not matched then insert (' + columns + ') values (' + columns + ');'

    return sql
  }

  /**
   * Prepare the bindings for an update statement.
   *
   * @param  {Array}  bindings
   * @param  {Array}  values
   * @return {Array}
   */
  prepareBindingsForUpdate (bindings, values) {
    const cleanBindings = Arr.except(bindings, 'select')

    return Object.values(
      [...Object.values(values), ...Arr.flatten(cleanBindings)]
    )
  }

  /**
   * Prepare the binding for a "JSON contains" statement.
   *
   * @param  {*}  binding
   * @return {string}
   */
  prepareBindingForJsonContains (binding) {
    return isBoolean(binding) ? JSON.stringify(binding) : binding
  }

  /**
   * Determine if the query's order by clauses contain a subquery.
   *
   * @param  {\Illuminate\Database\Query\Builder}  query
   * @return {boolean}
   */
  queryOrderContainsSubquery (query) {
    if (!Array.isArray(query.orders)) {
      return false
    }

    return Arr.first(query.orders, (value) => {
      return this.isExpression(value.column ?? undefined)
    }, false) !== false
  }

  /**
   * Move the order bindings to be after the "select" statement to account for a order by subquery.
   *
   * @param  {\Illuminate\Database\Query\Builder}  query
   * @return {Array}
   */
  sortBindingsForSubqueryOrderBy (query) {
    return Arr.sort(query.bindings, (bindings, key) => {
      return ['select', 'order', 'from', 'join', 'where', 'groupBy', 'having', 'union', 'unionOrder'].indexOf(key)
    })
  }

  /**
   * Compile a "where date" clause.
   *
   * @param  {\Illuminate\Database\Query\Builder}  query
   * @param  {Array}  where
   * @return {string}
   */
  whereDate (query, where) {
    const value = this.parameter(where.value)

    return 'cast(' + this.wrap(where.column) + ' as date) ' + where.operator + ' ' + value
  }

  /**
   * Compile a "where time" clause.
   *
   * @param  {\Illuminate\Database\Query\Builder}  query
   * @param  {Array}  where
   * @return {string}
   */
  whereTime (query, where) {
    const value = this.parameter(where.value)

    return 'cast(' + this.wrap(where.column) + ' as time) ' + where.operator + ' ' + value
  }

  /**
   * Wrap the given JSON boolean value.
   *
   * @param  {string}  value
   * @return {string}
   */
  wrapJsonBooleanValue (value) {
    return `'${value}'`
  }

  /**
   * Wrap the given JSON selector.
   *
   * @param  {string}  value
   * @return {string}
   */
  wrapJsonSelector (value) {
    const [field, path] = this.wrapJsonFieldAndPath(value)

    return `json_value(${field}${path})`
  }

  /**
   * Wrap a table in keyword identifiers.
   *
   * @param  {\Illuminate\Database\Query\Expression|string}  table
   * @return {string}
   */
  wrapTable (table) {
    if (!this.isExpression(table)) {
      return this.wrapTableValuedFunction(super.wrapTable(table))
    }

    return this.getValue(table)
  }

  /**
   * Wrap a table in keyword identifiers.
   *
   * @param  {string}  table
   * @return {string}
   */
  wrapTableValuedFunction (table) {
    const matches = [...table.matchAll(/^(.+?)(\(.*?\))]/g)]
    if (matches.length > 0) {
      table = matches[0][1] + ']' + matches[0][2]
    }

    return table
  }

  /**
   * Wrap a union subquery in parentheses.
   *
   * @param  {string}  sql
   * @return {string}
   */
  wrapUnion (sql) {
    return 'select * from (' + sql + ') as ' + this.wrapTable('temp_table')
  }

  /**
   * Wrap a single string in keyword identifiers.
   *
   * @param  {string}  value
   * @return {string}
   */
  wrapValue (value) {
    return value === '*' ? value : '[' + value.replace(']', ']]') + ']'
  }
}
