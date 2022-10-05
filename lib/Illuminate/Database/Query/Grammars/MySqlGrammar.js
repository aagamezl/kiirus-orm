"use strict";
// import { isTruthy } from '@devnetic/utils'
Object.defineProperty(exports, "__esModule", { value: true });
exports.MySqlGrammar = void 0;
const Support_1 = require("../../../Support");
const Grammar_1 = require("./Grammar");
class MySqlGrammar extends Grammar_1.Grammar {
    constructor() {
        super(...arguments);
        /**
         * The grammar specific operators.
         *
         * @type {string[]}
         */
        this.operators = ['sounds like'];
    }
    /**
     * Compile an insert ignore statement into SQL.
     *
     * @param  {\Illuminate\Database\Query\Builder}  query
     * @param  {Record<string, any>}  values
     * @return {string}
     */
    compileInsertOrIgnore(query, values) {
        return this.compileInsert(query, values).replace('insert', 'insert ignore');
    }
    /**
     * Compile a "where fulltext" clause.
     *
     * @param  {\Illuminate\Database\Query\Builder}  query
     * @param  {Where}  where
     * @return {string}
     */
    whereFulltext(query, where) {
        const columns = this.columnize(where.columns);
        const value = this.parameter(where.value);
        const mode = (where.options.mode ?? []) === 'boolean'
            ? ' in boolean mode'
            : ' in natural language mode';
        const expanded = ((0, Support_1.isTruthy)(where.options.expanded) ?? []) && (where.options.mode ?? []) !== 'boolean'
            ? ' with query expansion'
            : '';
        return `match (${columns}) against (` + value + `${mode}${expanded})`;
    }
    /**
     * Add a "where null" clause to the query.
     *
     * @param  {\Illuminate\Database\Query\Builder}  query
     * @param  {Where}  where
     * @return {string}
     */
    whereNull(query, where) {
        if (this.isJsonSelector(where.column)) {
            const [field, path] = this.wrapJsonFieldAndPath(where.column);
            return '(json_extract(' + field + path + ') is null OR json_type(json_extract(' + field + path + ')) = \'NULL\')';
        }
        return super.whereNull(query, where);
    }
    /**
     * Add a "where not null" clause to the query.
     *
     * @param  {\Illuminate\Database\Query\Builder}  query
     * @param  {Where}  where
     * @return {string}
     */
    whereNotNull(query, where) {
        if (this.isJsonSelector(where.column)) {
            const [field, path] = this.wrapJsonFieldAndPath(where.column);
            return '(json_extract(' + field + path + ') is not null AND json_type(json_extract(' + field + path + ')) != \'NULL\')';
        }
        return super.whereNotNull(query, where);
    }
    /**
     * Wrap the given JSON selector for boolean values.
     *
     * @param  {string}  value
     * @return {string}
     */
    wrapJsonBooleanSelector(value) {
        const [field, path] = this.wrapJsonFieldAndPath(value);
        return `json_extract(${field}${path})`;
    }
    /**
     * Wrap the given JSON selector.
     *
     * @param  {string}  value
     * @return {string}
     */
    wrapJsonSelector(value) {
        const [field, path] = this.wrapJsonFieldAndPath(value);
        return 'json_unquote(json_extract(' + field + path + '))';
    }
    /**
     * Wrap a single string in keyword identifiers.
     *
     * @param  {string}  value
     * @return {string}
     */
    wrapValue(value) {
        return value === '*' ? value : '`' + value.replace('`', '``') + '`';
    }
}
exports.MySqlGrammar = MySqlGrammar;
//# sourceMappingURL=MySqlGrammar.js.map