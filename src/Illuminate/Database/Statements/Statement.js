import { throwException } from './../../Support'

export class Statement {
  /**
   * Creates an instance of Statement.
   * @param {object} connection
   * @param {string} query
   * @memberof Statement
   */
  constructor (connection, query) {
    this.bindings = {}
    this.connection = connection
    this.query = query
    this.result = undefined
    this.rowCountProperty = 0
  }

  /**
   *
   * @param {string|number} param
   * @param {*} value
   * @return boolean
   */
  bindValue (param, value) {
    try {
      this.bindings[param] = value

      return true
    } catch (error) {
      return false
    }
  }

  parameterize () {
    throwException('concrete-method', 'parameterize')
  }

  rowCount () {
    throwException('concrete-method', 'rowCount')
  }
}
