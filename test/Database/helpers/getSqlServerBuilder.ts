import { Builder } from '../../../src/Illuminate/Database/Query'
import { Processor } from '../../../src/Illuminate/Database/Query/Processors'
import { SqlServerGrammar } from '../../../src/Illuminate/Database/Query/Grammars/SqlServerGrammar'
import { getConnection } from './getConnection'

export const getSqlServerBuilder = () => {
  const grammar = new SqlServerGrammar()
  const processor = new Processor()

  return new Builder(getConnection(), grammar, processor)
}
