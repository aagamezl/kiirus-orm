import { Builder } from '../Builder';
import { Processor } from './Processor';
export declare class MySqlProcessor extends Processor {
    /**
     * Process the results of a column listing query.
     *
     * @param  array  results
     * @return array
     */
    processColumnListing(results: Array<any>): Array<string>;
    processInsertGetId(query: Builder, sql: string, values: Array<any>, sequence?: string): Promise<number>;
}
