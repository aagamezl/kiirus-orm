"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HigherOrderTapProxy = void 0;
class HigherOrderTapProxy {
    /**
     * Create a new tap proxy instance.
     *
     * @param  any  target
     * @return void
     */
    constructor(target) {
        this.target = target;
    }
    /**
     * Dynamically pass method calls to the target.
     *
     * @param  string  method
     * @param  array  parameters
     * @return any
     */
    get(method, parameters) {
        return this.target[method](...parameters);
    }
}
exports.HigherOrderTapProxy = HigherOrderTapProxy;
//# sourceMappingURL=HigherOrderTapProxy.js.map