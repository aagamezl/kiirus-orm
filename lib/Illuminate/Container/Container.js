"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Container = void 0;
const utils_1 = require("@devnetic/utils");
class Container {
    constructor() {
        /**
         * The registered aliases keyed by the abstract name.
         *
         * @var Record<string, any>
         */
        this.abstractAliases = {};
        /**
         * The registered type aliases.
         *
         * @var Record<string, any>
         */
        this.aliases = {};
        /**
         * The container's bindings.
         *
         * @var Record<string, string>
         */
        this.bindings = {};
        /**
         * The container's shared instances.
         *
         * @var Record<string, string>
         */
        this.instances = {};
        /**
         * All of the registered rebound callbacks.
         *
         * @var Record<string, unknown>
         */
        this.reboundCallbacks = {};
    }
    /**
     * Alias a type to a different name.
     *
     * @param  {string}  alias
     * @param  {object}  abstract
     * @param  {Array}  [dependencies=[]]
     * @return {void}
     *
     * @throws \LogicException
     */
    alias(alias, abstract, dependencies = []) {
        if (alias === abstract) {
            throw new Error(`LogicException: [${alias}] is aliased to itself.`);
        }
        this.aliases[alias] = { abstract, dependencies };
        if (!Array.isArray(this.abstractAliases[abstract])) {
            this.abstractAliases[alias] = [];
        }
        this.abstractAliases[alias].push({ abstract, dependencies });
    }
    /**
     * Determine if the given abstract type has been bound.
     *
     * @param  {string}  abstract
     * @return {boolean}
     */
    bound(abstract) {
        return !(0, utils_1.isNil)(this.bindings[abstract]) ||
            !(0, utils_1.isNil)(this.instances[abstract]) ||
            this.isAlias(abstract);
    }
    /**
     * Get the alias for an abstract if available.
     *
     * @param  {string}  abstract
     * @return {string}
     */
    getAlias(abstract) {
        return !(0, utils_1.isNil)(this.aliases[abstract])
            ? this.getAlias(this.aliases[abstract]) // TODO: verify the recursion and aliases type
            : abstract;
    }
    getParameters(dependencies) {
        return dependencies.map((dependency) => {
            return Reflect.construct(dependency, []);
        });
    }
    /**
     * Get the rebound callbacks for a given type.
     *
     * @param  {string}  abstract
     * @return {Record<string, any>}
     */
    getReboundCallbacks(abstract) {
        return this.reboundCallbacks[abstract] ?? {};
    }
    /**
     * Register an existing instance as shared in the container.
     *
     * @param  {string}  abstract
     * @param  {unknown}  instance
     * @return {any}
     */
    instance(abstract, instance) {
        this.removeAbstractAlias(abstract);
        const isBound = this.bound(abstract);
        delete this.aliases[abstract]; // eslint-disable-line
        // We'll check to determine if this type has been bound before, and if it has
        // we will fire the rebound callbacks registered with the container and it
        // can be updated with consuming classes that have gotten resolved here.
        this.instances[abstract] = instance;
        if (isBound) {
            this.rebound(abstract);
        }
        return instance;
    }
    /**
     * Determine if a given string is an alias.
     *
     * @param  {string}  name
     * @return {boolean}
     */
    isAlias(name) {
        return !(0, utils_1.isNil)(this.aliases[name]);
    }
    /**
     * Determine if the given abstract is buildable.
     *
     * @param  {unknown}  abstract
     * @return {boolean}
     */
    isBuildable(abstract) {
        return abstract instanceof Function;
    }
    /**
     * Resolve the given type from the container.
     *
     * @param  {string|callable}  abstract
     * @param  {array}  parameters
     * @return {any}
     *
     * @throws \Illuminate\Contracts\Container\BindingResolutionException
     */
    make(abstract, parameters = []) {
        return this.resolve(abstract, parameters);
    }
    /**
     * Fire the "rebound" callbacks for the given abstract type.
     *
     * @param  {string}  abstract
     * @return {void}
     */
    rebound(abstract) {
        const instance = this.make(abstract);
        for (const callbackFunction of Object.values(this.getReboundCallbacks(abstract))) {
            callbackFunction(this, instance);
        }
    }
    /**
   * Remove an alias from the contextual binding alias cache.
   *
   * @param  {string}  searched
   * @return {void}
   */
    removeAbstractAlias(searched) {
        if ((0, utils_1.isNil)(this.aliases[searched])) {
            return;
        }
        for (const [abstract, aliases] of Object.entries(this.abstractAliases)) {
            for (const [index, alias] of Object.entries(aliases)) {
                if (alias === searched) {
                    delete this.abstractAliases[abstract][index]; // eslint-disable-line
                }
            }
        }
    }
    /**
     * Resolve the given type from the container.
     *
     * @param  {string}  abstract
     * @param  {Array}  parameters
     * @param  {boolean}  raiseEvents
     * @return {*}
     *
     * @throws {\Illuminate\Contracts\Container\BindingResolutionException}
     * @throws {\Illuminate\Contracts\Container\CircularDependencyException}
     */
    resolve(abstract, parameters = [], raiseEvents = true) {
        abstract = this.getAlias(abstract);
        if (this.isBuildable(abstract.abstract)) {
            return Reflect.construct(abstract.abstract, [...parameters, ...this.getParameters(abstract.dependencies)]);
        }
        else {
            return abstract;
        }
    }
}
exports.Container = Container;
//# sourceMappingURL=Container.js.map