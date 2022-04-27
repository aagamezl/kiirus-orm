import { isNil, isObject } from '@devnetic/utils'
import { Connection } from './../Connection'

export const ConnectsToDatabase = {
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
  connect (params, username = undefined, password = undefined, driverOptions = {}) {
    if (isNil(params.pdo) || !isObject(params.pdo)) {
      throw new Error('InvalidArgumentException: Kiirus requires the "pdo" property to be set and be a Connection Object instance.')
    }

    return new Connection(params.pdo)
  }
}
