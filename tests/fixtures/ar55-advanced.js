/**
 * AR55 (모험 등급 55) advanced Genshin Impact account fixture.
 *
 * 20 characters, 12 weapons, 40 artifacts.
 * Well-invested account with 3-4 fully built five-star DPS, good support roster.
 * 8-10 characters with proper +20 artifact sets.
 * Data format matches the POST /api/characters, /api/weapons, /api/artifacts endpoints.
 */

// ---------------------------------------------------------------------------
// Characters (20명) - 4 five-star DPS, strong support roster
// ---------------------------------------------------------------------------

const characters = [
  // Tier 1 - Fully built 5-star DPS (Lv.90)
  {
    name: 'Raiden Shogun', element: 'Electro', weapon_type: 'Polearm',
    level: 90, hp: 18900, atk: 1980, crit_rate: 58.0, crit_dmg: 135.0,
    energy_recharge: 260, elemental_mastery: 80,
  },
  {
    name: 'Ayaka', element: 'Cryo', weapon_type: 'Sword',
    level: 90, hp: 14200, atk: 2100, crit_rate: 35.0, crit_dmg: 225.0,
    energy_recharge: 120, elemental_mastery: 20,
  },
  {
    name: 'Hu Tao', element: 'Pyro', weapon_type: 'Polearm',
    level: 90, hp: 34000, atk: 1150, crit_rate: 70.0, crit_dmg: 210.0,
    energy_recharge: 100, elemental_mastery: 75,
  },
  {
    name: 'Nahida', element: 'Dendro', weapon_type: 'Catalyst',
    level: 90, hp: 13500, atk: 850, crit_rate: 38.0, crit_dmg: 95.0,
    energy_recharge: 135, elemental_mastery: 750,
  },

  // Tier 2 - Key supports (Lv.80-90)
  {
    name: 'Kaedehara Kazuha', element: 'Anemo', weapon_type: 'Sword',
    level: 90, hp: 21000, atk: 850, crit_rate: 25.0, crit_dmg: 55.0,
    energy_recharge: 155, elemental_mastery: 900,
  },
  {
    name: 'Zhongli', element: 'Geo', weapon_type: 'Polearm',
    level: 90, hp: 48000, atk: 680, crit_rate: 18.0, crit_dmg: 48.0,
    energy_recharge: 125, elemental_mastery: 25,
  },
  {
    name: 'Xingqiu', element: 'Hydro', weapon_type: 'Sword',
    level: 80, hp: 15000, atk: 1050, crit_rate: 50.0, crit_dmg: 115.0,
    energy_recharge: 175, elemental_mastery: 40,
  },
  {
    name: 'Xiangling', element: 'Pyro', weapon_type: 'Polearm',
    level: 80, hp: 11500, atk: 1350, crit_rate: 48.0, crit_dmg: 105.0,
    energy_recharge: 195, elemental_mastery: 130,
  },
  {
    name: 'Bennett', element: 'Pyro', weapon_type: 'Sword',
    level: 80, hp: 11800, atk: 780, crit_rate: 28.0, crit_dmg: 58.0,
    energy_recharge: 195, elemental_mastery: 45,
  },
  {
    name: 'Yelan', element: 'Hydro', weapon_type: 'Bow',
    level: 80, hp: 28000, atk: 750, crit_rate: 55.0, crit_dmg: 160.0,
    energy_recharge: 135, elemental_mastery: 15,
  },

  // Tier 3 - Built supports (Lv.70-80)
  {
    name: 'Fischl', element: 'Electro', weapon_type: 'Bow',
    level: 80, hp: 9800, atk: 1400, crit_rate: 42.0, crit_dmg: 85.0,
    energy_recharge: 118, elemental_mastery: 35,
  },
  {
    name: 'Sucrose', element: 'Anemo', weapon_type: 'Catalyst',
    level: 70, hp: 8800, atk: 580, crit_rate: 8.0, crit_dmg: 30.0,
    energy_recharge: 145, elemental_mastery: 680,
  },
  {
    name: 'Diona', element: 'Cryo', weapon_type: 'Bow',
    level: 70, hp: 17000, atk: 480, crit_rate: 12.0, crit_dmg: 38.0,
    energy_recharge: 175, elemental_mastery: 15,
  },
  {
    name: 'Rosaria', element: 'Cryo', weapon_type: 'Polearm',
    level: 70, hp: 10500, atk: 800, crit_rate: 35.0, crit_dmg: 72.0,
    energy_recharge: 130, elemental_mastery: 18,
  },
  {
    name: 'Kaeya', element: 'Cryo', weapon_type: 'Sword',
    level: 70, hp: 10800, atk: 720, crit_rate: 25.0, crit_dmg: 55.0,
    energy_recharge: 125, elemental_mastery: 12,
  },

  // Tier 4 - Partially built (Lv.50-60)
  {
    name: 'Barbara', element: 'Hydro', weapon_type: 'Catalyst',
    level: 60, hp: 13500, atk: 380, crit_rate: 5.0, crit_dmg: 30.0,
    energy_recharge: 115, elemental_mastery: 8,
  },
  {
    name: 'Noelle', element: 'Geo', weapon_type: 'Claymore',
    level: 60, hp: 12000, atk: 550, crit_rate: 12.0, crit_dmg: 40.0,
    energy_recharge: 105, elemental_mastery: 5,
  },
  {
    name: 'Beidou', element: 'Electro', weapon_type: 'Claymore',
    level: 60, hp: 10800, atk: 620, crit_rate: 18.0, crit_dmg: 55.0,
    energy_recharge: 130, elemental_mastery: 20,
  },
  {
    name: 'Lisa', element: 'Electro', weapon_type: 'Catalyst',
    level: 40, hp: 7500, atk: 450, crit_rate: 8.0, crit_dmg: 30.0,
    energy_recharge: 100, elemental_mastery: 20,
  },
  {
    name: 'Amber', element: 'Pyro', weapon_type: 'Bow',
    level: 20, hp: 4800, atk: 280, crit_rate: 5.0, crit_dmg: 20.0,
    energy_recharge: 100, elemental_mastery: 0,
  },
];

