const test = require('ava')

const { PostgresProcessor } = require('../../lib/Illuminate/Database/Query/Processors/PostgresProcessor')

test('testProcessColumnListing', async (t) => {
  const processor = new PostgresProcessor()
  const listing = [{ column_name: 'id' }, { column_name: 'name' }, { column_name: 'email' }]
  const expected = ['id', 'name', 'email']

  t.deepEqual(expected, processor.processColumnListing(listing))
})
