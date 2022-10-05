import { Expression } from './Query/internal';
export declare abstract class Grammar {
    /**
     * The grammar table prefix.
     *
     * @var string
     */
    protected tablePrefix: string;
    /**
     * Convert an array of column names into a delimited string.
     *
     * @param  {Array<string | Expression>}  columns
     * @return {string}
     */
    columnize(columns: Array<string | Expression>): string;
    /**
     * Get the format for database stored dates.
     *
     * @return {string}
     */
    getDateFormat(): string;
    /**
     * Get the value of a raw expression.
     *
     * @param  {\Illuminate\Database\Query\Expression}  expression
     * @return {any}
     */
    getValue(expression: Expression): any;
    /**
     * Determine if the given value is a raw expression.
     *
     * @param  {unknown}  value
     * @return {bool}
     */
    isExpression<T>(value: T): boolean;
    /**
     * Determine if the given string is a JSON selector.
     *
     * @param  {string}  value
     * @return {boolean}
     */
    protected isJsonSelector(value: string): boolean;
    /**
     * Get the appropriate query parameter place-holder for a value.
     *
     * @param  {any}  value
     * @return {string}
     */
    parameter(value: any): string;
    /**
     * Create query parameter place-holders for an array.
     *
     * @param  {Array}  values
     * @return {string}
     */
    parameterize(values: string | string[]): string;
    /**
     * Set the grammar's table prefix.
     *
     * @param  {string}  prefix
     * @return {this}
     */
    setTablePrefix(prefix: string): this;
    /**
     * Wrap a value in keyword identifiers.
     *
     * @param  {\Illuminate\Database\Query\Expression|string}  value
     * @param  {boolean}  prefixAlias
     * @return {string}
     */
    wrap(value: Expression | string, prefixAlias?: boolean): string;
    /**
     * Wrap a value that has an alias.
     *
     * @param  {string}  value
     * @param  {boolean}  prefixAlias
     * @return {string}
     */
    protected wrapAliasedValue(value: string, prefixAlias?: boolean): string;
    /**
     * Wrap the given JSON selector.
     *
     * @param  {string}  value
     * @return {string}
     *
     * @throws \RuntimeException
     */
    protected wrapJsonSelector(value: string): string;
    /**
     * Wrap the given value segments.
     *
     * @param  {Array}  segments
     * @return {string}
     */
    protected wrapSegments(segments: string[]): string;
    /**
     * Wrap a table in keyword identifiers.
     *
     * @param  {\Illuminate\Database\Query\Expression|string}  table
     * @return {string}
     */
    wrapTable(table: Expression | string): string;
    /**
     * Wrap a single string in keyword identifiers.
     *
     * @param  {string}  value
     * @return {string}
     */
    protected wrapValue(value: string): string;
}
