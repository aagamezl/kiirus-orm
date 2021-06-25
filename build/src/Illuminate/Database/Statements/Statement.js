"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Statement = void 0;
class Statement {
    constructor(query, connection) {
        this.bindings = {};
        this.rowCountProperty = 0;
        this.connection = connection;
        this.query = query;
    }
    /**
     *
     * @param string|number param
     * @param any value
     * @return boolean
     */
    bindValue(param, value) {
        try {
            this.bindings[param] = value;
            return true;
        }
        catch (error) {
            return false;
        }
    }
    async execute() {
        try {
            const result = await this.connection.query(this.query, Array.from(Object.values(this.bindings)));
            this.rowCountProperty = result.rows.length;
            return true;
        }
        catch (error) {
            return false;
        }
    }
    rowCount() {
        return this.rowCountProperty;
    }
}
exports.Statement = Statement;
//# sourceMappingURL=Statement.js.map