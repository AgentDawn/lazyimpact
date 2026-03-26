/**
 * F2P (무과금 유저) Genshin Impact account fixture.
 *
 * 12 characters, 10 weapons, 25 artifacts.
 * Zero five-star characters. Only 4-star + free characters + Traveler.
 * Smart resource management: top 3 characters fully built, supports decent, rest benched.
 * Data format matches the POST /api/characters, /api/weapons, /api/artifacts endpoints.
 */

// ---------------------------------------------------------------------------
// Characters (12명) - ONLY 4-star, free characters, and Traveler
// ---------------------------------------------------------------------------

const characters = [
  // National Team core (fully invested)
  {
    name: 'Xiangling', element: 'Pyro', weapon_type: 'Polearm',
    level: 90, hp: 11800, atk: 1500, crit_rate: 52.0, crit_dmg: 115.0,
    energy_recharge: 210, elemental_mastery: 160,
  },
  {
    name: 'Bennett', element: 'Pyro', weapon_type: 'Sword',
    level: 90, hp: 12500, atk: 820, crit_rate: 25.0, crit_dmg: 55.0,
    energy_recharge: 210, elemental_mastery: 40,
  },
  {
    name: 'Xingqiu', element: 'Hydro', weapon_type: 'Sword',
    level: 90, hp: 15800, atk: 1100, crit_rate: 55.0, crit_dmg: 120.0,
    energy_recharge: 185, elemental_mastery: 45,
  },

  // Second team core
  {
    name: 'Fischl', element: 'Electro', weapon_type: 'Bow',
    level: 80, hp: 9500, atk: 1350, crit_rate: 42.0, crit_dmg: 88.0,
    energy_recharge: 115, elemental_mastery: 35,
  },
  {
    name: 'Sucrose', element: 'Anemo', weapon_type: 'Catalyst',
    level: 80, hp: 8200, atk: 550, crit_rate: 8.0, crit_dmg: 30.0,
    energy_recharge: 140, elemental_mastery: 720,
  },
  {
    name: 'Kaeya', element: 'Cryo', weapon_type: 'Sword',
    level: 80, hp: 11200, atk: 780, crit_rate: 30.0, crit_dmg: 65.0,
    energy_recharge: 140, elemental_mastery: 15,
  },

  // Utility picks
  {
    name: 'Barbara', element: 'Hydro', weapon_type: 'Catalyst',
    level: 70, hp: 14500, atk: 380, crit_rate: 5.0, crit_dmg: 30.0,
    energy_recharge: 120, elemental_mastery: 8,
  },
  {
    name: 'Noelle', element: 'Geo', weapon_type: 'Claymore',
    level: 70, hp: 13200, atk: 620, crit_rate: 15.0, crit_dmg: 42.0,
    energy_recharge: 110, elemental_mastery: 5,
  },
  {
    name: 'Traveler', element: 'Dendro', weapon_type: 'Sword',
    level: 70, hp: 10200, atk: 520, crit_rate: 12.0, crit_dmg: 45.0,
    energy_recharge: 155, elemental_mastery: 80,
  },
  {
    name: 'Collei', element: 'Dendro', weapon_type: 'Bow',
    level: 60, hp: 7800, atk: 420, crit_rate: 10.0, crit_dmg: 40.0,
    energy_recharge: 125, elemental_mastery: 60,
  },

  // Benched
  {
    name: 'Lisa', element: 'Electro', weapon_type: 'Catalyst',
    level: 50, hp: 6800, atk: 320, crit_rate: 5.0, crit_dmg: 30.0,
    energy_recharge: 100, elemental_mastery: 15,
  },
  {
    name: 'Amber', element: 'Pyro', weapon_type: 'Bow',
    level: 40, hp: 5200, atk: 210, crit_rate: 5.0, crit_dmg: 50.0,
    energy_recharge: 100, elemental_mastery: 0,
  },
];

// ---------------------------------------------------------------------------
// Weapons (10개) - all 3-4 star, smart F2P choices
// ---------------------------------------------------------------------------

