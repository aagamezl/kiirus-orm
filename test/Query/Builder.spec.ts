import test from 'ava';
import * as sinon from 'sinon';

import { Builder } from '../../src/Illuminate/Database/Query';
import { Grammar, MySqlGrammar, PostgresGrammar } from '../../src/Illuminate/Database/Query/Grammars';
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
  const processor = new Processor;

  return new Builder(getConnection(), grammar, processor);
}

const getMySqlBuilderWithProcessor = () => {
  const grammar = new MySqlGrammar;
  const processor = new MySqlProcessor;

  return new Builder(getConnection(), grammar, processor);
}

const getPostgresBuilder = () => {
  const grammar = new PostgresGrammar;
  const processor = new MySqlProcessor;

  return new Builder(getConnection(), grammar, processor);
}

const sandbox: sinon.SinonSandbox = sinon.createSandbox()

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

  builder.select().from('users').get();
  t.deepEqual(builder.columns, []);

  builder.from('users').get(['foo', 'bar']);
  t.deepEqual(builder.columns, []);

  builder.from('users').get('baz');
  t.deepEqual(builder.columns, []);

  t.is(builder.toSql(), 'select * from "users"');
  t.deepEqual(builder.columns, []);
});

test('testBasicMySqlSelect', t => {
  let builder = getMySqlBuilderWithProcessor();

  let connectionMock = sandbox.mock(builder.getConnection());

  connectionMock.expects('select').once()
    .withArgs('select * from `users`', []);

  builder.select('*').from('users').get();

  builder = getMySqlBuilderWithProcessor();
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

test('testAddingSelects', t => {
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

test('testBasicSelectDistinct', t => {
  const builder = getBuilder();

  builder.distinct().select('foo', 'bar').from('users');
  t.is('select distinct "foo", "bar" from "users"', builder.toSql());
});

test('testBasicSelectDistinctOnColumns', t => {
  let builder = getBuilder();
  builder.distinct('foo').select('foo', 'bar').from('users');
  t.is('select distinct "foo", "bar" from "users"', builder.toSql());

  builder = getPostgresBuilder();
  builder.distinct('foo').select('foo', 'bar').from('users');
  t.is('select distinct on ("foo") "foo", "bar" from "users"', builder.toSql());
});

test('testBasicAlias', t => {
  const builder = getBuilder();

  builder.select('foo as bar').from('users');
  t.is('select "foo" as "bar" from "users"', builder.toSql());
});

test('testAliasWithPrefix', t => {
  const builder = getBuilder();

  builder.getGrammar().setTablePrefix('prefix_');
  builder.select('*').from('users as people');
  t.is('select * from "prefix_users" as "prefix_people"', builder.toSql());
});

test('testJoinAliasesWithPrefix', t => {
  const builder = getBuilder();

  builder.getGrammar().setTablePrefix('prefix_');
  builder.select('*').from('services').join('translations AS t', 't.item_id', '=', 'services.id');
  t.is('select * from "prefix_services" inner join "prefix_translations" as "prefix_t" on "prefix_t"."item_id" = "prefix_services"."id"', builder.toSql());
});

test('testBasicTableWrapping', t => {
  const builder = getBuilder();

  builder.select('*').from('public.users');
  t.is('select * from "public"."users"', builder.toSql());
});

test('testWhenCallback', t => {
  const callback = (query: Builder, condition: boolean) => {
    t.true(condition);

    query.where('id', '=', 1);
  };

  let builder = getBuilder();
  builder.select('*').from('users').when(true, callback).where('email', 'foo');
  t.is('select * from "users" where "id" = ? and "email" = ?', builder.toSql());

  builder = getBuilder();
  builder.select('*').from('users').when(false, callback).where('email', 'foo');
  t.is('select * from "users" where "email" = ?', builder.toSql());
});

test('testWhenCallbackWithReturn', t => {
  const callback = (query: Builder, condition: boolean) => {
    t.true(condition);

    return query.where('id', '=', 1);
  };

  let builder = getBuilder();
  builder.select('*').from('users').when(true, callback).where('email', 'foo');
  t.is('select * from "users" where "id" = ? and "email" = ?', builder.toSql());

  builder = getBuilder();
  builder.select('*').from('users').when(false, callback).where('email', 'foo');
  t.is('select * from "users" where "email" = ?', builder.toSql());
});

// test('test_name', t => {

// });
