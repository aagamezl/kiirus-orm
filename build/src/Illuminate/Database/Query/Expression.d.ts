export declare class Expression {
    /**
     * The value of the expression.
     *
     * @var any
     */
    protected value: any;
    /**
     * Create a new raw query expression.
     *
     * @param  any  value
     * @return void
     */
    constructor(value: any);
    /**
     * Get the value of the expression.
     *
     * @return any
     */
    getValue(): any;
    /**
     * Get the value of the expression.
     *
     * @return string
     */
    toString(): string;
}
