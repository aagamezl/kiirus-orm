import { Builder } from '../Builder'

export class Processor {
  /**
   * Process the results of a column listing query.
   *
   * @param  {Array}  results
   * @return {Array}
   */
  public processColumnListing (results: object): object {
    return results
  }

  /**
   * Process an  "insert get ID" query.
   *
   * @param  {\Illuminate\Database\Query\Builder}  query
   * @param  {string}  sql
   * @param  {Array}  values
   * @param  {string|undefined}  [sequence]
   * @return {number}
   */
  // public processInsertGetId (query: Builder, sql: string, values: object, sequence?: string): number {
  //   query.getConnection().insert(sql, values)

  //   const id = query.getConnection().getNdo().lastInsertId(sequence)

  //   return isNumeric(id) ? Number(id) : id
  // }

  /**
   * Process the results of a "select" query.
   *
   * @param  {\Illuminate\Database\Query\Builder}  query
   * @param  {Array}  results
   * @return {Array}
   */
  public processSelect (query: Builder, results: object): object {
    return results
  }
}
