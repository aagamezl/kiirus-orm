import { Builder, WhereInterface } from '../Builder';
import { Grammar } from './Grammar';
export declare class PostgresGrammar extends Grammar {
    /**
     * Compile the "select *" portion of the query.
     *
     * @param  \Illuminate\Database\Query\Builder  query
     * @param  array  columns
     * @return string|null
     */
    protected compileColumns(query: Builder, columns: Array<any>): string | undefined;
    /**
     * Compile an insert and get ID statement into SQL.
     *
     * @param  \Illuminate\Database\Query\Builder  query
     * @param  Array<any> | any  values
     * @param  string  sequence
     * @return string
     */
    compileInsertGetId(query: Builder, values: Array<any> | any, sequence: string): string;
    /**
     * Compile an insert ignore statement into SQL.
     *
     * @param  \Illuminate\Database\Query\Builder  query
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
     * Prepare the bindings for an update statement.
     *
     * @param  Array<any>  bindings
     * @param  Array<any>  values
     * @return Array<any>
     */
    prepareBindingsForUpdate(bindings: Array<any> | any, values: Array<any>): Array<any>;
    /**
     * {@inheritdoc}
     *
     * @param  \Illuminate\Database\Query\Builder  query
     * @param  WhereInterface  where
     * @return string
     */
    protected whereBasic(query: Builder, where: WhereInterface): string;
    /**
     * Compile a "where date" clause.
     *
     * @param  \Illuminate\Database\Query\Builder  query
     * @param  WhereInterface  where
     * @return string
     */
    protected whereDate(query: Builder, where: WhereInterface): string;
    /**
     * Compile a "where time" clause.
     *
     * @param  \Illuminate\Database\Query\Builder  query
     * @param  WhereInterface  where
     * @return string
     */
    protected whereTime(query: Builder, where: WhereInterface): string;
}
