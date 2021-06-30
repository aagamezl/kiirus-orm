// import { Builder } from './Builder';
import {Builder} from './internal';
import {ConnectionInterface} from '../ConnectionInterface';
import {Grammar} from './Grammars';
import {Processor} from './Processors';
import {Expression} from './Expression';

export type JoinClassExtended = JoinClause & Builder;

export type TJoinClause = {
  [P in keyof JoinClassExtended]: JoinClassExtended[P];
};

export class JoinClause extends Builder {
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
  public parentClass: Function;

  /**
   * The table the join clause is joining to.
   *
   * @var string
   */
  public table: string | Expression;

  /**
   * The type of join being performed.
   *
   * @var string
   */
  public type: string;

  /**
   * Create a new join clause instance.
   *
   * @param  \Illuminate\Database\Query\Builder  parentQuery
   * @param  string  type
   * @param  string  table | Expression
   * @return void
   */
  public constructor(
    parentQuery: Builder,
    type: string,
    table: string | Expression
  ) {
    super(
      parentQuery.getConnection(),
      parentQuery.getGrammar(),
      parentQuery.getProcessor()
    );

    this.type = type;
    this.table = table;
    this.parentClass = parentQuery.constructor;
    this.parentGrammar = parentQuery.getGrammar();
    this.parentProcessor = parentQuery.getProcessor();
    this.parentConnection = parentQuery.getConnection();
  }

  /**
   * Create a new query instance for sub-query.
   *
   * @return \Illuminate\Database\Query\Builder
   */
  protected forSubQuery(): this {
    return this.newParentQuery().newQuery();
  }

  /**
   * Create a new parent query instance.
   *
   * @return \Illuminate\Database\Query\Builder
   */
  protected newParentQuery(): this {
    const constructor = this.parentClass;

    return new (constructor as any)(
      this.parentConnection,
      this.parentGrammar,
      this.parentProcessor
    );
  }

  /**
   * Get a new instance of the join clause builder.
   *
   * @return \Illuminate\Database\Query\JoinClause
   */
  public newQuery() {
    return new (this.constructor as any)(
      this.newParentQuery(),
      this.type,
      this.table
    );
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
  public on(
    first: Function | string,
    operator?: string,
    second?: Expression | string,
    boolean = 'and'
  ): this {
    if (first instanceof Function) {
      // return (this as any).whereNested(first, boolean);
      return this.whereNested(first, boolean);
    }

    // return this.whereColumn(first, operator, String(second), boolean) as unknown as TJoinClause;
    return this.whereColumn(first, operator, String(second), boolean);
  }

  /**
   * Add an "or on" clause to the join.
   *
   * @param  Function|string  first
   * @param  [string]  operator
   * @param  [string]  second
   * @return \Illuminate\Database\Query\JoinClause
   */
  public orOn(
    first: Function | string,
    operator?: string,
    second?: string
  ): this {
    return this.on(first, operator, second, 'or');
  }
}
