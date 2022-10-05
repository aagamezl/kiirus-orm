import { getValue, isNil/* , isTruthy */ } from '@devnetic/utils'

import { Application } from '../Foundation/Application'
import { ConfigurationUrlParser } from './../Support/ConfigurationUrlParser'
import { Connection } from './Connection'
import { ConnectionFactory } from './Connectors/ConnectionFactory'
import { Macroable } from '../Macroable/Traits/Macroable'
import { Str } from '../Support/Str'
import { instanceProxy } from '../Support/Proxies/InstanceProxy'
import { use } from '../Support/Traits/use'
import { isTruthy } from '../Support'

export interface DatabaseManager extends Macroable {}

/**
 * @mixin {\Illuminate\Database\Connection}
 */
export class DatabaseManager {
  /**
   * The application instance.
   *
   * @var \Illuminate\Contracts\Foundation\Application
   */
  protected app: Application

  /**
   * The active connection instances.
   *
   * @member {Record<string, unknown>}
   */
  protected connections: Record<string, Connection> = {}

  /**
   * The custom connection resolvers.
   *
   * @var array
   */
  protected extensions: Record<string, Function> = {}

  /**
   * The database connection factory instance.
   *
   * @var \Illuminate\Database\Connectors\ConnectionFactory
   */
  protected factory: ConnectionFactory

  /**
   * The callback to be executed to reconnect to a database.
   *
   * @var callable
   */
  protected reconnector: Function

  /**
   * Create a new database manager instance.
   *
   * @param  {\Illuminate\Contracts\Foundation\Application}  app
   * @param  {\Illuminate\Database\Connectors\ConnectionFactory}  factory
   * @return {void}
   */
  public constructor (app: Application, factory: ConnectionFactory) {
    // use(this.constructor, [{ trait: Macroable, as: { __call: 'macroCall' } }])
    use(this.constructor, [[Macroable, { __call: 'macroCall' }]])

    this.app = app
    this.factory = factory

    this.reconnector = (connection: Connection) => {
      this.reconnect(connection.getName())
    }

    return instanceProxy(this) as unknown as this
  }

  /**
   * Dynamically pass methods to the default connection.
   *
   * @param  {string}  method
   * @param  {Array}  parameters
   * @return {*}
   */
  public __call (method: string, ...parameters: any[]): any {
    return (this.connection() as any)[method](...parameters)
  }

  /**
   * Get the configuration for a connection.
   *
   * @param  {string}  name
   * @return {Array}
   *
   * @throws {\InvalidArgumentException}
   */
  protected configuration (name: string): Record<string, string> {
    name = name ?? this.getDefaultConnection()

    // To get the database connection configuration, we will just pull each of the
    // connection configurations and get the configurations for the given name.
    // If the configuration doesn't exist, we'll throw an exception and bail.
    const connections = this.app.config.get('database.connections')
    const config: any = getValue(connections, name)

    if (isNil(config)) {
      throw new Error(`InvalidArgumentException: Database connection [${name}] not configured.`)
    }

    return (new ConfigurationUrlParser()).parseConfiguration(config)
  }

  /**
   * Prepare the database connection instance.
   *
   * @param  {\Illuminate\Database\Connection}  connection
   * @param  {string}  type
   * @return {\Illuminate\Database\Connection}
   */
  protected configure (connection: Connection, type: string): Connection {
    connection = this.setNdo(connection)

    // First we'll set the fetch mode and a few other dependencies of the database
    // connection. This method basically just configures and prepares it to get
    // used by the application. Once we're finished we'll return it back out.
    if (this.app.bound('events')) {
      connection.setEventDispatcher(this.app.events)
    }

    // if (this.app.bound('db.transactions')) {
    //   connection.setTransactionManager(this.app['db.transactions'])
    // }

    // Here we'll set a reconnector callback. This reconnector can be any callable
    // so we will set a Closure to reconnect from this manager with the name of
    // the connection, which will allow us to reconnect from the connections.
    connection.setReconnector(this.reconnector)

    return connection
  }

  /**
   * Get a database connection instance.
   *
   * @param  {string}  [name]
   * @return {\Illuminate\Database\Connection}
   */
  public connection (name?: string): Connection {
    const { database, type } = this.parseConnectionName(name)

    name = (name ?? database) as string

    // If we haven't created this connection, we'll create it based on the config
    // provided in the application. Once we've created the connections we will
    // set the "fetch mode" for PDO which determines the query return types.
    if (this.connections[name] === undefined) {
      this.connections[name] = this.configure(
        this.makeConnection(database), type
      )
    }

    return this.connections[name]
  }

  /**
   * Disconnect from the given database.
   *
   * @param  {string}  [name]
   * @return {void}
   */
  public disconnect (name?: string): void {
    name = name ?? this.getDefaultConnection()

    if (isTruthy(this.connections[name])) {
      this.connections[name].disconnect()
    }
  }

  /**
   * Get the default connection name.
   *
   * @return {string}
   */
  public getDefaultConnection (): string {
    return this.app.config.get('database.default')
  }

  /**
   * Make the database connection instance.
   *
   * @param  {string}  name
   * @return {\Illuminate\Database\Connection}
   */
  protected makeConnection (name: string): Connection {
    const config = this.configuration(name)

    // First we will check by the connection name to see if an extension has been
    // registered specifically for that connection. If it has we will call the
    // Closure and pass it the config allowing it to resolve the connection.
    if (this.extensions[name] !== undefined) {
      return this.extensions[name](config, name)
    }

    // Next we will check to see if an extension has been registered for a driver
    // and will call the Closure if so, which allows us to have a more generic
    // resolver for the drivers themselves which applies to all connections.
    const driver = config.driver

    if (this.extensions[driver] !== undefined) {
      return this.extensions.driver(config, name)
    }

    return this.factory.make(config, name)
  }

  /**
   * Parse the connection into an array of the name and read / write type.
   *
   * @param  {string}  name
   * @return {Array}
   */
  protected parseConnectionName (name?: string): any { // TODO: define a better type
    name = name ?? this.getDefaultConnection()

    const [database, type] = Str.endsWith(name, ['::read', '::write'])
      ? name.split('::', 2)
      : [name, undefined]

    return { database, type }
  }

  /**
   * Reconnect to the given database.
   *
   * @param  {string|undefined}  name
   * @return {\Illuminate\Database\Connection}
   */
  public reconnect (name?: string): Connection {
    name = name ?? this.getDefaultConnection()

    this.disconnect(name)

    if (isNil(this.connections[name])) {
      return this.connection(name)
    }

    return this.refreshNdoConnections(name)
  }

  /**
   * Refresh the PDO connections on a given connection.
   *
   * @param  {string}  name
   * @return {\Illuminate\Database\Connection}
   */
  protected refreshNdoConnections (name: string): Connection {
    const [database, type] = this.parseConnectionName(name)

    const fresh = this.configure(
      this.makeConnection(database), type
    )

    return this.connections[name]
      .setNdo(fresh.getRawPdo())
  }

  /**
 * Prepare the read / write mode for database connection instance.
 *
 * @param  {\Illuminate\Database\Connection}  connection
 * @return {\Illuminate\Database\Connection}
 */
  protected setNdo (connection: Connection): Connection {
    connection.setNdo(connection.getNdo())

    return connection
  }
}
