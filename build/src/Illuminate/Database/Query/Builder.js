"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Builder = void 0;
const utils = require("@devnetic/utils");
const lodash_1 = require("lodash");
const Builder_1 = require("../Eloquent/Query/Builder");
const Relation_1 = require("../Eloquent/Relations/Relation");
const Expression_1 = require("./Expression");
const Arr_1 = require("../../Collections/Arr");
const Helpers_1 = require("../../Collections/Helpers");
const internal_1 = require("./internal");
const Support_1 = require("../../Support");
class Builder {
    constructor(connection, grammar, processor) {
        /**
         * The callbacks that should be invoked before the query is executed.
         *
         * @var array
         */
        this.beforeQueryCallbacks = [];
        /**
         * The current query value bindings.
         *
         * @var object
         */
        this.bindings = {
            'select': [],
            'from': [],
            'join': [],
            'where': [],
            'groupBy': [],
            'having': [],
            'order': [],
            'union': [],
            'unionOrder': [],
        };
        /**
         * The columns that should be returned.
         *
         * @var array
         */
        this.columns = [];
        /**
         * Indicates if the query returns distinct results.
         *
         * Occasionally contains the columns that should be distinct.
         *
         * @var bool|array
         */
        this.distinctProperty = false;
        /**
         * The table which the query is targeting.
         *
         * @var string
         */
        this.fromProperty = '';
        /**
         * The groupings for the query.
         *
         * @var Array<any>
         */
        this.groups = [];
        /**
         * The having constraints for the query.
         *
         * @var array
         */
        this.havings = [];
        /**
         * The table joins for the query.
         *
         * @var array
         */
        this.joins = [];
        /**
         * All of the available clause operators.
         *
         * @var string[]
         */
        this.operators = [
            '=', '<', '>', '<=', '>=', '<>', '!=', '<=>',
            'like', 'like binary', 'not like', 'ilike',
            '&', '|', '^', '<<', '>>',
            'rlike', 'not rlike', 'regexp', 'not regexp',
            '~', '~*', '!~', '!~*', 'similar to',
            'not similar to', 'not ilike', '~~*', '!~~*',
        ];
        /**
         * The orderings for the query.
         *
         * @var Array<any>
         */
        this.orders = [];
        /**
         * The query union statements.
         *
         * @var array
         */
        this.unions = [];
        /**
         * The orderings for the union query.
         *
         * @var array
         */
        this.unionOrders = [];
        /**
         * The where constraints for the query.
         *
         * @var array
         */
        this.wheres = [];
        this.connection = connection;
        this.grammar = grammar !== null && grammar !== void 0 ? grammar : connection.getQueryGrammar();
        this.processor = processor !== null && processor !== void 0 ? processor : connection.getPostProcessor();
    }
    // get(t: any, p: PropertyKey, r: any): any {
    // }
    /**
     * Add an array of where clauses to the query.
     *
     * @param  array  column
     * @param  string  boolean
     * @param  string  method
     * @return this
     */
    addArrayOfWheres(column, boolean, method = 'where') {
        return this.whereNested((query) => {
            for (const [key, value] of Object.entries(column)) {
                if (lodash_1.isInteger(parseInt(key, 10)) && Array.isArray(value)) {
                    query[method](...value);
                }
                else {
                    query[method](key, '=', value, boolean);
                }
            }
        }, boolean);
    }
    /**
     * Add a binding to the query.
     *
     * @param  mixed  value
     * @param  string  type
     * @return this
     *
     * @throws \InvalidArgumentException
     */
    addBinding(value, type = 'where') {
        if (!this.bindings[type]) {
            throw new TypeError(`InvalidArgumentException: Invalid binding type: ${type}.`);
        }
        if (Array.isArray(value)) {
            this.bindings[type] = Array.from(Object.values([...this.bindings[type], ...value]));
        }
        else {
            this.bindings[type].push(value);
        }
        return this;
    }
    /**
     * Add a date based (year, month, day, time) statement to the query.
     *
     * @param  string  type
     * @param  string  column
     * @param  string  operator
     * @param  any  value
     * @param  string  boolean
     * @return Builder
     */
    addDateBasedWhere(type, column, operator, value, boolean = 'and') {
        this.wheres.push({ column, type, boolean, operator, value });
        if (!(value instanceof Expression_1.Expression)) {
            this.addBinding(value, 'where');
        }
        return this;
    }
    /**
     * Add another query builder as a nested where to the query builder.
     *
     * @param  \Illuminate\Database\Query\Builder  query
     * @param  string  boolean
     * @return Builder
     */
    addNestedWhereQuery(query, boolean = 'and') {
        if (query.wheres.length > 0) {
            const type = 'Nested';
            this.wheres.push({ type, query, boolean });
            this.addBinding(query.getRawBindings()['where'], 'where');
        }
        return this;
    }
    /**
     * Add a new select column to the query.
     *
     * @param  array|mixed  column
     * @return Builder
     */
    addSelect(column) {
        const columns = Array.isArray(column) ? column : [...arguments];
        for (const [as, column] of Object.entries(columns)) {
            if (typeof as === 'string' && this.isQueryable(column)) {
                if (this.columns) {
                    this.select(this.fromProperty + '.*');
                }
                this.selectSub(column, as);
            }
            else {
                this.columns.push(column);
            }
        }
        return this;
    }
    /**
     * Add an exists clause to the query.
     *
     * @param  \Illuminate\Database\Query\Builder  query
     * @param  string  boolean
     * @param  boolean  not
     * @return Builder
     */
    addWhereExistsQuery(query, boolean = 'and', not = false) {
        const type = not ? 'NotExists' : 'Exists';
        this.wheres.push({ type, query, boolean });
        this.addBinding(query.getBindings(), 'where');
        return this;
    }
    /**
     * Execute an aggregate function on the database.
     *
     * @param  string  functionName
     * @param  Array<any>  columns
     * @return any
     */
    aggregate(functionName, columns = ['*']) {
        // We need to save the original bindings, because the cloneWithoutBindings
        // method delete them from the builder object
        const bindings = Object.assign({}, this.bindings);
        const results = this.cloneWithout(this.unions.length > 0 || this.havings.length > 0 ? [] : ['columns'])
            .cloneWithoutBindings(this.unions.length > 0 || this.havings.length > 0 ? [] : ['select'])
            .setAggregate(functionName, columns)
            .get(columns);
        this.bindings = bindings;
        if (!results.isEmpty()) {
            // return array_change_key_case(results[0])['aggregate'];
            return results.all()[0]['aggregate'];
        }
    }
    /**
     * Invoke the "before query" modification callbacks.
     *
     * @return void
     */
    applyBeforeQueryCallbacks() {
        for (const callback of this.beforeQueryCallbacks) {
            callback(this);
        }
        this.beforeQueryCallbacks = [];
    }
    /**
     * Remove all of the expressions from a list of bindings.
     *
     * @param  array  bindings
     * @return array
     */
    cleanBindings(bindings) {
        return Arr_1.Arr.values(bindings.filter((binding) => {
            return !(binding instanceof Expression_1.Expression);
        }));
    }
    /**
     * Clone the query.
     *
     * @return Builder
     */
    clone() {
        const cloned = Object.assign({}, this);
        Object.setPrototypeOf(cloned, Object.getPrototypeOf(this));
        return cloned;
        // return clone(this);
        // const cloned = Object.assign({}, this);
        // const descriptors = this instanceof Builder ? Object.getOwnPropertyDescriptors(Object.getPrototypeOf(this)) : Object.getOwnPropertyDescriptors(this);
        // Object.defineProperties(cloned, descriptors);
        // return cloned;
    }
    /**
     * Clone the existing query instance for usage in a pagination subquery.
     *
     * @return Builder
     */
    cloneForPaginationCount() {
        return this.cloneWithout(['orders', 'limitProperty', 'offsetProperty'])
            .cloneWithoutBindings(['order']);
    }
    /**
     * Clone the query without the given properties.
     *
     * @param  Array<any>  properties
     * @return Builder
     */
    cloneWithout(properties) {
        return Support_1.tap(this.clone(), (clone) => {
            for (const property of properties) {
                if (Array.isArray(clone[property])) {
                    clone[property] = [];
                }
                else {
                    clone[property] = undefined;
                }
            }
        });
    }
    /**
     * Clone the query without the given bindings.
     *
     * @param  Array<string>  except
     * @return Builder
     */
    cloneWithoutBindings(except) {
        return Support_1.tap(this.clone(), (clone) => {
            for (const type of except) {
                clone.bindings[type] = [];
            }
        });
    }
    /**
     * Retrieve the "count" result of the query.
     *
     * @param  string  columns
     * @return number
     */
    count(columns = '*') {
        return this.aggregate('count', Arr_1.Arr.wrap(columns));
    }
    /**
     * Creates a subquery and parse it.
     *
     * @param  Function|Builder|string  query
     * @return array
     */
    createSub(query) {
        // If the given query is a Closure, we will execute it while passing in a new
        // query instance to the Closure. This will give the developer a chance to
        // format and work with the query before we cast it to a raw SQL string.
        if (query instanceof Function) {
            const callback = query;
            query = this.forSubQuery();
            callback(query);
        }
        return this.parseSub(query);
    }
    /**
     * Add a "cross join" clause to the query.
     *
     * @param  string  table
     * @param  [Function|string]  first
     * @param  [string]  operator
     * @param  [string]  second
     * @return Builder
     */
    crossJoin(table, first, operator, second) {
        if (first) {
            return this.join(table, first, operator, second, 'cross');
        }
        this.joins.push(this.newJoinClause(this, 'cross', table));
        return this;
    }
    /**
     * Add a subquery cross join to the query.
     *
     * @param  Function|\Illuminate\Database\Query\Builder|string  query
     * @param  string  as
     * @return Builder
     */
    crossJoinSub(query, as) {
        let bindings;
        [query, bindings] = this.createSub(query);
        const expression = '(' + query + ') as ' + this.grammar.wrapTable(as);
        this.addBinding(bindings, 'join');
        this.joins.push(this.newJoinClause(this, 'cross', new Expression_1.Expression(expression)));
        return this;
    }
    /**
     * Force the query to only return distinct results.
     *
     * @return this
     */
    distinct(...columns) {
        // const columns = [...arguments];
        if (columns.length > 0) {
            this.distinctProperty = Array.isArray(columns[0]) || typeof columns[0] === 'boolean' ? columns[0] : columns;
        }
        else {
            this.distinctProperty = true;
        }
        return this;
    }
    /**
     * Determine if no rows exist for the current query.
     *
     * @return boolean
     */
    doesntExist() {
        return !this.exists();
    }
    /**
     * Execute the given callback if rows exist for the current query.
     *
     * @param  Function  callback
     * @return any
     */
    doesntExistOr(callback) {
        return this.doesntExist() ? true : callback();
    }
    /**
     * Determine if any rows exist for the current query.
     *
     * @return bool
     */
    exists() {
        this.applyBeforeQueryCallbacks();
        let results = this.connection.select(this.grammar.compileExists(this), this.getBindings());
        // If the results has rows, we will get the row and see if the exists column is a
        // boolean true. If there is no results for this query we will return false as
        // there are no rows for this query at all and we can return that info here.
        if (results[0]) {
            results = results[0];
            return !!results['exists'];
        }
        return false;
    }
    /**
     * Execute the given callback if no rows exist for the current query.
     *
     * @param  Function  callback
     * @return any
     */
    existsOr(callback) {
        return this.exists() ? true : callback();
    }
    /**
     * Execute a query for a single record by ID.
     *
     * @param  number|string  id
     * @param  array  columns
     * @return any|this
     */
    find(id, columns = ['*']) {
        return this.where('id', '=', id).first(columns);
    }
    /**
     * Execute the query and get the first result.
     *
     * @param  array|string  columns
     * @return \Illuminate\Database\Eloquent\Model|object|static|undefined
     */
    first(columns = ['*']) {
        return this.take(1).get(columns).first();
    }
    /**
     * Get a scalar type value from an unknown type of input.
     *
     * @param  any  value
     * @return any
     */
    flattenValue(value) {
        return Array.isArray(value) ? Helpers_1.head(Arr_1.Arr.flatten(value)) : value;
    }
    /**
     * Create a new query instance for nested where condition.
     *
     * @return \Illuminate\Database\Query\Builder
     */
    forNestedWhere() {
        return this.newQuery().from(this.fromProperty);
    }
    /**
     * Set the limit and offset for a given page.
     *
     * @param  number  page
     * @param  number  perPage
     * @return Builder
     */
    forPage(page, perPage = 15) {
        return this.offset((page - 1) * perPage).limit(perPage);
    }
    /**
     * Create a new query instance for a sub-query.
     *
     * @return \Illuminate\Database\Query\Builder
     */
    forSubQuery() {
        return this.newQuery();
    }
    /**
     * Set the table which the query is targeting.
     *
     * @param  Function|Builder|string table
     * @param  string as
     * @return this
     */
    from(table, as = '') {
        if (this.isQueryable(table)) {
            return this.fromSub(table, as);
        }
        this.fromProperty = (as ? `${table} as ${as}` : table);
        return this;
    }
    /**
     * Add a raw from clause to the query.
     *
     * @param  string  expression
     * @param  mixed  bindings
     * @return this
     */
    fromRaw(expression, bindings = []) {
        this.fromProperty = new Expression_1.Expression(expression);
        this.addBinding(bindings, 'from');
        return this;
    }
    /**
     * Makes "from" fetch from a subquery.
     *
     * @param  Function|Builder|string  query
     * @param  string  as
     * @return this
     *
     * @throws \InvalidArgumentException
     */
    fromSub(query, as) {
        const [newQuery, bindings] = this.createSub(query);
        return this.fromRaw('(' + newQuery + ') as ' + this.grammar.wrapTable(as), bindings);
    }
    /**
     * Execute the query as a "select" statement.
     *
     * @param  array|string  columns
     * @return \Illuminate\Support\Collection
     */
    get(columns = ['*']) {
        return Helpers_1.collect(this.onceWithColumns(Arr_1.Arr.wrap(columns), () => {
            return this.processor.processSelect(this, this.runSelect());
        }));
    }
    /**
     * Get the current query value bindings in a flattened array.
     *
     * @return array
     */
    getBindings() {
        return Arr_1.Arr.flatten(this.bindings);
    }
    /**
     * Get the database connection instance.
     *
     * @return \Illuminate\Database\Connection
     */
    getConnection() {
        return this.connection;
    }
    /**
     * Get the count of the total records for the paginator.
     *
     * @param  Array<any>  columns
     * @return number
     */
    getCountForPagination(columns = ['*']) {
        var _a;
        const results = this.runPaginationCountQuery(columns);
        // Once we have run the pagination count query, we will get the resulting count and
        // take into account what type of query it was. When there is a group by we will
        // just return the count of the entire results set since that will be correct.
        if (!results[0]) {
            return 0;
        }
        else if (lodash_1.isObjectLike(results[0])) {
            return parseInt((_a = results[0]) === null || _a === void 0 ? void 0 : _a.aggregate, 10);
        }
        return parseInt(Support_1.changeKeyCase(results[0])['aggregate'], 10);
    }
    /**
     * Get the query grammar instance.
     *
     * @return \Illuminate\Database\Query\Grammars\Grammar
     */
    getGrammar() {
        return this.grammar;
    }
    /**
     * Get the database query processor instance.
     *
     * @return \Illuminate\Database\Query\Processors\Processor
     */
    getProcessor() {
        return this.processor;
    }
    /**
     * Get the raw array of bindings.
     *
     * @return TBindings
     */
    getRawBindings() {
        return this.bindings;
    }
    /**
     * Add a "group by" clause to the query.
     *
     * @param  string | Array<any>  ...groups
     * @return Builder
     */
    groupBy(...groups) {
        for (const group of groups) {
            this.groups = [
                ...this.groups,
                ...Arr_1.Arr.wrap(group)
            ];
        }
        return this;
    }
    /**
     * Add a raw groupBy clause to the query.
     *
     * @param  string  sql
     * @param  array  bindings
     * @return Builder
     */
    groupByRaw(sql, bindings = []) {
        this.groups.push(new Expression_1.Expression(sql));
        this.addBinding(bindings, 'groupBy');
        return this;
    }
    /**
     * Add a "having" clause to the query.
     *
     * @param  string  column
     * @param  [string]  operator
     * @param  [string]  value
     * @param  string  boolean
     * @return Builder
     */
    having(column, operator, value, boolean = 'and') {
        const type = 'Basic';
        // Here we will make some assumptions about the operator. If only 2 values are
        // passed to the method, we will assume that the operator is an equals sign
        // and keep going. Otherwise, we'll require the operator to be passed in.
        [value, operator] = this.prepareValueAndOperator(value, operator, arguments.length === 2);
        // If the given operator is not found in the list of valid operators we will
        // assume that the developer is just short-cutting the '=' operators and
        // we will set the operators to '=' and set the values appropriately.
        if (this.invalidOperator(operator)) {
            [value, operator] = [operator, '='];
        }
        this.havings.push({ type, column, operator, value, boolean });
        if (!(value instanceof Expression_1.Expression)) {
            this.addBinding(this.flattenValue(value), 'having');
        }
        return this;
    }
    /**
     * Add a "having between " clause to the query.
     *
     * @param  string  column
     * @param  array  values
     * @param  string  boolean
     * @param  boolean  not
     * @return Builder
     */
    havingBetween(column, values, boolean = 'and', not = false) {
        const type = 'between';
        this.havings.push({ type, column, values, boolean, not });
        this.addBinding(this.cleanBindings(Arr_1.Arr.flatten(values)).slice(0, 2), 'having');
        return this;
    }
    /**
     * Add a raw having clause to the query.
     *
     * @param  string  sql
     * @param  array  bindings
     * @param  string  boolean
     * @return Builder
     */
    havingRaw(sql, bindings = [], boolean = 'and') {
        const type = 'Raw';
        this.havings.push({ type, sql, boolean });
        this.addBinding(bindings, 'having');
        return this;
    }
    /**
     * Concatenate values of a given column as a string.
     *
     * @param  string  column
     * @param  string  glue
     * @return string
     */
    implode(column, glue = '') {
        return this.pluck(column).implode(glue);
    }
    /**
     * Insert new records into the database.
     *
     * @param  Array<any> | any  values
     * @return boolean
     */
    insert(values) {
        // Since every insert gets treated like a batch insert, we will make sure the
        // bindings are structured in a way that is convenient when building these
        // inserts statements by verifying these elements are actually an array.
        if (Object.keys(values).length === 0 || values.length === 0) {
            return true;
        }
        if (!Array.isArray(Helpers_1.reset(values)) && !lodash_1.isPlainObject(Helpers_1.reset(values))) {
            values = [values];
        }
        // Here, we will sort the insert keys for every record so that each insert is
        // in the same order for the record. We need to make sure this is the case
        // so there are not any errors or problems when inserting these records.
        // else {
        //   for (const [key, value] of Object.entries(values)) {
        //     values[key] = value.sort();
        //   }
        // }
        this.applyBeforeQueryCallbacks();
        // Finally, we will run this query against the database connection and return
        // the results. We will need to also flatten these bindings before running
        // the query so they are all in one huge, flattened array for execution.
        return this.connection.insert(this.grammar.compileInsert(this, values), this.cleanBindings(Arr_1.Arr.flatten(values, 1)));
    }
    /**
     * Insert a new record and get the value of the primary key.
     *
     * @param  Array<any> | any  values
     * @param  [string]  sequence
     * @return number
     */
    insertGetId(values, sequence) {
        this.applyBeforeQueryCallbacks();
        if (!Array.isArray(Helpers_1.reset(values)) && !lodash_1.isObjectLike(values)) {
            values = [values];
        }
        const sql = this.grammar.compileInsertGetId(this, values, sequence);
        values = this.cleanBindings(Arr_1.Arr.flatten(values, 1));
        return this.processor.processInsertGetId(this, sql, values, sequence);
    }
    /**
     * Insert new records into the database while ignoring errors.
     *
     * @param  Array<any> | any  values
     * @return number
     */
    insertOrIgnore(values) {
        if (Object.keys(values).length === 0 || values.length === 0) {
            return 0;
        }
        if (!Array.isArray(Helpers_1.reset(values)) && !lodash_1.isObjectLike(values)) {
            values = [values];
        }
        this.applyBeforeQueryCallbacks();
        return this.connection.affectingStatement(this.grammar.compileInsertOrIgnore(this, values), this.cleanBindings(Arr_1.Arr.flatten(values, 1)));
    }
    /**
     * Insert new records into the table using a subquery.
     *
     * @param  array  columns
     * @param  Function|\Illuminate\Database\Query\Builder|string  query
     * @return number
     */
    insertUsing(columns, query) {
        this.applyBeforeQueryCallbacks();
        const [sql, bindings] = this.createSub(query);
        return this.connection.affectingStatement(this.grammar.compileInsertUsing(this, columns, sql), this.cleanBindings(bindings));
    }
    /**
     * Determine if the given operator is supported.
     *
     * @param  string  operator
     * @return boolean
     */
    invalidOperator(operator) {
        return !this.operators.includes(operator.toLowerCase()) &&
            !this.grammar.getOperators().includes(operator.toLowerCase());
    }
    /**
     * Determine if the given operator and value combination is legal.
     *
     * Prevents using Null values with invalid operators.
     *
     * @param  string  operator
     * @param  mixed  value
     * @return bool
     */
    invalidOperatorAndValue(operator, value) {
        return !value && this.operators.includes(operator) &&
            !['=', '<>', '!='].includes(operator);
    }
    /**
     * Determine if the value is a query builder instance or a Closure.
     *
     * @param  any  value
     * @return boolean
     */
    isQueryable(value) {
        return value instanceof Builder ||
            value instanceof Builder_1.Builder ||
            value instanceof Relation_1.Relation ||
            value instanceof Function;
    }
    /**
     * Add a join clause to the query.
     *
     * @param  string  table
     * @param  Function|string  first
     * @param  [string]  operator
     * @param  [string]  second
     * @param  string  type
     * @param  boolean  where
     * @return Builder
     */
    join(table, first, operator, second, type = 'inner', where = false) {
        const join = this.newJoinClause(this, type, table);
        // If the first "column" of the join is really a Closure instance the developer
        // is trying to build a join with a complex "on" clause containing more than
        // one condition, so we'll add the join and call a Closure with the query.
        if (first instanceof Function) {
            first(join);
            this.joins.push(join);
            this.addBinding(join.getBindings(), 'join');
        }
        // If the column is simply a string, we can assume the join simply has a basic
        // "on" clause with a single condition. So we will just build the join with
        // this simple join clauses attached to it. There is not a join callback.
        else {
            const method = where ? 'where' : 'on';
            this.joins.push(join[method](first, operator, second));
            this.addBinding(join.getBindings(), 'join');
        }
        return this;
    }
    /**
     * Add a subquery join clause to the query.
     *
     * @param  Function|\Illuminate\Database\Query\Builder|\Illuminate\Database\Eloquent\Builder|string  query
     * @param  string  as
     * @param  Function|string  first
     * @param  string|null  operator
     * @param  string|null  second
     * @param  string  type
     * @param  boolean  where
     * @return this
     *
     * @throws \InvalidArgumentException
     */
    joinSub(query, as, first, operator, second, type = 'inner', where = false) {
        let bindings;
        [query, bindings] = this.createSub(query);
        const expression = '(' + query + ') as ' + this.grammar.wrapTable(as);
        this.addBinding(bindings, 'join');
        return this.join(new Expression_1.Expression(expression), first, operator, second, type, where);
    }
    /**
     * Add a "join where" clause to the query.
     *
     * @param  string  table
     * @param  Function|string  first
     * @param  string  operator
     * @param  string  second
     * @param  string  type
     * @return this
     */
    joinWhere(table, first, operator, second, type = 'inner') {
        return this.join(table, first, operator, second, type, true);
    }
    /**
     * Add a left join to the query.
     *
     * @param  string  table
     * @param  Function|string  first
     * @param  [string]  operator
     * @param  [string]  second
     * @return Builder
     */
    leftJoin(table, first, operator, second) {
        return this.join(table, first, operator, second, 'left');
    }
    /**
     * Add a subquery left join to the query.
     *
     * @param  Function|\Illuminate\Database\Query\Builder|\Illuminate\Database\Eloquent\Builder|string  query
     * @param  string  as
     * @param  Function|string  first
     * @param  [string]  operator
     * @param  [string]  second
     * @return this
     */
    leftJoinSub(query, as, first, operator, second) {
        return this.joinSub(query, as, first, operator, second, 'left');
    }
    /**
     * Add a "join where" clause to the query.
     *
     * @param  string  table
     * @param  Function|string  first
     * @param  string  operator
     * @param  string  second
     * @return Builder
     */
    leftJoinWhere(table, first, operator, second) {
        return this.joinWhere(table, first, operator, second, 'left');
    }
    /**
     * Set the "limit" value of the query.
     *
     * @param  number  value
     * @return Builder
     */
    limit(value) {
        const property = this.unions.length > 0 ? 'unionLimit' : 'limitProperty';
        if (value >= 0) {
            this[property] = value;
        }
        return this;
    }
    /**
     * Retrieve the maximum value of a given column.
     *
     * @param  string  column
     * @return any
     */
    max(column) {
        return this.aggregate('max', [column]);
    }
    /**
     * Retrieve the minimum value of a given column.
     *
     * @param  string  column
     * @return any
     */
    min(column) {
        return this.aggregate('min', [column]);
    }
    /**
     * Merge an array of bindings into our bindings.
     *
     * @param  Illuminate\Database\Query\Builder  query
     * @return Builder
     */
    mergeBindings(query) {
        this.bindings = lodash_1.merge(this.bindings, query.bindings);
        return this;
    }
    /**
     * Get a new join clause.
     *
     * @param  \Illuminate\Database\Query\Builder  parentQuery
     * @param  string  type
     * @param  string|Expression  table
     * @return \Illuminate\Database\Query\JoinClause
     */
    newJoinClause(parentQuery, type, table) {
        // return new JoinClause(parentQuery, type, table) as unknown as JoinClause;
        return new internal_1.JoinClause(parentQuery, type, table);
    }
    /**
     * Get a new instance of the query builder.
     *
     * @return \Illuminate\Database\Query\Builder
     */
    newQuery() {
        return new this.constructor(this.connection, this.grammar, this.processor);
        // return new Builder(this.connection, this.grammar, this.processor);
    }
    /**
     * Set the "offset" value of the query.
     *
     * @param  number  value
     * @return Builder
     */
    offset(value) {
        const property = this.unions.length > 0 ? 'unionOffset' : 'offsetProperty';
        this[property] = Math.max(0, value);
        return this;
    }
    /**
     * Execute the given callback while selecting the given columns.
     *
     * After running the callback, the columns are reset to the original value.
     *
     * @param  array  columns
     * @param  Function  callback
     * @return any
     */
    onceWithColumns(columns, callback) {
        const original = this.columns;
        if (original.length === 0) {
            this.columns = columns;
        }
        const result = callback();
        this.columns = original;
        return result;
    }
    /**
     * Add an "order by" clause to the query.
     *
     * @param  Function|\Illuminate\Database\Query\Builder|\Illuminate\Database\Query\Expression|string  column
     * @param  string  direction
     * @return this
     *
     * @throws \InvalidArgumentException
     */
    orderBy(column, direction = 'asc') {
        if (this.isQueryable(column)) {
            const [query, bindings] = this.createSub(column);
            column = new Expression_1.Expression('(' + query + ')');
            this.addBinding(bindings, this.unions ? 'unionOrder' : 'order');
        }
        direction = direction.toLowerCase();
        if (!['asc', 'desc'].includes(direction)) {
            throw new TypeError('InvalidArgumentException: Order direction must be "asc" or "desc".');
        }
        this[this.unions.length > 0 ? 'unionOrders' : 'orders'].push({
            column,
            direction,
        });
        return this;
    }
    /**
     * Add a descending "order by" clause to the query.
     *
     * @param  string | Function  column
     * @return Builder
     */
    orderByDesc(column) {
        return this.orderBy(column, 'desc');
    }
    /**
     * Add a raw "order by" clause to the query.
     *
     * @param  string  sql
     * @param  array  bindings
     * @return Builder
     */
    orderByRaw(sql, bindings = []) {
        const type = 'Raw';
        this[this.unions.length > 0 ? 'unionOrders' : 'orders'].push({ type, sql });
        this.addBinding(bindings, this.unions ? 'unionOrder' : 'order');
        return this;
    }
    /**
     * Add an "or having" clause to the query.
     *
     * @param  string  column
     * @param  [string]  operator
     * @param  [Builder]  value
     * @return Builder
     */
    orHaving(column, operator, value) {
        [value, operator] = this.prepareValueAndOperator(value, operator, arguments.length === 2);
        return this.having(column, operator, value, 'or');
    }
    /**
     * Add a raw or having clause to the query.
     *
     * @param  string  sql
     * @param  Array<any>  bindings
     * @return Builder
     */
    orHavingRaw(sql, bindings = []) {
        return this.havingRaw(sql, bindings, 'or');
    }
    /**
     * Add an "or where" clause to the query.
     *
     * @param  Function|string|Array<any>  column
     * @param  any  operator
     * @param  any  value
     * @return Builder
     */
    orWhere(column, operator, value) {
        [value, operator] = this.prepareValueAndOperator(value, operator, arguments.length === 2);
        return this.where(column, operator, value, 'or');
    }
    /**
     * Add an "or where" clause comparing two columns to the query.
     *
     * @param  string|array  first
     * @param  string  operator
     * @param  string  second
     * @return Builder
     */
    orWhereColumn(first, operator, second) {
        return this.whereColumn(first, operator, second, 'or');
    }
    /**
     * Add an "or where date" statement to the query.
     *
     * @param  string  column
     * @param  string | number  operator
     * @param  [Date|string]  value
     * @return Builder
     */
    orWhereDate(column, operator, value) {
        [value, operator] = this.prepareValueAndOperator(String(value), String(operator), arguments.length === 2);
        return this.whereDate(column, operator, value, 'or');
    }
    /**
     * Add an "or where day" statement to the query.
     *
     * @param  string  column
     * @param  string  operator
     * @param  [Date|string]  value
     * @return Builder
     */
    orWhereDay(column, operator, value) {
        [value, operator] = this.prepareValueAndOperator(value, operator, arguments.length === 2);
        return this.whereDay(column, operator, value, 'or');
    }
    /**
     * Add an or exists clause to the query.
     *
     * @param  Function  callback
     * @param  boolean  not
     * @return Builder
     */
    orWhereExists(callback, not = false) {
        return this.whereExists(callback, 'or', not);
    }
    /**
     * Add an "or where in" clause to the query.
     *
     * @param  string  column
     * @param  any  values
     * @return Builder
     */
    orWhereIn(column, values) {
        return this.whereIn(column, values, 'or');
    }
    /**
     * Add an "or where in raw" clause for integer values to the query.
     *
     * @param  string  column
     * @param  Array<any> values
     * @return Builder
     */
    orWhereIntegerInRaw(column, values) {
        return this.whereIntegerInRaw(column, values, 'or');
    }
    /**
     * Add an "or where not in raw" clause for integer values to the query.
     *
     * @param  string  column
     * @param  Array<any>  values
     * @return Builder
     */
    orWhereIntegerNotInRaw(column, values) {
        return this.whereIntegerNotInRaw(column, values, 'or');
    }
    /**
      * Add an "or where month" statement to the query.
      *
      * @param  string  column
      * @param  string | number  operator
      * @param  [Date|string]  value
      * @return Builder
      */
    orWhereMonth(column, operator, value) {
        [value, operator] = this.prepareValueAndOperator(value, operator, arguments.length === 2);
        return this.whereMonth(column, operator, value, 'or');
    }
    /**
     * Add a where not exists clause to the query.
     *
     * @param  Function  callback
     * @return Builder
     */
    orWhereNotExists(callback) {
        return this.orWhereExists(callback, true);
    }
    /**
     * Add an "or where not in" clause to the query.
     *
     * @param  string  column
     * @param  any  values
     * @return Builder
     */
    orWhereNotIn(column, values) {
        return this.whereNotIn(column, values, 'or');
    }
    /**
     * Add an "or where not null" clause to the query.
     *
     * @param  string | Array<any> column
     * @return Builder
     */
    orWhereNotNull(column) {
        return this.whereNotNull(column, 'or');
    }
    /**
     * Add an "or where null" clause to the query.
     *
     * @param  string  column
     * @return Builder
     */
    orWhereNull(column) {
        return this.whereNull(column, 'or');
    }
    /**
     * Add a raw or where clause to the query.
     *
     * @param  string  sql
     * @param  any  bindings
     * @return Builder
     */
    orWhereRaw(sql, bindings = []) {
        return this.whereRaw(sql, bindings, 'or');
    }
    /**
     * Add an "or where year" statement to the query.
     *
     * @param  string  column
     * @param  string | number  operator
     * @param  [Date|string|number]  value
     * @return Builder
     */
    orWhereYear(column, operator, value) {
        [value, operator] = this.prepareValueAndOperator(value, operator, arguments.length === 2);
        return this.whereYear(column, operator, value, 'or');
    }
    /**
     * Parse the subquery into SQL and bindings.
     *
     * @param  any  query
     * @return array
     *
     * @throws \InvalidArgumentException
     */
    parseSub(query) {
        if (query instanceof this.constructor
            || query instanceof Builder
            || query instanceof Builder_1.Builder
            || query instanceof Relation_1.Relation) {
            query = this.prependDatabaseNameIfCrossDatabaseQuery(query);
            return [query.toSql(), query.getBindings()];
        }
        else if (typeof query === 'string') {
            return [query, []];
        }
        else {
            throw new TypeError('InvalidArgumentException: A subquery must be a query builder instance, a Closure, or a string.');
        }
    }
    /**
     * Get an array with the values of a given column.
     *
     * @param  string  column
     * @param  [string]  key
     * @return \Illuminate\Support\Collection
     */
    pluck(column, key) {
        // First, we will need to select the results of the query accounting for the
        // given columns / key. Once we have the results, we will be able to take
        // the results and get the exact data that was requested for the query.
        const queryResult = this.onceWithColumns(!key ? [column] : [column, key], () => {
            return this.processor.processSelect(this, this.runSelect());
        });
        if (queryResult.length === 0) {
            return Helpers_1.collect();
        }
        // If the columns are qualified with a table or have an alias, we cannot use
        // those directly in the "pluck" operations since the results from the DB
        // are only keyed by the column itself. We'll strip the table out here.
        column = this.stripTableForPluck(column);
        key = this.stripTableForPluck(key);
        return Array.isArray(queryResult[0])
            ? this.pluckFromArrayColumn(queryResult, column, key)
            : this.pluckFromObjectColumn(queryResult, column, key);
    }
    /**
     * Retrieve column values from rows represented as arrays.
     *
     * @param  array  queryResult
     * @param  string  column
     * @param  string  key
     * @return \Illuminate\Support\Collection
     */
    pluckFromArrayColumn(queryResult, column, key) {
        const results = [];
        if (!key) {
            for (const row of queryResult) {
                results.push(row[column]);
            }
        }
        else {
            for (const row of queryResult) {
                results[row[key]] = row[column];
            }
        }
        return Helpers_1.collect(results);
    }
    /**
     * Retrieve column values from rows represented as objects.
     *
     * @param  array  queryResult
     * @param  string  column
     * @param  string  key
     * @return \Illuminate\Support\Collection
     */
    pluckFromObjectColumn(queryResult, column, key) {
        // const results: Array<any> = [];
        let results;
        if (!key) {
            results = [];
            for (const row of (queryResult)) {
                results.push(row[column]);
            }
        }
        else {
            results = {};
            for (const row of queryResult) {
                results[row[key]] = row[column];
            }
        }
        return Helpers_1.collect(results);
    }
    /**
     * Prepare the value and operator for a where clause.
     *
     * @param  string  value
     * @param  string  operator
     * @param  boolean  useDefault
     * @return array
     *
     * @throws \InvalidArgumentException
     */
    prepareValueAndOperator(value, operator, useDefault = false) {
        if (useDefault) {
            return [operator, '='];
        }
        else if (this.invalidOperatorAndValue(operator, value)) {
            throw new TypeError('InvalidArgumentException: Illegal operator and value combination.');
        }
        return [value, operator];
    }
    /**
     * Prepend the database name if the given query is on another database.
     *
     * @param  any  query
     * @return any
     */
    prependDatabaseNameIfCrossDatabaseQuery(query) {
        if (query.getConnection().getDatabaseName() !== this.getConnection().getDatabaseName()) {
            const databaseName = query.getConnection().getDatabaseName();
            if (query.from.indexOf(databaseName) !== 0 && query.from.indexOf('.') === -1) {
                query.from(databaseName + '.' + query.from);
            }
        }
        return query;
    }
    /**
     * Remove all existing orders and optionally add a new order.
     *
     * @param  string  column
     * @param  string  direction
     * @return Builder
     */
    reorder(column = '', direction = 'asc') {
        this.orders = [];
        this.unionOrders = [];
        this.bindings['order'] = [];
        this.bindings['unionOrder'] = [];
        if (column) {
            return this.orderBy(column, direction);
        }
        return this;
    }
    /**
     * Add a subquery right join to the query.
     *
     * @param  Function|\Illuminate\Database\Query\Builder|\Illuminate\Database\Eloquent\Builder|string  query
     * @param  string  as
     * @param  Function|string  first
     * @param  [string]  operator
     * @param  [string]  second
     * @return this
     */
    rightJoinSub(query, as, first, operator, second) {
        return this.joinSub(query, as, first, operator, second, 'right');
    }
    /**
     * Run the query as a "select" statement against the connection.
     *
     * @return array
     */
    runSelect() {
        return this.connection.select(this.toSql(), this.getBindings());
    }
    /**
     * Run a pagination count query.
     *
     * @param  Array<any>  columns
     * @return Array<any>
     */
    runPaginationCountQuery(columns = ['*']) {
        // We need to save the original bindings, because the cloneWithoutBindings
        // method delete them from the builder object
        const bindings = Object.assign({}, this.bindings);
        if (this.groups.length > 0 || this.havings.length > 0) {
            const clone = this.cloneForPaginationCount();
            if (clone.columns.length === 0 && this.joins.length > 0) {
                clone.select(this.fromProperty + '.*');
            }
            const result = this.newQuery()
                .from(new Expression_1.Expression('(' + clone.toSql() + ') as ' + this.grammar.wrap('aggregate_table')))
                .mergeBindings(clone)
                .setAggregate('count', this.withoutSelectAliases(columns))
                .get().all();
            this.bindings = bindings;
            return result;
        }
        const without = this.unions.length > 0 ? ['orders', 'limitProperty', 'offsetProperty'] : ['columns', 'orders', 'limitProperty', 'offsetProperty'];
        const result = this.cloneWithout(without)
            .cloneWithoutBindings(this.unions.length > 0 ? ['order'] : ['select', 'order'])
            .setAggregate('count', this.withoutSelectAliases(columns))
            .get().all();
        this.bindings = bindings;
        return result;
    }
    /**
     * Set the columns to be selected.
     *
     * @param  array|mixed  columns
     * @return this
     */
    select(...columns) {
        this.columns = [];
        this.bindings['select'] = [];
        columns = Array.isArray(columns) ? columns.flat() : [...arguments];
        for (const [as, column] of Array.from(Object.entries(columns))) {
            if (!lodash_1.isInteger(as) && this.isQueryable(column)) {
                this.selectSub(String(column), as);
            }
            else {
                this.columns.push(column);
            }
        }
        return this;
    }
    /**
     * Add a new "raw" select expression to the query.
     *
     * @param  string  expression
     * @param  Array<any>  bindings
     * @return this
     */
    selectRaw(expression, bindings = []) {
        this.addSelect(new Expression_1.Expression(expression));
        if (bindings.length > 0) {
            this.addBinding(bindings, 'select');
        }
        return this;
    }
    /**
     * Add a subselect expression to the query.
     *
     * @param Function|Builder|EloquentBuilder|string  query
     * @param string  as
     * @return this
     *
     * @throws \InvalidArgumentException
     */
    selectSub(query, as) {
        const [querySub, bindings] = this.createSub(query);
        return this.selectRaw('(' + querySub + ') as ' + this.grammar.wrap(as), bindings);
    }
    /**
     * Set the aggregate property without running the query.
     *
     * @param  string  functionName
     * @param  Array<string>  columns
     * @return Builder
     */
    setAggregate(functionName, columns) {
        this.aggregateProperty = { function: functionName, columns };
        if (this.groups.length === 0) {
            this.orders = [];
            this.bindings['order'] = [];
        }
        return this;
    }
    /**
     * Alias to set the "offset" value of the query.
     *
     * @param  number  value
     * @return Builder
     */
    skip(value) {
        return this.offset(value);
    }
    /**
     * Strip off the table name or alias from a column identifier.
     *
     * @param  string  column
     * @return string|undefined
     */
    stripTableForPluck(column) {
        if (!column) {
            return column;
        }
        const separator = column.toLowerCase().includes(' as ') !== false ? ' as ' : '\.';
        return Helpers_1.last(column.split('~' + separator + '~i'));
    }
    /**
     * Retrieve the sum of the values of a given column.
     *
     * @param  string  column
     * @return any
     */
    sum(column) {
        const result = this.aggregate('sum', [column]);
        return result !== null && result !== void 0 ? result : 0;
    }
    /**
     * Alias to set the "limit" value of the query.
     *
     * @param  number  value
     * @return Builder
     */
    take(value) {
        return this.limit(value);
    }
    /**
     * Pass the query to a given callback.
     *
     * @param  Function  callback
     * @return Builder
     */
    tap(callback) {
        return this.when(true, callback);
    }
    /**
     * Get the SQL representation of the query.
     *
     * @return string
     */
    toSql() {
        this.applyBeforeQueryCallbacks();
        return this.grammar.compileSelect(this);
    }
    /**
     * Add a union statement to the query.
     *
     * @param  \Illuminate\Database\Query\Builder|\Closure  query
     * @param  boolean  all
     * @return Builder
     */
    union(query, all = false) {
        if (query instanceof Function) {
            const callback = query;
            query = this.newQuery();
            callback(query);
        }
        this.unions.push({ query: query, all });
        this.addBinding(query.getBindings(), 'union');
        return this;
    }
    /**
     * Add a union all statement to the query.
     *
     * @param  \Illuminate\Database\Query\Builder|\Closure  query
     * @return this
     */
    unionAll(query) {
        return this.union(query, true);
    }
    /**
     * Apply the callback's query changes if the given "value" is false.
     *
     * @param  mixed  value
     * @param  Function
     * @param  [Function]  default
     * @return any|Builder
     */
    unless(value, callback, defaultCallback) {
        var _a, _b;
        if (!value) {
            return (_a = callback(this, value)) !== null && _a !== void 0 ? _a : this;
        }
        else if (defaultCallback) {
            return (_b = defaultCallback(this, value)) !== null && _b !== void 0 ? _b : this;
        }
        return this;
    }
    /**
     * Update records in the database.
     *
     * @param  Array<any> | any  values
     * @return number
     */
    update(values) {
        this.applyBeforeQueryCallbacks();
        const sql = this.grammar.compileUpdate(this, values);
        return this.connection.update(sql, this.cleanBindings(this.grammar.prepareBindingsForUpdate(this.bindings, values)));
    }
    /**
     * Insert new records or update the existing ones.
     *
     * @param  Array<any>  values
     * @param  Array<any> | string  uniqueBy
     * @param  [Array<any>]  update
     * @return Promise<number>
     */
    upsert(values, uniqueBy, update) {
        // if (empty(values)) {
        if (Object.keys(values).length === 0 || values.length === 0) {
            return 0;
        }
        else if (update === []) {
            return Number(this.insert(values));
        }
        // if (!Array.isArray(reset(values))) {
        //   values = [values];
        // }
        if (!Array.isArray(Helpers_1.reset(values)) && !lodash_1.isPlainObject(Helpers_1.reset(values))) {
            values = [values];
        }
        else {
            for (let [key, value] of Object.entries(values)) {
                value = Support_1.ksort(value);
                values[key] = value;
            }
        }
        if (!update || (update === null || update === void 0 ? void 0 : update.length) === 0) {
            update = Object.keys(Helpers_1.reset(values));
        }
        this.applyBeforeQueryCallbacks();
        // console.log(Arr.flatten(values, 1));
        // console.log(collect(update).reject((value: any, key: any) => {
        //   return isInteger(key);
        // }).all());
        const bindings = this.cleanBindings([
            ...Arr_1.Arr.flatten(values, 1),
            ...Helpers_1.collect(update).reject((value, key) => {
                return lodash_1.isInteger(key);
            }).all()
        ]);
        uniqueBy = !Array.isArray(uniqueBy) ? [uniqueBy] : uniqueBy;
        return this.connection.affectingStatement(this.grammar.compileUpsert(this, values, uniqueBy, update), bindings);
    }
    /**
     * Get a single column's value from the first result of a query.
     *
     * @param  string  column
     * @return any
     */
    value(column) {
        const result = this.first([column]);
        return result.length > 0 || Object.keys(result).length > 0 ? Helpers_1.reset(result) : null;
    }
    /**
   * Apply the callback's query changes if the given "value" is true.
   *
   * @param  mixed  value
   * @param  callable  callback
   * @param  callable|null  default
   * @return mixed|this
   */
    when(value, callback, defaultCallback) {
        var _a, _b;
        if (value) {
            return (_a = callback(this, value)) !== null && _a !== void 0 ? _a : this;
        }
        else if (defaultCallback) {
            return (_b = defaultCallback(this, value)) !== null && _b !== void 0 ? _b : this;
        }
        return this;
    }
    /**
     * Add a basic where clause to the query.
     *
     * @param  Function|string|array  column
     * @param  any  operator
     * @param  any  value
     * @param  string  boolean
     * @return Builder
     */
    where(column, operator, value, boolean = 'and') {
        // If the column is an array, we will assume it is an array of key-value pairs
        // and can add them each as a where clause. We will maintain the boolean we
        // received when the method was called and pass it into the nested where.
        if (Array.isArray(column) || lodash_1.isObjectLike(column)) {
            return this.addArrayOfWheres(column, boolean);
        }
        // Here we will make some assumptions about the operator. If only 2 values are
        // passed to the method, we will assume that the operator is an equals sign
        // and keep going. Otherwise, we'll require the operator to be passed in.
        [value, operator] = this.prepareValueAndOperator(value, operator, arguments.length === 2);
        // If the columns is actually a Closure instance, we will assume the developer
        // wants to begin a nested where statement which is wrapped in parenthesis.
        // We'll add that Closure to the query then return back out immediately.
        if (column instanceof Function && !operator) {
            return this.whereNested(column, boolean);
        }
        // If the column is a Closure instance and there is an operator value, we will
        // assume the developer wants to run a subquery and then compare the result
        // of that subquery with the given value that was provided to the method.
        if (this.isQueryable(column) && operator) {
            const [sub, bindings] = this.createSub(column);
            return this.addBinding(bindings, 'where')
                .where(new Expression_1.Expression('(' + sub + ')'), operator, value, boolean);
        }
        // If the given operator is not found in the list of valid operators we will
        // assume that the developer is just short-cutting the '=' operators and
        // we will set the operators to '=' and set the values appropriately.
        if (this.invalidOperator(operator)) {
            [value, operator] = [operator, '='];
        }
        // If the value is a Closure, it means the developer is performing an entire
        // sub-select within the query and we will need to compile the sub-select
        // within the where clause to get the appropriate query record results.
        if (value instanceof Function) {
            return this.whereSub(String(column), operator, value, boolean);
        }
        // If the value is "null", we will just assume the developer wants to add a
        // where null clause to the query. So, we will allow a short-cut here to
        // that method for convenience so the developer doesn't have to check.
        if (!value) {
            return this.whereNull(String(column), boolean, operator !== '=');
        }
        let type = 'Basic';
        // If the column is making a JSON reference we'll check to see if the value
        // is a boolean. If it is, we'll add the raw boolean string as an actual
        // value to the query to ensure this is properly handled by the query.
        if (String(column).includes('->') && lodash_1.isBoolean(value)) {
            value = new Expression_1.Expression(value ? 'true' : 'false');
            if (lodash_1.isString(column)) {
                type = 'JsonBoolean';
            }
        }
        // Now that we are working with just a simple query we can put the elements
        // in our array and add the query binding to our array of bindings that
        // will be bound to each SQL statements when it is finally executed.
        this.wheres.push({
            type, column, operator, value, boolean
        });
        if (!(value instanceof Expression_1.Expression)) {
            this.addBinding(this.flattenValue(value), 'where');
        }
        return this;
    }
    /**
     * Add a where between statement to the query.
     *
     * @param  string|\Illuminate\Database\Query\Expression  column
     * @param  array  values
     * @param  string  boolean
     * @param  boolean  not
     * @return Builder
     */
    whereBetween(column, values, boolean = 'and', not = false) {
        const type = 'Between';
        this.wheres.push({ type, column, values, boolean, not });
        const flatten = Arr_1.Arr.flatten(values);
        this.addBinding(this.cleanBindings(flatten).slice(0, 2), 'where');
        return this;
    }
    /**
     * Add a where between statement using columns to the query.
     *
     * @param  string  column
     * @param  array  values
     * @param  string  boolean
     * @param  boolean  not
     * @return Builder
     */
    whereBetweenColumns(column, values, boolean = 'and', not = false) {
        const type = 'BetweenColumns';
        this.wheres.push({ type, column, values, boolean, not });
        return this;
    }
    /**
     * Add a "where" clause comparing two columns to the query.
     *
     * @param  string|array  first
     * @param  string|null  operator
     * @param  string|null  second
     * @param  string|null  boolean
     * @return this
     */
    whereColumn(first, operator, second, boolean = 'and') {
        // If the column is an array, we will assume it is an array of key-value pairs
        // and can add them each as a where clause. We will maintain the boolean we
        // received when the method was called and pass it into the nested where.
        if (Array.isArray(first)) {
            return this.addArrayOfWheres(first, boolean, 'whereColumn');
        }
        // If the given operator is not found in the list of valid operators we will
        // assume that the developer is just short-cutting the '=' operators and
        // we will set the operators to '=' and set the values appropriately.
        if (this.invalidOperator(String(operator))) {
            [second, operator] = [operator, '='];
        }
        // Finally, we will add this where clause into this array of clauses that we
        // are building for the query. All of them will be compiled via a grammar
        // once the query is about to be executed and run against the database.
        const type = 'Column';
        this.wheres.push({
            type, first, operator, second, boolean
        });
        return this;
    }
    /**
     * Add a "where date" statement to the query.
     *
     * @param  string  column
     * @param  string | number | Expression  operator
     * @param  [Date | string]  value
     * @param  string  boolean
     * @return Builder
     */
    whereDate(column, operator, value, boolean = 'and') {
        [value, operator] = this.prepareValueAndOperator(value, operator, arguments.length === 2);
        value = this.flattenValue(value);
        if (value instanceof Date) {
            value = utils.dateFormat(value, 'Y-m-d');
        }
        return this.addDateBasedWhere('Date', column, operator, value, boolean);
    }
    /**
     * Add a "where day" statement to the query.
     *
     * @param  string  column
     * @param  string | number | Expression  operator
     * @param  [Date|string|Expression]  value
     * @param  string  boolean
     * @return this
     */
    whereDay(column, operator, value, boolean = 'and') {
        [value, operator] = this.prepareValueAndOperator(value, operator, arguments.length === 2);
        value = this.flattenValue(value);
        if (value instanceof Date) {
            value = utils.dateFormat(value, 'd');
        }
        // if (!(value instanceof Expression)) {
        //   value = String(value)?.padStart(2, '0');
        // }
        return this.addDateBasedWhere('Day', column, operator, value, boolean);
    }
    /**
     * Add an exists clause to the query.
     *
     * @param  Function  callback
     * @param  string  boolean
     * @param  boolean  not
     * @return Builder
     */
    whereExists(callback, boolean = 'and', not = false) {
        const query = this.forSubQuery();
        // Similar to the sub-select clause, we will create a new query instance so
        // the developer may cleanly specify the entire exists query and we will
        // compile the whole thing in the grammar and insert it into the SQL.
        callback(query);
        return this.addWhereExistsQuery(query, boolean, not);
    }
    /**
     * Add a "where in" clause to the query.
  *(  * @param  string  column
     * @param  any  values
     * @param  string  boolean
     * @param  boolean  not
     * @return Builder
     */
    whereIn(column, values, boolean = 'and', not = false) {
        const type = not ? 'NotIn' : 'In';
        // If the value is a query builder instance we will assume the developer wants to
        // look for any values that exists within this given query. So we will add the
        // query accordingly so that this query is properly executed when it is run.
        if (this.isQueryable(values)) {
            const [query, bindings] = this.createSub(values);
            values = [new Expression_1.Expression(query)];
            this.addBinding(bindings, 'where');
        }
        // Next, if the value is Arrayable we need to cast it to its raw array form so we
        // have the underlying array value instead of an Arrayable object which is not
        // able to be added as a binding, etc. We will then add to the wheres array.
        // if (values instanceof Arrayable) {
        //   values = values.toArray();
        // }
        this.wheres.push({ type, column, values, boolean });
        // Finally we'll add a binding for each values unless that value is an expression
        // in which case we will just skip over it since it will be the query as a raw
        // string and not as a parameterized place-holder to be replaced by the PDO.
        this.addBinding(this.cleanBindings(values), 'where');
        return this;
    }
    /**
     * Add a "where in raw" clause for integer values to the query.
     *
     * @param  string  column
     * @param  \Illuminate\Contracts\Support\Arrayable|array  values
     * @param  string  boolean
     * @param  boolean  not
     * @return Builder
     */
    whereIntegerInRaw(column, values, boolean = 'and', not = false) {
        const type = not ? 'NotInRaw' : 'InRaw';
        // if (values instanceof Arrayable) {
        //   values = values.toArray();
        // }
        values = values.map(value => parseInt(value, 10));
        this.wheres.push({ type, column, values, boolean });
        return this;
    }
    /**
     * Add a "where not in raw" clause for integer values to the query.
     *
     * @param  string  column
     * @param  Array<any>  values
     * @param  string  boolean
     * @return Builder
     */
    whereIntegerNotInRaw(column, values, boolean = 'and') {
        return this.whereIntegerInRaw(column, values, boolean, true);
    }
    /**
     * Add a "where month" statement to the query.
     *
     * @param  string  column
     * @param  string | number | Expression  operator
     * @param  Date | string | Expression  value
     * @param  string  boolean
     * @return this
     */
    whereMonth(column, operator, value, boolean = 'and') {
        [value, operator] = this.prepareValueAndOperator(value, operator, arguments.length === 2);
        value = this.flattenValue(value);
        if (value instanceof Date) {
            value = utils.dateFormat(value, 'm');
        }
        // if (!(value instanceof Expression)) {
        //   value = String(value)?.padStart(2, '0');
        // }
        return this.addDateBasedWhere('Month', column, operator, value, boolean);
    }
    /**
     * Add a nested where statement to the query.
     *
     * @param  \Function  callback
     * @param  string  boolean
     * @return this
     */
    whereNested(callback, boolean = 'and') {
        const query = this.forNestedWhere();
        callback(query);
        return this.addNestedWhereQuery(query, boolean);
    }
    /**
     * Add a where not between statement to the query.
     *
     * @param  string  column
     * @param  array  values
     * @param  string  boolean
     * @return Builder
     */
    whereNotBetween(column, values, boolean = 'and') {
        return this.whereBetween(column, values, boolean, true);
    }
    /**
     * Add a where not between statement using columns to the query.
     *
     * @param  string  column
     * @param  array  values
     * @param  string  boolean
     * @return Builder
     */
    whereNotBetweenColumns(column, values, boolean = 'and') {
        return this.whereBetweenColumns(column, values, boolean, true);
    }
    /**
     * Add a where not exists clause to the query.
     *
     * @param  Function  callback
     * @param  string  boolean
     * @return Buelder
     */
    whereNotExists(callback, boolean = 'and') {
        return this.whereExists(callback, boolean, true);
    }
    /**
     * Add a "where not in" clause to the query.
     *
     * @param  string  column
     * @param  any  values
     * @param  string  boolean
     * @return Builder
     */
    whereNotIn(column, values, boolean = 'and') {
        return this.whereIn(column, values, boolean, true);
    }
    /**
     * Add a "where not null" clause to the query.
     *
     * @param  string|Array<any>  columns
     * @param  [string]  boolean
     * @return this
     */
    whereNotNull(columns, boolean = 'and') {
        return this.whereNull(columns, boolean, true);
    }
    /**
     * Add a "where null" clause to the query.
     *
     * @param  string|array  columns
     * @param  string  boolean
     * @param  boolean  not
     * @return this
     */
    whereNull(columns, boolean = 'and', not = false) {
        const type = not ? 'NotNull' : 'Null';
        for (const column of Arr_1.Arr.wrap(columns)) {
            this.wheres.push({ type, column, boolean });
        }
        return this;
    }
    /**
     * Add a raw where clause to the query.
     *
     * @param  string  sql
     * @param  any  bindings
     * @param  string  boolean
     * @return this
     */
    whereRaw(sql, bindings = [], boolean = 'and') {
        this.wheres.push({ type: 'Raw', sql, boolean });
        this.addBinding(bindings, 'where');
        return this;
    }
    /**
     * Add a full sub-select to the query.
     *
     * @param  string  column
     * @param  string  operator
     * @param  Function  callback
     * @param  string  boolean
     * @return this
     */
    whereSub(column, operator, callback, boolean) {
        const type = 'Sub';
        // Once we have the query instance we can simply execute it so it can add all
        // of the sub-select's conditions to itself, and then we can cache it off
        // in the array of where clauses for the "main" parent query instance.
        const query = this.forSubQuery();
        callback(query);
        this.wheres.push({
            type, column, operator, query, boolean
        });
        this.addBinding(query.getBindings(), 'where');
        return this;
    }
    /**
     * Add a "where time" statement to the query.
     *
     * @param  string  column
     * @param  string  operator
     * @param  Date|string|null  value
     * @param  string  boolean
     * @return this
     */
    whereTime(column, operator, value, boolean = 'and') {
        [value, operator] = this.prepareValueAndOperator(value, operator, arguments.length === 2);
        value = this.flattenValue(value);
        if (value instanceof Date) {
            value = utils.dateFormat(value, 'H:i:s');
        }
        return this.addDateBasedWhere('Time', column, operator, value, boolean);
    }
    /**
     * Add a "where year" statement to the query.
     *
     * @param  string  column
     * @param  string | number | Expression  operator
     * @param  [Date|string|Number]  value
     * @param  string  boolean
     * @return this
     */
    whereYear(column, operator, value, boolean = 'and') {
        [value, operator] = this.prepareValueAndOperator(value, operator, arguments.length === 2);
        value = this.flattenValue(value);
        if (value instanceof Date) {
            value = utils.dateFormat(value, 'Y');
        }
        return this.addDateBasedWhere('Year', column, operator, value, boolean);
    }
    /**
     * Remove the column aliases since they will break count queries.
     *
     * @param  Array<any>  columns
     * @return Array<any>
     */
    withoutSelectAliases(columns) {
        return columns.map((column) => {
            const aliasPosition = column.toLowerCase().indexOf(' as ');
            return lodash_1.isString(column) && aliasPosition !== -1
                ? column.substr(0, aliasPosition) : column;
        });
    }
}
exports.Builder = Builder;
//# sourceMappingURL=Builder.js.map