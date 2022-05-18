import { Connection } from './../Connection';
export declare class ConnectsToDatabase {
    /**
     * Create a new database connection.
     *
     * @param  {object}  params
     * @param  {string|undefined}  username
     * @param  {string|undefined}  password
     * @param  {object}  driverOptions
     * @return {\Illuminate\Database\PDO\Connection}
     *
     * @throws {\InvalidArgumentException}
     */
    connect(params: Record<string, any>, username?: string, password?: string, driverOptions?: Record<string, unknown>): Connection;
}
