import { Builder } from '../../../src/Illuminate/Database/Query'
import { Grammar } from '../../../src/Illuminate/Database/Query/Grammars'
import { Processor } from '../../../src/Illuminate/Database/Query/Processors'

import { getConnection } from './getConnection'

/**
 * Return a Builder instance
 *
 * @return Builder
 */
export const getBuilder = () => {
  const grammar = new Grammar()
  const processor = new Processor()

  return new Builder(getConnection(), grammar, processor)
}
