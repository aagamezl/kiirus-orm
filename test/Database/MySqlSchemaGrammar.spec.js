const test = require('ava')

const { MySqlGrammar } = require('../../lib/Illuminate/Database/Schema/Grammars/MySqlGrammar')
const { Blueprint } = require('./../../lib/Illuminate/Database/Schema/Blueprint')
const { mock } = require('../tools/mock')
const { getConnection } = require('./common')

const getGrammar = () => new MySqlGrammar()

test.only('testBasicCreateTable', (t) => {
  const { createMock, verifyMock } = mock()

  let blueprint = new Blueprint('users')
  blueprint.create()
  blueprint.increments('id')
  blueprint.string('email')

  let connection = getConnection()
  let connectionMock = createMock(connection)

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
  connectionMock = createMock(connection)

  // connectionMock.expects('getConfig').returns(undefined)

  statements = blueprint.toSql(connection, getGrammar())

  t.is(1, statements.length)
  t.is('alter table `users` add `id` int unsigned not null auto_increment primary key, add `email` varchar(255) not null', statements[0])

  verifyMock()
})

// test('test_name', (t) => {
//   const { createMock, verifyMock } = mock()

//   verifyMock()
// })
