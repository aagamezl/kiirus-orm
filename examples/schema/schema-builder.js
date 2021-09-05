const { Schema } = require('./../../lib/Illuminate/Support/Facades/Schema')

const schema = new Schema()

schema.create('flights', (table) => {
  table.id()
  table.string('name')
  table.string('airline')
  table.timestamps()
})
