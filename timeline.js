// ─── Scale ───────────────────────────────────────────────────────────────────
// Eras can be collapsed to COLLAPSED_PX. Fourth Age has two density segments.
//   era-1  -2000→-750 (1250 yrs) 2 px/yr   = 2 500 px  (sparse — few events)
//   era-1  -750→-500  (250 yrs)  8 px/yr   = 2 000 px
//   era-2  -500→-100  (400 yrs)  8 px/yr   = 3 200 px
//   era-3  -100→   0  (100 yrs)  8 px/yr   =   800 px
//   era-4     0→ 250  (250 yrs) 20 px/yr   = 5 000 px
//   era-4   250→ 260  ( 10 yrs) 600 px/yr  = 6 000 px
// + 100 px left-margin + 100 px right-margin → default 17 200 px total

const TRACK_OFFSET = 100;  // px left margin before year -750
const COLLAPSED_PX = 60;   // width of a collapsed era
const collapsedEras = new Set();

const ERAS = [
  { id: 'era-1', start: -750, end: -500, label: 'First Age'  },
  { id: 'era-2', start: -500, end: -100, label: 'Second Age' },
  { id: 'era-3', start: -100, end:    0, label: 'Third Age'  },
  { id: 'era-4', start:    0, end:  250, label: 'Fourth Age (Age of Man)' },
  { id: 'era-5', start:  250, end:  260, label: 'War of Solana' },
];

const SEGMENTS = [
  { eraId: 'era-1', start:  -750, end: -500, pxPerYr:   3 },
  { eraId: 'era-2', start: -500, end: -100, pxPerYr:   3 },
  { eraId: 'era-3', start: -100, end:    0, pxPerYr:   8 },
  { eraId: 'era-4', start:    0, end:  250, pxPerYr:  20 },
  { eraId: 'era-5', start:  250, end:  260, pxPerYr: 600 },
];

function yearToX(year) {
  let x = TRACK_OFFSET;
  for (const era of ERAS) {
    if (year <= era.start) break;
    if (collapsedEras.has(era.id)) {
      if (year >= era.end) { x += COLLAPSED_PX; continue; }
      x += COLLAPSED_PX / 2; break;
    }
    const segs = SEGMENTS.filter(s => s.eraId === era.id);
    if (year >= era.end) {
      segs.forEach(s => { x += (s.end - s.start) * s.pxPerYr; });
    } else {
      for (const seg of segs) {
        if (year <= seg.start) break;
        if (year >= seg.end) x += (seg.end - seg.start) * seg.pxPerYr;
        else                 { x += (year - seg.start) * seg.pxPerYr; break; }
      }
      break;
    }
  }
  return x;
}

function yearToAgeLabel(year) {
  const ages = [
    { start: -750, ageNum: 1 },
    { start: -500, ageNum: 2 },
    { start: -100, ageNum: 3 },
    { start:    0, ageNum: 4 },
  ];
  let currentAge = ages[0];
  for (const age of ages) {
    if (year >= age.start) currentAge = age;
    else break;
  }
  const raw = year - currentAge.start + 1;
  const displayYear = Number.isInteger(year) ? raw : parseFloat(raw.toFixed(1));
  return `${displayYear} ${currentAge.ageNum}A`;
}

function computeTrackWidth() {
  let w = TRACK_OFFSET + 100; // left + right margin
  for (const era of ERAS) {
    if (collapsedEras.has(era.id)) { w += COLLAPSED_PX; continue; }
    SEGMENTS.filter(s => s.eraId === era.id)
            .forEach(s => { w += (s.end - s.start) * s.pxPerYr; });
  }
  return w;
}

let TRACK_WIDTH = computeTrackWidth();

// ─── World / historical events ────────────────────────────────────────────────
const WORLD_EVENTS = [
    { year: -750,   type: 'age',  label: 'First Age Begins'                                                                                                 },
    { year:    -750, label: 'Humans appear on Rathe'},
    { year:  -700, label: 'Volcor is founded??'},
    { year: -500,   type: 'age',  label: 'First Age Ends?\nSecond Age Begins?'                                                                                                         },
    { year: -400,                 label: 'Ikaru founded'                                                                                                                             },
    { year: -100,   type: 'age',  label: 'Second Age Ends?\nThird Age begins?\n'                                                                                         },
    { year: -100,                 label: 'The First Grand Magister, the Devout, leads Solana'                                                                                        },
    { year:  -60,                 label: 'Valahai is founded'                                                                                      },
    { year:  -25,                 label: 'The Devout becomes the Apostate and leaves Solana\nDemonastery founded'                                                                                               },
    { year:  -25,                 label: 'The Second Grand Magister, the Adamant, leads Solana'                                                                                      },  
    { year:    0,   type: 'age',  label: 'End of Third Age\nFourth Age begins'                                                                                          },
    { year:    0, label: 'War of the Ancients ends'},
    { year:    0, label: 'Rathe, i’Arathael, and the Nebulus rift split apart'  },
    { year:    0, label: 'Ikaru Falls',           below: true },
    { year:    0, label: 'Isen Falls',            below: true },
    { year:    0, label: 'Aldengrove Falls',      below: true },
    { year:    0, label: 'Dhani Empire Falls?',   below: true },
    { year:  25,                 label: 'The Apostate sacrifices himself to hide the Demonastery from Solana, in the nebulus rift'                                                                                      },  
    { year:  50,                  label: 'The Third Grand Magister, the Radiant, leads Solana?'                                                                                       },
    { year:  50, label: 'Metrix is founded?',        below: true },
    { year:  40, label: 'The Pits start to form?',  below: true },
    { year:  100, label: 'Anarch Zeir Jorunies to the deepest recesses of the Pits??'},
    { year:  103, label: 'L’Apocalypta is founded??'},
    { year:  125,                 label: 'The Fourth Grand Magister, the Beloved, leads Solana?'                                                                                      },
    { year:  180, label: 'Piper\'s Pier is founded?'},
    { year:  200,                 label: 'The Fifth Grand Magister, the Steadfast, leads Solana'                                                                                     },
    { year:  220, label: 'Hamilton Scarborough expedition into the Savage Lands??'                                                                                                                             },
    { year:  230, label: 'Volcore Civil War?'},
    {  year: 247,  label: 'Viserai opens the Vitate gateway to i’Arathael', convergence: true                                                                                                      },
    { year:  250,   type: 'age',  label: 'War for Solana begins'                                                                                                                     },
    { year:  250.6,               label: 'Grand Everfest — Secrets of Aria\nHeroes gather across Aria',                                                            convergence: true },
    { year:  252,                 label: 'Rathe unites against the Demonastery Invasion',                                                                          convergence: true },
    { year:  252.3,               label: 'Bright Lights — Metrix \nMultiple fates converge',                                                                       convergence: true },
    { year:  252.6,               label: 'The Deathmatch Arena',                                                                   convergence: true },
    { year:  253.3,               label: 'The Queen of Candlehold, Calvera, dies\n Candlehold opens to Aria for the first time',                                                                   convergence: true },
];



// ─── Card sets ────────────────────────────────────────────────────────────────
const SETS = [
  { year: 0,     label: 'Mastery Pack Guardian',  short: 'MPG', img: 'assets/mpg.png' },
  { year: 250,   label: 'Welcome to Rathe',       short: 'WTR', img: 'assets/wtr.png' },
  { year: 250,   label: 'Arcane Rising',          short: 'ARC', img: 'assets/arc.png' },
  { year: 250,   label: 'Crucible of War',        short: 'CRU', img: 'assets/cru.png' },
  { year: 250.3, label: 'Monarch',                short: 'MON', img: 'assets/mon.png' },
  { year: 250.3, label: 'Tales of Aria',          short: 'ELE', img: 'assets/ele.png' },
  { year: 250.6, label: 'Everfest',               short: 'EVR', img: 'assets/evr.png' },
  { year: 251.0, label: 'Uprising',               short: 'UPR', img: 'assets/upr.png' },
  { year: 251.3, label: 'Dynasty',                short: 'DYN', img: 'assets/dyn.png' },
  { year: 251.6, label: 'Outsiders',              short: 'OUT', img: 'assets/out.png' },
  { year: 252.0, label: 'Dusk Till Dawn',         short: 'DTD', img: 'assets/dtd.png' },
  { year: 252.3, label: 'Bright Lights',          short: 'EVO', img: 'assets/evo.png' },
  { year: 252.6, label: 'Heavy Hitters',          short: 'HVY', img: 'assets/hvy.png' },
  { year: 253.0, label: 'Part the Mistveil',      short: 'MST', img: 'assets/mst.png' },
  { year: 253.3, label: 'Rosetta',                short: 'ROS', img: 'assets/ros.png' },
  { year: 253.6, label: 'The Hunted',             short: 'HNT', img: 'assets/hnt.png' },
  { year: 254.0, label: 'High Seas',              short: 'SEA', img: 'assets/sea.png' },
  { year: 254.3, label: 'Super Slam',             short: 'SUP', img: 'assets/sup.png' },
  { year: 254.6, label: 'Omens of the Third Age', short: 'OMN', img: 'assets/omn.png' },
];

