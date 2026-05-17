# PostHog Setup For LIMS V3

This project already has the PostHog SDK wired in. Follow this checklist to connect it to your PostHog account, run the app, create the A/B test, and view the results.

Official docs:

- React setup: https://posthog.com/docs/libraries/react
- Experiments: https://posthog.com/docs/experiments
- Funnels: https://posthog.com/docs/product-analytics/funnels
- Trends: https://posthog.com/docs/product-analytics/trends/overview
- Session replay privacy: https://posthog.com/docs/session-replay/privacy

## What Is Already Implemented

Installed packages:

```bash
posthog-js
@posthog/react
```

Files already changed:

- `src/analytics/posthog.js`: initializes PostHog, handles feature flag variants, masks session replay inputs, and exposes event helpers.
- `src/main.jsx`: wraps the app in `PostHogProvider` when a token exists.
- `src/App.jsx`: sends pageview events when the app page changes.
- `src/pages/NewSampleCustomerDetailsPage.jsx`: sends detailed sample form events.
- `.env.example`: documents the required environment variables.

Important: the app currently records the assigned `form_variant`, but both variants still render the same form UI until Form B is implemented. When the second sample creation form is built, use the existing `formVariant` value in `NewSampleCustomerDetailsPage.jsx` to decide which UI to show.

## 1. Create A PostHog Project

1. Go to https://app.posthog.com
2. Sign up or log in.
3. Create a new organization/workspace if PostHog asks for one.
4. Create a project named something like:

```txt
LIMS V3 Internal UX Tests
```

5. Choose the region you want to store data in.
6. Open the project.
7. Go to Project settings.
8. Copy the Project API key.
9. Copy the API host shown by PostHog.

The Project API key is safe to use in frontend code. Do not use a personal API key here.

## 2. Add Local Environment Variables

Create a file named `.env.local` in the project root:

```bash
VITE_PUBLIC_POSTHOG_TOKEN=your_project_api_key_here
VITE_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
VITE_PUBLIC_SAMPLE_FORM_EXPERIMENT_FLAG=sample-creation-form-experiment
VITE_POSTHOG_DEBUG=false
```

Use the host from your PostHog project settings. For EU projects, PostHog may give you a different host.

Do not commit `.env.local`. It is ignored by `.gitignore`.

## 3. Run The App

Install dependencies if needed:

```bash
npm install
```

Start the local dev server:

```bash
npm run dev -- --host 127.0.0.1
```

Open:

```txt
http://127.0.0.1:5173/
```

If the server is already running, stop it and restart after editing `.env.local`, because Vite reads env vars at startup.

## 4. Generate Test Analytics Events

In the app:

1. Navigate to the New Sample flow.
2. Click into fields.
3. Change a few field values.
4. Move between steps with Next and Previous.
5. Try canceling once.
6. Try completing once.

To force a specific variant locally, open one of these URLs:

```txt
http://127.0.0.1:5173/?sampleFormVariant=form-a
http://127.0.0.1:5173/?sampleFormVariant=form-b
```

The override is saved in local storage. If you want to reset it, clear the browser's local storage for `127.0.0.1`.

## 5. Confirm Events Are Arriving

In PostHog:

1. Open your project.
2. Go to Activity or Live Events.
3. Interact with the local app.
4. Watch for incoming events.

Expected event names:

```txt
$pageview
sample_creation_flow_dashboard_landed
sample_creation_flow_dashboard_navigation_clicked
sample_creation_flow_workspace_viewed
sample_creation_flow_new_sample_clicked
sample_creation_flow_variant_assigned
sample_creation_flow_submit_clicked
sample_creation_flow_create_resolved
sample_creation_flow_sample_details_opened
sample_creation_flow_success_toast_shown
sample_form_experiment_assigned
sample_form_started
sample_form_step_viewed
sample_form_step_completed
sample_form_completed
sample_form_cancelled
sample_form_abandoned
sample_form_field_focused
sample_form_field_blurred
sample_form_field_changed
sample_form_field_reedited
sample_form_validation_failed
sample_form_hesitation_detected
sample_form_backtracked
sample_form_step_jumped
sample_form_parameter_changed
```

Useful event properties:

```txt
form_name
form_variant
experiment_flag
form_session_id
mode
parent_label
step_index
step_name
elapsed_ms
total_duration_ms
step_duration_ms
idle_before_action_ms
field_key
field_type
changed_field_count
repeatedly_edited_fields
missing_required_fields
parameter_count
selected_parameter_count
sample_creation_flow_session_id
sample_creation_flow_elapsed_ms
sample_creation_flow_entry_page
```

The implementation does not send actual form values. It sends field keys, timings, counts, and interaction patterns.

## 6. Create The A/B Experiment

In PostHog:

1. Go to Experiments.
2. Create a new experiment.
3. Name it:

```txt
Sample Creation Form A/B Test
```

4. Use this feature flag key:

```txt
sample-creation-form-experiment
```

5. Add two variants:

```txt
form-a
form-b
```

6. Set rollout to your internal users only if you have user identification or person properties configured.
7. If you do not have user identification yet, keep the test internal by only running it in the internal environment or internal deployment.
8. Set the primary metric to the event:

```txt
sample_form_completed
```

