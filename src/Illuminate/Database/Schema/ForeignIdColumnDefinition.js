import { ColumnDefinition } from './ColumnDefinition'
import { Str } from './../../Support'

export class ForeignIdColumnDefinition extends ColumnDefinition {
  /**
   * Create a new foreign ID column definition.
   *
   * @param  {\Illuminate\Database\Schema\Blueprint}  blueprint
   * @param  {Array}  attributes
   * @return {void}
   */
  constructor (blueprint, attributes = []) {
    super(attributes)

    /**
     * The schema builder blueprint instance.
     *
     * @member {\Illuminate\Database\Schema\Blueprint}
     */
    this.blueprint = blueprint
  }

  /**
   * Create a foreign key constraint on this column referencing the "id" column of the conventionally related table.
   *
   * @param  {string|undefined}  table
   * @param  {string}  column
   * @return {\Illuminate\Database\Schema\ForeignKeyDefinition}
   */
  constrained (table = undefined, column = 'id') {
    return this.references(column).set('on', table ?? Str.plural(Str.beforeLast(this.get('name'), `_${column}`)))
  }

  /**
   * Specify which column this foreign ID references on another table.
   *
   * @param  {string}  column
   * @return {\Illuminate\Database\Schema\ForeignKeyDefinition}
   */
  references (column) {
    return this.blueprint.foreign(this.get('name')).set('references', column)
  }
}
