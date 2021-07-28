const { DB } = require('./../lib/Illuminate/Support/Facades/DB')

const main = async () => {
  try {
    const db = new DB()

    // let result = await db.query().from('users').insert(
    //   { name: 'John Doe', email: 'john.doe@domain.com' }
    // )

    // console.log('result.rowCount: %o', result.rowCount)

    // result = await db.query().from('users').insert([
    //   { name: 'Jane Doe', email: 'jane.doe@domain.com' },
    //   { name: 'Mike Doe', email: 'mike.doe@domain.com' }
    // ])

    // console.log('result.rowCount: %o', result.rowCount)

    // const result = await db.query().from('users')
    //   .where('name', 'John Doe').update({ email: 'john.doe@email.com' })

    // console.log('result: %o', result)

    // console.log(db.query().from('users').where('name', 'John Doe').toSql())
    // const users = await db.query().from('users').where('name', 'John Doe').get()
    const users = await db.query().from('users').get()

    console.log(JSON.stringify(users.all(), null, 2))
  } catch (error) {
    console.error(error)
  }
}

main()
