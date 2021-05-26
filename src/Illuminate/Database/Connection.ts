import { ConnectionInterface } from './ConnectionInterface'
import { Grammar as QueryGrammar } from './Query/Grammars';
import { Processor } from './Query/Processors';

export class Connection implements ConnectionInterface {
  /**
   * The database connection configuration options.
   *
   * @var array
   */
  protected config = [];

  /**
   * The name of the connected database.
   *
   * @var string
   */
  protected database: string;

  /**
   * The query post processor implementation.
   *
   * @var Processor
   */
  protected postProcessor: Processor = {} as Processor;

  /**
   * The query grammar implementation.
   *
   * @var Grammar
   */
  protected queryGrammar: QueryGrammar = {} as QueryGrammar;

  /**
   * The table prefix for the connection.
   *
   * @var string
   */
  protected tablePrefix = '';

  constructor(database = '', tablePrefix = '', config = []) {
    // First we will setup the default properties. We keep track of the DB
    // name we are connected to since it is needed when some reflective
    // type commands are run such as checking whether a table exists.
    this.database = database;

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
   * @return string
   */
  public getDatabaseName() {
    return this.database
  }

  /**
   * Get the default post processor instance.
   *
   * @return \Illuminate\Database\Query\Processors\Processor
   */
  protected getDefaultPostProcessor(): Processor {
    return new Processor();
  }

  /**
   * Get the default query grammar instance.
   *
   * @return \Illuminate\Database\Query\Grammars\Grammar
   */
  protected getDefaultQueryGrammar() {
    return new QueryGrammar();
  }

  /**
   * Get the query post processor used by the connection.
   *
   * @return \Illuminate\Database\Query\Processors\Processor
   */
  public getPostProcessor(): Processor {
    return this.postProcessor;
  }

  /**
   * Get the query grammar used by the connection.
   *
   * @return \Illuminate\Database\Query\Grammars\Grammar
   */
  public getQueryGrammar(): QueryGrammar {
    return this.queryGrammar;
  }

  /**
   * Run a select statement against the database.
   *
   * @param  string  query
   * @param  array  bindings
   * @return Array<unknown>
   */
  public select(query: string, bindings: Array<string> = []): Array<unknown> {
    return [];
  }

  /**
   * Set the query post processor to the default implementation.
   *
   * @return void
   */
  public useDefaultPostProcessor() {
    this.postProcessor = this.getDefaultPostProcessor();
  }

  /**
   * Set the query grammar to the default implementation.
   *
   * @return void
   */
  public useDefaultQueryGrammar() {
    this.queryGrammar = this.getDefaultQueryGrammar();
  }
}
