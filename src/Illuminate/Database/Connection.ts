import {Config} from './Config';
import {ConnectionInterface} from './ConnectionInterface';
import {Grammar as QueryGrammar} from './Query/Grammars';
import {Processor} from './Query/Processors';

export class Connection implements ConnectionInterface {
  /**
   * The database connection configuration options.
   *
   * @member object
   */
  protected config: Config;

  /**
   * The name of the connected database.
   *
   * @member string
   */
  protected database: string;

  /**
   * The query post processor implementation.
   *
   * @member Processor
   */
  protected postProcessor: Processor = {} as Processor;

  /**
   * The query grammar implementation.
   *
   * @member Grammar
   */
  protected queryGrammar: QueryGrammar = {} as QueryGrammar;

  /**
   * The table prefix for the connection.
   *
   * @member string
   */
  protected tablePrefix = '';

  constructor(config: Config, database = '', tablePrefix = '') {
    // First we will setup the default properties. We keep track of the DB
    // name we are connected to since it is needed when some reflective
    // type commands are run such as checking whether a table exists.
    this.database = database ?? config.database;

    this.tablePrefix = tablePrefix;

    this.config = config;

    // We need to initialize a query grammar and the query post processors
    // which are both very important parts of the database abstractions
    // so we initialize these to their default values while starting.
    this.useDefaultQueryGrammar();

    this.useDefaultPostProcessor();
  }

  /**
   * Get the name of the connected database.
   *
   * @returns {string}
   */
  public getDatabaseName() {
    return this.database;
  }

  /**
   * Get the default post processor instance.
   *
   * @returns {Processor}
   */
  protected getDefaultPostProcessor(): Processor {
    return new Processor();
  }

  /**
   * Get the default query grammar instance.
   *
   * @returns {Grammar}
   */
  protected getDefaultQueryGrammar() {
    return new QueryGrammar();
  }

  /**
   * Get the query post processor used by the connection.
   *
   * @returns {Processor}
   */
  public getPostProcessor(): Processor {
    return this.postProcessor;
  }

  /**
   * Get the query grammar used by the connection.
   *
   * @returns {Grammar}
   */
  public getQueryGrammar(): QueryGrammar {
    return this.queryGrammar;
  }

  /**
   * Run a select statement against the database.
   *
   * @param  {string}  query
   * @param  {Array}  bindings
   * @returns {Array}
   */
  public select(query: string, bindings: Array<unknown> = []): Array<object> {
    return [];
  }

  /**
   * Set the query post processor to the default implementation.
   *
   * @returns void
   */
  public useDefaultPostProcessor(): void {
    this.postProcessor = this.getDefaultPostProcessor();
  }

  /**
   * Set the query grammar to the default implementation.
   *
   * @returns void
   */
  public useDefaultQueryGrammar(): void {
    this.queryGrammar = this.getDefaultQueryGrammar();
  }
}
