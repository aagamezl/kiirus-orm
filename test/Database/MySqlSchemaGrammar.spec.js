const test = require('ava')

const { Blueprint } = require('./../../lib/Illuminate/Database/Schema/Blueprint')
const { Expression } = require('../../lib/Illuminate/Database/Query/Expression')
const { ForeignIdColumnDefinition } = require('./../../lib/Illuminate/Database/Schema/ForeignIdColumnDefinition')
const { MySqlGrammar } = require('../../lib/Illuminate/Database/Schema/Grammars/MySqlGrammar')
const { getConnection } = require('./common')
const { mock } = require('../tools/mock')

const getGrammar = () => new MySqlGrammar()

test('testBasicCreateTable', (t) => {
  const { createMock, verifyMock } = mock()

  let blueprint = new Blueprint('users')
  blueprint.create()
  blueprint.increments('id')
  blueprint.string('email')

  let connection = getConnection()
  const connectionMock = createMock(connection)

  connectionMock.expects('getConfig').once().withArgs('charset').returns('utf8')
  connectionMock.expects('getConfig').once().withArgs('collation').returns('utf8_unicode_ci')
  connectionMock.expects('getConfig').once().withArgs('engine').returns(undefined)

  let statements = blueprint.toSql(connection, getGrammar())

  t.is(1, statements.length)
  t.is("create table `users` (`id` int unsigned not null auto_increment primary key, `email` varchar(255) not null) default character set utf8 collate 'utf8_unicode_ci'", statements[0])

  blueprint = new Blueprint('users')
  blueprint.increments('id')
  blueprint.string('email')

  connection = getConnection()

  statements = blueprint.toSql(connection, getGrammar())

  t.is(1, statements.length)
  t.is('alter table `users` add `id` int unsigned not null auto_increment primary key, add `email` varchar(255) not null', statements[0])

  verifyMock()
})

test('testAutoIncrementStartingValue', (t) => {
  const { createMock, verifyMock } = mock()

  const blueprint = new Blueprint('users')
  blueprint.create()
  // blueprint.increments('id').set('startingValue', 1000)
  blueprint.increments('id').startingValue(1000)
  blueprint.string('email')

  const connection = getConnection()
  const connectionMock = createMock(connection)
  connectionMock.expects('getConfig').once().withArgs('charset').returns('utf8')
  connectionMock.expects('getConfig').once().withArgs('collation').returns('utf8_unicode_ci')
  connectionMock.expects('getConfig').once().withArgs('engine').returns(undefined)

  const statements = blueprint.toSql(connection, getGrammar())

  t.is(2, statements.length)
  t.is("create table `users` (`id` int unsigned not null auto_increment primary key, `email` varchar(255) not null) default character set utf8 collate 'utf8_unicode_ci'", statements[0])
  t.is('alter table `users` auto_increment = 1000', statements[1])

  verifyMock()
})

test('testEngineCreateTable', (t) => {
  const { createMock, verifyMock } = mock()

  let blueprint = new Blueprint('users')
  blueprint.create()
  blueprint.increments('id')
  blueprint.string('email')
  blueprint.engine = 'InnoDB'

  let connection = getConnection()
  let connectionMock = createMock(connection)
  connectionMock.expects('getConfig').once().withArgs('charset').returns('utf8')
  connectionMock.expects('getConfig').once().withArgs('collation').returns('utf8_unicode_ci')

  let statements = blueprint.toSql(connection, getGrammar())

  t.is(1, statements.length)
  t.is("create table `users` (`id` int unsigned not null auto_increment primary key, `email` varchar(255) not null) default character set utf8 collate 'utf8_unicode_ci' engine = InnoDB", statements[0])

  blueprint = new Blueprint('users')
  blueprint.create()
  blueprint.increments('id')
  blueprint.string('email')

  connection = getConnection()
  connectionMock = createMock(connection)
  connectionMock.expects('getConfig').once().withArgs('charset').returns('utf8')
  connectionMock.expects('getConfig').once().withArgs('collation').returns('utf8_unicode_ci')
  connectionMock.expects('getConfig').once().withArgs('engine').returns('InnoDB')

  statements = blueprint.toSql(connection, getGrammar())

  t.is(1, statements.length)
  t.is("create table `users` (`id` int unsigned not null auto_increment primary key, `email` varchar(255) not null) default character set utf8 collate 'utf8_unicode_ci' engine = InnoDB", statements[0])

  verifyMock()
})

