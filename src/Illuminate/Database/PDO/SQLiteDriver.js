import { AbstractSQLiteDriver } from '../../../Doctrine/Driver/AbstractSQLiteDriver'
import { use } from '../../Support/Traits/Trait'
import { ConnectsToDatabase } from './Concerns/ConnectsToDatabase'

export class SQLiteDriver extends AbstractSQLiteDriver {
  constructor () {
    super()

    use(this, ConnectsToDatabase)
  }

  /**
   * {@inheritdoc}
   */
  getName () {
    return 'sqlite'
  }
}
