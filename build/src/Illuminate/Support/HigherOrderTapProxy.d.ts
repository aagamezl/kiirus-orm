export declare class HigherOrderTapProxy {
    /**
     * The target being tapped.
     *
     * @var any
     */
    target: any;
    /**
     * Create a new tap proxy instance.
     *
     * @param  any  target
     * @return void
     */
    constructor(target: any);
    /**
     * Dynamically pass method calls to the target.
     *
     * @param  string  method
     * @param  array  parameters
     * @return any
     */
    get(method: string, parameters: Array<any>): any;
}
