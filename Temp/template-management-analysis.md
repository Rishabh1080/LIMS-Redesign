# Template Editor - Current Implementation Specification

Last updated: 2 July 2026

## Purpose Of This Document

This document describes the Template Editor that currently exists in the LIMS prototype. It is based on the implemented React and SCSS, not the older saved production webpage in `TEMP`.

Primary implementation files:

- `src/pages/TemplateEditPage.jsx`
- `src/pages/template-edit-page.scss`
- `src/components/FormControls/InputFieldRichDropdown.jsx`
- `src/components/FormControls/FormElement.jsx`

The older saved page was used to understand the original product domain. It is no longer the source of truth for the current editor UI or behavior.

## What The Template Editor Is

The Template Editor is a recursive visual builder for report and form layouts. Its structural hierarchy is:

```text
Container
  Row
    Column
      Widget
      or
      Nested Container
        Row
          Column
            Widget or another Nested Container
```

A column can contain one widget placeholder or one nested container. A nested container restarts the same hierarchy, so the renderer supports arbitrary nesting depth.

The current prototype focuses on structural editing and responsive interaction. It does not yet persist templates to a backend or render real report data.

## Entry Point And Application Shell

- The sidebar contains a `Template Edit` item using the `file-text` icon.
- The page is registered in `App.jsx` under the `template-edit` page key.
- The page uses the standard `AppChrome` shell.
- The breadcrumb is `Template Edit`.
- The page retains the normal LIMS sidebar, global header, alert control, contact control, notification control, and user profile.

## Page-Level Structure

The page has three persistent areas and one contextual area:

1. Action bar
2. Scrollable editor body
3. White template canvas
4. Bottom-centered bulk toolbar, shown only while entities are selected

### Action Bar

The action bar contains:

- Back icon button
  - Navigates to the dashboard.
- `Add Container` primary button
  - Adds a new root container.
  - Makes the new container the only active container.

Bulk editing does not use the page action bar. Selecting an entity opens a contextual toolbar fixed to the bottom center of the viewport.

### Empty State

The editor starts with no containers.

The canvas shows:

- Plus icon
- `No containers added`
- `Start this template by adding the first container.`
- Prominent `Add Container` primary button

Creating the first container produces exactly:

- One container
- One row inside the container
- One column inside the row
- One default widget placeholder inside the column

## Data Model

The in-memory shape is effectively:

```js
Container = {
  id,
  title,
  rows: Row[]
}

Row = {
  id,
  columns: Column[]
}

Column = {
  id,
  widgetName,
  customClass,
  nestedContainer: Container | null
}
```

Default values:

- New root container title: `New report container`
- New nested container title: `Nested container`
- Default widget name: `temp_img_widget`
- Default custom class: empty string
- Nested-container column widget name: `nested_container`

IDs use `crypto.randomUUID()` when available, with a numeric fallback. The page also scans the container tree for duplicate container IDs and repairs them. This prevents multiple containers from entering edit mode after Vite hot reload preserves React state but resets module-level counters.

## Recursive Rendering

The same `TemplateContainer` component renders root containers and nested containers.

Recursive tree updates use helper functions that traverse:

```text
containers -> rows -> columns -> nestedContainer
```

This allows add, clone, delete, selection, and settings actions to target deeply nested entities without creating separate components for each nesting level.

Event propagation is stopped on editor controls. Interacting with a nested row, column, menu, or container does not accidentally activate an ancestor container.

## Single Active Container Rule

The editor stores one `activeContainerId`.

Only the container whose ID matches `activeContainerId` is in build/edit mode. No second container can be active at the same time.

### Activating A Container

- Every inactive container keeps an Edit icon button in its blue header.
- Clicking Edit makes that container active.
- If another container was active, it becomes inactive immediately.
- The Edit icon changes to a primary Tick icon.
- Clicking Tick exits edit mode and leaves no active container.

### Activating A Nested Container

- Adding or editing a nested container makes the nested container active.
- Its parent immediately becomes inactive.
- The parent switches to preview mode.
- Only the active child exposes row and column editing controls.

### Active Container Emphasis

The active container receives only a subtle blue outline outside its border.

There is no active shadow, hover shadow, focus fill, or raised-card treatment on containers, rows, or columns.

## Build Mode And Preview Mode

