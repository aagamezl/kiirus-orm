import * as utils from '@devnetic/utils';
import { collect, end, head, last, reset } from '../../../Collections/Helpers';

import {
  AggregateInterface,
  Builder,
  UnionInterface,
  WhereInterface
} from '../Builder';
import { Expression } from '../Expression';
import { JoinClause, TJoinClause } from '../JoinClause';
import { Grammar as BaseGrammar } from './../../';

interface SelectComponentInterface {
  name: string;
  property: string;
}

export class Grammar extends BaseGrammar {
  /**
   * The grammar specific operators.
   *
   * @var array
   */
  protected operators: Array<any> = [];

  /**
   * The components that make up a select clause.
   *
   * @var string[]
   */
  protected selectComponents: Array<string | SelectComponentInterface> = [
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
  ];

  /**
   * Compile an aggregated select clause.
   *
   * @param  \Illuminate\Database\Query\Builder  query
   * @param  array  aggregate
   * @return string
   */
  protected compileAggregate(query: Builder, aggregate: AggregateInterface) {
    let column = this.columnize(aggregate.columns);

    // If the query has a "distinct" constraint and we're not asking for all columns
    // we need to prepend "distinct" onto the column name so that the query takes
    // it into account when it performs the aggregating operations on the data.
    if (Array.isArray(query.distinctProperty)) {
      column = 'distinct ' + this.columnize(query.distinctProperty as Array<any>);
    } else if(query.distinctProperty && column !== '*') {
      column = 'distinct ' + column;
    }

    return 'select ' + aggregate.function + '(' + column + ') as aggregate';
  }

  /**
   * Compile a basic having clause.
   *
   * @param  Record<string, any>  having
   * @return string
   */
  protected compileBasicHaving(having: Record<string, any>): string {
    const column = this.wrap(having.column);

    const parameter = this.parameter(having.value);

    return having.boolean + ' ' + column + ' ' + having.operator + ' ' + parameter;
  }

  /**
   * Compile the "select *" portion of the query.
   *
   * @param  \Illuminate\Database\Query\Builder  query
   * @param  array  columns
   * @return string|null
   */
  protected compileColumns(query: Builder, columns: Array<any>) {
    // If the query is actually performing an aggregating select, we will let that
    // compiler handle the building of the select clauses, as it will need some
    // more syntax that is best handled by that function to keep things neat.
    if (query.aggregateProperty) {
      return;
    }

    const select = query.distinctProperty ? 'select distinct ' : 'select ';

    return select + this.columnize(columns);
  }

  /**
   * Compile the components necessary for a select clause.
   *
   * @param  \Illuminate\Database\Query\Builder  query
   * @return Record<string, any>
   */
  protected compileComponents(query: Builder): Record<string, any> {
    const sql: Record<string, any> = {};

    for (const component of this.selectComponents) {
      const { name, property } = component as SelectComponentInterface;

      if (this.isExecutable(query, property)) {
        const method = 'compile' + utils.titleCase(name);

        sql[name] = (this as any)[method](query, (query as any)[property]);
      }
    }

    return sql;
  }

  /**
   * Compile the "from" portion of the query.
   *
   * @param  \Illuminate\Database\Query\Builder  query
   * @param  string  table
   * @return string
   */
  protected compileFrom(query: Builder, table: string) {
    return 'from ' + this.wrapTable(table);
  }

  /**
   * Compile the "group by" portions of the query.
   *
   * @param  \Illuminate\Database\Query\Builder  query
   * @param  Array<any>  groups
   * @return string
   */
  protected compileGroups(query: Builder, groups: Array<any>): string {
    return 'group by ' + this.columnize(groups);
  }

  /**
   * Compile a single having clause.
   *
   * @param  array  having
   * @return string
   */
  protected compileHaving(having: Record<string, string>): string {
    // If the having clause is "raw", we can just return the clause straight away
    // without doing any more processing on it. Otherwise, we will compile the
    // clause into SQL based on the components that make it up from builder.
    if (having.type === 'Raw') {
      return having.boolean + ' ' + having.sql;
    } else if(having.type === 'between') {
      return this.compileHavingBetween(having);
    }

    return this.compileBasicHaving(having);
  }

