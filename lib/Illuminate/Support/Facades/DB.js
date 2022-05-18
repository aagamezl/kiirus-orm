"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DB = void 0;
const Facade_1 = require("./Facade");
// eslint-disable-next-line
class DB extends Facade_1.Facade {
    /**
     * Get the registered name of the component.
     *
     * @return {string}
     */
    static getFacadeAccessor() {
        return 'db';
    }
}
exports.DB = DB;
//# sourceMappingURL=DB.js.map