import test from 'ava';
import * as sinon from 'sinon';

import { Builder } from '../../src/Illuminate/Database/Query';
import { Grammar, MySqlGrammar } from '../../src/Illuminate/Database/Query/Grammars';
import { MySqlProcessor, Processor } from '../../src/Illuminate/Database/Query/Processors';
import { Connection } from '../../src/Illuminate/Database';

const getConnection = () => {
  // const connection = sinon.mock(new Connection());
  // connection.expects('getDatabaseName').returns('database');

  // return connection as unknown as Connection;
  return new Connection();
}

const getBuilder = () => {
  const grammar = new Grammar();
  const processor = new Processor();

  return new Builder(getConnection(), grammar, processor);
}

const getMySqlBuilder = () => {
  const grammar = new MySqlGrammar;
  const processor = new MySqlProcessor;

  return new Builder(getConnection(), grammar, processor);
}

const sandbox: sinon.SinonSandbox = sinon.createSandbox()

// test.before(t => {
// });

test.afterEach(t => {
  sandbox.verify();
  sandbox.restore();
});

test('testBasicSelect', t => {
  const builder = getBuilder();
  builder.select('*').from('users');

  t.is('select * from "users"', builder.toSql());
});

test('testBasicSelectWithGetColumns', t => {
  const builder = getBuilder();

  const processorMock = sandbox.mock(builder.getProcessor())
  const connectionMock = sandbox.mock(builder.getConnection())

  processorMock.expects('processSelect').thrice();

  connectionMock.expects('select').once().returns('select * from "users"');
  connectionMock.expects('select').once().returns('select "foo", "bar" from "users"');
  connectionMock.expects('select').once().returns('select "baz" from "users"');

  builder.from('users').get();
  t.deepEqual(builder.columns, []);

  builder.from('users').get(['foo', 'bar']);
  t.deepEqual(builder.columns, []);

  builder.from('users').get('baz');
  t.deepEqual(builder.columns, []);

  t.is(builder.toSql(), 'select * from "users"');
  t.deepEqual(builder.columns, []);
});

test('testBasicMySqlSelect', t => {
  let builder = getMySqlBuilder();

  let connectionMock = sandbox.mock(builder.getConnection());

  connectionMock.expects('select').once()
    .withArgs('select * from `users`', []);

  builder.select('*').from('users').get();

  builder = getMySqlBuilder();
  connectionMock = sandbox.mock(builder.getConnection());

  connectionMock.expects('select').once()
    .withArgs('select * from `users`', []);

  builder.select('*').from('users').get();

  t.is('select * from `users`', builder.toSql());
});

test('testBasicTableWrappingProtectsQuotationMarks', t => {
  const builder = getBuilder();
  builder.select('*').from('some"table');

  t.is('select * from "some""table"', builder.toSql());
});

test('testAliasWrappingAsWholeConstant', t => {
  const builder = getBuilder();

  builder.select('x.y as foo.bar').from('baz');
  t.is('select "x"."y" as "foo.bar" from "baz"', builder.toSql());
});

test('testAliasWrappingWithSpacesInDatabaseName', t => {
  const builder = getBuilder();

  builder.select('w x.y.z as foo.bar').from('baz');
  t.is('select "w x"."y"."z" as "foo.bar" from "baz"', builder.toSql());
});

test('test_name', t => {
  const builder = getBuilder();

  builder.select('foo').addSelect('bar').addSelect(['baz', 'boom']).from('users');
  t.is('select "foo", "bar", "baz", "boom" from "users"', builder.toSql());
});

test('testBasicSelectWithPrefix', t => {
  const builder = getBuilder();

  builder.getGrammar().setTablePrefix('prefix_');
  builder.select('*').from('users');
  t.is('select * from "prefix_users"', builder.toSql());
});

// test('test_name', t => {

// });
