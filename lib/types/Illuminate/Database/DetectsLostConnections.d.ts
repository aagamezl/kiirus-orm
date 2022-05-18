export declare class DetectsLostConnections {
    /**
     * Determine if the given exception was caused by a lost connection.
     *
     * @param  {Error}  error
     * @return {boolean}
     */
    protected causedByLostConnection(error: Error): boolean;
}