// ─── Heroes ───────────────────────────────────────────────────────────────────
// color = hero lane accent; events sorted oldest → newest
// {year:, label:'', url: ''}
const HEROES = [
  {
    id: 'arakni-huntsman', name: 'Arakni, Huntsman', class: ['Assassin'], talent:['None'], region: 'The Pits',
    color: '#6b7280',
    description: 'Once a test subject of the South Maw Asylum, now a professional assassin',
    events: [
      { year: 244, label:'Patient 1413 is discovered by Dr Krest Mortimer', url: 'https://legendarystories.net/main-story/outsiders/the-iconoclast-trials.html'},
      { year: 250, label:'Patient 1413 escapes', url: 'https://legendarystories.net/main-story/outsiders/the-iconoclast-trials.html'},
      {year: 251.3, label:'Arakni assassinates the Emperor of Volcor', url: 'https://legendarystories.net/main-story/dynasty/the-blood-stained-web.html'},
      { year: 251.6, label: 'Arakni Returns to the Pits, and discovers the assassination was a trap', url: 'https://legendarystories.net/main-story/outsiders/the-spiders-trap.html' },
      { year: 253.6, label: 'Arakni is hunted across Rathe', url: 'https://legendarystories.net/main-story/the-hunted/children-of-chaos.html'},
    ],
  },
  {
    id: 'arakni-marionette', name: 'Arakni, Mariontte', class: ['Assassin'], talent:['Chaos'], region: 'The Pits',
    color: '#6b7280',
    description: 'A brood of professional assassins',
    events: [
      { year: 253.6, label: 'Arakni is hunted across Rathe', url: 'https://legendarystories.net/main-story/the-hunted/children-of-chaos.html'},
    ],
  },
  {
    id: 'arakni-crack', name: 'Arakni, Slipped through the Crack', class: ['Assassin'], talent:['Chaos'], region: 'The Pits',
    color: '#6b7280',
    description: 'Once a experiment in the South Maw Asylum, now a member of the brood',
    events: [
       { year: 253.6, label: 'Arakni is hunted across Rathe', url: 'https://legendarystories.net/main-story/the-hunted/children-of-chaos.html'},
    ],
  },
  {
    id: 'aurora', name: 'Aurora, Shooting Star', class: ['Runeblade'], talent:['Elemental', 'lightning'], region: 'Aria',
    color: '#a3e635',
    description: 'A rambunctious wayfarer with a thirst for adventure',
    events: [
      { year: 253.3, label: 'Aurora, Shooting Star explores Aria\'s vaults and discovers Oscilio', url: 'https://legendarystories.net/main-story/rosetta/secret-of-the-aetherscribes.html' },
      { year: 254.6, label: 'Aurora and Oscilio fight against the Omens', url: 'https://legendarystories.net/main-story/omens-of-the-third-age/omens-in-the-sky.html' },
    ],
  },
  {
    id: 'azalea', name: 'Azalea', class: ['Ranger'], talent:['None'], region: 'The Pits',
    color: '#68d391',
    description: 'A skilled ranger from the depths of the Pits',
    events: [
      { year: 241, label: 'Azalea\'s origin begins — child of ~10 years', url: 'https://legendarystories.net/main-story/arcane-rising/slings-and-arrows.html' },
      { year: 249, label: 'Azalea — grown professional assassin with contacts', url: 'https://legendarystories.net/main-story/arcane-rising/cards-on-the-table.html' }
    ],
  },
  {
    id: 'benji', name: 'Benji, The Piercing Wind', class: ['Ninja'], talent:['None'], region: 'Misteria',
    color: '#a78bfa',
    description: 'A nimble and elusive ninja from the realm of Misteria',
    events: [
      { year: 251.6, label: 'Benji travels Misteria', url: 'https://legendarystories.net/main-story/arcane-rising/a-bird-in-the-hand.html' },
    ],
  },
  {
    id: 'betsy', name: 'Betsy, Skin in the Game', class: ['Guardian'], talent:['None'], region: 'Deathmatch Arena',
    color: '#9b2335',
    description: 'A brawler with a thirst for gambling and a knack for winning, Betsy is a fan favorite in the Deathmatch Arena',
    events: [
      { year: 252.6, label: 'Betsy dominates the Deathmatch Arena', url: 'https://legendarystories.net/main-story/heavy-hitters/arena-announcements.html'},
      { year: 254.3, label: 'Betsy remains in the Deathmatch Arena', url: 'https://legendarystories.net/main-story/super-slam/feudmasters.html'},
    ],
  },
  {
    id: 'boltyn', name: 'Boltyn', class: ['Warrior'], talent:['Light'], region: 'Solana',
    color: '#ffd700',
    description: 'A warrior from the Northern Realms with a strong sense of duty',
    events: [
      {year: 220, label: 'Boltyn born in the Northern Realms', url: 'https://legendarystories.net/main-story/monarch/sworn-to-protect.html' },
      {year: 241, label: 'Boltyn marries Erina', url: 'https://legendarystories.net/main-story/monarch/sworn-to-protect.html' },
      {year: 245, label: 'Aeos is born', url: 'https://legendarystories.net/main-story/monarch/sworn-to-protect.html' },
      {year: 246, label: 'Erina Dies', url: 'https://legendarystories.net/main-story/monarch/sworn-to-protect.html', death: true },
      { year:  250, label: 'Boltyn Stands against the Shadow', url:''},
      {year: 251.3, label: 'Bolyn recieves Shiyana', url: 'https://legendarystories.net/main-story/outsiders/tidings-in-the-light.html' },
      {year: 252, label: 'Heros fights against the shadow', url: 'https://legendarystories.net/main-story/dusk-till-dawn/unity-in-light.html' },
      {year:254.45, label: 'The war rages on', url: 'https://legendarystories.net/main-story/compendium-of-rathe/vow-unbroken.html'}
    ],
  },
  {
    id: 'bravo', name: 'Bravo, Showstopper', class: ['Guardian'], talent:['Elemental', 'None'], region: 'Aria',
    color: '#4299e1',
    description: 'Leader of the ',
    events: [
      { year: 235, label: 'Bravo begins as a carnival performer', url: 'https://legendarystories.net/main-story/welcome-to-rathe/a-rising-star.html' },
      { year: 245, label: 'Bravo Fights back the encroching darkness', url: 'https://legendarystories.net/main-story/welcome-to-rathe/a-rising-star.html'},
      { year: 250.6, label: 'Stars at the grand Everfest carnival' },
      {year: 252, label: 'Heros fights against the shadow', url: 'https://legendarystories.net/main-story/dusk-till-dawn/unity-in-light.html' },
    ],
  },
  {
    id: 'brevant', name: 'Brevant, Civic Protector', class: ['Guardian'], talent:['None'], region: 'Solana',
    color: '#c9a227',
    description: '',
    events: [
      { year: 249, label: 'Brevant patrols Solana\'s borders', url: 'https://legendarystories.net/short-stories/round-the-table/brevant-civic-protector.html' },
    ],
  },
  {
    id: 'briar', name: 'Briar, Warden of Thorns', class: ['Runeblade'], talent:['Elemental'], region: 'Aria',
    color: '#16a34a',
    description: '',
    events: [
      {year: 105, label: 'Briar is born', url: 'https://legendarystories.net/main-story/tales-of-aria/amongst-the-brambles.html'},
      { year: 250.3, label: 'Briar ventures out of Candlehold into Aria', url: 'https://legendarystories.net/main-story/tales-of-aria/amongst-the-brambles.html' },
      { year: 250.6, label: 'Briar joins Lexi to discover the secrets of Aria', url: 'https://legendarystories.net/main-story/everfest/a-grand-adventure.html' },
      {year: 252, label: 'Heros fights against the shadow', url: 'https://legendarystories.net/main-story/dusk-till-dawn/unity-in-light.html' },
      {year:254.45, label: 'The war rages on', url: 'https://legendarystories.net/main-story/compendium-of-rathe/vow-unbroken.html'}
    ],
  },
  {
    id: 'chane', name: 'Chane', class: ['Shadow Runeblade'], talent:['Shadow'], region: 'Demonastery',
    color: '#805ad5',
    description: '',
    events: [
      { year: 247,  label: 'Chane Enters  íArathael, and finds Ursur', url: 'https://legendarystories.net/main-story/monarch/emissary-of-the-void.html'},
      { year:  249, label: 'Chane finds Levia and teams up to fight Solana', url: 'https://legendarystories.net/main-story/monarch/harbinger-of-the-abyss.html' },
    ],
  },
  {
    id: 'cindra', name: 'Cindra, Dracai of Retribution', class: ['Ninja'], talent:['Draconic'], region: 'Volcor',
    color: '#ef4444',
    description: '',
    events: [
      { year: 253.6, label: 'Cindra pursues the Dynasty\'s betrayers', url: 'https://legendarystories.net/main-story/the-hunted/mark-of-a-traitor.html' },
    ],
  },
  {
    id: 'dash', name: 'Dash', class: ['Mechanologist'], talent:['None'], region: 'Metrix',
    color: '#00d4ff',
    description: '',
    events: [
      { year: 247,  label: 'Teenage inventor in Metrix', url: 'https://legendarystories.net/main-story/arcane-rising/stroke-of-genius.html', noConvergence: true },
      { year: 252.3, label: 'Dash joins forces with Maxx Nitro and discovers Data Doll', url: 'https://legendarystories.net/main-story/bright-lights/synthetic-futures.html'},
      { year: 254, label: 'Dash attempts to show off an invention for Teklo Industries', url: 'https://legendarystories.net/main-story/armory-decks/boom-town-boom.html'}
    ],
  },
  {
    id: 'data-doll', name: 'Data Doll MKII', class: ['Mechanologist'], talent:['None'], region: 'Metrix',
    color: '#48cae4',
    description: '',
    events: [
      { year: 252.3, label: 'Data Doll MKII operational in Metrix' },
      { year: 252.3, label: 'Dash joins forces with Maxx Nitro and discovers Data Doll', url: 'https://legendarystories.net/main-story/bright-lights/synthetic-futures.html'}
    ],
  },
  {
    id: 'dorinthea', name: 'Dorinthea Ironsong', class: ['Warrior'], talent:['None'], region: 'Solana',
    color: '#f6e05e',
    description: '',
    events: [
      { year: 230, label: 'Dorinthea is chosen by Sol to become a Warrior', url: 'https://legendarystories.net/main-story/welcome-to-rathe/pride-of-the-ironsongs.html' },
      { year: 240, label: 'Dorinthea is a squire for the hand of Sol', url: 'https://legendarystories.net/main-story/welcome-to-rathe/pride-of-the-ironsongs.html' },
      { year: 250, label: 'Dorinthea is at the initall invasion of the Demonastery', url: 'https://legendarystories.net/main-story/crucible-of-war/no-smoke-without-fire.html' },
      { year:  252, label: 'Morlok Hill', url: 'https://legendarystories.net/main-story/interlude/morlock-hill.html' },
      { year: 252, label: 'Heros fights against the shadow', url: 'https://legendarystories.net/main-story/dusk-till-dawn/unity-in-light.html' },
    ],
  },
  {
    id: 'dromai', name: 'Dromai, Ash Artist', class: ['Illusionist'], talent:['Draconic'], region: 'Volcor',
    color: '#c2410c',
    description: '',
    events: [
      { year: 241, label: 'Dromai is taken from her village' },
      { year: 251, label: 'Dromai, Fights on the front lines of the Emperor\'s army', url: 'https://legendarystories.net/main-story/uprising/dragons-of-empire.html'},
      { year: 251.3, label: 'Dromai witnesses the fall of the Emperor', url: 'https://legendarystories.net/main-story/dynasty/ember-in-the-ash.html'},
    ],
  },
  {
    id: 'emperor', name: 'Emperor, Dracai of Aesir', class: ['Wizard','Warrior'], talent:['Draconic'], region: 'Volcor',
    color: '#b45309',
    description: '',
    events: [
      { year: 230, label: 'The Emperor communes with the Asier of Flames', url: 'https://legendarystories.net/main-story/dynasty/emperor-the-one-emperor.html' },
      { year: 251.3, label: 'The Emperor is assassinated', url: 'https://legendarystories.net/main-story/dynasty/ember-in-the-ash.html', death: true },
    ],
  },
  {
    id: 'enigma', name: 'Enigma', class: ['Illusionist'], talent:['Mystic'], region: 'Misteria',
    color: '#1d4ed8',
    description: '',
    events: [
       { year: -500, label: 'Fumei amd Nuu study together at the Imortal Lunar Shrine', url: 'https://legendarystories.net/main-story/part-the-mistveil/part-4-the-hare-and-the-snake.html'},
       { year: 254, label: 'Enigma hunts down the evil spirit Nuu', url: 'https://legendarystories.net/main-story/part-the-mistveil/part-2-the-tapestry-unfolds.html'},
    ],
  },
  {
    id: 'fai', name: 'Fai, Rising Rebellion', class: ['Ninja'], talent:['Draconic'], region: 'Volcor',
    color: '#fb923c',
    description: '',
    events: [
      { year: 241, label: 'Fai\'s village is burnt down' },
      { year: 251, label: 'Fai fights for the Rising Rebellion', url: 'https://legendarystories.net/main-story/uprising/fires-of-rebellion.html'},
    ],
  },
  {
    id: 'fang', name: 'Fang, Dracai of Blades', class: ['Warrior'], talent:['Draconic'], region: 'Volcor',
    color: '#dc2626',
    description: '',
    events: [
      { year: 253.6, label: 'Fang pursues the Dynasty\'s betrayers', url: 'https://legendarystories.net/main-story/the-hunted/mark-of-a-traitor.html' },
    ],
  },
  {
    id: 'florian', name: 'Florian, Rotwood Harbinger', class: ['Runeblade'], talent:['Elemental'], region: 'Aria',
    color: '#15803d',
    description: '',
    events: [
      { year: 253.3, label: 'Florian and Verdance clash for the future of Candlehold', url:"https://legendarystories.net/main-story/rosetta/roots-of-change.html" },
    ],
  },
  {
    id: 'frankie', name: 'Frankie Baggins', class: ['Necromancer'], talent:['None'], region: '',
    color: '#4b5563',
    description: '',
    events: [
    ],
  },
  {
    id: 'genis', name: 'Genis Wotchuneed', class: ['Merchant'], talent:['None'], region: 'Aria',
    color: '#34d399',
    description: '',
    events: [
      { year: 250.6, label: 'Genis spreads his wares across the Everfest in Aria' },
    ],
  },
  {
    id: 'gravy-bones', name: 'Gravy Bones, Shipwrecked Looter', class: ['pirate','Necromancer'], talent:['None'], region: 'High Seas',
    color: '#4b5563',
    description: '',
    events: [
      { year: null, label: 'Gravy Bones\'s origin is raised from the dead by Nocetes' },
      { year: 254, label: 'Gravy Bones searchs for the lost city of Trapl Dahni', url: 'https://legendarystories.net/main-story/high-seas/captain-bones-and-the-city-of-gold.html' },
    ],
  },
  {
    id: 'hala', name: 'Hala, Bladesaint of the Vow', class: ['Warrior'], talent:['None'], region: 'Solana',
    color: '#e09400',
    description: '',
    events: [
      { year: 240, label: 'Hala\'s ambush fails due to Dorinthea, and is mortaly wounded', url: 'https://legendarystories.net/main-story/welcome-to-rathe/pride-of-the-ironsongs.html' },
      { year:254.45, label: 'Hala fights off the forces of Shadow', url: 'https://legendarystories.net/main-story/compendium-of-rathe/vow-unbroken.html'}
    ],
  },
  {
    id: 'ira', name: 'Ira, Crimson Haze', class: ['Ninja'], talent:['None'], region: 'Misteria',
    color: '#d63ddb',
    description: '',
    events: [
      { year: -14, label: 'Ira born in the Valley of Blossoms', url: 'https://legendarystories.net/main-story/crucible-of-war/edge-of-autumn.html' },
      { year: 0, label: 'Massacre of Ikaru clan — Crimson Haze Rebels founded', url: 'https://legendarystories.net/main-story/crucible-of-war/edge-of-autumn.html'  },
      { year: 25, label: 'Ira and Xun reunite and fight off demons', url: 'https://legendarystories.net/main-story/rosetta/to-halt-the-dark.html' },
    ],
  },
  {
    id: 'iyslander', name: 'Iyslander', class: ['Wizard'], talent:['Elemental'], region: 'Aria',
    color: '#67e8f9',
    description: '',
    events: [
      { year: 240, label: 'Iyslander fless volcor' },
      { year: 250.3, label: 'Iyslander returns to volcor', url: 'https://legendarystories.net/main-story/uprising/journey-into-the-forgotten.html' },
    ],
  },
  {
    id: 'jarl', name: 'Jarl Vetreiđi', class: ['Guardian'], talent:['Elemental'], region: 'Aria',
    color: '#7dd3fc',
    description: '',
    events: [
      {year: 0, label: 'Jarl Vetreiđi, fights off the old ones', url: 'https://legendarystories.net/main-story/armory-decks/battle-of-isenloft.html' },
      { year: 253.3, label: 'ROS: Jarl thaws from his frozen tomb at Isenloft', url: 'https://legendarystories.net/main-story/mastery-packs/trouble-in-larinkmorth.html' },
    ],
  },
  {
    id: 'kano', name: 'Kano', class: ['Wizard'], talent:['None'], region: 'Volcor',
    color: '#f6ad55',
    description: '',
    events: [
      { year: 240, label: 'Kano\'s story begins in Volcor', url: 'https://legendarystories.net/main-story/arcane-rising/smoke-and-mirrors.html'},
      { year: 250, label: 'Volcor is attacked from within', url: 'https://legendarystories.net/main-story/arcane-rising/from-the-ashes.html'}
    ],
  },
  {
    id: 'kassai', name: 'Kassai', class: ['Warrior'], talent:['None'], region: 'Volcor',
    color: '#d97706',
    description: '',
    events: [
      { year: 250, label: 'WTR: Kasai witnesses the invasion of Solana', url: 'https://legendarystories.net/main-story/crucible-of-war/no-smoke-without-fire.html' },
      { year: 252.6, label: 'HVY: Kassai, Cintari Sellsword enters the Arena', url: 'https://legendarystories.net/main-story/heavy-hitters/arena-announcements.html' },
    ],
  },
  {
    id: 'katsu', name: 'Katsu', class: ['Ninja'], talent:['None'], region: 'Misteria',
    color: '#9f7aea',
    description: '',
    events: [
      { year: 245, label: 'Katsu leveas the Mengushi clan to find a cure for a dessies', url:'https://legendarystories.net/main-story/welcome-to-rathe/wanderings-in-the-mists.html' },
    ],
  },
  {
    id: 'kavdaen', name: 'Kavdaen, Trader of Skins', class: ['Merchant'], talent:['None'], region: 'The Pits',
    color: '#57534e',
    description: '',
    events: [
    ],
  },
  {
    id: 'kayo', name: 'Kayo, Berserker Runt', class: ['Brute'], talent:['None'], region: 'Savage Lands',
    color: '#fc8181',
    description: '',
    events: [
      { year: 240, label: 'Kayo hatches in the Savage Lands' },
      { year:  252.6, label: 'Kayo enters the Arena', url: 'https://legendarystories.net/main-story/heavy-hitters/arena-announcements.html' },
    ],
  },
  {
    id: 'levia', name: 'Levia', class: ['Brute'], talent:['Shadow'], region: 'Demonastery',
    color: '#9b59b6',
    description: '',
    events: [
      { year: 242, label:'Levia works at the Barthamont estate', url: 'https://legendarystories.net/main-story/monarch/destroy-and-consume.html'},
      { year: 249, label:'Levia is corrupted by lady Barthamont ', url: 'https://legendarystories.net/main-story/monarch/destroy-and-consume.html'},
      { year:  249, label: 'Chane finds Levia and teams up to fight Solana', url: 'https://legendarystories.net/main-story/monarch/harbinger-of-the-abyss.html' },  
      { year: 252, label: 'Levia and Vynnset work together to assult solana', url: 'https://legendarystories.net/main-story/dusk-till-dawn/unity-in-light.html' },
      { year:254.45, label: 'Levia, consummed, battles with Hala', url: 'https://legendarystories.net/main-story/compendium-of-rathe/vow-unbroken.html'}
    ],
  },
  {
    id: 'lexi', name: 'Lexi', class: ['Ranger'], talent:['Elemental'], region: 'Aria',
    color: '#2dd4bf',
    description: '',
    events: [
      { year: 245, label: 'Lexi grows up in volthaven', url:'https://legendarystories.net/main-story/tales-of-aria/wonders-of-the-wayfarer.html'},
      { year: 250.6, label: 'Briar joins Lexi to discover the secrets of Aria', url: 'https://legendarystories.net/main-story/everfest/a-grand-adventure.html' },
      { year: 252, label: 'Heros fights against the shadow', url: 'https://legendarystories.net/main-story/dusk-till-dawn/unity-in-light.html' },
      { year:254.45, label: 'The war rages on', url: 'https://legendarystories.net/main-story/compendium-of-rathe/vow-unbroken.html'}
    ],
  },
  {
    id: 'lyath', name: 'Lyath Goldmane, Vile Savant', class: ['Guardian'], talent:['Reviled'], region: 'Northern Realms',
    color: '#713f12',
    description: '',
    events: [
      { year: 254.3, label: 'Lyath Goldmane enters the Deathmatch Arena' },
    ],
  },
  {
    id: 'marlynn', name: 'Marlynn, Treasure Hunter', class: ['Pirate','Ranger'], talent:['None'], region: 'High Seas',
    color: '#0891b2',
    description: '',
    events: [
      { year: 254.0, label: 'Marlynn hunts treasure across the High Seas', url:'https://legendarystories.net/main-story/high-seas/a-kraken-good-tale.html' },
    ],
  },
  {
    id: 'maxx', name: 'Maxx, the Hype Nitro', class: ['Mechanologist'], talent:['None'], region: 'Metrix',
    color: '#00b4d8',
    description: '',
    events: [
      { year: 252.3, label: 'Dash joins forces with Maxx Nitro and discovers Data Doll', url: 'https://legendarystories.net/main-story/bright-lights/synthetic-futures.html'},
      { year: 254, label: 'Dash attempts to show off an invention for Teklo Industries', url: 'https://legendarystories.net/main-story/armory-decks/boom-town-boom.html'}
    ],
  },
  {
    id: 'melody', name: 'Melody', class: ['Bard'], talent:['None'], region: 'Aria',
    color: '#90e0ef',
    description: '',
    events: [
      { year: 253.3, label: 'Melody shows up to the funueral of the queen of Candlehold', url:'https://legendarystories.net/main-story/rosetta/seeds-of-renewal.html' },
    ],
  },
  {
    id: 'nuu', name: 'Nuu, Alluring Desire', class: ['Assassin'], talent:['Mystic'], region: 'Misteria',
    color: '#7c3aed',
    description: '',
    events: [
      { year: -500, label: 'Fumei amd Nuu study together at the Imortal Lunar Shrine', url: 'https://legendarystories.net/main-story/part-the-mistveil/part-4-the-hare-and-the-snake.html'},
      { year: 254, label: 'Enigma hunts down the evil spirit Nuu', url: 'https://legendarystories.net/main-story/part-the-mistveil/part-2-the-tapestry-unfolds.html'},
    ],
  },
  {
    id: 'oldhim', name: 'Oldhim', class: ['Guardian'], talent:['Elemental'], region: 'Aria',
    color: '#94a3b8',
    description: '',
    events: [
      { year: 0, label: 'Oldhim, fights off the old ones', url: 'https://legendarystories.net/main-story/armory-decks/battle-of-isenloft.html' },
      { year: 250.3, label: 'Oldhim thaws from his frozen tomb at Isenloft', url: 'https://legendarystories.net/main-story/tales-of-aria/the-broken-covenant.html' },
      { year: 250.6, label: 'Briar joins Lexi to discover the secrets of Aria', url: 'https://legendarystories.net/main-story/everfest/a-grand-adventure.html' },
      {year: 252, label: 'Heros fights against the shadow', url: 'https://legendarystories.net/main-story/dusk-till-dawn/unity-in-light.html' },
    ],
  },
  {
    id: 'olympia', name: 'Olympia', class: ['Guardian'], talent:['None'], region: 'Deathmatch Arena',
    color: '#d6d3d1',
    description: '',
    events: [
      { year:  252.6, label: 'Olympia enters the Arena', url: 'https://legendarystories.net/main-story/heavy-hitters/arena-announcements.html' },

    ],
  },
  {
    id: 'oscilio', name: 'Oscilio, Constella Intelligence', class: ['Wizard'], talent:['Elemental', 'Lightning'], region: 'Aria',
    color: '#4f46e5',
    description: '',
    events: [
      { year: 253.3, label: 'Oscilio is discovered by Aurora', url: 'https://legendarystories.net/main-story/rosetta/secret-of-the-aetherscribes.html' },
      { year: 254.6, label: 'Aurora and Oscilio fight against the Omens', url: 'https://legendarystories.net/main-story/omens-of-the-third-age/omens-in-the-sky.html' },
    ],
  },
  {
    id: 'pleiades', name: 'Pleiades, Superstar', class: ['Guardian'], talent:['Revered'], region: 'Northern Realms',
    color: '#e879f9',
    description: '',
    events: [
      { year: 254.3, label: 'Pleiades enters the Deathmatch Arena' },
    ],
  },
  {
    id: 'prism', name: 'Prism', class: ['Illusionist'], talent:['Light'], region: 'Solana',
    color: '#ff99ff',
    description: '',
    events: [
      { year: 234, label: 'Prism shows up in the grand library', url: 'https://legendarystories.net/main-story/monarch/stories-of-illumination.html' },
      { year: 251, label: 'Prism reveals the truth of Talents to Boltyn', url: 'https://legendarystories.net/main-story/monarch/step-into-the-light.html' },
      {year: 252, label: 'Heros fights against the shadow', url: 'https://legendarystories.net/main-story/dusk-till-dawn/unity-in-light.html' },
    ],
  },
  {
    id: 'puffin', name: 'Puffin, Hightail', class: ['Pirate', 'Mechanologist'], talent:['None'], region: 'High Seas',
    color: '#7c3aed',
    description: '',
    events: [
      { year: 254.0, label: 'Puffin sails the High Seas skies', url: 'https://legendarystories.net/main-story/monarch/step-into-the-light.html' },
    ],
  },
  {
    id: 'rhinar', name: 'Rhinar, Reckless Rampage', class: ['Brute'], talent:['None'], region: 'Savage Lands',
    color: '#e53e3e',
    description: '',
    events: [
      { year: 220, label: 'A cub, rhinar survives in the dence jungle', url: 'https://legendarystories.net/main-story/welcome-to-rathe/kill-or-be-killed.html' },
      { year:   250, label: 'Established alpha predator of the jungle', url:'https://legendarystories.net/main-story/welcome-to-rathe/kill-or-be-killed.html' },
      { year: 252.6, label: 'Rhinar Enters the Deathmatch Arena', url: 'https://legendarystories.net/main-story/heavy-hitters/arena-announcements.html' },
      { year: 254.8, label: 'Rhinar returns to the Savage Lands', url: 'https://legendarystories.net/short-stories/armory-decks/rhinar.html' },
    ],
  },
  {
    id: 'riptide', name: 'Riptide, Lurker of the Deep', class: ['Ranger'], talent:['None'], region: 'The Pits',
    color: '#065f46',
    description: '',
    events: [
      { year: 251.6, label: 'Riptide, Lurker of the Deep', url: 'https://legendarystories.net/main-story/outsiders/catch-of-the-day.html' }
    ],
  },
  {
    id: 'scurv', name: 'Scurv, Stowaway', class: ['Pirate', 'Thief'], talent:['None'], region: 'High Seas',
    color: '#0369a1',
    description: '',
    events: [
    ],
  },
  {
    id: 'shiyana', name: 'Shiyana, Diamond Gemini', class: ['Shapeshifter'], talent:['None'], region: 'Solana',
    color: '#ffe066',
    description: '',
    events: [
      { year: 251.3, label: 'Shiyana returns to Solana, after the events of dynasty', url: 'https://legendarystories.net/main-story/outsiders/tidings-in-the-light.html'},
      {year: 252, label: 'Heros fights against the shadow', url: 'https://legendarystories.net/main-story/dusk-till-dawn/unity-in-light.html' },
    ],
  },
  {
    id: 'teklovossen', name: 'Teklovossen', class: ['Mechanologist'], talent:['None'], region: 'Metrix',
    color: '#1e3a8a',
    description: '',
    events: [
      { year: 190, label: 'Teklovossen is a brilliant inventor in Metrix', url: 'https://legendarystories.net/main-story/bright-lights/the-dynamic-man.html' },
      { year: 252.3, label: 'Teklovossen awakens after years of slumber to become the mecropotent',
        url: 'https://legendarystories.net/main-story/bright-lights/P%CC%B8%CD%8D%CC%AC%CC%AD%CC%AD%CC%BA%CD%89%CC%A3%CC%8C%CC%90%CC%BE%CC%8C%CD%86%CC%9Ar%CC%B4%CD%94%CD%8D%CD%90%C8%AF%CC%B4%CC%A4%CC%B0%CD%A0t%CC%B5%CC%B0%CC%98%CD%91%C3%B5%CC%B6%CD%8D%CD%87c%CC%B6%CC%9F%CD%92o%CC%B6%CC%AA%CC%B3%CD%8Bl%CC%B6%CC%97%CC%91%20%CC%B4%CC%AE%CC%93%CD%98A%CC%B4%CC%9E%CC%97%CD%86%E1%B9%97%CC%B7%CC%A2%CD%95%CC%88%CC%81%C4%93%CC%B5%CD%8D%CC%BF%C5%95%CC%B6%CC%A9%CC%81%E1%B8%AD%CC%B4%CC%A7%CD%90%CD%82o%CC%B8%CD%99%CC%96%CC%90%CD%98n%CC%B4%CC%9E%CC%BA%CD%8B.html'
       },
    ],
  },
  {
    id: 'terra', name: 'Terra, Awakened Ancient', class: ['Guardian'], talent: ['Elemental'], region: 'Aria',
    color: '#78716c',
    description: '',
    events: []
  },
  {
    id: 'tuffnut', name: 'Tuffnut, Bumbling Hulkster', class: ['Brute'], talent: ['Revered'], region: 'Deathmatch Arena',
    color: '#a16207',
    description: '',
    events: [
      { year: 252.6, label: 'Tuffnut enters the Deathmatch Arena' },
    ],
  },
  {
    id: 'uzuri', name: 'Uzuri, Switchblade', class: ['Assassin'], talent:['None'], region: 'The Pits',
    color: '#047857',
    description: '',
    events: [
      { year: 241, label: 'Uzuri, starts her journey as an assasin for the spider', url: 'https://legendarystories.net/main-story/outsiders/its-just-business.html' },
      { year: 251.6, label: 'Arakni Returns to the Pits, and discovers the assassination was a trap', url: 'https://legendarystories.net/main-story/outsiders/the-spiders-trap.html' },

    ],
  },
  {
    id: 'valda', name: 'Valda', class: ['Guardian'], talent:['None'], region: 'Aria',
    color: '#48bb78',
    description: '',
    events: [
      { year: 230, label: 'Valda arrives in Aria as a child' },
      { year:  254, label: 'HSS: Attack on Larinkmorth', url: 'https://legendarystories.net/main-story/mastery-packs/trouble-in-larinkmorth.html'},
    ],
  },
  {
    id: 'verdance', name: 'Verdance, Thorn of the Rose', class: ['Wizard'], talent: ['Elemental'], region: 'Aria',
    color: '#22c55e',
    description: '',
    events: [
      { year: 253.3, label: 'Florian and Verdance clash for the future of Candlehold', url:"https://legendarystories.net/main-story/rosetta/roots-of-change.html" },
    ],
  },
  {
    id: 'victor-goldmane', name: 'Victor Goldmane', class: ['Warrior'], talent:['None'], region: 'Northern Realms',
    color: '#ca8a04',
    description: '',
    events: [
      { year: 252.6, label: 'Vctor Goldmane battles in the Deathmatch Arena', url: 'https://legendarystories.net/main-story/heavy-hitters/arena-announcements.html' },
    ],
  },
  {
    id: 'viserai', name: 'Viserai, Rune Blood', class: ['Runeblade'], talent:['None'], region: 'Demonastery',
    color: '#b794f4',
    description: '',
    events: [
      { year: 246, label: 'Viserai is born', url: 'https://legendarystories.net/main-story/arcane-rising/birth-of-the-arknight.html' },
      { year: 247,  label: 'Viserai opens the Vitate gateway', url: 'https://legendarystories.net/main-story/arcane-rising/return-of-the-shadow.html' },
    ],
  },
  {
    id: 'vynnset', name: 'Vynnset, Iron Maiden', class: ['Runeblade'], talent: ['Shadow'], region: 'Demonastery',
    color: '#6d28d9',
    description: '',
    events: [
      { year: 241, label: 'Vynnset, Iron Maiden is born', url: 'https://legendarystories.net/main-story/dusk-till-dawn/anointed-in-shadow.html' },
      { year: 252, label: 'Levia and Vynnset work together to assult solana', url: 'https://legendarystories.net/main-story/dusk-till-dawn/unity-in-light.html' },
    ],
  },
  {
    id: 'yoji', name: 'Yoji, Royal Protector', class: ['Warrior'], talent:['None'], region: 'Volcor',
    color: '#92400e',
    description: '',
    events: [
      { year: 251.3, label: 'Yoji fails to protect the Imperial palace', url: 'https://legendarystories.net/main-story/dynasty/vow-of-vigilence.html' },
    ],
  },
  {
    id: 'zen', name: 'Zen, Tamer of Purpose', class: ['Ninja'], talent: ['Mystic'], region: 'Misteria',
    color: '#4c1d95',
    description: '',
    events: [
      { year: 254, label: 'Zen walks every inch of Misteria\'s lands', url: 'https://legendarystories.net/main-story/part-the-mistveil/part-1-the-tiger-in-the-mist.html'},
    ],
  },
  {
    id: 'zyggy', name: 'Zyggy, Starlight', class: ['Illusionist'], talent:['Lightning'], region: 'Aria',
    color: '#635fb8',
    description: '',
    events: [
      { year: 254.6, label: 'Aurora and Oscilio find Zyggy in the Auric keep', url: 'https://legendarystories.net/main-story/omens-of-the-third-age/omens-in-the-sky.html' },
    ],
  },
];

