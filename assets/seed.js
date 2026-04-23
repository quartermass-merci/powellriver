// Seed data transcribed from "Itinerary & Interview Schedule.docx" (v2, Apr 2026).
// This file is the canonical starting state — Firebase RTDB will hydrate from it
// on first load, then be the source of truth thereafter.

window.TEAMS = {
  pk_jen:      { id: "pk_jen",      label: "PK + Jen",    role: "Interviews",     color: "#2B3A2E" },
  mike_katie:  { id: "mike_katie",  label: "Mike + Katie", role: "Camera + Audio", color: "#8B5A2B" },
  both:        { id: "both",        label: "Both Teams",   role: "Combined",       color: "#1F1F1F" },
};

window.BLOCK_TYPES = {
  formal:     { label: "Formal Interview",  color: "#2B3A2E", intensity: 3 },
  short:      { label: "Short Interview",   color: "#556B4F", intensity: 2 },
  portrait:   { label: "Portrait",          color: "#7A8B6E", intensity: 1 },
  roundtable: { label: "Roundtable",        color: "#4A3A2C", intensity: 3 },
  mots:       { label: "MOTS / Intercepts", color: "#8B5A2B", intensity: 2 },
  broll:      { label: "B-Roll / Coverage", color: "#B58C5A", intensity: 1 },
  travel:     { label: "Travel",            color: "#6B6B6B", intensity: 1 },
  meal:       { label: "Meal",              color: "#C9A270", intensity: 1 },
  synthesis:  { label: "Synthesis",         color: "#3C3C3C", intensity: 2 },
  buffer:     { label: "Buffer / Notes",    color: "#A8A8A8", intensity: 0 },
  facility:   { label: "Facility Coverage", color: "#44546A", intensity: 2 },
  archival:   { label: "Archival",          color: "#7B5E3A", intensity: 2 },
  informal:   { label: "Informal",          color: "#9B8259", intensity: 1 },
};

// --- LOGISTICS / OVERVIEW ---------------------------------------------------
window.LOGISTICS = {
  travelDates: "Sunday April 26 → Thursday April 30, 2026",
  team: [
    { name: "PK Lawton",  role: "Strategy lead (interviews)",     team: "pk_jen",     originAirport: "YYZ" },
    { name: "Jen",        role: "Interview support",              team: "pk_jen",     originAirport: "YUL" },
    { name: "Mike",       role: "Audio + second camera",          team: "mike_katie", originAirport: "YYZ" },
    { name: "Katie",      role: "Lead camera / DP",               team: "mike_katie", originAirport: "YYZ" },
  ],
  flights: {
    outbound: [
      { pax: "Katie, Mike, PK", flight: "Flair F8 601",           times: "07:40 ET → 09:50 PT", conf: "PNR: BYHATN",         cost: "$1,799.33 (3 pax bundled)" },
      { pax: "Jen",             flight: "Air Canada 301 (A330)",   times: "07:30 ET → 09:50 PT", conf: "Ticket 0142325402963", cost: "part of $1,360.80 RT" },
    ],
    ret: [
      { pax: "Katie, Mike, PK", flight: "Air Canada 116 (A320)",    times: "14:30 PT → 22:08 ET",       conf: "Tickets 0142325435314/15/16", cost: "$1,847.08 total" },
      { pax: "Jen",             flight: "AC 116 + AC 7884 via YYZ", times: "14:30 PT → 01:51 ET (Fri)", conf: "Ticket 0142325402963",        cost: "part of $1,360.80 RT" },
    ],
    aeroplan: "PK 988138426 · Katie 354775850",
    totalSpend: "$5,007.21 CAD",
  },
  rental: {
    vendor: "Budget Rent A Car",
    vehicle: "Nissan Kicks (SUV)",
    pickup: "YVR Main, 5140 Grant McConachie Way, Richmond, BC V7B 1V1",
    pickupTime: "Sunday April 26, 09:30 AM PT",
    dropoffTime: "Thursday April 30, 01:00 PM PT",
    duration: "4 days",
    conf: "44192600CA4",
    reservationName: "PAUL LAWTON",
  },
  lodging: {
    property: "Blissful Sunsets, Airbnb",
    address: "4312 Fernwood Avenue, Powell River, BC V8A 3L1",
    host: "+1 604-741-1162",
    checkin: "Sunday April 26, 3:00 PM PT",
    checkout: "Thursday April 30 (early AM, per host instructions)",
    nights: 4,
    conf: "HMZ54NNSW",
    cost: "$1,556 CAD",
  },
  ferries: [
    { when: "Sun Apr 26 · 1:30 PM",   route: "HSB → Langdale (Route 3)",        duration: "40 min", book: "YES — book online" },
    { when: "Sun Apr 26 · ~4:40 PM",  route: "Earls Cove → Saltery Bay (Rt 7)", duration: "50 min", book: "Walk-on" },
    { when: "Thu Apr 30 · 6:25 AM",   route: "Saltery Bay → Earls Cove (Rt 7)", duration: "50 min", book: "First sailing, walk-on" },
    { when: "Thu Apr 30 · 10:30 AM",  route: "Langdale → HSB (Route 3)",        duration: "40 min", book: "YES — book online" },
  ],
};

