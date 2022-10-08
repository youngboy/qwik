import { component$, useSignal, useStore } from '@builder.io/qwik';

export const Attributes = component$(() => {
  const render = useSignal(0);
  return (
    <>
      <h1>Most of the changes happen in the input attributes</h1>
      <button id="force-rerender" onClick$={() => render.value++}>
        Rerender
      </button>
      <AttributesChild key={render.value} />
    </>
  );
});

export const AttributesChild = component$(() => {
  const renders = useStore(
    {
      count: 0,
    },
    {
      reactive: false,
    }
  );

  const input = useSignal('');
  const hide = useSignal(false);
  const required = useSignal(false);
  const state = useStore({
    dataAria: 'true',
    count: 0,
    label: 'even',
    stuff: '',
  });
  renders.count++;

  return (
    <>
      <div>
        <button
          id="hide"
          onClick$={() => {
            hide.value = !hide.value;
          }}
        >
          Toggle hide
        </button>
        <button
          id="aria-hidden"
          onClick$={() => {
            state.dataAria = state.dataAria === 'true' ? 'false' : 'true';
          }}
        >
          Toggle aria-hidden
        </button>
        <button
          id="count"
          onClick$={() => {
            state.count++;
            if (state.count % 2 === 0) {
              state.label = 'even';
            } else {
              state.label = 'odd';
            }
          }}
        >
          Count
        </button>
        <button
          id="required"
          onClick$={() => {
            required.value = !required.value;
          }}
        >
          Toggle required
        </button>
        <button
          id="stuff"
          onClick$={() => {
            state.stuff += '0';
          }}
        >
          Add stuff (caused render)
        </button>
      </div>
      <div>
        Renders: <span id="renders">{renders.count}</span>
      </div>
      <div>
        {hide.value ? (
          <>
            <label id="label" />
            <input id="input" />
          </>
        ) : (
          <>
            <label id="label" for={state.label} form="my-form"></label>
            <input
              id="input"
              required={required.value}
              aria-hidden={state.dataAria as any}
              aria-label={state.label}
              data-stuff={'stuff: ' + state.stuff}
              tabIndex={-1}
              onInput$={(ev) => {
                input.value = (ev.target as any).value;
              }}
            />
          </>
        )}
      </div>
      <div id="input-value">{input.value}</div>
      <input id="input-copy" value={input.value} />
    </>
  );
});
