# UI/UX Audit Overview

Scope for this first pass:

- `Samples Workspace`
- `New Sample` flow
- `Sample Details`
- `Environment Data`
- `Requests for Me`
- `All Samples`
- `Test Requests`
- report-selection/report-view screens

## Top Findings

1. The app mixes shared shell patterns with page-local shells.
   - `AppChrome` is used on most pages, but the new sample flow uses its own top bar and rail instead of the shared shell.
   - This increases drift risk and makes the product feel less like one system.

2. The modal story is inconsistent.
   - The app has a reusable `Modal` primitive, but `SampleDetailsPage` still uses a custom `ReviewRequestModal`.
   - That custom modal is missing the close button pattern, keyboard behavior, and structural consistency the shared modal already sets up.

3. Several screens are fixed-width or desktop-first.
   - Sample details report cards, the new sample wizard, and some listing cards use hard-coded column widths.
   - These layouts will become fragile as soon as the viewport narrows or content grows.

4. Component reuse is uneven.
   - Shared primitives exist for buttons, pills, selectors, and form fields.
   - But page-local wrappers still compensate with custom widths and spacing, which suggests the primitives are not yet expressive enough.

## Audit Files

- `01-design-system-consistency.md`
- `02-responsive-risks.md`
- `03-modal-and-flow-patterns.md`
- `04-component-efficiency.md`

## Verdict

The product is directionally consistent, but the consistency is mostly visual, not structural.

The main risk is not one broken screen. It is that repeated local exceptions are slowly turning the UI into a set of similar-looking one-offs.
