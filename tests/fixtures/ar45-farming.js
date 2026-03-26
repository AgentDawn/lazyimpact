/**
 * AR45 (모험 등급 45) artifact farming start Genshin Impact account fixture.
 *
 * 15 characters, 10 weapons, 30 artifacts.
 * Just unlocked the highest domain difficulty. Starting to farm proper 5-star artifact sets.
 * Has 1-2 five-star characters, rest are 4-star at Lv.60-80.
 * Data format matches the POST /api/characters, /api/weapons, /api/artifacts endpoints.
 */

// ---------------------------------------------------------------------------
// Characters (15명) - 2 five-star, rest 4-star Lv.60-80
// ---------------------------------------------------------------------------

const characters = [
  // 5-star main DPS
  {
    name: 'Raiden Shogun', element: 'Electro', weapon_type: 'Polearm',
    level: 80, hp: 12400, atk: 870, crit_rate: 32.0, crit_dmg: 85.0,
    energy_recharge: 195, elemental_mastery: 40,
  },
  {
    name: 'Mona', element: 'Hydro', weapon_type: 'Catalyst',
    level: 70, hp: 9800, atk: 620, crit_rate: 20.0, crit_dmg: 68.0,
    energy_recharge: 165, elemental_mastery: 55,
  },

  // 4-star core team
  {
    name: 'Xiangling', element: 'Pyro', weapon_type: 'Polearm',
    level: 80, hp: 10600, atk: 750, crit_rate: 28.0, crit_dmg: 72.0,
    energy_recharge: 175, elemental_mastery: 85,
  },
  {
    name: 'Bennett', element: 'Pyro', weapon_type: 'Sword',
    level: 70, hp: 10200, atk: 520, crit_rate: 12.0, crit_dmg: 55.0,
    energy_recharge: 180, elemental_mastery: 25,
  },
  {
    name: 'Xingqiu', element: 'Hydro', weapon_type: 'Sword',
    level: 80, hp: 11500, atk: 680, crit_rate: 30.0, crit_dmg: 78.0,
    energy_recharge: 170, elemental_mastery: 30,
  },
  {
    name: 'Fischl', element: 'Electro', weapon_type: 'Bow',
    level: 70, hp: 8400, atk: 620, crit_rate: 22.0, crit_dmg: 65.0,
    energy_recharge: 115, elemental_mastery: 35,
  },
  {
    name: 'Sucrose', element: 'Anemo', weapon_type: 'Catalyst',
    level: 70, hp: 7600, atk: 450, crit_rate: 8.0, crit_dmg: 50.0,
    energy_recharge: 130, elemental_mastery: 320,
  },
  {
    name: 'Kaeya', element: 'Cryo', weapon_type: 'Sword',
    level: 60, hp: 8800, atk: 480, crit_rate: 15.0, crit_dmg: 58.0,
    energy_recharge: 120, elemental_mastery: 10,
  },
  {
    name: 'Beidou', element: 'Electro', weapon_type: 'Claymore',
    level: 70, hp: 10200, atk: 580, crit_rate: 18.0, crit_dmg: 62.0,
    energy_recharge: 140, elemental_mastery: 20,
  },
  {
    name: 'Noelle', element: 'Geo', weapon_type: 'Claymore',
    level: 60, hp: 10400, atk: 420, crit_rate: 10.0, crit_dmg: 52.0,
    energy_recharge: 110, elemental_mastery: 5,
  },
  {
    name: 'Traveler', element: 'Electro', weapon_type: 'Sword',
    level: 60, hp: 8600, atk: 440, crit_rate: 12.0, crit_dmg: 54.0,
    energy_recharge: 125, elemental_mastery: 20,
  },
  {
    name: 'Barbara', element: 'Hydro', weapon_type: 'Catalyst',
    level: 60, hp: 11200, atk: 320, crit_rate: 5.0, crit_dmg: 50.0,
    energy_recharge: 115, elemental_mastery: 8,
  },
  {
    name: 'Rosaria', element: 'Cryo', weapon_type: 'Polearm',
    level: 60, hp: 8900, atk: 510, crit_rate: 18.0, crit_dmg: 60.0,
    energy_recharge: 120, elemental_mastery: 12,
  },
  {
    name: 'Amber', element: 'Pyro', weapon_type: 'Bow',
    level: 40, hp: 5400, atk: 200, crit_rate: 5.0, crit_dmg: 50.0,
    energy_recharge: 100, elemental_mastery: 0,
  },
  {
    name: 'Lisa', element: 'Electro', weapon_type: 'Catalyst',
    level: 40, hp: 5100, atk: 190, crit_rate: 5.0, crit_dmg: 50.0,
    energy_recharge: 100, elemental_mastery: 10,
  },
];

