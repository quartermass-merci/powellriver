// WEIRD CORPUS — a field catalogue of UFOs, Sasquatch, hermits, ghosts, and
// local mythology along the Toba Inlet / Powell Lake / Sunshine Coast corridor.
// Cross-referenced from MUFON reports, John Green, Carla Mobley, Peter Byrne,
// Robert C. Belyk, The Peak, Coast Reporter, the Ladysmith–Chemainus Chronicle,
// Paranormal Roadtrippers, qathet Living, and r/Humanoidencounters.

window.WEIRD_LAYERS = {
  sky:       { label: 'The Sky',       sub: 'UFO corridor',             color: '#6B1D1D', glyph: 'ufo'      },
  high:      { label: 'The High Country', sub: 'Sasquatch',              color: '#2B3A2E', glyph: 'print'    },
  lake:      { label: 'The Lake',      sub: 'Hermits · snow surveys',   color: '#44546A', glyph: 'cabin'    },
  valleys:   { label: 'The Lost Valleys', sub: 'Burned homesteads',     color: '#8B5A2B', glyph: 'smoke'    },
  trails:    { label: 'The Trails',    sub: 'Contemporary occult',      color: '#A0462A', glyph: 'eye'      },
  townsite:  { label: 'The Townsite',  sub: 'Haunted heritage',         color: '#6B6B6B', glyph: 'wisp'     },
  strait:    { label: 'The Strait',    sub: 'Passage · isolation',      color: '#3C3C3C', glyph: 'compass'  },
};

