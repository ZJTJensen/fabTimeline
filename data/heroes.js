const HEROES = [
  {
    id: 'arakni-huntsman', name: 'Arakni, Huntsman', class: ['Assassin'], talent: ['None'], region: 'The Pits',
    color: '#6b7280',
    description: 'Once a test subject of the South Maw Asylum, now a professional assassin',
    events: [
      { year: 244,   label: 'Patient 1413 is discovered by Dr Krest Mortimer', url: 'https://legendarystories.net/main-story/outsiders/the-iconoclast-trials.html' },
      { year: 250,   label: 'Patient 1413 escapes', url: 'https://legendarystories.net/main-story/outsiders/the-iconoclast-trials.html' },
      { year: 251.3, label: 'Arakni assassinates the Emperor of Volcor', url: 'https://legendarystories.net/main-story/dynasty/the-blood-stained-web.html' },
      { year: 251.6, label: 'Arakni Returns to the Pits, and discovers the assassination was a trap', url: 'https://legendarystories.net/main-story/outsiders/the-spiders-trap.html' },
      { year: 253.6, label: 'Arakni is hunted across Rathe', url: 'https://legendarystories.net/main-story/the-hunted/children-of-chaos.html' },
    ],
  },
  {
    id: 'arakni-marionette', name: 'Arakni, Mariontte', class: ['Assassin'], talent: ['Chaos'], region: 'The Pits',
    color: '#6b7280',
    description: 'A brood of professional assassins',
    events: [
      { year: 253.6, label: 'Arakni is hunted across Rathe', url: 'https://legendarystories.net/main-story/the-hunted/children-of-chaos.html' },
    ],
  },
  {
    id: 'arakni-crack', name: 'Arakni, Slipped through the Crack', class: ['Assassin'], talent: ['Chaos'], region: 'The Pits',
    color: '#6b7280',
    description: 'Once a experiment in the South Maw Asylum, now a member of the brood',
    events: [
      { year: 251,   label: 'Slippy is created by Dr. Mortimer, shortly after Huntsman\'s escape' },
      { year: 253.6, label: 'Arakni is hunted across Rathe', url: 'https://legendarystories.net/main-story/the-hunted/children-of-chaos.html' },
    ],
  },
  {
    id: 'aurora', name: 'Aurora, Shooting Star', class: ['Runeblade'], talent: ['Elemental', 'lightning'], region: 'Aria',
    color: '#a3e635',
    description: 'A rambunctious wayfarer with a thirst for adventure',
    events: [
      { year: 253.3, label: 'Aurora, Shooting Star explores Aria\'s vaults and discovers Oscilio', url: 'https://legendarystories.net/main-story/rosetta/secret-of-the-aetherscribes.html' },
      { year: 254.6, label: 'Aurora and Oscilio fight against the Omens', url: 'https://legendarystories.net/main-story/omens-of-the-third-age/omens-in-the-sky.html' },
    ],
  },
  {
    id: 'azalea', name: 'Azalea', class: ['Ranger'], talent: ['None'], region: 'The Pits',
    color: '#68d391',
    description: 'A skilled ranger from the depths of the Pits',
    events: [
      { year: 241, label: 'Azalea\'s origin begins — child of ~10 years', url: 'https://legendarystories.net/main-story/arcane-rising/slings-and-arrows.html' },
      { year: 249, label: 'Azalea — grown professional assassin with contacts', url: 'https://legendarystories.net/main-story/arcane-rising/cards-on-the-table.html' },
    ],
  },
  {
    id: 'benji', name: 'Benji, The Piercing Wind', class: ['Ninja'], talent: ['None'], region: 'Misteria',
    color: '#a78bfa',
    description: 'A nimble and elusive ninja from the realm of Misteria',
    events: [
      { year: 251.6, label: 'Benji travels Misteria', url: 'https://legendarystories.net/main-story/arcane-rising/a-bird-in-the-hand.html' },
    ],
  },
  {
    id: 'betsy', name: 'Betsy, Skin in the Game', class: ['Guardian'], talent: ['None'], region: 'Deathmatch Arena', deathmatch: true,
    color: '#9b2335',
    description: 'A brawler with a thirst for gambling and a knack for winning, Betsy is a fan favorite in the Deathmatch Arena',
    events: [
      { year: 252.6, label: 'Betsy dominates the Deathmatch Arena', url: 'https://legendarystories.net/main-story/heavy-hitters/arena-announcements.html' },
      { year: 254.3, label: 'Betsy remains in the Deathmatch Arena', url: 'https://legendarystories.net/main-story/super-slam/feudmasters.html' },
    ],
  },
  {
    id: 'boltyn', name: 'Boltyn', class: ['Warrior'], talent: ['Light'], region: 'Solana',
    color: '#ffd700',
    description: 'A warrior from the Northern Realms with a strong sense of duty',
    events: [
      { year: 220,    label: 'Boltyn born in the Northern Realms', url: 'https://legendarystories.net/main-story/monarch/sworn-to-protect.html' },
      { year: 241,    label: 'Boltyn marries Erina', url: 'https://legendarystories.net/main-story/monarch/sworn-to-protect.html' },
      { year: 245,    label: 'Aeos is born', url: 'https://legendarystories.net/main-story/monarch/sworn-to-protect.html' },
      { year: 246,    label: 'Erina Dies', url: 'https://legendarystories.net/main-story/monarch/sworn-to-protect.html', death: true },
      { year: 250,    label: 'Boltyn Stands against the Shadow', url: '' },
      { year: 251.3,  label: 'Boltyn receives Shiyana', url: 'https://legendarystories.net/main-story/outsiders/tidings-in-the-light.html' },
      { year: 252,    label: 'Heroes fights against the shadow', url: 'https://legendarystories.net/main-story/dusk-till-dawn/unity-in-light.html' },
      { year: 254.45, label: 'The war rages on', url: 'https://legendarystories.net/main-story/compendium-of-rathe/vow-unbroken.html' },
    ],
  },
  {
    id: 'bravo', name: 'Bravo, Showstopper', class: ['Guardian'], talent: ['Elemental', 'None'], region: 'Aria',
    color: '#4299e1',
    description: 'Leader of the ',
    events: [
      { year: 235,   label: 'Bravo begins as a carnival performer', url: 'https://legendarystories.net/main-story/welcome-to-rathe/a-rising-star.html' },
      { year: 245,   label: 'Bravo Fights back the encroaching darkness', url: 'https://legendarystories.net/main-story/welcome-to-rathe/a-rising-star.html' },
      { year: 250.6, label: 'Stars at the grand Everfest carnival' },
      { year: 252,   label: 'Heroes fights against the shadow', url: 'https://legendarystories.net/main-story/dusk-till-dawn/unity-in-light.html' },
    ],
  },
  {
    id: 'brevant', name: 'Brevant, Civic Protector', class: ['Guardian'], talent: ['None'], region: 'Solana',
    color: '#c9a227',
    description: '',
    events: [
      { year: 249, label: 'Brevant patrols Solana\'s borders', url: 'https://legendarystories.net/short-stories/round-the-table/brevant-civic-protector.html' },
    ],
  },
  {
    id: 'briar', name: 'Briar, Warden of Thorns', class: ['Runeblade'], talent: ['Elemental'], region: 'Aria',
    color: '#16a34a',
    description: '',
    events: [
      { year: 105,   label: 'Briar is born', url: 'https://legendarystories.net/main-story/tales-of-aria/amongst-the-brambles.html' },
      { year: 250.3, label: 'Briar ventures out of Candlehold into Aria', url: 'https://legendarystories.net/main-story/tales-of-aria/amongst-the-brambles.html' },
      { year: 250.6, label: 'Briar joins Lexi to discover the secrets of Aria', url: 'https://legendarystories.net/main-story/everfest/a-grand-adventure.html' },
      { year: 252,   label: 'Heroes fights against the shadow', url: 'https://legendarystories.net/main-story/dusk-till-dawn/unity-in-light.html' },
      { year: 254.45, label: 'The war rages on', url: 'https://legendarystories.net/main-story/compendium-of-rathe/vow-unbroken.html' },
    ],
  },
  {
    id: 'chane', name: 'Chane', class: ['Shadow Runeblade'], talent: ['Shadow'], region: 'Demonastery',
    color: '#805ad5',
    description: '',
    events: [
      { year: 247, label: 'Chane Enters  íArathael, and finds Ursur', url: 'https://legendarystories.net/main-story/monarch/emissary-of-the-void.html' },
      { year: 249, label: 'Chane finds Levia and teams up to fight Solana', url: 'https://legendarystories.net/main-story/monarch/harbinger-of-the-abyss.html' },
    ],
  },
  {
    id: 'cindra', name: 'Cindra, Dracai of Retribution', class: ['Ninja'], talent: ['Draconic'], region: 'Volcor',
    color: '#ef4444',
    description: '',
    events: [
      { year: 253.6, label: 'Cindra pursues the Dynasty\'s betrayers', url: 'https://legendarystories.net/main-story/the-hunted/mark-of-a-traitor.html' },
    ],
  },
  {
    id: 'dash', name: 'Dash', class: ['Mechanologist'], talent: ['None'], region: 'Metrix',
    color: '#00d4ff',
    description: '',
    events: [
      { year: 247,   label: 'Teenage inventor in Metrix', url: 'https://legendarystories.net/main-story/arcane-rising/stroke-of-genius.html', noConvergence: true },
      { year: 252.3, label: 'Dash joins forces with Maxx Nitro and discovers Data Doll', url: 'https://legendarystories.net/main-story/bright-lights/synthetic-futures.html' },
      { year: 254,   label: 'Dash attempts to show off an invention for Teklo Industries', url: 'https://legendarystories.net/main-story/armory-decks/boom-town-boom.html' },
    ],
  },
  {
    id: 'data-doll', name: 'Data Doll MKII', class: ['Mechanologist'], talent: ['None'], region: 'Metrix',
    color: '#48cae4',
    description: '',
    events: [
      { year: 252.3, label: 'Data Doll MKII operational in Metrix' },
      { year: 252.3, label: 'Dash joins forces with Maxx Nitro and discovers Data Doll', url: 'https://legendarystories.net/main-story/bright-lights/synthetic-futures.html' },
    ],
  },
  {
    id: 'dorinthea', name: 'Dorinthea Ironsong', class: ['Warrior'], talent: ['None'], region: 'Solana',
    color: '#f6e05e',
    description: '',
    events: [
      { year: 230, label: 'Dorinthea is chosen by Sol to become a Warrior', url: 'https://legendarystories.net/main-story/welcome-to-rathe/pride-of-the-ironsongs.html' },
      { year: 240, label: 'Dorinthea is a squire for the hand of Sol', url: 'https://legendarystories.net/main-story/welcome-to-rathe/pride-of-the-ironsongs.html' },
      { year: 250, label: 'Dorinthea is at the initial invasion of the Demonastery', url: 'https://legendarystories.net/main-story/crucible-of-war/no-smoke-without-fire.html' },
      { year: 252, label: 'Morlok Hill', url: 'https://legendarystories.net/main-story/interlude/morlock-hill.html' },
      { year: 252, label: 'Heroes fights against the shadow', url: 'https://legendarystories.net/main-story/dusk-till-dawn/unity-in-light.html' },
    ],
  },
  {
    id: 'dromai', name: 'Dromai, Ash Artist', class: ['Illusionist'], talent: ['Draconic'], region: 'Volcor',
    color: '#c2410c',
    description: '',
    events: [
      { year: 241,   label: 'Dromai is taken from her village' },
      { year: 251,   label: 'Dromai, Fights on the front lines of the Emperor\'s army', url: 'https://legendarystories.net/main-story/uprising/dragons-of-empire.html' },
      { year: 251.3, label: 'Dromai witnesses the fall of the Emperor', url: 'https://legendarystories.net/main-story/dynasty/ember-in-the-ash.html' },
    ],
  },
  {
    id: 'emperor', name: 'Emperor, Dracai of Aesir', class: ['Wizard', 'Warrior'], talent: ['Draconic'], region: 'Volcor',
    color: '#b45309',
    description: '',
    events: [
      { year: 230,   label: 'The Emperor communes with the Asier of Flames', url: 'https://legendarystories.net/main-story/dynasty/emperor-the-one-emperor.html' },
      { year: 251.3, label: 'The Emperor is assassinated', url: 'https://legendarystories.net/main-story/dynasty/ember-in-the-ash.html', death: true },
    ],
  },
  {
    id: 'enigma', name: 'Enigma', class: ['Illusionist'], talent: ['Mystic'], region: 'Misteria',
    color: '#1d4ed8',
    description: '',
    events: [
      { year: -500, label: 'Fumei and Nuu study together at the Immortal Lunar Shrine', url: 'https://legendarystories.net/main-story/part-the-mistveil/part-4-the-hare-and-the-snake.html' },
      { year:  254, label: 'Enigma hunts down the evil spirit Nuu', url: 'https://legendarystories.net/main-story/part-the-mistveil/part-2-the-tapestry-unfolds.html' },
    ],
  },
  {
    id: 'fai', name: 'Fai, Rising Rebellion', class: ['Ninja'], talent: ['Draconic'], region: 'Volcor',
    color: '#fb923c',
    description: '',
    events: [
      { year: 241, label: 'Fai\'s village is burnt down' },
      { year: 251, label: 'Fai fights for the Rising Rebellion', url: 'https://legendarystories.net/main-story/uprising/fires-of-rebellion.html' },
    ],
  },
  {
    id: 'fang', name: 'Fang, Dracai of Blades', class: ['Warrior'], talent: ['Draconic'], region: 'Volcor',
    color: '#dc2626',
    description: '',
    events: [
      { year: 253.6, label: 'Fang pursues the Dynasty\'s betrayers', url: 'https://legendarystories.net/main-story/the-hunted/mark-of-a-traitor.html' },
    ],
  },
  {
    id: 'florian', name: 'Florian, Rotwood Harbinger', class: ['Runeblade'], talent: ['Elemental'], region: 'Aria',
    color: '#15803d',
    description: '',
    events: [
      { year: 253.3, label: 'Florian and Verdance clash for the future of Candlehold', url: 'https://legendarystories.net/main-story/rosetta/roots-of-change.html' },
    ],
  },
  {
    id: 'frankie', name: 'Frankie Baggins', class: ['Necromancer'], talent: ['None'], region: '',
    color: '#4b5563',
    description: '',
    events: [],
  },
  {
    id: 'genis', name: 'Genis Wotchuneed', class: ['Merchant'], talent: ['None'], region: 'Aria',
    color: '#34d399',
    description: '',
    events: [
      { year: 250.6, label: 'Genis spreads his wares across the Everfest in Aria' },
    ],
  },
  {
    id: 'gravy-bones', name: 'Gravy Bones, Shipwrecked Looter', class: ['pirate', 'Necromancer'], talent: ['None'], region: 'High Seas',
    color: '#4b5563',
    description: '',
    events: [
      { year: null, label: 'Gravy Bones\'s origin is raised from the dead by Nocetes' },
      { year: 254,  label: 'Gravy Bones searches for the lost city of Trapl Dahni', url: 'https://legendarystories.net/main-story/high-seas/captain-bones-and-the-city-of-gold.html' },
    ],
  },
  {
    id: 'hala', name: 'Hala, Bladesaint of the Vow', class: ['Warrior'], talent: ['None'], region: 'Solana',
    color: '#e09400',
    description: '',
    events: [
      { year: 200,    label: 'Hala is born* — future commander and mentor of Dorinthea' },
      { year: 240,    label: 'Hala\'s ambush fails due to Dorinthea, and is mortally wounded', url: 'https://legendarystories.net/main-story/welcome-to-rathe/pride-of-the-ironsongs.html' },
      { year: 254.45, label: 'Hala fights off the forces of Shadow', url: 'https://legendarystories.net/main-story/compendium-of-rathe/vow-unbroken.html' },
    ],
  },
  {
    id: 'ira', name: 'Ira, Crimson Haze', class: ['Ninja'], talent: ['None'], region: 'Misteria',
    color: '#d63ddb',
    description: '',
    events: [
      { year: -21, label: 'Ira born in the Valley of Blossoms', url: 'https://legendarystories.net/main-story/crucible-of-war/edge-of-autumn.html' },
      { year:  -7, label: 'Massacre of Ikaru clan — Crimson Haze Rebels founded', url: 'https://legendarystories.net/main-story/crucible-of-war/edge-of-autumn.html' },
      { year:  18, label: 'Ira and Xun reunite and fight off demons', url: 'https://legendarystories.net/main-story/rosetta/to-halt-the-dark.html' },
    ],
  },
  {
    id: 'iyslander', name: 'Iyslander', class: ['Wizard'], talent: ['Elemental'], region: 'Aria',
    color: '#67e8f9',
    description: '',
    events: [
      { year: 240,   label: 'Iyslander flees Volcor' },
      { year: 250.3, label: 'Iyslander returns to volcor', url: 'https://legendarystories.net/main-story/uprising/journey-into-the-forgotten.html' },
    ],
  },
  {
    id: 'jarl', name: 'Jarl Vetreiđi', class: ['Guardian'], talent: ['Elemental'], region: 'Aria',
    color: '#7dd3fc',
    description: '',
    events: [
      { year:   0,   label: 'Jarl Vetreiđi, fights off the old ones', url: 'https://legendarystories.net/main-story/armory-decks/battle-of-isenloft.html' },
      { year: 253.3, label: 'ROS: Jarl thaws from his frozen tomb at Isenloft', url: 'https://legendarystories.net/main-story/mastery-packs/trouble-in-larinkmorth.html' },
    ],
  },
  {
    id: 'kano', name: 'Kano', class: ['Wizard'], talent: ['None'], region: 'Volcor',
    color: '#f6ad55',
    description: '',
    events: [
      { year: 240, label: 'Kano\'s story begins in Volcor', url: 'https://legendarystories.net/main-story/arcane-rising/smoke-and-mirrors.html' },
      { year: 250, label: 'Volcor is attacked from within', url: 'https://legendarystories.net/main-story/arcane-rising/from-the-ashes.html' },
    ],
  },
  {
    id: 'kassai', name: 'Kassai', class: ['Warrior'], talent: ['None'], region: 'Volcor', deathmatch: true,
    color: '#d97706',
    description: '',
    events: [
      { year: 250,   label: 'WTR: Kassai witnesses the invasion of Solana', url: 'https://legendarystories.net/main-story/crucible-of-war/no-smoke-without-fire.html' },
      { year: 252.6, label: 'HVY: Kassai, Cintari Sellsword enters the Arena', url: 'https://legendarystories.net/main-story/heavy-hitters/arena-announcements.html' },
    ],
  },
  {
    id: 'katsu', name: 'Katsu', class: ['Ninja'], talent: ['None'], region: 'Misteria',
    color: '#9f7aea',
    description: '',
    events: [
      { year: 245, label: 'Katsu leaves the Mengushi clan to find a cure for a disease', url: 'https://legendarystories.net/main-story/welcome-to-rathe/wanderings-in-the-mists.html' },
    ],
  },
  {
    id: 'kavdaen', name: 'Kavdaen, Trader of Skins', class: ['Merchant'], talent: ['None'], region: 'The Pits',
    color: '#57534e',
    description: '',
    events: [],
  },
  {
    id: 'kayo', name: 'Kayo, Berserker Runt', class: ['Brute'], talent: ['None'], region: 'Savage Lands',
    color: '#fc8181',
    description: '',
    events: [
      { year: 240,   label: 'Kayo hatches in the Savage Lands' },
    ],
  },
  {
    id: 'levia', name: 'Levia', class: ['Brute'], talent: ['Shadow'], region: 'Demonastery',
    color: '#9b59b6',
    description: '',
    events: [
      { year: 242,    label: 'Levia works at the Barthamont estate', url: 'https://legendarystories.net/main-story/monarch/destroy-and-consume.html' },
      { year: 249,    label: 'Levia is corrupted by lady Barthamont', url: 'https://legendarystories.net/main-story/monarch/destroy-and-consume.html' },
      { year: 249,    label: 'Chane finds Levia and teams up to fight Solana', url: 'https://legendarystories.net/main-story/monarch/harbinger-of-the-abyss.html' },
      { year: 252,    label: 'Levia and Vynnset work together to assault solana', url: 'https://legendarystories.net/main-story/dusk-till-dawn/unity-in-light.html' },
      { year: 254.45, label: 'Levia, consumed, battles with Hala', url: 'https://legendarystories.net/main-story/compendium-of-rathe/vow-unbroken.html' },
    ],
  },
  {
    id: 'lexi', name: 'Lexi', class: ['Ranger'], talent: ['Elemental'], region: 'Aria',
    color: '#2dd4bf',
    description: '',
    events: [
      { year: 245,    label: 'Lexi grows up in volthaven', url: 'https://legendarystories.net/main-story/tales-of-aria/wonders-of-the-wayfarer.html' },
      { year: 250.6,  label: 'Briar joins Lexi to discover the secrets of Aria', url: 'https://legendarystories.net/main-story/everfest/a-grand-adventure.html' },
      { year: 252,    label: 'Heroes fights against the shadow', url: 'https://legendarystories.net/main-story/dusk-till-dawn/unity-in-light.html' },
      { year: 254.45, label: 'The war rages on', url: 'https://legendarystories.net/main-story/compendium-of-rathe/vow-unbroken.html' },
    ],
  },
  {
    id: 'lyath', name: 'Lyath Goldmane, Vile Savant', class: ['Guardian'], talent: ['Reviled'], region: 'Northern Realms', deathmatch: true,
    color: '#713f12',
    description: '',
    events: [
      { year: 254.3, label: 'Lyath Goldmane enters the Deathmatch Arena' },
    ],
  },
  {
    id: 'marlynn', name: 'Marlynn, Treasure Hunter', class: ['Pirate', 'Ranger'], talent: ['None'], region: 'High Seas',
    color: '#0891b2',
    description: '',
    events: [
      { year: 254.0, label: 'Marlynn hunts treasure across the High Seas', url: 'https://legendarystories.net/main-story/high-seas/a-kraken-good-tale.html' },
    ],
  },
  {
    id: 'maxx', name: 'Maxx, the Hype Nitro', class: ['Mechanologist'], talent: ['None'], region: 'Metrix',
    color: '#00b4d8',
    description: '',
    events: [
      { year: 252.3, label: 'Dash joins forces with Maxx Nitro and discovers Data Doll', url: 'https://legendarystories.net/main-story/bright-lights/synthetic-futures.html' },
      { year: 254,   label: 'Dash attempts to show off an invention for Teklo Industries', url: 'https://legendarystories.net/main-story/armory-decks/boom-town-boom.html' },
    ],
  },
  {
    id: 'melody', name: 'Melody', class: ['Bard'], talent: ['None'], region: 'Aria',
    color: '#90e0ef',
    description: '',
    events: [
      { year: 253.3, label: 'Melody shows up to the funeral of the queen of Candlehold', url: 'https://legendarystories.net/main-story/rosetta/seeds-of-renewal.html' },
    ],
  },
  {
    id: 'nuu', name: 'Nuu, Alluring Desire', class: ['Assassin'], talent: ['Mystic'], region: 'Misteria',
    color: '#7c3aed',
    description: '',
    events: [
      { year: -500, label: 'Fumei and Nuu study together at the Immortal Lunar Shrine', url: 'https://legendarystories.net/main-story/part-the-mistveil/part-4-the-hare-and-the-snake.html' },
      { year:  254, label: 'Enigma hunts down the evil spirit Nuu', url: 'https://legendarystories.net/main-story/part-the-mistveil/part-2-the-tapestry-unfolds.html' },
    ],
  },
  {
    id: 'oldhim', name: 'Oldhim', class: ['Guardian'], talent: ['Elemental'], region: 'Aria',
    color: '#94a3b8',
    description: '',
    events: [
      { year:   0,   label: 'Oldhim, fights off the old ones', url: 'https://legendarystories.net/main-story/armory-decks/battle-of-isenloft.html' },
      { year: 250.3, label: 'Oldhim thaws from his frozen tomb at Isenloft', url: 'https://legendarystories.net/main-story/tales-of-aria/the-broken-covenant.html' },
      { year: 250.6, label: 'Briar joins Lexi to discover the secrets of Aria', url: 'https://legendarystories.net/main-story/everfest/a-grand-adventure.html' },
      { year: 252,   label: 'Heroes fights against the shadow', url: 'https://legendarystories.net/main-story/dusk-till-dawn/unity-in-light.html' },
    ],
  },
  {
    id: 'olympia', name: 'Olympia', class: ['Guardian'], talent: ['None'], region: 'Deathmatch Arena', deathmatch: true,
    color: '#d6d3d1',
    description: '',
    events: [
      { year: 252.6, label: 'Olympia enters the Arena', url: 'https://legendarystories.net/main-story/heavy-hitters/arena-announcements.html' },
    ],
  },
  {
    id: 'oscilio', name: 'Oscilio, Constella Intelligence', class: ['Wizard'], talent: ['Elemental', 'Lightning'], region: 'Aria',
    color: '#4f46e5',
    description: '',
    events: [
      { year:   0,   label: 'Oscilio is created', url: 'https://legendarystories.net/main-story/omens-of-the-third-age/fall-of-valahai.html' },
      { year: 253.3, label: 'Oscilio is discovered by Aurora', url: 'https://legendarystories.net/main-story/rosetta/secret-of-the-aetherscribes.html' },
      { year: 254.6, label: 'Aurora and Oscilio fight against the Omens', url: 'https://legendarystories.net/main-story/omens-of-the-third-age/omens-in-the-sky.html' },
    ],
  },
  {
    id: 'pleiades', name: 'Pleiades, Superstar', class: ['Guardian'], talent: ['Revered'], region: 'Northern Realms', deathmatch: true,
    color: '#e879f9',
    description: '',
    events: [
      { year: 254.3, label: 'Pleiades enters the Deathmatch Arena' },
    ],
  },
  {
    id: 'prism', name: 'Prism', class: ['Illusionist'], talent: ['Light'], region: 'Solana',
    color: '#ff99ff',
    description: '',
    events: [
      { year: 234, label: 'Prism shows up in the grand library', url: 'https://legendarystories.net/main-story/monarch/stories-of-illumination.html' },
      { year: 251, label: 'Prism reveals the truth of Talents to Boltyn', url: 'https://legendarystories.net/main-story/monarch/step-into-the-light.html' },
      { year: 252, label: 'Heroes fights against the shadow', url: 'https://legendarystories.net/main-story/dusk-till-dawn/unity-in-light.html' },
    ],
  },
  {
    id: 'puffin', name: 'Puffin, Hightail', class: ['Pirate', 'Mechanologist'], talent: ['None'], region: 'High Seas',
    color: '#7c3aed',
    description: '',
    events: [
      { year: 254.0, label: 'Puffin sails the High Seas skies', url: 'https://legendarystories.net/main-story/monarch/step-into-the-light.html' },
    ],
  },
  {
    id: 'rhinar', name: 'Rhinar, Reckless Rampage', class: ['Brute'], talent: ['None'], region: 'Savage Lands',
    color: '#e53e3e',
    description: '',
    events: [
      { year: 220,   label: 'A cub, Rhinar survives in the dense jungle', url: 'https://legendarystories.net/main-story/welcome-to-rathe/kill-or-be-killed.html' },
      { year: 250,   label: 'Established alpha predator of the jungle', url: 'https://legendarystories.net/main-story/welcome-to-rathe/kill-or-be-killed.html' },
      { year: 253.8, label: 'Rhinar returns to the Savage Lands', url: 'https://legendarystories.net/short-stories/armory-decks/rhinar.html' },
    ],
  },
  {
    id: 'riptide', name: 'Riptide, Lurker of the Deep', class: ['Ranger'], talent: ['None'], region: 'The Pits',
    color: '#065f46',
    description: '',
    events: [
      { year: 251.6, label: 'Riptide, Lurker of the Deep', url: 'https://legendarystories.net/main-story/outsiders/catch-of-the-day.html' },
    ],
  },
  {
    id: 'scurv', name: 'Scurv, Stowaway', class: ['Pirate', 'Thief'], talent: ['None'], region: 'High Seas',
    color: '#0369a1',
    description: '',
    events: [],
  },
  {
    id: 'shiyana', name: 'Shiyana, Diamond Gemini', class: ['Shapeshifter'], talent: ['None'], region: 'Solana',
    color: '#ffe066',
    description: '',
    events: [
      { year: 251.3, label: 'Shiyana returns to Solana, after the events of dynasty', url: 'https://legendarystories.net/main-story/outsiders/tidings-in-the-light.html' },
      { year: 252,   label: 'Heroes fights against the shadow', url: 'https://legendarystories.net/main-story/dusk-till-dawn/unity-in-light.html' },
    ],
  },
  {
    id: 'teklovossen', name: 'Teklovossen', class: ['Mechanologist'], talent: ['None'], region: 'Metrix',
    color: '#1e3a8a',
    description: '',
    events: [
      { year: 190,   label: 'Teklovossen is a brilliant inventor in Metrix', url: 'https://legendarystories.net/main-story/bright-lights/the-dynamic-man.html' },
      { year: 252.3, label: 'Teklovossen awakens after years of slumber to become the mecropotent',
        url: 'https://legendarystories.net/main-story/bright-lights/P%CC%B8%CD%8D%CC%AC%CC%AD%CC%AD%CC%BA%CD%89%CC%A3%CC%8C%CC%90%CC%BE%CC%8C%CD%86%CC%9Ar%CC%B4%CD%94%CD%8D%CD%90%C8%AF%CC%B4%CC%A4%CC%B0%CD%A0t%CC%B5%CC%B0%CC%98%CD%91%C3%B5%CC%B6%CD%8D%CD%87c%CC%B6%CC%9F%CD%92o%CC%B6%CC%AA%CC%B3%CD%8Bl%CC%B6%CC%97%CC%91%20%CC%B4%CC%AE%CC%93%CD%98A%CC%B4%CC%9E%CC%97%CD%86%E1%B9%97%CC%B7%CC%A2%CD%95%CC%88%CC%81%C4%93%CC%B5%CD%8D%CC%BF%C5%95%CC%B6%CC%A9%CC%81%E1%B8%AD%CC%B4%CC%A7%CD%90%CD%82o%CC%B8%CD%99%CC%96%CC%90%CD%98n%CC%B4%CC%9E%CC%BA%CD%8B.html' },
    ],
  },
  {
    id: 'terra', name: 'Terra, Awakened Ancient', class: ['Guardian'], talent: ['Elemental'], region: 'Aria',
    color: '#78716c',
    description: '',
    events: [],
  },
  {
    id: 'tuffnut', name: 'Tuffnut, Bumbling Hulkster', class: ['Brute'], talent: ['Revered'], region: 'Deathmatch Arena', deathmatch: true,
    color: '#a16207',
    description: '',
    events: [
      { year: 252.6, label: 'Tuffnut enters the Deathmatch Arena' },
    ],
  },
  {
    id: 'uzuri', name: 'Uzuri, Switchblade', class: ['Assassin'], talent: ['None'], region: 'The Pits',
    color: '#047857',
    description: '',
    events: [
      { year: 241,   label: 'Uzuri, starts her journey as an assassin for the spider', url: 'https://legendarystories.net/main-story/outsiders/its-just-business.html' },
      { year: 251.6, label: 'Arakni Returns to the Pits, and discovers the assassination was a trap', url: 'https://legendarystories.net/main-story/outsiders/the-spiders-trap.html' },
    ],
  },
  {
    id: 'valda', name: 'Valda', class: ['Guardian'], talent: ['None'], region: 'Aria',
    color: '#48bb78',
    description: '',
    events: [
      { year: 230, label: 'Valda arrives in Aria as a child' },
      { year: 254, label: 'HSS: Attack on Larinkmorth', url: 'https://legendarystories.net/main-story/mastery-packs/trouble-in-larinkmorth.html' },
    ],
  },
  {
    id: 'verdance', name: 'Verdance, Thorn of the Rose', class: ['Wizard'], talent: ['Elemental'], region: 'Aria',
    color: '#22c55e',
    description: '',
    events: [
      { year: 253.3, label: 'Florian and Verdance clash for the future of Candlehold', url: 'https://legendarystories.net/main-story/rosetta/roots-of-change.html' },
    ],
  },
  {
    id: 'victor-goldmane', name: 'Victor Goldmane', class: ['Warrior'], talent: ['None'], region: 'Northern Realms', deathmatch: true,
    color: '#ca8a04',
    description: '',
    events: [
      { year: 252.6, label: 'Victor Goldmane battles in the Deathmatch Arena', url: 'https://legendarystories.net/main-story/heavy-hitters/arena-announcements.html' },
    ],
  },
  {
    id: 'viserai', name: 'Viserai, Rune Blood', class: ['Runeblade'], talent: ['None'], region: 'Demonastery',
    color: '#b794f4',
    description: '',
    events: [
      { year: 246, label: 'Viserai is born', url: 'https://legendarystories.net/main-story/arcane-rising/birth-of-the-arknight.html' },
      { year: 247, label: 'Viserai opens the Vitate gateway', url: 'https://legendarystories.net/main-story/arcane-rising/return-of-the-shadow.html' },
    ],
  },
  {
    id: 'vynnset', name: 'Vynnset, Iron Maiden', class: ['Runeblade'], talent: ['Shadow'], region: 'Demonastery',
    color: '#6d28d9',
    description: '',
    events: [
      { year: 241, label: 'Vynnset, Iron Maiden is born', url: 'https://legendarystories.net/main-story/dusk-till-dawn/anointed-in-shadow.html' },
      { year: 252, label: 'Levia and Vynnset work together to assault solana', url: 'https://legendarystories.net/main-story/dusk-till-dawn/unity-in-light.html' },
    ],
  },
  {
    id: 'yoji', name: 'Yoji, Royal Protector', class: ['Warrior'], talent: ['None'], region: 'Volcor',
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
      { year: 254, label: 'Zen walks every inch of Misteria\'s lands', url: 'https://legendarystories.net/main-story/part-the-mistveil/part-1-the-tiger-in-the-mist.html' },
    ],
  },
  {
    id: 'zyggy', name: 'Zyggy, Starlight', class: ['Illusionist'], talent: ['Lightning'], region: 'Aria',
    color: '#635fb8',
    description: '',
    events: [
      { year:   0,   label: 'Zyggy, fights off the old ones', url: 'https://legendarystories.net/main-story/omens-of-the-third-age/fall-of-valahai.html' },
      { year: 254.6, label: 'Aurora and Oscilio find Zyggy in the Auric keep', url: 'https://legendarystories.net/main-story/omens-of-the-third-age/omens-in-the-sky.html' },
    ],
  },
];





