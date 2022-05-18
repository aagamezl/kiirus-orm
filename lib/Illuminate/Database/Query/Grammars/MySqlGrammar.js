"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MySqlGrammar = void 0;
const Grammar_1 = require("./Grammar");
class MySqlGrammar extends Grammar_1.Grammar {
    constructor() {
        super(...arguments);
        /**
         * The grammar specific operators.
         *
         * @type {Array}
         */
        this.operators = ['sounds like'];
    }
    /**
     * Wrap a single string in keyword identifiers.
     *
     * @param  {string}  value
     * @return {string}
     */
    wrapValue(value) {
        return value === '*' ? value : '`' + value.replace('`', '``') + '`';
    }
}
exports.MySqlGrammar = MySqlGrammar;
//# sourceMappingURL=MySqlGrammar.js.map