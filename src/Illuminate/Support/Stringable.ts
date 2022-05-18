import { Conditionable } from '../Conditionable/Traits/Conditionable'
import { Macroable } from '../Macroable/Traits/Macroable'
import { Tappable } from './Traits/Tappable'
import { use } from './Traits/use'

export interface Stringable extends Conditionable, Macroable, Tappable { }

export class Stringable {
  /**
 * The underlying string value.
 *
 * @var string
 */
  protected value: string

  constructor (value: string) {
    use(this.constructor, [Conditionable, Macroable, Tappable])

    this.value = value
  }
}