// ---------------------------------------------------------------------------
// Weapons (10개) - 1 five-star, rest 4-star Lv.60-80
// ---------------------------------------------------------------------------

const weapons = [
  {
    name: 'Engulfing Lightning', type: 'Polearm', level: 70,
    refinement: 1, base_atk: 510, sub_stat_type: 'Energy Recharge',
    sub_stat_value: '41.9%', rarity: 5, equipped_by: 'Raiden Shogun',
  },
  {
    name: 'The Catch', type: 'Polearm', level: 70,
    refinement: 5, base_atk: 454, sub_stat_type: 'Energy Recharge',
    sub_stat_value: '34.5%', rarity: 4, equipped_by: 'Xiangling',
  },
  {
    name: 'Sacrificial Sword', type: 'Sword', level: 70,
    refinement: 1, base_atk: 401, sub_stat_type: 'Energy Recharge',
    sub_stat_value: '45.9%', rarity: 4, equipped_by: 'Xingqiu',
  },
  {
    name: 'Favonius Sword', type: 'Sword', level: 60,
    refinement: 1, base_atk: 401, sub_stat_type: 'Energy Recharge',
    sub_stat_value: '30.6%', rarity: 4, equipped_by: 'Bennett',
  },
  {
    name: 'Stringless', type: 'Bow', level: 70,
    refinement: 2, base_atk: 454, sub_stat_type: 'Elemental Mastery',
    sub_stat_value: '122', rarity: 4, equipped_by: 'Fischl',
  },
  {
    name: 'Sacrificial Fragments', type: 'Catalyst', level: 60,
    refinement: 1, base_atk: 401, sub_stat_type: 'Elemental Mastery',
    sub_stat_value: '110', rarity: 4, equipped_by: 'Sucrose',
  },
  {
    name: 'Prototype Rancour', type: 'Sword', level: 60,
    refinement: 2, base_atk: 440, sub_stat_type: 'Physical DMG Bonus',
    sub_stat_value: '34.5%', rarity: 4, equipped_by: 'Kaeya',
  },
  {
    name: 'Prototype Archaic', type: 'Claymore', level: 60,
    refinement: 1, base_atk: 440, sub_stat_type: 'ATK%',
    sub_stat_value: '27.6%', rarity: 4, equipped_by: 'Beidou',
  },
  {
    name: 'Mappa Mare', type: 'Catalyst', level: 60,
    refinement: 1, base_atk: 440, sub_stat_type: 'Elemental Mastery',
    sub_stat_value: '110', rarity: 4, equipped_by: 'Mona',
  },
  {
    name: 'Thrilling Tales of Dragon Slayers', type: 'Catalyst', level: 60,
    refinement: 5, base_atk: 354, sub_stat_type: 'HP%',
    sub_stat_value: '30.4%', rarity: 3, equipped_by: 'Barbara',
  },
];

// ---------------------------------------------------------------------------
// Artifacts (30개) - mix of +12~+20, starting proper sets, lots of off-pieces
// ---------------------------------------------------------------------------

