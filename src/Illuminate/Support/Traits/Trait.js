export const use = (targetToApply, ...traits) => {
  const callMethod = '__call'

  if (traits.length === 0) {
    return targetToApply
  }

  traits.forEach(trait => {
    Object.setPrototypeOf(targetToApply, Object.assign(
      Object.getPrototypeOf(targetToApply),
      trait
    ))
  })

  // If the target don't has a __call method, we will return the original target
  if (!Object.getOwnPropertyNames(Object.getPrototypeOf(targetToApply)).includes(callMethod)) {
    return targetToApply
  }

  const handler = {
    get (target, method, receiver) {
      if (Reflect.has(target, method)) {
        return target[method]
      }

      if (Reflect.has(target, callMethod)) {
        return target.__call(target, method, receiver)
      }
    }
  }

  return new Proxy(targetToApply, handler)
}
