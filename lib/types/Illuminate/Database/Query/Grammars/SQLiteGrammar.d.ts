import { Builder } from '../Builder';
import { Grammar, Where } from './Grammar';
export declare class SQLiteGrammar extends Grammar {
    /**
     * All of the available clause operators.
     *
     * @var string[]
     */
    protected operators: string[];
    /**
     * Compile an insert ignore statement into SQL.
     *
     * @param  {\Illuminate\Database\Query\Builder}  query
     * @param  {Record<string, any>}  values
     * @return {string}
     */
    compileInsertOrIgnore(query: Builder, values: Record<string, any>): string;
    /**
     * Compile a date based where clause.
     *
     * @param  {string}  type
     * @param  {{\Illuminate\Database\Query\Builder}}  query
     * @param  {Where}  where
     * @return {string}
     */
    protected dateBasedWhere(type: string, query: Builder, where: Where): string;
    /**
     * Compile a "where date" clause.
     *
     * @param  {\Illuminate\Database\Query\Builder}  query
     * @param  {Where}  where
     * @return {string}
     */
    protected whereDate(query: Builder, where: Where): string;
    /**
     * Compile a "where day" clause.
     *
     * @param  {\Illuminate\Database\Query\Builder}  query
     * @param  {Where}  where
     * @return {string}
     */
    protected whereDay(query: Builder, where: Where): string;
    /**
     * Compile a "where month" clause.
     *
     * @param  {\Illuminate\Database\Query\Builder}  query
     * @param  {Where}  where
     * @return {string}
     */
    protected whereMonth(query: Builder, where: Where): string;
    /**
     * Compile a "where time" clause.
     *
     * @param  {\Illuminate\Database\Query\Builder}  query
     * @param  {Where}  where
     * @return {string}
     */
    protected whereTime(query: Builder, where: Where): string;
    /**
     * Compile a "where year" clause.
     *
     * @param  {\Illuminate\Database\Query\Builder}  query
     * @param  {Where}  where
     * @return {string}
     */
    protected whereYear(query: Builder, where: Where): string;
    /**
     * Wrap a union subquery in parentheses.
     *
     * @param  {string}  sql
     * @return {string}
     */
    protected wrapUnion(sql: string): string;
}