// --- INTERVIEW ROSTER (bios + prep notes) -----------------------------------
window.INTERVIEWS = [
  { id: "craig_ewan",     name: "Craig Austin & Ewan Moir", role: "Mill Project CEO / COO",
    team: "pk_jen", format: "formal", duration: 45, day: "mon", locationId: "meridian",
    bio: "Craig is CEO of the new Powell River Mill Project and holds an ownership stake in Meridian. Ewan Moir is COO — ex-CEO Port of Vancouver, Port of Nanaimo, BC Ports — then ran the Emergency Activation division of the Canadian Red Cross through the 2023/24/25 wildfire summers.",
    prep: "Joe or Denise to send warm intro this week. Ideal: mill site or Townsite setting.",
    status: "pending",
  },
  { id: "chris_mcdonough", name: "Chris McDonough", role: "Owner/Operator, High Quadz · PR local",
    team: "pk_jen", format: "formal", duration: 30, day: "mon", locationId: "meridian",
    bio: "Meridian's first, longest, and most loyal customer. Born and raised in Powell River. Represents the proof of product — chose Meridian before there was a brand, purely on quality and trust. Bridges local community and B2B market.",
    prep: "PK to reach out direct or via Joe. Late afternoon Monday.",
    status: "pending",
  },
  { id: "rivercity",      name: "River City Coffee ownership", role: "Friends of the business",
    team: "mike_katie", format: "informal", duration: 15, day: "mon", locationId: "rivercity",
    bio: "Friends of Meridian. A natural gathering spot, the kind of place where you hear what Powell River is actually thinking. More atmosphere than formal interview.",
    prep: "Joe or Denise to text ahead. Morning or lunch slot.",
    status: "pending",
  },
  { id: "andrew_hand",    name: "Andrew Hand", role: "Sr. Director, Strategic Planning",
    team: "pk_jen", format: "formal", duration: 45, day: "tue", locationId: "meridian",
    bio: "Was Head of Cultivation until recently. MSc in Molecular Biology & Horticulture from Guelph. Ex-MedReleaf, Ex-Aurora, Ex-OCCO. Original breeder of Tangerine Dream. Joe's most trusted team member on cultivation and strategy. Bridges science and business — can explain the genetics database, the 250+ cultivar library, the predictive scheduling model.",
    prep: "Comes in with the cultivation philosophy frame. Let Andrew validate, complicate, or add to it. Builds the Reasons to Believe narrative.",
    status: "confirmed",
  },
  { id: "braden_decorby", name: "Braden DeCorby", role: "Facility Manager",
    team: "pk_jen", format: "formal", duration: 30, day: "tue", locationId: "meridian",
    bio: "Most senior person on site day-to-day. Manages all people and resource allocation. No cannabis background — journeyman insulation technician and ex-live music touring audio technician. A tradesperson and touring musician running a cannabis grow in a converted paper mill. Everyman archetype.",
    prep: "Lean into the career journey. Ask about the gap between expectation and reality. Ask about the building.",
    status: "confirmed",
  },
  { id: "josh_rettie",    name: "Josh Rettie", role: "Head of Cultivation (Master Grower)",
    team: "pk_jen", format: "formal", duration: 45, day: "tue", locationId: "meridian",
    bio: "30+ years growing, breeding, and collecting rare genetics. ACMPR at home with 70+ unique cultivars, a living seed library. The deep craft voice of Meridian.",
    prep: "Open-ended. Ask about his favourites and why. Ask what he's growing at home that he hasn't brought to Meridian yet.",
    status: "confirmed",
  },
  { id: "kelly_storm",    name: "Kelly Storm", role: "Alternate Head of Cultivation (Master Grower)",
    team: "pk_jen", format: "formal", duration: 30, day: "tue", locationId: "meridian",
    bio: "Every iteration of this facility — Sante Veritas → Tilt → Meridian. Alternate Responsible Person in the eyes of Health Canada. Pre-cannabis: floral greenhouse in Alberta supplying the City of Banff with husband John. Then Aurora at the start of legalization. The continuity thread.",
    prep: "Ask about the Sante Veritas and Tilt days. Ask about the Banff greenhouse — crossover between floral horticulture and cannabis is a rich vein.",
    status: "confirmed",
  },
  { id: "sam_naso",       name: "Sam Naso", role: "Alternate Head of Cultivation, 2IC",
    team: "mike_katie", format: "short", duration: 20, day: "tue", locationId: "meridian",
    bio: "Running crews in Powell River for almost a decade growing 'Commercial Kush.' Incredible plant intuition, the kind that doesn't come from a degree. Counterweight to Andrew's science-driven approach.",
    prep: "Film at his station. Ask him to show you something about a plant — best footage comes from Sam explaining what he sees that others don't.",
    status: "confirmed",
  },
  { id: "kristian_hansen", name: "Kristian Hansen", role: "Head of Security / QA Manager",
    team: "mike_katie", format: "short", duration: 20, day: "tue", locationId: "meridian",
    bio: "Employee #3 or #4. With Meridian since before licensing. Built the compliance processes, leads all audits. The infrastructure layer — the rigour that makes the craft defensible.",
    prep: "Ask about building compliance from nothing. Ask what auditors miss vs. catch.",
    status: "confirmed",
  },
  { id: "denise_berg",    name: "Denise Berg", role: "Partnerships Manager",
    team: "mike_katie", format: "short", duration: 15, day: "tue", locationId: "meridian",
    bio: "Joined last summer. Day-to-day contact for all customers, face of the company at industry events. Knows what the market thinks of Meridian, what partners ask about, what objections come up.",
    prep: "Ask what question she gets asked most. Ask what surprised her when she joined.",
    status: "confirmed",
  },
  { id: "kelly_brooks",   name: "Kelly Brooks", role: "Cultivation, Crop Work Lead",
    team: "mike_katie", format: "short", duration: 15, day: "tue", locationId: "meridian",
    bio: "Runs the most labour-intensive team at Meridian. Born and raised in Powell River. In the weed world locally for a while. A little shy but has stories if you can break in. The daily reality of 'hand-trimmed' and 'three-week cure.'",
    prep: "Katie leads. Start with 'walk me through your day.' Don't push too hard on camera.",
    status: "confirmed",
  },
  { id: "dave_lene",      name: "Dave Dowling + Lene Lindstrom", role: "Ex-mill workers, now at Meridian",
    team: "mike_katie", format: "portrait", duration: 15, day: "tue", locationId: "meridian",
    bio: "Both worked at the paper mill, now at Meridian. Very passionate. Their arc — from the mill that closed to the cannabis facility that replaced it — is the Townsite reinvention story in one person. Film them together.",
    prep: "JOE TO CLEAR BEFORE FILMING. One question each: 'What's it like working in this building now vs. when it was the mill?'",
    status: "pending",
  },
  { id: "roundtable",     name: "Cultivation Roundtable", role: "Josh + Kelly S + Sam",
    team: "both", format: "roundtable", duration: 30, day: "tue", locationId: "meridian",
    bio: "The three people who actually grow the cannabis, in one room, talking to each other. Captures dynamics a one-on-one never will. Schedule AFTER individual interviews so you already know each person's perspective.",
    prep: "End of day. Keep it loose. Opener: 'What's the thing the three of you argue about most?' Closer: 'What would you want a brand to never get wrong about what you do?'",
    status: "confirmed",
  },
  { id: "brent_b",        name: "Brent B", role: "Wheelchair Weed Craft Cannabis — micro grower",
    team: "pk_jen", format: "formal", duration: 45, day: "wed", locationId: "brent_b",
    bio: "Paralyzed since age 17. Growing cannabis from a wheelchair for over 20 years. Licensed micro-cultivator south of Powell River. Brent's story exists alongside Meridian's, not inside it. Represents the broader Powell River cannabis community.",
    prep: "Drive south, 30 min each way. Schedule first thing Wednesday. Ask about why Powell River, why cannabis. Don't make the wheelchair the whole story.",
    status: "pending",
  },
  { id: "wayne_walsh",    name: "Wayne Walsh", role: "Newfoundland transplant, Meridian construction",
    team: "pk_jen", format: "short", duration: 20, day: "wed", locationId: "meridian",
    bio: "Involved in the physical construction and launch of the Meridian facility. A Newfoundland transplant with a storyteller's instinct. Can speak to what it took to build this operation inside a former paper mill — the physical reality behind 'Ghosts in the Machine.'",
    prep: "Late morning. Ask about the build: what went wrong, what surprised him, what the building fought back on.",
    status: "pending",
  },
  { id: "pr_peak",        name: "Powell River Peak", role: "Local journalism",
    team: "pk_jen", format: "formal", duration: 30, day: "wed", locationId: "prpeak",
    bio: "The Peak covers Powell River. A journalist here has a unique lens on how the city talks about itself, what stories get traction, and where tensions sit. Less about Meridian, more about place-as-brand.",
    prep: "Joe or Denise to intro. Afternoon slot.",
    status: "pending",
  },
  { id: "dispensary_tbd", name: "Dispensary Owner (TBD)", role: "Retail side",
    team: "pk_jen", format: "formal", duration: 30, day: "wed", locationId: "dispensary_1",
    bio: "Retail side — what moves on the shelf, how customers ask about craft, what the local vs. out-of-town split looks like.",
    prep: "TBD via Joe. Afternoon slot.",
    status: "pending",
  },
  { id: "forrest_staff",  name: "Forrest Restaurant Staff", role: "Old mill bar, cage-fight stories",
    team: "mike_katie", format: "informal", duration: 15, day: "wed", locationId: "forrest",
    bio: "Joe's lead: Forrest was reportedly the old mill bar and rumour has it they used to host cage fights inside. Exactly the kind of local mythology we're hunting. Even if the food is decent, the stories are the reason to go.",
    prep: "Lunch slot. If staff will talk on camera, great. If not, capture the space and note stories for the mood doc.",
    status: "pending",
  },
  { id: "tom_ligocki",    name: "Tom Ligocki", role: "Owner / Chairman",
    team: "pk_jen", format: "formal", duration: 30, day: "remote", locationId: null,
    bio: "Remote video interview, pre- or post-trip. Follow Joe's lead on timing and framing.",
    prep: "Schedule video call around trip. PK to coordinate with Joe.",
    status: "pending",
  },
];

