import { isNil } from 'lodash'

import { HigherOrderTapProxy } from './HigherOrderTapProxy'

/**
 * Quote string with slashes.
 *
 * @param {string} value
 * @returns {string}
 */
export const addslashes = (value) => value.replace(/'/g, "\\'")

/**
 * Returns an array with all keys from array lowercased or uppercased.
 *
 * @param {object} value
 * @param {string} [changeCase=CAMEL_CASE]
 * @returns {object}
 */
export const changeKeyCase = (value, changeCase = 'CASE_LOWER') => {
  const result = {}

  if (value && typeof value === 'object') {
    const casefunction = (!changeCase || changeCase === 'CASE_LOWER') ? 'toLowerCase' : 'toUpperCase'

    for (const key in value) {
      result[key[casefunction]()] = value[key]
    }

    return result
  }
}

export const isSubclassOf = (child, parent) => {
  if (child === parent) {
    return true
  }

  if (child.prototype instanceof parent) {
    return true
  }

  if (child === Object) {
    return false
  }

  return isSubclassOf(Object.getPrototypeOf(child), parent)
}

export const ksort = (value) => Object.keys(value).sort().reduce((result, key) => {
  result[key] = value[key]

  return result
}, {})

export const lcfirst = (string) => {
  return string.charAt(0).toLowerCase() + string.slice(1)
}

export const objectDiffKey = (target, ...from) => {
  const keys = from.reduce((result, current) => {
    return result.concat(Object.keys(current))
  }, [])

  return Object.entries(target).reduce((result, [key, value]) => {
    if (!keys.includes(key)) {
      result[key] = value
    }

    return result
  }, {})
}

/**
 * Call the given Closure with the given value then return the value.
 *
 * @param  {any}  value
 * @param  {Function|null}  callback
 * @return {any}
 */
export const tap = (value, callback) => {
  if (!callback) {
    return new HigherOrderTapProxy(value)
  }

  callback(value)

  return value
}

export const throwException = (type, message) => {
  switch (type) {
    case 'abstract':
      throw new Error('Cannot create an instance of an abstract class.')

    case 'concrete-method':
      throw new Error(`RuntimeException: Implement ${message} method on concrete class.`)
  }
}

/**
 * Make a string's first character uppercase
 *
 * @param  {string}  value
 * @return {string}
 */
export const ucfirst = (value) => {
  return value.charAt(0).toUpperCase() + value.substr(1)
}

/**
 * Return the given value, optionally passed through the given callback.
 *
 * @param  {*}  value
 * @param  {Function|undefined}  callback
 * @return {*}
 */
export const withGiven = (value, callbackFunction = undefined) => {
  return isNil(callbackFunction) ? value : callbackFunction(value)
}