test('testCharsetCollationCreateTable', (t) => {
  const { createMock, verifyMock } = mock()

  let blueprint = new Blueprint('users')
  blueprint.create()
  blueprint.increments('id')
  blueprint.string('email')
  blueprint.charset = 'utf8mb4'
  blueprint.collation = 'utf8mb4_unicode_ci'

  let connection = getConnection()
  let connectionMock = createMock(connection)
  connectionMock.expects('getConfig').once().withArgs('engine').returns(undefined)

  let statements = blueprint.toSql(connection, getGrammar())

  t.is(1, statements.length)
  t.is("create table `users` (`id` int unsigned not null auto_increment primary key, `email` varchar(255) not null) default character set utf8mb4 collate 'utf8mb4_unicode_ci'", statements[0])

  blueprint = new Blueprint('users')
  blueprint.create()
  blueprint.increments('id')
  blueprint.string('email')
    .set('charset', 'utf8mb4')
    .set('collation', 'utf8mb4_unicode_ci')

  connection = getConnection()
  connectionMock = createMock(connection)
  connectionMock = createMock(connection)
  connectionMock.expects('getConfig').once().withArgs('charset').returns('utf8')
  connectionMock.expects('getConfig').once().withArgs('collation').returns('utf8_unicode_ci')
  connectionMock.expects('getConfig').once().withArgs('engine').returns(undefined)

  statements = blueprint.toSql(connection, getGrammar())

  t.is(1, statements.length)
  t.is("create table `users` (`id` int unsigned not null auto_increment primary key, `email` varchar(255) character set utf8mb4 collate 'utf8mb4_unicode_ci' not null) default character set utf8 collate 'utf8_unicode_ci'", statements[0])

  verifyMock()
})

test('testBasicCreateTableWithPrefix', (t) => {
  const { createMock, verifyMock } = mock()

  const blueprint = new Blueprint('users')
  blueprint.create()
  blueprint.increments('id')
  blueprint.string('email')
  const grammar = getGrammar()
  grammar.setTablePrefix('prefix_')

  const connection = getConnection()
  const connectionMock = createMock(connection)
  connectionMock.expects('getConfig').atLeast(1).returns(undefined)

  const statements = blueprint.toSql(connection, grammar)

  t.is(1, statements.length)
  t.is('create table `prefix_users` (`id` int unsigned not null auto_increment primary key, `email` varchar(255) not null)', statements[0])

  verifyMock()
})

test('testCreateTemporaryTable', (t) => {
  const blueprint = new Blueprint('users')
  blueprint.create()
  blueprint.temporary()
  blueprint.increments('id')
  blueprint.string('email')

  const connection = getConnection()

  const statements = blueprint.toSql(connection, getGrammar())

  t.is(1, statements.length)
  t.is('create temporary table `users` (`id` int unsigned not null auto_increment primary key, `email` varchar(255) not null)', statements[0])
})

test('testDropTable', (t) => {
  const blueprint = new Blueprint('users')
  blueprint.drop()
  const statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('drop table `users`', statements[0])
})

test('testDropTableIfExists', (t) => {
  const blueprint = new Blueprint('users')
  blueprint.dropIfExists()
  const statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('drop table if exists `users`', statements[0])
})

test('testDropColumn', (t) => {
  let blueprint = new Blueprint('users')
  blueprint.dropColumn('foo')
  let statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('alter table `users` drop `foo`', statements[0])

  blueprint = new Blueprint('users')
  blueprint.dropColumn(['foo', 'bar'])
  statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('alter table `users` drop `foo`, drop `bar`', statements[0])

  blueprint = new Blueprint('users')
  blueprint.dropColumn('foo', 'bar')
  statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('alter table `users` drop `foo`, drop `bar`', statements[0])
})

test('testDropPrimary', (t) => {
  const blueprint = new Blueprint('users')
  blueprint.dropPrimary()
  const statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('alter table `users` drop primary key', statements[0])
})

test('testDropUnique', (t) => {
  const blueprint = new Blueprint('users')
  blueprint.dropUnique('foo')
  const statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('alter table `users` drop index `foo`', statements[0])
})

test('testDropIndex', (t) => {
  const blueprint = new Blueprint('users')
  blueprint.dropIndex('foo')
  const statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('alter table `users` drop index `foo`', statements[0])
})

test('testDropSpatialIndex', (t) => {
  const blueprint = new Blueprint('geo')
  blueprint.dropSpatialIndex(['coordinates'])
  const statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('alter table `geo` drop index `geo_coordinates_spatialindex`', statements[0])
})

test('testDropForeign', (t) => {
  const blueprint = new Blueprint('users')
  blueprint.dropForeign('foo')
  const statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('alter table `users` drop foreign key `foo`', statements[0])
})

test('testDropTimestamps', (t) => {
  const blueprint = new Blueprint('users')
  blueprint.dropTimestamps()
  const statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('alter table `users` drop `created_at`, drop `updated_at`', statements[0])
})

test('testDropTimestampsTz', (t) => {
  const blueprint = new Blueprint('users')
  blueprint.dropTimestampsTz()
  const statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('alter table `users` drop `created_at`, drop `updated_at`', statements[0])
})

