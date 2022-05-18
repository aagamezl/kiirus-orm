export declare class CompilesJsonPaths {
    /**
     * Split the given JSON selector into the field and the optional path and wrap them separately.
     *
     * @param  {string}  column
     * @return {array}
     */
    protected wrapJsonFieldAndPath(column: string): string[];
    /**
     * Wrap the given JSON path.
     *
     * @param  {string}  value
     * @param  {string}  delimiter
     * @return {string}
     */
    protected wrapJsonPath(value: string, delimiter?: string): string;
    /**
     * Wrap the given JSON path segment.
     *
     * @param  {string}  segment
     * @return {string}
     */
    protected wrapJsonPathSegment(segment: string): string;
}
