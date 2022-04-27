import { AbstractAsset } from './AbstractAsset'

export class Identifier extends AbstractAsset {
  /**
   * @param {string} {identifier} Identifier name to wrap.
   * @param {boolean}   {quote}      Whether to force quoting the given identifier.
   */
  constructor (identifier, quote = false) {
    super()

    this.setName(identifier)

    if (!quote || this.quoted) {
      return
    }

    this.setName(`"${this.getName()}"`)
  }
}
