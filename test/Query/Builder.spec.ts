import test from 'ava';

// import { Builder, JoinClause, TJoinClause } from '../../src/Illuminate/Database/Query';
import {
  Builder,
  Expression as Raw,
  JoinClause,
} from '../../src/Illuminate/Database/Query/internal';
import {
  Grammar,
  MySqlGrammar,
  PostgresGrammar,
  SQLiteGrammar,
  SqlServerGrammar,
} from '../../src/Illuminate/Database/Query/Grammars';
import {
  MySqlProcessor,
  Processor,
} from '../../src/Illuminate/Database/Query/Processors';
import {Config, Connection} from '../../src/Illuminate/Database';
import {Builder as EloquentBuilder} from '../../src/Illuminate/Database/Eloquent/Query/Builder';
import {autoVerify, createMock} from './tools/auto-verify';

const config: Config = {
  driver: 'mysql',
  host: '127.0.0.1',
  database: 'test',
  username: 'root',
  password: 'root',
};

const getConnection = () => new Connection(config);

const getBuilder = () => {
  const grammar = new Grammar();
  const processor = new Processor();

  return new Builder(getConnection(), grammar, processor);
};

const getMySqlBuilder = () => {
  const grammar = new MySqlGrammar();
  const processor = new Processor();

  return new Builder(getConnection(), grammar, processor);
};

const getMySqlBuilderWithProcessor = () => {
  const grammar = new MySqlGrammar();
  const processor = new MySqlProcessor();

  return new Builder(getConnection(), grammar, processor);
};

const getPostgresBuilder = () => {
  const grammar = new PostgresGrammar();
  const processor = new MySqlProcessor();

  return new Builder(getConnection(), grammar, processor);
};

const getSqlServerBuilder = () => {
  const grammar = new SqlServerGrammar();
  const processor = new Processor();

  return new Builder(getConnection(), grammar, processor);
};

const getSQLiteBuilder = () => {
  const grammar = new SQLiteGrammar();
  const processor = new Processor();

  return new Builder(getConnection(), grammar, processor);
};

test('testBasicSelect', t => {
  const builder = getBuilder();
  builder.select('*').from('users');

  t.is(builder.toSql(), 'select * from "users"');
});

test('testBasicSelectWithGetColumns', t => {
  const builder = getBuilder();

  const processorMock = createMock(builder.getProcessor());
  const connectionMock = createMock(builder.getConnection());

  processorMock.expects('processSelect').thrice();

  connectionMock.expects('select').once().returns('select * from "users"');
  connectionMock
    .expects('select')
    .once()
    .returns('select "foo", "bar" from "users"');
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

  connectionMock.expects('select').once().withArgs('select * from `users`', []);

  builder.select('*').from('users').get();

  builder = getMySqlBuilderWithProcessor();
  connectionMock = createMock(builder.getConnection());

  connectionMock.expects('select').once().withArgs('select * from `users`', []);

  builder.select('*').from('users').get();

  t.is(builder.toSql(), 'select * from `users`');

  autoVerify();
});

test('testBasicTableWrappingProtectsQuotationMarks', t => {
  const builder = getBuilder();
  builder.select('*').from('some"table');

  t.is(builder.toSql(), 'select * from "some""table"');
});

test('testAliasWrappingAsWholeConstant', t => {
  const builder = getBuilder();

  builder.select('x.y as foo.bar').from('baz');
  t.is(builder.toSql(), 'select "x"."y" as "foo.bar" from "baz"');
});

test('testAliasWrappingWithSpacesInDatabaseName', t => {
  const builder = getBuilder();

  builder.select('w x.y.z as foo.bar').from('baz');
  t.is(builder.toSql(), 'select "w x"."y"."z" as "foo.bar" from "baz"');
});

test('testAddingSelects', t => {
  const builder = getBuilder();

  builder
    .select('foo')
    .addSelect('bar')
    .addSelect(['baz', 'boom'])
    .from('users');
  t.is(builder.toSql(), 'select "foo", "bar", "baz", "boom" from "users"');
});

test('testBasicSelectWithPrefix', t => {
  const builder = getBuilder();

  builder.getGrammar().setTablePrefix('prefix_');
  builder.select('*').from('users');
  t.is(builder.toSql(), 'select * from "prefix_users"');
});

test('testBasicSelectDistinct', t => {
  const builder = getBuilder();

  builder.distinct().select('foo', 'bar').from('users');
  t.is(builder.toSql(), 'select distinct "foo", "bar" from "users"');
});

test('testBasicSelectDistinctOnColumns', t => {
  let builder = getBuilder();
  builder.distinct('foo').select('foo', 'bar').from('users');
  t.is(builder.toSql(), 'select distinct "foo", "bar" from "users"');

  builder = getPostgresBuilder();
  builder.distinct('foo').select('foo', 'bar').from('users');
  t.is(builder.toSql(), 'select distinct on ("foo") "foo", "bar" from "users"');
});

test('testBasicAlias', t => {
  const builder = getBuilder();

  builder.select('foo as bar').from('users');
  t.is(builder.toSql(), 'select "foo" as "bar" from "users"');
});

test('testAliasWithPrefix', t => {
  const builder = getBuilder();

  builder.getGrammar().setTablePrefix('prefix_');
  builder.select('*').from('users as people');
  t.is(builder.toSql(), 'select * from "prefix_users" as "prefix_people"');
});

test('testJoinAliasesWithPrefix', t => {
  const builder = getBuilder();

  builder.getGrammar().setTablePrefix('prefix_');
  builder
    .select('*')
    .from('services')
    .join('translations AS t', 't.item_id', '=', 'services.id');
  t.is(
    builder.toSql(),
    'select * from "prefix_services" inner join "prefix_translations" as "prefix_t" on "prefix_t"."item_id" = "prefix_services"."id"'
  );
});

test('testBasicTableWrapping', t => {
  const builder = getBuilder();

  builder.select('*').from('public.users');
  t.is(builder.toSql(), 'select * from "public"."users"');
});

test('testWhenCallback', t => {
  const callback = (query: Builder, condition: boolean) => {
    t.true(condition);

    query.where('id', '=', 1);
  };

  let builder = getBuilder();
  builder.select('*').from('users').when(true, callback).where('email', 'foo');
  t.is(builder.toSql(), 'select * from "users" where "id" = ? and "email" = ?');

  builder = getBuilder();
  builder.select('*').from('users').when(false, callback).where('email', 'foo');
  t.is(builder.toSql(), 'select * from "users" where "email" = ?');
});

test('testWhenCallbackWithReturn', t => {
  const callback = (query: Builder, condition: boolean) => {
    t.true(condition);

    return query.where('id', '=', 1);
  };

  let builder = getBuilder();
  builder.select('*').from('users').when(true, callback).where('email', 'foo');
  t.is(builder.toSql(), 'select * from "users" where "id" = ? and "email" = ?');

  builder = getBuilder();
  builder.select('*').from('users').when(false, callback).where('email', 'foo');
  t.is(builder.toSql(), 'select * from "users" where "email" = ?');
});

test('testWhenCallbackWithDefault', t => {
  const callback = (query: Builder, condition: string) => {
    t.is(condition, 'truthy');

    query.where('id', '=', 1);
  };

  const defaultCallback = (query: Builder, condition: number) => {
    t.is(condition, 0);

    query.where('id', '=', 2);
  };

  let builder = getBuilder();
  builder
    .select('*')
    .from('users')
    .when('truthy', callback, defaultCallback)
    .where('email', 'foo');
  t.is(builder.toSql(), 'select * from "users" where "id" = ? and "email" = ?');
  t.deepEqual(builder.getBindings(), [1, 'foo']);

  builder = getBuilder();
  builder
    .select('*')
    .from('users')
    .when(0, callback, defaultCallback)
    .where('email', 'foo');
  t.is(builder.toSql(), 'select * from "users" where "id" = ? and "email" = ?');
  t.deepEqual(builder.getBindings(), [2, 'foo']);
});

test('testUnlessCallback', t => {
  const callback = (query: Builder, condition: boolean) => {
    t.false(condition);

    query.where('id', '=', 1);
  };

  let builder = getBuilder();
  builder
    .select('*')
    .from('users')
    .unless(false, callback)
    .where('email', 'foo');
  t.is(builder.toSql(), 'select * from "users" where "id" = ? and "email" = ?');

  builder = getBuilder();
  builder
    .select('*')
    .from('users')
    .unless(true, callback)
    .where('email', 'foo');
  t.is(builder.toSql(), 'select * from "users" where "email" = ?');
});

test('testUnlessCallbackWithReturn', t => {
  const callback = (query: Builder, condition: boolean) => {
    t.false(condition);

    return query.where('id', '=', 1);
  };

  let builder = getBuilder();
  builder
    .select('*')
    .from('users')
    .unless(false, callback)
    .where('email', 'foo');
  t.is(builder.toSql(), 'select * from "users" where "id" = ? and "email" = ?');

  builder = getBuilder();
  builder
    .select('*')
    .from('users')
    .unless(true, callback)
    .where('email', 'foo');
  t.is(builder.toSql(), 'select * from "users" where "email" = ?');
});

test('testUnlessCallbackWithDefault', t => {
  const callback = (query: Builder, condition: number) => {
    t.is(condition, 0);

    query.where('id', '=', 1);
  };

  const defaultCallback = (query: Builder, condition: String) => {
    t.is(condition, 'truthy');

    query.where('id', '=', 2);
  };

  let builder = getBuilder();
  builder
    .select('*')
    .from('users')
    .unless(0, callback, defaultCallback)
    .where('email', 'foo');
  t.is(builder.toSql(), 'select * from "users" where "id" = ? and "email" = ?');
  t.deepEqual(builder.getBindings(), [1, 'foo']);

  builder = getBuilder();
  builder
    .select('*')
    .from('users')
    .unless('truthy', callback, defaultCallback)
    .where('email', 'foo');
  t.is(builder.toSql(), 'select * from "users" where "id" = ? and "email" = ?');
  t.deepEqual(builder.getBindings(), [2, 'foo']);
});

test('testTapCallback', t => {
  const callback = (query: Builder) => query.where('id', '=', 1);

  const builder = getBuilder();
  builder.select('*').from('users').tap(callback).where('email', 'foo');
  t.is(builder.toSql(), 'select * from "users" where "id" = ? and "email" = ?');
});

test('testBasicWheres', t => {
  const builder = getBuilder();
  builder.select('*').from('users').where('id', '=', 1);
  t.is(builder.toSql(), 'select * from "users" where "id" = ?');
  t.deepEqual(builder.getBindings(), [1]);
});

test('testWheresWithArrayValue', t => {
  let builder = getBuilder();
  builder.select('*').from('users').where('id', [12]);
  t.is(builder.toSql(), 'select * from "users" where "id" = ?');
  t.deepEqual(builder.getBindings(), [12]);

  builder = getBuilder();
  builder.select('*').from('users').where('id', '=', [12, 30]);
  t.is(builder.toSql(), 'select * from "users" where "id" = ?');
  t.deepEqual(builder.getBindings(), [12]);

  builder = getBuilder();
  builder.select('*').from('users').where('id', '!=', [12, 30]);
  t.is(builder.toSql(), 'select * from "users" where "id" != ?');
  t.deepEqual(builder.getBindings(), [12]);

  builder = getBuilder();
  builder.select('*').from('users').where('id', '<>', [12, 30]);
  t.is(builder.toSql(), 'select * from "users" where "id" <> ?');
  t.deepEqual(builder.getBindings(), [12]);

  builder = getBuilder();
  builder
    .select('*')
    .from('users')
    .where('id', '=', [[12, 30]]);
  t.is(builder.toSql(), 'select * from "users" where "id" = ?');
  t.deepEqual(builder.getBindings(), [12]);
});

test('testMySqlWrappingProtectsQuotationMarks', t => {
  const builder = getMySqlBuilder();
  builder.select('*').from('some`table');
  t.is(builder.toSql(), 'select * from `some``table`');
});

test('testDateBasedWheresAcceptsTwoArguments', t => {
  let builder = getMySqlBuilder();
  builder.select('*').from('users').whereDate('created_at', 1);
  t.is(builder.toSql(), 'select * from `users` where date(`created_at`) = ?');

  builder = getMySqlBuilder();
  builder.select('*').from('users').whereDay('created_at', 1);
  t.is(builder.toSql(), 'select * from `users` where day(`created_at`) = ?');

  builder = getMySqlBuilder();
  builder.select('*').from('users').whereMonth('created_at', 1);
  t.is(builder.toSql(), 'select * from `users` where month(`created_at`) = ?');

  builder = getMySqlBuilder();
  builder.select('*').from('users').whereYear('created_at', 1);
  t.is(builder.toSql(), 'select * from `users` where year(`created_at`) = ?');
});

test('testDateBasedOrWheresAcceptsTwoArguments', t => {
  let builder = getMySqlBuilder();
  builder.select('*').from('users').where('id', 1).orWhereDate('created_at', 1);
  t.is(
    builder.toSql(),
    'select * from `users` where `id` = ? or date(`created_at`) = ?'
  );

  builder = getMySqlBuilder();
  builder.select('*').from('users').where('id', 1).orWhereDay('created_at', 1);
  t.is(
    builder.toSql(),
    'select * from `users` where `id` = ? or day(`created_at`) = ?'
  );

  builder = getMySqlBuilder();
  builder
    .select('*')
    .from('users')
    .where('id', 1)
    .orWhereMonth('created_at', 1);
  t.is(
    builder.toSql(),
    'select * from `users` where `id` = ? or month(`created_at`) = ?'
  );

  builder = getMySqlBuilder();
  builder.select('*').from('users').where('id', 1).orWhereYear('created_at', 1);
  t.is(
    builder.toSql(),
    'select * from `users` where `id` = ? or year(`created_at`) = ?'
  );
});

