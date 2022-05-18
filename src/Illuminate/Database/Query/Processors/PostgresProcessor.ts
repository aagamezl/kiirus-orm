import { isNumeric } from '@devnetic/utils'

import { Builder } from '../Builder'
import { Processor } from './Processor'

export class PostgresProcessor extends Processor {
  /**
   * Process an "insert get ID" query.
   *
   * @param  {\Illuminate\Database\Query\Builder}  query
   * @param  {string}  sql
   * @param  {array}  values
   * @param  {string}  {sequence}
   * @return {number}
   */
  public processInsertGetId (query: Builder, sql: string, values: Record<string, any>, sequence?: string): number {
    const connection = query.getConnection()

    connection.recordsHaveBeenModified()

    const result: any = connection.select(sql, values)

    sequence = sequence ?? 'id'

    const id = result[0][sequence]

    return isNumeric(id) ? Number(id) : id
  }
}
