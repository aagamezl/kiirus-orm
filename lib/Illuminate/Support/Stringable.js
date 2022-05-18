"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Stringable = void 0;
const Conditionable_1 = require("../Conditionable/Traits/Conditionable");
const Macroable_1 = require("../Macroable/Traits/Macroable");
const Tappable_1 = require("./Traits/Tappable");
const use_1 = require("./Traits/use");
class Stringable {
    constructor(value) {
        (0, use_1.use)(this.constructor, [Conditionable_1.Conditionable, Macroable_1.Macroable, Tappable_1.Tappable]);
        this.value = value;
    }
}
exports.Stringable = Stringable;
//# sourceMappingURL=Stringable.js.map