test('testDateBasedWheresExpressionIsNotBound', t => {
  let builder = getBuilder();
  builder
    .select('*')
    .from('users')
    .whereDate('created_at', new Raw('NOW()'))
    .where('admin', true);
  t.deepEqual(builder.getBindings(), [true]);

  builder = getBuilder();
  builder.select('*').from('users').whereDay('created_at', new Raw('NOW()'));
  t.deepEqual(builder.getBindings(), []);

  builder = getBuilder();
  builder.select('*').from('users').whereMonth('created_at', new Raw('NOW()'));
  t.deepEqual(builder.getBindings(), []);

  builder = getBuilder();
  builder.select('*').from('users').whereYear('created_at', new Raw('NOW()'));
  t.deepEqual(builder.getBindings(), []);
});

test('testWhereDateMySql', t => {
  let builder = getMySqlBuilder();
  builder.select('*').from('users').whereDate('created_at', '=', '2015-12-21');
  t.is(builder.toSql(), 'select * from `users` where date(`created_at`) = ?');
  t.deepEqual(builder.getBindings(), ['2015-12-21']);

  builder = getMySqlBuilder();
  builder
    .select('*')
    .from('users')
    .whereDate('created_at', '=', new Raw('NOW()'));
  t.is(
    builder.toSql(),
    'select * from `users` where date(`created_at`) = NOW()'
  );
});

test('testWhereDayMySql', t => {
  const builder = getMySqlBuilder();
  builder.select('*').from('users').whereDay('created_at', '=', 1);
  t.is(builder.toSql(), 'select * from `users` where day(`created_at`) = ?');
  t.deepEqual(builder.getBindings(), [1]);
});

test('testOrWhereDayMySql', t => {
  const builder = getMySqlBuilder();
  builder
    .select('*')
    .from('users')
    .whereDay('created_at', '=', 1)
    .orWhereDay('created_at', '=', 2);
  t.is(
    builder.toSql(),
    'select * from `users` where day(`created_at`) = ? or day(`created_at`) = ?'
  );
  t.deepEqual(builder.getBindings(), [1, 2]);
});

test('testWhereMonthMySql', t => {
  const builder = getMySqlBuilder();
  builder.select('*').from('users').whereMonth('created_at', '=', 5);
  t.is(builder.toSql(), 'select * from `users` where month(`created_at`) = ?');
  t.deepEqual(builder.getBindings(), [5]);
});

test('testOrWhereMonthMySql', t => {
  const builder = getMySqlBuilder();
  builder
    .select('*')
    .from('users')
    .whereMonth('created_at', '=', 5)
    .orWhereMonth('created_at', '=', 6);
  t.is(
    builder.toSql(),
    'select * from `users` where month(`created_at`) = ? or month(`created_at`) = ?'
  );
  t.deepEqual(builder.getBindings(), [5, 6]);
});

test('testWhereYearMySql', t => {
  const builder = getMySqlBuilder();
  builder.select('*').from('users').whereYear('created_at', '=', 2014);
  t.is(builder.toSql(), 'select * from `users` where year(`created_at`) = ?');
  t.deepEqual(builder.getBindings(), [2014]);
});

test('testOrWhereYearMySql', t => {
  const builder = getMySqlBuilder();
  builder
    .select('*')
    .from('users')
    .whereYear('created_at', '=', 2014)
    .orWhereYear('created_at', '=', 2015);
  t.is(
    builder.toSql(),
    'select * from `users` where year(`created_at`) = ? or year(`created_at`) = ?'
  );
  t.deepEqual(builder.getBindings(), [2014, 2015]);
});

test('testWhereTimeMySql', t => {
  const builder = getMySqlBuilder();
  builder.select('*').from('users').whereTime('created_at', '>=', '22:00');
  t.is(builder.toSql(), 'select * from `users` where time(`created_at`) >= ?');
  t.deepEqual(builder.getBindings(), ['22:00']);
});

test('testWhereTimeOperatorOptionalMySql', t => {
  const builder = getMySqlBuilder();
  builder.select('*').from('users').whereTime('created_at', '22:00');
  t.is(builder.toSql(), 'select * from `users` where time(`created_at`) = ?');
  t.deepEqual(builder.getBindings(), ['22:00']);
});

test('testWhereTimeOperatorOptionalPostgres', t => {
  const builder = getPostgresBuilder();
  builder.select('*').from('users').whereTime('created_at', '22:00');
  t.is(builder.toSql(), 'select * from "users" where "created_at"::time = ?');
  t.deepEqual(builder.getBindings(), ['22:00']);
});

test('testWhereDatePostgres', t => {
  let builder = getPostgresBuilder();
  builder.select('*').from('users').whereDate('created_at', '=', '2015-12-21');
  t.is(builder.toSql(), 'select * from "users" where "created_at"::date = ?');
  t.deepEqual(builder.getBindings(), ['2015-12-21']);

  builder = getPostgresBuilder();
  builder.select('*').from('users').whereDate('created_at', new Raw('NOW()'));
  t.is(
    builder.toSql(),
    'select * from "users" where "created_at"::date = NOW()'
  );
});

test('testWhereDayPostgres', t => {
  const builder = getPostgresBuilder();
  builder.select('*').from('users').whereDay('created_at', '=', 1);
  t.is(
    builder.toSql(),
    'select * from "users" where extract(day from "created_at") = ?'
  );
  t.deepEqual(builder.getBindings(), [1]);
});

test('testWhereMonthPostgres', t => {
  const builder = getPostgresBuilder();
  builder.select('*').from('users').whereMonth('created_at', '=', 5);
  t.is(
    builder.toSql(),
    'select * from "users" where extract(month from "created_at") = ?'
  );
  t.deepEqual(builder.getBindings(), [5]);
});

test('testWhereYearPostgres', t => {
  const builder = getPostgresBuilder();
  builder.select('*').from('users').whereYear('created_at', '=', 2014);
  t.is(
    builder.toSql(),
    'select * from "users" where extract(year from "created_at") = ?'
  );
  t.deepEqual(builder.getBindings(), [2014]);
});

test('testWhereTimePostgres', t => {
  const builder = getPostgresBuilder();
  builder.select('*').from('users').whereTime('created_at', '>=', '22:00');
  t.is(builder.toSql(), 'select * from "users" where "created_at"::time >= ?');
  t.deepEqual(builder.getBindings(), ['22:00']);
});

test('testWhereLikePostgres', t => {
  let builder = getPostgresBuilder();
  builder.select('*').from('users').where('id', 'like', '1');
  t.is(builder.toSql(), 'select * from "users" where "id"::text like ?');
  t.deepEqual(builder.getBindings(), ['1']);

  builder = getPostgresBuilder();
  builder.select('*').from('users').where('id', 'LIKE', '1');
  t.is(builder.toSql(), 'select * from "users" where "id"::text LIKE ?');
  t.deepEqual(builder.getBindings(), ['1']);

  builder = getPostgresBuilder();
  builder.select('*').from('users').where('id', 'ilike', '1');
  t.is(builder.toSql(), 'select * from "users" where "id"::text ilike ?');
  t.deepEqual(builder.getBindings(), ['1']);

  builder = getPostgresBuilder();
  builder.select('*').from('users').where('id', 'not like', '1');
  t.is(builder.toSql(), 'select * from "users" where "id"::text not like ?');
  t.deepEqual(builder.getBindings(), ['1']);

  builder = getPostgresBuilder();
  builder.select('*').from('users').where('id', 'not ilike', '1');
  t.is(builder.toSql(), 'select * from "users" where "id"::text not ilike ?');
  t.deepEqual(builder.getBindings(), ['1']);
});

test('testWhereDateSqlite', t => {
  let builder = getSQLiteBuilder();
  builder.select('*').from('users').whereDate('created_at', '=', '2015-12-21');
  t.is(
    builder.toSql(),
    'select * from "users" where strftime(\'%Y-%m-%d\', "created_at") = cast(? as text)'
  );
  t.deepEqual(builder.getBindings(), ['2015-12-21']);

  builder = getSQLiteBuilder();
  builder.select('*').from('users').whereDate('created_at', new Raw('NOW()'));
  t.is(
    builder.toSql(),
    'select * from "users" where strftime(\'%Y-%m-%d\', "created_at") = cast(NOW() as text)'
  );
});

test('testWhereDaySqlite', t => {
  const builder = getSQLiteBuilder();
  builder.select('*').from('users').whereDay('created_at', '=', 1);
  t.is(
    builder.toSql(),
    'select * from "users" where strftime(\'%d\', "created_at") = cast(? as text)'
  );
  t.deepEqual(builder.getBindings(), [1]);
});

test('testWhereMonthSqlite', t => {
  const builder = getSQLiteBuilder();
  builder.select('*').from('users').whereMonth('created_at', '=', 5);
  t.is(
    builder.toSql(),
    'select * from "users" where strftime(\'%m\', "created_at") = cast(? as text)'
  );
  t.deepEqual(builder.getBindings(), [5]);
});

test('testWhereYearSqlite', t => {
  const builder = getSQLiteBuilder();
  builder.select('*').from('users').whereYear('created_at', '=', 2014);
  t.is(
    builder.toSql(),
    'select * from "users" where strftime(\'%Y\', "created_at") = cast(? as text)'
  );
  t.deepEqual(builder.getBindings(), [2014]);
});

test('testWhereTimeSqlite', t => {
  const builder = getSQLiteBuilder();
  builder.select('*').from('users').whereTime('created_at', '>=', '22:00');
  t.is(
    builder.toSql(),
    'select * from "users" where strftime(\'%H:%M:%S\', "created_at") >= cast(? as text)'
  );
  t.deepEqual(builder.getBindings(), ['22:00']);
});

test('testWhereTimeOperatorOptionalSqlite', t => {
  const builder = getSQLiteBuilder();
  builder.select('*').from('users').whereTime('created_at', '22:00');
  t.is(
    builder.toSql(),
    'select * from "users" where strftime(\'%H:%M:%S\', "created_at") = cast(? as text)'
  );
  t.deepEqual(builder.getBindings(), [5]);
});

test('testWhereTimeSqlServer', t => {
  let builder = getSqlServerBuilder();
  builder.select('*').from('users').whereTime('created_at', '22:00');
  t.is(
    builder.toSql(),
    'select * from [users] where cast([created_at] as time) = ?'
  );
  t.deepEqual(builder.getBindings(), [5]);

  builder = getSqlServerBuilder();
  builder.select('*').from('users').whereTime('created_at', new Raw('NOW()'));
  t.is(
    builder.toSql(),
    'select * from [users] where cast([created_at] as time) = NOW()'
  );
  t.deepEqual(builder.getBindings(), []);
});

test('testWhereDateSqlServer', t => {
  let builder = getSqlServerBuilder();
  builder.select('*').from('users').whereDate('created_at', '=', '2015-12-21');
  t.is(
    builder.toSql(),
    'select * from [users] where cast([created_at] as date) = ?'
  );
  t.deepEqual(builder.getBindings(), ['2015-12-21']);

  builder = getSqlServerBuilder();
  builder.select('*').from('users').whereDate('created_at', new Raw('NOW()'));
  t.is(
    builder.toSql(),
    'select * from [users] where cast([created_at] as date) = NOW()'
  );
});

test('testWhereDaySqlServer', t => {
  const builder = getSqlServerBuilder();
  builder.select('*').from('users').whereDay('created_at', '=', 1);
  t.is(builder.toSql(), 'select * from [users] where day([created_at]) = ?');
  t.deepEqual(builder.getBindings(), [1]);
});

test('testWhereMonthSqlServer', t => {
  const builder = getSqlServerBuilder();
  builder.select('*').from('users').whereMonth('created_at', '=', 5);
  t.is(builder.toSql(), 'select * from [users] where month([created_at]) = ?');
  t.deepEqual(builder.getBindings(), [5]);
});

test('testWhereYearSqlServer', t => {
  const builder = getSqlServerBuilder();
  builder.select('*').from('users').whereYear('created_at', '=', 2014);
  t.is(builder.toSql(), 'select * from [users] where year([created_at]) = ?');
  t.deepEqual(builder.getBindings(), [2014]);
});

test('testWhereBetweens', t => {
  let builder = getBuilder();
  builder.select('*').from('users').whereBetween('id', [1, 2]);
  t.is(builder.toSql(), 'select * from "users" where "id" between ? and ?');
  t.deepEqual(builder.getBindings(), [1, 2]);

  builder = getBuilder();
  builder
    .select('*')
    .from('users')
    .whereBetween('id', [[1, 2, 3]]);
  t.is(builder.toSql(), 'select * from "users" where "id" between ? and ?');
  t.deepEqual(builder.getBindings(), [1, 2]);

  builder = getBuilder();
  builder
    .select('*')
    .from('users')
    .whereBetween('id', [[1], [2, 3]]);
  t.is(builder.toSql(), 'select * from "users" where "id" between ? and ?');
  t.deepEqual(builder.getBindings(), [1, 2]);

  builder = getBuilder();
  builder.select('*').from('users').whereNotBetween('id', [1, 2]);
  t.is(builder.toSql(), 'select * from "users" where "id" not between ? and ?');
  t.deepEqual(builder.getBindings(), [1, 2]);

  builder = getBuilder();
  builder
    .select('*')
    .from('users')
    .whereBetween('id', [new Raw(1), new Raw(2)]);
  t.is(builder.toSql(), 'select * from "users" where "id" between 1 and 2');
  t.deepEqual(builder.getBindings(), []);
});

test('testWhereBetweenColumns', t => {
  let builder = getBuilder();
  builder
    .select('*')
    .from('users')
    .whereBetweenColumns('id', ['users.created_at', 'users.updated_at']);
  t.is(
    builder.toSql(),
    'select * from "users" where "id" between "users"."created_at" and "users"."updated_at"'
  );
  t.deepEqual(builder.getBindings(), []);

  builder = getBuilder();
  builder
    .select('*')
    .from('users')
    .whereNotBetweenColumns('id', ['created_at', 'updated_at']);
  t.is(
    builder.toSql(),
    'select * from "users" where "id" not between "created_at" and "updated_at"'
  );
  t.deepEqual(builder.getBindings(), []);

  builder = getBuilder();
  builder
    .select('*')
    .from('users')
    .whereBetweenColumns('id', [new Raw(1), new Raw(2)]);
  t.is(builder.toSql(), 'select * from "users" where "id" between 1 and 2');
  t.deepEqual(builder.getBindings(), []);
});

