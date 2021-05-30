import { Builder, WhereInterface } from '../Builder';
import { Expression } from '../Expression';
import { Grammar } from './Grammar';

export class SqlServerGrammar extends Grammar {
  /**
   * All of the available clause operators.
   *
   * @var Aray<string>
   */
  protected operators = [
    '=', '<', '>', '<=', '>=', '!<', '!>', '<>', '!=',
    'like', 'not like', 'ilike',
    '&', '&=', '|', '|=', '^', '^=',
  ];

  /**
   * Create a full ANSI offset clause for the query.
   *
   * @param  \Illuminate\Database\Query\Builder  query
   * @param  array  components
   * @return string
   */
  protected compileAnsiOffset(query: Builder, components: Record<string, any>): string {
    // An ORDER BY clause is required to make this offset query work, so if one does
    // not exist we'll just create a dummy clause to trick the database and so it
    // does not complain about the queries for not having an "order by" clause.
    if (components.orders.length === 0) {
      components.orders = 'order by (select 0)';
    }

    // We need to add the row number to the query so we can compare it to the offset
    // and limit values given for the statements. So we will add an expression to
    // the "select" that will give back the row numbers on each of the records.
    components.columns += this.compileOver(components.orders);

    components.orders = [];

    // Next we need to calculate the constraints that should be placed on the query
    // to get the right offset and limit from our query but if there is no limit
    // set we will just handle the offset only since that is all that matters.
    const sql = this.concatenate(components);

    return this.compileTableExpression(sql, query);
  }

  /**
   * Compile the "limit" portions of the query.
   *
   * @param  \Illuminate\Database\Query\Builder  query
   * @param  number  limit
   * @return string
   */
  protected compileLimit(query: Builder, limit: number): string {
    return '';
  }

  /**
   * Compile the "offset" portions of the query.
   *
   * @param  \Illuminate\Database\Query\Builder  query
   * @param  number  offset
   * @return string
   */
  protected compileOffset(query: Builder, offset: number): string {
    return '';
  }

  /**
   * Compile the over statement for a table expression.
   *
   * @param  string  orderings
   * @return string
   */
  protected compileOver(orderings: string): string {
    return `, row_number() over (${orderings}) as row_num`;
  }

  /**
   * Compile the limit / offset row constraint for a query.
   *
   * @param  \Illuminate\Database\Query\Builder  query
   * @return string
   */
  protected compileRowConstraint(query: Builder): string {
    const start = Number(query.offsetProperty) + 1;

    if (Number(query.limitProperty) > 0) {
      const finish = Number(query.offsetProperty) + Number(query?.limitProperty);

      return `between ${start} and ${finish}`;
    }

    return `>= ${start}`;
  }

  /**
   * Compile a common table expression for a query.
   *
   * @param  string  $sql
   * @param  \Illuminate\Database\Query\Builder  $query
   * @return string
   */
  protected compileTableExpression(sql: string, query: Builder): string {
    const constraint = this.compileRowConstraint(query);

    return `select * from (${sql}) as temp_table where row_num ${constraint} order by row_num`;
  }

  /**
   * Compile a select query into SQL.
   *
   * @param  \Illuminate\Database\Query\Builder  query
   * @return string
   */
  public compileSelect(query: Builder): string {
    if (!query.offsetProperty) {
      return super.compileSelect(query);
    }

    // If an offset is present on the query, we will need to wrap the query in
    // a big "ANSI" offset syntax block. This is very nasty compared to the
    // other database systems but is necessary for implementing features.
    if (query.columns.length === 0) {
      query.columns = ['*'];
    }

    return this.compileAnsiOffset(
      query, this.compileComponents(query)
    );
  }

  /**
   * Compile a "where date" clause.
   *
   * @param  \Illuminate\Database\Query\Builder  query
   * @param  WhereInterface  where
   * @return string
   */
  protected whereDate(query: Builder, where: WhereInterface): string {
    const value = this.parameter(where.value);

    return 'cast(' + this.wrap((where as any).column) + ' as date) ' + where.operator + ' ' + value;
  }

  /**
   * Compile a "where time" clause.
   *
   * @param  \Illuminate\Database\Query\Builder  query
   * @param  WhereInterface  where
   * @return string
   */
  protected whereTime(query: Builder, where: WhereInterface): string {
    const value = this.parameter(where.value);

    return 'cast(' + this.wrap((where as any).column) + ' as time) ' + where.operator + ' ' + value;
  }

  /**
   * Wrap a table in keyword identifiers.
   *
   * @param  \Illuminate\Database\Query\Expression|string  table
   * @return string
   */
  public wrapTable(table: Expression | string): string {
    if (!this.isExpression(table)) {
      return this.wrapTableValuedFunction(super.wrapTable(table));
    }

    return this.getValue(table as Expression);
  }

  /**
   * Wrap a table in keyword identifiers.
   *
   * @param  string  table
   * @return string
   */
  protected wrapTableValuedFunction(table: string): string {
    const matches = [...table.matchAll(/^(.+?)(\(.*?\))]/g)];
    if (matches.length > 0) {
      table = matches[1] + ']' + matches[2];
    }

    return table;
  }

  /**
   * Wrap a union subquery in parentheses.
   *
   * @param  string  sql
   * @return string
   */
  protected wrapUnion(sql: string): string {
    return 'select * from (' + sql + ') as ' + this.wrapTable('temp_table');
  }

  /**
   * Wrap a single string in keyword identifiers.
   *
   * @param  string  value
   * @return string
   */
  protected wrapValue(value: string): string {
    return value === '*' ? value : '[' + value.replace(']', ']]') + ']';
  }
}
