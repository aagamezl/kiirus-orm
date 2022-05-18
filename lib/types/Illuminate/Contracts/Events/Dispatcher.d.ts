export interface Dispatcher {
    /**
     * Dispatch an event and call the listeners.
     *
     * @param  {string|object}  event
     * @param  {unknown}  payload
     * @param  {boolean}  halt
     * @return {unknown[]|undefined}
     */
    dispatch: (event: string | object, payload?: unknown, halt?: boolean) => unknown[] | undefined;
}