  /**
   * Compile a "between" having clause.
   *
   * @param  array  having
   * @return string
   */
  protected compileHavingBetween(having: Record<string, any>): string {
    const between = having.not ? 'not between' : 'between';

    const column = this.wrap(having['column']);

    const min = this.parameter(head(having.values));

    const max = this.parameter(last(having.values));

    return having.boolean + ' ' + column + ' ' + between + ' ' + min + ' and ' + max;
  }

  /**
   * Compile the "having" portions of the query.
   *
   * @param  \Illuminate\Database\Query\Builder  query
   * @param  Array<any>  havings
   * @return string
   */
  protected compileHavings(query: Builder, havings: Array<any>): string {
    const sql = havings.map(having => this.compileHaving(having)).join(' ');

    return sql ? 'having ' + this.removeLeadingBoolean(sql) : '';
  }

  /**
   * Compile the "join" portions of the query.
   *
   * @param  \Illuminate\Database\Query\Builder  query
   * @param  array  joins
   * @return string
   */
  protected compileJoins(query: Builder, joins: Array<any>) {
    return collect(joins).map((join: TJoinClause) => {
      const table = this.wrapTable(join.table);

      const nestedJoins: string = join.joins.length === 0 ? '' : ' ' + this.compileJoins(query, join.joins);

      const tableAndNestedJoins = join.joins.length === 0 ? table : '(' + table + nestedJoins + ')';

      return `${join.type} join ${tableAndNestedJoins} ${this.compileWheres(join as unknown as Builder)}`.trim();
    }).implode(' ');
  }

  /**
   * Compile the "limit" portions of the query.
   *
   * @param  \Illuminate\Database\Query\Builder  query
   * @param  number  limit
   * @return string
   */
  protected compileLimit(query: Builder, limit: number): string {
    return `limit ${limit}`;
  }

  /**
   * Compile the "offset" portions of the query.
   *
   * @param  \Illuminate\Database\Query\Builder  query
   * @param  number  offset
   * @return string
   */
  protected compileOffset(query: Builder, offset: number) {
    return `offset ${offset}`;
  }

  /**
   * Compile the "order by" portions of the query.
   *
   * @param  \Illuminate\Database\Query\Builder  query
   * @param  array  orders
   * @return string
   */
  protected compileOrders(query: Builder, orders: Array<any>): string {
    if (orders.length > 0) {
      return 'order by ' + this.compileOrdersToArray(query, orders).join(', ');
    }

    return '';
  }

  /**
   * Compile the query orders to an array.
   *
   * @param  \Illuminate\Database\Query\Builder  query
   * @param  array  orders
   * @return array
   */
  protected compileOrdersToArray(query: Builder, orders: Array<any>): Array<any> {
    return orders.map((order) => {
      return order['sql'] ?? this.wrap(order['column']) + ' ' + order['direction'];
    });
  }

  /**
   * Compile a select query into SQL.
   *
   * @param  \Illuminate\Database\Query\Builder  query
   * @return string
   */
  public compileSelect(query: Builder): string {
    if ((query.unions.length > 0 || query.havings.length > 0) && query.aggregateProperty) {
      return this.compileUnionAggregate(query);
    }

    // If the query does not have any columns set, we'll set the columns to the
    // * character to just get all of the columns from the database. Then we
    // can build the query and concatenate all the pieces together as one.
    const original = query.columns;

    if (query.columns.length === 0) {
      query.columns = ['*'];
    }

    // To compile the query, we'll spin through each component of the query and
    // see if that component exists. If it does we'll just call the compiler
    // function for the component which is responsible for making the SQL.
    let sql = this.concatenate(this.compileComponents(query)).trim();

    if (query.unions.length > 0) {
      sql = this.wrapUnion(sql) + ' ' + this.compileUnions(query);
    }

    query.columns = original;

    return sql;
  }

  /**
   * Compile a single union statement.
   *
   * @param  array  union
   * @return string
   */
  protected compileUnion(union: UnionInterface) {
    const conjunction = union.all ? ' union all ' : ' union ';

    return conjunction + this.wrapUnion(union.query.toSql());
  }

