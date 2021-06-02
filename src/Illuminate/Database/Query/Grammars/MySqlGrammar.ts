import { Builder, WhereInterface } from '../Builder';
import { Grammar } from './Grammar';

export class MySqlGrammar extends Grammar {
  /**
   * The grammar specific operators.
   *
   * @var Array<string>
   */
  protected operators = ['sounds like'];

  /**
   * Add a "where null" clause to the query.
   *
   * @param  \Illuminate\Database\Query\Builder  query
   * @param  WhereInterface  where
   * @return string
   */
  protected whereNull(query: Builder, where: WhereInterface): string {
    if (this.isJsonSelector((where as any).column)) {
      const [field, path] = this.wrapJsonFieldAndPath((where as any).column);

      return '(json_extract(' + field + path + ') is null OR json_type(json_extract(' + field + path + ')) = \'NULL\')';
    }

    return super.whereNull(query, where);
  }

  /**
   * Add a "where not null" clause to the query.
   *
   * @param  \Illuminate\Database\Query\Builder  query
   * @param  WhereInterface  where
   * @return string
   */
  protected whereNotNull(query: Builder, where: WhereInterface): string {
    if (this.isJsonSelector((where as any).column)) {
      const [field, path] = this.wrapJsonFieldAndPath((where as any).column);

      return '(json_extract(' + field + path + ') is not null AND json_type(json_extract(' + field + path + ')) != \'NULL\')';
    }

    return super.whereNotNull(query, where);
  }

  /**
   * Wrap the given JSON selector.
   *
   * @param  string  value
   * @return string
   */
  protected wrapJsonSelector(value: string): string {
    const [field, path] = this.wrapJsonFieldAndPath(value);

    return 'json_unquote(json_extract(' + field + path + '))';
  }

  /**
   * Wrap a single string in keyword identifiers.
   *
   * @param  string  value
   * @return string
   */
  protected wrapValue(value: string): string {
    return value === '*' ? value : '`' + value.replace('`', '``') + '`';
  }
}
