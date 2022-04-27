import sinon from 'sinon'

export const mock = () => {
  const mocks = []

  return {
    createMock: (target) => {
      const newMock = sinon.mock(target)

      mocks.push(newMock)

      return newMock
    },
    verifyMock: () => {
      mocks.forEach((mock) => {
        mock.verify()
      })
    }
  }
}

// module.exports = {
//   // autoVerify,
//   // createMock
//   mock
// }
