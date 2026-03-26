/**
 * AR35 (모험 등급 35) intermediate Genshin Impact account fixture.
 *
 * 10 characters, 8 weapons, 15 artifacts.
 * Mid-game account building first teams. All 3-4 star weapons, mixed artifact sets.
 * Data format matches the POST /api/characters, /api/weapons, /api/artifacts endpoints.
 */

// ---------------------------------------------------------------------------
// Characters (10명) - mostly 4-star, ascending through mid-game
// ---------------------------------------------------------------------------

const characters = [
  {
    name: 'Xiangling', element: 'Pyro', weapon_type: 'Polearm',
    level: 60, hp: 9638, atk: 540, crit_rate: 15.2, crit_dmg: 62.0,
    energy_recharge: 135, elemental_mastery: 45,
  },
  {
    name: 'Bennett', element: 'Pyro', weapon_type: 'Sword',
    level: 50, hp: 8800, atk: 380, crit_rate: 8.0, crit_dmg: 52.0,
    energy_recharge: 155, elemental_mastery: 20,
  },
  {
    name: 'Barbara', element: 'Hydro', weapon_type: 'Catalyst',
    level: 50, hp: 10200, atk: 280, crit_rate: 5.0, crit_dmg: 50.0,
    energy_recharge: 120, elemental_mastery: 10,
  },
  {
    name: 'Fischl', element: 'Electro', weapon_type: 'Bow',
    level: 50, hp: 7200, atk: 480, crit_rate: 12.0, crit_dmg: 58.0,
    energy_recharge: 110, elemental_mastery: 25,
  },
  {
    name: 'Noelle', element: 'Geo', weapon_type: 'Claymore',
    level: 50, hp: 9500, atk: 350, crit_rate: 8.0, crit_dmg: 50.0,
    energy_recharge: 105, elemental_mastery: 5,
  },
  {
    name: 'Kaeya', element: 'Cryo', weapon_type: 'Sword',
    level: 50, hp: 8600, atk: 410, crit_rate: 10.0, crit_dmg: 55.0,
    energy_recharge: 115, elemental_mastery: 10,
  },
  {
    name: 'Traveler', element: 'Anemo', weapon_type: 'Sword',
    level: 50, hp: 8400, atk: 360, crit_rate: 9.0, crit_dmg: 52.0,
    energy_recharge: 110, elemental_mastery: 15,
  },
  {
    name: 'Xingqiu', element: 'Hydro', weapon_type: 'Sword',
    level: 50, hp: 7800, atk: 420, crit_rate: 10.0, crit_dmg: 56.0,
    energy_recharge: 140, elemental_mastery: 18,
  },
  {
    name: 'Amber', element: 'Pyro', weapon_type: 'Bow',
    level: 30, hp: 5400, atk: 180, crit_rate: 5.0, crit_dmg: 50.0,
    energy_recharge: 100, elemental_mastery: 0,
  },
  {
    name: 'Lisa', element: 'Electro', weapon_type: 'Catalyst',
    level: 30, hp: 5100, atk: 170, crit_rate: 5.0, crit_dmg: 50.0,
    energy_recharge: 100, elemental_mastery: 5,
  },
];

// ---------------------------------------------------------------------------
// Weapons (8개) - all 3-4 star, Lv.40-60
// ---------------------------------------------------------------------------

