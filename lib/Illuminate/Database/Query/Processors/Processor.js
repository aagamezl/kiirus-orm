"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Processor = void 0;
const utils_1 = require("@devnetic/utils");
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
    async processInsertGetId(query, sql, values, sequence) {
        const connection = query.getConnection();
        connection.recordsHaveBeenModified();
        connection.recordsHaveBeenModified();
        const result = await connection.select(sql, values);
        sequence = sequence ?? 'id';
        const id = result[0][sequence];
        return (0, utils_1.isNumeric)(id) ? Number(id) : id;
    }
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