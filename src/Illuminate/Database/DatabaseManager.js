import { isNil } from 'lodash'

import { Str } from './../Support'
import { instanceProxy } from './../Support/Proxies/InstanceProxy'

/**
 * @mixin {\Illuminate\Database\Connection}
 */
export class DatabaseManager {
  /**
   * Create a new database manager instance.
   *
   * @param  {\Illuminate\Contracts\Foundation\Application}  app
   * @param  {\Illuminate\Database\Connectors\ConnectionFactory}  factory
   * @return {void}
   */
  constructor (app, factory) {
    /**
     * The application instance.
     *
     * @member {\Illuminate\Contracts\Foundation\Application}
     */
    this.app = app

    /**
     * The database connection factory instance.
     *
     * @member {\Illuminate\Database\Connectors\ConnectionFactory}
     */
    this.factory = factory

    /**
     * The active connection instances.
     *
     * @member {array}
     */
    this.connections = []

    /**
     * The callback to be executed to reconnect to a database.
     *
     * @member {Function}
     */
    this.reconnector = undefined

    this.reconnector = (connection) => {
      this.reconnect(connection.getNameWithReadWriteType())
    }

    return instanceProxy(this)
  }

  /**
   * Dynamically pass methods to the default connection.
   *
   * @param  {string}  method
   * @param  {Array}  parameters
   * @return {*}
   */
  call (method, ...parameters) {
    return this.connection()[method](...parameters)
  }

  /**
   * Prepare the database connection instance.
   *
   * @param  {\Illuminate\Database\Connection}  connection
   * @param  string  type
   * @return {\Illuminate\Database\Connection}
   */
  configure (connection, type) {
    connection = this.setNdoForType(connection, type).setReadWriteType(type)

    // First we'll set the fetch mode and a few other dependencies of the database
    // connection. This method basically just configures and prepares it to get
    // used by the application. Once we're finished we'll return it back out.
    // if (this.app.bound('events')) {
    //   connection.setEventDispatcher(this.app.events)
    // }

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
   * @param  {string|undefined}  name
   * @return {\Illuminate\Database\Connection}
   */
  connection (name = undefined) {
    const [database, type] = this.parseConnectionName(name)

    name = name ?? database

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
   * @param  {string|undefined}  name
   * @return {void}
   */
  disconnect (name = undefined) {
    name = name ?? this.getDefaultConnection()

    if (this.connections[name]) {
      this.connections[name].disconnect()
    }
  }

  /**
   * Get the default connection name.
   *
   * @return {string}
   */
  getDefaultConnection () {
    return this.app.config.get('database.default')
  }

  /**
   * Make the database connection instance.
   *
   * @param  {string}  name
   * @return {\Illuminate\Database\Connection}
   */
  makeConnection (name) {
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
      return this.extensions[driver](config, name)
    }

    return this.factory.make(config, name)
  }

  /**
   * Parse the connection into an array of the name and read / write type.
   *
   * @param  {string}  name
   * @return {Array}
   */
  parseConnectionName (name) {
    name = name ?? this.getDefaultConnection()

    return Str.endsWith(name, ['::read', '::write'])
      ? name.split('::', 2)
      : [name, undefined]
  }

  /**
   * Reconnect to the given database.
   *
   * @param  {string|undefined}  name
   * @return {\Illuminate\Database\Connection}
   */
  reconnect (name = undefined) {
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
  refreshNdoConnections (name) {
    const [database, type] = this.parseConnectionName(name)

    const fresh = this.configure(
      this.makeConnection(database), type
    )

    return this.connections[name]
      .setNdo(fresh.getRawPdo())
      .setReadNdo(fresh.getRawReadPdo())
  }

  /**
   * Prepare the read / write mode for database connection instance.
   *
   * @param  {\Illuminate\Database\Connection}  connection
   * @param  {string|undefined}  type
   * @return {\Illuminate\Database\Connection}
   */
  setNdoForType (connection, type = undefined) {
    if (type === 'read') {
      connection.setNdo(connection.getReadNdo())
    } else if (type === 'write') {
      connection.setReadPdo(connection.getNdo())
    }

    return connection
  }

  /**
   * Set the reconnect instance on the connection.
   *
   * @param  {Function]}  reconnector
   * @return {this}
   */
  setReconnector (reconnector) {
    this.reconnector = reconnector

    return this
  }
}
