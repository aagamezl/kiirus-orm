import fs from 'fs'

import test from 'ava'

import { SQLiteBuilder } from './../../src/Illuminate/Database/Schema/SQLiteBuilder'
import { SQLiteGrammar } from './../../src/Illuminate/Database/Schema/Grammars/SQLiteGrammar'
import { getConnection } from './common'
import { mock } from './../tools/mock'

const getBuilder = (connection) => {
  return new SQLiteBuilder(connection)
}

test('testCreateDatabase', t => {
  const { createMock, verifyMock } = mock()

  const connection = getConnection()

  const fsMock = createMock(fs)
  fsMock.expects('writeFileSync').once()
    .withArgs('my_temporary_database_a', '', 'utf8')

  const connectionMock = createMock(connection)
  connectionMock.expects('getSchemaGrammar').once()

  const builder = getBuilder(connection)
  t.true(builder.createDatabase('my_temporary_database_a'))

  fsMock.expects('writeFileSync').once()
    .withArgs('my_temporary_database_b', '', 'utf8')
    .throws(new Error('Error'))

  t.false(builder.createDatabase('my_temporary_database_b'))

  verifyMock()

  t.pass()
})

test('testDropDatabaseIfExists', t => {
  const { createMock, verifyMock } = mock()

  const connection = getConnection()

  const fsMock = createMock(fs)
  fsMock.expects('unlinkSync').once()
    .withArgs('my_temporary_database_b')

  const connectionMock = createMock(connection)
  connectionMock.expects('getSchemaGrammar').once()

  const builder = getBuilder(connection)
  t.true(builder.dropDatabaseIfExists('my_temporary_database_b'))

  fsMock.expects('unlinkSync').once()
    .withArgs('my_temporary_database_c')
    .throws(new Error('Database does not exist'))

  t.false(builder.dropDatabaseIfExists('my_temporary_database_c'))

  verifyMock()

  t.pass()
})

test('dropAllTables', t => {
  const { createMock, verifyMock } = mock()

  const schemaGrammar = new SQLiteGrammar()
  const connection = getConnection()

  const connectionMock = createMock(connection)
  connectionMock.expects('getSchemaGrammar').once()
    .returns(schemaGrammar)

  connectionMock.expects('getDatabaseName').once()
    .returns(':memory:')

  connectionMock.expects('select').withArgs(schemaGrammar.compileEnableWriteableSchema()).once()
  connectionMock.expects('select').withArgs(schemaGrammar.compileDropAllTables()).once()
  connectionMock.expects('select').withArgs(schemaGrammar.compileDisableWriteableSchema()).once()
  connectionMock.expects('select').withArgs(schemaGrammar.compileRebuild()).once()

  const builder = getBuilder(connection)
  builder.dropAllTables()

  verifyMock()

  t.pass()
})
