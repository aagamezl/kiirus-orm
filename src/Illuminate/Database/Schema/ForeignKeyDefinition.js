import { Fluent } from './../../Support/Fluent'

export class ForeignKeyDefinition extends Fluent {
  /**
   * Indicate that updates should cascade.
   *
   * @return {this}
   */
  cascadeOnUpdate () {
    return this.set('onUpdate', 'cascade')
  }

  /**
   * Indicate that deletes should cascade.
   *
   * @return {this}
   */
  cascadeOnDelete () {
    return this.set('onDelete', 'cascade')
  }

  /**
   * Indicate that deletes should be restricted.
   *
   * @return {this}
   */
  restrictOnDelete () {
    return this.set('onDelete', 'restrict')
  }

  /**
   * Indicate that deletes should set the foreign key value to null.
   *
   * @return {this}
   */
  nullOnDelete () {
    return this.set('onDelete', 'set null')
  }
}
