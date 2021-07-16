const test = require('ava')

const { autoVerify, createMock } = require('./../tools/auto-verify')

const { Builder } = require('./../../lib/Illuminate/Database/Query')
const { Connection } = require('./../../lib/Illuminate/Database')
const { Grammar } = require('./../../lib/Illuminate/Database/Query/Grammars')
const { MySqlGrammar } = require('./../../lib/Illuminate/Database/Query/Grammars/MySqlGrammar')
const { MySqlProcessor } = require('./../../lib/Illuminate/Database/Query/Processors/MySqlProcessor')
const { Processor } = require('./../../lib/Illuminate/Database/Query/Processors')
const { PostgresGrammar } = require('./../../lib/Illuminate/Database/Query/Grammars/PostgresGrammar')

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

const getMySqlBuilderWithProcessor = () => {
  const grammar = new MySqlGrammar()
  const processor = new MySqlProcessor()

  return new Builder(getConnection(), grammar, processor)
}

const getPostgresBuilder = () => {
  const grammar = new PostgresGrammar()
  const processor = new MySqlProcessor()

  return new Builder(getConnection(), grammar, processor)
}

test('testBasicSelect', t => {
  const builder = getBuilder()
  builder.select('*').from('users')

  t.is(builder.toSql(), 'select * from "users"')
})

test('testBasicSelectWithGetColumns', (t) => {
  const builder = getBuilder()

  const connectionMock = createMock(builder.getConnection())

  createMock(builder.getProcessor()).expects('processSelect').thrice()

  connectionMock.expects('select').once().returns('select * from "users"')
  connectionMock.expects('select').once().returns('select "foo", "bar" from "users"')
  connectionMock.expects('select').once().returns('select "baz" from "users"')

  builder.from('users').get()
  t.deepEqual(builder.columns, [])

  builder.from('users').get(['foo', 'bar'])
  t.deepEqual(builder.columns, [])

  builder.from('users').get('baz')
  t.deepEqual(builder.columns, [])

  t.is(builder.toSql(), 'select * from "users"')
  t.deepEqual(builder.columns, [])

  autoVerify()
})

test('testBasicMySqlSelect', (t) => {
  let builder = getMySqlBuilderWithProcessor()

  let connectionMock = createMock(builder.getConnection())

  connectionMock.expects('select').once()
    .withArgs('select * from `users`', [])

  builder.select('*').from('users').get()

  builder = getMySqlBuilderWithProcessor()
  connectionMock = createMock(builder.getConnection())

  connectionMock.expects('select').once()
    .withArgs('select * from `users`', [])

  builder.select('*').from('users').get()

  t.is('select * from `users`', builder.toSql())

  autoVerify()
})

test('testBasicTableWrappingProtectsQuotationMarks', (t) => {
  const builder = getBuilder()
  builder.select('*').from('some"table')

  t.is('select * from "some""table"', builder.toSql())
})

test('testAliasWrappingAsWholeConstant', (t) => {
  const builder = getBuilder()

  builder.select('x.y as foo.bar').from('baz')
  t.is('select "x"."y" as "foo.bar" from "baz"', builder.toSql())
})

test('testAliasWrappingWithSpacesInDatabaseName', (t) => {
  const builder = getBuilder()

  builder.select('w x.y.z as foo.bar').from('baz')
  t.is('select "w x"."y"."z" as "foo.bar" from "baz"', builder.toSql())
})

test('testAddingSelects', (t) => {
  const builder = getBuilder()

  builder.select('foo').addSelect('bar').addSelect(['baz', 'boom']).from('users')
  t.is('select "foo", "bar", "baz", "boom" from "users"', builder.toSql())
})

test('testBasicSelectWithPrefix', (t) => {
  const builder = getBuilder()

  builder.getGrammar().setTablePrefix('prefix_')
  builder.select('*').from('users')
  t.is('select * from "prefix_users"', builder.toSql())
})

test('testBasicSelectDistinct', (t) => {
  const builder = getBuilder()

  builder.distinct().select('foo', 'bar').from('users')
  t.is('select distinct "foo", "bar" from "users"', builder.toSql())
})

test('testBasicSelectDistinctOnColumns', (t) => {
  let builder = getBuilder()
  builder.distinct('foo').select('foo', 'bar').from('users')
  t.is('select distinct "foo", "bar" from "users"', builder.toSql())

  builder = getPostgresBuilder()
  builder.distinct('foo').select('foo', 'bar').from('users')
  t.is('select distinct on ("foo") "foo", "bar" from "users"', builder.toSql())
})

test('testBasicAlias', (t) => {
  const builder = getBuilder()

  builder.select('foo as bar').from('users')
  t.is('select "foo" as "bar" from "users"', builder.toSql())
})

test('testAliasWithPrefix', (t) => {
  const builder = getBuilder()

  builder.getGrammar().setTablePrefix('prefix_')
  builder.select('*').from('users as people')
  t.is('select * from "prefix_users" as "prefix_people"', builder.toSql())
})

test('testJoinAliasesWithPrefix', (t) => {
  const builder = getBuilder()

  builder.getGrammar().setTablePrefix('prefix_')
  builder.select('*').from('services').join('translations AS t', 't.item_id', '=', 'services.id')
  t.is('select * from "prefix_services" inner join "prefix_translations" as "prefix_t" on "prefix_t"."item_id" = "prefix_services"."id"', builder.toSql())
})
