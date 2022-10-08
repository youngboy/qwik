/* eslint-disable */
import {
  component$,
  useStore,
  useResource$,
  Resource,
  useWatch$,
  createContext,
  useContextProvider,
  useContext,
  useStyles$,
  ResourceReturn,
} from '@builder.io/qwik';

export interface WeatherData {
  name: string;
  wind: { speed: number; deg: number };
  visibility: number;
  temp: number;
  feels_like: number;
  temp_min: number;
  temp_max: number;
  pressure: number;
  humidity: number;
}

interface LogsContext {
  content: string;
}

export const LOGS = createContext<LogsContext>('qwik.logs.resource');

export const ResourceApp = component$(() => {
  const logs = {
    content: '',
  };
  useContextProvider(LOGS, logs);

  logs.content += '[RENDER] <ResourceApp>\n';

  const state = useStore({
    count: 10,
    countDouble: 0,
    countDoubleDouble: 0,
  });

  useWatch$(async ({ track }) => {
    logs.content += '[WATCH] 1 before\n';
    const count = track(state, 'count');
    await delay(100);
    state.countDouble = count * 2;
    logs.content += '[WATCH] 1 after\n';
  });

  useWatch$(async ({ track }) => {
    logs.content += '[WATCH] 2 before\n';
    const city = track(() => state.countDouble);
    await delay(100);
    state.countDoubleDouble = city * 2;
    logs.content += '[WATCH] 2 after\n';
  });

  const resource = useResource$<number>(async ({ track }) => {
    logs.content += '[RESOURCE] 1 before\n';
    const count = track(() => state.countDoubleDouble);
    await delay(2000);

    logs.content += '[RESOURCE] 1 after\n';
    return count * 2;
  });

  // const resource2 = useResource$<number>(async ({ track }) => {
  //   logs.content += '[RESOURCE] 2 before\n';
  //   const count = track(state, 'countDoubleDouble');
  //   await delay(2000);

  //   logs.content += '[RESOURCE] 2 after\n';
  //   return count * 4;
  // });

  return (
    <div>
      <button type="button" className="increment" onClick$={() => state.count++}>
        Increment
      </button>
      <Results result={resource} />
    </div>
  );
});

export const Results = component$((props: { result: ResourceReturn<number> }) => {
  useStyles$(`
    .logs {
      white-space: pre;
    }`);
  const logs = useContext(LOGS);
  logs.content += '[RENDER] <Results>\n\n\n';

  const state = useStore({
    count: 0,
  });
  return (
    <div>
      <Resource
        value={props.result}
        onPending={() => <div class="resource1">loading resource 1...</div>}
        onRejected={(reason) => <div class="resource1">error {reason}</div>}
        onResolved={(number) => {
          return (
            <>
              <div className="resource1">resource 1 is {number}</div>
              <button class="count" onClick$={() => state.count++}>
                count is {state.count + 0}
              </button>
            </>
          );
        }}
      />

      <div class="logs">{logs.content}</div>
    </div>
  );
});

export function delay(nu: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, nu);
  });
}
