export class Str {
  /**
   * Return the remainder of a string after the first occurrence of a given value.
   *
   * @param  {string}  subject
   * @param  {string}  search
   * @return {string}
   */
  static after (subject, search) {
    const parts = subject.split(search)

    // return search === '' ? subject : subject.split(search, 2).reverse()[0]
    return search === '' ? subject : [parts[0], ...parts.slice(1).join(search)].reverse()[0]
  }
}