// ─── State ────────────────────────────────────────────────────────────────────
let zoom = 1;
let panX = 0;       // px offset of the track's left edge inside the viewport
let isDragging = false;
let dragStartX = 0;
let dragStartPan = 0;
let visibleHeroes = new Set(HEROES.map(h => h.id));
let activeTooltip = null;
// null = automatic (zoom-based), true = force show, false = force hide
let heroesOverride      = null;
let worldEventsOverride = null;
let ageBoundsOverride   = null;
let setIconsOverride    = null;
let prevZoom            = null; // used to detect actual zoom changes in applyTransform

// Hero fan layer handles (set by buildHeroFanLayer)
let heroSVG       = null;

// Sticky label data: populated by buildHeroFanLayer, read by updateStickyLabels
const heroLabelData = [];

// Elements that need a scaleX counter-transform — updated directly in applyTransform()
// to avoid CSS-variable lag when the compositor applies the track transform early.
let eraLabelEls      = [];
let tickLabelEls     = [];
let eventDotEls      = [];
let eventLabelEls    = [];
let convergencePinEls = [];
let setImgEls        = [];
let heroDotData      = [];  // { el, heroId, trackX, dotY }

// Threshold (effective px per year in modern era) at which layers appear
const SET_THRESHOLD          = 0.15;
const HERO_THRESHOLD         = 0.5;
const WORLD_EVENT_THRESHOLD  = 0.04; // appear before sets/heroes, after zooming in a bit
const MAX_ZOOM               = 2.9;

