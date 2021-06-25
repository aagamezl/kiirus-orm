"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Str = void 0;
class Str {
    /**
     * Return the remainder of a string after the first occurrence of a given value.
     *
     * @param  string  subject
     * @param  string  search
     * @return string
     */
    static after(subject, search) {
        return search === '' ? subject : subject.split(search, 2).reverse()[0];
    }
}
exports.Str = Str;
//# sourceMappingURL=Str.js.map