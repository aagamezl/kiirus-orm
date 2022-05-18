import { Application } from './../../Foundation/Application';
export declare abstract class FacadeClass {
    /**
     * The application instance being facaded.
     *
     * @var \Illuminate\Contracts\Foundation\Application
     */
    protected static app: Application;
    /**
     * Indicates if the resolved instance should be cached.
     *
     * @var boolean
     */
    protected static cached: boolean;
    /**
     * The resolved object instances.
     *
     * @var Record<string, any>
     */
    protected static resolvedInstance: Record<string, any>;
    constructor();
    /**
     * Handle dynamic, static calls to the object.
     *
     * @param  {string}  method
     * @param  {Array}  args
     * @return {*}
     *
     * @throws {\RuntimeException}
     */
    static __callStatic(method: string, ...args: any[]): any;
    /**
     * Get the registered name of the component.
     *
     * @return string
     *
     * @throws \RuntimeException
     */
    protected static getFacadeAccessor(): string;
    /**
     * Get the root object behind the facade.
     *
     * @return {*}
     */
    static getFacadeRoot(): any;
    /**
     * Resolve the facade root instance from the container.
     *
     * @param  {string}  name
     * @return {*}
     */
    static resolveFacadeInstance(name: string): any;
    /**
     * Set the application instance.
     *
     * @param  {\Illuminate\Contracts\Foundation\Application}  app
     * @return {void}
     */
    static setFacadeApplication(app: Application): void;
}
export declare const Facade: typeof FacadeClass;
