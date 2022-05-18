import { Container } from './../Container/Container';
export declare class Application extends Container {
    /**
     * The custom application path defined by the developer.
     *
     * @var string
     */
    protected appPath: string;
    /**
     * The base path for the Laravel installation.
     *
     * @var string
     */
    protected basePathProperty: string;
    /**
     * The deferred services and their providers.
     *
     * @var array
     */
    protected deferredServices: Record<string, string>;
    /**
     * The custom language file path defined by the developer.
     *
     * @var string
     */
    protected langPath: string;
    /**
     * Create a new Illuminate application instance.
     *
     * @param  {string|undefined}  basePath
     * @return {void}
     */
    constructor(basePath?: string);
    /**
     * Get the base path of the Laravel installation.
     *
     * @param  {string}  path
     * @return {string}
     */
    basePath(path?: string): string;
    /**
     * Bind all of the application paths in the container.
     *
     * @return void
     */
    protected bindPathsInContainer(): void;
    /**
     * Determine if the given abstract type has been bound.
     *
     * @param  {string}  abstract
     * @return {boolean}
     */
    bound(abstract: string): boolean;
    /**
     * Get the path to the application configuration files.
     *
     * @param  {string}  path
     * @return {string}
     */
    configPath(path?: string): string;
    /**
     * Determine if the given service is a deferred service.
     *
     * @param  {string}  service
     * @return {boolean}
     */
    isDeferredService(service: string): boolean;
    /**
     * Resolve the given type from the container.
     *
     * @param  {string|Function}  abstract
     * @param  {array}  parameters
     * @return {any}
     *
     * @throws {\Illuminate\Contracts\Container\BindingResolutionException}
     */
    make(abstract: string | Function, parameters?: unknown[]): any;
    /**
     * Get the path to the application "app" directory.
     *
     * @param  {string}  path
     * @return {string}
     */
    path(path?: string): string;
    /**
   * Register the core class aliases in the container.
   *
   * @return {void}
   */
    registerCoreContainerAliases(): void;
    /**
     * Set the base path for the application.
     *
     * @param  {string}  basePath
     * @return {this}
     */
    setBasePath(basePath: string): this;
}
