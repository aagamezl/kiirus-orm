import { Connection } from '../Connection';
import { Builder, Expression } from './internal';
import { Grammar } from './Grammars/Grammar';
import { Processor } from './Processors';
declare type Constructor<T extends {} = {}> = new (...args: any[]) => T;
/**
 *
 *
 * @export
 * @class JoinClause
 * @extends {Builder}
 */
export declare class JoinClause extends Builder {
    /**
     * The class name of the parent query builder.
     *
     * @var string
     */
    protected parentClass: Constructor<Builder>;
    /**
     * The connection of the parent query builder.
     *
     * @var \Illuminate\Database\Connection
     */
    protected parentConnection: Connection;
    /**
     * The grammar of the parent query builder.
     *
     * @var \Illuminate\Database\Query\Grammars\Grammar
     */
    protected parentGrammar: Grammar;
    /**
     * The processor of the parent query builder.
     *
     * @var \Illuminate\Database\Query\Processors\Processor
     */
    protected parentProcessor: Processor;
    /**
     * The table the join clause is joining to.
     *
     * @var string | Expression
     */
    table: string | Expression;
    /**
     * The type of join being performed.
     *
     * @var string
     */
    type: string;
    /**
     * Create a new join clause instance.
     *
     * @constructor
     * @param  {{\Illuminate\Database\Query\Builder}}  parentQuery
     * @param  {string}  type
     * @param  {string}  table
     * @return {void}
     */
    constructor(parentQuery: Builder, type: string, table: string | Expression);
    /**
     * Create a new query instance for sub-query.
     *
     * @return {\Illuminate\Database\Query\Builder}
     */
    protected forSubQuery(): Builder;
    /**
     * Create a new parent query instance.
     *
     * @return {\Illuminate\Database\Query\Builder}
     */
    protected newParentQuery(): Builder;
    /**
     * Get a new instance of the join clause builder.
     *
     * @return {\Illuminate\Database\Query\JoinClause}
     */
    newQuery(): JoinClause;
    /**
     * Add an "on" clause to the join.
     *
     * On clauses can be chained, e.g.
     *
     *  join.on('contacts.user_id', '=', 'users.id')
     *      .on('contacts.info_id', '=', 'info.id')
     *
     * will produce the following SQL:
     *
     * on `contacts`.`user_id` = `users`.`id` and `contacts`.`info_id` = `info`.`id`
     *
     * @param  {\Function|string}  first
     * @param  {string}  [operator]
     * @param  {\Illuminate\Database\Query\Expression|string|undefined}  [second]
     * @param  {string}  [boolean=and]
     * @return {this}
     *
     * @throws {\InvalidArgumentException}
     */
    on(first: string | Function, operator?: string, second?: string | Expression, boolean?: string): this;
    /**
     * Add an "or on" clause to the join.
     *
     * @param  {Function|string}  first
     * @param  {string}  [operator=undefined]
     * @param  {string}  [second=undefined]
     * @return {\Illuminate\Database\Query\JoinClause}
     */
    orOn(first: Function | string, operator?: string, second?: string): this;
}
export {};
