import { Facade } from './Facade'

export class Schema extends Facade {
  /**
   * Get a schema builder instance for a connection.
   *
   * @param  {string|undefined}  name
   * @return {\Illuminate\Database\Schema\Builder}
   */
  connection (name) {
    return this.resolvedInstance.db.connection(name).getSchemaBuilder()
  }

  /**
   * Get a schema builder instance for the default connection.
   *
   * @return {\Illuminate\Database\Schema\Builder}
   */
  static getFacadeAccessor () {
    return this.resolveFacadeInstance('db').connection().getSchemaBuilder()
  }
}
