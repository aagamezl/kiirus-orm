"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JoinClause = void 0;
const internal_1 = require("./internal");
/**
 *
 *
 * @export
 * @class JoinClause
 * @extends {Builder}
 */
class JoinClause extends internal_1.Builder {
    /**
     * Create a new join clause instance.
     *
     * @constructor
     * @param  {{\Illuminate\Database\Query\Builder}}  parentQuery
     * @param  {string}  type
     * @param  {string}  table
     * @return {void}
     */
    constructor(parentQuery, type, table) {
        super(parentQuery.getConnection(), parentQuery.getGrammar(), parentQuery.getProcessor());
        this.type = type;
        this.table = table;
        this.parentClass = parentQuery.constructor;
        this.parentGrammar = parentQuery.getGrammar();
        this.parentProcessor = parentQuery.getProcessor();
        this.parentConnection = parentQuery.getConnection();
    }
}
exports.JoinClause = JoinClause;
//# sourceMappingURL=JoinClause.js.map