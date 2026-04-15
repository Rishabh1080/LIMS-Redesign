# Design Tokens

This file explains, in simple terms, what we are building and why.

It is a living document. We will update it as the Figma library and code implementation become more structured.

## Goal

We are building a **3-tier design token system** that keeps Figma and code aligned.

For the current phase, only the **primitive layer** is being sourced from Figma.

Existing semantic tokens in Figma are being ignored and will be redesigned in code first.

The main rule is:

- components should never use raw values directly
- components should never use primitive tokens directly
- components should use semantic meaning first

That gives us a clean chain:

`primitive -> semantic -> component`

## Why We Are Doing This

Right now, values like colors, radii, spacing, and font sizes can easily become inconsistent.

For example:

- one button might use `blue-500`
- another might use `blue-600`
- one input might use `8px` radius
- another might use `6px`

Even if those choices look "close enough", they create drift.

The token system fixes that by turning design decisions into named, reusable building blocks.

## The 3 Tiers

### 1. Primitive Tokens

Primitive tokens are the raw building blocks.

They do **not** describe usage. They only store actual values.

Examples:

- `color.blue.500 = #1379F0`
- `color.gray.300 = #E6E8EB`
- `radius.6 = 6`
- `space.16 = 16`
- `font-size.14 = 14`

Primitive tokens answer:

- what is the exact value?

They do **not** answer:

- where should this be used?

## Primitive Token Rule

Primitive tokens are allowed to hold raw values.

Everything above them should reference them by alias.

### 2. Semantic Tokens

Semantic tokens give the primitives meaning.

They describe a role in the system, not a raw value.

Examples:

- `color.text.default -> color.gray.800`
- `color.text.muted -> color.gray.600`
- `color.bg.brand -> color.blue.500`
- `color.border.default -> color.gray.300`
- `radius.control -> radius.6`
- `space.control.x -> space.16`

Semantic tokens answer:

- what is this for?

This is the layer most designers and developers should think in day to day.

### 3. Component Tokens

Component tokens describe how a specific component consumes semantic tokens.

Examples:

- `button.primary.default.bg -> color.bg.brand`
- `button.primary.default.text -> color.text.on-brand`
- `button.primary.default.border -> color.border.transparent`
- `button.primary.default.radius -> radius.control`
- `button.primary.default.padding-x -> space.control.x`
- `button.primary.default.padding-y -> space.control.y`

Component tokens answer:

- which semantic token should this exact component property use?

## Simple Example

Here is the same button decision across all three tiers:

### Primitive

- `color.blue.500 = #1379F0`

### Semantic

- `color.bg.brand -> color.blue.500`

### Component

- `button.primary.default.bg -> color.bg.brand`

This means:

1. the raw value lives only once
2. the semantic role stays stable
3. the component points to meaning, not a raw color

If the brand blue changes later, we update the primitive mapping and the component stays clean.

## What We Will Build First

We are starting with the **primitive layer from Figma**.

Current scope:

- import the 6 primitive color palettes from Figma
- document them in a canonical token file
- treat those imported values as the source for future semantic tokens
- ignore the current semantic token setup in Figma

Next planned scope after primitive import:

- add numeric primitives for radii, spacing, border widths, and sizing
- define the first semantic token library
- test the system on one component

## Initial Folder Strategy In This Repo

We are separating **source tokens** from **app-consumed styles**.

### Source of truth

- `design-system/`

This folder will hold:

- token documentation
- raw imported token files
- semantic token definitions
- component token definitions
- mapping notes between Figma and code

### App consumption

- `src/`

This will keep application CSS and components.

Later, we can decide whether token files should generate:

- CSS custom properties
- JSON for tooling
- both

## Current Naming Direction

We will use predictable, readable names.

Examples:

- `color.blue.500`
- `color.text.default`
- `color.bg.surface`
- `radius.control`
- `space.control.x`
- `button.primary.default.bg`

We should avoid:

- vague names like `primary-2`
- implementation-only names like `buttonBlue`
- raw values outside primitive files

## Naming Practices

The best naming rule for this system is:

- keep a fixed word order
- use full words for important concepts
- only add another axis when it adds real meaning

The pattern we are using in code is:

- `smplfy`
- layer
- component if needed
- category
- property
- role
- state or size

Examples:

- `--smplfy-semantic-color-background-primary`
- `--smplfy-semantic-color-text-on-primary`
- `--smplfy-component-button-color-background-primary-hover`
- `--smplfy-component-button-size-height-small`

