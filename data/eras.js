const ERAS = [
  { id: 'era-1', start: -750, end: -500, label: 'First Age'  },
  { id: 'era-2', start: -500, end: -100, label: 'Second Age' },
  { id: 'era-3', start: -100, end:    0, label: 'Third Age'  },
  { id: 'era-4', start:    0, end:  250, label: 'Fourth Age (Age of Man)' },
  { id: 'era-5', start:  250, end:  260, label: 'War of Solana' },
];

const SEGMENTS = [
  { eraId: 'era-1', start:  -750, end: -500, pxPerYr:   3 },
  { eraId: 'era-2', start:  -500, end: -100, pxPerYr:   3 },
  { eraId: 'era-3', start:  -100, end:    0, pxPerYr:   8 },
  { eraId: 'era-4', start:     0, end:  250, pxPerYr:  20 },
  { eraId: 'era-5', start:   250, end:  260, pxPerYr: 600 },
];

const WORLD_EVENTS = [
  { year: -750,   type: 'age', label: 'First Age Begins' },
  { year: -750,                label: 'Humans appear on Rathe',
    reasoning: [
      { description: 'This is now no longer true, but in the original lore book "Long ago, humans arrived on the shores of Rathe from a distant land, "', url: 'https://legendarystories.net/archive/world-of-rathe/rathe.html?highlight=Humans%20apear%20on%20rathe#the-world-of-rathe' }
    ] },
  { year: -700,                label: 'Volcor is founded†',
    reasoning: [
      { description: 'The volcanic empire of Volcor is established. Estimated date.', url: 'https://legendarystories.net/world-of-rathe/volcor.html' },
      { description: 'Source', url: 'https://www.youtube.com/watch?v=uKeKuaJ4nlw' }
    ] },
  { year: -500,   type: 'age', label: 'First Age Ends*\nSecond Age Begins*' },
  { year: -400,                label: 'Ikaru founded',
    reasoning: [
      { description: 'Ikaru was founded 400 years before the war of the ancients', url: 'https://legendarystories.net/world-of-rathe/misteria.html#ikaru' }
    ] },
  { year: -100,   type: 'age', label: 'Second Age Ends*\nThird Age begins*\n' },
  { year: -100,                label: 'The First Grand Magister, the Devout, leads Solana',
    reasoning: [
      { description: 'The Devout takes their role', url: 'https://legendarystories.net/world-of-rathe/solana.html#grand-magisters' }
    ] },
  { year:  -25,                label: 'The Devout becomes the Apostate and leaves Solana\nDemonastery founded',
    reasoning: [
      { description: 'The Devout flees Solana', url: 'https://legendarystories.net/world-of-rathe/demonastery.html' }
    ] },
  { year:  -25,                label: 'The Second Grand Magister, the Adamant, leads Solana',
    reasoning: [
      { description: 'The Adamant takes their role', url: 'https://legendarystories.net/world-of-rathe/solana.html#grand-magisters' }
    ] },
  { year:  -7,                label: 'Valahai is founded',
  reasoning: [
    { description: 'Valahi was founded at the start of the war of the ancients', url: 'https://legendarystories.net/world-of-rathe/aria.html#valahai' }
  ] },
  { year: -7,               label: 'The War of the Ancients begins',
    reasoning: [
      { description: 'Aurora slid the symbols for 90 into place', url: 'https://legendarystories.net/main-story/rosetta/secret-of-the-aetherscribes.html' }
    ] },
  { year:    0,   type: 'age', label: 'End of Third Age\nFourth Age begins' },
  { year:    0,                label: 'War of the Ancients ends',
    reasoning: [
      { description: 'The ancients sacrficies ends the war', url: 'https://legendarystories.net/main-story/armory-decks/battle-of-isenloft.html' }
    ] },
  { year:    0,                label: 'Rathe, i’Arathael, and the Nebulus rift split apart',
    reasoning: [
      { description: 'We know the ancients in their deaths, split the world into three parts', url: 'https://legendarystories.net/main-story/omens-of-the-third-age/omens-in-the-sky.html' }
    ] },
  { year:    0,                label: 'Ikaru Falls',          below: true,
    reasoning: [
      { description: 'The Dark tide, creatures that reflect the creatures that attacked during the war of the ancinets attack Mistviel', url: 'https://legendarystories.net/main-story/crucible-of-war/edge-of-autumn.html' }
    ] },
  { year:    0,                label: 'Isen Falls',           below: true,
    reasoning: [
      { description: 'Glacia dies entombing Isen in ic', url: 'https://legendarystories.net/main-story/armory-decks/battle-of-isenloft.html' }
    ] },
  { year:    0,                label: 'Aldengrove Falls',     below: true,
    reasoning: [
      { description: 'The Queen Calvera sacrfices her people to stop the old ones', url: 'https://legendarystories.net/main-story/tales-of-aria/amongst-the-brambles.html' }
    ] },
  { year:    0,                label: 'Dhani Empire Falls†',  below: true,
    reasoning: [
      { description: 'There is no sure date, but it was self destroyed by hubirus, and sunk under the sea, could an ancient\'s death, that lived there have caused the downfall', url: 'https://legendarystories.net/world-of-rathe/high-seas.html#the-dhani-empire' }
    ] },
  { year:   25,                label: 'The Apostate sacrifices himself to hide the Demonastery from Solana, in the nebulus rift',
    reasoning: [
      { description: 'The Apostate Dies to hide the Demonastery', url: 'https://legendarystories.net/world-of-rathe/demonastery.html#drifting-between-planes' }
    ] },
  { year:   50,                label: 'The Third Grand Magister, the Radiant, leads Solana*',
    reasoning: [
      { description: 'The Radiant takes their role', url: 'https://legendarystories.net/world-of-rathe/solana.html#grand-magisters' }
    ] },
  { year:   50,                label: 'Metrix is founded*',       below: true,
    reasoning: [{ description: 'There is not a lot of information available about the founding of Metrix, as date wise, but there is no mentions of any wars or old ones, so we put it after the war of the ancients', url: 'https://legendarystories.net/world-of-rathe/metrix.html#cogwerx-conglomerate' }

    ] },
  { year:   40,                label: 'The Pits start to form*',  below: true,
    reasoning: [
      { description: 'We know for sure the pits has to come after Metrix, as it is the mining of metrix that forms them', url: 'https://legendarystories.net/world-of-rathe/pits.html' }
    ] },
  { year:  100,                label: 'Anarch Zeir Jorunies to the deepest recesses of the Pits†',
    reasoning: [
      { description: 'Anarch Zeir Jorunies to the deepest recesses of the Pits', url: 'https://legendarystories.net/world-of-rathe/pits.html#lapocalypta' }
    ] },
  { year:  103,                label: 'L’Apocalypta is founded†',
    reasoning: [
      { description: 'Anarch Zeir returns from the pits with forbidden knowledge', url: 'https://legendarystories.net/world-of-rathe/pits.html#lapocalypta' }
    ] },
  { year:  125,                label: 'The Fourth Grand Magister, the Beloved, leads Solana*',
    reasoning: [
            { description: 'The Beloved takes their role', url: 'https://legendarystories.net/world-of-rathe/solana.html#grand-magisters' }
    ] },
  { year:  180,                label: "Piper's Pier is founded*",
    reasoning: [{ description: 'Decades ago, ingenious pioneers from Metrix...  building the network of boilers and pipes that gave the place its name.', url: 'https://legendarystories.net/world-of-rathe/high-seas.html#pipers-pier' }] },
  { year:  200,                label: 'The Fifth Grand Magister, the Steadfast, leads Solana*',
    reasoning: [
      { description: 'The Steadfast takes their role', url: 'https://legendarystories.net/world-of-rathe/solana.html#grand-magisters' }
    ] },
  { year:  220,                label: 'Hamilton Scarborough expedition into the Savage Lands†',
    reasoning: [
      { description: 'We know of his writtings, but there is no confirmed time line of when it was', url: 'https://legendarystories.net/world-of-rathe/savage-lands.html#call-of-adventure' }
    ] },
  { year:  230,                label: 'Volcore Civil War*',
    reasoning: [
      { description: 'There was a civil war before the current Emperor was crowned', url: 'https://legendarystories.net/world-of-rathe/volcor.html#the-emperor' }
    ] },
  { year:  247,                label: 'Viserai opens the Vitate gateway to i’Arathael', convergence: true },
  { year:  250,   type: 'age', label: 'War for Solana begins' },
  { year:  250.6,              label: 'Grand Everfest — Secrets of Aria\nHeroes gather across Aria', convergence: true },
  { year:  252,                label: 'Rathe unites against the Demonastery Invasion',              convergence: true },
  { year:  252.3,              label: 'Bright Lights — Metrix\nMultiple fates converge',            convergence: true },
  { year:  253.3,              label: 'The Queen of Candlehold, Calvera, dies\nCandlehold opens to Aria for the first time', convergence: true },
];