test('testDropMorphs', (t) => {
  const blueprint = new Blueprint('photos')
  blueprint.dropMorphs('imageable')
  const statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(2, statements.length)
  t.is('alter table `photos` drop index `photos_imageable_type_imageable_id_index`', statements[0])
  t.is('alter table `photos` drop `imageable_type`, drop `imageable_id`', statements[1])
})

test('testRenameTable', (t) => {
  const blueprint = new Blueprint('users')
  blueprint.rename('foo')
  const statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('rename table `users` to `foo`', statements[0])
})

test('testRenameIndex', (t) => {
  const blueprint = new Blueprint('users')
  blueprint.renameIndex('foo', 'bar')
  const statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('alter table `users` rename index `foo` to `bar`', statements[0])
})

test('testAddingPrimaryKey', (t) => {
  const blueprint = new Blueprint('users')
  blueprint.primary('foo', 'bar')
  const statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('alter table `users` add primary key `bar`(`foo`)', statements[0])
})

test('testAddingPrimaryKeyWithAlgorithm', (t) => {
  const blueprint = new Blueprint('users')
  blueprint.primary('foo', 'bar', 'hash')
  const statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('alter table `users` add primary key `bar` using hash(`foo`)', statements[0])
})

test('testAddingUniqueKey', (t) => {
  const blueprint = new Blueprint('users')
  blueprint.unique('foo', 'bar')
  const statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('alter table `users` add unique `bar`(`foo`)', statements[0])
})

test('testAddingIndex', (t) => {
  const blueprint = new Blueprint('users')
  blueprint.index(['foo', 'bar'], 'baz')
  const statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('alter table `users` add index `baz`(`foo`, `bar`)', statements[0])
})

test('testAddingIndexWithAlgorithm', (t) => {
  const blueprint = new Blueprint('users')
  blueprint.index(['foo', 'bar'], 'baz', 'hash')
  const statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('alter table `users` add index `baz` using hash(`foo`, `bar`)', statements[0])
})

test('testAddingSpatialIndex', (t) => {
  const blueprint = new Blueprint('geo')
  blueprint.spatialIndex('coordinates')
  const statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('alter table `geo` add spatial index `geo_coordinates_spatialindex`(`coordinates`)', statements[0])
})

test('testAddingFluentSpatialIndex', (t) => {
  const blueprint = new Blueprint('geo')
  blueprint.point('coordinates').set('spatialIndex', true)
  const statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(2, statements.length)
  t.is('alter table `geo` add spatial index `geo_coordinates_spatialindex`(`coordinates`)', statements[1])
})

test('testAddingRawIndex', (t) => {
  const blueprint = new Blueprint('users')
  blueprint.rawIndex('(function(column))', 'raw_index')
  const statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('alter table `users` add index `raw_index`((function(column)))', statements[0])
})

test('testAddingForeignKey', (t) => {
  let blueprint = new Blueprint('users')
  blueprint.foreign('foo_id').set('references', 'id').set('on', 'orders')
  let statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('alter table `users` add constraint `users_foo_id_foreign` foreign key (`foo_id`) references `orders` (`id`)', statements[0])

  blueprint = new Blueprint('users')
  blueprint.foreign('foo_id').set('references', 'id').set('on', 'orders').cascadeOnDelete()
  statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('alter table `users` add constraint `users_foo_id_foreign` foreign key (`foo_id`) references `orders` (`id`) on delete cascade', statements[0])

  blueprint = new Blueprint('users')
  blueprint.foreign('foo_id').set('references', 'id').set('on', 'orders').cascadeOnUpdate()
  statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('alter table `users` add constraint `users_foo_id_foreign` foreign key (`foo_id`) references `orders` (`id`) on update cascade', statements[0])
})

test('testAddingIncrementingID', (t) => {
  const blueprint = new Blueprint('users')
  blueprint.increments('id')
  const statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('alter table `users` add `id` int unsigned not null auto_increment primary key', statements[0])
})

test('testAddingSmallIncrementingID', (t) => {
  const blueprint = new Blueprint('users')
  blueprint.smallIncrements('id')
  const statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('alter table `users` add `id` smallint unsigned not null auto_increment primary key', statements[0])
})

test('testAddingID', (t) => {
  let blueprint = new Blueprint('users')
  blueprint.id()
  let statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('alter table `users` add `id` bigint unsigned not null auto_increment primary key', statements[0])

  blueprint = new Blueprint('users')
  blueprint.id('foo')
  statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('alter table `users` add `foo` bigint unsigned not null auto_increment primary key', statements[0])
})

