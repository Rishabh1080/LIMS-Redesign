import React from 'react';
import ReactDOM from 'react-dom/client';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { PostHogProvider } from '@posthog/react';
import './design-system.scss';
import App from './App';
import { initAnalytics } from './analytics/posthog';
import { initSitepingFeedbackWidget } from './siteping';
import './styles.scss';

const posthogClient = initAnalytics();
const app = posthogClient ? (
  <PostHogProvider client={posthogClient}>
    <App />
  </PostHogProvider>
) : (
  <App />
);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {app}
  </React.StrictMode>,
);

initSitepingFeedbackWidget();