// Hero fan layout constants
const LANE_SPACING  = 18; // px between adjacent hero lanes
const AXIS_PADDING  = 60; // px gap between the axis and the nearest hero lane

// ─── Tick marks ───────────────────────────────────────────────────────────────
// All tick year values, sorted ascending (start at -750, the timeline origin)
const TICK_YEARS = [
  -750, -500, -400, -100, -50, 0,
  50, 100, 150, 200, 220, 240, 248, 249,
  250, 250.3, 250.6, 251, 251.3, 251.6, 252, 252.3, 252.6,
  253, 253.3, 253.6, 254, 254.3, 254.6
];
let TICK_X = TICK_YEARS.map(yearToX);
const TICK_MIN_SCREEN_PX = 50;

// Minimum zoom level at which tick i is shown.
// A tick appears when the larger of its left/right track-space gaps fills at
// least TICK_MIN_SCREEN_PX pixels on screen — that way boundary ticks with a
// large gap on one side stay readable even if the other side is dense.
function tickMinZoom(i) {
  const left  = i > 0                    ? TICK_X[i] - TICK_X[i - 1] : Infinity;
  const right = i < TICK_X.length - 1   ? TICK_X[i + 1] - TICK_X[i] : Infinity;
  return TICK_MIN_SCREEN_PX / Math.max(left, right);
}

