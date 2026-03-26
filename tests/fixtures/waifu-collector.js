/**
 * Waifu Collector (여캐 수집가) Genshin Impact account fixture.
 *
 * 18 characters, 12 weapons, 35 artifacts.
 * ALL female characters. Whale-ish account focused on collecting female characters.
 * Top 6 well-built, mid-tier decent, bottom benched.
 * Data format matches the POST /api/characters, /api/weapons, /api/artifacts endpoints.
 */

// ---------------------------------------------------------------------------
// Characters (18명) - ALL female, many 5-star
// ---------------------------------------------------------------------------

const characters = [
  // Tier 1 - Main DPS / Fully invested (Lv.90)
  {
    name: 'Raiden Shogun', element: 'Electro', weapon_type: 'Polearm',
    level: 90, hp: 19200, atk: 2050, crit_rate: 62.0, crit_dmg: 142.0,
    energy_recharge: 268, elemental_mastery: 95,
  },
  {
    name: 'Hu Tao', element: 'Pyro', weapon_type: 'Polearm',
    level: 90, hp: 35500, atk: 1180, crit_rate: 72.0, crit_dmg: 218.0,
    energy_recharge: 100, elemental_mastery: 85,
  },
  {
    name: 'Ganyu', element: 'Cryo', weapon_type: 'Bow',
    level: 90, hp: 14800, atk: 1980, crit_rate: 55.0, crit_dmg: 195.0,
    energy_recharge: 118, elemental_mastery: 35,
  },
  {
    name: 'Ayaka', element: 'Cryo', weapon_type: 'Sword',
    level: 90, hp: 14000, atk: 2100, crit_rate: 32.0, crit_dmg: 230.0,
    energy_recharge: 125, elemental_mastery: 18,
  },
  {
    name: 'Yelan', element: 'Hydro', weapon_type: 'Bow',
    level: 90, hp: 29500, atk: 780, crit_rate: 64.0, crit_dmg: 185.0,
    energy_recharge: 138, elemental_mastery: 15,
  },
  {
    name: 'Nahida', element: 'Dendro', weapon_type: 'Catalyst',
    level: 90, hp: 13800, atk: 870, crit_rate: 40.0, crit_dmg: 98.0,
    energy_recharge: 135, elemental_mastery: 820,
  },
  {
    name: 'Furina', element: 'Hydro', weapon_type: 'Sword',
    level: 90, hp: 28000, atk: 680, crit_rate: 58.0, crit_dmg: 150.0,
    energy_recharge: 145, elemental_mastery: 20,
  },

  // Tier 2 - Good supports / Sub-DPS (Lv.80)
  {
    name: 'Kokomi', element: 'Hydro', weapon_type: 'Catalyst',
    level: 80, hp: 36000, atk: 620, crit_rate: -90.0, crit_dmg: 50.0,
    energy_recharge: 165, elemental_mastery: 30,
  },
  {
    name: 'Yoimiya', element: 'Pyro', weapon_type: 'Bow',
    level: 80, hp: 12200, atk: 1800, crit_rate: 58.0, crit_dmg: 130.0,
    energy_recharge: 105, elemental_mastery: 40,
  },
  {
    name: 'Fischl', element: 'Electro', weapon_type: 'Bow',
    level: 80, hp: 9800, atk: 1400, crit_rate: 45.0, crit_dmg: 90.0,
    energy_recharge: 118, elemental_mastery: 35,
  },
  {
    name: 'Xiangling', element: 'Pyro', weapon_type: 'Polearm',
    level: 80, hp: 11200, atk: 1300, crit_rate: 45.0, crit_dmg: 100.0,
    energy_recharge: 190, elemental_mastery: 140,
  },

  // Tier 3 - Partially built (Lv.60-70)
  {
    name: 'Mona', element: 'Hydro', weapon_type: 'Catalyst',
    level: 70, hp: 9200, atk: 650, crit_rate: 18.0, crit_dmg: 55.0,
    energy_recharge: 175, elemental_mastery: 45,
  },
  {
    name: 'Sucrose', element: 'Anemo', weapon_type: 'Catalyst',
    level: 70, hp: 8500, atk: 550, crit_rate: 8.0, crit_dmg: 30.0,
    energy_recharge: 140, elemental_mastery: 680,
  },
  {
    name: 'Barbara', element: 'Hydro', weapon_type: 'Catalyst',
    level: 60, hp: 13000, atk: 350, crit_rate: 5.0, crit_dmg: 30.0,
    energy_recharge: 118, elemental_mastery: 8,
  },
  {
    name: 'Diona', element: 'Cryo', weapon_type: 'Bow',
    level: 60, hp: 15500, atk: 380, crit_rate: 10.0, crit_dmg: 35.0,
    energy_recharge: 165, elemental_mastery: 10,
  },
  {
    name: 'Rosaria', element: 'Cryo', weapon_type: 'Polearm',
    level: 60, hp: 9800, atk: 580, crit_rate: 25.0, crit_dmg: 58.0,
    energy_recharge: 125, elemental_mastery: 12,
  },

  // Tier 4 - Benched (Lv.40)
  {
    name: 'Amber', element: 'Pyro', weapon_type: 'Bow',
    level: 40, hp: 5200, atk: 220, crit_rate: 5.0, crit_dmg: 50.0,
    energy_recharge: 100, elemental_mastery: 0,
  },
  {
    name: 'Lisa', element: 'Electro', weapon_type: 'Catalyst',
    level: 40, hp: 5800, atk: 250, crit_rate: 5.0, crit_dmg: 50.0,
    energy_recharge: 100, elemental_mastery: 10,
  },
];

