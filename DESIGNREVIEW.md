# Design Review Notes

This file tracks inconsistencies, ambiguities, and design debt found in the Figma library or screens.

The purpose is:

- document things that should ideally be fixed in Figma first
- avoid silently normalizing or hiding inconsistencies in code
- give us a running checklist for future design-system cleanup

## Current Notes

### Input Field- Text

- Variant axes are named inconsistently with the rest of the library:
  - `State`
  - `Data`
- Uses `focussed` spelling instead of `focused`
- Supports:
  - `default`
  - `hover`
  - `focussed`
  - `disabled`
  - `error`
- `Data` only exposes:
  - `Empty`
  - `Filled`

### Input Field- Dropdown

- Variant axis is generically named `Property 1`
- Values are:
  - `default`
  - `hover`
  - `data filled`
  - `active multiselect`
  - `disabled`
- Naming is not aligned with the text input component
- No dedicated `error` state exposed in the component set

### Input Field- Date

- Variant axis is generically named `Property 1`
- Values are:
  - `Default`
  - `hover`
  - `data filled`
- Missing explicit `disabled` and `error` states compared with the text input component
- Capitalization is inconsistent: `Default` vs lowercase values elsewhere

### Input Field- Split Selector

- Variant axis is generically named `Property 1`
- Values are:
  - `Expanded`
  - `Data filled`
  - `Default`
  - `Hover`
- Capitalization is inconsistent across values
- No explicit disabled or error state exposed

### Form Element

- Variant axes are clean:
  - `Type = Text | Dropdown | Date | Split`
  - `Mandatory = yes | no`
- However, helper text / warning text / error text are not exposed yet as component variants
- The wrapper component concept is good, but the state surface is not complete yet

### toast Notification

- Variant axis is generically named `Property 1`
- Values are:
  - `default`
  - `gone`
- Naming is implementation-oriented rather than semantic
- Could be clearer if modeled as visibility or state semantics in Figma

### Primary Button

- The TR listing flow needs a true small-height primary button variant for `Allocate`
- Code now supports this as the same primary button behavior with only the height reduced to `24px`
- That size variant should be added to Figma instead of representing it as a separate bespoke button treatment
- Hover, focus, active, disabled, icon spacing, and radii should stay inherited from the main primary button component

### Stepper

- The current library only exposes the vertical stepper treatment
- The app needs a horizontal tablet variant for the new-sample flow
- For now, code is adapting the vertical variant responsively at tablet widths
- A proper horizontal variant should be added in Figma with intentional:
  - connector direction
  - spacing
  - label wrapping behavior
  - active/completed/default states in horizontal layout

## Code Strategy For Now

- Implement components exactly as they exist today in Figma
- Use normalized React prop names in code
- Internally map those normalized props to the current Figma variant names
- Do not invent missing Figma states yet
- Revisit the naming and state model later after the design system is stabilized