// ─── DOM refs ────────────────────────────────────────────────────────────────
const viewport      = document.getElementById('viewport');
const track         = document.getElementById('track');
const worldLayer    = document.getElementById('world-layer');
const setLayer      = document.getElementById('set-layer');
const heroLayer     = document.getElementById('hero-layer');
const heroNamesLayer    = document.getElementById('hero-names-layer');
const heroDotsScreen    = document.getElementById('hero-dots-screen');
const menuOverlay   = document.getElementById('menu-overlay');
const menuPanel     = document.getElementById('menu-panel');
const hamburgerBtn  = document.getElementById('hamburger-btn');
const zoomDisplay   = document.getElementById('zoom-display');
const tooltip       = document.getElementById('tooltip');

// Set once — never needs to change
track.style.transformOrigin = '0 0';

// ─── Build world layer ────────────────────────────────────────────────────────
function buildWorldLayer() {
  // Axis line
  const axis = document.createElement('div');
  axis.className = 'axis-line';
  worldLayer.appendChild(axis);

  // Age / era bands — click the label to collapse / expand
  ERAS.forEach(e => {
    const band = document.createElement('div');
    const collapsed = collapsedEras.has(e.id);
    band.className = 'era-band ' + e.id + (collapsed ? ' era-collapsed' : '');
    const x1 = yearToX(e.start);
    const x2 = collapsed ? x1 + COLLAPSED_PX : yearToX(e.end);
    band.style.left  = x1 + 'px';
    band.style.width = (x2 - x1) + 'px';
    const lbl = document.createElement('span');
    lbl.textContent = (collapsed ? '▶ ' : '') + e.label;
    lbl.title = collapsed ? 'Click to expand ' + e.label : 'Click to collapse ' + e.label;
    lbl.style.cursor = 'pointer';
    lbl.addEventListener('click', ev => {
      ev.stopPropagation();
      if (collapsedEras.has(e.id)) collapsedEras.delete(e.id);
      else                          collapsedEras.add(e.id);
      rebuildAll();
    });
    band.appendChild(lbl);
    eraLabelEls.push(lbl);
    worldLayer.appendChild(band);
  });

  // Year tick marks
  TICK_YEARS.forEach((yr, i) => {
    const tick = document.createElement('div');
    tick.className = 'tick';
    tick.style.left = yearToX(yr) + 'px';
    tick.dataset.minZoom = tickMinZoom(i);
    const lbl = document.createElement('span');
    lbl.textContent = yearToAgeLabel(yr);
    tick.appendChild(lbl);
    tickLabelEls.push(lbl);
    worldLayer.appendChild(tick);
  });

  // Auto-alternate non-age world events above/below the axis (even index = above, odd = below)
  {
    const nonAge = WORLD_EVENTS.filter(ev => ev.type !== 'age').sort((a, b) => a.year - b.year);
    nonAge.forEach((ev, i) => { ev._autoBelow = i % 2 !== 0; });
    // Convergence events always sit above the axis — their dot is pinned, not in flex flow
    WORLD_EVENTS.filter(ev => ev.convergence).forEach(ev => { ev._autoBelow = false; });
  }

  // Assign stack indices for events sharing the same year.
  // Age and convergence events have priority 0 (sit on the axis); others stack upward.
  {
    const groups = {};
    WORLD_EVENTS.forEach(ev => { (groups[ev.year] = groups[ev.year] || []).push(ev); });
    Object.values(groups).forEach(group => {
      const above = group.filter(ev => !ev._autoBelow);
      const below = group.filter(ev => ev._autoBelow);
      above.sort((a, b) => ((a.type === 'age' || a.convergence) ? 0 : 1) - ((b.type === 'age' || b.convergence) ? 0 : 1));
      above.forEach((ev, i) => { ev._stackIdx = i; });
      below.forEach((ev, i) => { ev._stackIdx = i; });
    });
  }

  // World events
  WORLD_EVENTS.forEach(ev => {
    const inCollapsed = ERAS.some(
      era => collapsedEras.has(era.id) && ev.year >= era.start && ev.year < era.end
    );
    const marker = document.createElement('div');
    marker.className = 'world-event ' + (ev.type ?? '') + (inCollapsed ? ' world-event--collapsed' : '') + (ev.convergence ? ' convergence' : '') + (ev._autoBelow ? ' world-event--below' : '');
    marker.style.left = yearToX(ev.year) + 'px';
    marker.dataset.year = ev.year;
    if (ev._stackIdx) marker.dataset.stackIdx = ev._stackIdx;

    const dot = document.createElement('div');
    dot.className = 'event-dot';
    marker.appendChild(dot);
    eventDotEls.push(dot);

    const lbl = document.createElement('div');
    lbl.className = 'event-label';
    lbl.innerHTML = ev.label.replace(/\n/g, '<br>');
    marker.appendChild(lbl);
    eventLabelEls.push(lbl);

    marker.addEventListener('click', e => {
      if (ev.convergence) showConvergenceTooltip(e, ev);
      else showTooltip(e, ev.label, '');
    });
    if (ev.convergence) {
      marker.addEventListener('mouseenter', () => highlightConvergence(ev.year));
      marker.addEventListener('mouseleave', clearHeroHighlight);
    }
    if (ev.type === 'age') {
      marker.addEventListener('mouseenter', () => {
        heroNamesLayer.style.zIndex = '0';
        heroDotsScreen.style.zIndex = '0';
      });
      marker.addEventListener('mouseleave', () => {
        heroNamesLayer.style.zIndex = '';
        heroDotsScreen.style.zIndex = '';
      });
    }

    worldLayer.appendChild(marker);
  });

  // Permanent convergence pins — not .world-event so they survive the world-events-hidden toggle
  WORLD_EVENTS.filter(ev => ev.convergence).forEach(ev => {
    const pin = document.createElement('div');
    pin.className = 'convergence-pin';
    pin.style.left = yearToX(ev.year) + 'px';
    pin.dataset.year = ev.year;
    pin.title = ev.label;
    pin.addEventListener('click', e => showConvergenceTooltip(e, ev));
    pin.addEventListener('mouseenter', () => highlightConvergence(ev.year));
    pin.addEventListener('mouseleave', clearHeroHighlight);
    worldLayer.appendChild(pin);
    convergencePinEls.push(pin);
  });
}

// ─── Build set layer ──────────────────────────────────────────────────────────
function buildSetLayer() {
  // Group stacked sets at the same year
  const grouped = {};
  SETS.forEach(s => {
    const key = s.year.toFixed(2);
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(s);
  });

  Object.entries(grouped).forEach(([, sets]) => {
    const x = yearToX(sets[0].year);
    const col = document.createElement('div');
    col.className = 'set-column';
    col.style.left = x + 'px';

    sets.forEach((s, i) => {
      // Image above the axis — stacks upward, closest first
      const img = document.createElement('img');
      img.src = s.img;
      img.className = 'set-img';
      img.alt = s.label;
      img.style.top = -(102 + i * 98) + 'px'; // 12px gap + 90px img + i*(90+8)
      img.addEventListener('error', () => { img.style.display = 'none'; });
      img.addEventListener('click', ev => showTooltip(ev, s.label, yearToAgeLabel(s.year)));
      col.appendChild(img);
      setImgEls.push(img);

    });

    setLayer.appendChild(col);
  });
}

