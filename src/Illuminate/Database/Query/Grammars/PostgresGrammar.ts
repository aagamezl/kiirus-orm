import { isTruthy } from '@devnetic/utils'

import { Builder } from '../Builder'
import { Expression } from '../Expression'
import { Grammar, Where } from './Grammar'
import { collect } from '../../../Collections/helpers'

export class PostgresGrammar extends Grammar {
  /**
   * All of the available clause operators.
   *
   * @var string[]
   */
  protected operators: string[] = [
    '=', '<', '>', '<=', '>=', '<>', '!=',
    'like', 'not like', 'between', 'ilike', 'not ilike',
    '~', '&', '|', '#', '<<', '>>', '<<=', '>>=',
    '&&', '@>', '<@', '?', '?|', '?&', '||', '-', '@?', '@@', '#-',
    'is distinct from', 'is not distinct from'
  ]

  /**
   * Compile the "select *" portion of the query.
   *
   * @param  {\Illuminate\Database\Query\Builder}  query
   * @param  {Array}  columns
   * @return {string|undefined}
   */
  protected compileColumns (query: Builder, columns: Array<string | Expression>): string | undefined {
    // If the query is actually performing an aggregating select, we will let that
    // compiler handle the building of the select clauses, as it will need some
    // more syntax that is best handled by that to keep things neat.
    if (query.aggregateProperty !== undefined) {
      return
    }

    let select

    if (Array.isArray(query.distinctProperty)) {
      select = 'select distinct on (' + this.columnize(query.distinctProperty) + ') '
    } else if (isTruthy(query.distinctProperty)) {
      select = 'select distinct '
    } else {
      select = 'select '
    }

    return select + this.columnize(columns)
  }

  /**
   * Compile an insert ignore statement into SQL.
   *
   * @param  {\Illuminate\Database\Query\Builder}  query
   * @param  {Record<string, any>}  values
   * @return {string}
   */
  public compileInsertOrIgnore (query: Builder, values: Record<string, any>): string {
    return this.compileInsert(query, values) + ' on conflict do nothing'
  }

  /**
   * Compile a date based where clause.
   *
   * @param  {string}  type
   * @param  {\Illuminate\Database\Query\Builder}  query
   * @param  {where}  where
   * @return {string}
   */
  protected dateBasedWhere (type: string, query: Builder, where: Where): string {
    const value: string = this.parameter(where.value)

    return 'extract(' + type + ' from ' + this.wrap(where.column) + ') ' + where.operator + ' ' + value
  }

  /**
   * {@inheritdoc}
   *
   * @param  {\Illuminate\Database\Query\Builder}  query
   * @param  {Where}  where
   * @return {string}
   */
  protected whereBasic (query: Builder, where: Where): string {
    if (where.operator.toLowerCase().includes('like')) {
      return `${this.wrap(where.column)}::text ${where.operator} ${this.parameter(where.value)}`
    }

    return super.whereBasic(query, where)
  }

  /**
   * Compile a "where date" clause.
   *
   * @param  {\Illuminate\Database\Query\Builder}  query
   * @param  {Where}  where
   * @return {string}
   */
  protected whereDate (query: Builder, where: Where): string {
    const value = this.parameter(where.value)

    return this.wrap(where.column) + '::date ' + where.operator + ' ' + value
  }

  /**
   * Get an array of valid full text languages.
   *
   * @return {string[]}
   */
  protected validFullTextLanguages (): string[] {
    return [
      'simple',
      'arabic',
      'danish',
      'dutch',
      'english',
      'finnish',
      'french',
      'german',
      'hungarian',
      'indonesian',
      'irish',
      'italian',
      'lithuanian',
      'nepali',
      'norwegian',
      'portuguese',
      'romanian',
      'russian',
      'spanish',
      'swedish',
      'tamil',
      'turkish'
    ]
  }

  /**
   * Compile a "where fulltext" clause.
   *
   * @param  {\Illuminate\Database\Query\Builder}  query
   * @param  {Where}  where
   * @return {string}
   */
  protected whereFulltext (query: Builder, where: Where): string {
    let language: string = where.options.language ?? 'english'

    if (!this.validFullTextLanguages().includes(language)) {
      language = 'english'
    }

    const columns = collect(where.columns).map((column: any) => {
      return `to_tsvector('${language}', ${this.wrap(column)})`
    }).implode(' || ')

    let mode = 'plainto_tsquery'

    if ((where.options.mode ?? []) === 'phrase') {
      mode = 'phraseto_tsquery'
    }

    if ((where.options.mode ?? []) === 'websearch') {
      mode = 'websearch_to_tsquery'
    }

    return `(${columns}) @@ ${mode}('${language}', ${this.parameter(where.value)})`
  }

  /**
   * Compile a "where time" clause.
   *
   * @param  {\Illuminate\Database\Query\Builder}  query
   * @param  {Where}  where
   * @return {string}
   */
  protected whereTime (query: Builder, where: Where): string {
    const value = this.parameter(where.value)

    return this.wrap(where.column) + '::time ' + where.operator + ' ' + value
  }
}
