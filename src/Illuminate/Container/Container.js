// import { isEmpty, isNil, last, merge } from 'lodash'

// import { isSubclassOf } from './../Support'

export class Container {
  constructor () {
    /**
     * The registered type aliases.
     *
     * @member string[]
     */
    this.aliases = new Map()

    /**
     * The registered aliases keyed by the abstract name.
     *
     * @member Array[]
     */
    this.abstractAliases = new Map()
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
  alias (alias, abstract, dependencies = []) {
    if (alias === abstract) {
      throw new Error(`LogicException: [${alias}] is aliased to itself.`)
    }

    this.aliases.set(alias, { abstract, dependencies })

    if (!Array.isArray(this.abstractAliases[abstract])) {
      this.abstractAliases.set(alias, [])
    }

    this.abstractAliases.get(alias).push({ abstract, dependencies })
  }

  /**
   * Get the alias for an abstract if available.
   *
   * @param  {string}  alias
   * @return {string}
   */
  // getAlias (alias) {
  //   return this.aliases.get(alias)
  // }
  getAlias (abstract) {
    return this.aliases.get(abstract)
      ? this.getAlias(this.aliases.get(abstract))
      : abstract
  }

  getParameters (dependencies) {
    return dependencies.map(dependency => {
      return Reflect.construct(dependency, [])
    })
  }

  /**
   * Determine if the given abstract is buildable.
   *
   * @param  {string}  abstract
   * @return {boolean}
   */
  isBuildable (abstract) {
    return abstract instanceof Function
  }

  /**
   * Resolve the given type from the container.
   *
   * @param  {string|Function}  abstract
   * @param  {array}  parameters
   * @return {*}
   *
   * @throws {\Illuminate\Contracts\Container\BindingResolutionException}
   */
  make (abstract, parameters = []) {
    return this.resolve(abstract, parameters)
  }

  /**
 * Resolve the given type from the container.
 *
 * @param  {string|callable}  abstract
 * @param  {Array}  parameters
 * @param  {boolean}  raiseEvents
 * @return {*}
 *
 * @throws {\Illuminate\Contracts\Container\BindingResolutionException}
 * @throws {\Illuminate\Contracts\Container\CircularDependencyException}
 */
  resolve (abstract, parameters = [], raiseEvents = true) {
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
