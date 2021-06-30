export interface Dispatcher {
  /**
   * Register an event listener with the dispatcher.
   *
   * @param  \Closure|string|array  events
   * @param  \Closure|string|array|null  listener
   * @return void
   */
  listen(
    events: Function | string | Array<any>,
    listener?: Function | string | Array<any>
  ): void;

  /**
   * Determine if a given event has listeners.
   *
   * @param  string  eventName
   * @return boolean
   */
  hasListeners(eventName: string): boolean;

  /**
   * Register an event subscriber with the dispatcher.
   *
   * @param  object|string  subscriber
   * @return void
   */
  subscribe(subscriber: Object | string): void;

  /**
   * Dispatch an event until the first non-null response is returned.
   *
   * @param  string|object  event
   * @param  any  payload
   * @return array|null
   */
  until(event: Object | string, payload?: Array<any>): Array<any> | undefined;

  /**
   * Dispatch an event and call the listeners.
   *
   * @param  string|object  event
   * @param  mixed  payload
   * @param  bool  halt
   * @return array|null
   */
  dispatch(
    event: Object | string,
    payload?: Array<any>,
    halt?: boolean
  ): Array<any> | undefined;

  /**
   * Register an event and payload to be fired later.
   *
   * @param  string  event
   * @param  array  payload
   * @return void
   */
  push(event: string, payload?: Array<any>): void;

  /**
   * Flush a set of pushed events.
   *
   * @param  string  event
   * @return void
   */
  flush(event: string): void;

  /**
   * Remove a set of listeners from the dispatcher.
   *
   * @param  string  event
   * @return void
   */
  forget(event: string): void;

  /**
   * Forget all of the queued listeners.
   *
   * @return void
   */
  forgetPushed(): void;
}
