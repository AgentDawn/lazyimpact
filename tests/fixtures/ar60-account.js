/**
 * AR60 (모험 등급 60) realistic Genshin Impact account fixture.
 *
 * 20 characters, 15 weapons, 50 artifacts.
 * Data format matches the POST /api/characters, /api/weapons, /api/artifacts endpoints.
 */

// ---------------------------------------------------------------------------
// Characters (20명)
// ---------------------------------------------------------------------------

const characters = [
  // Tier 1 - Main DPS (Lv.90, 풀육성)
  {
    name: 'Raiden Shogun', element: 'Electro', weapon_type: 'Polearm',
    level: 90, hp: 19445, atk: 2104, crit_rate: 64.2, crit_dmg: 148.5,
    energy_recharge: 274.1, elemental_mastery: 105,
  },
  {
    name: 'Hu Tao', element: 'Pyro', weapon_type: 'Polearm',
    level: 90, hp: 36000, atk: 1200, crit_rate: 75, crit_dmg: 220,
    energy_recharge: 100, elemental_mastery: 80,
  },
  {
    name: 'Ganyu', element: 'Cryo', weapon_type: 'Bow',
    level: 90, hp: 15000, atk: 2000, crit_rate: 60, crit_dmg: 200,
    energy_recharge: 120, elemental_mastery: 40,
  },
  {
    name: 'Neuvillette', element: 'Hydro', weapon_type: 'Catalyst',
    level: 90, hp: 42000, atk: 800, crit_rate: 70, crit_dmg: 180,
    energy_recharge: 110, elemental_mastery: 30,
  },

  // Tier 2 - Sub DPS/Support (Lv.80-90)
  {
    name: 'Kaedehara Kazuha', element: 'Anemo', weapon_type: 'Sword',
    level: 90, hp: 22000, atk: 900, crit_rate: 30, crit_dmg: 60,
    energy_recharge: 160, elemental_mastery: 960,
  },
  {
    name: 'Xingqiu', element: 'Hydro', weapon_type: 'Sword',
    level: 80, hp: 16000, atk: 1100, crit_rate: 55, crit_dmg: 120,
    energy_recharge: 180, elemental_mastery: 50,
  },
  {
    name: 'Xiangling', element: 'Pyro', weapon_type: 'Polearm',
    level: 80, hp: 12000, atk: 1400, crit_rate: 50, crit_dmg: 110,
    energy_recharge: 200, elemental_mastery: 150,
  },
  {
    name: 'Yelan', element: 'Hydro', weapon_type: 'Bow',
    level: 90, hp: 30000, atk: 800, crit_rate: 65, crit_dmg: 190,
    energy_recharge: 140, elemental_mastery: 20,
  },
  {
    name: 'Nahida', element: 'Dendro', weapon_type: 'Catalyst',
    level: 90, hp: 14000, atk: 900, crit_rate: 40, crit_dmg: 100,
    energy_recharge: 140, elemental_mastery: 800,
  },
  {
    name: 'Zhongli', element: 'Geo', weapon_type: 'Polearm',
    level: 90, hp: 50000, atk: 700, crit_rate: 20, crit_dmg: 50,
    energy_recharge: 130, elemental_mastery: 30,
  },

  // Tier 3 - Built supports (Lv.70-80)
  {
    name: 'Bennett', element: 'Pyro', weapon_type: 'Sword',
    level: 80, hp: 12000, atk: 800, crit_rate: 30, crit_dmg: 60,
    energy_recharge: 200, elemental_mastery: 50,
  },
  {
    name: 'Fischl', element: 'Electro', weapon_type: 'Bow',
    level: 80, hp: 10000, atk: 1500, crit_rate: 45, crit_dmg: 90,
    energy_recharge: 120, elemental_mastery: 40,
  },
  {
    name: 'Diona', element: 'Cryo', weapon_type: 'Bow',
    level: 70, hp: 18000, atk: 500, crit_rate: 15, crit_dmg: 40,
    energy_recharge: 180, elemental_mastery: 20,
  },
  {
    name: 'Sucrose', element: 'Anemo', weapon_type: 'Catalyst',
    level: 70, hp: 9000, atk: 600, crit_rate: 10, crit_dmg: 30,
    energy_recharge: 150, elemental_mastery: 700,
  },

  // Tier 4 - Partially built (Lv.50-70)
  {
    name: 'Rosaria', element: 'Cryo', weapon_type: 'Polearm',
    level: 60, hp: 10000, atk: 800, crit_rate: 35, crit_dmg: 70,
    energy_recharge: 130, elemental_mastery: 20,
  },
  {
    name: 'Kaeya', element: 'Cryo', weapon_type: 'Sword',
    level: 60, hp: 11000, atk: 750, crit_rate: 25, crit_dmg: 50,
    energy_recharge: 140, elemental_mastery: 15,
  },
  {
    name: 'Barbara', element: 'Hydro', weapon_type: 'Catalyst',
    level: 50, hp: 14000, atk: 400, crit_rate: 5, crit_dmg: 30,
    energy_recharge: 120, elemental_mastery: 10,
  },
  {
    name: 'Noelle', element: 'Geo', weapon_type: 'Claymore',
    level: 50, hp: 13000, atk: 600, crit_rate: 15, crit_dmg: 40,
    energy_recharge: 110, elemental_mastery: 10,
  },
  {
    name: 'Lisa', element: 'Electro', weapon_type: 'Catalyst',
    level: 40, hp: 8000, atk: 500, crit_rate: 10, crit_dmg: 30,
    energy_recharge: 100, elemental_mastery: 30,
  },
  {
    name: 'Amber', element: 'Pyro', weapon_type: 'Bow',
    level: 20, hp: 5000, atk: 300, crit_rate: 5, crit_dmg: 20,
    energy_recharge: 100, elemental_mastery: 0,
  },
];

