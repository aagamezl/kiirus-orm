import {Statement} from './Statement';

export class MySqlStatement extends Statement {
  public async execute(): Promise<boolean> {
    try {
      const result = await this.connection.query(
        this.query,
        Array.from(Object.values(this.bindings))
      );

      this.rowCountProperty = result.rows.length;

      return true;
    } catch (error) {
      return false;
    }
  }
}
