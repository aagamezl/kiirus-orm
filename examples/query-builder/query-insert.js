const { DB } = require('./../../lib/Illuminate/Support/Facades/DB')

const main = async () => {
  try {
    let result = await DB.query().from('users').insert(
      { name: 'John Doe', email: 'john.doe@domain.com' }
    )

    console.log('result.rowCount: %o', result.rowCount)

    result = await DB.query().from('users').insert([
      { name: 'Jane Doe', email: 'jane.doe@domain.com' },
      { name: 'Mike Doe', email: 'mike.doe@domain.com' }
    ])

    console.log('result.rowCount: %o', result.rowCount)

    const users = await DB.query().from('users').get()

    console.log(JSON.stringify(users.all(), null, 2))
  } catch (error) {
    console.error(error)
  }
}

main()
