import { Builder } from '../Builder';
import { Expression } from '../Expression';
import { Grammar, Where } from './Grammar';
export declare class PostgresGrammar extends Grammar {
    /**
     * All of the available clause operators.
     *
     * @var string[]
     */
    protected operators: string[];
    /**
     * Compile the "select *" portion of the query.
     *
     * @param  {\Illuminate\Database\Query\Builder}  query
     * @param  {Array}  columns
     * @return {string|undefined}
     */
    protected compileColumns(query: Builder, columns: Array<string | Expression>): string | undefined;
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
     * @param  {\Illuminate\Database\Query\Builder}  query
     * @param  {where}  where
     * @return {string}
     */
    protected dateBasedWhere(type: string, query: Builder, where: Where): string;
    /**
     * {@inheritdoc}
     *
     * @param  {\Illuminate\Database\Query\Builder}  query
     * @param  {Where}  where
     * @return {string}
     */
    protected whereBasic(query: Builder, where: Where): string;
    /**
     * Compile a "where date" clause.
     *
     * @param  {\Illuminate\Database\Query\Builder}  query
     * @param  {Where}  where
     * @return {string}
     */
    protected whereDate(query: Builder, where: Where): string;
    /**
     * Get an array of valid full text languages.
     *
     * @return {string[]}
     */
    protected validFullTextLanguages(): string[];
    /**
     * Compile a "where fulltext" clause.
     *
     * @param  {\Illuminate\Database\Query\Builder}  query
     * @param  {Where}  where
     * @return {string}
     */
    protected whereFulltext(query: Builder, where: Where): string;
    /**
     * Compile a "where time" clause.
     *
     * @param  {\Illuminate\Database\Query\Builder}  query
     * @param  {Where}  where
     * @return {string}
     */
    protected whereTime(query: Builder, where: Where): string;
}
