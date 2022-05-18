import { Builder } from '../../../src/Illuminate/Database/Query'
import { PostgresGrammar } from '../../../src/Illuminate/Database/Query/Grammars/PostgresGrammar'
import { PostgresProcessor } from '../../../src/Illuminate/Database/Query/Processors/PostgresProcessor'

import { getConnection } from './getConnection'

export const getPostgresBuilderWithProcessor = () => {
  const grammar = new PostgresGrammar()
  const processor = new PostgresProcessor()

  return new Builder(getConnection(), grammar, processor)
}
