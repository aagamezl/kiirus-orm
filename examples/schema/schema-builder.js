const { Schema } = require('./../../lib/Illuminate/Support/Facades/Schema')

Schema.create('flights', (table) => {
  table.id()
  table.string('name')
  table.string('airline')
  table.timestamps()
})

// To specify which connection the schema operation should take place on
// Schema.connection('foo').create('flights', (table) => {
//   table.id()
//   table.string('name')
//   table.string('airline')
//   table.timestamps()
// })
