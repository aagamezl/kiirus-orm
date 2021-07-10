export interface Config {
  database: string;
  driver: string;
  host: string;
  password: string;
  username: string;
  port?: number;
  charset?: string;
  collation?: string;
}