test('testAddingForeignID', (t) => {
  const blueprint = new Blueprint('users')
  const foreignId = blueprint.foreignId('foo')
  blueprint.foreignId('company_id').constrained()
  blueprint.foreignId('laravel_idea_id').constrained()
  blueprint.foreignId('team_id').references('id').set('on', 'teams')
  blueprint.foreignId('team_column_id').constrained('teams')

  const statements = blueprint.toSql(getConnection(), getGrammar())

  t.true(foreignId instanceof ForeignIdColumnDefinition)
  t.deepEqual([
    'alter table `users` add `foo` bigint unsigned not null, add `company_id` bigint unsigned not null, add `laravel_idea_id` bigint unsigned not null, add `team_id` bigint unsigned not null, add `team_column_id` bigint unsigned not null',
    'alter table `users` add constraint `users_company_id_foreign` foreign key (`company_id`) references `companies` (`id`)',
    'alter table `users` add constraint `users_laravel_idea_id_foreign` foreign key (`laravel_idea_id`) references `laravel_ideas` (`id`)',
    'alter table `users` add constraint `users_team_id_foreign` foreign key (`team_id`) references `teams` (`id`)',
    'alter table `users` add constraint `users_team_column_id_foreign` foreign key (`team_column_id`) references `teams` (`id`)'
  ], statements)
})

test('testAddingBigIncrementingID', (t) => {
  const blueprint = new Blueprint('users')
  blueprint.bigIncrements('id')
  const statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('alter table `users` add `id` bigint unsigned not null auto_increment primary key', statements[0])
})

test('testAddingColumnInTableFirst', (t) => {
  const blueprint = new Blueprint('users')
  blueprint.string('name').set('first')
  const statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('alter table `users` add `name` varchar(255) not null first', statements[0])
})

test('testAddingColumnAfterAnotherColumn', (t) => {
  const blueprint = new Blueprint('users')
  blueprint.string('name').set('after', 'foo')
  const statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('alter table `users` add `name` varchar(255) not null after `foo`', statements[0])
})

test('testAddingMultipleColumnsAfterAnotherColumn', (t) => {
  const blueprint = new Blueprint('users')
  blueprint.after('foo', (blueprint) => {
    blueprint.string('one')
    blueprint.string('two')
  })
  blueprint.string('three')

  const statements = blueprint.toSql(getConnection(), getGrammar())
  t.is(1, statements.length)
  t.is('alter table `users` add `one` varchar(255) not null after `foo`, add `two` varchar(255) not null after `one`, add `three` varchar(255) not null', statements[0])
})

test('testAddingGeneratedColumn', (t) => {
  let blueprint = new Blueprint('products')
  blueprint.integer('price')
  blueprint.integer('discounted_virtual').virtualAs('price - 5')
  blueprint.integer('discounted_stored').storedAs('price - 5')
  let statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('alter table `products` add `price` int not null, add `discounted_virtual` int as (price - 5), add `discounted_stored` int as (price - 5) stored', statements[0])

  blueprint = new Blueprint('products')
  blueprint.integer('price')
  blueprint.integer('discounted_virtual').virtualAs('price - 5').nullable(false)
  blueprint.integer('discounted_stored').storedAs('price - 5').nullable(false)
  statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('alter table `products` add `price` int not null, add `discounted_virtual` int as (price - 5) not null, add `discounted_stored` int as (price - 5) stored not null', statements[0])
})

test('testAddingGeneratedColumnWithCharset', (t) => {
  const blueprint = new Blueprint('links')
  blueprint.string('url', 2083).charset('ascii')
  blueprint.string('url_hash_virtual', 64).virtualAs('sha2(url, 256)').charset('ascii')
  blueprint.string('url_hash_stored', 64).storedAs('sha2(url, 256)').charset('ascii')
  const statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('alter table `links` add `url` varchar(2083) character set ascii not null, add `url_hash_virtual` varchar(64) character set ascii as (sha2(url, 256)), add `url_hash_stored` varchar(64) character set ascii as (sha2(url, 256)) stored', statements[0])
})

test('testAddingString', (t) => {
  let blueprint = new Blueprint('users')
  blueprint.string('foo')
  let statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('alter table `users` add `foo` varchar(255) not null', statements[0])

  blueprint = new Blueprint('users')
  blueprint.string('foo', 100)
  statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('alter table `users` add `foo` varchar(100) not null', statements[0])

  blueprint = new Blueprint('users')
  blueprint.string('foo', 100).nullable().default('bar')
  statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('alter table `users` add `foo` varchar(100) null default \'bar\'', statements[0])

  blueprint = new Blueprint('users')
  blueprint.string('foo', 100).nullable().default(new Expression('CURRENT TIMESTAMP'))
  statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('alter table `users` add `foo` varchar(100) null default CURRENT TIMESTAMP', statements[0])
})

test('testAddingText', (t) => {
  const blueprint = new Blueprint('users')
  blueprint.text('foo')
  const statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('alter table `users` add `foo` text not null', statements[0])
})

test('testAddingBigInteger', (t) => {
  let blueprint = new Blueprint('users')
  blueprint.bigInteger('foo')
  let statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('alter table `users` add `foo` bigint not null', statements[0])

  blueprint = new Blueprint('users')
  blueprint.bigInteger('foo', true)
  statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('alter table `users` add `foo` bigint not null auto_increment primary key', statements[0])
})

