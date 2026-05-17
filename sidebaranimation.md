# Sidebar Animation Notes

This records the sidebar animation refactor attempts that were made, what each change was trying to solve, and why the final state was reverted.

## Starting Point

The original implementation animates layout:

```css
.sidebar-shell-desktop {
  width: 256px;
  transition: width 220ms cubic-bezier(0.2, 0, 0, 1);
}

.sidebar-shell-desktop.is-collapsed {
  width: 72px;
}

.lims-main {
  margin-left: 256px;
  transition: margin-left 220ms cubic-bezier(0.2, 0, 0, 1);
}

.sidebar-shell-desktop.is-collapsed + .lims-main {
  margin-left: 72px;
}

.lims-sidebar.is-collapsed .sidebar-link-text,
.lims-sidebar.is-collapsed .sidebar-link__external {
  display: none;
}
```

Issues identified:

- `width` on `.sidebar-shell-desktop` triggers layout on each frame.
- `margin-left` on `.lims-main` triggers layout for the page content on each frame.
- `display: none` for labels/external icons causes abrupt state changes instead of composited opacity/transform animation.
- Badge, dot, and external icon nodes were conditionally mounted in `AppChrome.jsx`, which can create reconciliation/state-change jank during collapse/expand.

## Attempt 1: Fixed Sidebar Shell With Composited Reveal

Goal: stop animating `width`, keep the sidebar at a fixed expanded width, and visually reveal/collapse it with compositor-friendly properties.

Representative CSS:

```css
:root {
  --sidebar-expanded-width: 256px;
  --sidebar-collapsed-width: 72px;
  --sidebar-motion-duration: 220ms;
  --sidebar-motion-easing: cubic-bezier(0.4, 0, 0.2, 1);
}

.sidebar-shell-desktop {
  width: var(--sidebar-expanded-width);
  transition: none;
  will-change: transform, clip-path;
}

.sidebar-shell-desktop::before {
  content: '';
  position: absolute;
  inset: 0 auto 0 0;
  width: var(--sidebar-expanded-width);
  background: var(--sidebar-bg);
  transform-origin: left center;
  transform: scaleX(1);
  transition: transform var(--sidebar-motion-duration) var(--sidebar-motion-easing);
  will-change: transform;
}

.sidebar-shell-desktop.is-collapsed::before {
  transform: scaleX(calc(var(--sidebar-collapsed-width) / var(--sidebar-expanded-width)));
}

.lims-sidebar {
  background: transparent;
}
```

What worked:

- Removed the layout animation from the sidebar shell.
- The sidebar background movement was smoother because it used `transform`.

What broke:

- The shell still occupied the full expanded width, so hit testing and page layout became awkward.
- Extra pointer-event handling was needed so the transparent part of the sidebar did not block the header and page content.
- Active item backgrounds and hover states started to feel clipped or mismatched in collapsed mode because the visual background and the interactive item were no longer the same geometry.

## Attempt 2: Move Main Content Without Animated Margin

Goal: stop animating `margin-left`, because the whole app content was recalculating geometry during the sidebar transition.

Representative CSS:

```css
.lims-main {
  margin-left: var(--sidebar-expanded-width);
  width: calc(100vw - var(--sidebar-expanded-width));
  overflow: hidden;
  transition: none;
}

.sidebar-shell-desktop.is-collapsed + .lims-main {
  margin-left: var(--sidebar-collapsed-width);
  width: calc(100vw - var(--sidebar-collapsed-width));
}
```

What worked:

- Page content stopped being cut off on the right edge.
- The main content no longer animated layout during the sidebar state change.

What broke:

- The sidebar visual animation became disconnected from page geometry.
- The page jumped to its new layout immediately while the sidebar was animating visually, which made the overall interaction feel less cohesive.

## Attempt 3: Animate Labels Instead Of Display Toggling

Goal: keep label nodes mounted and animate them with `opacity` and `transform`.

Representative CSS:

```css
.sidebar-link-text,
.sidebar-label span,
.brand-copy {
  opacity: 1;
  transform: translateX(0);
  transition:
    opacity 220ms cubic-bezier(0.4, 0, 0.2, 1),
    transform 220ms cubic-bezier(0.4, 0, 0.2, 1);
  will-change: opacity, transform;
}

.lims-sidebar.is-collapsed .sidebar-link-text,
.lims-sidebar.is-collapsed .sidebar-label span,
.lims-sidebar.is-collapsed .brand-copy {
  opacity: 0;
  transform: translateX(-10px);
  pointer-events: none;
}

.sidebar-section .sidebar-link:nth-child(1) .sidebar-link-text { transition-delay: 0ms; }
.sidebar-section .sidebar-link:nth-child(2) .sidebar-link-text { transition-delay: 20ms; }
.sidebar-section .sidebar-link:nth-child(3) .sidebar-link-text { transition-delay: 40ms; }
.sidebar-section .sidebar-link:nth-child(4) .sidebar-link-text { transition-delay: 60ms; }
```