### Active Container: Build Mode

An active container shows:

- Blue container header and all currently available container actions
- Yellow headers for immediate rows
- Green headers for immediate columns
- Column checkboxes
- Widget edit controls
- Row and column movement controls
- Structural borders and spacing

### Inactive Container: Preview Mode

An inactive container keeps its blue header as the structural anchor, but hides its structural child chrome:

- Row headers disappear.
- Column headers disappear.
- Column movement controls disappear.
- Widget configuration controls disappear.
- Row and column build-mode boundaries are replaced by a clean preview layout.
- Widgets render as neutral preview blocks.

If an inactive container contains the active nested container, the renderer walks through the preview tree and still exposes the active child at the correct location.

## Container UI And Actions

Container headers use the blue surface `#cbeafe`.

### Inactive Container Header

The container checkbox and Edit icon button remain visible. Structural actions remain hidden until the container is active.

### Active Container Header

Left-side actions:

- Container selection checkbox
- 3-dot menu
- Container Settings
- Clone
- Select All / Cancel Selection for immediate child rows
- Add Row

Right-side actions:

- Move Container Up
- Move Container Down
- Tick / Done Editing

### Container 3-Dot Menu

The menu is the complete action source and contains:

- Container settings
- Clone container
- Select All or Cancel Selection for immediate child rows
- Add row
- Move container up
- Move container down
- Copy container
- Delete container

Move Up is disabled for the first root container. Move Down is disabled for the last root container.

### Container Reordering

- Root containers can move one position up or down.
- The right-side arrow buttons and menu items use the same reorder handler.
- Reordering changes the actual root container array.
- A nested column currently stores only one nested container, so a nested container has no vertical sibling within that column and cannot visibly reorder there.

### Container Clone

- Cloning a root container inserts a deep clone directly after it.
- All rows, columns, widgets, and nested containers are cloned.
- Every cloned entity receives a new ID.
- Cloning a nested container inserts its clone into a new adjacent column.

### Container Copy

`Copy container` currently records an internal copy-status string only.

It does not yet:

- Write to the system clipboard
- Show a toast or visible status
- Enable a Paste action
- Duplicate the container by itself

### Container Delete

- Deletes the targeted root or nested container from the recursive tree.
- If the deleted container was active, edit mode closes.

## Row UI And Actions

Row headers use the yellow surface `#ffe4aa`.

Each row contains an equal-width CSS grid of columns. The grid uses:

```css
repeat(columnCount, minmax(0, 1fr))
```

The default gap between columns is 8px.

### Row Header Actions

Left side:

- Row selection checkbox
- 3-dot menu
- Row Settings
- Clone Row
- Select All / Cancel Selection
- Add Column

Right side:

- Move Row Up
- Move Row Down

### Row 3-Dot Menu

The menu contains:

- Row settings
- Clone row
- Select All or Cancel Selection
- Add column
- Move row up
- Move row down
- Delete row

### Row Reordering

- A row moves one index up or down within its parent container.
- Move Up is disabled for the first row.
- Move Down is disabled for the last row.

### Row Clone

- Deep-clones the row.
- Inserts the clone directly after the original row.
- Clones all columns and nested containers with new IDs.

### Row Delete

- Deletes the targeted row when the container has more than one row.
- The last remaining row cannot be deleted.
- A direct structural delete clears the current bulk selection to prevent stale IDs.

### Row Selection

The row checkbox selects the row itself for row-level bulk actions.

The row Select All control affects only columns in that row.

- Clicking `Select All` checks every column in the row.
- The same control changes to `Cancel Selection`.
- Clicking `Cancel Selection` clears that row's selected columns.
- The row menu item mirrors the same state and behavior.

Row selection ownership is separate from container selection ownership. Selecting a row does not change the parent container button to `Cancel Selection`.

## Column UI And Actions

Column headers use the green surface `#c8efd0`.

### Column Header

Left side:

- Selection checkbox
- 3-dot menu
- Column Settings icon

Right side:

- Add Container primary button

### Column 3-Dot Menu

The menu contains:

- Column settings
- Clone column
- Add container
- Move left
- Move right
- Delete column

The menu preserves actions that disappear from the compressed header.

### Column Selection

