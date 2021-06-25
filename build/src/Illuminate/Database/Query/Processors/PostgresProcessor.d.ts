import { Builder } from '../Builder';
import { Processor } from './Processor';
export declare class PostgresProcessor extends Processor {
    /**
     * Process the results of a column listing query.
     *
     * @param  Array<any>  results
     * @return Array<any>
     */
    processColumnListing(results: Array<any>): Array<string>;
    /**
     * Process an "insert get ID" query.
     *
     * @param  \Illuminate\Database\Query\Builder  query
     * @param  string  sql
     * @param  array  values
     * @param  string  sequence
     * @return Number
     */
    processInsertGetId(query: Builder, sql: string, values: Array<any> | any, sequence?: string): Promise<number>;
}
