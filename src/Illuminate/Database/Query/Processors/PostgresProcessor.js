import { isNumeric } from '@devnetic/utils'

import { Processor } from './Processor'

export class PostgresProcessor extends Processor {
  /**
   * Process an "insert get ID" query.
   *
   * @param  {\Illuminate\Database\Query\Builder}  query
   * @param  {string}  sql
   * @param  {array}  values
   * @param  {string|undefined}  sequence
   * @return {number}
   */
  processInsertGetId (query, sql, values, sequence = undefined) {
    const connection = query.getConnection()

    connection.recordsHaveBeenModified()

    const result = connection.selectFromWriteConnection(sql, values)[0]

    sequence = sequence ?? 'id'

    const id = result[sequence]

    return isNumeric(id) ? Number(id) : id
  }

  /**
   * Process the results of a column listing query.
   *
   * @param  array  results
   * @return array
   */
  processColumnListing (results) {
    return results.map((result) => {
      return result.column_name
    })
  }
}
