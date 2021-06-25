"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Builder = void 0;
const lodash_1 = require("lodash");
const Collections_1 = require("../../../Collections");
const Scope_1 = require("../Scope");
class Builder {
    /**
   * Create a new Eloquent query builder instance.
   *
   * @param  \Illuminate\Database\Query\Builder  $query
   * @return void
   */
    constructor(query) {
        /**
         * The methods that should be returned from query builder.
         *
         * @var Array<string>
         */
        this.passthru = [
            'average',
            'avg',
            'count',
            'dd',
            'doesntExist',
            'dump',
            'exists',
            'getBindings',
            'getConnection',
            'getGrammar',
            'insert',
            'insertGetId',
            'insertOrIgnore',
            'insertUsing',
            'max',
            'min',
            'raw',
            'sum',
            'toSql',
        ];
        /**
         * Applied global scopes.
         *
         * @var Array<any>
         */
        this.scopes = {};
        this.query = query;
        return new Proxy(this, {
            get(target, property) {
                if (Reflect.has(target, property)) {
                    return Reflect.get(target, property);
                }
                else {
                    if (target.passthru.includes(property)) {
                        return Reflect.get(target.toBase(), property);
                    }
                    try {
                        return Reflect.get(query, property);
                    }
                    catch (error) {
                        throw Error(`BadMethodCallException: 'Call to undefined method ${target.constructor.name}.${property})`);
                    }
                }
            }
        });
    }
    /**
     * Nest where conditions by slicing them at the given where count.
     *
     * @param  \Illuminate\Database\Query\Builder  query
     * @param  Number  originalWhereCount
     * @return void
     */
    addNewWheresWithinGroup(query, originalWhereCount) {
        // Here, we totally remove all of the where clauses since we are going to
        // rebuild them as nested queries by slicing the groups of wheres into
        // their own sections. This is to prevent any confusing logic order.
        const allWheres = query.wheres;
        query.wheres = [];
        this.groupWhereSliceForScope(query, allWheres.slice(0, originalWhereCount));
        this.groupWhereSliceForScope(query, allWheres.slice(originalWhereCount));
    }
    /**
     * Apply the scopes to the Eloquent builder instance and return it.
     *
     * @return static
     */
    applyScopes() {
        if (Object.values(this.scopes).length === 0) {
            return this;
        }
        const builder = lodash_1.clone(this);
        for (const [identifier, scope] of Object.entries(this.scopes)) {
            if (builder.scopes[identifier]) {
                continue;
            }
            builder.callScope((builder) => {
                // If the scope is a Closure we will just go ahead and call the scope with the
                // builder instance. The "callScope" method will properly group the clauses
                // that are added to this query so "where" clauses maintain proper logic.
                if (scope instanceof Function) {
                    scope(builder);
                }
                // If the scope is a scope object, we will call the apply method on this scope
                // passing in the builder and the model instance. After we run all of these
                // scopes we will return back the builder instance to the outside caller.
                if (scope instanceof Scope_1.Scope) {
                    scope.apply(builder, this.getModel());
                }
            });
        }
        return builder;
    }
    /**
     * Apply the given scope on the current builder instance.
     *
     * @param  Function  scope
     * @param  array  parameters
     * @return Array<any>
     */
    callScope(scope, parameters = []) {
        var _a;
        parameters.unshift(this);
        const query = this.getQuery();
        // We will keep track of how many wheres are on the query before running the
        // scope so that we can properly group the added scope constraints in the
        // query as their own isolated nested where statement and avoid issues.
        const originalWhereCount = query.wheres === undefined
            ? 0 : query.wheres.length;
        const result = (_a = scope(...lodash_1.values(parameters))) !== null && _a !== void 0 ? _a : this;
        if (query.wheres.length > originalWhereCount) {
            this.addNewWheresWithinGroup(query, originalWhereCount);
        }
        return result;
    }
    /**
     * Create a where array with nested where conditions.
     *
     * @param  Array<any>  whereSlice
     * @param  string  boolean
     * @return WhereInterface
     */
    createNestedWhere(whereSlice, boolean = 'and') {
        const whereGroup = this.getQuery().forNestedWhere();
        whereGroup.wheres = whereSlice;
        return { type: 'Nested', query: whereGroup, boolean };
    }
    /**
     * Get the underlying query builder instance.
     *
     * @return \Illuminate\Database\Query\Builder
     */
    getQuery() {
        return this.query;
    }
    /**
     * Get the model instance being queried.
     *
     * @return \Illuminate\Database\Eloquent\Model|static
     */
    getModel() {
        return this.model;
    }
    /**
     * Slice where conditions at the given offset and add them to the query as a nested condition.
     *
     * @param  \Illuminate\Database\Query\Builder  $query
     * @param  Array<any>  whereSlice
     * @return void
     */
    groupWhereSliceForScope(query, whereSlice) {
        const whereBooleans = Collections_1.collect(whereSlice).pluck('boolean');
        // Here we'll check if the given subset of where clauses contains any "or"
        // booleans and in this case create a nested where expression. That way
        // we don't add any unnecessary nesting thus keeping the query clean.
        if (whereBooleans.contains('or')) {
            query.wheres.push(this.createNestedWhere(whereSlice, whereBooleans.first()));
        }
        else {
            query.wheres = lodash_1.merge(query.wheres, whereSlice);
        }
    }
    /**
     * Get a base query builder instance.
     *
     * @return \Illuminate\Database\Query\Builder
     */
    toBase() {
        return this.applyScopes().getQuery();
    }
}
exports.Builder = Builder;
//# sourceMappingURL=Builder.js.map