const { Builder } = require('../../lib/Illuminate/Database/Query')
const { Connection } = require('../../lib/Illuminate/Database')
const { Grammar } = require('../../lib/Illuminate/Database/Query/Grammars')
const { MySqlGrammar } = require('../../lib/Illuminate/Database/Query/Grammars/MySqlGrammar')
const { MySqlProcessor } = require('../../lib/Illuminate/Database/Query/Processors/MySqlProcessor')
const { PostgresGrammar } = require('../../lib/Illuminate/Database/Query/Grammars/PostgresGrammar')
const { Processor } = require('../../lib/Illuminate/Database/Query/Processors')
const { SQLiteGrammar } = require('../../lib/Illuminate/Database/Query/Grammars/SQLiteGrammar')
const { SqlServerGrammar } = require('../../lib/Illuminate/Database/Query/Grammars/SqlServerGrammar')

const config = {
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
const getConnection = () => new Connection(config)

/**
 * Return a Builder instance
 *
 * @return Builder
 */
const getBuilder = () => {
  const grammar = new Grammar()
  const processor = new Processor()

  return new Builder(getConnection(), grammar, processor)
}

const getMySqlBuilderWithProcessor = () => {
  const grammar = new MySqlGrammar()
  const processor = new MySqlProcessor()

  return new Builder(getConnection(), grammar, processor)
}

const getMySqlBuilder = () => {
  const grammar = new MySqlGrammar()
  const processor = new Processor()

  return new Builder(getConnection(), grammar, processor)
}

const getPostgresBuilder = () => {
  const grammar = new PostgresGrammar()
  const processor = new Processor()

  return new Builder(getConnection(), grammar, processor)
}

const getSQLiteBuilder = () => {
  const grammar = new SQLiteGrammar()
  const processor = new Processor()

  return new Builder(getConnection(), grammar, processor)
}

const getSqlServerBuilder = () => {
  const grammar = new SqlServerGrammar()
  const processor = new Processor()

  return new Builder(getConnection(), grammar, processor)
}

module.exports = {
  config,
  getBuilder,
  getConnection,
  getMySqlBuilder,
  getMySqlBuilderWithProcessor,
  getPostgresBuilder,
  getSQLiteBuilder,
  getSqlServerBuilder
}
