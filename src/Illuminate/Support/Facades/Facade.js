import { throwException } from './../helpers'

export class Facade {
  constructor () {
    if (new.target === this) {
      throwException('abstract')
    }
  }

  /**
   * Get the registered name of the component.
   *
   * @return {string}
   *
   * @throws \RuntimeException
   */
  static getFacadeAccessor () {
    throw new Error('RuntimeException": Facade does not implement getFacadeAccessor method.')
  }
}