What worked:

- Text reveal looked smoother in expanded state.
- It avoided abrupt `display: none` label changes.

What broke:

- Section labels `HOME` and `LIMS` hid in collapsed mode, which was not desired.
- Preserving label layout while visually hiding labels affected spacing and made the collapsed icon alignment feel off.
- The component-library sidebar item spacing drifted from the intended icon/label rhythm.

## Attempt 4: Stable Badge, Dot, And External Icon Nodes

Goal: keep the dot, badge, and external icon in the DOM to avoid React mounting/unmounting during the animation.

Representative JSX:

```jsx
<span className="sidebar-link__icon-wrap">
  <AppIcon name={item.icon} size={20} />
  <span
    className="sidebar-link__dot"
    aria-hidden="true"
    data-visible={collapsed && badgeCounts[item.badgeKey] ? 'true' : 'false'}
  />
</span>

<span className="sidebar-link-text">{item.label}</span>

<Badge
  className="sidebar-link__badge"
  tone="danger"
  size="small"
  shape="circle"
  data-visible={!collapsed && badgeCounts[item.badgeKey] ? 'true' : 'false'}
  aria-hidden={!badgeCounts[item.badgeKey] || collapsed}
>
  {badgeCounts[item.badgeKey] ?? ''}
</Badge>

<span
  className="sidebar-link__external"
  aria-hidden="true"
  data-visible={item.opensInNewTab && !collapsed ? 'true' : 'false'}
>
  <AppIcon name="external-link" size={14} stroke={2} />
</span>
```

Representative CSS:

```css
.sidebar-link__badge,
.sidebar-link__external,
.sidebar-link__dot {
  opacity: 0;
  transform: translateX(-4px) scale(0.9);
  transition:
    opacity 180ms cubic-bezier(0.4, 0, 0.2, 1),
    transform 180ms cubic-bezier(0.4, 0, 0.2, 1);
  will-change: opacity, transform;
}

.sidebar-link__badge[data-visible='true'],
.sidebar-link__external[data-visible='true'],
.sidebar-link__dot[data-visible='true'] {
  opacity: 1;
  transform: translateX(0) scale(1);
}
```

What worked:

- React no longer had to mount/unmount those nodes during the collapsed state toggle.

What broke:

- The badge became visually tied to the end of the text instead of staying at the right edge of the button.
- The external icon beside `Admin Hub` looked detached from the component-library layout.
- Absolute positioning variants fixed one state but regressed the other state.

## Attempt 5: Fixed Icon Column

Goal: keep icons stable by giving each item a fixed icon column.

Representative CSS:

```css
.sidebar-link__icon-wrap {
  width: 72px;
  flex: 0 0 72px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.lims-sidebar.is-collapsed .sidebar-link {
  padding-left: 0;
  padding-right: 0;
}
```

What worked:

- Icons moved less during the expansion.

What broke:

- It no longer matched the component-library sidebar item spacing.
- In collapsed mode, the active/hover/pressed background did not have the expected equal left/right padding.
- The icon looked mathematically centered but optically shifted because the button width, icon column, and padding were fighting each other.
- Some collapsed active states had flat right corners because clipping/reveal logic and item background geometry disagreed.

## Revert Decision

The sidebar was reverted because the animation experiments improved one piece at a time but caused regressions in component-library fidelity:

- Badge alignment regressed.
- `Admin Hub` external icon alignment regressed.
- Collapsed active/hover/pressed radii regressed.
- Section labels hid when they should remain visible.
- Collapsed icon alignment felt optically wrong despite equal numeric padding.

## Recommendation For A Future Pass

Keep the design-system sidebar item layout as the source of truth, then optimize around it:

```css
/* Keep item geometry stable and design-system-owned. */
.sidebar-link {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 8px;
}

/* Avoid animating app geometry. Change layout instantly or after transition. */
.lims-main {
  transition: none;
}

/* Animate only decorative/reveal layers, labels, opacity, and transforms. */
.sidebar-reveal-layer,
.sidebar-link-text,
.brand-copy {
  will-change: opacity, transform;
}
```

If this is revisited, use DevTools Performance to compare:

- Frames during collapse/expand.
- Layout time per frame.
- Paint time per frame.
- Composited layer count.
- Hit-test behavior around the transparent sidebar area.

The important constraint is that 60fps animation cannot come at the cost of breaking the component-library spacing, badge placement, icon alignment, or collapsed interaction states.
