import { Builder } from '../../../src/Illuminate/Database/Query'
import { PostgresGrammar } from '../../../src/Illuminate/Database/Query/Grammars/PostgresGrammar'
import { Processor } from '../../../src/Illuminate/Database/Query/Processors'
import { getConnection } from './getConnection'

export const getPostgresBuilder = () => {
  const grammar = new PostgresGrammar()
  const processor = new Processor()

  return new Builder(getConnection(), grammar, processor)
}
