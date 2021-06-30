import {Builder} from '../Builder';
import {Processor} from './Processor';

export class MySqlProcessor extends Processor {
  /**
   * Process the results of a column listing query.
   *
   * @param  array  results
   * @return array
   */
  public processColumnListing(results: Array<any>): Array<string> {
    return results.map(result => {
      return result.column_name;
    });
  }

  public async processInsertGetId(
    query: Builder,
    sql: string,
    values: Array<any>,
    sequence?: string
  ): Promise<number> {
    const connection = query.getConnection();

    connection.recordsHaveBeenModified();

    const result = await connection.selectFromWriteConnection(sql, values);

    return Number(Reflect.get(result[0], 'insertId'));
  }
}
