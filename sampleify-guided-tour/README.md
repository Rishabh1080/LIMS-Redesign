# Sampleify guided tour

A self-contained onboarding flow and interactive tutorial of the Sampleify LIMS, written for lab owners and technical managers. It runs in its own tab: welcome, your name and lab name, lab type, mobile number, OTP (dummy), a "setting up your lab" moment, then a working LIMS replica (Dashboard, All inwards, Test Requests) with a step-by-step coach and a progress tracker.

The lab types the visitor picks (Food & Agriculture, Pharmaceuticals, Water & Environment, Construction Materials, Metals & Minerals, Textiles & Apparel; one or several) decide the whole demo dataset: customers, product categories, test methods and specifications, instruments, reagents, analyst roles and disciplines, sample ID prefix, field labels and some tour copy.

Motion carries the explanation: questions slide in the direction of travel, a live preview of "your lab" fills in as the visitor answers, the setup screen zooms straight into the real LIMS, the coach card points at its target, finished actions get a short green "done" beat, "Fill for me" moves a labelled cursor to each field it fills, and dashboard numbers count to their new value. Reduced motion is respected throughout. Details in `docs/DESIGN.md` (Motion) and the research behind it in `docs/RESEARCH.md`.

Everything lives in this folder. It imports nothing from any other project.

## How the LIMS screens are built

The LIMS inside the tour is the prototype's own code, imported from `../src` (alias `@proto` in `vite.config.js`), so every screen matches the prototype exactly. The prototype's "sample" is the tour's inward: the sample card listing is All inwards, and Sample Details is Inward Details. `npm run build` bundles those screens, so `dist/` is self-contained.

Tutorial-only files, all in `src/proto/`:
- `TutorialApp.jsx`: routes between the prototype pages the way the prototype's `App.jsx` does, and keeps the state one inward needs from creation to COA.
- `TutorialChrome.jsx`: copy of `AppChrome` with only Dashboard and All inwards in the sidebar and the visitor's lab and name. Prototype pages get it through an import alias.
- `InwardDetailsPage.jsx`: copy of `SampleDetailsPage`. Send for Review (next state: Under Allocation), Action Required and the activity trail run on tutorial state.
- `TestRequestApprovalActionModal.jsx`: wraps the prototype modal so the tour hears about approvals. `analyticsStub.js`: no analytics from the tutorial.

The seven tasks are in `src/tour/chapters/protoTasks.js`. Steps target the prototype's DOM with `css:<selector>` or `text:<selector>|<label>[|<closest>]`, and can complete on what's on screen (`doneDom`). The tracker is a floating button by default; it lists the tasks, what's done, and lets you retry any of them.

## Run it standalone

```bash
npm install
npm run dev      # http://localhost:5310
npm run build    # static build in dist/ (relative asset paths)
npm run preview  # serves dist/ on http://localhost:5320 (ngrok hosts allowed, for sharing a link)
```

Useful URLs: `?reset=1` clears all saved progress, `?tracker=fab` shows the floating tracker instead of the sidebar one, `?domain=water` preselects a lab type (ids: `food`, `pharma`, `water`, `construction`, `metals`, `textiles`); several are comma-separated, e.g. `?domain=food,water`. Combine params, e.g. `?reset=1&domain=metals`.

`?domain=` is also handy on the website: link to the tour from an industry page with that industry already selected, e.g. `/tour?domain=pharma`.

## Integrate into the Next.js site (sampleify.in)

Recommended: render it on its own route, opened in a new tab from a button.

1. Copy this folder into the project root, e.g. `<project>/sampleify-guided-tour/`. Don't copy `node_modules/` or `dist/`.
2. Install the one runtime dependency in the host: `npm install @tabler/icons-react@3.41.1` (React comes from the host).
3. Add a client wrapper and the route (App Router; adjust the relative import if the app lives in `src/app/`):

```jsx
// app/tour/TourClient.jsx
'use client';
import { SampleifyGuidedTour } from '../../sampleify-guided-tour/src';

export default function TourClient() {
  return (
    <SampleifyGuidedTour
      config={{
        ctaUrl: 'https://www.sampleify.in/', // point at the demo-booking page
        onEvent: (name, props) => {
          // forward to analytics if wanted, e.g. posthog.capture(`tour_${name}`, props)
        },
      }}
    />
  );
}
```