- Every column has an independent checkbox.
- Checkbox state contributes to the page-level typed selection state.
- The floating bulk toolbar count updates from the number of selected column IDs.
- Manual column selection and row-level Select All both resolve to the same column-selection state.

Container and row toggle ownership are tracked separately so one scope does not visually toggle another scope's Select All button.

### Column Clone

- Inserts a deep clone directly after the original column.
- Nested containers are cloned recursively.
- New IDs are assigned.

### Column Delete

- Deletes the targeted column when its row has more than one column.
- The last remaining column cannot be deleted.
- A direct structural delete clears the current bulk selection to prevent stale IDs.

### Column Movement

- Left and right buttons move the column one index in its row.
- The first column's left button is disabled.
- The last column's right button is disabled.
- The same actions remain in the 3-dot menu.
- Visible movement buttons are exactly 24x24px with 14px chevrons.
- The control strip has a 4px horizontal inset so movement buttons stay inside the column border.

### Add Nested Container

- Replaces the column's widget content with a new nested container.
- Creates one row and one column in the nested container.
- Sets the column widget name to `nested_container`.
- Makes the nested container active immediately.
- The parent container switches to preview mode.

## Widget Control And Placeholder

Every editable column has a widget control strip directly below the green header and above the content.

The widget control is:

- Primary blue
- White edit icon
- White widget-name text
- Centered between column movement buttons
- Truncated to one line when required

The default label is `temp_img_widget`.

At very narrow column widths, the label is removed and the control becomes a 32x32px icon-only Edit button.

Clicking the widget control opens `Widget Configuration`.

The current widget modal contains:

- Read-only `Widget Name`
- Placeholder message stating that widget-level configuration will be connected later

The modal does not currently update the column's widget.

The content area currently renders a generic neutral `Widget` preview block rather than a real widget implementation.

## Selection State Model

Selection is mutually exclusive by entity type. The page stores a `selectionType` of `container`, `row`, `column`, or `null`.

The relevant state is effectively:

```js
selectionType = null | 'container' | 'row' | 'column'
selectedEntityIds = []
columnSelectionSources = {
  manualIds: [],
  rowIds: []
}
pasteFlow = null | {
  entityType: 'row' | 'column',
  operation: 'move' | 'copy',
  phase: 'container' | 'row',
  targetContainerId?: string
}
```

`selectedEntityIds` stores direct container or row selections. Column IDs are derived from manual column IDs and row-scoped Select All sources so overlapping manual and scoped selection remains stable.

### Selection Lock

- With no selection, every visible entity checkbox is enabled.
- Selecting the first entity locks the selection type.
- Checkboxes for the other two entity types become disabled and visually dimmed.
- Clicking a disabled checkbox does not clear the current selection.
- Instead, a lightweight bottom-left message explains what must be cleared, for example: `Clear your Row selection first to select Column.`
- `Clear Selection` returns the editor to the neutral state and cancels any paste-targeting flow.
- Clearing selection also closes the floating toolbar and re-enables every visible checkbox.

Container and row `Select All` intentionally step down one hierarchy level:

- Container Select All selects that container's immediate rows and switches to Row mode.
- Row Select All selects that row's immediate columns and switches to Column mode.
- These explicit hierarchy actions clear incompatible entity selections instead of showing the selection-lock warning.

Column selection is derived from two source lists:

- Manually checked column IDs
- Row IDs whose Select All toggle was used

This preserves scope ownership. Using row Select All changes only that row's control to `Cancel Selection`; it does not toggle the parent container control.

Container Select All never reaches through rows to select columns. It selects only immediate child rows and does not include rows inside nested containers.

## Contextual Bulk Toolbar

The floating bulk toolbar is rendered through a portal and fixed to the bottom center of the viewport. It appears only when at least one entity is selected.

The toolbar contains:

- Selection count and entity type
- Type-specific actions
- A persistent `Clear Selection` escape action

Completing Clone, Delete, Styling, Move, or Copy clears the completed selection. Starting Move or Copy preserves the selection until a valid destination is chosen or the user explicitly clears it.

Available actions:

- Columns: Styling, Clone, Move, Copy, Delete
- Rows: Select Child Columns, Clone, Move, Copy, Delete
- Containers: Clone, Delete

### Clone Multiplier

Clone includes a numeric multiplier with a default value of `1` and a supported range of 1 to 20.