test('testBasicOrWheres', t => {
  const builder = getBuilder();
  builder
    .select('*')
    .from('users')
    .where('id', '=', 1)
    .orWhere('email', '=', 'foo');
  t.is(builder.toSql(), 'select * from "users" where "id" = ? or "email" = ?');
  t.deepEqual(builder.getBindings(), [1, 'foo']);
});

test('testRawWheres', t => {
  const builder = getBuilder();
  builder.select('*').from('users').whereRaw('id = ? or email = ?', [1, 'foo']);
  t.is(builder.toSql(), 'select * from "users" where id = ? or email = ?');
  t.deepEqual(builder.getBindings(), [1, 'foo']);
});

test('testRawOrWheres', t => {
  const builder = getBuilder();
  builder
    .select('*')
    .from('users')
    .where('id', '=', 1)
    .orWhereRaw('email = ?', ['foo']);
  t.is(builder.toSql(), 'select * from "users" where "id" = ? or email = ?');
  t.deepEqual(builder.getBindings(), [1, 'foo']);
});

test('testBasicWhereIns', t => {
  let builder = getBuilder();
  builder.select('*').from('users').whereIn('id', [1, 2, 3]);
  t.is(builder.toSql(), 'select * from "users" where "id" in (?, ?, ?)');
  t.deepEqual(builder.getBindings(), [1, 2, 3]);

  builder = getBuilder();
  builder
    .select('*')
    .from('users')
    .where('id', '=', 1)
    .orWhereIn('id', [1, 2, 3]);
  t.is(
    builder.toSql(),
    'select * from "users" where "id" = ? or "id" in (?, ?, ?)'
  );
  t.deepEqual(builder.getBindings(), [1, 1, 2, 3]);
});

test('testBasicWhereNotIns', t => {
  let builder = getBuilder();
  builder.select('*').from('users').whereNotIn('id', [1, 2, 3]);
  t.is(builder.toSql(), 'select * from "users" where "id" not in (?, ?, ?)');
  t.deepEqual(builder.getBindings(), [1, 2, 3]);

  builder = getBuilder();
  builder
    .select('*')
    .from('users')
    .where('id', '=', 1)
    .orWhereNotIn('id', [1, 2, 3]);
  t.is(
    builder.toSql(),
    'select * from "users" where "id" = ? or "id" not in (?, ?, ?)'
  );
  t.deepEqual(builder.getBindings(), [1, 1, 2, 3]);
});

test('testRawWhereIns', t => {
  let builder = getBuilder();
  builder
    .select('*')
    .from('users')
    .whereIn('id', [new Raw(1)]);
  t.is(builder.toSql(), 'select * from "users" where "id" in (1)');

  builder = getBuilder();
  builder
    .select('*')
    .from('users')
    .where('id', '=', 1)
    .orWhereIn('id', [new Raw(1)]);
  t.is(builder.toSql(), 'select * from "users" where "id" = ? or "id" in (1)');
  t.deepEqual(builder.getBindings(), [1]);
});

test('testEmptyWhereIns', t => {
  let builder = getBuilder();
  builder.select('*').from('users').whereIn('id', []);
  t.is(builder.toSql(), 'select * from "users" where 0 = 1');
  t.deepEqual(builder.getBindings(), []);

  builder = getBuilder();
  builder.select('*').from('users').where('id', '=', 1).orWhereIn('id', []);
  t.is(builder.toSql(), 'select * from "users" where "id" = ? or 0 = 1');
  t.deepEqual(builder.getBindings(), [1]);
});

test('testEmptyWhereNotIns', t => {
  let builder = getBuilder();
  builder.select('*').from('users').whereNotIn('id', []);
  t.is(builder.toSql(), 'select * from "users" where 1 = 1');
  t.deepEqual(builder.getBindings(), []);

  builder = getBuilder();
  builder.select('*').from('users').where('id', '=', 1).orWhereNotIn('id', []);
  t.is(builder.toSql(), 'select * from "users" where "id" = ? or 1 = 1');
  t.deepEqual(builder.getBindings(), [1]);
});

test('testWhereIntegerInRaw', t => {
  const builder = getBuilder();
  builder.select('*').from('users').whereIntegerInRaw('id', ['1a', 2]);
  t.is(builder.toSql(), 'select * from "users" where "id" in (1, 2)');
  t.deepEqual(builder.getBindings(), []);
});

test('testOrWhereIntegerInRaw', t => {
  const builder = getBuilder();
  builder
    .select('*')
    .from('users')
    .where('id', '=', 1)
    .orWhereIntegerInRaw('id', ['1a', 2]);
  t.is(
    builder.toSql(),
    'select * from "users" where "id" = ? or "id" in (1, 2)'
  );
  t.deepEqual(builder.getBindings(), [1]);
});

test('testWhereIntegerNotInRaw', t => {
  const builder = getBuilder();
  builder.select('*').from('users').whereIntegerNotInRaw('id', ['1a', 2]);
  t.is(builder.toSql(), 'select * from "users" where "id" not in (1, 2)');
  t.deepEqual(builder.getBindings(), []);
});

test('testOrWhereIntegerNotInRaw', t => {
  const builder = getBuilder();
  builder
    .select('*')
    .from('users')
    .where('id', '=', 1)
    .orWhereIntegerNotInRaw('id', ['1a', 2]);
  t.is(
    builder.toSql(),
    'select * from "users" where "id" = ? or "id" not in (1, 2)'
  );
  t.deepEqual(builder.getBindings(), [1]);
});

test('testEmptyWhereIntegerInRaw', t => {
  const builder = getBuilder();
  builder.select('*').from('users').whereIntegerInRaw('id', []);
  t.is(builder.toSql(), 'select * from "users" where 0 = 1');
  t.deepEqual(builder.getBindings(), []);
});

test('testEmptyWhereIntegerNotInRaw', t => {
  const builder = getBuilder();
  builder.select('*').from('users').whereIntegerNotInRaw('id', []);
  t.is(builder.toSql(), 'select * from "users" where 1 = 1');
  t.deepEqual(builder.getBindings(), []);
});

test('testBasicWhereColumn', t => {
  let builder = getBuilder();
  builder
    .select('*')
    .from('users')
    .whereColumn('first_name', 'last_name')
    .orWhereColumn('first_name', 'middle_name');
  t.is(
    builder.toSql(),
    'select * from "users" where "first_name" = "last_name" or "first_name" = "middle_name"'
  );
  t.deepEqual(builder.getBindings(), []);

  builder = getBuilder();
  builder
    .select('*')
    .from('users')
    .whereColumn('updated_at', '>', 'created_at');
  t.is(
    builder.toSql(),
    'select * from "users" where "updated_at" > "created_at"'
  );
  t.deepEqual(builder.getBindings(), []);
});

test('testArrayWhereColumn', t => {
  const conditions = [
    ['first_name', 'last_name'],
    ['updated_at', '>', 'created_at'],
  ];

  const builder = getBuilder();
  builder.select('*').from('users').whereColumn(conditions);
  t.is(
    builder.toSql(),
    'select * from "users" where ("first_name" = "last_name" and "updated_at" > "created_at")'
  );
  t.deepEqual(builder.getBindings(), []);
});

test('testUnions', t => {
  let builder = getBuilder();
  builder.select('*').from('users').where('id', '=', 1);
  builder.union(getBuilder().select('*').from('users').where('id', '=', 2));
  t.is(
    builder.toSql(),
    '(select * from "users" where "id" = ?) union (select * from "users" where "id" = ?)'
  );
  t.deepEqual(builder.getBindings(), [1, 2]);

  builder = getMySqlBuilder();
  builder.select('*').from('users').where('id', '=', 1);
  builder.union(
    getMySqlBuilder().select('*').from('users').where('id', '=', 2)
  );
  t.is(
    builder.toSql(),
    '(select * from `users` where `id` = ?) union (select * from `users` where `id` = ?)'
  );
  t.deepEqual(builder.getBindings(), [1, 2]);

  builder = getMySqlBuilder();
  let expectedSql =
    '(select `a` from `t1` where `a` = ? and `b` = ?) union (select `a` from `t2` where `a` = ? and `b` = ?) order by `a` asc limit 10';
  const union = getMySqlBuilder()
    .select('a')
    .from('t2')
    .where('a', 11)
    .where('b', 2);
  builder
    .select('a')
    .from('t1')
    .where('a', 10)
    .where('b', 1)
    .union(union)
    .orderBy('a')
    .limit(10);
  t.deepEqual(builder.toSql(), expectedSql);
  t.deepEqual(builder.getBindings(), [10, 1, 11, 2]);

  builder = getPostgresBuilder();
  expectedSql =
    '(select "name" from "users" where "id" = ?) union (select "name" from "users" where "id" = ?)';
  builder.select('name').from('users').where('id', '=', 1);
  builder.union(
    getPostgresBuilder().select('name').from('users').where('id', '=', 2)
  );
  t.deepEqual(builder.toSql(), expectedSql);
  t.deepEqual(builder.getBindings(), [1, 2]);

  builder = getSQLiteBuilder();
  expectedSql =
    'select * from (select "name" from "users" where "id" = ?) union select * from (select "name" from "users" where "id" = ?)';
  builder.select('name').from('users').where('id', '=', 1);
  builder.union(
    getSQLiteBuilder().select('name').from('users').where('id', '=', 2)
  );
  t.deepEqual(builder.toSql(), expectedSql);
  t.deepEqual(builder.getBindings(), [1, 2]);

  builder = getSqlServerBuilder();
  expectedSql =
    'select * from (select [name] from [users] where [id] = ?) as [temp_table] union select * from (select [name] from [users] where [id] = ?) as [temp_table]';
  builder.select('name').from('users').where('id', '=', 1);
  builder.union(
    getSqlServerBuilder().select('name').from('users').where('id', '=', 2)
  );
  t.deepEqual(builder.toSql(), expectedSql);
  t.deepEqual(builder.getBindings(), [1, 2]);
});

test('testUnionAlls', t => {
  let builder = getBuilder();
  builder.select('*').from('users').where('id', '=', 1);
  builder.unionAll(getBuilder().select('*').from('users').where('id', '=', 2));
  t.is(
    builder.toSql(),
    '(select * from "users" where "id" = ?) union all (select * from "users" where "id" = ?)'
  );
  t.deepEqual(builder.getBindings(), [1, 2]);

  const expectedSql =
    '(select * from "users" where "id" = ?) union all (select * from "users" where "id" = ?)';
  builder = getPostgresBuilder();
  builder.select('*').from('users').where('id', '=', 1);
  builder.unionAll(getBuilder().select('*').from('users').where('id', '=', 2));
  t.is(expectedSql, builder.toSql());
  t.deepEqual(builder.getBindings(), [1, 2]);
});

test('testMultipleUnions', t => {
  const builder = getBuilder();
  builder.select('*').from('users').where('id', '=', 1);
  builder.union(getBuilder().select('*').from('users').where('id', '=', 2));
  builder.union(getBuilder().select('*').from('users').where('id', '=', 3));
  t.is(
    builder.toSql(),
    '(select * from "users" where "id" = ?) union (select * from "users" where "id" = ?) union (select * from "users" where "id" = ?)'
  );
  t.deepEqual(builder.getBindings(), [1, 2, 3]);
});

test('testMultipleUnionAlls', t => {
  const builder = getBuilder();
  builder.select('*').from('users').where('id', '=', 1);
  builder.unionAll(getBuilder().select('*').from('users').where('id', '=', 2));
  builder.unionAll(getBuilder().select('*').from('users').where('id', '=', 3));
  t.is(
    builder.toSql(),
    '(select * from "users" where "id" = ?) union all (select * from "users" where "id" = ?) union all (select * from "users" where "id" = ?)'
  );
  t.deepEqual(builder.getBindings(), [1, 2, 3]);
});

test('testUnionOrderBys', t => {
  const builder = getBuilder();
  builder.select('*').from('users').where('id', '=', 1);
  builder.union(getBuilder().select('*').from('users').where('id', '=', 2));
  builder.orderBy('id', 'desc');
  t.is(
    builder.toSql(),
    '(select * from "users" where "id" = ?) union (select * from "users" where "id" = ?) order by "id" desc'
  );
  t.deepEqual(builder.getBindings(), [1, 2]);
});

test('testUnionLimitsAndOffsets', t => {
  let builder = getBuilder();
  builder.select('*').from('users');
  builder.union(getBuilder().select('*').from('dogs'));
  builder.skip(5).take(10);
  t.is(
    builder.toSql(),
    '(select * from "users") union (select * from "dogs") limit 10 offset 5'
  );

  let expectedSql =
    '(select * from "users") union (select * from "dogs") limit 10 offset 5';
  builder = getPostgresBuilder();
  builder.select('*').from('users');
  builder.union(getBuilder().select('*').from('dogs'));
  builder.skip(5).take(10);
  t.is(builder.toSql(), expectedSql);

  expectedSql =
    '(select * from "users" limit 11) union (select * from "dogs" limit 22) limit 10 offset 5';
  builder = getPostgresBuilder();
  builder.select('*').from('users').limit(11);
  builder.union(getBuilder().select('*').from('dogs').limit(22));
  builder.skip(5).take(10);
  t.is(builder.toSql(), expectedSql);
});

test('testUnionWithJoin', t => {
  const builder = getBuilder();
  builder.select('*').from('users');
  builder.union(
    getBuilder()
      .select('*')
      .from('dogs')
      .join('breeds', (join: JoinClause) => {
        join
          .on('dogs.breed_id', '=', 'breeds.id')
          .where('breeds.is_native', '=', 1);
      })
  );
  t.is(
    builder.toSql(),
    '(select * from "users") union (select * from "dogs" inner join "breeds" on "dogs"."breed_id" = "breeds"."id" and "breeds"."is_native" = ?)'
  );
  t.deepEqual(builder.getBindings(), [1]);
});

