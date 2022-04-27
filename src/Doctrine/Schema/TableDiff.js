import { Identifier } from './Identifier'

/**
 * Table Diff.
 */
export class TableDiff {
  /**
   * Constructs an TableDiff object.
   *
   * @param string       tableName
   * @param Column[]     addedColumns
   * @param ColumnDiff[] changedColumns
   * @param Column[]     removedColumns
   * @param Index[]      addedIndexes
   * @param Index[]      changedIndexes
   * @param Index[]      removedIndexes
   */
  constructor (
    tableName,
    addedColumns = [],
    changedColumns = [],
    removedColumns = [],
    addedIndexes = [],
    changedIndexes = [],
    removedIndexes = [],
    fromTable = undefined
  ) {
    /** @member Table|undefined */
    this.name = tableName

    /** @member string|false */
    this.newName = false

    /**
     * All added columns
     *
     * @member Column[]
     */
    this.addedColumns = addedColumns

    /**
     * All changed columns
     *
     * @member ColumnDiff[]
     */
    this.changedColumns = changedColumns

    /**
     * All removed columns
     *
     * @member Column[]
     */
    this.removedColumns = removedColumns

    /**
     * Columns that are only renamed from key to column instance name.
     *
     * @member Column[]
     */
    this.renamedColumns = []

    /**
     * All added indexes.
     *
     * @member Index[]
     */
    this.addedIndexes = addedIndexes

    /**
     * All changed indexes.
     *
     * @member Index[]
     */
    this.changedIndexes = changedIndexes

    /**
     * All removed indexes
     *
     * @member Index[]
     */
    this.removedIndexes = removedIndexes

    /**
     * Indexes that are only renamed but are identical otherwise.
     *
     * @member Index[]
     */
    this.renamedIndexes = []

    /**
     * All added foreign key definitions
     *
     * @member ForeignKeyConstraint[]
     */
    this.addedForeignKeys = []

    /**
     * All changed foreign keys
     *
     * @member ForeignKeyConstraint[]
     */
    this.changedForeignKeys = []

    /**
     * All removed foreign keys
     *
     * @member ForeignKeyConstraint[]|string[]
     */
    this.removedForeignKeys = []

    /** @member Table|undefined */
    this.fromTable = fromTable
  }

  /**
   * @param AbstractPlatform platform The platform to use for retrieving this table diff's name.
   *
   * @return Identifier
   */
  getName (platform) {
    return new Identifier(
      this.name
      // this.fromTable instanceof Table ? this.fromTable.getQuotedName(platform) : this.name
    )
  }

  /**
   * @return Identifier|false
   */
  getNewName () {
    if (this.newName === false) {
      return false
    }

    return new Identifier(this.newName)
  }
}
