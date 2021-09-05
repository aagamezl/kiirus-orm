export const StaticProxy = (facade) => {
  return new Proxy(facade, {
    get (target, method, receiver) {
      if (method in receiver) {
      // if (Reflect.has(target, method)) {
        // return target[method]
        return Reflect.get(receiver, method)
      } else {
        // return (...args) => {
        //   return Reflect.apply(target[propKey], target, args)
        // }
        // const instance = target.getFacadeRoot()

        return (...args) => {
          return receiver.callStatic(method, ...args)
          // const instance = target.getFacadeRoot()

          // if (!instance) {
          //   throw new Error('RuntimeException: A facade root has not been set.')
          // }

          // return instance[method](...args)
          // return instance[method]
        }
      }
    }
  })
}