  /**
   * Compile a union aggregate query into SQL.
   *
   * @param  \Illuminate\Database\Query\Builder  query
   * @return string
   */
  protected compileUnionAggregate(query: Builder) {
    const sql = this.compileAggregate(query, query.aggregateProperty as AggregateInterface);

    query.aggregateProperty = undefined;

    return sql + ' from (' + this.compileSelect(query) + ') as ' + this.wrapTable('temp_table');
  }

  /**
   * Compile the "union" queries attached to the main query.
   *
   * @param  \Illuminate\Database\Query\Builder  query
   * @return string
   */
  protected compileUnions(query: Builder) {
    let sql = '';

    for (const union of query.unions) {
      sql += this.compileUnion(union);
    }

    if (query.unionOrders.length > 0) {
      sql += ' ' + this.compileOrders(query, query.unionOrders);
    }

    if (query.unionLimit) {
      sql += ' ' + this.compileLimit(query, query.unionLimit);
    }

    if (query.unionOffset) {
      sql += ' ' + this.compileOffset(query, query.unionOffset);
    }

    return sql.trimLeft();
  }

  /**
   * Compile the "where" portions of the query.
   *
   * @param  \Illuminate\Database\Query\Builder  query
   * @return string
   */
  public compileWheres(query: Builder) {
    // Each type of where clauses has its own compiler function which is responsible
    // for actually creating the where clauses SQL. This helps keep the code nice
    // and maintainable since each clause has a very small method that it uses.
    if (query.wheres.length === 0) {
      return '';
    }

    // If we actually have some where clauses, we will strip off the first boolean
    // operator, which is added by the query builders for convenience so we can
    // avoid checking for the first clauses in each of the compilers methods.
    const sql = this.compileWheresToArray(query);

    if (sql.length > 0) {
      return this.concatenateWhereClauses(query, sql);
    }

    return '';
  }

  /**
   * Get an array of all the where clauses for the query.
   *
   * @param  \Illuminate\Database\Query\Builder  query
   * @return array
   */
  protected compileWheresToArray(query: Builder): Array<any> {
    return collect(query.wheres).map((where) => {
      return where.boolean + ' ' + (this as any)[`where${where.type}`](query, where);
    }).all();
  }

  /**
   * Concatenate an array of segments, removing empties.
   *
   * @param  array  segments
   * @return string
   */
  protected concatenate(segments: Record<string, any>): string {
    return Object.values(segments).filter((value) => {
      return String(value) !== '';
    }).join(' ');
  }

  /**
   * Format the where clause statements into one string.
   *
   * @param  \Illuminate\Database\Query\Builder  query
   * @param  array  sql
   * @return string
   */
  protected concatenateWhereClauses(query: Builder, sql: Array<any>): string {
    const conjunction = query instanceof JoinClause ? 'on' : 'where';

    return conjunction + ' ' + this.removeLeadingBoolean(sql.join(' '));
  }

  /**
   * Compile a date based where clause.
   *
   * @param  string  type
   * @param  \Illuminate\Database\Query\Builder  query
   * @param  array  where
   * @return string
   */
  protected dateBasedWhere(type: string, query: Builder, where: WhereInterface): string {
    const value = this.parameter(where.value);

    return type + '(' + this.wrap(where.column as Expression | string) + ') ' + where.operator + ' ' + value;
  }

  /**
   * Get the grammar specific operators.
   *
   * @return array
   */
  public getOperators(): Array<any> {
    return this.operators;
  }

  protected isExecutable(query: Builder, property: string): boolean {
    const subject = Reflect.get(query, property);

    if (!subject) {
      return false;
    }

    if (Array.isArray(subject) && subject.length === 0) {
      return false;
    }

    return true;
  }

  /**
   * Determine if the given string is a JSON selector.
   *
   * @param  string  value
   * @return boolean
   */
  protected isJsonSelector(value: string): boolean {
    return value.includes('->');
  }

  /**
   * Remove the leading boolean from a statement.
   *
   * @param  string  value
   * @return string
   */
  protected removeLeadingBoolean(value: string): string {
    return value.replace(/and |or /i, '');
  }

  /**
   * Compile a basic where clause.
   *
   * @param  \Illuminate\Database\Query\Builder  query
   * @param  array  where
   * @return string
   */
  protected whereBasic(query: Builder, where: WhereInterface): string {
    const value = this.parameter(where['value']);

    const operator = (where as any)['operator'].replace('?', '??');

    return this.wrap((where as any)['column']) + ' ' + operator + ' ' + value;
  }

