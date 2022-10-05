import { Builder } from '../Builder';
export declare class Processor {
    /**
     * Process the results of a column listing query.
     *
     * @param  {Array}  results
     * @return {Array}
     */
    processColumnListing(results: object): object;
    /**
     * Process an  "insert get ID" query.
     *
     * @param  {\Illuminate\Database\Query\Builder}  query
     * @param  {string}  sql
     * @param  {Array}  values
     * @param  {string|undefined}  [sequence]
     * @return {number}
     */
    processInsertGetId(query: Builder, sql: string, values: object, sequence?: string): Promise<number>;
    /**
     * Process the results of a "select" query.
     *
     * @param  {\Illuminate\Database\Query\Builder}  query
     * @param  {Array}  results
     * @return {Array}
     */
    processSelect(query: Builder, results: object): object;
}
