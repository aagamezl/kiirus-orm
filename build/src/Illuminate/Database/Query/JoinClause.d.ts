import { Builder } from './internal';
import { ConnectionInterface } from '../ConnectionInterface';
import { Grammar } from './Grammars';
import { Processor } from './Processors';
import { Expression } from './Expression';
export declare type JoinClassExtended = JoinClause & Builder;
export declare type TJoinClause = {
    [P in keyof JoinClassExtended]: JoinClassExtended[P];
};
export declare class JoinClause extends Builder {
    /**
     * The connection of the parent query builder.
     *
     * @var \Illuminate\Database\ConnectionInterface
     */
    parentConnection: ConnectionInterface;
    /**
     * The grammar of the parent query builder.
     *
     * @var \Illuminate\Database\Query\Grammars\Grammar
     */
    parentGrammar: Grammar;
    /**
     * The processor of the parent query builder.
     *
     * @var \Illuminate\Database\Query\Processors\Processor
     */
    parentProcessor: Processor;
    /**
     * The class name of the parent query builder.
     *
     * @var string
     */
    parentClass: Function;
    /**
     * The table the join clause is joining to.
     *
     * @var string
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
     * @param  \Illuminate\Database\Query\Builder  parentQuery
     * @param  string  type
     * @param  string  table | Expression
     * @return void
     */
    constructor(parentQuery: Builder, type: string, table: string | Expression);
    /**
     * Create a new query instance for sub-query.
     *
     * @return \Illuminate\Database\Query\Builder
     */
    protected forSubQuery(): this;
    /**
     * Create a new parent query instance.
     *
     * @return \Illuminate\Database\Query\Builder
     */
    protected newParentQuery(): this;
    /**
     * Get a new instance of the join clause builder.
     *
     * @return \Illuminate\Database\Query\JoinClause
     */
    newQuery(): any;
    /**
     * Add an "on" clause to the join.
     *
     * On clauses can be chained, e.g.
     *
     *  $join->on('contacts.user_id', '=', 'users.id')
     *       ->on('contacts.info_id', '=', 'info.id')
     *
     * will produce the following SQL:
     *
     * on `contacts`.`user_id` = `users`.`id` and `contacts`.`info_id` = `info`.`id`
     *
     * @param  \Function|string  first
     * @param  string|null  operator
     * @param  \Illuminate\Database\Query\Expression|string|null  second
     * @param  string  boolean
     * @return this
     *
     * @throws \InvalidArgumentException
     */
    on(first: Function | string, operator?: string, second?: Expression | string, boolean?: string): this;
    /**
     * Add an "or on" clause to the join.
     *
     * @param  Function|string  first
     * @param  [string]  operator
     * @param  [string]  second
     * @return \Illuminate\Database\Query\JoinClause
     */
    orOn(first: Function | string, operator?: string, second?: string): this;
}
