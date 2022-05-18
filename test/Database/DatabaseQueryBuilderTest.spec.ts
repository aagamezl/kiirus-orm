import test from 'ava'

import { Builder, JoinClause } from '../../src/Illuminate/Database/Query'
import { Expression as Raw } from './../../src/Illuminate/Database/Query'
import { getBuilder } from './helpers/getBuilder'
import { getMySqlBuilder } from './helpers/getMySqlBuilder'
import { getMySqlBuilderWithProcessor } from './helpers/getMySqlBuilderWithProcessor'
import { getPostgresBuilder } from './helpers/getPostgresBuilder'
import { getPostgresBuilderWithProcessor } from './helpers/getPostgresBuilderWithProcessor'
import { getSQLiteBuilder } from './helpers/getSQLiteBuilder'
import { getSqlServerBuilder } from './helpers/getSqlServerBuilder'
import { mock } from '../helpers/mock'

test('testBasicSelect', (t) => {
  const builder = getBuilder()
  builder.select('*').from('users')

  t.is(builder.toSql(), 'select * from "users"')
})

test('testBasicSelectWithGetColumns', async (t) => {
  const { createMock, verifyMock } = mock()

  const builder = getBuilder()

  const connectionMock = createMock(builder.getConnection())
  createMock(builder.getProcessor()).expects('processSelect').thrice()

  connectionMock.expects('select').once().callsFake((sql: string) => {
    return t.is('select * from "users"', sql)
  }).reset()

  connectionMock.expects('select').once().callsFake((sql: string) => {
    return t.is('select "foo", "bar" from "users"', sql)
  })

  connectionMock.expects('select').once().callsFake((sql: string) => {
    return t.is('select "baz" from "users"', sql)
  })

  await builder.from('users').get()
  t.deepEqual(builder.columns, [])

  await builder.from('users').get(['foo', 'bar'])
  t.deepEqual(builder.columns, [])

  await builder.from('users').get(['baz'])
  t.deepEqual(builder.columns, [])

  t.is(builder.toSql(), 'select * from "users"')
  t.deepEqual(builder.columns, [])

  verifyMock()
})

