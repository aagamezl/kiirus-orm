import { Builder } from '../../../src/Illuminate/Database/Query'
import { MySqlGrammar } from '../../../src/Illuminate/Database/Query/Grammars/MySqlGrammar'
import { Processor } from '../../../src/Illuminate/Database/Query/Processors'
import { getConnection } from './getConnection'

export const getMySqlBuilder = () => {
  const grammar = new MySqlGrammar()
  const processor = new Processor()

  return new Builder(getConnection(), grammar, processor)
}
