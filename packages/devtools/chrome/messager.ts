/**
 * a remix of solid devtools
 * More https://github.com/thetarnav/solid-devtools/blob/main/packages/extension/shared/messanger.ts
 */
import { OnMessageFn, PostMessageFn, Messages } from '../shared/bridge';
import { log, noop } from '../utils';

export const DEVTOOLS_CONTENT_PORT = 'DEVTOOLS_CONTENT_PORT';
export const DEVTOOLS_CONNECTION_NAME = 'QWIK_DEVTOOLS';

export function createPortMessanger(port: chrome.runtime.Port): {
  postPortMessage: PostMessageFn;
  onPortMessage: OnMessageFn;
} {
  let listeners: {
    [K in keyof Messages]?: ((payload: Messages[K]) => void)[];
  } = {};

  let connected = true;
  port.onDisconnect.addListener((port) => {
    log('Port', port.name, 'disconnected');
    connected = false;
    listeners = {};
    port.onMessage.removeListener(onMessage);
  });

  // @ts-ignore
  function onMessage(event: unknown, port: chrome.runtime.Port) {
    if (!event || typeof event !== 'object') return;
    const e = event as Record<PropertyKey, unknown>;
    if (typeof e.id !== 'string') return;
    log('port message received:', e.id, e.payload);
    listeners[e.id as keyof Messages]?.forEach((f) => f(e.payload as never));
  }
  port.onMessage.addListener(onMessage);

  return {
    postPortMessage: (id, payload?: any) => {
      log('port message posted:', id, payload);
      if (!connected) return;
      port.postMessage({ id, payload });
    },
    onPortMessage: (id, handler) => {
      if (!connected) return noop;
      let arr = listeners[id];
      if (!arr) arr = listeners[id] = [];
      arr.push(handler);
      return () => (listeners[id] = arr!.filter((l) => l !== handler) as any);
    },
  };
}

export function createRuntimeMessanger(): {
  postRuntimeMessage: PostMessageFn;
  onRuntimeMessage: OnMessageFn;
} {
  const listeners: {
    [K in keyof Messages]?: ((payload: Messages[K]) => void)[];
  } = {};

  // @ts-ignore
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    const id = message?.id as keyof Messages;
    if (typeof id !== 'string') return;
    log('runtime message received:', id, message.payload);
    listeners[id]?.forEach((f) => f(message.payload as never));
    // lines below are necessary to avoid "The message port closed before a response was received." errors.
    // https://github.com/mozilla/webextension-polyfill/issues/130
    sendResponse({});
    return true;
  });

  return {
    onRuntimeMessage: (id, handler) => {
      let arr = listeners[id];
      if (!arr) arr = listeners[id] = [];
      arr.push(handler);
      return () => (listeners[id] = arr!.filter((l) => l !== handler) as any);
    },
    postRuntimeMessage: (id, payload?: any) => {
      log('runtime message posted:', id, payload);
      chrome.runtime.sendMessage({ id, payload });
    },
  };
}
