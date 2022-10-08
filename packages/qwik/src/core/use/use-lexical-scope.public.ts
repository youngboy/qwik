import { assertDefined } from '../assert/assert';
import { parseQRL } from '../import/qrl';
import { getContext, inflateQrl, resumeIfNeeded } from '../props/props';
import { getWrappingContainer, getInvokeContext } from './use-core';
import { assertQrl } from '../import/qrl-class';

// <docs markdown="../readme.md#useLexicalScope">
// !!DO NOT EDIT THIS COMMENT DIRECTLY!!!
// (edit ../readme.md#useLexicalScope instead)
/**
 * Used by the Qwik Optimizer to restore the lexically scoped variables.
 *
 * This method should not be present in the application source code.
 *
 * NOTE: `useLexicalScope` method can only be used in the synchronous portion of the callback
 * (before any `await` statements.)
 *
 * @internal
 */
// </docs>
export const useLexicalScope = <VARS extends any[]>(): VARS => {
  const context = getInvokeContext();
  let qrl = context.$qrl$;
  if (!qrl) {
    const el = context.$element$;
    assertDefined(el, 'invoke: element must be defined inside useLexicalScope()', context);
    const container = getWrappingContainer(el);
    const elCtx = getContext(el);
    assertDefined(container, `invoke: cant find parent q:container of`, el);
    qrl = parseQRL(decodeURIComponent(String(context.$url$)), container);
    assertQrl(qrl);
    resumeIfNeeded(container);
    inflateQrl(qrl, elCtx);
  } else {
    assertQrl(qrl);
    assertDefined(
      qrl.$captureRef$,
      'invoke: qrl $captureRef$ must be defined inside useLexicalScope()',
      qrl
    );
  }
  return qrl.$captureRef$ as VARS;
};
