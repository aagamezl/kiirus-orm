import { isTruthy } from '@devnetic/utils'

import { Builder } from '../Builder'
import { Grammar, Where } from './Grammar'

export class MySqlGrammar extends Grammar {
  /**
   * The grammar specific operators.
   *
   * @type {string[]}
   */
  protected operators: string[] = ['sounds like']

  /**
   * Wrap a single string in keyword identifiers.
   *
   * @param  {string}  value
   * @return {string}
   */
  protected wrapValue (value: string): string {
    return value === '*' ? value : '`' + value.replace('`', '``') + '`'
  }

  /**
   * Compile a "where fulltext" clause.
   *
   * @param  {\Illuminate\Database\Query\Builder}  query
   * @param  {Where}  where
   * @return {string}
   */
  protected whereFulltext (query: Builder, where: Where): string {
    const columns = this.columnize(where.columns)

    const value = this.parameter(where.value)

    const mode = (where.options.mode ?? []) === 'boolean'
      ? ' in boolean mode'
      : ' in natural language mode'

    const expanded = (isTruthy(where.options.expanded) ?? []) && (where.options.mode ?? []) !== 'boolean'
      ? ' with query expansion'
      : ''

    return `match (${columns}) against (` + value + `${mode}${expanded})`
  }
}
