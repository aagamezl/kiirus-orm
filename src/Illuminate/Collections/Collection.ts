import {isPlainObject} from 'lodash';

import {Arr} from './Arr';

type Unboxed<T> = T extends (infer U)[] ? U : T;

export class Collection<T> {
  /**
   * The items contained in the collection.
   *
   * @member {Array}
   */
  protected items: Array<Unboxed<T>>;

  /**
   * Create a new collection.
   *
   * @param  {*}  items
   * @returns {void}
   */
  constructor(items: Array<unknown>) {
    this.items = this.getArrayableItems(items);
  }

  /**
   * Get all of the items in the collection.
   *
   * @returns {Array}
   */
  public all(): Array<unknown> {
    return this.items;
  }

  /**
   * Count the number of items in the collection.
   *
   * @returns {number}
   */
  public count() {
    return this.items.length;
  }

  /**
   * Get the first item from the collection passing the given truth test.
   *
   * @param  {callbackFn}  [callback]
   * @param  {*}  [defaultValue]
   * @returns {*}
   */
  public first(callback?: Function, defaultValue?: unknown): Unboxed<T> {
    return Arr.first(this.items, callback, defaultValue);
  }

  /**
   * Results array of items from Collection or Arrayable.
   *
   * @param  {*}  items
   * @returns {Array}
   */
  protected getArrayableItems(
    items: Array<unknown> | Collection<T> | unknown
  ): Array<unknown> {
    if (Array.isArray(items)) {
      return items;
    } else if (items instanceof Collection) {
      return items.all();
    } else if (isPlainObject(items)) {
      return [items];
    }

    return [items];
  }

  /**
   * Concatenate values of a given key as a string.
   *
   * @param  {string}  value
   * @param  {string}  [glue]
   * @returns {string}
   */
  public implode(value: string, glue?: string): string {
    const first = this.first();

    if (
      Array.isArray(first) ||
      (isPlainObject(first) && typeof first !== 'string')
    ) {
      return this.pluck(value)
        .all()
        .join(glue ?? '');
    }

    return this.items.join(value ?? '');
  }

  /**
   * Join all items from the collection using a string. The final items can use a separate glue string.
   *
   * @param  {string}  glue
   * @param  {string}  finalGlue
   * @returns {string}
   */
  public join(glue: string, finalGlue = ''): string {
    if (finalGlue === '') {
      return this.implode(glue);
    }

    const count = this.count();

    if (count === 0) {
      return '';
    }

    if (count === 1) {
      return this.last();
    }

    const collection = new Collection(this.items);

    const finalItem = collection.pop();

    return collection.implode(glue) + finalGlue + finalItem;
  }

  /**
   * Get the last item from the collection.
   *
   * @param  {Function|undefined}  [callback]
   * @param  {*}  defaultValue
   * @return {*}
   */
  public last(callback?: Function, defaultValue?: unknown) {
    return Arr.last(this.items, callback, defaultValue);
  }

  /**
   * Run a map over each of the items.
   *
   * @param  {callbackFn}  callback
   * @returns {Collection}
   */
  public map<U>(
    callback: (
      value: Unboxed<T>,
      index?: number,
      array?: Array<Unboxed<T>>
    ) => U
  ): Collection<T> {
    return new Collection(this.items.map(callback));
  }

  /**
   * Get the values of a given key.
   *
   * @param  {string|Array|number}  value
   * @param  {string|null}  [key]
   * @returns {Collection}
   */
  public pluck(
    value: string | Array<unknown> | number,
    key?: string
  ): Collection<T> {
    return new Collection(Arr.pluck(this.items, value, key));
  }

  /**
   * Get and remove the last item from the collection.
   *
   * @returns {unknown}
   */
  public pop() {
    return this.items.pop();
  }
}