const artifacts = [
  // ===== Raiden Shogun: partial Emblem of Severed Fate (starting to farm) =====
  {
    name: 'Magnificent Tsuba', set_name: 'Emblem of Severed Fate', slot: 'Flower',
    level: 16, main_stat_type: 'HP', main_stat_value: '3967',
    substats: JSON.stringify([
      { name: 'CRIT Rate', value: '7.0%', rolls: 2 },
      { name: 'CRIT DMG', value: '7.0%', rolls: 1 },
      { name: 'Energy Recharge', value: '5.8%', rolls: 1 },
      { name: 'DEF', value: '19', rolls: 1 },
    ]),
    equipped_by: 'Raiden Shogun',
  },
  {
    name: 'Sundered Feather', set_name: 'Emblem of Severed Fate', slot: 'Plume',
    level: 16, main_stat_type: 'ATK', main_stat_value: '258',
    substats: JSON.stringify([
      { name: 'CRIT Rate', value: '3.5%', rolls: 1 },
      { name: 'CRIT DMG', value: '14.0%', rolls: 2 },
      { name: 'Energy Recharge', value: '5.2%', rolls: 1 },
    ]),
    equipped_by: 'Raiden Shogun',
  },
  {
    name: 'Storm Cage', set_name: 'Emblem of Severed Fate', slot: 'Sands',
    level: 16, main_stat_type: 'Energy Recharge', main_stat_value: '43.0%',
    substats: JSON.stringify([
      { name: 'CRIT Rate', value: '3.9%', rolls: 1 },
      { name: 'ATK%', value: '9.3%', rolls: 2 },
      { name: 'HP', value: '299', rolls: 1 },
    ]),
    equipped_by: 'Raiden Shogun',
  },
  {
    name: 'Scarlet Vessel', set_name: 'Emblem of Severed Fate', slot: 'Goblet',
    level: 12, main_stat_type: 'Electro DMG Bonus', main_stat_value: '31.3%',
    substats: JSON.stringify([
      { name: 'CRIT Rate', value: '3.5%', rolls: 1 },
      { name: 'ATK%', value: '5.3%', rolls: 1 },
      { name: 'DEF%', value: '5.1%', rolls: 1 },
    ]),
    equipped_by: 'Raiden Shogun',
  },
  {
    name: 'Ornate Kabuto', set_name: 'Emblem of Severed Fate', slot: 'Circlet',
    level: 12, main_stat_type: 'CRIT Rate', main_stat_value: '20.9%',
    substats: JSON.stringify([
      { name: 'CRIT DMG', value: '7.0%', rolls: 1 },
      { name: 'Energy Recharge', value: '5.8%', rolls: 1 },
      { name: 'ATK', value: '18', rolls: 1 },
    ]),
    equipped_by: 'Raiden Shogun',
  },

  // ===== Xiangling: mixed Emblem/off-pieces =====
  {
    name: 'Magnificent Tsuba', set_name: 'Emblem of Severed Fate', slot: 'Flower',
    level: 12, main_stat_type: 'HP', main_stat_value: '3155',
    substats: JSON.stringify([
      { name: 'CRIT Rate', value: '3.5%', rolls: 1 },
      { name: 'Energy Recharge', value: '5.2%', rolls: 1 },
      { name: 'ATK%', value: '5.3%', rolls: 1 },
    ]),
    equipped_by: 'Xiangling',
  },
  {
    name: 'Sundered Feather', set_name: 'Emblem of Severed Fate', slot: 'Plume',
    level: 12, main_stat_type: 'ATK', main_stat_value: '205',
    substats: JSON.stringify([
      { name: 'CRIT Rate', value: '3.9%', rolls: 1 },
      { name: 'Energy Recharge', value: '5.8%', rolls: 1 },
    ]),
    equipped_by: 'Xiangling',
  },
  {
    name: 'Gladiators Nostalgia', set_name: 'Gladiators Finale', slot: 'Sands',
    level: 12, main_stat_type: 'Elemental Mastery', main_stat_value: '125',
    substats: JSON.stringify([
      { name: 'ATK%', value: '5.3%', rolls: 1 },
      { name: 'Energy Recharge', value: '5.8%', rolls: 1 },
      { name: 'DEF', value: '19', rolls: 1 },
    ]),
    equipped_by: 'Xiangling',
  },
  {
    name: 'Nobles Pledging Vessel', set_name: 'Noblesse Oblige', slot: 'Goblet',
    level: 12, main_stat_type: 'Pyro DMG Bonus', main_stat_value: '31.3%',
    substats: JSON.stringify([
      { name: 'CRIT Rate', value: '3.5%', rolls: 1 },
      { name: 'CRIT DMG', value: '7.0%', rolls: 1 },
    ]),
    equipped_by: 'Xiangling',
  },
  {
    name: 'Berserkers Bone Goblet', set_name: 'Berserker', slot: 'Circlet',
    level: 12, main_stat_type: 'CRIT Rate', main_stat_value: '15.6%',
    substats: JSON.stringify([
      { name: 'ATK%', value: '5.3%', rolls: 1 },
      { name: 'HP', value: '299', rolls: 1 },
    ]),
    equipped_by: 'Xiangling',
  },

  // ===== Xingqiu: mixed Emblem/Noblesse =====
  {
    name: 'Royal Flora', set_name: 'Noblesse Oblige', slot: 'Flower',
    level: 12, main_stat_type: 'HP', main_stat_value: '3155',
    substats: JSON.stringify([
      { name: 'CRIT Rate', value: '3.5%', rolls: 1 },
      { name: 'ATK%', value: '5.3%', rolls: 1 },
      { name: 'Energy Recharge', value: '5.8%', rolls: 1 },
    ]),
    equipped_by: 'Xingqiu',
  },
  {
    name: 'Royal Plume', set_name: 'Noblesse Oblige', slot: 'Plume',
    level: 12, main_stat_type: 'ATK', main_stat_value: '205',
    substats: JSON.stringify([
      { name: 'CRIT DMG', value: '7.0%', rolls: 1 },
      { name: 'Energy Recharge', value: '5.2%', rolls: 1 },
    ]),
    equipped_by: 'Xingqiu',
  },
  {
    name: 'Storm Cage', set_name: 'Emblem of Severed Fate', slot: 'Sands',
    level: 12, main_stat_type: 'ATK%', main_stat_value: '31.3%',
    substats: JSON.stringify([
      { name: 'Energy Recharge', value: '5.8%', rolls: 1 },
      { name: 'CRIT Rate', value: '3.5%', rolls: 1 },
    ]),
    equipped_by: 'Xingqiu',
  },

  // ===== Bennett: Noblesse Oblige 4pc (budget build) =====
  {
    name: 'Royal Flora', set_name: 'Noblesse Oblige', slot: 'Flower',
    level: 12, main_stat_type: 'HP', main_stat_value: '3155',
    substats: JSON.stringify([
      { name: 'Energy Recharge', value: '5.8%', rolls: 1 },
      { name: 'HP%', value: '4.7%', rolls: 1 },
    ]),
    equipped_by: 'Bennett',
  },
  {
    name: 'Royal Plume', set_name: 'Noblesse Oblige', slot: 'Plume',
    level: 12, main_stat_type: 'ATK', main_stat_value: '205',
    substats: JSON.stringify([
      { name: 'Energy Recharge', value: '5.2%', rolls: 1 },
      { name: 'HP%', value: '4.7%', rolls: 1 },
    ]),
    equipped_by: 'Bennett',
  },
  {
    name: 'Royal Pocket Watch', set_name: 'Noblesse Oblige', slot: 'Sands',
    level: 12, main_stat_type: 'Energy Recharge', main_stat_value: '34.8%',
    substats: JSON.stringify([
      { name: 'HP%', value: '4.7%', rolls: 1 },
      { name: 'ATK', value: '14', rolls: 1 },
    ]),
    equipped_by: 'Bennett',
  },
  {
    name: 'Royal Silver Urn', set_name: 'Noblesse Oblige', slot: 'Goblet',
    level: 12, main_stat_type: 'HP%', main_stat_value: '31.3%',
    substats: JSON.stringify([
      { name: 'Energy Recharge', value: '5.2%', rolls: 1 },
    ]),
    equipped_by: 'Bennett',
  },
  {
    name: 'Royal Masque', set_name: 'Noblesse Oblige', slot: 'Circlet',
    level: 12, main_stat_type: 'Healing Bonus', main_stat_value: '24.0%',
    substats: JSON.stringify([
      { name: 'HP%', value: '4.7%', rolls: 1 },
      { name: 'Energy Recharge', value: '5.2%', rolls: 1 },
    ]),
    equipped_by: 'Bennett',
  },

  // ===== Sucrose: budget VV set =====
  {
    name: 'In Remembrance of Viridescent Fields', set_name: 'Viridescent Venerer', slot: 'Flower',
    level: 12, main_stat_type: 'HP', main_stat_value: '3155',
    substats: JSON.stringify([
      { name: 'Elemental Mastery', value: '23', rolls: 1 },
      { name: 'Energy Recharge', value: '5.2%', rolls: 1 },
    ]),
    equipped_by: 'Sucrose',
  },
  {
    name: 'Viridescent Arrow Feather', set_name: 'Viridescent Venerer', slot: 'Plume',
    level: 12, main_stat_type: 'ATK', main_stat_value: '205',
    substats: JSON.stringify([
      { name: 'Elemental Mastery', value: '19', rolls: 1 },
      { name: 'HP%', value: '4.7%', rolls: 1 },
    ]),
    equipped_by: 'Sucrose',
  },
  {
    name: 'Viridescent Venerers Determination', set_name: 'Viridescent Venerer', slot: 'Sands',
    level: 12, main_stat_type: 'Elemental Mastery', main_stat_value: '125',
    substats: JSON.stringify([
      { name: 'Energy Recharge', value: '5.8%', rolls: 1 },
      { name: 'HP', value: '299', rolls: 1 },
    ]),
    equipped_by: 'Sucrose',
  },

  // ===== Fischl: partial Thundering Fury =====
  {
    name: 'Thunderbirds Mercy', set_name: 'Thundering Fury', slot: 'Flower',
    level: 12, main_stat_type: 'HP', main_stat_value: '3155',
    substats: JSON.stringify([
      { name: 'ATK%', value: '5.3%', rolls: 1 },
      { name: 'CRIT Rate', value: '3.5%', rolls: 1 },
    ]),
    equipped_by: 'Fischl',
  },
  {
    name: 'Survivor of Catastrophe', set_name: 'Thundering Fury', slot: 'Plume',
    level: 12, main_stat_type: 'ATK', main_stat_value: '205',
    substats: JSON.stringify([
      { name: 'CRIT DMG', value: '7.0%', rolls: 1 },
      { name: 'ATK%', value: '5.3%', rolls: 1 },
    ]),
    equipped_by: 'Fischl',
  },

  // ===== Mona: random pieces =====
  {
    name: 'Gladiators Nostalgia', set_name: 'Gladiators Finale', slot: 'Flower',
    level: 12, main_stat_type: 'HP', main_stat_value: '3155',
    substats: JSON.stringify([
      { name: 'Energy Recharge', value: '5.8%', rolls: 1 },
      { name: 'ATK%', value: '5.3%', rolls: 1 },
    ]),
    equipped_by: 'Mona',
  },
  {
    name: 'Gladiators Destiny', set_name: 'Gladiators Finale', slot: 'Plume',
    level: 12, main_stat_type: 'ATK', main_stat_value: '205',
    substats: JSON.stringify([
      { name: 'CRIT Rate', value: '3.5%', rolls: 1 },
      { name: 'CRIT DMG', value: '7.0%', rolls: 1 },
    ]),
    equipped_by: 'Mona',
  },

  // ===== Unequipped / junk fodder =====
  {
    name: 'Thunderbirds Mercy', set_name: 'Thundering Fury', slot: 'Flower',
    level: 0, main_stat_type: 'HP', main_stat_value: '717',
    substats: JSON.stringify([{ name: 'DEF', value: '19', rolls: 1 }]),
    equipped_by: '',
  },
  {
    name: 'Maidens Distant Love', set_name: 'Maiden Beloved', slot: 'Flower',
    level: 4, main_stat_type: 'HP', main_stat_value: '1893',
    substats: JSON.stringify([{ name: 'HP%', value: '4.7%', rolls: 1 }]),
    equipped_by: '',
  },
  {
    name: 'Gladiators Intoxication', set_name: 'Gladiators Finale', slot: 'Goblet',
    level: 0, main_stat_type: 'DEF%', main_stat_value: '5.8%',
    substats: JSON.stringify([{ name: 'HP', value: '100', rolls: 1 }]),
    equipped_by: '',
  },
  {
    name: 'Berserkers Bone Goblet', set_name: 'Berserker', slot: 'Circlet',
    level: 0, main_stat_type: 'ATK%', main_stat_value: '6.3%',
    substats: JSON.stringify([{ name: 'DEF', value: '10', rolls: 1 }]),
    equipped_by: '',
  },
  {
    name: 'Instructors Brooch', set_name: 'Instructor', slot: 'Flower',
    level: 0, main_stat_type: 'HP', main_stat_value: '717',
    substats: JSON.stringify([{ name: 'Elemental Mastery', value: '12', rolls: 1 }]),
    equipped_by: '',
  },
];

module.exports = { characters, weapons, artifacts };
