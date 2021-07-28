import { HigherOrderTapProxy } from './HigherOrderTapProxy'

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

export const isNumeric = (value) => {
  return !Array.isArray(value) && (value - parseFloat(value) + 1) >= 0
}

export const ksort = (value) => Object.keys(value).sort().reduce((result, key) => {
  result[key] = value[key]

  return result
}, {})

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
