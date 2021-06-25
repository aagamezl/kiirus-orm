"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MySqlProcessor = void 0;
const Processor_1 = require("./Processor");
class MySqlProcessor extends Processor_1.Processor {
    /**
     * Process the results of a column listing query.
     *
     * @param  array  results
     * @return array
     */
    processColumnListing(results) {
        return results.map((result) => {
            return result.column_name;
        });
    }
    async processInsertGetId(query, sql, values, sequence) {
        const connection = query.getConnection();
        connection.recordsHaveBeenModified();
        const result = await connection.selectFromWriteConnection(sql, values);
        return Number(Reflect.get(result[0], 'insertId'));
    }
}
exports.MySqlProcessor = MySqlProcessor;
//# sourceMappingURL=MySqlProcessor.js.map