import { AbstractSQLServerDriver } from '../../../Doctrine/Driver/AbstractSQLServerDriver'
import { Connection } from './Connection'
import { SqlServerConnection } from './SqlServerConnection'

export class SqlServerDriver extends AbstractSQLServerDriver {
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
    return new SqlServerConnection(
      new Connection(params.pdo)
    )
  }

  /**
   * {@inheritdoc}
   */
  getName () {
    return 'sqlsrv'
  }
}