const SETS = [
  { year:   0,     label: 'Mastery Pack Guardian',  short: 'MPG', img: 'assets/mpg.png' },
  { year: 250,     label: 'Welcome to Rathe',       short: 'WTR', img: 'assets/wtr.png' },
  { year: 250,     label: 'Arcane Rising',          short: 'ARC', img: 'assets/arc.png' },
  { year: 250,     label: 'Crucible of War',        short: 'CRU', img: 'assets/cru.png' },
  { year: 250.3,   label: 'Monarch',                short: 'MON', img: 'assets/mon.png' },
  { year: 250.3,   label: 'Tales of Aria',          short: 'ELE', img: 'assets/ele.png' },
  { year: 250.6,   label: 'Everfest',               short: 'EVR', img: 'assets/evr.png' },
  { year: 251.0,   label: 'Uprising',               short: 'UPR', img: 'assets/upr.png' },
  { year: 251.3,   label: 'Dynasty',                short: 'DYN', img: 'assets/dyn.png' },
  { year: 251.6,   label: 'Outsiders',              short: 'OUT', img: 'assets/out.png' },
  { year: 252.0,   label: 'Dusk Till Dawn',         short: 'DTD', img: 'assets/dtd.png' },
  { year: 252.3,   label: 'Bright Lights',          short: 'EVO', img: 'assets/evo.png' },
  { year: 252.6,   label: 'Heavy Hitters',          short: 'HVY', img: 'assets/hvy.png' },
  { year: 253.0,   label: 'Part the Mistveil',      short: 'MST', img: 'assets/mst.png' },
  { year: 253.3,   label: 'Rosetta',                short: 'ROS', img: 'assets/ros.png' },
  { year: 253.6,   label: 'The Hunted',             short: 'HNT', img: 'assets/hnt.png' },
  { year: 254.0,   label: 'High Seas',              short: 'SEA', img: 'assets/sea.png' },
  { year: 254.3,   label: 'Super Slam',             short: 'SUP', img: 'assets/sup.png' },
  { year: 254.6,   label: 'Omens of the Third Age', short: 'OMN', img: 'assets/omn.png' },
];
