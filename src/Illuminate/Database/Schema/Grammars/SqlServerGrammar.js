import { Grammar } from './Grammar'

export class SqlServerGrammar extends Grammar {
  /**
   * Compile the command to enable foreign key constraints.
   *
   * @return {string}
   */
  compileEnableForeignKeyConstraints () {
    return 'EXEC sp_msforeachtable @command1="print \'?\'", @command2="ALTER TABLE ? WITH CHECK CHECK CONSTRAINT all";'
  }
}
