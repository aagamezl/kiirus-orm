const sinon = require('sinon')

const mocks = []

const autoVerify = () => {
  mocks.forEach((mock) => {
    mock.verify()
    mock.restore()
  })
}

const createMock = (target) => {
  const newMock = sinon.mock(target)

  mocks.push(newMock)

  return newMock
}

module.exports = {
  autoVerify,
  createMock
}
