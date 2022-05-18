import { lstatSync } from 'fs'

import { getValue } from '@devnetic/utils'

import { HigherOrderTapProxy } from './HigherOrderTapProxy'

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
