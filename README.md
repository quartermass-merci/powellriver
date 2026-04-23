# Meridian 125W × Sister Merci — Field Planner

A real-time-sync, lightweight planner for the Powell River field research trip (Apr 26–30, 2026).

## What it does

- Editable itinerary + 15-min-increment timetable for the 3 field days.
- Two team lanes (PK + Jen / Mike + Katie).
- Drag to reschedule — drop on a free slot (move), drop on an occupied slot (swap if unpinned, push if pinned).
- Pin (■) any meeting to prevent it from being bumped.
- Map of Powell River with drive-time estimates; "Re-order day for travel" button on Mon + Wed.
- Lock-in form — adds a new meeting + generates a `.ics` file you can email.
- Real-time sync across devices via Firebase Realtime Database (optional — works in local-only mode until you set it up).

## Running locally (no setup)

Works out of the box in local-only mode (saves to your browser).

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## Enabling real-time sync (5 minutes)

1. Go to [https://console.firebase.google.com](https://console.firebase.google.com) → **Add project** → name it `meridian-powell-river` (or anything).
2. In the project, **Build → Realtime Database → Create database**. Pick a location (us-central is fine). Start in **test mode** (world-readable/writable for 30 days — plenty for this trip).
3. Project settings (⚙️) → **General** → scroll to "Your apps" → click the `</>` Web icon → register the app → **copy the `firebaseConfig` object**.
4. Paste the config into `firebase-config.js`, replacing the empty strings:

   ```js
   window.FIREBASE_CONFIG = {
     apiKey: "AIza...",
     authDomain: "meridian-powell-river.firebaseapp.com",
     databaseURL: "https://meridian-powell-river-default-rtdb.firebaseio.com",
     projectId: "meridian-powell-river",
     ...
   };
   ```

5. In Firebase console → **Authentication → Sign-in method → Anonymous → Enable**.

Reload the page. The `Local only` chip in the header should change to `Live sync`.

## Deploying

### Option A — Vercel (recommended, linked to GitHub)

Already configured via `vercel.json`. Every push to `main` auto-deploys.

### Option B — Firebase Hosting

```bash
npm i -g firebase-tools
firebase login
# edit .firebaserc — replace REPLACE_WITH_YOUR_FIREBASE_PROJECT_ID with your real project id
firebase deploy --only hosting
```

## Keyboard / mouse tips

- Click a block on the timetable → side drawer opens with full brief, edit fields, pin toggle, `.ics` download, delete.
- Drag a block to a new slot → moves it. Drop on occupied → swap (both unpinned) or push the existing block to the next free slot (if one of them is pinned).
- Day switcher in top-right of the nav works everywhere.
- Map → click any pin for drive times to the 5 nearest locations.

## File layout

- `index.html` — shell, nav, all sections, CDN imports (Tailwind, Alpine, Leaflet, Firebase).
- `assets/app.js` — Alpine root component, Firebase wiring, drag/drop, `.ics` generation, TSP re-order.
- `assets/seed.js` — canonical starting state transcribed from the source docx.
- `assets/locations.js` — ~26 Powell River + corridor locations with lat/lng + drive-time overrides.
- `assets/styles.css` — Sister Merci editorial look (Fraunces display + JetBrains Mono micro + forest/clay palette).
- `firebase-config.js` — paste your Firebase web config here.

## Editing seed data later

If the source plan changes meaningfully (not small tweaks — do those in-app), edit `assets/seed.js` and reload. Reloading with existing Firebase state won't overwrite your live edits — the remote state wins. To *replace* the remote state with fresh seed, delete the `/trips/meridian-powell-river` node in the Firebase console, reload, and the app will re-push the seed.

## Notes

- Drive-time estimates are approximations (1.3 × straight-line / 50 km·h) with manual overrides for ferry legs and known dogleg drives — useful for "can I fit this back-to-back?" judgments, not turn-by-turn.
- `.ics` events are written in floating local time with `TZID=America/Vancouver` — Apple Calendar + Google Calendar handle this correctly.
- RTDB test mode expires after 30 days — past Apr 30 2026, the security rules expire automatically and the app stops syncing. That's fine for this trip.
