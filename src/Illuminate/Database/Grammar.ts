import { collect } from '../Collections/Helpers';
import { Expression } from './Query/Expression';

export abstract class Grammar {
  /**
   * The grammar table prefix.
   *
   * @var string
   */
  protected tablePrefix: string = '';

  /**
   * Convert an array of column names into a delimited string.
   *
   * @param  array  columns
   * @return string
   */
  public columnize(columns: Array<any>): string {
    return columns.map(column => this.wrap(column)).join(', ');
  }

  /**
   * Get the value of a raw expression.
   *
   * @param  \Illuminate\Database\Query\Expression  expression
   * @return string
   */
  public getValue(expression: Expression): string {
    return expression.getValue();
  }

  /**
   * Determine if the given value is a raw expression.
   *
   * @param  unknown  value
   * @return bool
   */
  public isExpression(value: unknown): boolean {
    return value instanceof Expression;
  }

  /**
   * Get the appropriate query parameter place-holder for a value.
   *
   * @param  any  value
   * @return string
   */
  public parameter(value: any): string {
    return this.isExpression(value) ? this.getValue(value) : '?';
  }

  /**
   * Create query parameter place-holders for an array.
   *
   * @param  Array<any>  values
   * @return string
   */
  public parameterize(values: Array<any>): string {
    return values.map((value) => this.parameter(value)).join(', ');
  }

  /**
   * Set the grammar's table prefix.
   *
   * @param  string  prefix
   * @return this
   */
  public setTablePrefix(prefix: string): this {
    this.tablePrefix = prefix;

    return this;
  }

  /**
   * Wrap a value in keyword identifiers.
   *
   * @param  \Illuminate\Database\Query\Expression|string  value
   * @param  boolean  prefixAlias
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

    return this.wrapSegments(String(value).split('.'));
  }

  /**
   * Wrap a value that has an alias.
   *
   * @param  string  value
   * @param  boolean  prefixAlias
   * @return string
   */
  protected wrapAliasedValue(value: string, prefixAlias: boolean = false): string {
    const segments = value.split(/\s+as\s+/i);

    // If we are wrapping a table we need to prefix the alias with the table prefix
    // as well in order to generate proper syntax. If this is a column of course
    // no prefix is necessary. The condition will be true when from wrapTable.
    if (prefixAlias) {
      segments[1] = this.tablePrefix + segments[1];
    }

    return this.wrap(segments[0]) + ' as ' + this.wrapValue(segments[1]);
  }

  /**
   * Wrap the given value segments.
   *
   * @param  array  segments
   * @return string
   */
  protected wrapSegments(segments: Array<string>): string {
    return collect(segments).map((segment: Expression | string, key: number) => {
      return key === 0 && segments.length > 1
        ? this.wrapTable(segment)
        : this.wrapValue(String(segment));
    }).join('.');
  }

  /**
   * Wrap a table in keyword identifiers.
   *
   * @param  \Illuminate\Database\Query\Expression|string  table
   * @return string
   */
  public wrapTable(table: Expression | string): string {
    if (!this.isExpression(table)) {
      return this.wrap(this.tablePrefix + table, true);
    }

    return this.getValue(table as Expression);
  }

  /**
   * Wrap a single string in keyword identifiers.
   *
   * @param  string  value
   * @return string
   */
  protected wrapValue(value: string): string {
    if (value !== '*') {
      return '"' + value.replace('"', '""') + '"';
    }

    return value;
  }
}
