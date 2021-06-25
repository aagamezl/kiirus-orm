"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ava_1 = require("ava");
// import { Builder, JoinClause, TJoinClause } from '../../src/Illuminate/Database/Query';
const internal_1 = require("../../src/Illuminate/Database/Query/internal");
const Grammars_1 = require("../../src/Illuminate/Database/Query/Grammars");
const Processors_1 = require("../../src/Illuminate/Database/Query/Processors");
const Database_1 = require("../../src/Illuminate/Database");
const internal_2 = require("../../src/Illuminate/Database/Query/internal");
const Builder_1 = require("../../src/Illuminate/Database/Eloquent/Query/Builder");
const auto_verify_1 = require("./tools/auto-verify");
const getConnection = () => {
    // const connection = sinon.mock(new Connection());
    // connection.expects('getDatabaseName').returns('database');
    // return connection as unknown as Connection;
    return new Database_1.Connection({});
};
const getBuilder = () => {
    const grammar = new Grammars_1.Grammar();
    const processor = new Processors_1.Processor();
    return new internal_1.Builder(getConnection(), grammar, processor);
};
const getMySqlBuilder = () => {
    const grammar = new Grammars_1.MySqlGrammar;
    const processor = new Processors_1.Processor;
    return new internal_1.Builder(getConnection(), grammar, processor);
};
const getMySqlBuilderWithProcessor = () => {
    const grammar = new Grammars_1.MySqlGrammar;
    const processor = new Processors_1.MySqlProcessor;
    return new internal_1.Builder(getConnection(), grammar, processor);
};
const getPostgresBuilder = () => {
    const grammar = new Grammars_1.PostgresGrammar;
    const processor = new Processors_1.MySqlProcessor;
    return new internal_1.Builder(getConnection(), grammar, processor);
};
const getSqlServerBuilder = () => {
    const grammar = new Grammars_1.SqlServerGrammar;
    const processor = new Processors_1.Processor;
    return new internal_1.Builder(getConnection(), grammar, processor);
};
const getSQLiteBuilder = () => {
    const grammar = new Grammars_1.SQLiteGrammar;
    const processor = new Processors_1.Processor;
    return new internal_1.Builder(getConnection(), grammar, processor);
};
// const sandbox: sinon.SinonSandbox = sinon.createSandbox()
ava_1.default.afterEach((t) => {
    // sandbox.verify();
    // sandbox.restore();
    // autoVerify();
});
ava_1.default('testBasicSelect', (t) => {
    const builder = getBuilder();
    builder.select('*').from('users');
    t.is('select * from "users"', builder.toSql());
});
ava_1.default('testBasicSelectWithGetColumns', (t) => {
    const builder = getBuilder();
    const processorMock = auto_verify_1.createMock(builder.getProcessor());
    const connectionMock = auto_verify_1.createMock(builder.getConnection());
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
    auto_verify_1.autoVerify();
});
ava_1.default('testBasicMySqlSelect', (t) => {
    let builder = getMySqlBuilderWithProcessor();
    let connectionMock = auto_verify_1.createMock(builder.getConnection());
    connectionMock.expects('select').once()
        .withArgs('select * from `users`', []);
    builder.select('*').from('users').get();
    builder = getMySqlBuilderWithProcessor();
    connectionMock = auto_verify_1.createMock(builder.getConnection());
    connectionMock.expects('select').once()
        .withArgs('select * from `users`', []);
    builder.select('*').from('users').get();
    t.is('select * from `users`', builder.toSql());
    auto_verify_1.autoVerify();
});
ava_1.default('testBasicTableWrappingProtectsQuotationMarks', (t) => {
    const builder = getBuilder();
    builder.select('*').from('some"table');
    t.is('select * from "some""table"', builder.toSql());
});
ava_1.default('testAliasWrappingAsWholeConstant', (t) => {
    const builder = getBuilder();
    builder.select('x.y as foo.bar').from('baz');
    t.is('select "x"."y" as "foo.bar" from "baz"', builder.toSql());
});
ava_1.default('testAliasWrappingWithSpacesInDatabaseName', (t) => {
    const builder = getBuilder();
    builder.select('w x.y.z as foo.bar').from('baz');
    t.is('select "w x"."y"."z" as "foo.bar" from "baz"', builder.toSql());
});
ava_1.default('testAddingSelects', (t) => {
    const builder = getBuilder();
    builder.select('foo').addSelect('bar').addSelect(['baz', 'boom']).from('users');
    t.is('select "foo", "bar", "baz", "boom" from "users"', builder.toSql());
});
ava_1.default('testBasicSelectWithPrefix', (t) => {
    const builder = getBuilder();
    builder.getGrammar().setTablePrefix('prefix_');
    builder.select('*').from('users');
    t.is('select * from "prefix_users"', builder.toSql());
});
ava_1.default('testBasicSelectDistinct', (t) => {
    const builder = getBuilder();
    builder.distinct().select('foo', 'bar').from('users');
    t.is('select distinct "foo", "bar" from "users"', builder.toSql());
});
ava_1.default('testBasicSelectDistinctOnColumns', (t) => {
    let builder = getBuilder();
    builder.distinct('foo').select('foo', 'bar').from('users');
    t.is('select distinct "foo", "bar" from "users"', builder.toSql());
    builder = getPostgresBuilder();
    builder.distinct('foo').select('foo', 'bar').from('users');
    t.is('select distinct on ("foo") "foo", "bar" from "users"', builder.toSql());
});
ava_1.default('testBasicAlias', (t) => {
    const builder = getBuilder();
    builder.select('foo as bar').from('users');
    t.is('select "foo" as "bar" from "users"', builder.toSql());
});
ava_1.default('testAliasWithPrefix', (t) => {
    const builder = getBuilder();
    builder.getGrammar().setTablePrefix('prefix_');
    builder.select('*').from('users as people');
    t.is('select * from "prefix_users" as "prefix_people"', builder.toSql());
});
ava_1.default('testJoinAliasesWithPrefix', (t) => {
    const builder = getBuilder();
    builder.getGrammar().setTablePrefix('prefix_');
    builder.select('*').from('services').join('translations AS t', 't.item_id', '=', 'services.id');
    t.is('select * from "prefix_services" inner join "prefix_translations" as "prefix_t" on "prefix_t"."item_id" = "prefix_services"."id"', builder.toSql());
});
ava_1.default('testBasicTableWrapping', (t) => {
    const builder = getBuilder();
    builder.select('*').from('public.users');
    t.is('select * from "public"."users"', builder.toSql());
});
ava_1.default('testWhenCallback', (t) => {
    const callback = (query, condition) => {
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
ava_1.default('testWhenCallbackWithReturn', (t) => {
    const callback = (query, condition) => {
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
ava_1.default('testWhenCallbackWithDefault', (t) => {
    const callback = (query, condition) => {
        t.is('truthy', condition);
        query.where('id', '=', 1);
    };
    const defaultCallback = (query, condition) => {
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
ava_1.default('testUnlessCallback', (t) => {
    const callback = (query, condition) => {
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
ava_1.default('testUnlessCallbackWithReturn', (t) => {
    const callback = (query, condition) => {
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
ava_1.default('testUnlessCallbackWithDefault', (t) => {
    const callback = (query, condition) => {
        t.is(0, condition);
        query.where('id', '=', 1);
    };
    const defaultCallback = (query, condition) => {
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
ava_1.default('testTapCallback', (t) => {
    const callback = (query) => {
        return query.where('id', '=', 1);
    };
    const builder = getBuilder();
    builder.select('*').from('users').tap(callback).where('email', 'foo');
    t.is('select * from "users" where "id" = ? and "email" = ?', builder.toSql());
});
ava_1.default('testBasicWheres', (t) => {
    const builder = getBuilder();
    builder.select('*').from('users').where('id', '=', 1);
    t.is('select * from "users" where "id" = ?', builder.toSql());
    t.deepEqual([1], builder.getBindings());
});
ava_1.default('testWheresWithArrayValue', (t) => {
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
ava_1.default('testMySqlWrappingProtectsQuotationMarks', (t) => {
    const builder = getMySqlBuilder();
    builder.select('*').from('some`table');
    t.is('select * from `some``table`', builder.toSql());
});
ava_1.default('testDateBasedWheresAcceptsTwoArguments', (t) => {
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
ava_1.default('testDateBasedOrWheresAcceptsTwoArguments', (t) => {
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
ava_1.default('testDateBasedWheresExpressionIsNotBound', (t) => {
    let builder = getBuilder();
    builder.select('*').from('users').whereDate('created_at', new internal_2.Expression('NOW()')).where('admin', true);
    t.deepEqual([true], builder.getBindings());
    builder = getBuilder();
    builder.select('*').from('users').whereDay('created_at', new internal_2.Expression('NOW()'));
    t.deepEqual([], builder.getBindings());
    builder = getBuilder();
    builder.select('*').from('users').whereMonth('created_at', new internal_2.Expression('NOW()'));
    t.deepEqual([], builder.getBindings());
    builder = getBuilder();
    builder.select('*').from('users').whereYear('created_at', new internal_2.Expression('NOW()'));
    t.deepEqual([], builder.getBindings());
});
ava_1.default('testWhereDateMySql', (t) => {
    let builder = getMySqlBuilder();
    builder.select('*').from('users').whereDate('created_at', '=', '2015-12-21');
    t.is('select * from `users` where date(`created_at`) = ?', builder.toSql());
    t.deepEqual(['2015-12-21'], builder.getBindings());
    builder = getMySqlBuilder();
    builder.select('*').from('users').whereDate('created_at', '=', new internal_2.Expression('NOW()'));
    t.is('select * from `users` where date(`created_at`) = NOW()', builder.toSql());
});
ava_1.default('testWhereDayMySql', (t) => {
    const builder = getMySqlBuilder();
    builder.select('*').from('users').whereDay('created_at', '=', 1);
    t.is('select * from `users` where day(`created_at`) = ?', builder.toSql());
    t.deepEqual([1], builder.getBindings());
});
ava_1.default('testOrWhereDayMySql', (t) => {
    const builder = getMySqlBuilder();
    builder.select('*').from('users').whereDay('created_at', '=', 1).orWhereDay('created_at', '=', 2);
    t.is('select * from `users` where day(`created_at`) = ? or day(`created_at`) = ?', builder.toSql());
    t.deepEqual([1, 2], builder.getBindings());
});
ava_1.default('testWhereMonthMySql', (t) => {
    const builder = getMySqlBuilder();
    builder.select('*').from('users').whereMonth('created_at', '=', 5);
    t.is('select * from `users` where month(`created_at`) = ?', builder.toSql());
    t.deepEqual([5], builder.getBindings());
});
ava_1.default('testOrWhereMonthMySql', (t) => {
    const builder = getMySqlBuilder();
    builder.select('*').from('users').whereMonth('created_at', '=', 5).orWhereMonth('created_at', '=', 6);
    t.is('select * from `users` where month(`created_at`) = ? or month(`created_at`) = ?', builder.toSql());
    t.deepEqual([5, 6], builder.getBindings());
});
ava_1.default('testWhereYearMySql', (t) => {
    const builder = getMySqlBuilder();
    builder.select('*').from('users').whereYear('created_at', '=', 2014);
    t.is('select * from `users` where year(`created_at`) = ?', builder.toSql());
    t.deepEqual([2014], builder.getBindings());
});
ava_1.default('testOrWhereYearMySql', (t) => {
    const builder = getMySqlBuilder();
    builder.select('*').from('users').whereYear('created_at', '=', 2014).orWhereYear('created_at', '=', 2015);
    t.is('select * from `users` where year(`created_at`) = ? or year(`created_at`) = ?', builder.toSql());
    t.deepEqual([2014, 2015], builder.getBindings());
});
ava_1.default('testWhereTimeMySql', (t) => {
    const builder = getMySqlBuilder();
    builder.select('*').from('users').whereTime('created_at', '>=', '22:00');
    t.is('select * from `users` where time(`created_at`) >= ?', builder.toSql());
    t.deepEqual(['22:00'], builder.getBindings());
});
ava_1.default('testWhereTimeOperatorOptionalMySql', (t) => {
    const builder = getMySqlBuilder();
    builder.select('*').from('users').whereTime('created_at', '22:00');
    t.is('select * from `users` where time(`created_at`) = ?', builder.toSql());
    t.deepEqual(['22:00'], builder.getBindings());
});
ava_1.default('testWhereTimeOperatorOptionalPostgres', (t) => {
    const builder = getPostgresBuilder();
    builder.select('*').from('users').whereTime('created_at', '22:00');
    t.is('select * from "users" where "created_at"::time = ?', builder.toSql());
    t.deepEqual(['22:00'], builder.getBindings());
});
ava_1.default('testWhereDatePostgres', (t) => {
    let builder = getPostgresBuilder();
    builder.select('*').from('users').whereDate('created_at', '=', '2015-12-21');
    t.is('select * from "users" where "created_at"::date = ?', builder.toSql());
    t.deepEqual(['2015-12-21'], builder.getBindings());
    builder = getPostgresBuilder();
    builder.select('*').from('users').whereDate('created_at', new internal_2.Expression('NOW()'));
    t.is('select * from "users" where "created_at"::date = NOW()', builder.toSql());
});
ava_1.default('testWhereDayPostgres', (t) => {
    const builder = getPostgresBuilder();
    builder.select('*').from('users').whereDay('created_at', '=', 1);
    t.is('select * from "users" where extract(day from "created_at") = ?', builder.toSql());
    t.deepEqual([1], builder.getBindings());
});
ava_1.default('testWhereMonthPostgres', (t) => {
    const builder = getPostgresBuilder();
    builder.select('*').from('users').whereMonth('created_at', '=', 5);
    t.is('select * from "users" where extract(month from "created_at") = ?', builder.toSql());
    t.deepEqual([5], builder.getBindings());
});
ava_1.default('testWhereYearPostgres', (t) => {
    const builder = getPostgresBuilder();
    builder.select('*').from('users').whereYear('created_at', '=', 2014);
    t.is('select * from "users" where extract(year from "created_at") = ?', builder.toSql());
    t.deepEqual([2014], builder.getBindings());
});
ava_1.default('testWhereTimePostgres', (t) => {
    const builder = getPostgresBuilder();
    builder.select('*').from('users').whereTime('created_at', '>=', '22:00');
    t.is('select * from "users" where "created_at"::time >= ?', builder.toSql());
    t.deepEqual(['22:00'], builder.getBindings());
});
ava_1.default('testWhereLikePostgres', (t) => {
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
ava_1.default('testWhereDateSqlite', (t) => {
    let builder = getSQLiteBuilder();
    builder.select('*').from('users').whereDate('created_at', '=', '2015-12-21');
    t.is('select * from "users" where strftime(\'%Y-%m-%d\', "created_at") = cast(? as text)', builder.toSql());
    t.deepEqual(['2015-12-21'], builder.getBindings());
    builder = getSQLiteBuilder();
    builder.select('*').from('users').whereDate('created_at', new internal_2.Expression('NOW()'));
    t.is('select * from "users" where strftime(\'%Y-%m-%d\', "created_at") = cast(NOW() as text)', builder.toSql());
});
ava_1.default('testWhereDaySqlite', (t) => {
    const builder = getSQLiteBuilder();
    builder.select('*').from('users').whereDay('created_at', '=', 1);
    t.is('select * from "users" where strftime(\'%d\', "created_at") = cast(? as text)', builder.toSql());
    t.deepEqual([1], builder.getBindings());
});
ava_1.default('testWhereMonthSqlite', (t) => {
    const builder = getSQLiteBuilder();
    builder.select('*').from('users').whereMonth('created_at', '=', 5);
    t.is('select * from "users" where strftime(\'%m\', "created_at") = cast(? as text)', builder.toSql());
    t.deepEqual([5], builder.getBindings());
});
ava_1.default('testWhereYearSqlite', (t) => {
    const builder = getSQLiteBuilder();
    builder.select('*').from('users').whereYear('created_at', '=', 2014);
    t.is('select * from "users" where strftime(\'%Y\', "created_at") = cast(? as text)', builder.toSql());
    t.deepEqual([2014], builder.getBindings());
});
ava_1.default('testWhereTimeSqlite', (t) => {
    const builder = getSQLiteBuilder();
    builder.select('*').from('users').whereTime('created_at', '>=', '22:00');
    t.is('select * from "users" where strftime(\'%H:%M:%S\', "created_at") >= cast(? as text)', builder.toSql());
    t.deepEqual(['22:00'], builder.getBindings());
});
ava_1.default('testWhereTimeOperatorOptionalSqlite', (t) => {
    const builder = getSQLiteBuilder();
    builder.select('*').from('users').whereTime('created_at', '22:00');
    t.is('select * from "users" where strftime(\'%H:%M:%S\', "created_at") = cast(? as text)', builder.toSql());
    t.deepEqual(['22:00'], builder.getBindings());
});
ava_1.default('testWhereTimeSqlServer', (t) => {
    let builder = getSqlServerBuilder();
    builder.select('*').from('users').whereTime('created_at', '22:00');
    t.is('select * from [users] where cast([created_at] as time) = ?', builder.toSql());
    t.deepEqual(['22:00'], builder.getBindings());
    builder = getSqlServerBuilder();
    builder.select('*').from('users').whereTime('created_at', new internal_2.Expression('NOW()'));
    t.is('select * from [users] where cast([created_at] as time) = NOW()', builder.toSql());
    t.deepEqual([], builder.getBindings());
});
ava_1.default('testWhereDateSqlServer', (t) => {
    let builder = getSqlServerBuilder();
    builder.select('*').from('users').whereDate('created_at', '=', '2015-12-21');
    t.is('select * from [users] where cast([created_at] as date) = ?', builder.toSql());
    t.deepEqual(['2015-12-21'], builder.getBindings());
    builder = getSqlServerBuilder();
    builder.select('*').from('users').whereDate('created_at', new internal_2.Expression('NOW()'));
    t.is('select * from [users] where cast([created_at] as date) = NOW()', builder.toSql());
});
ava_1.default('testWhereDaySqlServer', (t) => {
    const builder = getSqlServerBuilder();
    builder.select('*').from('users').whereDay('created_at', '=', 1);
    t.is('select * from [users] where day([created_at]) = ?', builder.toSql());
    t.deepEqual([1], builder.getBindings());
});
ava_1.default('testWhereMonthSqlServer', (t) => {
    const builder = getSqlServerBuilder();
    builder.select('*').from('users').whereMonth('created_at', '=', 5);
    t.is('select * from [users] where month([created_at]) = ?', builder.toSql());
    t.deepEqual([5], builder.getBindings());
});
ava_1.default('testWhereYearSqlServer', (t) => {
    const builder = getSqlServerBuilder();
    builder.select('*').from('users').whereYear('created_at', '=', 2014);
    t.is('select * from [users] where year([created_at]) = ?', builder.toSql());
    t.deepEqual([2014], builder.getBindings());
});
ava_1.default('testWhereBetweens', (t) => {
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
    builder.select('*').from('users').whereBetween('id', [new internal_2.Expression(1), new internal_2.Expression(2)]);
    t.is('select * from "users" where "id" between 1 and 2', builder.toSql());
    t.deepEqual([], builder.getBindings());
});
ava_1.default('testWhereBetweenColumns', (t) => {
    let builder = getBuilder();
    builder.select('*').from('users').whereBetweenColumns('id', ['users.created_at', 'users.updated_at']);
    t.is('select * from "users" where "id" between "users"."created_at" and "users"."updated_at"', builder.toSql());
    t.deepEqual([], builder.getBindings());
    builder = getBuilder();
    builder.select('*').from('users').whereNotBetweenColumns('id', ['created_at', 'updated_at']);
    t.is('select * from "users" where "id" not between "created_at" and "updated_at"', builder.toSql());
    t.deepEqual([], builder.getBindings());
    builder = getBuilder();
    builder.select('*').from('users').whereBetweenColumns('id', [new internal_2.Expression(1), new internal_2.Expression(2)]);
    t.is('select * from "users" where "id" between 1 and 2', builder.toSql());
    t.deepEqual([], builder.getBindings());
});
ava_1.default('testBasicOrWheres', (t) => {
    const builder = getBuilder();
    builder.select('*').from('users').where('id', '=', 1).orWhere('email', '=', 'foo');
    t.is('select * from "users" where "id" = ? or "email" = ?', builder.toSql());
    t.deepEqual([1, 'foo'], builder.getBindings());
});
ava_1.default('testRawWheres', (t) => {
    const builder = getBuilder();
    builder.select('*').from('users').whereRaw('id = ? or email = ?', [1, 'foo']);
    t.is('select * from "users" where id = ? or email = ?', builder.toSql());
    t.deepEqual([1, 'foo'], builder.getBindings());
});
ava_1.default('testRawOrWheres', (t) => {
    const builder = getBuilder();
    builder.select('*').from('users').where('id', '=', 1).orWhereRaw('email = ?', ['foo']);
    t.is('select * from "users" where "id" = ? or email = ?', builder.toSql());
    t.deepEqual([1, 'foo'], builder.getBindings());
});
ava_1.default('testBasicWhereIns', (t) => {
    let builder = getBuilder();
    builder.select('*').from('users').whereIn('id', [1, 2, 3]);
    t.is('select * from "users" where "id" in (?, ?, ?)', builder.toSql());
    t.deepEqual([1, 2, 3], builder.getBindings());
    builder = getBuilder();
    builder.select('*').from('users').where('id', '=', 1).orWhereIn('id', [1, 2, 3]);
    t.is('select * from "users" where "id" = ? or "id" in (?, ?, ?)', builder.toSql());
    t.deepEqual([1, 1, 2, 3], builder.getBindings());
});
ava_1.default('testBasicWhereNotIns', (t) => {
    let builder = getBuilder();
    builder.select('*').from('users').whereNotIn('id', [1, 2, 3]);
    t.is('select * from "users" where "id" not in (?, ?, ?)', builder.toSql());
    t.deepEqual([1, 2, 3], builder.getBindings());
    builder = getBuilder();
    builder.select('*').from('users').where('id', '=', 1).orWhereNotIn('id', [1, 2, 3]);
    t.is('select * from "users" where "id" = ? or "id" not in (?, ?, ?)', builder.toSql());
    t.deepEqual([1, 1, 2, 3], builder.getBindings());
});
ava_1.default('testRawWhereIns', (t) => {
    let builder = getBuilder();
    builder.select('*').from('users').whereIn('id', [new internal_2.Expression(1)]);
    t.is('select * from "users" where "id" in (1)', builder.toSql());
    builder = getBuilder();
    builder.select('*').from('users').where('id', '=', 1).orWhereIn('id', [new internal_2.Expression(1)]);
    t.is('select * from "users" where "id" = ? or "id" in (1)', builder.toSql());
    t.deepEqual([1], builder.getBindings());
});
ava_1.default('testEmptyWhereIns', (t) => {
    let builder = getBuilder();
    builder.select('*').from('users').whereIn('id', []);
    t.is('select * from "users" where 0 = 1', builder.toSql());
    t.deepEqual([], builder.getBindings());
    builder = getBuilder();
    builder.select('*').from('users').where('id', '=', 1).orWhereIn('id', []);
    t.is('select * from "users" where "id" = ? or 0 = 1', builder.toSql());
    t.deepEqual([1], builder.getBindings());
});
ava_1.default('testEmptyWhereNotIns', (t) => {
    let builder = getBuilder();
    builder.select('*').from('users').whereNotIn('id', []);
    t.is('select * from "users" where 1 = 1', builder.toSql());
    t.deepEqual([], builder.getBindings());
    builder = getBuilder();
    builder.select('*').from('users').where('id', '=', 1).orWhereNotIn('id', []);
    t.is('select * from "users" where "id" = ? or 1 = 1', builder.toSql());
    t.deepEqual([1], builder.getBindings());
});
ava_1.default('testWhereIntegerInRaw', (t) => {
    const builder = getBuilder();
    builder.select('*').from('users').whereIntegerInRaw('id', ['1a', 2]);
    t.is('select * from "users" where "id" in (1, 2)', builder.toSql());
    t.deepEqual([], builder.getBindings());
});
ava_1.default('testOrWhereIntegerInRaw', (t) => {
    const builder = getBuilder();
    builder.select('*').from('users').where('id', '=', 1).orWhereIntegerInRaw('id', ['1a', 2]);
    t.is('select * from "users" where "id" = ? or "id" in (1, 2)', builder.toSql());
    t.deepEqual([1], builder.getBindings());
});
ava_1.default('testWhereIntegerNotInRaw', (t) => {
    const builder = getBuilder();
    builder.select('*').from('users').whereIntegerNotInRaw('id', ['1a', 2]);
    t.is('select * from "users" where "id" not in (1, 2)', builder.toSql());
    t.deepEqual([], builder.getBindings());
});
ava_1.default('testOrWhereIntegerNotInRaw', (t) => {
    const builder = getBuilder();
    builder.select('*').from('users').where('id', '=', 1).orWhereIntegerNotInRaw('id', ['1a', 2]);
    t.is('select * from "users" where "id" = ? or "id" not in (1, 2)', builder.toSql());
    t.deepEqual([1], builder.getBindings());
});
ava_1.default('testEmptyWhereIntegerInRaw', (t) => {
    const builder = getBuilder();
    builder.select('*').from('users').whereIntegerInRaw('id', []);
    t.is('select * from "users" where 0 = 1', builder.toSql());
    t.deepEqual([], builder.getBindings());
});
ava_1.default('testEmptyWhereIntegerNotInRaw', (t) => {
    const builder = getBuilder();
    builder.select('*').from('users').whereIntegerNotInRaw('id', []);
    t.is('select * from "users" where 1 = 1', builder.toSql());
    t.deepEqual([], builder.getBindings());
});
ava_1.default('testBasicWhereColumn', (t) => {
    let builder = getBuilder();
    builder.select('*').from('users').whereColumn('first_name', 'last_name').orWhereColumn('first_name', 'middle_name');
    t.is('select * from "users" where "first_name" = "last_name" or "first_name" = "middle_name"', builder.toSql());
    t.deepEqual([], builder.getBindings());
    builder = getBuilder();
    builder.select('*').from('users').whereColumn('updated_at', '>', 'created_at');
    t.is('select * from "users" where "updated_at" > "created_at"', builder.toSql());
    t.deepEqual([], builder.getBindings());
});
ava_1.default('testArrayWhereColumn', (t) => {
    const conditions = [
        ['first_name', 'last_name'],
        ['updated_at', '>', 'created_at'],
    ];
    const builder = getBuilder();
    builder.select('*').from('users').whereColumn(conditions);
    t.is('select * from "users" where ("first_name" = "last_name" and "updated_at" > "created_at")', builder.toSql());
    t.deepEqual([], builder.getBindings());
});
ava_1.default('testUnions', (t) => {
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
ava_1.default('testUnionAlls', (t) => {
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
ava_1.default('testMultipleUnions', (t) => {
    const builder = getBuilder();
    builder.select('*').from('users').where('id', '=', 1);
    builder.union(getBuilder().select('*').from('users').where('id', '=', 2));
    builder.union(getBuilder().select('*').from('users').where('id', '=', 3));
    t.is('(select * from "users" where "id" = ?) union (select * from "users" where "id" = ?) union (select * from "users" where "id" = ?)', builder.toSql());
    t.deepEqual([1, 2, 3], builder.getBindings());
});
ava_1.default('testMultipleUnionAlls', (t) => {
    const builder = getBuilder();
    builder.select('*').from('users').where('id', '=', 1);
    builder.unionAll(getBuilder().select('*').from('users').where('id', '=', 2));
    builder.unionAll(getBuilder().select('*').from('users').where('id', '=', 3));
    t.is('(select * from "users" where "id" = ?) union all (select * from "users" where "id" = ?) union all (select * from "users" where "id" = ?)', builder.toSql());
    t.deepEqual([1, 2, 3], builder.getBindings());
});
ava_1.default('testUnionOrderBys', (t) => {
    const builder = getBuilder();
    builder.select('*').from('users').where('id', '=', 1);
    builder.union(getBuilder().select('*').from('users').where('id', '=', 2));
    builder.orderBy('id', 'desc');
    t.is('(select * from "users" where "id" = ?) union (select * from "users" where "id" = ?) order by "id" desc', builder.toSql());
    t.deepEqual([1, 2], builder.getBindings());
});
ava_1.default('testUnionLimitsAndOffsets', (t) => {
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
ava_1.default('testUnionWithJoin', (t) => {
    const builder = getBuilder();
    builder.select('*').from('users');
    builder.union(getBuilder().select('*').from('dogs').join('breeds', (join) => {
        join.on('dogs.breed_id', '=', 'breeds.id')
            .where('breeds.is_native', '=', 1);
    }));
    t.is('(select * from "users") union (select * from "dogs" inner join "breeds" on "dogs"."breed_id" = "breeds"."id" and "breeds"."is_native" = ?)', builder.toSql());
    t.deepEqual([1], builder.getBindings());
});
ava_1.default('testMySqlUnionOrderBys', (t) => {
    const builder = getMySqlBuilder();
    builder.select('*').from('users').where('id', '=', 1);
    builder.union(getMySqlBuilder().select('*').from('users').where('id', '=', 2));
    builder.orderBy('id', 'desc');
    t.is('(select * from `users` where `id` = ?) union (select * from `users` where `id` = ?) order by `id` desc', builder.toSql());
    t.deepEqual([1, 2], builder.getBindings());
});
ava_1.default('testMySqlUnionLimitsAndOffsets', (t) => {
    const builder = getMySqlBuilder();
    builder.select('*').from('users');
    builder.union(getMySqlBuilder().select('*').from('dogs'));
    builder.skip(5).take(10);
    t.is('(select * from `users`) union (select * from `dogs`) limit 10 offset 5', builder.toSql());
});
ava_1.default('testUnionAggregate', (t) => {
    let expected = 'select count(*) as aggregate from ((select * from `posts`) union (select * from `videos`)) as `temp_table`';
    let builder = getMySqlBuilder();
    let processorMock = auto_verify_1.createMock(builder.getProcessor());
    let connectionMock = auto_verify_1.createMock(builder.getConnection());
    connectionMock.expects('select').once().withArgs(expected, []);
    processorMock.expects('processSelect').once();
    builder.from('posts').union(getMySqlBuilder().from('videos')).count();
    expected = 'select count(*) as aggregate from ((select `id` from `posts`) union (select `id` from `videos`)) as `temp_table`';
    builder = getMySqlBuilder();
    processorMock = auto_verify_1.createMock(builder.getProcessor());
    connectionMock = auto_verify_1.createMock(builder.getConnection());
    connectionMock.expects('select').once().withArgs(expected, []);
    processorMock.expects('processSelect').once();
    builder.from('posts').select('id').union(getMySqlBuilder().from('videos').select('id')).count();
    expected = 'select count(*) as aggregate from ((select * from "posts") union (select * from "videos")) as "temp_table"';
    builder = getPostgresBuilder();
    processorMock = auto_verify_1.createMock(builder.getProcessor());
    connectionMock = auto_verify_1.createMock(builder.getConnection());
    connectionMock.expects('select').once().withArgs(expected, []);
    processorMock.expects('processSelect').once();
    builder.from('posts').union(getPostgresBuilder().from('videos')).count();
    expected = 'select count(*) as aggregate from (select * from (select * from "posts") union select * from (select * from "videos")) as "temp_table"';
    builder = getSQLiteBuilder();
    processorMock = auto_verify_1.createMock(builder.getProcessor());
    connectionMock = auto_verify_1.createMock(builder.getConnection());
    connectionMock.expects('select').once().withArgs(expected, []);
    processorMock.expects('processSelect').once();
    builder.from('posts').union(getSQLiteBuilder().from('videos')).count();
    expected = 'select count(*) as aggregate from (select * from (select * from [posts]) as [temp_table] union select * from (select * from [videos]) as [temp_table]) as [temp_table]';
    builder = getSqlServerBuilder();
    processorMock = auto_verify_1.createMock(builder.getProcessor());
    connectionMock = auto_verify_1.createMock(builder.getConnection());
    connectionMock.expects('select').once().withArgs(expected, []);
    processorMock.expects('processSelect').once();
    builder.from('posts').union(getSqlServerBuilder().from('videos')).count();
    auto_verify_1.autoVerify();
    t.pass();
});
ava_1.default('testHavingAggregate', (t) => {
    const expected = 'select count(*) as aggregate from (select (select `count(*)` from `videos` where `posts`.`id` = `videos`.`post_id`) as `videos_count` from `posts` having `videos_count` > ?) as `temp_table`';
    const builder = getMySqlBuilder();
    let processorMock = auto_verify_1.createMock(builder.getProcessor());
    let connectionMock = auto_verify_1.createMock(builder.getConnection());
    connectionMock.expects('getDatabaseName').twice();
    connectionMock.expects('select').once().withArgs(expected, [1]).returns([{ 'aggregate': 1 }]);
    processorMock.expects('processSelect').once().callsFake((builder, results) => {
        return results;
    });
    builder.from('posts').selectSub((query) => {
        query.from('videos').select('count(*)').whereColumn('posts.id', '=', 'videos.post_id');
    }, 'videos_count').having('videos_count', '>', 1);
    builder.count();
    auto_verify_1.autoVerify();
    t.pass();
});
ava_1.default('testSubSelectWhereIns', (t) => {
    let builder = getBuilder();
    builder.select('*').from('users').whereIn('id', (query) => {
        query.select('id').from('users').where('age', '>', 25).take(3);
    });
    t.is('select * from "users" where "id" in (select "id" from "users" where "age" > ? limit 3)', builder.toSql());
    t.deepEqual([25], builder.getBindings());
    builder = getBuilder();
    builder.select('*').from('users').whereNotIn('id', (query) => {
        query.select('id').from('users').where('age', '>', 25).take(3);
    });
    t.is('select * from "users" where "id" not in (select "id" from "users" where "age" > ? limit 3)', builder.toSql());
    t.deepEqual([25], builder.getBindings());
});
ava_1.default('testBasicWhereNulls', (t) => {
    let builder = getBuilder();
    builder.select('*').from('users').whereNull('id');
    t.is('select * from "users" where "id" is null', builder.toSql());
    t.deepEqual([], builder.getBindings());
    builder = getBuilder();
    builder.select('*').from('users').where('id', '=', 1).orWhereNull('id');
    t.is('select * from "users" where "id" = ? or "id" is null', builder.toSql());
    t.deepEqual([1], builder.getBindings());
});
ava_1.default('testJsonWhereNullMysql', (t) => {
    const builder = getMySqlBuilder();
    builder.select('*').from('users').whereNull('items->id');
    t.is('select * from `users` where (json_extract(`items`, \'$."id"\') is null OR json_type(json_extract(`items`, \'$."id"\')) = \'NULL\')', builder.toSql());
});
ava_1.default('testJsonWhereNotNullMysql', (t) => {
    const builder = getMySqlBuilder();
    builder.select('*').from('users').whereNotNull('items->id');
    t.is('select * from `users` where (json_extract(`items`, \'$."id"\') is not null AND json_type(json_extract(`items`, \'$."id"\')) != \'NULL\')', builder.toSql());
});
ava_1.default('testArrayWhereNulls', (t) => {
    let builder = getBuilder();
    builder.select('*').from('users').whereNull(['id', 'expires_at']);
    t.is('select * from "users" where "id" is null and "expires_at" is null', builder.toSql());
    t.deepEqual([], builder.getBindings());
    builder = getBuilder();
    builder.select('*').from('users').where('id', '=', 1).orWhereNull(['id', 'expires_at']);
    t.is('select * from "users" where "id" = ? or "id" is null or "expires_at" is null', builder.toSql());
    t.deepEqual([1], builder.getBindings());
});
ava_1.default('testBasicWhereNotNulls', (t) => {
    let builder = getBuilder();
    builder.select('*').from('users').whereNotNull('id');
    t.is('select * from "users" where "id" is not null', builder.toSql());
    t.deepEqual([], builder.getBindings());
    builder = getBuilder();
    builder.select('*').from('users').where('id', '>', 1).orWhereNotNull('id');
    t.is('select * from "users" where "id" > ? or "id" is not null', builder.toSql());
    t.deepEqual([1], builder.getBindings());
});
ava_1.default('testArrayWhereNotNulls', (t) => {
    let builder = getBuilder();
    builder.select('*').from('users').whereNotNull(['id', 'expires_at']);
    t.is('select * from "users" where "id" is not null and "expires_at" is not null', builder.toSql());
    t.deepEqual([], builder.getBindings());
    builder = getBuilder();
    builder.select('*').from('users').where('id', '>', 1).orWhereNotNull(['id', 'expires_at']);
    t.is('select * from "users" where "id" > ? or "id" is not null or "expires_at" is not null', builder.toSql());
    t.deepEqual([1], builder.getBindings());
});
ava_1.default('testGroupBys', (t) => {
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
    builder.select('*').from('users').groupBy(new internal_2.Expression('DATE(created_at)'));
    t.is('select * from "users" group by DATE(created_at)', builder.toSql());
    builder = getBuilder();
    builder.select('*').from('users').groupByRaw('DATE(created_at), ? DESC', ['foo']);
    t.is('select * from "users" group by DATE(created_at), ? DESC', builder.toSql());
    t.deepEqual(['foo'], builder.getBindings());
    builder = getBuilder();
    builder.havingRaw('?', ['havingRawBinding']).groupByRaw('?', ['groupByRawBinding']).whereRaw('?', ['whereRawBinding']);
    t.deepEqual(['whereRawBinding', 'groupByRawBinding', 'havingRawBinding'], builder.getBindings());
});
ava_1.default('testOrderBys', (t) => {
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
ava_1.default('testReorder', (t) => {
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
    t.deepEqual([true], builder.getBindings());
    builder.reorder();
    t.deepEqual([], builder.getBindings());
});
ava_1.default('testOrderBySubQueries', (t) => {
    const expected = 'select * from "users" order by (select "created_at" from "logins" where "user_id" = "users"."id" limit 1)';
    const subQuery = (query) => {
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
ava_1.default('testOrderByInvalidDirectionParam', (t) => {
    const error = t.throws(() => {
        const builder = getBuilder();
        builder.select('*').from('users').orderBy('age', 'asec');
    }, { instanceOf: TypeError });
    t.true(error.message.includes('InvalidArgumentException'));
});
ava_1.default('testHavings', (t) => {
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
    builder.select(['category', new internal_2.Expression('count(*) as "total"')]).from('item').where('department', '=', 'popular').groupBy('category').having('total', '>', new internal_2.Expression('3'));
    t.is('select "category", count(*) as "total" from "item" where "department" = ? group by "category" having "total" > 3', builder.toSql());
    builder = getBuilder();
    builder.select(['category', new internal_2.Expression('count(*) as "total"')]).from('item').where('department', '=', 'popular').groupBy('category').having('total', '>', 3);
    t.is('select "category", count(*) as "total" from "item" where "department" = ? group by "category" having "total" > ?', builder.toSql());
});
ava_1.default('testHavingBetweens', (t) => {
    let builder = getBuilder();
    builder.select('*').from('users').havingBetween('id', [1, 2, 3]);
    t.is('select * from "users" having "id" between ? and ?', builder.toSql());
    t.deepEqual([1, 2], builder.getBindings());
    builder = getBuilder();
    builder.select('*').from('users').havingBetween('id', [[1, 2], [3, 4]]);
    t.is('select * from "users" having "id" between ? and ?', builder.toSql());
    t.deepEqual([1, 2], builder.getBindings());
});
ava_1.default('testHavingShortcut', (t) => {
    const builder = getBuilder();
    builder.select('*').from('users').having('email', 1).orHaving('email', 2);
    t.is('select * from "users" having "email" = ? or "email" = ?', builder.toSql());
});
ava_1.default('testHavingFollowedBySelectGet', (t) => {
    let builder = getBuilder();
    let query = 'select "category", count(*) as "total" from "item" where "department" = ? group by "category" having "total" > ?';
    let connectionMock = auto_verify_1.createMock(builder.getConnection());
    let processorMock = auto_verify_1.createMock(builder.getProcessor());
    connectionMock.expects('select').once().withArgs(query, ['popular', 3]).returns([{ category: 'rock', total: 5 }]);
    processorMock.expects('processSelect').callsFake((builder, results) => {
        return results;
    });
    builder.from('item');
    let result = builder.select(['category', new internal_2.Expression('count(*) as "total"')]).where('department', '=', 'popular').groupBy('category').having('total', '>', 3).get();
    t.deepEqual([{ category: 'rock', total: 5 }], result.all());
    // Using \Raw value
    builder = getBuilder();
    query = 'select "category", count(*) as "total" from "item" where "department" = ? group by "category" having "total" > 3';
    connectionMock = auto_verify_1.createMock(builder.getConnection());
    processorMock = auto_verify_1.createMock(builder.getProcessor());
    connectionMock.expects('select').once().withArgs(query, ['popular']).returns([{ category: 'rock', total: 5 }]);
    processorMock.expects('processSelect').callsFake((builder, results) => {
        return results;
    });
    builder.from('item');
    result = builder.select(['category', new internal_2.Expression('count(*) as "total"')]).where('department', '=', 'popular').groupBy('category').having('total', '>', new internal_2.Expression('3')).get();
    t.deepEqual([{ category: 'rock', total: 5 }], result.all());
    auto_verify_1.autoVerify();
});
ava_1.default('testRawHavings', (t) => {
    let builder = getBuilder();
    builder.select('*').from('users').havingRaw('user_foo < user_bar');
    t.is('select * from "users" having user_foo < user_bar', builder.toSql());
    builder = getBuilder();
    builder.select('*').from('users').having('baz', '=', 1).orHavingRaw('user_foo < user_bar');
    t.is('select * from "users" having "baz" = ? or user_foo < user_bar', builder.toSql());
    builder = getBuilder();
    builder.select('*').from('users').havingBetween('last_login_date', ['2018-11-16', '2018-12-16']).orHavingRaw('user_foo < user_bar');
    t.is('select * from "users" having "last_login_date" between ? and ? or user_foo < user_bar', builder.toSql());
});
ava_1.default('testLimitsAndOffsets', (t) => {
    let builder = getBuilder();
    builder.select('*').from('users').offset(5).limit(10);
    t.is('select * from "users" limit 10 offset 5', builder.toSql());
    builder = getBuilder();
    builder.select('*').from('users').skip(5).take(10);
    t.is('select * from "users" limit 10 offset 5', builder.toSql());
    builder = getBuilder();
    builder.select('*').from('users').skip(0).take(0);
    t.is('select * from "users" limit 0 offset 0', builder.toSql());
    builder = getBuilder();
    builder.select('*').from('users').skip(-5).take(-10);
    t.is('select * from "users" offset 0', builder.toSql());
});
ava_1.default('testForPage', (t) => {
    let builder = getBuilder();
    builder.select('*').from('users').forPage(2, 15);
    t.is('select * from "users" limit 15 offset 15', builder.toSql());
    builder = getBuilder();
    builder.select('*').from('users').forPage(0, 15);
    t.is('select * from "users" limit 15 offset 0', builder.toSql());
    builder = getBuilder();
    builder.select('*').from('users').forPage(-2, 15);
    t.is('select * from "users" limit 15 offset 0', builder.toSql());
    builder = getBuilder();
    builder.select('*').from('users').forPage(2, 0);
    t.is('select * from "users" limit 0 offset 0', builder.toSql());
    builder = getBuilder();
    builder.select('*').from('users').forPage(0, 0);
    t.is('select * from "users" limit 0 offset 0', builder.toSql());
    builder = getBuilder();
    builder.select('*').from('users').forPage(-2, 0);
    t.is('select * from "users" limit 0 offset 0', builder.toSql());
});
ava_1.default('testGetCountForPaginationWithBindings', (t) => {
    let builder = getBuilder();
    builder.from('users').selectSub((query) => {
        query.select('body').from('posts').where('id', 4);
    }, 'post');
    auto_verify_1.createMock(builder.getConnection()).expects('select').once().withArgs('select count(*) as aggregate from "users"', []).returns([{ aggregate: 1 }]);
    auto_verify_1.createMock(builder.getProcessor()).expects('processSelect').once().callsFake((builder, results) => {
        return results;
    });
    const count = builder.getCountForPagination();
    t.is(1, count);
    t.deepEqual([4], builder.getBindings());
    auto_verify_1.autoVerify();
});
ava_1.default('testGetCountForPaginationWithColumnAliases', (t) => {
    const builder = getBuilder();
    const columns = ['body as post_body', 'teaser', 'posts.created as published'];
    builder.from('posts').select(columns);
    auto_verify_1.createMock(builder.getConnection()).expects('select').once().withArgs('select count("body", "teaser", "posts"."created") as aggregate from "posts"', []).returns([{ aggregate: 1 }]);
    auto_verify_1.createMock(builder.getProcessor()).expects('processSelect').once().callsFake((builder, results) => {
        return results;
    });
    const count = builder.getCountForPagination(columns);
    t.is(1, count);
    auto_verify_1.autoVerify();
});
ava_1.default('testGetCountForPaginationWithUnion', (t) => {
    const builder = getBuilder();
    builder.from('posts').select('id').union(getBuilder().from('videos').select('id'));
    auto_verify_1.createMock(builder.getConnection()).expects('select').once().withArgs('select count(*) as aggregate from ((select "id" from "posts") union (select "id" from "videos")) as "temp_table"', []).returns([{ aggregate: 1 }]);
    auto_verify_1.createMock(builder.getProcessor()).expects('processSelect').once().callsFake((builder, results) => {
        return results;
    });
    const count = builder.getCountForPagination();
    t.is(1, count);
    auto_verify_1.autoVerify();
});
ava_1.default('testWhereShortcut', (t) => {
    const builder = getBuilder();
    builder.select('*').from('users').where('id', 1).orWhere('name', 'foo');
    t.is('select * from "users" where "id" = ? or "name" = ?', builder.toSql());
    t.deepEqual([1, 'foo'], builder.getBindings());
});
ava_1.default('testWhereWithArrayConditions', (t) => {
    let builder = getBuilder();
    builder.select('*').from('users').where([['foo', 1], ['bar', 2]]);
    t.is('select * from "users" where ("foo" = ? and "bar" = ?)', builder.toSql());
    t.deepEqual([1, 2], builder.getBindings());
    builder = getBuilder();
    builder.select('*').from('users').where({ foo: 1, bar: 2 });
    t.is('select * from "users" where ("foo" = ? and "bar" = ?)', builder.toSql());
    t.deepEqual([1, 2], builder.getBindings());
    builder = getBuilder();
    builder.select('*').from('users').where([['foo', 1], ['bar', '<', 2]]);
    t.is('select * from "users" where ("foo" = ? and "bar" < ?)', builder.toSql());
    t.deepEqual([1, 2], builder.getBindings());
});
ava_1.default('testNestedWheres', (t) => {
    const builder = getBuilder();
    builder.select('*').from('users').where('email', '=', 'foo').orWhere((query) => {
        query.where('name', '=', 'bar').where('age', '=', 25);
    });
    t.is('select * from "users" where "email" = ? or ("name" = ? and "age" = ?)', builder.toSql());
    t.deepEqual(['foo', 'bar', 25], builder.getBindings());
});
ava_1.default('testNestedWhereBindings', (t) => {
    const builder = getBuilder();
    builder.where('email', '=', 'foo').where((query) => {
        query.selectRaw('?', ['ignore']).where('name', '=', 'bar');
    });
    t.deepEqual(['foo', 'bar'], builder.getBindings());
});
ava_1.default('testFullSubSelects', (t) => {
    const builder = getBuilder();
    builder.select('*').from('users').where('email', '=', 'foo').orWhere('id', '=', (query) => {
        query.select(new internal_2.Expression('max(id)')).from('users').where('email', '=', 'bar');
    });
    t.is('select * from "users" where "email" = ? or "id" = (select max(id) from "users" where "email" = ?)', builder.toSql());
    t.deepEqual(['foo', 'bar'], builder.getBindings());
});
ava_1.default('testWhereExists', (t) => {
    let builder = getBuilder();
    builder.select('*').from('orders').whereExists((query) => {
        query.select('*').from('products').where('products.id', '=', new internal_2.Expression('"orders"."id"'));
    });
    t.is('select * from "orders" where exists (select * from "products" where "products"."id" = "orders"."id")', builder.toSql());
    builder = getBuilder();
    builder.select('*').from('orders').whereNotExists((query) => {
        query.select('*').from('products').where('products.id', '=', new internal_2.Expression('"orders"."id"'));
    });
    t.is('select * from "orders" where not exists (select * from "products" where "products"."id" = "orders"."id")', builder.toSql());
    builder = getBuilder();
    builder.select('*').from('orders').where('id', '=', 1).orWhereExists((query) => {
        query.select('*').from('products').where('products.id', '=', new internal_2.Expression('"orders"."id"'));
    });
    t.is('select * from "orders" where "id" = ? or exists (select * from "products" where "products"."id" = "orders"."id")', builder.toSql());
    builder = getBuilder();
    builder.select('*').from('orders').where('id', '=', 1).orWhereNotExists((query) => {
        query.select('*').from('products').where('products.id', '=', new internal_2.Expression('"orders"."id"'));
    });
    t.is('select * from "orders" where "id" = ? or not exists (select * from "products" where "products"."id" = "orders"."id")', builder.toSql());
});
ava_1.default('testBasicJoins', (t) => {
    let builder = getBuilder();
    builder.select('*').from('users').join('contacts', 'users.id', 'contacts.id');
    t.is('select * from "users" inner join "contacts" on "users"."id" = "contacts"."id"', builder.toSql());
    builder = getBuilder();
    builder.select('*').from('users').join('contacts', 'users.id', '=', 'contacts.id').leftJoin('photos', 'users.id', '=', 'photos.id');
    t.is('select * from "users" inner join "contacts" on "users"."id" = "contacts"."id" left join "photos" on "users"."id" = "photos"."id"', builder.toSql());
    builder = getBuilder();
    builder.select('*').from('users').leftJoinWhere('photos', 'users.id', '=', 'bar').joinWhere('photos', 'users.id', '=', 'foo');
    t.is('select * from "users" left join "photos" on "users"."id" = ? inner join "photos" on "users"."id" = ?', builder.toSql());
    t.deepEqual(['bar', 'foo'], builder.getBindings());
});
ava_1.default('testCrossJoins', (t) => {
    let builder = getBuilder();
    builder.select('*').from('sizes').crossJoin('colors');
    t.is('select * from "sizes" cross join "colors"', builder.toSql());
    builder = getBuilder();
    builder.select('*').from('tableB').join('tableA', 'tableA.column1', '=', 'tableB.column2', 'cross');
    t.is('select * from "tableB" cross join "tableA" on "tableA"."column1" = "tableB"."column2"', builder.toSql());
    builder = getBuilder();
    builder.select('*').from('tableB').crossJoin('tableA', 'tableA.column1', '=', 'tableB.column2');
    t.is('select * from "tableB" cross join "tableA" on "tableA"."column1" = "tableB"."column2"', builder.toSql());
});
ava_1.default('testCrossJoinSubs', (t) => {
    const builder = getBuilder();
    builder.selectRaw('(sale / overall.sales) * 100 AS percent_of_total').from('sales').crossJoinSub(getBuilder().selectRaw('SUM(sale) AS sales').from('sales'), 'overall');
    t.is('select (sale / overall.sales) * 100 AS percent_of_total from "sales" cross join (select SUM(sale) AS sales from "sales") as "overall"', builder.toSql());
});
ava_1.default('testComplexJoin', (t) => {
    let builder = getBuilder();
    builder.select('*').from('users').join('contacts', (join) => {
        join.on('users.id', '=', 'contacts.id').orOn('users.name', '=', 'contacts.name');
    });
    t.is('select * from "users" inner join "contacts" on "users"."id" = "contacts"."id" or "users"."name" = "contacts"."name"', builder.toSql());
    builder = getBuilder();
    builder.select('*').from('users').join('contacts', (join) => {
        join.where('users.id', '=', 'foo').orWhere('users.name', '=', 'bar');
    });
    t.is('select * from "users" inner join "contacts" on "users"."id" = ? or "users"."name" = ?', builder.toSql());
    t.deepEqual(['foo', 'bar'], builder.getBindings());
    // Run the assertions again
    t.is('select * from "users" inner join "contacts" on "users"."id" = ? or "users"."name" = ?', builder.toSql());
    t.deepEqual(['foo', 'bar'], builder.getBindings());
});
ava_1.default('testJoinWhereNull', (t) => {
    let builder = getBuilder();
    builder.select('*').from('users').join('contacts', (join) => {
        join.on('users.id', '=', 'contacts.id').whereNull('contacts.deleted_at');
    });
    t.is('select * from "users" inner join "contacts" on "users"."id" = "contacts"."id" and "contacts"."deleted_at" is null', builder.toSql());
    builder = getBuilder();
    builder.select('*').from('users').join('contacts', (join) => {
        join.on('users.id', '=', 'contacts.id').orWhereNull('contacts.deleted_at');
    });
    t.is('select * from "users" inner join "contacts" on "users"."id" = "contacts"."id" or "contacts"."deleted_at" is null', builder.toSql());
});
ava_1.default('testJoinWhereNotNull', (t) => {
    let builder = getBuilder();
    builder.select('*').from('users').join('contacts', (join) => {
        join.on('users.id', '=', 'contacts.id').whereNotNull('contacts.deleted_at');
    });
    t.is('select * from "users" inner join "contacts" on "users"."id" = "contacts"."id" and "contacts"."deleted_at" is not null', builder.toSql());
    builder = getBuilder();
    builder.select('*').from('users').join('contacts', (join) => {
        join.on('users.id', '=', 'contacts.id').orWhereNotNull('contacts.deleted_at');
    });
    t.is('select * from "users" inner join "contacts" on "users"."id" = "contacts"."id" or "contacts"."deleted_at" is not null', builder.toSql());
});
ava_1.default('testJoinWhereIn', (t) => {
    let builder = getBuilder();
    builder.select('*').from('users').join('contacts', (join) => {
        join.on('users.id', '=', 'contacts.id').whereIn('contacts.name', [48, 'baz', null]);
    });
    t.is('select * from "users" inner join "contacts" on "users"."id" = "contacts"."id" and "contacts"."name" in (?, ?, ?)', builder.toSql());
    t.deepEqual([48, 'baz', null], builder.getBindings());
    builder = getBuilder();
    builder.select('*').from('users').join('contacts', (join) => {
        join.on('users.id', '=', 'contacts.id').orWhereIn('contacts.name', [48, 'baz', null]);
    });
    t.is('select * from "users" inner join "contacts" on "users"."id" = "contacts"."id" or "contacts"."name" in (?, ?, ?)', builder.toSql());
    t.deepEqual([48, 'baz', null], builder.getBindings());
});
ava_1.default('testJoinWhereInSubquery', (t) => {
    let builder = getBuilder();
    builder.select('*').from('users').join('contacts', (join) => {
        const query = getBuilder();
        query.select('name').from('contacts').where('name', 'baz');
        join.on('users.id', '=', 'contacts.id').whereIn('contacts.name', query);
    });
    t.is('select * from "users" inner join "contacts" on "users"."id" = "contacts"."id" and "contacts"."name" in (select "name" from "contacts" where "name" = ?)', builder.toSql());
    t.deepEqual(['baz'], builder.getBindings());
    builder = getBuilder();
    builder.select('*').from('users').join('contacts', (join) => {
        const query = getBuilder();
        query.select('name').from('contacts').where('name', 'baz');
        join.on('users.id', '=', 'contacts.id').orWhereIn('contacts.name', query);
    });
    t.is('select * from "users" inner join "contacts" on "users"."id" = "contacts"."id" or "contacts"."name" in (select "name" from "contacts" where "name" = ?)', builder.toSql());
    t.deepEqual(['baz'], builder.getBindings());
});
ava_1.default('testJoinWhereNotIn', (t) => {
    let builder = getBuilder();
    builder.select('*').from('users').join('contacts', (join) => {
        join.on('users.id', '=', 'contacts.id').whereNotIn('contacts.name', [48, 'baz', null]);
    });
    t.is('select * from "users" inner join "contacts" on "users"."id" = "contacts"."id" and "contacts"."name" not in (?, ?, ?)', builder.toSql());
    t.deepEqual([48, 'baz', null], builder.getBindings());
    builder = getBuilder();
    builder.select('*').from('users').join('contacts', (join) => {
        join.on('users.id', '=', 'contacts.id').orWhereNotIn('contacts.name', [48, 'baz', null]);
    });
    t.is('select * from "users" inner join "contacts" on "users"."id" = "contacts"."id" or "contacts"."name" not in (?, ?, ?)', builder.toSql());
    t.deepEqual([48, 'baz', null], builder.getBindings());
});
ava_1.default('testJoinsWithNestedConditions', (t) => {
    let builder = getBuilder();
    builder.select('*').from('users').leftJoin('contacts', (join) => {
        join.on('users.id', '=', 'contacts.id').where((join) => {
            join.where('contacts.country', '=', 'US').orWhere('contacts.is_partner', '=', 1);
        });
    });
    t.is('select * from "users" left join "contacts" on "users"."id" = "contacts"."id" and ("contacts"."country" = ? or "contacts"."is_partner" = ?)', builder.toSql());
    t.deepEqual(['US', 1], builder.getBindings());
    builder = getBuilder();
    builder.select('*').from('users').leftJoin('contacts', (join) => {
        join.on('users.id', '=', 'contacts.id').where('contacts.is_active', '=', 1).orOn((join) => {
            join.orWhere((join) => {
                join.where('contacts.country', '=', 'UK').orOn('contacts.type', '=', 'users.type');
            }).where((join) => {
                join.where('contacts.country', '=', 'US').orWhereNull('contacts.is_partner');
            });
        });
    });
    t.is('select * from "users" left join "contacts" on "users"."id" = "contacts"."id" and "contacts"."is_active" = ? or (("contacts"."country" = ? or "contacts"."type" = "users"."type") and ("contacts"."country" = ? or "contacts"."is_partner" is null))', builder.toSql());
    t.deepEqual([1, 'UK', 'US'], builder.getBindings());
});
ava_1.default('testJoinsWithAdvancedConditions', (t) => {
    let builder = getBuilder();
    builder.select('*').from('users').leftJoin('contacts', (join) => {
        join.on('users.id', 'contacts.id').where((join) => {
            join.orWhereNull('contacts.disabled')
                .orWhereRaw('year(contacts.created_at) = 2016');
        });
    });
    t.is('select * from "users" left join "contacts" on "users"."id" = "contacts"."id" and ("contacts"."disabled" is null or year(contacts.created_at) = 2016)', builder.toSql());
    t.deepEqual([], builder.getBindings());
});
ava_1.default('testJoinsWithSubqueryCondition', (t) => {
    let builder = getBuilder();
    builder.select('*').from('users').leftJoin('contacts', (join) => {
        join.on('users.id', 'contacts.id').whereIn('contact_type_id', (query) => {
            query.select('id').from('contact_types')
                .where('category_id', '1')
                .whereNull('deleted_at');
        });
    });
    t.is('select * from "users" left join "contacts" on "users"."id" = "contacts"."id" and "contact_type_id" in (select "id" from "contact_types" where "category_id" = ? and "deleted_at" is null)', builder.toSql());
    t.deepEqual(['1'], builder.getBindings());
    builder = getBuilder();
    builder.select('*').from('users').leftJoin('contacts', (join) => {
        join.on('users.id', 'contacts.id').whereExists((query) => {
            query.selectRaw('1').from('contact_types')
                .whereRaw('contact_types.id = contacts.contact_type_id')
                .where('category_id', '1')
                .whereNull('deleted_at');
        });
    });
    t.is('select * from "users" left join "contacts" on "users"."id" = "contacts"."id" and exists (select 1 from "contact_types" where contact_types.id = contacts.contact_type_id and "category_id" = ? and "deleted_at" is null)', builder.toSql());
    t.deepEqual(['1'], builder.getBindings());
});
ava_1.default('testJoinsWithAdvancedSubqueryCondition', (t) => {
    let builder = getBuilder();
    builder.select('*').from('users').leftJoin('contacts', (join) => {
        join.on('users.id', 'contacts.id').whereExists((query) => {
            query.selectRaw('1').from('contact_types')
                .whereRaw('contact_types.id = contacts.contact_type_id')
                .where('category_id', '1')
                .whereNull('deleted_at')
                .whereIn('level_id', (query) => {
                query.select('id').from('levels')
                    .where('is_active', true);
            });
        });
    });
    t.is('select * from "users" left join "contacts" on "users"."id" = "contacts"."id" and exists (select 1 from "contact_types" where contact_types.id = contacts.contact_type_id and "category_id" = ? and "deleted_at" is null and "level_id" in (select "id" from "levels" where "is_active" = ?))', builder.toSql());
    t.deepEqual(['1', true], builder.getBindings());
});
ava_1.default('testJoinsWithNestedJoins', (t) => {
    const builder = getBuilder();
    builder.select('users.id', 'contacts.id', 'contact_types.id').from('users').leftJoin('contacts', (join) => {
        join.on('users.id', 'contacts.id').join('contact_types', 'contacts.contact_type_id', '=', 'contact_types.id');
    });
    t.is('select "users"."id", "contacts"."id", "contact_types"."id" from "users" left join ("contacts" inner join "contact_types" on "contacts"."contact_type_id" = "contact_types"."id") on "users"."id" = "contacts"."id"', builder.toSql());
});
ava_1.default('testJoinsWithMultipleNestedJoins', (t) => {
    const builder = getBuilder();
    builder.select('users.id', 'contacts.id', 'contact_types.id', 'countrys.id', 'planets.id').from('users').leftJoin('contacts', (join) => {
        join.on('users.id', 'contacts.id')
            .join('contact_types', 'contacts.contact_type_id', '=', 'contact_types.id')
            .leftJoin('countrys', (query) => {
            query.on('contacts.country', '=', 'countrys.country')
                .join('planets', (query) => {
                query.on('countrys.planet_id', '=', 'planet.id')
                    .where('planet.is_settled', '=', 1)
                    .where('planet.population', '>=', 10000);
            });
        });
    });
    t.is('select "users"."id", "contacts"."id", "contact_types"."id", "countrys"."id", "planets"."id" from "users" left join ("contacts" inner join "contact_types" on "contacts"."contact_type_id" = "contact_types"."id" left join ("countrys" inner join "planets" on "countrys"."planet_id" = "planet"."id" and "planet"."is_settled" = ? and "planet"."population" >= ?) on "contacts"."country" = "countrys"."country") on "users"."id" = "contacts"."id"', builder.toSql());
    t.deepEqual([1, 10000], builder.getBindings());
});
ava_1.default('testJoinsWithNestedJoinWithAdvancedSubqueryCondition', (t) => {
    const builder = getBuilder();
    builder.select('users.id', 'contacts.id', 'contact_types.id').from('users').leftJoin('contacts', (join) => {
        join.on('users.id', 'contacts.id')
            .join('contact_types', 'contacts.contact_type_id', '=', 'contact_types.id')
            .whereExists((query) => {
            query.select('*').from('countrys')
                .whereColumn('contacts.country', '=', 'countrys.country')
                .join('planets', (query) => {
                query.on('countrys.planet_id', '=', 'planet.id')
                    .where('planet.is_settled', '=', 1);
            })
                .where('planet.population', '>=', 10000);
        });
    });
    t.is('select "users"."id", "contacts"."id", "contact_types"."id" from "users" left join ("contacts" inner join "contact_types" on "contacts"."contact_type_id" = "contact_types"."id") on "users"."id" = "contacts"."id" and exists (select * from "countrys" inner join "planets" on "countrys"."planet_id" = "planet"."id" and "planet"."is_settled" = ? where "contacts"."country" = "countrys"."country" and "planet"."population" >= ?)', builder.toSql());
    t.deepEqual([1, 10000], builder.getBindings());
});
ava_1.default('testJoinSub', (t) => {
    let builder = getBuilder();
    builder.from('users').joinSub('select * from "contacts"', 'sub', 'users.id', '=', 'sub.id');
    t.is('select * from "users" inner join (select * from "contacts") as "sub" on "users"."id" = "sub"."id"', builder.toSql());
    builder = getBuilder();
    builder.from('users').joinSub((query) => {
        query.from('contacts');
    }, 'sub', 'users.id', '=', 'sub.id');
    t.is('select * from "users" inner join (select * from "contacts") as "sub" on "users"."id" = "sub"."id"', builder.toSql());
    builder = getBuilder();
    const eloquentBuilder = new Builder_1.Builder(getBuilder().from('contacts'));
    builder.from('users').joinSub(eloquentBuilder, 'sub', 'users.id', '=', 'sub.id');
    t.is('select * from "users" inner join (select * from "contacts") as "sub" on "users"."id" = "sub"."id"', builder.toSql());
    builder = getBuilder();
    const sub1 = getBuilder().from('contacts').where('name', 'foo');
    const sub2 = getBuilder().from('contacts').where('name', 'bar');
    builder.from('users')
        .joinSub(sub1, 'sub1', 'users.id', '=', 1, 'inner', true)
        .joinSub(sub2, 'sub2', 'users.id', '=', 'sub2.user_id');
    let expected = 'select * from "users" ';
    expected += 'inner join (select * from "contacts" where "name" = ?) as "sub1" on "users"."id" = ? ';
    expected += 'inner join (select * from "contacts" where "name" = ?) as "sub2" on "users"."id" = "sub2"."user_id"';
    t.deepEqual(expected, builder.toSql());
    t.deepEqual(['foo', 1, 'bar'], builder.getRawBindings()['join']);
});
ava_1.default('testJoinSubWithPrefix', (t) => {
    const builder = getBuilder();
    builder.getGrammar().setTablePrefix('prefix_');
    builder.from('users').joinSub('select * from "contacts"', 'sub', 'users.id', '=', 'sub.id');
    t.is('select * from "prefix_users" inner join (select * from "contacts") as "prefix_sub" on "prefix_users"."id" = "prefix_sub"."id"', builder.toSql());
});
ava_1.default('testLeftJoinSub', (t) => {
    const builder = getBuilder();
    builder.from('users').leftJoinSub(getBuilder().from('contacts'), 'sub', 'users.id', '=', 'sub.id');
    t.is('select * from "users" left join (select * from "contacts") as "sub" on "users"."id" = "sub"."id"', builder.toSql());
});
ava_1.default('testRightJoinSub', (t) => {
    const builder = getBuilder();
    builder.from('users').rightJoinSub(getBuilder().from('contacts'), 'sub', 'users.id', '=', 'sub.id');
    t.is('select * from "users" right join (select * from "contacts") as "sub" on "users"."id" = "sub"."id"', builder.toSql());
});
ava_1.default('testRawExpressionsInSelect', (t) => {
    const builder = getBuilder();
    builder.select(new internal_2.Expression('substr(foo, 6)')).from('users');
    t.is('select substr(foo, 6) from "users"', builder.toSql());
});
ava_1.default('testFindReturnsFirstResultByID', (t) => {
    const builder = getBuilder();
    auto_verify_1.createMock(builder.getConnection()).expects('select').once().withArgs('select * from "users" where "id" = ? limit 1', [1]).returns([{ foo: 'bar' }]);
    auto_verify_1.createMock(builder.getProcessor()).expects('processSelect').once().withArgs(builder, [{ foo: 'bar' }]).callsFake((query, results) => {
        return results;
    });
    const results = builder.from('users').find(1);
    t.deepEqual({ foo: 'bar' }, results);
    auto_verify_1.autoVerify();
});
ava_1.default('testFirstMethodReturnsFirstResult', (t) => {
    const builder = getBuilder();
    auto_verify_1.createMock(builder.getConnection()).expects('select').once().withArgs('select * from "users" where "id" = ? limit 1', [1]).returns([{ foo: 'bar' }]);
    auto_verify_1.createMock(builder.getProcessor()).expects('processSelect').once().withArgs(builder, [{ foo: 'bar' }]).callsFake((query, results) => {
        return results;
    });
    const results = builder.from('users').where('id', '=', 1).first();
    t.deepEqual({ foo: 'bar' }, results);
    auto_verify_1.autoVerify();
});
ava_1.default('testPluckMethodGetsCollectionOfColumnValues', (t) => {
    let builder = getBuilder();
    auto_verify_1.createMock(builder.getConnection()).expects('select').once().returns([{ foo: 'bar' }, { foo: 'baz' }]);
    auto_verify_1.createMock(builder.getProcessor()).expects('processSelect').once().withArgs(builder, [{ foo: 'bar' }, { foo: 'baz' }]).callsFake((query, results) => {
        return results;
    });
    let results = builder.from('users').where('id', '=', 1).pluck('foo');
    t.deepEqual(['bar', 'baz'], results.all());
    builder = getBuilder();
    auto_verify_1.createMock(builder.getConnection()).expects('select').once().returns([{ id: 1, foo: 'bar' }, { id: 10, foo: 'baz' }]);
    auto_verify_1.createMock(builder.getProcessor()).expects('processSelect').once().withArgs(builder, [{ id: 1, foo: 'bar' }, { id: 10, foo: 'baz' }]).callsFake((query, results) => {
        return results;
    });
    results = builder.from('users').where('id', '=', 1).pluck('foo', 'id');
    t.deepEqual({ 1: 'bar', 10: 'baz' }, results.all());
    auto_verify_1.autoVerify();
});
ava_1.default('testImplode', (t) => {
    // Test without glue.
    let builder = getBuilder();
    auto_verify_1.createMock(builder.getConnection()).expects('select').once().returns([{ foo: 'bar' }, { foo: 'baz' }]);
    auto_verify_1.createMock(builder.getProcessor()).expects('processSelect').once().withArgs(builder, [{ foo: 'bar' }, { foo: 'baz' }]).callsFake((query, results) => {
        return results;
    });
    let results = builder.from('users').where('id', '=', 1).implode('foo');
    t.is('barbaz', results);
    // Test with glue.
    builder = getBuilder();
    auto_verify_1.createMock(builder.getConnection()).expects('select').once().returns([{ foo: 'bar' }, { foo: 'baz' }]);
    auto_verify_1.createMock(builder.getProcessor()).expects('processSelect').once().withArgs(builder, [{ foo: 'bar' }, { foo: 'baz' }]).callsFake((query, results) => {
        return results;
    });
    results = builder.from('users').where('id', '=', 1).implode('foo', ',');
    t.is('bar,baz', results);
    auto_verify_1.autoVerify();
});
ava_1.default('testValueMethodReturnsSingleColumn', (t) => {
    const builder = getBuilder();
    auto_verify_1.createMock(builder.getConnection()).expects('select').once().withArgs('select "foo" from "users" where "id" = ? limit 1', [1]).returns([{ foo: 'bar' }]);
    auto_verify_1.createMock(builder.getProcessor()).expects('processSelect').once().withArgs(builder, [{ foo: 'bar' }]).returns([{ foo: 'bar' }]);
    const results = builder.from('users').where('id', '=', 1).value('foo');
    t.deepEqual('bar', results);
    auto_verify_1.autoVerify();
});
ava_1.default('testAggregateFunctions', (t) => {
    let builder = getBuilder();
    auto_verify_1.createMock(builder.getConnection()).expects('select').once().withArgs('select count(*) as aggregate from "users"', []).returns([{ aggregate: 1 }]);
    auto_verify_1.createMock(builder.getProcessor()).expects('processSelect').once().callsFake((builder, results) => {
        return results;
    });
    let results = builder.from('users').count();
    t.is(1, results);
    builder = getBuilder();
    auto_verify_1.createMock(builder.getConnection()).expects('select').once().withArgs('select exists(select * from "users") as "exists"', []).returns([{ exists: 1 }]);
    results = builder.from('users').exists();
    t.true(results);
    builder = getBuilder();
    auto_verify_1.createMock(builder.getConnection()).expects('select').once().withArgs('select exists(select * from "users") as "exists"', []).returns([{ exists: 0 }]);
    results = builder.from('users').doesntExist();
    t.true(results);
    builder = getBuilder();
    auto_verify_1.createMock(builder.getConnection()).expects('select').once().withArgs('select max("id") as aggregate from "users"', []).returns([{ aggregate: 1 }]);
    auto_verify_1.createMock(builder.getProcessor()).expects('processSelect').once().callsFake((builder, results) => {
        return results;
    });
    results = builder.from('users').max('id');
    t.is(1, results);
    builder = getBuilder();
    auto_verify_1.createMock(builder.getConnection()).expects('select').once().withArgs('select min("id") as aggregate from "users"', []).returns([{ aggregate: 1 }]);
    auto_verify_1.createMock(builder.getProcessor()).expects('processSelect').once().callsFake((builder, results) => {
        return results;
    });
    results = builder.from('users').min('id');
    t.is(1, results);
    builder = getBuilder();
    auto_verify_1.createMock(builder.getConnection()).expects('select').once().withArgs('select sum("id") as aggregate from "users"', []).returns([{ aggregate: 1 }]);
    auto_verify_1.createMock(builder.getProcessor()).expects('processSelect').once().callsFake((builder, results) => {
        return results;
    });
    results = builder.from('users').sum('id');
    t.is(1, results);
    auto_verify_1.autoVerify();
});
ava_1.default('testSqlServerExists', (t) => {
    const builder = getSqlServerBuilder();
    auto_verify_1.createMock(builder.getConnection()).expects('select').once().withArgs('select top 1 1 [exists] from [users]', []).returns([{ exists: 1 }]);
    const results = builder.from('users').exists();
    t.true(results);
    auto_verify_1.autoVerify();
});
ava_1.default('testDoesntExistsOr', (t) => {
    let builder = getBuilder();
    auto_verify_1.createMock(builder.getConnection()).expects('select').returns([{ exists: 1 }]);
    let results = builder.from('users').doesntExistOr(() => {
        return 123;
    });
    t.is(123, results);
    builder = getBuilder();
    auto_verify_1.createMock(builder.getConnection()).expects('select').returns([{ exists: 0 }]);
    results = builder.from('users').doesntExistOr(() => {
        throw new Error('RuntimeException');
    });
    t.true(results);
    auto_verify_1.autoVerify();
});
ava_1.default('testExistsOr', (t) => {
    let builder = getBuilder();
    auto_verify_1.createMock(builder.getConnection()).expects('select').returns([{ exists: 0 }]);
    let results = builder.from('users').existsOr(() => {
        return 123;
    });
    t.is(123, results);
    builder = getBuilder();
    auto_verify_1.createMock(builder.getConnection()).expects('select').returns([{ exists: 1 }]);
    results = builder.from('users').existsOr(() => {
        throw new Error('RuntimeException');
    });
    t.true(results);
    auto_verify_1.autoVerify();
});
ava_1.default('testAggregateResetFollowedByGet', (t) => {
    let builder = getBuilder();
    const connectionMock = auto_verify_1.createMock(builder.getConnection());
    connectionMock.expects('select').once().withArgs('select count(*) as aggregate from "users"', []).returns([{ aggregate: 1 }]);
    connectionMock.expects('select').once().withArgs('select sum("id") as aggregate from "users"', []).returns([{ aggregate: 2 }]);
    connectionMock.expects('select').once().withArgs('select "column1", "column2" from "users"', []).returns([{ column1: 'foo', column2: 'bar' }]);
    auto_verify_1.createMock(builder.getProcessor()).expects('processSelect').thrice().callsFake((builder, results) => {
        return results;
    });
    builder.from('users').select('column1', 'column2');
    const count = builder.count();
    t.is(1, count);
    const sum = builder.sum('id');
    t.is(2, sum);
    const result = builder.get();
    t.deepEqual([{ column1: 'foo', column2: 'bar' }], result.all());
    auto_verify_1.autoVerify();
});
ava_1.default('testAggregateResetFollowedBySelectGet', (t) => {
    let builder = getBuilder();
    const connectionMock = auto_verify_1.createMock(builder.getConnection());
    connectionMock.expects('select').once().withArgs('select count("column1") as aggregate from "users"', []).returns([{ aggregate: 1 }]);
    connectionMock.expects('select').once().withArgs('select "column2", "column3" from "users"', []).returns([{ column2: 'foo', column3: 'bar' }]);
    auto_verify_1.createMock(builder.getProcessor()).expects('processSelect').twice().callsFake((builder, results) => {
        return results;
    });
    builder.from('users');
    const count = builder.count('column1');
    t.is(1, count);
    const result = builder.select('column2', 'column3').get();
    t.deepEqual([{ column2: 'foo', column3: 'bar' }], result.all());
    auto_verify_1.autoVerify();
});
ava_1.default('testAggregateResetFollowedByGetWithColumns', (t) => {
    let builder = getBuilder();
    const connectionMock = auto_verify_1.createMock(builder.getConnection());
    connectionMock.expects('select').once().withArgs('select count("column1") as aggregate from "users"', []).returns([{ aggregate: 1 }]);
    connectionMock.expects('select').once().withArgs('select "column2", "column3" from "users"', []).returns([{ column2: 'foo', column3: 'bar' }]);
    auto_verify_1.createMock(builder.getProcessor()).expects('processSelect').twice().callsFake((builder, results) => {
        return results;
    });
    builder.from('users');
    const count = builder.count('column1');
    t.is(1, count);
    const result = builder.get(['column2', 'column3']);
    t.deepEqual([{ column2: 'foo', column3: 'bar' }], result.all());
    auto_verify_1.autoVerify();
});
ava_1.default('testAggregateWithSubSelect', (t) => {
    const builder = getBuilder();
    auto_verify_1.createMock(builder.getConnection()).expects('select').once().withArgs('select count(*) as aggregate from "users"', []).returns([{ aggregate: 1 }]);
    auto_verify_1.createMock(builder.getProcessor()).expects('processSelect').once().callsFake((builder, results) => {
        return results;
    });
    builder.from('users').selectSub((query) => {
        query.from('posts').select('foo', 'bar').where('title', 'foo');
    }, 'post');
    const count = builder.count();
    t.is(1, count);
    t.is('(select "foo", "bar" from "posts" where "title" = ?) as "post"', builder.columns[0].getValue());
    t.deepEqual(['foo'], builder.getBindings());
    auto_verify_1.autoVerify();
});
ava_1.default('testSubqueriesBindings', (t) => {
    let builder = getBuilder();
    const second = getBuilder().select('*').from('users').orderByRaw('id = ?', 2);
    const third = getBuilder().select('*').from('users').where('id', 3).groupBy('id').having('id', '!=', 4);
    builder.groupBy('a').having('a', '=', 1).union(second).union(third);
    t.deepEqual([1, 2, 3, 4], builder.getBindings());
    builder = getBuilder().select('*').from('users').where('email', '=', (query) => {
        query.select(new internal_2.Expression('max(id)'))
            .from('users').where('email', '=', 'bar')
            .orderByRaw('email like ?', '%.com')
            .groupBy('id').having('id', '=', 4);
    }).orWhere('id', '=', 'foo').groupBy('id').having('id', '=', 5);
    t.deepEqual(['bar', 4, '%.com', 'foo', 5], builder.getBindings());
});
ava_1.default('testInsertMethod', (t) => {
    const builder = getBuilder();
    auto_verify_1.createMock(builder.getConnection()).expects('insert').once().withArgs('insert into "users" ("email") values (?)', ['foo']).returns(true);
    const result = builder.from('users').insert({ email: 'foo' });
    t.true(result);
    auto_verify_1.autoVerify();
});
ava_1.default('testInsertUsingMethod', (t) => {
    const builder = getBuilder();
    auto_verify_1.createMock(builder.getConnection()).expects('affectingStatement').once().withArgs('insert into "table1" ("foo") select "bar" from "table2" where "foreign_id" = ?', [5]).returns(1);
    const result = builder.from('table1').insertUsing(['foo'], (query) => {
        query.select(['bar']).from('table2').where('foreign_id', '=', 5);
    });
    t.is(1, result);
    auto_verify_1.autoVerify();
});
ava_1.default('testInsertOrIgnoreMethod', (t) => {
    const error = t.throws(() => {
        const builder = getBuilder();
        builder.from('users').insertOrIgnore({ 'email': 'foo' });
    }, { instanceOf: Error });
    t.true(error.message.includes('RuntimeException'));
    t.true(error.message.includes('does not support'));
});
ava_1.default('testMySqlInsertOrIgnoreMethod', (t) => {
    const builder = getMySqlBuilder();
    auto_verify_1.createMock(builder.getConnection()).expects('affectingStatement').once().withArgs('insert ignore into `users` (`email`) values (?)', ['foo']).returns(1);
    const result = builder.from('users').insertOrIgnore({ email: 'foo' });
    t.is(1, result);
    auto_verify_1.autoVerify();
});
ava_1.default('testPostgresInsertOrIgnoreMethod', (t) => {
    const builder = getPostgresBuilder();
    auto_verify_1.createMock(builder.getConnection()).expects('affectingStatement').once().withArgs('insert into "users" ("email") values (?) on conflict do nothing', ['foo']).returns(1);
    const result = builder.from('users').insertOrIgnore({ email: 'foo' });
    t.is(1, result);
    auto_verify_1.autoVerify();
});
ava_1.default('testSQLiteInsertOrIgnoreMethod', async (t) => {
    const builder = getSQLiteBuilder();
    auto_verify_1.createMock(builder.getConnection()).expects('affectingStatement').once().withArgs('insert or ignore into "users" ("email") values (?)', ['foo']).resolves(1);
    const result = await builder.from('users').insertOrIgnore({ email: 'foo' });
    t.is(1, result);
    auto_verify_1.autoVerify();
});
ava_1.default('testSqlServerInsertOrIgnoreMethod', (t) => {
    const error = t.throws(() => {
        const builder = getSqlServerBuilder();
        builder.from('users').insertOrIgnore({ 'email': 'foo' });
    }, { instanceOf: Error });
    t.true(error.message.includes('RuntimeException'));
    t.true(error.message.includes('does not support'));
});
ava_1.default('testInsertGetIdMethod', async (t) => {
    const builder = getBuilder();
    auto_verify_1.createMock(builder.getProcessor()).expects('processInsertGetId').once().withArgs(builder, 'insert into "users" ("email") values (?)', ['foo'], 'id').resolves(1);
    const result = await builder.from('users').insertGetId({ email: 'foo' }, 'id');
    t.is(1, result);
    auto_verify_1.autoVerify();
});
ava_1.default('testInsertGetIdMethodRemovesExpressions', async (t) => {
    const builder = getBuilder();
    auto_verify_1.createMock(builder.getProcessor()).expects('processInsertGetId').once().withArgs(builder, 'insert into "users" ("email", "bar") values (?, bar)', ['foo'], 'id').resolves(1);
    const result = await builder.from('users').insertGetId({ email: 'foo', bar: new internal_2.Expression('bar') }, 'id');
    t.is(1, result);
    auto_verify_1.autoVerify();
});
ava_1.default('testInsertGetIdWithEmptyValues', (t) => {
    let builder = getMySqlBuilder();
    auto_verify_1.createMock(builder.getProcessor()).expects('processInsertGetId').once().withArgs(builder, 'insert into `users` () values ()', [], undefined);
    builder.from('users').insertGetId([]);
    builder = getPostgresBuilder();
    auto_verify_1.createMock(builder.getProcessor()).expects('processInsertGetId').once().withArgs(builder, 'insert into "users" default values returning "id"', [], undefined);
    builder.from('users').insertGetId([]);
    builder = getSQLiteBuilder();
    auto_verify_1.createMock(builder.getProcessor()).expects('processInsertGetId').once().withArgs(builder, 'insert into "users" default values', [], undefined);
    builder.from('users').insertGetId([]);
    builder = getSqlServerBuilder();
    auto_verify_1.createMock(builder.getProcessor()).expects('processInsertGetId').once().withArgs(builder, 'insert into [users] default values', [], undefined);
    builder.from('users').insertGetId([]);
    t.pass();
    auto_verify_1.autoVerify();
});
ava_1.default('testInsertMethodRespectsRawBindings', async (t) => {
    const builder = getBuilder();
    auto_verify_1.createMock(builder.getConnection()).expects('insert').once().withArgs('insert into "users" ("email") values (CURRENT TIMESTAMP)', []).resolves(true);
    const result = await builder.from('users').insert({ 'email': new internal_2.Expression('CURRENT TIMESTAMP') });
    t.true(result);
    auto_verify_1.autoVerify();
});
ava_1.default('testMultipleInsertsWithExpressionValues', async (t) => {
    const builder = getBuilder();
    auto_verify_1.createMock(builder.getConnection()).expects('insert').once().withArgs('insert into "users" ("email") values (UPPER(\'Foo\')), (LOWER(\'Foo\'))', []).resolves(true);
    const result = await builder.from('users').insert([{ 'email': new internal_2.Expression("UPPER('Foo')") }, { 'email': new internal_2.Expression("LOWER('Foo')") }]);
    t.true(result);
    auto_verify_1.autoVerify();
});
ava_1.default('testUpdateMethod', async (t) => {
    let builder = getBuilder();
    auto_verify_1.createMock(builder.getConnection()).expects('update').once().withArgs('update "users" set "email" = ?, "name" = ? where "id" = ?', ['foo', 'bar', 1]).resolves(1);
    let result = await builder.from('users').where('id', '=', 1).update({ email: 'foo', name: 'bar' });
    t.is(1, result);
    builder = getMySqlBuilder();
    auto_verify_1.createMock(builder.getConnection()).expects('update').once().withArgs('update `users` set `email` = ?, `name` = ? where `id` = ? order by `foo` desc limit 5', ['foo', 'bar', 1]).resolves(1);
    result = await builder.from('users').where('id', '=', 1).orderBy('foo', 'desc').limit(5).update({ email: 'foo', name: 'bar' });
    t.is(1, result);
    auto_verify_1.autoVerify();
});
ava_1.default('testUpsertMethod', async (t) => {
    let builder = getMySqlBuilder();
    auto_verify_1.createMock(builder.getConnection()).expects('affectingStatement').once().withArgs('insert into `users` (`email`, `name`) values (?, ?), (?, ?) on duplicate key update `email` = values(`email`), `name` = values(`name`)', ['foo', 'bar', 'foo2', 'bar2']).resolves(2);
    let result = await builder.from('users').upsert([{ email: 'foo', name: 'bar' }, { name: 'bar2', email: 'foo2' }], 'email');
    t.is(2, result);
    builder = getPostgresBuilder();
    auto_verify_1.createMock(builder.getConnection()).expects('affectingStatement').once().withArgs('insert into "users" ("email", "name") values (?, ?), (?, ?) on conflict ("email") do update set "email" = "excluded"."email", "name" = "excluded"."name"', ['foo', 'bar', 'foo2', 'bar2']).resolves(2);
    result = await builder.from('users').upsert([{ email: 'foo', 'name': 'bar' }, { 'name': 'bar2', 'email': 'foo2' }], 'email');
    t.is(2, result);
    builder = getSQLiteBuilder();
    auto_verify_1.createMock(builder.getConnection()).expects('affectingStatement').once().withArgs('insert into "users" ("email", "name") values (?, ?), (?, ?) on conflict ("email") do update set "email" = "excluded"."email", "name" = "excluded"."name"', ['foo', 'bar', 'foo2', 'bar2']).resolves(2);
    result = await builder.from('users').upsert([{ email: 'foo', name: 'bar' }, { name: 'bar2', 'email': 'foo2' }], 'email');
    t.is(2, result);
    builder = getSqlServerBuilder();
    auto_verify_1.createMock(builder.getConnection()).expects('affectingStatement').once().withArgs('merge [users] using (values (?, ?), (?, ?)) [laravel_source] ([email], [name]) on [laravel_source].[email] = [users].[email] when matched then update set [email] = [laravel_source].[email], [name] = [laravel_source].[name] when not matched then insert ([email], [name]) values ([email], [name]);', ['foo', 'bar', 'foo2', 'bar2']).resolves(2);
    result = await builder.from('users').upsert([{ email: 'foo', name: 'bar' }, { name: 'bar2', email: 'foo2' }], 'email');
    t.is(2, result);
    auto_verify_1.autoVerify();
});
ava_1.default('testUpsertMethodWithUpdateColumns', async (t) => {
    let builder = getMySqlBuilder();
    auto_verify_1.createMock(builder.getConnection()).expects('affectingStatement').once().withArgs('insert into `users` (`email`, `name`) values (?, ?), (?, ?) on duplicate key update `name` = values(`name`)', ['foo', 'bar', 'foo2', 'bar2']).resolves(2);
    let result = await builder.from('users').upsert([{ email: 'foo', name: 'bar' }, { name: 'bar2', email: 'foo2' }], 'email', ['name']);
    t.is(2, result);
    builder = getPostgresBuilder();
    auto_verify_1.createMock(builder.getConnection()).expects('affectingStatement').once().withArgs('insert into "users" ("email", "name") values (?, ?), (?, ?) on conflict ("email") do update set "name" = "excluded"."name"', ['foo', 'bar', 'foo2', 'bar2']).resolves(2);
    result = await builder.from('users').upsert([{ email: 'foo', name: 'bar' }, { name: 'bar2', email: 'foo2' }], 'email', ['name']);
    t.is(2, result);
    builder = getSQLiteBuilder();
    auto_verify_1.createMock(builder.getConnection()).expects('affectingStatement').once().withArgs('insert into "users" ("email", "name") values (?, ?), (?, ?) on conflict ("email") do update set "name" = "excluded"."name"', ['foo', 'bar', 'foo2', 'bar2']).resolves(2);
    result = await builder.from('users').upsert([{ email: 'foo', name: 'bar' }, { name: 'bar2', email: 'foo2' }], 'email', ['name']);
    t.is(2, result);
    builder = getSqlServerBuilder();
    auto_verify_1.createMock(builder.getConnection()).expects('affectingStatement').once().withArgs('merge [users] using (values (?, ?), (?, ?)) [laravel_source] ([email], [name]) on [laravel_source].[email] = [users].[email] when matched then update set [name] = [laravel_source].[name] when not matched then insert ([email], [name]) values ([email], [name]);', ['foo', 'bar', 'foo2', 'bar2']).resolves(2);
    result = await builder.from('users').upsert([{ email: 'foo', name: 'bar' }, { name: 'bar2', email: 'foo2' }], 'email', ['name']);
    t.is(2, result);
});
// test('test_name', (t) => {
// });
//# sourceMappingURL=Builder.spec.js.map