export class Scope {
  constructor () {
    if (new.target === Scope) {
      throw new Error('Cannot construct Abstract instances directly')
    }
  }

  /**
   * Apply the scope to a given Eloquent query builder.
   *
   * @param  {\Illuminate\Database\Eloquent\Builder}  builder
   * @param  {\Illuminate\Database\Eloquent\Model}  model
   * @return void
   */
  apply (builder, model) { }
}
