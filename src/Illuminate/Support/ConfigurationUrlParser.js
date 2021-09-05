import { URL } from 'url'

import { isNil, isString } from 'lodash'

import { pull } from './helpers'

export class ConfigurationUrlParser {
  constructor () {
    /**
     * The drivers aliases map.
     *
     * @member {object}
     */
    this.driverAliases = {
      mssql: 'sqlsrv',
      mysql2: 'mysql', // RDS
      postgres: 'pgsql',
      postgresql: 'pgsql',
      sqlite3: 'sqlite',
      redis: 'tcp',
      rediss: 'tls'
    }
  }

  /**
   * Parse the database configuration, hydrating options using a database configuration URL if possible.
   *
   * @param  {object|string}  config
   * @return {object}
   */
  parseConfiguration (config) {
    if (isString(config)) {
      config = { url: config }
    }

    const url = pull(config, 'url')

    if (!url) {
      return config
    }

    const rawComponents = this.parseUrl(url)

    const decodedComponents = this.parseStringsToNativeTypes(
      rawComponents.map(decodeURI)
    )

    return {
      ...config,
      ...this.getPrimaryOptions(decodedComponents),
      ...this.getQueryOptions(rawComponents)
    }
  }

  /**
   * Get the database name from the URL.
   *
   * @param  {object}  url
   * @return {string|undefined}
   */
  getDatabase (url) {
    const path = url.path ?? undefined

    return path && path !== '/' ? path.substr(1) : undefined
  }

  /**
   * Get the database driver from the URL.
   *
   * @param  {object}  url
   * @return {string|undefined}
   */
  getDriver (url) {
    const alias = url.scheme ?? undefined

    if (!alias) {
      return
    }

    return this.driverAliases[alias] ?? alias
  }

  /**
   * Get the primary database connection options.
   *
   * @param  {object}  url
   * @return {object}
   */
  getPrimaryOptions (url) {
    return Object.entries({
      driver: this.getDriver(url),
      database: this.getDatabase(url),
      host: url.host ?? undefined,
      port: url.port ?? undefined,
      username: url.user ?? undefined,
      password: url.pass ?? undefined
    }).filter(([key, value]) => {
      return !isNil(value)
    })
  }

  /**
   * Get all of the additional database options from the query string.
   *
   * @param  {object}  url
   * @return {object}
   */
  getQueryOptions (url) {
    const queryString = url.query ?? undefined

    if (!queryString) {
      return {}
    }

    const query = queryString.entries().reduce((query, [key, value]) => {
      query[key] = value

      return query
    }, {})

    return this.parseStringsToNativeTypes(query)
  }

  /**
   * Convert string casted values to their native types.
   *
   * @param  {*}  value
   * @return {*}
   */
  parseStringsToNativeTypes (value) {
    if (Array.isArray(value)) {
      return value.map(this.parseStringsToNativeTypes)
    }

    if (!isString(value)) {
      return value
    }

    try {
      return JSON.parse(value, true)
    } catch (error) {
      return value
    }
  }

  /**
   * Parse the string URL to an array of components.
   *
   * @param  {string}  url
   * @return {object}
   *
   * @throws {\InvalidArgumentException}
   */
  parseUrl (url) {
    url = url.replace(/#^(sqlite3?):\/\/\/#/gm, '1://null/')

    const parsedUrl = new URL(url)

    if (parsedUrl === false) {
      throw new Error('InvalidArgumentException: The database configuration URL is malformed.')
    }

    return parsedUrl
  }
}
