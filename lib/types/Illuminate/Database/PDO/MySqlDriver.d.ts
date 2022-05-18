import { AbstractMySQLDriver } from '../../../Doctrine/Driver/AbstractMySQLDriver';
import { ConnectsToDatabase } from './Concerns/ConnectsToDatabase';
export interface MySqlDriver extends AbstractMySQLDriver, ConnectsToDatabase {
}
export declare class MySqlDriver extends AbstractMySQLDriver {
    constructor();
    /**
     * {@inheritdoc}
     */
    getName(): string;
}