// --- CONTACTS (keyed by interview id) ---------------------------------------
// Best-effort LinkedIn searches + company URLs. Emails are blank by default —
// fill them in as you confirm them (they go straight into the Gmail draft).
const lnk = (q) => `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(q)}`;
window.CONTACTS = {
  craig_ewan: {
    email: "",
    linkedin: lnk("Craig Austin Powell River Mill"),
    extraLinkedin: lnk("Ewan Moir Port Vancouver Red Cross"),
    company: "Powell River Mill Project",
    companyUrl: "",
    intro: "Mill project CEO / COO. Warm intro via Joe recommended.",
  },
  chris_mcdonough: {
    email: "",
    linkedin: lnk("Chris McDonough High Quadz Powell River"),
    company: "High Quadz",
    companyUrl: "",
    intro: "Meridian's first customer. PK can reach direct or via Joe.",
  },
  rivercity: {
    email: "",
    linkedin: "",
    company: "River City Coffee",
    companyUrl: "https://www.facebook.com/rivercitycoffee/",
    intro: "Informal — Joe or Denise to text ahead.",
  },
  andrew_hand: {
    email: "andrew@meridian125w.com",
    linkedin: lnk("Andrew Hand Meridian cannabis Guelph"),
    company: "Meridian 125W",
    companyUrl: "https://meridian125w.com",
    intro: "Already confirmed — send calendar hold + brief the night before.",
  },
  braden_decorby: {
    email: "braden@meridian125w.com",
    linkedin: lnk("Braden DeCorby Meridian facility"),
    company: "Meridian 125W",
    companyUrl: "https://meridian125w.com",
    intro: "Already confirmed — send calendar hold.",
  },
  josh_rettie: {
    email: "josh@meridian125w.com",
    linkedin: lnk("Josh Rettie master grower"),
    company: "Meridian 125W",
    companyUrl: "https://meridian125w.com",
    intro: "Already confirmed — send calendar hold.",
  },
  kelly_storm: {
    email: "kelly.storm@meridian125w.com",
    linkedin: lnk("Kelly Storm cultivation cannabis"),
    company: "Meridian 125W",
    companyUrl: "https://meridian125w.com",
    intro: "Already confirmed.",
  },
  sam_naso: {
    email: "sam@meridian125w.com",
    linkedin: lnk("Sam Naso Powell River cannabis"),
    company: "Meridian 125W",
    companyUrl: "https://meridian125w.com",
    intro: "Already confirmed.",
  },
  kristian_hansen: {
    email: "kristian@meridian125w.com",
    linkedin: lnk("Kristian Hansen Meridian security compliance"),
    company: "Meridian 125W",
    companyUrl: "https://meridian125w.com",
    intro: "Already confirmed.",
  },
  denise_berg: {
    email: "denise@meridian125w.com",
    linkedin: lnk("Denise Berg Meridian partnerships"),
    company: "Meridian 125W",
    companyUrl: "https://meridian125w.com",
    intro: "Already confirmed — she's our day-to-day contact.",
  },
  kelly_brooks: {
    email: "kelly.brooks@meridian125w.com",
    linkedin: lnk("Kelly Brooks cultivation Powell River"),
    company: "Meridian 125W",
    companyUrl: "https://meridian125w.com",
    intro: "Already confirmed — Katie leads, soft approach.",
  },
  dave_lene: {
    email: "",
    linkedin: "",
    company: "Meridian 125W (ex-Catalyst Paper)",
    companyUrl: "https://meridian125w.com",
    intro: "Joe to clear before filming — don't email directly until cleared.",
  },
  roundtable: {
    email: "",
    linkedin: "",
    company: "Meridian 125W",
    companyUrl: "https://meridian125w.com",
    intro: "Josh + Kelly Storm + Sam — schedule via Denise.",
  },
  brent_b: {
    email: "",
    linkedin: lnk("Brent Wheelchair Weed Powell River"),
    company: "Wheelchair Weed Craft Cannabis",
    companyUrl: "https://www.wheelchairweed.ca",
    intro: "PK to reach out directly. Cold outreach is fine here.",
  },
  wayne_walsh: {
    email: "",
    linkedin: lnk("Wayne Walsh Powell River construction"),
    company: "",
    companyUrl: "",
    intro: "PK to reach out — Joe has his number.",
  },
  pr_peak: {
    email: "editor@prpeak.com",
    linkedin: lnk("Powell River Peak newsroom"),
    company: "Powell River Peak",
    companyUrl: "https://www.prpeak.com",
    intro: "Joe or Denise to intro. Pitch is 'place-as-brand' not 'cover Meridian.'",
  },
  dispensary_tbd: {
    email: "",
    linkedin: "",
    company: "",
    companyUrl: "",
    intro: "TBD via Joe.",
  },
  forrest_staff: {
    email: "",
    linkedin: "",
    company: "Forrest Restaurant",
    companyUrl: "",
    intro: "Walk-in. Cameras ready, no advance email needed.",
  },
  tom_ligocki: {
    email: "",
    linkedin: lnk("Tom Ligocki Meridian Chairman"),
    company: "Meridian 125W",
    companyUrl: "https://meridian125w.com",
    intro: "Remote video call — follow Joe's lead on timing.",
  },
};