// ---------------------------------------------------------------------------
// Weapons (12개) - 5 five-star, rest 4-star
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
    name: 'Mistsplitter Reforged', type: 'Sword', level: 90,
    refinement: 1, base_atk: 674, sub_stat_type: 'CRIT DMG',
    sub_stat_value: '44.1%', rarity: 5, equipped_by: 'Ayaka',
  },
  {
    name: 'Aqua Simulacra', type: 'Bow', level: 90,
    refinement: 1, base_atk: 542, sub_stat_type: 'CRIT DMG',
    sub_stat_value: '88.2%', rarity: 5, equipped_by: 'Yelan',
  },

  // 4-star weapons
  {
    name: 'Sacrificial Jade', type: 'Catalyst', level: 80,
    refinement: 1, base_atk: 510, sub_stat_type: 'CRIT Rate',
    sub_stat_value: '33.5%', rarity: 4, equipped_by: 'Nahida',
  },
  {
    name: 'Fleuve Cendre Ferryman', type: 'Sword', level: 90,
    refinement: 5, base_atk: 510, sub_stat_type: 'Energy Recharge',
    sub_stat_value: '45.9%', rarity: 4, equipped_by: 'Furina',
  },
  {
    name: 'Everlasting Moonglow', type: 'Catalyst', level: 80,
    refinement: 1, base_atk: 608, sub_stat_type: 'HP%',
    sub_stat_value: '49.6%', rarity: 5, equipped_by: 'Kokomi',
  },
  {
    name: 'Thundering Pulse', type: 'Bow', level: 80,
    refinement: 1, base_atk: 608, sub_stat_type: 'CRIT DMG',
    sub_stat_value: '66.2%', rarity: 5, equipped_by: 'Yoimiya',
  },
  {
    name: 'The Catch', type: 'Polearm', level: 90,
    refinement: 5, base_atk: 510, sub_stat_type: 'Energy Recharge',
    sub_stat_value: '45.9%', rarity: 4, equipped_by: 'Xiangling',
  },
  {
    name: 'Stringless', type: 'Bow', level: 80,
    refinement: 3, base_atk: 510, sub_stat_type: 'Elemental Mastery',
    sub_stat_value: '165', rarity: 4, equipped_by: 'Fischl',
  },
  {
    name: 'Thrilling Tales of Dragon Slayers', type: 'Catalyst', level: 70,
    refinement: 5, base_atk: 401, sub_stat_type: 'HP%',
    sub_stat_value: '35.2%', rarity: 3, equipped_by: 'Sucrose',
  },
];

// ---------------------------------------------------------------------------
// Artifacts (35개) - top 6 well-built, mid decent, bottom junk
// ---------------------------------------------------------------------------

