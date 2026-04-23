/* Meridian Field Planner — Alpine app.
 * Single root component trip(); state is the schedule + actions, optionally
 * mirrored to Firebase RTDB for real-time sync.
 */

function trip() {
  return {
    // ---- top-level state ----
    tab: 'overview',
    day: 'mon',
    version: '1.0',
    connState: 'connecting',
    lastEditedBy: null,
    lastEditedAt: 0,

    // data
    blocks: [],                // flat array of schedule blocks across all 3 days
    actions: [],
    selectedBlockId: null,
    toast: null,
    toastTimer: null,

    // drag
    draggingId: null,

    // map
    mapFromId: 'meridian',
    mapInstance: null,
    reorderPreview: null,

    // form
    form: {
      day: 'mon', start: '10:30', duration: 30, team: 'pk_jen',
      title: '', attendees: '', locationId: '', type: 'formal',
      brief: '', locked: true, emitIcs: true, emitMailto: false,
    },

    // constants passed through from window
    LOCATIONS: window.LOCATIONS,
    TEAMS: window.TEAMS,
    BLOCK_TYPES: window.BLOCK_TYPES,
    NON_NEGOTIABLES: window.NON_NEGOTIABLES,
    logistics: window.LOGISTICS,

    // ---- lifecycle ----
    init() {
      this.hydrateFromSeed();
      this.loadLocal();
      this.initFirebase();
      // When tab changes to map, initMap() is called via x-effect in HTML.
      // When the window regains focus, re-pull local (in case of multi-tab).
      window.addEventListener('beforeunload', () => this.saveLocal());
    },

    // ---- seed + local persistence ----
    hydrateFromSeed() {
      // Flatten the seeded schedule into a single blocks array.
      this.blocks = [];
      for (const day of Object.keys(window.SCHEDULE_SEED)) {
        for (const b of window.SCHEDULE_SEED[day]) {
          this.blocks.push({ ...b });
        }
      }
      this.actions = window.ACTION_ITEMS.map(a => ({ ...a }));
    },

    loadLocal() {
      try {
        const raw = localStorage.getItem('meridian-trip');
        if (!raw) return;
        const d = JSON.parse(raw);
        if (Array.isArray(d.blocks) && d.blocks.length) this.blocks = d.blocks;
        if (Array.isArray(d.actions) && d.actions.length) this.actions = d.actions;
      } catch (e) { console.warn('local load failed', e); }
    },

    saveLocal() {
      try {
        localStorage.setItem('meridian-trip', JSON.stringify({
          blocks: this.blocks, actions: this.actions,
          savedAt: Date.now(),
        }));
      } catch (e) { /* quota — fine */ }
    },

    // ---- Firebase real-time sync ----
    initFirebase() {
      const cfg = window.FIREBASE_CONFIG || {};
      if (!cfg.apiKey || !cfg.databaseURL) {
        this.connState = 'local';
        this.showToast('Local mode — paste Firebase config to enable sync');
        return;
      }
      try {
        if (!firebase.apps.length) firebase.initializeApp(cfg);
        const auth = firebase.auth();
        const db = firebase.database();
        auth.signInAnonymously().catch(err => console.warn('anon auth', err));
        auth.onAuthStateChanged(u => { this.uid = u?.uid || null; });

        const root = db.ref(`/trips/${window.TRIP_ID || 'meridian-powell-river'}`);
        // Initial pull
        root.once('value').then(snap => {
          const v = snap.val();
          if (v && v.blocks && Array.isArray(v.blocks) && v.blocks.length) {
            this.blocks = v.blocks;
            this.actions = v.actions || this.actions;
            this.lastEditedBy = v.meta?.lastEditedBy || null;
            this.lastEditedAt = v.meta?.lastEditedAt || 0;
          } else {
            // First run on this Firebase project — push the seed.
            this.pushRemote();
          }
          this.connState = 'live';
        }).catch(err => {
          console.warn('firebase read', err);
          this.connState = 'local';
          this.showToast('Sync unreachable — running locally');
        });
        // Subscribe
        root.on('value', snap => {
          const v = snap.val();
          if (!v) return;
          // Ignore our own write echo (matching lastEditedAt)
          if (v.meta && v.meta.lastEditedBy && v.meta.lastEditedBy === this.uid && v.meta.lastEditedAt === this.lastEditedAt) return;
          if (Array.isArray(v.blocks))  this.blocks  = v.blocks;
          if (Array.isArray(v.actions)) this.actions = v.actions;
          this.lastEditedBy = v.meta?.lastEditedBy || null;
          this.lastEditedAt = v.meta?.lastEditedAt || 0;
        });
        this._remoteRef = root;
      } catch (e) {
        console.warn('firebase init failed', e);
        this.connState = 'local';
      }
    },

    pushRemote() {
      this.saveLocal();
      if (!this._remoteRef) return;
      this.lastEditedAt = Date.now();
      this._remoteRef.set({
        blocks: this.blocks,
        actions: this.actions,
        meta: { version: this.version, lastEditedBy: this.uid || 'anon', lastEditedAt: this.lastEditedAt },
      }).catch(err => console.warn('firebase push', err));
    },

    get lastEditedByShort() {
      if (!this.lastEditedBy) return '';
      const s = String(this.lastEditedBy);
      return s.length > 6 ? s.slice(0, 6) : s;
    },

    showToast(text, ms = 2600) {
      this.toast = text;
      if (this.toastTimer) clearTimeout(this.toastTimer);
      this.toastTimer = setTimeout(() => { this.toast = null; }, ms);
    },

    // ---- derived data ----
    get timeSlots() {
      const slots = [];
      for (let h = 7; h <= 21; h++) {
        for (const m of [0, 15, 30, 45]) {
          if (h === 21 && m > 0) break;
          slots.push(`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`);
        }
      }
      return slots;
    },

    dayLabel(d) {
      return { mon: 'Monday · Apr 27', tue: 'Tuesday · Apr 28', wed: 'Wednesday · Apr 29' }[d] || d;
    },
    dayHeadline(d) {
      return {
        mon: 'Townsite, archives, Hulks. First community interviews — Craig/Ewan, Chris McDonough. Marine Ave MOTS set 1.',
        tue: 'Full Meridian embed. 4 formals + 4 shorts + roundtable. Staff lunch 12–1 in the parking lot.',
        wed: 'Stories, characters, mill tour at sunset. Brent B south at 8 AM. 12–15 story candidates by end of day.',
      }[d] || '';
    },

    blocksForDay(d) {
      return this.blocks.filter(b => b.day === d).slice().sort((a, b) => a.start.localeCompare(b.start) || ((a.team==='pk_jen'?0:1) - (b.team==='pk_jen'?0:1)));
    },
    interviewsForDay(d) {
      return window.INTERVIEWS.filter(i => i.day === d);
    },
    interviewById(id) {
      return window.INTERVIEWS.find(i => i.id === id);
    },
    blockById(id) {
      return this.blocks.find(b => b.id === id);
    },

    // Return blocks that START at the given slot in the given lane/day.
    blocksAt(day, team, slot) {
      return this.blocks.filter(b => b.day === day && b.team === team && b.start === slot);
    },

    locationLabel(id) {
      if (!id) return '';
      const l = window.locationById(id);
      return l ? l.name : '';
    },
    locationShort(id) {
      if (!id) return '—';
      const l = window.locationById(id);
      if (!l) return '—';
      return l.name.length > 26 ? l.name.slice(0, 24) + '…' : l.name;
    },

    addMinutes(hhmm, minutes) {
      const [h, m] = hhmm.split(':').map(Number);
      const total = h * 60 + m + minutes;
      const nh = Math.floor(total / 60), nm = total % 60;
      return `${String(nh).padStart(2,'0')}:${String(nm).padStart(2,'0')}`;
    },

    slotCompare(a, b) { return a.localeCompare(b); },

    slotsOverlap(aStart, aDur, bStart, bDur) {
      const toMin = s => { const [h,m] = s.split(':').map(Number); return h*60+m; };
      const aS = toMin(aStart), aE = aS + aDur;
      const bS = toMin(bStart), bE = bS + bDur;
      return aS < bE && bS < aE;
    },

    // ---- travel-gap warning ----
    travelWarn(b) {
      if (!b.locationId) return false;
      const sameLane = this.blocks
        .filter(x => x.day === b.day && x.team === b.team && x.id !== b.id)
        .sort((x, y) => x.start.localeCompare(y.start));
      // find previous block in the lane
      const prev = sameLane.filter(x => x.start < b.start).pop();
      if (!prev || !prev.locationId || prev.locationId === b.locationId) return false;
      const prevEnd = this.addMinutes(prev.start, prev.duration);
      const gap = this._minutesBetween(prevEnd, b.start);
      const needed = window.driveMinutes(prev.locationId, b.locationId);
      return needed > gap + 1; // allow 1-min fudge
    },
    _minutesBetween(a, b) {
      const toMin = s => { const [h,m] = s.split(':').map(Number); return h*60+m; };
      return Math.max(0, toMin(b) - toMin(a));
    },

    // ---- drag / drop / swap / push ----
    dragStart(e, id) {
      this.draggingId = id;
      e.dataTransfer.setData('text/plain', id);
      e.dataTransfer.effectAllowed = 'move';
    },
    onDrop(e) { /* root; cell handler below does the work */ },

    onDropCell(team, slot) {
      const id = this.draggingId;
      this.draggingId = null;
      if (!id) return;
      const moving = this.blockById(id);
      if (!moving) return;

      // Collect blocks that would overlap the moving block in its new placement
      const conflicts = this.blocks.filter(x =>
        x.id !== moving.id && x.day === moving.day && x.team === team &&
        this.slotsOverlap(slot, moving.duration, x.start, x.duration)
      );

      if (conflicts.length === 0) {
        moving.start = slot; moving.team = team;
        this.saveBlock(moving);
        return;
      }

      // 1 conflict, both unpinned → swap
      if (conflicts.length === 1 && !moving.locked && !conflicts[0].locked) {
        const other = conflicts[0];
        const movedStart = other.start;
        const otherStart = moving.start;
        const otherTeam = moving.team;
        other.start = otherStart; other.team = otherTeam;
        moving.start = movedStart; moving.team = team;
        this.saveBlock(moving); this.saveBlock(other);
        this.showToast(`Swapped with ${other.title}`);
        return;
      }

      // Otherwise → push conflicts to next free slot (if pushable)
      const pushable = conflicts.filter(c => !c.locked);
      const blockers = conflicts.filter(c => c.locked);
      if (blockers.length > 0) {
        this.showToast(`Can't move — ${blockers[0].title} is pinned`);
        return;
      }
      // Place moving first
      moving.start = slot; moving.team = team;
      this.saveBlock(moving);
      // Push each pushable to next free slot in the lane after moving end
      let cursor = this.addMinutes(slot, moving.duration);
      for (const c of pushable) {
        const free = this._findFreeSlot(moving.day, team, cursor, c.duration, [moving.id]);
        c.start = free; c.team = team;
        cursor = this.addMinutes(free, c.duration);
        this.saveBlock(c);
      }
      this.showToast(`Pushed ${pushable.length} meeting${pushable.length>1?'s':''}`);
    },

    // Find earliest free slot >= startFrom, in 15-min increments, in this lane
    _findFreeSlot(day, team, startFrom, duration, ignoreIds = []) {
      const slots = this.timeSlots;
      const idx = slots.indexOf(startFrom);
      const from = idx >= 0 ? idx : 0;
      for (let i = from; i < slots.length; i++) {
        const s = slots[i];
        // end-of-day guard
        const endIdx = i + Math.ceil(duration / 15);
        if (endIdx > slots.length) continue;
        const overlaps = this.blocks.some(x =>
          !ignoreIds.includes(x.id) && x.day === day && x.team === team &&
          this.slotsOverlap(s, duration, x.start, x.duration)
        );
        if (!overlaps) return s;
      }
      return slots[slots.length - 1];
    },

    // ---- CRUD ----
    openBlock(id) { this.selectedBlockId = id; },
    saveBlock(b) {
      const idx = this.blocks.findIndex(x => x.id === b.id);
      if (idx >= 0) this.blocks.splice(idx, 1, { ...b });
      this.pushRemote();
    },
    deleteBlock(b) {
      this.blocks = this.blocks.filter(x => x.id !== b.id);
      this.selectedBlockId = null;
      this.pushRemote();
      this.showToast('Deleted');
    },
    addAction() {
      this.actions.push({ owner: 'PK', text: 'New item', status: 'pending' });
      this.saveActions();
    },
    removeAction(i) {
      this.actions.splice(i, 1); this.saveActions();
    },
    saveActions() { this.pushRemote(); },

    // ---- Lock-in form ----
    submitLockIn() {
      const f = this.form;
      if (!f.title.trim()) { this.showToast('Title required'); return; }
      const id = `lock_${Date.now().toString(36)}`;
      const newBlock = {
        id, day: f.day, team: f.team, start: f.start, duration: f.duration,
        title: f.title.trim(),
        locationId: f.locationId || null,
        attendees: f.attendees || '',
        brief: f.brief || '',
        type: f.type || 'formal',
        locked: !!f.locked,
        interviewId: null,
      };
      // Place it via the same push/swap logic as a drop
      this.blocks.push(newBlock);
      // Remove it from "conflicts with itself" set by first leaving start as-is
      // then running drop logic
      this.draggingId = id;
      this.onDropCell(f.team, f.start);
      if (f.emitIcs)    this.downloadIcs(newBlock);
      if (f.emitMailto) this.openMailto(newBlock);
      this.showToast(`Locked in — ${newBlock.title}`);
      // Reset form (keep day/team)
      this.form.title = ''; this.form.attendees = ''; this.form.brief = '';
      this.tab = 'timetable';
    },

    // ---- .ics generation ----
    _icsDate(day, start) {
      // Field-day dates: Mon Apr 27 / Tue Apr 28 / Wed Apr 29 2026
      const dayMap = { mon: [2026, 4, 27], tue: [2026, 4, 28], wed: [2026, 4, 29] };
      const [y, M, d] = dayMap[day] || dayMap.mon;
      const [h, m] = start.split(':').map(Number);
      // Use local America/Vancouver — as a naive UTC offset (PT = UTC-7 in late April DST)
      const pad = n => String(n).padStart(2,'0');
      return `${y}${pad(M)}${pad(d)}T${pad(h)}${pad(m)}00`; // floating local time
    },
    downloadIcs(b) {
      const start = this._icsDate(b.day, b.start);
      const end = this._icsDate(b.day, this.addMinutes(b.start, b.duration));
      const loc = this.locationLabel(b.locationId) || '';
      const summary = b.title.replace(/[\n,;]/g, ' ');
      const desc = (b.brief || '').replace(/\n/g, '\\n');
      const attendees = (b.attendees || '').split(',').map(s => s.trim()).filter(Boolean)
        .map(a => `ATTENDEE;CN="${a.replace(/"/g,'')}":mailto:${a.replace(/\s+/g,'.').toLowerCase()}@example.com`)
        .join('\r\n');
      const ics = [
        'BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Sister Merci//Meridian Field Planner//EN',
        'BEGIN:VEVENT',
        `UID:${b.id}@sistermerci`,
        `DTSTAMP:${this._icsDate('mon','07:00')}`,
        `DTSTART;TZID=America/Vancouver:${start}`,
        `DTEND;TZID=America/Vancouver:${end}`,
        `SUMMARY:${summary}`,
        loc ? `LOCATION:${loc}` : '',
        desc ? `DESCRIPTION:${desc}` : '',
        attendees,
        'END:VEVENT','END:VCALENDAR'
      ].filter(Boolean).join('\r\n');
      const blob = new Blob([ics], { type: 'text/calendar' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `${b.title.replace(/[^a-z0-9]+/gi,'_').slice(0,40)}.ics`;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    },
    openMailto(b) {
      const subject = encodeURIComponent(`[Meridian field research] ${b.title} — ${this.dayLabel(b.day)}, ${b.start}`);
      const body = encodeURIComponent(
        `Hi,\n\nConfirming ${b.title} on ${this.dayLabel(b.day)} at ${b.start} PT (${b.duration} min).\n\n` +
        (this.locationLabel(b.locationId) ? `Location: ${this.locationLabel(b.locationId)}\n\n` : '') +
        `Brief:\n${b.brief || '—'}\n\n` +
        `— PK Lawton, Sister Merci`
      );
      window.location.href = `mailto:?subject=${subject}&body=${body}`;
    },

    // ---- Map ----
    initMap() {
      if (this.mapInstance) { setTimeout(() => this.mapInstance.invalidateSize(), 50); return; }
      if (typeof L === 'undefined') { setTimeout(() => this.initMap(), 200); return; }
      const el = document.getElementById('map-el');
      if (!el) return;
      const m = L.map(el, { scrollWheelZoom: false }).setView([49.87, -124.54], 12);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '&copy; OpenStreetMap'
      }).addTo(m);
      const catColor = {
        lodging: '#556B4F', facility: '#2B3A2E', interview: '#8B5A2B',
        archival: '#7B5E3A', food: '#C9A270', mots: '#44546A',
        media: '#6B1D1D', broll: '#B58C5A', ferry: '#6B6B6B', airport: '#6B6B6B',
      };
      window.LOCATIONS.forEach(l => {
        const color = catColor[l.cat] || '#2B3A2E';
        const icon = L.divIcon({
          className: 'marker-pin',
          html: `<div class="marker-dot" style="background:${color}"></div>`,
          iconSize: [18, 18], iconAnchor: [9, 9],
        });
        const marker = L.marker([l.lat, l.lng], { icon }).addTo(m);
        marker.bindPopup(() => {
          const nearest = this.driveBoard(l.id).slice(0, 5);
          const rows = nearest.map(r => `<li style="display:flex;justify-content:space-between;gap:12px;border-top:1px solid #ddd;padding:2px 0"><span>${r.name}</span><b>${r.minutes}m</b></li>`).join('');
          return `<div style="font-family:Inter,sans-serif">
            <div style="font-family:Fraunces,serif;font-size:14px;margin-bottom:4px">${l.name}</div>
            <div style="font-size:11px;opacity:0.7;margin-bottom:6px">${l.addr}</div>
            <div style="font-size:10px;letter-spacing:0.12em;text-transform:uppercase;opacity:0.6">Drive to…</div>
            <ul style="list-style:none;padding:0;margin:4px 0 0;font-size:12px">${rows}</ul>
          </div>`;
        });
      });
      // Fit to Powell River neighbourhood first (not all 26 locations including YVR)
      const pr = window.LOCATIONS.filter(l => ['lodging','facility','archival','food','mots','media','interview','broll'].includes(l.cat));
      m.fitBounds(pr.map(l => [l.lat, l.lng]), { padding: [40,40] });
      this.mapInstance = m;
    },

    driveBoard(fromId) {
      if (!fromId) return [];
      const rows = window.LOCATIONS
        .filter(l => l.id !== fromId)
        .map(l => ({
          toId: l.id, name: l.name, minutes: window.driveMinutes(fromId, l.id)
        }))
        .sort((a, b) => a.minutes - b.minutes);
      return rows.slice(0, 12);
    },

    // ---- TSP re-order (nearest neighbour) ----
    previewReorder(d) {
      if (d === 'tue') { this.showToast('Tue is single-site — nothing to re-order'); return; }
      const dayBlocks = this.blocksForDay(d);
      // We only re-order interview blocks (formal/short/portrait/roundtable); leave meals, travel, synthesis, broll in place but compute distances around them.
      const moveable = dayBlocks.filter(b =>
        !b.locked && ['formal','short','portrait','roundtable','informal'].includes(b.type)
      );
      if (moveable.length < 2) { this.showToast('Not enough moveable blocks'); return; }

      // Compute nearest-neighbour path starting from airbnb.
      let currentLoc = 'airbnb';
      let remaining = moveable.slice();
      let path = [];
      while (remaining.length) {
        remaining.sort((a, b) => window.driveMinutes(currentLoc, a.locationId) - window.driveMinutes(currentLoc, b.locationId));
        const next = remaining.shift();
        path.push(next);
        currentLoc = next.locationId || currentLoc;
      }

      // Assign new start times, preserving total duration footprint + respecting pinned blocks around them.
      const pinnedSlots = dayBlocks.filter(b => !moveable.includes(b)); // everything else stays where it is
      const newBlocks = moveable.map(b => ({ ...b }));

      // For each repositioned interview, put it in the earliest window (>= original earliest moveable start) that doesn't clash with pinned/moveable blocks.
      const earliest = Math.min(...moveable.map(b => this._toMin(b.start)));
      const rows = [];
      let oldByNew = new Map(path.map((b, i) => [b.id, moveable[i]]));
      // Place in path order
      for (const b of path) {
        const newOne = newBlocks.find(x => x.id === b.id);
        const cursorHHMM = this._fromMin(earliest);
        const free = this._findFreeSlotForReorder(b.day, b.team, cursorHHMM, newOne.duration, pinnedSlots, rows);
        const old = oldByNew.get(b.id) || b;
        rows.push({ id: b.id, title: b.title, oldStart: old.start, newStart: free });
        newOne.start = free;
      }
      // Compute drive savings
      const driveFor = arr => {
        let total = 0, loc = 'airbnb';
        const sorted = arr.slice().sort((a,b)=>a.start.localeCompare(b.start));
        for (const x of sorted) { total += window.driveMinutes(loc, x.locationId); loc = x.locationId || loc; }
        return total;
      };
      const before = driveFor(moveable);
      const after  = driveFor(newBlocks);
      this.reorderPreview = { day: d, rows, savedMin: Math.max(0, before - after), newBlocks };
    },

    _toMin(s) { const [h,m] = s.split(':').map(Number); return h*60+m; },
    _fromMin(n) { return `${String(Math.floor(n/60)).padStart(2,'0')}:${String(n%60).padStart(2,'0')}`; },
    _findFreeSlotForReorder(day, team, startFrom, duration, pinned, already) {
      // already: {id, newStart, duration?} — treat them as occupied
      const slots = this.timeSlots;
      const idx = Math.max(0, slots.indexOf(startFrom));
      for (let i = idx; i < slots.length; i++) {
        const s = slots[i];
        if (i + Math.ceil(duration/15) > slots.length) continue;
        const clashPinned = pinned.some(p => p.team === team && p.day === day && this.slotsOverlap(s, duration, p.start, p.duration));
        const clashAlready = already.some(a => {
          const b = this.blocks.find(x => x.id === a.id);
          return b && b.team === team && this.slotsOverlap(s, duration, a.newStart, b.duration);
        });
        if (!clashPinned && !clashAlready) return s;
      }
      return startFrom;
    },

    applyReorder() {
      if (!this.reorderPreview) return;
      const newSet = this.reorderPreview.newBlocks;
      for (const nb of newSet) {
        const i = this.blocks.findIndex(b => b.id === nb.id);
        if (i >= 0) this.blocks.splice(i, 1, nb);
      }
      this.reorderPreview = null;
      this.pushRemote();
      this.showToast('Re-order applied');
      this.tab = 'timetable';
    },
  };
}

window.trip = trip;
