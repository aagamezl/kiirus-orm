import { DetectsLostConnections } from '../DetectsLostConnections'
import { Statement } from '../Statements/Statement'
import { objectDiffKey } from './../../Support'
import { use } from '../../Support/Traits/use'

export interface Connector extends DetectsLostConnections { }

export class Connector {
  /**
   * The default PDO connection options.
   *
   * @var Record<string, unknown>
   */
  protected options: Record<string, unknown> = {}

  public constructor () {
    use(this.constructor, [DetectsLostConnections])
  }

  /**
   * Establish a database connection.
   *
   * @param  {object}  config
   * @return {Statement}
   */
  public async connect (config: Record<string, string>): Promise<Statement> {
    throw new Error('RuntimeException: Implement connect method on concrete class.')
  }

  /**
   * Create a new PDO connection.
   *
   * @param  {string}  dsn
   * @param  {object}  config
   * @param  {Record<string, string>}  options
   * @return {Statement}
   *
   * @throws \Exception
   */
  public createConnection (dsn: string, config: Record<string, string>, options: Record<string, string>): Statement {
    const [username, password] = [
      config.username ?? undefined, config.password ?? undefined
    ]

    try {
      return this.createNdoConnection(
        dsn, username, password, options
      )
    } catch (error: any) {
      return this.tryAgainIfCausedByLostConnection(
        error, dsn, username, password, options
      )
    }
  }

  /**
 * Create a new PDO connection instance.
 *
 * @param  {string}  dsn
 * @param  {string}  username
 * @param  {string}  password
 * @param  {object}  options
 * @return {Record<string, unknown>}
 */
  protected createNdoConnection (dsn: string, username: string, password: string, options: Record<string, unknown>): Statement {
    throw new Error('RuntimeException: Implement createNdoConnection method on concrete class.')
  }

  /**
   * Get the PDO options based on the configuration.
   *
   * @param  {object}  config
   * @return {array}
   */
  public getOptions (config: Record<string, any>): Record<string, string> {
    const options = config.options ?? {}

    return { ...objectDiffKey(this.options, options), ...options }
  }

  /**
   * Handle an exception that occurred during connect execution.
   *
   * @param  {Error}   error
   * @param  {string}  dsn
   * @param  {string}  username
   * @param  {string}  password
   * @param  {Record<string, unknown>}  options
   * @return {Statement}
   *
   * @throws \Exception
   */
  protected tryAgainIfCausedByLostConnection (error: Error, dsn: string, username: string, password: string, options: Record<string, unknown>): Statement {
    if (this.causedByLostConnection(error)) {
      return this.createNdoConnection(dsn, username, password, options)
    }

    throw error
  }
}
