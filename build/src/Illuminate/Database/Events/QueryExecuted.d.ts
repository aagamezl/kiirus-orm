import { Bindings, Connection } from '../Connection';
export declare class QueryExecuted {
    /**
     * The SQL query that was executed.
     *
     * @var string
     */
    sql: string;
    /**
     * The array of query bindings.
     *
     * @var array
     */
    bindings: Bindings;
    /**
     * The number of milliseconds it took to execute the query.
     *
     * @var float
     */
    time: number | undefined;
    /**
     * The database connection instance.
     *
     * @var \Illuminate\Database\Connection
     */
    connection: Connection;
    /**
     * The database connection name.
     *
     * @var string
     */
    connectionName: string | undefined;
    /**
     * Create a new event instance.
     *
     * @param  string  sql
     * @param  array  bindings
     * @param  [number]  time
     * @param  \Illuminate\Database\Connection  connection
     * @return void
     */
    constructor(sql: string, bindings: Bindings, connection: Connection, time?: number);
}
