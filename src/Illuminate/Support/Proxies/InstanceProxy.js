export const instanceProxy = (instance, handler) => {
  const proxyHandler = handler ?? {
    get (target, property, receiver) {
      if (Reflect.has(target, property)) {
        return Reflect.get(target, property)
      }

      return (...args) => {
        return receiver.call(property, ...args)
      }
    }
  }

  return new Proxy(instance, proxyHandler)
}
