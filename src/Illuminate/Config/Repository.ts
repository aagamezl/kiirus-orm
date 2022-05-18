import { readFileSync } from 'fs'
import { join } from 'path'

import { getValue, isNumeric } from '@devnetic/utils'

import { Arr } from '../Collections/Arr'

export class Repository {
  protected configFile: string

  /**
   * All of the configuration items.
   *
   * @var Record<string, unknown>
   */
  protected items: Record<string, unknown> = {}

  /**
   * Create a new configuration repository.
   *
   * @param  {Array}  items
   * @return {void}
   */
  public constructor (items: Record<string, unknown> = {}) {
    this.configFile = 'config.json'

    try {
      const path = join(process.cwd(), this.configFile)

      const config = JSON.parse(readFileSync(path, { encoding: 'utf8' }))

      this.items = { ...config, ...items }
    } catch (error) {
      throw new Error(`Could not load ${this.configFile}`)
    }
  }

  /**
   * Get the specified configuration value.
   *
   * @param  {Array|string}  key
   * @param  {*}  defaultValue
   * @return {*}
   */
  public get (key: string, defaultValue: unknown = undefined): any {
    if (Array.isArray(key)) {
      return this.getMany(key)
    }

    return getValue(this.items, key, defaultValue)
  }

  /**
   * Get many configuration values.
   *
   * @param  {Array}  keys
   * @return {Array}
   */
  public getMany (keys: any[]): Record<string, any> {
    const config: Record<string, any> = {}

    for (let [key, defaultValue] of keys) {
      if (isNumeric(key)) {
        [key, defaultValue] = [defaultValue, null]
      }

      config[key] = Arr.get(this.items, key, defaultValue)
    }

    return config
  }
}
