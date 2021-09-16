import { ConnectionFactory } from './../Database/Connectors/ConnectionFactory'
import { Container } from './../Container/Container'
import { DatabaseManager } from './../Database/DatabaseManager'
import { Repository } from './../Config/Repository'

export class Application extends Container {
  /**
   * Create a new Illuminate application instance.
   *
   * @param  string|null  basePath
   * @return void
   */
  constructor (basePath = undefined) {
    super()

    this.registerCoreContainerAliases()

    return new Proxy(this, {
      get: (target, key, receiver) => {
        if (key in target) {
          return target[key]
        }

        return receiver.make(target.getAlias(key))
      }
    })
  }

  /**
 * Register the core class aliases in the container.
 *
 * @return void
 */
  registerCoreContainerAliases () {
    const aliases = {
      app: { abstract: Application },
      config: { abstract: Repository },
      db: {
        abstract: DatabaseManager,
        dependencies: [this.constructor, ConnectionFactory]
      }
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
}
