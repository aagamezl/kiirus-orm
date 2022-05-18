interface TraitAlias {
    [key: string]: string;
}
declare type Trait = [Function, TraitAlias] | Function;
export declare const use: <T>(derivedCtor: T, constructors: Trait[]) => void;
export {};
