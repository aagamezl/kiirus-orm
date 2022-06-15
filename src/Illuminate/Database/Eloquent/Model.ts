import { capitalize } from '@devnetic/utils'

export class Model {
  /**
 * The connection name for the model.
 *
 * @var string|undefined
 */
  protected connection?: string

  /**
   * Apply the given named scope if possible.
   *
   * @param  {string}  scope
   * @param  {any[]}  parameters
   * @return {any}
   */
  public callNamedScope (scope: string, parameters: any[] = []): any {
    const method = 'scope' + capitalize(scope)

    // return this[method as keyof Model](...parameters)
    return Reflect.apply(this as any, method, parameters)
  }

  /**
   * Determine if the model has a given scope.
   *
   * @param  {string}  scope
   * @return {boolean}
   */
  public hasNamedScope (scope: string): boolean {
    return Reflect.has(this, 'scope' + capitalize(scope))
  }
}
