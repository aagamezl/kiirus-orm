"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.autoVerify = exports.createMock = void 0;
const sinon = require("sinon");
const mocks = [];
const createMock = (target) => {
    mocks.push(sinon.mock(target));
    return mocks[mocks.length - 1];
};
exports.createMock = createMock;
const autoVerify = () => {
    mocks.forEach((mock) => {
        mock.verify();
        mock.restore();
    });
};
exports.autoVerify = autoVerify;
//# sourceMappingURL=auto-verify.js.map