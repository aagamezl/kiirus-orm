import { AbstractMySQLDriver } from '../../../Doctrine/Driver/AbstractMySQLDriver'
import { use } from '../../Support/Traits/Trait'
import { ConnectsToDatabase } from './Concerns/ConnectsToDatabase'

export class MySqlDriver extends AbstractMySQLDriver {
  constructor () {
    super()

    use(this, ConnectsToDatabase)
  }

  /**
   * {@inheritdoc}
   */
  getName () {
    return 'mysql'
  }
}
