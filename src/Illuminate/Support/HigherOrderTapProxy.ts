export class HigherOrderTapProxy {
  /**
   * The target being tapped.
   *
   * @member any
   */
  public subject: object;

  /**
   * Create a new tap proxy instance.
   *
   * @param  {object}  subject
   * @returns {void}
   */
  public constructor(subject: object) {
    this.subject = subject;

    const handler = {
      get: (target: object, method: PropertyKey) => {
        const property = Reflect.get(target, method);

        if (property instanceof Function) {
          return (...parameters: Array<unknown>) => {
            property(...parameters);

            return target;
          };
        }

        return property;
      },
    };

    const proxy = new Proxy(subject, handler);

    // It's necessary to return the new created proxy
    return Object.setPrototypeOf(proxy, new.target.prototype); // eslint-disable-line
  }
}
