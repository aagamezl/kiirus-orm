import { lstatSync } from 'fs'

import { getValue, isFalsy, isTruthy } from '@devnetic/utils'

import { HigherOrderTapProxy } from './HigherOrderTapProxy'

/**
 * Returns an array with all keys from array lowercased or uppercased.
 *
 * @param {Record<string, unknown>} value
 * @param {string} [changeCase=CAMEL_CASE]
 * @returns {Record<string, unknown>}
 */
export const changeKeyCase = (value: Record<string, unknown>, changeCase: string = 'CASE_LOWER'): Record<string, unknown> => {
  const result: Record<string, unknown> = {}

  if (isTruthy(value) && typeof value === 'object') {
    const casefunction = (isFalsy(changeCase) || changeCase === 'CASE_LOWER') ? 'toLowerCase' : 'toUpperCase'

    for (const key in value) {
      result[key[casefunction]()] = value[key]
    }

    return result
  }

  return value
}

export const isDirectory = (path: string): boolean => {
  try {
    return lstatSync(path).isDirectory()
  } catch (error) {
    return false
  }
}

export const objectDiffKey = (target: object, ...from: Array<Record<string, unknown>>): object => {
  const keys = from.reduce((result: unknown[], current) => {
    return result.concat(Object.keys(current))
  }, [])

  return Object.entries(target).reduce((result: Record<string, unknown>, [key, value]) => {
    if (!keys.includes(key)) {
      result[key] = value
    }

    return result
  }, {})
}

/**
 * Get a value from the array, and remove it.
 *
 * @param  {Record<string, unknown>}  array
 * @param  {string}  key
 * @param  {any}  [defaultValue=undefined]
 * @return {any}
 */
export const pull = <T extends Record<string, unknown>>(array: T, key: string, defaultValue?: unknown): unknown => {
  const value = getValue(array, key, defaultValue)

  delete array[key] // eslint-disable-line

  return value
}

export const spaceship = (a: any, b: any): number => {
  if (a === b) {
    return 0
  }

  if (a > b || a === null || b === null || a === undefined || b === undefined) {
    return 1
  }

  if (a < b) {
    return -1
  }

  throw new Error(`Spaceship failed on ${a as string} and ${b as string}`)
}

/**
 * Call the given Closure with the given value then return the value.
 *
 * @param  {unknown}  value
 * @param  {callable}  [callback=undefined]
 * @return {unknown}
 */
export const tap = <T>(value: T, callback?: <T>(instance: T) => void): T | HigherOrderTapProxy => {
  if (callback === undefined) {
    return new HigherOrderTapProxy(value)
  }

  callback(value)

  return value
}
