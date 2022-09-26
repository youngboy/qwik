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
  const html = document.querySelector('html');
  if (!html) {
    return {
      status: 'No q container detected',
    };
  }
  if (html.attributes['q:container'].value === 'paused') {
    return {
      status: 'container is paused',
    };
  }
  // @ts-ignore
  const vEl = $0.__virtual;
  if (vEl && vEl._qc_) {
    return {
      renderQrl: vEl.$renderQrl$,
      listeners: vEl._qc_.li,
      props: vEl._qc_.$props$,
      slots: vEl._qc_.$slots$,
      vdom: vEl._qc_.$vdom$,
      watch: (vEl._qc_.$watches$ || []).map((i) => i.$qrl$),
    };
  }
  return {
    status: 'Select an component to inspect',
  };
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
