import { isNil, isTruthy, setValue } from '@devnetic/utils'

import { Arr } from '../../Collections/Arr'
import { Connection } from '../Connection'
import { Connector } from './Connector'
import { MySqlConnection } from './../MySqlConnection'
import { MySqlConnector } from './MySqlConnector'
import { PostgresConnection } from './../PostgresConnection'
import { PostgresConnector } from './PostgresConnector'
import { SQLiteConnection } from './../SQLiteConnection'
import { SQLiteConnector } from './SQLiteConnector'
import { SqlServerConnection } from './../SqlServerConnection'
import { SqlServerConnector } from './SqlServerConnector'

export class ConnectionFactory {
  /**
   * Create a new connection instance.
   *
   * @param  {string}  driver
   * @param  {object|Function}  connection
   * @param  {string}  database
   * @param  {string}  [prefix='']
   * @param  {object}  [config={}]
   * @return {\Illuminate\Database\Connection}
   *
   * @throws \InvalidArgumentException
   */
  protected createConnection (driver: string, connection: object | Function, database: string, prefix: string = '', config: Record<string, unknown> = {}): Connection {
    const resolver = Connection.getResolver(driver)

    if (isTruthy(resolver)) {
      return resolver(connection, database, prefix, config)
    }

    switch (driver) {
      case 'mysql':
        return new MySqlConnection(connection, database, prefix, config)
      case 'pgsql':
        return new PostgresConnection(connection, database, prefix, config)
      case 'sqlite':
        return new SQLiteConnection(connection, database, prefix, config)
      case 'sqlsrv':
        return new SqlServerConnection(connection, database, prefix, config)
    }

    throw new Error(`InvalidArgumentException: Unsupported driver [${driver}].`)
  }

  /**
   * Create a connector instance based on the configuration.
   *
   * @param  {object}  config
   * @return {\Illuminate\Database\Connectors\Connector}
   *
   * @throws \InvalidArgumentException
   */
  public createConnector (config: Record<string, string>): Connector {
    if (isNil(config.driver)) {
      throw new Error('InvalidArgumentException: A driver must be specified.')
    }

    switch (config.driver) {
      case 'mysql':
        return new MySqlConnector()
      case 'pgsql':
        return new PostgresConnector()
      case 'sqlite':
        return new SQLiteConnector()
      case 'sqlsrv':
        return new SqlServerConnector()
    }

    throw new Error(`InvalidArgumentException: Unsupported driver [${config.driver}].`)
  }

  /**
   * Create a new Closure that resolves to a NDO instance.
   *
   * @param  {object}  config
   * @return {Function}
   */
  protected createResolver (config: Record<string, string>): Function {
    return config.host !== undefined
      ? this.createResolverWithHosts(config)
      : this.createResolverWithoutHosts(config)
  }

  /**
   * Create a new Closure that resolves to a PDO instance with a specific host or an array of hosts.
   *
   * @param  {Record<string, string>}  config
   * @return {Function}
   *
   * @throws NDOException
   */
  protected createResolverWithHosts (config: Record<string, string>): Function {
    return async () => {
      const hosts = this.parseHosts(config)

      for (const host of Arr.shuffle(hosts)) {
        config.host = host

        try {
          return await this.createConnector(config).connect(config)
        } catch (error) {
          continue
        }
      }

      throw new Error('NDOException: Unable to create resolver with hosts.')
    }
  }

  /**
   * Create a new Closure that resolves to a PDO instance where there is no configured host.
   *
   * @param  {object}  config
   * @return {Function}
   */
  protected createResolverWithoutHosts (config: Record<string, string>): Function {
    return async () => {
      return await this.createConnector(config).connect(config)
    }
  }

  /**
   * Create a single database connection instance.
   *
   * @param  {object}  config
   * @return {\Illuminate\Database\Connection}
   */
  protected createSingleConnection (config: Record<string, string>): Connection {
    const resolver = this.createResolver(config)

    return this.createConnection(
      config.driver, resolver, config.database, config.prefix, config
    )
  }

  /**
   * Establish a PDO connection based on the configuration.
   *
   * @param  {object}  config
   * @param  {string|undefined}  [name=undefined]
   * @return {\Illuminate\Database\Connection}
   */
  public make (config: Record<string, string>, name: string = ''): Connection {
    config = this.parseConfig(config, name)

    return this.createSingleConnection(config)
  }

  /**
   * Parse and prepare the database configuration.
   *
   * @param  {Record<string, string>}  config
   * @param  {string}  name
   * @return {Record<string, string>}
   */
  protected parseConfig (config: Record<string, string>, name: string): Record<string, string> {
    return setValue(setValue(config, 'prefix', ''), 'name', name) as Record<string, string>
  }

  /**
   * Parse the hosts configuration item into an array.
   *
   * @param  {object}  config
   * @return {array}
   *
   * @throws \InvalidArgumentException
   */
  protected parseHosts (config: Record<string, string>): string[] {
    const hosts = Arr.wrap(config.host)

    if (hosts.length === 0) {
      throw new Error('InvalidArgumentException: Database hosts array is empty.')
    }

    return hosts
  }
}
