const test = require('ava')

const { mock } = require('../tools/mock')

const { Connection } = require('./../../lib/Illuminate/Database/Connection')
const { Builder } = require('./../../lib/Illuminate/Database/Query/Builder')
const { Processor } = require('../../lib/Illuminate/Database/Query/Processors/Processor')

test('testInsertGetIdProcessing', async (t) => {
  const { createMock, verifyMock } = mock()

  const ndo = new ProcessorTestNDOStub()
  const ndoMock = createMock(ndo)
  ndoMock.expects('lastInsertId').once().withArgs('id').returns('1')

  const connection = new Connection()
  const connectionMock = createMock(connection)
  connectionMock.expects('insert').once().withArgs('sql', ['foo'])
  connectionMock.expects('getNdo').once().returns(ndo)

  const builder = new Builder(connection)
  const builderMock = createMock(builder)
  builderMock.expects('getConnection').twice().returns(connection)

  const processor = new Processor()
  const result = await processor.processInsertGetId(builder, 'sql', ['foo'], 'id')

  t.is(1, result)

  verifyMock()
})

class ProcessorTestNDOStub {
  lastInsertId (sequence = undefined) {
  }
}
