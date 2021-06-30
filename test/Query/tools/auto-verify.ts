import * as sinon from 'sinon';

const mocks: Array<sinon.SinonMock> = [];

export const createMock = (target: object): sinon.SinonMock => {
  mocks.push(sinon.mock(target));

  return mocks[mocks.length - 1];
};

export const autoVerify = () => {
  mocks.forEach(mock => {
    mock.verify();
    mock.restore();
  });
};
