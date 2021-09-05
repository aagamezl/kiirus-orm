const test = require('ava')

const { Blueprint } = require('./../../lib/Illuminate/Database/Schema/Blueprint')
const { ForeignIdColumnDefinition } = require('./../../lib/Illuminate/Database/Schema/ForeignIdColumnDefinition')
const { PostgresGrammar } = require('../../lib/Illuminate/Database/Schema/Grammars/PostgresGrammar')
const { getConnection } = require('./common')
const { mock } = require('../tools/mock')

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

test('testAddingSpatialIndex', (t) => {
  const blueprint = new Blueprint('geo')
  blueprint.spatialIndex('coordinates')
  const statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('create index "geo_coordinates_spatialindex" on "geo" using gist ("coordinates")', statements[0])
})

test('testAddingFluentSpatialIndex', (t) => {
  const blueprint = new Blueprint('geo')
  blueprint.point('coordinates').spatialIndex()
  const statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(2, statements.length)
  t.is('create index "geo_coordinates_spatialindex" on "geo" using gist ("coordinates")', statements[1])
})

test('testAddingRawIndex', (t) => {
  const blueprint = new Blueprint('users')
  blueprint.rawIndex('(function(column))', 'raw_index')
  const statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('create index "raw_index" on "users" ((function(column)))', statements[0])
})

test('testAddingIncrementingID', (t) => {
  const blueprint = new Blueprint('users')
  blueprint.increments('id')
  const statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('alter table "users" add column "id" serial primary key not null', statements[0])
})

test('testAddingSmallIncrementingID', (t) => {
  const blueprint = new Blueprint('users')
  blueprint.smallIncrements('id')
  const statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('alter table "users" add column "id" smallserial primary key not null', statements[0])
})

test('testAddingMediumIncrementingID', (t) => {
  const blueprint = new Blueprint('users')
  blueprint.mediumIncrements('id')
  const statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('alter table "users" add column "id" serial primary key not null', statements[0])
})

test('testAddingID', (t) => {
  let blueprint = new Blueprint('users')
  blueprint.id()
  let statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('alter table "users" add column "id" bigserial primary key not null', statements[0])

  blueprint = new Blueprint('users')
  blueprint.id('foo')
  statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('alter table "users" add column "foo" bigserial primary key not null', statements[0])
})

test('testAddingForeignID', (t) => {
  const blueprint = new Blueprint('users')
  const foreignId = blueprint.foreignId('foo')
  blueprint.foreignId('company_id').constrained()
  blueprint.foreignId('kiirus_idea_id').constrained()
  blueprint.foreignId('team_id').references('id').on('teams')
  blueprint.foreignId('team_column_id').constrained('teams')

  const statements = blueprint.toSql(getConnection(), getGrammar())

  t.true(foreignId instanceof ForeignIdColumnDefinition)
  t.deepEqual([
    'alter table "users" add column "foo" bigint not null, add column "company_id" bigint not null, add column "kiirus_idea_id" bigint not null, add column "team_id" bigint not null, add column "team_column_id" bigint not null',
    'alter table "users" add constraint "users_company_id_foreign" foreign key ("company_id") references "companies" ("id")',
    'alter table "users" add constraint "users_kiirus_idea_id_foreign" foreign key ("kiirus_idea_id") references "kiirus_ideas" ("id")',
    'alter table "users" add constraint "users_team_id_foreign" foreign key ("team_id") references "teams" ("id")',
    'alter table "users" add constraint "users_team_column_id_foreign" foreign key ("team_column_id") references "teams" ("id")'
  ], statements)
})

test('testAddingBigIncrementingID', (t) => {
  const blueprint = new Blueprint('users')
  blueprint.bigIncrements('id')
  const statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('alter table "users" add column "id" bigserial primary key not null', statements[0])
})

test('testAddingString', (t) => {
  let blueprint = new Blueprint('users')
  blueprint.string('foo')
  let statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('alter table "users" add column "foo" varchar(255) not null', statements[0])

  blueprint = new Blueprint('users')
  blueprint.string('foo', 100)
  statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('alter table "users" add column "foo" varchar(100) not null', statements[0])

  blueprint = new Blueprint('users')
  blueprint.string('foo', 100).nullable().default('bar')
  statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('alter table "users" add column "foo" varchar(100) null default \'bar\'', statements[0])
})

test('testAddingText', (t) => {
  const blueprint = new Blueprint('users')
  blueprint.text('foo')
  const statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('alter table "users" add column "foo" text not null', statements[0])
})