  /**
   * Compile a "between" where clause.
   *
   * @param  \Illuminate\Database\Query\Builder  query
   * @param  WhereInterface  where
   * @return string
   */
  protected whereBetween(query: Builder, where: WhereInterface) {
    const between = where['not'] ? 'not between' : 'between';

    const min = this.parameter(reset((where as any).values));

    const max = this.parameter(end((where as any).values));

    return this.wrap((where as any).column) + ' ' + between + ' ' + min + ' and ' + max;
  }

  /**
   * Compile a "between" where clause.
   *
   * @param  \Illuminate\Database\Query\Builder  query
   * @param  array  where
   * @return string
   */
  protected whereBetweenColumns(query: Builder, where: WhereInterface): string {
    const between = where['not'] ? 'not between' : 'between';

    const min = this.wrap(reset((where as any).values));

    const max = this.wrap(end((where as any).values));

    return this.wrap((where as any).column) + ' ' + between + ' ' + min + ' and ' + max;
  }

  /**
   * Compile a where clause comparing two columns.
   *
   * @param  \Illuminate\Database\Query\Builder  query
   * @param  array  where
   * @return string
   */
  protected whereColumn(query: Builder, where: WhereInterface): string {
    return this.wrap((where as any)['first']) + ' ' + where['operator'] + ' ' + this.wrap((where as any)['second']);
  }

  /**
   * Compile a "where date" clause.
   *
   * @param  \Illuminate\Database\Query\Builder  query
   * @param  WhereInterface  where
   * @return string
   */
  protected whereDate(query: Builder, where: WhereInterface): string {
    return this.dateBasedWhere('date', query, where);
  }

  /**
   * Compile a "where day" clause.
   *
   * @param  \Illuminate\Database\Query\Builder  query
   * @param  array  where
   * @return string
   */
  protected whereDay(query: Builder, where: WhereInterface): string {
    return this.dateBasedWhere('day', query, where);
  }

  /**
   * Compile a "where in" clause.
   *
   * @param  \Illuminate\Database\Query\Builder  query
   * @param  WhereInterface  where
   * @return string
   */
  protected whereIn(query: Builder, where: WhereInterface): string {
    if ((where as any).values?.length > 0) {
      return this.wrap((where as any).column) + ' in (' + this.parameterize((where as any).values) + ')';
    }

    return '0 = 1';
  }

  /**
   * Compile a "where in raw" clause.
   *
   * For safety, whereIntegerInRaw ensures this method is only used with integer values.
   *
   * @param  \Illuminate\Database\Query\Builder  query
   * @param  WhereInterface  where
   * @return string
   */
  protected whereInRaw(query: Builder, where: WhereInterface): string {
    if ((where as any).values?.length > 0) {
      return this.wrap((where as any).column) + ' in (' + (where as any).values.join(', ') + ')';
    }

    return '0 = 1';
  }

  /**
   * Compile a "where month" clause.
   *
   * @param  \Illuminate\Database\Query\Builder  query
   * @param  array  where
   * @return string
   */
  protected whereMonth(query: Builder, where: WhereInterface): string {
    return this.dateBasedWhere('month', query, where);
  }

  /**
   * Compile a nested where clause.
   *
   * @param  \Illuminate\Database\Query\Builder  query
   * @param  WhereInterface  where
   * @return string
   */
  protected whereNested(query: Builder, where: WhereInterface) {
    // Here we will calculate what portion of the string we need to remove. If this
    // is a join clause query, we need to remove the "on" portion of the SQL and
    // if it is a normal query we need to take the leading "where" of queries.
    const offset = query instanceof JoinClause ? 3 : 6;

    return '(' + this.compileWheres((where as any).query).substr(offset) + ')';
  }

  /**
   * Compile a "where not in" clause.
   *
   * @param  \Illuminate\Database\Query\Builder  query
   * @param  WhereInterface  where
   * @return string
   */
  protected whereNotIn(query: Builder, where: WhereInterface): string {
    if ((where as any).values.length > 0) {
      return this.wrap((where as any).column) + ' not in (' + this.parameterize((where as any).values) + ')';
    }

    return '1 = 1';
  }

