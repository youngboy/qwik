import { onWindowMessage, startListeningWindowMessages } from '../shared/bridge';
import { createPortMessanger, DEVTOOLS_CONTENT_PORT } from './messager';

const port = chrome.runtime.connect({ name: DEVTOOLS_CONTENT_PORT });

startListeningWindowMessages();
const { postPortMessage, onPortMessage } = createPortMessanger(port);

onWindowMessage('QwikDevtoolsLogs', (data) => {
  postPortMessage('QwikDevtoolsLogs', data);
});

// TODO: find a timing to emit this window event
onWindowMessage('QwikOnPage', () => {
  postPortMessage('QwikOnPage', true);
});

export {};
