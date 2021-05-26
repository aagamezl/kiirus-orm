import { Grammar } from './Grammar';

export class MySqlGrammar extends Grammar {
  /**
   * The grammar specific operators.
   *
   * @var Array<string>
   */
  protected operators = ['sounds like'];

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