// ---------------------------------------------------------------------------
// Weapons (12개) - 3 five-star Lv.90, rest 4-star Lv.80-90
// ---------------------------------------------------------------------------

const weapons = [
  // 5-star weapons
  {
    name: 'Engulfing Lightning', type: 'Polearm', level: 90,
    refinement: 1, base_atk: 608, sub_stat_type: 'Energy Recharge',
    sub_stat_value: '55.1%', rarity: 5, equipped_by: 'Raiden Shogun',
  },
  {
    name: 'Mistsplitter Reforged', type: 'Sword', level: 90,
    refinement: 1, base_atk: 674, sub_stat_type: 'CRIT DMG',
    sub_stat_value: '44.1%', rarity: 5, equipped_by: 'Ayaka',
  },
  {
    name: 'Staff of Homa', type: 'Polearm', level: 90,
    refinement: 1, base_atk: 608, sub_stat_type: 'CRIT DMG',
    sub_stat_value: '66.2%', rarity: 5, equipped_by: 'Hu Tao',
  },

  // 4-star weapons
  {
    name: 'Freedom-Sworn', type: 'Sword', level: 90,
    refinement: 1, base_atk: 608, sub_stat_type: 'Elemental Mastery',
    sub_stat_value: '198', rarity: 5, equipped_by: 'Kaedehara Kazuha',
  },
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
    name: 'Favonius Warbow', type: 'Bow', level: 80,
    refinement: 2, base_atk: 454, sub_stat_type: 'Energy Recharge',
    sub_stat_value: '61.3%', rarity: 4, equipped_by: 'Yelan',
  },
  {
    name: 'Stringless', type: 'Bow', level: 80,
    refinement: 3, base_atk: 510, sub_stat_type: 'Elemental Mastery',
    sub_stat_value: '165', rarity: 4, equipped_by: 'Fischl',
  },
  {
    name: 'Black Tassel', type: 'Polearm', level: 90,
    refinement: 5, base_atk: 354, sub_stat_type: 'HP%',
    sub_stat_value: '46.9%', rarity: 3, equipped_by: 'Zhongli',
  },
  {
    name: 'Sacrificial Bow', type: 'Bow', level: 80,
    refinement: 1, base_atk: 454, sub_stat_type: 'Energy Recharge',
    sub_stat_value: '61.3%', rarity: 4, equipped_by: 'Diona',
  },
  {
    name: 'Sacrificial Fragments', type: 'Catalyst', level: 80,
    refinement: 2, base_atk: 454, sub_stat_type: 'Elemental Mastery',
    sub_stat_value: '221', rarity: 4, equipped_by: 'Nahida',
  },
];