// ─── Build hero fan layer (SVG bezier curves) ─────────────────────────────────
function buildHeroFanLayer() {
  // Heroes with at least one dated event participate in the fan layout
  const dated = HEROES.filter(h => h.events.some(e => e.year !== null));
  const N = dated.length;

  // ── Spread Y per hero — first half above axis (negative Y, top of screen = index 0),
  //    second half below axis (positive Y), preserving alphabetical top-to-bottom order
  const half = Math.floor(N / 2);
  const laneY = {};
  dated.forEach((hero, i) => {
    if (i < half) {
      laneY[hero.id] = -(half - i) * LANE_SPACING - AXIS_PADDING;
    } else {
      laneY[hero.id] = (i - half + 1) * LANE_SPACING + AXIS_PADDING;
    }
  });

  // Each hero stays on its own fixed lane
  function evtY(heroId) {
    return laneY[heroId] ?? 0;
  }

  // ── SVG canvas for path curves ────────────────────────────────────────────
  // Height only needs to cover the positive (below-axis) range;
  // negative-Y paths render via overflow: visible on #hero-layer
  const maxY = Math.max(0, ...Object.values(laneY));
  const svgHeight = maxY + 100;
  heroLayer.style.height = svgHeight + 'px';

  heroSVG = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  heroSVG.id = 'hero-svg';
  heroSVG.setAttribute('width', TRACK_WIDTH);
  heroSVG.setAttribute('height', svgHeight);
  heroLayer.appendChild(heroSVG);

  // ── HTML layer for interactive dots + name labels ─────────────────────────


  // Years where a world event is marked as a convergence hub
  const convergenceYears = new Set(
    WORLD_EVENTS.filter(w => w.convergence).map(w => w.year)
  );

  // ── Per-hero rendering ────────────────────────────────────────────────────
  dated.forEach(hero => {
    const evts = hero.events
      .filter(e => e.year !== null)
      .sort((a, b) => a.year - b.year);
    if (evts.length === 0) return;

    const laneYVal = evtY(hero.id);
    const pts = evts.map(ev => ({
      x:    yearToX(ev.year),
      y:    convergenceYears.has(ev.year) && !ev.noConvergence ? 0 : laneYVal, // path dips to axis at convergence
      dotY: laneYVal,                                      // dot always stays on the hero's lane
      ev,
    }));

    // ── Bezier path ──────────────────────────────────────────────────────────
    if (pts.length >= 2) {
      let d = `M${pts[0].x},${pts[0].y}`;
      for (let i = 1; i < pts.length; i++) {
        const a = pts[i - 1], b = pts[i];
        const cp = (b.x - a.x) / 3;
        d += ` C${a.x + cp},${a.y} ${b.x - cp},${b.y} ${b.x},${b.y}`;
      }
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', d);
      path.setAttribute('stroke', hero.color);
      path.setAttribute('opacity', '0.85');
      path.dataset.hero = hero.id;
      heroSVG.appendChild(path);

      // Invisible wide hit path so the thin line is easy to click
      const hitPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      hitPath.setAttribute('d', d);
      hitPath.setAttribute('fill', 'none');
      hitPath.setAttribute('stroke', 'transparent');
      hitPath.setAttribute('stroke-width', '12');
      hitPath.setAttribute('class', 'hero-hit-path');
      hitPath.dataset.hero = hero.id;
      hitPath.addEventListener('click', e => {
        e.stopPropagation();
        if (heroLayer.style.opacity === '0' || !visibleHeroes.has(hero.id)) return;
        jumpToNextEvent(hero);
      });
      heroSVG.appendChild(hitPath);
    }

    // ── Vertical stub for heroes whose first event is at a convergence year ──
    if (convergenceYears.has(pts[0].ev.year) && !pts[0].ev.noConvergence) {
      const stubX = pts[0].x;
      const stub = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      stub.setAttribute('x1', stubX);
      stub.setAttribute('y1', laneYVal);
      stub.setAttribute('x2', stubX);
      stub.setAttribute('y2', 0);
      stub.setAttribute('stroke', hero.color);
      stub.setAttribute('stroke-width', '1.5');
      stub.setAttribute('opacity', '0.85');
      stub.dataset.hero = hero.id;
      heroSVG.appendChild(stub);
    }

    // ── Name label at the first event ─────────────────────────────────────────
    const nameLbl = document.createElement('div');
    nameLbl.className = 'hero-start-label';
    nameLbl.dataset.hero = hero.id;
    nameLbl.textContent = hero.name;
    nameLbl.style.color = hero.color;
    nameLbl.style.cursor = 'pointer';
    nameLbl.title = 'Jump to origin';
    nameLbl.addEventListener('click', e => {
      e.stopPropagation();
      const vw = viewport.clientWidth;
      const minHeroZoom = 0.7;
      if (zoom < minHeroZoom) {
        zoom = Math.min(MAX_ZOOM, minHeroZoom);
        panX = clampPan(vw / 2 - pts[0].x * zoom, zoom);
        applyTransform();
      } else {
        animatePanTo(clampPan(vw / 2 - pts[0].x * zoom, zoom));
      }
    });
    nameLbl.addEventListener('mouseenter', () => highlightHero(hero.id));
    nameLbl.addEventListener('mouseleave', clearHeroHighlight);
    heroNamesLayer.appendChild(nameLbl);
    heroLabelData.push({ el: nameLbl, heroId: hero.id, firstX: pts[0].x, lastX: pts[pts.length - 1].x, baseX: pts[0].x + 8, dotY: pts[0].dotY });

    // ── Event dots ───────────────────────────────────────────────────────────
    // Exclude convergence-year events — the path dip to the hub is the visual;
    // their details surface in the world event's hover tooltip instead.
    const visiblePts = pts.filter(pt => !convergenceYears.has(pt.ev.year));
    const uniquePositions = new Set(visiblePts.map(p => p.x)).size;
    const actualLastIsConvergence = pts.length > 0 && convergenceYears.has(pts[pts.length - 1].ev.year);
    visiblePts.forEach((pt, ptIdx) => {
      const dot = document.createElement('div');
      const isFirst = ptIdx === 0 && uniquePositions > 1;
      const isLast  = ptIdx === visiblePts.length - 1 && uniquePositions > 1 && !actualLastIsConvergence;
      const isDeath = !!pt.ev.death;
      let cls = 'hero-dot';
      if (isDeath)       cls += ' hero-dot--death';
      else if (isFirst)  cls += ' hero-dot--first';
      else if (isLast)   cls += ' hero-dot--last';
      dot.className = cls;
      dot.dataset.hero = hero.id;
      dot.style.left = pt.x + 'px';
      dot.style.top  = pt.dotY + 'px';
      const sharesEndPos = uniquePositions > 1 && !isLast && !actualLastIsConvergence && pt.x === visiblePts[visiblePts.length - 1].x;
      if (isDeath || isFirst || isLast) {
        dot.style.color = hero.color;
      } else if (!sharesEndPos) {
        dot.style.background = hero.color;
        dot.style.boxShadow  = `0 0 8px ${hero.color}`;
      }

      const evLbl = document.createElement('div');
      evLbl.className = 'hero-event-label';
      evLbl.textContent = pt.ev.label;
      evLbl.style.color = hero.color;
      dot.appendChild(evLbl);

      dot.addEventListener('click', e => {
        e.stopPropagation();
        showTooltip(e, pt.ev.label, `${hero.name} · ${yearToAgeLabel(pt.ev.year)}`, hero.color);
        if (pt.ev.url) window.open(pt.ev.url, '_blank', 'noopener');
      });
      dot.addEventListener('mouseenter', () => highlightHero(hero.id));
      dot.addEventListener('mouseleave', clearHeroHighlight);

      heroDotsScreen.appendChild(dot);
      heroDotData.push({ el: dot, heroId: hero.id, trackX: pt.x, dotY: pt.dotY });
    });
  });
}

// ─── Build hero menu ─────────────────────────────────────────────────────────
function buildMenu() {
  const list = document.getElementById('hero-list');
  HEROES.forEach(hero => {
    const item = document.createElement('label');
    item.className = 'menu-item';

    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.checked = true;
    cb.dataset.hero = hero.id;
    cb.addEventListener('change', () => {
      if (cb.checked) visibleHeroes.add(hero.id);
      else            visibleHeroes.delete(hero.id);
      applyHeroVisibility();
    });

    const dot = document.createElement('span');
    dot.className = 'menu-dot';
    dot.style.background = hero.color;

    const name = document.createElement('span');
    name.textContent = hero.name;
    name.className = 'menu-hero-name';
    name.title = 'Jump to start of timeline';
    name.addEventListener('click', e => {
      e.preventDefault();
      e.stopPropagation();
      const firstEvt = hero.events
        .filter(ev => ev.year !== null)
        .sort((a, b) => a.year - b.year)[0];
      if (!firstEvt) return;
      menuOverlay.classList.remove('open');
      const vw = viewport.clientWidth;
      const minHeroZoom = 0.7;
      if (zoom < minHeroZoom) zoom = Math.min(MAX_ZOOM, minHeroZoom);
      panX = clampPan(vw / 2 - yearToX(firstEvt.year) * zoom, zoom);
      applyTransform();
    });

    const cls = document.createElement('span');
    cls.className = 'menu-class';
    cls.textContent = hero.class.join(' / ') + ' · ' + hero.region;

    item.appendChild(cb);
    item.appendChild(dot);
    item.appendChild(name);
    item.appendChild(cls);
    list.appendChild(item);
  });

  // Select / deselect all
  document.getElementById('select-all').addEventListener('click', () => {
    list.querySelectorAll('input[type=checkbox]').forEach(cb => { cb.checked = true; });
    visibleHeroes = new Set(HEROES.map(h => h.id));
    applyHeroVisibility();
  });
  document.getElementById('select-none').addEventListener('click', () => {
    list.querySelectorAll('input[type=checkbox]').forEach(cb => { cb.checked = false; });
    visibleHeroes.clear();
    applyHeroVisibility();
  });
}

function applyHeroVisibility() {
  if (!heroSVG) return;
  heroSVG.querySelectorAll('[data-hero]').forEach(el => {
    el.style.display = visibleHeroes.has(el.dataset.hero) ? '' : 'none';
  });
  // Dot visibility is handled per-element in updateStickyLabels()
  updateStickyLabels();
}

// ─── Sticky hero name labels ──────────────────────────────────────────────────
// Keeps each hero's name pinned to the left edge of the viewport while any
// part of that hero's timeline is visible on screen.
function updateStickyLabels() {
  const vw = viewport.clientWidth;
  const vh = viewport.clientHeight;
  const visibleLeftTrack  = -panX / zoom;
  const visibleRightTrack = (vw - panX) / zoom;

  // Hero name labels — sticky to left edge
  heroLabelData.forEach(({ el, heroId, firstX, lastX, baseX, dotY }) => {
    if (!visibleHeroes.has(heroId)) return;
    const inView = firstX <= visibleRightTrack && lastX >= visibleLeftTrack;
    if (!inView) {
      if (el.style.display !== 'none') el.style.display = 'none';
      return;
    }
    if (el.style.display === 'none') el.style.display = '';
    el.style.left = Math.max(10, panX + baseX * zoom) + 'px';
    el.style.top  = (vh / 2 + dotY - 8) + 'px';
  });

  // Hero dots — screen-coordinate positioning, no scaleX needed
  heroDotData.forEach(({ el, heroId, trackX, dotY }) => {
    if (!visibleHeroes.has(heroId)) { el.style.display = 'none'; return; }
    const screenX = panX + trackX * zoom;
    if (screenX < -20 || screenX > vw + 20) {
      if (el.style.display !== 'none') el.style.display = 'none';
      return;
    }
    if (el.style.display === 'none') el.style.display = '';
    el.style.left = screenX + 'px';
    el.style.top  = (vh / 2 + dotY) + 'px';
  });
}

// ─── Tooltip ─────────────────────────────────────────────────────────────────
function showTooltip(e, title, sub, color = '#ffffff') {
  tooltip.querySelector('.tt-title').textContent = title;
  tooltip.querySelector('.tt-sub').textContent   = sub;
  tooltip.querySelector('.tt-title').style.color = color;
  tooltip.querySelector('.tt-extra').innerHTML   = '';
  tooltip.style.display = 'block';
  positionTooltip(e.clientX, e.clientY);
  activeTooltip = tooltip;
  e.stopPropagation();
}

