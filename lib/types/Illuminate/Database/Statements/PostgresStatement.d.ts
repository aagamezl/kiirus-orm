import { Pool } from 'pg';
import { Statement } from './Statement';
export declare class PostgresStatement extends Statement {
    protected pool: Pool;
    constructor(dsn: string, username: string, password: string, options: object);
    execute(): Promise<unknown>;
    fetchAll(): any[];
    parameterize(query: string): string;
    prepare(query: string): this;
    rowCount(): number;
}
