import { Builder } from './Builder';
import { ConnectionInterface } from '../ConnectionInterface';
import { Grammar } from './Grammars';
import { Processor } from './Processors';
import { Expression } from './Expression';

// type TJoinClaseExtended = Exclude<Builder & JoinClause, keyof JoinClause>;
type TJoinClaseExtended = Builder & JoinClause;

export type TJoinClause = { [P in keyof TJoinClaseExtended]: TJoinClaseExtended[P] };

export class JoinClause {
  /**
   * The type of join being performed.
   *
   * @var string
   */
  public type: string;

  /**
   * The table the join clause is joining to.
   *
   * @var string
   */
  public table: string;

  /**
   * The connection of the parent query builder.
   *
   * @var \Illuminate\Database\ConnectionInterface
   */
  public parentConnection: ConnectionInterface;

  /**
   * The grammar of the parent query builder.
   *
   * @var \Illuminate\Database\Query\Grammars\Grammar
   */
  public parentGrammar: Grammar;

  /**
   * The processor of the parent query builder.
   *
   * @var \Illuminate\Database\Query\Processors\Processor
   */
  public parentProcessor: Processor;

  /**
   * The class name of the parent query builder.
   *
   * @var string
   */
  public parentClass: string;

  /**
   * Create a new join clause instance.
   *
   * @param  \Illuminate\Database\Query\Builder  parentQuery
   * @param  string  type
   * @param  string  table
   * @return void
   */
  public constructor(parentQuery: Builder, type: string, table: string) {
    this.type = type;
    this.table = table;
    this.parentClass = parentQuery.constructor.name;
    this.parentGrammar = parentQuery.getGrammar();
    this.parentProcessor = parentQuery.getProcessor();
    this.parentConnection = parentQuery.getConnection();

    const builder = new Builder(
      parentQuery.getConnection(),
      parentQuery.getGrammar(),
      parentQuery.getProcessor()
    )

    return new Proxy(this, {
      get(target: object, property: string) {
        if (Reflect.has(target, property)) {
          return Reflect.get(target, property)
        } else {
          if (Reflect.has(builder, property)) {
            return Reflect.get(builder, property)
          }
        }
      }
    }) as TJoinClause;
  }

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
  public on(first: Function | string, operator?: string, second?: Expression | string, boolean: string = 'and') {
    if (first instanceof Function) {
      return (this as unknown as TJoinClause).whereNested(first, boolean);
    }

    return (this as unknown as TJoinClause).whereColumn(first, operator, String(second), boolean);
  }
}
