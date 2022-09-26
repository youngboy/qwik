import { defineManifest } from '@crxjs/vite-plugin';
import { version, homepage } from './package.json';

// Convert from Semver (example: 0.1.0-beta6)
const [major, minor, patch, label = '0'] = version
  // can only contain digits, dots, or dash
  .replace(/[^\d.-]+/g, '')
  // split into version parts
  .split(/[.-]/);

export default defineManifest((env) => ({
  manifest_version: 3,
  name: `${env.mode === 'production' ? '' : '[DEV] '}Qwik Devtools`,
  description: 'Chrome Developer Tools extension for debugging qwik applications.',
  homepage_url: homepage,
  // up to four numbers separated by dots
  version: `${major}.${minor}.${patch}.${label}`,
  // semver is OK in "version_name"
  version_name: version,
  author: 'Qwik dev',
  minimum_chrome_version: '94',
  devtools_page: 'chrome/devtools.html',
  content_scripts: [
    {
      matches: ['*://*/*'],
      js: ['chrome/content.ts'],
      run_at: 'document_start',
    },
  ],
  background: {
    service_worker: 'chrome/background.ts',
    type: 'module',
  },
  permissions: [
    'webNavigation'
  ],
  action: {
    default_icon: {
      '16': 'assets/icons/gray-16.png',
      '32': 'assets/icons/gray-32.png',
      '48': 'assets/icons/gray-48.png',
      '128': 'assets/icons/gray-128.png',
    },
    default_title: 'Qwik Devtools',
  },
  icons: {
    '16': 'assets/icons/16.png',
    '32': 'assets/icons/32.png',
    '48': 'assets/icons/48.png',
    '128': 'assets/icons/128.png',
  },
}));
