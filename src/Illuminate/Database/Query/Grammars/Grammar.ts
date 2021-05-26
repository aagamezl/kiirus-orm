import * as utils from '@devnetic/utils';

import { AggregateInterface, Builder, UnionInterface } from '../Builder';
import { Expression } from '../Expression';
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
    { name: 'unions', property: 'unions' },
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
    if (Array.isArray(query.distinct)) {
      column = 'distinct ' + this.columnize(query.distinct);
    } else if(query.distinct && column !== '*') {
      column = 'distinct ' + column;
    }

    return 'select ' + aggregate.function + '(' + column + ') as aggregate';
  }

  /**
   * Compile a select query into SQL.
   *
   * @param  \Illuminate\Database\Query\Builder  query
   * @return string
   */
  public compileSelect(query: Builder): string {
    if (query.unions.length > 0 && query.aggregateProperty) {
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

    const select = query.distinct ? 'select distinct ' : 'select ';

    return select + this.columnize(columns);
  }

  /**
   * Compile the components necessary for a select clause.
   *
   * @param  \Illuminate\Database\Query\Builder  query
   * @return array
   */
  protected compileComponents(query: Builder): Record<string, any> {
    const sql: Record<string, any> = {};

    for (const component of this.selectComponents) {
      const { name, property } = component as SelectComponentInterface;

      if (Reflect.has(query, property)) {
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
   * Compile the "limit" portions of the query.
   *
   * @param  \Illuminate\Database\Query\Builder  query
   * @param  number  limit
   * @return string
   */
  protected compileLimit(query: Builder, limit: number): string {
    return `limit {Number(limit)}`;
  }

  /**
   * Compile the "offset" portions of the query.
   *
   * @param  \Illuminate\Database\Query\Builder  query
   * @param  number  offset
   * @return string
   */
  protected compileOffset(query: Builder, offset: number) {
    return `offset {Number(offset)}`;
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
   * Determine if the given string is a JSON selector.
   *
   * @param  string  value
   * @return boolean
   */
  protected isJsonSelector(value: string): boolean {
    return value.includes('->');
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
    if (String(value).includes(' as ') !== false) {
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