// ---------------------------------------------------------------------------
// Artifacts (40개) - 8 characters fully equipped +20, partial +12-16 on rest
// ---------------------------------------------------------------------------

const artifacts = [
  // ===== Raiden Shogun: Emblem of Severed Fate 4pc (all +20) =====
  {
    name: 'Magnificent Tsuba', set_name: 'Emblem of Severed Fate', slot: 'Flower',
    level: 20, main_stat_type: 'HP', main_stat_value: '4780',
    substats: JSON.stringify([
      { name: 'CRIT Rate', value: '10.5%', rolls: 3 },
      { name: 'CRIT DMG', value: '14.0%', rolls: 2 },
      { name: 'Energy Recharge', value: '5.8%', rolls: 1 },
      { name: 'ATK%', value: '5.3%', rolls: 1 },
    ]),
    equipped_by: 'Raiden Shogun',
  },
  {
    name: 'Sundered Feather', set_name: 'Emblem of Severed Fate', slot: 'Plume',
    level: 20, main_stat_type: 'ATK', main_stat_value: '311',
    substats: JSON.stringify([
      { name: 'CRIT Rate', value: '6.6%', rolls: 2 },
      { name: 'CRIT DMG', value: '14.8%', rolls: 2 },
      { name: 'Energy Recharge', value: '11.0%', rolls: 2 },
      { name: 'DEF', value: '19', rolls: 1 },
    ]),
    equipped_by: 'Raiden Shogun',
  },
  {
    name: 'Storm Cage', set_name: 'Emblem of Severed Fate', slot: 'Sands',
    level: 20, main_stat_type: 'Energy Recharge', main_stat_value: '51.8%',
    substats: JSON.stringify([
      { name: 'CRIT Rate', value: '6.2%', rolls: 2 },
      { name: 'CRIT DMG', value: '13.2%', rolls: 2 },
      { name: 'ATK%', value: '9.3%', rolls: 2 },
      { name: 'HP', value: '299', rolls: 1 },
    ]),
    equipped_by: 'Raiden Shogun',
  },
  {
    name: 'Scarlet Vessel', set_name: 'Emblem of Severed Fate', slot: 'Goblet',
    level: 20, main_stat_type: 'Electro DMG Bonus', main_stat_value: '46.6%',
    substats: JSON.stringify([
      { name: 'CRIT Rate', value: '7.0%', rolls: 2 },
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
      { name: 'CRIT DMG', value: '14.8%', rolls: 2 },
      { name: 'Energy Recharge', value: '11.0%', rolls: 2 },
      { name: 'ATK%', value: '5.3%', rolls: 1 },
      { name: 'DEF', value: '23', rolls: 1 },
    ]),
    equipped_by: 'Raiden Shogun',
  },

  // ===== Ayaka: Blizzard Strayer 4pc (all +20) =====
  {
    name: 'Snowswept Memory', set_name: 'Blizzard Strayer', slot: 'Flower',
    level: 20, main_stat_type: 'HP', main_stat_value: '4780',
    substats: JSON.stringify([
      { name: 'CRIT DMG', value: '19.4%', rolls: 3 },
      { name: 'ATK%', value: '9.3%', rolls: 2 },
      { name: 'Energy Recharge', value: '5.8%', rolls: 1 },
      { name: 'DEF', value: '19', rolls: 1 },
    ]),
    equipped_by: 'Ayaka',
  },
  {
    name: 'Icebreakers Resolve', set_name: 'Blizzard Strayer', slot: 'Plume',
    level: 20, main_stat_type: 'ATK', main_stat_value: '311',
    substats: JSON.stringify([
      { name: 'CRIT DMG', value: '21.0%', rolls: 3 },
      { name: 'ATK%', value: '5.8%', rolls: 1 },
      { name: 'Energy Recharge', value: '5.2%', rolls: 1 },
      { name: 'HP', value: '299', rolls: 1 },
    ]),
    equipped_by: 'Ayaka',
  },
  {
    name: 'Frozen Homelands Demise', set_name: 'Blizzard Strayer', slot: 'Sands',
    level: 20, main_stat_type: 'ATK%', main_stat_value: '46.6%',
    substats: JSON.stringify([
      { name: 'CRIT DMG', value: '14.0%', rolls: 2 },
      { name: 'Energy Recharge', value: '5.8%', rolls: 1 },
      { name: 'HP%', value: '4.7%', rolls: 1 },
      { name: 'DEF', value: '23', rolls: 1 },
    ]),
    equipped_by: 'Ayaka',
  },
  {
    name: 'Frost-Weaved Dignity', set_name: 'Blizzard Strayer', slot: 'Goblet',
    level: 20, main_stat_type: 'Cryo DMG Bonus', main_stat_value: '46.6%',
    substats: JSON.stringify([
      { name: 'CRIT DMG', value: '14.8%', rolls: 2 },
      { name: 'ATK%', value: '5.3%', rolls: 1 },
      { name: 'DEF%', value: '7.3%', rolls: 1 },
      { name: 'HP', value: '299', rolls: 1 },
    ]),
    equipped_by: 'Ayaka',
  },
  {
    name: 'Broken Rimes Echo', set_name: 'Blizzard Strayer', slot: 'Circlet',
    level: 20, main_stat_type: 'CRIT DMG', main_stat_value: '62.2%',
    substats: JSON.stringify([
      { name: 'ATK%', value: '14.0%', rolls: 3 },
      { name: 'Energy Recharge', value: '5.8%', rolls: 1 },
      { name: 'HP', value: '508', rolls: 1 },
      { name: 'DEF', value: '19', rolls: 1 },
    ]),
    equipped_by: 'Ayaka',
  },

  // ===== Hu Tao: Crimson Witch of Flames 4pc (all +20) =====
  {
    name: 'Witchs Flower of Blaze', set_name: 'Crimson Witch of Flames', slot: 'Flower',
    level: 20, main_stat_type: 'HP', main_stat_value: '4780',
    substats: JSON.stringify([
      { name: 'CRIT Rate', value: '7.0%', rolls: 2 },
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
      { name: 'CRIT DMG', value: '19.4%', rolls: 3 },
      { name: 'HP%', value: '5.3%', rolls: 1 },
      { name: 'Elemental Mastery', value: '16', rolls: 1 },
    ]),
    equipped_by: 'Hu Tao',
  },
  {
    name: 'Witchs End Time', set_name: 'Crimson Witch of Flames', slot: 'Sands',
    level: 20, main_stat_type: 'HP%', main_stat_value: '46.6%',
    substats: JSON.stringify([
      { name: 'CRIT Rate', value: '7.8%', rolls: 2 },
      { name: 'CRIT DMG', value: '14.0%', rolls: 2 },
      { name: 'Elemental Mastery', value: '35', rolls: 2 },
      { name: 'DEF', value: '19', rolls: 1 },
    ]),
    equipped_by: 'Hu Tao',
  },
  {
    name: 'Witchs Heart Flames', set_name: 'Crimson Witch of Flames', slot: 'Goblet',
    level: 20, main_stat_type: 'Pyro DMG Bonus', main_stat_value: '46.6%',
    substats: JSON.stringify([
      { name: 'CRIT Rate', value: '3.5%', rolls: 1 },
      { name: 'CRIT DMG', value: '21.8%', rolls: 3 },
      { name: 'HP%', value: '9.3%', rolls: 2 },
      { name: 'DEF', value: '23', rolls: 1 },
    ]),
    equipped_by: 'Hu Tao',
  },
  {
    name: 'Witchs Scorching Hat', set_name: 'Crimson Witch of Flames', slot: 'Circlet',
    level: 20, main_stat_type: 'CRIT DMG', main_stat_value: '62.2%',
    substats: JSON.stringify([
      { name: 'CRIT Rate', value: '10.1%', rolls: 3 },
      { name: 'HP%', value: '9.3%', rolls: 2 },
      { name: 'Elemental Mastery', value: '19', rolls: 1 },
      { name: 'ATK', value: '18', rolls: 1 },
    ]),
    equipped_by: 'Hu Tao',
  },

  // ===== Kazuha: VV 4pc (all +20, EM build) =====
  {
    name: 'In Remembrance of Viridescent Fields', set_name: 'Viridescent Venerer', slot: 'Flower',
    level: 20, main_stat_type: 'HP', main_stat_value: '4780',
    substats: JSON.stringify([
      { name: 'Elemental Mastery', value: '42', rolls: 2 },
      { name: 'Energy Recharge', value: '9.7%', rolls: 2 },
      { name: 'ATK%', value: '5.3%', rolls: 1 },
      { name: 'DEF', value: '19', rolls: 1 },
    ]),
    equipped_by: 'Kaedehara Kazuha',
  },
  {
    name: 'Viridescent Arrow Feather', set_name: 'Viridescent Venerer', slot: 'Plume',
    level: 20, main_stat_type: 'ATK', main_stat_value: '311',
    substats: JSON.stringify([
      { name: 'Elemental Mastery', value: '56', rolls: 3 },
      { name: 'Energy Recharge', value: '5.2%', rolls: 1 },
      { name: 'HP', value: '299', rolls: 1 },
      { name: 'DEF%', value: '5.1%', rolls: 1 },
    ]),
    equipped_by: 'Kaedehara Kazuha',
  },
  {
    name: 'Viridescent Venerers Determination', set_name: 'Viridescent Venerer', slot: 'Sands',
    level: 20, main_stat_type: 'Elemental Mastery', main_stat_value: '187',
    substats: JSON.stringify([
      { name: 'Energy Recharge', value: '9.7%', rolls: 2 },
      { name: 'ATK%', value: '5.3%', rolls: 1 },
      { name: 'HP', value: '508', rolls: 1 },
      { name: 'DEF', value: '19', rolls: 1 },
    ]),
    equipped_by: 'Kaedehara Kazuha',
  },
  {
    name: 'Viridescent Venerers Vessel', set_name: 'Viridescent Venerer', slot: 'Goblet',
    level: 20, main_stat_type: 'Elemental Mastery', main_stat_value: '187',
    substats: JSON.stringify([
      { name: 'Energy Recharge', value: '5.8%', rolls: 1 },
      { name: 'CRIT Rate', value: '3.5%', rolls: 1 },
      { name: 'HP%', value: '4.7%', rolls: 1 },
      { name: 'DEF', value: '23', rolls: 1 },
    ]),
    equipped_by: 'Kaedehara Kazuha',
  },
  {
    name: 'Viridescent Venerers Diadem', set_name: 'Viridescent Venerer', slot: 'Circlet',
    level: 20, main_stat_type: 'Elemental Mastery', main_stat_value: '187',
    substats: JSON.stringify([
      { name: 'Energy Recharge', value: '11.0%', rolls: 2 },
      { name: 'ATK%', value: '5.3%', rolls: 1 },
      { name: 'HP', value: '299', rolls: 1 },
      { name: 'DEF%', value: '5.1%', rolls: 1 },
    ]),
    equipped_by: 'Kaedehara Kazuha',
  },

  // ===== Nahida: Deepwood Memories 4pc (all +20) =====
  {
    name: 'A Time of Insight', set_name: 'Deepwood Memories', slot: 'Flower',
    level: 20, main_stat_type: 'HP', main_stat_value: '4780',
    substats: JSON.stringify([
      { name: 'CRIT Rate', value: '6.2%', rolls: 2 },
      { name: 'Elemental Mastery', value: '35', rolls: 2 },
      { name: 'Energy Recharge', value: '5.2%', rolls: 1 },
      { name: 'ATK%', value: '5.3%', rolls: 1 },
    ]),
    equipped_by: 'Nahida',
  },
  {
    name: 'Shaft of Remembrance', set_name: 'Deepwood Memories', slot: 'Plume',
    level: 20, main_stat_type: 'ATK', main_stat_value: '311',
    substats: JSON.stringify([
      { name: 'Elemental Mastery', value: '42', rolls: 2 },
      { name: 'CRIT Rate', value: '3.9%', rolls: 1 },
      { name: 'CRIT DMG', value: '7.0%', rolls: 1 },
      { name: 'HP', value: '299', rolls: 1 },
    ]),
    equipped_by: 'Nahida',
  },
  {
    name: 'Symbol of Felicitation', set_name: 'Deepwood Memories', slot: 'Sands',
    level: 20, main_stat_type: 'Elemental Mastery', main_stat_value: '187',
    substats: JSON.stringify([
      { name: 'CRIT Rate', value: '6.6%', rolls: 2 },
      { name: 'Energy Recharge', value: '5.2%', rolls: 1 },
      { name: 'ATK%', value: '5.3%', rolls: 1 },
      { name: 'HP', value: '299', rolls: 1 },
    ]),
    equipped_by: 'Nahida',
  },
  {
    name: 'Laurel Coronet', set_name: 'Deepwood Memories', slot: 'Goblet',
    level: 20, main_stat_type: 'Dendro DMG Bonus', main_stat_value: '46.6%',
    substats: JSON.stringify([
      { name: 'Elemental Mastery', value: '35', rolls: 2 },
      { name: 'CRIT Rate', value: '3.5%', rolls: 1 },
      { name: 'CRIT DMG', value: '7.0%', rolls: 1 },
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
      { name: 'Energy Recharge', value: '5.2%', rolls: 1 },
      { name: 'HP%', value: '4.7%', rolls: 1 },
    ]),
    equipped_by: 'Nahida',
  },

  // ===== Bennett: Noblesse Oblige 4pc (+16) =====
  {
    name: 'Royal Flora', set_name: 'Noblesse Oblige', slot: 'Flower',
    level: 16, main_stat_type: 'HP', main_stat_value: '3967',
    substats: JSON.stringify([
      { name: 'Energy Recharge', value: '9.7%', rolls: 2 },
      { name: 'HP%', value: '9.3%', rolls: 2 },
      { name: 'DEF', value: '19', rolls: 1 },
    ]),
    equipped_by: 'Bennett',
  },
  {
    name: 'Royal Plume', set_name: 'Noblesse Oblige', slot: 'Plume',
    level: 16, main_stat_type: 'ATK', main_stat_value: '258',
    substats: JSON.stringify([
      { name: 'Energy Recharge', value: '11.0%', rolls: 2 },
      { name: 'HP%', value: '4.7%', rolls: 1 },
      { name: 'CRIT Rate', value: '3.5%', rolls: 1 },
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
      { name: 'Energy Recharge', value: '5.8%', rolls: 1 },
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

  // ===== Xiangling: Emblem 4pc (+16) =====
  {
    name: 'Magnificent Tsuba', set_name: 'Emblem of Severed Fate', slot: 'Flower',
    level: 16, main_stat_type: 'HP', main_stat_value: '3967',
    substats: JSON.stringify([
      { name: 'CRIT Rate', value: '6.6%', rolls: 2 },
      { name: 'Energy Recharge', value: '5.8%', rolls: 1 },
      { name: 'ATK%', value: '5.3%', rolls: 1 },
    ]),
    equipped_by: 'Xiangling',
  },
  {
    name: 'Sundered Feather', set_name: 'Emblem of Severed Fate', slot: 'Plume',
    level: 16, main_stat_type: 'ATK', main_stat_value: '258',
    substats: JSON.stringify([
      { name: 'CRIT Rate', value: '3.9%', rolls: 1 },
      { name: 'CRIT DMG', value: '7.0%', rolls: 1 },
      { name: 'Energy Recharge', value: '9.7%', rolls: 2 },
    ]),
    equipped_by: 'Xiangling',
  },
  {
    name: 'Storm Cage', set_name: 'Emblem of Severed Fate', slot: 'Sands',
    level: 16, main_stat_type: 'Elemental Mastery', main_stat_value: '155',
    substats: JSON.stringify([
      { name: 'Energy Recharge', value: '5.8%', rolls: 1 },
      { name: 'CRIT Rate', value: '3.5%', rolls: 1 },
      { name: 'ATK%', value: '5.3%', rolls: 1 },
    ]),
    equipped_by: 'Xiangling',
  },

  // ===== Zhongli: Tenacity 2pc + random (+12) =====
  {
    name: 'Flower of Accolades', set_name: 'Tenacity of the Millelith', slot: 'Flower',
    level: 12, main_stat_type: 'HP', main_stat_value: '3155',
    substats: JSON.stringify([
      { name: 'HP%', value: '9.3%', rolls: 2 },
      { name: 'DEF', value: '19', rolls: 1 },
    ]),
    equipped_by: 'Zhongli',
  },
  {
    name: 'Ceremonial War-Plume', set_name: 'Tenacity of the Millelith', slot: 'Plume',
    level: 12, main_stat_type: 'ATK', main_stat_value: '205',
    substats: JSON.stringify([
      { name: 'HP%', value: '9.3%', rolls: 2 },
      { name: 'Energy Recharge', value: '5.2%', rolls: 1 },
    ]),
    equipped_by: 'Zhongli',
  },

  // ===== Xingqiu: Emblem 2pc + Noblesse 2pc (+12) =====
  {
    name: 'Magnificent Tsuba', set_name: 'Emblem of Severed Fate', slot: 'Flower',
    level: 12, main_stat_type: 'HP', main_stat_value: '3155',
    substats: JSON.stringify([
      { name: 'CRIT Rate', value: '3.5%', rolls: 1 },
      { name: 'ATK%', value: '5.3%', rolls: 1 },
    ]),
    equipped_by: 'Xingqiu',
  },
  {
    name: 'Royal Plume', set_name: 'Noblesse Oblige', slot: 'Plume',
    level: 12, main_stat_type: 'ATK', main_stat_value: '205',
    substats: JSON.stringify([
      { name: 'CRIT DMG', value: '7.0%', rolls: 1 },
      { name: 'Energy Recharge', value: '5.8%', rolls: 1 },
    ]),
    equipped_by: 'Xingqiu',
  },

  // ===== Unequipped junk =====
  {
    name: 'Gladiators Nostalgia', set_name: 'Gladiators Finale', slot: 'Flower',
    level: 0, main_stat_type: 'HP', main_stat_value: '717',
    substats: JSON.stringify([{ name: 'DEF', value: '19', rolls: 1 }]),
    equipped_by: '',
  },
  {
    name: 'Thunderbirds Mercy', set_name: 'Thundering Fury', slot: 'Flower',
    level: 4, main_stat_type: 'HP', main_stat_value: '1893',
    substats: JSON.stringify([{ name: 'ATK', value: '14', rolls: 1 }]),
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
