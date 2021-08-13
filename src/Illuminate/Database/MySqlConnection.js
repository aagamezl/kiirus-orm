import { Connection } from './Connection'
import { MySqlGrammar as QueryGrammar } from './../Database/Query/Grammars'

export class MySqlConnection extends Connection {
  /**
   * Get the default query grammar instance.
   *
   * @return {\Illuminate\Database\Query\Grammars\MySqlGrammar}
   */
  getDefaultQueryGrammar () {
    return this.withTablePrefix(new QueryGrammar())
  }
}
