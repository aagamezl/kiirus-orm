"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Processor = void 0;
class Processor {
    /**
     * Process the results of a column listing query.
     *
     * @param  {Array}  results
     * @return {Array}
     */
    processColumnListing(results) {
        return results;
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
    processSelect(query, results) {
        return results;
    }
}
exports.Processor = Processor;
//# sourceMappingURL=Processor.js.map