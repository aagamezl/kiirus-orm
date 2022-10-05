// import { castArray } from '@devnetic/utils'

import { Macroable } from '../Macroable/Traits/Macroable'
import { castArray } from './helpers'
import { Stringable } from './Stringable'
import { use } from './Traits/use'

export interface Str extends Macroable { }

// export const Str = use({
// eslint-disable-next-line
export class Str {
  /**
   * The cache of snake-cased words.
   *
   * @var array
   */
  protected static snakeCache: string[]

  /**
   * The cache of camel-cased words.
   *
   * @var array
   */
  protected static camelCache: string[]

  /**
   * The cache of studly-cased words.
   *
   * @var array
   */
  protected static studlyCache: string[]

  /**
   * The callback that should be used to generate UUIDs.
   *
   * @var callable
   */
  protected static uuidFactory: Function

  /**
   * Get the portion of a string before the last occurrence of a given value.
   *
   * @param  {string}  subject
   * @param  {string}  search
   * @return {string}
   */
  public static beforeLast (subject: string, search: string): string {
    if (search === '') {
      return subject
    }

    const pos = subject.indexOf(search)

    if (pos === -1) {
      return subject
    }

    return subject.substring(0, pos)
  }

  /**
   * Determine if a given string contains a given substring.
   *
   * @param  {string}  haystack
   * @param  {string|string[]}  needles
   * @param  {boolean}  ignoreCase
   * @return {boolean}
   */
  public static contains (haystack: string, needles: string | string[], ignoreCase = false): boolean {
    if (ignoreCase) {
      haystack = haystack.toLowerCase()

      needles = [...needles].map((needle: string) => needle.toLowerCase())
    }

    for (const needle of needles) {
      if (haystack.includes(needle)) {
        return true
      }
    }

    return false
  }

  /**
   * Determine if a given string ends with a given substring.
   *
   * @param  {string}  haystack
   * @param  {string|string[]}  needles
   * @return {boolean}
   */
  public static endsWith (haystack: any, needles: string[]): boolean {
    for (const needle of castArray(needles)) {
      if (needle !== '' && needle !== undefined && haystack.endsWith(needle) === true) {
        return true
      }
    }

    return false
  }

  /**
   * Get a new stringable object from the given string.
   *
   * @param  {string}  string
   * @return {\Illuminate\Support\Stringable}
   */
  public static of (string: string): Stringable {
    return new Stringable(string)
  }
}

use(Str, [Macroable])