const weapons = [
  {
    name: 'Crescent Pike', type: 'Polearm', level: 60,
    refinement: 2, base_atk: 423, sub_stat_type: 'Physical DMG Bonus',
    sub_stat_value: '34.5%', rarity: 4, equipped_by: 'Xiangling',
  },
  {
    name: 'Skyrider Sword', type: 'Sword', level: 50,
    refinement: 3, base_atk: 354, sub_stat_type: 'Energy Recharge',
    sub_stat_value: '20.1%', rarity: 3, equipped_by: 'Bennett',
  },
  {
    name: 'Thrilling Tales of Dragon Slayers', type: 'Catalyst', level: 50,
    refinement: 5, base_atk: 354, sub_stat_type: 'HP%',
    sub_stat_value: '24.6%', rarity: 3, equipped_by: 'Barbara',
  },
  {
    name: 'Slingshot', type: 'Bow', level: 50,
    refinement: 3, base_atk: 354, sub_stat_type: 'CRIT Rate',
    sub_stat_value: '20.1%', rarity: 3, equipped_by: 'Fischl',
  },
  {
    name: 'Whiteblind', type: 'Claymore', level: 50,
    refinement: 1, base_atk: 423, sub_stat_type: 'DEF%',
    sub_stat_value: '38.7%', rarity: 4, equipped_by: 'Noelle',
  },
  {
    name: 'Harbinger of Dawn', type: 'Sword', level: 50,
    refinement: 5, base_atk: 354, sub_stat_type: 'CRIT DMG',
    sub_stat_value: '35.2%', rarity: 3, equipped_by: 'Kaeya',
  },
  {
    name: 'Sacrificial Sword', type: 'Sword', level: 40,
    refinement: 1, base_atk: 401, sub_stat_type: 'Energy Recharge',
    sub_stat_value: '22.6%', rarity: 4, equipped_by: 'Xingqiu',
  },
  {
    name: 'Favonius Warbow', type: 'Bow', level: 40,
    refinement: 1, base_atk: 401, sub_stat_type: 'Energy Recharge',
    sub_stat_value: '22.6%', rarity: 4, equipped_by: '',
  },
];

// ---------------------------------------------------------------------------
// Artifacts (15개) - 4-star sets, +4 to +12, mixed sets
// ---------------------------------------------------------------------------

