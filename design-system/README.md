# Design System Workspace

This folder is the source-of-truth workspace for the design system work we are doing in this repo.

It is intentionally separate from `src/`:

- `design-system/` holds documentation, token source files, and mapping notes
- `src/` will later consume generated or approved token outputs for the app

## Structure

- `DESIGN_TOKENS.md`
  Living explanation of the token model, naming rules, and implementation plan.
- `tokens/primitives/colors.json`
  Imported primitive color palettes from Figma.
- `tokens/semantic/`
  Semantic token source files will go here.
- `tokens/components/`
  Component token source files will go here.

## Working Rule

For this project, raw primitive values may exist only in the primitive token files.

Semantic tokens must alias primitives.

Component tokens must alias semantic tokens unless there is a strong reason not to.

## Current Source Of Truth

Right now:

- primitive colors are imported from Figma
- semantic tokens in Figma are intentionally ignored
- semantic and component token work will be defined in code first

We may sync semantic tokens back to Figma later, but that is not part of the current workflow.