```jsx
// app/tour/page.jsx
import TourClient from './TourClient';

export const metadata = {
  title: 'Guided tour · Sampleify',
  robots: { index: false },
};

export default function TourPage() {
  return <TourClient />;
}
```

4. The entry button on the marketing site:

```jsx
<a href="/tour" target="_blank" rel="noopener">Take the guided tour</a>
```

Notes for the host:
- The tour covers the whole viewport (`.sgt-root` is `position: fixed; inset: 0`), so the route needs no layout of its own. Site headers/footers from a shared layout are simply covered.
- Fonts: it uses the host's `--font-inter` and `--font-plex` CSS variables (set by `next/font` on sampleify.in) and falls back to `Inter` / `IBM Plex Mono`.
- Styles are plain CSS, imported once by the entry component. Every selector is prefixed `.sgt-`, all tokens are scoped to `.sgt-root`, so nothing leaks into the site. App Router allows this import. On the Pages Router (global CSS only in `_app`), use the static option below instead.
- SSR-safe: nothing touches `window` at import time; the server renders an empty placeholder and the app starts after mount.
- Light theme only, regardless of the site's dark mode.

### Alternative: static build

`npm run build`, copy `dist/` to `<project>/public/tour/`, and link to `/tour/index.html` with `target="_blank"`. Asset paths are relative, so any folder name works. No React, routing or CSS integration needed.

## Config

| Key | Default | What it does |
| --- | --- | --- |
| `ctaUrl` | `https://www.sampleify.in/` | "Book a live demo" link on the wrap-up screen (new tab). |
| `ctaLabel` | `Book a live demo` | Label for that button. |
| `supportPhone` | `+91-6358273804` | Sampleify's support line in the LIMS header and the onboarding preview. The visitor's own number is never shown there. |
| `trackerPlacement` | `'sidebar'` | `'sidebar'` (bottom half of the sidebar) or `'fab'` (bottom-right button). |
| `storageKey` | `sampleify-tour:v1` | localStorage namespace. Change it to invalidate everyone's saved progress. |
| `readUrlParams` | `true` | Honour `?reset=1` and `?tracker=`. |
| `onEvent(name, props)` | no-op | Analytics hook. |
| `onLeadCaptured({ name, labName, phone, labType, labTypes, labTypeLabel })` | no-op | Called once after OTP verification. `phone` is `+91XXXXXXXXXX`, `labTypes` is the picked ids in the order picked (e.g. `['food', 'water']`), `labType` is them joined with commas, `labTypeLabel` e.g. `Food & Agriculture + Water & Environment`. |

Events: `tour_started`, `onboarding_step_completed` (the lab step sends `{ step: 'lab', domain }`), `chapter_started`, `step_completed` (`via`: next / auto / skipped), `assist_used`, `chapter_completed`, `tour_completed`, `tour_paused`, `tour_resumed`, `tour_restarted`, `tour_reset`, `cta_clicked`.

Name, lab name and phone are personal data. The tour only keeps them in the visitor's localStorage and passes them to `onLeadCaptured`. It never sends them anywhere itself.

## The dummy OTP

`src/services/auth.js` holds `sendOtp(phone)` and `verifyOtp(phone, code)`. Today `sendOtp` generates a code and returns it so the UI can show a simulated SMS. To go live, call your SMS provider through your own API route, keep the same return shapes, and stop returning `demoCode` (the simulated SMS then simply never appears).

## Saved state

| Key | Contents |
| --- | --- |
| `<storageKey>:profile` | name, lab name, lab type(s), phone, verified time |
| `<storageKey>:lims` | the replica's data (tagged with its lab type), the in-progress inward draft, current page |
| `<storageKey>:tour` | tour status, current chapter/step, completed chapters |

A refresh resumes where the visitor was. "Start over" in the profile menu clears all three, which is also how a visitor switches lab type. Visitors saved before lab types existed get the general multi-discipline lab (`multi`); visitors saved before lab names were asked see "<first name>'s Lab".

## Adding or editing a lab type

Each lab type is one file in `src/store/domains/` (a "pack"). Copy the closest one, give it a new `id`, and add it to the list in `src/store/domains/index.js`. Then add a tile illustration to `src/onboarding/DomainArt.jsx` (`domainArt[<id>]`) and a tint in `src/styles/domain.css` (`.sgt-domain-tile--<id>`).

A pack holds:

