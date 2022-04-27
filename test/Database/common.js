import { Builder } from '../../src/Illuminate/Database/Query'
import { Connection } from '../../src/Illuminate/Database'
import { Grammar } from '../../src/Illuminate/Database/Query/Grammars'
import { MySqlGrammar } from '../../src/Illuminate/Database/Query/Grammars/MySqlGrammar'
import { MySqlProcessor } from '../../src/Illuminate/Database/Query/Processors/MySqlProcessor'
import { PostgresGrammar } from '../../src/Illuminate/Database/Query/Grammars/PostgresGrammar'
import { Processor } from '../../src/Illuminate/Database/Query/Processors'
import { SQLiteGrammar } from '../../src/Illuminate/Database/Query/Grammars/SQLiteGrammar'
import { SqlServerGrammar } from '../../src/Illuminate/Database/Query/Grammars/SqlServerGrammar'

export const config = {
  driver: 'mysql',
  host: '127.0.0.1',
  database: 'test',
  username: 'root',
  password: 'root'
}

/**
 * Returns a Connection instance
 *
 * @returns Connection
 */
export const getConnection = () => new Connection(config)

/**
 * Return a Builder instance
 *
 * @return Builder
 */
export const getBuilder = () => {
  const grammar = new Grammar()
  const processor = new Processor()

  return new Builder(getConnection(), grammar, processor)
}

export const getMySqlBuilderWithProcessor = () => {
  const grammar = new MySqlGrammar()
  const processor = new MySqlProcessor()

  return new Builder(getConnection(), grammar, processor)
}

export const getMySqlBuilder = () => {
  const grammar = new MySqlGrammar()
  const processor = new Processor()

  return new Builder(getConnection(), grammar, processor)
}

export const getPostgresBuilder = () => {
  const grammar = new PostgresGrammar()
  const processor = new Processor()

  return new Builder(getConnection(), grammar, processor)
}

export const getSQLiteBuilder = () => {
  const grammar = new SQLiteGrammar()
  const processor = new Processor()

  return new Builder(getConnection(), grammar, processor)
}

export const getSqlServerBuilder = () => {
  const grammar = new SqlServerGrammar()
  const processor = new Processor()

  return new Builder(getConnection(), grammar, processor)
}

// module.exports = {
//   config,
//   getBuilder,
//   getConnection,
//   getMySqlBuilder,
//   getMySqlBuilderWithProcessor,
//   getPostgresBuilder,
//   getSQLiteBuilder,
//   getSqlServerBuilder
// }
