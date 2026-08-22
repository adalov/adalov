export type ClassType<
    T = any,
    A extends any[] = any[]
> = new (...args: A) => T;
