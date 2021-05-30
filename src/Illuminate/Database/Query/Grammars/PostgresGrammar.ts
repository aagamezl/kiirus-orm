import { Builder, WhereInterface } from '../Builder';
import { Grammar } from './Grammar';

export class PostgresGrammar extends Grammar {
  /**
   * Compile the "select *" portion of the query.
   *
   * @param  \Illuminate\Database\Query\Builder  query
   * @param  array  columns
   * @return string|null
   */
  protected compileColumns(query: Builder, columns: Array<any>): string | undefined {
    // If the query is actually performing an aggregating select, we will let that
    // compiler handle the building of the select clauses, as it will need some
    // more syntax that is best handled by that to keep things neat.
    if (query.aggregateProperty) {
      return;
    }

    let select;

    if (Array.isArray(query.distinctProperty)) {
      select = 'select distinct on (' + this.columnize(query.distinctProperty as Array<any>) + ') ';
    } else if(query.distinctProperty) {
      select = 'select distinct ';
    } else {
      select = 'select ';
    }

    return select + this.columnize(columns);
  }

  /**
   * Compile a date based where clause.
   *
   * @param  string  type
   * @param  \Illuminate\Database\Query\Builder  query
   * @param  WhereInterface  where
   * @return string
   */
  protected dateBasedWhere(type: string, query: Builder, where: WhereInterface): string {
    const value = this.parameter(where.value);

    return 'extract(' + type + ' from ' + this.wrap((where as any).column) + ') ' + where['operator'] + ' ' + value;
  }

  /**
   * {@inheritdoc}
   *
   * @param  \Illuminate\Database\Query\Builder  query
   * @param  WhereInterface  where
   * @return string
   */
  protected whereBasic(query: Builder, where: WhereInterface): string {
    if (where.operator?.toLowerCase().includes('like')) {
      return `${this.wrap((where as any).column)}::text ${where.operator} ${this.parameter(where.value)}`;
    }

    return super.whereBasic(query, where);
  }

  /**
   * Compile a "where date" clause.
   *
   * @param  \Illuminate\Database\Query\Builder  query
   * @param  WhereInterface  where
   * @return string
   */
  protected whereDate(query: Builder, where: WhereInterface) {
    const value = this.parameter(where.value);

    return this.wrap((where as any).column) + '::date ' + where.operator + ' ' + value;
  }

  /**
   * Compile a "where time" clause.
   *
   * @param  \Illuminate\Database\Query\Builder  query
   * @param  WhereInterface  where
   * @return string
   */
  protected whereTime(query: Builder, where: WhereInterface) {
    const value = this.parameter(where['value']);

    return this.wrap((where as any).column) + '::time ' + where.operator + ' ' + value;
  }
}