test('testAddingInteger', (t) => {
  let blueprint = new Blueprint('users')
  blueprint.integer('foo')
  let statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('alter table `users` add `foo` int not null', statements[0])

  blueprint = new Blueprint('users')
  blueprint.integer('foo', true)
  statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('alter table `users` add `foo` int not null auto_increment primary key', statements[0])
})

test('testAddingIncrementsWithStartingValues', (t) => {
  const blueprint = new Blueprint('users')
  blueprint.id().startingValue(1000)
  const statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(2, statements.length)
  t.is('alter table `users` add `id` bigint unsigned not null auto_increment primary key', statements[0])
  t.is('alter table `users` auto_increment = 1000', statements[1])
})

test('testAddingMediumInteger', (t) => {
  let blueprint = new Blueprint('users')
  blueprint.mediumInteger('foo')
  let statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('alter table `users` add `foo` mediumint not null', statements[0])

  blueprint = new Blueprint('users')
  blueprint.mediumInteger('foo', true)
  statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('alter table `users` add `foo` mediumint not null auto_increment primary key', statements[0])
})

test('testAddingSmallInteger', (t) => {
  let blueprint = new Blueprint('users')
  blueprint.smallInteger('foo')
  let statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('alter table `users` add `foo` smallint not null', statements[0])

  blueprint = new Blueprint('users')
  blueprint.smallInteger('foo', true)
  statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('alter table `users` add `foo` smallint not null auto_increment primary key', statements[0])
})

test('testAddingTinyInteger', (t) => {
  let blueprint = new Blueprint('users')
  blueprint.tinyInteger('foo')
  let statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('alter table `users` add `foo` tinyint not null', statements[0])

  blueprint = new Blueprint('users')
  blueprint.tinyInteger('foo', true)
  statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('alter table `users` add `foo` tinyint not null auto_increment primary key', statements[0])
})

test('testAddingFloat', (t) => {
  const blueprint = new Blueprint('users')
  blueprint.float('foo', 5, 2)
  const statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('alter table `users` add `foo` double(5, 2) not null', statements[0])
})

test('testAddingDouble', (t) => {
  const blueprint = new Blueprint('users')
  blueprint.double('foo')
  const statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('alter table `users` add `foo` double not null', statements[0])
})

test('testAddingDoubleSpecifyingPrecision', (t) => {
  const blueprint = new Blueprint('users')
  blueprint.double('foo', 15, 8)
  const statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('alter table `users` add `foo` double(15, 8) not null', statements[0])
})

test('testAddingDecimal', (t) => {
  const blueprint = new Blueprint('users')
  blueprint.decimal('foo', 5, 2)
  const statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('alter table `users` add `foo` decimal(5, 2) not null', statements[0])
})

test('testAddingBoolean', (t) => {
  const blueprint = new Blueprint('users')
  blueprint.boolean('foo')
  const statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('alter table `users` add `foo` tinyint(1) not null', statements[0])
})

test('testAddingEnum', (t) => {
  const blueprint = new Blueprint('users')
  blueprint.enum('role', ['member', 'admin'])
  const statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('alter table `users` add `role` enum(\'member\', \'admin\') not null', statements[0])
})

test('testAddingSet', (t) => {
  const blueprint = new Blueprint('users')
  blueprint.set('role', ['member', 'admin'])
  const statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('alter table `users` add `role` set(\'member\', \'admin\') not null', statements[0])
})

test('testAddingJson', (t) => {
  const blueprint = new Blueprint('users')
  blueprint.json('foo')
  const statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('alter table `users` add `foo` json not null', statements[0])
})

test('testAddingJsonb', (t) => {
  const blueprint = new Blueprint('users')
  blueprint.jsonb('foo')
  const statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('alter table `users` add `foo` json not null', statements[0])
})

test('testAddingDate', (t) => {
  const blueprint = new Blueprint('users')
  blueprint.date('foo')
  const statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('alter table `users` add `foo` date not null', statements[0])
})

test('testAddingYear', (t) => {
  const blueprint = new Blueprint('users')
  blueprint.year('birth_year')
  const statements = blueprint.toSql(getConnection(), getGrammar())
  t.is(1, statements.length)
  t.is('alter table `users` add `birth_year` year not null', statements[0])
})

test('testAddingDateTime', (t) => {
  let blueprint = new Blueprint('users')
  blueprint.dateTime('foo')
  let statements = blueprint.toSql(getConnection(), getGrammar())
  t.is(1, statements.length)
  t.is('alter table `users` add `foo` datetime not null', statements[0])

  blueprint = new Blueprint('users')
  blueprint.dateTime('foo', 1)
  statements = blueprint.toSql(getConnection(), getGrammar())
  t.is(1, statements.length)
  t.is('alter table `users` add `foo` datetime(1) not null', statements[0])
})

