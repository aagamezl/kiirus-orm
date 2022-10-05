"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Dispatcher = void 0;
const Container_1 = require("../Container/Container");
class Dispatcher {
    /**
     * Create a new event dispatcher instance.
     *
     * @param  {\Illuminate\Container\Container|undefined}  container
     * @return void
     */
    constructor(container) {
        this.container = container ?? new Container_1.Container();
    }
}
exports.Dispatcher = Dispatcher;
//# sourceMappingURL=Dispatcher.js.map