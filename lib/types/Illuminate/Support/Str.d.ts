import { Macroable } from '../Macroable/Traits/Macroable';
import { Stringable } from './Stringable';
export interface Str extends Macroable {
}
export declare class Str {
    /**
     * The cache of snake-cased words.
     *
     * @var array
     */
    protected static snakeCache: string[];
    /**
     * The cache of camel-cased words.
     *
     * @var array
     */
    protected static camelCache: string[];
    /**
     * The cache of studly-cased words.
     *
     * @var array
     */
    protected static studlyCache: string[];
    /**
     * The callback that should be used to generate UUIDs.
     *
     * @var callable
     */
    protected static uuidFactory: Function;
    /**
     * Get the portion of a string before the last occurrence of a given value.
     *
     * @param  {string}  subject
     * @param  {string}  search
     * @return {string}
     */
    static beforeLast(subject: string, search: string): string;
    /**
     * Determine if a given string contains a given substring.
     *
     * @param  {string}  haystack
     * @param  {string|string[]}  needles
     * @param  {boolean}  ignoreCase
     * @return {boolean}
     */
    static contains(haystack: string, needles: string | string[], ignoreCase?: boolean): boolean;
    /**
     * Determine if a given string ends with a given substring.
     *
     * @param  {string}  haystack
     * @param  {string|string[]}  needles
     * @return {boolean}
     */
    static endsWith(haystack: any, needles: string[]): boolean;
    /**
     * Get a new stringable object from the given string.
     *
     * @param  {string}  string
     * @return {\Illuminate\Support\Stringable}
     */
    static of(string: string): Stringable;
}
