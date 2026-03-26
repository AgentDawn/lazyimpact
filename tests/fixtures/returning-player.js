/**
 * Returning Player (복귀 유저) Genshin Impact account fixture.
 *
 * 14 characters, 10 weapons, 30 artifacts.
 * Old meta characters fully built (Diluc, Ganyu, Zhongli, Xiao era).
 * Pulled new characters but never built them (Lv.1-20).
 * No new weapon types, old 5-stars maxed.
 * Data format matches the POST /api/characters, /api/weapons, /api/artifacts endpoints.
 */

// ---------------------------------------------------------------------------
// Characters (14명) - old meta fully built, new characters unbuilt
// ---------------------------------------------------------------------------

const characters = [
  // ===== BUILT: Old meta characters (Lv.80-90) =====
  {
    name: 'Diluc', element: 'Pyro', weapon_type: 'Claymore',
    level: 90, hp: 13600, atk: 1950, crit_rate: 65.0, crit_dmg: 155.0,
    energy_recharge: 110, elemental_mastery: 55,
  },
  {
    name: 'Ganyu', element: 'Cryo', weapon_type: 'Bow',
    level: 90, hp: 15200, atk: 2050, crit_rate: 45.0, crit_dmg: 210.0,
    energy_recharge: 115, elemental_mastery: 35,
  },
  {
    name: 'Zhongli', element: 'Geo', weapon_type: 'Polearm',
    level: 90, hp: 50000, atk: 700, crit_rate: 18.0, crit_dmg: 48.0,
    energy_recharge: 130, elemental_mastery: 25,
  },
  {
    name: 'Xiao', element: 'Anemo', weapon_type: 'Polearm',
    level: 90, hp: 18200, atk: 2200, crit_rate: 72.0, crit_dmg: 180.0,
    energy_recharge: 115, elemental_mastery: 30,
  },
  {
    name: 'Venti', element: 'Anemo', weapon_type: 'Bow',
    level: 90, hp: 11200, atk: 750, crit_rate: 15.0, crit_dmg: 40.0,
    energy_recharge: 200, elemental_mastery: 680,
  },
  {
    name: 'Bennett', element: 'Pyro', weapon_type: 'Sword',
    level: 80, hp: 12000, atk: 800, crit_rate: 25.0, crit_dmg: 55.0,
    energy_recharge: 200, elemental_mastery: 40,
  },
  {
    name: 'Xingqiu', element: 'Hydro', weapon_type: 'Sword',
    level: 80, hp: 15500, atk: 1050, crit_rate: 48.0, crit_dmg: 110.0,
    energy_recharge: 180, elemental_mastery: 40,
  },
  {
    name: 'Fischl', element: 'Electro', weapon_type: 'Bow',
    level: 80, hp: 9800, atk: 1350, crit_rate: 42.0, crit_dmg: 85.0,
    energy_recharge: 115, elemental_mastery: 30,
  },

  // ===== UNBUILT: New characters pulled but never leveled =====
  {
    name: 'Nahida', element: 'Dendro', weapon_type: 'Catalyst',
    level: 20, hp: 3800, atk: 120, crit_rate: 5.0, crit_dmg: 50.0,
    energy_recharge: 100, elemental_mastery: 0,
  },
  {
    name: 'Furina', element: 'Hydro', weapon_type: 'Sword',
    level: 1, hp: 1192, atk: 19, crit_rate: 5.0, crit_dmg: 50.0,
    energy_recharge: 100, elemental_mastery: 0,
  },
  {
    name: 'Neuvillette', element: 'Hydro', weapon_type: 'Catalyst',
    level: 1, hp: 1144, atk: 17, crit_rate: 5.0, crit_dmg: 50.0,
    energy_recharge: 100, elemental_mastery: 0,
  },
  {
    name: 'Arlecchino', element: 'Pyro', weapon_type: 'Polearm',
    level: 1, hp: 1020, atk: 27, crit_rate: 5.0, crit_dmg: 50.0,
    energy_recharge: 100, elemental_mastery: 0,
  },
  {
    name: 'Kaedehara Kazuha', element: 'Anemo', weapon_type: 'Sword',
    level: 20, hp: 4200, atk: 130, crit_rate: 5.0, crit_dmg: 50.0,
    energy_recharge: 100, elemental_mastery: 0,
  },
  {
    name: 'Yelan', element: 'Hydro', weapon_type: 'Bow',
    level: 1, hp: 1125, atk: 19, crit_rate: 5.0, crit_dmg: 50.0,
    energy_recharge: 100, elemental_mastery: 0,
  },
];

