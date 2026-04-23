/* Meridian Field Planner — Alpine app.
 * Single root component trip(); state is the schedule + actions, optionally
 * mirrored to Firebase RTDB for real-time sync.
 */

function trip() {
  return {
    // ---- top-level state ----
    tab: 'action-items',
    day: 'mon',
    actionFilter: 'all',
    focusedActionIdx: null,
    actionForm: { day: 'mon', start: '10:00', duration: 30, team: 'pk_jen', locationId: '', title: '' },
    moveHistory: [],
    recording: { blockId: null, supported: typeof window !== 'undefined' && (!!window.SpeechRecognition || !!window.webkitSpeechRecognition) },
    _recognition: null,
    guideScratchpad: '',

    // Subject → guide mapping for the Conversation Guide reference table
    guideMapping: [
      { name: 'Craig Austin / Ewan Moir', day: 'Mon', guide: 'T1+T2B', story: 'S2 S3' },
      { name: 'Chris McDonough',          day: 'Mon', guide: 'T1+T2B', story: 'S1 S4', variant: 'Partner' },
      { name: 'River City Coffee',        day: 'Mon', guide: 'T1',     story: 'S1' },
      { name: 'Andrew Hand',              day: 'Tue', guide: 'T1+T2A', story: 'S2 S3' },
      { name: 'Braden DeCorby',           day: 'Tue', guide: 'T1+T2A', story: 'S2 S3' },
      { name: 'Josh Rettie',              day: 'Tue', guide: 'T1+T2A', story: 'S1 S5' },
      { name: 'Kelly Storm',              day: 'Tue', guide: 'T1+T2A', story: 'S2 S5' },
      { name: 'Sam Naso',                 day: 'Tue', guide: 'T1+T2A', story: 'S1' },
      { name: 'Kristian Hansen',          day: 'Tue', guide: 'T1+T2A', story: 'S2' },
      { name: 'Denise Berg',              day: 'Tue', guide: 'T1+T2A' },
      { name: 'Kelly Brooks',             day: 'Tue', guide: 'T1+T2A', story: 'S5' },
      { name: 'Dave Dowling',             day: 'Tue', guide: 'T1+T2A', story: 'S2 S3' },
      { name: 'Lene Lindstrom',           day: 'Tue', guide: 'T1+T2A', story: 'S2 S3' },
      { name: 'Roundtable',               day: 'Tue', guide: 'T1+T2A', story: 'S2', variant: 'Roundtable' },
      { name: 'Brent B',                  day: 'Wed', guide: 'T1+T2B', story: 'S4 S5 S6' },
      { name: 'Wayne Walsh',              day: 'Wed', guide: 'T1+T2B', story: 'S2 S3 S4' },
      { name: 'PR Peak',                  day: 'Wed', guide: 'T1+T2B', story: 'S1 S4 S6', variant: 'Journalist' },
      { name: 'Dispensary (TBD)',         day: 'Wed', guide: 'T1+T2B', story: 'S1 S4', variant: 'Partner' },
      { name: 'Forrest Staff',            day: 'Wed', guide: 'T1',     story: 'S1 S3 S6' },
      { name: 'MOTS (30+)',               day: 'All', guide: 'T1',     variant: 'Quick Card' },
      { name: 'Tom Ligocki',              day: 'Pre/Post', guide: 'T1+T2A', story: 'S3 S4' },
    ],
    version: '1.0',
    connState: 'connecting',
    lastEditedBy: null,
    lastEditedAt: 0,

    // data
    blocks: [],                // flat array of schedule blocks across all 3 days
    actions: [],
    contactOverrides: {},      // {interviewId: {email, phone, linkedin, notes}} — user edits, synced via Firebase
    customLocations: [],       // user-added locations, synced via Firebase
    // Inline "add location" form state — shared between both drawers.
    newLoc: { open: false, target: null, blockId: null, name: '', addr: '' },
    selectedBlockId: null,      // opens edit drawer
    focusedBlockId: null,       // detail strip + map focus (light-weight)
    toast: null,
    toastTimer: null,

    // drag
    draggingId: null,

    // map
    mapFromId: 'meridian',
    mapInstance: null,
    mapMarkers: {},             // id -> L.marker
    mapDayLayers: [],           // polylines + numbered pins for current day route
    mapFocusLayer: null,        // polyline for the "from previous → focused" leg
    mapPulse: null,             // pulsing marker on focused location
    mapInteractive: false,      // on mobile, map is locked until user explicitly unlocks
    isTouchDevice: typeof window !== 'undefined' && (('ontouchstart' in window) || (navigator.maxTouchPoints > 0)),
    showRoutePK: true,
    showRouteMK: true,
    osrmCache: {},              // cache key "lng1,lat1;lng2,lat2" -> { minutes, km, coords, source }
    reorderPreview: null,

    // form
    form: {
      day: 'mon', start: '10:30', duration: 30, team: 'pk_jen',
      title: '', attendees: '', locationId: '', type: 'formal',
      brief: '', locked: true, emitIcs: true, emitMailto: false,
    },

    // All locations available in dropdowns (seed + user-added)
    get LOCATIONS() {
      return [...window.LOCATIONS, ...(this.customLocations || [])];
    },
    get _BASE_LOCATIONS() { return window.LOCATIONS; },

    // Add a new location. Prompts user for name + address. Adds to customLocations
    // with coordinates defaulting to the Airbnb (so drive-time math stays sane
    // until the user tweaks). Returns the new id.
    // Keep window._CUSTOM_LOCATIONS in sync with this.customLocations so the
    // window.locationById() helper sees user additions.
    _syncCustomToGlobal() {
      window._CUSTOM_LOCATIONS = this.customLocations.slice();
    },

    // Open the inline "add location" form. `target` is 'action' or 'block';
    // blockId is set when adding for a specific block in the meeting drawer.
    openNewLocation(target, blockId) {
      this.newLoc = { open: true, target, blockId: blockId || null, name: '', addr: '' };
    },
    cancelNewLocation() {
      this.newLoc = { open: false, target: null, blockId: null, name: '', addr: '' };
    },
    // Save the inline form. Creates a new custom location, selects it in
    // whichever drawer opened the form, closes the form.
    saveNewLocation() {
      const name = (this.newLoc.name || '').trim();
      if (!name) { this.showToast('Name required'); return; }
      const addr = (this.newLoc.addr || '').trim();
      const home = window.locationById('airbnb');
      const id = 'custom_' + Date.now().toString(36);
      const newLoc = {
        id,
        name,
        addr,
        lat: home ? home.lat : 49.84,
        lng: home ? home.lng : -124.52,
        cat: 'interview',
        _custom: true,
      };
      this.customLocations.push(newLoc);
      this._syncCustomToGlobal();
      this.pushRemote();
      // Wire the new id into whichever form opened the modal
      if (this.newLoc.target === 'action') {
        this.actionForm.locationId = id;
      } else if (this.newLoc.target === 'block' && this.newLoc.blockId) {
        const b = this.blockById(this.newLoc.blockId);
        if (b) { b.locationId = id; this.saveBlock(b); }
      }
      this.showToast(`Added "${name}"`);
      this.cancelNewLocation();
    },

    // Legacy / programmatic entry — prompt-based, kept for Bash-era flows.
    addCustomLocation() {
      const name = window.prompt('Location name?\n(e.g. "Craig\'s house", "Lund dockside")');
      if (!name || !name.trim()) return null;
      const addr = window.prompt(`Address for "${name.trim()}"?\n(Optional. Street + city enough.)`) || '';
      const home = window.locationById('airbnb');
      const id = 'custom_' + Date.now().toString(36);
      const newLoc = {
        id, name: name.trim(), addr: addr.trim(),
        lat: home ? home.lat : 49.84, lng: home ? home.lng : -124.52,
        cat: 'interview', _custom: true,
      };
      this.customLocations.push(newLoc);
      this._syncCustomToGlobal();
      this.pushRemote();
      return id;
    },

    // (Older bindings — kept as fallbacks but the inline form is preferred.)
    addLocationForAction() { this.openNewLocation('action'); },
    addLocationForBlock(b) { if (b) this.openNewLocation('block', b.id); },
    TEAMS: window.TEAMS,
    BLOCK_TYPES: window.BLOCK_TYPES,
    NON_NEGOTIABLES: window.NON_NEGOTIABLES,
    logistics: window.LOGISTICS,
    INTRO_TEMPLATES: window.INTRO_TEMPLATES,

    // ---- lifecycle ----
    init() {
      this.hydrateFromSeed();
      this.loadLocal();
      this._ensureActionPerInterview();
      this.initFirebase();
      window.addEventListener('beforeunload', () => this.saveLocal());
      // Re-render day route when day changes; drop focus only if the focused block is on a different day
      this.$watch && this.$watch('day', (newDay) => {
        if (this.focusedBlockId) {
          const fb = this.blockById(this.focusedBlockId);
          if (!fb || fb.day !== newDay) {
            this.focusedBlockId = null;
            this._clearFocusLeg && this._clearFocusLeg();
          }
        }
        this._debouncedRenderRoute();
      });
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
            if (v.contactOverrides && typeof v.contactOverrides === 'object') this.contactOverrides = v.contactOverrides;
            if (Array.isArray(v.customLocations)) { this.customLocations = v.customLocations; this._syncCustomToGlobal(); }
            this.lastEditedBy = v.meta?.lastEditedBy || null;
            this.lastEditedAt = v.meta?.lastEditedAt || 0;
            this._ensureActionPerInterview();
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
          if (v.contactOverrides && typeof v.contactOverrides === 'object') this.contactOverrides = v.contactOverrides;
          if (Array.isArray(v.customLocations)) { this.customLocations = v.customLocations; this._syncCustomToGlobal(); }
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
        contactOverrides: this.contactOverrides,
        customLocations: this.customLocations,
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
      return this._slotsInRange(4, 21);
    },

    // Day-specific visible range. Field days trim pre-8am and post-9pm
    // (working hours). Travel days keep the early/late edges visible.
    timeSlotsForDay(day) {
      const ranges = {
        sun: [7, 21],    // earliest block 07:30
        mon: [8, 21],    // field day, respects 8-to-8 + evening synthesis
        tue: [8, 21],    // field day
        wed: [8, 22],    // field day + late synthesis
        thu: [4, 16],    // 04:45 alarms, 14:30 flights depart
      };
      const [startH, endH] = ranges[day] || [4, 21];
      return this._slotsInRange(startH, endH);
    },

    _slotsInRange(startH, endH) {
      const slots = [];
      for (let h = startH; h <= endH; h++) {
        for (const m of [0, 15, 30, 45]) {
          if (h === endH && m > 0) break;
          slots.push(`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`);
        }
      }
      return slots;
    },

    dayLabel(d) {
      return {
        sun: 'April 26 · Outbound Travel',
        mon: 'April 27 · Community Immersion',
        tue: 'April 28 · Meridian On-Site',
        wed: 'April 29 · Mill Tour and Story Hunting',
        thu: 'April 30 · Return Travel',
      }[d] || d;
    },
    dayHeadline(d) {
      return {
        sun: 'Two flights into YVR. Budget pickup, drive to Horseshoe Bay, both ferry legs, arrive the Airbnb before dark. Team dinner and the Monday briefing by 19:30.',
        mon: 'Townsite, archives, the Hulks. Craig and Ewan at the mill in the afternoon. Chris McDonough late. Mike and Katie run the first MOTS batch on Marine Ave.',
        tue: 'The full embed. Four formals, four short interviews, the cultivation roundtable. Staff lunch in the parking lot.',
        wed: 'Character work. Brent B south of the city first thing. Wayne late morning. Lunch at Forrest. PR Peak in the afternoon. Mill tour at golden hour.',
        thu: 'Return. The 06:25 Saltery Bay sailing is the first domino. Miss it and the whole day slips. Langdale to Horseshoe Bay reserved at 10:30. Flights out of YVR at 14:30.',
      }[d] || '';
    },

    blocksForDay(d) {
      return this.blocks.filter(b => b.day === d).slice().sort((a, b) => a.start.localeCompare(b.start) || ((a.team==='pk_jen'?0:1) - (b.team==='pk_jen'?0:1)));
    },
    interviewsForDay(d) {
      return window.INTERVIEWS.filter(i => i.day === d);
    },
    interviewById(id) {
      // Return a view that applies any user-edited overrides for contacts AND
      // interview fields (bio, prep, role, name). All editable inline.
      const base = window.INTERVIEWS.find(i => i.id === id);
      if (!base) return null;
      const ov = this.contactOverrides[id] || {};
      return {
        ...base,
        // Contact
        email:    ov.email    !== undefined ? ov.email    : base.email,
        phone:    ov.phone    !== undefined ? ov.phone    : (base.phone || ''),
        address:  ov.address  !== undefined ? ov.address  : (base.address || ''),
        linkedin: ov.linkedin !== undefined ? ov.linkedin : base.linkedin,
        // Interview content (override-able)
        name:     ov.name     !== undefined ? ov.name     : base.name,
        role:     ov.role     !== undefined ? ov.role     : base.role,
        bio:      ov.bio      !== undefined ? ov.bio      : base.bio,
        prep:     ov.prep     !== undefined ? ov.prep     : base.prep,
      };
    },
    updateContact(id, field, value) {
      if (!this.contactOverrides[id]) this.contactOverrides[id] = {};
      this.contactOverrides[id][field] = value;
      this.pushRemote();
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
        this._recordMove(moving);
        moving.start = slot; moving.team = team;
        this.saveBlock(moving);
        this.insertTravelBuffers(moving);
        return;
      }

      // 1 conflict, both unpinned → swap
      if (conflicts.length === 1 && !moving.locked && !conflicts[0].locked) {
        const other = conflicts[0];
        this._recordMove(moving); this._recordMove(other);
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
      this._recordMove(moving);
      moving.start = slot; moving.team = team;
      this.saveBlock(moving);
      // Push each pushable to next free slot in the lane after moving end
      let cursor = this.addMinutes(slot, moving.duration);
      for (const c of pushable) {
        this._recordMove(c);
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
      this._debouncedRenderRoute();
    },
    deleteBlock(b) {
      // Also remove any travel buffers adjacent to this block so we don't leave orphans
      this.blocks = this.blocks.filter(x => x.id !== b.id && !(x.isTravelBuffer && this._adjacentToBlock(x, b)));
      this.selectedBlockId = null;
      if (this.focusedBlockId === b.id) this.focusedBlockId = null;
      this.pushRemote();
      this.showToast('Deleted');
      this._debouncedRenderRoute();
    },
    _debouncedRenderRoute() {
      if (this._rrTimer) clearTimeout(this._rrTimer);
      this._rrTimer = setTimeout(() => this.renderDayRoute(), 120);
    },
    addAction() {
      this.actions.push({ owner: 'PK', text: 'New item', status: 'pending' });
      this.saveActions();
    },
    removeAction(i) {
      this.actions.splice(i, 1); this.saveActions();
    },
    removeActionByIdx(idx) {
      // _idx is the index attached by actionsByStatus — use it against the live array.
      const pos = this.actions.findIndex((_, i) => i === idx);
      if (pos >= 0) this.actions.splice(pos, 1);
      this.saveActions();
    },
    saveActions() { this.pushRemote(); },

    // Return actions filtered by status, each tagged with its original index.
    actionsByStatus(status) {
      return this.actions
        .map((a, _idx) => ({ ...a, _idx }))
        .filter(a => a.status === status);
    },

    // People rows (have an intervieweeId). Filtered to a status.
    peopleByStatus(status) {
      return this.actions
        .map((a, _idx) => ({ ...a, _idx }))
        .filter(a => !!a.intervieweeId && a.status === status);
    },

    // Leads — ideas + tasks without an intervieweeId.
    get leads() {
      return this.actions
        .map((a, _idx) => ({ ...a, _idx }))
        .filter(a => !a.intervieweeId);
    },

    // Structured open spots: { pk_jen: { mon:[], tue:[], wed:[] }, mike_katie: {...} }
    // Used by the two-column grid on the Outreach page.
    get openSpotsByTeamDay() {
      const out = {
        pk_jen:     { mon: [], tue: [], wed: [] },
        mike_katie: { mon: [], tue: [], wed: [] },
      };
      for (const s of this.openSpots) {
        if (out[s.team] && out[s.team][s.day]) out[s.team][s.day].push(s);
      }
      // Keep each day's slots in start-time order
      for (const team of Object.keys(out)) {
        for (const day of Object.keys(out[team])) {
          out[team][day].sort((a, b) => a.start.localeCompare(b.start));
        }
      }
      return out;
    },

    // Open Calendar Spots — free gaps in each team lane on each field day,
    // within business hours (08:00–21:00 for Mon/Tue, 08:00–22:00 Wed).
    // Only gaps of 30+ minutes surface.
    get openSpots() {
      const out = [];
      const ranges = {
        mon: [8 * 60, 21 * 60],
        tue: [8 * 60, 21 * 60],
        wed: [8 * 60, 22 * 60],
      };
      for (const [day, [startMin, endMin]] of Object.entries(ranges)) {
        for (const team of ['pk_jen', 'mike_katie']) {
          const lane = this.blocks
            .filter(b => b.day === day && b.team === team)
            .map(b => ({
              start: this._toMin(b.start),
              end:   this._toMin(this.addMinutes(b.start, b.duration)),
            }))
            .sort((a, b) => a.start - b.start);
          let cursor = startMin;
          for (const slot of lane) {
            if (slot.start > cursor + 15) {
              const size = slot.start - cursor;
              if (size >= 30) {
                out.push({
                  day, team,
                  start: this._fromMin(cursor),
                  end:   this._fromMin(slot.start),
                  minutes: size,
                });
              }
            }
            cursor = Math.max(cursor, slot.end);
          }
          if (endMin > cursor + 30) {
            out.push({
              day, team,
              start: this._fromMin(cursor),
              end:   this._fromMin(endMin),
              minutes: endMin - cursor,
            });
          }
        }
      }
      return out.sort((a, b) => b.minutes - a.minutes);
    },

    // Open the booking drawer pre-filled with a free slot + create a draft action.
    bookOpenSpot(spot) {
      this.actions.push({
        owner: 'PK',
        text: 'Ad-hoc booking',
        status: 'pending',
        _auto: false,
      });
      const idx = this.actions.length - 1;
      this.saveActions();
      this.openAction(idx);
      // Override actionForm with the spot's details
      this.actionForm = {
        day: spot.day, start: spot.start,
        duration: Math.min(30, spot.minutes),
        team: spot.team,
        locationId: '', title: '',
      };
    },

    // Add a new "lead" — a task with no intervieweeId. Opens for editing.
    addLead() {
      this.actions.push({
        owner: 'PK', text: 'New lead', status: 'pending',
      });
      this.saveActions();
      this.openAction(this.actions.length - 1);
    },

    // Make sure every interview block has a row on the Outreach page.
    // Creates a lightweight auto-action for any intervieweeId missing one.
    // Marked with _auto so we know it wasn't a deliberate human entry.
    _ensureActionPerInterview() {
      const existingIds = new Set(this.actions.filter(a => a.intervieweeId).map(a => a.intervieweeId));
      const seenBlockIvs = new Set();
      for (const b of this.blocks) {
        if (!b.interviewId) continue;
        if (existingIds.has(b.interviewId)) continue;
        if (seenBlockIvs.has(b.interviewId)) continue;
        seenBlockIvs.add(b.interviewId);
        const ii = window.INTERVIEWS.find(i => i.id === b.interviewId);
        this.actions.push({
          owner: 'PK',
          text: `Lock in ${ii ? ii.name : b.title}`,
          status: b.locked ? 'confirmed' : 'pending',
          intervieweeId: b.interviewId,
          template: 'cold_pk',
          linkedBlockId: b.id,
          _auto: true,
        });
      }
    },

    // One-line summary of the linked block (if any) — shown under each action row.
    actionBlockSummary(a) {
      const block = this._actionBlock(a);
      if (!block) return '';
      return `${this.dayLabel(block.day)} · ${block.start}–${this.addMinutes(block.start, block.duration)} · ${this.locationShort(block.locationId) || '—'}`;
    },
    _actionBlock(a) {
      if (a.linkedBlockId) return this.blocks.find(b => b.id === a.linkedBlockId);
      if (a.intervieweeId) return this.blocks.find(b => b.interviewId === a.intervieweeId);
      return null;
    },

    // Create a new blank action + open its drawer for ad-hoc booking.
    addActionAndOpen() {
      this.actions.push({
        owner: 'PK', text: 'New booking', status: 'pending',
      });
      const idx = this.actions.length - 1;
      this.saveActions();
      this.openAction(idx);
    },

    openAction(idx) {
      this.focusedActionIdx = idx;
      const a = this.actions[idx];
      const block = this._actionBlock(a);
      const ii = a.intervieweeId ? this.interviewById(a.intervieweeId) : null;
      // Seed the booking form from the linked block, or fall back to interviewee defaults.
      if (block) {
        this.actionForm = {
          day: block.day, start: block.start, duration: block.duration,
          team: block.team, locationId: block.locationId || '',
          title: block.title,
        };
      } else if (ii) {
        // Default to the interviewee's seed day / duration / team, 10:00 start
        this.actionForm = {
          day: ii.day && ii.day !== 'remote' ? ii.day : 'mon',
          start: '10:00',
          duration: ii.duration || 30,
          team: ii.team || 'pk_jen',
          locationId: ii.locationId || '',
          title: ii.name,
        };
      } else {
        this.actionForm = { day: 'mon', start: '10:00', duration: 30, team: 'pk_jen', locationId: '', title: a.text };
      }
    },
    closeAction() { this.focusedActionIdx = null; },

    // Blocks that would overlap the proposed slot in the selected team lane.
    get actionConflicts() {
      const f = this.actionForm;
      if (!f || !f.start) return [];
      const linked = this.focusedActionIdx != null ? this._actionBlock(this.actions[this.focusedActionIdx]) : null;
      return this.blocks.filter(x =>
        x.day === f.day && x.team === f.team && (linked == null || x.id !== linked.id) &&
        this.slotsOverlap(f.start, f.duration, x.start, x.duration)
      );
    },

    // First 6 free slots in the chosen lane — offered when the chosen start conflicts.
    get suggestedSlots() {
      const f = this.actionForm;
      if (!f || !f.start) return [];
      const slots = [];
      for (const s of this.timeSlots) {
        const hasConflict = this.blocks.some(x =>
          x.day === f.day && x.team === f.team && this.slotsOverlap(s, f.duration, x.start, x.duration)
        );
        if (!hasConflict) slots.push(s);
        if (slots.length >= 6) break;
      }
      return slots;
    },

    // Free slots (per team) for the current actionForm day + duration.
    // Only business-hour slots (07:00–20:00) so we don't offer 04:30 AM interviews.
    _freeSlotsForTeam(teamId) {
      const f = this.actionForm;
      if (!f) return [];
      const slots = [];
      for (const s of this.timeSlots) {
        // Skip pre-7am and post-8pm for interview slots
        const [h] = s.split(':').map(Number);
        if (h < 7 || h >= 20) continue;
        const hasConflict = this.blocks.some(x =>
          x.day === f.day && x.team === teamId && this.slotsOverlap(s, f.duration, x.start, x.duration)
        );
        if (!hasConflict) slots.push(s);
      }
      return slots;
    },
    get freeSlotsPK() { return this._freeSlotsForTeam('pk_jen'); },
    get freeSlotsMK() { return this._freeSlotsForTeam('mike_katie'); },
    // Pick a free slot (sets team + start in one go)
    pickFreeSlot(teamId, start) {
      this.actionForm.team = teamId;
      this.actionForm.start = start;
    },

    // Move a conflicting block to the next free slot in its lane.
    bumpConflict(conflictId) {
      const b = this.blockById(conflictId);
      if (!b) return;
      if (b.locked) { this.showToast(`Can't bump — ${b.title} is pinned`); return; }
      this._recordMove(b);
      const f = this.actionForm;
      const newStart = this._findFreeSlot(b.day, b.team, this.addMinutes(f.start, f.duration), b.duration, [b.id]);
      b.start = newStart;
      this.saveBlock(b);
      this.showToast(`Bumped "${b.title}" to ${newStart}`);
    },

    // Confirm/create a booking from the action form.
    confirmAction(force = false) {
      if (this.focusedActionIdx == null) return;
      const a = this.actions[this.focusedActionIdx];
      const f = this.actionForm;
      if (!f.title || !f.title.trim()) { this.showToast('Title required'); return; }
      if (!force && this.actionConflicts.length > 0) { this.showToast('Conflicts remain — bump or pick another slot'); return; }
      // If force, bump every unpinned conflict first (auto-push to next free)
      if (force) {
        const pinned = this.actionConflicts.filter(c => c.locked);
        if (pinned.length > 0) { this.showToast(`Can't force — pinned: ${pinned[0].title}`); return; }
        // Bump in order
        const conflicts = [...this.actionConflicts];
        for (const c of conflicts) this.bumpConflict(c.id);
      }

      let block = this._actionBlock(a);
      if (block) {
        // Update existing
        this._recordMove(block);
        block.day = f.day; block.start = f.start; block.duration = f.duration;
        block.team = f.team; block.locationId = f.locationId || null;
        block.title = f.title.trim(); block.locked = true;
        this.saveBlock(block);
      } else {
        const id = `act_${Date.now().toString(36)}`;
        block = {
          id, day: f.day, team: f.team, start: f.start, duration: f.duration,
          title: f.title.trim(), locationId: f.locationId || null,
          type: a.intervieweeId ? 'formal' : 'formal',
          brief: '', attendees: '',
          locked: true, interviewId: a.intervieweeId || null, notes: '',
        };
        this.blocks.push(block);
        a.linkedBlockId = id;
      }
      a.status = 'confirmed';
      this.insertTravelBuffers(block);
      this.pushRemote();
      this._debouncedRenderRoute();
      this.showToast(`Confirmed — ${block.title}`);
      this.closeAction();
      this.tab = 'schedule';
      this.day = block.day;
      this.$nextTick ? this.$nextTick(() => this.focusBlock(block.id)) : setTimeout(() => this.focusBlock(block.id), 50);
    },

    markActionDone() {
      if (this.focusedActionIdx == null) return;
      this.actions[this.focusedActionIdx].status = 'done';
      this.saveActions();
      this.closeAction();
      this.showToast('Marked done');
    },

    // ---- Move history / Undo ----
    _recordMove(block) {
      if (!block) return;
      this.moveHistory.push({
        blockId: block.id,
        day: block.day, start: block.start, duration: block.duration,
        team: block.team, locationId: block.locationId,
        at: Date.now(),
      });
      if (this.moveHistory.length > 25) this.moveHistory.shift();
    },
    undoMove() {
      const last = this.moveHistory.pop();
      if (!last) { this.showToast('Nothing to undo'); return; }
      const b = this.blockById(last.blockId);
      if (!b) { this.showToast('Block no longer exists'); return; }
      b.day = last.day; b.start = last.start; b.duration = last.duration;
      b.team = last.team; b.locationId = last.locationId;
      this.saveBlock(b);
      this._debouncedRenderRoute();
      this.showToast(`Undone — ${b.title} back to ${last.start}`);
    },

    // Wrapper that records state before saving (so undo can restore).
    recordAndSave(b) {
      this._recordMove(b);
      this.saveBlock(b);
    },

    // ---- Notes + voice capture ----
    appendTimestampToNotes(b) {
      if (!b) return;
      const pad = n => String(n).padStart(2, '0');
      const d = new Date();
      const ts = `[${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}]`;
      const existing = b.notes || '';
      b.notes = existing + (existing && !existing.endsWith('\n') ? '\n' : '') + `${ts} `;
      this.saveBlock(b);
    },

    toggleRecording(blockId) {
      if (this.recording.blockId === blockId) {
        if (this._recognition) { try { this._recognition.stop(); } catch (e) {} }
        this.recording.blockId = null;
        return;
      }
      if (!this.recording.supported) { this.showToast('Voice capture needs Chrome/Edge — paste instead'); return; }
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      const r = new SR();
      r.continuous = true;
      r.interimResults = false;
      r.lang = 'en-US';
      r.onresult = (ev) => {
        const b = this.blockById(blockId);
        if (!b) return;
        const text = Array.from(ev.results).slice(ev.resultIndex).map(res => res[0].transcript).join(' ').trim();
        if (!text) return;
        const existing = b.notes || '';
        b.notes = existing + (existing && !existing.endsWith('\n') ? ' ' : '') + text + ' ';
        this.saveBlock(b);
      };
      r.onerror = (ev) => {
        console.warn('speech error', ev.error);
        if (ev.error === 'not-allowed' || ev.error === 'service-not-allowed') {
          this.showToast('Microphone blocked — enable in browser settings');
        }
        this.recording.blockId = null;
      };
      r.onend = () => {
        if (this.recording.blockId === blockId) {
          // Restart automatically if still marked as recording (long sessions).
          try { r.start(); } catch (e) { this.recording.blockId = null; }
        }
      };
      try { r.start(); } catch (e) { this.showToast('Recording failed: ' + e.message); return; }
      this._recognition = r;
      this.recording.blockId = blockId;
    },

    // ---- Reset schedule to canonical seed (the docx baseline) ----
    // Preserves any `notes` the user has already written so voice captures
    // aren't lost when you reset a drifted schedule.
    resetFromSeed() {
      const preservedNotes = {}, preservedSetup = {}, preservedReferrals = {};
      for (const b of this.blocks) {
        if (b.interviewId && b.notes && b.notes.trim()) preservedNotes[b.interviewId] = b.notes;
        if (b.interviewId && b.setupNotes && b.setupNotes.trim()) preservedSetup[b.interviewId] = b.setupNotes;
        if (b.interviewId && b.referrals && b.referrals.trim()) preservedReferrals[b.interviewId] = b.referrals;
      }
      // Rebuild blocks from seed
      const fresh = [];
      for (const day of Object.keys(window.SCHEDULE_SEED)) {
        for (const b of window.SCHEDULE_SEED[day]) {
          const copy = { ...b, notes: '', setupNotes: '', referrals: '' };
          if (copy.interviewId && preservedNotes[copy.interviewId]) copy.notes = preservedNotes[copy.interviewId];
          if (copy.interviewId && preservedSetup[copy.interviewId]) copy.setupNotes = preservedSetup[copy.interviewId];
          if (copy.interviewId && preservedReferrals[copy.interviewId]) copy.referrals = preservedReferrals[copy.interviewId];
          fresh.push(copy);
        }
      }
      this.blocks = fresh;
      // Rebuild actions, preserving status + any intervieweeId mapping from seed
      this.actions = window.ACTION_ITEMS.map(a => ({ ...a }));
      this._ensureActionPerInterview();
      this.moveHistory = [];
      this.focusedBlockId = null;
      this.focusedActionIdx = null;
      this.selectedBlockId = null;
      this.pushRemote();
      this._debouncedRenderRoute();
      const preservedCount = Object.keys(preservedNotes).length;
      this.showToast(`Reset — ${fresh.length} blocks restored${preservedCount ? ' · ' + preservedCount + ' notes preserved' : ''}`);
    },

    // ---- Guide scratchpad (voice + paste, not tied to a meeting) ----
    toggleGuideRecording() {
      if (this.recording.blockId === '__guide__') {
        if (this._recognition) { try { this._recognition.stop(); } catch (e) {} }
        this.recording.blockId = null;
        return;
      }
      if (!this.recording.supported) { this.showToast('Voice capture needs Chrome/Edge. Paste your transcript instead.'); return; }
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      const r = new SR();
      r.continuous = true;
      r.interimResults = false;
      r.lang = 'en-US';
      r.onresult = (ev) => {
        const text = Array.from(ev.results).slice(ev.resultIndex).map(res => res[0].transcript).join(' ').trim();
        if (!text) return;
        this.guideScratchpad = (this.guideScratchpad || '') + (this.guideScratchpad && !this.guideScratchpad.endsWith('\n') ? ' ' : '') + text + ' ';
      };
      r.onerror = (ev) => { console.warn('speech', ev.error); this.recording.blockId = null; };
      r.onend = () => { if (this.recording.blockId === '__guide__') { try { r.start(); } catch (e) { this.recording.blockId = null; } } };
      try { r.start(); } catch (e) { this.showToast('Recording failed: ' + e.message); return; }
      this._recognition = r;
      this.recording.blockId = '__guide__';
    },

    appendGuideTimestamp() {
      const pad = n => String(n).padStart(2, '0');
      const d = new Date();
      const ts = `[${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}]`;
      this.guideScratchpad = (this.guideScratchpad || '') + (this.guideScratchpad && !this.guideScratchpad.endsWith('\n') ? '\n' : '') + `${ts} `;
    },

    exportGuideScratchpad() {
      const text = this.guideScratchpad || '';
      if (!text.trim()) return;
      const blob = new Blob([text], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `meridian-scratchpad-${new Date().toISOString().slice(0, 10)}.txt`;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    },

    // ---- CSV export of all notes ----
    exportNotesCsv() {
      const rows = [['Day', 'Start', 'End', 'Team', 'Location', 'Title', 'Attendees', 'Brief', 'Notes', 'Who else to talk to', 'Setup notes']];
      const days = ['sun', 'mon', 'tue', 'wed', 'thu'];
      const sorted = this.blocks
        .filter(b => (b.notes && b.notes.trim()) || (b.brief && b.brief.trim()) || (b.referrals && b.referrals.trim()) || (b.setupNotes && b.setupNotes.trim()) || b.interviewId)
        .sort((a, b) => (days.indexOf(a.day) - days.indexOf(b.day)) || a.start.localeCompare(b.start));
      for (const b of sorted) {
        rows.push([
          this.dayLabel(b.day),
          b.start,
          this.addMinutes(b.start, b.duration),
          (this.TEAMS[b.team] || {}).label || b.team,
          this.locationLabel(b.locationId) || '',
          b.title || '',
          b.attendees || '',
          b.brief || '',
          b.notes || '',
          b.referrals || '',
          b.setupNotes || '',
        ]);
      }
      const csv = rows.map(row =>
        row.map(cell => {
          const s = String(cell == null ? '' : cell);
          if (s.includes(',') || s.includes('"') || s.includes('\n')) return '"' + s.replace(/"/g, '""') + '"';
          return s;
        }).join(',')
      ).join('\r\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `meridian-notes-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      this.showToast(`Exported ${sorted.length} rows`);
    },

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
      this.draggingId = id;
      this.onDropCell(f.team, f.start);
      // Auto-insert travel buffers around the new meeting
      this.insertTravelBuffers(newBlock);
      if (f.emitIcs)    this.downloadIcs(newBlock);
      if (f.emitMailto) this.openMailto(newBlock);
      this.showToast(`Locked in — ${newBlock.title}`);
      // Reset form (keep day/team)
      this.form.title = ''; this.form.attendees = ''; this.form.brief = '';
      this.tab = 'schedule';
      this.day = f.day;
      this.focusBlock(newBlock.id);
      // Re-draw the day route with the new block + buffer
      this.$nextTick ? this.$nextTick(() => this.renderDayRoute()) : setTimeout(() => this.renderDayRoute(), 50);
    },

    // ---- .ics generation ----
    _icsDate(day, start) {
      // Field-day dates for the Powell River trip, Apr 26–30, 2026
      const dayMap = {
        sun: [2026, 4, 26],
        mon: [2026, 4, 27],
        tue: [2026, 4, 28],
        wed: [2026, 4, 29],
        thu: [2026, 4, 30],
      };
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
    _catColor: {
      lodging: '#556B4F', facility: '#2B3A2E', interview: '#8B5A2B',
      archival: '#7B5E3A', food: '#C9A270', mots: '#44546A',
      media: '#6B1D1D', broll: '#B58C5A', ferry: '#6B6B6B', airport: '#6B6B6B',
      poi: '#9B8259',
    },

    initMap() {
      if (this.mapInstance) {
        // Existing map — just re-compute its size in case the section was hidden when created.
        setTimeout(() => {
          this.mapInstance.invalidateSize();
          this.mapInstance.setView([49.858, -124.548], 11, { animate: false });
          this.renderDayRoute();
        }, 80);
        return;
      }
      if (typeof L === 'undefined') { setTimeout(() => this.initMap(), 200); return; }
      const el = document.getElementById('map-el');
      if (!el || el.offsetWidth < 10) {
        // Section still hidden; try again shortly.
        setTimeout(() => this.initMap(), 120);
        return;
      }

      // Explicit setView (fitBounds runs before layout on first paint and zooms out to 0).
      // Zoom 11 centered on Westview/Townsite shows: Brent B south, Lund north, Meridian, Airbnb, Marine Ave.
      // On touch devices we start locked (no dragging/zoom) so page scroll passes through.
      // The "Tap to interact" overlay unlocks it.
      const locked = this.isTouchDevice;
      const m = L.map(el, {
        scrollWheelZoom: false,
        zoomControl: true,
        dragging:  !locked,
        touchZoom: !locked,
        tap:       !locked,
        doubleClickZoom: !locked,
      }).setView([49.858, -124.548], 11);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '&copy; OpenStreetMap'
      }).addTo(m);

      window.LOCATIONS.forEach(l => {
        const color = this._catColor[l.cat] || '#2B3A2E';
        const isPoi = l.cat === 'poi';
        const size = isPoi ? 11 : 18;
        // POIs are outline-only so they don't compete with primary stops.
        const html = isPoi
          ? `<div class="marker-dot" style="background:transparent;width:${size}px;height:${size}px;border:1.5px solid ${color};"></div>`
          : `<div class="marker-dot" style="background:${color};width:${size}px;height:${size}px;"></div>`;
        const icon = L.divIcon({
          className: 'marker-pin' + (isPoi ? ' marker-pin--poi' : ''),
          html,
          iconSize: [size, size], iconAnchor: [size/2, size/2],
        });
        const marker = L.marker([l.lat, l.lng], { icon }).addTo(m);
        marker.on('click', () => {
          // Select this location in the focus block's "from" if it matches a block — otherwise just show drive times
        });
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
        this.mapMarkers[l.id] = marker;
      });

      this.mapInstance = m;
      this.mapInteractive = !locked;
      // Render the initial day route after the map has layout
      setTimeout(() => this.renderDayRoute(), 150);
    },

    // Toggle Leaflet interaction on touch devices so page scroll passes through
    // the map by default — user taps a button to pan/zoom, then locks it again.
    toggleMapInteraction() {
      if (!this.mapInstance) return;
      this.mapInteractive = !this.mapInteractive;
      const m = this.mapInstance;
      if (this.mapInteractive) {
        m.dragging.enable(); m.touchZoom.enable(); m.tap && m.tap.enable(); m.doubleClickZoom.enable();
      } else {
        m.dragging.disable(); m.touchZoom.disable(); m.tap && m.tap.disable(); m.doubleClickZoom.disable();
      }
    },

    // Clear the day-route layers (numbered pins + polylines)
    _clearDayRoute() {
      if (!this.mapInstance) return;
      for (const layer of this.mapDayLayers) this.mapInstance.removeLayer(layer);
      this.mapDayLayers = [];
    },

    // Draw numbered route for each enabled team for the selected day.
    // Each day starts at the Airbnb (4312 Fernwood Ave) — it's prepended as "🏠 Start"
    // before the first numbered stop.
    renderDayRoute() {
      if (!this.mapInstance) return;
      this._clearDayRoute();
      const home = window.locationById('airbnb');
      // Always draw the "HOME" pin, once.
      if (home) {
        const homeIcon = L.divIcon({
          className: 'home-pin',
          html: `<div class="home-dot">⌂</div>`,
          iconSize: [26, 26], iconAnchor: [13, 13],
        });
        const homeMarker = L.marker([home.lat, home.lng], { icon: homeIcon, zIndexOffset: 300 }).addTo(this.mapInstance);
        homeMarker.bindTooltip('Start of every day · 4312 Fernwood Ave', { direction: 'top', offset: [0, -10] });
        this.mapDayLayers.push(homeMarker);
      }
      const drawTeam = (teamId, color) => {
        const lane = this.blocks
          .filter(b => b.day === this.day && (b.team === teamId || b.team === 'both') && b.locationId)
          .filter(b => b.type !== 'buffer' && b.type !== 'synthesis')
          .sort((a, b) => a.start.localeCompare(b.start));
        const deduped = [];
        for (const b of lane) {
          const prev = deduped[deduped.length - 1];
          if (!prev || prev.locationId !== b.locationId) deduped.push(b);
        }
        // Prepend the Airbnb as stop 0 if the first stop isn't already there,
        // so the polyline + numbering reflect leaving home each morning.
        let coordsLocs = deduped.map(b => window.locationById(b.locationId)).filter(Boolean);
        if (home && coordsLocs.length > 0 && coordsLocs[0].id !== 'airbnb') {
          coordsLocs = [home, ...coordsLocs];
        }
        const coords = coordsLocs.map(l => [l.lat, l.lng]);
        if (coords.length >= 2) {
          const line = L.polyline(coords, { color, weight: 3, opacity: 0.55, dashArray: '6 6' }).addTo(this.mapInstance);
          this.mapDayLayers.push(line);
        }
        // Numbered pins — skip the prepended home (drawn separately above)
        deduped.forEach((b, i) => {
          const l = window.locationById(b.locationId);
          if (!l) return;
          const icon = L.divIcon({
            className: 'route-num',
            html: `<div class="route-num-dot" style="background:${color}">${i + 1}</div>`,
            iconSize: [22, 22], iconAnchor: [11, 11],
          });
          const m = L.marker([l.lat, l.lng], { icon, zIndexOffset: 200 }).addTo(this.mapInstance);
          m.bindTooltip(`${b.start} · ${b.title}`, { direction: 'top', offset: [0, -8] });
          this.mapDayLayers.push(m);
        });
      };
      if (this.showRoutePK) drawTeam('pk_jen',     '#2B3A2E');
      if (this.showRouteMK) drawTeam('mike_katie', '#8B5A2B');
      this._enrichWithOSRM();
      // Auto-fit the map to the day's stops (uses the day's locations, not the entire 25-marker set).
      this._fitDay();
    },

    _fitDay() {
      if (!this.mapInstance) return;
      const ids = new Set();
      this.blocks
        .filter(b => b.day === this.day && b.locationId && b.type !== 'buffer' && b.type !== 'synthesis')
        .forEach(b => ids.add(b.locationId));
      // Always include home as the starting point.
      ids.add('airbnb');
      const pts = [...ids].map(id => window.locationById(id)).filter(Boolean).map(l => [l.lat, l.lng]);
      if (pts.length >= 2) {
        this.mapInstance.fitBounds(pts, { padding: [30, 30], animate: false });
      } else if (pts.length === 1) {
        this.mapInstance.setView(pts[0], 13, { animate: false });
      }
    },

    async _enrichWithOSRM() {
      if (!this.mapInstance) return;
      const fetchLeg = async (a, b) => {
        const key = `${a.lng},${a.lat};${b.lng},${b.lat}`;
        if (this.osrmCache[key]) return this.osrmCache[key];
        try {
          const url = `https://router.project-osrm.org/route/v1/driving/${a.lng},${a.lat};${b.lng},${b.lat}?overview=full&geometries=geojson`;
          const r = await fetch(url, { signal: AbortSignal.timeout ? AbortSignal.timeout(4000) : undefined });
          if (!r.ok) throw new Error(r.status);
          const d = await r.json();
          const route = d.routes && d.routes[0];
          if (!route) throw new Error('no route');
          const coords = route.geometry.coordinates.map(([lng, lat]) => [lat, lng]);
          const result = { coords, minutes: Math.round(route.duration / 60), km: (route.distance / 1000).toFixed(1), source: 'osrm' };
          this.osrmCache[key] = result;
          return result;
        } catch (e) {
          return null;
        }
      };
      const home = window.locationById('airbnb');
      const drawTeam = async (teamId, color) => {
        const lane = this.blocks
          .filter(b => b.day === this.day && (b.team === teamId || b.team === 'both') && b.locationId)
          .filter(b => b.type !== 'buffer' && b.type !== 'synthesis')
          .sort((a, b) => a.start.localeCompare(b.start));
        const deduped = [];
        for (const b of lane) {
          const prev = deduped[deduped.length - 1];
          if (!prev || prev.locationId !== b.locationId) deduped.push(b);
        }
        let locs = deduped.map(b => window.locationById(b.locationId)).filter(Boolean);
        if (home && locs.length > 0 && locs[0].id !== 'airbnb') locs = [home, ...locs];
        const allCoords = [];
        for (let i = 0; i < locs.length - 1; i++) {
          const leg = await fetchLeg(locs[i], locs[i + 1]);
          if (leg) allCoords.push(...leg.coords);
        }
        if (allCoords.length > 1) {
          const line = L.polyline(allCoords, { color, weight: 3.5, opacity: 0.78 }).addTo(this.mapInstance);
          this.mapDayLayers.push(line);
        }
      };
      if (this.showRoutePK) drawTeam('pk_jen',     '#2B3A2E');
      if (this.showRouteMK) drawTeam('mike_katie', '#8B5A2B');
    },

    // ---- Click-to-focus a block ----
    focusBlock(id) {
      this.focusedBlockId = (this.focusedBlockId === id) ? null : id;
      if (!this.focusedBlockId) {
        this._clearFocusLeg();
        return;
      }
      const b = this.blockById(id);
      if (!b) return;
      const loc = b.locationId && window.locationById(b.locationId);
      // Pulsing marker
      if (this.mapInstance && loc) {
        if (this.mapPulse) this.mapInstance.removeLayer(this.mapPulse);
        const icon = L.divIcon({ className: 'pulse-pin', html: '<div class="pulse-dot"></div>', iconSize: [28, 28], iconAnchor: [14, 14] });
        this.mapPulse = L.marker([loc.lat, loc.lng], { icon, zIndexOffset: 500 }).addTo(this.mapInstance);
        this.mapInstance.panTo([loc.lat, loc.lng], { animate: true });
      }
      // Draw leg from previous block in the same lane
      this._drawFocusLeg(b);
    },

    _clearFocusLeg() {
      if (this.mapFocusLayer) { this.mapInstance.removeLayer(this.mapFocusLayer); this.mapFocusLayer = null; }
      if (this.mapPulse) { this.mapInstance.removeLayer(this.mapPulse); this.mapPulse = null; }
    },

    _drawFocusLeg(b) {
      if (!this.mapInstance || !b.locationId) return;
      if (this.mapFocusLayer) { this.mapInstance.removeLayer(this.mapFocusLayer); this.mapFocusLayer = null; }
      const prev = this._prevBlockInLane(b);
      if (!prev || !prev.locationId || prev.locationId === b.locationId) return;
      const fromLoc = window.locationById(prev.locationId);
      const toLoc = window.locationById(b.locationId);
      if (!fromLoc || !toLoc) return;
      // Straight line first (instant); replace with OSRM if available
      const straight = L.polyline([[fromLoc.lat, fromLoc.lng], [toLoc.lat, toLoc.lng]], {
        color: '#A0462A', weight: 4, opacity: 0.85, dashArray: '3 6'
      }).addTo(this.mapInstance);
      this.mapFocusLayer = straight;
      // Try OSRM async
      const key = `${fromLoc.lng},${fromLoc.lat};${toLoc.lng},${toLoc.lat}`;
      const cached = this.osrmCache[key];
      const replace = (coords) => {
        if (this.mapFocusLayer) this.mapInstance.removeLayer(this.mapFocusLayer);
        this.mapFocusLayer = L.polyline(coords, { color: '#A0462A', weight: 4, opacity: 0.9 }).addTo(this.mapInstance);
      };
      if (cached) { replace(cached.coords); return; }
      fetch(`https://router.project-osrm.org/route/v1/driving/${fromLoc.lng},${fromLoc.lat};${toLoc.lng},${toLoc.lat}?overview=full&geometries=geojson`)
        .then(r => r.json())
        .then(d => {
          const route = d.routes && d.routes[0];
          if (!route) return;
          const coords = route.geometry.coordinates.map(([lng, lat]) => [lat, lng]);
          this.osrmCache[key] = { coords, minutes: Math.round(route.duration / 60), km: (route.distance / 1000).toFixed(1), source: 'osrm' };
          replace(coords);
        })
        .catch(() => {});
    },

    _prevBlockInLane(b) {
      return this.blocks
        .filter(x => x.day === b.day && (x.team === b.team || (b.team === 'both' && x.team !== 'both')) && x.id !== b.id && x.start < b.start && x.locationId)
        .filter(x => x.type !== 'buffer' && x.type !== 'synthesis')
        .sort((a, c) => a.start.localeCompare(c.start))
        .pop();
    },

    get focusedBlock() { return this.focusedBlockId ? this.blockById(this.focusedBlockId) : null; },

    // Next block in the same lane after the focused block.
    _nextBlockInLane(b) {
      return this.blocks
        .filter(x => x.day === b.day && (x.team === b.team || (b.team === 'both' && x.team !== 'both')) && x.id !== b.id && x.start > b.start && x.locationId)
        .filter(x => x.type !== 'buffer' && x.type !== 'synthesis')
        .sort((a, c) => a.start.localeCompare(c.start))[0];
    },

    get directionsFromFocused() {
      const b = this.focusedBlock;
      if (!b || !b.locationId) return null;
      const next = this._nextBlockInLane(b);
      if (!next || !next.locationId || next.locationId === b.locationId) return null;
      const fromLoc = window.locationById(b.locationId);
      const toLoc = window.locationById(next.locationId);
      if (!fromLoc || !toLoc) return null;
      const thisEnd = this.addMinutes(b.start, b.duration);
      const gap = this._minutesBetween(thisEnd, next.start);
      const minutes = window.driveMinutes(b.locationId, next.locationId);
      const cacheKey = `${fromLoc.lng},${fromLoc.lat};${toLoc.lng},${toLoc.lat}`;
      const cached = this.osrmCache[cacheKey];
      return {
        toName: toLoc.name,
        nextTitle: next.title,
        nextStart: next.start,
        minutes,
        distanceKm: cached ? cached.km : null,
        gap,
        tight: minutes > gap + 1,
        googleUrl: `https://www.google.com/maps/dir/?api=1&origin=${fromLoc.lat},${fromLoc.lng}&destination=${toLoc.lat},${toLoc.lng}&travelmode=driving`,
        appleUrl:  `https://maps.apple.com/?saddr=${fromLoc.lat},${fromLoc.lng}&daddr=${toLoc.lat},${toLoc.lng}&dirflg=d`,
      };
    },

    get directionsToFocused() {
      const b = this.focusedBlock;
      if (!b || !b.locationId) return null;
      const prev = this._prevBlockInLane(b);
      if (!prev || !prev.locationId || prev.locationId === b.locationId) return null;
      const fromLoc = window.locationById(prev.locationId);
      const toLoc = window.locationById(b.locationId);
      if (!fromLoc || !toLoc) return null;
      const prevEnd = this.addMinutes(prev.start, prev.duration);
      const gap = this._minutesBetween(prevEnd, b.start);
      const minutes = window.driveMinutes(prev.locationId, b.locationId);
      const cacheKey = `${fromLoc.lng},${fromLoc.lat};${toLoc.lng},${toLoc.lat}`;
      const cached = this.osrmCache[cacheKey];
      return {
        fromName: fromLoc.name,
        fromId: prev.locationId,
        toName: toLoc.name,
        minutes,
        distanceKm: cached ? cached.km : null,
        gap,
        tight: minutes > gap + 1,
        osrmNote: cached && cached.source === 'osrm' ? `Routing via OSRM · ${cached.minutes} min road time` : '',
        googleUrl: `https://www.google.com/maps/dir/?api=1&origin=${fromLoc.lat},${fromLoc.lng}&destination=${toLoc.lat},${toLoc.lng}&travelmode=driving`,
        appleUrl:  `https://maps.apple.com/?saddr=${fromLoc.lat},${fromLoc.lng}&daddr=${toLoc.lat},${toLoc.lng}&dirflg=d`,
      };
    },

    get totalDriveSummary() {
      const sum = (teamId) => {
        const lane = this.blocks
          .filter(b => b.day === this.day && (b.team === teamId || b.team === 'both') && b.locationId && b.type !== 'buffer' && b.type !== 'synthesis')
          .sort((a, b) => a.start.localeCompare(b.start));
        let total = 0, prev = 'airbnb';
        for (const b of lane) { total += window.driveMinutes(prev, b.locationId); prev = b.locationId; }
        return total;
      };
      const pk = this.showRoutePK ? sum('pk_jen') : 0;
      const mk = this.showRouteMK ? sum('mike_katie') : 0;
      if (!this.showRoutePK && !this.showRouteMK) return '';
      const parts = [];
      if (this.showRoutePK) parts.push(`PK+Jen ${pk}m`);
      if (this.showRouteMK) parts.push(`M+K ${mk}m`);
      return 'Total drive · ' + parts.join(' · ');
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

    // Build a multi-stop Apple Maps URL for the whole day's route.
    // Apple Maps native format: maps.apple.com/?saddr=A&daddr=B+to:C+to:D
    // daddr supports multi-stop via " to:" separators. lat,lng works everywhere.
    appleMapsForDay(d) {
      const home = window.locationById('airbnb');
      const lane = this.blocks
        .filter(b => b.day === d && b.locationId)
        .filter(b => b.type !== 'buffer' && b.type !== 'synthesis')
        .sort((a, b) => a.start.localeCompare(b.start));
      // Dedupe consecutive same-location stops
      const deduped = [];
      for (const b of lane) {
        const prev = deduped[deduped.length - 1];
        if (!prev || prev.locationId !== b.locationId) deduped.push(b);
      }
      let locs = deduped.map(b => window.locationById(b.locationId)).filter(Boolean);
      // Prepend home as start if not already there
      if (home && locs.length > 0 && locs[0].id !== 'airbnb' && d !== 'sun' && d !== 'thu') {
        locs = [home, ...locs];
      }
      if (locs.length < 2) {
        // Fall back to just opening home
        return home ? `https://maps.apple.com/?q=${home.lat},${home.lng}` : 'https://maps.apple.com/';
      }
      const saddr = `${locs[0].lat},${locs[0].lng}`;
      const daddrStops = locs.slice(1).map((l, i) => i === 0 ? `${l.lat},${l.lng}` : `${l.lat},${l.lng}`);
      // Apple Maps uses "+to:" as the stop separator
      const daddr = daddrStops.join('+to:');
      return `https://maps.apple.com/?saddr=${saddr}&daddr=${daddr}&dirflg=d`;
    },

    // ---- Travel buffer insertion on lock-in / drop ----
    insertTravelBuffers(block) {
      if (!block || !block.locationId) return;
      // Clean up any existing auto-inserted travel buffers adjacent to this block
      // (they'll be re-created with correct durations below).
      this.blocks = this.blocks.filter(x => !(x.isTravelBuffer && this._adjacentToBlock(x, block)));
      const lane = this.blocks
        .filter(x => x.day === block.day && x.team === block.team && x.id !== block.id)
        .sort((a, b) => a.start.localeCompare(b.start));
      const blockStart = this._toMin(block.start);
      const blockEnd   = this._toMin(this.addMinutes(block.start, block.duration));

      // Previous block (strictly ends <= blockStart)
      const prev = lane.filter(x => this._toMin(this.addMinutes(x.start, x.duration)) <= blockStart).pop();
      if (prev && prev.locationId && prev.locationId !== block.locationId) {
        const drive = window.driveMinutes(prev.locationId, block.locationId);
        const gap = blockStart - this._toMin(this.addMinutes(prev.start, prev.duration));
        if (drive > 0 && gap > 0) {
          const bufferDuration = Math.min(drive, gap);
          const bufferStartMin = blockStart - bufferDuration;
          this.blocks.push({
            id: `tb_${Date.now().toString(36)}_p_${Math.random().toString(36).slice(2, 5)}`,
            day: block.day, team: block.team,
            start: this._fromMin(bufferStartMin),
            duration: bufferDuration,
            title: `Drive → ${this.locationShort(block.locationId)}`,
            type: 'travel',
            locationId: block.locationId,
            brief: `${drive} min drive from ${this.locationLabel(prev.locationId)}${drive > gap ? ' · tight — gap is ' + gap + ' min' : ''}`,
            locked: false,
            interviewId: null,
            attendees: '',
            isTravelBuffer: true,
          });
        }
      }
      // Next block (strictly starts >= blockEnd)
      const next = lane.find(x => this._toMin(x.start) >= blockEnd);
      if (next && next.locationId && next.locationId !== block.locationId) {
        const drive = window.driveMinutes(block.locationId, next.locationId);
        const gap = this._toMin(next.start) - blockEnd;
        if (drive > 0 && gap > 0) {
          const bufferDuration = Math.min(drive, gap);
          this.blocks.push({
            id: `tb_${Date.now().toString(36)}_n_${Math.random().toString(36).slice(2, 5)}`,
            day: block.day, team: block.team,
            start: this._fromMin(blockEnd),
            duration: bufferDuration,
            title: `Drive → ${this.locationShort(next.locationId)}`,
            type: 'travel',
            locationId: next.locationId,
            brief: `${drive} min drive to ${this.locationLabel(next.locationId)}${drive > gap ? ' · tight — gap is ' + gap + ' min' : ''}`,
            locked: false,
            interviewId: null,
            attendees: '',
            isTravelBuffer: true,
          });
        }
      }
      this.pushRemote();
    },

    _adjacentToBlock(buffer, block) {
      if (buffer.day !== block.day || buffer.team !== block.team) return false;
      const bStart = this._toMin(block.start);
      const bEnd   = this._toMin(this.addMinutes(block.start, block.duration));
      const tStart = this._toMin(buffer.start);
      const tEnd   = this._toMin(this.addMinutes(buffer.start, buffer.duration));
      return tEnd === bStart || tStart === bEnd;
    },

    // Send a day-before confirmation email (uses the 'confirm' intro template).
    sendConfirmation(block, ii) {
      if (!block || !ii) { this.showToast('No interviewee on file'); return; }
      this.draftIntro(ii.id, 'confirm', block);
    },

    // Copy a shareable "event link" to the clipboard. The link is the Apple /
    // Google Maps directions to the meeting location + the time — something
    // you can text the attendee. If no location, falls back to a plain summary.
    copyEventLink(block) {
      if (!block) return;
      const loc = block.locationId && window.locationById(block.locationId);
      const day = this.dayLabel(block.day);
      const end = this.addMinutes(block.start, block.duration);
      let text = `${block.title}\n${day}, ${block.start}–${end} PT`;
      if (loc) {
        text += `\n${loc.name}\n${loc.addr}`;
        text += `\nApple Maps: https://maps.apple.com/?q=${loc.lat},${loc.lng}`;
        text += `\nGoogle Maps: https://www.google.com/maps/search/?api=1&query=${loc.lat},${loc.lng}`;
      }
      if (block.brief) text += `\n\n${block.brief}`;
      navigator.clipboard.writeText(text).then(
        () => this.showToast('Event details copied — paste into a text or email'),
        () => this.showToast('Copy failed. Highlight and copy manually.')
      );
    },

    // ---- Intro email drafter ----
    draftIntro(interviewId, templateKey, blockHint) {
      const ii = this.interviewById(interviewId);
      if (!ii) { this.showToast('No interviewee on file'); return; }
      const template = this.INTRO_TEMPLATES[templateKey];
      if (!template) { this.showToast('Unknown template'); return; }
      const block = blockHint || this.blocks.find(b => b.interviewId === interviewId) || null;
      const draft = template(ii, block);
      const to = encodeURIComponent(ii.email || '');
      const su = encodeURIComponent(draft.subject || '');
      const body = encodeURIComponent(draft.body || '');
      // Gmail web: https://mail.google.com/mail/?view=cm&fs=1&to=...&su=...&body=...
      const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${to}&su=${su}&body=${body}`;
      window.open(gmailUrl, '_blank', 'noopener');
      this.showToast(`${draft.senderLabel || 'Draft'} → Gmail`);
    },

    // Helper for actions UI
    actionIntervieweeName(a) {
      if (!a.intervieweeId) return '';
      const ii = this.interviewById(a.intervieweeId);
      return ii ? ii.name : '';
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
