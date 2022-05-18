import { QueryResult } from 'pg'

export interface PreparedStatement {
  name: string
  rowMode: string
  text: string
  values?: any[]
}

export abstract class Statement {
  protected bindings: object = {}

  protected dsn: string

  protected fetchMode: string = 'assoc'

  protected options: object

  protected password: string

  protected result: QueryResult<any>

  protected rowCountProperty: number

  protected preparedStatement: PreparedStatement

  protected username: string

  public constructor (dsn: string, username: string, password: string, options: object) {
    this.dsn = dsn
    this.options = options
    this.password = password
    this.username = username

    this.bindings = {}
    this.result = {
      command: '',
      fields: [],
      oid: 0,
      rowCount: 0,
      rows: []
    }
    this.rowCountProperty = 0
    this.preparedStatement = {
      name: '',
      rowMode: '',
      text: '',
      values: []
    }
  }

  /**
 *
 * @param {string|number} param
 * @param {unknown} value
 * @return {boolean}
 */
  public bindValue (param: string | number, value: unknown): boolean {
    try {
      Reflect.set(this.bindings, param, value)

      return true
    } catch (error) {
      return false
    }
  }

  public async execute (): Promise<unknown> {
    throw new Error('RuntimeException: Implement execute method on concrete class.')
  }

  public fetchAll (): any[] {
    throw new Error('RuntimeException: Implement fetchAll method on concrete class.')
  }

  public parameterize (query: string): string {
    throw new Error('RuntimeException: Implement parameterize method on concrete class.')
  }

  public prepare (query: string): this {
    throw new Error('RuntimeException: Implement prepare method on concrete class.')
  }

  public rowCount (): number {
    throw new Error('RuntimeException: Implement rowCount method on concrete class.')
  }

  public setFetchMode (mode: string): void {
    this.fetchMode = mode
  }
}