test('testAddingBigInteger', (t) => {
  let blueprint = new Blueprint('users')
  blueprint.bigInteger('foo')
  let statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('alter table "users" add column "foo" bigint not null', statements[0])

  blueprint = new Blueprint('users')
  blueprint.bigInteger('foo', true)
  statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('alter table "users" add column "foo" bigserial primary key not null', statements[0])
})

test('testAddingInteger', (t) => {
  let blueprint = new Blueprint('users')
  blueprint.integer('foo')
  let statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('alter table "users" add column "foo" integer not null', statements[0])

  blueprint = new Blueprint('users')
  blueprint.integer('foo', true)
  statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('alter table "users" add column "foo" serial primary key not null', statements[0])
})

test('testAddingMediumInteger', (t) => {
  let blueprint = new Blueprint('users')
  blueprint.mediumInteger('foo')
  let statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('alter table "users" add column "foo" integer not null', statements[0])

  blueprint = new Blueprint('users')
  blueprint.mediumInteger('foo', true)
  statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('alter table "users" add column "foo" serial primary key not null', statements[0])
})

test('testAddingTinyInteger', (t) => {
  let blueprint = new Blueprint('users')
  blueprint.tinyInteger('foo')
  let statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('alter table "users" add column "foo" smallint not null', statements[0])

  blueprint = new Blueprint('users')
  blueprint.tinyInteger('foo', true)
  statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('alter table "users" add column "foo" smallserial primary key not null', statements[0])
})

test('testAddingSmallInteger', (t) => {
  let blueprint = new Blueprint('users')
  blueprint.smallInteger('foo')
  let statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('alter table "users" add column "foo" smallint not null', statements[0])

  blueprint = new Blueprint('users')
  blueprint.smallInteger('foo', true)
  statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('alter table "users" add column "foo" smallserial primary key not null', statements[0])
})

test('testAddingFloat', (t) => {
  const blueprint = new Blueprint('users')
  blueprint.float('foo', 5, 2)
  const statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('alter table "users" add column "foo" double precision not null', statements[0])
})

test('testAddingDouble', (t) => {
  const blueprint = new Blueprint('users')
  blueprint.double('foo', 15, 8)
  const statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('alter table "users" add column "foo" double precision not null', statements[0])
})

test('testAddingDecimal', (t) => {
  const blueprint = new Blueprint('users')
  blueprint.decimal('foo', 5, 2)
  const statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('alter table "users" add column "foo" decimal(5, 2) not null', statements[0])
})

test('testAddingBoolean', (t) => {
  const blueprint = new Blueprint('users')
  blueprint.boolean('foo')
  const statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('alter table "users" add column "foo" boolean not null', statements[0])
})

test('testAddingEnum', (t) => {
  const blueprint = new Blueprint('users')
  blueprint.enum('role', ['member', 'admin'])
  const statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('alter table "users" add column "role" varchar(255) check ("role" in (\'member\', \'admin\')) not null', statements[0])
})

test('testAddingDate', (t) => {
  const blueprint = new Blueprint('users')
  blueprint.date('foo')
  const statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('alter table "users" add column "foo" date not null', statements[0])
})

test('testAddingYear', (t) => {
  const blueprint = new Blueprint('users')
  blueprint.year('birth_year')
  const statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('alter table "users" add column "birth_year" integer not null', statements[0])
})

test('testAddingJson', (t) => {
  const blueprint = new Blueprint('users')
  blueprint.json('foo')
  const statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('alter table "users" add column "foo" json not null', statements[0])
})

test('testAddingJsonb', (t) => {
  const blueprint = new Blueprint('users')
  blueprint.jsonb('foo')
  const statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('alter table "users" add column "foo" jsonb not null', statements[0])
})

test('testAddingDateTime', (t) => {
  const blueprint = new Blueprint('users')
  blueprint.dateTime('created_at')
  const statements = blueprint.toSql(getConnection(), getGrammar())
  t.is(1, statements.length)
  t.is('alter table "users" add column "created_at" timestamp(0) without time zone not null', statements[0])
})

test('testAddingDateTimeWithPrecision', (t) => {
  const blueprint = new Blueprint('users')
  blueprint.dateTime('created_at', 1)
  const statements = blueprint.toSql(getConnection(), getGrammar())
  t.is(1, statements.length)
  t.is('alter table "users" add column "created_at" timestamp(1) without time zone not null', statements[0])
})

