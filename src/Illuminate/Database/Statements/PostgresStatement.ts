import { Pool } from 'pg'
import { uuid } from '@devnetic/utils'

import { Statement } from './Statement'

export class PostgresStatement extends Statement {
  protected pool: Pool

  public constructor (dsn: string, username: string, password: string, options: object) {
    super(dsn, username, password, options)

    this.pool = new Pool({
      connectionString: this.dsn
    })
  }

  public async execute (): Promise<unknown> {
    const values = Object.values(this.bindings)

    if (values.length > 0) {
      this.preparedStatement.values = values
    }

    try {
      const client = await this.pool.connect()

      this.result = await client.query(this.preparedStatement)

      await this.pool.end()

      return this.result
    } catch (error) {
      console.error(error)

      return undefined
    }
  }

  public fetchAll (): any[] {
    return this.result.rows
  }

  public parameterize (query: string): string {
    const regex = /\?/gm

    if (query.match(regex) === null) {
      return query
    }

    let index = 0
    // return replace(query, regex, () => `$${++index}`)
    return query.replace(regex, () => `$${++index}`)
  }

  public prepare (query: string): this {
    this.preparedStatement = {
      name: `prepared-statement-${uuid()}`, // give the query a unique name
      text: this.parameterize(query),
      rowMode: this.fetchMode
    }

    this.bindings = {}

    return this
  }

  public rowCount (): number {
    return this.result.rowCount
  }
}
