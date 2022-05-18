import { isFunction, isPlainObject, isString } from '@devnetic/utils'

import { Collection } from '../Collection'
import { dataGet } from '../helpers'

// export const EnumeratesValues = {
export class EnumeratesValues {
  /**
   * Results array of items from Collection or Arrayable.
   *
   * @param  {unknown}  items
   * @return {array<TKey, TValue>}
   */
  protected getArrayableItems <T>(items: T): unknown {
    if (Array.isArray(items) || items as any instanceof Map) {
      return items
    } else if (items as any instanceof Collection) {
      return (items as unknown as Collection).all()
    } else if (isPlainObject(items)) {
      return [items]
    } else if (items === undefined) {
      return []
    }

    return [items]
  }

  /**
   * Determine if the given value is callable, but not a string.
   *
   * @param  {*}  value
   * @return {boolean}
   */
  protected useAsCallable (value: any): boolean {
    return !isString(value) && isFunction(value)
  }

  /**
   * Get a value retrieving callback.
   *
   * @param  {Function|string}  [value]
   * @return {Function}
   */
  protected valueRetriever (value: Function | string): Function {
    if (this.useAsCallable(value)) {
      return value as Function
    }

    return (item: any) => {
      return dataGet(item, value as any)
    }
  }
}
