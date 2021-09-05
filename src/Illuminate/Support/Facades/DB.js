import fs from 'fs'
import { join } from 'path'

import { Builder as QueryBuilder } from './../../Database/Query'
import { ConnectionFactory } from './../../Database/Connectors/ConnectionFactory'
import { Facade } from './Facade'
import { StaticProxy } from './StaticProxy'

// export class DB extends Facade {
export const DB = StaticProxy(class DB extends Facade {
  constructor () {
    super()

    this.configFile = 'config.json'

    try {
      const path = join(process.cwd(), this.configFile)

      this.config = JSON.parse(fs.readFileSync(path, { encoding: 'utf8' }))

      this.setConnection()
    } catch (error) {
      throw new Error(`Could not load ${this.configFile}`)
    }
  }

  /**
   * Get the config file name
   *
   * @return {string}
   * @memberof DB
   */
  getConfigFileName () {
    return this.configFile
  }

  /**
   * Get the registered name of the component.
   *
   * @return string
   */
  static getFacadeAccessor () {
    return 'db'
  }

  query () {
    return new QueryBuilder(
      this.connection,
      this.connection.getQueryGrammar(),
      this.connection.getPostProcessor()
    )
  }

  /**
   * Set the config file name
   *
   * @param {string} filename
   * @return void
   * @memberof DB
   */
  setConfigFileName (filename) {
    this.configFile = filename
  }

  setConnection () {
    // const { driver, database, prefix } = this.config

    const connectionFactory = new ConnectionFactory()

    // this.connection = ConnectionFactory.createConnection(driver, database, prefix, this.config)
    this.connection = connectionFactory.createSingleConnection(this.config)
  }
})
