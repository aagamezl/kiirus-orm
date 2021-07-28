import { throwException } from './../../Support'

export class Statement {
  /**
   * Creates an instance of Statement.
   * @param {object} connection
   * @param {string} query
   * @memberof Statement
   */
  // constructor (connection, query) {
  constructor (dsn, username, password, options) {
    this.bindings = {}
    // this.connection = connection
    // this.query = query

    this.dsn = dsn
    this.fetchMode = undefined
    this.username = username
    this.password = password
    this.options = options

    this.result = undefined
    this.rowCountProperty = 0
    this.statement = undefined
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

  setFetchMode (mode) {
    this.fetchMode = mode
  }
}
