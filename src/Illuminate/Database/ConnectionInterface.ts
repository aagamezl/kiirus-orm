export interface ConnectionInterface {
  /**
   * Get the name of the connected database.
   *
   * @returns {string}
   */
  getDatabaseName(): string;

  /**
   * Run a select statement against the database.
   *
   * @param  {string}  query
   * @param  {array}  bindings
   * @returns {Array}
   */
  select(query: string, bindings: Array<string>): Array<unknown>;
}