test('testMySqlUnionOrderBys', t => {
  const builder = getMySqlBuilder();
  builder.select('*').from('users').where('id', '=', 1);
  builder.union(
    getMySqlBuilder().select('*').from('users').where('id', '=', 2)
  );
  builder.orderBy('id', 'desc');
  t.is(
    builder.toSql(),
    '(select * from `users` where `id` = ?) union (select * from `users` where `id` = ?) order by `id` desc'
  );
  t.deepEqual(builder.getBindings(), [1, 2]);
});

test('testMySqlUnionLimitsAndOffsets', t => {
  const builder = getMySqlBuilder();
  builder.select('*').from('users');
  builder.union(getMySqlBuilder().select('*').from('dogs'));
  builder.skip(5).take(10);
  t.is(
    builder.toSql(),
    '(select * from `users`) union (select * from `dogs`) limit 10 offset 5'
  );
});

test('testUnionAggregate', t => {
  let expected =
    'select count(*) as aggregate from ((select * from `posts`) union (select * from `videos`)) as `temp_table`';
  let builder = getMySqlBuilder();
  let processorMock = createMock(builder.getProcessor());
  let connectionMock = createMock(builder.getConnection());
  connectionMock.expects('select').once().withArgs(expected, []);
  processorMock.expects('processSelect').once();
  builder.from('posts').union(getMySqlBuilder().from('videos')).count();

  expected =
    'select count(*) as aggregate from ((select `id` from `posts`) union (select `id` from `videos`)) as `temp_table`';
  builder = getMySqlBuilder();
  processorMock = createMock(builder.getProcessor());
  connectionMock = createMock(builder.getConnection());
  connectionMock.expects('select').once().withArgs(expected, []);
  processorMock.expects('processSelect').once();
  builder
    .from('posts')
    .select('id')
    .union(getMySqlBuilder().from('videos').select('id'))
    .count();

  expected =
    'select count(*) as aggregate from ((select * from "posts") union (select * from "videos")) as "temp_table"';
  builder = getPostgresBuilder();
  processorMock = createMock(builder.getProcessor());
  connectionMock = createMock(builder.getConnection());
  connectionMock.expects('select').once().withArgs(expected, []);
  processorMock.expects('processSelect').once();
  builder.from('posts').union(getPostgresBuilder().from('videos')).count();

  expected =
    'select count(*) as aggregate from (select * from (select * from "posts") union select * from (select * from "videos")) as "temp_table"';
  builder = getSQLiteBuilder();
  processorMock = createMock(builder.getProcessor());
  connectionMock = createMock(builder.getConnection());
  connectionMock.expects('select').once().withArgs(expected, []);
  processorMock.expects('processSelect').once();
  builder.from('posts').union(getSQLiteBuilder().from('videos')).count();

  expected =
    'select count(*) as aggregate from (select * from (select * from [posts]) as [temp_table] union select * from (select * from [videos]) as [temp_table]) as [temp_table]';
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
  const expected =
    'select count(*) as aggregate from (select (select `count(*)` from `videos` where `posts`.`id` = `videos`.`post_id`) as `videos_count` from `posts` having `videos_count` > ?) as `temp_table`';
  const builder = getMySqlBuilder();
  const processorMock = createMock(builder.getProcessor());
  const connectionMock = createMock(builder.getConnection());
  connectionMock.expects('getDatabaseName').twice();
  connectionMock
    .expects('select')
    .once()
    .withArgs(expected, [1])
    .returns([{aggregate: 1}]);
  processorMock
    .expects('processSelect')
    .once()
    .callsFake((query: Builder, results: Array<unknown>) => results);

  builder
    .from('posts')
    .selectSub((query: Builder) => {
      query
        .from('videos')
        .select('count(*)')
        .whereColumn('posts.id', '=', 'videos.post_id');
    }, 'videos_count')
    .having('videos_count', '>', 1);
  builder.count();

  autoVerify();
  t.pass();
});

test('testSubSelectWhereIns', t => {
  let builder = getBuilder();
  builder
    .select('*')
    .from('users')
    .whereIn('id', (query: Builder) => {
      query.select('id').from('users').where('age', '>', 25).take(3);
    });
  t.is(
    builder.toSql(),
    'select * from "users" where "id" in (select "id" from "users" where "age" > ? limit 3)'
  );
  t.deepEqual(builder.getBindings(), [25]);

  builder = getBuilder();
  builder
    .select('*')
    .from('users')
    .whereNotIn('id', (query: Builder) => {
      query.select('id').from('users').where('age', '>', 25).take(3);
    });
  t.is(
    builder.toSql(),
    'select * from "users" where "id" not in (select "id" from "users" where "age" > ? limit 3)'
  );
  t.deepEqual(builder.getBindings(), [25]);
});

test('testBasicWhereNulls', t => {
  let builder = getBuilder();
  builder.select('*').from('users').whereNull('id');
  t.is(builder.toSql(), 'select * from "users" where "id" is null');
  t.deepEqual(builder.getBindings(), []);

  builder = getBuilder();
  builder.select('*').from('users').where('id', '=', 1).orWhereNull('id');
  t.is(builder.toSql(), 'select * from "users" where "id" = ? or "id" is null');
  t.deepEqual(builder.getBindings(), [1]);
});

test('testJsonWhereNullMysql', t => {
  const builder = getMySqlBuilder();
  builder.select('*').from('users').whereNull('items->id');
  t.is(
    builder.toSql(),
    "select * from `users` where (json_extract(`items`, '$.\"id\"') is null OR json_type(json_extract(`items`, '$.\"id\"')) = 'NULL')"
  );
});

test('testJsonWhereNotNullMysql', t => {
  const builder = getMySqlBuilder();
  builder.select('*').from('users').whereNotNull('items->id');
  t.is(
    builder.toSql(),
    "select * from `users` where (json_extract(`items`, '$.\"id\"') is not null AND json_type(json_extract(`items`, '$.\"id\"')) != 'NULL')"
  );
});

test('testArrayWhereNulls', t => {
  let builder = getBuilder();
  builder.select('*').from('users').whereNull(['id', 'expires_at']);
  t.is(
    builder.toSql(),
    'select * from "users" where "id" is null and "expires_at" is null'
  );
  t.deepEqual(builder.getBindings(), []);

  builder = getBuilder();
  builder
    .select('*')
    .from('users')
    .where('id', '=', 1)
    .orWhereNull(['id', 'expires_at']);
  t.is(
    builder.toSql(),
    'select * from "users" where "id" = ? or "id" is null or "expires_at" is null'
  );
  t.deepEqual(builder.getBindings(), [1]);
});

test('testBasicWhereNotNulls', t => {
  let builder = getBuilder();
  builder.select('*').from('users').whereNotNull('id');
  t.is(builder.toSql(), 'select * from "users" where "id" is not null');
  t.deepEqual(builder.getBindings(), []);

  builder = getBuilder();
  builder.select('*').from('users').where('id', '>', 1).orWhereNotNull('id');
  t.is(
    builder.toSql(),
    'select * from "users" where "id" > ? or "id" is not null'
  );
  t.deepEqual(builder.getBindings(), [1]);
});

test('testArrayWhereNotNulls', t => {
  let builder = getBuilder();
  builder.select('*').from('users').whereNotNull(['id', 'expires_at']);
  t.is(
    builder.toSql(),
    'select * from "users" where "id" is not null and "expires_at" is not null'
  );
  t.deepEqual(builder.getBindings(), []);

  builder = getBuilder();
  builder
    .select('*')
    .from('users')
    .where('id', '>', 1)
    .orWhereNotNull(['id', 'expires_at']);
  t.is(
    builder.toSql(),
    'select * from "users" where "id" > ? or "id" is not null or "expires_at" is not null'
  );
  t.deepEqual(builder.getBindings(), [1]);
});

test('testGroupBys', t => {
  let builder = getBuilder();
  builder.select('*').from('users').groupBy('email');
  t.is(builder.toSql(), 'select * from "users" group by "email"');

  builder = getBuilder();
  builder.select('*').from('users').groupBy('id', 'email');
  t.is(builder.toSql(), 'select * from "users" group by "id", "email"');

  builder = getBuilder();
  builder.select('*').from('users').groupBy(['id', 'email']);
  t.is(builder.toSql(), 'select * from "users" group by "id", "email"');

  builder = getBuilder();
  builder.select('*').from('users').groupBy(new Raw('DATE(created_at)'));
  t.is(builder.toSql(), 'select * from "users" group by DATE(created_at)');

  builder = getBuilder();
  builder
    .select('*')
    .from('users')
    .groupByRaw('DATE(created_at), ? DESC', ['foo']);
  t.is(
    builder.toSql(),
    'select * from "users" group by DATE(created_at), ? DESC'
  );
  t.deepEqual(builder.getBindings(), ['foo']);

  builder = getBuilder();
  builder
    .havingRaw('?', ['havingRawBinding'])
    .groupByRaw('?', ['groupByRawBinding'])
    .whereRaw('?', ['whereRawBinding']);
  t.deepEqual(builder.getBindings(), [
    'whereRawBinding',
    'groupByRawBinding',
    'havingRawBinding',
  ]);
});

test('testOrderBys', t => {
  let builder = getBuilder();
  builder.select('*').from('users').orderBy('email').orderBy('age', 'desc');
  t.is(
    builder.toSql(),
    'select * from "users" order by "email" asc, "age" desc'
  );

  builder.orders = [];
  t.is(builder.toSql(), 'select * from "users"');

  builder.orders = [];
  t.is(builder.toSql(), 'select * from "users"');

  builder = getBuilder();
  builder
    .select('*')
    .from('users')
    .orderBy('email')
    .orderByRaw('"age" ? desc', ['foo']);
  t.is(
    builder.toSql(),
    'select * from "users" order by "email" asc, "age" ? desc'
  );
  t.deepEqual(builder.getBindings(), ['foo']);

  builder = getBuilder();
  builder.select('*').from('users').orderByDesc('name');
  t.is(builder.toSql(), 'select * from "users" order by "name" desc');

  builder = getBuilder();
  builder
    .select('*')
    .from('posts')
    .where('public', 1)
    .unionAll(getBuilder().select('*').from('videos').where('public', 1))
    .orderByRaw('field(category, ?, ?) asc', ['news', 'opinion']);
  t.is(
    builder.toSql(),
    '(select * from "posts" where "public" = ?) union all (select * from "videos" where "public" = ?) order by field(category, ?, ?) asc'
  );
  t.deepEqual(builder.getBindings(), [1, 1, 'news', 'opinion']);
});

test('testReorder', t => {
  let builder = getBuilder();
  builder.select('*').from('users').orderBy('name');
  t.is(builder.toSql(), 'select * from "users" order by "name" asc');
  builder.reorder();
  t.is(builder.toSql(), 'select * from "users"');

  builder = getBuilder();
  builder.select('*').from('users').orderBy('name');
  t.is(builder.toSql(), 'select * from "users" order by "name" asc');
  builder.reorder('email', 'desc');
  t.is(builder.toSql(), 'select * from "users" order by "email" desc');

  builder = getBuilder();
  builder.select('*').from('first');
  builder.union(getBuilder().select('*').from('second'));
  builder.orderBy('name');
  t.is(
    builder.toSql(),
    '(select * from "first") union (select * from "second") order by "name" asc'
  );
  builder.reorder();
  t.is(
    builder.toSql(),
    '(select * from "first") union (select * from "second")'
  );

  builder = getBuilder();
  builder.select('*').from('users').orderByRaw('?', [true]);
  t.deepEqual(builder.getBindings(), [true]);
  builder.reorder();
  t.deepEqual(builder.getBindings(), []);
});

test('testOrderBySubQueries', t => {
  const expected =
    'select * from "users" order by (select "created_at" from "logins" where "user_id" = "users"."id" limit 1)';
  const subQuery = (query: Builder) =>
    query
      .select('created_at')
      .from('logins')
      .whereColumn('user_id', 'users.id')
      .limit(1);

  let builder = getBuilder().select('*').from('users').orderBy(subQuery);
  t.is(builder.toSql(), `${expected} asc`);

  builder = getBuilder().select('*').from('users').orderBy(subQuery, 'desc');
  t.is(builder.toSql(), `${expected} desc`);

  builder = getBuilder().select('*').from('users').orderByDesc(subQuery);
  t.is(builder.toSql(), `${expected} desc`);

  builder = getBuilder();
  builder
    .select('*')
    .from('posts')
    .where('public', 1)
    .unionAll(getBuilder().select('*').from('videos').where('public', 1))
    .orderBy(
      getBuilder().selectRaw('field(category, ?, ?)', ['news', 'opinion'])
    );
  t.is(
    builder.toSql(),
    '(select * from "posts" where "public" = ?) union all (select * from "videos" where "public" = ?) order by (select field(category, ?, ?)) asc'
  );
  t.deepEqual(builder.getBindings(), [1, 1, 'news', 'opinion']);
});

test('testOrderByInvalidDirectionParam', t => {
  const error = t.throws(
    () => {
      const builder = getBuilder();
      builder.select('*').from('users').orderBy('age', 'asec');
    },
    {instanceOf: TypeError}
  );

  t.true(error.message.includes('InvalidArgumentException'));
});

test('testHavings', t => {
  let builder = getBuilder();
  builder.select('*').from('users').having('email', '>', 1);
  t.is(builder.toSql(), 'select * from "users" having "email" > ?');

  builder = getBuilder();
  builder
    .select('*')
    .from('users')
    .orHaving('email', '=', 'test@example.com')
    .orHaving('email', '=', 'test2@example.com');
  t.is(
    builder.toSql(),
    'select * from "users" having "email" = ? or "email" = ?'
  );

  builder = getBuilder();
  builder.select('*').from('users').groupBy('email').having('email', '>', 1);
  t.is(
    builder.toSql(),
    'select * from "users" group by "email" having "email" > ?'
  );

  builder = getBuilder();
  builder
    .select('email as foo_email')
    .from('users')
    .having('foo_email', '>', 1);
  t.is(
    builder.toSql(),
    'select "email" as "foo_email" from "users" having "foo_email" > ?'
  );

  builder = getBuilder();
  builder
    .select(['category', new Raw('count(*) as "total"')])
    .from('item')
    .where('department', '=', 'popular')
    .groupBy('category')
    .having('total', '>', new Raw('3'));
  t.is(
    builder.toSql(),
    'select "category", count(*) as "total" from "item" where "department" = ? group by "category" having "total" > 3'
  );

  builder = getBuilder();
  builder
    .select(['category', new Raw('count(*) as "total"')])
    .from('item')
    .where('department', '=', 'popular')
    .groupBy('category')
    .having('total', '>', 3);
  t.is(
    builder.toSql(),
    'select "category", count(*) as "total" from "item" where "department" = ? group by "category" having "total" > ?'
  );
});

