import { Container } from '../Container/Container';
export declare class Dispatcher {
    /**
     * The IoC container instance.
     *
     * @var \Illuminate\Container\Container
     */
    protected container: Container;
    /**
     * Create a new event dispatcher instance.
     *
     * @param  {\Illuminate\Container\Container|undefined}  container
     * @return void
     */
    constructor(container?: Container);
}
