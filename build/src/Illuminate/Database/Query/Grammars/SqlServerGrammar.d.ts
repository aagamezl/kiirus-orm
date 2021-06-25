import { Builder, WhereInterface } from '../Builder';
import { Expression } from '../Expression';
import { Grammar } from './Grammar';
export declare class SqlServerGrammar extends Grammar {
    /**
     * All of the available clause operators.
     *
     * @var Aray<string>
     */
    protected operators: string[];
    /**
     * Create a full ANSI offset clause for the query.
     *
     * @param  \Illuminate\Database\Query\Builder  query
     * @param  array  components
     * @return string
     */
    protected compileAnsiOffset(query: Builder, components: Record<string, any>): string;
    /**
     * Compile the "select *" portion of the query.
     *
     * @param  \Illuminate\Database\Query\Builder  query
     * @param  Array<any>  columns
     * @return string|undefined
     */
    protected compileColumns(query: Builder, columns: Array<any>): string | undefined;
    /**
     * Compile an exists statement into SQL.
     *
     * @param  \Illuminate\Database\Query\Builder  query
     * @return string
     */
    compileExists(query: Builder): string;
    /**
     * Compile the "limit" portions of the query.
     *
     * @param  \Illuminate\Database\Query\Builder  query
     * @param  number  limit
     * @return string
     */
    protected compileLimit(query: Builder, limit: number): string;
    /**
     * Compile the "offset" portions of the query.
     *
     * @param  \Illuminate\Database\Query\Builder  query
     * @param  number  offset
     * @return string
     */
    protected compileOffset(query: Builder, offset: number): string;
    /**
     * Compile the over statement for a table expression.
     *
     * @param  string  orderings
     * @return string
     */
    protected compileOver(orderings: string): string;
    /**
     * Compile an "upsert" statement into SQL.
     *
     * @param  \Illuminate\Database\Query\Builder  query
     * @param  Array<any>  values
     * @param  Array<any>  uniqueBy
     * @param  Array<any>  update
     * @return string
     */
    compileUpsert(query: Builder, values: Array<any>, uniqueBy: Array<any>, update: Array<any>): string;
    /**
     * Compile the limit / offset row constraint for a query.
     *
     * @param  \Illuminate\Database\Query\Builder  query
     * @return string
     */
    protected compileRowConstraint(query: Builder): string;
    /**
     * Compile a common table expression for a query.
     *
     * @param  string  $sql
     * @param  \Illuminate\Database\Query\Builder  $query
     * @return string
     */
    protected compileTableExpression(sql: string, query: Builder): string;
    /**
     * Compile a select query into SQL.
     *
     * @param  \Illuminate\Database\Query\Builder  query
     * @return string
     */
    compileSelect(query: Builder): string;
    /**
     * Prepare the bindings for an update statement.
     *
     * @param  Array<any>  bindings
     * @param  Array<any>  values
     * @return Array<any>
     */
    prepareBindingsForUpdate(bindings: Array<any> | any, values: Array<any>): Array<any>;
    /**
     * Compile a "where date" clause.
     *
     * @param  \Illuminate\Database\Query\Builder  query
     * @param  WhereInterface  where
     * @return string
     */
    protected whereDate(query: Builder, where: WhereInterface): string;
    /**
     * Compile a "where time" clause.
     *
     * @param  \Illuminate\Database\Query\Builder  query
     * @param  WhereInterface  where
     * @return string
     */
    protected whereTime(query: Builder, where: WhereInterface): string;
    /**
     * Wrap a table in keyword identifiers.
     *
     * @param  \Illuminate\Database\Query\Expression|string  table
     * @return string
     */
    wrapTable(table: Expression | string): string;
    /**
     * Wrap a table in keyword identifiers.
     *
     * @param  string  table
     * @return string
     */
    protected wrapTableValuedFunction(table: string): string;
    /**
     * Wrap a union subquery in parentheses.
     *
     * @param  string  sql
     * @return string
     */
    protected wrapUnion(sql: string): string;
    /**
     * Wrap a single string in keyword identifiers.
     *
     * @param  string  value
     * @return string
     */
    protected wrapValue(value: string): string;
}
