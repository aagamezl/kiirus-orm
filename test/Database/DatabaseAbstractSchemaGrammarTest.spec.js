const test = require('ava')

const { Grammar } = require('./../../lib/Illuminate/Database/Schema/Grammars/Grammar')
const { getConnection } = require('./common')

test('testBasicSelect', (t) => {
  const grammar = new (class extends Grammar { })()
  const connection = getConnection()

  const error = t.throws(() => {
    grammar.compileCreateDatabase('foo', connection)
  }, { instanceOf: Error })

  t.true(error.message.includes('LogicException'))
  t.true(error.message.includes('This database driver does not support creating databases.'))
})

test('testDropDatabaseIfExists', (t) => {
  const grammar = new (class extends Grammar { })()

  const error = t.throws(() => {
    grammar.compileDropDatabaseIfExists('foo')
  }, { instanceOf: Error })

  t.true(error.message.includes('LogicException'))
  t.true(error.message.includes('This database driver does not support dropping databases.'))
})