For example, selecting two rows, entering `5`, and pressing Clone creates five copies of each selected row. The multiplier resets to `1` when the selection type changes.

### Column Styling

The `Styling` action opens a shared modal with a CSS class input. Applying it writes the entered class string to every selected column and then clears the selection.

### Select Child Columns

When rows are selected, `Select Child Columns` collects every immediate column in those rows, clears the row IDs, and switches the toolbar directly to Column mode. Nested-container descendants are not included. The resulting column selection exposes Styling and the other column bulk actions.

## Guided Move And Copy Flow

Move and Copy use an explicit targeting mode because inactive containers hide their row and column chrome.

### Rows

1. Select one or more rows.
2. Choose Move or Copy.
3. The toolbar turns blue and prompts `Select a container to paste rows.`
4. Hovering any container shows a blue dashed drop-zone outline.
5. Clicking a container appends the rows to its bottom, activates that container, and clears the selection.

Move removes the selected rows from their original locations. Copy deep-clones them with new IDs.

### Columns

1. Select one or more columns.
2. Choose Move or Copy.
3. The toolbar prompts `Select a container to open it.`
4. Clicking a container activates it, revealing its yellow row headers.
5. The prompt changes to `Select a row to paste columns.`
6. Hovering a row shows the drop-zone outline.
7. Clicking a row appends the columns, then clears the toolbar and selection.

Move removes the selected columns from their source rows. Copy deep-clones them, including any nested containers. Source rows and containers retain their minimum one-column and one-row safeguards.

Target selection uses normal click interaction, while buttons, checkboxes, menus, and other structural controls stop propagation so they cannot accidentally choose a paste destination.

## Settings Modals

Settings and structural actions are intentionally separated:

- Structural actions stay in headers and 3-dot menus.
- Property configuration opens a modal.

All modals use the shared LIMS `Modal` component.

### Container Settings

The Container Settings modal contains:

Checkboxes:

- Filter
- Header
- Footer
- Param Loop
- Sample Loop
- Horizontal Param Loop
- Horizontal Sample Loop

Text inputs:

- Horizontal Loop Index
- Unique Name
  - Current default: `06b0d2010c498498d2b20d82`
- Index of the container
  - Current default: `1`

Footer actions:

- Save
- Close

Current prototype boundary:

- Close works.
- The fields are not loaded from the selected container.
- Save is visual only and does not persist values or close the modal.

### Row Settings

The Row Settings modal currently shows an empty future-properties state:

`Properties for this row will appear here.`

No row properties are implemented yet.

### Column Settings

The Column Settings modal is an extra-large modal divided into three sections.

#### Layout

- Index
  - Single-select dropdown
  - Options 1 through 6
- Widget
  - Searchable single-select rich dropdown
  - Defaults locally to `Text Widget`
- Class
  - Text input
  - Defaults locally to `col`
- Master
  - Single-select dropdown
  - Customer
  - Instrument
  - Material
  - Product
  - Sample
  - Test Request

#### Access

- Who Can Edit?
- Who Can View?

Role options:

- Admin
- Analyst
- Approver
- Lab Manager
- Quality Manager
- Reviewer
- Technical Manager

These are currently single-select controls even though the labels imply that multi-role selection may be required later.

#### Display

Checkbox tiles:

- Show in CoA - checked by default
- Show in Data Template - checked by default
- Show in NABL - unchecked by default
- Show in Non-NABL - unchecked by default
- Is Final Result? - checked by default

Footer actions:

- Close
- Save

Current prototype boundary:

- Inputs and checkboxes work within the open modal.
- Save closes the modal.
- Values are local modal state and are not written back to the selected column.
- Reopening the modal restores the local defaults.

## Widget Dropdown Behavior

The Widget field uses the shared rich-dropdown component.

Implemented behavior:

- Widget names are sorted alphabetically before rendering.
- Opening the dropdown resets the search query.
- The search field receives focus automatically.
- The user can open the dropdown and type immediately.
- Results filter by label, value, optional right-side label, and optional search text.
- The dropdown shows up to nine widget options before its list scrolls.
- Selecting one option closes the dropdown.
- Escape closes the dropdown.
- Clicking outside closes the dropdown.
- The menu uses a fixed-position portal and follows viewport resize and scrolling.
- An empty search displays `No results found`.

Available widget entries currently include:

