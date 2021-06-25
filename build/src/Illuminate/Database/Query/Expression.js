"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Expression = void 0;
class Expression {
    /**
     * Create a new raw query expression.
     *
     * @param  any  value
     * @return void
     */
    constructor(value) {
        this.value = value;
    }
    /**
     * Get the value of the expression.
     *
     * @return any
     */
    getValue() {
        return this.value;
    }
    /**
     * Get the value of the expression.
     *
     * @return string
     */
    toString() {
        return this.getValue();
    }
}
exports.Expression = Expression;
//# sourceMappingURL=Expression.js.map