"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Grammar = void 0;
const utils_1 = require("@devnetic/utils");
const CompilesJsonPaths_1 = require("../../Concerns/CompilesJsonPaths");
const Grammar_1 = require("../../Grammar");
const use_1 = require("../../../Support/Traits/use");
class Grammar extends Grammar_1.Grammar {
    constructor() {
        super();
        /**
       * The grammar specific operators.
       *
       * @var string[]
       */
        this.operators = [];
        /**
         * The grammar specific bitwise operators.
         *
         * @var array
         */
        this.bitwiseOperators = [];
        /**
         * The components that make up a select clause.
         *
         * @var string[]
         */
        this.selectComponents = [
            { name: 'aggregate', property: 'aggregateProperty' },
            { name: 'columns', property: 'columns' },
            { name: 'from', property: 'fromProperty' },
            { name: 'joins', property: 'joins' },
            { name: 'wheres', property: 'wheres' },
            { name: 'groups', property: 'groups' },
            { name: 'havings', property: 'havings' },
            { name: 'orders', property: 'orders' },
            { name: 'limit', property: 'limitProperty' },
            { name: 'offset', property: 'offsetProperty' },
            { name: 'lock', property: 'lockProperty' }
        ];
        (0, use_1.use)(this.constructor, [CompilesJsonPaths_1.CompilesJsonPaths]);
    }
    /**
     * Compile an aggregated select clause.
     *
     * @param  {\Illuminate\Database\Query\Builder}  query
     * @param  {object}  aggregate
     * @return {string}
     */
    compileAggregate(query, aggregate) {
        let column = this.columnize(aggregate.columns);
        // If the query has a "distinct" constraint and we're not asking for all columns
        // we need to prepend "distinct" onto the column name so that the query takes
        // it into account when it performs the aggregating operations on the data.
        if (Array.isArray(query.distinctProperty)) {
            column = 'distinct ' + this.columnize(query.distinctProperty);
        }
        else if (query.distinctProperty !== undefined && column !== '*') {
            column = 'distinct ' + column;
        }
        return 'select ' + aggregate.function + '(' + column + ') as aggregate';
    }
    /**
     * Compile the "select *" portion of the query.
     *
     * @param  {\Illuminate\Database\Query\Builder}  query
     * @param  {Array}  columns
     * @return {string|undefined}
     */
    compileColumns(query, columns) {
        // If the query is actually performing an aggregating select, we will let that
        // compiler handle the building of the select clauses, as it will need some
        // more syntax that is best handled by that function to keep things neat.
        if (query.aggregateProperty !== undefined) {
            return '';
        }
        const select = query.distinctProperty !== false ? 'select distinct ' : 'select ';
        return select + this.columnize(columns);
    }
    /**
     * Compile the components necessary for a select clause.
     *
     * @param  {\Illuminate\Database\Query\Builder}  query
     * @return {Array}
     */
    compileComponents(query) {
        const sql = {};
        for (const { name, property } of this.selectComponents) {
            if (this.isExecutable(query, property)) {
                const method = 'compile' + (0, utils_1.capitalize)(name);
                sql[name] = this[method](query, query[property]);
            }
        }
        return sql;
    }
    /**
     * Compile the "from" portion of the query.
     *
     * @param  {\Illuminate\Database\Query\Builder}  query
     * @param  {string}  table
     * @return {string}
     */
    compileFrom(query, table) {
        return 'from ' + this.wrapTable(table);
    }
    /**
     * Compile the "limit" portions of the query.
     *
     * @param  {\Illuminate\Database\Query\Builder}  query
     * @param  {number}  limit
     * @return {string}
     */
    compileLimit(query, limit) {
        return `limit ${limit}`;
    }
    /**
     * Compile the "offset" portions of the query.
     *
     * @param  {\Illuminate\Database\Query\Builder}  query
     * @param  {number}  offset
     * @return {string}
     */
    compileOffset(query, offset) {
        return `offset ${offset}`;
    }
    /**
     * Compile the "order by" portions of the query.
     *
     * @param  {\Illuminate\Database\Query\Builder}  query
     * @param  {Array}  orders
     * @return {string}
     */
    compileOrders(query, orders) {
        if (orders.length > 0) {
            return 'order by ' + this.compileOrdersToArray(query, orders).join(', ');
        }
        return '';
    }
    /**
     * Compile the query orders to an array.
     *
     * @param  {\Illuminate\Database\Query\Builder}  query
     * @param  {Array}  orders
     * @return {Array}
     */
    compileOrdersToArray(query, orders) {
        return orders.map((order) => {
            return order.sql ?? this.wrap(order.column) + ' ' + order.direction;
        });
    }
    /**
     * Compile a select query into SQL.
     *
     * @param  {\Illuminate\Database\Query\Builder}  query
     * @return {string}
     */
    compileSelect(query) {
        if ((query.unions.length > 0 || query.havings.length > 0) && query.aggregateProperty !== undefined) {
            return this.compileUnionAggregate(query);
        }
        // If the query does not have any columns set, we'll set the columns to the
        // * character to just get all of the columns from the database. Then we
        // can build the query and concatenate all the pieces together as one.
        const original = query.columns;
        if (query.columns.length === 0) {
            query.columns = ['*'];
        }
        // To compile the query, we'll spin through each component of the query and
        // see if that component exists. If it does we'll just call the compiler
        // function for the component which is responsible for making the SQL.
        let sql = this.concatenate(this.compileComponents(query)).trim();
        if (query.unions.length > 0) {
            sql = this.wrapUnion(sql) + ' ' + this.compileUnions(query);
        }
        query.columns = original;
        return sql;
    }
    /**
     * Compile a single union statement.
     *
     * @param  {Array}  union
     * @return {string}
     */
    compileUnion(union) {
        const conjunction = union.all ? ' union all ' : ' union ';
        return conjunction + this.wrapUnion(union.query.toSql());
    }
    /**
     * Compile a union aggregate query into SQL.
     *
     * @param  {\Illuminate\Database\Query\Builder}  query
     * @return {string}
     */
    compileUnionAggregate(query) {
        const sql = this.compileAggregate(query, query.aggregateProperty);
        query.aggregateProperty = undefined;
        return sql + ' from (' + this.compileSelect(query) + ') as ' + this.wrapTable('temp_table');
    }
    /**
     * Compile the "union" queries attached to the main query.
     *
     * @param  {\Illuminate\Database\Query\Builder}  query
     * @return {string}
     */
    compileUnions(query) {
        let sql = '';
        for (const union of query.unions) {
            sql += this.compileUnion(union);
        }
        if (query.unionOrders.length > 0) {
            sql += ' ' + this.compileOrders(query, query.unionOrders);
        }
        if (query.unionLimit !== undefined) {
            sql += ' ' + this.compileLimit(query, query.unionLimit);
        }
        if (query.unionOffset !== undefined) {
            sql += ' ' + this.compileOffset(query, query.unionOffset);
        }
        return sql.trimStart();
    }
    /**
     * Concatenate an array of segments, removing empties.
     *
     * @param  {Record<string, string>}  segments
     * @return {string}
     */
    concatenate(segments) {
        return Object.values(segments).filter((value) => {
            return String(value) !== '';
        }).join(' ');
    }
    isExecutable(query, property) {
        const subject = Reflect.get(query, property);
        if (subject === undefined || subject === '') {
            return false;
        }
        if (Array.isArray(subject) && subject.length === 0) {
            return false;
        }
        return true;
    }
    /**
     * Wrap a union subquery in parentheses.
     *
     * @param  {string}  sql
     * @return {string}
     */
    wrapUnion(sql) {
        return `(${sql})`;
    }
}
exports.Grammar = Grammar;
//# sourceMappingURL=Grammar.js.map