"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MySqlProcessor = void 0;
const Processor_1 = require("./Processor");
class MySqlProcessor extends Processor_1.Processor {
    /**
     * Process the results of a column listing query.
     *
     * @param  {Array}  results
     * @return {Array}
     */
    processColumnListing(results) {
        return results.map((result) => {
            return result.column_name;
        });
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
    async processInsertGetId(query, sql, values, sequence) {
        const connection = query.getConnection();
        connection.recordsHaveBeenModified();
        const result = connection.select(sql, values);
        return parseInt(Reflect.get(result[0], 'insertId'), 10);
    }
}
exports.MySqlProcessor = MySqlProcessor;
//# sourceMappingURL=MySqlProcessor.js.map