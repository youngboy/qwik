export function noop() {
  // do nothing
}

const getLogLabel = () => [
  `%cqwik-devtools`,
  'color: #fff; background: #2c4f7c; padding: 1px 4px;',
];

export function info<T>(data: T): T {
  console.info(...getLogLabel(), data);
  return data;
}

export function log(...args: any[]): void {
  console.log(...getLogLabel(), ...args);
}
export function warn(...args: any[]): void {
  console.warn(...getLogLabel(), ...args);
}

export const createCallbackStack = <A0 = void, A1 = void, A2 = void, A3 = void>(): {
  push: (...callbacks: ((arg0: A0, arg1: A1, arg2: A2, arg3: A3) => void)[]) => void;
  execute: (arg0: A0, arg1: A1, arg2: A2, arg3: A3) => void;
  clear: VoidFunction;
} => {
  let stack: Array<(arg0: A0, arg1: A1, arg2: A2, arg3: A3) => void> = [];
  const clear: VoidFunction = () => (stack = []);
  return {
    push: (...callbacks) => stack.push(...callbacks),
    execute(arg0, arg1, arg2, arg3) {
      stack.forEach((cb) => cb(arg0, arg1, arg2, arg3));
      clear();
    },
    clear,
  };
};