test('testHavingBetweens', t => {
  let builder = getBuilder();
  builder.select('*').from('users').havingBetween('id', [1, 2, 3]);
  t.is(builder.toSql(), 'select * from "users" having "id" between ? and ?');
  t.deepEqual(builder.getBindings(), [1, 2]);

  builder = getBuilder();
  builder
    .select('*')
    .from('users')
    .havingBetween('id', [
      [1, 2],
      [3, 4],
    ]);
  t.is(builder.toSql(), 'select * from "users" having "id" between ? and ?');
  t.deepEqual(builder.getBindings(), [1, 2]);
});

test('testHavingShortcut', t => {
  const builder = getBuilder();
  builder.select('*').from('users').having('email', 1).orHaving('email', 2);
  t.is(
    builder.toSql(),
    'select * from "users" having "email" = ? or "email" = ?'
  );
});

test('testHavingFollowedBySelectGet', t => {
  let builder = getBuilder();
  let query =
    'select "category", count(*) as "total" from "item" where "department" = ? group by "category" having "total" > ?';
  let connectionMock = createMock(builder.getConnection());
  let processorMock = createMock(builder.getProcessor());

  connectionMock
    .expects('select')
    .once()
    .withArgs(query, ['popular', 3])
    .returns([{category: 'rock', total: 5}]);
  processorMock
    .expects('processSelect')
    .callsFake((queryBuilder: Builder, results: Array<unknown>) => results);

  builder.from('item');
  let result = builder
    .select(['category', new Raw('count(*) as "total"')])
    .where('department', '=', 'popular')
    .groupBy('category')
    .having('total', '>', 3)
    .get();
  t.deepEqual(result.all(), [{category: 'rock', total: 5}]);

  // Using \Raw value
  builder = getBuilder();
  query =
    'select "category", count(*) as "total" from "item" where "department" = ? group by "category" having "total" > 3';
  connectionMock = createMock(builder.getConnection());
  processorMock = createMock(builder.getProcessor());
  connectionMock
    .expects('select')
    .once()
    .withArgs(query, ['popular'])
    .returns([{category: 'rock', total: 5}]);
  processorMock
    .expects('processSelect')
    .callsFake((queryBuilder: Builder, results: Array<unknown>) => results);

  builder.from('item');
  result = builder
    .select(['category', new Raw('count(*) as "total"')])
    .where('department', '=', 'popular')
    .groupBy('category')
    .having('total', '>', new Raw('3'))
    .get();
  t.deepEqual(result.all(), [{category: 'rock', total: 5}]);

  autoVerify();
});

test('testRawHavings', t => {
  let builder = getBuilder();
  builder.select('*').from('users').havingRaw('user_foo < user_bar');
  t.is(builder.toSql(), 'select * from "users" having user_foo < user_bar');

  builder = getBuilder();
  builder
    .select('*')
    .from('users')
    .having('baz', '=', 1)
    .orHavingRaw('user_foo < user_bar');
  t.is(
    builder.toSql(),
    'select * from "users" having "baz" = ? or user_foo < user_bar'
  );

  builder = getBuilder();
  builder
    .select('*')
    .from('users')
    .havingBetween('last_login_date', ['2018-11-16', '2018-12-16'])
    .orHavingRaw('user_foo < user_bar');
  t.is(
    builder.toSql(),
    'select * from "users" having "last_login_date" between ? and ? or user_foo < user_bar'
  );
});

test('testLimitsAndOffsets', t => {
  let builder = getBuilder();
  builder.select('*').from('users').offset(5).limit(10);
  t.is(builder.toSql(), 'select * from "users" limit 10 offset 5');

  builder = getBuilder();
  builder.select('*').from('users').skip(5).take(10);
  t.is(builder.toSql(), 'select * from "users" limit 10 offset 5');

  builder = getBuilder();
  builder.select('*').from('users').skip(0).take(0);
  t.is(builder.toSql(), 'select * from "users" limit 0 offset 0');

  builder = getBuilder();
  builder.select('*').from('users').skip(-5).take(-10);
  t.is(builder.toSql(), 'select * from "users" offset 0');
});

test('testForPage', t => {
  let builder = getBuilder();
  builder.select('*').from('users').forPage(2, 15);
  t.is(builder.toSql(), 'select * from "users" limit 15 offset 15');

  builder = getBuilder();
  builder.select('*').from('users').forPage(0, 15);
  t.is(builder.toSql(), 'select * from "users" limit 15 offset 0');

  builder = getBuilder();
  builder.select('*').from('users').forPage(-2, 15);
  t.is(builder.toSql(), 'select * from "users" limit 15 offset 0');

  builder = getBuilder();
  builder.select('*').from('users').forPage(2, 0);
  t.is(builder.toSql(), 'select * from "users" limit 0 offset 0');

  builder = getBuilder();
  builder.select('*').from('users').forPage(0, 0);
  t.is(builder.toSql(), 'select * from "users" limit 0 offset 0');

  builder = getBuilder();
  builder.select('*').from('users').forPage(-2, 0);
  t.is(builder.toSql(), 'select * from "users" limit 0 offset 0');
});

test('testGetCountForPaginationWithBindings', t => {
  const builder = getBuilder();
  builder.from('users').selectSub((query: Builder) => {
    query.select('body').from('posts').where('id', 4);
  }, 'post');

  createMock(builder.getConnection())
    .expects('select')
    .once()
    .withArgs('select count(*) as aggregate from "users"', [])
    .returns([{aggregate: 1}]);
  createMock(builder.getProcessor())
    .expects('processSelect')
    .once()
    .callsFake((builderBuilder: Builder, results: Array<unknown>) => results);

  const count = builder.getCountForPagination();
  t.is(count, 1);
  t.deepEqual(builder.getBindings(), [4]);

  autoVerify();
});

test('testGetCountForPaginationWithColumnAliases', t => {
  const builder = getBuilder();
  const columns = ['body as post_body', 'teaser', 'posts.created as published'];
  builder.from('posts').select(columns);

  createMock(builder.getConnection())
    .expects('select')
    .once()
    .withArgs(
      'select count("body", "teaser", "posts"."created") as aggregate from "posts"',
      []
    )
    .returns([{aggregate: 1}]);
  createMock(builder.getProcessor())
    .expects('processSelect')
    .once()
    .callsFake((builderBuilder: Builder, results: Array<unknown>) => results);

  const count = builder.getCountForPagination(columns);
  t.is(count, 1);

  autoVerify();
});

test('testGetCountForPaginationWithUnion', t => {
  const builder = getBuilder();
  builder
    .from('posts')
    .select('id')
    .union(getBuilder().from('videos').select('id'));

  createMock(builder.getConnection())
    .expects('select')
    .once()
    .withArgs(
      'select count(*) as aggregate from ((select "id" from "posts") union (select "id" from "videos")) as "temp_table"',
      []
    )
    .returns([{aggregate: 1}]);
  createMock(builder.getProcessor())
    .expects('processSelect')
    .once()
    .callsFake((builderBuilder: Builder, results: Array<unknown>) => results);

  const count = builder.getCountForPagination();
  t.is(count, 1);

  autoVerify();
});

test('testWhereShortcut', t => {
  const builder = getBuilder();
  builder.select('*').from('users').where('id', 1).orWhere('name', 'foo');
  t.is(builder.toSql(), 'select * from "users" where "id" = ? or "name" = ?');
  t.deepEqual(builder.getBindings(), [1, 'foo']);
});

test('testWhereWithArrayConditions', t => {
  let builder = getBuilder();
  builder
    .select('*')
    .from('users')
    .where([
      ['foo', 1],
      ['bar', 2],
    ]);
  t.is(
    builder.toSql(),
    'select * from "users" where ("foo" = ? and "bar" = ?)'
  );
  t.deepEqual(builder.getBindings(), [1, 'foo']);

  builder = getBuilder();
  builder.select('*').from('users').where({foo: 1, bar: 2});
  t.is(
    builder.toSql(),
    'select * from "users" where ("foo" = ? and "bar" = ?)'
  );
  t.deepEqual(builder.getBindings(), [1, 'foo']);

  builder = getBuilder();
  builder
    .select('*')
    .from('users')
    .where([
      ['foo', 1],
      ['bar', '<', 2],
    ]);
  t.is(
    builder.toSql(),
    'select * from "users" where ("foo" = ? and "bar" < ?)'
  );
  t.deepEqual(builder.getBindings(), [1, 2]);
});

test('testNestedWheres', t => {
  const builder = getBuilder();
  builder
    .select('*')
    .from('users')
    .where('email', '=', 'foo')
    .orWhere((query: Builder) => {
      query.where('name', '=', 'bar').where('age', '=', 25);
    });
  t.is(
    builder.toSql(),
    'select * from "users" where "email" = ? or ("name" = ? and "age" = ?)'
  );
  t.deepEqual(builder.getBindings(), ['foo', 'bar', 25]);
});

test('testNestedWhereBindings', t => {
  const builder = getBuilder();
  builder.where('email', '=', 'foo').where((query: Builder) => {
    query.selectRaw('?', ['ignore']).where('name', '=', 'bar');
  });
  t.deepEqual(builder.getBindings(), ['foo', 'bar']);
});

test('testFullSubSelects', t => {
  const builder = getBuilder();
  builder
    .select('*')
    .from('users')
    .where('email', '=', 'foo')
    .orWhere('id', '=', (query: Builder) => {
      query.select(new Raw('max(id)')).from('users').where('email', '=', 'bar');
    });

  t.is(
    builder.toSql(),
    'select * from "users" where "email" = ? or "id" = (select max(id) from "users" where "email" = ?)'
  );
  t.deepEqual(builder.getBindings(), ['foo', 'bar']);
});

test('testWhereExists', t => {
  let builder = getBuilder();
  builder
    .select('*')
    .from('orders')
    .whereExists((query: Builder) => {
      query
        .select('*')
        .from('products')
        .where('products.id', '=', new Raw('"orders"."id"'));
    });
  t.is(
    builder.toSql(),
    'select * from "orders" where exists (select * from "products" where "products"."id" = "orders"."id")'
  );

  builder = getBuilder();
  builder
    .select('*')
    .from('orders')
    .whereNotExists((query: Builder) => {
      query
        .select('*')
        .from('products')
        .where('products.id', '=', new Raw('"orders"."id"'));
    });
  t.is(
    builder.toSql(),
    'select * from "orders" where not exists (select * from "products" where "products"."id" = "orders"."id")'
  );

  builder = getBuilder();
  builder
    .select('*')
    .from('orders')
    .where('id', '=', 1)
    .orWhereExists((query: Builder) => {
      query
        .select('*')
        .from('products')
        .where('products.id', '=', new Raw('"orders"."id"'));
    });
  t.is(
    builder.toSql(),
    'select * from "orders" where "id" = ? or exists (select * from "products" where "products"."id" = "orders"."id")'
  );

  builder = getBuilder();
  builder
    .select('*')
    .from('orders')
    .where('id', '=', 1)
    .orWhereNotExists((query: Builder) => {
      query
        .select('*')
        .from('products')
        .where('products.id', '=', new Raw('"orders"."id"'));
    });
  t.is(
    builder.toSql(),
    'select * from "orders" where "id" = ? or not exists (select * from "products" where "products"."id" = "orders"."id")'
  );
});

test('testBasicJoins', t => {
  let builder = getBuilder();
  builder.select('*').from('users').join('contacts', 'users.id', 'contacts.id');
  t.is(
    builder.toSql(),
    'select * from "users" inner join "contacts" on "users"."id" = "contacts"."id"'
  );

  builder = getBuilder();
  builder
    .select('*')
    .from('users')
    .join('contacts', 'users.id', '=', 'contacts.id')
    .leftJoin('photos', 'users.id', '=', 'photos.id');
  t.is(
    builder.toSql(),
    'select * from "users" inner join "contacts" on "users"."id" = "contacts"."id" left join "photos" on "users"."id" = "photos"."id"'
  );

  builder = getBuilder();
  builder
    .select('*')
    .from('users')
    .leftJoinWhere('photos', 'users.id', '=', 'bar')
    .joinWhere('photos', 'users.id', '=', 'foo');
  t.is(
    builder.toSql(),
    'select * from "users" left join "photos" on "users"."id" = ? inner join "photos" on "users"."id" = ?'
  );
  t.deepEqual(builder.getBindings(), ['bar', 'foo']);
});

test('testCrossJoins', t => {
  let builder = getBuilder();
  builder.select('*').from('sizes').crossJoin('colors');
  t.is(builder.toSql(), 'select * from "sizes" cross join "colors"');

  builder = getBuilder();
  builder
    .select('*')
    .from('tableB')
    .join('tableA', 'tableA.column1', '=', 'tableB.column2', 'cross');
  t.is(
    builder.toSql(),
    'select * from "tableB" cross join "tableA" on "tableA"."column1" = "tableB"."column2"'
  );

  builder = getBuilder();
  builder
    .select('*')
    .from('tableB')
    .crossJoin('tableA', 'tableA.column1', '=', 'tableB.column2');
  t.is(
    builder.toSql(),
    'select * from "tableB" cross join "tableA" on "tableA"."column1" = "tableB"."column2"'
  );
});

