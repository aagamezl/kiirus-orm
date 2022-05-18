"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatementPrepared = void 0;
class StatementPrepared {
    /**
     * Create a new event instance.
     *
     * @param  {\Illuminate\Database\Connection}  connection
     * @param  {Statement}  statement
     * @return {void}
     */
    constructor(connection, statement) {
        this.connection = connection;
        this.statement = statement;
    }
}
exports.StatementPrepared = StatementPrepared;
//# sourceMappingURL=StatementPrepared.js.map