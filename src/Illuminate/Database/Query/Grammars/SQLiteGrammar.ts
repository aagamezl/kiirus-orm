import { isNumeric } from '@devnetic/utils';
import { reject, set as dataSet } from 'lodash';

import { Arr, collect } from '../../../Collections';
import { Str } from '../../../Support';
import { Builder, WhereInterface } from '../Builder';
import { Grammar } from './Grammar';

export class SQLiteGrammar extends Grammar {
  /**
   * All of the available clause operators.
   *
   * @var Array<string>
   */
  protected operators = [
    '=', '<', '>', '<=', '>=', '<>', '!=',
    'like', 'not like', 'ilike',
    '&', '|', '<<', '>>',
  ];

  /**
   * Compile an insert ignore statement into SQL.
   *
   * @param  \Illuminate\Database\Query\Builder  $query
   * @param  Array<any> | any  values
   * @return string
   */
  public compileInsertOrIgnore(query: Builder, values: Array<any> | any): string {
    return this.compileInsert(query, values).replace('insert', 'insert or ignore');
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
  public compileUpsert(query: Builder, values: Array<any>, uniqueBy: Array<any>, update: Array<any>): string {
    let sql = this.compileInsert(query, values);

    sql += ' on conflict (' + this.columnize(uniqueBy) + ') do update set ';

    const columns = collect(update).map((value, key) => {
      return isNumeric(key)
        ? this.wrap(value) + ' = ' + this.wrapValue('excluded') + '.' + this.wrap(value)
        : this.wrap(key) + ' = ' + this.parameter(value);
    }).implode(', ');

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
  protected dateBasedWhere(type: string, query: Builder, where: WhereInterface): string {
    const value = this.parameter(where['value']);

    return `strftime('${type}', ${this.wrap((where as any).column)}) ${where.operator} cast(${value} as text)`;
  }

  /**
   * Group the nested JSON columns.
   *
   * @param  Array<any>  values
   * @return Array<any>
   */
  protected groupJsonColumnsForUpdate(values: Array<any>): Array<any> {
    const groups: Array<string> = [];

    for (const [key, value] of Object.entries(values)) {
      if (this.isJsonSelector(key)) {
        dataSet(groups, Str.after(key, '.').replace('->', '.'), value);
      }
    }

    return groups;
  }

  /**
   * Prepare the bindings for an update statement.
   *
   * @param  Array<any>  bindings
   * @param  Array<any>  values
   * @return Array<any>
   */
  public prepareBindingsForUpdate(bindings: Array<any> | any, values: Array<any>): Array<any> {
    const groups = this.groupJsonColumnsForUpdate(values);

    values = collect(values).reject((value: any, key: any) => {
      return this.isJsonSelector(key);
    }).merge(groups).map((value: any) => {
      return Array.isArray(value) ? JSON.stringify(value) : value;
    }).all();

    const cleanBindings = reject(bindings, 'select');

    return Object.values(
      [...values, ...Arr.flatten(cleanBindings)]
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
    return this.dateBasedWhere('%Y-%m-%d', query, where);
  }

  /**
   * Compile a "where day" clause.
   *
   * @param  \Illuminate\Database\Query\Builder  query
   * @param  WhereInterface  where
   * @return string
   */
  protected whereDay(query: Builder, where: WhereInterface): string {
    return this.dateBasedWhere('%d', query, where);
  }

  /**
 * Compile a "where month" clause.
 *
 * @param  \Illuminate\Database\Query\Builder  query
 * @param  WhereInterface  where
 * @return string
 */
  protected whereMonth(query: Builder, where: WhereInterface): string {
    return this.dateBasedWhere('%m', query, where);
  }

  /**
   * Compile a "where time" clause.
   *
   * @param  \Illuminate\Database\Query\Builder  query
   * @param  WhereInterface  where
   * @return string
   */
  protected whereTime(query: Builder, where: WhereInterface): string {
    return this.dateBasedWhere('%H:%M:%S', query, where);
  }

  /**
   * Compile a "where year" clause.
   *
   * @param  \Illuminate\Database\Query\Builder  query
   * @param  WhereInterface  where
   * @return string
   */
  protected whereYear(query: Builder, where: WhereInterface): string {
    return this.dateBasedWhere('%Y', query, where);
  }

  /**
   * Wrap a union subquery in parentheses.
   *
   * @param  string  sql
   * @return string
   */
  protected wrapUnion(sql: string): string {
    return 'select * from (' + sql + ')';
  }
}
