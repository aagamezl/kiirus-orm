const test = require('ava')

const { Blueprint } = require('./../../lib/Illuminate/Database/Schema/Blueprint')
const { PostgresGrammar } = require('../../lib/Illuminate/Database/Schema/Grammars/PostgresGrammar')
const { getConnection } = require('./common')

const getGrammar = () => new PostgresGrammar()

test('testBasicCreateTable', (t) => {
  let blueprint = new Blueprint('users')
  blueprint.create()
  blueprint.increments('id')
  blueprint.string('email')
  blueprint.string('name').collation('nb_NO.utf8')
  let statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('create table "users" ("id" serial primary key not null, "email" varchar(255) not null, "name" varchar(255) collate "nb_NO.utf8" not null)', statements[0])

  blueprint = new Blueprint('users')
  blueprint.increments('id')
  blueprint.string('email')
  statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('alter table "users" add column "id" serial primary key not null, add column "email" varchar(255) not null', statements[0])
})

test('testCreateTableWithAutoIncrementStartingValue', (t) => {
  const blueprint = new Blueprint('users')
  blueprint.create()
  blueprint.increments('id').startingValue(1000)
  blueprint.string('email')
  blueprint.string('name').collation('nb_NO.utf8')
  const statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(2, statements.length)
  t.is('create table "users" ("id" serial primary key not null, "email" varchar(255) not null, "name" varchar(255) collate "nb_NO.utf8" not null)', statements[0])
  t.is('alter sequence users_id_seq restart with 1000', statements[1])
})

test('testCreateTableAndCommentColumn', (t) => {
  const blueprint = new Blueprint('users')
  blueprint.create()
  blueprint.increments('id')
  blueprint.string('email').comment('my first comment')
  const statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(2, statements.length)
  t.is('create table "users" ("id" serial primary key not null, "email" varchar(255) not null)', statements[0])
  t.is('comment on column "users"."email" is \'my first comment\'', statements[1])
})

test('testCreateTemporaryTable', (t) => {
  const blueprint = new Blueprint('users')
  blueprint.create()
  blueprint.temporary()
  blueprint.increments('id')
  blueprint.string('email')
  const statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('create temporary table "users" ("id" serial primary key not null, "email" varchar(255) not null)', statements[0])
})

test('testDropTable', (t) => {
  const blueprint = new Blueprint('users')
  blueprint.drop()
  const statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('drop table "users"', statements[0])
})

test('testDropTableIfExists', (t) => {
  const blueprint = new Blueprint('users')
  blueprint.dropIfExists()
  const statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('drop table if exists "users"', statements[0])
})

test('testDropColumn', (t) => {
  let blueprint = new Blueprint('users')
  blueprint.dropColumn('foo')
  let statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('alter table "users" drop column "foo"', statements[0])

  blueprint = new Blueprint('users')
  blueprint.dropColumn(['foo', 'bar'])
  statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('alter table "users" drop column "foo", drop column "bar"', statements[0])

  blueprint = new Blueprint('users')
  blueprint.dropColumn('foo', 'bar')
  statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('alter table "users" drop column "foo", drop column "bar"', statements[0])
})

test('testDropPrimary', (t) => {
  const blueprint = new Blueprint('users')
  blueprint.dropPrimary()
  const statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('alter table "users" drop constraint "users_pkey"', statements[0])
})

test('testDropUnique', (t) => {
  const blueprint = new Blueprint('users')
  blueprint.dropUnique('foo')
  const statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('alter table "users" drop constraint "foo"', statements[0])
})

test('testDropIndex', (t) => {
  const blueprint = new Blueprint('users')
  blueprint.dropIndex('foo')
  const statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('drop index "foo"', statements[0])
})

test('testDropSpatialIndex', (t) => {
  const blueprint = new Blueprint('geo')
  blueprint.dropSpatialIndex(['coordinates'])
  const statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('drop index "geo_coordinates_spatialindex"', statements[0])
})

test('testDropForeign', (t) => {
  const blueprint = new Blueprint('users')
  blueprint.dropForeign('foo')
  const statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('alter table "users" drop constraint "foo"', statements[0])
})

test('testDropTimestamps', (t) => {
  const blueprint = new Blueprint('users')
  blueprint.dropTimestamps()
  const statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('alter table "users" drop column "created_at", drop column "updated_at"', statements[0])
})

test('testDropTimestampsTz', (t) => {
  const blueprint = new Blueprint('users')
  blueprint.dropTimestampsTz()
  const statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('alter table "users" drop column "created_at", drop column "updated_at"', statements[0])
})

test('testDropMorphs', (t) => {
  const blueprint = new Blueprint('photos')
  blueprint.dropMorphs('imageable')
  const statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(2, statements.length)
  t.is('drop index "photos_imageable_type_imageable_id_index"', statements[0])
  t.is('alter table "photos" drop column "imageable_type", drop column "imageable_id"', statements[1])
})

test('testRenameTable', (t) => {
  const blueprint = new Blueprint('users')
  blueprint.rename('foo')
  const statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('alter table "users" rename to "foo"', statements[0])
})

test('testRenameIndex', (t) => {
  const blueprint = new Blueprint('users')
  blueprint.renameIndex('foo', 'bar')
  const statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('alter index "foo" rename to "bar"', statements[0])
})

test('testAddingPrimaryKey', (t) => {
  const blueprint = new Blueprint('users')
  blueprint.primary('foo')
  const statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('alter table "users" add primary key ("foo")', statements[0])
})

test('testAddingUniqueKey', (t) => {
  const blueprint = new Blueprint('users')
  blueprint.unique('foo', 'bar')
  const statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('alter table "users" add constraint "bar" unique ("foo")', statements[0])
})

test('testAddingIndex', (t) => {
  const blueprint = new Blueprint('users')
  blueprint.index(['foo', 'bar'], 'baz')
  const statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('create index "baz" on "users" ("foo", "bar")', statements[0])
})

test('testAddingIndexWithAlgorithm', (t) => {
  const blueprint = new Blueprint('users')
  blueprint.index(['foo', 'bar'], 'baz', 'hash')
  const statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('create index "baz" on "users" using hash ("foo", "bar")', statements[0])
})

// test('test_name', (t) => {

// })
