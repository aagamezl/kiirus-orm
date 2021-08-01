import { Pool } from 'pg'
import { replace } from 'lodash'
import { uuid } from '@devnetic/utils'

import { Statement } from './Statement'

export class PostgresStatement extends Statement {
  constructor (dsn, username, password, options) {
    super(dsn, username, password, options)

    this.pool = new Pool({
      connectionString: this.dsn
    })
  }

  async execute () {
    const values = Object.values(this.bindings)
    if (values.length > 0) {
      this.statement.values = values
    }

    try {
      const client = await this.pool.connect()

      this.result = await client.query(this.statement)

      client.end()

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

    this.bindings = {}

    return this
  }

  rowCount () {
    return this.result.rowCount
  }
}
