"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MySqlDriver = void 0;
const AbstractMySQLDriver_1 = require("../../../Doctrine/Driver/AbstractMySQLDriver");
const ConnectsToDatabase_1 = require("./Concerns/ConnectsToDatabase");
const use_1 = require("../../Support/Traits/use");
class MySqlDriver extends AbstractMySQLDriver_1.AbstractMySQLDriver {
    constructor() {
        super();
        (0, use_1.use)(this.constructor, [ConnectsToDatabase_1.ConnectsToDatabase]);
    }
    /**
     * {@inheritdoc}
     */
    getName() {
        return 'mysql';
    }
}
exports.MySqlDriver = MySqlDriver;
//# sourceMappingURL=MySqlDriver.js.map