"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MySqlConnection = void 0;
const Connection_1 = require("./Connection");
class MySqlConnection extends Connection_1.Connection {
    /**
     * Returns the ID of the last inserted row or sequence value
     * @return number
     */
    lastInsertId() {
        throw new Error('RuntimeException: This database engine does not support get last insert id.');
    }
}
exports.MySqlConnection = MySqlConnection;
//# sourceMappingURL=MySqlConnection.js.map