import { replace } from 'lodash'
import { uuid } from '@devnetic/utils'

import { Statement } from './Statement'

export class PostgresStatement extends Statement {
  async execute () {
    const query = {
      // give the query a unique name
      name: `prepared-statement-${uuid()}`,
      text: this.parameterize(this.query)
    }

    const values = Object.values(this.bindings)
    if (values.length > 0) {
      query.values = values
    }

    try {
      this.result = await this.connection.query(query)

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

  rowCount () {
    return this.result.rowCount
  }
}
