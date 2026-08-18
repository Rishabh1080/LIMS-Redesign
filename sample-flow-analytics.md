# Sample Flow Analytics

This is a zero-config, browser-local usability tracker for the New Sample flow.

## Run a test

1. Start the app normally with `npm run dev`.
2. Ask a participant to create a sample.
3. Open `/sample-flow-analytics.html` on the same origin and browser.
4. Review completion, drop-offs, hesitations, backtracks, revisited fields, and field focus time.
5. Use **Export JSON** if you want to keep or combine a participant's raw event file.

The report updates when refreshed. Data remains in that browser's local storage until **Clear test data** is used.

## Privacy and scope

The tracker records event names, timestamps, page/step names, field identifiers, durations, and interaction counts. It does not record typed values, dropdown selections, customer data, or sample data.

This is intended for a small moderated or internal usability test. Because it is local-only, it does not aggregate data across participants or devices automatically. Use the JSON export after each remote/device test if you need to retain those sessions.

For quick console access, `window.limsSampleAnalytics` exposes:

```js
limsSampleAnalytics.summary()
limsSampleAnalytics.download()
limsSampleAnalytics.clear()
```
