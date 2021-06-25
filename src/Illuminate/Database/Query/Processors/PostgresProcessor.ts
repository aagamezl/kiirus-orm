import { isNumeric } from '@devnetic/utils';

import { Builder } from '../Builder';
import { Processor } from './Processor';

export class PostgresProcessor extends Processor {
  /**
   * Process the results of a column listing query.
   *
   * @param  Array<any>  results
   * @return Array<any>
   */
  public processColumnListing(results: Array<any>): Array<string>{
    return results.map((result) => {
      return result.column_name;
  });
}

  /**
   * Process an "insert get ID" query.
   *
   * @param  \Illuminate\Database\Query\Builder  query
   * @param  string  sql
   * @param  array  values
   * @param  string  sequence
   * @return Number
   */
  public async processInsertGetId(query: Builder, sql: string, values: Array<any> | any, sequence?: string): Promise<number> {
    const connection = query.getConnection();

    connection.recordsHaveBeenModified();

    const result = await connection.selectFromWriteConnection(sql, values);

    sequence = sequence ?? 'id';

    const id = result[0][sequence];

    return isNumeric(id) ? Number(id): id;
  }
}
