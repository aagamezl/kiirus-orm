import { Connection } from '../Connection';
import { Builder } from './internal';
import { Grammar } from './Grammars/Grammar';
import { Processor } from './Processors';
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
    protected parentClass: Function;
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
     * @var string
     */
    table: string;
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
    constructor(parentQuery: Builder, type: string, table: string);
}