test('testBasicMySqlSelect', async (t) => {
  const { createMock, verifyMock } = mock()

  let builder = getMySqlBuilderWithProcessor()

  let connectionMock = createMock(builder.getConnection())

  connectionMock.expects('select').once()
    .withArgs('select * from `users`', [])

  await builder.select('*').from('users').get()

  builder = getMySqlBuilderWithProcessor()
  connectionMock = createMock(builder.getConnection())

  connectionMock.expects('select').once()
    .withArgs('select * from `users`', [])

  await builder.select('*').from('users').get()

  t.is('select * from `users`', builder.toSql())

  verifyMock()
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

test('testBasicTableWrapping', (t) => {
  const builder = getBuilder()

  builder.select('*').from('public.users')
  t.is('select * from "public"."users"', builder.toSql())
})

test('testWhenCallback', (t) => {
  const callback = (query: Builder, condition: unknown) => {
    t.true(condition)

    query.where('id', '=', 1)
  }

  let builder = getBuilder()
  builder.select('*').from('users').when(true, callback).where('email', 'foo')
  t.is('select * from "users" where "id" = ? and "email" = ?', builder.toSql())

  builder = getBuilder()
  builder.select('*').from('users').when(false, callback).where('email', 'foo')
  t.is('select * from "users" where "email" = ?', builder.toSql())
})

test('testWhenCallbackWithReturn', (t) => {
  const callback = (query: Builder, condition: unknown) => {
    t.true(condition)

    return query.where('id', '=', 1)
  }

  let builder = getBuilder()
  builder.select('*').from('users').when(true, callback).where('email', 'foo')
  t.is('select * from "users" where "id" = ? and "email" = ?', builder.toSql())

  builder = getBuilder()
  builder.select('*').from('users').when(false, callback).where('email', 'foo')
  t.is('select * from "users" where "email" = ?', builder.toSql())
})

test('testWhenCallbackWithDefault', (t) => {
  const callback = (query: Builder, condition: string) => {
    t.is('truthy', condition)

    query.where('id', '=', 1)
  }

  const defaultCallback = (query: Builder, condition: number) => {
    t.is(0, condition)

    query.where('id', '=', 2)
  }

  let builder = getBuilder()
  builder.select('*').from('users').when('truthy', callback, defaultCallback).where('email', 'foo')
  t.is('select * from "users" where "id" = ? and "email" = ?', builder.toSql())
  t.deepEqual([1, 'foo'], builder.getBindings())

  builder = getBuilder()
  builder.select('*').from('users').when(0, callback, defaultCallback).where('email', 'foo')
  t.is('select * from "users" where "id" = ? and "email" = ?', builder.toSql())
  t.deepEqual([2, 'foo'], builder.getBindings())
})

test('testUnlessCallback', (t) => {
  const callback = (query: Builder, condition: unknown) => {
    t.false(condition)

    query.where('id', '=', 1)
  }

  let builder = getBuilder()
  builder.select('*').from('users').unless(false, callback).where('email', 'foo')
  t.is('select * from "users" where "id" = ? and "email" = ?', builder.toSql())

  builder = getBuilder()
  builder.select('*').from('users').unless(true, callback).where('email', 'foo')
  t.is('select * from "users" where "email" = ?', builder.toSql())
})

test('testUnlessCallbackWithReturn', (t) => {
  const callback = (query: Builder, condition: boolean) => {
    t.false(condition)

    return query.where('id', '=', 1)
  }

  let builder = getBuilder()
  builder.select('*').from('users').unless(false, callback).where('email', 'foo')
  t.is('select * from "users" where "id" = ? and "email" = ?', builder.toSql())

  builder = getBuilder()
  builder.select('*').from('users').unless(true, callback).where('email', 'foo')
  t.is('select * from "users" where "email" = ?', builder.toSql())
})

test('testUnlessCallbackWithDefault', (t) => {
  const callback = (query: Builder, condition: number) => {
    t.is(0, condition)

    query.where('id', '=', 1)
  }

  const defaultCallback = (query: Builder, condition: string) => {
    t.is('truthy', condition)

    query.where('id', '=', 2)
  }

  let builder = getBuilder()
  builder.select('*').from('users').unless(0, callback, defaultCallback).where('email', 'foo')
  t.is('select * from "users" where "id" = ? and "email" = ?', builder.toSql())
  t.deepEqual([1, 'foo'], builder.getBindings())

  builder = getBuilder()
  builder.select('*').from('users').unless('truthy', callback, defaultCallback).where('email', 'foo')
  t.is('select * from "users" where "id" = ? and "email" = ?', builder.toSql())
  t.deepEqual([2, 'foo'], builder.getBindings())
})

test('testTapCallback', (t) => {
  const callback = (query: Builder) => {
    return query.where('id', '=', 1)
  }

  const builder = getBuilder()
  builder.select('*').from('users').tap(callback).where('email', 'foo')
  t.is('select * from "users" where "id" = ? and "email" = ?', builder.toSql())
})

test('testBasicWheres', (t) => {
  const builder = getBuilder()
  builder.select('*').from('users').where('id', '=', 1)
  t.is('select * from "users" where "id" = ?', builder.toSql())
  t.deepEqual([1], builder.getBindings())
})

test('testBasicWheresInvalidOperator', (t) => {
  const builder = getBuilder()
  builder.select('*').from('users').where('id', '#', 1)
  t.is('select * from "users" where "id" = ?', builder.toSql())
  t.deepEqual(['#'], builder.getBindings())
})

test('testWheresWithArrayValue', (t) => {
  let builder = getBuilder()
  builder.select('*').from('users').where('id', [12])
  t.is('select * from "users" where "id" = ?', builder.toSql())
  t.deepEqual([12], builder.getBindings())

  builder = getBuilder()
  builder.select('*').from('users').where('id', '=', [12, 30])
  t.is('select * from "users" where "id" = ?', builder.toSql())
  t.deepEqual([12], builder.getBindings())

  builder = getBuilder()
  builder.select('*').from('users').where('id', '!=', [12, 30])
  t.is('select * from "users" where "id" != ?', builder.toSql())
  t.deepEqual([12], builder.getBindings())

  builder = getBuilder()
  builder.select('*').from('users').where('id', '<>', [12, 30])
  t.is('select * from "users" where "id" <> ?', builder.toSql())
  t.deepEqual([12], builder.getBindings())

  builder = getBuilder()
  builder.select('*').from('users').where('id', '=', [[12, 30]])
  t.is('select * from "users" where "id" = ?', builder.toSql())
  t.deepEqual([12], builder.getBindings())
})

test('testMySqlWrappingProtectsQuotationMarks', (t) => {
  const builder = getMySqlBuilder()
  builder.select('*').from('some`table')
  t.is('select * from `some``table`', builder.toSql())
})

test('testDateBasedWheresAcceptsTwoArguments', (t) => {
  let builder = getMySqlBuilder()
  builder.select('*').from('users').whereDate('created_at', 1)
  t.is('select * from `users` where date(`created_at`) = ?', builder.toSql())

  builder = getMySqlBuilder()
  builder.select('*').from('users').whereDate('created_at', new Date('2021/08/07'))
  t.is('select * from `users` where date(`created_at`) = ?', builder.toSql())
  t.deepEqual(['2021-08-07'], builder.getBindings())

  builder = getMySqlBuilder()
  builder.select('*').from('users').whereDay('created_at', 1)
  t.is('select * from `users` where day(`created_at`) = ?', builder.toSql())

  builder = getMySqlBuilder()
  builder.select('*').from('users').whereDay('created_at', new Date('2021/08/07'))
  t.is('select * from `users` where day(`created_at`) = ?', builder.toSql())
  t.deepEqual(['07'], builder.getBindings())

  builder = getMySqlBuilder()
  builder.select('*').from('users').whereMonth('created_at', 1)
  t.is('select * from `users` where month(`created_at`) = ?', builder.toSql())

  builder = getMySqlBuilder()
  builder.select('*').from('users').whereYear('created_at', 1)
  t.is('select * from `users` where year(`created_at`) = ?', builder.toSql())

  builder = getMySqlBuilder()
  builder.select('*').from('users').whereYear('created_at', new Date('2021/08/07'))
  t.is('select * from `users` where year(`created_at`) = ?', builder.toSql())
  t.deepEqual(['2021'], builder.getBindings())
})

test('testDateBasedOrWheresAcceptsTwoArguments', (t) => {
  let builder = getMySqlBuilder()
  builder.select('*').from('users').where('id', 1).orWhereDate('created_at', 1)
  t.is('select * from `users` where `id` = ? or date(`created_at`) = ?', builder.toSql())

  builder = getMySqlBuilder()
  builder.select('*').from('users').where('id', 1).orWhereDay('created_at', 1)
  t.is('select * from `users` where `id` = ? or day(`created_at`) = ?', builder.toSql())

  builder = getMySqlBuilder()
  builder.select('*').from('users').where('id', 1).orWhereMonth('created_at', 1)
  t.is('select * from `users` where `id` = ? or month(`created_at`) = ?', builder.toSql())

  builder = getMySqlBuilder()
  builder.select('*').from('users').where('id', 1).orWhereYear('created_at', 1)
  t.is('select * from `users` where `id` = ? or year(`created_at`) = ?', builder.toSql())
})

test('testDateBasedWheresExpressionIsNotBound', (t) => {
  let builder = getBuilder()
  builder.select('*').from('users').whereDate('created_at', new Raw('NOW()')).where('admin', true)
  t.deepEqual([true], builder.getBindings())

  builder = getBuilder()
  builder.select('*').from('users').whereDay('created_at', new Raw('NOW()'))
  t.deepEqual([], builder.getBindings())

  builder = getBuilder()
  builder.select('*').from('users').whereMonth('created_at', new Raw('NOW()'))
  t.deepEqual([], builder.getBindings())

  builder = getBuilder()
  builder.select('*').from('users').whereYear('created_at', new Raw('NOW()'))
  t.deepEqual([], builder.getBindings())
})

test('testWhereDateMySql', (t) => {
  let builder = getMySqlBuilder()
  builder.select('*').from('users').whereDate('created_at', '=', '2015-12-21')
  t.is('select * from `users` where date(`created_at`) = ?', builder.toSql())
  t.deepEqual(['2015-12-21'], builder.getBindings())

  builder = getMySqlBuilder()
  builder.select('*').from('users').whereDate('created_at', '=', new Raw('NOW()'))
  t.is('select * from `users` where date(`created_at`) = NOW()', builder.toSql())
})

test('testWhereDayMySql', (t) => {
  const builder = getMySqlBuilder()
  builder.select('*').from('users').whereDay('created_at', '=', 1)
  t.is('select * from `users` where day(`created_at`) = ?', builder.toSql())
  t.deepEqual([1], builder.getBindings())
})

test('testOrWhereDayMySql', (t) => {
  const builder = getMySqlBuilder()
  builder.select('*').from('users').whereDay('created_at', '=', 1).orWhereDay('created_at', '=', 2)
  t.is('select * from `users` where day(`created_at`) = ? or day(`created_at`) = ?', builder.toSql())
  t.deepEqual([1, 2], builder.getBindings())
})

test('testWhereMonthMySql', (t) => {
  let builder = getMySqlBuilder()
  builder.select('*').from('users').whereMonth('created_at', '=', 5)
  t.is('select * from `users` where month(`created_at`) = ?', builder.toSql())
  t.deepEqual(['05'], builder.getBindings())

  builder = getMySqlBuilder()
  builder.select('*').from('users').whereMonth('created_at', '=', new Date('2021/08/10'))
  t.is('select * from `users` where month(`created_at`) = ?', builder.toSql())
  t.deepEqual(['08'], builder.getBindings())
})

test('testOrWhereMonthMySql', (t) => {
  const builder = getMySqlBuilder()
  builder.select('*').from('users').whereMonth('created_at', '=', 5).orWhereMonth('created_at', '=', 6)
  t.is('select * from `users` where month(`created_at`) = ? or month(`created_at`) = ?', builder.toSql())
  t.deepEqual(['05', '06'], builder.getBindings())
})

test('testWhereYearMySql', (t) => {
  const builder = getMySqlBuilder()
  builder.select('*').from('users').whereYear('created_at', '=', 2014)
  t.is('select * from `users` where year(`created_at`) = ?', builder.toSql())
  t.deepEqual([2014], builder.getBindings())
})

test('testOrWhereYearMySql', (t) => {
  const builder = getMySqlBuilder()
  builder.select('*').from('users').whereYear('created_at', '=', 2014).orWhereYear('created_at', '=', 2015)
  t.is('select * from `users` where year(`created_at`) = ? or year(`created_at`) = ?', builder.toSql())
  t.deepEqual([2014, 2015], builder.getBindings())
})

test('testWhereTimeMySql', (t) => {
  let builder = getMySqlBuilder()
  builder.select('*').from('users').whereTime('created_at', '>=', '22:00')
  t.is('select * from `users` where time(`created_at`) >= ?', builder.toSql())
  t.deepEqual(['22:00'], builder.getBindings())

  builder = getMySqlBuilder()
  builder.select('*').from('users').whereTime('created_at', '>=', new Date('2021-08-10T22:00:09'))
  t.is('select * from `users` where time(`created_at`) >= ?', builder.toSql())
  t.deepEqual(['22:00:09'], builder.getBindings())
})

test('testWhereTimeOperatorOptionalMySql', (t) => {
  const builder = getMySqlBuilder()
  builder.select('*').from('users').whereTime('created_at', '22:00')
  t.is('select * from `users` where time(`created_at`) = ?', builder.toSql())
  t.deepEqual(['22:00'], builder.getBindings())
})

test('testWhereTimeOperatorOptionalPostgres', (t) => {
  const builder = getPostgresBuilder()
  builder.select('*').from('users').whereTime('created_at', '22:00')
  t.is('select * from "users" where "created_at"::time = ?', builder.toSql())
  t.deepEqual(['22:00'], builder.getBindings())
})

test('testWhereDatePostgres', (t) => {
  let builder = getPostgresBuilder()
  builder.select('*').from('users').whereDate('created_at', '=', '2015-12-21')
  t.is('select * from "users" where "created_at"::date = ?', builder.toSql())
  t.deepEqual(['2015-12-21'], builder.getBindings())

  builder = getPostgresBuilder()
  builder.select('*').from('users').whereDate('created_at', new Raw('NOW()'))
  t.is('select * from "users" where "created_at"::date = NOW()', builder.toSql())
})

test('testWhereDayPostgres', (t) => {
  const builder = getPostgresBuilder()
  builder.select('*').from('users').whereDay('created_at', '=', 1)

  t.is('select * from "users" where extract(day from "created_at") = ?', builder.toSql())
  t.deepEqual([1], builder.getBindings())
})

test('testWhereMonthPostgres', (t) => {
  const builder = getPostgresBuilder()
  builder.select('*').from('users').whereMonth('created_at', '=', 5)

  t.is('select * from "users" where extract(month from "created_at") = ?', builder.toSql())
  t.deepEqual(['05'], builder.getBindings())
})

test('testWhereYearPostgres', (t) => {
  const builder = getPostgresBuilder()
  builder.select('*').from('users').whereYear('created_at', '=', 2014)

  t.is('select * from "users" where extract(year from "created_at") = ?', builder.toSql())
  t.deepEqual([2014], builder.getBindings())
})

test('testWhereTimePostgres', (t) => {
  const builder = getPostgresBuilder()
  builder.select('*').from('users').whereTime('created_at', '>=', '22:00')

  t.is('select * from "users" where "created_at"::time >= ?', builder.toSql())
  t.deepEqual(['22:00'], builder.getBindings())
})

test('testWhereLikePostgres', (t) => {
  let builder = getPostgresBuilder()
  builder.select('*').from('users').where('id', 'like', '1')

  t.is('select * from "users" where "id"::text like ?', builder.toSql())
  t.deepEqual(['1'], builder.getBindings())

  builder = getPostgresBuilder()
  builder.select('*').from('users').where('id', 'LIKE', '1')
  t.is('select * from "users" where "id"::text LIKE ?', builder.toSql())
  t.deepEqual(['1'], builder.getBindings())

  builder = getPostgresBuilder()
  builder.select('*').from('users').where('id', 'ilike', '1')

  t.is('select * from "users" where "id"::text ilike ?', builder.toSql())
  t.deepEqual(['1'], builder.getBindings())

  builder = getPostgresBuilder()
  builder.select('*').from('users').where('id', 'not like', '1')

  t.is('select * from "users" where "id"::text not like ?', builder.toSql())
  t.deepEqual(['1'], builder.getBindings())

  builder = getPostgresBuilder()
  builder.select('*').from('users').where('id', 'not ilike', '1')

  t.is('select * from "users" where "id"::text not ilike ?', builder.toSql())
  t.deepEqual(['1'], builder.getBindings())
})

test('testWhereDateSqlite', (t) => {
  let builder = getSQLiteBuilder()
  builder.select('*').from('users').whereDate('created_at', '=', '2015-12-21')

  t.is('select * from "users" where strftime(\'%Y-%m-%d\', "created_at") = cast(? as text)', builder.toSql())
  t.deepEqual(['2015-12-21'], builder.getBindings())

  builder = getSQLiteBuilder()
  builder.select('*').from('users').whereDate('created_at', new Raw('NOW()'))
  t.is('select * from "users" where strftime(\'%Y-%m-%d\', "created_at") = cast(NOW() as text)', builder.toSql())
})

test('testWhereDaySqlite', (t) => {
  const builder = getSQLiteBuilder()
  builder.select('*').from('users').whereDay('created_at', '=', 1)

  t.is('select * from "users" where strftime(\'%d\', "created_at") = cast(? as text)', builder.toSql())
  t.deepEqual([1], builder.getBindings())
})

test('testWhereMonthSqlite', (t) => {
  const builder = getSQLiteBuilder()
  builder.select('*').from('users').whereMonth('created_at', '=', 5)
  t.is('select * from "users" where strftime(\'%m\', "created_at") = cast(? as text)', builder.toSql())
  t.deepEqual(['05'], builder.getBindings())
})

test('testWhereYearSqlite', (t) => {
  const builder = getSQLiteBuilder()
  builder.select('*').from('users').whereYear('created_at', '=', 2014)
  t.is('select * from "users" where strftime(\'%Y\', "created_at") = cast(? as text)', builder.toSql())
  t.deepEqual([2014], builder.getBindings())
})

test('testWhereTimeSqlite', (t) => {
  const builder = getSQLiteBuilder()
  builder.select('*').from('users').whereTime('created_at', '>=', '22:00')
  t.is('select * from "users" where strftime(\'%H:%M:%S\', "created_at") >= cast(? as text)', builder.toSql())
  t.deepEqual(['22:00'], builder.getBindings())
})

test('testWhereTimeOperatorOptionalSqlite', (t) => {
  const builder = getSQLiteBuilder()
  builder.select('*').from('users').whereTime('created_at', '22:00')
  t.is('select * from "users" where strftime(\'%H:%M:%S\', "created_at") = cast(? as text)', builder.toSql())
  t.deepEqual(['22:00'], builder.getBindings())
})

test('testWhereTimeSqlServer', (t) => {
  let builder = getSqlServerBuilder()
  builder.select('*').from('users').whereTime('created_at', '22:00')
  t.is('select * from [users] where cast([created_at] as time) = ?', builder.toSql())
  t.deepEqual(['22:00'], builder.getBindings())

  builder = getSqlServerBuilder()
  builder.select('*').from('users').whereTime('created_at', new Raw('NOW()'))
  t.is('select * from [users] where cast([created_at] as time) = NOW()', builder.toSql())
  t.deepEqual([], builder.getBindings())
})

test('testWhereDateSqlServer', (t) => {
  let builder = getSqlServerBuilder()
  builder.select('*').from('users').whereDate('created_at', '=', '2015-12-21')
  t.is('select * from [users] where cast([created_at] as date) = ?', builder.toSql())
  t.deepEqual(['2015-12-21'], builder.getBindings())

  builder = getSqlServerBuilder()
  builder.select('*').from('users').whereDate('created_at', new Raw('NOW()'))
  t.is('select * from [users] where cast([created_at] as date) = NOW()', builder.toSql())
})

test('testWhereDaySqlServer', (t) => {
  const builder = getSqlServerBuilder()
  builder.select('*').from('users').whereDay('created_at', '=', 1)
  t.is('select * from [users] where day([created_at]) = ?', builder.toSql())
  t.deepEqual([1], builder.getBindings())
})

test('testWhereMonthSqlServer', (t) => {
  const builder = getSqlServerBuilder()
  builder.select('*').from('users').whereMonth('created_at', '=', 5)
  t.is('select * from [users] where month([created_at]) = ?', builder.toSql())
  t.deepEqual(['05'], builder.getBindings())
})

test('testWhereYearSqlServer', (t) => {
  const builder = getSqlServerBuilder()
  builder.select('*').from('users').whereYear('created_at', '=', 2014)
  t.is('select * from [users] where year([created_at]) = ?', builder.toSql())
  t.deepEqual([2014], builder.getBindings())
})

test('testWhereBetweens', (t) => {
  let builder = getBuilder()
  builder.select('*').from('users').whereBetween('id', [1, 2])
  t.is('select * from "users" where "id" between ? and ?', builder.toSql())
  t.deepEqual([1, 2], builder.getBindings())

  builder = getBuilder()
  builder.select('*').from('users').whereBetween('id', [[1, 2, 3]])
  t.is('select * from "users" where "id" between ? and ?', builder.toSql())
  t.deepEqual([1, 2], builder.getBindings())

  builder = getBuilder()
  builder.select('*').from('users').whereBetween('id', [[1], [2, 3]])
  t.is('select * from "users" where "id" between ? and ?', builder.toSql())
  t.deepEqual([1, 2], builder.getBindings())

  builder = getBuilder()
  builder.select('*').from('users').whereNotBetween('id', [1, 2])
  t.is('select * from "users" where "id" not between ? and ?', builder.toSql())
  t.deepEqual([1, 2], builder.getBindings())

  builder = getBuilder()
  builder.select('*').from('users').whereBetween('id', [new Raw(1), new Raw(2)])
  t.is('select * from "users" where "id" between 1 and 2', builder.toSql())
  t.deepEqual([], builder.getBindings())
})

test('testWhereBetweenColumns', (t) => {
  let builder = getBuilder()
  builder.select('*').from('users').whereBetweenColumns('id', ['users.created_at', 'users.updated_at'])
  t.is('select * from "users" where "id" between "users"."created_at" and "users"."updated_at"', builder.toSql())
  t.deepEqual([], builder.getBindings())

  builder = getBuilder()
  builder.select('*').from('users').whereNotBetweenColumns('id', ['created_at', 'updated_at'])
  t.is('select * from "users" where "id" not between "created_at" and "updated_at"', builder.toSql())
  t.deepEqual([], builder.getBindings())

  builder = getBuilder()
  builder.select('*').from('users').whereBetweenColumns('id', [new Raw(1), new Raw(2)])
  t.is('select * from "users" where "id" between 1 and 2', builder.toSql())
  t.deepEqual([], builder.getBindings())
})

test('testBasicOrWheres', (t) => {
  const builder = getBuilder()
  builder.select('*').from('users').where('id', '=', 1).orWhere('email', '=', 'foo')
  t.is('select * from "users" where "id" = ? or "email" = ?', builder.toSql())
  t.deepEqual([1, 'foo'], builder.getBindings())
})

test('testRawWheres', (t) => {
  const builder = getBuilder()
  builder.select('*').from('users').whereRaw('id = ? or email = ?', [1, 'foo'])
  t.is('select * from "users" where id = ? or email = ?', builder.toSql())
  t.deepEqual([1, 'foo'], builder.getBindings())
})

test('testRawOrWheres', (t) => {
  const builder = getBuilder()
  builder.select('*').from('users').where('id', '=', 1).orWhereRaw('email = ?', ['foo'])
  t.is('select * from "users" where "id" = ? or email = ?', builder.toSql())
  t.deepEqual([1, 'foo'], builder.getBindings())
})

test('testBasicWhereIns', (t) => {
  let builder = getBuilder()
  builder.select('*').from('users').whereIn('id', [1, 2, 3])
  t.is('select * from "users" where "id" in (?, ?, ?)', builder.toSql())
  t.deepEqual([1, 2, 3], builder.getBindings())

  builder = getBuilder()
  builder.select('*').from('users').where('id', '=', 1).orWhereIn('id', [1, 2, 3])
  t.is('select * from "users" where "id" = ? or "id" in (?, ?, ?)', builder.toSql())
  t.deepEqual([1, 1, 2, 3], builder.getBindings())
})

test('testBasicWhereNotIns', (t) => {
  let builder = getBuilder()
  builder.select('*').from('users').whereNotIn('id', [1, 2, 3])
  t.is('select * from "users" where "id" not in (?, ?, ?)', builder.toSql())
  t.deepEqual([1, 2, 3], builder.getBindings())

  builder = getBuilder()
  builder.select('*').from('users').where('id', '=', 1).orWhereNotIn('id', [1, 2, 3])
  t.is('select * from "users" where "id" = ? or "id" not in (?, ?, ?)', builder.toSql())
  t.deepEqual([1, 1, 2, 3], builder.getBindings())
})

test('testRawWhereIns', (t) => {
  let builder = getBuilder()
  builder.select('*').from('users').whereIn('id', [new Raw(1)])
  t.is('select * from "users" where "id" in (1)', builder.toSql())

  builder = getBuilder()
  builder.select('*').from('users').where('id', '=', 1).orWhereIn('id', [new Raw(1)])
  t.is('select * from "users" where "id" = ? or "id" in (1)', builder.toSql())
  t.deepEqual([1], builder.getBindings())
})

test('testEmptyWhereIns', (t) => {
  let builder = getBuilder()
  builder.select('*').from('users').whereIn('id', [])
  t.is('select * from "users" where 0 = 1', builder.toSql())
  t.deepEqual([], builder.getBindings())

  builder = getBuilder()
  builder.select('*').from('users').where('id', '=', 1).orWhereIn('id', [])
  t.is('select * from "users" where "id" = ? or 0 = 1', builder.toSql())
  t.deepEqual([1], builder.getBindings())
})

test('testEmptyWhereNotIns', (t) => {
  let builder = getBuilder()
  builder.select('*').from('users').whereNotIn('id', [])
  t.is('select * from "users" where 1 = 1', builder.toSql())
  t.deepEqual([], builder.getBindings())

  builder = getBuilder()
  builder.select('*').from('users').where('id', '=', 1).orWhereNotIn('id', [])
  t.is('select * from "users" where "id" = ? or 1 = 1', builder.toSql())
  t.deepEqual([1], builder.getBindings())
})

test('testWhereIntegerInRaw', (t) => {
  const builder = getBuilder()
  builder.select('*').from('users').whereIntegerInRaw('id', ['1a', 2])
  t.is('select * from "users" where "id" in (1, 2)', builder.toSql())
  t.deepEqual([], builder.getBindings())
})

test('testOrWhereIntegerInRaw', (t) => {
  const builder = getBuilder()
  builder.select('*').from('users').where('id', '=', 1).orWhereIntegerInRaw('id', ['1a', 2])
  t.is('select * from "users" where "id" = ? or "id" in (1, 2)', builder.toSql())
  t.deepEqual([1], builder.getBindings())
})

test('testWhereIntegerNotInRaw', (t) => {
  const builder = getBuilder()
  builder.select('*').from('users').whereIntegerNotInRaw('id', ['1a', 2])
  t.is('select * from "users" where "id" not in (1, 2)', builder.toSql())
  t.deepEqual([], builder.getBindings())
})

test('testOrWhereIntegerNotInRaw', (t) => {
  const builder = getBuilder()
  builder.select('*').from('users').where('id', '=', 1).orWhereIntegerNotInRaw('id', ['1a', 2])
  t.is('select * from "users" where "id" = ? or "id" not in (1, 2)', builder.toSql())
  t.deepEqual([1], builder.getBindings())
})

test('testEmptyWhereIntegerInRaw', (t) => {
  const builder = getBuilder()
  builder.select('*').from('users').whereIntegerInRaw('id', [])
  t.is('select * from "users" where 0 = 1', builder.toSql())
  t.deepEqual([], builder.getBindings())
})

test('testEmptyWhereIntegerNotInRaw', (t) => {
  const builder = getBuilder()
  builder.select('*').from('users').whereIntegerNotInRaw('id', [])
  t.is('select * from "users" where 1 = 1', builder.toSql())
  t.deepEqual([], builder.getBindings())
})

test('testBasicWhereColumn', (t) => {
  let builder = getBuilder()
  builder.select('*').from('users').whereColumn('first_name', 'last_name').orWhereColumn('first_name', 'middle_name')
  t.is('select * from "users" where "first_name" = "last_name" or "first_name" = "middle_name"', builder.toSql())
  t.deepEqual([], builder.getBindings())

  builder = getBuilder()
  builder.select('*').from('users').whereColumn('updated_at', '>', 'created_at')
  t.is('select * from "users" where "updated_at" > "created_at"', builder.toSql())
  t.deepEqual([], builder.getBindings())
})

test('testArrayWhereColumn', (t) => {
  const conditions = [
    ['first_name', 'last_name'],
    ['updated_at', '>', 'created_at']
  ]

  const builder = getBuilder()
  builder.select('*').from('users').whereColumn(conditions)
  t.is('select * from "users" where ("first_name" = "last_name" and "updated_at" > "created_at")', builder.toSql())
  t.deepEqual([], builder.getBindings())
})

test('testWhereFulltextMySql', t => {
  let builder = getMySqlBuilderWithProcessor();
  builder.select('*').from('users').whereFulltext('body', 'Hello World')
  t.is('select * from `users` where match (`body`) against (? in natural language mode)', builder.toSql())
  t.deepEqual(['Hello World'], builder.getBindings())

  builder = getMySqlBuilderWithProcessor()
  builder.select('*').from('users').whereFulltext('body', 'Hello World', { expanded: true })
  t.is('select * from `users` where match (`body`) against (? in natural language mode with query expansion)', builder.toSql())
  t.deepEqual(['Hello World'], builder.getBindings())

  builder = getMySqlBuilderWithProcessor()
  builder.select('*').from('users').whereFulltext('body', '+Hello -World', { mode: 'boolean' })
  t.is('select * from `users` where match (`body`) against (? in boolean mode)', builder.toSql())
  t.deepEqual(['+Hello -World'], builder.getBindings())

  builder = getMySqlBuilderWithProcessor()
  builder.select('*').from('users').whereFulltext('body', '+Hello -World', { mode: 'boolean', expanded: true })
  t.is('select * from `users` where match (`body`) against (? in boolean mode)', builder.toSql())
  t.deepEqual(['+Hello -World'], builder.getBindings())

  builder = getMySqlBuilderWithProcessor()
  builder.select('*').from('users').whereFulltext(['body', 'title'], 'Car,Plane')
  t.is('select * from `users` where match (`body`, `title`) against (? in natural language mode)', builder.toSql())
  t.deepEqual(['Car,Plane'], builder.getBindings())
})

test('testWhereFulltextPostgres', t => {
  let builder = getPostgresBuilderWithProcessor()
  builder.select('*').from('users').whereFulltext('body', 'Hello World')
  t.is('select * from "users" where (to_tsvector(\'english\', "body")) @@ plainto_tsquery(\'english\', ?)', builder.toSql())
  t.deepEqual(['Hello World'], builder.getBindings())

  builder = getPostgresBuilderWithProcessor()
  builder.select('*').from('users').whereFulltext('body', 'Hello World', { language: 'simple' })
  t.is('select * from "users" where (to_tsvector(\'simple\', "body")) @@ plainto_tsquery(\'simple\', ?)', builder.toSql())
  t.deepEqual(['Hello World'], builder.getBindings())

  builder = getPostgresBuilderWithProcessor()
  builder.select('*').from('users').whereFulltext('body', 'Hello World', { mode: 'plain' })
  t.is('select * from "users" where (to_tsvector(\'english\', "body")) @@ plainto_tsquery(\'english\', ?)', builder.toSql())
  t.deepEqual(['Hello World'], builder.getBindings())

  builder = getPostgresBuilderWithProcessor()
  builder.select('*').from('users').whereFulltext('body', 'Hello World', { mode: 'phrase' })
  t.is('select * from "users" where (to_tsvector(\'english\', "body")) @@ phraseto_tsquery(\'english\', ?)', builder.toSql())
  t.deepEqual(['Hello World'], builder.getBindings())

  builder = getPostgresBuilderWithProcessor()
  builder.select('*').from('users').whereFulltext('body', '+Hello -World', { mode: 'websearch' })
  t.is('select * from "users" where (to_tsvector(\'english\', "body")) @@ websearch_to_tsquery(\'english\', ?)', builder.toSql())
  t.deepEqual(['+Hello -World'], builder.getBindings())

  builder = getPostgresBuilderWithProcessor()
  builder.select('*').from('users').whereFulltext('body', 'Hello World', { language: 'simple', mode: 'plain' })
  t.is('select * from "users" where (to_tsvector(\'simple\', "body")) @@ plainto_tsquery(\'simple\', ?)', builder.toSql())
  t.deepEqual(['Hello World'], builder.getBindings())

  builder = getPostgresBuilderWithProcessor()
  builder.select('*').from('users').whereFulltext(['body', 'title'], 'Car Plane')
  t.is('select * from "users" where (to_tsvector(\'english\', "body") || to_tsvector(\'english\', "title")) @@ plainto_tsquery(\'english\', ?)', builder.toSql())
  t.deepEqual(['Car Plane'], builder.getBindings())
})

test('testUnions', (t) => {
  let builder = getBuilder()
  builder.select('*').from('users').where('id', '=', 1)
  builder.union(getBuilder().select('*').from('users').where('id', '=', 2))
  t.is('(select * from "users" where "id" = ?) union (select * from "users" where "id" = ?)', builder.toSql())
  t.deepEqual([1, 2], builder.getBindings())

  builder = getMySqlBuilder()
  builder.select('*').from('users').where('id', '=', 1)
  builder.union(getMySqlBuilder().select('*').from('users').where('id', '=', 2))
  t.is('(select * from `users` where `id` = ?) union (select * from `users` where `id` = ?)', builder.toSql())
  t.deepEqual([1, 2], builder.getBindings())

  builder = getMySqlBuilder()
  let expectedSql = '(select `a` from `t1` where `a` = ? and `b` = ?) union (select `a` from `t2` where `a` = ? and `b` = ?) order by `a` asc limit 10'
  const union = getMySqlBuilder().select('a').from('t2').where('a', 11).where('b', 2)
  builder.select('a').from('t1').where('a', 10).where('b', 1).union(union).orderBy('a').limit(10)
  t.deepEqual(expectedSql, builder.toSql())
  t.deepEqual([10, 1, 11, 2], builder.getBindings())

  builder = getPostgresBuilder()
  expectedSql = '(select "name" from "users" where "id" = ?) union (select "name" from "users" where "id" = ?)'
  builder.select('name').from('users').where('id', '=', 1)
  builder.union(getPostgresBuilder().select('name').from('users').where('id', '=', 2))
  t.deepEqual(expectedSql, builder.toSql())
  t.deepEqual([1, 2], builder.getBindings())

  builder = getSQLiteBuilder()
  expectedSql = 'select * from (select "name" from "users" where "id" = ?) union select * from (select "name" from "users" where "id" = ?)'
  builder.select('name').from('users').where('id', '=', 1)
  builder.union(getSQLiteBuilder().select('name').from('users').where('id', '=', 2))
  t.deepEqual(expectedSql, builder.toSql())
  t.deepEqual([1, 2], builder.getBindings())

  builder = getSqlServerBuilder()
  expectedSql = 'select * from (select [name] from [users] where [id] = ?) as [temp_table] union select * from (select [name] from [users] where [id] = ?) as [temp_table]'
  builder.select('name').from('users').where('id', '=', 1)
  builder.union(getSqlServerBuilder().select('name').from('users').where('id', '=', 2))
  t.deepEqual(expectedSql, builder.toSql())
  t.deepEqual([1, 2], builder.getBindings())
})

test('testUnionAlls', (t) => {
  let builder = getBuilder()
  builder.select('*').from('users').where('id', '=', 1)
  builder.unionAll(getBuilder().select('*').from('users').where('id', '=', 2))
  t.is('(select * from "users" where "id" = ?) union all (select * from "users" where "id" = ?)', builder.toSql())
  t.deepEqual([1, 2], builder.getBindings())

  const expectedSql = '(select * from "users" where "id" = ?) union all (select * from "users" where "id" = ?)'
  builder = getPostgresBuilder()
  builder.select('*').from('users').where('id', '=', 1)
  builder.unionAll(getBuilder().select('*').from('users').where('id', '=', 2))
  t.is(expectedSql, builder.toSql())
  t.deepEqual([1, 2], builder.getBindings())
})

test('testMultipleUnions', (t) => {
  const builder = getBuilder()
  builder.select('*').from('users').where('id', '=', 1)
  builder.union(getBuilder().select('*').from('users').where('id', '=', 2))
  builder.union(getBuilder().select('*').from('users').where('id', '=', 3))
  t.is('(select * from "users" where "id" = ?) union (select * from "users" where "id" = ?) union (select * from "users" where "id" = ?)', builder.toSql())
  t.deepEqual([1, 2, 3], builder.getBindings())
})

test('testMultipleUnionAlls', (t) => {
  const builder = getBuilder()
  builder.select('*').from('users').where('id', '=', 1)
  builder.unionAll(getBuilder().select('*').from('users').where('id', '=', 2))
  builder.unionAll(getBuilder().select('*').from('users').where('id', '=', 3))
  t.is('(select * from "users" where "id" = ?) union all (select * from "users" where "id" = ?) union all (select * from "users" where "id" = ?)', builder.toSql())
  t.deepEqual([1, 2, 3], builder.getBindings())
})

test('testUnionOrderBys', (t) => {
  const builder = getBuilder()
  builder.select('*').from('users').where('id', '=', 1)
  builder.union(getBuilder().select('*').from('users').where('id', '=', 2))
  builder.orderBy('id', 'desc')

  t.is('(select * from "users" where "id" = ?) union (select * from "users" where "id" = ?) order by "id" desc', builder.toSql())
  t.deepEqual([1, 2], builder.getBindings())
})

test('testUnionLimitsAndOffsets', (t) => {
  let builder = getBuilder()
  builder.select('*').from('users')
  builder.union(getBuilder().select('*').from('dogs'))
  builder.skip(5).take(10)
  t.is('(select * from "users") union (select * from "dogs") limit 10 offset 5', builder.toSql())

  let expectedSql = '(select * from "users") union (select * from "dogs") limit 10 offset 5'
  builder = getPostgresBuilder()
  builder.select('*').from('users')
  builder.union(getBuilder().select('*').from('dogs'))
  builder.skip(5).take(10)
  t.is(expectedSql, builder.toSql())

  expectedSql = '(select * from "users" limit 11) union (select * from "dogs" limit 22) limit 10 offset 5'
  builder = getPostgresBuilder()
  builder.select('*').from('users').limit(11)
  builder.union(getBuilder().select('*').from('dogs').limit(22))
  builder.skip(5).take(10)
  t.is(expectedSql, builder.toSql())
})

test('testUnionWithJoin', (t) => {
  const builder = getBuilder()
  builder.select('*').from('users')
  builder.union(getBuilder().select('*').from('dogs').join('breeds', (join: JoinClause) => {
    join.on('dogs.breed_id', '=', 'breeds.id')
      .where('breeds.is_native', '=', 1)
  }))
  t.is('(select * from "users") union (select * from "dogs" inner join "breeds" on "dogs"."breed_id" = "breeds"."id" and "breeds"."is_native" = ?)', builder.toSql())
  t.deepEqual([1], builder.getBindings())
})

test('testMySqlUnionOrderBys', (t) => {
  const builder = getMySqlBuilder()
  builder.select('*').from('users').where('id', '=', 1)
  builder.union(getMySqlBuilder().select('*').from('users').where('id', '=', 2))
  builder.orderBy('id', 'desc')
  t.is('(select * from `users` where `id` = ?) union (select * from `users` where `id` = ?) order by `id` desc', builder.toSql())
  t.deepEqual([1, 2], builder.getBindings())
})

test('testMySqlUnionLimitsAndOffsets', (t) => {
  const builder = getMySqlBuilder()
  builder.select('*').from('users')
  builder.union(getMySqlBuilder().select('*').from('dogs'))
  builder.skip(5).take(10)
  t.is('(select * from `users`) union (select * from `dogs`) limit 10 offset 5', builder.toSql())
})

test('testUnionAggregate', (t) => {
  const { createMock, verifyMock } = mock()

  let expected = 'select count(*) as aggregate from ((select * from `posts`) union (select * from `videos`)) as `temp_table`'
  let builder = getMySqlBuilder()

  createMock(builder.getConnection()).expects('select').once().withArgs(expected, [])
  createMock(builder.getProcessor()).expects('processSelect').once()
  builder.from('posts').union(getMySqlBuilder().from('videos')).count()

  expected = 'select count(*) as aggregate from ((select `id` from `posts`) union (select `id` from `videos`)) as `temp_table`'
  builder = getMySqlBuilder()
  createMock(builder.getConnection()).expects('select').once().withArgs(expected, [])
  createMock(builder.getProcessor()).expects('processSelect').once()
  builder.from('posts').select('id').union(getMySqlBuilder().from('videos').select('id')).count()

  expected = 'select count(*) as aggregate from ((select * from "posts") union (select * from "videos")) as "temp_table"'
  builder = getPostgresBuilder()
  createMock(builder.getConnection()).expects('select').once().withArgs(expected, [])
  createMock(builder.getProcessor()).expects('processSelect').once()
  builder.from('posts').union(getPostgresBuilder().from('videos')).count()

  expected = 'select count(*) as aggregate from (select * from (select * from "posts") union select * from (select * from "videos")) as "temp_table"'
  builder = getSQLiteBuilder()
  createMock(builder.getConnection()).expects('select').once().withArgs(expected, [])
  createMock(builder.getProcessor()).expects('processSelect').once()
  builder.from('posts').union(getSQLiteBuilder().from('videos')).count()

  expected = 'select count(*) as aggregate from (select * from (select * from [posts]) as [temp_table] union select * from (select * from [videos]) as [temp_table]) as [temp_table]'
  builder = getSqlServerBuilder()
  createMock(builder.getConnection()).expects('select').once().withArgs(expected, [])
  createMock(builder.getProcessor()).expects('processSelect').once()
  builder.from('posts').union(getSqlServerBuilder().from('videos')).count()

  verifyMock()

  t.pass()
})