// ---------------------------------------------------------------------------
// Weapons (10개) - old 5-stars maxed, no new weapons
// ---------------------------------------------------------------------------

const weapons = [
  // Old 5-star weapons (maxed)
  {
    name: 'Wolfs Gravestone', type: 'Claymore', level: 90,
    refinement: 1, base_atk: 608, sub_stat_type: 'ATK%',
    sub_stat_value: '49.6%', rarity: 5, equipped_by: 'Diluc',
  },
  {
    name: 'Amos Bow', type: 'Bow', level: 90,
    refinement: 1, base_atk: 608, sub_stat_type: 'ATK%',
    sub_stat_value: '49.6%', rarity: 5, equipped_by: 'Ganyu',
  },
  {
    name: 'Primordial Jade Winged-Spear', type: 'Polearm', level: 90,
    refinement: 1, base_atk: 674, sub_stat_type: 'CRIT Rate',
    sub_stat_value: '22.1%', rarity: 5, equipped_by: 'Xiao',
  },
  {
    name: 'Skyward Harp', type: 'Bow', level: 90,
    refinement: 1, base_atk: 674, sub_stat_type: 'CRIT Rate',
    sub_stat_value: '22.1%', rarity: 5, equipped_by: 'Venti',
  },

  // Old 4-star weapons
  {
    name: 'Black Tassel', type: 'Polearm', level: 90,
    refinement: 5, base_atk: 354, sub_stat_type: 'HP%',
    sub_stat_value: '46.9%', rarity: 3, equipped_by: 'Zhongli',
  },
  {
    name: 'Sacrificial Sword', type: 'Sword', level: 80,
    refinement: 3, base_atk: 454, sub_stat_type: 'Energy Recharge',
    sub_stat_value: '61.3%', rarity: 4, equipped_by: 'Xingqiu',
  },
  {
    name: 'Favonius Sword', type: 'Sword', level: 80,
    refinement: 2, base_atk: 454, sub_stat_type: 'Energy Recharge',
    sub_stat_value: '61.3%', rarity: 4, equipped_by: 'Bennett',
  },
  {
    name: 'Stringless', type: 'Bow', level: 80,
    refinement: 3, base_atk: 510, sub_stat_type: 'Elemental Mastery',
    sub_stat_value: '165', rarity: 4, equipped_by: 'Fischl',
  },
  {
    name: 'Prototype Rancour', type: 'Sword', level: 60,
    refinement: 3, base_atk: 440, sub_stat_type: 'Physical DMG Bonus',
    sub_stat_value: '34.5%', rarity: 4, equipped_by: '',
  },
  {
    name: 'Favonius Lance', type: 'Polearm', level: 60,
    refinement: 1, base_atk: 454, sub_stat_type: 'Energy Recharge',
    sub_stat_value: '30.6%', rarity: 4, equipped_by: '',
  },
];

// ---------------------------------------------------------------------------
// Artifacts (30개) - old chars have excellent +20 sets, new chars have nothing
// ---------------------------------------------------------------------------