- Base Widget
- Checkbox Widget
- Common Modals
- Container Fetcher Widget
- Customer Widget
- Datepicker Widget
- Dependent Dropdown Widget
- Dropdown Widget
- Ds Data Fetcher Widget
- Fetcher Widget
- Formula Widget
- Input Widget
- Master Data Widget
- Meta Data
- Method Widget
- Moa Widget
- Number Widget
- Paragraph Widget
- Product Detail Widget
- Project Field Widget
- Qr Code Widget
- Rich Text Widget
- Sample Data Widget
- Sample Details Widget
- Sample Details Widget V2
- Sample Line Item Data Widget
- Sample Metadata Widget
- Sample Parameter Widget
- Sno Widget
- Template Data Fetcher Widget
- Template Image Widget
- Template Inclusion Widget
- Text Widget
- Upload Widget
- Vertical Text Widget
- Word Upload Widget

## 3-Dot Menus And Overflow Handling

Every container, row, and column has a 3-dot menu while its structural controls are available.

Menus are rendered into `document.body` using a portal rather than inside the entity DOM.

This prevents clipping by:

- Containers
- Rows
- Columns
- Nested grids
- Scrollable editor regions

Menu positioning behavior:

- Fixed positioning relative to the trigger
- Opens below by default
- Opens upward when bottom space is insufficient
- Clamps horizontally within the viewport
- Uses a viewport-based maximum height
- Scrolls when its content exceeds the available height
- Only one editor menu is open at a time
- Clicking elsewhere on the editor closes the menu

Visual behavior:

- Gray-400 border
- 8px radius
- Neutral hover fill
- Disabled items use muted neutral text
- Delete actions use danger text

## Icon-Only Tooltips

Icon-only buttons in the Template Editor and its modals receive hover tooltips.

Rules:

- Buttons with a visible text label do not show a tooltip.
- If a responsive state hides the text label, the same button becomes eligible for a tooltip.
- Tooltip delay is 800ms.
- Clicking, pointer-down, pointer-out, or focus-out clears the tooltip.
- Tooltips can also appear for keyboard focus.
- Tooltips are portaled to `document.body`, so nested entities cannot clip them.
- Position defaults above the button and switches below when top space is insufficient.
- Horizontal position is clamped inside the viewport.
- Reduced-motion preference removes the entrance animation.

## Responsive Behavior

Responsive behavior is based primarily on CSS container queries. Controls react to the actual width of their container, row, or column rather than only the browser viewport.

### Container Header

- Full width:
  - 3-dot menu
  - Settings
  - Clone with label
  - Select All with label
  - Add Row with label
  - Move Up
  - Move Down
  - Tick
- At 520px and below:
  - Clone shortcut hides.
  - Select All and Add Row become 32px icon-only buttons.
- At 320px and below:
  - Container movement shortcuts hide.
- At 240px and below:
  - Select All and Add Row shortcuts hide.
- At 168px and below:
  - Settings shortcut hides.
- The 3-dot menu and Edit/Tick remain the final controls.

Hidden actions remain available in the 3-dot menu.

### Row Header

- At 560px and below:
  - Clone, Select All, and Add Column become 32px icon-only buttons.
  - Row Settings remains visible while it still fits.
- At 320px and below:
  - Row Select All shortcut hides.
- At 260px and below:
  - Row Settings shortcut hides.
- Row actions remain available in the 3-dot menu.

### Column Header And Control Strip

- At 420px and below:
  - Add Container becomes a 32px icon-only button.
- At 180px and below:
  - Column Settings and Add Container header shortcuts hide.
  - The widget button becomes a 32x32px icon-only Edit button.
- At 120px and below:
  - Left and right movement shortcuts hide.
  - The widget Edit button remains centered.
- All hidden settings, add, and movement actions remain in the column 3-dot menu.

### Viewport Adaptation

The bulk toolbar also adapts to the viewport:

- Desktop: status, actions, and Clear Selection stay on one centered row.
- Tablet: status and Clear Selection remain on the first row; actions move to a horizontally scrollable second row.
- Phone: the toolbar uses tighter spacing and the selection-lock notification is positioned above it.
- The editor body reserves bottom space while the toolbar is visible so it does not cover template content.

At viewport widths below the Bootstrap large breakpoint:

