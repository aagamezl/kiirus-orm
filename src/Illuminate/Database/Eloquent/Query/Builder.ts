import { clone, merge, values } from 'lodash';

import { collect } from '../../../Collections';

import { Builder as QueryBuilder } from '../../Query';
import { WhereInterface } from '../../Query/Builder';
import { Model } from '../Model';
import { Scope } from '../Scope';
export class Builder {
  /**
   * The model being queried.
   *
   * @var \Illuminate\Database\Eloquent\Model
   */
  protected model?: Model;

  /**
   * The methods that should be returned from query builder.
   *
   * @var Array<string>
   */
  protected passthru: Array<string> = [
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
   * The base query builder instance.
   *
   * @var \Illuminate\Database\Query\Builder
   */
  protected query: QueryBuilder;

  /**
   * Applied global scopes.
   *
   * @var Array<any>
   */
  protected scopes: Record<string, Scope> = {};

  /**
 * Create a new Eloquent query builder instance.
 *
 * @param  \Illuminate\Database\Query\Builder  $query
 * @return void
 */
  constructor(query: QueryBuilder) {
    this.query = query;

    return new Proxy(this, {
      get(target: Builder, property: string) {
        if (Reflect.has(target, property)) {
          return Reflect.get(target, property)
        } else {
          if (target.passthru.includes(property)) {
            return Reflect.get(target.toBase(), property);
          }

          try {
            return Reflect.get(query, property);
          } catch (error) {
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
  protected addNewWheresWithinGroup(query: QueryBuilder, originalWhereCount: number) {
    // Here, we totally remove all of the where clauses since we are going to
    // rebuild them as nested queries by slicing the groups of wheres into
    // their own sections. This is to prevent any confusing logic order.
    const allWheres = query.wheres;

    query.wheres = [];

    this.groupWhereSliceForScope(
      query, allWheres.slice(0, originalWhereCount)
    );

    this.groupWhereSliceForScope(
      query, allWheres.slice(originalWhereCount)
    );
  }

  /**
   * Apply the scopes to the Eloquent builder instance and return it.
   *
   * @return static
   */
  public applyScopes() {
    if (Object.values(this.scopes).length === 0) {
      return this;
    }

    const builder = clone(this);

    for (const [identifier, scope] of Object.entries(this.scopes)) {
      if (builder.scopes[identifier]) {
        continue;
      }

      builder.callScope((builder: Builder) => {
        // If the scope is a Closure we will just go ahead and call the scope with the
        // builder instance. The "callScope" method will properly group the clauses
        // that are added to this query so "where" clauses maintain proper logic.
        if (scope instanceof Function) {
          scope(builder);
        }

        // If the scope is a scope object, we will call the apply method on this scope
        // passing in the builder and the model instance. After we run all of these
        // scopes we will return back the builder instance to the outside caller.
        if (scope instanceof Scope) {
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
  protected callScope(scope: Function, parameters: Array<any> = []): any {
    parameters.unshift(this);

    const query = this.getQuery();

    // We will keep track of how many wheres are on the query before running the
    // scope so that we can properly group the added scope constraints in the
    // query as their own isolated nested where statement and avoid issues.
    const originalWhereCount = query.wheres === undefined
      ? 0 : query.wheres.length;

    const result = scope(...values(parameters)) ?? this;

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
  protected createNestedWhere(whereSlice: Array<any>, boolean: string = 'and'): WhereInterface {
    const whereGroup = this.getQuery().forNestedWhere();

    whereGroup.wheres = whereSlice;

    return { type: 'Nested', query: whereGroup, boolean };
  }

  /**
   * Get the underlying query builder instance.
   *
   * @return \Illuminate\Database\Query\Builder
   */
  public getQuery(): QueryBuilder {
    return this.query;
  }

  /**
   * Get the model instance being queried.
   *
   * @return \Illuminate\Database\Eloquent\Model|static
   */
  public getModel(): Model {
    return this.model as Model;
  }

  /**
   * Slice where conditions at the given offset and add them to the query as a nested condition.
   *
   * @param  \Illuminate\Database\Query\Builder  $query
   * @param  Array<any>  whereSlice
   * @return void
   */
  protected groupWhereSliceForScope(query: QueryBuilder, whereSlice: Array<any>) {
    const whereBooleans = collect(whereSlice).pluck('boolean');

    // Here we'll check if the given subset of where clauses contains any "or"
    // booleans and in this case create a nested where expression. That way
    // we don't add any unnecessary nesting thus keeping the query clean.
    if (whereBooleans.contains('or')) {
      query.wheres.push(this.createNestedWhere(
        whereSlice, whereBooleans.first()
      ));
    } else {
      query.wheres = merge(query.wheres, whereSlice);
    }
  }

  /**
   * Get a base query builder instance.
   *
   * @return \Illuminate\Database\Query\Builder
   */
  public toBase(): QueryBuilder {
    return this.applyScopes().getQuery();
  }
}
