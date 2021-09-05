const { DB } = require('./../../lib/Illuminate/Support/Facades/DB')

const main = async () => {
  try {
    let users = await DB.query().from('users').where('name', 'John Doe').get()
    console.log(JSON.stringify(users.all(), null, 2))

    users = await DB.query().from('users').get()

    console.log(JSON.stringify(users.all(), null, 2))
  } catch (error) {
    console.error(error)
  }
}

main()
