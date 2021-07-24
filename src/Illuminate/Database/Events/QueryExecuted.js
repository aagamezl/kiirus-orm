export class QueryExecuted {
  /**
   * Create a new event instance.
   *
   * @param  {string}  sql
   * @param  {object}  bindings
   * @param  {number}  [time]
   * @param  {\Illuminate\Database\Connection}  connection
   * @return void
   */
  constructor (sql, bindings, connection, time) {
    /**
     * The array of query bindings.
     *
     * @member object
     */
    this.bindings = bindings

    /**
     * The database connection instance.
     *
     * @member \Illuminate\Database\Connection
     */
    this.connection = connection

    /**
     * The database connection name.
     *
     * @member string
     */
    this.connectionName = connection.getName()

    /**
     * The SQL query that was executed.
     *
     * @member string
     */
    this.sql = sql

    /**
     * The number of milliseconds it took to execute the query.
     *
     * @member float
     */
    this.time = time
  }
}
