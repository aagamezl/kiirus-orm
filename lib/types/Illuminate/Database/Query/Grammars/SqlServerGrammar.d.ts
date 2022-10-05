import { Builder } from '../Builder';
import { Expression } from '../Expression';
import { Grammar, Where } from './Grammar';
export declare class SqlServerGrammar extends Grammar {
    /**
     * All of the available clause operators.
     *
     * @member {string[]}
     */
    protected operators: string[];
    /**
     * Create a full ANSI offset clause for the query.
     *
     * @param  {\Illuminate\Database\Query\Builder}  query
     * @param  {object}  components
     * @return {string}
     */
    protected compileAnsiOffset(query: Builder, components: Record<string, string>): string;
    /**
     * Compile the "select *" portion of the query.
     *
     * @param  {\Illuminate\Database\Query\Builder}  query
     * @param  {string[]}  columns
     * @return {string|undefined}
     */
    protected compileColumns(query: Builder, columns: string[]): string | undefined;
    /**
     * Compile an exists statement into SQL.
     *
     * @param  {\Illuminate\Database\Query\Builder } query
     * @return {string}
     */
    compileExists(query: Builder): string;
    /**
     * Compile the "from" portion of the query.
     *
     * @param  {\Illuminate\Database\Query\Builder}  query
     * @param  {string}  table
     * @return {string}
     */
    protected compileFrom(query: Builder, table: string): string;
    /**
     * Compile the "limit" portions of the query.
     *
     * @param  {\Illuminate\Database\Query\Builder}  query
     * @param  {number}  limit
     * @return {string}
     */
    protected compileLimit(query: Builder, limit: number): string;
    /**
     * Compile the "offset" portions of the query.
     *
     * @param  {\Illuminate\Database\Query\Builder}  query
     * @param  {number}  offset
     * @return {string}
     */
    protected compileOffset(query: Builder, offset: number): string;
    /**
     * Compile the over statement for a table expression.
     *
     * @param  {string}  orderings
     * @return {string}
     */
    protected compileOver(orderings: string): string;
    /**
     * Compile the limit / offset row constraint for a query.
     *
     * @param  {\Illuminate\Database\Query\Builder}  query
     * @return {string}
     */
    protected compileRowConstraint(query: Builder): string;
    /**
     * Compile a select query into SQL.
     *
     * @param  {\Illuminate\Database\Query\Builder}  query
     * @return {string}
     */
    compileSelect(query: Builder): string;
    /**
     * Compile a common table expression for a query.
     *
     * @param  {string}  sql
     * @param  {\Illuminate\Database\Query\Builder}  query
     * @return {string}
     */
    protected compileTableExpression(sql: string, query: Builder): string;
    /**
     * Get the format for database stored dates.
     *
     * @return {string}
     */
    getDateFormat(): string;
    /**
     * Determine if the query's order by clauses contain a subquery.
     *
     * @param  {\Illuminate\Database\Query\Builder}  query
     * @return {boolean}
     */
    protected queryOrderContainsSubquery(query: Builder): boolean;
    /**
     * Move the order bindings to be after the "select" statement to account for a order by subquery.
     *
     * @param  {\Illuminate\Database\Query\Builder}  query
     * @return {Array}
     */
    protected sortBindingsForSubqueryOrderBy(query: Builder): string[];
    /**
     * Compile a "where date" clause.
     *
     * @param  {\Illuminate\Database\Query\Builder}  query
     * @param  {Where}  where
     * @return {string}
     */
    protected whereDate(query: Builder, where: Where): string;
    /**
     * Compile a "where time" clause.
     *
     * @param  {\Illuminate\Database\Query\Builder}  query
     * @param  {Where}  where
     * @return {string}
     */
    protected whereTime(query: Builder, where: Where): string;
    /**
     * Wrap a table in keyword identifiers.
     *
     * @param  {\Illuminate\Database\Query\Expression|string}  table
     * @return {string}
     */
    wrapTable(table: Expression | string): string;
    /**
     * Wrap a table in keyword identifiers.
     *
     * @param  {string}  table
     * @return {string}
     */
    protected wrapTableValuedFunction(table: string): string;
    /**
     * Wrap a union subquery in parentheses.
     *
     * @param  {string}  sql
     * @return {string}
     */
    protected wrapUnion(sql: string): string;
    /**
     * Wrap a single string in keyword identifiers.
     *
     * @param  {string}  value
     * @return {string}
     */
    protected wrapValue(value: string): string;
}
