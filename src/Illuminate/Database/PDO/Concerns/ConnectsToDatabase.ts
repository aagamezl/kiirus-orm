import { isNil, isObject } from '@devnetic/utils'
import { Connection } from './../Connection'

export class ConnectsToDatabase {
  /**
   * Create a new database connection.
   *
   * @param  {object}  params
   * @param  {string|undefined}  username
   * @param  {string|undefined}  password
   * @param  {object}  driverOptions
   * @return {\Illuminate\Database\PDO\Connection}
   *
   * @throws {\InvalidArgumentException}
   */
  public connect (params: Record<string, any>, username?: string, password?: string, driverOptions: Record<string, unknown> = {}): Connection {
    if (isNil(params.ndo) || !isObject(params.ndo)) {
      throw new Error('InvalidArgumentException: Kiirus requires the "ndo" property to be set and be a Connection Object instance.')
    }

    return new Connection(params.ndo)
  }
}
