"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryExecuted = void 0;
class QueryExecuted {
    /**
     * Create a new event instance.
     *
     * @param  {string}  sql
     * @param  {array}  bindings
     * @param  {number}  [time]
     * @param  {\Illuminate\Database\Connection}  connection
     * @return {void}
     */
    constructor(sql, bindings, time, connection) {
        this.sql = sql;
        this.time = time;
        this.bindings = bindings;
        this.connection = connection;
        this.connectionName = connection.getName();
    }
}
exports.QueryExecuted = QueryExecuted;
//# sourceMappingURL=QueryExecuted.js.map