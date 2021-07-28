import { Connection } from './Connection'
import { PostgresGrammar as QueryGrammar } from './../Database/Query/Grammars'
import { PostgresProcessor } from './../Database/Query/Processors'
import { PostgresStatement } from './../Database/Statements'

export class PostgresConnection extends Connection {
  /**
   * Get the current PDO connection.
   *
   * @return object
   */
  // getConnection () {
  //   const pool = new Pool({
  //     user: this.config.username,
  //     host: this.config.host,
  //     database: this.config.database,
  //     password: this.config.database,
  //     port: this.config.port || 5432
  //   })

  //   return pool
  // }

  /**
   * Get the default query grammar instance.
   *
   * @return {\Illuminate\Database\Query\Grammars\MySqlGrammar}
   */
  getDefaultQueryGrammar () {
    return this.withTablePrefix(new QueryGrammar())
  }

  /**
   * Get the default post processor instance.
   *
   * @return {\Illuminate\Database\Query\Processors\PostgresProcessor}
   */
  getDefaultPostProcessor () {
    return new PostgresProcessor()
  }

  /**
   *
   *
   * @param {string} query
   * @return {object}
   * @memberof PostgresConnection
   */
  getPrepareStatement (connection, query) {
    return new PostgresStatement(connection, query)
  }
}
