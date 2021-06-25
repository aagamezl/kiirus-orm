export declare class Statement {
    protected bindings: Record<string | number, any>;
    protected connection: any;
    protected query: string;
    protected rowCountProperty: number;
    constructor(query: string, connection: any);
    /**
     *
     * @param string|number param
     * @param any value
     * @return boolean
     */
    bindValue(param: string | number, value: any): boolean;
    execute(): Promise<boolean>;
    rowCount(): number;
}
