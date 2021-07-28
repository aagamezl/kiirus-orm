export class StatementPrepared {
  /**
   * Create a new event instance.
   *
   * @param  \Illuminate\Database\Connection  connection
   * @param  \PDOStatement  statement
   * @return void
   */
  constructor (connection, statement) {
    /**
     * The database connection instance.
     *
     * @member \Illuminate\Database\Connection
     */
    this.connection = connection

    /**
     * The PDO statement.
     *
     * @member \PDOStatement
     */
    this.statement = statement
  }
}
