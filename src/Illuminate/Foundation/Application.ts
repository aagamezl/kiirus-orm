import { sep as DIRECTORY_SEPARATOR } from 'path'

import { isNil } from '@devnetic/utils'

import { ConnectionFactory } from '../Database/Connectors/ConnectionFactory'
import { Container } from './../Container/Container'
import { DatabaseManager } from './../Database/DatabaseManager'
import { Repository } from './../Config/Repository'
import { Dispatcher } from './../Events/Dispatcher'
// import { isDirectory } from '../Support/helpers'
// import { value } from '../Collections/helpers'

export class Application extends Container {
  /**
   * The custom application path defined by the developer.
   *
   * @var string
   */
  protected appPath: string = ''

  /**
   * The base path for the Laravel installation.
   *
   * @var string
   */
  protected basePathProperty: string = ''

  /**
   * The deferred services and their providers.
   *
   * @var array
   */
  protected deferredServices: Record<string, string> = {}

  /**
   * The custom language file path defined by the developer.
   *
   * @var string
   */
  protected langPath: string = ''

  /**
   * Create a new Illuminate application instance.
   *
   * @param  {string|undefined}  basePath
   * @return {void}
   */
  public constructor (basePath?: string) {
    super()

    if (basePath !== undefined) {
      this.setBasePath(basePath)
    }

    this.registerCoreContainerAliases()

    return new Proxy(this, {
      get: (target: Application, key: string, receiver: Application) => {
        if (key in target) {
          return target[key]
        }

        return receiver.make(target.getAlias(key))
      }
    })
  }

  /**
   * Get the base path of the Laravel installation.
   *
   * @param  {string}  path
   * @return {string}
   */
  public basePath (path: string = ''): string {
    return this.basePathProperty + (path !== '' ? DIRECTORY_SEPARATOR + path : '')
  }

  /**
   * Bind all of the application paths in the container.
   *
   * @return void
   */
  protected bindPathsInContainer (): void {
    this.instance('path', this.path())
    this.instance('path.base', this.basePath())
    this.instance('path.config', this.configPath())
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
  public bound (abstract: string): boolean {
    return this.isDeferredService(abstract) || super.bound(abstract)
  }

  /**
   * Get the path to the application configuration files.
   *
   * @param  {string}  path
   * @return {string}
   */
  public configPath (path: string = ''): string {
    return this.basePathProperty + DIRECTORY_SEPARATOR + 'config' + (path !== '' ? DIRECTORY_SEPARATOR + path : '')
  }

  /**
   * Determine if the given service is a deferred service.
   *
   * @param  {string}  service
   * @return {boolean}
   */
  public isDeferredService (service: string): boolean {
    return !isNil(this.deferredServices[service])
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
  public make (abstract: string | Function, parameters: unknown[] = []): any {
    return this.resolve(abstract, parameters)
  }

  /**
   * Get the path to the application "app" directory.
   *
   * @param  {string}  path
   * @return {string}
   */
  public path (path: string = ''): string {
    const appPath = this.appPath ?? this.basePathProperty + DIRECTORY_SEPARATOR + 'app'

    return appPath + (path !== '' ? DIRECTORY_SEPARATOR + path : '')
  }

  /**
 * Register the core class aliases in the container.
 *
 * @return {void}
 */
  public registerCoreContainerAliases (): void {
    const aliases: Record<string, { abstract: object, dependencies?: any[] }> = {
      app: { abstract: Application },
      config: { abstract: Repository },
      db: {
        abstract: DatabaseManager,
        dependencies: [this.constructor, ConnectionFactory]
      },
      events: { abstract: Dispatcher }
    }

    for (const [alias, { abstract, dependencies }] of Object.entries(aliases)) {
      this.alias(alias, abstract, dependencies)
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
  public setBasePath (basePath: string): this {
    this.basePathProperty = basePath.replace(/\//, '')

    this.bindPathsInContainer()

    return this
  }

  /**
   * Set the language file directory.
   *
   * @param  {string}  path
   * @return {this}
   */
  // public useLangPath (path: string): this {
  //   this.langPath = path

  //   this.instance('path.lang', path)

  //   return this
  // }
}
