# Design System Consistency Audit

## What is working

- Shared primitives exist for:
  - `PrimaryButton`
  - `SecondaryButton`
  - `StatusPill`
  - `NavSelector`
  - `FormElement`
  - `Modal`
  - `ToastNotification`
- The global shell is clearly defined in `AppChrome`.
- Color and surface usage are broadly consistent across the app.

## Issues

### 1. The new sample flow is structurally off-system

- The new sample wizard does not use `AppChrome`.
- It duplicates a top bar, status pill, notification chip, avatar chip, and stepper rail inside the page itself.
- Relevant files:
  - `src/App.jsx:180-205`
  - `src/pages/NewSampleCustomerDetailsPage.jsx:180-215`
  - `src/pages/NewSampleCustomerDetailsPage.jsx:517-540`

Why this matters:

- A shared shell should own the global chrome.
- Page-local chrome makes the flow feel separate from the rest of the product.
- It also guarantees future drift in spacing, labels, and action placement.

### 2. The sample details review dialog bypasses the shared modal primitive

- `SampleDetailsPage` contains a custom `ReviewRequestModal`.
- There is already a reusable `Modal` component in `src/components/Modal/Modal.jsx`.
- Relevant files:
  - `src/pages/SampleDetailsPage.jsx:256-320`
  - `src/components/Modal/Modal.jsx:8-55`

Why this matters:

- This is a design-system break, not just a code style issue.
- The dialog needs to match the app's established modal language.
- Duplicating modal structure makes every future modal harder to keep aligned.

### 3. Variants are present, but usage is still too ad hoc

- `PrimaryButton` supports size and semantic variants, but many screens still rely on page-specific CSS for width and spacing.
- `SecondaryButton` has a clear sizing API, but several pages override it with custom classes for isolated button behavior.
- Relevant files:
  - `src/components/PrimaryButton/PrimaryButton.jsx:1-53`
  - `src/components/SecondaryButton/SecondaryButton.jsx:1-47`

Observed pattern:

- Page CSS is compensating for component contracts that should probably be richer.
- That is a signal that the system wants more reusable button and layout variants.

### 4. Shared form primitives are decent, but page-specific form wrappers are still heavy

- `FormElement` covers the common field shapes.
- However, many pages still add their own layout rules around the field.
- Example areas:
  - `EnvironmentDataPage`
  - `NewSampleCustomerDetailsPage`
  - `AllSamplesListingPage`
  - `TestRequestsListingPage`

Why this matters:

- The more pages wrap the same field differently, the less reliable the visual language becomes.
- The risk is especially high for labels, helper text, and error text.

## Design System Priority

1. Standardize shell ownership.
2. Route all modal surfaces through the shared modal primitive.
3. Expand button and field variants where page CSS is repeatedly compensating.
4. Reduce duplicated header/action patterns across flows.
