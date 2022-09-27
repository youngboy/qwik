# Devtools

**STILL WORK IN PROGRESS**

Inspect qwik application during development

## Development

Using crxjs for hot reload feature in development.

```
yarn dev
```

1. open `chrome://extensions` in chrome browser.
2. ensure top right development switcher is on
3. drag dist folder into extension dashboard

To have more info, checkout https://crxjs.dev/vite-plugin/getting-started/vanilla-js/dev-basics

## Debugging

visit https://developer.chrome.com/docs/extensions/mv3/tut_debugging/ for more info

## Features

Builtin features

- Request logs, detailed contexts start from endpoint to render result tree
- Component tree, inspecting current state

Plugin ideas

- Sql info in timeline
- Custom logger
- SSG

## Supported shells

- Chrome extension
- Inline, for devtools development or stackblitz, and other REPL

## Resources

- [CRXJS Vite Plugin](https://crxjs.dev/vite-plugin/getting-started/vanilla-js/dev-basics)
- [How a DevTools Extension is Made](https://dev.to/voluntadpear/how-a-devtools-extension-is-made-1em7)
