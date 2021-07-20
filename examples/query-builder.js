const { Builder } = require('./../lib/Illuminate/Database/Query')
const { Connection } = require('../lib/Illuminate/Database')
const { Grammar } = require('../lib/Illuminate/Database/Query/Grammars')
const { Processor } = require('../lib/Illuminate/Database/Query/Processors')
const { HigherOrderTapProxy } = require('../lib/Illuminate/Support/HigherOrderTapProxy')

const { Person } = require('./../lib/Person')

const config = {
  driver: 'mysql',
  host: '127.0.0.1',
  database: 'test',
  username: 'root',
  password: 'root'
}

const connection = new Connection(config)

const grammar = new Grammar()
const processor = new Processor()

const query = new Builder(connection, grammar, processor)

// const buildColumns = (columns) => {
//   return columns.reduce((result, column, index) => {
//     if (isObject(column)) {
//       result.push(...Object.entries(column))
//     } else {
//       result.push([index, column])
//     }

//     return result
//   }, [])
// }

// function select (...columns) {
//   columns = columns.length === 0 ? ['*'] : columns
//   columns = buildColumns(columns)

//   for (const [as, column] of columns) {
//     console.log('as: %o, column: %o', as, column)
//   }
// }

try {
  // select()
  // select('foo', 'bar')
  // select({ foo: () => { }, bar: () => { } })

  console.log(query.select().from('users').toSql())
  // console.log(query.select({ id: () => { } }).from('users').toSql())

  const target = {
    select: () => {
      console.log('select')
    }
  }

  const proxy = new HigherOrderTapProxy(target)

  proxy.select()

  const person = new Person()

  console.log(person.getPet().type)
} catch (error) {
  console.error(error)
}