test('testCrossJoinSubs', t => {
  const builder = getBuilder();
  builder
    .selectRaw('(sale / overall.sales) * 100 AS percent_of_total')
    .from('sales')
    .crossJoinSub(
      getBuilder().selectRaw('SUM(sale) AS sales').from('sales'),
      'overall'
    );
  t.is(
    builder.toSql(),
    'select (sale / overall.sales) * 100 AS percent_of_total from "sales" cross join (select SUM(sale) AS sales from "sales") as "overall"'
  );
});

test('testComplexJoin', t => {
  let builder = getBuilder();
  builder
    .select('*')
    .from('users')
    .join('contacts', (join: JoinClause) => {
      join
        .on('users.id', '=', 'contacts.id')
        .orOn('users.name', '=', 'contacts.name');
    });
  t.is(
    builder.toSql(),
    'select * from "users" inner join "contacts" on "users"."id" = "contacts"."id" or "users"."name" = "contacts"."name"'
  );

  builder = getBuilder();
  builder
    .select('*')
    .from('users')
    .join('contacts', (join: JoinClause) => {
      join.where('users.id', '=', 'foo').orWhere('users.name', '=', 'bar');
    });
  t.is(
    builder.toSql(),
    'select * from "users" inner join "contacts" on "users"."id" = ? or "users"."name" = ?'
  );
  t.deepEqual(builder.getBindings(), ['foo', 'bar']);

  // Run the assertions again
  t.is(
    builder.toSql(),
    'select * from "users" inner join "contacts" on "users"."id" = ? or "users"."name" = ?'
  );
  t.deepEqual(builder.getBindings(), ['foo', 'bar']);
});

test('testJoinWhereNull', t => {
  let builder = getBuilder();
  builder
    .select('*')
    .from('users')
    .join('contacts', (join: JoinClause) => {
      join.on('users.id', '=', 'contacts.id').whereNull('contacts.deleted_at');
    });
  t.is(
    builder.toSql(),
    'select * from "users" inner join "contacts" on "users"."id" = "contacts"."id" and "contacts"."deleted_at" is null'
  );

  builder = getBuilder();
  builder
    .select('*')
    .from('users')
    .join('contacts', (join: JoinClause) => {
      join
        .on('users.id', '=', 'contacts.id')
        .orWhereNull('contacts.deleted_at');
    });
  t.is(
    builder.toSql(),
    'select * from "users" inner join "contacts" on "users"."id" = "contacts"."id" or "contacts"."deleted_at" is null'
  );
});

test('testJoinWhereNotNull', t => {
  let builder = getBuilder();
  builder
    .select('*')
    .from('users')
    .join('contacts', (join: JoinClause) => {
      join
        .on('users.id', '=', 'contacts.id')
        .whereNotNull('contacts.deleted_at');
    });
  t.is(
    builder.toSql(),
    'select * from "users" inner join "contacts" on "users"."id" = "contacts"."id" and "contacts"."deleted_at" is not null'
  );

  builder = getBuilder();
  builder
    .select('*')
    .from('users')
    .join('contacts', (join: JoinClause) => {
      join
        .on('users.id', '=', 'contacts.id')
        .orWhereNotNull('contacts.deleted_at');
    });
  t.is(
    builder.toSql(),
    'select * from "users" inner join "contacts" on "users"."id" = "contacts"."id" or "contacts"."deleted_at" is not null'
  );
});

test('testJoinWhereIn', t => {
  let builder = getBuilder();
  builder
    .select('*')
    .from('users')
    .join('contacts', (join: JoinClause) => {
      join
        .on('users.id', '=', 'contacts.id')
        .whereIn('contacts.name', [48, 'baz', null]);
    });
  t.is(
    builder.toSql(),
    'select * from "users" inner join "contacts" on "users"."id" = "contacts"."id" and "contacts"."name" in (?, ?, ?)'
  );
  t.deepEqual(builder.getBindings(), [48, 'baz', null]);

  builder = getBuilder();
  builder
    .select('*')
    .from('users')
    .join('contacts', (join: JoinClause) => {
      join
        .on('users.id', '=', 'contacts.id')
        .orWhereIn('contacts.name', [48, 'baz', null]);
    });
  t.is(
    builder.toSql(),
    'select * from "users" inner join "contacts" on "users"."id" = "contacts"."id" or "contacts"."name" in (?, ?, ?)'
  );
  t.deepEqual(builder.getBindings(), [48, 'baz', null]);
});

test('testJoinWhereInSubquery', t => {
  let builder = getBuilder();
  builder
    .select('*')
    .from('users')
    .join('contacts', (join: JoinClause) => {
      const query = getBuilder();
      query.select('name').from('contacts').where('name', 'baz');
      join.on('users.id', '=', 'contacts.id').whereIn('contacts.name', query);
    });
  t.is(
    builder.toSql(),
    'select * from "users" inner join "contacts" on "users"."id" = "contacts"."id" and "contacts"."name" in (select "name" from "contacts" where "name" = ?)'
  );
  t.deepEqual(builder.getBindings(), ['baz']);

  builder = getBuilder();
  builder
    .select('*')
    .from('users')
    .join('contacts', (join: JoinClause) => {
      const query = getBuilder();
      query.select('name').from('contacts').where('name', 'baz');
      join.on('users.id', '=', 'contacts.id').orWhereIn('contacts.name', query);
    });
  t.is(
    builder.toSql(),
    'select * from "users" inner join "contacts" on "users"."id" = "contacts"."id" or "contacts"."name" in (select "name" from "contacts" where "name" = ?)'
  );
  t.deepEqual(builder.getBindings(), ['baz']);
});

test('testJoinWhereNotIn', t => {
  let builder = getBuilder();
  builder
    .select('*')
    .from('users')
    .join('contacts', (join: JoinClause) => {
      join
        .on('users.id', '=', 'contacts.id')
        .whereNotIn('contacts.name', [48, 'baz', null]);
    });
  t.is(
    builder.toSql(),
    'select * from "users" inner join "contacts" on "users"."id" = "contacts"."id" and "contacts"."name" not in (?, ?, ?)'
  );
  t.deepEqual(builder.getBindings(), [48, 'baz', null]);

  builder = getBuilder();
  builder
    .select('*')
    .from('users')
    .join('contacts', (join: JoinClause) => {
      join
        .on('users.id', '=', 'contacts.id')
        .orWhereNotIn('contacts.name', [48, 'baz', null]);
    });
  t.is(
    builder.toSql(),
    'select * from "users" inner join "contacts" on "users"."id" = "contacts"."id" or "contacts"."name" not in (?, ?, ?)'
  );
  t.deepEqual(builder.getBindings(), [48, 'baz', null]);
});

test('testJoinsWithNestedConditions', t => {
  const whereJoinCallback = (join: JoinClause) => {
    join
      .where('contacts.country', '=', 'US')
      .orWhere('contacts.is_partner', '=', 1);
  };
  let builder = getBuilder();
  builder
    .select('*')
    .from('users')
    .leftJoin('contacts', (join: JoinClause) => {
      join.on('users.id', '=', 'contacts.id').where(whereJoinCallback);
    });
  t.is(
    builder.toSql(),
    'select * from "users" left join "contacts" on "users"."id" = "contacts"."id" and ("contacts"."country" = ? or "contacts"."is_partner" = ?)'
  );
  t.deepEqual(builder.getBindings(), ['US', 1]);

  builder = getBuilder();

  const orOnCallback = (join: JoinClause) => {
    join
      .orWhere((orWhereJoin: JoinClause) => {
        orWhereJoin
          .where('contacts.country', '=', 'UK')
          .orOn('contacts.type', '=', 'users.type');
      })
      .where((whereJoin: JoinClause) => {
        whereJoin
          .where('contacts.country', '=', 'US')
          .orWhereNull('contacts.is_partner');
      });
  };

  builder
    .select('*')
    .from('users')
    .leftJoin('contacts', (join: JoinClause) => {
      join
        .on('users.id', '=', 'contacts.id')
        .where('contacts.is_active', '=', 1)
        .orOn(orOnCallback);
    });
  t.is(
    builder.toSql(),
    'select * from "users" left join "contacts" on "users"."id" = "contacts"."id" and "contacts"."is_active" = ? or (("contacts"."country" = ? or "contacts"."type" = "users"."type") and ("contacts"."country" = ? or "contacts"."is_partner" is null))'
  );
  t.deepEqual(builder.getBindings(), [1, 'UK', 'US']);
});

test('testJoinsWithAdvancedConditions', t => {
  const whereJoinCallback = (join: Builder) => {
    join
      .orWhereNull('contacts.disabled')
      .orWhereRaw('year(contacts.created_at) = 2016');
  };
  const builder = getBuilder();
  builder
    .select('*')
    .from('users')
    .leftJoin('contacts', (join: JoinClause) => {
      join.on('users.id', 'contacts.id').where(whereJoinCallback);
    });
  t.is(
    builder.toSql(),
    'select * from "users" left join "contacts" on "users"."id" = "contacts"."id" and ("contacts"."disabled" is null or year(contacts.created_at) = 2016)'
  );
  t.deepEqual(builder.getBindings(), []);
});

test('testJoinsWithSubqueryCondition', t => {
  const whereInCallback = (query: Builder) => {
    query
      .select('id')
      .from('contact_types')
      .where('category_id', '1')
      .whereNull('deleted_at');
  };
  let builder = getBuilder();
  builder
    .select('*')
    .from('users')
    .leftJoin('contacts', (join: JoinClause) => {
      join
        .on('users.id', 'contacts.id')
        .whereIn('contact_type_id', whereInCallback);
    });

  t.is(
    builder.toSql(),
    'select * from "users" left join "contacts" on "users"."id" = "contacts"."id" and "contact_type_id" in (select "id" from "contact_types" where "category_id" = ? and "deleted_at" is null)'
  );
  t.deepEqual(builder.getBindings(), ['1']);

  builder = getBuilder();
  builder
    .select('*')
    .from('users')
    .leftJoin('contacts', (join: JoinClause) => {
      join.on('users.id', 'contacts.id').whereExists((query: Builder) => {
        query
          .selectRaw('1')
          .from('contact_types')
          .whereRaw('contact_types.id = contacts.contact_type_id')
          .where('category_id', '1')
          .whereNull('deleted_at');
      });
    });

  t.is(
    builder.toSql(),
    'select * from "users" left join "contacts" on "users"."id" = "contacts"."id" and exists (select 1 from "contact_types" where contact_types.id = contacts.contact_type_id and "category_id" = ? and "deleted_at" is null)'
  );
  t.deepEqual(builder.getBindings(), ['1']);
});

test('testJoinsWithAdvancedSubqueryCondition', t => {
  const whereExistsCallback = (query: Builder) => {
    query
      .selectRaw('1')
      .from('contact_types')
      .whereRaw('contact_types.id = contacts.contact_type_id')
      .where('category_id', '1')
      .whereNull('deleted_at')
      .whereIn('level_id', (queryIn: Builder) => {
        queryIn.select('id').from('levels').where('is_active', true);
      });
  };
  const builder = getBuilder();
  builder
    .select('*')
    .from('users')
    .leftJoin('contacts', (join: JoinClause) => {
      join.on('users.id', 'contacts.id').whereExists(whereExistsCallback);
    });
  t.is(
    builder.toSql(),
    'select * from "users" left join "contacts" on "users"."id" = "contacts"."id" and exists (select 1 from "contact_types" where contact_types.id = contacts.contact_type_id and "category_id" = ? and "deleted_at" is null and "level_id" in (select "id" from "levels" where "is_active" = ?))'
  );
  t.deepEqual(builder.getBindings(), ['1', true]);
});

test('testJoinsWithNestedJoins', t => {
  const builder = getBuilder();
  builder
    .select('users.id', 'contacts.id', 'contact_types.id')
    .from('users')
    .leftJoin('contacts', (join: JoinClause) => {
      join
        .on('users.id', 'contacts.id')
        .join(
          'contact_types',
          'contacts.contact_type_id',
          '=',
          'contact_types.id'
        );
    });
  t.is(
    builder.toSql(),
    'select "users"."id", "contacts"."id", "contact_types"."id" from "users" left join ("contacts" inner join "contact_types" on "contacts"."contact_type_id" = "contact_types"."id") on "users"."id" = "contacts"."id"'
  );
});

test('testJoinsWithMultipleNestedJoins', t => {
  const leftJoinCallback = (query: JoinClause) => {
    query
      .on('contacts.country', '=', 'countrys.country')
      .join('planets', (join: JoinClause) => {
        join
          .on('countrys.planet_id', '=', 'planet.id')
          .where('planet.is_settled', '=', 1)
          .where('planet.population', '>=', 10000);
      });
  };
  const builder = getBuilder();
  builder
    .select(
      'users.id',
      'contacts.id',
      'contact_types.id',
      'countrys.id',
      'planets.id'
    )
    .from('users')
    .leftJoin('contacts', (join: JoinClause) => {
      join
        .on('users.id', 'contacts.id')
        .join(
          'contact_types',
          'contacts.contact_type_id',
          '=',
          'contact_types.id'
        )
        .leftJoin('countrys', leftJoinCallback);
    });
  t.is(
    builder.toSql(),
    'select "users"."id", "contacts"."id", "contact_types"."id", "countrys"."id", "planets"."id" from "users" left join ("contacts" inner join "contact_types" on "contacts"."contact_type_id" = "contact_types"."id" left join ("countrys" inner join "planets" on "countrys"."planet_id" = "planet"."id" and "planet"."is_settled" = ? and "planet"."population" >= ?) on "contacts"."country" = "countrys"."country") on "users"."id" = "contacts"."id"'
  );
  t.deepEqual(builder.getBindings(), [1, 10000]);
});

