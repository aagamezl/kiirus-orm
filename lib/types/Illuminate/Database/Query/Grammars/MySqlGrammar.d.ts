import { Builder } from '../Builder';
import { Grammar, Where } from './Grammar';
export declare class MySqlGrammar extends Grammar {
    /**
     * The grammar specific operators.
     *
     * @type {string[]}
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
     * Compile a "where fulltext" clause.
     *
     * @param  {\Illuminate\Database\Query\Builder}  query
     * @param  {Where}  where
     * @return {string}
     */
    protected whereFulltext(query: Builder, where: Where): string;
    /**
     * Add a "where null" clause to the query.
     *
     * @param  {\Illuminate\Database\Query\Builder}  query
     * @param  {Where}  where
     * @return {string}
     */
    protected whereNull(query: Builder, where: Where): string;
    /**
     * Add a "where not null" clause to the query.
     *
     * @param  {\Illuminate\Database\Query\Builder}  query
     * @param  {Where}  where
     * @return {string}
     */
    protected whereNotNull(query: Builder, where: Where): string;
    /**
     * Wrap the given JSON selector for boolean values.
     *
     * @param  {string}  value
     * @return {string}
     */
    protected wrapJsonBooleanSelector(value: string): string;
    /**
     * Wrap the given JSON selector.
     *
     * @param  {string}  value
     * @return {string}
     */
    protected wrapJsonSelector(value: string): string;
    /**
     * Wrap a single string in keyword identifiers.
     *
     * @param  {string}  value
     * @return {string}
     */
    protected wrapValue(value: string): string;
}
