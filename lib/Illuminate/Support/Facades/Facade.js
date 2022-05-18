"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Facade = exports.FacadeClass = void 0;
const utils_1 = require("@devnetic/utils");
const Application_1 = require("./../../Foundation/Application");
const InstanceProxy_1 = require("./../Proxies/InstanceProxy");
const StaticProxy_1 = require("./../Proxies/StaticProxy");
// eslint-disable-next-line
class FacadeClass {
    constructor() {
        if (new.target === FacadeClass) {
            throw new Error('Cannot create an instance of an abstract class.');
        }
        return (0, InstanceProxy_1.instanceProxy)(this);
    }
    /**
     * Handle dynamic, static calls to the object.
     *
     * @param  {string}  method
     * @param  {Array}  args
     * @return {*}
     *
     * @throws {\RuntimeException}
     */
    static __callStatic(method, ...args) {
        const instance = this.getFacadeRoot();
        if ((0, utils_1.isNil)(instance)) {
            throw new Error('RuntimeException: A facade root has not been set.');
        }
        return instance[method](...args);
    }
    /**
     * Get the registered name of the component.
     *
     * @return string
     *
     * @throws \RuntimeException
     */
    static getFacadeAccessor() {
        throw new Error('RuntimeException: Facade does not implement getFacadeAccessor method.');
    }
    /**
     * Get the root object behind the facade.
     *
     * @return {*}
     */
    static getFacadeRoot() {
        return this.resolveFacadeInstance(this.getFacadeAccessor());
    }
    /**
     * Resolve the facade root instance from the container.
     *
     * @param  {string}  name
     * @return {*}
     */
    static resolveFacadeInstance(name) {
        if (!(0, utils_1.isNil)(this.resolvedInstance[name])) {
            return this.resolvedInstance[name];
        }
        if (!(0, utils_1.isNil)(this.app)) {
            if (this.cached) {
                this.resolvedInstance[name] = this.app[name];
                // return this.resolvedInstance[name]
            }
        }
        else {
            const app = new Application_1.Application();
            this.setFacadeApplication(app);
            this.resolvedInstance[name] = this.app[name];
        }
        return this.app[name];
    }
    /**
     * Set the application instance.
     *
     * @param  {\Illuminate\Contracts\Foundation\Application}  app
     * @return {void}
     */
    static setFacadeApplication(app) {
        this.app = app;
    }
}
exports.FacadeClass = FacadeClass;
/**
 * The application instance being facaded.
 *
 * @var \Illuminate\Contracts\Foundation\Application
 */
FacadeClass.app = undefined;
/**
 * Indicates if the resolved instance should be cached.
 *
 * @var boolean
 */
FacadeClass.cached = true;
/**
 * The resolved object instances.
 *
 * @var Record<string, any>
 */
FacadeClass.resolvedInstance = {};
exports.Facade = (0, StaticProxy_1.StaticProxy)(FacadeClass);
//# sourceMappingURL=Facade.js.map