test('testAddingDateTimeWithNullPrecision', (t) => {
  const blueprint = new Blueprint('users')
  blueprint.dateTime('created_at', null)
  const statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('alter table "users" add column "created_at" timestamp without time zone not null', statements[0])
})

test('testAddingDateTimeTz', (t) => {
  const blueprint = new Blueprint('users')
  blueprint.dateTimeTz('created_at')
  const statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('alter table "users" add column "created_at" timestamp(0) with time zone not null', statements[0])
})

test('testAddingDateTimeTzWithPrecision', (t) => {
  const blueprint = new Blueprint('users')
  blueprint.dateTimeTz('created_at', 1)
  const statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('alter table "users" add column "created_at" timestamp(1) with time zone not null', statements[0])
})

test('testAddingDateTimeTzWithNullPrecision', (t) => {
  const blueprint = new Blueprint('users')
  blueprint.dateTimeTz('created_at', null)
  const statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('alter table "users" add column "created_at" timestamp with time zone not null', statements[0])
})

test('testAddingTime', (t) => {
  const blueprint = new Blueprint('users')
  blueprint.time('created_at')
  const statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('alter table "users" add column "created_at" time(0) without time zone not null', statements[0])
})

test('testAddingTimeWithPrecision', (t) => {
  const blueprint = new Blueprint('users')
  blueprint.time('created_at', 1)
  const statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('alter table "users" add column "created_at" time(1) without time zone not null', statements[0])
})

test('testAddingTimeWithNullPrecision', (t) => {
  const blueprint = new Blueprint('users')
  blueprint.time('created_at', null)
  const statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('alter table "users" add column "created_at" time without time zone not null', statements[0])
})

test('testAddingTimeTz', (t) => {
  const blueprint = new Blueprint('users')
  blueprint.timeTz('created_at')
  const statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('alter table "users" add column "created_at" time(0) with time zone not null', statements[0])
})

test('testAddingTimeTzWithPrecision', (t) => {
  const blueprint = new Blueprint('users')
  blueprint.timeTz('created_at', 1)
  const statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('alter table "users" add column "created_at" time(1) with time zone not null', statements[0])
})

test('testAddingTimeTzWithNullPrecision', (t) => {
  const blueprint = new Blueprint('users')
  blueprint.timeTz('created_at', null)
  const statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('alter table "users" add column "created_at" time with time zone not null', statements[0])
})

test('testAddingTimestamp', (t) => {
  const blueprint = new Blueprint('users')
  blueprint.timestamp('created_at')
  const statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('alter table "users" add column "created_at" timestamp(0) without time zone not null', statements[0])
})

test('testAddingTimestampWithPrecision', (t) => {
  const blueprint = new Blueprint('users')
  blueprint.timestamp('created_at', 1)
  const statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('alter table "users" add column "created_at" timestamp(1) without time zone not null', statements[0])
})

test('testAddingTimestampWithNullPrecision', (t) => {
  const blueprint = new Blueprint('users')
  blueprint.timestamp('created_at', null)
  const statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('alter table "users" add column "created_at" timestamp without time zone not null', statements[0])
})

test('testAddingTimestampTz', (t) => {
  const blueprint = new Blueprint('users')
  blueprint.timestampTz('created_at')
  const statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('alter table "users" add column "created_at" timestamp(0) with time zone not null', statements[0])
})

test('testAddingTimestampTzWithPrecision', (t) => {
  const blueprint = new Blueprint('users')
  blueprint.timestampTz('created_at', 1)
  const statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('alter table "users" add column "created_at" timestamp(1) with time zone not null', statements[0])
})

test('testAddingTimestampTzWithNullPrecision', (t) => {
  const blueprint = new Blueprint('users')
  blueprint.timestampTz('created_at', null)
  const statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('alter table "users" add column "created_at" timestamp with time zone not null', statements[0])
})

test('testAddingTimestamps', (t) => {
  const blueprint = new Blueprint('users')
  blueprint.timestamps()
  const statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('alter table "users" add column "created_at" timestamp(0) without time zone null, add column "updated_at" timestamp(0) without time zone null', statements[0])
})

test('testAddingTimestampsTz', (t) => {
  const blueprint = new Blueprint('users')
  blueprint.timestampsTz()
  const statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('alter table "users" add column "created_at" timestamp(0) with time zone null, add column "updated_at" timestamp(0) with time zone null', statements[0])
})

