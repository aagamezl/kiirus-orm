import { Builder, WhereInterface } from '../Builder';
import { Grammar } from './Grammar';
export declare class MySqlGrammar extends Grammar {
    /**
     * The grammar specific operators.
     *
     * @var Array<string>
     */
    protected operators: string[];
    /**
     * Compile an insert statement into SQL.
     *
     * @param  \Illuminate\Database\Query\Builder  query
     * @param  Array<any> | any  values
     * @return string
     */
    compileInsert(query: Builder, values: Array<any> | any): string;
    /**
     * Compile an insert ignore statement into SQL.
     *
     * @param  \Illuminate\Database\Query\Builder  query
     * @param  Array<any> | any  values
     * @return string
     */
    compileInsertOrIgnore(query: Builder, values: Array<any> | any): string;
    /**
     * Prepare a JSON column being updated using the JSON_SET function.
     *
     * @param  string  key
     * @param  any  value
     * @return string
     */
    protected compileJsonUpdateColumn(key: string, value: any): string;
    /**
     * Compile the columns for an update statement.
     *
     * @param  \Illuminate\Database\Query\Builder  query
     * @param  values: Array<any>  values
     * @return string
     */
    protected compileUpdateColumns(query: Builder, values: Array<any>): string;
    /**
   * Compile an update statement without joins into SQL.
   *
   * @param  \Illuminate\Database\Query\Builder  query
   * @param  string  table
   * @param  string  columns
   * @param  string  where
   * @return string
   */
    protected compileUpdateWithoutJoins(query: Builder, table: string, columns: string, where: string): string;
    /**
     * Compile an "upsert" statement into SQL.
     *
     * @param  \Illuminate\Database\Query\Builder query
     * @param  Array<any>  values
     * @param  Array<any>  uniqueBy
     * @param  Array<any>  update
     * @return string
     *
     * @throws \RuntimeException
     */
    compileUpsert(query: Builder, values: Array<any>, uniqueBy: Array<any>, update: Array<any>): string;
    /**
     * Prepare the bindings for an update statement.
     *
     * Booleans, integers, and doubles are inserted into JSON updates as raw values.
     *
     * @param  Array<any>  bindings
     * @param  Array<any>  values
     * @return Array<any>
     */
    prepareBindingsForUpdate(bindings: Array<any> | any, values: Array<any>): Array<any>;
    /**
     * Add a "where null" clause to the query.
     *
     * @param  \Illuminate\Database\Query\Builder  query
     * @param  WhereInterface  where
     * @return string
     */
    protected whereNull(query: Builder, where: WhereInterface): string;
    /**
     * Add a "where not null" clause to the query.
     *
     * @param  \Illuminate\Database\Query\Builder  query
     * @param  WhereInterface  where
     * @return string
     */
    protected whereNotNull(query: Builder, where: WhereInterface): string;
    /**
     * Wrap the given JSON selector.
     *
     * @param  string  value
     * @return string
     */
    protected wrapJsonSelector(value: string): string;
    /**
     * Wrap a single string in keyword identifiers.
     *
     * @param  string  value
     * @return string
     */
    protected wrapValue(value: string): string;
}