test('testAddingDateTimeWithDefaultCurrent', (t) => {
  const blueprint = new Blueprint('users')
  blueprint.dateTime('foo').useCurrent()
  const statements = blueprint.toSql(getConnection(), getGrammar())
  t.is(1, statements.length)
  t.is('alter table `users` add `foo` datetime default CURRENT_TIMESTAMP not null', statements[0])
})

test('testAddingDateTimeWithOnUpdateCurrent', (t) => {
  const blueprint = new Blueprint('users')
  blueprint.dateTime('foo').useCurrentOnUpdate()
  const statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('alter table `users` add `foo` datetime on update CURRENT_TIMESTAMP not null', statements[0])
})

test('testAddingDateTimeWithDefaultCurrentAndOnUpdateCurrent', (t) => {
  const blueprint = new Blueprint('users')
  blueprint.dateTime('foo').useCurrent().useCurrentOnUpdate()
  const statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('alter table `users` add `foo` datetime default CURRENT_TIMESTAMP on update CURRENT_TIMESTAMP not null', statements[0])
})

test('testAddingDateTimeWithDefaultCurrentOnUpdateCurrentAndPrecision', (t) => {
  const blueprint = new Blueprint('users')
  blueprint.dateTime('foo', 3).useCurrent().useCurrentOnUpdate()
  const statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('alter table `users` add `foo` datetime(3) default CURRENT_TIMESTAMP(3) on update CURRENT_TIMESTAMP(3) not null', statements[0])
})

test('testAddingDateTimeTz', (t) => {
  let blueprint = new Blueprint('users')
  blueprint.dateTimeTz('foo', 1)
  let statements = blueprint.toSql(getConnection(), getGrammar())
  t.is(1, statements.length)
  t.is('alter table `users` add `foo` datetime(1) not null', statements[0])

  blueprint = new Blueprint('users')
  blueprint.dateTimeTz('foo')
  statements = blueprint.toSql(getConnection(), getGrammar())
  t.is(1, statements.length)
  t.is('alter table `users` add `foo` datetime not null', statements[0])
})

test('testAddingTime', (t) => {
  const blueprint = new Blueprint('users')
  blueprint.time('created_at')
  const statements = blueprint.toSql(getConnection(), getGrammar())
  t.is(1, statements.length)
  t.is('alter table `users` add `created_at` time not null', statements[0])
})

test('testAddingTimeWithPrecision', (t) => {
  const blueprint = new Blueprint('users')
  blueprint.time('created_at', 1)
  const statements = blueprint.toSql(getConnection(), getGrammar())
  t.is(1, statements.length)
  t.is('alter table `users` add `created_at` time(1) not null', statements[0])
})

test('testAddingTimeTz', (t) => {
  const blueprint = new Blueprint('users')
  blueprint.timeTz('created_at')
  const statements = blueprint.toSql(getConnection(), getGrammar())
  t.is(1, statements.length)
  t.is('alter table `users` add `created_at` time not null', statements[0])
})

test('testAddingTimeTzWithPrecision', (t) => {
  const blueprint = new Blueprint('users')
  blueprint.timeTz('created_at', 1)
  const statements = blueprint.toSql(getConnection(), getGrammar())
  t.is(1, statements.length)
  t.is('alter table `users` add `created_at` time(1) not null', statements[0])
})

test('testAddingTimestamp', (t) => {
  const blueprint = new Blueprint('users')
  blueprint.timestamp('created_at')
  const statements = blueprint.toSql(getConnection(), getGrammar())
  t.is(1, statements.length)
  t.is('alter table `users` add `created_at` timestamp not null', statements[0])
})

test('testAddingTimestampWithPrecision', (t) => {
  const blueprint = new Blueprint('users')
  blueprint.timestamp('created_at', 1)
  const statements = blueprint.toSql(getConnection(), getGrammar())
  t.is(1, statements.length)
  t.is('alter table `users` add `created_at` timestamp(1) not null', statements[0])
})

test('testAddingTimestampWithDefault', (t) => {
  const blueprint = new Blueprint('users')
  blueprint.timestamp('created_at').default('2015-07-22 11:43:17')
  const statements = blueprint.toSql(getConnection(), getGrammar())
  t.is(1, statements.length)
  t.is("alter table `users` add `created_at` timestamp not null default '2015-07-22 11:43:17'", statements[0])
})

test('testAddingTimestampWithDefaultCurrentSpecifyingPrecision', (t) => {
  const blueprint = new Blueprint('users')
  blueprint.timestamp('created_at', 1).useCurrent()
  const statements = blueprint.toSql(getConnection(), getGrammar())
  t.is(1, statements.length)
  t.is('alter table `users` add `created_at` timestamp(1) default CURRENT_TIMESTAMP(1) not null', statements[0])
})

