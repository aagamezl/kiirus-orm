export declare class Expression {
    /**
     * The value of the expression.
     *
     * @var unknown
     */
    protected value: unknown;
    /**
     * Create a new raw query expression.
     *
     * @param  {any}  value
     * @return {void}
     */
    constructor(value: any);
    /**
     * Get the value of the expression.
     *
     * @return {unknown}
     */
    getValue(): unknown;
    /**
     * Get the value of the expression.
     *
     * @return {string}
     */
    toString(): string;
}