function showConvergenceTooltip(e, worldEv) {
  const byLabel  = {};   // event label → { names: [], url: '' }
  const lastFor  = [];
  const continuesFor = [];

  HEROES.forEach(hero => {
    const evtsAtYear = hero.events.filter(ev => ev.year === worldEv.year && !ev.noConvergence);
    if (evtsAtYear.length === 0) return;

    const maxYear = Math.max(...hero.events
      .filter(ev => ev.year !== null)
      .map(ev => ev.year));

    evtsAtYear.forEach(ev => {
      if (!byLabel[ev.label]) byLabel[ev.label] = { names: [], url: ev.url || '' };
      if (!byLabel[ev.label].names.includes(hero.name)) byLabel[ev.label].names.push(hero.name);
      if (!byLabel[ev.label].url && ev.url) byLabel[ev.label].url = ev.url;
    });

    if (maxYear === worldEv.year) lastFor.push(hero.name);
    else                          continuesFor.push(hero.name);
  });

  tooltip.querySelector('.tt-title').textContent = worldEv.label;
  tooltip.querySelector('.tt-title').style.color = '#ffffff';
  tooltip.querySelector('.tt-sub').textContent   = '';
  const extra = tooltip.querySelector('.tt-extra');
  extra.innerHTML = '';

  Object.entries(byLabel).forEach(([label, entry]) => {
    const grp = document.createElement('div');
    grp.className = 'tt-story-group';

    const lbl = document.createElement(entry.url ? 'a' : 'div');
    lbl.className = 'tt-story-label';
    lbl.textContent = label;
    if (entry.url) {
      lbl.href   = entry.url;
      lbl.target = '_blank';
      lbl.rel    = 'noopener';
    }
    grp.appendChild(lbl);

    const nm = document.createElement('div');
    nm.className = 'tt-hero-names';
    nm.textContent = entry.names.join(', ');
    grp.appendChild(nm);

    extra.appendChild(grp);
  });

  if (lastFor.length || continuesFor.length) {
    const hr = document.createElement('div');
    hr.className = 'tt-divider';
    extra.appendChild(hr);
  }

  if (lastFor.length) {
    const sec = document.createElement('div');
    sec.className = 'tt-section';
    const hdr = document.createElement('div');
    hdr.className = 'tt-section-header';
    hdr.textContent = 'Last event for:';
    const names = document.createElement('div');
    names.className = 'tt-hero-names';
    names.textContent = lastFor.join(', ');
    sec.appendChild(hdr);
    sec.appendChild(names);
    extra.appendChild(sec);
  }

  if (continuesFor.length) {
    const sec = document.createElement('div');
    sec.className = 'tt-section';
    const hdr = document.createElement('div');
    hdr.className = 'tt-section-header';
    hdr.textContent = 'Story continues:';
    const names = document.createElement('div');
    names.className = 'tt-hero-names';
    names.textContent = continuesFor.join(', ');
    sec.appendChild(hdr);
    sec.appendChild(names);
    extra.appendChild(sec);
  }

  tooltip.style.display = 'block';
  positionTooltip(e.clientX, e.clientY);
  activeTooltip = tooltip;
  e.stopPropagation();
}

function positionTooltip(cx, cy) {
  const w = tooltip.offsetWidth  || 220;
  const h = tooltip.offsetHeight || 60;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  let left = cx + 14;
  let top  = cy - h / 2;
  if (left + w > vw - 10) left = cx - w - 14;
  if (top < 10)           top  = 10;
  if (top + h > vh - 10)  top  = vh - h - 10;
  tooltip.style.left = left + 'px';
  tooltip.style.top  = top  + 'px';
}

document.addEventListener('click', () => {
  if (activeTooltip) { activeTooltip.style.display = 'none'; activeTooltip = null; }
});

// ─── Hero hover highlight ─────────────────────────────────────────────────────
function highlightHero(heroId) {
  const hero = HEROES.find(h => h.id === heroId);
  if (!hero) return;

  heroSVG.classList.add('has-highlight');
  heroDotsScreen.classList.add('has-highlight');
  heroNamesLayer.classList.add('has-highlight');

  heroSVG.querySelectorAll(`[data-hero="${heroId}"]`).forEach(el => el.classList.add('highlighted'));
  heroDotsScreen.querySelectorAll(`[data-hero="${heroId}"]`).forEach(el => el.classList.add('highlighted'));
  heroNamesLayer.querySelectorAll(`[data-hero="${heroId}"]`).forEach(el => el.classList.add('highlighted'));

  const heroYears = new Set(hero.events.filter(e => e.year !== null).map(e => e.year));
  worldLayer.querySelectorAll('.world-event:not(.age), .convergence-pin').forEach(el => {
    if (heroYears.has(Number(el.dataset.year))) el.classList.add('hero-event-highlighted');
  });
}

function clearHeroHighlight() {
  if (!heroSVG) return;
  heroSVG.classList.remove('has-highlight');
  heroDotsScreen.classList.remove('has-highlight');
  heroNamesLayer.classList.remove('has-highlight');
  heroSVG.querySelectorAll('.highlighted').forEach(el => el.classList.remove('highlighted'));
  heroDotsScreen.querySelectorAll('.highlighted').forEach(el => el.classList.remove('highlighted'));
  heroNamesLayer.querySelectorAll('.highlighted').forEach(el => el.classList.remove('highlighted'));
  worldLayer.querySelectorAll('.hero-event-highlighted').forEach(el => el.classList.remove('hero-event-highlighted'));
}

function highlightConvergence(year) {
  if (!heroSVG) return;
  const heroIds = new Set(
    HEROES.filter(h => h.events.some(e => e.year === year && !e.noConvergence)).map(h => h.id)
  );
  if (heroIds.size === 0) return;

  heroSVG.classList.add('has-highlight');
  heroDotsScreen.classList.add('has-highlight');
  heroNamesLayer.classList.add('has-highlight');

  heroSVG.querySelectorAll('[data-hero]').forEach(el => {
    if (heroIds.has(el.dataset.hero)) el.classList.add('highlighted');
  });
  heroDotsScreen.querySelectorAll('[data-hero]').forEach(el => {
    if (heroIds.has(el.dataset.hero)) el.classList.add('highlighted');
  });
  heroNamesLayer.querySelectorAll('[data-hero]').forEach(el => {
    if (heroIds.has(el.dataset.hero)) el.classList.add('highlighted');
  });
}

// Cached tick elements so we don't query the DOM every frame
let tickEls = null;

// ─── Render / transform ───────────────────────────────────────────────────────

// Full update — call when zoom changes (wheel, zoom buttons, reset, jump)
function applyTransform() {
  track.style.transform = `translateX(${panX}px) scaleX(${zoom})`;

  const effectivePxPerYrModern = 600 * zoom;
  const fraction = effectivePxPerYrModern / (TRACK_WIDTH / 5);

  // If zoom has changed and a manually-hidden item should now be visible, restore auto behaviour
  if (zoom !== prevZoom) {
    if (worldEventsOverride === false && fraction > WORLD_EVENT_THRESHOLD) worldEventsOverride = null;
    if (setIconsOverride    === false && fraction > SET_THRESHOLD)         setIconsOverride    = null;
    if (heroesOverride      === false && zoom > 0.5)                       heroesOverride      = null;
    prevZoom = zoom;
  }

  const showSetIcons    = setIconsOverride     !== null ? setIconsOverride    : fraction > SET_THRESHOLD;
  const newSetOpacity = showSetIcons ? '1' : '0';
  if (setLayer.style.opacity !== newSetOpacity) {
    setLayer.style.opacity = newSetOpacity;
    setLayer.style.pointerEvents = showSetIcons ? '' : 'none';
  }

  const showHeroes      = heroesOverride      !== null ? heroesOverride      : zoom > 0.5;
  const showWorldEvents = worldEventsOverride !== null ? worldEventsOverride : fraction > WORLD_EVENT_THRESHOLD;
  const showAgeBounds   = ageBoundsOverride   !== null ? ageBoundsOverride   : true;

  const newHeroOpacity = showHeroes ? '1' : '0';
  if (heroLayer.style.opacity !== newHeroOpacity) {
    heroLayer.style.opacity = newHeroOpacity;
    heroLayer.style.pointerEvents = showHeroes ? '' : 'none';
    heroLayer.classList.toggle('heroes-hidden', !showHeroes);
    heroNamesLayer.style.opacity = newHeroOpacity;
    heroNamesLayer.style.pointerEvents = showHeroes ? '' : 'none';
    heroDotsScreen.style.opacity = newHeroOpacity;
    heroDotsScreen.style.pointerEvents = showHeroes ? '' : 'none';
  }
  // Show world event labels always when heroes are hidden; hover-only when heroes visible
  worldLayer.classList.toggle('world-labels-always', !showHeroes);
  worldLayer.classList.toggle('heroes-hidden', !showHeroes);
  worldLayer.classList.toggle('world-events-hidden', !showWorldEvents);
  worldLayer.classList.toggle('age-bounds-hidden',   !showAgeBounds);

  // Update button labels to reflect current visibility
  const btnWE = document.getElementById('btn-show-world-events');
  const btnAB = document.getElementById('btn-show-age-bounds');
  const btnH  = document.getElementById('btn-show-heroes');
  const btnSI = document.getElementById('btn-show-set-icons');
  if (btnWE) btnWE.textContent = showWorldEvents ? 'Hide World Events'   : 'Show World Events';
  if (btnAB) btnAB.textContent = showAgeBounds   ? 'Hide Age Boundaries' : 'Show Age Boundaries';
  if (btnH)  btnH.textContent  = showHeroes      ? 'Hide Heroes'         : 'Show Heroes';
  if (btnSI) btnSI.textContent = showSetIcons    ? 'Hide Set Icons'      : 'Show Set Icons';


  const invZ = 1 / zoom;
  track.style.setProperty('--inv-zoom', invZ);

  // Update all counter-scale transforms directly in JS — same task as the track
  // transform update, so no compositor-thread lag can cause a stretched frame.
  const scaleX      = `scaleX(${invZ})`;
  const centeredPin = `translate(-50%, -50%) scaleX(${invZ})`;
  eraLabelEls.forEach(el      => { el.style.transform = scaleX; });
  tickLabelEls.forEach(el     => { el.style.transform = `scaleX(${invZ}) rotate(-40deg)`; });
  eventDotEls.forEach(el      => { el.style.transform = `scaleX(${invZ}) rotate(45deg)`; });
  eventLabelEls.forEach(el    => { el.style.transform = scaleX; });
  convergencePinEls.forEach(el => { el.style.transform = centeredPin; });
  setImgEls.forEach(el        => { el.style.transform = scaleX; });

  if (!tickEls) tickEls = Array.from(worldLayer.querySelectorAll('.tick'));
  tickEls.forEach(tick => {
    const vis = zoom >= parseFloat(tick.dataset.minZoom) ? '' : 'none';
    if (tick.style.display !== vis) tick.style.display = vis;
  });

  zoomDisplay.textContent = zoom < 0.1
    ? zoom.toFixed(3) + '×'
    : zoom < 1
      ? zoom.toFixed(2) + '×'
      : zoom.toFixed(1) + '×';

  updateStickyLabels();
}