const weapons = [
  {
    name: 'The Catch', type: 'Polearm', level: 90,
    refinement: 5, base_atk: 510, sub_stat_type: 'Energy Recharge',
    sub_stat_value: '45.9%', rarity: 4, equipped_by: 'Xiangling',
  },
  {
    name: 'Favonius Sword', type: 'Sword', level: 80,
    refinement: 3, base_atk: 454, sub_stat_type: 'Energy Recharge',
    sub_stat_value: '61.3%', rarity: 4, equipped_by: 'Bennett',
  },
  {
    name: 'Sacrificial Sword', type: 'Sword', level: 80,
    refinement: 1, base_atk: 454, sub_stat_type: 'Energy Recharge',
    sub_stat_value: '61.3%', rarity: 4, equipped_by: 'Xingqiu',
  },
  {
    name: 'Prototype Archaic', type: 'Claymore', level: 70,
    refinement: 2, base_atk: 454, sub_stat_type: 'ATK%',
    sub_stat_value: '36.8%', rarity: 4, equipped_by: 'Noelle',
  },
  {
    name: 'Stringless', type: 'Bow', level: 80,
    refinement: 1, base_atk: 510, sub_stat_type: 'Elemental Mastery',
    sub_stat_value: '165', rarity: 4, equipped_by: 'Fischl',
  },
  {
    name: 'Sacrificial Fragments', type: 'Catalyst', level: 80,
    refinement: 1, base_atk: 454, sub_stat_type: 'Elemental Mastery',
    sub_stat_value: '221', rarity: 4, equipped_by: 'Sucrose',
  },
  {
    name: 'Harbinger of Dawn', type: 'Sword', level: 80,
    refinement: 5, base_atk: 401, sub_stat_type: 'CRIT DMG',
    sub_stat_value: '46.9%', rarity: 3, equipped_by: 'Kaeya',
  },
  {
    name: 'Thrilling Tales of Dragon Slayers', type: 'Catalyst', level: 70,
    refinement: 5, base_atk: 401, sub_stat_type: 'HP%',
    sub_stat_value: '35.2%', rarity: 3, equipped_by: 'Barbara',
  },
  {
    name: 'Favonius Sword', type: 'Sword', level: 70,
    refinement: 1, base_atk: 401, sub_stat_type: 'Energy Recharge',
    sub_stat_value: '45.9%', rarity: 4, equipped_by: 'Traveler',
  },
  {
    name: 'Favonius Warbow', type: 'Bow', level: 60,
    refinement: 1, base_atk: 401, sub_stat_type: 'Energy Recharge',
    sub_stat_value: '30.6%', rarity: 4, equipped_by: 'Collei',
  },
];

// ---------------------------------------------------------------------------
// Artifacts (25개) - decent +20 on main 3, +12-16 supports, junk on rest
// ---------------------------------------------------------------------------

