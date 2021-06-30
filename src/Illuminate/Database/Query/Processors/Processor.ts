import {Builder} from '../Builder';

export class Processor {
  /**
   * Process the results of a "select" query.
   *
   * @param  {Builder}  query
   * @param  {Array}  results
   * @returns {Array}
   */
  public processSelect(query: Builder, results: Array<unknown>) {
    return results;
  }

  /**
   * Process an  "insert get ID" query.
   *
   * @param  {Builder}  query
   * @param  {string}  sql
   * @param  {Array}  values
   * @param  {string}  [sequence]
   * @throws RuntimeException
   */
  public processInsertGetId(
    query: Builder, // eslint-disable-line
    sql: string, // eslint-disable-line
    values: Array<any>, // eslint-disable-line
    sequence?: string // eslint-disable-line
  ): Promise<number> {
    throw new Error(
      'RuntimeException: This database engine does not support get last insert id.'
    );
  }

  /**
   * Process the results of a column listing query.
   *
   * @param  {Array}  results
   * @returns {Array}
   */
  public processColumnListing(results: Array<unknown>): Array<unknown> {
    return results;
  }
}
