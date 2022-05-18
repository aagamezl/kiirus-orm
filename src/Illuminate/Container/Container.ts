import { isNil } from '@devnetic/utils'

export interface ArrayAccess {
  [key: string]: any
}

export interface Container extends ArrayAccess { }

export class Container {
  /**
   * The registered aliases keyed by the abstract name.
   *
   * @var Record<string, any>
   */
  protected abstractAliases: Record<string, any> = {}

  /**
   * The registered type aliases.
   *
   * @var Record<string, any>
   */
  protected aliases: Record<string, any> = {}

  /**
   * The container's bindings.
   *
   * @var Record<string, string>
   */
  protected bindings: Record<string, string> = {}

  /**
   * The container's shared instances.
   *
   * @var Record<string, string>
   */
  protected instances: Record<string, unknown> = {}

  /**
   * All of the registered rebound callbacks.
   *
   * @var Record<string, unknown>
   */
  protected reboundCallbacks: Record<string, any> = {}

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
  public alias (alias: string, abstract: any, dependencies: object[] = []): void {
    if (alias === abstract) {
      throw new Error(`LogicException: [${alias}] is aliased to itself.`)
    }

    this.aliases[alias] = { abstract, dependencies }

    if (!Array.isArray(this.abstractAliases[abstract])) {
      this.abstractAliases[alias] = []
    }

    this.abstractAliases[alias].push({ abstract, dependencies })
  }

  /**
   * Determine if the given abstract type has been bound.
   *
   * @param  {string}  abstract
   * @return {boolean}
   */
  public bound (abstract: string): boolean {
    return !isNil(this.bindings[abstract]) ||
      !isNil(this.instances[abstract]) ||
      this.isAlias(abstract)
  }

  /**
   * Get the alias for an abstract if available.
   *
   * @param  {string}  abstract
   * @return {string}
   */
  public getAlias (abstract: string): string {
    return !isNil(this.aliases[abstract])
      ? this.getAlias(this.aliases[abstract]) // TODO: verify the recursion and aliases type
      : abstract
  }

  protected getParameters (dependencies: unknown[]): unknown[] {
    return dependencies.map((dependency: any) => {
      return Reflect.construct(dependency, [])
    })
  }

  /**
   * Get the rebound callbacks for a given type.
   *
   * @param  {string}  abstract
   * @return {Record<string, any>}
   */
  protected getReboundCallbacks (abstract: string): Record<string, any> {
    return this.reboundCallbacks[abstract] ?? {}
  }

  /**
   * Register an existing instance as shared in the container.
   *
   * @param  {string}  abstract
   * @param  {unknown}  instance
   * @return {any}
   */
  public instance (abstract: string, instance: unknown): any {
    this.removeAbstractAlias(abstract)

    const isBound = this.bound(abstract)

    delete this.aliases[abstract] // eslint-disable-line

    // We'll check to determine if this type has been bound before, and if it has
    // we will fire the rebound callbacks registered with the container and it
    // can be updated with consuming classes that have gotten resolved here.
    this.instances[abstract] = instance

    if (isBound) {
      this.rebound(abstract)
    }

    return instance
  }

  /**
   * Determine if a given string is an alias.
   *
   * @param  {string}  name
   * @return {boolean}
   */
  public isAlias (name: string): boolean {
    return !isNil(this.aliases[name])
  }

  /**
   * Determine if the given abstract is buildable.
   *
   * @param  {unknown}  abstract
   * @return {boolean}
   */
  protected isBuildable (abstract: unknown): boolean {
    return abstract instanceof Function
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
  public make (abstract: string | Function, parameters: unknown[] = []): any {
    return this.resolve(abstract, parameters)
  }

  /**
   * Fire the "rebound" callbacks for the given abstract type.
   *
   * @param  {string}  abstract
   * @return {void}
   */
  protected rebound (abstract: string): void {
    const instance = this.make(abstract)

    for (const callbackFunction of Object.values(this.getReboundCallbacks(abstract))) {
      callbackFunction(this, instance)
    }
  }

  /**
 * Remove an alias from the contextual binding alias cache.
 *
 * @param  {string}  searched
 * @return {void}
 */
  protected removeAbstractAlias (searched: string): void {
    if (isNil(this.aliases[searched])) {
      return
    }

    for (const [abstract, aliases] of Object.entries(this.abstractAliases)) {
      for (const [index, alias] of Object.entries(aliases)) {
        if (alias === searched) {
          delete this.abstractAliases[abstract][index]  // eslint-disable-line
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
  protected resolve (abstract: any, parameters: unknown[] = [], raiseEvents: boolean = true): any {
    abstract = this.getAlias(abstract)

    if (this.isBuildable(abstract.abstract)) {
      return Reflect.construct(
        abstract.abstract,
        [...parameters, ...this.getParameters(abstract.dependencies)]
      )
    } else {
      return abstract
    }
  }
}
