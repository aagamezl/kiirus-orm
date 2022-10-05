export interface ArrayAccess {
    [key: string]: any;
}
export interface Container extends ArrayAccess {
}
export declare class Container {
    /**
     * The registered aliases keyed by the abstract name.
     *
     * @var Record<string, any>
     */
    protected abstractAliases: Record<string, any>;
    /**
     * The registered type aliases.
     *
     * @var Record<string, any>
     */
    protected aliases: Record<string, any>;
    /**
     * The container's bindings.
     *
     * @var Record<string, string>
     */
    protected bindings: Record<string, string>;
    /**
     * The container's shared instances.
     *
     * @var Record<string, string>
     */
    protected instances: Record<string, unknown>;
    /**
     * All of the registered rebound callbacks.
     *
     * @var Record<string, unknown>
     */
    protected reboundCallbacks: Record<string, any>;
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
    alias(alias: string, abstract: any, dependencies?: object[]): void;
    /**
     * Determine if the given abstract type has been bound.
     *
     * @param  {string}  abstract
     * @return {boolean}
     */
    bound(abstract: string): boolean;
    /**
     * Get the alias for an abstract if available.
     *
     * @param  {string}  abstract
     * @return {string}
     */
    getAlias(abstract: string): string;
    protected getParameters(dependencies: unknown[]): unknown[];
    /**
     * Get the rebound callbacks for a given type.
     *
     * @param  {string}  abstract
     * @return {Record<string, any>}
     */
    protected getReboundCallbacks(abstract: string): Record<string, any>;
    /**
     * Register an existing instance as shared in the container.
     *
     * @param  {string}  abstract
     * @param  {unknown}  instance
     * @return {any}
     */
    instance(abstract: string, instance: unknown): any;
    /**
     * Determine if a given string is an alias.
     *
     * @param  {string}  name
     * @return {boolean}
     */
    isAlias(name: string): boolean;
    /**
     * Determine if the given abstract is buildable.
     *
     * @param  {unknown}  abstract
     * @return {boolean}
     */
    protected isBuildable(abstract: unknown): boolean;
    /**
     * Resolve the given type from the container.
     *
     * @param  {string|callable}  abstract
     * @param  {array}  parameters
     * @return {any}
     *
     * @throws \Illuminate\Contracts\Container\BindingResolutionException
     */
    make(abstract: string | Function, parameters?: unknown[]): any;
    /**
     * Fire the "rebound" callbacks for the given abstract type.
     *
     * @param  {string}  abstract
     * @return {void}
     */
    protected rebound(abstract: string): void;
    /**
   * Remove an alias from the contextual binding alias cache.
   *
   * @param  {string}  searched
   * @return {void}
   */
    protected removeAbstractAlias(searched: string): void;
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
    protected resolve(abstract: any, parameters?: unknown[], raiseEvents?: boolean): any;
}