const artifacts = [
  // ===== Xiangling: Emblem of Severed Fate 4pc (all +20) =====
  {
    name: 'Magnificent Tsuba', set_name: 'Emblem of Severed Fate', slot: 'Flower',
    level: 20, main_stat_type: 'HP', main_stat_value: '4780',
    substats: JSON.stringify([
      { name: 'CRIT Rate', value: '7.0%', rolls: 2 },
      { name: 'CRIT DMG', value: '14.0%', rolls: 2 },
      { name: 'Energy Recharge', value: '5.8%', rolls: 1 },
      { name: 'ATK%', value: '5.3%', rolls: 1 },
    ]),
    equipped_by: 'Xiangling',
  },
  {
    name: 'Sundered Feather', set_name: 'Emblem of Severed Fate', slot: 'Plume',
    level: 20, main_stat_type: 'ATK', main_stat_value: '311',
    substats: JSON.stringify([
      { name: 'CRIT Rate', value: '6.2%', rolls: 2 },
      { name: 'CRIT DMG', value: '7.0%', rolls: 1 },
      { name: 'Energy Recharge', value: '11.0%', rolls: 2 },
      { name: 'ATK%', value: '5.3%', rolls: 1 },
    ]),
    equipped_by: 'Xiangling',
  },
  {
    name: 'Storm Cage', set_name: 'Emblem of Severed Fate', slot: 'Sands',
    level: 20, main_stat_type: 'Energy Recharge', main_stat_value: '51.8%',
    substats: JSON.stringify([
      { name: 'CRIT Rate', value: '3.9%', rolls: 1 },
      { name: 'CRIT DMG', value: '13.2%', rolls: 2 },
      { name: 'ATK%', value: '9.3%', rolls: 2 },
      { name: 'HP', value: '299', rolls: 1 },
    ]),
    equipped_by: 'Xiangling',
  },
  {
    name: 'Scarlet Vessel', set_name: 'Emblem of Severed Fate', slot: 'Goblet',
    level: 20, main_stat_type: 'Pyro DMG Bonus', main_stat_value: '46.6%',
    substats: JSON.stringify([
      { name: 'CRIT Rate', value: '3.5%', rolls: 1 },
      { name: 'CRIT DMG', value: '7.0%', rolls: 1 },
      { name: 'Energy Recharge', value: '5.8%', rolls: 1 },
      { name: 'ATK%', value: '9.3%', rolls: 2 },
    ]),
    equipped_by: 'Xiangling',
  },
  {
    name: 'Ornate Kabuto', set_name: 'Emblem of Severed Fate', slot: 'Circlet',
    level: 20, main_stat_type: 'CRIT Rate', main_stat_value: '31.1%',
    substats: JSON.stringify([
      { name: 'CRIT DMG', value: '14.0%', rolls: 2 },
      { name: 'Energy Recharge', value: '5.8%', rolls: 1 },
      { name: 'ATK%', value: '5.3%', rolls: 1 },
      { name: 'DEF', value: '23', rolls: 1 },
    ]),
    equipped_by: 'Xiangling',
  },

  // ===== Xingqiu: Emblem of Severed Fate 4pc (all +20) =====
  {
    name: 'Magnificent Tsuba', set_name: 'Emblem of Severed Fate', slot: 'Flower',
    level: 20, main_stat_type: 'HP', main_stat_value: '4780',
    substats: JSON.stringify([
      { name: 'CRIT Rate', value: '6.6%', rolls: 2 },
      { name: 'CRIT DMG', value: '14.8%', rolls: 2 },
      { name: 'ATK%', value: '5.3%', rolls: 1 },
      { name: 'Energy Recharge', value: '5.2%', rolls: 1 },
    ]),
    equipped_by: 'Xingqiu',
  },
  {
    name: 'Sundered Feather', set_name: 'Emblem of Severed Fate', slot: 'Plume',
    level: 20, main_stat_type: 'ATK', main_stat_value: '311',
    substats: JSON.stringify([
      { name: 'CRIT Rate', value: '7.0%', rolls: 2 },
      { name: 'CRIT DMG', value: '14.0%', rolls: 2 },
      { name: 'Energy Recharge', value: '5.8%', rolls: 1 },
      { name: 'HP%', value: '4.7%', rolls: 1 },
    ]),
    equipped_by: 'Xingqiu',
  },
  {
    name: 'Storm Cage', set_name: 'Emblem of Severed Fate', slot: 'Sands',
    level: 20, main_stat_type: 'ATK%', main_stat_value: '46.6%',
    substats: JSON.stringify([
      { name: 'CRIT Rate', value: '3.9%', rolls: 1 },
      { name: 'CRIT DMG', value: '7.0%', rolls: 1 },
      { name: 'Energy Recharge', value: '11.0%', rolls: 2 },
      { name: 'HP%', value: '4.7%', rolls: 1 },
    ]),
    equipped_by: 'Xingqiu',
  },
  {
    name: 'Scarlet Vessel', set_name: 'Emblem of Severed Fate', slot: 'Goblet',
    level: 20, main_stat_type: 'Hydro DMG Bonus', main_stat_value: '46.6%',
    substats: JSON.stringify([
      { name: 'CRIT Rate', value: '6.2%', rolls: 2 },
      { name: 'CRIT DMG', value: '7.0%', rolls: 1 },
      { name: 'ATK%', value: '5.3%', rolls: 1 },
      { name: 'DEF', value: '19', rolls: 1 },
    ]),
    equipped_by: 'Xingqiu',
  },
  {
    name: 'Ornate Kabuto', set_name: 'Emblem of Severed Fate', slot: 'Circlet',
    level: 20, main_stat_type: 'CRIT Rate', main_stat_value: '31.1%',
    substats: JSON.stringify([
      { name: 'CRIT DMG', value: '14.8%', rolls: 2 },
      { name: 'Energy Recharge', value: '5.2%', rolls: 1 },
      { name: 'ATK%', value: '5.3%', rolls: 1 },
      { name: 'HP', value: '299', rolls: 1 },
    ]),
    equipped_by: 'Xingqiu',
  },

  // ===== Bennett: Noblesse Oblige 4pc (+16) =====
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
      { name: 'HP%', value: '9.3%', rolls: 2 },
      { name: 'ATK', value: '18', rolls: 1 },
    ]),
    equipped_by: 'Bennett',
  },
  {
    name: 'Royal Pocket Watch', set_name: 'Noblesse Oblige', slot: 'Sands',
    level: 16, main_stat_type: 'Energy Recharge', main_stat_value: '43.0%',
    substats: JSON.stringify([
      { name: 'HP%', value: '9.3%', rolls: 2 },
      { name: 'DEF', value: '19', rolls: 1 },
    ]),
    equipped_by: 'Bennett',
  },
  {
    name: 'Royal Silver Urn', set_name: 'Noblesse Oblige', slot: 'Goblet',
    level: 16, main_stat_type: 'HP%', main_stat_value: '38.7%',
    substats: JSON.stringify([
      { name: 'Energy Recharge', value: '5.2%', rolls: 1 },
      { name: 'ATK', value: '14', rolls: 1 },
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

  // ===== Fischl: Thundering Fury 2pc + ATK 2pc (+12) =====
  {
    name: 'Thunderbirds Mercy', set_name: 'Thundering Fury', slot: 'Flower',
    level: 12, main_stat_type: 'HP', main_stat_value: '3155',
    substats: JSON.stringify([
      { name: 'ATK%', value: '9.3%', rolls: 2 },
      { name: 'CRIT Rate', value: '3.5%', rolls: 1 },
    ]),
    equipped_by: 'Fischl',
  },
  {
    name: 'Survivor of Catastrophe', set_name: 'Thundering Fury', slot: 'Plume',
    level: 12, main_stat_type: 'ATK', main_stat_value: '205',
    substats: JSON.stringify([
      { name: 'CRIT Rate', value: '6.6%', rolls: 2 },
      { name: 'CRIT DMG', value: '7.0%', rolls: 1 },
    ]),
    equipped_by: 'Fischl',
  },

  // ===== Sucrose: VV 4pc (+12) =====
  {
    name: 'In Remembrance of Viridescent Fields', set_name: 'Viridescent Venerer', slot: 'Flower',
    level: 12, main_stat_type: 'HP', main_stat_value: '3155',
    substats: JSON.stringify([
      { name: 'Elemental Mastery', value: '23', rolls: 1 },
      { name: 'Energy Recharge', value: '5.8%', rolls: 1 },
    ]),
    equipped_by: 'Sucrose',
  },
  {
    name: 'Viridescent Arrow Feather', set_name: 'Viridescent Venerer', slot: 'Plume',
    level: 12, main_stat_type: 'ATK', main_stat_value: '205',
    substats: JSON.stringify([
      { name: 'Elemental Mastery', value: '35', rolls: 2 },
      { name: 'HP', value: '299', rolls: 1 },
    ]),
    equipped_by: 'Sucrose',
  },
  {
    name: 'Viridescent Venerers Determination', set_name: 'Viridescent Venerer', slot: 'Sands',
    level: 12, main_stat_type: 'Elemental Mastery', main_stat_value: '125',
    substats: JSON.stringify([
      { name: 'Energy Recharge', value: '5.2%', rolls: 1 },
      { name: 'HP%', value: '4.7%', rolls: 1 },
    ]),
    equipped_by: 'Sucrose',
  },

  // ===== Unequipped junk =====
  {
    name: 'Gladiators Nostalgia', set_name: 'Gladiators Finale', slot: 'Flower',
    level: 0, main_stat_type: 'HP', main_stat_value: '717',
    substats: JSON.stringify([{ name: 'DEF', value: '19', rolls: 1 }]),
    equipped_by: '',
  },
  {
    name: 'Gladiators Destiny', set_name: 'Gladiators Finale', slot: 'Plume',
    level: 4, main_stat_type: 'ATK', main_stat_value: '117',
    substats: JSON.stringify([{ name: 'HP%', value: '4.7%', rolls: 1 }]),
    equipped_by: '',
  },
  {
    name: 'Berserkers Bone Goblet', set_name: 'Berserker', slot: 'Circlet',
    level: 0, main_stat_type: 'ATK%', main_stat_value: '6.3%',
    substats: JSON.stringify([{ name: 'DEF', value: '10', rolls: 1 }]),
    equipped_by: '',
  },
  {
    name: 'Maidens Distant Love', set_name: 'Maiden Beloved', slot: 'Flower',
    level: 0, main_stat_type: 'HP', main_stat_value: '717',
    substats: JSON.stringify([{ name: 'ATK', value: '14', rolls: 1 }]),
    equipped_by: '',
  },
  {
    name: 'Exiles Flower', set_name: 'The Exile', slot: 'Flower',
    level: 4, main_stat_type: 'HP', main_stat_value: '1123',
    substats: JSON.stringify([{ name: 'Energy Recharge', value: '5.2%', rolls: 1 }]),
    equipped_by: '',
  },
];

module.exports = { characters, weapons, artifacts };
