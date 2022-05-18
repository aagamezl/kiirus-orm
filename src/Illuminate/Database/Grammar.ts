import { collect } from '../Collections/helpers'
import { Expression } from './Query'

export abstract class Grammar {
  /**
   * The grammar table prefix.
   *
   * @var string
   */
  protected tablePrefix: string = ''

  /**
   * Convert an array of column names into a delimited string.
   *
   * @param  {Array<string | Expression>}  columns
   * @return {string}
   */
  columnize (columns: Array<string | Expression>): string {
    return columns.map(column => this.wrap(column)).join(', ')
  }

  /**
   * Get the format for database stored dates.
   *
   * @return {string}
   */
  public getDateFormat (): string {
    return 'Y-m-d H:i:s'
  }

  /**
   * Get the value of a raw expression.
   *
   * @param  {\Illuminate\Database\Query\Expression}  expression
   * @return {any}
   */
  public getValue (expression: Expression): any {
    return expression.getValue()
  }

  /**
   * Determine if the given value is a raw expression.
   *
   * @param  {unknown}  value
   * @return {bool}
   */
  public isExpression <T>(value: T): boolean {
    return value instanceof Expression
  }

  /**
   * Determine if the given string is a JSON selector.
   *
   * @param  {string}  value
   * @return {boolean}
   */
  protected isJsonSelector (value: string): boolean {
    return value.includes('->')
  }

  /**
   * Get the appropriate query parameter place-holder for a value.
   *
   * @param  {any}  value
   * @return {string}
   */
  public parameter (value: any): string {
    return this.isExpression(value) ? this.getValue(value) : '?'
  }

  /**
   * Create query parameter place-holders for an array.
   *
   * @param  {Array}  values
   * @return {string}
   */
  public parameterize (values: string | string[]): string {
    // return (Array.isArray(values) ? values : Object.values(values))
    return (Array.isArray(values) ? values : [values])
      .map((value) => this.parameter(value)).join(', ')
  }

  /**
   * Set the grammar's table prefix.
   *
   * @param  {string}  prefix
   * @return {this}
   */
  public setTablePrefix (prefix: string): this {
    this.tablePrefix = prefix

    return this
  }

  /**
   * Wrap a value in keyword identifiers.
   *
   * @param  {\Illuminate\Database\Query\Expression|string}  value
   * @param  {boolean}  prefixAlias
   * @return {string}
   */
  public wrap (value: Expression | string, prefixAlias: boolean = false): string {
    if (this.isExpression(value)) {
      return this.getValue(value as any)
    }

    // If the value being wrapped has a column alias we will need to separate out
    // the pieces so we can wrap each of the segments of the expression on its
    // own, and then join these both back together using the "as" connector.
    if (/\sas\s/i.test(value as any)) {
      return this.wrapAliasedValue(value as string, prefixAlias)
    }

    // If the given value is a JSON selector we will wrap it differently than a
    // traditional value. We will need to split this path and wrap each part
    // wrapped, etc. Otherwise, we will simply wrap the value as a string.
    if (this.isJsonSelector(value as string)) {
      return this.wrapJsonSelector(value as string)
    }

    return this.wrapSegments(String(value).split('.'))
  }

  /**
   * Wrap a value that has an alias.
   *
   * @param  {string}  value
   * @param  {boolean}  prefixAlias
   * @return {string}
   */
  protected wrapAliasedValue (value: string, prefixAlias: boolean = false): string {
    const segments = value.split(/\s+as\s+/i)

    // If we are wrapping a table we need to prefix the alias with the table prefix
    // as well in order to generate proper syntax. If this is a column of course
    // no prefix is necessary. The condition will be true when from wrapTable.
    if (prefixAlias) {
      segments[1] = this.tablePrefix + segments[1]
    }

    return this.wrap(segments[0]) + ' as ' + this.wrapValue(segments[1])
  }

  /**
   * Wrap the given JSON selector.
   *
   * @param  {string}  value
   * @return {string}
   *
   * @throws \RuntimeException
   */
  protected wrapJsonSelector (value: string): string {
    throw new Error('RuntimeException: This database engine does not support JSON operations.')
  }

  /**
   * Wrap the given value segments.
   *
   * @param  {Array}  segments
   * @return {string}
   */
  protected wrapSegments (segments: string[]): string {
    return collect(segments).map((segment: unknown, key: unknown) => {
      return key === 0 && segments.length > 1
        ? this.wrapTable(segment as string | Expression)
        : this.wrapValue(segment as string)
    }).join('.')
  }

  /**
   * Wrap a table in keyword identifiers.
   *
   * @param  {\Illuminate\Database\Query\Expression|string}  table
   * @return {string}
   */
  public wrapTable (table: Expression | string): string {
    if (!this.isExpression(table)) {
      return this.wrap(this.tablePrefix + String(table), true)
    }

    return this.getValue(table as Expression)
  }

  /**
   * Wrap a single string in keyword identifiers.
   *
   * @param  {string}  value
   * @return {string}
   */
  protected wrapValue (value: string): string {
    if (value !== '*') {
      return '"' + value.replace('"', '""') + '"'
    }

    return value
  }
}
