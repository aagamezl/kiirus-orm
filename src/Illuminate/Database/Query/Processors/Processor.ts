import { isNumeric } from '@devnetic/utils';

import { Builder } from '../Builder';

export class Processor {
  /**
   * Process the results of a "select" query.
   *
   * @param  \Illuminate\Database\Query\Builder  query
   * @param  array  results
   * @return array
   */
  public processSelect(query: Builder, results: Array<any>) {
    return results;
  }

  /**
   * Process an  "insert get ID" query.
   *
   * @param  \Illuminate\Database\Query\Builder  query
   * @param  string  sql
   * @param  array  values
   * @param  string|null  sequence
   * @return int
   */
  public async processInsertGetId(query: Builder, sql: string, values: Array<any>, sequence?: string): Promise<number> {
    throw new Error('RuntimeException: This database engine does not support get last insert id.');
  }

  /**
   * Process the results of a column listing query.
   *
   * @param  array  results
   * @return array
   */
  public processColumnListing(results: Array<any>): Array<any> {
    return results;
  }
}
