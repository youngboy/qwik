/**
 * a remix of solid devtools
 * More https://github.com/thetarnav/solid-devtools/blob/main/packages/shared/src/bridge.ts
 */
import { log } from '../utils';

export interface Messages {
  // adapter -> content -> devtools.html
  // the `string` payload is the ext-adapter version
  QwikOnPage: true;
  DevtoolsScriptConnected: number;

  // background => devtools.html
  NavComplete: boolean;
  // vite-dev-server => content => background => devtools.html
  QwikDevtoolsLogs: any;
}

export type PostMessageFn = <K extends keyof Messages>(
  ..._: [K] extends [void] ? [id: K] : [id: K, payload: Messages[K]]
) => void;

export type OnMessageFn = <K extends keyof Messages>(
  id: K,
  handler: (payload: Messages[K]) => void
) => VoidFunction;

export const postWindowMessage: PostMessageFn = (id, payload?: any) => {
  log('message posted:', id, payload);
  window.postMessage({ id, payload }, '*');
};

const listeners: {
  [K in keyof Messages]?: ((payload: Messages[K]) => void)[];
} = {};

/**
 * Important ot call this if you want to use {@link onWindowMessage}
 */
export function startListeningWindowMessages() {
  if (typeof window === 'undefined') return;
  window.addEventListener('message', (event) => {
    const id = event.data?.id as keyof Messages;
    if (typeof id !== 'string') return;
    listeners[id]?.forEach((f) => f(event.data.payload as never));
  });
}

export const onWindowMessage: OnMessageFn = (id, handler) => {
  let arr = listeners[id];
  if (!arr) arr = listeners[id] = [];
  arr.push(handler);
  return () => (listeners[id] = arr!.filter((l) => l !== handler) as any);
};

export function once<K extends keyof Messages>(
  method: OnMessageFn,
  id: K,
  handler: (payload: Messages[K]) => void
): VoidFunction {
  const unsub = method(id, (...cbArgs) => {
    unsub();
    return handler(...cbArgs);
  });
  return unsub;
}
