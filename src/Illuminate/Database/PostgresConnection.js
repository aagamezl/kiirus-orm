import { isNil } from '@devnetic/utils'

import { Connection } from './Connection'
import { PostgresBuilder } from './Schema/PostgresBuilder'
import { PostgresDriver } from './../Database/PDO/PostgresDriver'
import { PostgresGrammar as QueryGrammar } from './../Database/Query/Grammars'
import { PostgresGrammar as SchemaGrammar } from './Schema/Grammars'
import { PostgresProcessor } from './../Database/Query/Processors'
import { PostgresStatement } from './../Database/Statements'

export class PostgresConnection extends Connection {
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
   * Get the default schema grammar instance.
   *
   * @return {\Illuminate\Database\Schema\Grammars\PostgresGrammar}
   */
  getDefaultSchemaGrammar () {
    return this.withTablePrefix(new SchemaGrammar())
  }

  /**
   * Get the Doctrine DBAL driver.
   *
   * @return {\Illuminate\Database\PDO\PostgresDriver}
   */
  getDoctrineDriver () {
    return new PostgresDriver()
  }

  /**
   *
   *
   * @param {string} query
   * @return {object}
   * @memberof {PostgresConnection}
   */
  getPrepareStatement (connection, query) {
    return new PostgresStatement(connection, query)
  }

  /**
   * Get a schema builder instance for the connection.
   *
   * @return {\Illuminate\Database\Schema\PostgresBuilder}
   */
  getSchemaBuilder () {
    if (isNil(this.schemaGrammar)) {
      this.useDefaultSchemaGrammar()
    }

    return new PostgresBuilder(this)
  }
}
