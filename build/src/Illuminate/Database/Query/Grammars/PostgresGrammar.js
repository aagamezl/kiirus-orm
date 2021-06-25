"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostgresGrammar = void 0;
const utils_1 = require("@devnetic/utils");
const lodash_1 = require("lodash");
const Collections_1 = require("../../../Collections");
const Grammar_1 = require("./Grammar");
class PostgresGrammar extends Grammar_1.Grammar {
    /**
     * Compile the "select *" portion of the query.
     *
     * @param  \Illuminate\Database\Query\Builder  query
     * @param  array  columns
     * @return string|null
     */
    compileColumns(query, columns) {
        // If the query is actually performing an aggregating select, we will let that
        // compiler handle the building of the select clauses, as it will need some
        // more syntax that is best handled by that to keep things neat.
        if (query.aggregateProperty) {
            return;
        }
        let select;
        if (Array.isArray(query.distinctProperty)) {
            select = 'select distinct on (' + this.columnize(query.distinctProperty) + ') ';
        }
        else if (query.distinctProperty) {
            select = 'select distinct ';
        }
        else {
            select = 'select ';
        }
        return select + this.columnize(columns);
    }
    /**
     * Compile an insert and get ID statement into SQL.
     *
     * @param  \Illuminate\Database\Query\Builder  query
     * @param  Array<any> | any  values
     * @param  string  sequence
     * @return string
     */
    compileInsertGetId(query, values, sequence) {
        return this.compileInsert(query, values) + ' returning ' + this.wrap(sequence !== null && sequence !== void 0 ? sequence : 'id');
    }
    /**
     * Compile an insert ignore statement into SQL.
     *
     * @param  \Illuminate\Database\Query\Builder  query
     * @param  Array<any> | any  values
     * @return string
     */
    compileInsertOrIgnore(query, values) {
        return this.compileInsert(query, values) + ' on conflict do nothing';
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
        const value = this.parameter(where.value);
        return 'extract(' + type + ' from ' + this.wrap(where.column) + ') ' + where['operator'] + ' ' + value;
    }
    /**
     * Prepare the bindings for an update statement.
     *
     * @param  Array<any>  bindings
     * @param  Array<any>  values
     * @return Array<any>
     */
    prepareBindingsForUpdate(bindings, values) {
        values = Collections_1.collect(values).map((value, column) => {
            return Array.isArray(value) || (this.isJsonSelector(column) && !this.isExpression(value))
                ? JSON.stringify(value)
                : value;
        }).all();
        const cleanBindings = lodash_1.reject(bindings, 'select');
        return Object.values([...values, ...Collections_1.Arr.flatten(cleanBindings)]);
    }
    /**
     * {@inheritdoc}
     *
     * @param  \Illuminate\Database\Query\Builder  query
     * @param  WhereInterface  where
     * @return string
     */
    whereBasic(query, where) {
        var _a;
        if ((_a = where.operator) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes('like')) {
            return `${this.wrap(where.column)}::text ${where.operator} ${this.parameter(where.value)}`;
        }
        return super.whereBasic(query, where);
    }
    /**
     * Compile a "where date" clause.
     *
     * @param  \Illuminate\Database\Query\Builder  query
     * @param  WhereInterface  where
     * @return string
     */
    whereDate(query, where) {
        const value = this.parameter(where.value);
        return this.wrap(where.column) + '::date ' + where.operator + ' ' + value;
    }
    /**
     * Compile a "where time" clause.
     *
     * @param  \Illuminate\Database\Query\Builder  query
     * @param  WhereInterface  where
     * @return string
     */
    whereTime(query, where) {
        const value = this.parameter(where['value']);
        return this.wrap(where.column) + '::time ' + where.operator + ' ' + value;
    }
}
exports.PostgresGrammar = PostgresGrammar;
//# sourceMappingURL=PostgresGrammar.js.map