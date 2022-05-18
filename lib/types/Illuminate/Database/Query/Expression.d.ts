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
     * @param  {unknown}  value
     * @return {void}
     */
    constructor(value: unknown);
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
