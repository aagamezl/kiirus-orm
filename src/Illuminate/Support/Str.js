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

    return search === '' ? subject : [parts[0], ...parts.slice(1).join(search)].reverse()[0]
  }

  /**
   * Get the portion of a string before the last occurrence of a given value.
   *
   * @param  {string}  subject
   * @param  {string}  search
   * @return {string}
   */
  static beforeLast (subject, search) {
    if (search === '') {
      return subject
    }

    const pos = subject.lastIndexOf(search)

    if (pos === -1) {
      return subject
    }

    return subject.substr(0, pos)
  }

  /**
   *
   *
   * @static
   * @param {string} word
   * @param {number} [amount]
   * @return {string}
   * @memberof Str
   */
  static plural (word, amount) {
    if (amount !== undefined && amount === 1) {
      return word
    }

    const plural = {
      '(quiz)$': '$1zes',
      '^(ox)$': '$1en',
      '([m|l])ouse$': '$1ice',
      '(matr|vert|ind)ix|ex$': '$1ices',
      '(x|ch|ss|sh)$': '$1es',
      '([^aeiouy]|qu)y$': '$1ies',
      '(hive)$': '$1s',
      '(?:([^f])fe|([lr])f)$': '$1$2ves',
      '(shea|lea|loa|thie)f$': '$1ves',
      sis$: 'ses',
      '([ti])um$': '$1a',
      '(tomat|potat|ech|her|vet)o$': '$1oes',
      '(bu)s$': '$1ses',
      '(alias)$': '$1es',
      '(octop)us$': '$1i',
      '(ax|test)is$': '$1es',
      '(us)$': '$1es',
      '([^s]+)$': '$1s'
    }

    const irregular = {
      move: 'moves',
      foot: 'feet',
      goose: 'geese',
      sex: 'sexes',
      child: 'children',
      man: 'men',
      tooth: 'teeth',
      person: 'people'
    }

    const uncountable = [
      'aircraft',
      'audio',
      'bison',
      'cattle',
      'chassis',
      'cod',
      'compensation',
      'coreopsis',
      'data',
      'deer',
      'education',
      'emoji',
      'equipment',
      'evidence',
      'feedback',
      'firmware',
      'fish',
      'furniture',
      'gold',
      'hardware',
      'hovercraft',
      'information',
      'jedi',
      'kin',
      'knowledge',
      'love',
      'metadata',
      'money',
      'moose',
      'news',
      'nutrition',
      'offspring',
      'pike',
      'plankton',
      'pokemon',
      'police',
      'rain',
      'recommended',
      'related',
      'rice',
      'rice',
      'salmon',
      'series',
      'sheep',
      'shrimp',
      'software',
      'spacecraft',
      'species',
      'species',
      'sugar',
      'swine',
      'traffic',
      'trout',
      'tuna',
      'wheat',
      'wood',
      'you'
    ]

    // save some time in the case that singular and plural are the same
    if (uncountable.includes(word.toLowerCase())) {
      return word
    }

    // check for irregular forms
    for (const w in irregular) {
      const pattern = new RegExp(`${w}$`, 'i')
      const replace = irregular[w]
      if (pattern.test(word)) {
        return word.replace(pattern, replace)
      }
    }

    // check for matches using regular expressions
    for (const reg in plural) {
      const pattern = new RegExp(reg, 'i')
      if (pattern.test(word)) {
        return word.replace(pattern, plural[reg])
      }
    }

    return word
  }
}
