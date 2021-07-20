import { clone, values } from 'lodash'

import { Scope } from './Scope'

export class Builder {
  /**
   * Create a new Eloquent query builder instance.
   *
   * @constructor
   * @param  {\Illuminate\Database\Query\Builder}  query
   * @return void
   */
  constructor (query) {
    /**
     * The base query builder instance.
     *
     * @member {\Illuminate\Database\Query\Builder}
     */
    this.query = query

    /**
     * The methods that should be returned from query builder.
     *
     * @member {Array}
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
      'toSql'
    ]

    /**
     * Applied global scopes.
     *
     * @member array
     */
    this.scopes = []

    /**
     * Removed global scopes.
     *
     * @member array
     */
    this.removedScopes = []

    return new Proxy(this, {
      get (target, property) {
        if (Reflect.has(target, property)) {
          return Reflect.get(target, property)
        } else {
          if (target.passthru.includes(property)) {
            return Reflect.get(target.toBase(), property)
          }

          try {
            return Reflect.get(query, property)
          } catch (error) {
            throw Error(`BadMethodCallException: 'Call to undefined method ${target.constructor.name}.${property})`)
          }
        }
      }
    })
  }

  /**
   * Apply the scopes to the Eloquent builder instance and return it.
   *
   * @return static
   */
  applyScopes () {
    if (Object.values(this.scopes).length === 0) {
      return this
    }

    const builder = clone(this)

    for (const [identifier, scope] of Object.entries(this.scopes)) {
      if (builder.scopes[identifier]) {
        continue
      }

      builder.callScope((builder) => {
        // If the scope is a Closure we will just go ahead and call the scope with the
        // builder instance. The "callScope" method will properly group the clauses
        // that are added to this query so "where" clauses maintain proper logic.
        if (scope instanceof Function) {
          scope(builder)
        }

        // If the scope is a scope object, we will call the apply method on this scope
        // passing in the builder and the model instance. After we run all of these
        // scopes we will return back the builder instance to the outside caller.
        if (scope instanceof Scope) {
          scope.apply(builder, this.getModel())
        }
      })
    }

    return builder
  }

  /**
   * Apply the given scope on the current builder instance.
   *
   * @param  {Function}  scope
   * @param  {Array}  parameters
   * @return {Array}
   */
  callScope (scope, parameters = []) {
    parameters.unshift(this)

    const query = this.getQuery()

    // We will keep track of how many wheres are on the query before running the
    // scope so that we can properly group the added scope constraints in the
    // query as their own isolated nested where statement and avoid issues.
    const originalWhereCount = query.wheres === undefined
      ? 0
      : query.wheres.length

    const result = scope(...values(parameters)) ?? this

    if (query.wheres.length > originalWhereCount) {
      this.addNewWheresWithinGroup(query, originalWhereCount)
    }

    return result
  }

  /**
   * Get the underlying query builder instance.
   *
   * @return \Illuminate\Database\Query\Builder
   */
  getQuery () {
    return this.query
  }

  /**
   * Get the model instance being queried.
   *
   * @return \Illuminate\Database\Eloquent\Model|static
   */
  getModel () {
    return this.model
  }

  /**
   * Get a base query builder instance.
   *
   * @return \Illuminate\Database\Query\Builder
   */
  toBase () {
    return this.applyScopes().getQuery()
  }
}
