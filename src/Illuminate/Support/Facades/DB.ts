import { Facade } from './Facade'

// eslint-disable-next-line
export class DB extends Facade {
  /**
   * Get the registered name of the component.
   *
   * @return {string}
   */
  protected static getFacadeAccessor (): string {
    return 'db'
  }
}
