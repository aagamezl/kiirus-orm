import {
  isString,
  isPlainObject,
  get as dataGet,
  isFunction
} from 'lodash';

import { callbackFn } from '../Support/Types';

import { Arr } from './Arr';

export class Collection {
  /**
   * The items contained in the collection.
   *
   * @var array
   */
  protected items: Array<any> = [];

  /**
   * Create a new collection.
   *
   * @param  mixed  items
   * @return void
   */
  constructor(items: Array<any>) {
    this.items = this.getArrayableItems(items);
  }

  /**
   * Get all of the items in the collection.
   *
   * @return array
   */
  public all(): any {
    return this.items;
  }

  /**
   * Determine if an item exists in the collection.
   *
   * @param  any  key
   * @param  [any]  operator
   * @param  [any]  value
   * @return boolean
   */
  public contains(key: any, operator?: any, value?: any): boolean {
    if (arguments.length === 1) {
      if (this.useAsCallable(key)) {
        const placeholder = new Object;

        return this.first(key, placeholder) !== placeholder;
      }

      return this.items.includes(key);
    }

    return this.contains(Reflect.apply(this.operatorForWhere, this, arguments));
  }

  /**
   * Count the number of items in the collection.
   *
   * @return number
   */
  public count() {
    return this.items.length;
  }

  /**
   * Run a filter over each of the items.
   *
   * @param  [callbackFn]  callback
   * @return static
   */
  public filter(callback?: callbackFn) {
    if (callback) {
      return new (this.constructor as any)(Arr.where(this.items, callback));
    }

    return new (this.constructor as any)(this.items.filter(item => item));
  }

  /**
   * Get the first item from the collection passing the given truth test.
   *
   * @param  [callbackFn]  callback
   * @param  [any]  defaultValue
   * @return any
   */
  public first(callback?: callbackFn, defaultValue?: any) {
    return Arr.first(this.items, callback, defaultValue);
  }

  /**
   * Results array of items from Collection or Arrayable.
   *
   * @param  any  items
   * @return array
   */
  protected getArrayableItems(items: any) {
    if (Array.isArray(items)) {
      return items;
    } else if (items instanceof Collection) {
      return items.all();
    } else if(isPlainObject(items)) {
      return items;
    }

    return items;
  }

  /**
   * Concatenate values of a given key as a string.
   *
   * @param  string  value
   * @param  [string]  glue
   * @return string
   */
  public implode(value: string, glue?: string): string {
    const first = this.first();

    if (Array.isArray(first) || (isPlainObject(first) && typeof first !== 'string')) {
      return this.pluck(value).all().join(glue ?? '');
    }

    return this.items.join(value ?? '');
  }

  /**
   * Determine if the collection is empty or not.
   *
   * @return boolean
   */
  public isEmpty() {
    return !this.items || this.items.length === 0;
  }

  /**
 * Join all items from the collection using a string. The final items can use a separate glue string.
 *
 * @param  string  glue
 * @param  string  finalGlue
 * @return string
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
   * @param  callable|null  callback
   * @param  mixed  defaultValue
   * @return mixed
   */
  public last(callback?: callbackFn, defaultValue?: any) {
    return Arr.last(this.items, callback, defaultValue);
  }

  /**
   * Run a map over each of the items.
   *
   * @param  callable  callback
   * @return static
   */
  public map(callback: callbackFn) {
    return new Collection(this.items.map(callback))
  }

  /**
   * Get an operator checker callback.
   *
   * @param  string  key
   * @param  string  operator
   * @param  any  value
   * @return Function
   */
  protected operatorForWhere(key: string, operator?: string, value?: any): Function {
    if (arguments.length === 1) {
      value = true;

      operator = '=';
    }

    if (arguments.length === 2) {
      value = operator;

      operator = '=';
    }

    return (item: any) => {
      const retrieved = dataGet(item, key);

      const strings = [retrieved, value].filter((value) => {
        return isString(value) || (isPlainObject(value) && Reflect.has(value, 'toString'));
      });

      if (strings.length < 2 && [retrieved, value].filter(isPlainObject).length == 1) {
        return ['!=', '<>', '!=='].includes(String(operator));
      }

      switch (operator) {
        default:
        case '=':
        case '==': return retrieved == value;
        case '!=':
        case '<>': return retrieved != value;
        case '<': return retrieved < value;
        case '>': return retrieved > value;
        case '<=': return retrieved <= value;
        case '>=': return retrieved >= value;
        case '===': return retrieved === value;
        case '!==': return retrieved !== value;
      }
    };
  }

  /**
   * Get the values of a given key.
   *
   * @param  string|array|int|null  value
   * @param  string|null  key
   * @return static
   */
  public pluck(value: string | Array<any> | number, key?: string): Collection {
    return new Collection(Arr.pluck(this.items, value, key));
  }

  /**
   * Get and remove the last item from the collection.
   *
   * @return any
   */
  public pop() {
    return this.items.pop();
  }

  /**
   * Create a collection of all elements that do not pass a given truth test.
   *
   * @param  callbackFn|any  callback
   * @return static
   */
  public reject(callback: callbackFn | any = true) {
    const useAsCallable = this.useAsCallable(callback);

    return this.filter((value, key) => {
    // return this.filter(([key, value]) => {
      return useAsCallable
        ? !callback(value, key)
        : value != callback;
    });
  }

  /**
   * Determine if the given value is callable, but not a string.
   *
   * @param  unknown  value
   * @return boolean
   */
  protected useAsCallable(value: unknown) {
    return !isString(value) && isFunction(value);
  }
}
