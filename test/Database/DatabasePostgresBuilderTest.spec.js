const test = require('ava')

const { PostgresBuilder } = require('../../lib/Illuminate/Database/Schema/PostgresBuilder')
const { PostgresGrammar } = require('../../lib/Illuminate/Database/Schema/Grammars/PostgresGrammar')
const { getConnection } = require('./common')
const { mock } = require('../tools/mock')

const getBuilder = (connection) => {
  return new PostgresBuilder(connection)
}

test('testCreateDatabase', async (t) => {
  const { createMock, verifyMock } = mock()

  const grammar = new PostgresGrammar()

  const connection = getConnection()
  const connectionMock = createMock(connection)
  connectionMock.expects('getConfig').once().withArgs('charset').returns('utf8')
  connectionMock.expects('getSchemaGrammar').once().returns(grammar)
  connectionMock.expects('statement').once().withArgs(
    'create database "my_temporary_database" encoding "utf8"'
  ).returns(true)

  const builder = getBuilder(connection)
  builder.createDatabase('my_temporary_database')

  verifyMock()

  t.pass()
})

// test('test_name', async (t) => {
//   const { createMock, verifyMock } = mock()

//   verifyMock()
// })