// Merge contacts into INTERVIEWS at load so downstream code sees one object.
(function mergeContacts() {
  window.INTERVIEWS.forEach(i => {
    const c = window.CONTACTS[i.id] || {};
    Object.assign(i, {
      email: c.email || "",
      linkedin: c.linkedin || "",
      extraLinkedin: c.extraLinkedin || "",
      company: c.company || "",
      companyUrl: c.companyUrl || "",
      introNote: c.intro || "",
    });
  });
})();

// --- INTRO EMAIL TEMPLATES --------------------------------------------------
// Each template returns { subject, body, suggestedTo }. suggestedTo is whichever
// email is on file (empty if we haven't added one yet — Gmail opens with To: blank).
// Gmail deep-link format: https://mail.google.com/mail/?view=cm&fs=1&to=&su=&body=
window.INTRO_TEMPLATES = {
  warm_joe: (ii, b) => ({
    senderLabel: "Warm intro from Joe",
    subject: `Quick intro, Sister Merci / Meridian research`,
    body:
      `Hi ${firstName(ii.name)},\n\n` +
      `Quick one. PK Lawton and Jen from Sister Merci are in Powell River Apr 27–29 doing the groundwork for the Meridian brand project I've talked to you about. I'd like them to sit down with you.\n\n` +
      `${whyYou(ii)}\n\n` +
      (b ? `They've blocked ${dateTimeLabel(b)} (${b.duration} min)${b.locationId ? ', ' + locLabel(b.locationId) : ''}. ` : '') +
      `PK will be in touch directly. If the timing's off, tell him — he'll move it.\n\n` +
      `Appreciated,\nJoe`,
    from: "joe",
  }),
  cold_pk: (ii, b) => ({
    senderLabel: "Cold outreach from PK",
    subject: `Sister Merci / Meridian 125W${b ? ' · ' + dateTimeLabel(b) : ''}`,
    body:
      `Hi ${firstName(ii.name)},\n\n` +
      `I'm PK with Sister Merci. We're doing the brand research for Meridian 125W, and Joe ${ii.introNote && /joe/i.test(ii.introNote) ? "flagged you as someone I need to talk to" : "suggested I reach out"}.\n\n` +
      `${whyYou(ii)}\n\n` +
      (b
        ? `Could we sit down for ${b.duration} minutes ${dateTimeLabel(b)}? I'd come to you${b.locationId ? ' at ' + locLabel(b.locationId) : ''}. If that doesn't work, any time Mon–Wed (Apr 27–29) is open — I'll fit around you.\n\n`
        : `Could we find ${ii.duration || 30} minutes Mon–Wed (Apr 27–29)? I'd come to you.\n\n`) +
      `What this is: brand research for a Meridian film and strategy project. We want the honest take, not the brochure version.\n\n` +
      `What works?\n\n` +
      `PK\nPK Lawton, Sister Merci\npk@sistermerci.com`,
    from: "pk",
  }),
  cold_katie: (ii, b) => ({
    senderLabel: "Cold outreach from Katie",
    subject: `Sister Merci / Meridian 125W${b ? ' · short visit ' + dateTimeLabel(b) : ''}`,
    body:
      `Hi ${firstName(ii.name)},\n\n` +
      `Katie here. I'm shooting a brand film for Meridian 125W with the Sister Merci team, and we'll be in Powell River${b ? ' on ' + dateTimeLabel(b).toLowerCase() : ' Mon–Wed Apr 27–29'}. I'd love to swing by.\n\n` +
      `${whyYou(ii)}\n\n` +
      (b
        ? `${b.duration} minutes ${dateTimeLabel(b)}${b.locationId ? ', ' + locLabel(b.locationId) : ''}. `
        : `${ii.duration || 15}–20 minutes, any slot Mon–Wed works. `) +
      `Low-key. Just me and Mike on audio, probably a short portrait. Nothing you need to prep.\n\n` +
      `What works?\n\n` +
      `Katie`,
    from: "katie",
  }),
  confirm: (ii, b) => ({
    senderLabel: "Day-before confirmation",
    subject: b ? `Confirming ${dateTimeLabel(b)}` : `Confirming our time`,
    body:
      `Hi ${firstName(ii.name)},\n\n` +
      (b
        ? `Confirming ${dateTimeLabel(b)}, ${b.duration} min${b.locationId ? ', ' + locLabel(b.locationId) : ''}.\n\n`
        : `Confirming our time ahead of next week.\n\n`) +
      `I'll have Jen with me for notes. Easy conversation, nothing to prep${ii.format === 'short' ? '. Should be 20 minutes, tops' : ''}.\n\n` +
      `Text me day-of if anything shifts.\n\n` +
      `See you then.\n\n` +
      `PK`,
    from: "pk",
  }),
};

