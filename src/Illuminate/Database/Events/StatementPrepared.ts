import { Connection } from '../Connection'
import { Statement } from '../Statements/Statement'

export class StatementPrepared {
  /**
   * The database connection instance.
   *
   * @member \Illuminate\Database\Connection
   */
  public connection: Connection

  /**
   * The PDO statement.
   *
   * @member Statement
   */
  public statement: Statement

  /**
   * Create a new event instance.
   *
   * @param  {\Illuminate\Database\Connection}  connection
   * @param  {Statement}  statement
   * @return {void}
   */
  public constructor (connection: Connection, statement: Statement) {
    this.connection = connection
    this.statement = statement
  }
}
