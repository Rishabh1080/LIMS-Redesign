# Responsive Risk Audit

## High-Risk Layouts

### 1. Sample details report sections are fixed-width

- The report card header and body use hard-coded grid tracks that add up to a desktop-only width.
- The audit rows also use a fixed three-column grid with a very wide message column.
- Relevant files:
  - `src/pages/sample-details-page.css:224-340`
  - `src/pages/sample-details-page.css:341-439`

Why this is risky:

- These sections will be brittle on smaller laptops and tablets.
- Long content will either clip, overflow, or force awkward wrapping.

### 2. The new sample wizard is built around a fixed desktop canvas

- The page itself is set to `100vh`.
- The main card is fixed to the viewport height.
- The body uses a fixed two-column rail/content split.
- Relevant file:
  - `src/pages/new-sample-customer-details.css:1-118`

Why this is risky:

- This is a classic desktop-first trap.
- The layout may look fine on a large monitor but becomes difficult to operate when the viewport height is constrained.

### 3. The parameter table inside the new sample flow is not truly responsive

- The parameter table uses a fixed 7-column grid.
- The mobile fallback still depends on horizontal overflow instead of a genuinely reflowing layout.
- Relevant file:
  - `src/pages/new-sample-customer-details.css:336-465`

Why this is risky:

- Users on small screens will need to pan a dense table horizontally.
- That is especially painful inside a wizard step where the user is already task-focused.

### 4. Environment data relies on table overflow instead of responsive row behavior

- The table has a `min-width: 920px`.
- On smaller widths it shrinks only to `860px`.
- Relevant file:
  - `src/pages/environment-data-page.css:42-52`
  - `src/pages/environment-data-page.css:176-188`

Why this is risky:

- This is acceptable only if horizontal scrolling is an intentional, obvious interaction.
- Right now it reads more like a workaround than a designed mobile behavior.

### 5. Test request and sample listing rows are dense and mostly width-bound

- Test request cards use fixed grid tracks and fixed-width action columns.
- Sample listing cards also rely on column sizing plus several explicit max widths.
- Relevant files:
  - `src/pages/test-requests-listing-page.css:113-129`
  - `src/pages/test-requests-listing-page.css:182-199`
  - `src/pages/all-samples-listing-page.css:290-377`

Why this matters:

- These pages will likely degrade before they truly break.
- The degradation will show up as cramped content, overly long rows, or hidden information.

## Lower-Risk, But Worth Watching

- `RequestsForMe` has a better mobile fallback than some other screens, but the card layout is still rigid on desktop.
- `All Samples` has good overflow handling for filter chips and tabs, but the search and card composition still lean heavily on desktop proportions.

## Responsive Priority

1. Convert fixed desktop widths into fluid min/max structures where possible.
2. Add more compact mobile row patterns for table-like screens.
3. Treat horizontal scrolling as an intentional interaction, not an accidental fallback.
4. Test the new sample flow on short viewports, not just narrow ones.
