export const EnumeratesValues = {
  /**
   * Reduce the collection to a single value.
   *
   * @param  {Function}  callback
   * @param  {*}  initial
   * @return {*}
   */
  reduce (callbackFunc, initial) {
    let result = initial

    for (const [key, value] of Object.entries(this.items)) {
      result = callbackFunc(result, value, key)
    }

    return result
  }
}
