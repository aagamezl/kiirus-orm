"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SqlServerGrammar = void 0;
const utils_1 = require("@devnetic/utils");
const lodash_1 = require("lodash");
const Collections_1 = require("../../../Collections");
const Grammar_1 = require("./Grammar");
class SqlServerGrammar extends Grammar_1.Grammar {
    constructor() {
        super(...arguments);
        /**
         * All of the available clause operators.
         *
         * @var Aray<string>
         */
        this.operators = [
            '=', '<', '>', '<=', '>=', '!<', '!>', '<>', '!=',
            'like', 'not like', 'ilike',
            '&', '&=', '|', '|=', '^', '^=',
        ];
    }
    /**
     * Create a full ANSI offset clause for the query.
     *
     * @param  \Illuminate\Database\Query\Builder  query
     * @param  array  components
     * @return string
     */
    compileAnsiOffset(query, components) {
        // An ORDER BY clause is required to make this offset query work, so if one does
        // not exist we'll just create a dummy clause to trick the database and so it
        // does not complain about the queries for not having an "order by" clause.
        if (components.orders.length === 0) {
            components.orders = 'order by (select 0)';
        }
        // We need to add the row number to the query so we can compare it to the offset
        // and limit values given for the statements. So we will add an expression to
        // the "select" that will give back the row numbers on each of the records.
        components.columns += this.compileOver(components.orders);
        components.orders = [];
        // Next we need to calculate the constraints that should be placed on the query
        // to get the right offset and limit from our query but if there is no limit
        // set we will just handle the offset only since that is all that matters.
        const sql = this.concatenate(components);
        return this.compileTableExpression(sql, query);
    }
    /**
     * Compile the "select *" portion of the query.
     *
     * @param  \Illuminate\Database\Query\Builder  query
     * @param  Array<any>  columns
     * @return string|undefined
     */
    compileColumns(query, columns) {
        var _a, _b;
        if (query.aggregateProperty) {
            return;
        }
        let select = query.distinctProperty ? 'select distinct ' : 'select ';
        const limit = Number((_a = query.limitProperty) !== null && _a !== void 0 ? _a : 0);
        const offset = Number((_b = query.offsetProperty) !== null && _b !== void 0 ? _b : 0);
        // If there is a limit on the query, but not an offset, we will add the top
        // clause to the query, which serves as a "limit" type clause within the
        // SQL Server system similar to the limit keywords available in MySQL.
        if (utils_1.isNumeric(query.limitProperty) && limit > 0 && offset <= 0) {
            select += `top ${limit} `;
        }
        return select + this.columnize(columns);
    }
    /**
     * Compile an exists statement into SQL.
     *
     * @param  \Illuminate\Database\Query\Builder  query
     * @return string
     */
    compileExists(query) {
        const existsQuery = lodash_1.clone(query);
        existsQuery.columns = [];
        return this.compileSelect(existsQuery.selectRaw('1 [exists]').limit(1));
    }
    /**
     * Compile the "limit" portions of the query.
     *
     * @param  \Illuminate\Database\Query\Builder  query
     * @param  number  limit
     * @return string
     */
    compileLimit(query, limit) {
        return '';
    }
    /**
     * Compile the "offset" portions of the query.
     *
     * @param  \Illuminate\Database\Query\Builder  query
     * @param  number  offset
     * @return string
     */
    compileOffset(query, offset) {
        return '';
    }
    /**
     * Compile the over statement for a table expression.
     *
     * @param  string  orderings
     * @return string
     */
    compileOver(orderings) {
        return `, row_number() over (${orderings}) as row_num`;
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
        const columns = this.columnize(Object.keys(Collections_1.reset(values)));
        let sql = 'merge ' + this.wrapTable(query.fromProperty) + ' ';
        const parameters = Collections_1.collect(values).map((record) => {
            return '(' + this.parameterize(record) + ')';
        }).implode(', ');
        sql += 'using (values ' + parameters + ') ' + this.wrapTable('laravel_source') + ' (' + columns + ') ';
        const on = Collections_1.collect(uniqueBy).map((column) => {
            return this.wrap('laravel_source.' + column) + ' = ' + this.wrap(query.fromProperty + '.' + column);
        }).implode(' and ');
        sql += 'on ' + on + ' ';
        if (update.length > 0) {
            const updateSql = Collections_1.collect(update).map((value, key) => {
                return utils_1.isNumeric(key)
                    ? this.wrap(value) + ' = ' + this.wrap('laravel_source.' + value)
                    : this.wrap(key) + ' = ' + this.parameter(value);
            }).implode(', ');
            sql += 'when matched then update set ' + updateSql + ' ';
        }
        sql += 'when not matched then insert (' + columns + ') values (' + columns + ');';
        return sql;
    }
    /**
     * Compile the limit / offset row constraint for a query.
     *
     * @param  \Illuminate\Database\Query\Builder  query
     * @return string
     */
    compileRowConstraint(query) {
        const start = Number(query.offsetProperty) + 1;
        if (Number(query.limitProperty) > 0) {
            const finish = Number(query.offsetProperty) + Number(query === null || query === void 0 ? void 0 : query.limitProperty);
            return `between ${start} and ${finish}`;
        }
        return `>= ${start}`;
    }
    /**
     * Compile a common table expression for a query.
     *
     * @param  string  $sql
     * @param  \Illuminate\Database\Query\Builder  $query
     * @return string
     */
    compileTableExpression(sql, query) {
        const constraint = this.compileRowConstraint(query);
        return `select * from (${sql}) as temp_table where row_num ${constraint} order by row_num`;
    }
    /**
     * Compile a select query into SQL.
     *
     * @param  \Illuminate\Database\Query\Builder  query
     * @return string
     */
    compileSelect(query) {
        if (!query.offsetProperty) {
            return super.compileSelect(query);
        }
        // If an offset is present on the query, we will need to wrap the query in
        // a big "ANSI" offset syntax block. This is very nasty compared to the
        // other database systems but is necessary for implementing features.
        if (query.columns.length === 0) {
            query.columns = ['*'];
        }
        return this.compileAnsiOffset(query, this.compileComponents(query));
    }
    /**
     * Prepare the bindings for an update statement.
     *
     * @param  Array<any>  bindings
     * @param  Array<any>  values
     * @return Array<any>
     */
    prepareBindingsForUpdate(bindings, values) {
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
        const value = this.parameter(where.value);
        return 'cast(' + this.wrap(where.column) + ' as date) ' + where.operator + ' ' + value;
    }
    /**
     * Compile a "where time" clause.
     *
     * @param  \Illuminate\Database\Query\Builder  query
     * @param  WhereInterface  where
     * @return string
     */
    whereTime(query, where) {
        const value = this.parameter(where.value);
        return 'cast(' + this.wrap(where.column) + ' as time) ' + where.operator + ' ' + value;
    }
    /**
     * Wrap a table in keyword identifiers.
     *
     * @param  \Illuminate\Database\Query\Expression|string  table
     * @return string
     */
    wrapTable(table) {
        if (!this.isExpression(table)) {
            return this.wrapTableValuedFunction(super.wrapTable(table));
        }
        return this.getValue(table);
    }
    /**
     * Wrap a table in keyword identifiers.
     *
     * @param  string  table
     * @return string
     */
    wrapTableValuedFunction(table) {
        const matches = [...table.matchAll(/^(.+?)(\(.*?\))]/g)];
        if (matches.length > 0) {
            table = matches[1] + ']' + matches[2];
        }
        return table;
    }
    /**
     * Wrap a union subquery in parentheses.
     *
     * @param  string  sql
     * @return string
     */
    wrapUnion(sql) {
        return 'select * from (' + sql + ') as ' + this.wrapTable('temp_table');
    }
    /**
     * Wrap a single string in keyword identifiers.
     *
     * @param  string  value
     * @return string
     */
    wrapValue(value) {
        return value === '*' ? value : '[' + value.replace(']', ']]') + ']';
    }
}
exports.SqlServerGrammar = SqlServerGrammar;
//# sourceMappingURL=SqlServerGrammar.js.map