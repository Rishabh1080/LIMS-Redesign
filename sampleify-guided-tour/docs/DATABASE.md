# Sampleify guided tour: database (MongoDB)

Handoff for whoever sets up the database. The tour is a static site on Vercel. It will read and write this database through Vercel serverless functions (`/api/...`). The browser never connects to MongoDB.

## 1. What to set up

1. **A MongoDB Atlas cluster.** The simplest route is Vercel's MongoDB Atlas integration (Vercel dashboard > Storage / Marketplace > MongoDB Atlas). It creates the cluster and adds the connection string to the Vercel project as an environment variable. The free M0 tier is enough.
2. **Database name:** `sampleify-walkthrough`.
3. **A database user** with `readWrite` on `sampleify-walkthrough` only (not an Atlas admin). The app uses `sampleify-walkthrough-zero`.
4. **Network access.** Vercel functions have no fixed IP, so Atlas must accept connections from anywhere (`0.0.0.0/0`), protected by a strong password. The Marketplace integration handles this; if set up by hand, do it manually.
5. **Environment variables** (Vercel project, Production and Preview, and `.env.local` for local work). Never commit them.

| Variable | Value |
| --- | --- |
| `MONGODB_URI` | Atlas connection string, `mongodb+srv://...` |
| `MONGODB_DB` | `sampleify-walkthrough` |
| `OTP_FREE_DAYS` | `7` (days a verified phone number skips the OTP) |
| `ADMIN_PASSWORD` | Password for the admin page, `/api/admin/setups` |

The app creates the collections and indexes below on first use. `.env.example` lists the variables. To test the connection locally: `node --env-file=.env.local scripts/db-check.mjs`.

## 2. Collections

Three collections. Dates are UTC `Date` values. Phone numbers are always stored normalised to E.164, for example `+919876543210`, so the same number can't appear twice in different formats.

### `users`: one document per phone number

```jsonc
{
  "_id": ObjectId,
  "phone": "+919876543210",          // unique
  "otpVerifiedAt": ISODate | null,   // last time an OTP was verified
  "otpFreeUntil": ISODate | null,    // otpVerifiedAt + OTP_FREE_DAYS; no OTP needed while now < this
  "setupCount": 3,                   // how many setups this number has started
  "firstSeenAt": ISODate,
  "lastSeenAt": ISODate,
  "createdAt": ISODate,
  "updatedAt": ISODate
}
```

### `setups`: one document per setup

A setup is one run of the onboarding: name, lab name and the lab-type selections. The same phone number can have many setups, for example when someone restarts the tour with a different lab name or lab type.

```jsonc
{
  "_id": ObjectId,
  "userId": ObjectId,                // -> users._id
  "phone": "+919876543210",          // copied from the user, so a setup reads on its own

  // What the visitor entered
  "name": "Asha Rao",
  "labName": "Rao Labs",
  "labTypes": ["food", "water"],     // "What does your lab test?" selections, in the order picked
  "domain": "multi",                 // the sample data set the tour used: one lab type, or "multi"

  // OTP outcome for this setup
  "status": "verified",              // "phone_entered" -> "verified"
  "otpSkipped": false,               // true when the phone was inside its free window
  "startedAt": ISODate,              // when the phone number was submitted
  "verifiedAt": ISODate | null,
  "lastActiveAt": ISODate,

  // Where they came from
  "client": { "userAgent": "...", "referrer": "...", "utm": { "source": "...", "medium": "...", "campaign": "..." } },

  // Reserved for phase 2 (progress tracking). Create it now with these defaults, fill it later.
  "progress": { "tasksTotal": 7, "completedTaskIds": [], "currentTaskId": null, "currentStepIndex": 0, "lastEventAt": null },

  "createdAt": ISODate,
  "updatedAt": ISODate
}
```

`labTypes` values are the lab-type ids already in the app: `pharma`, `food`, `metals`, `textiles`, `construction` (and any others added to the lab-type picker).

### `otp_events`: one document per OTP action (audit and abuse control)

