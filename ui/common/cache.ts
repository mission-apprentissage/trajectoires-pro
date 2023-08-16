import { cache as cacheReact } from 'react';

// Custom cache function which support array and object
export function cacheWithObjectArgument<CachedFunction extends Function>(
  fn: CachedFunction
): Function {
  return function () {
    for (let i = 0, l = arguments.length; i < l; i++) {
      const arg = arguments[i];
      if (typeof arg === 'function') {
        throw new Error(
          'Function not supported as argument with cacheWithObjectArgument'
        );
      }
    }

    let argumentsPrimitive = JSON.stringify(Array.from(arguments));
    return cacheReact((argumentsPrimitive: string) => {
      return fn(...JSON.parse(argumentsPrimitive));
    })(argumentsPrimitive);
  };
}
