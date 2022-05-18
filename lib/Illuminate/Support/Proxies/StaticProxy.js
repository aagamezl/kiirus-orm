"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StaticProxy = void 0;
const StaticProxy = (facade) => {
    return new Proxy(facade, {
        get(target, method, receiver) {
            if (Reflect.has(target, method)) {
                return target[method];
            }
            else {
                return (...args) => {
                    return receiver.__callStatic(method, ...args);
                };
            }
        }
    });
};
exports.StaticProxy = StaticProxy;
//# sourceMappingURL=StaticProxy.js.map