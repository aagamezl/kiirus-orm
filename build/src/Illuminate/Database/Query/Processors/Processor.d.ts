import { Builder } from '../Builder';
export declare class Processor {
    /**
     * Process the results of a "select" query.
     *
     * @param  \Illuminate\Database\Query\Builder  query
     * @param  array  results
     * @return array
     */
    processSelect(query: Builder, results: Array<any>): any[];
    /**
     * Process an  "insert get ID" query.
     *
     * @param  \Illuminate\Database\Query\Builder  query
     * @param  string  sql
     * @param  array  values
     * @param  string|null  sequence
     * @return int
     */
    processInsertGetId(query: Builder, sql: string, values: Array<any>, sequence?: string): Promise<number>;
    /**
     * Process the results of a column listing query.
     *
     * @param  array  results
     * @return array
     */
    processColumnListing(results: Array<any>): Array<any>;
}
