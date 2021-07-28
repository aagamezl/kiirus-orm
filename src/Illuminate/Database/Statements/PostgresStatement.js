import { Pool } from 'pg'
import { replace } from 'lodash'
import { uuid } from '@devnetic/utils'

import { Statement } from './Statement'

export class PostgresStatement extends Statement {
  constructor (dsn, username, password, options) {
    super(dsn, username, password, options)

    this.connection = new Pool({
      connectionString: this.dsn
      // user: this.username,
      // password: this.password,
      // host: this.host,
      // database: this.database,
      // port: this.port || 5432
    })
  }

  async execute () {
    // const query = {
    //   // give the query a unique name
    //   name: `prepared-statement-${uuid()}`,
    //   text: this.parameterize(this.query)
    // }

    const values = Object.values(this.bindings)
    if (values.length > 0) {
      // query.values = values
      this.statement.values = values
    }

    try {
      // this.result = await this.connection.query(query)
      this.result = await this.connection.query(this.statement)

      this.connection.end()

      return this.result
    } catch (error) {
      console.error(error)
    }
  }

  fetchAll () {
    return this.result.rows
  }

  parameterize (query) {
    const regex = /\?/gm

    if (query.match(regex) === null) {
      return query
    }

    let index = 0
    return replace(query, regex, () => `$${++index}`)
  }

  prepare (query) {
    this.statement = {
      // give the query a unique name
      name: `prepared-statement-${uuid()}`,
      text: this.parameterize(query),
      rowMode: this.fetchMode
    }

    return this
  }

  rowCount () {
    return this.result.rowCount
  }
}
