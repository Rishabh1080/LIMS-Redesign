# Component Efficiency Audit

## What is efficient today

- The app already has a usable set of shared primitives.
- Button, pill, selector, field, and toast patterns are centralized enough to avoid total duplication.

## Where efficiency breaks down

### 1. Pages still patch primitive gaps with local CSS

- Examples:
  - `new-sample-add-button`
  - `review-request-modal__cancel`
  - `environment-data-modal__cancel`
  - `workspace-filters-drawer__apply`
  - `all-samples-filters-drawer__apply`
- These are all signs that the shared button primitives are not expressive enough yet.

Why this matters:

- If every page needs its own special button sizing rule, the shared component API is incomplete.
- That creates maintenance overhead and visual inconsistency at the same time.

### 2. The app repeats the same shell logic in multiple places

- The global shell pattern is strong, but page-local headers repeat the same concepts:
  - back button
  - title
  - status chip
  - action cluster
  - breadcrumbs
- Relevant files:
  - `src/pages/SampleDetailsPage.jsx`
  - `src/pages/EnvironmentDataPage.jsx`
  - `src/pages/DatasheetPage.jsx`
  - `src/pages/TempReportPage.jsx`
  - `src/pages/FinalisedReportPage.jsx`
  - `src/pages/TestRequestsListingPage.jsx`

Why this matters:

- The codebase is paying a duplication tax every time one of these headers changes.

### 3. Some data layouts are simulated with static rows instead of reusable row components

- The sample details report and audit sections are built from literal arrays and hard-coded grids.
- Several listing screens do the same for table-like information.
- That is fine for a prototype, but it becomes expensive when the rows need richer states or interaction variants.

### 4. Variant coverage is incomplete

- Buttons have size and semantic variants, but not enough page-level states are expressed through the component API.
- `StatusPill` is better, but the status vocabulary is still page-specific in several places.
- `NavSelector` is solid, but tab-like navigation is manually rebuilt around it in more than one screen.

## Efficiency Recommendations

1. Extend shared button variants before adding more page-local button CSS.
2. Introduce a shared page-header pattern for the repeated back/title/action layout.
3. Extract common modal/drawer shell primitives.
4. Move repeated “table row” patterns into reusable components where the data model is stable.
