"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JoinClause = void 0;
// import { Builder } from './Builder';
const internal_1 = require("./internal");
class JoinClause extends internal_1.Builder {
    /**
     * Create a new join clause instance.
     *
     * @param  \Illuminate\Database\Query\Builder  parentQuery
     * @param  string  type
     * @param  string  table | Expression
     * @return void
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
    /**
     * Create a new query instance for sub-query.
     *
     * @return \Illuminate\Database\Query\Builder
     */
    forSubQuery() {
        return this.newParentQuery().newQuery();
    }
    /**
     * Create a new parent query instance.
     *
     * @return \Illuminate\Database\Query\Builder
     */
    newParentQuery() {
        const constructor = this.parentClass;
        return new constructor(this.parentConnection, this.parentGrammar, this.parentProcessor);
    }
    /**
     * Get a new instance of the join clause builder.
     *
     * @return \Illuminate\Database\Query\JoinClause
     */
    newQuery() {
        return new this.constructor(this.newParentQuery(), this.type, this.table);
    }
    /**
     * Add an "on" clause to the join.
     *
     * On clauses can be chained, e.g.
     *
     *  $join->on('contacts.user_id', '=', 'users.id')
     *       ->on('contacts.info_id', '=', 'info.id')
     *
     * will produce the following SQL:
     *
     * on `contacts`.`user_id` = `users`.`id` and `contacts`.`info_id` = `info`.`id`
     *
     * @param  \Function|string  first
     * @param  string|null  operator
     * @param  \Illuminate\Database\Query\Expression|string|null  second
     * @param  string  boolean
     * @return this
     *
     * @throws \InvalidArgumentException
     */
    on(first, operator, second, boolean = 'and') {
        if (first instanceof Function) {
            // return (this as any).whereNested(first, boolean);
            return this.whereNested(first, boolean);
        }
        // return this.whereColumn(first, operator, String(second), boolean) as unknown as TJoinClause;
        return this.whereColumn(first, operator, String(second), boolean);
    }
    /**
     * Add an "or on" clause to the join.
     *
     * @param  Function|string  first
     * @param  [string]  operator
     * @param  [string]  second
     * @return \Illuminate\Database\Query\JoinClause
     */
    orOn(first, operator, second) {
        return this.on(first, operator, second, 'or');
    }
}
exports.JoinClause = JoinClause;
//# sourceMappingURL=JoinClause.js.map