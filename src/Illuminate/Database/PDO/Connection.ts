export class Connection {
  /**
   * The underlying PDO connection.
   *
   * @var \NDO
   */
  protected connection: object

  /**
   * Create a new NDO connection instance.
   *
   * @param  \NDO  connection
   * @return void
   */
  public constructor (connection: object) {
    this.connection = connection
  }
}
