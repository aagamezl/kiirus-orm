"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SQLiteGrammar = void 0;
const utils_1 = require("@devnetic/utils");
const lodash_1 = require("lodash");
const Collections_1 = require("../../../Collections");
const Support_1 = require("../../../Support");
const Grammar_1 = require("./Grammar");
class SQLiteGrammar extends Grammar_1.Grammar {
    constructor() {
        super(...arguments);
        /**
         * All of the available clause operators.
         *
         * @var Array<string>
         */
        this.operators = [
            '=', '<', '>', '<=', '>=', '<>', '!=',
            'like', 'not like', 'ilike',
            '&', '|', '<<', '>>',
        ];
    }
    /**
     * Compile an insert ignore statement into SQL.
     *
     * @param  \Illuminate\Database\Query\Builder  $query
     * @param  Array<any> | any  values
     * @return string
     */
    compileInsertOrIgnore(query, values) {
        return this.compileInsert(query, values).replace('insert', 'insert or ignore');
    }
    /**
     * Compile an "upsert" statement into SQL.
     *
     * @param  \Illuminate\Database\Query\Builder  query
     * @param  Array<any>  values
     * @param  Array<any>  uniqueBy
     * @param  Array<any>  update
     * @return string
     */
    compileUpsert(query, values, uniqueBy, update) {
        let sql = this.compileInsert(query, values);
        sql += ' on conflict (' + this.columnize(uniqueBy) + ') do update set ';
        const columns = Collections_1.collect(update).map((value, key) => {
            return utils_1.isNumeric(key)
                ? this.wrap(value) + ' = ' + this.wrapValue('excluded') + '.' + this.wrap(value)
                : this.wrap(key) + ' = ' + this.parameter(value);
        }).implode(', ');
        return sql + columns;
    }
    /**
     * Compile a date based where clause.
     *
     * @param  string  type
     * @param  \Illuminate\Database\Query\Builder  query
     * @param  WhereInterface  where
     * @return string
     */
    dateBasedWhere(type, query, where) {
        const value = this.parameter(where['value']);
        return `strftime('${type}', ${this.wrap(where.column)}) ${where.operator} cast(${value} as text)`;
    }
    /**
     * Group the nested JSON columns.
     *
     * @param  Array<any>  values
     * @return Array<any>
     */
    groupJsonColumnsForUpdate(values) {
        const groups = [];
        for (const [key, value] of Object.entries(values)) {
            if (this.isJsonSelector(key)) {
                lodash_1.set(groups, Support_1.Str.after(key, '.').replace('->', '.'), value);
            }
        }
        return groups;
    }
    /**
     * Prepare the bindings for an update statement.
     *
     * @param  Array<any>  bindings
     * @param  Array<any>  values
     * @return Array<any>
     */
    prepareBindingsForUpdate(bindings, values) {
        const groups = this.groupJsonColumnsForUpdate(values);
        values = Collections_1.collect(values).reject((value, key) => {
            return this.isJsonSelector(key);
        }).merge(groups).map((value) => {
            return Array.isArray(value) ? JSON.stringify(value) : value;
        }).all();
        const cleanBindings = lodash_1.reject(bindings, 'select');
        return Object.values([...values, ...Collections_1.Arr.flatten(cleanBindings)]);
    }
    /**
     * Compile a "where date" clause.
     *
     * @param  \Illuminate\Database\Query\Builder  query
     * @param  WhereInterface  where
     * @return string
     */
    whereDate(query, where) {
        return this.dateBasedWhere('%Y-%m-%d', query, where);
    }
    /**
     * Compile a "where day" clause.
     *
     * @param  \Illuminate\Database\Query\Builder  query
     * @param  WhereInterface  where
     * @return string
     */
    whereDay(query, where) {
        return this.dateBasedWhere('%d', query, where);
    }
    /**
   * Compile a "where month" clause.
   *
   * @param  \Illuminate\Database\Query\Builder  query
   * @param  WhereInterface  where
   * @return string
   */
    whereMonth(query, where) {
        return this.dateBasedWhere('%m', query, where);
    }
    /**
     * Compile a "where time" clause.
     *
     * @param  \Illuminate\Database\Query\Builder  query
     * @param  WhereInterface  where
     * @return string
     */
    whereTime(query, where) {
        return this.dateBasedWhere('%H:%M:%S', query, where);
    }
    /**
     * Compile a "where year" clause.
     *
     * @param  \Illuminate\Database\Query\Builder  query
     * @param  WhereInterface  where
     * @return string
     */
    whereYear(query, where) {
        return this.dateBasedWhere('%Y', query, where);
    }
    /**
     * Wrap a union subquery in parentheses.
     *
     * @param  string  sql
     * @return string
     */
    wrapUnion(sql) {
        return 'select * from (' + sql + ')';
    }
}
exports.SQLiteGrammar = SQLiteGrammar;
//# sourceMappingURL=SQLiteGrammar.js.map