import { Expression } from './Query/Expression'

import { Macroable } from './../Macroable/Traits/Macroable'
import { collect } from './../Collections/helpers'
import { throwException } from './../Support'
import { use } from './../Macroable/Traits/Trait'

export class Grammar {
  constructor () {
    const proxy = use(this, Macroable)

    /**
     * The registered string macros.
     *
     * @var {Array}
     */
    // this.macros = []

    /**
     * The grammar table prefix.
     *
     * @member string
     */
    this.tablePrefix = ''

    if (new.target === Grammar) {
      throwException('abstract')
    }

    return proxy
  }

  /**
   * Convert an array of column names into a delimited string.
   *
   * @param  {Array}  columns
   * @return {string}
   */
  columnize (columns) {
    return columns.map(column => this.wrap(column)).join(', ')
  }

  /**
   * Get the value of a raw expression.
   *
   * @param  {\Illuminate\Database\Query\Expression}  expression
   * @return {string}
   */
  getValue (expression) {
    return expression.getValue()
  }

  /**
   * Determine if the given value is a raw expression.
   *
   * @param  {*}  value
   * @return {boolean}
   */
  isExpression (value) {
    return value instanceof Expression
  }

  /**
   * Get the appropriate query parameter place-holder for a value.
   *
   * @param  {*}  value
   * @return {string}
   */
  parameter (value) {
    return this.isExpression(value) ? this.getValue(value) : '?'
  }

  /**
   * Create query parameter place-holders for an array.
   *
   * @param  {Array}  values
   * @return {string}
   */
  parameterize (values) {
    return (Array.isArray(values) ? values : Object.values(values))
      .map((value) => this.parameter(value)).join(', ')
  }

  /**
 * Quote the given string literal.
 *
 * @param  {string|Array}  value
 * @return {string}
 */
  quoteString (value) {
    if (Array.isArray(value)) {
      return value.map(this.quoteString).join(', ')
    }

    return `'${value}'`
  }

  /**
   * Set the grammar's table prefix.
   *
   * @param  {string}  prefix
   * @return {this}
   */
  setTablePrefix (prefix) {
    this.tablePrefix = prefix

    return this
  }

  /**
   * Wrap a value in keyword identifiers.
   *
   * @param  {\Illuminate\Database\Query\Expression|string}  value
   * @param  {boolean}  [prefixAlias=false]
   * @return {string}
   */
  wrap (value, prefixAlias = false) {
    if (this.isExpression(value)) {
      return this.getValue(value)
    }

    // If the value being wrapped has a column alias we will need to separate out
    // the pieces so we can wrap each of the segments of the expression on its
    // own, and then join these both back together using the "as" connector.
    if (/\sas\s/i.test(value) !== false) {
      return this.wrapAliasedValue(value, prefixAlias)
    }

    return this.wrapSegments(value.split('.'))
  }

  /**
   * Wrap a value that has an alias.
   *
   * @param  {string}  value
   * @param  {boolean}  prefixAlias
   * @return {string}
   */
  wrapAliasedValue (value, prefixAlias = false) {
    const segments = value.split(/\s+as\s+/i)

    // If we are wrapping a table we need to prefix the alias with the table prefix
    // as well in order to generate proper syntax. If this is a column of course
    // no prefix is necessary. The condition will be true when from wrapTable.
    if (prefixAlias) {
      segments[1] = this.tablePrefix + segments[1]
    }

    return this.wrap(segments[0]) + ' as ' + this.wrapValue(segments[1])
  }

  /**
   * Wrap an array of values.
   *
   * @param  {Array}  values
   * @return {Array}
   */
  wrapArray (values) {
    return values.map(item => this.wrap(item))
  }

  /**
   * Wrap the given value segments.
   *
   * @param  {Array}  segments
   * @return {string}
   */
  wrapSegments (segments) {
    return collect(segments).map((segment, key) => {
      return key === 0 && segments.length > 1
        ? this.wrapTable(segment)
        : this.wrapValue(String(segment))
    }).join('.')
  }

  /**
   * Wrap a table in keyword identifiers.
   *
   * @param  {\Illuminate\Database\Query\Expression|string}  table
   * @return {string}
   */
  wrapTable (table) {
    if (!this.isExpression(table)) {
      return this.wrap(this.tablePrefix + table, true)
    }

    return this.getValue(table)
  }

  /**
   * Wrap a single string in keyword identifiers.
   *
   * @param  {string}  value
   * @return {string}
   */
  wrapValue (value) {
    if (value !== '*') {
      return '"' + value.replace('"', '""') + '"'
    }

    return value
  }
}
