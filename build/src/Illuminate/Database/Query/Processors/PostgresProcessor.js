"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostgresProcessor = void 0;
const utils_1 = require("@devnetic/utils");
const Processor_1 = require("./Processor");
class PostgresProcessor extends Processor_1.Processor {
    /**
     * Process the results of a column listing query.
     *
     * @param  Array<any>  results
     * @return Array<any>
     */
    processColumnListing(results) {
        return results.map((result) => {
            return result.column_name;
        });
    }
    /**
     * Process an "insert get ID" query.
     *
     * @param  \Illuminate\Database\Query\Builder  query
     * @param  string  sql
     * @param  array  values
     * @param  string  sequence
     * @return Number
     */
    async processInsertGetId(query, sql, values, sequence) {
        const connection = query.getConnection();
        connection.recordsHaveBeenModified();
        const result = await connection.selectFromWriteConnection(sql, values);
        sequence = sequence !== null && sequence !== void 0 ? sequence : 'id';
        const id = result[0][sequence];
        return utils_1.isNumeric(id) ? Number(id) : id;
    }
}
exports.PostgresProcessor = PostgresProcessor;
//# sourceMappingURL=PostgresProcessor.js.map