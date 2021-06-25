export class Statement {
  protected bindings: Record<string | number, any> = {};

  protected connection: any;

  protected query: string;

  protected rowCountProperty: number = 0;

  constructor(query: string, connection: any) {
    this.connection = connection;
    this.query = query;
  }

  /**
   *
   * @param string|number param
   * @param any value
   * @return boolean
   */
  public bindValue(param: string | number, value: any) {
    try {
      this.bindings[param] = value;

      return true;
    } catch (error) {
      return false;
    }
  }

  public async execute(): Promise<boolean> {
    try {
      const result = await this.connection.query(this.query, Array.from(Object.values(this.bindings)));

      this.rowCountProperty = result.rows.length;

      return true;
    } catch (error) {
      return false;
    }
  }

  public rowCount(): number {
    return this.rowCountProperty;
  }
}
