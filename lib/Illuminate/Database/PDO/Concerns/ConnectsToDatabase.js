"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectsToDatabase = void 0;
const utils_1 = require("@devnetic/utils");
const Connection_1 = require("./../Connection");
class ConnectsToDatabase {
    /**
     * Create a new database connection.
     *
     * @param  {object}  params
     * @param  {string|undefined}  username
     * @param  {string|undefined}  password
     * @param  {object}  driverOptions
     * @return {\Illuminate\Database\PDO\Connection}
     *
     * @throws {\InvalidArgumentException}
     */
    connect(params, username, password, driverOptions = {}) {
        if ((0, utils_1.isNil)(params.ndo) || !(0, utils_1.isObject)(params.ndo)) {
            throw new Error('InvalidArgumentException: Kiirus requires the "ndo" property to be set and be a Connection Object instance.');
        }
        return new Connection_1.Connection(params.ndo);
    }
}
exports.ConnectsToDatabase = ConnectsToDatabase;
//# sourceMappingURL=ConnectsToDatabase.js.map