export declare class Connection {
    /**
     * The underlying PDO connection.
     *
     * @var \NDO
     */
    protected connection: object;
    /**
     * Create a new NDO connection instance.
     *
     * @param  \NDO  connection
     * @return void
     */
    constructor(connection: object);
}