test('testJoinsWithNestedJoinWithAdvancedSubqueryCondition', t => {
  const whereExistsCallback = (query: Builder) => {
    query
      .select('*')
      .from('countrys')
      .whereColumn('contacts.country', '=', 'countrys.country')
      .join('planets', (join: JoinClause) => {
        join
          .on('countrys.planet_id', '=', 'planet.id')
          .where('planet.is_settled', '=', 1);
      })
      .where('planet.population', '>=', 10000);
  };
  const builder = getBuilder();
  builder
    .select('users.id', 'contacts.id', 'contact_types.id')
    .from('users')
    .leftJoin('contacts', (join: JoinClause) => {
      join
        .on('users.id', 'contacts.id')
        .join(
          'contact_types',
          'contacts.contact_type_id',
          '=',
          'contact_types.id'
        )
        .whereExists(whereExistsCallback);
    });
  t.is(
    builder.toSql(),
    'select "users"."id", "contacts"."id", "contact_types"."id" from "users" left join ("contacts" inner join "contact_types" on "contacts"."contact_type_id" = "contact_types"."id") on "users"."id" = "contacts"."id" and exists (select * from "countrys" inner join "planets" on "countrys"."planet_id" = "planet"."id" and "planet"."is_settled" = ? where "contacts"."country" = "countrys"."country" and "planet"."population" >= ?)'
  );
  t.deepEqual(builder.getBindings(), [1, 10000]);
});

test('testJoinSub', t => {
  let builder = getBuilder();
  builder
    .from('users')
    .joinSub('select * from "contacts"', 'sub', 'users.id', '=', 'sub.id');
  t.is(
    builder.toSql(),
    'select * from "users" inner join (select * from "contacts") as "sub" on "users"."id" = "sub"."id"'
  );

  builder = getBuilder();
  builder.from('users').joinSub(
    (query: JoinClause) => {
      query.from('contacts');
    },
    'sub',
    'users.id',
    '=',
    'sub.id'
  );
  t.is(
    builder.toSql(),
    'select * from "users" inner join (select * from "contacts") as "sub" on "users"."id" = "sub"."id"'
  );

  builder = getBuilder();
  const eloquentBuilder = new EloquentBuilder(getBuilder().from('contacts'));
  builder
    .from('users')
    .joinSub(eloquentBuilder, 'sub', 'users.id', '=', 'sub.id');
  t.is(
    builder.toSql(),
    'select * from "users" inner join (select * from "contacts") as "sub" on "users"."id" = "sub"."id"'
  );

  builder = getBuilder();
  const sub1 = getBuilder().from('contacts').where('name', 'foo');
  const sub2 = getBuilder().from('contacts').where('name', 'bar');
  builder
    .from('users')
    .joinSub(sub1, 'sub1', 'users.id', '=', 1, 'inner', true)
    .joinSub(sub2, 'sub2', 'users.id', '=', 'sub2.user_id');
  let expected = 'select * from "users" ';
  expected +=
    'inner join (select * from "contacts" where "name" = ?) as "sub1" on "users"."id" = ? ';
  expected +=
    'inner join (select * from "contacts" where "name" = ?) as "sub2" on "users"."id" = "sub2"."user_id"';
  t.deepEqual(builder.toSql(), expected);
  t.deepEqual(builder.getRawBindings().join, ['foo', 1, 'bar']);
});

test('testJoinSubWithPrefix', t => {
  const builder = getBuilder();
  builder.getGrammar().setTablePrefix('prefix_');
  builder
    .from('users')
    .joinSub('select * from "contacts"', 'sub', 'users.id', '=', 'sub.id');
  t.is(
    builder.toSql(),
    'select * from "prefix_users" inner join (select * from "contacts") as "prefix_sub" on "prefix_users"."id" = "prefix_sub"."id"'
  );
});

test('testLeftJoinSub', t => {
  const builder = getBuilder();
  builder
    .from('users')
    .leftJoinSub(
      getBuilder().from('contacts'),
      'sub',
      'users.id',
      '=',
      'sub.id'
    );
  t.is(
    builder.toSql(),
    'select * from "users" left join (select * from "contacts") as "sub" on "users"."id" = "sub"."id"'
  );
});

test('testRightJoinSub', t => {
  const builder = getBuilder();
  builder
    .from('users')
    .rightJoinSub(
      getBuilder().from('contacts'),
      'sub',
      'users.id',
      '=',
      'sub.id'
    );
  t.is(
    builder.toSql(),
    'select * from "users" right join (select * from "contacts") as "sub" on "users"."id" = "sub"."id"'
  );
});

test('testRawExpressionsInSelect', t => {
  const builder = getBuilder();
  builder.select(new Raw('substr(foo, 6)')).from('users');
  t.is(builder.toSql(), 'select substr(foo, 6) from "users"');
});

test('testFindReturnsFirstResultByID', t => {
  const builder = getBuilder();
  createMock(builder.getConnection())
    .expects('select')
    .once()
    .withArgs('select * from "users" where "id" = ? limit 1', [1])
    .returns([{foo: 'bar'}]);
  createMock(builder.getProcessor())
    .expects('processSelect')
    .once()
    .withArgs(builder, [{foo: 'bar'}])
    .callsFake((query: Builder, results: Array<unknown>) => results);
  const results = builder.from('users').find(1);
  t.deepEqual(results, {foo: 'bar'});

  autoVerify();
});

test('testFirstMethodReturnsFirstResult', t => {
  const builder = getBuilder();
  createMock(builder.getConnection())
    .expects('select')
    .once()
    .withArgs('select * from "users" where "id" = ? limit 1', [1])
    .returns([{foo: 'bar'}]);
  createMock(builder.getProcessor())
    .expects('processSelect')
    .once()
    .withArgs(builder, [{foo: 'bar'}])
    .callsFake((query: Builder, results: Array<unknown>) => results);
  const results = builder.from('users').where('id', '=', 1).first();
  t.deepEqual(results, {foo: 'bar'});

  autoVerify();
});

test('testPluckMethodGetsCollectionOfColumnValues', t => {
  let builder = getBuilder();
  createMock(builder.getConnection())
    .expects('select')
    .once()
    .returns([{foo: 'bar'}, {foo: 'baz'}]);
  createMock(builder.getProcessor())
    .expects('processSelect')
    .once()
    .withArgs(builder, [{foo: 'bar'}, {foo: 'baz'}])
    .callsFake((query: Builder, rows: Array<unknown>) => rows);
  let results = builder.from('users').where('id', '=', 1).pluck('foo');
  t.deepEqual(results.all(), ['bar', 'baz']);

  builder = getBuilder();
  createMock(builder.getConnection())
    .expects('select')
    .once()
    .returns([
      {id: 1, foo: 'bar'},
      {id: 10, foo: 'baz'},
    ]);
  createMock(builder.getProcessor())
    .expects('processSelect')
    .once()
    .withArgs(builder, [
      {id: 1, foo: 'bar'},
      {id: 10, foo: 'baz'},
    ])
    .callsFake((query: Builder, rows: Array<unknown>) => rows);
  results = builder.from('users').where('id', '=', 1).pluck('foo', 'id');
  t.deepEqual(results.all(), [{1: 'bar', 10: 'baz'}]);

  autoVerify();
});

test('testImplode', t => {
  // Test without glue.
  let builder = getBuilder();
  createMock(builder.getConnection())
    .expects('select')
    .once()
    .returns([{foo: 'bar'}, {foo: 'baz'}]);
  createMock(builder.getProcessor())
    .expects('processSelect')
    .once()
    .withArgs(builder, [{foo: 'bar'}, {foo: 'baz'}])
    .callsFake((query: Builder, rows: Array<unknown>) => rows);
  let results = builder.from('users').where('id', '=', 1).implode('foo');
  t.is(results, 'barbaz');

  // Test with glue.
  builder = getBuilder();
  createMock(builder.getConnection())
    .expects('select')
    .once()
    .returns([{foo: 'bar'}, {foo: 'baz'}]);
  createMock(builder.getProcessor())
    .expects('processSelect')
    .once()
    .withArgs(builder, [{foo: 'bar'}, {foo: 'baz'}])
    .callsFake((query: Builder, rows: Array<unknown>) => rows);
  results = builder.from('users').where('id', '=', 1).implode('foo', ',');
  t.is(results, 'bar,baz');

  autoVerify();
});

test('testValueMethodReturnsSingleColumn', t => {
  const builder = getBuilder();
  createMock(builder.getConnection())
    .expects('select')
    .once()
    .withArgs('select "foo" from "users" where "id" = ? limit 1', [1])
    .returns([{foo: 'bar'}]);
  createMock(builder.getProcessor())
    .expects('processSelect')
    .once()
    .withArgs(builder, [{foo: 'bar'}])
    .returns([{foo: 'bar'}]);
  const results = builder.from('users').where('id', '=', 1).value('foo');
  t.is(results, 'bar');

  autoVerify();
});

test('testAggregateFunctions', t => {
  let builder = getBuilder();
  createMock(builder.getConnection())
    .expects('select')
    .once()
    .withArgs('select count(*) as aggregate from "users"', [])
    .returns([{aggregate: 1}]);
  createMock(builder.getProcessor())
    .expects('processSelect')
    .once()
    .callsFake((query: Builder, rows: Array<unknown>) => rows);
  let results = builder.from('users').count();
  t.is(results, 1);

  builder = getBuilder();
  createMock(builder.getConnection())
    .expects('select')
    .once()
    .withArgs('select exists(select * from "users") as "exists"', [])
    .returns([{exists: 1}]);
  results = builder.from('users').exists();
  t.true(results);

  builder = getBuilder();
  createMock(builder.getConnection())
    .expects('select')
    .once()
    .withArgs('select exists(select * from "users") as "exists"', [])
    .returns([{exists: 0}]);
  results = builder.from('users').doesntExist();
  t.true(results);

  builder = getBuilder();
  createMock(builder.getConnection())
    .expects('select')
    .once()
    .withArgs('select max("id") as aggregate from "users"', [])
    .returns([{aggregate: 1}]);
  createMock(builder.getProcessor())
    .expects('processSelect')
    .once()
    .callsFake((query: Builder, rows: Array<unknown>) => rows);
  results = builder.from('users').max('id');
  t.is(results, 1);

  builder = getBuilder();
  createMock(builder.getConnection())
    .expects('select')
    .once()
    .withArgs('select min("id") as aggregate from "users"', [])
    .returns([{aggregate: 1}]);
  createMock(builder.getProcessor())
    .expects('processSelect')
    .once()
    .callsFake((query: Builder, rows: Array<unknown>) => rows);
  results = builder.from('users').min('id');
  t.is(results, 1);

  builder = getBuilder();
  createMock(builder.getConnection())
    .expects('select')
    .once()
    .withArgs('select sum("id") as aggregate from "users"', [])
    .returns([{aggregate: 1}]);
  createMock(builder.getProcessor())
    .expects('processSelect')
    .once()
    .callsFake((query: Builder, rows: Array<unknown>) => rows);
  results = builder.from('users').sum('id');
  t.is(results, 1);

  autoVerify();
});

test('testSqlServerExists', t => {
  const builder = getSqlServerBuilder();
  createMock(builder.getConnection())
    .expects('select')
    .once()
    .withArgs('select top 1 1 [exists] from [users]', [])
    .returns([{exists: 1}]);
  const results = builder.from('users').exists();
  t.true(results);

  autoVerify();
});

test('testDoesntExistsOr', t => {
  let builder = getBuilder();
  createMock(builder.getConnection())
    .expects('select')
    .returns([{exists: 1}]);
  let results = builder.from('users').doesntExistOr(() => 123);
  t.is(results, 123);

  builder = getBuilder();
  createMock(builder.getConnection())
    .expects('select')
    .returns([{exists: 0}]);
  results = builder.from('users').doesntExistOr(() => {
    throw new Error('RuntimeException');
  });
  t.true(results);

  autoVerify();
});

test('testExistsOr', t => {
  let builder = getBuilder();
  createMock(builder.getConnection())
    .expects('select')
    .returns([{exists: 0}]);
  let results = builder.from('users').existsOr(() => 123);
  t.is(results, 123);

  builder = getBuilder();
  createMock(builder.getConnection())
    .expects('select')
    .returns([{exists: 1}]);
  results = builder.from('users').existsOr(() => {
    throw new Error('RuntimeException');
  });
  t.true(results);

  autoVerify();
});

test('testAggregateResetFollowedByGet', t => {
  const builder = getBuilder();
  const connectionMock = createMock(builder.getConnection());
  connectionMock
    .expects('select')
    .once()
    .withArgs('select count(*) as aggregate from "users"', [])
    .returns([{aggregate: 1}]);
  connectionMock
    .expects('select')
    .once()
    .withArgs('select sum("id") as aggregate from "users"', [])
    .returns([{aggregate: 2}]);
  connectionMock
    .expects('select')
    .once()
    .withArgs('select "column1", "column2" from "users"', [])
    .returns([{column1: 'foo', column2: 'bar'}]);
  createMock(builder.getProcessor())
    .expects('processSelect')
    .thrice()
    .callsFake((query: Builder, rows: Array<unknown>) => rows);
  builder.from('users').select('column1', 'column2');
  const count = builder.count();
  t.is(count, 1);
  const sum = builder.sum('id');
  t.is(sum, 2);
  const result = builder.get();
  t.deepEqual(result.all(), [{column1: 'foo', column2: 'bar'}]);

  autoVerify();
});

test('testAggregateResetFollowedBySelectGet', t => {
  const builder = getBuilder();
  const connectionMock = createMock(builder.getConnection());
  connectionMock
    .expects('select')
    .once()
    .withArgs('select count("column1") as aggregate from "users"', [])
    .returns([{aggregate: 1}]);
  connectionMock
    .expects('select')
    .once()
    .withArgs('select "column2", "column3" from "users"', [])
    .returns([{column2: 'foo', column3: 'bar'}]);
  createMock(builder.getProcessor())
    .expects('processSelect')
    .twice()
    .callsFake((query: Builder, rows: Array<unknown>) => rows);
  builder.from('users');
  const count = builder.count('column1');
  t.is(count, 1);
  const result = builder.select('column2', 'column3').get();
  t.deepEqual(result.all(), [{column2: 'foo', column3: 'bar'}]);

  autoVerify();
});

