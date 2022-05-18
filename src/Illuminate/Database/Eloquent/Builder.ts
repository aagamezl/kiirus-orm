export class Builder {
  /**
   * The methods that should be returned from query builder.
   *
   * @var string[]
   */
  protected passthru = [
    'aggregate',
    'average',
    'avg',
    'count',
    'dd',
    'doesntExist',
    'dump',
    'exists',
    'explain',
    'getBindings',
    'getConnection',
    'getGrammar',
    'insert',
    'insertGetId',
    'insertOrIgnore',
    'insertUsing',
    'max',
    'min',
    'raw',
    'sum',
    'toSql'
  ]
}