const artifacts = [
  // ===== Raiden Shogun: Emblem 4pc (all +20) =====
  {
    name: 'Magnificent Tsuba', set_name: 'Emblem of Severed Fate', slot: 'Flower',
    level: 20, main_stat_type: 'HP', main_stat_value: '4780',
    substats: JSON.stringify([
      { name: 'CRIT Rate', value: '10.5%', rolls: 3 },
      { name: 'CRIT DMG', value: '14.0%', rolls: 2 },
      { name: 'Energy Recharge', value: '11.0%', rolls: 2 },
      { name: 'ATK%', value: '5.3%', rolls: 1 },
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
      { name: 'CRIT Rate', value: '6.6%', rolls: 2 },
      { name: 'CRIT DMG', value: '13.2%', rolls: 2 },
      { name: 'ATK%', value: '9.3%', rolls: 2 },
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

  // ===== Hu Tao: Crimson Witch 4pc (all +20) =====
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

  // ===== Ayaka: Blizzard Strayer 4pc (all +20) =====
  {
    name: 'Snowswept Memory', set_name: 'Blizzard Strayer', slot: 'Flower',
    level: 20, main_stat_type: 'HP', main_stat_value: '4780',
    substats: JSON.stringify([
      { name: 'CRIT DMG', value: '21.0%', rolls: 3 },
      { name: 'ATK%', value: '11.1%', rolls: 2 },
      { name: 'Energy Recharge', value: '5.8%', rolls: 1 },
      { name: 'DEF', value: '23', rolls: 1 },
    ]),
    equipped_by: 'Ayaka',
  },
  {
    name: 'Icebreakers Resolve', set_name: 'Blizzard Strayer', slot: 'Plume',
    level: 20, main_stat_type: 'ATK', main_stat_value: '311',
    substats: JSON.stringify([
      { name: 'CRIT DMG', value: '14.8%', rolls: 2 },
      { name: 'ATK%', value: '9.3%', rolls: 2 },
      { name: 'Energy Recharge', value: '5.2%', rolls: 1 },
      { name: 'HP', value: '299', rolls: 1 },
    ]),
    equipped_by: 'Ayaka',
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
    equipped_by: 'Ayaka',
  },
  {
    name: 'Frost-Weaved Dignity', set_name: 'Blizzard Strayer', slot: 'Goblet',
    level: 20, main_stat_type: 'Cryo DMG Bonus', main_stat_value: '46.6%',
    substats: JSON.stringify([
      { name: 'CRIT DMG', value: '14.0%', rolls: 2 },
      { name: 'ATK%', value: '5.8%', rolls: 1 },
      { name: 'Energy Recharge', value: '5.8%', rolls: 1 },
      { name: 'DEF%', value: '7.3%', rolls: 1 },
    ]),
    equipped_by: 'Ayaka',
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
    equipped_by: 'Ayaka',
  },

  // ===== Yelan: Emblem 4pc (all +20) =====
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
      { name: 'Energy Recharge', value: '5.8%', rolls: 1 },
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

  // ===== Xiangling: Emblem 4pc (+16, decent) =====
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
      { name: 'CRIT DMG', value: '14.0%', rolls: 2 },
      { name: 'Energy Recharge', value: '5.2%', rolls: 1 },
    ]),
    equipped_by: 'Xiangling',
  },

  // ===== Furina: Golden Troupe 4pc (+16) =====
  {
    name: 'Golden Songs Variation', set_name: 'Golden Troupe', slot: 'Flower',
    level: 16, main_stat_type: 'HP', main_stat_value: '3967',
    substats: JSON.stringify([
      { name: 'HP%', value: '9.3%', rolls: 2 },
      { name: 'CRIT Rate', value: '3.5%', rolls: 1 },
      { name: 'Energy Recharge', value: '5.8%', rolls: 1 },
    ]),
    equipped_by: 'Furina',
  },
  {
    name: 'Golden Birds Shedding', set_name: 'Golden Troupe', slot: 'Plume',
    level: 16, main_stat_type: 'ATK', main_stat_value: '258',
    substats: JSON.stringify([
      { name: 'HP%', value: '9.3%', rolls: 2 },
      { name: 'CRIT DMG', value: '7.0%', rolls: 1 },
      { name: 'CRIT Rate', value: '3.5%', rolls: 1 },
    ]),
    equipped_by: 'Furina',
  },
  {
    name: 'Golden Eras Prelude', set_name: 'Golden Troupe', slot: 'Sands',
    level: 16, main_stat_type: 'HP%', main_stat_value: '38.7%',
    substats: JSON.stringify([
      { name: 'CRIT Rate', value: '6.6%', rolls: 2 },
      { name: 'Energy Recharge', value: '5.2%', rolls: 1 },
    ]),
    equipped_by: 'Furina',
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
    name: 'Maidens Distant Love', set_name: 'Maiden Beloved', slot: 'Flower',
    level: 0, main_stat_type: 'HP', main_stat_value: '717',
    substats: JSON.stringify([{ name: 'DEF%', value: '5.1%', rolls: 1 }]),
    equipped_by: '',
  },
  {
    name: 'Thunderbirds Mercy', set_name: 'Thundering Fury', slot: 'Flower',
    level: 0, main_stat_type: 'HP', main_stat_value: '717',
    substats: JSON.stringify([{ name: 'ATK', value: '14', rolls: 1 }]),
    equipped_by: '',
  },
  {
    name: 'Berserkers Rose', set_name: 'Berserker', slot: 'Flower',
    level: 4, main_stat_type: 'HP', main_stat_value: '1893',
    substats: JSON.stringify([{ name: 'CRIT Rate', value: '3.5%', rolls: 1 }]),
    equipped_by: '',
  },
];

module.exports = { characters, weapons, artifacts };
