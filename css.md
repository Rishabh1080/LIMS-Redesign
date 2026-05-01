# Page Header Audit

Scope used for this audit:
- Count only the right-side page header actions.
- Ignore back buttons, status pills, breadcrumbs, tab rails, and version selectors.
- Target pattern: `Primary`, `Secondary`, `More (3-dot)` from left to right.

## Summary

Compliant or acceptable:
- `Sample Workspace`: 1 primary.
- `Materials`: 1 primary.
- `Environment Data`: 1 primary.
- `Leave Records`: 1 primary.
- `Trainings`: no CTA.
- `Training Attendance`: no CTA.
- `All Samples`: tab header only, no CTA.
- `Requests for me`: tab header only, no CTA.
- `Test Requests`: tab header only, no CTA.
- `Test Requests Listing`: no CTA.
- `COA Report Selection`: 1 primary + 1 secondary, already ordered correctly.
- `Sample Details`: dynamic, but generally follows `primary -> secondary -> more`.

Inconsistent:
- `Material Details`: has 1 primary + 1 secondary, but order is `secondary -> primary`.
- `Instrument Management`: has 1 primary + 1 secondary, but order is `secondary -> primary`.
- `Instrument Details`: had 1 primary + 2 secondary, no overflow, and order was `secondary -> secondary -> primary`.
- `TR Details`: some states have 2 secondary buttons and no overflow.
- `Datasheet`: has 1 primary + 2 secondary buttons, no overflow, and order is `secondary -> secondary -> primary`.
- `Temp Report`: has 2 secondary actions + 3-dot menu, no primary.
- `Finalised Report`: has 2 secondary actions + 3-dot menu, no primary.

## Page By Page

| Page | Current header actions | Audit result |
| --- | --- | --- |
| `Sample Workspace` | `New Sample` | OK |
| `All Samples` | none in page header, tab rail only | OK |
| `Requests for me` | none in page header, tab rail only | OK |
| `Test Requests` | none in page header, tab rail only | OK |
| `Test Requests Listing` | none | OK |
| `Sample Details` | varies by state, but includes `More` and usually keeps primary first | Mostly OK |
| `TR Details` | `Add Method`, `Add Results`, `Send for Review` depending on state | Not OK |
| `Datasheet` | `Calculate`, `Refresh`, `Save` | Not OK |
| `COA Report Selection` | `Finalise`, `Generate` | OK |
| `Temp Report` | `Print`, `Finalize`, `More` | Not OK |
| `Finalised Report` | `Print`, `Edit Parameters`, `More` | Not OK |
| `Materials` | `New Material` | OK |
| `Material Details` | `Print QR`, `New Transaction` | Not OK, wrong order |
| `Environment Data` | `Add Data Log` | OK |
| `Leave Records` | `Add record` | OK |
| `Instrument Management` | `Calibration Schedule`, `New Instrument` | Not OK, wrong order |
| `Instrument Details` | `Print QR`, `Edit`, `New Service` | Not OK, wrong count and wrong order |
| `Trainings` | none | OK |
| `Training Attendance` | none | OK |

## Concrete Inconsistencies

1. Multiple pages still place the secondary action before the primary action.
Affected pages:
- `Material Details`
- `Instrument Management`
- `Instrument Details`
- `Datasheet`

2. Some headers exceed the desired action count by showing more than one secondary action without moving extras into the overflow menu.
Affected pages:
- `Instrument Details`
- `TR Details`
- `Datasheet`
- `Temp Report`
- `Finalised Report`

3. Some report-style headers rely on secondary-only actions and never surface a primary CTA.
Affected pages:
- `Temp Report`
- `Finalised Report`

4. Action architecture is inconsistent across detail pages.
Examples:
- `Sample Details` already uses `MoreActionButton`.
- `Instrument Details` previously kept `Edit` as a visible secondary instead of putting it into overflow.
- `TR Details` still exposes multiple direct secondaries.