test('testAddingBinary', (t) => {
  const blueprint = new Blueprint('users')
  blueprint.binary('foo')
  const statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('alter table "users" add column "foo" bytea not null', statements[0])
})

test('testAddingUuid', (t) => {
  const blueprint = new Blueprint('users')
  blueprint.uuid('foo')
  const statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('alter table "users" add column "foo" uuid not null', statements[0])
})

test('testAddingForeignUuid', (t) => {
  const blueprint = new Blueprint('users')
  const foreignUuid = blueprint.foreignUuid('foo')
  blueprint.foreignUuid('company_id').constrained()
  blueprint.foreignUuid('kiirus_idea_id').constrained()
  blueprint.foreignUuid('team_id').references('id').on('teams')
  blueprint.foreignUuid('team_column_id').constrained('teams')

  const statements = blueprint.toSql(getConnection(), getGrammar())

  t.true(foreignUuid instanceof ForeignIdColumnDefinition)
  t.deepEqual([
    'alter table "users" add column "foo" uuid not null, add column "company_id" uuid not null, add column "kiirus_idea_id" uuid not null, add column "team_id" uuid not null, add column "team_column_id" uuid not null',
    'alter table "users" add constraint "users_company_id_foreign" foreign key ("company_id") references "companies" ("id")',
    'alter table "users" add constraint "users_kiirus_idea_id_foreign" foreign key ("kiirus_idea_id") references "kiirus_ideas" ("id")',
    'alter table "users" add constraint "users_team_id_foreign" foreign key ("team_id") references "teams" ("id")',
    'alter table "users" add constraint "users_team_column_id_foreign" foreign key ("team_column_id") references "teams" ("id")'
  ], statements)
})

test('testAddingGeneratedAs', (t) => {
  let blueprint = new Blueprint('users')
  blueprint.increments('foo').generatedAs()
  let statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('alter table "users" add column "foo" integer generated by default as identity primary key not null', statements[0])

  // With always modifier
  blueprint = new Blueprint('users')
  blueprint.increments('foo').generatedAs().always()
  statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('alter table "users" add column "foo" integer generated always as identity primary key not null', statements[0])

  // With sequence options
  blueprint = new Blueprint('users')
  blueprint.increments('foo').generatedAs('increment by 10 start with 100')
  statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('alter table "users" add column "foo" integer generated by default as identity (increment by 10 start with 100) primary key not null', statements[0])

  // Not a primary key
  blueprint = new Blueprint('users')
  blueprint.integer('foo').generatedAs()
  statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('alter table "users" add column "foo" integer generated by default as identity not null', statements[0])
})

test('testAddingVirtualAs', (t) => {
  const blueprint = new Blueprint('users')
  blueprint.integer('foo').nullable()
  blueprint.boolean('bar').virtualAs('foo is not null')
  const statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('alter table "users" add column "foo" integer null, add column "bar" boolean not null generated always as (foo is not null)', statements[0])
})

test('testAddingStoredAs', (t) => {
  const blueprint = new Blueprint('users')
  blueprint.integer('foo').nullable()
  blueprint.boolean('bar').storedAs('foo is not null')
  const statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('alter table "users" add column "foo" integer null, add column "bar" boolean not null generated always as (foo is not null) stored', statements[0])
})

test('testAddingIpAddress', (t) => {
  const blueprint = new Blueprint('users')
  blueprint.ipAddress('foo')
  const statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('alter table "users" add column "foo" inet not null', statements[0])
})

test('testAddingMacAddress', (t) => {
  const blueprint = new Blueprint('users')
  blueprint.macAddress('foo')
  const statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('alter table "users" add column "foo" macaddr not null', statements[0])
})

test('testCompileForeign', (t) => {
  let blueprint = new Blueprint('users')
  blueprint.foreign('parent_id').references('id').on('parents').onDelete('cascade').deferrable()
  let statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('alter table "users" add constraint "users_parent_id_foreign" foreign key ("parent_id") references "parents" ("id") on delete cascade deferrable', statements[0])

  blueprint = new Blueprint('users')
  blueprint.foreign('parent_id').references('id').on('parents').onDelete('cascade').deferrable(false).initiallyImmediate()
  statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('alter table "users" add constraint "users_parent_id_foreign" foreign key ("parent_id") references "parents" ("id") on delete cascade not deferrable', statements[0])

  blueprint = new Blueprint('users')
  blueprint.foreign('parent_id').references('id').on('parents').onDelete('cascade').deferrable().initiallyImmediate(false)
  statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('alter table "users" add constraint "users_parent_id_foreign" foreign key ("parent_id") references "parents" ("id") on delete cascade deferrable initially deferred', statements[0])

  blueprint = new Blueprint('users')
  blueprint.foreign('parent_id').references('id').on('parents').onDelete('cascade').deferrable().notValid()
  statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('alter table "users" add constraint "users_parent_id_foreign" foreign key ("parent_id") references "parents" ("id") on delete cascade deferrable not valid', statements[0])
})