| Field | Used for |
| --- | --- |
| `label` | the onboarding tile (`tileLine` and `standards` are kept for reference but no longer shown) |
| `tag`, `labNoun`, `methodsLine`, `auditors` | sidebar label, setup screen and tour copy |
| `disciplines` | two NABL disciplines, e.g. `['Chemical', 'Microbiology']`. Analysts are authorised per discipline |
| `samplePrefix`, `batchLabel`, `batchPlaceholder`, `refPlaceholder` | sample IDs (`ENV/2026/0410`) and New Inward field labels |
| `customers`, `categories` (products + parameters with method, spec, discipline, price, turnaround), `instruments`, `materials`, `analysts` | the replica's reference data |
| `history` | 8 seeded inwards. Their test counts must follow the template in `src/store/seed.js` (3, 3, 3, 3+2, 3, 4, 2, 2) so every lab gets the same dashboard shape |
| `presets` | what "Fill for me" enters during chapter 2 |

When a visitor picks several lab types, `src/store/domains/compose.js` builds one lab from those packs: all their categories and customers, history slots taken from each pack in turn, analysts authorised so every discipline is covered, and the generic `SMP` sample prefix. The first lab type picked leads.

All companies, people, GST numbers and phone numbers in the packs are fictional.

## Adding a chapter

1. Create `src/tour/chapters/<name>.js` exporting `{ id, title, summary, duration, outcome, steps }`.
2. Add it to the list in `src/tour/chapters/index.js` (that order is the tracker order).
3. Put `data-tour="<target-id>"` on any element a step should point at. Never target CSS classes.

Step fields (any text field can also be a function `(limsState, ctx) => value`):

| Field | Meaning |
| --- | --- |
| `id` | unique within the chapter |
| `kind` | `'info'` (Next button) or `'action'` (advances when `done` becomes true) |
| `target` | `data-tour` id to spotlight |
| `placement` | preferred side for the coach card: `top`, `bottom`, `left`, `right` (flips if it doesn't fit) |
| `title`, `body`, `why`, `hint` | copy. `why` is the "Why it matters" line, `hint` is the "Your turn" line on action steps |
| `page` | page(s) the step belongs to. Info steps navigate there automatically |
| `done(state, stateAtStepStart, ctx)` | action steps only |
| `doneText` | the line shown in the green "done" beat, e.g. `'Inward saved.'` (default `Done. Nice work.`) |
| `advanceDelay` | ms the done beat stays before moving on (default 800, capped at 450 with reduced motion) |
| `assist: { label, run(api) }` | "Fill for me" / "Do it for me". `api` has `dispatch`, `getState`, `actions`, `navigate`, `sleep`, `type`, and `point(target, { click, wait })`, which moves the ghost cursor to a CSS selector, element or `(root) => element` finder and plays a click. Call `point` before each change so the visitor sees where it happens. It's a no-op with reduced motion |
| `autoNavigate` | info steps navigate to `page` by default; set `false` to stop that, or `true` on an action step |
| `requires` + `backTo` | if `requires(state)` turns false (e.g. a modal was closed), jump back to step `backTo` |
| `skipIf(state)` | skip the step entirely |
| `onEnter(api)` | runs when the step starts |
| `interactive` | let an info step's target be clicked |
| `nextLabel` | custom label for the Next button |

The LIMS store (`src/store/LimsStore.jsx`) is a plain reducer. New pages go in `src/lims/pages/`, plus a sidebar entry in `src/lims/Shell.jsx`.

## Folder map

```
src/
  index.js                 public exports
  SampleifyGuidedTour.jsx  root: onboarding -> setup -> LIMS + tour
  config.js                defaults
  onboarding/              welcome, name + lab name, lab type (multi-select, animated tiles), phone, OTP, simulated SMS, lab setup
                           StageTransition (directional question transitions), LabPreview (live "your lab")
  lims/                    shell (sidebar, header), pages, shared UI
  store/                   domains/ (one pack per lab type), catalog lookups, seed, selectors, reducer store
  tour/                    engine, spotlight + coach card, dialogs, tracker, chapters, assists, GhostCursor
  services/auth.js         dummy OTP
  styles/                  tokens + scoped CSS; experience.css holds the motion layer
dev/main.jsx               standalone harness (loads fonts)
docs/                      DESIGN.md, RESEARCH.md (UX research + decisions), screenshots/
```
