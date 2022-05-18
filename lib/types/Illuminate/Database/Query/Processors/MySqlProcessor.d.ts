import { Builder } from '../Builder';
import { Processor } from './Processor';
export declare class MySqlProcessor extends Processor {
    /**
     * Process the results of a column listing query.
     *
     * @param  {Array}  results
     * @return {Array}
     */
    processColumnListing(results: Array<Record<string, any>>): string[];
    /**
     *
     *
     * @param {Builder} query
     * @param {string} sql
     * @param {Array} values
     * @param {string} [sequence]
     * @return {*}
     * @memberof MySqlProcessor
     */
    processInsertGetId(query: Builder, sql: string, values: Record<string, any>, sequence: string): number;
}