- Build-mode column grids stack to one column.
- Preview columns stack to one column.
- Editor body padding reduces from 24px to 16px.
- Column Settings display options switch from five columns to two.

At phone widths:

- Column Settings display options stack to one column.

## Visual System

Hierarchy is communicated with restrained structural colors:

- Container header: light blue
- Row header: light yellow
- Column header: light green
- Widget preview: neutral gray
- Active container: subtle blue outline
- Canvas: white
- Page background: standard tertiary body background

Borders use the existing neutral design tokens. Entity cards use a 4px radius. The outer template canvas uses an 8px radius.

The editor intentionally avoids:

- Decorative gradients
- Heavy active shadows
- Hover elevation on structural entities
- Nested floating-card styling
- Custom focus fills on containers, rows, or columns

## Current Functional Coverage

### Fully Working In The Prototype

- Empty-state first container creation
- Root container creation
- Row creation
- Column creation
- Recursive nested container creation
- Single active container enforcement
- Build mode and preview mode switching
- Root container reordering
- Row reordering
- Column reordering
- Deep cloning of containers, rows, columns, and nested containers
- Recursive deletion with one-row and one-column safeguards
- Independent container, row, and column checkboxes
- Mutually exclusive entity-type selection lock
- Disabled-selection feedback without destructive auto-clear
- Contextual bottom floating bulk toolbar
- Bulk clone multiplier
- Bulk container, row, and column cloning
- Bulk container, row, and column deletion
- Bulk column styling
- Container Select All targeting immediate rows
- Row Select All targeting immediate columns
- Row-to-column bulk selection conversion through Select Child Columns
- Guided row move/copy into another container
- Guided column move/copy through container and row targeting
- Portaled drop-zone targeting that can activate inactive containers
- Row-scoped Select All / Cancel Selection
- Container-scoped Select All / Cancel Selection
- Independent row/container selection-toggle ownership
- Typed selection count in the floating toolbar
- Responsive action collapse
- Portaled 3-dot menus
- Portaled delayed tooltips
- Container Settings modal UI
- Column Settings modal interactions
- Searchable alphabetized widget dropdown
- Row Settings placeholder modal
- Widget Configuration placeholder modal

### Present But Not Yet Fully Connected

- `Copy container` does not expose a usable copied payload or Paste flow.
- Container Settings values are not stored on the container.
- Container Settings Save has no persistence behavior.
- Row Settings has no real properties.
- Column Settings values are not stored on the column.
- Widget Configuration is read-only.
- Selecting a widget in Column Settings does not update the widget shown in the column.
- Widget previews do not render real widget types.
- There is no undo/redo history.
- There is no drag-and-drop reordering.
- There is no backend save/load.
- State is lost when the page is reloaded or remounted.
- There is no template-level publish, preview-output, validation, or versioning workflow on this page.

## Important Behavioral Notes

1. Only one container is structurally editable at a time.
2. Row and column controls are only shown for the active container's immediate children.
3. Hidden responsive shortcuts are never the only route to an action; the 3-dot menu remains the source of truth.
4. Selection can target containers, rows, or columns, but never more than one entity type at the same time.
5. Container Select All selects immediate rows; Row Select All selects immediate columns. Both are separate from the entity's own checkbox.
6. Select Child Columns converts selected rows into their immediate columns without traversing nested containers.
7. Move and Copy targeting temporarily overrides preview-mode navigation so inactive containers can be selected as destinations.
8. A column can hold only one nested container.
9. Adding a nested container replaces the current widget placeholder in that column.
10. Root containers are vertically ordered; nested containers currently have no same-column vertical sibling list.
11. The editor is an in-memory prototype, not a persisted template-management system yet.

## Recommended Next Implementation Pass

The next pass should connect the existing UI rather than redesign it again:

1. Store container, row, column, and widget settings in the tree data model.
2. Make modal Save actions write to the targeted entity.
3. Bind the Widget dropdown to `column.widgetName`.
4. Implement real widget renderers and configuration forms.
5. Implement a real copy/paste container payload.
6. Add template save/load and validation.
7. Add undo/redo before introducing drag-and-drop.
8. Add automated tests for recursive clone, delete, guided move/copy, typed selection locking, and active-container exclusivity.
9. Add explicit confirmation for destructive multi-entity deletion if this moves beyond prototype use.
