export const instanceProxy = (instance: object, handler?: object): ProxyConstructor => {
  const proxyHandler = handler ?? {
    get (target: object, property: string, receiver: any) {
      if (Reflect.has(target, property)) {
        return Reflect.get(target, property)
      }

      return (...args: any[]) => {
        return receiver.__call(property, ...args)
      }
    },
    getPrototypeOf (target: object) {
      return Object.getPrototypeOf(target)
    }
  }

  return new Proxy(instance, proxyHandler) as any
}