This is intentionally long because the name should tell a developer what the token means without opening documentation.

### Naming Rules We Should Keep

- Prefer `background` over `bg` in the main token layer.
- Prefer `pressed` over `focus` when the value is really the pressed/active fill.
- Prefer `default`, `hover`, `pressed`, `disabled` for state naming consistency.
- Use `text.on-primary` for content placed on a strong filled surface.
- Use logical spacing words like `inline` and `block` instead of left/right/top/bottom when possible.
- Keep semantic tokens reusable across components.
- Keep component tokens explicit about which component property they map.

### When Names Are Getting Too Long

If a token name starts feeling unmanageable, the first fix should be to improve structure, not to shorten words.

Good fixes:

- move a concept to semantic so it can be reused
- split component-specific mappings into their own group
- use a consistent word order

Bad fixes:

- shortening `background` to `bg` everywhere
- shortening `destructive` to `dest`
- creating unclear names like `primary-2`

## Implementation Rules

- Raw values live only in primitive token files.
- Semantic tokens alias primitives.
- Component tokens alias semantic tokens.
- A component may only point directly to a primitive if we explicitly decide that the primitive itself is the semantic role, which should be rare.
- Figma and code naming should stay as close as possible.

## How Semantic And Component Tokens Work Together

This is the key distinction:

- semantic tokens describe a reusable design role
- component tokens describe how one component property uses that role

### What Should Live In Semantic Tokens

Semantic tokens should answer questions like:

- what is our main filled brand surface color?
- what text color goes on a strong filled surface?
- what is the disabled filled surface color?

Good semantic examples:

- `color.bg.primary`
- `color.bg.primary-hover`
- `color.bg.primary-pressed`
- `color.text.on-primary`
- `color.bg.disabled`

These names are reusable across buttons, badges, tabs, pills, and other components.

### What Should Live In Component Tokens

Component tokens should answer questions like:

- what background does the primary button default state use?
- what text color does the primary button hover state use?

Good component examples:

- `button.primary.default.bg -> color.bg.primary`
- `button.primary.default.text -> color.text.on-primary`
- `button.primary.hover.bg -> color.bg.primary-hover`

This keeps the semantic layer stable and reusable, while the component layer is explicit about actual usage.

### Primary Button Example

For the primary button default state:

- button background should map to a semantic surface token
- button text should map to a semantic on-color token
- button border should map to a semantic border token, even if that token is transparent

That means:

- `button.primary.default.bg -> color.bg.primary`
- `button.primary.default.text -> color.text.on-primary`
- `button.primary.default.border -> color.border.transparent`

### Why Not Put Everything Only In Semantic Tokens

If we only create semantic tokens and skip component tokens, we lose a clean contract for each component.

For example, we would know that `color.bg.primary` exists, but we would not have a source-of-truth record that says:

- the default primary button background uses it
- the hover primary button background uses the hover version
- the destructive button uses a danger semantic instead

That mapping belongs in the component layer.

### Why Not Put Everything Only In Component Tokens

If we skip the semantic layer and name everything directly for components, we end up with repeated tokens and weak reuse.

For example:

- `button.primary.default.bg`
- `badge.primary.default.bg`
- `tab.active.bg`

All three may mean the same visual role, but we would duplicate that decision three times.

### Practical Rule

Use this decision test:

- if the token can be reused by multiple components, it belongs in semantic
- if the token describes an exact property on an exact component state, it belongs in component

## Status

### Decisions made

- We are using a 3-tier token system.
- We are starting with primitive colors from Figma.
- We are using `design-system/` as the local workspace for token source files and docs.

### In progress

- Review the imported primitive structure and normalize it.

### Next

- Add numeric primitives.
- Define semantic tokens.
- Apply the model to one test component.
- Optionally sync the code-defined semantic model back to Figma later.

## What We Found In Figma

The current Figma file has the 6 primitive color palettes we expected:

- Blue
- Neutrals
- Red
- Orange
- Yellow
- Green

But there is an important architecture issue in the current Figma setup:

- primitives and semantics are stored in the same collection
- primitives currently have `Light` and `Dark` mode values

For a cleaner 3-tier system, the better long-term structure is:

- `Primitives` collection
  single mode only
- `Semantic` collection
  light and dark modes
- `Component` layer
  aliases semantic tokens, not primitives

We imported only the primitive color values so we can move forward without losing information.

We are explicitly **not** adopting the current semantic token structure from Figma.
