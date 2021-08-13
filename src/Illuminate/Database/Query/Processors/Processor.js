
export class Processor {
  /**
   * Process the results of a "select" query.
   *
   * @param  {\Illuminate\Database\Query\Builder}  query
   * @param  {Array}  results
   * @return {Array}
   */
  processSelect (query, results) {
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
  processInsertGetId (query, sql, values, sequence) {
    throw new Error('RuntimeException: This database engine does not support get last insert id.')
  }

  /**
   * Process the results of a column listing query.
   *
   * @param  {Array}  results
   * @return {Array}
   */
  processColumnListing (results) {
    return results
  }
}
