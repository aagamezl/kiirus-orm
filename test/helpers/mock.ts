import sinon from 'sinon'

export interface Mock {
  createMock: <T>(target: T) => sinon.SinonMock
  verifyMock: () => void
}

export const mock = (): Mock => {
  const mocks: any[] = []

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
