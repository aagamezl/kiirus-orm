import { Grammar } from './Grammar';
export declare class MySqlGrammar extends Grammar {
    /**
     * The grammar specific operators.
     *
     * @type {Array}
     */
    protected operators: string[];
    /**
     * Wrap a single string in keyword identifiers.
     *
     * @param  {string}  value
     * @return {string}
     */
    protected wrapValue(value: string): string;
}
