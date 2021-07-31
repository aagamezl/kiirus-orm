const { collect } = require('./../lib/Illuminate/Collections/helpers')

const data = { email: 'foo', name: 'bar' }

const result = collect(Object.entries(data)).map((value, column) => {
  console.log(value, column)

  return value
})

console.log(result)