const artifacts = [
  // ===== Diluc: Crimson Witch 4pc (all +20, excellent old substats) =====
  {
    name: 'Witchs Flower of Blaze', set_name: 'Crimson Witch of Flames', slot: 'Flower',
    level: 20, main_stat_type: 'HP', main_stat_value: '4780',
    substats: JSON.stringify([
      { name: 'CRIT Rate', value: '10.5%', rolls: 3 },
      { name: 'CRIT DMG', value: '14.8%', rolls: 2 },
      { name: 'ATK%', value: '9.3%', rolls: 2 },
      { name: 'Elemental Mastery', value: '16', rolls: 1 },
    ]),
    equipped_by: 'Diluc',
  },
  {
    name: 'Witchs Ever-Burning Plume', set_name: 'Crimson Witch of Flames', slot: 'Plume',
    level: 20, main_stat_type: 'ATK', main_stat_value: '311',
    substats: JSON.stringify([
      { name: 'CRIT Rate', value: '7.0%', rolls: 2 },
      { name: 'CRIT DMG', value: '21.8%', rolls: 3 },
      { name: 'ATK%', value: '5.8%', rolls: 1 },
      { name: 'Energy Recharge', value: '5.2%', rolls: 1 },
    ]),
    equipped_by: 'Diluc',
  },
  {
    name: 'Witchs End Time', set_name: 'Crimson Witch of Flames', slot: 'Sands',
    level: 20, main_stat_type: 'ATK%', main_stat_value: '46.6%',
    substats: JSON.stringify([
      { name: 'CRIT Rate', value: '7.8%', rolls: 2 },
      { name: 'CRIT DMG', value: '14.0%', rolls: 2 },
      { name: 'Elemental Mastery', value: '23', rolls: 1 },
      { name: 'HP', value: '299', rolls: 1 },
    ]),
    equipped_by: 'Diluc',
  },
  {
    name: 'Witchs Heart Flames', set_name: 'Crimson Witch of Flames', slot: 'Goblet',
    level: 20, main_stat_type: 'Pyro DMG Bonus', main_stat_value: '46.6%',
    substats: JSON.stringify([
      { name: 'CRIT Rate', value: '6.2%', rolls: 2 },
      { name: 'CRIT DMG', value: '14.0%', rolls: 2 },
      { name: 'ATK%', value: '5.3%', rolls: 1 },
      { name: 'DEF', value: '23', rolls: 1 },
    ]),
    equipped_by: 'Diluc',
  },
  {
    name: 'Witchs Scorching Hat', set_name: 'Crimson Witch of Flames', slot: 'Circlet',
    level: 20, main_stat_type: 'CRIT Rate', main_stat_value: '31.1%',
    substats: JSON.stringify([
      { name: 'CRIT DMG', value: '21.0%', rolls: 3 },
      { name: 'ATK%', value: '11.7%', rolls: 2 },
      { name: 'Elemental Mastery', value: '19', rolls: 1 },
      { name: 'HP', value: '299', rolls: 1 },
    ]),
    equipped_by: 'Diluc',
  },

  // ===== Ganyu: Blizzard Strayer 4pc (all +20) =====
  {
    name: 'Snowswept Memory', set_name: 'Blizzard Strayer', slot: 'Flower',
    level: 20, main_stat_type: 'HP', main_stat_value: '4780',
    substats: JSON.stringify([
      { name: 'CRIT DMG', value: '21.0%', rolls: 3 },
      { name: 'ATK%', value: '11.1%', rolls: 2 },
      { name: 'Energy Recharge', value: '5.8%', rolls: 1 },
      { name: 'DEF', value: '19', rolls: 1 },
    ]),
    equipped_by: 'Ganyu',
  },
  {
    name: 'Icebreakers Resolve', set_name: 'Blizzard Strayer', slot: 'Plume',
    level: 20, main_stat_type: 'ATK', main_stat_value: '311',
    substats: JSON.stringify([
      { name: 'CRIT DMG', value: '14.8%', rolls: 2 },
      { name: 'ATK%', value: '14.0%', rolls: 3 },
      { name: 'Energy Recharge', value: '5.2%', rolls: 1 },
      { name: 'HP', value: '299', rolls: 1 },
    ]),
    equipped_by: 'Ganyu',
  },
  {
    name: 'Frozen Homelands Demise', set_name: 'Blizzard Strayer', slot: 'Sands',
    level: 20, main_stat_type: 'ATK%', main_stat_value: '46.6%',
    substats: JSON.stringify([
      { name: 'CRIT DMG', value: '19.4%', rolls: 3 },
      { name: 'CRIT Rate', value: '3.5%', rolls: 1 },
      { name: 'Energy Recharge', value: '6.5%', rolls: 1 },
      { name: 'DEF', value: '23', rolls: 1 },
    ]),
    equipped_by: 'Ganyu',
  },
  {
    name: 'Frost-Weaved Dignity', set_name: 'Blizzard Strayer', slot: 'Goblet',
    level: 20, main_stat_type: 'Cryo DMG Bonus', main_stat_value: '46.6%',
    substats: JSON.stringify([
      { name: 'CRIT DMG', value: '14.0%', rolls: 2 },
      { name: 'ATK%', value: '9.3%', rolls: 2 },
      { name: 'Energy Recharge', value: '5.8%', rolls: 1 },
      { name: 'DEF%', value: '5.1%', rolls: 1 },
    ]),
    equipped_by: 'Ganyu',
  },
  {
    name: 'Broken Rimes Echo', set_name: 'Blizzard Strayer', slot: 'Circlet',
    level: 20, main_stat_type: 'CRIT DMG', main_stat_value: '62.2%',
    substats: JSON.stringify([
      { name: 'ATK%', value: '14.0%', rolls: 3 },
      { name: 'CRIT Rate', value: '6.6%', rolls: 2 },
      { name: 'HP', value: '508', rolls: 1 },
      { name: 'DEF', value: '19', rolls: 1 },
    ]),
    equipped_by: 'Ganyu',
  },

  // ===== Xiao: Gladiators Finale 2pc + VV 2pc (all +20, old-school build) =====
  {
    name: 'Gladiators Nostalgia', set_name: 'Gladiators Finale', slot: 'Flower',
    level: 20, main_stat_type: 'HP', main_stat_value: '4780',
    substats: JSON.stringify([
      { name: 'CRIT Rate', value: '10.5%', rolls: 3 },
      { name: 'CRIT DMG', value: '14.0%', rolls: 2 },
      { name: 'ATK%', value: '5.3%', rolls: 1 },
      { name: 'Energy Recharge', value: '5.2%', rolls: 1 },
    ]),
    equipped_by: 'Xiao',
  },
  {
    name: 'Gladiators Destiny', set_name: 'Gladiators Finale', slot: 'Plume',
    level: 20, main_stat_type: 'ATK', main_stat_value: '311',
    substats: JSON.stringify([
      { name: 'CRIT Rate', value: '7.8%', rolls: 2 },
      { name: 'CRIT DMG', value: '21.0%', rolls: 3 },
      { name: 'ATK%', value: '5.8%', rolls: 1 },
      { name: 'DEF', value: '19', rolls: 1 },
    ]),
    equipped_by: 'Xiao',
  },
  {
    name: 'Viridescent Venerers Determination', set_name: 'Viridescent Venerer', slot: 'Sands',
    level: 20, main_stat_type: 'ATK%', main_stat_value: '46.6%',
    substats: JSON.stringify([
      { name: 'CRIT Rate', value: '7.0%', rolls: 2 },
      { name: 'CRIT DMG', value: '14.0%', rolls: 2 },
      { name: 'Energy Recharge', value: '5.8%', rolls: 1 },
      { name: 'HP', value: '299', rolls: 1 },
    ]),
    equipped_by: 'Xiao',
  },
  {
    name: 'Gladiators Intoxication', set_name: 'Gladiators Finale', slot: 'Goblet',
    level: 20, main_stat_type: 'Anemo DMG Bonus', main_stat_value: '46.6%',
    substats: JSON.stringify([
      { name: 'CRIT Rate', value: '6.6%', rolls: 2 },
      { name: 'CRIT DMG', value: '13.2%', rolls: 2 },
      { name: 'ATK%', value: '5.3%', rolls: 1 },
      { name: 'DEF', value: '23', rolls: 1 },
    ]),
    equipped_by: 'Xiao',
  },
  {
    name: 'Viridescent Venerers Diadem', set_name: 'Viridescent Venerer', slot: 'Circlet',
    level: 20, main_stat_type: 'CRIT Rate', main_stat_value: '31.1%',
    substats: JSON.stringify([
      { name: 'CRIT DMG', value: '19.4%', rolls: 3 },
      { name: 'ATK%', value: '9.3%', rolls: 2 },
      { name: 'Energy Recharge', value: '5.8%', rolls: 1 },
      { name: 'HP', value: '299', rolls: 1 },
    ]),
    equipped_by: 'Xiao',
  },

  // ===== Venti: VV 4pc (all +20, EM build) =====
  {
    name: 'In Remembrance of Viridescent Fields', set_name: 'Viridescent Venerer', slot: 'Flower',
    level: 20, main_stat_type: 'HP', main_stat_value: '4780',
    substats: JSON.stringify([
      { name: 'Elemental Mastery', value: '42', rolls: 2 },
      { name: 'Energy Recharge', value: '11.0%', rolls: 2 },
      { name: 'ATK%', value: '5.3%', rolls: 1 },
      { name: 'DEF', value: '23', rolls: 1 },
    ]),
    equipped_by: 'Venti',
  },
  {
    name: 'Viridescent Arrow Feather', set_name: 'Viridescent Venerer', slot: 'Plume',
    level: 20, main_stat_type: 'ATK', main_stat_value: '311',
    substats: JSON.stringify([
      { name: 'Elemental Mastery', value: '56', rolls: 3 },
      { name: 'Energy Recharge', value: '5.8%', rolls: 1 },
      { name: 'HP', value: '508', rolls: 1 },
      { name: 'DEF', value: '19', rolls: 1 },
    ]),
    equipped_by: 'Venti',
  },
  {
    name: 'Viridescent Venerers Determination', set_name: 'Viridescent Venerer', slot: 'Sands',
    level: 20, main_stat_type: 'Elemental Mastery', main_stat_value: '187',
    substats: JSON.stringify([
      { name: 'Energy Recharge', value: '11.7%', rolls: 2 },
      { name: 'ATK%', value: '5.3%', rolls: 1 },
      { name: 'HP', value: '807', rolls: 2 },
      { name: 'DEF', value: '19', rolls: 1 },
    ]),
    equipped_by: 'Venti',
  },
  {
    name: 'Viridescent Venerers Vessel', set_name: 'Viridescent Venerer', slot: 'Goblet',
    level: 20, main_stat_type: 'Elemental Mastery', main_stat_value: '187',
    substats: JSON.stringify([
      { name: 'Energy Recharge', value: '9.7%', rolls: 2 },
      { name: 'CRIT Rate', value: '3.5%', rolls: 1 },
      { name: 'HP%', value: '4.7%', rolls: 1 },
      { name: 'ATK', value: '18', rolls: 1 },
    ]),
    equipped_by: 'Venti',
  },
  {
    name: 'Viridescent Venerers Diadem', set_name: 'Viridescent Venerer', slot: 'Circlet',
    level: 20, main_stat_type: 'Elemental Mastery', main_stat_value: '187',
    substats: JSON.stringify([
      { name: 'Energy Recharge', value: '6.5%', rolls: 1 },
      { name: 'ATK%', value: '9.3%', rolls: 2 },
      { name: 'HP', value: '299', rolls: 1 },
      { name: 'DEF%', value: '5.1%', rolls: 1 },
    ]),
    equipped_by: 'Venti',
  },

  // ===== Bennett: Noblesse 4pc (+16) =====
  {
    name: 'Royal Flora', set_name: 'Noblesse Oblige', slot: 'Flower',
    level: 16, main_stat_type: 'HP', main_stat_value: '3967',
    substats: JSON.stringify([
      { name: 'Energy Recharge', value: '11.0%', rolls: 2 },
      { name: 'HP%', value: '9.3%', rolls: 2 },
      { name: 'DEF', value: '19', rolls: 1 },
    ]),
    equipped_by: 'Bennett',
  },
  {
    name: 'Royal Plume', set_name: 'Noblesse Oblige', slot: 'Plume',
    level: 16, main_stat_type: 'ATK', main_stat_value: '258',
    substats: JSON.stringify([
      { name: 'Energy Recharge', value: '5.8%', rolls: 1 },
      { name: 'HP%', value: '14.0%', rolls: 3 },
    ]),
    equipped_by: 'Bennett',
  },
  {
    name: 'Royal Pocket Watch', set_name: 'Noblesse Oblige', slot: 'Sands',
    level: 16, main_stat_type: 'Energy Recharge', main_stat_value: '43.0%',
    substats: JSON.stringify([
      { name: 'HP%', value: '9.3%', rolls: 2 },
      { name: 'ATK', value: '18', rolls: 1 },
    ]),
    equipped_by: 'Bennett',
  },
  {
    name: 'Royal Silver Urn', set_name: 'Noblesse Oblige', slot: 'Goblet',
    level: 16, main_stat_type: 'HP%', main_stat_value: '38.7%',
    substats: JSON.stringify([
      { name: 'Energy Recharge', value: '5.2%', rolls: 1 },
      { name: 'DEF', value: '23', rolls: 1 },
    ]),
    equipped_by: 'Bennett',
  },
  {
    name: 'Royal Masque', set_name: 'Noblesse Oblige', slot: 'Circlet',
    level: 16, main_stat_type: 'Healing Bonus', main_stat_value: '30.0%',
    substats: JSON.stringify([
      { name: 'HP%', value: '9.3%', rolls: 2 },
      { name: 'Energy Recharge', value: '5.8%', rolls: 1 },
    ]),
    equipped_by: 'Bennett',
  },

  // ===== Zhongli: Tenacity 2pc + random (+16) =====
  {
    name: 'Flower of Accolades', set_name: 'Tenacity of the Millelith', slot: 'Flower',
    level: 16, main_stat_type: 'HP', main_stat_value: '3967',
    substats: JSON.stringify([
      { name: 'HP%', value: '14.0%', rolls: 3 },
      { name: 'Energy Recharge', value: '5.8%', rolls: 1 },
      { name: 'DEF', value: '19', rolls: 1 },
    ]),
    equipped_by: 'Zhongli',
  },
  {
    name: 'Ceremonial War-Plume', set_name: 'Tenacity of the Millelith', slot: 'Plume',
    level: 16, main_stat_type: 'ATK', main_stat_value: '258',
    substats: JSON.stringify([
      { name: 'HP%', value: '14.0%', rolls: 3 },
      { name: 'DEF%', value: '5.1%', rolls: 1 },
    ]),
    equipped_by: 'Zhongli',
  },
  {
    name: 'Gladiators Nostalgia', set_name: 'Gladiators Finale', slot: 'Sands',
    level: 16, main_stat_type: 'HP%', main_stat_value: '38.7%',
    substats: JSON.stringify([
      { name: 'DEF', value: '39', rolls: 2 },
      { name: 'Energy Recharge', value: '5.8%', rolls: 1 },
    ]),
    equipped_by: 'Zhongli',
  },
  {
    name: 'Nobles Pledging Vessel', set_name: 'Noblesse Oblige', slot: 'Goblet',
    level: 16, main_stat_type: 'Geo DMG Bonus', main_stat_value: '38.7%',
    substats: JSON.stringify([
      { name: 'HP%', value: '4.7%', rolls: 1 },
      { name: 'DEF', value: '19', rolls: 1 },
    ]),
    equipped_by: 'Zhongli',
  },
  {
    name: 'Generals Ancient Helm', set_name: 'Tenacity of the Millelith', slot: 'Circlet',
    level: 16, main_stat_type: 'HP%', main_stat_value: '38.7%',
    substats: JSON.stringify([
      { name: 'Energy Recharge', value: '9.7%', rolls: 2 },
      { name: 'DEF', value: '19', rolls: 1 },
    ]),
    equipped_by: 'Zhongli',
  },
];

module.exports = { characters, weapons, artifacts };