function firstName(fullName) {
  if (!fullName) return "there";
  // handle "Dave Dowling + Lene Lindstrom" and "Craig Austin & Ewan Moir"
  const cleaned = fullName.split(/\s*[+&]\s*/)[0];
  return cleaned.split(/\s+/)[0];
}
function locLabel(id) {
  const l = (window.LOCATIONS || []).find(x => x.id === id);
  return l ? l.name : "";
}
function dateTimeLabel(b) {
  if (!b) return "";
  const dayName = { mon: "Mon Apr 27", tue: "Tue Apr 28", wed: "Wed Apr 29" }[b.day] || b.day;
  return `${dayName} · ${b.start} PT`;
}
function whyYou(ii) {
  // One-liner explaining why this person matters. Skips the intro note if it
  // references Joe (orchestration detail, not for the first email).
  const note = ii.introNote && !/joe/i.test(ii.introNote) ? ii.introNote : '';
  if (note) return note;
  return `We want your take on Meridian, on this place, and on what the mill site means to the community.`;
}

// Helpers for schedule construction
const T = (day, start, duration, team, type, title, opts = {}) => ({
  id: opts.id || `${day}_${team}_${start.replace(":", "")}_${Math.random().toString(36).slice(2,6)}`,
  day, start, duration, team, type, title,
  locationId: opts.locationId || null,
  attendees:  opts.attendees || [],
  brief:      opts.brief || "",
  locked:     !!opts.locked,
  interviewId: opts.interviewId || null,
});