```jsonc
{
  "_id": ObjectId,
  "phone": "+919876543210",
  "setupId": ObjectId,
  "type": "send",                    // "send" | "verify" | "skip"
  "result": "sent",                  // see below
  "provider": "gupshup",             // "gupshup" | "none"
  "providerRef": "3545912456442574189",
  "ip": "203.0.113.7",
  "createdAt": ISODate
}
```

`result` is one of `sent`, `failed`, `verified`, `mismatch`, `expired`, `rate_limited`, `skipped_within_window`. The OTP code itself is never stored. The OTP provider generates and checks it.

## 3. Indexes

| Collection | Index | Why |
| --- | --- | --- |
| `users` | `{ phone: 1 }` **unique** | One user per number; the OTP window lookup |
| `setups` | `{ userId: 1, createdAt: -1 }` | A person's setups, newest first |
| `setups` | `{ createdAt: -1 }` | The "everything, newest first" view |
| `setups` | `{ phone: 1 }` | Find by number |
| `otp_events` | `{ phone: 1, createdAt: -1 }` | Rate limits ("3 sends per hour") |
| `otp_events` | `{ createdAt: 1 }` **TTL 90 days** | Old events delete themselves |

## 4. The 7-day OTP rule

When the visitor submits their phone number:

1. Normalise the number and find or create its `users` document.
2. Create a `setups` document with the name, lab name, lab types and `status: "phone_entered"`.
3. **If `users.otpFreeUntil` is later than now:** send no SMS. Set the setup to `verified` with `otpSkipped: true`, write an `otp_events` row (`type: "skip"`, `result: "skipped_within_window"`) and send the visitor straight into the tour.
4. **Otherwise:** send an OTP, write an `otp_events` row (`type: "send"`) and wait for the code.

When the OTP is verified:

- Set `users.otpVerifiedAt = now` and `users.otpFreeUntil = now + OTP_FREE_DAYS`.
- Set the setup to `verified`.
- Write an `otp_events` row (`type: "verify"`, `result: "verified"`).

The 7 days run from the last real OTP verification. Skipped logins don't extend the window, so after 7 days the visitor always gets a fresh OTP.

## 5. Notes

- **Not recorded:** anyone who leaves before submitting a phone number. There is no identifier yet, so a setup can only be written at the phone step.
- **Phone-only skip:** the 7-day skip checks only the phone number, as requested. Anyone who types a verified number inside its window skips the OTP for that number. That only affects lead data quality here, since a setup exposes no other person's data. If it becomes a concern, tie the skip to a signed cookie on the same device.
- **Privacy:** this stores phone numbers. Add a short consent line under the phone field, restrict database access to the people who need it, and keep it out of logs.
- **Viewing the data:** open `/api/admin/setups` on the site. The browser asks for a username and password: any username, password = `ADMIN_PASSWORD`. It lists setups newest first (times in IST), with a phone filter; add `?format=json` for raw data. Atlas > Browse Collections shows the same data.
- **Phase 2:** progress tracking will add a `tour_events` collection (task started, step completed, "Fill for me" used, task completed) linked to `setupId`. The `progress` object on `setups` holds the running summary.

## 6. API (implemented)

The functions live in `api/` and deploy to Vercel automatically. `npm run dev` serves the same functions locally (vite.config.js), reading `.env.local`.

| Endpoint | Called when | Does |
| --- | --- | --- |
| `POST /api/setup/start` | Phone number submitted | Upserts the user, records the setup, applies the 7-day rule; returns `{ setupId, otpRequired }`. Rate limited to 10 per number and 40 per IP per hour. |
| `POST /api/setup/verified` | OTP accepted | Marks the setup verified and sets `otpFreeUntil` to now + `OTP_FREE_DAYS`. Only for a setup still waiting, started within the last hour. |
| `GET /api/admin/setups` | You open it | The admin table described above. |

The browser side is `src/services/setups.js`. If the API is unreachable, the tour carries on and asks for the OTP as before.

**Temporary, until the real OTP provider is connected:** the OTP is still the dummy one in `src/services/auth.js`, checked in the browser, and `/api/setup/verified` takes the browser's word for it. When the provider is added, sending and checking the code move to the server and `verified` checks the code first.