9. Set the goal as increasing conversions.
10. Use `sample_form_started` as the start/conversion context when creating supporting funnel insights.

Recommended secondary metrics:

- Lower `sample_form_cancelled`
- Lower `sample_form_abandoned`
- Lower `sample_form_validation_failed`
- Lower `sample_form_hesitation_detected`
- Lower average `total_duration_ms` on `sample_form_completed`
- Lower average `step_duration_ms` per step
- Fewer `sample_form_field_reedited` events

## 7. Build The Key Insights

### Full Sample Creation Journey

Go to Product Analytics, create a new Funnel, and add:

```txt
sample_creation_flow_dashboard_landed
sample_creation_flow_dashboard_navigation_clicked
sample_creation_flow_workspace_viewed
sample_creation_flow_new_sample_clicked
sample_form_started
sample_creation_flow_submit_clicked
sample_creation_flow_sample_details_opened
sample_creation_flow_success_toast_shown
```

Break down by:

```txt
form_variant
```

If you want the cleanest current-flow funnel before Form B exists, skip the `form_variant` breakdown and look at total conversion first.

### Completion Funnel

Go to Product Analytics, create a new Funnel, and add:

```txt
sample_form_started
sample_form_step_completed
sample_form_completed
```

Break down by:

```txt
form_variant
```

This shows which form has a better completion rate.

### Step Drop-Off Funnel

Create a Funnel with:

```txt
sample_form_started
sample_form_step_viewed
sample_form_step_completed
sample_form_completed
```

Filter or break down by:

```txt
step_name
form_variant
```

This helps identify which step causes drop-off.

### Average Completion Time

Create a Trends insight:

Event:

```txt
sample_form_completed
```

Aggregation:

```txt
Average of property total_duration_ms
```

Break down by:

```txt
form_variant
```

This shows which form is faster to complete.

### Confusion Signals

Create a Trends insight with these events:

```txt
sample_form_hesitation_detected
sample_form_field_reedited
sample_form_backtracked
sample_form_validation_failed
sample_form_cancelled
```

Break down by:

```txt
form_variant
step_name
field_key
```

This gives a practical proxy for confusion.

### Field Friction

Create a Trends insight:

Event:

```txt
sample_form_field_reedited
```

Break down by:

```txt
field_key
form_variant
```

Fields with many repeated edits are likely unclear, too hard to answer, or placed too early.

## 8. Use Session Replay

In PostHog:

1. Go to Session Replay.
2. Filter recordings by event.
3. Start with these filters:

```txt
sample_form_hesitation_detected
sample_form_cancelled
sample_form_abandoned
sample_form_completed
```

4. Watch a few sessions for each `form_variant`.

What to look for:

- Users stopping for a long time before clicking Next.
- Users repeatedly editing the same field.
- Users going back to previous steps.
- Users clicking buttons or areas that do nothing.
- Users canceling after a specific step.

Inputs are masked in session replay via `maskAllInputs: true`, and the analytics events do not include form values.

## 9. Recommended Decision Rule

Do not pick the winner only from completion rate. Use this scorecard:

```txt
Primary:
- Higher sample_form_completed / sample_form_started

Secondary:
- Lower average total_duration_ms
- Lower sample_form_cancelled
- Lower sample_form_abandoned
- Lower sample_form_validation_failed
- Lower sample_form_hesitation_detected
- Lower sample_form_field_reedited

Qualitative:
- Fewer obvious confusion moments in session replay
```

If Form B is faster but has more failures, it is probably not better. If Form B has the same completion rate but fewer hesitation and re-edit events, it may still be the better UX.

## 10. Production Checklist

Before using this with real users:

1. Confirm `.env.local` works locally.
2. Add the same env vars to your hosting provider.
3. Confirm events appear in PostHog Live Events.
4. Confirm session replay masks sensitive inputs.
5. Confirm no event properties contain customer names, sample IDs, addresses, descriptions, uploaded filenames, or lab-sensitive data.
6. Create the experiment in PostHog.
7. Make sure Form A and Form B actually render different UI.
8. Run a small internal test first.
9. Review session recordings for privacy before wider rollout.
10. Freeze the experiment definition while collecting data.

## Troubleshooting

No events in PostHog:

- Restart Vite after creating `.env.local`.
- Check that `VITE_PUBLIC_POSTHOG_TOKEN` is set.
- Check that `VITE_PUBLIC_POSTHOG_HOST` matches your PostHog project region.
- Disable ad blockers for localhost.
- Open browser devtools and check for blocked requests to PostHog.

Events appear, but experiment does not:

- Confirm the feature flag key is exactly:

```txt
sample-creation-form-experiment
```

- Confirm variants are exactly:

```txt
form-a
form-b
```

- Use the URL override to test:

```txt
?sampleFormVariant=form-a
?sampleFormVariant=form-b
```

Session replay missing:

- Confirm Session Replay is enabled in PostHog project settings.
- Confirm you are not blocking PostHog requests in the browser.
- Interact with the page for long enough to create a recording.

Unexpected sensitive data:

- Stop the test.
- Check event properties in Live Events.
- Add `data-analytics-sensitive="true"` to any sensitive text container.
- Keep actual form values out of `trackEvent` calls.
