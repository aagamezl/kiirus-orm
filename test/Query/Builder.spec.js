const test = require('ava')

const { Connection } = require('../../lib/Illuminate/Database')
const { Builder } = require('../../lib/Illuminate/Database/Query')
const { Grammar } = require('../../lib/Illuminate/Database/Query/Grammars')
const { Processor } = require('../../lib/Illuminate/Database/Query/Processors')

const config = {
  driver: 'mysql',
  host: '127.0.0.1',
  database: 'test',
  username: 'root',
  password: 'root'
}

const getConnection = () => new Connection(config)

const getBuilder = () => {
  const grammar = new Grammar()
  const processor = new Processor()

  return new Builder(getConnection(), grammar, processor)
}

test('testBasicSelect', t => {
  const builder = getBuilder()
  builder.select('*').from('users')

  t.is(builder.toSql(), 'select * from "users"')
})
