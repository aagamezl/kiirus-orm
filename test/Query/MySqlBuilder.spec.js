const test = require('ava')

const { mock } = require('./../tools/mock')

// test('testCreateDatabase', (t) => {
//   const { createMock, verifyMock } = mock()

//   grammar = new MySqlGrammar;

//   connection = m:: mock(Connection:: class);
//   connection.shouldReceive('getConfig').once() ->with ('charset').andReturn('utf8mb4');
//   connection.shouldReceive('getConfig').once() ->with ('collation').andReturn('utf8mb4_unicode_ci');
//   connection.shouldReceive('getSchemaGrammar').once().andReturn(grammar);
//   connection.shouldReceive('statement').once() ->with (
//   'create database `my_temporary_database` default character set `utf8mb4` default collate `utf8mb4_unicode_ci`'
//   ).andReturn(true);

//   $builder = new MySqlBuilder(connection);
//   $builder.createDatabase('my_temporary_database');

//   verifyMock()
// })

// test('test_name', (t) => {
//   const { createMock, verifyMock } = mock()

//   verifyMock()
// })