// --- DAY-BY-DAY PRE-FILLED SCHEDULE -----------------------------------------
window.SCHEDULE_SEED = {
  // --- Sunday Apr 26 · Outbound travel ---
  sun: [
    T("sun", "07:30",  20, "both", "travel", "Depart YYZ (Flair F8 601) + Jen YUL (AC 301)", { locationId: "yvr", brief: "PK/Katie/Mike 07:40 ET. Jen 07:30 ET direct to YVR." }),
    T("sun", "09:50",  20, "both", "buffer", "Wheels down YVR (both flights)",                 { locationId: "yvr" }),
    T("sun", "10:10",  50, "both", "buffer", "Bags · Budget rental pickup · gear load",        { locationId: "yvr", brief: "Budget conf. 44192600CA4 · Nissan Kicks · reservation PAUL LAWTON." }),
    T("sun", "11:45",  45, "both", "travel", "Drive YVR → Horseshoe Bay",                       { locationId: "horseshoe_bay" }),
    T("sun", "12:30",  30, "both", "meal",   "Lunch · walkable from car queue",                 { locationId: "horseshoe_bay", brief: "Check in at ferry BEFORE lunch (Joe's rec). BC Ferries closes check-in 30 min before sailing." }),
    T("sun", "13:30",  40, "both", "travel", "Ferry HSB → Langdale (Route 3)",                  { locationId: "langdale", brief: "Reserved. Booked online.", locked: true }),
    T("sun", "14:10",  20, "both", "travel", "Drive Langdale → Gibsons/Sechelt for coffee",    { locationId: "gibsons", brief: "Better coffee + scenery than Langdale itself (Joe's rec)." }),
    T("sun", "14:30", 105, "both", "travel", "Drive Sunshine Coast → Earls Cove",              { locationId: "earls_cove", brief: "1h 30–45m along Hwy 101." }),
    T("sun", "16:15",  25, "both", "buffer", "Queue for Earls Cove ferry",                      { locationId: "earls_cove", brief: "Confirm exact Sunday sailing time." }),
    T("sun", "16:40",  50, "both", "travel", "Ferry Earls Cove → Saltery Bay (Route 7)",       { locationId: "saltery_bay", brief: "Walk-on, ~50 min." }),
    T("sun", "17:30",  30, "both", "travel", "Drive Saltery Bay → Powell River",                { locationId: "airbnb" }),
    T("sun", "18:00",  90, "both", "buffer", "Arrive Airbnb (4312 Fernwood Ave) · settle in",   { locationId: "airbnb", brief: "Blissful Sunsets Airbnb · conf. HMZ54NNSW · host +1 604-741-1162." }),
    T("sun", "19:30",  90, "both", "meal",   "Team dinner + Day 1 briefing",                    { locationId: "airbnb" }),
  ],
  mon: [
    // PK + Jen lane
    T("mon", "08:30", 120, "pk_jen", "archival",  "qathet Museum & Archives — deep dive",      { locationId: "museum", brief: "Photos, names, dates, citations." }),
    T("mon", "10:30",  60, "pk_jen", "archival",  "Archives · schedule Day 3 follow-ups",       { locationId: "museum" }),
    T("mon", "11:30",  60, "pk_jen", "buffer",    "Ad-hoc buffer",                               { locationId: "meridian" }),
    T("mon", "12:30",  60, "pk_jen", "meal",      "Lunch · Shingle Mill (team regroup)",         { locationId: "shinglemill", brief: "Joe's rec — patio, weather dependent." }),
    T("mon", "13:30",  45, "pk_jen", "formal",    "Craig Austin & Ewan Moir",                    { locationId: "meridian", interviewId: "craig_ewan", brief: "Mill project, ports, Red Cross, place narrative." }),
    T("mon", "15:00",  30, "pk_jen", "formal",    "Chris McDonough",                             { locationId: "meridian", interviewId: "chris_mcdonough", brief: "High Quadz, Meridian's first customer. Proof of product without marketing." }),
    T("mon", "16:30",  60, "pk_jen", "synthesis", "Notes + synthesis (local café)",              { locationId: "rivercity" }),
    T("mon", "17:30", 120, "pk_jen", "buffer",    "Back to house · interview notes · Day 2 prep", { locationId: "airbnb" }),
    T("mon", "19:30",  30, "pk_jen", "synthesis", "Synthesis huddle (PK leads)",                 { locationId: "airbnb", brief: "What we learned, what Day 2 needs." }),
    // Mike + Katie lane
    T("mon", "08:30", 120, "mike_katie", "broll",    "Townsite B-roll · mill exteriors · heritage", { locationId: "meridian", brief: "Chimneys, gates, signage, NHS markers." }),
    T("mon", "10:30",  60, "mike_katie", "broll",    "The Hulks · Powell Lake from Townsite",       { locationId: "hulks", brief: "Wide, mid, tight detail." }),
    T("mon", "11:30",  60, "mike_katie", "informal", "River City Coffee · ownership chat",          { locationId: "rivercity", interviewId: "rivercity", brief: "Informal. Both teams if schedule allows." }),
    T("mon", "12:30",  60, "mike_katie", "meal",     "Lunch · Shingle Mill (team regroup)",          { locationId: "shinglemill" }),
    T("mon", "13:30",  90, "mike_katie", "mots",     "Marine Ave MOTS (set 1) · street intercepts", { locationId: "marine_ave", brief: "Target: 10+ this afternoon." }),
    T("mon", "15:00",  90, "mike_katie", "mots",     "Continue MOTS · Peak office visit if time",   { locationId: "marine_ave" }),
    T("mon", "16:30",  60, "mike_katie", "broll",    "Golden hour · Marine Ave · coastline",         { locationId: "marine_ave", brief: "If weather cooperates." }),
    T("mon", "17:30", 120, "mike_katie", "buffer",   "Back to house · footage dump + logging",      { locationId: "airbnb" }),
    T("mon", "19:30",  30, "mike_katie", "synthesis","Synthesis huddle",                             { locationId: "airbnb" }),
  ],
  tue: [
    // PK + Jen lane (formal sit-downs)
    T("tue", "09:00",  90, "pk_jen", "facility", "Facility walk-through (both teams)",          { locationId: "meridian", brief: "All floors, elevator, grow rooms, packaging.", locked: true }),
    T("tue", "10:30",  45, "pk_jen", "formal",   "Andrew Hand",                                  { locationId: "meridian", interviewId: "andrew_hand", brief: "Cultivation philosophy, genetics DB, Tangerine Dream, Ghosts in the Machine." }),
    T("tue", "11:15",  30, "pk_jen", "formal",   "Braden DeCorby",                               { locationId: "meridian", interviewId: "braden_decorby", brief: "Insulator → touring musician → facility manager." }),
    T("tue", "12:00",  60, "pk_jen", "meal",     "STAFF LUNCH · parking lot (whole company)",    { locationId: "meridian", brief: "Informal. Cameras rolling lightly. Mingle with anyone not on the interview list.", locked: true }),
    T("tue", "13:00",  45, "pk_jen", "formal",   "Josh Rettie",                                  { locationId: "meridian", interviewId: "josh_rettie", brief: "30+ years, 70+ cultivars, genetics database as working tool." }),
    T("tue", "13:45",  30, "pk_jen", "formal",   "Kelly Storm",                                  { locationId: "meridian", interviewId: "kelly_storm", brief: "Sante Veritas → Tilt → Meridian. Banff greenhouse → Aurora → here." }),
    T("tue", "14:45",  45, "pk_jen", "buffer",   "Buffer · notes · prep roundtable",             { locationId: "meridian" }),
    T("tue", "15:30",  30, "both",   "roundtable","Cultivation Roundtable · Josh + Kelly S + Sam", { locationId: "meridian", interviewId: "roundtable", brief: "PK facilitates, Katie films. 30 min.", locked: true }),
    T("tue", "16:15",  75, "pk_jen", "synthesis","Wrap notes + synthesis",                        { locationId: "meridian" }),
    T("tue", "17:30", 120, "pk_jen", "buffer",   "Back to house",                                  { locationId: "airbnb" }),
    T("tue", "19:30",  30, "pk_jen", "synthesis","Synthesis huddle · Day 3 gap list",              { locationId: "airbnb" }),
    // Mike + Katie lane (coverage + shorts)
    T("tue", "09:00",  90, "mike_katie", "facility", "Facility walk-through (both teams)",       { locationId: "meridian", brief: "Katie locks ★ shots. Mike captures room tones.", locked: true }),
    T("tue", "10:30",  45, "mike_katie", "broll",    "Grow-floor portraits · Josh, Kelly S, Sam", { locationId: "meridian", brief: "Hands at work. Tools, scales, lights." }),
    T("tue", "11:15",  45, "mike_katie", "broll",    "Facility coverage · packaging · exterior",  { locationId: "meridian" }),
    T("tue", "12:00",  60, "mike_katie", "meal",     "STAFF LUNCH (cameras rolling lightly)",     { locationId: "meridian", locked: true }),
    T("tue", "13:00",  20, "mike_katie", "short",    "Sam Naso",                                  { locationId: "meridian", interviewId: "sam_naso", brief: "Film at station. Commercial Kush crews, plant intuition." }),
    T("tue", "13:30",  15, "mike_katie", "short",    "Denise Berg",                               { locationId: "meridian", interviewId: "denise_berg", brief: "Partnerships, customer questions, market perception." }),
    T("tue", "13:45",  15, "mike_katie", "short",    "Kelly Brooks",                              { locationId: "meridian", interviewId: "kelly_brooks", brief: "Crop work, PR born/raised. Katie leads." }),
    T("tue", "14:15",  30, "mike_katie", "short",    "Kristian Hansen",                           { locationId: "meridian", interviewId: "kristian_hansen", brief: "Employee #3, compliance, QA, audits." }),
    T("tue", "14:45",  45, "mike_katie", "portrait", "Dave Dowling + Lene Lindstrom (portraits)", { locationId: "meridian", interviewId: "dave_lene", brief: "Film together. JOE TO CLEAR FIRST." }),
    T("tue", "15:30",  30, "mike_katie", "roundtable","Roundtable (filming)",                     { locationId: "meridian", interviewId: "roundtable", locked: true }),
    T("tue", "16:15",  75, "mike_katie", "mots",     "Dispensary visits · exteriors + interiors", { locationId: "dispensary_1", brief: "Budtender conversations where permitted." }),
    T("tue", "17:30", 120, "mike_katie", "buffer",   "Back to house · footage dump",              { locationId: "airbnb" }),
    T("tue", "19:30",  30, "mike_katie", "synthesis","Synthesis huddle",                          { locationId: "airbnb" }),
  ],
  wed: [
    // PK + Jen lane (stories)
    T("wed", "08:00",  30, "pk_jen", "travel",   "Drive south to Brent B (30 min)",            { locationId: "brent_b" }),
    T("wed", "08:30",  60, "pk_jen", "formal",   "Brent B · Wheelchair Weed",                   { locationId: "brent_b", interviewId: "brent_b", brief: "Broader PR cannabis community." }),
    T("wed", "09:30",  30, "pk_jen", "travel",   "Return to city",                               { locationId: "airbnb" }),
    T("wed", "11:00",  20, "pk_jen", "short",    "Wayne Walsh",                                   { locationId: "meridian", interviewId: "wayne_walsh", brief: "The build. What the building fought back on." }),
    T("wed", "12:00",  90, "pk_jen", "meal",     "Lunch · Monks or Forrest (old mill bar)",       { locationId: "forrest", brief: "Joe's rec — cage-fight stories." }),
    T("wed", "13:30",  30, "pk_jen", "formal",   "Powell River Peak",                             { locationId: "prpeak", interviewId: "pr_peak", brief: "How Powell River talks about itself." }),
    T("wed", "14:30",  30, "pk_jen", "formal",   "Dispensary Owner (TBD)",                        { locationId: "dispensary_1", interviewId: "dispensary_tbd", brief: "Retail side, what moves on the shelf." }),
    T("wed", "16:00",  60, "pk_jen", "archival", "Close archival loops · qathet Museum",          { locationId: "museum" }),
    T("wed", "17:30",  60, "pk_jen", "broll",    "★ Mill tour at golden hour (both teams)",       { locationId: "meridian", brief: "Joe arranging access. 1 hr before sunset. Case-study-film moment.", locked: true }),
    T("wed", "19:00",  90, "pk_jen", "meal",     "Dinner · team celebration / reset",             { locationId: "marine_ave" }),
    T("wed", "20:30",  60, "pk_jen", "synthesis","FINAL synthesis · story candidate list",        { locationId: "airbnb", brief: "Interview ranking. 12–15 story candidates. Heart of PR mood doc draft.", locked: true }),
    // Mike + Katie lane
    T("wed", "08:00", 150, "mike_katie", "broll",   "Lund drive · northern coast · Tla'amin B-roll", { locationId: "lund", brief: "Respectful, public areas only." }),
    T("wed", "10:30",  30, "mike_katie", "mots",    "Return · begin MOTS set 2 · Wildwood / Cranberry", { locationId: "wildwood" }),
    T("wed", "11:00",  60, "mike_katie", "mots",    "Continue MOTS · marina",                          { locationId: "marina" }),
    T("wed", "12:00",  90, "mike_katie", "meal",    "Lunch · Monks or Forrest",                         { locationId: "forrest" }),
    T("wed", "13:30",  60, "mike_katie", "mots",    "Continue MOTS · Marine Ave",                       { locationId: "marine_ave", brief: "Target: 30+ total across all 3 days." }),
    T("wed", "14:30",  90, "mike_katie", "broll",   "Dispensary visits · remaining locations",          { locationId: "dispensary_2" }),
    T("wed", "16:00",  60, "mike_katie", "buffer",  "Pre-position · gear check for mill tour",          { locationId: "meridian" }),
    T("wed", "17:30",  60, "mike_katie", "broll",   "★ Mill tour at golden hour",                       { locationId: "meridian", locked: true }),
    T("wed", "19:00",  90, "mike_katie", "meal",    "Dinner · team celebration",                        { locationId: "marine_ave" }),
    T("wed", "20:30",  60, "mike_katie", "synthesis","Final synthesis huddle",                          { locationId: "airbnb", locked: true }),
  ],
  // --- Thursday Apr 30 · Return travel ---
  thu: [
    T("thu", "04:45",  30, "both", "buffer", "Alarms · coffee · final pack",                  { locationId: "airbnb" }),
    T("thu", "05:15",  30, "both", "travel", "Depart Airbnb → Saltery Bay",                    { locationId: "saltery_bay", brief: "Keys per host instructions." }),
    T("thu", "05:45",  40, "both", "buffer", "Saltery Bay terminal · 40-min buffer",           { locationId: "saltery_bay", brief: "Check @BCFerries Wed night AND Thu 4:30 AM for sailing status." }),
    T("thu", "06:25",  50, "both", "travel", "Ferry Saltery Bay → Earls Cove (Route 7)",       { locationId: "earls_cove", brief: "First sailing. Non-reservable. Non-negotiable.", locked: true }),
    T("thu", "07:30", 105, "both", "travel", "Drive Earls Cove → Langdale",                    { locationId: "langdale", brief: "PK voice-memo synthesis en route (1h 45m along Hwy 101)." }),
    T("thu", "09:15",  75, "both", "buffer", "Langdale terminal · 75-min buffer",              { locationId: "langdale" }),
    T("thu", "10:30",  40, "both", "travel", "Ferry Langdale → Horseshoe Bay (Route 3)",       { locationId: "horseshoe_bay", brief: "Reserved — booked online.", locked: true }),
    T("thu", "11:10",  45, "both", "travel", "Drive Horseshoe Bay → YVR",                      { locationId: "yvr" }),
    T("thu", "11:55",  20, "both", "buffer", "Arrive YVR · offload gear",                      { locationId: "yvr" }),
    T("thu", "12:15",  15, "both", "buffer", "Budget rental returned (pre-photograph)",        { locationId: "yvr" }),
    T("thu", "12:30",  60, "both", "buffer", "Check-in · bag drop · security",                 { locationId: "yvr" }),
    T("thu", "13:30",  60, "both", "buffer", "At gate · 60-min buffer",                        { locationId: "yvr" }),
    T("thu", "14:30",  30, "both", "travel", "Flights depart YVR",                              { locationId: "yvr", brief: "AC 116 direct YYZ · Jen via YYZ + YYC. Expected home: PK/Katie/Mike 22:08 ET · Jen 01:51 ET (Fri)." }),
  ],
};

