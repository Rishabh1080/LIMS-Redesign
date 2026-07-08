# Template Editor Font Picker Changes - Reverted Handoff

This file documents the code changes that were added after the Google Fonts cost discussion and then reverted from this repo. Use this as a handoff if the same font-picker behavior needs to be implemented in the correct project.

## Scope

The attempted change added a curated font picker to the Template Editor styling panel, using only these fonts:

- Gilda Display
- Epilogue
- Fraunces
- Big Shoulders
- Parkinsans
- Urbanist
- Outfit
- Familjen Grotesk
- Gaegu
- Caveat

The intended behavior was:

- Add a `Font` control inside the structured style panel.
- Store font choice as a generated class in the existing Bootstrap class string.
- Parse existing generated font classes back into the picker.
- Show a heart icon inside each font row.
- Toggle favorites by clicking the heart.
- Persist favorites in `localStorage`.
- Sort favorited fonts above non-favorites.

## Files That Were Changed

### `src/components/AppIcon.jsx`

Added Tabler heart icons:

```jsx
import {
  IconHeart,
  IconHeartFilled,
} from '@tabler/icons-react';
```

Added icon mappings:

```jsx
heart: IconHeart,
'heart-filled': IconHeartFilled,
```

### `src/pages/TemplateEditPage.jsx`

Added curated font option data:

```jsx
const fontFamilyOptions = [
  { value: 'smplfy-font-gilda-display', label: 'Gilda Display', family: "'Gilda Display', serif" },
  { value: 'smplfy-font-epilogue', label: 'Epilogue', family: "'Epilogue', sans-serif" },
  { value: 'smplfy-font-fraunces', label: 'Fraunces', family: "'Fraunces', serif" },
  { value: 'smplfy-font-big-shoulders', label: 'Big Shoulders', family: "'Big Shoulders', sans-serif" },
  { value: 'smplfy-font-parkinsans', label: 'Parkinsans', family: "'Parkinsans', sans-serif" },
  { value: 'smplfy-font-urbanist', label: 'Urbanist', family: "'Urbanist', sans-serif" },
  { value: 'smplfy-font-outfit', label: 'Outfit', family: "'Outfit', sans-serif" },
  { value: 'smplfy-font-familjen-grotesk', label: 'Familjen Grotesk', family: "'Familjen Grotesk', sans-serif" },
  { value: 'smplfy-font-gaegu', label: 'Gaegu', family: "'Gaegu', cursive" },
  { value: 'smplfy-font-caveat', label: 'Caveat', family: "'Caveat', cursive" },
];
```

Added favorite storage:

```jsx
const fontFavoriteStorageKey = 'smplfy-template-favorite-fonts';
const fontFamilyClassSet = new Set(fontFamilyOptions.map((option) => option.value));

function loadFavoriteFonts() {
  if (typeof window === 'undefined') return [];

  try {
    const storedValue = window.localStorage.getItem(fontFavoriteStorageKey);
    const parsedValue = storedValue ? JSON.parse(storedValue) : [];
    return Array.isArray(parsedValue)
      ? parsedValue.filter((value) => fontFamilyClassSet.has(value))
      : [];
  } catch {
    return [];
  }
}

function saveFavoriteFonts(fontIds) {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(fontFavoriteStorageKey, JSON.stringify(fontIds));
  } catch {
    // Local storage is only used to remember UI preferences.
  }
}
```

Extended the style parser model:

```jsx
const style = {
  width: 'col',
  alignment: '',
  fontWeight: '',
  fontFamily: '',
  borders: {
    top: false,
    right: false,
    bottom: false,
    left: false,
  },
  marginTop: '',
  advancedClasses: '',
};
```

Added parsing for known font classes:

```jsx
if (fontFamilyClassSet.has(classToken)) {
  style.fontFamily = classToken;
  return;
}
```

Added generation of the final class string:

```jsx
if (style.fontFamily) {
  classes.push(style.fontFamily);
}
```

Added a local `FontFamilyPicker` component:

