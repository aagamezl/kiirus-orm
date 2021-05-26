import { Processor } from './Processor';

export class MySqlProcessor extends Processor {
  /**
   * Process the results of a column listing query.
   *
   * @param  array  results
   * @return array
   */
  public processColumnListing(results: Array<any>): Array<string> {
    return results.map((result) => {
      return result.column_name;
    });
  }
}
