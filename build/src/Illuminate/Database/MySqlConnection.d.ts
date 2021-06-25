import { Connection } from './Connection';
export declare class MySqlConnection extends Connection {
    /**
     * Returns the ID of the last inserted row or sequence value
     * @return number
     */
    lastInsertId(): number;
}
