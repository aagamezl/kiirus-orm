const { Schema } = require('./../../lib/Illuminate/Support/Facades/Schema')

Schema.create('flights', (table) => {
  table.id()
  table.string('name')
  table.string('airline')
  table.timestamps()
})
