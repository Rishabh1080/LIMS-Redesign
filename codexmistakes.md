# Codex Rules

Read this before every UI change in this repo.

## Hard rules

- Use the existing app shell.
- Match the nearest existing page structure before inventing new layout.
- Before writing any code for a UI change, read the relevant Figma file/page first and follow its layout, structure, and modal hierarchy.
- Use the repo's design system components wherever possible instead of recreating UI primitives by hand.
- Do not add extra wrappers if they create extra spacing.
- Do not stack spacing from multiple layers.
- Fix shared component behavior in the shared component.
- Do not patch shared component bugs with page-only CSS unless the page is intentionally different.
- If a UI element is rendered by a shared/global component such as `AppChrome`, do not "fix it" inside a single page. Trace ownership first, then change it at the shared source.
- Icon-only buttons must be square and centered.
- Button spacing belongs in the shared button component.
- Modals must follow the repo’s existing dialog pattern.
- Keep destructive and status controls visually consistent across pages.
- Prefer reuse over novelty.

## Layout rules

- Reuse `AppChrome` unless the screen is intentionally outside the shell.
- Match the nearest page header, padding, and border pattern.
- Use one source of truth for horizontal spacing.
- Do not duplicate container padding in nested wrappers.
- Keep global shared primitives stable across all pages.

## Verification rules

- Check the nearest comparable page before changing layout.
- Check the shared primitive before adding a page override.
- If a UI detail appears on multiple pages, fix the shared primitive first.
- Before changing styles, identify where the element is actually rendered. Never assume the current screen owns the UI just because the bug is visible there.
- Before shipping, verify the same code would still look correct on another page.
- Do not assume unrequested constraints such as fixed heights, max heights, or preserved total card size.
- If a requested change depends on a structural decision that was not specified, ask before implementing it.
- Do not alter unrelated spacing to compensate for an assumed layout constraint.

## Status controls

- Do not add spacing to `status-badge` unless Figma shows it.
- Do not add borders, radius, or card chrome unless Figma shows it.
- Do not assume visual polish that is not in the Figma layer tree.

## Response rule

- For every UI message from the user, consult this file first and follow it exactly.
