// export const use = <T>(targetToApply: T, ...traits: object[]): T => {
//   // if (traits.length === 0) {
//   //   return targetToApply
//   // }

//   return Object.assign(Object.getPrototypeOf(targetToApply), ...traits)
// }

interface TraitAlias {
  [key: string]: string
}

// export interface Trait {
//   trait: Function
//   as?: TraitAlias
// }

type Trait = [Function, TraitAlias] | Function

// export const use = <T>(derivedCtor: T, constructors: any[]): void => {
export const use = <T>(derivedCtor: T, constructors: Trait[]): void => {
  // constructors.forEach(({ trait: baseCtor, as }) => {
  constructors.forEach((trait) => {
    const [baseCtor, alias] = typeof trait === 'function' ? [trait, {}] : trait

    Object.getOwnPropertyNames(baseCtor.prototype).filter(name => name !== 'constructor').forEach((name) => {
      Object.defineProperty(
        (derivedCtor as any).prototype,
        alias[name] ?? name,
        Object.getOwnPropertyDescriptor(baseCtor.prototype, name) ??
        Object.create(null)
      )
    })
  })
}
