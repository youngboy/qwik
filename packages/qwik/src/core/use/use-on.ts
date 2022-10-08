import { assertQrl } from '../import/qrl-class';
import type { QRL } from '../import/qrl.public';
import { getContext, normalizeOnProp } from '../props/props';
import { addQRLListener } from '../props/props-on';
import { implicit$FirstArg } from '../util/implicit_dollar';
import { useInvokeContext } from './use-core';
import { useSequentialScope } from './use-sequential-scope';
import { Watch, WatchFlagsIsCleanup } from './use-watch';

// <docs markdown="../readme.md#useCleanup">
// !!DO NOT EDIT THIS COMMENT DIRECTLY!!!
// (edit ../readme.md#useCleanup instead)
/**
 * It can be used to release resources, abort network requests, stop timers...
 *
 * @alpha
 * @deprecated Use the cleanup() function of `useWatch$()`, `useResource$()` or
 * `useClientEffect$()` instead.
 */
// </docs>
export const useCleanupQrl = (unmountFn: QRL<() => void>): void => {
  const { get, set, i, ctx } = useSequentialScope<boolean>();
  if (!get) {
    assertQrl(unmountFn);
    const el = ctx.$hostElement$;
    const watch = new Watch(WatchFlagsIsCleanup, i, el, unmountFn, undefined);
    const elCtx = getContext(el);
    set(true);
    if (!elCtx.$watches$) {
      elCtx.$watches$ = [];
    }
    elCtx.$watches$.push(watch);
  }
};

// <docs markdown="../readme.md#useCleanup">
// !!DO NOT EDIT THIS COMMENT DIRECTLY!!!
// (edit ../readme.md#useCleanup instead)
/**
 * It can be used to release resources, abort network requests, stop timers...
 *
 * @alpha
 * @deprecated Use the cleanup() function of `useWatch$()`, `useResource$()` or
 * `useClientEffect$()` instead.
 */
// </docs>
export const useCleanup$ = /*#__PURE__*/ implicit$FirstArg(useCleanupQrl);

// <docs markdown="../readme.md#useOn">
// !!DO NOT EDIT THIS COMMENT DIRECTLY!!!
// (edit ../readme.md#useOn instead)
/**
 * Register a listener on the current component's host element.
 *
 * Used to programmatically add event listeners. Useful from custom `use*` methods, which do not
 * have access to the JSX. Otherwise, it's adding a JSX listener in the `<div>` is a better idea.
 *
 * @see `useOn`, `useOnWindow`, `useOnDocument`.
 *
 * @alpha
 */
// </docs>
export const useOn = (event: string, eventQrl: QRL<(ev: Event) => void>) =>
  _useOn(`on-${event}`, eventQrl);

// <docs markdown="../readme.md#useOnDocument">
// !!DO NOT EDIT THIS COMMENT DIRECTLY!!!
// (edit ../readme.md#useOnDocument instead)
/**
 * Register a listener on `document`.
 *
 * Used to programmatically add event listeners. Useful from custom `use*` methods, which do not
 * have access to the JSX.
 *
 * @see `useOn`, `useOnWindow`, `useOnDocument`.
 *
 * ```tsx
 * function useScroll() {
 *   useOnDocument(
 *     'scroll',
 *     $((event) => {
 *       console.log('body scrolled', event);
 *     })
 *   );
 * }
 *
 * const Cmp = component$(() => {
 *   useScroll();
 *   return <div>Profit!</div>;
 * });
 * ```
 *
 * @alpha
 */
// </docs>
export const useOnDocument = (event: string, eventQrl: QRL<(ev: Event) => void>) =>
  _useOn(`document:on-${event}`, eventQrl);

// <docs markdown="../readme.md#useOnWindow">
// !!DO NOT EDIT THIS COMMENT DIRECTLY!!!
// (edit ../readme.md#useOnWindow instead)
/**
 * Register a listener on `window`.
 *
 * Used to programmatically add event listeners. Useful from custom `use*` methods, which do not
 * have access to the JSX.
 *
 * @see `useOn`, `useOnWindow`, `useOnDocument`.
 *
 * ```tsx
 * function useAnalytics() {
 *   useOnWindow(
 *     'popstate',
 *     $((event) => {
 *       console.log('navigation happened', event);
 *       // report to analytics
 *     })
 *   );
 * }
 *
 * const Cmp = component$(() => {
 *   useAnalytics();
 *   return <div>Profit!</div>;
 * });
 * ```
 *
 * @alpha
 */
// </docs>
export const useOnWindow = (event: string, eventQrl: QRL<(ev: Event) => void>) =>
  _useOn(`window:on-${event}`, eventQrl);

const _useOn = (eventName: string, eventQrl: QRL<(ev: Event) => void>) => {
  const invokeCtx = useInvokeContext();
  const elCtx = getContext(invokeCtx.$hostElement$);
  assertQrl(eventQrl);
  addQRLListener(elCtx.li, [[normalizeOnProp(eventName), eventQrl]]);
  elCtx.$needAttachListeners$ = true;
};
