import { objectDiffKey } from './../../Support'

export class Connector {
  constructor () {
    this.options = {}
  }

  /**
   * Create a new PDO connection.
   *
   * @param  {string}  dsn
   * @param  {object}  config
   * @param  {Array}  options
   * @return \PDO
   *
   * @throws \Exception
   */
  createConnection (dsn, config, options) {
    const [username, password] = [
      config.username ?? undefined, config.password ?? undefined
    ]

    try {
      return this.createNdoConnection(
        dsn, username, password, options
      )
    } catch (error) {
      return this.tryAgainIfCausedByLostConnection(
        error, dsn, username, password, options
      )
    }
  }

  /**
   * Get the PDO options based on the configuration.
   *
   * @param  {object}  config
   * @return {array}
   */
  getOptions (config) {
    const options = config.options ?? {}

    return { ...objectDiffKey(this.options, options), ...options }
  }
}