// Action items (editable in the Overview tab).
// `intervieweeId` + `template` let an item become a clickable "Draft intro"
// button that opens Gmail pre-populated.
window.ACTION_ITEMS = [
  { owner: "Joe",  text: "Full-day Tuesday embed",                                          status: "confirmed" },
  { owner: "Joe",  text: "Staff lunch 12–1 PM in parking lot",                              status: "confirmed" },
  { owner: "Joe",  text: "Borrowed vehicle (Joe's Jeep) — insurance + authorized drivers",  status: "in progress" },
  { owner: "Joe",  text: "Mill tour Wed ~1 hr before sunset — messaging mill team",         status: "in progress" },
  { owner: "Joe",  text: "Clear Dave Dowling + Lene Lindstrom for portraits",               status: "pending", intervieweeId: "dave_lene", template: "warm_joe" },
  { owner: "Joe",  text: "Recommend one dispensary owner for Wednesday formal",             status: "pending", intervieweeId: "dispensary_tbd", template: "warm_joe" },
  { owner: "Joe",  text: "Warm intro to Craig Austin & Ewan Moir",                          status: "pending", intervieweeId: "craig_ewan", template: "warm_joe" },
  { owner: "Joe",  text: "Warm intro to Powell River Peak",                                 status: "pending", intervieweeId: "pr_peak",    template: "warm_joe" },
  { owner: "Joe",  text: "Warm intro to River City Coffee ownership",                       status: "pending", intervieweeId: "rivercity",  template: "warm_joe" },
  { owner: "PK",   text: "Reach out to Chris McDonough for Monday late afternoon",          status: "pending", intervieweeId: "chris_mcdonough", template: "cold_pk" },
  { owner: "PK",   text: "Reach out to Brent B for Wednesday 8 AM",                         status: "pending", intervieweeId: "brent_b",    template: "cold_pk" },
  { owner: "PK",   text: "Reach out to Wayne Walsh for Wednesday 11 AM",                    status: "pending", intervieweeId: "wayne_walsh", template: "cold_pk" },
  { owner: "PK",   text: "Schedule Tom Ligocki video call (follow Joe's lead)",             status: "pending", intervieweeId: "tom_ligocki", template: "cold_pk" },
  { owner: "PK",   text: "Tier 2 outreach (dispensary owners, local long-timer, tradespeople)", status: "pending" },
  { owner: "PK",   text: "Book HSB–Langdale ferries (Sun 1:30 PM + Thu 10:30 AM)",           status: "pending" },
  { owner: "PK",   text: "Confirm Sunday Route 7 EC–SB sailing time for Apr 26",             status: "pending" },
];

window.NON_NEGOTIABLES = {
  mon: [
    "Townsite wides + Hulks wides locked (Mike + Katie)",
    "Museum relationship opened, first archival pull done (PK + Jen)",
    "Craig/Ewan interview complete (PK + Jen)",
    "Chris McDonough interview complete (PK + Jen)",
    "First MOTS batch, minimum 10 intercepts (Mike + Katie)",
  ],
  tue: [
    "Facility coverage complete — ★ exterior, elevator, grow floor, hands at work, team portraits",
    "All four formals done — Andrew, Braden, Josh, Kelly Storm",
    "All four shorts done — Sam, Kristian, Denise, Kelly Brooks",
    "Cultivation roundtable recorded",
    "Staff lunch captured, informal footage + connections made",
    "Room tones: sealed grow room, packaging line, office",
  ],
  wed: [
    "Brent B interview complete (PK + Jen)",
    "30+ MOTS total across all three days (Mike + Katie)",
    "Mill tour at sunset, captured (both teams)",
    "12–15 story candidates ranked and listed",
    "Heart of Powell River mood doc in draft (PK)",
  ],
};
