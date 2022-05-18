"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Builder = void 0;
const utils_1 = require("@devnetic/utils");
const Arr_1 = require("../../Collections/Arr");
const Builder_1 = require("../Eloquent/Builder");
const internal_1 = require("./internal");
const Macroable_1 = require("../../Macroable/Traits/Macroable");
const Relation_1 = require("../Eloquent/Relations/Relation");
const helpers_1 = require("../../Collections/helpers");
const use_1 = require("../../Support/Traits/use");
class Builder {
    /**
     * Create a new query builder instance.
     *
     * @constructor
     * @param  {\Illuminate\Database\ConnectionInterface}  connection
     * @param  {\Illuminate\Database\Query\Grammars\Grammar|undefined}  [grammar]
     * @param  {\Illuminate\Database\Query\Processors\Processor|undefined}  [processor]
     * @return {void}
     */
    constructor(connection, grammar, processor) {
        /**
         * An aggregate function and column to be run.
         *
         * @member {object}
         */
        this.aggregateProperty = undefined;
        /**
         * The current query value bindings.
         *
         * @member {Bindings}
         */
        // public bindings: Bindings = new Map<string, string[]>([
        //   ['select', []],
        //   ['from', []],
        //   ['join', []],
        //   ['where', []],
        //   ['groupBy', []],
        //   ['having', []],
        //   ['order', []],
        //   ['union', []],
        //   ['unionOrder', []]
        // ])
        this.bindings = {
            select: [],
            from: [],
            join: [],
            where: [],
            groupBy: [],
            having: [],
            order: [],
            union: [],
            unionOrder: []
        };
        /**
         * The callbacks that should be invoked before the query is executed.
         *
         * @member {Array}
         */
        this.beforeQueryCallbacks = [];
        /**
         * The columns that should be returned.
         *
         * @var unknown[]
         */
        this.columns = [];
        /**
         * Indicates if the query returns distinct results.
         *
         * Occasionally contains the columns that should be distinct.
         *
         * @member {boolean|Array}
         */
        this.distinctProperty = false;
        /**
         * The table which the query is targeting.
         *
         * @var string
         */
        this.fromProperty = '';
        /**
         * The having constraints for the query.
         *
         * @member {Array}
         */
        this.havings = [];
        /**
         * The table joins for the query.
         *
         * @var array
         */
        this.joins = [];
        /**
         * The maximum number of union records to return.
         *
         * @member number
         */
        this.unionLimit = undefined;
        /**
         * The number of union records to skip.
         *
         * @member number
         */
        this.unionOffset = undefined;
        /**
         * The orderings for the union query.
         *
         * @member {Array}
         */
        this.unionOrders = [];
        /**
         * The query union statements.
         *
         * @member {Array}
         */
        this.unions = [];
        // const proxy = use(this, [Macroable])
        (0, use_1.use)(Builder, [Macroable_1.Macroable]);
        this.connection = connection;
        this.grammar = grammar ?? connection.getQueryGrammar();
        this.processor = processor ?? connection.getPostProcessor();
        // return proxy
    }
    /**
     * Add a binding to the query.
     *
     * @param  {*}  value
     * @param  {string}  type
     * @return {this}
     *
     * @throws {\InvalidArgumentException}
     */
    addBinding(value, type = 'where') {
        if (this.bindings[type].length === 0) {
            throw new Error(`InvalidArgumentException: Invalid binding type: ${type}.`);
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
     * Add a new select column to the query.
     *
     * @param  {array|any}  column
     * @return {this}
     */
    addSelect(column) {
        const columns = Array.isArray(column) ? column : [...arguments];
        for (const [as, column] of Arr_1.Arr.iterable(columns)) {
            if ((0, utils_1.isString)(as) && this.isQueryable(column)) {
                if (this.columns.length > 0) {
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
     * Invoke the "before query" modification callbacks.
     *
     * @return {void}
     */
    applyBeforeQueryCallbacks() {
        for (const queryCallback of this.beforeQueryCallbacks) {
            queryCallback(this);
        }
        this.beforeQueryCallbacks = [];
    }
    /**
     * Creates a subquery and parse it.
     *
     * @param  {Function|\Illuminate\Database\Query\Builder|EloquentBuilder|string}  query
     * @return {Array}
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
     * Force the query to only return distinct results.
     *
     * @param  {string[]}  columns
     * @return {this}
     */
    distinct(...columns) {
        if (columns.length > 0) {
            this.distinctProperty = Array.isArray(columns[0]) || typeof columns[0] === 'boolean' ? columns[0] : columns;
        }
        else {
            this.distinctProperty = true;
        }
        return this;
    }
    /**
     * Create a new query instance for a sub-query.
     *
     * @return {\Illuminate\Database\Query\Builder}
     */
    forSubQuery() {
        return this.newQuery();
    }
    /**
     * Set the table which the query is targeting.
     *
     * @param  {Function|\Illuminate\Database\Query\Builder|string}  table
     * @param  {string|undefined}  as
     * @return {this}
     * @memberof Builder
     */
    from(table, as) {
        if (this.isQueryable(table)) {
            return this.fromSub(table, as);
        }
        this.fromProperty = as !== undefined ? `${String(table)} as ${as}` : String(table);
        return this;
    }
    /**
     * Add a raw from clause to the query.
     *
     * @param  {string}  expression
     * @param  {unknown}  [bindings=[]]
     * @return {this}
     */
    fromRaw(expression, bindings = []) {
        this.fromProperty = new internal_1.Expression(expression);
        this.addBinding(bindings, 'from');
        return this;
    }
    /**
     * Makes "from" fetch from a subquery.
     *
     * @param  {Function|\Illuminate\Database\Query\Builder|string}  query
     * @param  {string}  as
     * @return {this}
     *
     * @throws {\InvalidArgumentException}
     */
    fromSub(query, as) {
        let bindings;
        [query, bindings] = this.createSub(query);
        return this.fromRaw(`(${query}) as ${this.grammar.wrapTable(as)}`, bindings);
    }
    /**
     * Execute the query as a "select" statement.
     *
     * @param  {Array|string}  columns
     * @return {\Illuminate\Support\Collection}
     */
    async get(columns = ['*']) {
        return (0, helpers_1.collect)(await this.onceWithColumns(Arr_1.Arr.wrap(columns), () => {
            return this.processor.processSelect(this, this.runSelect());
        }));
    }
    /**
     * Get the current query value bindings in a flattened array.
     *
     * @return {any[]}
     */
    getBindings() {
        return Arr_1.Arr.flatten(this.bindings);
    }
    /**
     * Get the database connection instance.
     *
     * @return {\Illuminate\Database\ConnectionInterface}
     */
    getConnection() {
        return this.connection;
    }
    /**
     * Get the query grammar instance.
     *
     * @return {\Illuminate\Database\Query\Grammars\Grammar}
     */
    getGrammar() {
        return this.grammar;
    }
    /**
     * Get the database query processor instance.
     *
     * @return {\Illuminate\Database\Query\Processors\Processor}
     */
    getProcessor() {
        return this.processor;
    }
    /**
     * Determine if the value is a query builder instance or a Closure.
     *
     * @param  {any}  value
     * @return {boolean}
     */
    isQueryable(value) {
        return (value instanceof Builder ||
            value instanceof Builder_1.Builder ||
            value instanceof Relation_1.Relation ||
            value instanceof Function);
    }
    /**
     * Add a join clause to the query.
     *
     * @param  {string}  table
     * @param  {Function|string}  first
     * @param  {string|undefined}  [operator]
     * @param  {string|undefined}  [second]
     * @param  {string}  [type=inner]
     * @param  {boolean}  [where=false]
     * @return {this}
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
        else {
            // If the column is simply a string, we can assume the join simply has a basic
            // "on" clause with a single condition. So we will just build the join with
            // this simple join clauses attached to it. There is not a join callback.
            const method = where ? 'where' : 'on';
            this.joins.push(join[method](first, operator, second));
            this.addBinding(join.getBindings(), 'join');
        }
        return this;
    }
    /**
     * Get a new join clause.
     *
     * @param  {\Illuminate\Database\Query\Builder}  parentQuery
     * @param  {string}  type
     * @param  {string}  table
     * @return {\Illuminate\Database\Query\JoinClause}
     */
    newJoinClause(parentQuery, type, table) {
        return new internal_1.JoinClause(parentQuery, type, table);
    }
    /**
     * Get a new instance of the query builder.
     *
     * @return {\Illuminate\Database\Query\Builder}
     */
    newQuery() {
        return new Builder(this.connection, this.grammar, this.processor);
    }
    /**
     * Execute the given callback while selecting the given columns.
     *
     * After running the callback, the columns are reset to the original value.
     *
     * @param  {Array}  columns
     * @param  {Function}  callback
     * @return {*}
     */
    async onceWithColumns(columns, callback) {
        const original = this.columns;
        if (original.length === 0) {
            this.columns = columns;
        }
        const result = await callback();
        this.columns = original;
        return result;
    }
    /**
     * Parse the subquery into SQL and bindings.
     *
     * @param  {any}  query
     * @return {Array}
     *
     * @throws {\InvalidArgumentException}
     */
    parseSub(query) {
        if (query instanceof this.constructor ||
            query instanceof Builder_1.Builder ||
            query instanceof Relation_1.Relation) {
            query = this.prependDatabaseNameIfCrossDatabaseQuery(query);
            return [query.toSql(), query.getBindings()];
        }
        else if (typeof query === 'string') {
            return [query, []];
        }
        else {
            throw new Error('InvalidArgumentException: A subquery must be a query builder instance, a Closure, or a string.');
        }
    }
    /**
     * Prepend the database name if the given query is on another database.
     *
     * @param  {any}  query
     * @return {any}
     */
    prependDatabaseNameIfCrossDatabaseQuery(query) {
        if (query.getConnection().getDatabaseName() !== this.getConnection().getDatabaseName()) {
            const databaseName = query.getConnection().getDatabaseName();
            if (query.fromProperty.startsWith(databaseName) === false && query.fromProperty.includes('.') === false) {
                query.from(databaseName + '.' + query.fromProperty);
            }
        }
        return query;
    }
    /**
     * Run the query as a "select" statement against the connection.
     *
     * @return {Array}
     */
    runSelect() {
        return this.connection.select(this.toSql(), this.getBindings());
    }
    /**
     * Set the columns to be selected.
     *
     * @param {Array|any} columns
     * @return {this}
     * @memberof Builder
     */
    select(...columns) {
        columns = columns.length === 0 ? ['*'] : columns;
        this.columns = [];
        this.bindings.select = [];
        for (const [as, column] of Arr_1.Arr.iterable(columns)) {
            if ((0, utils_1.isString)(as) && this.isQueryable(column)) {
                this.selectSub(column, as);
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
   * @param  {string}  expression
   * @param  {array}  bindings
   * @return {this}
   */
    selectRaw(expression, bindings = []) {
        this.addSelect(new internal_1.Expression(expression));
        if (bindings.length > 0) {
            this.addBinding(bindings, 'select');
        }
        return this;
    }
    /**
     * Add a subselect expression to the query.
     *
     * @param {Function|\Illuminate\Database\Query\Builder|\Illuminate\Database\Eloquent\Builder|string}  query
     * @param {string}  as
     * @return {this}
     *
     * @throws {\InvalidArgumentException}
     */
    selectSub(query, as) {
        const [querySub, bindings] = this.createSub(query);
        return this.selectRaw('(' + querySub + ') as ' + this.grammar.wrap(as), bindings);
    }
    /**
     * Get the SQL representation of the query.
     *
     * @return {string}
     */
    toSql() {
        this.applyBeforeQueryCallbacks();
        return this.grammar.compileSelect(this);
    }
}
exports.Builder = Builder;
//# sourceMappingURL=Builder.js.map