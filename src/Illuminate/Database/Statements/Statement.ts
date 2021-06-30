export abstract class Statement {
  protected bindings: Record<string | number, unknown> = {};

  protected connection: object;

  protected query: string;

  protected rowCountProperty = 0;

  constructor(query: string, connection: object) {
    this.connection = connection;
    this.query = query;
  }

  /**
   *
   * @param {string|number} param
   * @param {*} value
   * @returns {boolean}
   */
  public bindValue(param: string | number, value: unknown) {
    try {
      this.bindings[param] = value;

      return true;
    } catch (error) {
      return false;
    }
  }

  // public async execute(): Promise<boolean> {
  //   try {
  //     const result = await this.connection.query(
  //       this.query,
  //       Array.from(Object.values(this.bindings))
  //     );

  //     this.rowCountProperty = result.rows.length;

  //     return true;
  //   } catch (error) {
  //     return false;
  //   }
  // }

  abstract execute(): Promise<boolean>;

  public rowCount(): number {
    return this.rowCountProperty;
  }
}