// Lightweight update — call when only panX changes (arrow keys, drag)
function applyPanOnly() {
  track.style.transform = `translateX(${panX}px) scaleX(${zoom})`;
  updateStickyLabels();
}

// ─── Animated pan ─────────────────────────────────────────────────────────────
let panAnimId = null;

function animatePanTo(targetPanX, duration = 500) {
  if (panAnimId) cancelAnimationFrame(panAnimId);
  const startPanX = panX;
  const startTime = performance.now();
  function tick(now) {
    const t = Math.min(1, (now - startTime) / duration);
    const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
    panX = startPanX + (targetPanX - startPanX) * eased;
    applyPanOnly();
    panAnimId = t < 1 ? requestAnimationFrame(tick) : null;
  }
  panAnimId = requestAnimationFrame(tick);
}

function jumpToNextEvent(hero) {
  const evts = hero.events
    .filter(e => e.year !== null)
    .sort((a, b) => a.year - b.year);
  if (evts.length === 0) return;

  const vw = viewport.clientWidth;
  const centerTrackX = (vw / 2 - panX) / zoom;

  // First event to the right of the current viewport centre; wrap to first
  const target = evts.find(e => yearToX(e.year) > centerTrackX + 1) ?? evts[0];
  const targetPanX = clampPan(vw / 2 - yearToX(target.year) * zoom, zoom);
  animatePanTo(targetPanX);
}

// ─── Zoom ─────────────────────────────────────────────────────────────────────
function zoomAt(clientX, factor) {
  const vw = viewport.getBoundingClientRect().left;
  const xInTrack = (clientX - vw - panX) / zoom;

  const minZoom = (viewport.clientWidth - 80) / TRACK_WIDTH;
  const newZoom = Math.min(MAX_ZOOM, Math.max(minZoom, zoom * factor));
  panX = clientX - vw - xInTrack * newZoom;
  panX = clampPan(panX, newZoom);
  zoom = newZoom;

  applyTransform();
}

function clampPan(p, z) {
  const vw = viewport.clientWidth;
  const trackW = TRACK_WIDTH * z;
  const minPan = vw - trackW - 40;
  const maxPan = 40;
  return Math.min(maxPan, Math.max(minPan, p));
}

function resetView() {
  const vw = viewport.clientWidth;
  const vh = viewport.clientHeight;
  // Fit entire track in viewport with some margin
  const newZoom = (vw - 80) / TRACK_WIDTH;
  zoom = newZoom;
  panX = 40;
  applyTransform();
}

// ─── Events ───────────────────────────────────────────────────────────────────

// Wheel
viewport.addEventListener('wheel', e => {
  e.preventDefault();
  const factor = e.deltaY < 0 ? 1.12 : 1 / 1.12;
  zoomAt(e.clientX, factor);
}, { passive: false });

// Drag / pan
viewport.addEventListener('mousedown', e => {
  if (e.target.closest('.world-event, .set-marker, .hero-dot, #tooltip, #menu-overlay')) return;
  isDragging   = true;
  dragStartX   = e.clientX;
  dragStartPan = panX;
  viewport.style.cursor = 'grabbing';
});
window.addEventListener('mousemove', e => {
  if (!isDragging) return;
  panX = clampPan(dragStartPan + (e.clientX - dragStartX), zoom);
  applyPanOnly();
});
window.addEventListener('mouseup', () => {
  isDragging = false;
  viewport.style.cursor = '';
});

// Touch pinch-to-zoom
let lastTouches = null;
viewport.addEventListener('touchstart', e => {
  lastTouches = e.touches;
}, { passive: true });

viewport.addEventListener('touchmove', e => {
  e.preventDefault();
  if (e.touches.length === 2 && lastTouches && lastTouches.length === 2) {
    const prevDist = Math.hypot(
      lastTouches[0].clientX - lastTouches[1].clientX,
      lastTouches[0].clientY - lastTouches[1].clientY,
    );
    const currDist = Math.hypot(
      e.touches[0].clientX - e.touches[1].clientX,
      e.touches[0].clientY - e.touches[1].clientY,
    );
    const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
    zoomAt(midX, currDist / prevDist);
  } else if (e.touches.length === 1 && lastTouches && lastTouches.length === 1) {
    const dx = e.touches[0].clientX - lastTouches[0].clientX;
    panX = clampPan(panX + dx, zoom);
    applyPanOnly();
  }
  lastTouches = e.touches;
}, { passive: false });

// Buttons
document.getElementById('btn-zoom-in' ).addEventListener('click', () => zoomAt(viewport.clientWidth / 2, 1.5));
document.getElementById('btn-zoom-out').addEventListener('click', () => zoomAt(viewport.clientWidth / 2, 1 / 1.5));
document.getElementById('btn-reset'   ).addEventListener('click', resetView);

// Jump to modern era
document.getElementById('btn-jump-modern').addEventListener('click', () => {
  const vw = viewport.clientWidth;
  zoom = vw / (1500 * 12);   // fit ~12 modern years in viewport
  panX = clampPan(40 - yearToX(249) * zoom, zoom);
  applyTransform();
});

// Toggle: read current visibility from DOM so override works at any zoom level
document.getElementById('btn-show-world-events').addEventListener('click', () => {
  worldEventsOverride = worldLayer.classList.contains('world-events-hidden');
  applyTransform();
});

document.getElementById('btn-show-age-bounds').addEventListener('click', () => {
  ageBoundsOverride = worldLayer.classList.contains('age-bounds-hidden');
  applyTransform();
});

document.getElementById('btn-show-heroes').addEventListener('click', () => {
  heroesOverride = heroLayer.classList.contains('heroes-hidden');
  applyTransform();
});

document.getElementById('btn-show-set-icons').addEventListener('click', () => {
  setIconsOverride = setLayer.style.opacity === '0';
  applyTransform();
});

// Legend minimize toggle
document.getElementById('legend-toggle').addEventListener('click', () => {
  const legend = document.getElementById('legend');
  const btn    = document.getElementById('legend-toggle');
  legend.classList.toggle('minimized');
  btn.textContent = legend.classList.contains('minimized') ? '+' : '−';
});

// Legend drag
(function () {
  const legend = document.getElementById('legend');
  const header = legend.querySelector('.legend-header');
  let dragging = false, offX = 0, offY = 0;

  header.addEventListener('mousedown', e => {
    if (e.target.id === 'legend-toggle') return;
    e.preventDefault();
    e.stopPropagation();
    const rect = legend.getBoundingClientRect();
    legend.style.bottom = 'auto';
    legend.style.right  = 'auto';
    legend.style.top    = rect.top  + 'px';
    legend.style.left   = rect.left + 'px';
    offX = e.clientX - rect.left;
    offY = e.clientY - rect.top;
    dragging = true;
    header.style.cursor = 'grabbing';
  });

  document.addEventListener('mousemove', e => {
    if (!dragging) return;
    legend.style.left = Math.max(0, e.clientX - offX) + 'px';
    legend.style.top  = Math.max(0, e.clientY - offY) + 'px';
  });

  document.addEventListener('mouseup', () => {
    if (!dragging) return;
    dragging = false;
    header.style.cursor = '';
  });
}());

// Hamburger
hamburgerBtn.addEventListener('click', e => {
  e.stopPropagation();
  menuOverlay.classList.toggle('open');
});
menuOverlay.addEventListener('click', e => {
  if (e.target === menuOverlay) menuOverlay.classList.remove('open');
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') menuOverlay.classList.remove('open');
});

// Keyboard pan / zoom — smooth arrow-key scrolling via rAF velocity loop
const arrowKeys = { ArrowLeft: false, ArrowRight: false };
let arrowRafId = null;
const ARROW_PAN_SPEED = 10; // px per frame (~600 px/s at 60 fps)

function arrowTick() {
  if (!arrowKeys.ArrowLeft && !arrowKeys.ArrowRight) {
    arrowRafId = null;
    return;
  }
  if (arrowKeys.ArrowLeft)  panX = clampPan(panX + ARROW_PAN_SPEED, zoom);
  if (arrowKeys.ArrowRight) panX = clampPan(panX - ARROW_PAN_SPEED, zoom);
  applyPanOnly();
  arrowRafId = requestAnimationFrame(arrowTick);
}

document.addEventListener('keydown', e => {
  if (['INPUT', 'LABEL'].includes(e.target.tagName)) return;
  if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
    e.preventDefault();
    if (!arrowKeys[e.key]) {
      arrowKeys[e.key] = true;
      if (!arrowRafId) arrowRafId = requestAnimationFrame(arrowTick);
    }
    return;
  }
  if (e.key === '+' || e.key === '=') zoomAt(viewport.clientWidth / 2, 1.2);
  if (e.key === '-')                  zoomAt(viewport.clientWidth / 2, 1 / 1.2);
  if (e.key === '0')                  resetView();
});

document.addEventListener('keyup', e => {
  if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') arrowKeys[e.key] = false;
});

// ─── Rebuild all layers (called on era collapse/expand) ───────────────────────
function rebuildAll() {
  clearHeroHighlight();
  worldLayer.innerHTML = '';
  setLayer.innerHTML        = '';
  heroLayer.innerHTML       = '';
  heroNamesLayer.innerHTML  = '';
  heroDotsScreen.innerHTML  = '';
  tickEls = null;
  heroLabelData.length  = 0;
  heroDotData.length    = 0;
  eraLabelEls       = [];
  tickLabelEls      = [];
  eventDotEls       = [];
  eventLabelEls     = [];
  convergencePinEls = [];
  setImgEls         = [];

  TRACK_WIDTH = computeTrackWidth();
  TICK_X      = TICK_YEARS.map(yearToX);

  track.style.width = TRACK_WIDTH + 'px';

  buildWorldLayer();
  buildSetLayer();
  buildHeroFanLayer();

  heroSVG.setAttribute('width', TRACK_WIDTH);

  const minZ = (viewport.clientWidth - 80) / TRACK_WIDTH;
  zoom = Math.max(minZ, zoom);
  panX = clampPan(panX, zoom);
  applyTransform();
}

// ─── Resize / browser-zoom ────────────────────────────────────────────────────
// Chrome's native zoom changes viewport.clientWidth in CSS px, which makes
// panX clamping and stickyTrackX stale. Re-clamp and re-render on resize.
let resizeRafId = null;
window.addEventListener('resize', () => {
  if (resizeRafId) return;
  resizeRafId = requestAnimationFrame(() => {
    resizeRafId = null;
    panX = clampPan(panX, zoom);
    applyTransform();
  });
});

// ─── Init ─────────────────────────────────────────────────────────────────────
track.style.width    = TRACK_WIDTH + 'px';
setLayer.style.width = TRACK_WIDTH + 'px';
buildWorldLayer();
buildSetLayer();
buildHeroFanLayer();
buildMenu();
resetView();
