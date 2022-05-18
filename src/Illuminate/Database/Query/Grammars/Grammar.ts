import { capitalize, isTruthy } from '@devnetic/utils'

import { Aggregate, Builder, Order, Union } from '../Builder'
import { CompilesJsonPaths } from '../../Concerns/CompilesJsonPaths'
import { Expression } from '../Expression'
import { Grammar as BaseGrammar } from '../../Grammar'
import { JoinClause } from '..'
import { collect, end, reset } from '../../../Collections/helpers'
import { use } from '../../../Support/Traits/use'

export interface Grammar extends CompilesJsonPaths { }

// export type Where = Record<string, any>
export interface Where {
  column: string
  first: any
  not: boolean
  operator: string
  options: Record<string, any>
  query: Builder
  second: any
  sql: string
  value: any
  values: any[]
  columns: string[]
}

export class Grammar extends BaseGrammar {
  /**
 * The grammar specific operators.
 *
 * @var string[]
 */
  protected operators: string[] = []

  /**
   * The grammar specific bitwise operators.
   *
   * @var array
   */
  protected bitwiseOperators: string[] = []

  /**
   * The components that make up a select clause.
   *
   * @var string[]
   */
  protected selectComponents = [
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

  public constructor () {
    super()

    use(this.constructor, [CompilesJsonPaths])
  }

  /**
   * Compile an aggregated select clause.
   *
   * @param  {\Illuminate\Database\Query\Builder}  query
   * @param  {object}  aggregate
   * @return {string}
   */
  protected compileAggregate (query: Builder, aggregate: Aggregate): string {
    let column = this.columnize(aggregate.columns)

    // If the query has a "distinct" constraint and we're not asking for all columns
    // we need to prepend "distinct" onto the column name so that the query takes
    // it into account when it performs the aggregating operations on the data.
    if (Array.isArray(query.distinctProperty)) {
      column = 'distinct ' + this.columnize(query.distinctProperty)
    } else if (query.distinctProperty !== undefined && column !== '*') {
      column = 'distinct ' + column
    }

    return 'select ' + aggregate.function + '(' + column + ') as aggregate'
  }

  /**
   * Compile the "select *" portion of the query.
   *
   * @param  {\Illuminate\Database\Query\Builder}  query
   * @param  {Array}  columns
   * @return {string|undefined}
   */
  protected compileColumns (query: Builder, columns: Array<string | Expression>): string | undefined {
    // If the query is actually performing an aggregating select, we will let that
    // compiler handle the building of the select clauses, as it will need some
    // more syntax that is best handled by that function to keep things neat.
    if (query.aggregateProperty !== undefined) {
      return ''
    }

    const select = query.distinctProperty !== false ? 'select distinct ' : 'select '

    return select + this.columnize(columns)
  }

  /**
   * Compile the components necessary for a select clause.
   *
   * @param  {\Illuminate\Database\Query\Builder}  query
   * @return {Array}
   */
  protected compileComponents (query: Builder): Record<string, string> {
    const sql: Record<string, string> = {}

    for (const { name, property } of this.selectComponents) {
      if (this.isExecutable(query, property)) {
        const method: keyof this = 'compile' + capitalize(name) as keyof this

        sql[name] = (this[method] as any)(query, (query as any)[property])
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
  protected compileFrom (query: Builder, table: string): string {
    return 'from ' + this.wrapTable(table)
  }

  /**
   * Compile the "join" portions of the query.
   *
   * @param  {\Illuminate\Database\Query\Builder}  query
   * @param  {Builder[]}  joins
   * @return {string}
   */
  protected compileJoins (query: Builder, joins: any[]): string {
    return collect(joins).map((join: any) => {
      const table = this.wrapTable(join.table)

      const nestedJoins = join.joins.length === 0 ? '' : ' ' + this.compileJoins(query, join.joins)

      const tableAndNestedJoins = join.joins.length === 0 ? table : '(' + table + nestedJoins + ')'

      return `${join.type as string} join ${tableAndNestedJoins} ${this.compileWheres(join)}`.trim()
    }).implode(' ')
  }

  /**
   * Compile the "limit" portions of the query.
   *
   * @param  {\Illuminate\Database\Query\Builder}  query
   * @param  {number}  limit
   * @return {string}
   */
  protected compileLimit (query: Builder, limit: number): string {
    return `limit ${limit}`
  }

  /**
   * Compile the "offset" portions of the query.
   *
   * @param  {\Illuminate\Database\Query\Builder}  query
   * @param  {number}  offset
   * @return {string}
   */
  protected compileOffset (query: Builder, offset: number): string {
    return `offset ${offset}`
  }

  /**
   * Compile the "order by" portions of the query.
   *
   * @param  {\Illuminate\Database\Query\Builder}  query
   * @param  {Array}  orders
   * @return {string}
   */
  protected compileOrders (query: Builder, orders: Order[]): string {
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
  protected compileOrdersToArray (query: Builder, orders: Order[]): string[] {
    return orders.map((order) => {
      return order.sql ?? this.wrap(order.column as any) + ' ' + order.direction
    })
  }

  /**
   * Compile a select query into SQL.
   *
   * @param  {\Illuminate\Database\Query\Builder}  query
   * @return {string}
   */
  public compileSelect (query: Builder): string {
    if ((query.unions.length > 0 || query.havings.length > 0) && query.aggregateProperty !== undefined) {
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
  protected compileUnion (union: Union): string {
    const conjunction = union.all ? ' union all ' : ' union '

    return conjunction + this.wrapUnion(union.query.toSql())
  }

  /**
   * Compile a union aggregate query into SQL.
   *
   * @param  {\Illuminate\Database\Query\Builder}  query
   * @return {string}
   */
  protected compileUnionAggregate (query: Builder): string {
    const sql = this.compileAggregate(query, query.aggregateProperty as Aggregate)

    query.aggregateProperty = undefined

    return sql + ' from (' + this.compileSelect(query) + ') as ' + this.wrapTable('temp_table')
  }

  /**
   * Compile the "union" queries attached to the main query.
   *
   * @param  {\Illuminate\Database\Query\Builder}  query
   * @return {string}
   */
  protected compileUnions (query: Builder): string {
    let sql = ''

    for (const union of query.unions) {
      sql += this.compileUnion(union)
    }

    if (query.unionOrders.length > 0) {
      sql += ' ' + this.compileOrders(query, query.unionOrders)
    }

    if (query.unionLimit !== undefined) {
      sql += ' ' + this.compileLimit(query, query.unionLimit)
    }

    if (query.unionOffset !== undefined) {
      sql += ' ' + this.compileOffset(query, query.unionOffset)
    }

    return sql.trimStart()
  }

  /**
   * Compile the "where" portions of the query.
   *
   * @param  {\Illuminate\Database\Query\Builder}  query
   * @return {string}
   */
  public compileWheres (query: Builder): string {
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
  protected compileWheresToArray (query: Builder): any[] {
    return collect(query.wheres).map((where: Record<string, any>) => {
      const method = 'where' + (where.type as string) as keyof this

      return String(where.boolean) + ' ' + String((this[method] as any)(query, where))
    }).all()
  }

  /**
   * Concatenate an array of segments, removing empties.
   *
   * @param  {Record<string, string>}  segments
   * @return {string}
   */
  protected concatenate (segments: Record<string, string>): string {
    return Object.values(segments).filter((value) => {
      return String(value) !== ''
    }).join(' ')
  }

  /**
   * Format the where clause statements into one string.
   *
   * @param  {\Illuminate\Database\Query\Builder}  query
   * @param  {string[]}  sql
   * @return {string}
   */
  protected concatenateWhereClauses (query: Builder, sql: string[]): string {
    const conjunction: string = query instanceof JoinClause ? 'on' : 'where'

    return conjunction + ' ' + this.removeLeadingBoolean(sql.join(' '))
  }

  /**
   * Compile a date based where clause.
   *
   * @param  {string}  type
   * @param  {\Illuminate\Database\Query\Builder}  query
   * @param  {Record<string, string>}  where
   * @return {string}
   */
  protected dateBasedWhere (type: string, query: Builder, where: Where): string {
    const value: string = this.parameter(where.value)

    return type + '(' + this.wrap(where.column) + ') ' + String(where.operator) + ' ' + value
  }

  /**
   * Get the grammar specific operators.
   *
   * @return {Array}
   */
  public getOperators (): string[] {
    return this.operators
  }

  protected isExecutable (query: Builder, property: string): boolean {
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
   * Remove the leading boolean from a statement.
   *
   * @param  {string}  value
   * @return {string}
   */
  protected removeLeadingBoolean (value: string): string {
    return value.replace(/and |or /i, '')
  }

  /**
   * Compile a basic where clause.
   *
   * @param  {\Illuminate\Database\Query\Builder}  query
   * @param  {Record<string, any>}  where
   * @return {string}
   */
  protected whereBasic (query: Builder, where: Where): string {
    const value = this.parameter(where.value)

    const operator: string = where.operator.replace('?', '??')

    return this.wrap(where.column) + ' ' + operator + ' ' + value
  }

  /**
   * Compile a "between" where clause.
   *
   * @param  {\Illuminate\Database\Query\Builder}  query
   * @param  {Where}  where
   * @return {string}
   */
  protected whereBetween (query: Builder, where: Where): string {
    const between = isTruthy(where.not) ? 'not between' : 'between'

    const min = this.parameter(reset(where.values))

    const max = this.parameter(end(where.values))

    return this.wrap(where.column) + ' ' + between + ' ' + min + ' and ' + max
  }

  /**
   * Compile a "between" where clause.
   *
   * @param  {\Illuminate\Database\Query\Builder}  query
   * @param  {Where}  where
   * @return {string}
   */
  protected whereBetweenColumns (query: Builder, where: Where): string {
    const between = isTruthy(where.not) ? 'not between' : 'between'

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
  protected whereColumn (query: Builder, where: Where): string {
    return this.wrap(where.first) + ' ' + String(where.operator) + ' ' + this.wrap(where.second)
  }

  /**
   * Compile a "where date" clause.
   *
   * @param  {\Illuminate\Database\Query\Builder}  query
   * @param  {Array}  where
   * @return {string}
   */
  protected whereDate (query: Builder, where: Where): string {
    return this.dateBasedWhere('date', query, where)
  }

  /**
   * Compile a "where day" clause.
   *
   * @param  {\Illuminate\Database\Query\Builder}  query
   * @param  {Array}  where
   * @return {string}
   */
  protected whereDay (query: Builder, where: Where): string {
    return this.dateBasedWhere('day', query, where)
  }

  /**
   * Compile a "where fulltext" clause.
   *
   * @param  {\Illuminate\Database\Query\Builder}  query
   * @param  {Where}  where
   * @return {string}
   */
  protected whereFulltext (query: Builder, where: Where): string {
    throw new Error('RuntimeException: This database engine does not support fulltext search operations.')
  }

  /**
   * Compile a "where in" clause.
   *
   * @param  {\Illuminate\Database\Query\Builder}  query
   * @param  {Where}  where
   * @return {string}
   */
  protected whereIn (query: Builder, where: Where): string {
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
   * @param  {Where}  where
   * @return {string}
   */
  protected whereInRaw (query: Builder, where: Where): string {
    if (where.values?.length > 0) {
      return String(this.wrap(where.column)) + ' in (' + String(where.values.join(', ')) + ')'
    }

    return '0 = 1'
  }

  /**
   * Compile a "where month" clause.
   *
   * @param  {\Illuminate\Database\Query\Builder}  query
   * @param  {Record<string, string>}  where
   * @return {string}
   */
  protected whereMonth (query: Builder, where: Where): string {
    return this.dateBasedWhere('month', query, where)
  }

  /**
   * Compile a nested where clause.
   *
   * @param  {\Illuminate\Database\Query\Builder}  query
   * @param  {Where}  where
   * @return {string}
   */
  public whereNested (query: Builder, where: Where): string {
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
   * @param  {Where}  where
   * @return {string}
   */
  protected whereNotIn (query: Builder, where: Where): string {
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
   * @param  {Array}  Where
   * @return {string}
   */
  protected whereNotInRaw (query: Builder, where: Where): string {
    if (where.values?.length > 0) {
      return this.wrap(where.column) + ' not in (' + String(where.values.join(', ')) + ')'
    }

    return '1 = 1'
  }

  /**
   * Compile a raw where clause.
   *
   * @param  {\Illuminate\Database\Query\Builder}  query
   * @param  {Where}  where
   * @return {string}
   */
  protected whereRaw (query: Builder, where: Where): string {
    return where.sql
  }

  /**
   * Compile a "where time" clause.
   *
   * @param  {\Illuminate\Database\Query\Builder}  query
   * @param  {Array}  where
   * @return {string}
   */
  protected whereTime (query: Builder, where: Where): string {
    return this.dateBasedWhere('time', query, where)
  }

  /**
   * Wrap a union subquery in parentheses.
   *
   * @param  {string}  sql
   * @return {string}
   */
  protected wrapUnion (sql: string): string {
    return `(${sql})`
  }

  /**
   * Compile a "where year" clause.
   *
   * @param  {\Illuminate\Database\Query\Builder}  query
   * @param  {Record<string, string>}  where
   * @return {string}
   */
  protected whereYear (query: Builder, where: Where): string {
    return this.dateBasedWhere('year', query, where)
  }
}
