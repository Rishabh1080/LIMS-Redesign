# Codex Working Guide

## Goal

Recreate the Figma designs in code as faithfully as possible.

This project is not a redesign exercise.
It is a design-to-code replication exercise.

The standard is:

- Read the Figma file carefully
- Understand the frame structure correctly
- Rebuild the screen in code with high visual fidelity
- Reuse the design system and shared shell where appropriate
- Do not invent new layouts, spacing systems, or component behavior

## Core Expectations

- Treat Figma as the source of truth
- Build exact replicas, not interpretations
- Match spacing, sizing, alignment, hierarchy, borders, shadows, radii, and typography as closely as possible
- Use React for structure
- Use Bootstrap 5 for layout, spacing, grid, and standard structural patterns
- Use custom CSS only where Bootstrap is not enough to match Figma accurately
- Keep code maintainable, but do not simplify away visible design details

## Shared Product Rules

- This product is a single app shell, not a set of unrelated standalone pages
- The sidebar is shared
- The global header is shared
- The main shell should remain consistent across pages in the same flow unless Figma clearly shows otherwise
- Only the inner page header and content region should change between screens/states when that is how the design works

### Current Shell Understanding

- `Sample Workspace`, `New Sample` flow, and `Sample Details` belong to the same product shell
- Sidebar and global header should not be reimplemented separately for each page unless Figma explicitly requires a different shell
- If a page is really a step/state within an existing flow, implement it inside that flow instead of creating a fake standalone page

## New Sample Flow Rules

- `New Sample-Customer Details`
- `New Sample-Basic Details`
- `New Sample-Product Details`
- `New Sample-Additional Details`

These are not separate pages.
They are sections of one form flow.

Expected behavior:

- Same overall shell
- Same wizard container
- Stepper updates based on current section
- `Next` and `Previous` move between sections
- Footer remains anchored to the bottom of the form area
- Scrolling happens inside the form stage/content area, not by pushing the footer out

## Sample Details Page Rules

- `Sample Details Page (new created)` is part of the same app shell
- The sidebar remains consistent
- The global header remains consistent
- The page header beneath the global header changes to the sample details header
- The toast appears from the bottom and disappears after 5 seconds

## Design System Rules

- The design system namespace is `smplfy`
- Reusable design-system components should be implemented as actual components, not page-local lookalikes
- If a component exists in the Figma assets/library, inspect it before implementing
- Variants are intentional and should be respected in code

## What To Do Before Coding

1. Identify whether the target is:
   - a standalone screen
   - a page inside the shared shell
   - a state/step inside an existing flow
2. Read the Figma frame structure carefully
3. Ignore irrelevant wrapper layers, but preserve meaningful parent-child structure
4. Reuse existing code components if they correctly map to the Figma component
5. If a shared shell/component already exists, extend it instead of duplicating it

## What You Must Not Do

- Do not redesign the UI
- Do not “improve” the visual design unless explicitly asked
- Do not make broad style passes based on vibes
- Do not create separate page implementations for screens that are really states inside one shell
- Do not duplicate the sidebar/global header per page unless Figma explicitly shows different shells
- Do not generalize from one variant of a component to all variants
- Do not silently guess when the Figma structure is ambiguous
- Do not say something is pixel-perfect unless it has actually been validated against Figma
- Do not rely only on screenshots if the live frame/layer data is available

## When There Is Ambiguity

Ask only if the ambiguity affects structure or behavior in a meaningful way.

Examples:

- whether something is a separate page or part of the same flow
- whether a changed behavior request overrides the original Figma behavior
- whether a component variant in Figma appears inconsistent with its naming

Do not ask vague open-ended questions.
Ask one concrete question only when necessary.

## Fidelity Standard

“Close enough” is not enough for this project.

When implementing from Figma:

- check paddings
- check icon sizes
- check button heights
- check line-heights
- check border radii
- check border colors
- check spacing between regions
- check whether the content scroll area is the correct container
- check whether headers/footers are fixed or scrolling
- check whether the shell is shared or duplicated incorrectly

## Preferred Workflow

1. Read the exact Figma frame/component
2. Understand structure correctly
3. Implement the layout
4. Implement the shared components/states correctly
5. Compare visually against Figma
6. Correct mismatches
7. Only then call it done

## If Figma Access Fails

If live Figma inspection is blocked by rate limits or tool issues:

- say so clearly
- do not pretend the page is based on layer-by-layer inspection if it is not
- use the best available screenshot/context only as a fallback
- retry live inspection when possible before making high-confidence fidelity claims

## Communication Rules For This Project

- Be direct
- Be honest about uncertainty
- If something was implemented incorrectly, say so plainly
- Do not overstate fidelity
- Keep updates useful and specific
- Prefer “I’m fixing X because Y is wrong” over generic progress messages

## Success Definition

Success means:

- the code structure matches the product structure
- shared shell behavior is correct
- shared design-system components are reused correctly
- target Figma frames are reproduced faithfully
- visual differences are small, deliberate, and justified

Failure means:

- duplicated shell implementations
- inferred layouts that contradict Figma
- component states/variants that are only partially implemented
- visible spacing or hierarchy drift
- claiming fidelity without actually validating it
