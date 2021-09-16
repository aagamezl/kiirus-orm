import { CapsuleManagerTrait } from './../../Support/Traits/CapsuleManagerTrait'
import { ConnectionFactory } from './../Connectors'
import { Container } from './../../Container/Container'
import { DatabaseManager } from './../DatabaseManager'
import { use } from './../../Support/Traits/Trait'

export class Manager {
  /**
   * Create a new database capsule manager.
   *
   * @param  {\Illuminate\Container\Container|undefined}  container
   * @return {void}
   */
  constructor (container = null) {
    use(this, CapsuleManagerTrait)

    /**
     * The database manager instance.
     *
     * @member {\Illuminate\Database\DatabaseManager}
     */
    this.manager = undefined

    this.setupContainer(container ?? new Container())

    // Once we have the container setup, we will setup the default configuration
    // options in the container "config" binding. This will make the database
    // manager work correctly out of the box without extreme configuration.
    this.setupDefaultConfiguration()

    this.setupManager()
  }

  /**
   * Register a connection with the manager.
   *
   * @param  {Array}  config
   * @param  {string}  [name='default']
   * @return {void}
   */
  addConnection (config, name = 'default') {
    const connections = this.container.config['database.connections']

    connections[name] = config

    this.container.config['database.connections'] = connections
  }

  /**
   * Get a connection instance from the global manager.
   *
   * @param  {string|undefined}  connection
   * @return {\Illuminate\Database\Connection}
   */
  connection (connection = undefined) {
    return this.instance.getConnection(connection)
  }

  /**
   * Get a registered connection instance.
   *
   * @param  {string|null}  name
   * @return {\Illuminate\Database\Connection}
   */
  getConnection (name = undefined) {
    return this.manager.connection(name)
  }

  /**
   * Get the database manager instance.
   *
   * @return {\Illuminate\Database\DatabaseManager}
   */
  getDatabaseManager () {
    return this.manager
  }

  /**
   * Setup the default database configuration options.
   *
   * @return {void}
   */
  setupDefaultConfiguration () {
    this.container.config['database.fetch'] = 'FETCH_OBJ'

    this.container.config['database.default'] = 'default'
  }

  /**
   * Build the database manager instance.
   *
   * @return {void}
   */
  setupManager () {
    const factory = new ConnectionFactory(this.container)

    this.manager = new DatabaseManager(this.container, factory)
  }
}
