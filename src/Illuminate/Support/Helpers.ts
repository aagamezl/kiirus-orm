import { HigherOrderTapProxy } from "./HigherOrderTapProxy";

/**
 * Call the given Closure with the given value then return the value.
 *
 * @param  any  value
 * @param  callable|null  callback
 * @return any
 */
export const tap = (value: any, callback?: Function) => {
  if (!callback) {
    return new HigherOrderTapProxy(value);
  }

  callback(value);

  return value;
}
