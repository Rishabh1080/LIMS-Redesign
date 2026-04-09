# Codex Mistakes and Implementation Rules

This file is a living guide for future UI work in this repo. It captures the reasoning mistakes to avoid, not just the specific bugs that were introduced.

## 1. Do not invent a new page layout when a standard page shell already exists

If a page is meant to live inside the existing app chrome, it should follow the same page-header and content-spacing conventions as the rest of the application.

### What to check first

- Reuse the existing `AppChrome` shell.
- Look for the nearest comparable page and copy its layout structure.
- Confirm whether the page header is meant to use:
  - the shared `pageHeader` slot,
  - a sticky shell header,
  - or a custom page-local header.

### What went wrong conceptually

I assumed the page could have its own header wrapper and spacing rules without affecting consistency. That is usually how drift starts: the new screen still "works", but it no longer belongs visually to the system.

### Rule of thumb

- If other pages use a shared header height, border, and padding pattern, follow that exact pattern.
- Do not add extra wrappers or duplicate padding unless there is a specific, documented reason.

## 2. Never double-apply spacing from multiple layers

Spacing should come from one intentional layer, not two accidental ones.

### Common mistake

- Adding padding to a custom wrapper.
- Keeping Bootstrap `px-*` or similar container padding in the child at the same time.
- Result: the page looks "off" even though each individual value seems reasonable.

### What went wrong conceptually

I treated the wrapper and the container as independent, when they were actually stacking together. That means the visual result was no longer controlled by one source of truth.

### Rule of thumb

- If a page already has a container with horizontal padding, do not add another matching padding on the parent.
- If a page header already has left/right padding, the inner container should usually be `px-0` unless the design explicitly wants nested spacing.
- Before adding spacing, inspect the nearest existing page and match its structure first.

## 3. Button spacing belongs in the shared component, not in page-specific CSS

Button padding rules should live in the button component itself, because they are part of the component contract.

### Correct model

- No icon: balanced horizontal padding on both sides.
- Leading icon: icon side gets the tighter inset, text side gets the wider inset.
- Trailing icon: reverse the above.
- Icon only: square button with centered icon.

### What went wrong conceptually

I patched the page to compensate for button spacing instead of fixing the button component. That creates fragile behavior because every new page has to remember the workaround.

### Rule of thumb

- If a button variant has a spacing rule, bake it into the shared button component.
- Do not use page-specific CSS to "fix" button internal padding unless the page is intentionally overriding the component design.
- Icon-only buttons should always be implemented as a square control with centered content, not a stretched button with extra padding.

## 4. Icon-only buttons must be square by definition

An icon-only button is not a normal button with hidden text. It is a different sizing case.

### Required behavior

- Equal width and height.
- Icon centered horizontally and vertically.
- No leftover label padding.
- Works consistently for destructive, primary, secondary, and close buttons.

### What went wrong conceptually

I let the icon-only state inherit label-button padding rules, which produced odd dimensions and off-center content. That is a component design problem, not a page styling problem.

### Rule of thumb

- Square sizing for icon-only buttons should be enforced by the component.
- If the visual size is wrong, fix the shared component instead of nudging the page.

## 5. Modal action rows should follow the app's existing dialog pattern

Do not invent a footer alignment rule when the app already has modal examples.

### Preferred pattern in this repo

- Title row at the top.
- Form content in the middle.
- Action row at the bottom.
- Cancel on the left, primary action on the right.

### What went wrong conceptually

I initially picked a footer alignment style without checking how the other dialogs were structured. That breaks UI predictability even when the modal technically functions.

### Rule of thumb

- Study the closest existing modal before building a new one.
- Match its footer alignment, title spacing, and control sizes unless there is a strong reason not to.

## 6. Shared component fixes should be preferred over page-local overrides

If multiple pages use the same primitive, the fix should usually happen in the primitive.

### Examples

- Button icon spacing
- Button icon-only sizing
- Shared form-control alignment
- Shared modal control placement

### What went wrong conceptually

I initially solved a component behavior issue at the page layer. That is the wrong abstraction level because the bug would reappear anywhere else the component is used.

### Rule of thumb

- When the symptom is visible in a shared primitive, patch the primitive.
- Only override at the page level when the page is intentionally deviating from the system.

## 7. Prefer consistency over novelty for implementation details

The goal is not just to make a new page work. The goal is to make it feel like it was already part of the product.

### Implementation checklist for future pages

- Reuse the existing app shell.
- Match the nearest page header.
- Match the nearest modal pattern.
- Use shared button behavior, not per-page padding hacks.
- Avoid double-padding from nested wrappers.
- Keep destructive actions visually consistent with the rest of the app.
- Verify icon-only controls render as squares.

## 8. A good final check before shipping UI changes

Before considering a UI task done, ask:

- Did I reuse the existing layout pattern?
- Did I accidentally stack spacing from two sources?
- Did I change a shared component when the problem was systemic?
- Would the same code look correct if reused on another page?

If the answer to any of those is "not sure", the change probably needs one more pass.

