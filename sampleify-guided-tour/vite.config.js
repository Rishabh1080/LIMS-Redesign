import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const here = path.dirname(fileURLToPath(import.meta.url));
// The LIMS screens are the prototype's own code. Inside the LIMS V3 project that
// is the live ../src, so they can't drift from it. In the published repo ../src
// doesn't exist, so the vendored copy in prototype/ (`npm run vendor`) is used.
// SGT_VENDORED=1 forces the vendored copy.
const liveSrc = path.resolve(here, '../src');
const useLive = !process.env.SGT_VENDORED && fs.existsSync(path.join(liveSrc, 'pages'));
const prototypeSrc = useLive ? liveSrc : path.resolve(here, 'prototype/src');
const prototypeAssets = useLive ? path.resolve(here, '../assets') : path.resolve(here, 'prototype/assets');

// Standalone harness only. The host app never uses this file.
// `base: './'` keeps every asset URL relative, so `dist/` can be dropped into
// any static folder (e.g. a Next.js `public/tour/`) and still load.
export default defineConfig({
  base: './',
  plugins: [react()],
  resolve: {
    alias: [
      { find: /^@proto\/analytics\/posthog(\.js)?$/, replacement: path.resolve(here, 'src/proto/analyticsStub.js') },
      { find: '@proto', replacement: prototypeSrc },
      // Prototype pages render the tutorial's copy of AppChrome (trimmed sidebar,
      // visitor's lab name) wherever they import the original.
      { find: /^(\.\.\/)+components\/AppChrome\/AppChrome(\.jsx)?$/, replacement: path.resolve(here, 'src/proto/TutorialChrome.jsx') },
      // So the tutorial hears about test request approvals.
      { find: /^(\.\.\/)+components\/TestRequestApprovalActionModal(\.jsx)?$/, replacement: path.resolve(here, 'src/proto/TestRequestApprovalActionModal.jsx') },
      // No analytics from inside the tutorial.
      { find: /^(\.\.\/)+analytics\/posthog(\.js)?$/, replacement: path.resolve(here, 'src/proto/analyticsStub.js') },
    ],
    dedupe: ['react', 'react-dom', '@tabler/icons-react', 'echarts', 'bootstrap'],
  },
  css: {
    preprocessorOptions: {
      scss: { api: 'modern-compiler', quietDeps: true, silenceDeprecations: ['import', 'global-builtin', 'color-functions', 'mixed-decls'] },
    },
  },
  server: {
    port: 5310,
    fs: { allow: [here, prototypeSrc, prototypeAssets, path.resolve(here, '../node_modules')] },
  },
  // `npm run preview` serves dist/. ngrok hostnames are allowed so the build
  // can be shared with `ngrok http 5320`.
  preview: {
    port: 5320,
    allowedHosts: ['.ngrok-free.app', '.ngrok-free.dev', '.ngrok.app', '.ngrok.dev'],
  },
});
