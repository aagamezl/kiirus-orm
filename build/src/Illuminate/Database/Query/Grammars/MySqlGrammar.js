"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MySqlGrammar = void 0;
const utils_1 = require("@devnetic/utils");
const lodash_1 = require("lodash");
const Collections_1 = require("../../../Collections");
const Grammar_1 = require("./Grammar");
class MySqlGrammar extends Grammar_1.Grammar {
    constructor() {
        super(...arguments);
        /**
         * The grammar specific operators.
         *
         * @var Array<string>
         */
        this.operators = ['sounds like'];
    }
    /**
     * Compile an insert statement into SQL.
     *
     * @param  \Illuminate\Database\Query\Builder  query
     * @param  Array<any> | any  values
     * @return string
     */
    compileInsert(query, values) {
        if (values.length === 0) {
            values = [[]];
        }
        return super.compileInsert(query, values);
    }
    /**
     * Compile an insert ignore statement into SQL.
     *
     * @param  \Illuminate\Database\Query\Builder  query
     * @param  Array<any> | any  values
     * @return string
     */
    compileInsertOrIgnore(query, values) {
        return this.compileInsert(query, values).replace('insert', 'insert ignore');
    }
    /**
     * Prepare a JSON column being updated using the JSON_SET function.
     *
     * @param  string  key
     * @param  any  value
     * @return string
     */
    compileJsonUpdateColumn(key, value) {
        if (lodash_1.isBoolean(value)) {
            value = value ? 'true' : 'false';
        }
        else if (Array.isArray(value)) {
            value = 'cast(? as json)';
        }
        else {
            value = this.parameter(value);
        }
        const [field, path] = this.wrapJsonFieldAndPath(key);
        return `${field} = json_set(${field}${path}, ${value})`;
    }
    /**
     * Compile the columns for an update statement.
     *
     * @param  \Illuminate\Database\Query\Builder  query
     * @param  values: Array<any>  values
     * @return string
     */
    compileUpdateColumns(query, values) {
        return Collections_1.collect(values).map(([key, value]) => {
            if (this.isJsonSelector(key)) {
                return this.compileJsonUpdateColumn(key, value);
            }
            return this.wrap(key) + ' = ' + this.parameter(value);
        }).join(', ');
    }
    /**
   * Compile an update statement without joins into SQL.
   *
   * @param  \Illuminate\Database\Query\Builder  query
   * @param  string  table
   * @param  string  columns
   * @param  string  where
   * @return string
   */
    compileUpdateWithoutJoins(query, table, columns, where) {
        let sql = super.compileUpdateWithoutJoins(query, table, columns, where);
        if (query.orders.length > 0) {
            sql += ' ' + this.compileOrders(query, query.orders);
        }
        if (query.limitProperty) {
            sql += ' ' + this.compileLimit(query, query.limitProperty);
        }
        return sql;
    }
    /**
     * Compile an "upsert" statement into SQL.
     *
     * @param  \Illuminate\Database\Query\Builder query
     * @param  Array<any>  values
     * @param  Array<any>  uniqueBy
     * @param  Array<any>  update
     * @return string
     *
     * @throws \RuntimeException
     */
    compileUpsert(query, values, uniqueBy, update) {
        const sql = this.compileInsert(query, values) + ' on duplicate key update ';
        // const columns = collect(update).map(([key, value]) => {
        const columns = Collections_1.collect(update).map((value, key) => {
            return utils_1.isNumeric(key)
                ? this.wrap(value) + ' = values(' + this.wrap(value) + ')'
                : this.wrap(key) + ' = ' + this.parameter(value);
        }).implode(', ');
        return sql + columns;
    }
    /**
     * Prepare the bindings for an update statement.
     *
     * Booleans, integers, and doubles are inserted into JSON updates as raw values.
     *
     * @param  Array<any>  bindings
     * @param  Array<any>  values
     * @return Array<any>
     */
    prepareBindingsForUpdate(bindings, values) {
        values = Collections_1.collect(Object.entries(values)).reject((value, column) => {
            return this.isJsonSelector(column) && lodash_1.isBoolean(value);
        }).map(([, value]) => {
            return lodash_1.isPlainObject(value) ? JSON.stringify(value) : value;
        }).all();
        return super.prepareBindingsForUpdate(bindings, values);
    }
    /**
     * Add a "where null" clause to the query.
     *
     * @param  \Illuminate\Database\Query\Builder  query
     * @param  WhereInterface  where
     * @return string
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
     * @param  \Illuminate\Database\Query\Builder  query
     * @param  WhereInterface  where
     * @return string
     */
    whereNotNull(query, where) {
        if (this.isJsonSelector(where.column)) {
            const [field, path] = this.wrapJsonFieldAndPath(where.column);
            return '(json_extract(' + field + path + ') is not null AND json_type(json_extract(' + field + path + ')) != \'NULL\')';
        }
        return super.whereNotNull(query, where);
    }
    /**
     * Wrap the given JSON selector.
     *
     * @param  string  value
     * @return string
     */
    wrapJsonSelector(value) {
        const [field, path] = this.wrapJsonFieldAndPath(value);
        return 'json_unquote(json_extract(' + field + path + '))';
    }
    /**
     * Wrap a single string in keyword identifiers.
     *
     * @param  string  value
     * @return string
     */
    wrapValue(value) {
        return value === '*' ? value : '`' + value.replace('`', '``') + '`';
    }
}
exports.MySqlGrammar = MySqlGrammar;
//# sourceMappingURL=MySqlGrammar.js.map