import './style.css';
import { createRuntimeMessanger } from '../chrome/messager';

const { onRuntimeMessage } = createRuntimeMessanger();

onRuntimeMessage('QwikDevtoolsLogs', (data) => {
  const item = document.createElement('li');
  item.innerText = JSON.stringify(data);

  document.querySelector<HTMLDivElement>('#log-list')!.appendChild(item);
});

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    Request logs
    <ul id="log-list">
    </ul>

  </div>
`;
