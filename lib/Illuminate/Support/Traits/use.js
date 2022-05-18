"use strict";
// export const use = <T>(targetToApply: T, ...traits: object[]): T => {
//   // if (traits.length === 0) {
//   //   return targetToApply
//   // }
Object.defineProperty(exports, "__esModule", { value: true });
exports.use = void 0;
// export const use = <T>(derivedCtor: T, constructors: any[]): void => {
const use = (derivedCtor, constructors) => {
    // constructors.forEach(({ trait: baseCtor, as }) => {
    constructors.forEach((trait) => {
        const [baseCtor, alias] = typeof trait === 'function' ? [trait, {}] : trait;
        Object.getOwnPropertyNames(baseCtor.prototype).filter(name => name !== 'constructor').forEach((name) => {
            Object.defineProperty(derivedCtor.prototype, alias[name] ?? name, Object.getOwnPropertyDescriptor(baseCtor.prototype, name) ??
                Object.create(null));
        });
    });
};
exports.use = use;
//# sourceMappingURL=use.js.map