test('testAddingTimestampWithOnUpdateCurrentSpecifyingPrecision', (t) => {
  const blueprint = new Blueprint('users')
  blueprint.timestamp('created_at', 1).useCurrentOnUpdate()
  const statements = blueprint.toSql(getConnection(), getGrammar())
  t.is(1, statements.length)
  t.is('alter table `users` add `created_at` timestamp(1) on update CURRENT_TIMESTAMP(1) not null', statements[0])
})

test('testAddingTimestampWithDefaultCurrentAndOnUpdateCurrentSpecifyingPrecision', (t) => {
  const blueprint = new Blueprint('users')
  blueprint.timestamp('created_at', 1).useCurrent().useCurrentOnUpdate()
  const statements = blueprint.toSql(getConnection(), getGrammar())
  t.is(1, statements.length)
  t.is('alter table `users` add `created_at` timestamp(1) default CURRENT_TIMESTAMP(1) on update CURRENT_TIMESTAMP(1) not null', statements[0])
})

test('testAddingTimestampTz', (t) => {
  const blueprint = new Blueprint('users')
  blueprint.timestampTz('created_at')
  const statements = blueprint.toSql(getConnection(), getGrammar())
  t.is(1, statements.length)
  t.is('alter table `users` add `created_at` timestamp not null', statements[0])
})

test('testAddingTimestampTzWithPrecision', (t) => {
  const blueprint = new Blueprint('users')
  blueprint.timestampTz('created_at', 1)
  const statements = blueprint.toSql(getConnection(), getGrammar())
  t.is(1, statements.length)
  t.is('alter table `users` add `created_at` timestamp(1) not null', statements[0])
})

test('testAddingTimeStampTzWithDefault', (t) => {
  const blueprint = new Blueprint('users')
  blueprint.timestampTz('created_at').default('2015-07-22 11:43:17')
  const statements = blueprint.toSql(getConnection(), getGrammar())
  t.is(1, statements.length)
  t.is("alter table `users` add `created_at` timestamp not null default '2015-07-22 11:43:17'", statements[0])
})

test('testAddingTimestamps', (t) => {
  const blueprint = new Blueprint('users')
  blueprint.timestamps()
  const statements = blueprint.toSql(getConnection(), getGrammar())
  t.is(1, statements.length)
  t.is('alter table `users` add `created_at` timestamp null, add `updated_at` timestamp null', statements[0])
})

test('testAddingTimestampsTz', (t) => {
  const blueprint = new Blueprint('users')
  blueprint.timestampsTz()
  const statements = blueprint.toSql(getConnection(), getGrammar())
  t.is(1, statements.length)
  t.is('alter table `users` add `created_at` timestamp null, add `updated_at` timestamp null', statements[0])
})

test('testAddingRememberToken', (t) => {
  const blueprint = new Blueprint('users')
  blueprint.rememberToken()
  const statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('alter table `users` add `remember_token` varchar(100) null', statements[0])
})

test('testAddingBinary', (t) => {
  const blueprint = new Blueprint('users')
  blueprint.binary('foo')
  const statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('alter table `users` add `foo` blob not null', statements[0])
})

test('testAddingUuid', (t) => {
  const blueprint = new Blueprint('users')
  blueprint.uuid('foo')
  const statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('alter table `users` add `foo` char(36) not null', statements[0])
})

test('testAddingForeignUuid', (t) => {
  const blueprint = new Blueprint('users')
  const foreignUuid = blueprint.foreignUuid('foo')
  blueprint.foreignUuid('company_id').constrained()
  blueprint.foreignUuid('laravel_idea_id').constrained()
  blueprint.foreignUuid('team_id').references('id').on('teams')
  blueprint.foreignUuid('team_column_id').constrained('teams')

  const statements = blueprint.toSql(getConnection(), getGrammar())

  t.true(foreignUuid instanceof ForeignIdColumnDefinition)
  t.deepEqual([
    'alter table `users` add `foo` char(36) not null, add `company_id` char(36) not null, add `laravel_idea_id` char(36) not null, add `team_id` char(36) not null, add `team_column_id` char(36) not null',
    'alter table `users` add constraint `users_company_id_foreign` foreign key (`company_id`) references `companies` (`id`)',
    'alter table `users` add constraint `users_laravel_idea_id_foreign` foreign key (`laravel_idea_id`) references `laravel_ideas` (`id`)',
    'alter table `users` add constraint `users_team_id_foreign` foreign key (`team_id`) references `teams` (`id`)',
    'alter table `users` add constraint `users_team_column_id_foreign` foreign key (`team_column_id`) references `teams` (`id`)'
  ], statements)
})

test('testAddingIpAddress', (t) => {
  const blueprint = new Blueprint('users')
  blueprint.ipAddress('foo')
  const statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('alter table `users` add `foo` varchar(45) not null', statements[0])
})

