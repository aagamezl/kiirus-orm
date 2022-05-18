import { Connection } from '../Connection'

export class QueryExecuted {
  /**
   * The array of query bindings.
   *
   * @var array
   */
  public bindings

  /**
   * The database connection instance.
   *
   * @var \Illuminate\Database\Connection
   */
  public connection: Connection

  /**
   * The SQL query that was executed.
   *
   * @var string
   */
  public sql: string

  /**
   * The number of milliseconds it took to execute the query.
   *
   * @var number
   */
  public time: number

  /**
   * The database connection name.
   *
   * @var string
   */
  public connectionName: string

  /**
   * Create a new event instance.
   *
   * @param  {string}  sql
   * @param  {array}  bindings
   * @param  {number}  [time]
   * @param  {\Illuminate\Database\Connection}  connection
   * @return {void}
   */
  constructor (sql: string, bindings: object, time: number, connection: Connection) {
    this.sql = sql
    this.time = time
    this.bindings = bindings
    this.connection = connection
    this.connectionName = connection.getName() as string
  }
}
