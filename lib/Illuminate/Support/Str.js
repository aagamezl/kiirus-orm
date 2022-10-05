"use strict";
// import { castArray } from '@devnetic/utils'
Object.defineProperty(exports, "__esModule", { value: true });
exports.Str = void 0;
const Macroable_1 = require("../Macroable/Traits/Macroable");
const helpers_1 = require("./helpers");
const Stringable_1 = require("./Stringable");
const use_1 = require("./Traits/use");
// export const Str = use({
// eslint-disable-next-line
class Str {
    /**
     * Get the portion of a string before the last occurrence of a given value.
     *
     * @param  {string}  subject
     * @param  {string}  search
     * @return {string}
     */
    static beforeLast(subject, search) {
        if (search === '') {
            return subject;
        }
        const pos = subject.indexOf(search);
        if (pos === -1) {
            return subject;
        }
        return subject.substring(0, pos);
    }
    /**
     * Determine if a given string contains a given substring.
     *
     * @param  {string}  haystack
     * @param  {string|string[]}  needles
     * @param  {boolean}  ignoreCase
     * @return {boolean}
     */
    static contains(haystack, needles, ignoreCase = false) {
        if (ignoreCase) {
            haystack = haystack.toLowerCase();
            needles = [...needles].map((needle) => needle.toLowerCase());
        }
        for (const needle of needles) {
            if (haystack.includes(needle)) {
                return true;
            }
        }
        return false;
    }
    /**
     * Determine if a given string ends with a given substring.
     *
     * @param  {string}  haystack
     * @param  {string|string[]}  needles
     * @return {boolean}
     */
    static endsWith(haystack, needles) {
        for (const needle of (0, helpers_1.castArray)(needles)) {
            if (needle !== '' && needle !== undefined && haystack.endsWith(needle) === true) {
                return true;
            }
        }
        return false;
    }
    /**
     * Get a new stringable object from the given string.
     *
     * @param  {string}  string
     * @return {\Illuminate\Support\Stringable}
     */
    static of(string) {
        return new Stringable_1.Stringable(string);
    }
}
exports.Str = Str;
(0, use_1.use)(Str, [Macroable_1.Macroable]);
//# sourceMappingURL=Str.js.map