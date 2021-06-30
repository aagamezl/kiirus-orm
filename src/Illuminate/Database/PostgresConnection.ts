import {Client} from 'pg';

import {Config} from '.';
import {Connection} from './Connection';
import {PostgresStatement, Statement} from './Statements';

export class PostgresConnection extends Connection {
  constructor(config: Config, database = '', tablePrefix = '') {
    super(config, database, tablePrefix);

    const client = new Client(config);
    client.connect();

    this.connection = client;
  }

  /**
   * Return the prepare statement function.
   *
   * @param  {*}  query
   * @param  {*}  connection
   * @returns {Statement}
   */
  public prepare(query: string, connection: object): Statement {
    return new PostgresStatement(query, connection);
  }
}