// ---------------------------------------------------------------------------
// Weapons (15개)
// ---------------------------------------------------------------------------

const weapons = [
  // 5-star weapons
  {
    name: 'Engulfing Lightning', type: 'Polearm', level: 90,
    refinement: 1, base_atk: 608, sub_stat_type: 'Energy Recharge',
    sub_stat_value: '55.1%', rarity: 5, equipped_by: 'Raiden Shogun',
  },
  {
    name: 'Staff of Homa', type: 'Polearm', level: 90,
    refinement: 1, base_atk: 608, sub_stat_type: 'CRIT DMG',
    sub_stat_value: '66.2%', rarity: 5, equipped_by: 'Hu Tao',
  },
  {
    name: 'Amos Bow', type: 'Bow', level: 90,
    refinement: 1, base_atk: 608, sub_stat_type: 'ATK%',
    sub_stat_value: '49.6%', rarity: 5, equipped_by: 'Ganyu',
  },
  {
    name: 'Freedom-Sworn', type: 'Sword', level: 90,
    refinement: 1, base_atk: 608, sub_stat_type: 'Elemental Mastery',
    sub_stat_value: '198', rarity: 5, equipped_by: 'Kaedehara Kazuha',
  },
  {
    name: 'Aqua Simulacra', type: 'Bow', level: 90,
    refinement: 1, base_atk: 542, sub_stat_type: 'CRIT DMG',
    sub_stat_value: '88.2%', rarity: 5, equipped_by: 'Yelan',
  },

  // 4-star weapons
  {
    name: 'Sacrificial Sword', type: 'Sword', level: 80,
    refinement: 3, base_atk: 454, sub_stat_type: 'Energy Recharge',
    sub_stat_value: '61.3%', rarity: 4, equipped_by: 'Xingqiu',
  },
  {
    name: 'The Catch', type: 'Polearm', level: 90,
    refinement: 5, base_atk: 510, sub_stat_type: 'Energy Recharge',
    sub_stat_value: '45.9%', rarity: 4, equipped_by: 'Xiangling',
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
    name: 'Sacrificial Bow', type: 'Bow', level: 70,
    refinement: 1, base_atk: 454, sub_stat_type: 'Energy Recharge',
    sub_stat_value: '30.6%', rarity: 4, equipped_by: 'Diona',
  },
  {
    name: 'Black Tassel', type: 'Polearm', level: 90,
    refinement: 5, base_atk: 354, sub_stat_type: 'HP%',
    sub_stat_value: '46.9%', rarity: 3, equipped_by: 'Zhongli',
  },
  {
    name: 'Favonius Lance', type: 'Polearm', level: 60,
    refinement: 1, base_atk: 454, sub_stat_type: 'Energy Recharge',
    sub_stat_value: '30.6%', rarity: 4, equipped_by: 'Rosaria',
  },

  // 3-star or unleveled
  {
    name: 'Thrilling Tales of Dragon Slayers', type: 'Catalyst', level: 70,
    refinement: 5, base_atk: 401, sub_stat_type: 'HP%',
    sub_stat_value: '35.2%', rarity: 3, equipped_by: 'Sucrose',
  },
  {
    name: 'Skyrider Sword', type: 'Sword', level: 40,
    refinement: 1, base_atk: 354, sub_stat_type: 'Energy Recharge',
    sub_stat_value: '11.3%', rarity: 3, equipped_by: '',
  },
  {
    name: 'Slingshot', type: 'Bow', level: 20,
    refinement: 1, base_atk: 354, sub_stat_type: 'CRIT Rate',
    sub_stat_value: '6.8%', rarity: 3, equipped_by: '',
  },
];

