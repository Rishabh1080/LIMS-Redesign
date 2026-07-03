We are working in a React 19 + Vite app using Bootstrap 5.3.3 and SCSS.

The goal is NOT to redesign the UI.
The goal is to make the code use Bootstrap correctly while preserving the original Figma-to-code visuals and functionality pixel-for-pixel.

Core rule:
Use Bootstrap’s real component structure and utility language first.
Only add or keep custom `smplfy-*` hooks when Bootstrap cannot express the exact design or when the hook is the design-system token override for a Bootstrap component.

Do not remove custom CSS blindly.
Do not add custom CSS blindly.
First decide whether Bootstrap already provides the structure, behavior, or class vocabulary.

Expected public class shape:

- Buttons: `smplfy-btn btn btn-primary`
- Secondary buttons: `smplfy-btn btn btn-outline-secondary`
- Cards: `smplfy-card card`
- Badges: `smplfy-badge badge`
- Tables: `smplfy-table table`
- Links: `smplfy-link link-primary`
- Modals: `smplfy-modal modal`
- Dropdown items: `smplfy-dropdown-item dropdown-item`
- Nav links/tabs: `smplfy-nav-link nav-link`

Bootstrap owns:

- Modal anatomy: `modal`, `modal-dialog`, `modal-content`, `modal-header`, `modal-body`, `modal-footer`, `modal-backdrop`, `btn-close`
- Button mechanics: borders, backgrounds, hover, active, disabled, cursor, focus, transitions
- Card structure: `card`, `card-header`, `card-body`, `card-footer`
- Table structure: `table`, `table-hover`, `table-responsive`, `align-middle`
- Badge structure: `badge`
- Nav/tab/pill structure: `nav`, `nav-tabs`, `nav-pills`, `nav-link`, `active`
- Form structure: `form-label`, `form-control`, `form-select`, `invalid-feedback`
- Dropdown structure: `dropdown`, `dropdown-menu`, `dropdown-item`
- Grid/layout utilities: `container-fluid`, `row`, `col`, `d-flex`, `flex-column`, `flex-grow-1`, `flex-shrink-0`, `align-items-center`, `justify-content-between`, `gap-*`, `p-*`, `m-*`, `border`, `border-top`, `border-end`, `overflow-hidden`, `overflow-auto`, `text-*`, `bg-*`

Do NOT create custom class names that simply rename Bootstrap parts.
Wrong examples:

- `smplfy-modal-dialog`
- `smplfy-modal-content`
- `smplfy-modal-header`
- `smplfy-modal-body`
- `smplfy-modal-footer`
- `smplfy-request-modal-main`
- `smplfy-request-modal-sidebar`
- `smplfy-request-modal-actions`
- `smplfy-tr-allocation-layout`
- `smplfy-tr-allocation-main`
- `smplfy-tr-allocation-form`
- `smplfy-material-details-summary-card`
- `smplfy-material-details-records-card`
- `requests-for-me-request-card__state-arrow`
- `smplfy-primary-button--has-left-icon`

These are bad because they either duplicate Bootstrap’s vocabulary or create unnecessary page-specific structure names.

Allowed custom hooks:
A custom class is allowed only when at least one of these is true:

1. It is the design-system root class for a Bootstrap component:
   - `smplfy-btn btn`
   - `smplfy-card card`
   - `smplfy-table table`
   - `smplfy-modal modal`
   - `smplfy-badge badge`
   - `smplfy-link link-primary`

2. It is a minimal variant hook needed for an exact visual/layout exception Bootstrap cannot express:
   - example: `smplfy-request-modal` on `.modal-dialog` because the modal needs exact 1392px width, 659px height, and custom split layout.
   - example: `smplfy-tr-allocation-modal-dialog` on `.modal-dialog` because the allocation modal needs exact custom dimensions.
   - example: a table variant hook only if that table needs exact column/min-width/padding values that generic `smplfy-table table` cannot represent.

3. It scopes a page-specific visual exception that cannot be moved to a reusable component without changing visuals.
   - Keep this rare.
   - Prefer one page root hook over many small child hooks.
   - Example: `smplfy-material-details-page` can scope exact QR card width and summary spacing without adding `smplfy-material-details-summary-card`, `smplfy-material-details-qr-card`, etc.

If Bootstrap utilities can produce the same result, use Bootstrap utilities instead of custom classes.

Before changing any component/page:

1. Inspect the existing JSX and SCSS.
2. Identify every custom class.
3. For each custom class, decide:
   - Is this a Bootstrap component part renamed? Remove it.
   - Is this expressible with Bootstrap utilities? Replace it.
   - Is this needed to preserve exact original visuals? Keep the smallest possible hook.
   - Is this a reusable component variant? Move/keep it in design-system level, not page-specific.
4. Do not change visuals or functionality.
5. If removing a class changes pixels, restore the visual through the smallest justified hook.
6. If there is a clash between code-structure correctness and visual preservation, stop and ask before assuming.

Modal-specific rule:
A modal should look like Bootstrap in the DOM.

Correct:

