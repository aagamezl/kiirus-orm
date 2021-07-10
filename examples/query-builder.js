const { Builder } = require('./../lib/Illuminate/Database/Query')
const { Connection } = require('../lib/Illuminate/Database')
const { Grammar } = require('../lib/Illuminate/Database/Query/Grammars')
const { Processor } = require('../lib/Illuminate/Database/Query/Processors')

const config = {
  driver: 'mysql',
  host: '127.0.0.1',
  database: 'test',
  username: 'root',
  password: 'root'
}

const connection = new Connection(config)

const grammar = new Grammar()
const processor = new Processor()

const query = new Builder(connection, grammar, processor)

try {
  console.log(query.select().from('users').toSql())
  console.log(query.select({ id: () => { } }).from('users'))
} catch (error) {
  console.error(error)
}
