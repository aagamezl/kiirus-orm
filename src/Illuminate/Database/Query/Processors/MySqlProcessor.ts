import { Builder } from '../Builder'
import { Processor } from './Processor'

export class MySqlProcessor extends Processor {
  /**
   * Process the results of a column listing query.
   *
   * @param  {Array}  results
   * @return {Array}
   */
  public processColumnListing (results: Array<Record<string, any>>): string[] {
    return results.map((result) => {
      return result.column_name
    })
  }

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
  public processInsertGetId (query: Builder, sql: string, values: Record<string, any>, sequence: string): number {
    const connection = query.getConnection()

    connection.recordsHaveBeenModified()

    const result: any = connection.select(sql, values)

    return parseInt(Reflect.get(result[0], 'insertId'), 10)
  }
}
