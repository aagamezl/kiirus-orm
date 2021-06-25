import { Connection } from './Connection';

export class MySqlConnection extends Connection {
  /**
   * Returns the ID of the last inserted row or sequence value
   * @return number
   */
  public lastInsertId(): number {
    throw new Error('RuntimeException: This database engine does not support get last insert id.');
  }
}
