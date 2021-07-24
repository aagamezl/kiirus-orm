export class Facade {
  constructor () {
    if (new.target === this) {
      throw new Error(`${new.target.name} cannot be instantiated directly`)
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
