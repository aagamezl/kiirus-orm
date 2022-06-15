import { getType, isFunction, isPlainObject, isString, range } from '@devnetic/utils'

import { use } from '../Support/Traits/use'
import { Arr } from './Arr'
import { EnumeratesValues } from './Traits/EnumeratesValues'
import { Macroable } from '../Macroable/Traits/Macroable'
import { dataGet } from './helpers'
import { spaceship } from '../Support'

export interface Collection extends EnumeratesValues, Macroable { }

export class Collection {
  /**
 * The items contained in the collection.
 *
 * @var array<TKey, TValue>
 */
  protected items: any = []

  /**
   * Create a new collection.
   *
   * @param  {\Illuminate\Contracts\Support\Arrayable<TKey, TValue>|iterable<TKey, TValue>|null}  items
   * @return {void}
   */
  constructor (items: unknown = []) {
    use(this.constructor, [EnumeratesValues, Macroable])

    this.items = this.getArrayableItems(items)
  }

  /**
   * Get all of the items in the collection.
   *
   * @return array<TKey, TValue>
   */
  public all (): any[] {
    return this.items
  }

  /**
    * Determine if an item exists in the collection.
    *
    * @param  {*}  key
    * @param  {*}  operator
    * @param  {*}  value
    * @return {boolean}
    */
  public contains (key: any, operator?: any, value?: any): boolean {
    if (arguments.length === 1) {
      if (this.useAsCallable(key)) {
        const placeholder = {}

        return this.first(key, placeholder) !== placeholder
      }

      return this.items.includes(key)
    }

    return this.contains(this.operatorForWhere.apply(null, arguments as any))
  }

  /**
   * Count the number of items in the collection.
   *
   * @return {number}
   */
  public count (): number {
    if (this.items instanceof Map) {
      return this.items.size
    }

    return Object.keys(this.items).length
  }

  /**
   * Get the first item from the collection passing the given truth test.
   *
   * @param  {Function}  [callback]
   * @param  {unknown}  [defaultValue]
   * @return {unknown}
   */
  public first (callback?: (...args: any[]) => void, defaultValue?: unknown): any {
    return Arr.first(this.items, callback, defaultValue)
  }

  /**
   * Concatenate values of a given key as a string.
   *
   * @param  {string}  value
   * @param  {string}  [glue]
   * @return {string}
   */
  public implode (value: string, glue?: string): string {
    const first: unknown = this.first()

    if (Array.isArray(first) || (isPlainObject(first) && typeof first !== 'string')) {
      return this.pluck(value).all().join(glue ?? '')
    }

    return this.items.join(value ?? '')
  }

  /**
   * Determine if the collection is empty or not.
   *
   * @return {boolean}
   */
  public isEmpty (): boolean {
    return getType(this.items) === 'Map' ? this.items?.size === 0 : this.items?.length === 0
  }

  /**
   * Join all items from the collection using a string. The final items can use a separate glue string.
   *
   * @param  {string}  glue
   * @param  {string}  finalGlue
   * @return {string}
   */
  public join (glue: string, finalGlue: string = ''): string {
    if (finalGlue === '') {
      return this.implode(glue)
    }

    const count = this.count()

    if (count === 0) {
      return ''
    }

    if (count === 1) {
      return this.last() as string
    }

    const collection = new Collection(this.items)

    const finalItem: string = collection.pop() as string

    return collection.implode(glue) + finalGlue + finalItem
  }

  /**
   * Get the last item from the collection.
   *
   * @param  {Function|undefined}  [callback]
   * @param  {unknown}  [defaultValue]
   * @return {unknown}
   */
  public last (callback?: Function, defaultValue?: unknown): unknown {
    return Arr.last(this.items, callback, defaultValue)
  }

  /**
   * Create a new collection instance if the value isn't one already.
   *
   * @param  {*}  items
   * @return {static}
   */
  public static make (items: any = []): Collection {
    return new this(items)
  }

  /**
   * Run a map over each of the items.
   *
   * @param  {Function}  callback
   * @return {Collection}
   */
  public map (callback: <I, K>(item: I, key: K) => unknown): Collection {
    return new Collection(this.items.map((item: unknown, key: string) => {
      if (isFunction(callback)) {
        [key, item] = Array.isArray(item) && item.length > 0 ? item : [key, item]

        return callback(item, key)
      }

      return item
    }))
  }

