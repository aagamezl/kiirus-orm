import test from 'ava'

import { MySqlBuilder } from './../../src/Illuminate/Database/Schema/MySqlBuilder'
import { MySqlGrammar } from './../../src/Illuminate/Database/Schema/Grammars/MySqlGrammar'
import { getConnection } from './common'
import { mock } from './../tools/mock'

test('testCreateDatabase', async (t) => {
  const { createMock, verifyMock } = mock()

  const grammar = new MySqlGrammar()
  const connection = getConnection()

  const connectionMock = createMock(connection)
  connectionMock.expects('getConfig').once().withArgs('charset').returns('utf8mb4')
  connectionMock.expects('getConfig').once().withArgs('collation').returns('utf8mb4_unicode_ci')
  connectionMock.expects('getSchemaGrammar').once().returns(grammar)
  connectionMock.expects('statement').once().withArgs(
    'create database `my_temporary_database` default character set `utf8mb4` default collate `utf8mb4_unicode_ci`'
  ).resolves(true)

  const builder = new MySqlBuilder(connection)
  await builder.createDatabase('my_temporary_database')

  verifyMock()

  t.pass()
})

test('testDropDatabaseIfExists', async (t) => {
  const { createMock, verifyMock } = mock()

  const grammar = new MySqlGrammar()
  const connection = getConnection()
  const connectionMock = createMock(connection)

  connectionMock.expects('getSchemaGrammar').once().returns(grammar)
  connectionMock.expects('statement').once().withArgs(
    'drop database if exists `my_database_a`'
  ).resolves(true)

  const builder = new MySqlBuilder(connection)
  builder.dropDatabaseIfExists('my_database_a')

  verifyMock()

  t.pass()
})