test('testAddingMacAddress', (t) => {
  const blueprint = new Blueprint('users')
  blueprint.macAddress('foo')
  const statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('alter table `users` add `foo` varchar(17) not null', statements[0])
})

test('testAddingGeometry', (t) => {
  const blueprint = new Blueprint('geo')
  blueprint.geometry('coordinates')
  const statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('alter table `geo` add `coordinates` geometry not null', statements[0])
})

test('testAddingPoint', (t) => {
  const blueprint = new Blueprint('geo')
  blueprint.point('coordinates')
  const statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('alter table `geo` add `coordinates` point not null', statements[0])
})

test('testAddingPointWithSrid', (t) => {
  const blueprint = new Blueprint('geo')
  blueprint.point('coordinates', 4326)
  const statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('alter table `geo` add `coordinates` point not null srid 4326', statements[0])
})

test('testAddingPointWithSridColumn', (t) => {
  const blueprint = new Blueprint('geo')
  blueprint.point('coordinates', 4326).after('id')
  const statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('alter table `geo` add `coordinates` point not null srid 4326 after `id`', statements[0])
})

test('testAddingLineString', (t) => {
  const blueprint = new Blueprint('geo')
  blueprint.lineString('coordinates')
  const statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('alter table `geo` add `coordinates` linestring not null', statements[0])
})

test('testAddingPolygon', (t) => {
  const blueprint = new Blueprint('geo')
  blueprint.polygon('coordinates')
  const statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('alter table `geo` add `coordinates` polygon not null', statements[0])
})

test('testAddingGeometryCollection', (t) => {
  const blueprint = new Blueprint('geo')
  blueprint.geometryCollection('coordinates')
  const statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('alter table `geo` add `coordinates` geometrycollection not null', statements[0])
})

test('testAddingMultiPoint', (t) => {
  const blueprint = new Blueprint('geo')
  blueprint.multiPoint('coordinates')
  const statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('alter table `geo` add `coordinates` multipoint not null', statements[0])
})

test('testAddingMultiLineString', (t) => {
  const blueprint = new Blueprint('geo')
  blueprint.multiLineString('coordinates')
  const statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('alter table `geo` add `coordinates` multilinestring not null', statements[0])
})

test('testAddingMultiPolygon', (t) => {
  const blueprint = new Blueprint('geo')
  blueprint.multiPolygon('coordinates')
  const statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('alter table `geo` add `coordinates` multipolygon not null', statements[0])
})

test('testAddingComment', (t) => {
  const blueprint = new Blueprint('users')
  blueprint.string('foo').comment("Escape ' when using words like it's")
  const statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is("alter table `users` add `foo` varchar(255) not null comment 'Escape \\' when using words like it\\'s'", statements[0])
})

test('testDropAllTables', (t) => {
  const statement = getGrammar().compileDropAllTables(['alpha', 'beta', 'gamma'])

  t.is('drop table `alpha`,`beta`,`gamma`', statement)
})

test('testDropAllViews', (t) => {
  const statement = getGrammar().compileDropAllViews(['alpha', 'beta', 'gamma'])

  t.is('drop view `alpha`,`beta`,`gamma`', statement)
})

test('testGrammarsAreMacroable', (t) => {
  // compileReplace macro.
  getGrammar().macro('compileReplace', () => {
    return true
  })

  const compiled = getGrammar().compileReplace()

  t.true(compiled)
})

test('testCreateDatabase', (t) => {
  const { createMock, verifyMock } = mock()

  let connection = getConnection()
  let connectionMock = createMock(connection)
  connectionMock.expects('getConfig').once().once().withArgs('charset').returns('utf8mb4_foo')
  connectionMock.expects('getConfig').once().once().withArgs('collation').returns('utf8mb4_unicode_ci_foo')

  let statement = getGrammar().compileCreateDatabase('my_database_a', connection)

  t.is(
    'create database `my_database_a` default character set `utf8mb4_foo` default collate `utf8mb4_unicode_ci_foo`',
    statement
  )

  connection = getConnection()
  connectionMock = createMock(connection)
  connectionMock.expects('getConfig').once().once().withArgs('charset').returns('utf8mb4_bar')
  connectionMock.expects('getConfig').once().once().withArgs('collation').returns('utf8mb4_unicode_ci_bar')

  statement = getGrammar().compileCreateDatabase('my_database_b', connection)

  t.is(
    'create database `my_database_b` default character set `utf8mb4_bar` default collate `utf8mb4_unicode_ci_bar`',
    statement
  )

  verifyMock()
})

test('testDropDatabaseIfExists', (t) => {
  let statement = getGrammar().compileDropDatabaseIfExists('my_database_a')

  t.is(
    'drop database if exists `my_database_a`',
    statement
  )

  statement = getGrammar().compileDropDatabaseIfExists('my_database_b')

  t.is(
    'drop database if exists `my_database_b`',
    statement
  )
})
