/**
 * AR20 (모험 등급 20) beginner Genshin Impact account fixture.
 *
 * 5 characters, 3 weapons, 5 artifacts.
 * Early game account with only free characters and starter weapons.
 * Data format matches the POST /api/characters, /api/weapons, /api/artifacts endpoints.
 */

// ---------------------------------------------------------------------------
// Characters (5명) - free/guaranteed characters only
// ---------------------------------------------------------------------------

const characters = [
  {
    name: 'Traveler', element: 'Anemo', weapon_type: 'Sword',
    level: 40, hp: 8168, atk: 212, crit_rate: 8.1, crit_dmg: 55.2,
    energy_recharge: 100, elemental_mastery: 12,
  },
  {
    name: 'Kaeya', element: 'Cryo', weapon_type: 'Sword',
    level: 25, hp: 5800, atk: 155, crit_rate: 5.0, crit_dmg: 50.0,
    energy_recharge: 100, elemental_mastery: 0,
  },
  {
    name: 'Amber', element: 'Pyro', weapon_type: 'Bow',
    level: 20, hp: 4800, atk: 130, crit_rate: 5.0, crit_dmg: 50.0,
    energy_recharge: 100, elemental_mastery: 0,
  },
  {
    name: 'Lisa', element: 'Electro', weapon_type: 'Catalyst',
    level: 20, hp: 4600, atk: 125, crit_rate: 5.0, crit_dmg: 50.0,
    energy_recharge: 100, elemental_mastery: 0,
  },
  {
    name: 'Noelle', element: 'Geo', weapon_type: 'Claymore',
    level: 20, hp: 5200, atk: 135, crit_rate: 5.0, crit_dmg: 50.0,
    energy_recharge: 100, elemental_mastery: 0,
  },
];

// ---------------------------------------------------------------------------
// Weapons (3개) - starter and early-game weapons only
// ---------------------------------------------------------------------------

const weapons = [
  {
    name: 'Dull Blade', type: 'Sword', level: 20,
    refinement: 1, base_atk: 185, sub_stat_type: 'None',
    sub_stat_value: '0', rarity: 3, equipped_by: 'Traveler',
  },
  {
    name: 'Hunters Bow', type: 'Bow', level: 20,
    refinement: 1, base_atk: 185, sub_stat_type: 'None',
    sub_stat_value: '0', rarity: 3, equipped_by: 'Amber',
  },
  {
    name: 'Apprentice Notes', type: 'Catalyst', level: 1,
    refinement: 1, base_atk: 23, sub_stat_type: 'None',
    sub_stat_value: '0', rarity: 1, equipped_by: 'Lisa',
  },
];

// ---------------------------------------------------------------------------
// Artifacts (5개) - random 3-4 star, barely upgraded
// ---------------------------------------------------------------------------

const artifacts = [
  {
    name: 'Adventurers Flower', set_name: 'Adventurer', slot: 'Flower',
    level: 4, main_stat_type: 'HP', main_stat_value: '1123',
    substats: JSON.stringify([
      { name: 'DEF', value: '10', rolls: 1 },
    ]),
    equipped_by: 'Traveler',
  },
  {
    name: 'Adventurers Tail Feather', set_name: 'Adventurer', slot: 'Plume',
    level: 2, main_stat_type: 'ATK', main_stat_value: '62',
    substats: JSON.stringify([
      { name: 'HP', value: '100', rolls: 1 },
    ]),
    equipped_by: 'Traveler',
  },
  {
    name: 'Lucky Dogs Clover', set_name: 'Lucky Dog', slot: 'Flower',
    level: 0, main_stat_type: 'HP', main_stat_value: '430',
    substats: JSON.stringify([
      { name: 'DEF', value: '8', rolls: 1 },
    ]),
    equipped_by: 'Kaeya',
  },
  {
    name: 'Berserkers Rose', set_name: 'Berserker', slot: 'Flower',
    level: 4, main_stat_type: 'HP', main_stat_value: '1893',
    substats: JSON.stringify([
      { name: 'ATK', value: '11', rolls: 1 },
      { name: 'DEF%', value: '5.1%', rolls: 1 },
    ]),
    equipped_by: 'Noelle',
  },
  {
    name: 'Berserkers Indigo Feather', set_name: 'Berserker', slot: 'Plume',
    level: 0, main_stat_type: 'ATK', main_stat_value: '28',
    substats: JSON.stringify([
      { name: 'HP', value: '100', rolls: 1 },
    ]),
    equipped_by: '',
  },
];

module.exports = { characters, weapons, artifacts };
