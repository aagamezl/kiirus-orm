import { Connection } from '../Connection'
import { Builder, Expression } from './internal'
import { Grammar } from './Grammars/Grammar'
import { Processor } from './Processors'

/**
 *
 *
 * @export
 * @class JoinClause
 * @extends {Builder}
 */
export class JoinClause extends Builder {
  /**
   * The class name of the parent query builder.
   *
   * @var string
   */
  protected parentClass: Function

  /**
   * The connection of the parent query builder.
   *
   * @var \Illuminate\Database\Connection
   */
  protected parentConnection: Connection

  /**
   * The grammar of the parent query builder.
   *
   * @var \Illuminate\Database\Query\Grammars\Grammar
   */
  protected parentGrammar: Grammar

  /**
   * The processor of the parent query builder.
   *
   * @var \Illuminate\Database\Query\Processors\Processor
   */
  protected parentProcessor: Processor

  /**
   * The table the join clause is joining to.
   *
   * @var string
   */
  public table: string

  /**
   * The type of join being performed.
   *
   * @var string
   */
  public type: string

  /**
   * Create a new join clause instance.
   *
   * @constructor
   * @param  {{\Illuminate\Database\Query\Builder}}  parentQuery
   * @param  {string}  type
   * @param  {string}  table
   * @return {void}
   */
  constructor (parentQuery: Builder, type: string, table: string) {
    super(
      parentQuery.getConnection(),
      parentQuery.getGrammar(),
      parentQuery.getProcessor()
    )

    this.type = type
    this.table = table
    this.parentClass = parentQuery.constructor
    this.parentGrammar = parentQuery.getGrammar()
    this.parentProcessor = parentQuery.getProcessor()
    this.parentConnection = parentQuery.getConnection()
  }

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
  public on (first: string | Function, operator?: string, second?: string | Expression, boolean: string = 'and'): this {
    if (first instanceof Function) {
      return this.whereNested(first, boolean)
    }

    return this.whereColumn(first, operator, second as any, boolean)
  }
}
