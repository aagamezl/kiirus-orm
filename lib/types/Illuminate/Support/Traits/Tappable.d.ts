import { HigherOrderTapProxy } from '../HigherOrderTapProxy';
export declare class Tappable {
    /**
     * Call the given Closure with this instance then return the instance.
     *
     * @param  {callable}  [callback=undefined]
     * @return {this|\Illuminate\Support\HigherOrderTapProxy}
     */
    tap<T>(callback?: <P>(instance: P) => unknown): T | HigherOrderTapProxy;
}
