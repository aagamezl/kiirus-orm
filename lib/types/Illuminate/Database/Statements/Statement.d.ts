import { QueryResult } from 'pg';
export interface PreparedStatement {
    name: string;
    rowMode: string;
    text: string;
    values?: any[];
}
export declare abstract class Statement {
    protected bindings: object;
    protected dsn: string;
    protected fetchMode: string;
    protected options: object;
    protected password: string;
    protected result: QueryResult<any>;
    protected rowCountProperty: number;
    protected preparedStatement: PreparedStatement;
    protected username: string;
    constructor(dsn: string, username: string, password: string, options: object);
    /**
   *
   * @param {string|number} param
   * @param {unknown} value
   * @return {boolean}
   */
    bindValue(param: string | number, value: unknown): boolean;
    execute(): Promise<unknown>;
    fetchAll(): any[];
    parameterize(query: string): string;
    prepare(query: string): this;
    rowCount(): number;
    setFetchMode(mode: string): void;
}
