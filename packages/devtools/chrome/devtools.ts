import { once } from '../shared/bridge';
import { log } from '../utils';
import { createRuntimeMessanger, DEVTOOLS_CONNECTION_NAME } from './messager';

log('Devtools script working.');

const { onRuntimeMessage, postRuntimeMessage } = createRuntimeMessanger();

// Create a connection to the background page
chrome.runtime.connect({ name: DEVTOOLS_CONNECTION_NAME });

postRuntimeMessage('DevtoolsScriptConnected', chrome.devtools.inspectedWindow.tabId);

let panel: chrome.devtools.panels.ExtensionPanel | undefined;

function getComponentProps() {
  const container = document.querySelector('[q\\:container]');
  if (!container) {
    return {
      status: 'No q container detected',
    };
  }
  if (container.attributes['q:container'].value === 'paused') {
    return {
      status: 'container is paused',
    };
  }

  function searchHostEl(el: Element) {
    let searchDepth = 0;
    function isVirtualOpen(el: Comment) {
      if (el.nodeType !== 8) {
        return false;
      }
      if (
        (el.data || '').startsWith('qv') &&
        // no slot placeholder
        (el.data || '').indexOf('q:sref') < 0
      ) {
        searchDepth += 1;
        if (searchDepth === 1) {
          return true;
        }
      }
      if ((el.data || '').startsWith('/qv')) {
        searchDepth -= 1;
      }
      return false;
    }
    let currentEl: any = el;
    // FIXME: (perf) suffers from long list of dom nodes
    while (currentEl && !isVirtualOpen(currentEl)) {
      currentEl = currentEl.previousSibling || currentEl.parentNode;
    }
    if (currentEl) {
      return currentEl.__virtual;
    }
    return null;
  }
  // TODO: how to present $captureRef$ or $capture$
  //       to make developer understanding captured lexical scope
  function formatQrl(qrl: any) {
    return {
      displayName: qrl?.$dev$?.displayName,
      file: qrl?.$dev$?.file,
      // above attrs would be empty for unknown reason
      // save rawQrl here for debugging
      rawQrl: qrl,
    };
  }
  function formatListeners(events: any) {
    return (events || []).reduce((acc, item) => {
      const [eventName, handlerQrl] = item;
      if (acc[eventName]) {
        acc[eventName] = [acc[eventName], formatQrl(handlerQrl)].flat();
      } else {
        acc[eventName] = formatQrl(handlerQrl);
      }
      return acc;
    }, {});
  }
  // @ts-ignore
  const selected = $0 as any;
  const hostEl = searchHostEl(selected);
  const ctx: any = {
    Selected: 'Select a component to inspect',
  };
  if (selected && selected._qc_) {
    ctx.Selected = {
      listeners: formatListeners(selected._qc_.li),
      props: selected._qc_.props,
    };
  }
  if (hostEl && hostEl._qc_) {
    ctx.Component = {
      props: hostEl._qc_.$props$,
      listeners: formatListeners(hostEl._qc_.li),
      qrl: formatQrl(hostEl._qc_.$componentQrl$),
    };
  }
  return ctx;
}

function checkAndInit() {
  if (!panel) {
    chrome.devtools.inspectedWindow.eval('window.qDev', (result) => {
      if (result) {
        onQwikPage();
      }
    });
  }
}

function onQwikPage() {
  if (panel) return log('Panel already exists.');

  log('Qwik on page - creating panel...');
  chrome.devtools.panels.create('Qwik', 'assets/icons/32.png', 'index.html', (newPanel) => {
    if (chrome.runtime.lastError) {
    }
    panel = newPanel;
    log('Panel created.');
  });

  chrome.devtools.panels.elements.createSidebarPane('Qwik', (sidebar) => {
    sidebar.setExpression('(' + getComponentProps.toString() + ')()');
    chrome.devtools.panels.elements.onSelectionChanged.addListener(() => {
      sidebar.setExpression('(' + getComponentProps.toString() + ')()');
    });
  });
}

once(onRuntimeMessage, 'QwikOnPage', onQwikPage);
onRuntimeMessage('NavComplete', checkAndInit);
checkAndInit();

export {};
