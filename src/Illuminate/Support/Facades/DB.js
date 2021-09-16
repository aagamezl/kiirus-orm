import { Facade } from './Facade'

export class DB extends Facade {
  /**
   * Get the registered name of the component.
   *
   * @return {string}
   */
  static getFacadeAccessor () {
    return 'db'
  }
}
