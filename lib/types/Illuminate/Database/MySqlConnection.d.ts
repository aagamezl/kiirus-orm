import { Connection } from './Connection';
import { MySqlDriver } from './../Database/PDO/MySqlDriver';
import { MySqlGrammar as QueryGrammar } from './../Database/Query/Grammars';
import { MySqlGrammar as SchemaGrammar } from './Schema/Grammars/MySqlGrammar';
export declare class MySqlConnection extends Connection {
    /**
     * Get the default query grammar instance.
     *
     * @return {\Illuminate\Database\Query\Grammars\MySqlGrammar}
     */
    protected getDefaultQueryGrammar(): QueryGrammar;
    /**
     * Get the default schema grammar instance.
     *
     * @return {\Illuminate\Database\Schema\Grammars\MySqlGrammar}
     */
    protected getDefaultSchemaGrammar(): SchemaGrammar;
    /**
     * Get the Doctrine DBAL driver.
     *
     * @return {\Illuminate\Database\PDO\MySqlDriver}
     */
    protected getDoctrineDriver(): MySqlDriver;
}
