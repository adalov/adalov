export type FunctionType<
    T = any,
    A extends any[] = any[]
> = (...args: A) => T;
