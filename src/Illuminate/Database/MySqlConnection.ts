import {createConnection} from 'mysql2';

import {Config} from '.';
import {Connection} from './Connection';
import {MySqlStatement, Statement} from './Statements';

export class MySqlConnection extends Connection {
  constructor(config: Config, database = '', tablePrefix = '') {
    super(config, database, tablePrefix);

    this.connection = createConnection(config);
  }

  /**
   * Returns the ID of the last inserted row or sequence value
   */
  public lastInsertId(): number {
    throw new Error(
      'RuntimeException: This database engine does not support get last insert id.'
    );
  }

  /**
   * Return the prepare statement function.
   *
   * @param  {*}  query
   * @param  {*}  connection
   * @returns {Statement}
   */
  public prepare(query: string, connection: object): Statement {
    return new MySqlStatement(query, connection);
  }
}