test('testAddingGeometry', (t) => {
  const blueprint = new Blueprint('geo')
  blueprint.geometry('coordinates')
  const statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('alter table "geo" add column "coordinates" geography(geometry, 4326) not null', statements[0])
})

test('testAddingPoint', (t) => {
  const blueprint = new Blueprint('geo')
  blueprint.point('coordinates')
  const statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('alter table "geo" add column "coordinates" geography(point, 4326) not null', statements[0])
})

test('testAddingLineString', (t) => {
  const blueprint = new Blueprint('geo')
  blueprint.lineString('coordinates')
  const statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('alter table "geo" add column "coordinates" geography(linestring, 4326) not null', statements[0])
})

test('testAddingPolygon', (t) => {
  const blueprint = new Blueprint('geo')
  blueprint.polygon('coordinates')
  const statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('alter table "geo" add column "coordinates" geography(polygon, 4326) not null', statements[0])
})

test('testAddingGeometryCollection', (t) => {
  const blueprint = new Blueprint('geo')
  blueprint.geometryCollection('coordinates')
  const statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('alter table "geo" add column "coordinates" geography(geometrycollection, 4326) not null', statements[0])
})

test('testAddingMultiPoint', (t) => {
  const blueprint = new Blueprint('geo')
  blueprint.multiPoint('coordinates')
  const statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('alter table "geo" add column "coordinates" geography(multipoint, 4326) not null', statements[0])
})

test('testAddingMultiLineString', (t) => {
  const blueprint = new Blueprint('geo')
  blueprint.multiLineString('coordinates')
  const statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('alter table "geo" add column "coordinates" geography(multilinestring, 4326) not null', statements[0])
})

test('testAddingMultiPolygon', (t) => {
  const blueprint = new Blueprint('geo')
  blueprint.multiPolygon('coordinates')
  const statements = blueprint.toSql(getConnection(), getGrammar())

  t.is(1, statements.length)
  t.is('alter table "geo" add column "coordinates" geography(multipolygon, 4326) not null', statements[0])
})

test('testCreateDatabase', (t) => {
  const { createMock, verifyMock } = mock()

  let connection = getConnection()
  let connectionMock = createMock(connection)
  connectionMock.expects('getConfig').once().once().withArgs('charset').returns('utf8_foo')
  let statement = getGrammar().compileCreateDatabase('my_database_a', connection)

  t.is('create database "my_database_a" encoding "utf8_foo"', statement)

  connection = getConnection()
  connectionMock = createMock(connection)
  connectionMock.expects('getConfig').once().once().withArgs('charset').returns('utf8_bar')
  statement = getGrammar().compileCreateDatabase('my_database_b', connection)

  t.is('create database "my_database_b" encoding "utf8_bar"', statement)

  verifyMock()
})

test('testDropDatabaseIfExists', (t) => {
  let statement = getGrammar().compileDropDatabaseIfExists('my_database_a')

  t.is('drop database if exists "my_database_a"', statement)

  statement = getGrammar().compileDropDatabaseIfExists('my_database_b')

  t.is('drop database if exists "my_database_b"', statement)
})

test('testDropAllTablesEscapesTableNames', (t) => {
  const statement = getGrammar().compileDropAllTables(['alpha', 'beta', 'gamma'])

  t.is('drop table "alpha","beta","gamma" cascade', statement)
})

test('testDropAllViewsEscapesTableNames', (t) => {
  const statement = getGrammar().compileDropAllViews(['alpha', 'beta', 'gamma'])

  t.is('drop view "alpha","beta","gamma" cascade', statement)
})

test('testDropAllTypesEscapesTableNames', (t) => {
  const statement = getGrammar().compileDropAllTypes(['alpha', 'beta', 'gamma'])

  t.is('drop type "alpha","beta","gamma" cascade', statement)
})

test('testGrammarsAreMacroable', (t) => {
  // compileReplace macro.
  getGrammar().macro('compileReplace', () => {
    return true
  })

  const compiled = getGrammar().compileReplace()

  t.true(compiled)
})