window.WEIRD_EVENTS = [
  // ——— Layer 1 · THE SKY ———
  {
    id: 'ufo-powell-1978', layer: 'sky', kind: 'UFO',
    title: 'The rainbow pulse',
    date: 'Sept 15, 1978',
    lat: 49.8700, lng: -124.5300,
    place: 'Powell River',
    summary: 'A logger and pilot woke to a rhythmic buzz cycling through every colour in the spectrum, steady white at its peak. Heavy fog obscured the craft.',
    story: 'A logger who held a pilot certificate and his partner woke in the night to a rhythmic pulsing buzz that cycled through the full colour spectrum, settling on a steady white at each peak. Heavy fog obscured any direct view. The object lifted to the northwest over the trees. The primary witness reported long-term aftereffects — small lesions at the temples and repeated 3 a.m. sleep disruption for years afterward.',
    source: 'MUFON case report',
  },
  {
    id: 'ufo-malaspina-undated', layer: 'sky', kind: 'UFO',
    title: 'Hummingbird over the channel',
    date: 'Undated · late 20th c.',
    lat: 49.6700, lng: -124.4700,
    place: 'Malaspina Channel / Texada Island',
    summary: 'An ex–Air Canada airport worker watched a glowing ball with a tube appendage dart over the channel for forty-five minutes.',
    story: 'An ex–Air Canada airport worker observed what first read as a bright "star-like" object hovering and darting "like a hummingbird" over Malaspina Channel toward Texada Island. Binoculars revealed a glowing ball with a tube appendage and a smaller ball attached to it. The witness watched for roughly forty-five minutes.',
    source: 'MUFON case report',
  },
  {
    id: 'ufo-texada-1999', layer: 'sky', kind: 'UFO',
    title: 'Grief Point schoolchildren',
    date: 'March–April 1999',
    lat: 49.6500, lng: -124.5100,
    place: 'Texada Island, seen from Grief Point',
    summary: 'Grade 3/4 students logged ten sightings of coloured flashing lights over Texada. CFB Comox attributed them to Aurora patrols.',
    story: 'Starting March 24, 1999, Grade 3/4 students Carmen Anderson and Eden Carlsen saw coloured flashing lights from Eden\'s home overlooking Texada. It was the first of roughly ten sightings across three weeks. By April 14 it was a schoolyard event — multiple students at Grief Point Elementary watching the lights around 9:30 p.m. CFB Comox attributed them to Aurora maritime patrol aircraft. The kids were unconvinced.',
    source: 'The Peak, May 1, 1999',
  },

  // ——— Layer 2 · THE HIGH COUNTRY ———
  {
    id: 'sasq-ostman-1924', layer: 'high', kind: 'CRYPTID',
    title: 'Ostman taken in his sleeping bag',
    date: '1924',
    lat: 50.5000, lng: -124.7000,
    place: 'Head of Toba Inlet, northeast into the basin',
    summary: 'Swedish prospector Albert Ostman was carried off in his sleeping bag and held for six days by a family of four Sasquatch. Escaped by feeding the old man a full tin of snuff.',
    story: 'Albert Ostman took the Union Steamship from Vancouver up to Lund in 1924, hired an elderly Indigenous guide to the head of Toba Inlet, and went northeast looking for a lost mine. His camp was disturbed three nights running — prunes, pancake flour, and shells missing; the salt untouched. On the fourth night he was picked up in his sleeping bag and carried for about three hours by an eight-foot male Sasquatch into a small basin valley with a V-shaped opening. He was held six days with a family of four: the old man, a seven-foot-plus female, a seven-foot young male, and a flat-chested young female. He escaped by feeding the old man a full tin of snuff, then worked his way south past Mt. Baker, down to Sechelt Inlet, and caught the Union Boat back to Vancouver. He told no one until 1957. His account was taken under the Canadian Evidence Act. Police magistrate A.M. Naismith cross-examined him and found no flaw. He told Queen Elizabeth II in 1959. He died Jan 16, 1975.',
    source: 'John Green, Sasquatch: The Apes Among Us (Hancock House, 1978)',
  },
  {
    id: 'sasq-reddit', layer: 'high', kind: 'CRYPTID',
    title: 'Roadside, near town',
    date: 'Undated · recent',
    lat: 49.8600, lng: -124.5500,
    place: 'Powell River roadside',
    summary: 'A local on r/Humanoidencounters: "My sister and I swear we saw a Sasquatch cross the road one evening when we were out driving."',
    story: 'An anonymous Powell River commenter on r/Humanoidencounters: "My sister and I swear we saw a Sasquatch cross the road one evening when we were out driving." They frame it the way locals do — isolated small town, lots of forest, you see things. Unverified, native-voice, low evidentiary weight, but it\'s the contemporary thread on the same old rope.',
    source: 'Reddit r/Humanoidencounters',
  },

  // ——— Layer 3 · THE LAKE ———
  {
    id: 'lake-hudemka', layer: 'lake', kind: 'HERMIT',
    title: 'Nick Hudemka\'s cabins',
    date: 'Mid–late 20th c.',
    lat: 49.9000, lng: -124.4800,
    place: 'Multiple cabins around Powell Lake',
    summary: 'Hudemka logged, trapped, and hunted; built a cabin with root gardens at the head of the lake; later lived on a float cabin at Second Narrows with the loons and bears.',
    story: 'Nick Hudemka kept a handful of cabins around Powell Lake. He logged, trapped, and hunted out of them. One cabin, at the head of the lake, had root gardens and a root cellar. Later he lived on a float cabin at Second Narrows, preferring, as he put it, the wilderness, the call of the loons, the bears and the eagles.',
    source: 'Carla Mobley, Mysterious Powell Lake (Hancock House, 1984)',
  },
  {
    id: 'lake-snow-cabin', layer: 'lake', kind: 'RITUAL',
    title: 'The snow cabin at 3,000 feet',
    date: 'Late 1930s–present',
    lat: 50.0200, lng: -124.4500,
    place: 'Head of Powell Lake, above the treeline',
    summary: 'A yellow-cedar cabin built in the late 1930s so Powell River Mill crews could read the snowpack every winter. Still standing.',
    story: 'The mill sent crews up to the head of the lake every winter to measure the snowpack. The yellow-cedar cabin built for them in the late 1930s is still standing at three thousand feet. A lower cabin on the northeast shore remains usable in emergencies. Ritual dressed as labour — the company reading the sky through the ground, year after year.',
    source: 'Mobley (1984)',
  },

  // ——— Layer 4 · LOST VALLEYS ———
  {
    id: 'valley-olsen-1972', layer: 'valleys', kind: 'WEIRD',
    title: 'Olsen Valley burned',
    date: '1972',
    lat: 50.0000, lng: -124.6500,
    place: 'Between Powell Lake and Theodosia Inlet',
    summary: 'The fertile valley between the lake and Theodosia had homesteads, a post office, a schoolhouse. Most of it was burned to keep the hippies from moving in.',
    story: 'Olsen Valley sits between Powell Lake and Theodosia Inlet. It had homesteads, a post office, a schoolhouse. Produce went to the logging camps and into Powell River. In 1972 most of the buildings were deliberately burned to prevent hippies from moving in — the descendants of pioneers torching their own heritage to keep the counterculture out. The Rolandi/Harper cabin was partially standing as of Mobley\'s 1984 account. A large cement-and-rock foundation still sits beside Olsen Creek.',
    source: 'Mobley (1984)',
  },
  {
    id: 'valley-palmer', layer: 'valleys', kind: 'RUIN',
    title: 'Palmer Ranch · Rupert\'s Farm',
    date: 'Early 20th c.',
    lat: 50.0200, lng: -124.6800,
    place: 'Theodosia Inlet',
    summary: 'Forty-acre cattle ranch at Theodosia Inlet. Structures and rusting vehicles still present.',
    story: 'Forty acres of cattle ranch at the head of Theodosia Inlet. Structures and the rusting bodies of old vehicles are still present, returning slowly to the alders.',
    source: 'Mobley (1984)',
  },

  // ——— Layer 5 · TRAILS ———
  {
    id: 'trail-cult-recent', layer: 'trails', kind: 'CULT',
    title: 'The hiking-trail pamphleteer',
    date: '2024–2025 · spring',
    lat: 49.8750, lng: -124.5800,
    place: 'A Powell River hiking trail, pre-season Tuesday',
    summary: 'An Argentinian man and a younger Japanese woman gave a couple a booklet. Its final page listed personal data to collect on each recipient — all of which the narrator had already volunteered on the trail.',
    story: 'A couple hiking near Powell River met an Argentinian man and a younger Japanese woman on a pre-season Tuesday. Long conversation: environment, travel, capitalism. The narrator\'s partner said nothing throughout and told them later she hadn\'t liked him. The man gave the narrator a photocopied booklet and invited them to an art show Friday. Inside: more than a hundred rules written from the point of view of an alien observing humanity. Syncretist doctrine stitching Christianity, Islam, and Judaism together with portal gates and higher dimensions. Instructions for an "Ultimate Sacrifice" collective suicide pact. Bank-accounts-in-leader\'s-name directives. The final page was an instruction manual for the distributor: a checklist of personal intelligence to collect on each recipient — name, age, address, occupation — every data point the narrator had already volunteered on the trail. They burned the booklet. They didn\'t go to the art show.',
    source: 'Reddit (anonymous, unverified)',
  },

  // ——— Layer 6 · THE TOWNSITE ———
  {
    id: 'ghost-patricia', layer: 'townsite', kind: 'GHOST',
    title: 'Patricia Theatre',
    date: '1913–present',
    lat: 49.8793, lng: -124.5497,
    place: 'Ash Avenue, Townsite',
    summary: 'Canada\'s oldest continuously operating movie theatre. The man in white, the old owner in his vest, curtains that open themselves.',
    story: 'The Patricia opened in 1913 across from the Rodmay Hotel and moved to its current Ash Avenue home in November 1928 — a Spanish revival building by Vancouver architect Henry Holdsby Simmonds. Dr. Samuel Paul Marlatt, the army dentist who practised upstairs from 1928 to 1956 and refused anaesthesia to children, is the man in white. Myron McCleod, the long-time owner who died in 1994, has been seen as an older bespectacled figure in a vest, smiling, thumbs in his pockets. During late-90s restoration, contractor Dan Kressel was pushed down a concrete staircase by an unseen force. Doors locked themselves and slammed hard enough to knock plaster off walls. A flashlight clicked off in his hand in a dark stairwell. Velvet screen curtains opened on their own with hands visibly pressing through from behind. A medium on site identified a child named Natalie following a TV reporter through the building. Kressel quit the job.',
    source: 'Belyk, Ghosts: More Eerie Encounters (2006) · Paranormal Roadtrippers (2023) · Ghostly Activities blog',
  },
  {
    id: 'ghost-courthouse', layer: 'townsite', kind: 'GHOST',
    title: 'Old Courthouse Inn',
    date: '1938–present',
    lat: 49.8795, lng: -124.5510,
    place: 'Townsite · former Provincial Building',
    summary: 'Leo the child prankster in Room 1. A rosewater-scented woman. Piano from the hallway. Necklaces tied in slipknots by unseen hands in Room 6.',
    story: 'Built 1938–39 as the Provincial Building — courtroom, jail, police station, forestry offices. Government services moved out in 1974. It became a hotel in 1997 under owner Kelly Belanger. The resident cast: Leo, a child prankster in Room 1; a rosewater-scented woman in the former clerical office (now the restaurant); a portly male, unnamed; a piano-playing woman in the hallway; a cherry-tobacco pipe smoker by the stairs. Hot rooms are 1, 3, 6, and 9. In Room 3 (the former police station) a guest on a phone call heard a loud male voice say "shut up" through her earpiece — the friend on the other end heard nothing. Room 6: Debra James left her necklaces on the bedside table, went to dinner, and came back to find two of them tied in intricate slipknots. She later watched the corner of the bedsheet lift on its own from both sides. A hand brushed her face. At the April 2023 investigation weekend, Kelly Belanger heard the voice of a recently-deceased friend through the EVP headset reference something only the two of them had privately discussed. He tore the headset off and left the room.',
    source: 'qathet Living, March 2023 · Paranormal Roadtrippers',
  },

  // ——— Layer 7 · THE STRAIT (decorative anchor, narrative connective tissue) ———
  {
    id: 'strait-passage', layer: 'strait', kind: 'PASSAGE',
    title: 'The corridor',
    date: '1790s–present',
    lat: 49.7000, lng: -124.3000,
    place: 'Strait of Georgia · Malaspina Channel · Sunshine Coast corridor',
    summary: 'Not a phenomenon. The connective tissue. Every other layer is reached by water.',
    story: 'Every other layer of the weird corpus is accessed through the water. Ostman arrived by Union Steamship to Lund. The UFO sightings track northwest along the corridor. The Sunshine Coast is defined by its ferry connection. The Conuma River and Sechelt Inlet bookend the Sasquatch canon. Fog, silence, and isolation are the corridor\'s default conditions. The Powell River weird doesn\'t announce itself — it arrives quietly, by water, from somewhere you can\'t quite see.',
    source: 'Connective tissue across all layers',
  },
];

// Simple decade grouping for the timeline strip
window.WEIRD_TIMELINE_DECADES = ['1920s','1930s','1940s','1950s','1960s','1970s','1980s','1990s','2000s','2010s','2020s'];
