"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Relation = void 0;
class Relation {
    /**
   * Create a new relation instance.
   *
   * @param  \Illuminate\Database\Eloquent\Builder  query
   * @param  \Illuminate\Database\Eloquent\Model  parent
   * @return void
   */
    constructor(query, parent) {
        this.query = query;
        // this.parent = parent
        // this.related = query.getModel()
        // this.addConstraints()
    }
}
exports.Relation = Relation;
//# sourceMappingURL=Relation.js.map