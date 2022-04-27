import test from 'ava'

import { MySqlProcessor } from './../../src/Illuminate/Database/Query/Processors/MySqlProcessor'

test('testProcessColumnListing', async (t) => {
  const processor = new MySqlProcessor()
  const listing = [{ column_name: 'id' }, { column_name: 'name' }, { column_name: 'email' }]
  const expected = ['id', 'name', 'email']

  t.deepEqual(expected, processor.processColumnListing(listing))
})
