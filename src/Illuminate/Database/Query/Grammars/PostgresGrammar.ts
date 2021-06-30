import {isNumeric} from '@devnetic/utils';
import {reject} from 'lodash';

import {Arr, collect} from '../../../Collections';
import {Builder, WhereInterface} from '../Builder';
import {Grammar} from './Grammar';

export class PostgresGrammar extends Grammar {
  /**
   * Compile the "select *" portion of the query.
   *
   * @param  \Illuminate\Database\Query\Builder  query
   * @param  array  columns
   * @return string|null
   */
  protected compileColumns(
    query: Builder,
    columns: Array<any>
  ): string | undefined {
    // If the query is actually performing an aggregating select, we will let that
    // compiler handle the building of the select clauses, as it will need some
    // more syntax that is best handled by that to keep things neat.
    if (query.aggregateProperty) {
      return;
    }

    let select;

    if (Array.isArray(query.distinctProperty)) {
      select =
        'select distinct on (' +
        this.columnize(query.distinctProperty as Array<any>) +
        ') ';
    } else if (query.distinctProperty) {
      select = 'select distinct ';
    } else {
      select = 'select ';
    }

    return select + this.columnize(columns);
  }

  /**
   * Compile an insert and get ID statement into SQL.
   *
   * @param  \Illuminate\Database\Query\Builder  query
   * @param  Array<any> | any  values
   * @param  string  sequence
   * @return string
   */
  public compileInsertGetId(
    query: Builder,
    values: Array<any> | any,
    sequence: string
  ): string {
    return (
      this.compileInsert(query, values) +
      ' returning ' +
      this.wrap(sequence ?? 'id')
    );
  }

  /**
   * Compile an insert ignore statement into SQL.
   *
   * @param  \Illuminate\Database\Query\Builder  query
   * @param  Array<any> | any  values
   * @return string
   */
  public compileInsertOrIgnore(
    query: Builder,
    values: Array<any> | any
  ): string {
    return this.compileInsert(query, values) + ' on conflict do nothing';
  }

  /**
   * Compile an "upsert" statement into SQL.
   *
   * @param  \Illuminate\Database\Query\Builder  query
   * @param  Array<any>  values
   * @param  Array<any>  uniqueBy
   * @param  Array<any>  update
   * @return string
   */
  public compileUpsert(
    query: Builder,
    values: Array<any>,
    uniqueBy: Array<any>,
    update: Array<any>
  ): string {
    let sql = this.compileInsert(query, values);

    sql += ' on conflict (' + this.columnize(uniqueBy) + ') do update set ';

    const columns = collect(update)
      .map((value, key) => {
        return isNumeric(key)
          ? this.wrap(value) +
              ' = ' +
              this.wrapValue('excluded') +
              '.' +
              this.wrap(value)
          : this.wrap(key) + ' = ' + this.parameter(value);
      })
      .implode(', ');

    return sql + columns;
  }

  /**
   * Compile a date based where clause.
   *
   * @param  string  type
   * @param  \Illuminate\Database\Query\Builder  query
   * @param  WhereInterface  where
   * @return string
   */
  protected dateBasedWhere(
    type: string,
    query: Builder,
    where: WhereInterface
  ): string {
    const value = this.parameter(where.value);

    return (
      'extract(' +
      type +
      ' from ' +
      this.wrap((where as any).column) +
      ') ' +
      where['operator'] +
      ' ' +
      value
    );
  }

  /**
   * Prepare the bindings for an update statement.
   *
   * @param  Array<any>  bindings
   * @param  Array<any>  values
   * @return Array<any>
   */
  public prepareBindingsForUpdate(
    bindings: Array<any> | any,
    values: Array<any>
  ): Array<any> {
    values = collect(values)
      .map((value, column) => {
        return Array.isArray(value) ||
          (this.isJsonSelector(column) && !this.isExpression(value))
          ? JSON.stringify(value)
          : value;
      })
      .all();

    const cleanBindings = reject(bindings, 'select');

    return Object.values([...values, ...Arr.flatten(cleanBindings)]);
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
      return `${this.wrap((where as any).column)}::text ${
        where.operator
      } ${this.parameter(where.value)}`;
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

    return (
      this.wrap((where as any).column) +
      '::date ' +
      where.operator +
      ' ' +
      value
    );
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

    return (
      this.wrap((where as any).column) +
      '::time ' +
      where.operator +
      ' ' +
      value
    );
  }
}
