import { AbstractMySQLDriver } from '../../../Doctrine/Driver/AbstractMySQLDriver'
import { ConnectsToDatabase } from './Concerns/ConnectsToDatabase'
import { use } from '../../Support/Traits/use'

export interface MySqlDriver extends AbstractMySQLDriver, ConnectsToDatabase { }

export class MySqlDriver extends AbstractMySQLDriver {
  public constructor () {
    super()

    use(this.constructor, [ConnectsToDatabase])
  }

  /**
   * {@inheritdoc}
   */
  public getName (): string {
    return 'mysql'
  }
}
