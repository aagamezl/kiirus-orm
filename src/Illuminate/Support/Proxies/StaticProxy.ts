export const StaticProxy = (facade: any): ProxyConstructor => {
  return new Proxy(facade, {
    get (target: Record<string, any>, method: string, receiver: Record<string, any>) {
      if (Reflect.has(target, method)) {
        return target[method]
      } else {
        return (...args: any[]) => {
          return receiver.__callStatic(method, ...args)
        }
      }
    }
  })
}
