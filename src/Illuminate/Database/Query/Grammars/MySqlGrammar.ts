import {isNumeric} from '@devnetic/utils';
import {isBoolean, isPlainObject} from 'lodash';
import {collect} from '../../../Collections';
import {Builder, WhereInterface} from '../Builder';
import {Grammar} from './Grammar';

export class MySqlGrammar extends Grammar {
  /**
   * The grammar specific operators.
   *
   * @var Array<string>
   */
  protected operators = ['sounds like'];

  /**
   * Compile an insert statement into SQL.
   *
   * @param  \Illuminate\Database\Query\Builder  query
   * @param  Array<any> | any  values
   * @return string
   */
  public compileInsert(query: Builder, values: Array<any> | any): string {
    if (values.length === 0) {
      values = [[]];
    }

    return super.compileInsert(query, values);
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
    return this.compileInsert(query, values).replace('insert', 'insert ignore');
  }

  /**
   * Prepare a JSON column being updated using the JSON_SET function.
   *
   * @param  string  key
   * @param  any  value
   * @return string
   */
  protected compileJsonUpdateColumn(key: string, value: any): string {
    if (isBoolean(value)) {
      value = value ? 'true' : 'false';
    } else if (Array.isArray(value)) {
      value = 'cast(? as json)';
    } else {
      value = this.parameter(value);
    }

    const [field, path] = this.wrapJsonFieldAndPath(key);

    return `${field} = json_set(${field}${path}, ${value})`;
  }

  /**
   * Compile the columns for an update statement.
   *
   * @param  \Illuminate\Database\Query\Builder  query
   * @param  values: Array<any>  values
   * @return string
   */
  protected compileUpdateColumns(query: Builder, values: Array<any>): string {
    return collect(values)
      .map(([key, value]) => {
        if (this.isJsonSelector(key)) {
          return this.compileJsonUpdateColumn(key, value);
        }

        return this.wrap(key) + ' = ' + this.parameter(value);
      })
      .join(', ');
  }

  /**
   * Compile an update statement without joins into SQL.
   *
   * @param  \Illuminate\Database\Query\Builder  query
   * @param  string  table
   * @param  string  columns
   * @param  string  where
   * @return string
   */
  protected compileUpdateWithoutJoins(
    query: Builder,
    table: string,
    columns: string,
    where: string
  ): string {
    let sql = super.compileUpdateWithoutJoins(query, table, columns, where);

    if (query.orders.length > 0) {
      sql += ' ' + this.compileOrders(query, query.orders);
    }

    if (query.limitProperty) {
      sql += ' ' + this.compileLimit(query, query.limitProperty);
    }

    return sql;
  }

  /**
   * Compile an "upsert" statement into SQL.
   *
   * @param  \Illuminate\Database\Query\Builder query
   * @param  Array<any>  values
   * @param  Array<any>  uniqueBy
   * @param  Array<any>  update
   * @return string
   *
   * @throws \RuntimeException
   */
  public compileUpsert(
    query: Builder,
    values: Array<any>,
    uniqueBy: Array<any>,
    update: Array<any>
  ): string {
    const sql = this.compileInsert(query, values) + ' on duplicate key update ';

    // const columns = collect(update).map(([key, value]) => {
    const columns = collect(update)
      .map((value, key) => {
        return isNumeric(key)
          ? this.wrap(value) + ' = values(' + this.wrap(value) + ')'
          : this.wrap(key) + ' = ' + this.parameter(value);
      })
      .implode(', ');

    return sql + columns;
  }

  /**
   * Prepare the bindings for an update statement.
   *
   * Booleans, integers, and doubles are inserted into JSON updates as raw values.
   *
   * @param  Array<any>  bindings
   * @param  Array<any>  values
   * @return Array<any>
   */
  public prepareBindingsForUpdate(
    bindings: Array<any> | any,
    values: Array<any>
  ): Array<any> {
    values = collect(Object.entries(values))
      .reject((value: any, column: any) => {
        return this.isJsonSelector(column) && isBoolean(value);
      })
      .map(([, value]: any) => {
        return isPlainObject(value) ? JSON.stringify(value) : value;
      })
      .all();

    return super.prepareBindingsForUpdate(bindings, values);
  }

  /**
   * Add a "where null" clause to the query.
   *
   * @param  \Illuminate\Database\Query\Builder  query
   * @param  WhereInterface  where
   * @return string
   */
  protected whereNull(query: Builder, where: WhereInterface): string {
    if (this.isJsonSelector((where as any).column)) {
      const [field, path] = this.wrapJsonFieldAndPath((where as any).column);

      return (
        '(json_extract(' +
        field +
        path +
        ') is null OR json_type(json_extract(' +
        field +
        path +
        ")) = 'NULL')"
      );
    }

    return super.whereNull(query, where);
  }

  /**
   * Add a "where not null" clause to the query.
   *
   * @param  \Illuminate\Database\Query\Builder  query
   * @param  WhereInterface  where
   * @return string
   */
  protected whereNotNull(query: Builder, where: WhereInterface): string {
    if (this.isJsonSelector((where as any).column)) {
      const [field, path] = this.wrapJsonFieldAndPath((where as any).column);

      return (
        '(json_extract(' +
        field +
        path +
        ') is not null AND json_type(json_extract(' +
        field +
        path +
        ")) != 'NULL')"
      );
    }

    return super.whereNotNull(query, where);
  }

  /**
   * Wrap the given JSON selector.
   *
   * @param  string  value
   * @return string
   */
  protected wrapJsonSelector(value: string): string {
    const [field, path] = this.wrapJsonFieldAndPath(value);

    return 'json_unquote(json_extract(' + field + path + '))';
  }

  /**
   * Wrap a single string in keyword identifiers.
   *
   * @param  string  value
   * @return string
   */
  protected wrapValue(value: string): string {
    return value === '*' ? value : '`' + value.replace('`', '``') + '`';
  }
}
