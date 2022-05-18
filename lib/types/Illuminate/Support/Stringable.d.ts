import { Conditionable } from '../Conditionable/Traits/Conditionable';
import { Macroable } from '../Macroable/Traits/Macroable';
import { Tappable } from './Traits/Tappable';
export interface Stringable extends Conditionable, Macroable, Tappable {
}
export declare class Stringable {
    /**
   * The underlying string value.
   *
   * @var string
   */
    protected value: string;
    constructor(value: string);
}
