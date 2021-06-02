import * as sinon from 'sinon';

const mocks: Array<any> = [];

export const createMock = (target: any) => {
  mocks.push(sinon.mock(target));

  return mocks[mocks.length - 1];
};

export const autoVerify = () => {
  mocks.forEach((mock) => {
    mock.verify();
    mock.restore();
  });
};
