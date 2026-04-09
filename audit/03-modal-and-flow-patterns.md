# Modal and Flow Pattern Audit

## Modal Findings

### 1. The review request modal is the clearest inconsistency in the app

- `SampleDetailsPage` defines its own modal instead of using the shared modal primitive.
- It also omits a dedicated close button in the title bar.
- Relevant files:
  - `src/pages/SampleDetailsPage.jsx:256-320`
  - `src/pages/sample-details-page.css:129-220`

Why this matters:

- Users will notice the modal behaves slightly differently from other dialogs.
- More importantly, developers will copy this pattern unless it is corrected at the primitive level.

### 2. The shared modal is a better base, but still not a complete interaction shell

- The shared modal has a backdrop, title row, body, and action slot.
- It does not yet show evidence of focus trapping, escape handling, or scroll locking in the component itself.
- Relevant file:
  - `src/components/Modal/Modal.jsx:8-55`

Why this matters:

- The dialog may look correct while still feeling incomplete for keyboard users.
- This is especially important because the app has several forms and confirmation surfaces.

### 3. There are multiple modal styles across the app

- `EnvironmentDataPage` uses the shared `Modal`.
- `TrDetailsPage` uses a custom remnant modal.
- `AllSamplesListingPage` and `SampleWorkspacePage` use custom drawers.
- Relevant files:
  - `src/pages/EnvironmentDataPage.jsx:104-207`
  - `src/pages/TrDetailsPage.jsx:1-50`
  - `src/pages/sample-workspace-page.css:55-174`
  - `src/pages/all-samples-listing-page.css:179-284`

Interpretation:

- Not every overlay needs to be identical.
- But the app should choose a small number of canonical overlay patterns and reuse them consistently.

## Flow Findings

### 1. The new sample journey is modeled as a standalone page, not a shell-level flow

- `App.jsx` routes to `new-sample-customer-details` as a separate page.
- The content then re-creates a wizard shell inside the page.
- Relevant files:
  - `src/App.jsx:180-205`
  - `src/pages/NewSampleCustomerDetailsPage.jsx:1-520`

Interpretation:

- That is a flow architecture decision, not just a layout decision.
- If this is truly one onboarding flow, it should behave like one flow in the app shell.

### 2. Several other flows are already better structured

- `Sample Details`, `Test Requests`, `Datasheet`, `COA Report`, `Temp Report`, and `Finalised Report` all reuse `AppChrome`.
- That makes the new sample flow stand out as an exception.

## Modal and Flow Priority

1. Replace the custom review modal with the shared modal primitive.
2. Decide whether the new sample wizard belongs inside `AppChrome`.
3. Standardize overlay patterns for drawers vs dialogs.
4. Add keyboard and escape behavior checks for all modal-like surfaces.
