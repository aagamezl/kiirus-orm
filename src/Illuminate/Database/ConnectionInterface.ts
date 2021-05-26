export interface ConnectionInterface {
  /**
   * Get the name of the connected database.
   *
   * @return string
   */
  getDatabaseName(): string;

  /**
   * Run a select statement against the database.
   *
   * @param  string  query
   * @param  array  bindings
   * @return Array<unknown>
   */
  select(query: string, bindings: Array<string>): Array<unknown>;
}
