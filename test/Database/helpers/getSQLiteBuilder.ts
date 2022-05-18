import { Builder } from '../../../src/Illuminate/Database/Query'
import { Processor } from '../../../src/Illuminate/Database/Query/Processors'
import { SQLiteGrammar } from '../../../src/Illuminate/Database/Query/Grammars/SQLiteGrammar'
import { getConnection } from './getConnection'

export const getSQLiteBuilder = () => {
  const grammar = new SQLiteGrammar()
  const processor = new Processor()

  return new Builder(getConnection(), grammar, processor)
}