```html
<div class="smplfy-modal modal show d-block">
  <div class="modal-backdrop show"></div>
  <div class="modal-dialog modal-dialog-centered modal-xl smplfy-request-modal">
    <div class="modal-content">
      <div class="modal-header">
        <div class="modal-body p-0 d-flex overflow-hidden">
          <div class="modal-footer">
            Wrong:

            <div class="smplfy-modal-dialog modal-dialog">
              <div class="smplfy-modal-content modal-content">
                <div class="smplfy-modal-header modal-header">
                  <div class="smplfy-modal-body modal-body">
                    <div class="smplfy-modal-footer modal-footer">
                      Request modal example: Remove custom layout aliases like
                      smplfy-request-modal-main, summary, sidebar, actions. Use
                      Bootstrap/semantic structure: section, aside, d-flex,
                      flex-column, border-end, modal-footer, table-responsive,
                      table table-bordered. Keep only smplfy-request-modal as
                      the exact modal variant hook. TR allocation modal example:
                      Remove custom aliases like smplfy-tr-allocation-layout,
                      main, details, form, actions, side. Use Bootstrap
                      utilities and semantic structure. Keep only:
                      smplfy-tr-allocation-modal-dialog for exact modal
                      dimensions/layout scope. table variant hooks only if
                      needed for exact table sizing. Card-specific rule:
                      Correct:

                      <div className="smplfy-card card">
                        Wrong if avoidable:

                        <div
                          className="smplfy-card card smplfy-material-details-summary-card"
                        >
                          <div
                            className="smplfy-card card sample-card sample-card--grid"
                          >
                            If a page has several cards with specific
                            spacing/sizing: Prefer plain smplfy-card card in
                            JSX. Scope visual exceptions under one page root in
                            SCSS. Do not create separate class names for every
                            card unless Bootstrap and structural selectors
                            cannot safely target the difference. Table-specific
                            rule: Correct:

                            <DataTable>
                              or:

                              <table
                                className="smplfy-table table table-hover align-middle"
                              >
                                Wrong: Per-page table names unless the table
                                genuinely needs a unique variant. If several
                                pages use the same table look, make it generic
                                in the table component/design-system instead of
                                page-specific. Buttons: Correct:

                                <button className="smplfy-btn btn btn-primary">
                                  Save
                                </button>
                                <button
                                  className="smplfy-btn btn btn-outline-secondary"
                                >
                                  Cancel
                                </button>
                                Do not duplicate Bootstrap button behavior in
                                .smplfy-btn. Bootstrap owns
                                hover/active/disabled/focus mechanics.
                                smplfy-btn should set Bootstrap variables and
                                any truly missing design-system visual tokens.
                                If Figma requires a custom press transform, it
                                must be explicitly added as a design-system
                                decision, not accidentally removed or invented.
                                Badges/status pills: Correct:

                                <span
                                  className="smplfy-badge badge text-bg-success"
                                  >Approved</span
                                >
                                Do not create custom data attributes for
                                colors/styles. Do not create random classes when
                                Bootstrap variants or a minimal design-system
                                badge variant can handle it. Links: Correct:

                                <a className="smplfy-link link-primary">...</a>
                                Bootstrap link-primary may use strong defaults;
                                smplfy-link.link-primary can override tokens
                                where needed. Do not let links randomly turn
                                Bootstrap blue unless that was the intended
                                original visual. Nav/tabs: Use Bootstrap
                                structure:

                                <div className="nav nav-tabs">
                                  <button
                                    className="smplfy-nav-link nav-link active"
                                  >
                                    ...
                                  </button>
                                </div>
                                For pill-style segmented controls:

                                <div className="nav nav-pills">
                                  <button
                                    className="smplfy-nav-link nav-link active flex-fill"
                                  >
                                    ...
                                  </button>
                                </div>
                                The active pill style must match the confirmed
                                app style, not Bootstrap’s default blue fill
                                unless that is intended. Forms: Use Bootstrap
                                form classes: form-label form-control
                                form-select invalid-feedback Use smplfy-form-*
                                only as the design-system token layer on top of
                                Bootstrap form controls. Never use: custom data
                                attributes custom color/style attributes one-off
                                class names when Bootstrap variants/utilities
                                exist page-specific class names for reusable
                                components hardcoded visual values inside
                                component rules when a token/variable can be
                                used SCSS rules: Bootstrap should be imported
                                first. Then design-system overrides. Then
                                app/page styles. Use tokens/variables for
                                values. smplfy-* CSS should generally set
                                Bootstrap CSS variables or scoped visual
                                exceptions. Avoid writing full custom component
                                mechanics when Bootstrap already provides them.
                                Avoid broad visual rewrites. Keep page-level
                                SCSS only for exact layout/visual recovery that
                                cannot be expressed through Bootstrap classes.
                                Visual preservation: The UI must stay visually
                                and functionally the same as the original
                                Figma-to-code implementation unless explicitly
                                asked otherwise. Do not “simplify” by deleting
                                CSS if it changes visuals. Do not “Bootstrap
                                default” something if Bootstrap default does not
                                match the designed UI. If default Bootstrap
                                looks different, override the difference through
                                the smallest justified smplfy-* hook or scoped
                                selector. Workflow: Read the page/component JSX.
                                Read its SCSS. Search for all custom classes.
                                Classify each custom class as: allowed
                                design-system component hook allowed minimal
                                variant hook unnecessary alias Bootstrap-utility
                                replacement candidate visual-preservation
                                exception Edit only the page/component requested
                                and any directly used shared component that
                                violates the rule. Do not touch Storybook unless
                                explicitly asked. Do not do git operations
                                unless explicitly asked. Run build if SCSS/JSX
                                changed. Report exactly what changed and where.
                                If unsure whether a visual difference is
                                acceptable, ask before assuming.
                              </table></DataTable
                            >
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
```
