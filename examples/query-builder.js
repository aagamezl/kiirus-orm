const { Builder } = require('./../lib/Illuminate/Database/Query')
const { Connection } = require('../lib/Illuminate/Database')
const { Grammar } = require('../lib/Illuminate/Database/Query/Grammars')
const { Processor } = require('../lib/Illuminate/Database/Query/Processors')
// const { HigherOrderTapProxy } = require('../lib/Illuminate/Support/HigherOrderTapProxy')

const config = {
  driver: 'postgres',
  host: '127.0.0.1',
  database: 'test',
  username: 'postgres',
  password: 'postgres'
}

const connection = new Connection(config)

const grammar = new Grammar()
const processor = new Processor()

const query = new Builder(connection, grammar, processor)

try {
  console.log(query.select().from('users').toSql())
} catch (error) {
  console.error(error)
}