```jsx
function FontFamilyPicker({ value, onChange }) {
  const rootRef = useRef(null);
  const menuRef = useRef(null);
  const searchInputRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [menuStyle, setMenuStyle] = useState({});
  const [favoriteFonts, setFavoriteFonts] = useState(() => loadFavoriteFonts());

  // Behavior:
  // - Portal dropdown to document.body.
  // - Focus search input on open.
  // - Filter font rows by search query.
  // - Sort favorites first, then alphabetically.
  // - Toggle favorites using row-level heart button.
  // - Select font by clicking the row.
}
```

Inserted the font control in `StyleClassControls`:

```jsx
<div className="col-12 col-md-4">
  <div className="smplfy-template-style-field d-flex flex-column gap-2">
    <span className="smplfy-form-label form-label mb-0">Font</span>
    <FontFamilyPicker
      value={style.fontFamily}
      onChange={(fontFamily) => updateStyle({ fontFamily })}
    />
  </div>
</div>
```

### `src/pages/template-edit-page.scss`

Added Google Fonts import:

```scss
@import url("https://fonts.googleapis.com/css2?family=Big+Shoulders&family=Caveat&family=Epilogue&family=Familjen+Grotesk&family=Fraunces&family=Gaegu&family=Gilda+Display&family=Outfit&family=Parkinsans&family=Urbanist&display=swap");
```

Added generated font utility classes:

```scss
.smplfy-font-gilda-display { font-family: "Gilda Display", serif !important; }
.smplfy-font-epilogue { font-family: "Epilogue", sans-serif !important; }
.smplfy-font-fraunces { font-family: "Fraunces", serif !important; }
.smplfy-font-big-shoulders { font-family: "Big Shoulders", sans-serif !important; }
.smplfy-font-parkinsans { font-family: "Parkinsans", sans-serif !important; }
.smplfy-font-urbanist { font-family: "Urbanist", sans-serif !important; }
.smplfy-font-outfit { font-family: "Outfit", sans-serif !important; }
.smplfy-font-familjen-grotesk { font-family: "Familjen Grotesk", sans-serif !important; }
.smplfy-font-gaegu { font-family: "Gaegu", cursive !important; }
.smplfy-font-caveat { font-family: "Caveat", cursive !important; }
```

Added dropdown row and heart styles:

```scss
.smplfy-template-font-menu .list-group {
  scrollbar-gutter: stable;
}

.smplfy-template-font-option.smplfy-rich-dropdown-option.list-group-item {
  cursor: pointer;
}

.smplfy-template-font-option-label {
  min-width: 0;
  flex: 1 1 auto;
  overflow: hidden;
  color: inherit;
  font-size: var(--smplfy-search-result-font-size);
  line-height: var(--smplfy-search-result-line-height);
  font-weight: 500;
  letter-spacing: var(--smplfy-search-result-letter-spacing);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.smplfy-template-font-favorite.btn {
  --bs-btn-color: var(--smplfy-primitive-neutral-500);
  --bs-btn-bg: transparent;
  --bs-btn-border-color: transparent;
  --bs-btn-hover-color: var(--smplfy-primitive-red-500);
  --bs-btn-hover-bg: var(--smplfy-primitive-red-50);
  --bs-btn-hover-border-color: transparent;
  --bs-btn-active-color: var(--smplfy-primitive-red-600);
  --bs-btn-active-bg: var(--smplfy-primitive-red-100);
  --bs-btn-active-border-color: transparent;
  --bs-btn-focus-box-shadow: none;

  width: 28px;
  min-width: 28px;
  height: 28px;
  min-height: 28px;
  border-radius: 999px;
}

.smplfy-template-font-favorite.is-active.btn {
  --bs-btn-color: var(--smplfy-primitive-red-500);
}

.smplfy-template-font-option.active .smplfy-template-font-favorite.btn {
  --bs-btn-color: var(--smplfy-primitive-neutral-600);
  --bs-btn-hover-color: var(--smplfy-primitive-red-500);
  --bs-btn-hover-bg: var(--smplfy-primitive-red-50);
}

.smplfy-template-font-option.active .smplfy-template-font-favorite.is-active.btn {
  --bs-btn-color: var(--smplfy-primitive-red-500);
}
```

## Implementation Note

The reverted implementation used a remote Google Fonts CSS import. For production, consider replacing that with installed `@fontsource/*` packages or a local font loading strategy if network-free builds are required.
