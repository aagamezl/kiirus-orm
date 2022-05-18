"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tappable = void 0;
const helpers_1 = require("../helpers");
class Tappable {
    /**
     * Call the given Closure with this instance then return the instance.
     *
     * @param  {callable}  [callback=undefined]
     * @return {this|\Illuminate\Support\HigherOrderTapProxy}
     */
    tap(callback) {
        return (0, helpers_1.tap)(this, callback);
    }
}
exports.Tappable = Tappable;
//# sourceMappingURL=Tappable.js.map