// ---------------------------------------------------------------------------
// Artifacts (50개) — 30 equipped (+20) + 5 partial-equipped (+12~16) + 15 junk
// ---------------------------------------------------------------------------

const artifacts = [
  // ===== Raiden Shogun: Emblem of Severed Fate 4pc (all +20) =====
  {
    name: 'Magnificent Tsuba', set_name: 'Emblem of Severed Fate', slot: 'Flower',
    level: 20, main_stat_type: 'HP', main_stat_value: '4780',
    substats: JSON.stringify([
      { name: 'CRIT Rate', value: '10.5%', rolls: 3 },
      { name: 'CRIT DMG', value: '14.0%', rolls: 2 },
      { name: 'Energy Recharge', value: '11.0%', rolls: 2 },
      { name: 'ATK%', value: '9.3%', rolls: 1 },
    ]),
    equipped_by: 'Raiden Shogun',
  },
  {
    name: 'Sundered Feather', set_name: 'Emblem of Severed Fate', slot: 'Plume',
    level: 20, main_stat_type: 'ATK', main_stat_value: '311',
    substats: JSON.stringify([
      { name: 'CRIT Rate', value: '7.0%', rolls: 2 },
      { name: 'CRIT DMG', value: '21.0%', rolls: 3 },
      { name: 'Energy Recharge', value: '5.8%', rolls: 1 },
      { name: 'HP%', value: '4.7%', rolls: 1 },
    ]),
    equipped_by: 'Raiden Shogun',
  },
  {
    name: 'Storm Cage', set_name: 'Emblem of Severed Fate', slot: 'Sands',
    level: 20, main_stat_type: 'Energy Recharge', main_stat_value: '51.8%',
    substats: JSON.stringify([
      { name: 'CRIT Rate', value: '6.2%', rolls: 2 },
      { name: 'CRIT DMG', value: '13.2%', rolls: 2 },
      { name: 'ATK%', value: '11.7%', rolls: 2 },
      { name: 'HP', value: '508', rolls: 1 },
    ]),
    equipped_by: 'Raiden Shogun',
  },
  {
    name: 'Scarlet Vessel', set_name: 'Emblem of Severed Fate', slot: 'Goblet',
    level: 20, main_stat_type: 'Electro DMG Bonus', main_stat_value: '46.6%',
    substats: JSON.stringify([
      { name: 'CRIT Rate', value: '7.8%', rolls: 2 },
      { name: 'CRIT DMG', value: '7.0%', rolls: 1 },
      { name: 'Energy Recharge', value: '9.7%', rolls: 2 },
      { name: 'ATK%', value: '5.3%', rolls: 1 },
    ]),
    equipped_by: 'Raiden Shogun',
  },
  {
    name: 'Ornate Kabuto', set_name: 'Emblem of Severed Fate', slot: 'Circlet',
    level: 20, main_stat_type: 'CRIT Rate', main_stat_value: '31.1%',
    substats: JSON.stringify([
      { name: 'CRIT DMG', value: '19.4%', rolls: 3 },
      { name: 'Energy Recharge', value: '6.5%', rolls: 1 },
      { name: 'ATK%', value: '9.3%', rolls: 2 },
      { name: 'DEF', value: '23', rolls: 1 },
    ]),
    equipped_by: 'Raiden Shogun',
  },

  // ===== Hu Tao: Crimson Witch of Flames 4pc (all +20) =====
  {
    name: 'Witchs Flower of Blaze', set_name: 'Crimson Witch of Flames', slot: 'Flower',
    level: 20, main_stat_type: 'HP', main_stat_value: '4780',
    substats: JSON.stringify([
      { name: 'CRIT Rate', value: '10.9%', rolls: 3 },
      { name: 'CRIT DMG', value: '14.8%', rolls: 2 },
      { name: 'Elemental Mastery', value: '23', rolls: 1 },
      { name: 'ATK%', value: '5.8%', rolls: 1 },
    ]),
    equipped_by: 'Hu Tao',
  },
  {
    name: 'Witchs Ever-Burning Plume', set_name: 'Crimson Witch of Flames', slot: 'Plume',
    level: 20, main_stat_type: 'ATK', main_stat_value: '311',
    substats: JSON.stringify([
      { name: 'CRIT Rate', value: '6.2%', rolls: 2 },
      { name: 'CRIT DMG', value: '21.8%', rolls: 3 },
      { name: 'HP%', value: '9.3%', rolls: 2 },
      { name: 'Elemental Mastery', value: '19', rolls: 1 },
    ]),
    equipped_by: 'Hu Tao',
  },
  {
    name: 'Witchs End Time', set_name: 'Crimson Witch of Flames', slot: 'Sands',
    level: 20, main_stat_type: 'HP%', main_stat_value: '46.6%',
    substats: JSON.stringify([
      { name: 'CRIT Rate', value: '7.8%', rolls: 2 },
      { name: 'CRIT DMG', value: '14.0%', rolls: 2 },
      { name: 'Elemental Mastery', value: '40', rolls: 2 },
      { name: 'Energy Recharge', value: '5.2%', rolls: 1 },
    ]),
    equipped_by: 'Hu Tao',
  },
  {
    name: 'Witchs Heart Flames', set_name: 'Crimson Witch of Flames', slot: 'Goblet',
    level: 20, main_stat_type: 'Pyro DMG Bonus', main_stat_value: '46.6%',
    substats: JSON.stringify([
      { name: 'CRIT Rate', value: '3.5%', rolls: 1 },
      { name: 'CRIT DMG', value: '28.8%', rolls: 4 },
      { name: 'HP%', value: '5.8%', rolls: 1 },
      { name: 'ATK', value: '18', rolls: 1 },
    ]),
    equipped_by: 'Hu Tao',
  },
  {
    name: 'Witchs Scorching Hat', set_name: 'Crimson Witch of Flames', slot: 'Circlet',
    level: 20, main_stat_type: 'CRIT DMG', main_stat_value: '62.2%',
    substats: JSON.stringify([
      { name: 'CRIT Rate', value: '10.1%', rolls: 3 },
      { name: 'HP%', value: '14.0%', rolls: 3 },
      { name: 'Elemental Mastery', value: '16', rolls: 1 },
      { name: 'DEF', value: '19', rolls: 1 },
    ]),
    equipped_by: 'Hu Tao',
  },

  // ===== Ganyu: Blizzard Strayer 4pc (all +20) =====
  {
    name: 'Snowswept Memory', set_name: 'Blizzard Strayer', slot: 'Flower',
    level: 20, main_stat_type: 'HP', main_stat_value: '4780',
    substats: JSON.stringify([
      { name: 'CRIT DMG', value: '21.0%', rolls: 3 },
      { name: 'ATK%', value: '11.1%', rolls: 2 },
      { name: 'Energy Recharge', value: '5.8%', rolls: 1 },
      { name: 'DEF', value: '23', rolls: 1 },
    ]),
    equipped_by: 'Ganyu',
  },
  {
    name: 'Icebreakers Resolve', set_name: 'Blizzard Strayer', slot: 'Plume',
    level: 20, main_stat_type: 'ATK', main_stat_value: '311',
    substats: JSON.stringify([
      { name: 'CRIT DMG', value: '14.8%', rolls: 2 },
      { name: 'ATK%', value: '9.3%', rolls: 2 },
      { name: 'Energy Recharge', value: '11.0%', rolls: 2 },
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
      { name: 'Elemental Mastery', value: '23', rolls: 1 },
    ]),
    equipped_by: 'Ganyu',
  },
  {
    name: 'Frost-Weaved Dignity', set_name: 'Blizzard Strayer', slot: 'Goblet',
    level: 20, main_stat_type: 'Cryo DMG Bonus', main_stat_value: '46.6%',
    substats: JSON.stringify([
      { name: 'CRIT DMG', value: '14.0%', rolls: 2 },
      { name: 'ATK%', value: '5.8%', rolls: 1 },
      { name: 'Energy Recharge', value: '9.7%', rolls: 2 },
      { name: 'DEF%', value: '7.3%', rolls: 1 },
    ]),
    equipped_by: 'Ganyu',
  },
  {
    name: 'Broken Rimes Echo', set_name: 'Blizzard Strayer', slot: 'Circlet',
    level: 20, main_stat_type: 'CRIT DMG', main_stat_value: '62.2%',
    substats: JSON.stringify([
      { name: 'CRIT Rate', value: '6.6%', rolls: 2 },
      { name: 'ATK%', value: '14.0%', rolls: 3 },
      { name: 'HP', value: '508', rolls: 1 },
      { name: 'DEF', value: '19', rolls: 1 },
    ]),
    equipped_by: 'Ganyu',
  },

  // ===== Kazuha: Viridescent Venerer 4pc (all +20, EM/EM/EM) =====
  {
    name: 'In Remembrance of Viridescent Fields', set_name: 'Viridescent Venerer', slot: 'Flower',
    level: 20, main_stat_type: 'HP', main_stat_value: '4780',
    substats: JSON.stringify([
      { name: 'Elemental Mastery', value: '42', rolls: 2 },
      { name: 'Energy Recharge', value: '11.0%', rolls: 2 },
      { name: 'ATK%', value: '5.3%', rolls: 1 },
      { name: 'HP%', value: '4.7%', rolls: 1 },
    ]),
    equipped_by: 'Kaedehara Kazuha',
  },
  {
    name: 'Viridescent Arrow Feather', set_name: 'Viridescent Venerer', slot: 'Plume',
    level: 20, main_stat_type: 'ATK', main_stat_value: '311',
    substats: JSON.stringify([
      { name: 'Elemental Mastery', value: '56', rolls: 3 },
      { name: 'Energy Recharge', value: '5.8%', rolls: 1 },
      { name: 'HP', value: '508', rolls: 1 },
      { name: 'DEF', value: '23', rolls: 1 },
    ]),
    equipped_by: 'Kaedehara Kazuha',
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
    equipped_by: 'Kaedehara Kazuha',
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
    equipped_by: 'Kaedehara Kazuha',
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
    equipped_by: 'Kaedehara Kazuha',
  },

  // ===== Yelan: Emblem of Severed Fate 4pc (all +20) =====
  {
    name: 'Magnificent Tsuba', set_name: 'Emblem of Severed Fate', slot: 'Flower',
    level: 20, main_stat_type: 'HP', main_stat_value: '4780',
    substats: JSON.stringify([
      { name: 'CRIT Rate', value: '7.8%', rolls: 2 },
      { name: 'CRIT DMG', value: '14.0%', rolls: 2 },
      { name: 'HP%', value: '9.3%', rolls: 2 },
      { name: 'Energy Recharge', value: '5.2%', rolls: 1 },
    ]),
    equipped_by: 'Yelan',
  },
  {
    name: 'Sundered Feather', set_name: 'Emblem of Severed Fate', slot: 'Plume',
    level: 20, main_stat_type: 'ATK', main_stat_value: '311',
    substats: JSON.stringify([
      { name: 'CRIT Rate', value: '10.1%', rolls: 3 },
      { name: 'CRIT DMG', value: '7.0%', rolls: 1 },
      { name: 'HP%', value: '14.6%', rolls: 3 },
      { name: 'DEF', value: '19', rolls: 1 },
    ]),
    equipped_by: 'Yelan',
  },
  {
    name: 'Storm Cage', set_name: 'Emblem of Severed Fate', slot: 'Sands',
    level: 20, main_stat_type: 'HP%', main_stat_value: '46.6%',
    substats: JSON.stringify([
      { name: 'CRIT Rate', value: '6.6%', rolls: 2 },
      { name: 'CRIT DMG', value: '13.2%', rolls: 2 },
      { name: 'Energy Recharge', value: '11.0%', rolls: 2 },
      { name: 'ATK', value: '18', rolls: 1 },
    ]),
    equipped_by: 'Yelan',
  },
  {
    name: 'Scarlet Vessel', set_name: 'Emblem of Severed Fate', slot: 'Goblet',
    level: 20, main_stat_type: 'Hydro DMG Bonus', main_stat_value: '46.6%',
    substats: JSON.stringify([
      { name: 'CRIT Rate', value: '3.9%', rolls: 1 },
      { name: 'CRIT DMG', value: '21.0%', rolls: 3 },
      { name: 'HP%', value: '5.8%', rolls: 1 },
      { name: 'Energy Recharge', value: '5.8%', rolls: 1 },
    ]),
    equipped_by: 'Yelan',
  },
  {
    name: 'Ornate Kabuto', set_name: 'Emblem of Severed Fate', slot: 'Circlet',
    level: 20, main_stat_type: 'CRIT Rate', main_stat_value: '31.1%',
    substats: JSON.stringify([
      { name: 'CRIT DMG', value: '14.8%', rolls: 2 },
      { name: 'HP%', value: '9.3%', rolls: 2 },
      { name: 'Energy Recharge', value: '9.7%', rolls: 2 },
      { name: 'DEF', value: '23', rolls: 1 },
    ]),
    equipped_by: 'Yelan',
  },

  // ===== Nahida: Deepwood Memories 4pc (all +20) =====
  {
    name: 'A Time of Insight', set_name: 'Deepwood Memories', slot: 'Flower',
    level: 20, main_stat_type: 'HP', main_stat_value: '4780',
    substats: JSON.stringify([
      { name: 'CRIT Rate', value: '6.6%', rolls: 2 },
      { name: 'Elemental Mastery', value: '42', rolls: 2 },
      { name: 'Energy Recharge', value: '5.8%', rolls: 1 },
      { name: 'ATK%', value: '5.3%', rolls: 1 },
    ]),
    equipped_by: 'Nahida',
  },
  {
    name: 'Shaft of Remembrance', set_name: 'Deepwood Memories', slot: 'Plume',
    level: 20, main_stat_type: 'ATK', main_stat_value: '311',
    substats: JSON.stringify([
      { name: 'CRIT Rate', value: '3.9%', rolls: 1 },
      { name: 'Elemental Mastery', value: '56', rolls: 3 },
      { name: 'CRIT DMG', value: '7.0%', rolls: 1 },
      { name: 'HP', value: '299', rolls: 1 },
    ]),
    equipped_by: 'Nahida',
  },
  {
    name: 'Symbol of Felicitation', set_name: 'Deepwood Memories', slot: 'Sands',
    level: 20, main_stat_type: 'Elemental Mastery', main_stat_value: '187',
    substats: JSON.stringify([
      { name: 'CRIT Rate', value: '7.0%', rolls: 2 },
      { name: 'Energy Recharge', value: '5.2%', rolls: 1 },
      { name: 'ATK%', value: '9.3%', rolls: 2 },
      { name: 'HP', value: '508', rolls: 1 },
    ]),
    equipped_by: 'Nahida',
  },
  {
    name: 'Laurel Coronet', set_name: 'Deepwood Memories', slot: 'Goblet',
    level: 20, main_stat_type: 'Dendro DMG Bonus', main_stat_value: '46.6%',
    substats: JSON.stringify([
      { name: 'CRIT Rate', value: '6.2%', rolls: 2 },
      { name: 'Elemental Mastery', value: '35', rolls: 2 },
      { name: 'CRIT DMG', value: '7.8%', rolls: 1 },
      { name: 'DEF', value: '19', rolls: 1 },
    ]),
    equipped_by: 'Nahida',
  },
  {
    name: 'Lamp of the Lost', set_name: 'Deepwood Memories', slot: 'Circlet',
    level: 20, main_stat_type: 'CRIT Rate', main_stat_value: '31.1%',
    substats: JSON.stringify([
      { name: 'Elemental Mastery', value: '42', rolls: 2 },
      { name: 'CRIT DMG', value: '14.0%', rolls: 2 },
      { name: 'Energy Recharge', value: '5.8%', rolls: 1 },
      { name: 'HP%', value: '4.7%', rolls: 1 },
    ]),
    equipped_by: 'Nahida',
  },

  // ===== Zhongli: Tenacity of the Millelith 2pc + random (Lv.16) =====
  {
    name: 'Flower of Accolades', set_name: 'Tenacity of the Millelith', slot: 'Flower',
    level: 16, main_stat_type: 'HP', main_stat_value: '3967',
    substats: JSON.stringify([
      { name: 'HP%', value: '9.3%', rolls: 2 },
      { name: 'DEF', value: '23', rolls: 1 },
      { name: 'Energy Recharge', value: '5.2%', rolls: 1 },
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

  // ===== Xiangling: partial Emblem (Lv.12~16) =====
  {
    name: 'Magnificent Tsuba', set_name: 'Emblem of Severed Fate', slot: 'Flower',
    level: 16, main_stat_type: 'HP', main_stat_value: '3967',
    substats: JSON.stringify([
      { name: 'CRIT Rate', value: '3.5%', rolls: 1 },
      { name: 'Energy Recharge', value: '5.8%', rolls: 1 },
      { name: 'ATK%', value: '5.3%', rolls: 1 },
    ]),
    equipped_by: 'Xiangling',
  },
  {
    name: 'Sundered Feather', set_name: 'Emblem of Severed Fate', slot: 'Plume',
    level: 12, main_stat_type: 'ATK', main_stat_value: '205',
    substats: JSON.stringify([
      { name: 'CRIT Rate', value: '3.9%', rolls: 1 },
      { name: 'Energy Recharge', value: '11.0%', rolls: 2 },
    ]),
    equipped_by: 'Xiangling',
  },

  // ===== Bennett: Noblesse Oblige 4pc (Lv.12) =====
  {
    name: 'Royal Flora', set_name: 'Noblesse Oblige', slot: 'Flower',
    level: 12, main_stat_type: 'HP', main_stat_value: '3155',
    substats: JSON.stringify([
      { name: 'Energy Recharge', value: '11.0%', rolls: 2 },
      { name: 'HP%', value: '4.7%', rolls: 1 },
    ]),
    equipped_by: 'Bennett',
  },
  {
    name: 'Royal Plume', set_name: 'Noblesse Oblige', slot: 'Plume',
    level: 12, main_stat_type: 'ATK', main_stat_value: '205',
    substats: JSON.stringify([
      { name: 'Energy Recharge', value: '5.8%', rolls: 1 },
      { name: 'HP%', value: '9.3%', rolls: 2 },
    ]),
    equipped_by: 'Bennett',
  },
  {
    name: 'Royal Pocket Watch', set_name: 'Noblesse Oblige', slot: 'Sands',
    level: 12, main_stat_type: 'Energy Recharge', main_stat_value: '34.8%',
    substats: JSON.stringify([
      { name: 'HP%', value: '9.3%', rolls: 2 },
      { name: 'ATK', value: '18', rolls: 1 },
    ]),
    equipped_by: 'Bennett',
  },
  {
    name: 'Royal Silver Urn', set_name: 'Noblesse Oblige', slot: 'Goblet',
    level: 12, main_stat_type: 'HP%', main_stat_value: '31.3%',
    substats: JSON.stringify([
      { name: 'Energy Recharge', value: '5.2%', rolls: 1 },
      { name: 'DEF', value: '23', rolls: 1 },
    ]),
    equipped_by: 'Bennett',
  },
  {
    name: 'Royal Masque', set_name: 'Noblesse Oblige', slot: 'Circlet',
    level: 12, main_stat_type: 'Healing Bonus', main_stat_value: '24.0%',
    substats: JSON.stringify([
      { name: 'HP%', value: '9.3%', rolls: 2 },
      { name: 'Energy Recharge', value: '5.8%', rolls: 1 },
    ]),
    equipped_by: 'Bennett',
  },

  // ===== Xingqiu: Emblem 2pc + random (Lv.12~16) =====
  {
    name: 'Magnificent Tsuba', set_name: 'Emblem of Severed Fate', slot: 'Flower',
    level: 16, main_stat_type: 'HP', main_stat_value: '3967',
    substats: JSON.stringify([
      { name: 'CRIT Rate', value: '3.5%', rolls: 1 },
      { name: 'ATK%', value: '5.3%', rolls: 1 },
    ]),
    equipped_by: 'Xingqiu',
  },
  {
    name: 'Sundered Feather', set_name: 'Emblem of Severed Fate', slot: 'Plume',
    level: 12, main_stat_type: 'ATK', main_stat_value: '205',
    substats: JSON.stringify([
      { name: 'Energy Recharge', value: '5.8%', rolls: 1 },
      { name: 'CRIT DMG', value: '7.0%', rolls: 1 },
    ]),
    equipped_by: 'Xingqiu',
  },

  // ===== Unequipped junk artifacts (6 pieces, +0~+8) =====
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
    name: 'Thunderbirds Mercy', set_name: 'Thundering Fury', slot: 'Flower',
    level: 0, main_stat_type: 'HP', main_stat_value: '717',
    substats: JSON.stringify([{ name: 'ATK', value: '14', rolls: 1 }]),
    equipped_by: '',
  },
  {
    name: 'Survivor of Catastrophe', set_name: 'Thundering Fury', slot: 'Plume',
    level: 8, main_stat_type: 'ATK', main_stat_value: '152',
    substats: JSON.stringify([
      { name: 'CRIT Rate', value: '3.5%', rolls: 1 },
      { name: 'DEF', value: '19', rolls: 1 },
    ]),
    equipped_by: '',
  },
  {
    name: 'Hourglass of Thunder', set_name: 'Thundering Fury', slot: 'Sands',
    level: 4, main_stat_type: 'ATK%', main_stat_value: '9.3%',
    substats: JSON.stringify([{ name: 'HP', value: '299', rolls: 1 }]),
    equipped_by: '',
  },
  {
    name: 'Maidens Distant Love', set_name: 'Maiden Beloved', slot: 'Flower',
    level: 0, main_stat_type: 'HP', main_stat_value: '717',
    substats: JSON.stringify([{ name: 'DEF%', value: '5.1%', rolls: 1 }]),
    equipped_by: '',
  },
];

module.exports = { characters, weapons, artifacts };
