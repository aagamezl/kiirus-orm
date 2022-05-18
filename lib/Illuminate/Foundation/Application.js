"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Application = void 0;
const path_1 = require("path");
const utils_1 = require("@devnetic/utils");
const ConnectionFactory_1 = require("../Database/Connectors/ConnectionFactory");
const Container_1 = require("./../Container/Container");
const DatabaseManager_1 = require("./../Database/DatabaseManager");
const Repository_1 = require("./../Config/Repository");
const Dispatcher_1 = require("./../Events/Dispatcher");
// import { isDirectory } from '../Support/helpers'
// import { value } from '../Collections/helpers'
class Application extends Container_1.Container {
    /**
     * Create a new Illuminate application instance.
     *
     * @param  {string|undefined}  basePath
     * @return {void}
     */
    constructor(basePath) {
        super();
        /**
         * The custom application path defined by the developer.
         *
         * @var string
         */
        this.appPath = '';
        /**
         * The base path for the Laravel installation.
         *
         * @var string
         */
        this.basePathProperty = '';
        /**
         * The deferred services and their providers.
         *
         * @var array
         */
        this.deferredServices = {};
        /**
         * The custom language file path defined by the developer.
         *
         * @var string
         */
        this.langPath = '';
        if (basePath !== undefined) {
            this.setBasePath(basePath);
        }
        this.registerCoreContainerAliases();
        return new Proxy(this, {
            get: (target, key, receiver) => {
                if (key in target) {
                    return target[key];
                }
                return receiver.make(target.getAlias(key));
            }
        });
    }
    /**
     * Get the base path of the Laravel installation.
     *
     * @param  {string}  path
     * @return {string}
     */
    basePath(path = '') {
        return this.basePathProperty + (path !== '' ? path_1.sep + path : '');
    }
    /**
     * Bind all of the application paths in the container.
     *
     * @return void
     */
    bindPathsInContainer() {
        this.instance('path', this.path());
        this.instance('path.base', this.basePath());
        this.instance('path.config', this.configPath());
        // this.instance('path.public', this.publicPath())
        // this.instance('path.storage', this.storagePath())
        // this.instance('path.database', this.databasePath())
        // this.instance('path.resources', this.resourcePath())
        // this.instance('path.bootstrap', this.bootstrapPath())
        // this.useLangPath(value(() => {
        //   const directory = this.resourcePath('lang')
        //   if (isDirectory(directory)) {
        //     return directory
        //   }
        //   return this.basePath('lang')
        // }))
    }
    /**
     * Determine if the given abstract type has been bound.
     *
     * @param  {string}  abstract
     * @return {boolean}
     */
    bound(abstract) {
        return this.isDeferredService(abstract) || super.bound(abstract);
    }
    /**
     * Get the path to the application configuration files.
     *
     * @param  {string}  path
     * @return {string}
     */
    configPath(path = '') {
        return this.basePathProperty + path_1.sep + 'config' + (path !== '' ? path_1.sep + path : '');
    }
    /**
     * Determine if the given service is a deferred service.
     *
     * @param  {string}  service
     * @return {boolean}
     */
    isDeferredService(service) {
        return !(0, utils_1.isNil)(this.deferredServices[service]);
    }
    /**
     * Resolve the given type from the container.
     *
     * @param  {string|Function}  abstract
     * @param  {array}  parameters
     * @return {any}
     *
     * @throws {\Illuminate\Contracts\Container\BindingResolutionException}
     */
    make(abstract, parameters = []) {
        return this.resolve(abstract, parameters);
    }
    /**
     * Get the path to the application "app" directory.
     *
     * @param  {string}  path
     * @return {string}
     */
    path(path = '') {
        const appPath = this.appPath ?? this.basePathProperty + path_1.sep + 'app';
        return appPath + (path !== '' ? path_1.sep + path : '');
    }
    /**
   * Register the core class aliases in the container.
   *
   * @return {void}
   */
    registerCoreContainerAliases() {
        const aliases = {
            app: { abstract: Application },
            config: { abstract: Repository_1.Repository },
            db: {
                abstract: DatabaseManager_1.DatabaseManager,
                dependencies: [this.constructor, ConnectionFactory_1.ConnectionFactory]
            },
            events: { abstract: Dispatcher_1.Dispatcher }
        };
        for (const [alias, { abstract, dependencies }] of Object.entries(aliases)) {
            this.alias(alias, abstract, dependencies);
        }
        // this.aliases.set('app', Application)
        // this.aliases.set('config', Config)
        // this.aliases.set('db', Database)
        // this.aliases.set('events', Events)
        // this.aliases.set('files', Filesystem)
        // this.aliases.set('log', Log)
        // this.aliases.set('request', Request)
        // this.aliases.set('router', Router)
        // this.aliases.set('session', Session)
        // this.aliases.set('view', View)
    }
    /**
     * Set the base path for the application.
     *
     * @param  {string}  basePath
     * @return {this}
     */
    setBasePath(basePath) {
        this.basePathProperty = basePath.replace(/\//, '');
        this.bindPathsInContainer();
        return this;
    }
}
exports.Application = Application;
//# sourceMappingURL=Application.js.map