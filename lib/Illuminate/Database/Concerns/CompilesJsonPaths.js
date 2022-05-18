"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompilesJsonPaths = void 0;
const utils_1 = require("@devnetic/utils");
const helpers_1 = require("../../Collections/helpers");
const Str_1 = require("./../../Support/Str");
// export const CompilesJsonPaths = {
class CompilesJsonPaths {
    /**
     * Split the given JSON selector into the field and the optional path and wrap them separately.
     *
     * @param  {string}  column
     * @return {array}
     */
    wrapJsonFieldAndPath(column) {
        const parts = column.split('->', 2);
        /**
         * The wrap method exists on the trait target prototype
         *
         * @ts-expect-error */
        const field = this.wrap(parts[0]);
        const path = parts.length > 1 ? ', ' + this.wrapJsonPath(parts[1], '->') : '';
        return [field, path];
    }
    /**
     * Wrap the given JSON path.
     *
     * @param  {string}  value
     * @param  {string}  delimiter
     * @return {string}
     */
    wrapJsonPath(value, delimiter = '->') {
        value = value.replace(/([\\]+)?'/g, '\'\'');
        const jsonPath = (0, helpers_1.collect)(value.split(delimiter))
            .map((segment) => this.wrapJsonPathSegment(String(segment)))
            .join('.');
        return "'" + (jsonPath.startsWith('[') ? '' : '.') + jsonPath + "'";
    }
    /**
     * Wrap the given JSON path segment.
     *
     * @param  {string}  segment
     * @return {string}
     */
    wrapJsonPathSegment(segment) {
        const parts = segment.match(/(\[[^\]]+\])+/);
        if (parts !== null) {
            const key = Str_1.Str.beforeLast(segment, parts[0]);
            if (!(0, utils_1.isNil)(key)) {
                return '"' + key + '"' + parts[0];
            }
            return parts[0];
        }
        return '"' + segment + '"';
    }
}
exports.CompilesJsonPaths = CompilesJsonPaths;
//# sourceMappingURL=CompilesJsonPaths.js.map