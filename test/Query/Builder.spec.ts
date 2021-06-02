import test from 'ava';
import * as sinon from 'sinon';

import { Builder, JoinClause } from '../../src/Illuminate/Database/Query';
import {
  Grammar,
  MySqlGrammar,
  PostgresGrammar,
  SQLiteGrammar,
  SqlServerGrammar
} from '../../src/Illuminate/Database/Query/Grammars';
import { MySqlProcessor, Processor } from '../../src/Illuminate/Database/Query/Processors';
import { Connection } from '../../src/Illuminate/Database';
import { Expression as Raw } from '../../src/Illuminate/Database/Query';
import { autoVerify, createMock } from './tools/auto-verify';

const getConnection = () => {
  // const connection = sinon.mock(new Connection());
  // connection.expects('getDatabaseName').returns('database');

  // return connection as unknown as Connection;
  return new Connection();
};

const getBuilder = () => {
  const grammar = new Grammar();
  const processor = new Processor();

  return new Builder(getConnection(), grammar, processor);
};

const getMySqlBuilder = () => {
  const grammar = new MySqlGrammar;
  const processor = new Processor;

  return new Builder(getConnection(), grammar, processor);
};

const getMySqlBuilderWithProcessor = () => {
  const grammar = new MySqlGrammar;
  const processor = new MySqlProcessor;

  return new Builder(getConnection(), grammar, processor);
};

const getPostgresBuilder = () => {
  const grammar = new PostgresGrammar;
  const processor = new MySqlProcessor;

  return new Builder(getConnection(), grammar, processor);
};

const getSqlServerBuilder = () => {
  const grammar = new SqlServerGrammar;
  const processor = new Processor;

  return new Builder(getConnection(), grammar, processor);
};

const getSQLiteBuilder = () => {
  const grammar = new SQLiteGrammar;
  const processor = new Processor;

  return new Builder(getConnection(), grammar, processor);
};

// const sandbox: sinon.SinonSandbox = sinon.createSandbox()

test.afterEach(t => {
  // sandbox.verify();
  // sandbox.restore();
  // autoVerify();
});

test('testBasicSelect', t => {
  const builder = getBuilder();
  builder.select('*').from('users');

  t.is('select * from "users"', builder.toSql());
});

test('testBasicSelectWithGetColumns', t => {
  const builder = getBuilder();

  const processorMock = createMock(builder.getProcessor());
  const connectionMock = createMock(builder.getConnection());

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

  autoVerify();
});