  /**
    * Get an operator checker callback.
    *
    * @param  {string}  key
    * @param  {string|null}  operator
    * @param  {*}  value
    * @return {Function}
    */
  protected operatorForWhere (key: string, operator?: string, value?: any): Function {
    if (arguments.length === 1) {
      value = true

      operator = '='
    }

    if (arguments.length === 2) {
      value = operator

      operator = '='
    }

    return (item: any) => {
      const retrieved: any = dataGet(item, key)

      const strings = [retrieved, value].filter((value) => {
        return isString(value) || (isPlainObject(value) && Reflect.has(value, 'toString'))
      })

      if (strings.length < 2 && [retrieved, value].filter(isPlainObject).length === 1) {
        return ['!=', '<>', '!=='].includes(operator as string)
      }

      switch (operator) {
        case '=':
        case '==': return retrieved == value // eslint-disable-line
        case '!=':
        case '<>': return retrieved != value // eslint-disable-line
        case '<': return retrieved < value
        case '>': return retrieved > value
        case '<=': return retrieved <= value
        case '>=': return retrieved >= value
        case '===': return retrieved === value
        case '!==': return retrieved !== value
        default: return '=='
      }
    }
  }

  /**
   * Get the values of a given key.
   *
   * @param  {string|Array|number}  value
   * @param  {string|undefined}  key
   * @return {Collection}
   */
  public pluck <T>(value?: T, key?: string): Collection {
    return new Collection(Arr.pluck(this.items, value, key))
  }

  /**
   * Get and remove the last N items from the collection.
   *
   * @param  {number}  count
   * @return {static<int, TValue>|TValue|undefined}
   */
  public pop (count: number = 1): unknown {
    if (count === 1) {
      return this.items.pop()
    }

    if (this.isEmpty()) {
      return new Collection()
    }

    const collectionCount = this.count()

    // for (const item of range(1, Math.min(count, collectionCount))) {
    //   results.push(this.items.pop())
    // }

    return new Collection(range(1, Math.min(count, collectionCount)).reduce((results: any[]) => {
      results.push(this.items.pop())

      return results
    }, []))
  }

  /**
   * Sort the collection using the given callback.
   *
   * @param  {Function|Array|string}  callback
   * @param  {boolean}  descending
   * @return {this}
   */
  public sortBy (callback: Function, descending: boolean = false): Collection {
    if (Array.isArray(callback) && !isFunction(callback)) {
      return this.sortByMany(callback)
    }

    let results = new Map()

    callback = this.valueRetriever(callback)

    // First we will loop through the items and get the comparator from a callback
    // function which we were given. Then, we will sort the returned values and
    // and grab the corresponding values for the sorted keys from this array.
    for (const [key, value] of this.items) {
      results.set(key, callback(value, key))
    }

    results = descending
      ? new Map([...results.entries()].sort((a, b) => a[1] - b[1]))
      : new Map([...results.entries()].sort((a, b) => b[1] - a[1]))

    // Once we have sorted all of the keys in the array, we will loop through them
    // and grab the corresponding model so we can set the underlying items list
    // to the sorted version. Then we'll just return the collection instance.
    for (const [key] of results) {
      results.set(key, this.items instanceof Map ? this.items.get(key) : this.items[key])
    }

    return new Collection(results)
  }

  /**
   * Sort the collection using multiple comparisons.
   *
   * @param  {any[]}  comparisons
   * @return {Collection}
   */
  protected sortByMany (comparisons: any[] = []): Collection {
    const items = this.items

    items.sort((a: any, b: any): any => {
      let result: any

      for (let comparison of comparisons) {
        comparison = Arr.wrap(comparison)

        const prop = comparison[0]

        const ascending = Arr.get(comparison, 1, true) === true ||
          Arr.get(comparison, 1, true) === 'asc'

        let values: any

        if (!isString(prop) && isFunction(prop)) {
          result = prop(a, b)
        } else {
          values = [dataGet(a, prop), dataGet(b, prop)]

          if (!ascending) {
            values = values.reverse()
          }

          result = spaceship(values[0], values[1])
        }

        if (result === 0) {
          continue
        }
      }

      return result
    })

    return new Collection(items)
  }
}
