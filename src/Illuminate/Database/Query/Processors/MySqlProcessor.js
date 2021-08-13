
import { Processor } from './Processor'

export class MySqlProcessor extends Processor {
  /**
   * Process the results of a column listing query.
   *
   * @param  {Array}  results
   * @return {Array}
   */
  processColumnListing (results) {
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
  processInsertGetId (query, sql, values, sequence) {
    const connection = query.getConnection()

    connection.recordsHaveBeenModified()

    const result = connection.selectFromWriteConnection(sql, values)

    return parseInt(Reflect.get(result[0], 'insertId'), 10)
  }
}
