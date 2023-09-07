import { cache as cacheReact } from "react";

type TypeFromVar<T> = T[keyof T][];

// Custom cache function which support array and object
export function cacheWithObjectArgument<CachedFunction extends (...args: any) => any, R = ReturnType<CachedFunction>>(
  fn: CachedFunction
): (...args: TypeFromVar<Parameters<CachedFunction>>) => R {
  return function (...args: TypeFromVar<Parameters<CachedFunction>>): R {
    for (let i = 0, l = args.length; i < l; i++) {
      const arg = args[i];
      if (typeof arg === "function") {
        throw new Error("Function not supported as argument with cacheWithObjectArgument");
      }
    }

    let argumentsPrimitive = JSON.stringify(Array.from(args));
    return cacheReact<(argumentsPrimitive: string) => R>((argumentsPrimitive: string) => {
      return fn(...JSON.parse(argumentsPrimitive));
    })(argumentsPrimitive);
  };
}
