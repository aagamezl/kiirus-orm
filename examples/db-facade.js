const { DB } = require('./../lib/Illuminate/Support/Facades/DB')

const main = async () => {
  try {
    const db = new DB()

    console.log(db.query().from('users').where('name', 'John Doe').toSql())
    const users = await db.query().from('users').where('name', 'John Doe').get()

    console.log(JSON.stringify(users.all(), null, 2))
  } catch (error) {
    console.error(error)
  }
}

main()
