import { SQLiteDriver } from './../Database/PDO/SQLiteDriver'
import { Connection } from './Connection'
import { SQLiteGrammar as SchemaGrammar } from './Schema/Grammars/SQLiteGrammar'

export class SQLiteConnection extends Connection {
  constructor (ndo, database = '', tablePrefix = '', config = {}) {
    super(ndo, database, tablePrefix, config)

    const enableForeignKeyConstraints = this.getForeignKeyConstraintsConfigurationValue()

    if (enableForeignKeyConstraints === undefined) {
      return
    }

    enableForeignKeyConstraints
      ? this.getSchemaBuilder().enableForeignKeyConstraints()
      : this.getSchemaBuilder().disableForeignKeyConstraints()
  }

  /**
   * Get the default schema grammar instance.
   *
   * @return {\Illuminate\Database\Schema\Grammars\SQLiteGrammar}
   */
  getDefaultSchemaGrammar () {
    return this.withTablePrefix(new SchemaGrammar())
  }

  /**
   * Get the Doctrine DBAL driver.
   *
   * @return {\Illuminate\Database\PDO\SQLiteDriver}
   */
  getDoctrineDriver () {
    return new SQLiteDriver()
  }

  /**
   * Get the database connection foreign key constraints configuration option.
   *
   * @return {boolean|undefined}
   */
  getForeignKeyConstraintsConfigurationValue () {
    return this.getConfig('foreign_key_constraints')
  }
}
