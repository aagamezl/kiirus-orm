import { isNil, isString } from '@devnetic/utils'

import { pull } from './helpers'

interface ParsedUrl {
  hash: string
  host: string
  hostname: string
  href: string
  origin: string
  password: string
  pathname: string
  port: string
  protocol: string
  search: string
  searchParams: URLSearchParams
  username: string
}

export class ConfigurationUrlParser {
  /**
   * The drivers aliases map.
   *
   * @member {object}
   */
  protected static driverAliases: Record<string, string> = {
    mssql: 'sqlsrv',
    mysql2: 'mysql', // RDS
    postgres: 'pgsql',
    postgresql: 'pgsql',
    sqlite3: 'sqlite',
    redis: 'tcp',
    rediss: 'tls'
  }

  /**
   * Parse the database configuration, hydrating options using a database configuration URL if possible.
   *
   * @param  {object|string}  config
   * @return {object}
   */
  public parseConfiguration (config: Record<string, any> | string): Record<string, any> {
    if (isString(config)) {
      config = { url: config }
    }

    const url = pull(config as any, 'url') as string

    if (isNil(url)) {
      return config as Record<string, unknown>
    }

    const rawComponents = this.parseUrl(url)

    const decodedComponents = this.parseStringsToNativeTypes(
      Object.values(rawComponents).reduce((components, value) => {
        components[value] = decodeURI(value)

        return components
      }, {})
    )

    return {
      ...config as object,
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
  protected getDatabase (url: ParsedUrl): string | undefined {
    const path = url.pathname ?? undefined

    return path !== '/' ? path.substring(1) : undefined
  }

  /**
   * Get the database driver from the URL.
   *
   * @param  {object}  url
   * @return {string|undefined}
   */
  protected getDriver (url: ParsedUrl): string | undefined {
    const alias = url.protocol ?? undefined

    if (isNil(alias)) {
      return
    }

    return ConfigurationUrlParser.driverAliases[alias] ?? alias
  }

  /**
   * Get the primary database connection options.
   *
   * @param  {URL}  url
   * @return {object}
   */
  protected getPrimaryOptions (url: ParsedUrl): object {
    return Object.entries({
      driver: this.getDriver(url),
      database: this.getDatabase(url),
      host: url.host ?? undefined,
      port: url.port ?? undefined,
      username: url.username ?? undefined,
      password: url.password ?? undefined
    }).filter(([, value]) => {
      return !isNil(value)
    })
  }

  /**
   * Get all of the additional database options from the query string.
   *
   * @param  {object}  url
   * @return {object}
   */
  protected getQueryOptions (url: ParsedUrl): object {
    const queryString = url.searchParams ?? undefined

    if (isNil(queryString)) {
      return {}
    }

    const query = Object.fromEntries(queryString.entries())

    return this.parseStringsToNativeTypes(query)
  }

  /**
   * Convert string casted values to their native types.
   *
   * @param  {any}  value
   * @return {object}
   */
  protected parseStringsToNativeTypes (value: any): any {
    // if (Array.isArray(value)) {
    //   return value.map(this.parseStringsToNativeTypes)
    // }

    if (!isString(value)) {
      return value
    }

    try {
      return JSON.parse(value)
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
  protected parseUrl (url: string): ParsedUrl {
    url = url.replace(/#^(sqlite3?):\/\/\/#/gm, '1://null/')

    const properties = [
      'hash',
      'host',
      'hostname',
      'href',
      'origin',
      'password',
      'pathname',
      'port',
      'protocol',
      'search',
      'searchParams',
      'username'
    ]

    try {
      const parsedUrl: Record<string, any> = new URL(url)

      return properties.reduce((components: Record<string, any>, property) => {
        components[property] = parsedUrl[property]

        return components
      }, {}) as ParsedUrl

      // return new URL(url)
    } catch (error) {
      throw new Error('InvalidArgumentException: The database configuration URL is malformed.')
    }
  }
}
