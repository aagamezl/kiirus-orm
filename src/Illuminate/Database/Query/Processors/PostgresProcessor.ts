import {isNumeric} from '@devnetic/utils';

import {Builder} from '../Builder';
import {Processor} from './Processor';

export class PostgresProcessor extends Processor {
  /**
   * Process the results of a column listing query.
   *
   * @param  {Array}  results
   * @returns {Array}
   */
  public processColumnListing(results: Array<object>): Array<string> {
    return results.map(result => Reflect.get(result, 'column_name'));
  }

  /**
   * Process an "insert get ID" query.
   *
   * @param  {Builder}  query
   * @param  {string}  sql
   * @param  {Array}  values
   * @param  {string}  sequence
   * @returns {number}
   */
  public async processInsertGetId(
    query: Builder,
    sql: string,
    values: Array<unknown>,
    sequence?: string
  ): Promise<number> {
    const connection = query.getConnection();

    connection.recordsHaveBeenModified();

    const result = await connection.selectFromWriteConnection(sql, values);

    // sequence = sequence ?? 'id';

    const id = Reflect.get(result[0], sequence ?? 'id');

    return isNumeric(id) ? Number(id) : id;
  }
}
