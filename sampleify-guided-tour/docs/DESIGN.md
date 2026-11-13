# Design notes

## Audience and tone

Lab owners, technical managers and quality heads. They decide on the purchase, but they don't run tests. So every step says what to do and, where it adds something, one line on why it matters to the business (traceability, turnaround, audit readiness, visibility). Copy stays short. Long forms have "Fill for me" so nobody has to type a full inward to see the point.

## Flow

**Two users, equally likely:** a salesperson running the demo for a prospect, and a prospect trying it alone. Both want to get into the product fast, so every screen carries only what's needed to answer it. No taglines, eyebrows that repeat the stepper, feature lists or reassurance copy.

1. Welcome: logo, heading, one line, three points and the button, centred on the viewport. The points sell the test drive in a lab owner's terms: built around your lab, hands-on rather than a video, and what go-live looks like.
2. Your name and lab name (one screen, two fields), then lab type, then mobile (+91, 10 digits starting 6–9), then a 6-digit OTP. Enter submits (on the name screen, Enter in the first field moves to the second while it's empty), Back on each, progress shown as 1/4 to 4/4. Lab type comes before the phone number on purpose: easy, interesting questions first, the personal one last.
   - Screens slide in the direction of travel (forward moves left, Back moves right). The outgoing screen stays mounted while it leaves, so inputs never remount or lose focus.
   - From 1100px up, the name, phone and OTP screens sit beside a live preview of "your lab": the sidebar shows the lab name and the header your name as they're typed, the lab type tag after a tile is picked, then a verified tick on the profile chip. The header's phone chip is Sampleify's support line, as in the real product, so the visitor's number never appears in the preview or the LIMS header. The slot the current question fills pulses gently. The lab-type grid needs the full width, so the preview fades out with the outgoing screen and the new layout starts only after it has left.
3. OTP is dummy but feels real: a simulated SMS notification appears with the code and a "Fill code" button. A wrong code shakes the boxes and shows an error. Resend unlocks after 30 seconds.
4. "Setting up <lab name>": a skeleton of the LIMS assembles piece by piece (sidebar, header, KPI cards, chart) while one status line names each task, then the frame grows to fill the screen, lines up exactly with the real shell (256px sidebar, 64px header) and crossfades into it. About 4 seconds. Below 1024px or with reduced motion there's no zoom, just a fade.
5. A small welcome dialog: "Welcome in, <name>.", one line naming the first task and what follows (about 5 minutes), and a button that starts it ("Create a sample"). No syllabus list and no chapter numbers; the tracker in the sidebar already shows the tasks.

**Open recommendation (not built):** move the phone + OTP gate to after the first task, so visitors see value before they're asked for a number. See `RESEARCH.md`. It's a lead-capture trade-off for the business to decide.

## Lab type

Six tiles, multi-select ("Pick all that apply"). Each tile shows only its name and a small SVG scene: wheat and a culture plate (food), an HPLC chromatogram and capsule (pharma), a beaker with bubbles, a drop and a pH strip (water), a cube in a compression machine with a load gauge (construction), an OES spark and emission lines (metals), a weave fed from a bobbin (textiles). A scene plays only while its tile is hovered, focused or selected, so the grid is calm at rest and the chosen tile keeps moving. Six loops at once read as noise. Animations use transform, opacity and stroke-dashoffset only. Their resting state is the finished picture, so reduced motion shows them still. Tiles are native checkboxes: Space ticks, Enter continues.

**Decision: multi-select instead of a separate "multi-discipline" option.** Many labs test across categories; ticking the ones that apply is simpler than choosing between a tile and a catch-all. Picking several builds one lab from those packs (`src/store/domains/compose.js`): every category and customer, history from each in turn, and analysts authorised so every discipline is covered, so all three chapters work for any combination. The first lab type picked leads (roles, Fill for me presets).

**Decisions on the Gemini matrix:**
- Kept its five domains and added **Textiles & Apparel**, because the existing LIMS V3 app's own data (yarn, fabric, Bhadohi carpets) shows textile labs are Sampleify customers.
- Labs that span categories pick several tiles (see above).
- Corrected values that were off: cow-milk spec is fat NLT 3.2% / SNF NLT 8.3% (not protein NLT 3.5%), parameters carry real IS / ISO / ASTM / IP method numbers, and NABL disciplines are used for analyst authorisation (Chemical, Microbiology, Mechanical, Physical).
- What changes per lab type: customers, categories, products, parameters (method, specification, price, turnaround), instruments, reagents, analyst roles, disciplines, sample ID prefix (AR, FD, ENV, CIV, MET, TEX), the batch column label (Batch No., Lot / Batch, Sampling Point, Batch / Cube ID, Heat No., Lot No.), the reference placeholder, setup-screen and sidebar text, and a few lines of tour copy (who audits you, what you note per sample).
- **Not built:** Gemini's second section (stability chambers and pull schedules, OOS alerts, holding-time timers, LOQ/BLQ formatting, cube crushing schedules, OES import, domain report formats). Those are workflow modules, not data. They also aren't claimed anywhere in the copy, because the tour shouldn't promise features without confirming the product has them. They are good candidates for domain-specific chapters.

Every lab type seeds the same history shape (8 inwards, 9 samples, 25 tests: 5 waiting for allocation, 3 awaiting approval, one late inward), so the dashboard and the three chapters behave the same everywhere. A script-style check during development confirmed every pack's history, presets and disciplines line up.

## Tasks

| # | Task | Steps | What the visitor does |
| --- | --- | --- | --- |
| 1 | Create a sample | 8 | Clicks New Inward in the dashboard's Quick Actions (where the product starts it), picks a customer, adds samples, picks tests in the side drawer, adds paperwork (the due date is calculated here), saves, sees sample IDs and test requests created, then finds the new inward at the top of the register |
| 2 | Assign the tests | 9 | Opens Test Requests (tabs show work by stage), allocates one test (analyst authorisation, leave and workload shown; reviewer must differ), then bulk-allocates the rest |
| 3 | Check your dashboard | 3 | Sees the numbers they just moved ("to allocate" counts down to 0), lab health, and the category chart |

**Decision: tasks, with the work first.** The tour starts with the work (log a sample) and ends on the dashboard, so the numbers the visitor reads are the ones they changed. The old orientation steps (sidebar, tracker) were dropped: the visitor learns the sidebar by using it, and the tracker is always on screen. 20 steps, down from 24.

Action steps advance on their own when the store reaches the right state, so the visitor never has to click "Next" after doing the thing. Before advancing, the spotlight turns green and the card shows a one-line "done" message (250–900ms depending on the step; shorter when a dialog is about to open), so the visitor sees that their action worked. During action steps only the spotlighted area is clickable, so nobody wanders off by accident. Pause (or Escape) frees the whole app, and the tracker resumes from the same step.

## Type and quiet moments

**Type:** the guide (coach card, tracker, floating button, dialogs) uses three sizes only: 18px for titles, 14px for body text and buttons, 12px for meta (step count, task name, eyebrow, Pause). Hierarchy comes from weight, colour, case and the mono face, not extra sizes. The tokens are `--sgt-fs-title`, `--sgt-fs-body` and `--sgt-fs-meta`.

**Quiet moments:** whenever the screen changes or the page scrolls to the next target, the overlay steps aside so the visitor sees what happened.
- A new screen: the spotlight and card leave at once, and come back 1.5s after the screen appears. The first card there introduces the page.
- A scroll: the overlay stays hidden while the page scrolls and returns 650ms after it comes to rest.
- Open dropdown menus are closed when a step moves on.
- Under reduced motion the overlay doesn't wait.

## Motion

Every animation is there to explain something: where you're going, what changed, or that something worked. Research and sources are in `RESEARCH.md`.

| Moment | What moves | Why |
| --- | --- | --- |
| Onboarding questions | Directional slide (forward left, back right) | Orientation |
| Live lab preview | Answer lands in its slot with a highlight | Shows the product being built from your answers |
| Setup to LIMS | Skeleton assembles, then zooms onto the real shell | One continuous object instead of a cut to a new screen |
| Coach card | Pointer arrow towards the target. Between steps the card shrinks into the spotlight (130ms), the spotlight travels to the next target (240ms), and the next card grows out of it (180ms); about half a second, the same for Next, Back and auto-advance | The eye follows one object, and the card never slides across the screen |
| Action done | Green spotlight + "done" line before auto-advance | Confirms the action before the next ask |
| Fill for me | A labelled "Sampleify" cursor moves to each field and clicks | Visitors see where the data went, not a form that filled itself |
| Dashboard numbers | Count from the last value seen; the changed card flashes | Shows cause and effect (allocating makes "to allocate" drop) |
| Tracker | Percent, and a check that pops on the chapter just finished | Progress you can feel |
| Task complete | Small burst | Small win |
| Tour complete | Confetti, once | The only big celebration, saved for the end |
| Dialogs | Animate out as well as in | No hard cuts |

Rules: transform and opacity wherever possible (plus stroke-dashoffset in SVG art). The spotlight is the exception: it travels with top/left/width/height over 240ms so it stays pixel-aligned with the target. Exits are faster than entrances (170ms vs 220–440ms). Nothing loops unless it marks the active thing (the selected tile, the slot being filled, the target of an action step). With `prefers-reduced-motion`, durations drop to 1ms, the zoom and ghost cursor are skipped, confetti and burst are hidden, and numbers show their final value immediately. Information is never carried only by motion.

## Progress tracker placement

**Decision: sidebar by default, FAB available** (`trackerPlacement: 'fab'` or `?tracker=fab`).
- The sidebar only has three items, so its bottom half is free and the tracker is always visible without covering work.
- Bottom-right is where the LIMS puts form actions (Save inward), toasts and, on longer tables, row actions. A FAB there competes with them (`screenshots/v2-34-fab.png`).
- When the sidebar is collapsed, the tracker becomes a progress ring with the same content in a popover.

## LIMS replica

Visual language copied from the existing app (smplfy tokens, AppChrome shell, dashboard cards in the same 6 / 4 / 2 row with the same Quick Actions, SampleCard data-grid view, NavSelector tabs, allocation modal). Reimplemented as plain CSS with no Bootstrap, so it can't clash with the host site.

Trimmed on purpose (stakeholders need the shape of the flow, not every field):
- New inward keeps: Sample type, Receiving date, Customer (with auto-filled billing address, contact and GST), product rows (category, product, sample size + unit, batch), tests per product (drawer with method, discipline, price, turnaround), Receipt mode, Customer ref., Received by, auto Target reporting date.
- Dropped from the real form: quotation picker, new-customer modal, product-wise basic details, sample drawn by, nature of sample, specification, stamped by, heat no., make, PO sr. no., copy / paste / auto-fill table tools, the page-version switcher.
- Allocation keeps: analyst table (open workload, authorisation for the batch's disciplines, leave, last trained), reviewer (must differ from analyst), instrument (breakdown can't be booked), instruments and materials tabs.

The demo data is generated relative to "now", so the dashboard always looks like a live working day. All companies and people are fictional.

## Not built yet

- Tasks for result entry, review and approval, report / COA generation, audit trail.
- A real OTP provider and lead capture (`src/services/auth.js`, `onLeadCaptured`).
- Domain-specific workflows (see Lab type above).
- Dark theme.
- A tuned mobile LIMS layout. Onboarding is fully responsive. Below 1024px the LIMS shows a "best on a bigger screen" notice and keeps the sidebar as an icon rail.
