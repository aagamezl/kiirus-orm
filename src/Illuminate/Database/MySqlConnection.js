import { Connection } from './Connection'
import { MySqlDriver } from './../Database/PDO/MySqlDriver'
import { MySqlGrammar as QueryGrammar } from './../Database/Query/Grammars'
import { MySqlGrammar as SchemaGrammar } from './Schema/Grammars/MySqlGrammar'

export class MySqlConnection extends Connection {
  /**
   * Get the default query grammar instance.
   *
   * @return {\Illuminate\Database\Query\Grammars\MySqlGrammar}
   */
  getDefaultQueryGrammar () {
    return this.withTablePrefix(new QueryGrammar())
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
   * @return {\Illuminate\Database\PDO\MySqlDriver}
   */
  getDoctrineDriver () {
    return new MySqlDriver()
  }
}
