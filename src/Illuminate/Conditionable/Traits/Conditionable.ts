import { isFalsy, isTruthy } from '@devnetic/utils'

export class Conditionable {
  /**
   * Apply the callback's query changes if the given "value" is false.
   *
   * @param  {*}  value
   * @param  {Function}  callbackFunc
   * @param  {Function}  [defaultCallback]
   * @return {this|*}
   */
  public unless (value: unknown, callbackFunc?: Function, defaultCallback?: Function): this {
    value = value instanceof Function ? value(this) : value

    if (isFalsy(value)) {
      return (callbackFunc as Function)(this, value) ?? this
    } else if (defaultCallback !== undefined) {
      return defaultCallback(this, value) ?? this
    }

    return this
  }

  /**
   * Apply the callback's query changes if the given "value" is true.
   *
   * @param  {unknown}  value
   * @param  {Function}  callback
   * @param  {Function|undefined}  [defaultCallback]
   * @return {*|this}
   */
  public when (value: unknown, callbackFunc?: Function, defaultCallback?: Function): this {
    value = value instanceof Function ? value(this) : value

    // if (callbackFunc === undefined) {
    //   return new HigherOrderWhenProxy(this, value)
    // }

    if (isTruthy(value)) {
      return (callbackFunc as Function)(this, value) ?? this
    } else if (defaultCallback !== undefined) {
      return defaultCallback(this, value) ?? this
    }

    return this
  }
}