  /**
   * Compile a "where not in raw" clause.
   *
   * For safety, whereIntegerInRaw ensures this method is only used with integer values.
   *
   * @param  \Illuminate\Database\Query\Builder  query
   * @param  WhereInterface  where
   * @return string
   */
  protected whereNotInRaw(query: Builder, where: WhereInterface): string {
    if ((where as any).values?.length > 0) {
      return this.wrap((where as any).column) + ' not in (' + (where as any).values.join(', ') + ')';
    }

    return '1 = 1';
  }

  /**
   * Compile a "where not null" clause.
   *
   * @param  \Illuminate\Database\Query\Builder  query
   * @param  WhereInterface  where
   * @return string
   */
  protected whereNotNull(query: Builder, where: WhereInterface): string {
    return this.wrap((where as any).column) + ' is not null';
  }

  /**
   * Compile a "where null" clause.
   *
   * @param  \Illuminate\Database\Query\Builder  query
   * @param  WhereInterface  where
   * @return string
   */
  protected whereNull(query: Builder, where: WhereInterface): string {
    return this.wrap((where as any).column) + ' is null';
  }

  /**
   * Compile a raw where clause.
   *
   * @param  \Illuminate\Database\Query\Builder  query
   * @param  array  where
   * @return string
   */
  protected whereRaw(query: Builder, where: WhereInterface): string {
    return String(where.sql);
  }

  /**
   * Compile a "where time" clause.
   *
   * @param  \Illuminate\Database\Query\Builder  query
   * @param  WhereInterface  where
   * @return string
   */
  protected whereTime(query: Builder, where: WhereInterface): string {
    return this.dateBasedWhere('time', query, where);
  }

  /**
   * Compile a "where year" clause.
   *
   * @param  \Illuminate\Database\Query\Builder  query
   * @param  array  where
   * @return string
   */
  protected whereYear(query: Builder, where: WhereInterface): string {
    return this.dateBasedWhere('year', query, where);
  }

  /**
   * Wrap a value in keyword identifiers.
   *
   * @param  Expression|string  value
   * @param  [boolean]  prefixAlias
   * @return string
   */
  public wrap(value: Expression | string, prefixAlias: boolean = false): string {
    if (this.isExpression(value)) {
      return this.getValue(value as Expression);
    }

    // If the value being wrapped has a column alias we will need to separate out
    // the pieces so we can wrap each of the segments of the expression on its
    // own, and then join these both back together using the "as" connector.
    // if (String(value).includes(' as ') !== false) {
    if (/\sAS\s/i.test(String(value)) !== false) {
      return this.wrapAliasedValue(String(value), prefixAlias);
    }

    // If the given value is a JSON selector we will wrap it differently than a
    // traditional value. We will need to split this path and wrap each part
    // wrapped, etc. Otherwise, we will simply wrap the value as a string.
    if (this.isJsonSelector(String(value))) {
      return this.wrapJsonSelector(String(value));
    }

    return this.wrapSegments(String(value).split('.'));
  }

  /**
   * Split the given JSON selector into the field and the optional path and wrap them separately.
   *
   * @param  string  column
   * @return array
   */
  protected wrapJsonFieldAndPath(column: string): Array<string> {
    const parts = column.split('->', 2);

    const field = this.wrap(parts[0]);

    const path = parts.length > 1 ? ', ' + this.wrapJsonPath(parts[1], '->') : '';

    return [field, path];
  }

  /**
   * Wrap the given JSON path.
   *
   * @param  string  value
   * @param  string  delimiter
   * @return string
   */
  protected wrapJsonPath(value: string, delimiter: string = '->'): string {
    value = value.replace(/([\\\\]+)?\\'/, `''`);

    return '\'$."' + value.replace(delimiter, '"."') + '"\'';
  }

  /**
   * Wrap the given JSON selector.
   *
   * @param  string  value
   * @return string
   *
   * @throws \RuntimeException
   */
  protected wrapJsonSelector(value: string): string {
    throw new Error('RuntimeException: This database engine does not support JSON operations.');
  }

  /**
   * Wrap a union subquery in parentheses.
   *
   * @param  string  sql
   * @return string
   */
  protected wrapUnion(sql: string): string {
    return `(${sql})`;
  }
}
