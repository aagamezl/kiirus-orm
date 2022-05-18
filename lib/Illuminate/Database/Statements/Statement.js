"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Statement = void 0;
class Statement {
    constructor(dsn, username, password, options) {
        this.bindings = {};
        this.fetchMode = 'assoc';
        this.dsn = dsn;
        this.options = options;
        this.password = password;
        this.username = username;
        this.bindings = {};
        this.result = {
            command: '',
            fields: [],
            oid: 0,
            rowCount: 0,
            rows: []
        };
        this.rowCountProperty = 0;
        this.preparedStatement = {
            name: '',
            rowMode: '',
            text: '',
            values: []
        };
    }
    /**
   *
   * @param {string|number} param
   * @param {unknown} value
   * @return {boolean}
   */
    bindValue(param, value) {
        try {
            Reflect.set(this.bindings, param, value);
            return true;
        }
        catch (error) {
            return false;
        }
    }
    async execute() {
        throw new Error('RuntimeException: Implement execute method on concrete class.');
    }
    fetchAll() {
        throw new Error('RuntimeException: Implement fetchAll method on concrete class.');
    }
    parameterize(query) {
        throw new Error('RuntimeException: Implement parameterize method on concrete class.');
    }
    prepare(query) {
        throw new Error('RuntimeException: Implement prepare method on concrete class.');
    }
    rowCount() {
        throw new Error('RuntimeException: Implement rowCount method on concrete class.');
    }
    setFetchMode(mode) {
        this.fetchMode = mode;
    }
}
exports.Statement = Statement;
//# sourceMappingURL=Statement.js.map