test('testBasicMySqlSelect', t => {
  let builder = getMySqlBuilderWithProcessor();

  let connectionMock = createMock(builder.getConnection());

  connectionMock.expects('select').once()
    .withArgs('select * from `users`', []);

  builder.select('*').from('users').get();

  builder = getMySqlBuilderWithProcessor();
  connectionMock = createMock(builder.getConnection());

  connectionMock.expects('select').once()
    .withArgs('select * from `users`', []);

  builder.select('*').from('users').get();

  t.is('select * from `users`', builder.toSql());

  autoVerify();
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

test('testWhenCallbackWithDefault', t => {
  const callback = (query: Builder, condition: string) => {
    t.is('truthy', condition);

    query.where('id', '=', 1);
  };

  const defaultCallback = (query: Builder, condition: number) => {
    t.is(0, condition);

    query.where('id', '=', 2);
  };

  let builder = getBuilder();
  builder.select('*').from('users').when('truthy', callback, defaultCallback).where('email', 'foo');
  t.is('select * from "users" where "id" = ? and "email" = ?', builder.toSql());
  t.deepEqual([1, 'foo'], builder.getBindings());

  builder = getBuilder();
  builder.select('*').from('users').when(0, callback, defaultCallback).where('email', 'foo');
  t.is('select * from "users" where "id" = ? and "email" = ?', builder.toSql());
  t.deepEqual([2, 'foo'], builder.getBindings());
});

test('testUnlessCallback', t => {
  const callback = (query: Builder, condition: boolean) => {
    t.false(condition);

    query.where('id', '=', 1);
  };

  let builder = getBuilder();
  builder.select('*').from('users').unless(false, callback).where('email', 'foo');
  t.is('select * from "users" where "id" = ? and "email" = ?', builder.toSql());

  builder = getBuilder();
  builder.select('*').from('users').unless(true, callback).where('email', 'foo');
  t.is('select * from "users" where "email" = ?', builder.toSql());
});

test('testUnlessCallbackWithReturn', t => {
  const callback = (query: Builder, condition: boolean) => {
    t.false(condition);

    return query.where('id', '=', 1);
  };

  let builder = getBuilder();
  builder.select('*').from('users').unless(false, callback).where('email', 'foo');
  t.is('select * from "users" where "id" = ? and "email" = ?', builder.toSql());

  builder = getBuilder();
  builder.select('*').from('users').unless(true, callback).where('email', 'foo');
  t.is('select * from "users" where "email" = ?', builder.toSql());
});

test('testUnlessCallbackWithDefault', t => {
  const callback = (query: Builder, condition: number) => {
    t.is(0, condition);

    query.where('id', '=', 1);
  };

  const defaultCallback = (query: Builder, condition: String) => {
    t.is('truthy', condition);

    query.where('id', '=', 2);
  };

  let builder = getBuilder();
  builder.select('*').from('users').unless(0, callback, defaultCallback).where('email', 'foo');
  t.is('select * from "users" where "id" = ? and "email" = ?', builder.toSql());
  t.deepEqual([1, 'foo'], builder.getBindings());

  builder = getBuilder();
  builder.select('*').from('users').unless('truthy', callback, defaultCallback).where('email', 'foo');
  t.is('select * from "users" where "id" = ? and "email" = ?', builder.toSql());
  t.deepEqual([2, 'foo'], builder.getBindings());
});

test('testTapCallback', t => {
  const callback = (query: Builder) => {
    return query.where('id', '=', 1);
  };

  const builder = getBuilder();
  builder.select('*').from('users').tap(callback).where('email', 'foo');
  t.is('select * from "users" where "id" = ? and "email" = ?', builder.toSql());
});

test('testBasicWheres', t => {
  const builder = getBuilder();
  builder.select('*').from('users').where('id', '=', 1);
  t.is('select * from "users" where "id" = ?', builder.toSql());
  t.deepEqual([1], builder.getBindings());
});

test('testWheresWithArrayValue', t => {
  let builder = getBuilder();
  builder.select('*').from('users').where('id', [12]);
  t.is('select * from "users" where "id" = ?', builder.toSql());
  t.deepEqual([12], builder.getBindings());

  builder = getBuilder();
  builder.select('*').from('users').where('id', '=', [12, 30]);
  t.is('select * from "users" where "id" = ?', builder.toSql());
  t.deepEqual([12], builder.getBindings());

  builder = getBuilder();
  builder.select('*').from('users').where('id', '!=', [12, 30]);
  t.is('select * from "users" where "id" != ?', builder.toSql());
  t.deepEqual([12], builder.getBindings());

  builder = getBuilder();
  builder.select('*').from('users').where('id', '<>', [12, 30]);
  t.is('select * from "users" where "id" <> ?', builder.toSql());
  t.deepEqual([12], builder.getBindings());

  builder = getBuilder();
  builder.select('*').from('users').where('id', '=', [[12, 30]]);
  t.is('select * from "users" where "id" = ?', builder.toSql());
  t.deepEqual([12], builder.getBindings());
});

test('testMySqlWrappingProtectsQuotationMarks', t => {
  const builder = getMySqlBuilder();
  builder.select('*').from('some`table');
  t.is('select * from `some``table`', builder.toSql());
});

test('testDateBasedWheresAcceptsTwoArguments', t => {
  let builder = getMySqlBuilder();
  builder.select('*').from('users').whereDate('created_at', 1);
  t.is('select * from `users` where date(`created_at`) = ?', builder.toSql());

  builder = getMySqlBuilder();
  builder.select('*').from('users').whereDay('created_at', 1);
  t.is('select * from `users` where day(`created_at`) = ?', builder.toSql());

  builder = getMySqlBuilder();
  builder.select('*').from('users').whereMonth('created_at', 1);
  t.is('select * from `users` where month(`created_at`) = ?', builder.toSql());

  builder = getMySqlBuilder();
  builder.select('*').from('users').whereYear('created_at', 1);
  t.is('select * from `users` where year(`created_at`) = ?', builder.toSql());
});

test('testDateBasedOrWheresAcceptsTwoArguments', t => {
  let builder = getMySqlBuilder();
  builder.select('*').from('users').where('id', 1).orWhereDate('created_at', 1);
  t.is('select * from `users` where `id` = ? or date(`created_at`) = ?', builder.toSql());

  builder = getMySqlBuilder();
  builder.select('*').from('users').where('id', 1).orWhereDay('created_at', 1);
  t.is('select * from `users` where `id` = ? or day(`created_at`) = ?', builder.toSql());

  builder = getMySqlBuilder();
  builder.select('*').from('users').where('id', 1).orWhereMonth('created_at', 1);
  t.is('select * from `users` where `id` = ? or month(`created_at`) = ?', builder.toSql());

  builder = getMySqlBuilder();
  builder.select('*').from('users').where('id', 1).orWhereYear('created_at', 1);
  t.is('select * from `users` where `id` = ? or year(`created_at`) = ?', builder.toSql());
});

test('testDateBasedWheresExpressionIsNotBound', t => {
  let builder = getBuilder();
  builder.select('*').from('users').whereDate('created_at', new Raw('NOW()')).where('admin', true);
  t.deepEqual([true], builder.getBindings());

  builder = getBuilder();
  builder.select('*').from('users').whereDay('created_at', new Raw('NOW()'));
  t.deepEqual([], builder.getBindings());

  builder = getBuilder();
  builder.select('*').from('users').whereMonth('created_at', new Raw('NOW()'));
  t.deepEqual([], builder.getBindings());

  builder = getBuilder();
  builder.select('*').from('users').whereYear('created_at', new Raw('NOW()'));
  t.deepEqual([], builder.getBindings());
});

test('testWhereDateMySql', t => {
  let builder = getMySqlBuilder();
  builder.select('*').from('users').whereDate('created_at', '=', '2015-12-21');
  t.is('select * from `users` where date(`created_at`) = ?', builder.toSql());
  t.deepEqual(['2015-12-21'], builder.getBindings());

  builder = getMySqlBuilder();
  builder.select('*').from('users').whereDate('created_at', '=', new Raw('NOW()'));
  t.is('select * from `users` where date(`created_at`) = NOW()', builder.toSql());
});

test('testWhereDayMySql', t => {
  const builder = getMySqlBuilder();
  builder.select('*').from('users').whereDay('created_at', '=', 1);
  t.is('select * from `users` where day(`created_at`) = ?', builder.toSql());
  t.deepEqual([1], builder.getBindings());
});

test('testOrWhereDayMySql', t => {
  const builder = getMySqlBuilder();
  builder.select('*').from('users').whereDay('created_at', '=', 1).orWhereDay('created_at', '=', 2);
  t.is('select * from `users` where day(`created_at`) = ? or day(`created_at`) = ?', builder.toSql());
  t.deepEqual([1, 2], builder.getBindings());
});

test('testWhereMonthMySql', t => {
  const builder = getMySqlBuilder();
  builder.select('*').from('users').whereMonth('created_at', '=', 5);
  t.is('select * from `users` where month(`created_at`) = ?', builder.toSql());
  t.deepEqual([5], builder.getBindings());
});

test('testOrWhereMonthMySql', t => {
  const builder = getMySqlBuilder();
  builder.select('*').from('users').whereMonth('created_at', '=', 5).orWhereMonth('created_at', '=', 6);
  t.is('select * from `users` where month(`created_at`) = ? or month(`created_at`) = ?', builder.toSql());
  t.deepEqual([5, 6], builder.getBindings());
});

test('testWhereYearMySql', t => {
  const builder = getMySqlBuilder();
  builder.select('*').from('users').whereYear('created_at', '=', 2014);
  t.is('select * from `users` where year(`created_at`) = ?', builder.toSql());
  t.deepEqual([2014], builder.getBindings());
});

test('testOrWhereYearMySql', t => {
  const builder = getMySqlBuilder();
  builder.select('*').from('users').whereYear('created_at', '=', 2014).orWhereYear('created_at', '=', 2015);
  t.is('select * from `users` where year(`created_at`) = ? or year(`created_at`) = ?', builder.toSql());
  t.deepEqual([2014, 2015], builder.getBindings());
});

test('testWhereTimeMySql', t => {
  const builder = getMySqlBuilder();
  builder.select('*').from('users').whereTime('created_at', '>=', '22:00');
  t.is('select * from `users` where time(`created_at`) >= ?', builder.toSql());
  t.deepEqual(['22:00'], builder.getBindings());
});

test('testWhereTimeOperatorOptionalMySql', t => {
  const builder = getMySqlBuilder();
  builder.select('*').from('users').whereTime('created_at', '22:00');
  t.is('select * from `users` where time(`created_at`) = ?', builder.toSql());
  t.deepEqual(['22:00'], builder.getBindings());
});

test('testWhereTimeOperatorOptionalPostgres', t => {
  const builder = getPostgresBuilder();
  builder.select('*').from('users').whereTime('created_at', '22:00');
  t.is('select * from "users" where "created_at"::time = ?', builder.toSql());
  t.deepEqual(['22:00'], builder.getBindings());
});

test('testWhereDatePostgres', t => {
  let builder = getPostgresBuilder();
  builder.select('*').from('users').whereDate('created_at', '=', '2015-12-21');
  t.is('select * from "users" where "created_at"::date = ?', builder.toSql());
  t.deepEqual(['2015-12-21'], builder.getBindings());

  builder = getPostgresBuilder();
  builder.select('*').from('users').whereDate('created_at', new Raw('NOW()'));
  t.is('select * from "users" where "created_at"::date = NOW()', builder.toSql());
});

test('testWhereDayPostgres', t => {
  const builder = getPostgresBuilder();
  builder.select('*').from('users').whereDay('created_at', '=', 1);
  t.is('select * from "users" where extract(day from "created_at") = ?', builder.toSql());
  t.deepEqual([1], builder.getBindings());
});

test('testWhereMonthPostgres', t => {
  const builder = getPostgresBuilder();
  builder.select('*').from('users').whereMonth('created_at', '=', 5);
  t.is('select * from "users" where extract(month from "created_at") = ?', builder.toSql());
  t.deepEqual([5], builder.getBindings());
});

test('testWhereYearPostgres', t => {
  const builder = getPostgresBuilder();
  builder.select('*').from('users').whereYear('created_at', '=', 2014);
  t.is('select * from "users" where extract(year from "created_at") = ?', builder.toSql());
  t.deepEqual([2014], builder.getBindings());
});

test('testWhereTimePostgres', t => {
  const builder = getPostgresBuilder();
  builder.select('*').from('users').whereTime('created_at', '>=', '22:00');
  t.is('select * from "users" where "created_at"::time >= ?', builder.toSql());
  t.deepEqual(['22:00'], builder.getBindings());
});

test('testWhereLikePostgres', t => {
  let builder = getPostgresBuilder();
  builder.select('*').from('users').where('id', 'like', '1');
  t.is('select * from "users" where "id"::text like ?', builder.toSql());
  t.deepEqual(['1'], builder.getBindings());

  builder = getPostgresBuilder();
  builder.select('*').from('users').where('id', 'LIKE', '1');
  t.is('select * from "users" where "id"::text LIKE ?', builder.toSql());
  t.deepEqual(['1'], builder.getBindings());

  builder = getPostgresBuilder();
  builder.select('*').from('users').where('id', 'ilike', '1');
  t.is('select * from "users" where "id"::text ilike ?', builder.toSql());
  t.deepEqual(['1'], builder.getBindings());

  builder = getPostgresBuilder();
  builder.select('*').from('users').where('id', 'not like', '1');
  t.is('select * from "users" where "id"::text not like ?', builder.toSql());
  t.deepEqual(['1'], builder.getBindings());

  builder = getPostgresBuilder();
  builder.select('*').from('users').where('id', 'not ilike', '1');
  t.is('select * from "users" where "id"::text not ilike ?', builder.toSql());
  t.deepEqual(['1'], builder.getBindings());
});

test('testWhereDateSqlite', t => {
  let builder = getSQLiteBuilder();
  builder.select('*').from('users').whereDate('created_at', '=', '2015-12-21');
  t.is('select * from "users" where strftime(\'%Y-%m-%d\', "created_at") = cast(? as text)', builder.toSql());
  t.deepEqual(['2015-12-21'], builder.getBindings());

  builder = getSQLiteBuilder();
  builder.select('*').from('users').whereDate('created_at', new Raw('NOW()'));
  t.is('select * from "users" where strftime(\'%Y-%m-%d\', "created_at") = cast(NOW() as text)', builder.toSql());
});

test('testWhereDaySqlite', t => {
  const builder = getSQLiteBuilder();
  builder.select('*').from('users').whereDay('created_at', '=', 1);
  t.is('select * from "users" where strftime(\'%d\', "created_at") = cast(? as text)', builder.toSql());
  t.deepEqual([1], builder.getBindings());
});

test('testWhereMonthSqlite', t => {
  const builder = getSQLiteBuilder();
  builder.select('*').from('users').whereMonth('created_at', '=', 5);
  t.is('select * from "users" where strftime(\'%m\', "created_at") = cast(? as text)', builder.toSql());
  t.deepEqual([5], builder.getBindings());
});

test('testWhereYearSqlite', t => {
  const builder = getSQLiteBuilder();
  builder.select('*').from('users').whereYear('created_at', '=', 2014);
  t.is('select * from "users" where strftime(\'%Y\', "created_at") = cast(? as text)', builder.toSql());
  t.deepEqual([2014], builder.getBindings());
});

test('testWhereTimeSqlite', t => {
  const builder = getSQLiteBuilder();
  builder.select('*').from('users').whereTime('created_at', '>=', '22:00');
  t.is('select * from "users" where strftime(\'%H:%M:%S\', "created_at") >= cast(? as text)', builder.toSql());
  t.deepEqual(['22:00'], builder.getBindings());
});

test('testWhereTimeOperatorOptionalSqlite', t => {
  const builder = getSQLiteBuilder();
  builder.select('*').from('users').whereTime('created_at', '22:00');
  t.is('select * from "users" where strftime(\'%H:%M:%S\', "created_at") = cast(? as text)', builder.toSql());
  t.deepEqual(['22:00'], builder.getBindings());
});

test('testWhereTimeSqlServer', t => {
  let builder = getSqlServerBuilder();
  builder.select('*').from('users').whereTime('created_at', '22:00');
  t.is('select * from [users] where cast([created_at] as time) = ?', builder.toSql());
  t.deepEqual(['22:00'], builder.getBindings());

  builder = getSqlServerBuilder();
  builder.select('*').from('users').whereTime('created_at', new Raw('NOW()'));
  t.is('select * from [users] where cast([created_at] as time) = NOW()', builder.toSql());
  t.deepEqual([], builder.getBindings());
});

test('testWhereDateSqlServer', t => {
  let builder = getSqlServerBuilder();
  builder.select('*').from('users').whereDate('created_at', '=', '2015-12-21');
  t.is('select * from [users] where cast([created_at] as date) = ?', builder.toSql());
  t.deepEqual(['2015-12-21'], builder.getBindings());

  builder = getSqlServerBuilder();
  builder.select('*').from('users').whereDate('created_at', new Raw('NOW()'));
  t.is('select * from [users] where cast([created_at] as date) = NOW()', builder.toSql());
});

test('testWhereDaySqlServer', t => {
  const builder = getSqlServerBuilder();
  builder.select('*').from('users').whereDay('created_at', '=', 1);
  t.is('select * from [users] where day([created_at]) = ?', builder.toSql());
  t.deepEqual([1], builder.getBindings());
});

test('testWhereMonthSqlServer', t => {
  const builder = getSqlServerBuilder();
  builder.select('*').from('users').whereMonth('created_at', '=', 5);
  t.is('select * from [users] where month([created_at]) = ?', builder.toSql());
  t.deepEqual([5], builder.getBindings());
});

test('testWhereYearSqlServer', t => {
  const builder = getSqlServerBuilder();
  builder.select('*').from('users').whereYear('created_at', '=', 2014);
  t.is('select * from [users] where year([created_at]) = ?', builder.toSql());
  t.deepEqual([2014], builder.getBindings());
});

test('testWhereBetweens', t => {
  let builder = getBuilder();
  builder.select('*').from('users').whereBetween('id', [1, 2]);
  t.is('select * from "users" where "id" between ? and ?', builder.toSql());
  t.deepEqual([1, 2], builder.getBindings());

  builder = getBuilder();
  builder.select('*').from('users').whereBetween('id', [[1, 2, 3]]);
  t.is('select * from "users" where "id" between ? and ?', builder.toSql());
  t.deepEqual([1, 2], builder.getBindings());

  builder = getBuilder();
  builder.select('*').from('users').whereBetween('id', [[1], [2, 3]]);
  t.is('select * from "users" where "id" between ? and ?', builder.toSql());
  t.deepEqual([1, 2], builder.getBindings());

  builder = getBuilder();
  builder.select('*').from('users').whereNotBetween('id', [1, 2]);
  t.is('select * from "users" where "id" not between ? and ?', builder.toSql());
  t.deepEqual([1, 2], builder.getBindings());

  builder = getBuilder();
  builder.select('*').from('users').whereBetween('id', [new Raw(1), new Raw(2)]);
  t.is('select * from "users" where "id" between 1 and 2', builder.toSql());
  t.deepEqual([], builder.getBindings());
});

test('testWhereBetweenColumns', t => {
  let builder = getBuilder();
  builder.select('*').from('users').whereBetweenColumns('id', ['users.created_at', 'users.updated_at']);
  t.is('select * from "users" where "id" between "users"."created_at" and "users"."updated_at"', builder.toSql());
  t.deepEqual([], builder.getBindings());

  builder = getBuilder();
  builder.select('*').from('users').whereNotBetweenColumns('id', ['created_at', 'updated_at']);
  t.is('select * from "users" where "id" not between "created_at" and "updated_at"', builder.toSql());
  t.deepEqual([], builder.getBindings());

  builder = getBuilder();
  builder.select('*').from('users').whereBetweenColumns('id', [new Raw(1), new Raw(2)]);
  t.is('select * from "users" where "id" between 1 and 2', builder.toSql());
  t.deepEqual([], builder.getBindings());
});

test('testBasicOrWheres', t => {
  const builder = getBuilder();
  builder.select('*').from('users').where('id', '=', 1).orWhere('email', '=', 'foo');
  t.is('select * from "users" where "id" = ? or "email" = ?', builder.toSql());
  t.deepEqual([1, 'foo'], builder.getBindings());
});

test('testRawWheres', t => {
  const builder = getBuilder();
  builder.select('*').from('users').whereRaw('id = ? or email = ?', [1, 'foo']);
  t.is('select * from "users" where id = ? or email = ?', builder.toSql());
  t.deepEqual([1, 'foo'], builder.getBindings());
});

test('testRawOrWheres', t => {
  const builder = getBuilder();
  builder.select('*').from('users').where('id', '=', 1).orWhereRaw('email = ?', ['foo']);
  t.is('select * from "users" where "id" = ? or email = ?', builder.toSql());
  t.deepEqual([1, 'foo'], builder.getBindings());
});

test('testBasicWhereIns', t => {
  let builder = getBuilder();
  builder.select('*').from('users').whereIn('id', [1, 2, 3]);
  t.is('select * from "users" where "id" in (?, ?, ?)', builder.toSql());
  t.deepEqual([1, 2, 3], builder.getBindings());

  builder = getBuilder();
  builder.select('*').from('users').where('id', '=', 1).orWhereIn('id', [1, 2, 3]);
  t.is('select * from "users" where "id" = ? or "id" in (?, ?, ?)', builder.toSql());
  t.deepEqual([1, 1, 2, 3], builder.getBindings());
});

test('testBasicWhereNotIns', t => {
  let builder = getBuilder();
  builder.select('*').from('users').whereNotIn('id', [1, 2, 3]);
  t.is('select * from "users" where "id" not in (?, ?, ?)', builder.toSql());
  t.deepEqual([1, 2, 3], builder.getBindings());

  builder = getBuilder();
  builder.select('*').from('users').where('id', '=', 1).orWhereNotIn('id', [1, 2, 3]);
  t.is('select * from "users" where "id" = ? or "id" not in (?, ?, ?)', builder.toSql());
  t.deepEqual([1, 1, 2, 3], builder.getBindings());
});

test('testRawWhereIns', t => {
  let builder = getBuilder();
  builder.select('*').from('users').whereIn('id', [new Raw(1)]);
  t.is('select * from "users" where "id" in (1)', builder.toSql());

  builder = getBuilder();
  builder.select('*').from('users').where('id', '=', 1).orWhereIn('id', [new Raw(1)]);
  t.is('select * from "users" where "id" = ? or "id" in (1)', builder.toSql());
  t.deepEqual([1], builder.getBindings());
});

test('testEmptyWhereIns', t => {
  let builder = getBuilder();
  builder.select('*').from('users').whereIn('id', []);
  t.is('select * from "users" where 0 = 1', builder.toSql());
  t.deepEqual([], builder.getBindings());

  builder = getBuilder();
  builder.select('*').from('users').where('id', '=', 1).orWhereIn('id', []);
  t.is('select * from "users" where "id" = ? or 0 = 1', builder.toSql());
  t.deepEqual([1], builder.getBindings());
});

test('testEmptyWhereNotIns', t => {
  let builder = getBuilder();
  builder.select('*').from('users').whereNotIn('id', []);
  t.is('select * from "users" where 1 = 1', builder.toSql());
  t.deepEqual([], builder.getBindings());

  builder = getBuilder();
  builder.select('*').from('users').where('id', '=', 1).orWhereNotIn('id', []);
  t.is('select * from "users" where "id" = ? or 1 = 1', builder.toSql());
  t.deepEqual([1], builder.getBindings());
});

test('testWhereIntegerInRaw', t => {
  const builder = getBuilder();
  builder.select('*').from('users').whereIntegerInRaw('id', ['1a', 2]);
  t.is('select * from "users" where "id" in (1, 2)', builder.toSql());
  t.deepEqual([], builder.getBindings());
});

test('testOrWhereIntegerInRaw', t => {
  const builder = getBuilder();
  builder.select('*').from('users').where('id', '=', 1).orWhereIntegerInRaw('id', ['1a', 2]);
  t.is('select * from "users" where "id" = ? or "id" in (1, 2)', builder.toSql());
  t.deepEqual([1], builder.getBindings());
});

test('testWhereIntegerNotInRaw', t => {
  const builder = getBuilder();
  builder.select('*').from('users').whereIntegerNotInRaw('id', ['1a', 2]);
  t.is('select * from "users" where "id" not in (1, 2)', builder.toSql());
  t.deepEqual([], builder.getBindings());
});

test('testOrWhereIntegerNotInRaw', t => {
  const builder = getBuilder();
  builder.select('*').from('users').where('id', '=', 1).orWhereIntegerNotInRaw('id', ['1a', 2]);
  t.is('select * from "users" where "id" = ? or "id" not in (1, 2)', builder.toSql());
  t.deepEqual([1], builder.getBindings());
});

test('testEmptyWhereIntegerInRaw', t => {
  const builder = getBuilder();
  builder.select('*').from('users').whereIntegerInRaw('id', []);
  t.is('select * from "users" where 0 = 1', builder.toSql());
  t.deepEqual([], builder.getBindings());
});

test('testEmptyWhereIntegerNotInRaw', t => {
  const builder = getBuilder();
  builder.select('*').from('users').whereIntegerNotInRaw('id', []);
  t.is('select * from "users" where 1 = 1', builder.toSql());
  t.deepEqual([], builder.getBindings());
});

test('testBasicWhereColumn', t => {
  let builder = getBuilder();
  builder.select('*').from('users').whereColumn('first_name', 'last_name').orWhereColumn('first_name', 'middle_name');
  t.is('select * from "users" where "first_name" = "last_name" or "first_name" = "middle_name"', builder.toSql());
  t.deepEqual([], builder.getBindings());

  builder = getBuilder();
  builder.select('*').from('users').whereColumn('updated_at', '>', 'created_at');
  t.is('select * from "users" where "updated_at" > "created_at"', builder.toSql());
  t.deepEqual([], builder.getBindings());
});

test('testArrayWhereColumn', t => {
  const conditions = [
    ['first_name', 'last_name'],
    ['updated_at', '>', 'created_at'],
  ];

  const builder = getBuilder();
  builder.select('*').from('users').whereColumn(conditions);
  t.is('select * from "users" where ("first_name" = "last_name" and "updated_at" > "created_at")', builder.toSql());
  t.deepEqual([], builder.getBindings());
});

test('testUnions', t => {
  let builder = getBuilder();
  builder.select('*').from('users').where('id', '=', 1);
  builder.union(getBuilder().select('*').from('users').where('id', '=', 2));
  t.is('(select * from "users" where "id" = ?) union (select * from "users" where "id" = ?)', builder.toSql());
  t.deepEqual([1, 2], builder.getBindings());

  builder = getMySqlBuilder();
  builder.select('*').from('users').where('id', '=', 1);
  builder.union(getMySqlBuilder().select('*').from('users').where('id', '=', 2));
  t.is('(select * from `users` where `id` = ?) union (select * from `users` where `id` = ?)', builder.toSql());
  t.deepEqual([1, 2], builder.getBindings());

  builder = getMySqlBuilder();
  let expectedSql = '(select `a` from `t1` where `a` = ? and `b` = ?) union (select `a` from `t2` where `a` = ? and `b` = ?) order by `a` asc limit 10';
  let union = getMySqlBuilder().select('a').from('t2').where('a', 11).where('b', 2);
  builder.select('a').from('t1').where('a', 10).where('b', 1).union(union).orderBy('a').limit(10);
  t.deepEqual(expectedSql, builder.toSql());
  t.deepEqual([10, 1, 11, 2], builder.getBindings());

  builder = getPostgresBuilder();
  expectedSql = '(select "name" from "users" where "id" = ?) union (select "name" from "users" where "id" = ?)';
  builder.select('name').from('users').where('id', '=', 1);
  builder.union(getPostgresBuilder().select('name').from('users').where('id', '=', 2));
  t.deepEqual(expectedSql, builder.toSql());
  t.deepEqual([1, 2], builder.getBindings());

  builder = getSQLiteBuilder();
  expectedSql = 'select * from (select "name" from "users" where "id" = ?) union select * from (select "name" from "users" where "id" = ?)';
  builder.select('name').from('users').where('id', '=', 1);
  builder.union(getSQLiteBuilder().select('name').from('users').where('id', '=', 2));
  t.deepEqual(expectedSql, builder.toSql());
  t.deepEqual([1, 2], builder.getBindings());

  builder = getSqlServerBuilder();
  expectedSql = 'select * from (select [name] from [users] where [id] = ?) as [temp_table] union select * from (select [name] from [users] where [id] = ?) as [temp_table]';
  builder.select('name').from('users').where('id', '=', 1);
  builder.union(getSqlServerBuilder().select('name').from('users').where('id', '=', 2));
  t.deepEqual(expectedSql, builder.toSql());
  t.deepEqual([1, 2], builder.getBindings());
});

test('testUnionAlls', t => {
  let builder = getBuilder();
  builder.select('*').from('users').where('id', '=', 1);
  builder.unionAll(getBuilder().select('*').from('users').where('id', '=', 2));
  t.is('(select * from "users" where "id" = ?) union all (select * from "users" where "id" = ?)', builder.toSql());
  t.deepEqual([1, 2], builder.getBindings());

  const expectedSql = '(select * from "users" where "id" = ?) union all (select * from "users" where "id" = ?)';
  builder = getPostgresBuilder();
  builder.select('*').from('users').where('id', '=', 1);
  builder.unionAll(getBuilder().select('*').from('users').where('id', '=', 2));
  t.is(expectedSql, builder.toSql());
  t.deepEqual([1, 2], builder.getBindings());
});

test('testMultipleUnions', t => {
  const builder = getBuilder();
  builder.select('*').from('users').where('id', '=', 1);
  builder.union(getBuilder().select('*').from('users').where('id', '=', 2));
  builder.union(getBuilder().select('*').from('users').where('id', '=', 3));
  t.is('(select * from "users" where "id" = ?) union (select * from "users" where "id" = ?) union (select * from "users" where "id" = ?)', builder.toSql());
  t.deepEqual([1, 2, 3], builder.getBindings());
});

test('testMultipleUnionAlls', t => {
  const builder = getBuilder();
  builder.select('*').from('users').where('id', '=', 1);
  builder.unionAll(getBuilder().select('*').from('users').where('id', '=', 2));
  builder.unionAll(getBuilder().select('*').from('users').where('id', '=', 3));
  t.is('(select * from "users" where "id" = ?) union all (select * from "users" where "id" = ?) union all (select * from "users" where "id" = ?)', builder.toSql());
  t.deepEqual([1, 2, 3], builder.getBindings());
});

test('testUnionOrderBys', t => {
  const builder = getBuilder();
  builder.select('*').from('users').where('id', '=', 1);
  builder.union(getBuilder().select('*').from('users').where('id', '=', 2));
  builder.orderBy('id', 'desc');
  t.is('(select * from "users" where "id" = ?) union (select * from "users" where "id" = ?) order by "id" desc', builder.toSql());
  t.deepEqual([1, 2], builder.getBindings());
});

test('testUnionLimitsAndOffsets', t => {
  let builder = getBuilder();
  builder.select('*').from('users');
  builder.union(getBuilder().select('*').from('dogs'));
  builder.skip(5).take(10);
  t.is('(select * from "users") union (select * from "dogs") limit 10 offset 5', builder.toSql());

  let expectedSql = '(select * from "users") union (select * from "dogs") limit 10 offset 5';
  builder = getPostgresBuilder();
  builder.select('*').from('users');
  builder.union(getBuilder().select('*').from('dogs'));
  builder.skip(5).take(10);
  t.is(expectedSql, builder.toSql());

  expectedSql = '(select * from "users" limit 11) union (select * from "dogs" limit 22) limit 10 offset 5';
  builder = getPostgresBuilder();
  builder.select('*').from('users').limit(11);
  builder.union(getBuilder().select('*').from('dogs').limit(22));
  builder.skip(5).take(10);
  t.is(expectedSql, builder.toSql());
});

test('testUnionWithJoin', t => {
  const builder = getBuilder();
  builder.select('*').from('users');
  builder.union(getBuilder().select('*').from('dogs').join('breeds', (join: JoinClause) => {
    join.on('dogs.breed_id', '=', 'breeds.id')
      .where('breeds.is_native', '=', 1);
  }));
  t.is('(select * from "users") union (select * from "dogs" inner join "breeds" on "dogs"."breed_id" = "breeds"."id" and "breeds"."is_native" = ?)', builder.toSql());
  t.deepEqual([1], builder.getBindings());
});

test('testMySqlUnionOrderBys', t => {
  const builder = getMySqlBuilder();
  builder.select('*').from('users').where('id', '=', 1);
  builder.union(getMySqlBuilder().select('*').from('users').where('id', '=', 2));
  builder.orderBy('id', 'desc');
  t.is('(select * from `users` where `id` = ?) union (select * from `users` where `id` = ?) order by `id` desc', builder.toSql());
  t.deepEqual([1, 2], builder.getBindings());
});

test('testMySqlUnionLimitsAndOffsets', t => {
  const builder = getMySqlBuilder();
  builder.select('*').from('users');
  builder.union(getMySqlBuilder().select('*').from('dogs'));
  builder.skip(5).take(10);
  t.is('(select * from `users`) union (select * from `dogs`) limit 10 offset 5', builder.toSql());
});

test('testUnionAggregate', t => {
  let expected = 'select count(*) as aggregate from ((select * from `posts`) union (select * from `videos`)) as `temp_table`';
  let builder = getMySqlBuilder();
  let processorMock = createMock(builder.getProcessor());
  let connectionMock = createMock(builder.getConnection());
  connectionMock.expects('select').once().withArgs(expected, []);
  processorMock.expects('processSelect').once();
  builder.from('posts').union(getMySqlBuilder().from('videos')).count();

  expected = 'select count(*) as aggregate from ((select `id` from `posts`) union (select `id` from `videos`)) as `temp_table`';
  builder = getMySqlBuilder();
  processorMock = createMock(builder.getProcessor());
  connectionMock = createMock(builder.getConnection());
  connectionMock.expects('select').once().withArgs(expected, []);
  processorMock.expects('processSelect').once();
  builder.from('posts').select('id').union(getMySqlBuilder().from('videos').select('id')).count();

  expected = 'select count(*) as aggregate from ((select * from "posts") union (select * from "videos")) as "temp_table"';
  builder = getPostgresBuilder();
  processorMock = createMock(builder.getProcessor());
  connectionMock = createMock(builder.getConnection());
  connectionMock.expects('select').once().withArgs(expected, []);
  processorMock.expects('processSelect').once();
  builder.from('posts').union(getPostgresBuilder().from('videos')).count();

  expected = 'select count(*) as aggregate from (select * from (select * from "posts") union select * from (select * from "videos")) as "temp_table"';
  builder = getSQLiteBuilder();
  processorMock = createMock(builder.getProcessor());
  connectionMock = createMock(builder.getConnection());
  connectionMock.expects('select').once().withArgs(expected, []);
  processorMock.expects('processSelect').once();
  builder.from('posts').union(getSQLiteBuilder().from('videos')).count();

  expected = 'select count(*) as aggregate from (select * from (select * from [posts]) as [temp_table] union select * from (select * from [videos]) as [temp_table]) as [temp_table]';
  builder = getSqlServerBuilder();
  processorMock = createMock(builder.getProcessor());
  connectionMock = createMock(builder.getConnection());
  connectionMock.expects('select').once().withArgs(expected, []);
  processorMock.expects('processSelect').once();
  builder.from('posts').union(getSqlServerBuilder().from('videos')).count();

  autoVerify();
  t.pass();
});

test('testHavingAggregate', t => {
  const expected = 'select count(*) as aggregate from (select (select `count(*)` from `videos` where `posts`.`id` = `videos`.`post_id`) as `videos_count` from `posts` having `videos_count` > ?) as `temp_table`';
  const results = [1];
  const builder = getMySqlBuilder();
  let processorMock = createMock(builder.getProcessor());
  let connectionMock = createMock(builder.getConnection());
  connectionMock.expects('getDatabaseName').twice();
  connectionMock.expects('select').once().withArgs(expected, [1]).returns([{ 'aggregate': 1 }]);
  processorMock.expects('processSelect').once().returns(results);

  builder.from('posts').selectSub((query: Builder) => {
    query.from('videos').select('count(*)').whereColumn('posts.id', '=', 'videos.post_id');
  }, 'videos_count').having('videos_count', '>', 1);
  builder.count();

  autoVerify();
  t.pass();
});

test('testSubSelectWhereIns', t => {
  let builder = getBuilder();
  builder.select('*').from('users').whereIn('id', (query: Builder) => {
    query.select('id').from('users').where('age', '>', 25).take(3);
  });
  t.is('select * from "users" where "id" in (select "id" from "users" where "age" > ? limit 3)', builder.toSql());
  t.deepEqual([25], builder.getBindings());

  builder = getBuilder();
  builder.select('*').from('users').whereNotIn('id', (query: Builder) => {
    query.select('id').from('users').where('age', '>', 25).take(3);
  });
  t.is('select * from "users" where "id" not in (select "id" from "users" where "age" > ? limit 3)', builder.toSql());
  t.deepEqual([25], builder.getBindings());
});

test('testBasicWhereNulls', t => {
  let builder = getBuilder();
  builder.select('*').from('users').whereNull('id');
  t.is('select * from "users" where "id" is null', builder.toSql());
  t.deepEqual([], builder.getBindings());

  builder = getBuilder();
  builder.select('*').from('users').where('id', '=', 1).orWhereNull('id');
  t.is('select * from "users" where "id" = ? or "id" is null', builder.toSql());
  t.deepEqual([1], builder.getBindings());
});

test('testJsonWhereNullMysql', t => {
  const builder = getMySqlBuilder();
  builder.select('*').from('users').whereNull('items->id');
  t.is('select * from `users` where (json_extract(`items`, \'$."id"\') is null OR json_type(json_extract(`items`, \'$."id"\')) = \'NULL\')', builder.toSql());
});

test('testJsonWhereNotNullMysql', t => {
  const builder = getMySqlBuilder();
  builder.select('*').from('users').whereNotNull('items->id');
  t.is('select * from `users` where (json_extract(`items`, \'$."id"\') is not null AND json_type(json_extract(`items`, \'$."id"\')) != \'NULL\')', builder.toSql());
});

test('testArrayWhereNulls', t => {
  let builder = getBuilder();
  builder.select('*').from('users').whereNull(['id', 'expires_at']);
  t.is('select * from "users" where "id" is null and "expires_at" is null', builder.toSql());
  t.deepEqual([], builder.getBindings());

  builder = getBuilder();
  builder.select('*').from('users').where('id', '=', 1).orWhereNull(['id', 'expires_at']);
  t.is('select * from "users" where "id" = ? or "id" is null or "expires_at" is null', builder.toSql());
  t.deepEqual([1], builder.getBindings());
});

test('testBasicWhereNotNulls', t => {
  let builder = getBuilder();
  builder.select('*').from('users').whereNotNull('id');
  t.is('select * from "users" where "id" is not null', builder.toSql());
  t.deepEqual([], builder.getBindings());

  builder = getBuilder();
  builder.select('*').from('users').where('id', '>', 1).orWhereNotNull('id');
  t.is('select * from "users" where "id" > ? or "id" is not null', builder.toSql());
  t.deepEqual([1], builder.getBindings());
});

test('testArrayWhereNotNulls', t => {
  let builder = getBuilder();
  builder.select('*').from('users').whereNotNull(['id', 'expires_at']);
  t.is('select * from "users" where "id" is not null and "expires_at" is not null', builder.toSql());
  t.deepEqual([], builder.getBindings());

  builder = getBuilder();
  builder.select('*').from('users').where('id', '>', 1).orWhereNotNull(['id', 'expires_at']);
  t.is('select * from "users" where "id" > ? or "id" is not null or "expires_at" is not null', builder.toSql());
  t.deepEqual([1], builder.getBindings());
});

test('testGroupBys', t => {
  let builder = getBuilder();
  builder.select('*').from('users').groupBy('email');
  t.is('select * from "users" group by "email"', builder.toSql());

  builder = getBuilder();
  builder.select('*').from('users').groupBy('id', 'email');
  t.is('select * from "users" group by "id", "email"', builder.toSql());

  builder = getBuilder();
  builder.select('*').from('users').groupBy(['id', 'email']);
  t.is('select * from "users" group by "id", "email"', builder.toSql());

  builder = getBuilder();
  builder.select('*').from('users').groupBy(new Raw('DATE(created_at)'));
  t.is('select * from "users" group by DATE(created_at)', builder.toSql());

  builder = getBuilder();
  builder.select('*').from('users').groupByRaw('DATE(created_at), ? DESC', ['foo']);
  t.is('select * from "users" group by DATE(created_at), ? DESC', builder.toSql());
  t.deepEqual(['foo'], builder.getBindings());

  builder = getBuilder();
  builder.havingRaw('?', ['havingRawBinding']).groupByRaw('?', ['groupByRawBinding']).whereRaw('?', ['whereRawBinding']);
  t.deepEqual(['whereRawBinding', 'groupByRawBinding', 'havingRawBinding'], builder.getBindings());
});

test('testOrderBys', t => {
  let builder = getBuilder();
  builder.select('*').from('users').orderBy('email').orderBy('age', 'desc');
  t.is('select * from "users" order by "email" asc, "age" desc', builder.toSql());

  builder.orders = [];
  t.is('select * from "users"', builder.toSql());

  builder.orders = [];
  t.is('select * from "users"', builder.toSql());

  builder = getBuilder();
  builder.select('*').from('users').orderBy('email').orderByRaw('"age" ? desc', ['foo']);
  t.is('select * from "users" order by "email" asc, "age" ? desc', builder.toSql());
  t.deepEqual(['foo'], builder.getBindings());

  builder = getBuilder();
  builder.select('*').from('users').orderByDesc('name');
  t.is('select * from "users" order by "name" desc', builder.toSql());

  builder = getBuilder();
  builder.select('*').from('posts').where('public', 1)
    .unionAll(getBuilder().select('*').from('videos').where('public', 1))
    .orderByRaw('field(category, ?, ?) asc', ['news', 'opinion']);
  t.is('(select * from "posts" where "public" = ?) union all (select * from "videos" where "public" = ?) order by field(category, ?, ?) asc', builder.toSql());
  t.deepEqual([1, 1, 'news', 'opinion'], builder.getBindings());
});

test('testReorder', t => {
  let builder = getBuilder();
  builder.select('*').from('users').orderBy('name');
  t.is('select * from "users" order by "name" asc', builder.toSql());
  builder.reorder();
  t.is('select * from "users"', builder.toSql());

  builder = getBuilder();
  builder.select('*').from('users').orderBy('name');
  t.is('select * from "users" order by "name" asc', builder.toSql());
  builder.reorder('email', 'desc');
  t.is('select * from "users" order by "email" desc', builder.toSql());

  builder = getBuilder();
  builder.select('*').from('first');
  builder.union(getBuilder().select('*').from('second'));
  builder.orderBy('name');
  t.is('(select * from "first") union (select * from "second") order by "name" asc', builder.toSql());
  builder.reorder();
  t.is('(select * from "first") union (select * from "second")', builder.toSql());

  builder = getBuilder();
  builder.select('*').from('users').orderByRaw('?', [true]);
  t.deepEqual([ true ], builder.getBindings());
  builder.reorder();
  t.deepEqual([], builder.getBindings());
});

test('testOrderBySubQueries', t => {
  const expected = 'select * from "users" order by (select "created_at" from "logins" where "user_id" = "users"."id" limit 1)';
  const subQuery = (query: Builder) => {
    return query.select('created_at').from('logins').whereColumn('user_id', 'users.id').limit(1);
  };

  let builder = getBuilder().select('*').from('users').orderBy(subQuery);
  t.is(`${expected} asc`, builder.toSql());

  builder = getBuilder().select('*').from('users').orderBy(subQuery, 'desc');
  t.is(`${expected} desc`, builder.toSql());

  builder = getBuilder().select('*').from('users').orderByDesc(subQuery);
  t.is(`${expected} desc`, builder.toSql());

  builder = getBuilder();
  builder.select('*').from('posts').where('public', 1)
    .unionAll(getBuilder().select('*').from('videos').where('public', 1))
    .orderBy(getBuilder().selectRaw('field(category, ?, ?)', ['news', 'opinion']));
  t.is('(select * from "posts" where "public" = ?) union all (select * from "videos" where "public" = ?) order by (select field(category, ?, ?)) asc', builder.toSql());
  t.deepEqual([1, 1, 'news', 'opinion'], builder.getBindings());
});

test('testOrderByInvalidDirectionParam', t => {
  const error = t.throws(() => {
    const builder = getBuilder();
    builder.select('*').from('users').orderBy('age', 'asec');
  }, { instanceOf: TypeError });

  t.true(error.message.includes('InvalidArgumentException'));
});

test('testHavings', t => {
  let builder = getBuilder();
  builder.select('*').from('users').having('email', '>', 1);
  t.is('select * from "users" having "email" > ?', builder.toSql());

  builder = getBuilder();
  builder.select('*').from('users')
    .orHaving('email', '=', 'test@example.com')
    .orHaving('email', '=', 'test2@example.com');
  t.is('select * from "users" having "email" = ? or "email" = ?', builder.toSql());

  builder = getBuilder();
  builder.select('*').from('users').groupBy('email').having('email', '>', 1);
  t.is('select * from "users" group by "email" having "email" > ?', builder.toSql());

  builder = getBuilder();
  builder.select('email as foo_email').from('users').having('foo_email', '>', 1);
  t.is('select "email" as "foo_email" from "users" having "foo_email" > ?', builder.toSql());

  builder = getBuilder();
  builder.select(['category', new Raw('count(*) as "total"')]).from('item').where('department', '=', 'popular').groupBy('category').having('total', '>', new Raw('3'));
  t.is('select "category", count(*) as "total" from "item" where "department" = ? group by "category" having "total" > 3', builder.toSql());

  builder = getBuilder();
  builder.select(['category', new Raw('count(*) as "total"')]).from('item').where('department', '=', 'popular').groupBy('category').having('total', '>', 3);
  t.is('select "category", count(*) as "total" from "item" where "department" = ? group by "category" having "total" > ?', builder.toSql());
});

test('testHavingBetweens', t => {
  let builder = getBuilder();
  builder.select('*').from('users').havingBetween('id', [1, 2, 3]);
  t.is('select * from "users" having "id" between ? and ?', builder.toSql());
  t.deepEqual([1, 2], builder.getBindings());

  builder = getBuilder();
  builder.select('*').from('users').havingBetween('id', [[1, 2], [3, 4]]);
  t.is('select * from "users" having "id" between ? and ?', builder.toSql());
  t.deepEqual([1, 2], builder.getBindings());
});

test('testHavingShortcut', t => {
  const builder = getBuilder();
  builder.select('*').from('users').having('email', 1).orHaving('email', 2);
  t.is('select * from "users" having "email" = ? or "email" = ?', builder.toSql());
});

// test('test_name', t => {

// });