const artifacts = [
  // ===== Xiangling: mixed Berserker/Gladiator pieces =====
  {
    name: 'Berserkers Rose', set_name: 'Berserker', slot: 'Flower',
    level: 12, main_stat_type: 'HP', main_stat_value: '3155',
    substats: JSON.stringify([
      { name: 'ATK%', value: '5.3%', rolls: 1 },
      { name: 'CRIT Rate', value: '3.5%', rolls: 1 },
      { name: 'DEF', value: '19', rolls: 1 },
    ]),
    equipped_by: 'Xiangling',
  },
  {
    name: 'Berserkers Indigo Feather', set_name: 'Berserker', slot: 'Plume',
    level: 8, main_stat_type: 'ATK', main_stat_value: '152',
    substats: JSON.stringify([
      { name: 'CRIT Rate', value: '3.5%', rolls: 1 },
      { name: 'HP%', value: '4.7%', rolls: 1 },
    ]),
    equipped_by: 'Xiangling',
  },
  {
    name: 'Gladiators Nostalgia', set_name: 'Gladiators Finale', slot: 'Sands',
    level: 8, main_stat_type: 'ATK%', main_stat_value: '19.2%',
    substats: JSON.stringify([
      { name: 'HP', value: '299', rolls: 1 },
      { name: 'CRIT DMG', value: '7.0%', rolls: 1 },
    ]),
    equipped_by: 'Xiangling',
  },

  // ===== Bennett: Exile set for ER =====
  {
    name: 'Exiles Flower', set_name: 'The Exile', slot: 'Flower',
    level: 8, main_stat_type: 'HP', main_stat_value: '2342',
    substats: JSON.stringify([
      { name: 'Energy Recharge', value: '5.2%', rolls: 1 },
      { name: 'DEF', value: '15', rolls: 1 },
    ]),
    equipped_by: 'Bennett',
  },
  {
    name: 'Exiles Feather', set_name: 'The Exile', slot: 'Plume',
    level: 8, main_stat_type: 'ATK', main_stat_value: '152',
    substats: JSON.stringify([
      { name: 'Energy Recharge', value: '5.8%', rolls: 1 },
      { name: 'HP%', value: '4.7%', rolls: 1 },
    ]),
    equipped_by: 'Bennett',
  },
  {
    name: 'Exiles Pocket Watch', set_name: 'The Exile', slot: 'Sands',
    level: 4, main_stat_type: 'Energy Recharge', main_stat_value: '14.2%',
    substats: JSON.stringify([
      { name: 'HP', value: '100', rolls: 1 },
    ]),
    equipped_by: 'Bennett',
  },

  // ===== Fischl: Sojourner set =====
  {
    name: 'Heart of Comradeship', set_name: 'Resolution of Sojourner', slot: 'Flower',
    level: 8, main_stat_type: 'HP', main_stat_value: '2342',
    substats: JSON.stringify([
      { name: 'ATK%', value: '5.3%', rolls: 1 },
      { name: 'CRIT Rate', value: '3.5%', rolls: 1 },
    ]),
    equipped_by: 'Fischl',
  },
  {
    name: 'Feather of Homecoming', set_name: 'Resolution of Sojourner', slot: 'Plume',
    level: 8, main_stat_type: 'ATK', main_stat_value: '152',
    substats: JSON.stringify([
      { name: 'CRIT DMG', value: '7.0%', rolls: 1 },
      { name: 'HP', value: '199', rolls: 1 },
    ]),
    equipped_by: 'Fischl',
  },

  // ===== Xingqiu: mixed Scholar/Exile =====
  {
    name: 'Scholars Bookmark', set_name: 'Scholar', slot: 'Flower',
    level: 8, main_stat_type: 'HP', main_stat_value: '2342',
    substats: JSON.stringify([
      { name: 'Energy Recharge', value: '5.8%', rolls: 1 },
    ]),
    equipped_by: 'Xingqiu',
  },
  {
    name: 'Scholars Quill Pen', set_name: 'Scholar', slot: 'Plume',
    level: 4, main_stat_type: 'ATK', main_stat_value: '117',
    substats: JSON.stringify([
      { name: 'HP%', value: '4.7%', rolls: 1 },
    ]),
    equipped_by: 'Xingqiu',
  },

  // ===== Barbara: Maiden Beloved =====
  {
    name: 'Maidens Distant Love', set_name: 'Maiden Beloved', slot: 'Flower',
    level: 8, main_stat_type: 'HP', main_stat_value: '2342',
    substats: JSON.stringify([
      { name: 'HP%', value: '4.7%', rolls: 1 },
      { name: 'DEF', value: '15', rolls: 1 },
    ]),
    equipped_by: 'Barbara',
  },
  {
    name: 'Maidens Heart-Stricken Infatuation', set_name: 'Maiden Beloved', slot: 'Plume',
    level: 4, main_stat_type: 'ATK', main_stat_value: '117',
    substats: JSON.stringify([
      { name: 'HP', value: '199', rolls: 1 },
    ]),
    equipped_by: 'Barbara',
  },

  // ===== Unequipped junk =====
  {
    name: 'Instructors Brooch', set_name: 'Instructor', slot: 'Flower',
    level: 4, main_stat_type: 'HP', main_stat_value: '1123',
    substats: JSON.stringify([
      { name: 'Elemental Mastery', value: '12', rolls: 1 },
    ]),
    equipped_by: '',
  },
  {
    name: 'Martial Artists Red Flower', set_name: 'Martial Artist', slot: 'Flower',
    level: 0, main_stat_type: 'HP', main_stat_value: '717',
    substats: JSON.stringify([
      { name: 'ATK', value: '11', rolls: 1 },
    ]),
    equipped_by: '',
  },
  {
    name: 'Traveling Doctors Pocket Watch', set_name: 'Traveling Doctor', slot: 'Sands',
    level: 0, main_stat_type: 'HP%', main_stat_value: '6.3%',
    substats: JSON.stringify([
      { name: 'DEF', value: '8', rolls: 1 },
    ]),
    equipped_by: '',
  },
];

module.exports = { characters, weapons, artifacts };
