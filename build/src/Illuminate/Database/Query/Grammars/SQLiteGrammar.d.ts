import { Builder, WhereInterface } from '../Builder';
import { Grammar } from './Grammar';
export declare class SQLiteGrammar extends Grammar {
    /**
     * All of the available clause operators.
     *
     * @var Array<string>
     */
    protected operators: string[];
    /**
     * Compile an insert ignore statement into SQL.
     *
     * @param  \Illuminate\Database\Query\Builder  $query
     * @param  Array<any> | any  values
     * @return string
     */
    compileInsertOrIgnore(query: Builder, values: Array<any> | any): string;
    /**
     * Compile an "upsert" statement into SQL.
     *
     * @param  \Illuminate\Database\Query\Builder  query
     * @param  Array<any>  values
     * @param  Array<any>  uniqueBy
     * @param  Array<any>  update
     * @return string
     */
    compileUpsert(query: Builder, values: Array<any>, uniqueBy: Array<any>, update: Array<any>): string;
    /**
     * Compile a date based where clause.
     *
     * @param  string  type
     * @param  \Illuminate\Database\Query\Builder  query
     * @param  WhereInterface  where
     * @return string
     */
    protected dateBasedWhere(type: string, query: Builder, where: WhereInterface): string;
    /**
     * Group the nested JSON columns.
     *
     * @param  Array<any>  values
     * @return Array<any>
     */
    protected groupJsonColumnsForUpdate(values: Array<any>): Array<any>;
    /**
     * Prepare the bindings for an update statement.
     *
     * @param  Array<any>  bindings
     * @param  Array<any>  values
     * @return Array<any>
     */
    prepareBindingsForUpdate(bindings: Array<any> | any, values: Array<any>): Array<any>;
    /**
     * Compile a "where date" clause.
     *
     * @param  \Illuminate\Database\Query\Builder  query
     * @param  WhereInterface  where
     * @return string
     */
    protected whereDate(query: Builder, where: WhereInterface): string;
    /**
     * Compile a "where day" clause.
     *
     * @param  \Illuminate\Database\Query\Builder  query
     * @param  WhereInterface  where
     * @return string
     */
    protected whereDay(query: Builder, where: WhereInterface): string;
    /**
   * Compile a "where month" clause.
   *
   * @param  \Illuminate\Database\Query\Builder  query
   * @param  WhereInterface  where
   * @return string
   */
    protected whereMonth(query: Builder, where: WhereInterface): string;
    /**
     * Compile a "where time" clause.
     *
     * @param  \Illuminate\Database\Query\Builder  query
     * @param  WhereInterface  where
     * @return string
     */
    protected whereTime(query: Builder, where: WhereInterface): string;
    /**
     * Compile a "where year" clause.
     *
     * @param  \Illuminate\Database\Query\Builder  query
     * @param  WhereInterface  where
     * @return string
     */
    protected whereYear(query: Builder, where: WhereInterface): string;
    /**
     * Wrap a union subquery in parentheses.
     *
     * @param  string  sql
     * @return string
     */
    protected wrapUnion(sql: string): string;
}
