import { Builder } from './internal'

export class JoinClause extends Builder {
  /**
   * Create a new join clause instance.
   *
   * @param  {\Illuminate\Database\Query\Builder}  parentQuery
   * @param  {string}  type
   * @param  {string}  table
   * @return {void}
   */
  constructor (parentQuery, type, table) {
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
   * @param  {string|undefined}  [operator]
   * @param  {\Illuminate\Database\Query\Expression|string|null}  [second]
   * @param  {string}  [boolean=and]
   * @return {this}
   *
   * @throws {\InvalidArgumentException}
   */
  on (first, operator = undefined, second = undefined, boolean = 'and') {
    if (first instanceof Function) {
      return this.whereNested(first, boolean)
    }

    return this.whereColumn(first, operator, second, boolean)
  }
}