test('testAggregateResetFollowedByGetWithColumns', t => {
  const builder = getBuilder();
  const connectionMock = createMock(builder.getConnection());
  connectionMock
    .expects('select')
    .once()
    .withArgs('select count("column1") as aggregate from "users"', [])
    .returns([{aggregate: 1}]);
  connectionMock
    .expects('select')
    .once()
    .withArgs('select "column2", "column3" from "users"', [])
    .returns([{column2: 'foo', column3: 'bar'}]);
  createMock(builder.getProcessor())
    .expects('processSelect')
    .twice()
    .callsFake((query: Builder, rows: Array<unknown>) => rows);
  builder.from('users');
  const count = builder.count('column1');
  t.is(count, 1);
  const result = builder.get(['column2', 'column3']);
  t.deepEqual(result.all(), [{column2: 'foo', column3: 'bar'}]);

  autoVerify();
});

test('testAggregateWithSubSelect', t => {
  const builder = getBuilder();
  createMock(builder.getConnection())
    .expects('select')
    .once()
    .withArgs('select count(*) as aggregate from "users"', [])
    .returns([{aggregate: 1}]);
  createMock(builder.getProcessor())
    .expects('processSelect')
    .once()
    .callsFake((query: Builder, results: Array<unknown>) => results);
  builder.from('users').selectSub((query: Builder) => {
    query.from('posts').select('foo', 'bar').where('title', 'foo');
  }, 'post');
  const count = builder.count();
  t.is(count, 1);
  t.is(
    builder.columns[0].getValue(),
    '(select "foo", "bar" from "posts" where "title" = ?) as "post"'
  );
  t.deepEqual(builder.getBindings(), ['foo']);

  autoVerify();
});

test('testSubqueriesBindings', t => {
  let builder = getBuilder();
  const second = getBuilder().select('*').from('users').orderByRaw('id = ?', 2);
  const third = getBuilder()
    .select('*')
    .from('users')
    .where('id', 3)
    .groupBy('id')
    .having('id', '!=', 4);
  builder.groupBy('a').having('a', '=', 1).union(second).union(third);
  t.deepEqual(builder.getBindings(), [1, 2, 3, 4]);

  builder = getBuilder()
    .select('*')
    .from('users')
    .where('email', '=', (query: Builder) => {
      query
        .select(new Raw('max(id)'))
        .from('users')
        .where('email', '=', 'bar')
        .orderByRaw('email like ?', '%.com')
        .groupBy('id')
        .having('id', '=', 4);
    })
    .orWhere('id', '=', 'foo')
    .groupBy('id')
    .having('id', '=', 5);

  t.deepEqual(builder.getBindings(), ['bar', 4, '%.com', 'foo', 5]);
});

test('testInsertMethod', t => {
  const builder = getBuilder();
  createMock(builder.getConnection())
    .expects('insert')
    .once()
    .withArgs('insert into "users" ("email") values (?)', ['foo'])
    .returns(true);
  const result = builder.from('users').insert({email: 'foo'});
  t.true(result);

  autoVerify();
});

test('testInsertUsingMethod', t => {
  const builder = getBuilder();
  createMock(builder.getConnection())
    .expects('affectingStatement')
    .once()
    .withArgs(
      'insert into "table1" ("foo") select "bar" from "table2" where "foreign_id" = ?',
      [5]
    )
    .returns(1);

  const result = builder
    .from('table1')
    .insertUsing(['foo'], (query: Builder) => {
      query.select(['bar']).from('table2').where('foreign_id', '=', 5);
    });

  t.is(result, 1);

  autoVerify();
});

test('testInsertOrIgnoreMethod', t => {
  const error = t.throws(
    () => {
      const builder = getBuilder();
      builder.from('users').insertOrIgnore({email: 'foo'});
    },
    {instanceOf: Error}
  );

  t.true(error.message.includes('RuntimeException'));
  t.true(error.message.includes('does not support'));
});

test('testMySqlInsertOrIgnoreMethod', t => {
  const builder = getMySqlBuilder();
  createMock(builder.getConnection())
    .expects('affectingStatement')
    .once()
    .withArgs('insert ignore into `users` (`email`) values (?)', ['foo'])
    .returns(1);
  const result = builder.from('users').insertOrIgnore({email: 'foo'});
  t.is(result, 1);

  autoVerify();
});

test('testPostgresInsertOrIgnoreMethod', t => {
  const builder = getPostgresBuilder();
  createMock(builder.getConnection())
    .expects('affectingStatement')
    .once()
    .withArgs(
      'insert into "users" ("email") values (?) on conflict do nothing',
      ['foo']
    )
    .returns(1);
  const result = builder.from('users').insertOrIgnore({email: 'foo'});
  t.is(result, 1);

  autoVerify();
});

test('testSQLiteInsertOrIgnoreMethod', async t => {
  const builder = getSQLiteBuilder();
  createMock(builder.getConnection())
    .expects('affectingStatement')
    .once()
    .withArgs('insert or ignore into "users" ("email") values (?)', ['foo'])
    .resolves(1);
  const result = await builder.from('users').insertOrIgnore({email: 'foo'});
  t.is(result, 1);

  autoVerify();
});

test('testSqlServerInsertOrIgnoreMethod', t => {
  const error = t.throws(
    () => {
      const builder = getSqlServerBuilder();
      builder.from('users').insertOrIgnore({email: 'foo'});
    },
    {instanceOf: Error}
  );

  t.true(error.message.includes('RuntimeException'));
  t.true(error.message.includes('does not support'));
});

test('testInsertGetIdMethod', async t => {
  const builder = getBuilder();
  createMock(builder.getProcessor())
    .expects('processInsertGetId')
    .once()
    .withArgs(
      builder,
      'insert into "users" ("email") values (?)',
      ['foo'],
      'id'
    )
    .resolves(1);
  const result = await builder.from('users').insertGetId({email: 'foo'}, 'id');
  t.is(result, 1);

  autoVerify();
});

test('testInsertGetIdMethodRemovesExpressions', async t => {
  const builder = getBuilder();
  createMock(builder.getProcessor())
    .expects('processInsertGetId')
    .once()
    .withArgs(
      builder,
      'insert into "users" ("email", "bar") values (?, bar)',
      ['foo'],
      'id'
    )
    .resolves(1);
  const result = await builder
    .from('users')
    .insertGetId({email: 'foo', bar: new Raw('bar')}, 'id');
  t.is(result, 1);

  autoVerify();
});

test('testInsertGetIdWithEmptyValues', t => {
  let builder = getMySqlBuilder();
  createMock(builder.getProcessor())
    .expects('processInsertGetId')
    .once()
    .withArgs(builder, 'insert into `users` () values ()', [], undefined);
  builder.from('users').insertGetId([]);

  builder = getPostgresBuilder();
  createMock(builder.getProcessor())
    .expects('processInsertGetId')
    .once()
    .withArgs(
      builder,
      'insert into "users" default values returning "id"',
      [],
      undefined
    );
  builder.from('users').insertGetId([]);

  builder = getSQLiteBuilder();
  createMock(builder.getProcessor())
    .expects('processInsertGetId')
    .once()
    .withArgs(builder, 'insert into "users" default values', [], undefined);
  builder.from('users').insertGetId([]);

  builder = getSqlServerBuilder();
  createMock(builder.getProcessor())
    .expects('processInsertGetId')
    .once()
    .withArgs(builder, 'insert into [users] default values', [], undefined);
  builder.from('users').insertGetId([]);

  t.pass();

  autoVerify();
});

test('testInsertMethodRespectsRawBindings', async t => {
  const builder = getBuilder();
  createMock(builder.getConnection())
    .expects('insert')
    .once()
    .withArgs('insert into "users" ("email") values (CURRENT TIMESTAMP)', [])
    .resolves(true);
  const result = await builder
    .from('users')
    .insert({email: new Raw('CURRENT TIMESTAMP')});
  t.true(result);

  autoVerify();
});

test('testMultipleInsertsWithExpressionValues', async t => {
  const builder = getBuilder();
  createMock(builder.getConnection())
    .expects('insert')
    .once()
    .withArgs(
      'insert into "users" ("email") values (UPPER(\'Foo\')), (LOWER(\'Foo\'))',
      []
    )
    .resolves(true);
  const result = await builder
    .from('users')
    .insert([
      {email: new Raw("UPPER('Foo')")},
      {email: new Raw("LOWER('Foo')")},
    ]);
  t.true(result);

  autoVerify();
});

test('testUpdateMethod', async t => {
  let builder = getBuilder();
  createMock(builder.getConnection())
    .expects('update')
    .once()
    .withArgs('update "users" set "email" = ?, "name" = ? where "id" = ?', [
      'foo',
      'bar',
      1,
    ])
    .resolves(1);
  let result = await builder
    .from('users')
    .where('id', '=', 1)
    .update({email: 'foo', name: 'bar'});
  t.is(result, 1);

  builder = getMySqlBuilder();
  createMock(builder.getConnection())
    .expects('update')
    .once()
    .withArgs(
      'update `users` set `email` = ?, `name` = ? where `id` = ? order by `foo` desc limit 5',
      ['foo', 'bar', 1]
    )
    .resolves(1);
  result = await builder
    .from('users')
    .where('id', '=', 1)
    .orderBy('foo', 'desc')
    .limit(5)
    .update({email: 'foo', name: 'bar'});
  t.is(result, 1);

  autoVerify();
});

test('testUpsertMethod', async t => {
  let builder = getMySqlBuilder();
  createMock(builder.getConnection())
    .expects('affectingStatement')
    .once()
    .withArgs(
      'insert into `users` (`email`, `name`) values (?, ?), (?, ?) on duplicate key update `email` = values(`email`), `name` = values(`name`)',
      ['foo', 'bar', 'foo2', 'bar2']
    )
    .resolves(2);
  let result = await builder.from('users').upsert(
    [
      {email: 'foo', name: 'bar'},
      {name: 'bar2', email: 'foo2'},
    ],
    'email'
  );
  t.is(result, 2);

  builder = getPostgresBuilder();
  createMock(builder.getConnection())
    .expects('affectingStatement')
    .once()
    .withArgs(
      'insert into "users" ("email", "name") values (?, ?), (?, ?) on conflict ("email") do update set "email" = "excluded"."email", "name" = "excluded"."name"',
      ['foo', 'bar', 'foo2', 'bar2']
    )
    .resolves(2);
  result = await builder.from('users').upsert(
    [
      {email: 'foo', name: 'bar'},
      {name: 'bar2', email: 'foo2'},
    ],
    'email'
  );
  t.is(result, 2);

  builder = getSQLiteBuilder();
  createMock(builder.getConnection())
    .expects('affectingStatement')
    .once()
    .withArgs(
      'insert into "users" ("email", "name") values (?, ?), (?, ?) on conflict ("email") do update set "email" = "excluded"."email", "name" = "excluded"."name"',
      ['foo', 'bar', 'foo2', 'bar2']
    )
    .resolves(2);
  result = await builder.from('users').upsert(
    [
      {email: 'foo', name: 'bar'},
      {name: 'bar2', email: 'foo2'},
    ],
    'email'
  );
  t.is(result, 2);

  builder = getSqlServerBuilder();
  createMock(builder.getConnection())
    .expects('affectingStatement')
    .once()
    .withArgs(
      'merge [users] using (values (?, ?), (?, ?)) [laravel_source] ([email], [name]) on [laravel_source].[email] = [users].[email] when matched then update set [email] = [laravel_source].[email], [name] = [laravel_source].[name] when not matched then insert ([email], [name]) values ([email], [name]);',
      ['foo', 'bar', 'foo2', 'bar2']
    )
    .resolves(2);
  result = await builder.from('users').upsert(
    [
      {email: 'foo', name: 'bar'},
      {name: 'bar2', email: 'foo2'},
    ],
    'email'
  );
  t.is(result, 2);

  autoVerify();
});

test('testUpsertMethodWithUpdateColumns', async t => {
  let builder = getMySqlBuilder();
  createMock(builder.getConnection())
    .expects('affectingStatement')
    .once()
    .withArgs(
      'insert into `users` (`email`, `name`) values (?, ?), (?, ?) on duplicate key update `name` = values(`name`)',
      ['foo', 'bar', 'foo2', 'bar2']
    )
    .resolves(2);
  let result = await builder.from('users').upsert(
    [
      {email: 'foo', name: 'bar'},
      {name: 'bar2', email: 'foo2'},
    ],
    'email',
    ['name']
  );
  t.is(result, 2);

  builder = getPostgresBuilder();
  createMock(builder.getConnection())
    .expects('affectingStatement')
    .once()
    .withArgs(
      'insert into "users" ("email", "name") values (?, ?), (?, ?) on conflict ("email") do update set "name" = "excluded"."name"',
      ['foo', 'bar', 'foo2', 'bar2']
    )
    .resolves(2);
  result = await builder.from('users').upsert(
    [
      {email: 'foo', name: 'bar'},
      {name: 'bar2', email: 'foo2'},
    ],
    'email',
    ['name']
  );
  t.is(result, 2);

  builder = getSQLiteBuilder();
  createMock(builder.getConnection())
    .expects('affectingStatement')
    .once()
    .withArgs(
      'insert into "users" ("email", "name") values (?, ?), (?, ?) on conflict ("email") do update set "name" = "excluded"."name"',
      ['foo', 'bar', 'foo2', 'bar2']
    )
    .resolves(2);
  result = await builder.from('users').upsert(
    [
      {email: 'foo', name: 'bar'},
      {name: 'bar2', email: 'foo2'},
    ],
    'email',
    ['name']
  );
  t.is(result, 2);

  builder = getSqlServerBuilder();
  createMock(builder.getConnection())
    .expects('affectingStatement')
    .once()
    .withArgs(
      'merge [users] using (values (?, ?), (?, ?)) [laravel_source] ([email], [name]) on [laravel_source].[email] = [users].[email] when matched then update set [name] = [laravel_source].[name] when not matched then insert ([email], [name]) values ([email], [name]);',
      ['foo', 'bar', 'foo2', 'bar2']
    )
    .resolves(2);
  result = await builder.from('users').upsert(
    [
      {email: 'foo', name: 'bar'},
      {name: 'bar2', email: 'foo2'},
    ],
    'email',
    ['name']
  );
  t.is(result, 2);
});

// test('test_name', (t) => {

// });
