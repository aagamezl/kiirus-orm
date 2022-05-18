import { Connection } from '../Connection';
import { Statement } from '../Statements/Statement';
export declare class StatementPrepared {
    /**
     * The database connection instance.
     *
     * @member \Illuminate\Database\Connection
     */
    connection: Connection;
    /**
     * The PDO statement.
     *
     * @member Statement
     */
    statement: Statement;
    /**
     * Create a new event instance.
     *
     * @param  {\Illuminate\Database\Connection}  connection
     * @param  {Statement}  statement
     * @return {void}
     */
    constructor(connection: Connection, statement: Statement);
}
