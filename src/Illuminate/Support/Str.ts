export class Str {
  /**
   * Return the remainder of a string after the first occurrence of a given value.
   *
   * @param  string  subject
   * @param  string  search
   * @return string
   */
  public static after(subject: string, search: string): string {
    return search === '' ? subject : subject.split(search, 2).reverse()[0];
  }
}
