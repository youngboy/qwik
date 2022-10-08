import { expect } from '@playwright/test';
import type { Locator, PlaywrightTestConfig } from '@playwright/test';

expect.extend({
  async hasAttribute(recieved: Locator, attribute: string) {
    const pass = await recieved.evaluate(
      (node, attribute) => node.hasAttribute(attribute),
      attribute
    );

    return {
      message: () => `expected ${recieved} to have attribute \`${attribute}\``,
      pass,
    };
  },
});

const config: PlaywrightTestConfig = {
  use: {
    viewport: {
      width: 520,
      height: 600,
    },
  },
  workers: 1,
  retries: 3,
  webServer: {
    command: 'tsm ./dev-server.ts 3301',
    port: 3301,
    reuseExistingServer: !process.env.CI,
  },
};

export default config;
