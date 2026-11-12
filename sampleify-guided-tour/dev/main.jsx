import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// The harness supplies fonts. In a host app, the host's own Inter / IBM Plex
// Mono (e.g. next/font's --font-inter / --font-plex) are picked up instead.
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/ibm-plex-mono/400.css';
import '@fontsource/ibm-plex-mono/500.css';
import { SampleifyGuidedTour } from '../src/index.js';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SampleifyGuidedTour
      config={{
        onEvent: (name, props) => {
          // eslint-disable-next-line no-console
          console.info('[sampleify-tour]', name, props);
        },
      }}
    />
  </StrictMode>,
);
