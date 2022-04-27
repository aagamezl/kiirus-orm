import { crc32, decimalToHex, isNil } from '@devnetic/utils'

export class AbstractAsset {
  constructor () {
    this.name = ''

    /**
     * Namespace of the asset. If none isset the default namespace is assumed.
     */
    this.namespace = undefined

    this.quoted = false
  }

  /**
   * Generates an identifier from a list of column names obeying a certain string length.
   *
   * This is especially important for Oracle, since it does not allow identifiers larger than 30 chars,
   * however building idents automatically for foreign keys, composite keys or such can easily create
   * very long names.
   *
   * @param {array<int, string>} columnNames
   * @param {string} [prefix = '']
   * @param {number} [maxLength = 30]
   * @return {string}
   */
  generateIdentifierName (columnNames, prefix = '', maxSize = 30) {
    const hash = columnNames.map((column) => {
      return decimalToHex(crc32(column))
    }).join('')

    return `${prefix}_${hash}`.substring(0, maxSize).toUpperCase()
  }

  /**
   * Returns the name of this schema asset.
   *
   * @returns {string}
   */
  getName () {
    if (this.namespace !== undefined) {
      return `${this.namespace}.${this.name}`
    }

    return this.name
  }

  /**
   * Gets the namespace name of this asset.
   *
   * If NULL is returned this means the default namespace is used.
   *
   * @return {string|undefined}
   */
  getNamespaceName () {
    return this.namespace
  }

  /**
   * Gets the quoted representation of this asset but only if it was defined with one. Otherwise
   * return the plain unquoted value as inserted.
   *
   * @param {AbstractPlatform} platform
   * @return {string}
   */
  getQuotedName (platform) {
    const keywords = platform.getReservedKeywordsList()
    const parts = this.getName().split('.')

    for (const [key, value] of Object.entries(parts)) {
      parts[key] = this.quoted || keywords.isKeyword(value) ? platform.quoteIdentifier(value) : value
    }

    return parts.join('.')
  }

  /**
   * The shortest name is stripped of the default namespace. All other
   * namespaced elements are returned as full-qualified names.
   *
   * @param {string} defaultNamespaceName
   * @return {string}
   */
  getShortestName (defaultNamespaceName) {
    let shortestName = this.getName()

    if (this.namespace === defaultNamespaceName) {
      shortestName = this.name
    }

    return shortestName.toLowerCase()
  }

  /**
   * Checks if this identifier is quoted.
   *
   * @param {string} identifier
   * @return {boolean}
   */
  isIdentifierQuoted (identifier) {
    return !isNil(identifier[0]) &&
      (identifier[0] === '`' || identifier[0] === '"' || identifier[0] === '[')
  }

  /**
   * Is this asset in the default namespace?
   *
   * @param {string} defaultNamespaceName
   * @return {boolean}
   */
  isInDefaultNamespace (defaultNamespaceName) {
    return this.namespace === defaultNamespaceName || this.namespace === undefined
  }

  /**
   * Checks if this asset's name is quoted.
   *
   * @return {boolean}
   */
  isQuoted () {
    return this.quoted
  }

  /**
   * Sets the name of this asset.
   *
   * @param {string} name
   * @return {void}
   */
  setName (name) {
    if (this.isIdentifierQuoted(name)) {
      this.quoted = true
      name = this.trimQuotes(name)
    }

    if (name.includes('.')) {
      const parts = name.split('.')

      this.namespace = parts[0]
      name = parts[1]
    }

    this.name = name
  }

  /**
   * Trim quotes from the identifier.
   *
   * @param {string} identifier
   * @return {string}
   */
  trimQuotes (identifier) {
    return identifier.replace(/[`"[\]]/g, '')
  }
}
