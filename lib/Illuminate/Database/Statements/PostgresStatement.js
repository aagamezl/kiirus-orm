"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostgresStatement = void 0;
const pg_1 = require("pg");
const utils_1 = require("@devnetic/utils");
const Statement_1 = require("./Statement");
class PostgresStatement extends Statement_1.Statement {
    constructor(dsn, username, password, options) {
        super(dsn, username, password, options);
        this.pool = new pg_1.Pool({
            connectionString: this.dsn
        });
    }
    async execute() {
        const values = Object.values(this.bindings);
        if (values.length > 0) {
            this.preparedStatement.values = values;
        }
        try {
            const client = await this.pool.connect();
            this.result = await client.query(this.preparedStatement);
            await this.pool.end();
            return this.result;
        }
        catch (error) {
            console.error(error);
            return undefined;
        }
    }
    fetchAll() {
        return this.result.rows;
    }
    parameterize(query) {
        const regex = /\?/gm;
        if (query.match(regex) === null) {
            return query;
        }
        let index = 0;
        // return replace(query, regex, () => `$${++index}`)
        return query.replace(regex, () => `$${++index}`);
    }
    prepare(query) {
        this.preparedStatement = {
            name: `prepared-statement-${(0, utils_1.uuid)()}`,
            text: this.parameterize(query),
            rowMode: this.fetchMode
        };
        this.bindings = {};
        return this;
    }
    rowCount() {
        return this.result.rowCount;
    }
}
exports.PostgresStatement = PostgresStatement;
//# sourceMappingURL=PostgresStatement.js.map