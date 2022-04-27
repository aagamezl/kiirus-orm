import { Connection } from './Connection'
import { SqlServerDriver } from './../Database/PDO/SqlServerDriver'
import { SqlServerGrammar as SchemaGrammar } from './Schema/Grammars/SqlServerGrammar'

export class SqlServerConnection extends Connection {
  /**
   * Compile the command to disable foreign key constraints.
   *
   * @return {string}
   */
  compileDisableForeignKeyConstraints () {
    return 'EXEC sp_msforeachtable "ALTER TABLE ? NOCHECK CONSTRAINT all";'
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
   * @return {\Illuminate\Database\PDO\SqlServerDriver}
   */
  getDoctrineDriver () {
    return new SqlServerDriver()
  }
}
