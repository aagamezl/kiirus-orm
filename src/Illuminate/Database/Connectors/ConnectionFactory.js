// import { MySqlConnection} from './MySqlConnection'
// import { PostgresConnection} from './PostgresConnection'

import { MySqlConnection } from './../MySqlConnection'
import { PostgresConnection } from './../PostgresConnection'
import { SQLiteConnection } from './../SQLiteConnection'
import { SqlServerConnection } from './../SqlServerConnection'

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
  static createConnection (driver, database, prefix = '', config = {}) {
    // const resolver = Connection.getResolver(driver)

    // if (resolver) {
    //   return resolver(connection, database, prefix, config)
    // }

    switch (driver) {
      case 'mysql':
        return new MySqlConnection(/* connection,  */database, prefix, config)
      case 'pgsql':
        return new PostgresConnection(/* connection,  */database, prefix, config)
      case 'sqlite':
        return new SQLiteConnection(/* connection,  */database, prefix, config)
      case 'sqlsrv':
        return new SqlServerConnection(/* connection,  */database, prefix, config)
    }

    throw new Error(`InvalidArgumentException: Unsupported driver [${driver}].`)
  }
}
