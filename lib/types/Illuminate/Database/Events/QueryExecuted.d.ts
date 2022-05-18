import { Connection } from '../Connection';
export declare class QueryExecuted {
    /**
     * The array of query bindings.
     *
     * @var array
     */
    bindings: object;
    /**
     * The database connection instance.
     *
     * @var \Illuminate\Database\Connection
     */
    connection: Connection;
    /**
     * The SQL query that was executed.
     *
     * @var string
     */
    sql: string;
    /**
     * The number of milliseconds it took to execute the query.
     *
     * @var number
     */
    time: number;
    /**
     * The database connection name.
     *
     * @var string
     */
    connectionName: string;
    /**
     * Create a new event instance.
     *
     * @param  {string}  sql
     * @param  {array}  bindings
     * @param  {number}  [time]
     * @param  {\Illuminate\Database\Connection}  connection
     * @return {void}
     */
    constructor(sql: string, bindings: object, time: number, connection: Connection);
}
