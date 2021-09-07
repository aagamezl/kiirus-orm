const { DB } = require('./../../lib/Illuminate/Support/Facades/DB')

const main = async () => {
  try {
    const users = await DB.query().from('users').where('email', 'jane.doe@domain.com').get()
    const userId = users.all()[0].id

    console.log(`User id: ${userId}`)

    const result = await DB.query().from('users')
      .where('id', '=', userId)
      .update({ name: 'Louise Doe' })

    console.log('result.rowCount: %o', result)
  } catch (error) {
    console.error(error)
  }
}

main()
