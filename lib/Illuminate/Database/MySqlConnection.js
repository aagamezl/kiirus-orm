"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MySqlConnection = void 0;
const Connection_1 = require("./Connection");
const MySqlDriver_1 = require("./../Database/PDO/MySqlDriver");
const Grammars_1 = require("./../Database/Query/Grammars");
const MySqlGrammar_1 = require("./Schema/Grammars/MySqlGrammar");
class MySqlConnection extends Connection_1.Connection {
    /**
     * Get the default query grammar instance.
     *
     * @return {\Illuminate\Database\Query\Grammars\MySqlGrammar}
     */
    getDefaultQueryGrammar() {
        return this.withTablePrefix(new Grammars_1.MySqlGrammar());
    }
    /**
     * Get the default schema grammar instance.
     *
     * @return {\Illuminate\Database\Schema\Grammars\MySqlGrammar}
     */
    getDefaultSchemaGrammar() {
        return this.withTablePrefix(new MySqlGrammar_1.MySqlGrammar());
    }
    /**
     * Get the Doctrine DBAL driver.
     *
     * @return {\Illuminate\Database\PDO\MySqlDriver}
     */
    getDoctrineDriver() {
        return new MySqlDriver_1.MySqlDriver();
    }
}
exports.MySqlConnection = MySqlConnection;
//# sourceMappingURL=MySqlConnection.js.map