import { AbstractPostgreSQLDriver } from '../../../Doctrine/Driver/AbstractPostgreSQLDriver'
import { use } from '../../Support/Traits/Trait'
import { ConnectsToDatabase } from './Concerns/ConnectsToDatabase'

export class PostgresDriver extends AbstractPostgreSQLDriver {
  constructor () {
    super()

    use(this, ConnectsToDatabase)
  }

  /**
   * {@inheritdoc}
   */
  getName () {
    return 'pgsql'
  }
}
