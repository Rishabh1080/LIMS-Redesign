# UX research: onboarding, guided tours, interactive demos

Sources: Refero (flows, screens, styles) and the Chameleon 2025 in-app benchmark. Findings are paraphrased.

## What the evidence says

| # | Finding | Source |
| --- | --- | --- |
| 1 | 3–4 step tours complete about 72–74% of the time; by 7 steps about 16%. The top 1% of tours stay at 5 steps or fewer. | Chameleon 2025 |
| 2 | Split long tours into short modules the user picks from. Checklist-launched tours had the highest completion of any type (67%). | Chameleon 2025 |
| 3 | A visible progress indicator lifts completion by about 12%. | Chameleon 2025 |
| 4 | Tours the user starts get about double the engagement of tours that start on their own. | Chameleon 2025 |
| 5 | Tip copy over about 26 words gets skipped. | Chameleon 2025 |
| 6 | Value before the ask: defer sign-up gates until the user has felt value. | Chameleon 2025 (citing Navattic, Arcade) |
| 7 | Do, don't only show: complete the task for the user while showing how. | Chameleon 2025 |
| 8 | Name-first personalisation ("Hi Liam, …"). A picked option fills and checks before moving on. Progress on every question. | Refero flow 1263 (Homerun) |
| 9 | While you name your workspace, a live product mock beside the form shows what you're creating. | Refero: Loom 7c3d23cd, Tango a1ac2945, Hello Ivy 83dc6f6b |
| 10 | "Creating your …" loaders show a skeleton of the thing being made, not a spinner. | Refero: GoFundMe fc54661d |
| 11 | Checklists show a percentage and a dial; done rows checked, the next row highlighted; a persistent "40% Complete" pill. | Refero: Deel d0a1bcc7, DocuSign d197ffa5, Dropbox flow 13021 |
| 12 | Spotlights point at the exact control: glowing outline plus an arrow from the instruction to the target. | Refero: Tango 8a3b9459 |
| 13 | Dim the page, one highlight per step, "step x of y", end with Done and return to the real UI. | Refero flow 11413 (Product Hunt) |
| 14 | Completion: confetti, a preview of what you built, one primary CTA and a quiet "skip and explore". | Refero: The Leap c3fb4e8a, ManyChat f44ba6ff, Linear df32c961 |
| 15 | Interactive-demo look: white canvas, one accent for interaction only, layered soft shadows, 12–16px radii, no abrupt transitions. | Refero style: Arcade ba425c3b |
| 16 | Motion must serve feedback, continuity or hierarchy. Enter ease-out, exit faster ease-in, no competing loops, respect reduced motion. | Refero skill, motion reference |

## Gaps in the previous build

| Area | Before | Gap (finding) |
| --- | --- | --- |
| Tour length | 6 + 11 + 11 = 28 steps; chapter 1 was all "Next" | Too long and passive (1, 7) |
| Onboarding | Centred column; answers went nowhere visible | No sense of the lab being built (8, 9) |
| Lab-type tiles | All six illustrations looped at once | Competing motion, no hierarchy (16) |
| Setup | Ring + checklist, then a fade | Shows waiting, not the result (10) |
| Coach card | Sat beside the target with no pointer | Weak link between tip and control (12) |
| Action steps | Card silently changed once done | No "that worked" feedback (16) |
| Dashboard payoff | Final step says the number dropped, but it's already static | The cause and effect is invisible (16) |
| Exits | Dialogs and screens vanished instantly | "Teleporting" instead of moving (16) |
| Completion | Badge + stats | No celebration beat (14) |

## Decision ledger

| Decision | Source | Why |
| --- | --- | --- |
| Live "your lab" preview beside name and phone questions, filling in as you type | 9, 8 | Every answer visibly builds something |
| Setup screen assembles that same preview as a skeleton of the LIMS, then zooms it to full screen and hands over to the real app | 10, 16 (continuity) | The waiting moment shows the result and lands exactly on the real layout |
| Lab-type art animates only when hovered, focused or selected | 16 | The chosen lab "comes alive"; at rest the grid is calm |
| Forward/back slide between onboarding questions; exits shorter than entries | 16 | Direction and continuity |
| Trim tour to 5 + 9 + 10 = 24 steps by merging info-only steps | 1, 5 | Fewer passive clicks, same story |
| Pointer arrow on the coach card aimed at the target's centre | 12 | Tip and control read as one thing |
| Success state on every action step (green ring + "Done" check) before advancing | 16 (feedback) | Confirms the click worked |
| "Fill for me" moves a labelled Sampleify cursor to each field and clicks before filling it | 7 | Doing it for the visitor still shows them where each thing goes |
| Layout changes (preview column appearing or leaving) wait for the outgoing question to finish its exit | 16 (continuity) | No mid-exit reflow or vanishing preview |
| Dashboard numbers count from their last-seen value to the new one | 16 (continuity) | The exec sees the number move because of what they did |
| Tracker shows a percentage; finished chapters pop a check | 3, 11 | Progress is always visible and rewarding |
| Dialog exit animations; confetti only at tour completion, a small burst at chapter completion | 14, 16 | Celebration where it's earned, restraint elsewhere |
| Keep name → lab → phone → OTP before the LIMS | User brief | See recommendation below |

## Recommendation not implemented

Finding 6 argues for letting visitors into the LIMS before asking for the phone number (e.g. ask after chapter 1). That trades lead capture for completion, so it's a business call. It's a small change in `SampleifyGuidedTour.jsx` if you want it.
