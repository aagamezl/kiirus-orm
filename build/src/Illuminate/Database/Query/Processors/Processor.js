"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Processor = void 0;
class Processor {
    /**
     * Process the results of a "select" query.
     *
     * @param  \Illuminate\Database\Query\Builder  query
     * @param  array  results
     * @return array
     */
    processSelect(query, results) {
        return results;
    }
    /**
     * Process an  "insert get ID" query.
     *
     * @param  \Illuminate\Database\Query\Builder  query
     * @param  string  sql
     * @param  array  values
     * @param  string|null  sequence
     * @return int
     */
    async processInsertGetId(query, sql, values, sequence) {
        throw new Error('RuntimeException: This database engine does not support get last insert id.');
    }
    /**
     * Process the results of a column listing query.
     *
     * @param  array  results
     * @return array
     */
    processColumnListing(results) {
        return results;
    }
}
exports.Processor = Processor;
//# sourceMappingURL=Processor.js.map