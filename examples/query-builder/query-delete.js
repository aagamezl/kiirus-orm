const { DB } = require('../lib/Illuminate/Support/Facades/DB')

const main = async () => {
  try {
    const db = new DB()

    const users = await db.query().from('users').where('email', 'john.doe@domain.com').get()
    const userId = users.all()[0].id

    console.log(`User id: ${userId}`)

    const result = await db.query().from('users')
      .delete(userId)

    console.log('result.rowCount: %o', result)
  } catch (error) {
    console.error(error)
  }
}

main()
