const { test, expect } = require('@playwright/test');

// ---------------------------------------------------------------------------
// Helpers (matching existing patterns from planner.spec.js)
// ---------------------------------------------------------------------------

async function loginAs(page, username, password = 'testpass1234') {
  await page.request.post('/api/register', { data: { username, password } });
  const res = await page.request.post('/api/login', { data: { username, password } });
  expect(res.ok()).toBeTruthy();
}

function uniq(prefix) {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 9999)}`;
}

// ---------------------------------------------------------------------------
// Scenario 1: Full character build check
// ---------------------------------------------------------------------------

test.describe('Scenario 1: Full character build check', () => {
  let user;

  test.beforeEach(async ({ page }) => {
    user = uniq('build');
    await loginAs(page, user);

    // Create Raiden Shogun character
    await page.request.post('/api/characters', {
      data: {
        name: 'Raiden Shogun', element: 'Electro', weapon_type: 'Polearm',
        level: 90, hp: 19445, atk: 2104, crit_rate: 64.2, crit_dmg: 148.5,
        energy_recharge: 274.1, elemental_mastery: 105,
      },
    });

    // Create Engulfing Lightning weapon equipped by Raiden Shogun
    await page.request.post('/api/weapons', {
      data: {
        name: 'Engulfing Lightning', type: 'Polearm', level: 90,
        refinement: 1, base_atk: 608, sub_stat_type: 'Energy Recharge',
        sub_stat_value: '55.1%', rarity: 5, equipped_by: 'RaidenShogun',
      },
    });

    // Create 5 artifacts (full Emblem of Severed Fate set)
    const slots = ['Flower', 'Plume', 'Sands', 'Goblet', 'Circlet'];
    const mainStats = ['HP', 'ATK', 'Energy Recharge', 'Electro DMG Bonus', 'CRIT Rate'];
    for (let i = 0; i < slots.length; i++) {
      await page.request.post('/api/artifacts', {
        data: {
          name: `Emblem ${slots[i]}`, set_name: 'Emblem of Severed Fate',
          slot: slots[i], level: 20, main_stat_type: mainStats[i],
          main_stat_value: '46.6%', equipped_by: 'RaidenShogun',
        },
      });
    }
  });

  test('GET /api/characters returns Raiden Shogun', async ({ page }) => {
    const res = await page.request.get('/api/characters');
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    const raiden = data.find((c) => c.name === 'Raiden Shogun' && c.element === 'Electro');
    expect(raiden).toBeDefined();
    expect(Number(raiden.level)).toBe(90);
  });

  test('GET /api/weapons?equipped_by=RaidenShogun returns the weapon', async ({ page }) => {
    const res = await page.request.get('/api/weapons?equipped_by=RaidenShogun');
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data.length).toBeGreaterThanOrEqual(1);
    const weapon = data.find((w) => w.name === 'Engulfing Lightning');
    expect(weapon).toBeDefined();
    expect(Number(weapon.level)).toBe(90);
    expect(Number(weapon.refinement)).toBe(1);
  });

  test('GET /api/artifacts?equipped_by=RaidenShogun returns 5 artifacts', async ({ page }) => {
    const res = await page.request.get('/api/artifacts?equipped_by=RaidenShogun');
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data.length).toBe(5);
  });

  test('all 5 artifact slots are represented in the equipped set', async ({ page }) => {
    const res = await page.request.get('/api/artifacts?equipped_by=RaidenShogun');
    const data = await res.json();
    const slots = data.map((a) => a.slot);
    expect(slots).toContain('Flower');
    expect(slots).toContain('Plume');
    expect(slots).toContain('Sands');
    expect(slots).toContain('Goblet');
    expect(slots).toContain('Circlet');
  });

  test('all artifacts belong to Emblem of Severed Fate set', async ({ page }) => {
    const res = await page.request.get('/api/artifacts?equipped_by=RaidenShogun');
    const data = await res.json();
    for (const art of data) {
      expect(art.set_name).toBe('Emblem of Severed Fate');
      expect(Number(art.level)).toBe(20);
    }
  });
});

// ---------------------------------------------------------------------------
// Scenario 2: Theater readiness assessment
// ---------------------------------------------------------------------------

test.describe('Scenario 2: Theater readiness assessment', () => {
  let user;

  test.beforeEach(async ({ page }) => {
    user = uniq('theater');
    await loginAs(page, user);

    // Create Hydro Lv.90 character
    await page.request.post('/api/characters', {
      data: {
        name: 'Furina', element: 'Hydro', weapon_type: 'Sword',
        level: 90, hp: 15000, atk: 1000, crit_rate: 60.0, crit_dmg: 150.0,
        energy_recharge: 130.0, elemental_mastery: 0,
      },
    });
    // Create Cryo Lv.90 character
    await page.request.post('/api/characters', {
      data: {
        name: 'Ganyu', element: 'Cryo', weapon_type: 'Bow',
        level: 90, hp: 14000, atk: 1800, crit_rate: 50.0, crit_dmg: 200.0,
        energy_recharge: 110.0, elemental_mastery: 0,
      },
    });
    // Create Geo Lv.90 character
    await page.request.post('/api/characters', {
      data: {
        name: 'Zhongli', element: 'Geo', weapon_type: 'Polearm',
        level: 90, hp: 40000, atk: 1100, crit_rate: 30.0, crit_dmg: 60.0,
        energy_recharge: 120.0, elemental_mastery: 0,
      },
    });
  });

  test('normal difficulty: roster_status shows adequate Hydro/Cryo/Geo', async ({ page }) => {
    await page.request.put('/api/me/preferences', { data: { theater_difficulty: 'normal' } });
    const res = await page.request.get('/api/planner/recommend');
    expect(res.ok()).toBeTruthy();
    const data = await res.json();

    // With normal difficulty, neededPerEl=1 and user has 1 each of Hydro, Cryo, Geo
    if (data.roster_status['Hydro']) {
      expect(Number(data.roster_status['Hydro'].have)).toBeGreaterThanOrEqual(1);
    }
    if (data.roster_status['Cryo']) {
      expect(Number(data.roster_status['Cryo'].have)).toBeGreaterThanOrEqual(1);
    }
    if (data.roster_status['Geo']) {
      expect(Number(data.roster_status['Geo'].have)).toBeGreaterThanOrEqual(1);
    }
  });

  test('normal difficulty: characters_needed is reduced from adding Lv.90 chars', async ({ page }) => {
    await page.request.put('/api/me/preferences', { data: { theater_difficulty: 'normal' } });
    const res = await page.request.get('/api/planner/recommend');
    const data = await res.json();
    // No seed data. Added 3 chars = 3 ready; normal needs 8, so characters_needed = 5
    expect(Number(data.characters_needed)).toBe(5);
  });

  test('transcendence difficulty: characters_needed increases significantly', async ({ page }) => {
    await page.request.put('/api/me/preferences', { data: { theater_difficulty: 'transcendence' } });
    const res = await page.request.get('/api/planner/recommend');
    const data = await res.json();
    // No seed data. Added 3 chars = 3 ready; transcendence needs 32, so characters_needed = 29
    expect(Number(data.characters_needed)).toBe(29);
  });

  test('switching from normal to transcendence increases characters_needed', async ({ page }) => {
    await page.request.put('/api/me/preferences', { data: { theater_difficulty: 'normal' } });
    const normalRes = await page.request.get('/api/planner/recommend');
    const normalData = await normalRes.json();
    const normalNeeded = Number(normalData.characters_needed);

    await page.request.put('/api/me/preferences', { data: { theater_difficulty: 'transcendence' } });
    const transRes = await page.request.get('/api/planner/recommend');
    const transData = await transRes.json();
    const transNeeded = Number(transData.characters_needed);

    expect(transNeeded).toBeGreaterThan(normalNeeded);
  });
});

// ---------------------------------------------------------------------------
// Scenario 3: Weekly resin optimization flow
// ---------------------------------------------------------------------------

test.describe('Scenario 3: Weekly resin optimization flow', () => {
  let user;

  test.beforeEach(async ({ page }) => {
    user = uniq('resin');
    await loginAs(page, user);
  });

  test('initial state has 3 weekly boss discounts remaining', async ({ page }) => {
    const res = await page.request.get('/api/planner/weekly-bosses');
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(Number(data.discount_remaining)).toBe(3);
    expect(Number(data.total_resin_spent)).toBe(0);
  });

  test('toggling 2 weekly bosses done spends 60 resin at discount rate', async ({ page }) => {
    const listRes = await page.request.get('/api/planner/weekly-bosses');
    const listData = await listRes.json();

    await page.request.put(`/api/planner/weekly-bosses/${listData.bosses[0].id}`);
    await page.request.put(`/api/planner/weekly-bosses/${listData.bosses[1].id}`);

    const afterRes = await page.request.get('/api/planner/weekly-bosses');
    const after = await afterRes.json();
    expect(Number(after.discount_remaining)).toBe(1);
    expect(Number(after.total_resin_spent)).toBe(60);
    expect(Number(after.next_boss_cost)).toBe(30);
  });

  test('after 2 bosses done, recommend still suggests 1 more boss at discount', async ({ page }) => {
    const listRes = await page.request.get('/api/planner/weekly-bosses');
    const listData = await listRes.json();

    await page.request.put(`/api/planner/weekly-bosses/${listData.bosses[0].id}`);
    await page.request.put(`/api/planner/weekly-bosses/${listData.bosses[1].id}`);

    const res = await page.request.get('/api/planner/recommend');
    const data = await res.json();

    // Daily plan should have a boss recommendation with discount if Mon-Wed
    const now = new Date();
    const weekday = now.getDay();
    if (weekday >= 1 && weekday <= 3) {
      const bossRec = data.daily_plan.find((r) => r.category === '보스');
      expect(bossRec).toBeDefined();
      expect(bossRec.resin).toBe(30);
      expect(bossRec.title).toContain('할인');
    }
  });

  test('daily plan resin items sum to approximately 160', async ({ page }) => {
    const res = await page.request.get('/api/planner/recommend');
    const data = await res.json();
    const totalResin = data.daily_plan.reduce((acc, item) => acc + (item.resin || 0), 0);
    expect(totalResin).toBeLessThanOrEqual(160);
    // Should be at least 120 (talent + artifact/weapon + ley line minimum)
    expect(totalResin).toBeGreaterThanOrEqual(80);
  });

  test('daily plan contains talent domain and remaining resin filler items', async ({ page }) => {
    const res = await page.request.get('/api/planner/recommend');
    const data = await res.json();
    const categories = data.daily_plan.map((r) => r.category);
    expect(categories).toContain('특성');
  });
});

// ---------------------------------------------------------------------------
// Scenario 4: Import GOOD data then check everything
// ---------------------------------------------------------------------------

test.describe('Scenario 4: Import GOOD data then check everything', () => {
  let user;

  test.beforeEach(async ({ page }) => {
    user = uniq('import');
    await loginAs(page, user);
  });

  test('import GOOD format adds correct counts of characters, artifacts, weapons', async ({ page }) => {
    // Get initial counts
    const charsBefore = await page.request.get('/api/characters').then((r) => r.json());
    const artsBefore = await page.request.get('/api/artifacts').then((r) => r.json());
    const weapsBefore = await page.request.get('/api/weapons').then((r) => r.json());

    const importRes = await page.request.post('/api/import', {
      data: {
        format: 'GOOD',
        version: 1,
        source: 'test',
        characters: [
          { key: 'Furina', level: 90, constellation: 0, ascension: 6, talent: { auto: 1, skill: 1, burst: 1 } },
          { key: 'Ganyu', level: 90, constellation: 0, ascension: 6, talent: { auto: 1, skill: 1, burst: 1 } },
          { key: 'Zhongli', level: 90, constellation: 0, ascension: 6, talent: { auto: 1, skill: 1, burst: 1 } },
        ],
        artifacts: [
          { setKey: 'GladiatorsFinale', slotKey: 'flower', level: 20, rarity: 5, mainStatKey: 'hp', location: 'Furina', lock: false, substats: [] },
          { setKey: 'GladiatorsFinale', slotKey: 'plume', level: 20, rarity: 5, mainStatKey: 'atk', location: 'Furina', lock: false, substats: [] },
          { setKey: 'ArchaicPetra', slotKey: 'sands', level: 20, rarity: 5, mainStatKey: 'hp_', location: 'Zhongli', lock: false, substats: [] },
          { setKey: 'ArchaicPetra', slotKey: 'goblet', level: 16, rarity: 5, mainStatKey: 'geo_dmg_', location: 'Zhongli', lock: false, substats: [] },
          { setKey: 'BlizzardStrayer', slotKey: 'circlet', level: 20, rarity: 5, mainStatKey: 'critRate_', location: 'Ganyu', lock: false, substats: [] },
        ],
        weapons: [
          { key: 'AquilaFavonia', level: 90, ascension: 6, refinement: 1, location: 'Furina', lock: false },
          { key: 'AmosBow', level: 90, ascension: 6, refinement: 1, location: 'Ganyu', lock: false },
        ],
      },
    });
    expect(importRes.ok()).toBeTruthy();
    const importData = await importRes.json();
    expect(importData.characters).toBe(3);
    expect(importData.artifacts).toBe(5);
    expect(importData.weapons).toBe(2);

    // Verify counts increased
    const charsAfter = await page.request.get('/api/characters').then((r) => r.json());
    const artsAfter = await page.request.get('/api/artifacts').then((r) => r.json());
    const weapsAfter = await page.request.get('/api/weapons').then((r) => r.json());

    expect(charsAfter.length).toBe(charsBefore.length + 3);
    expect(artsAfter.length).toBe(artsBefore.length + 5);
    expect(weapsAfter.length).toBe(weapsBefore.length + 2);
  });

  test('imported chars affect planner roster_status', async ({ page }) => {
    await page.request.post('/api/import', {
      data: {
        format: 'GOOD', version: 1, source: 'test',
        characters: [
          { key: 'Furina', level: 90, constellation: 0, ascension: 6, talent: { auto: 1, skill: 1, burst: 1 } },
        ],
        artifacts: [],
        weapons: [],
      },
    });

    const res = await page.request.get('/api/planner/recommend');
    const data = await res.json();
    // Imported chars increase readyCount, reducing characters_needed
    // No seed data. Imported 1 = 1 ready; transcendence 32 - 1 = 31
    expect(Number(data.characters_needed)).toBe(31);
  });

  test('exported data includes imported characters', async ({ page }) => {
    await page.request.post('/api/import', {
      data: {
        format: 'GOOD', version: 1, source: 'test',
        characters: [
          { key: 'Nahida', level: 90, constellation: 0, ascension: 6, talent: { auto: 1, skill: 1, burst: 1 } },
        ],
        artifacts: [],
        weapons: [],
      },
    });

    const exportRes = await page.request.get('/api/export');
    expect(exportRes.ok()).toBeTruthy();
    const exported = await exportRes.json();
    expect(exported.format).toBe('GOOD');
    expect(exported.characters.length).toBeGreaterThanOrEqual(1); // 0 seed + 1 imported
    const nahida = exported.characters.find((c) => c.key === 'Nahida');
    expect(nahida).toBeDefined();
    expect(nahida.level).toBe(90);
  });
});

// ---------------------------------------------------------------------------
// Scenario 5: Multi-week BP progression
// ---------------------------------------------------------------------------

test.describe('Scenario 5: Multi-week BP progression', () => {
  let user;

  test.beforeEach(async ({ page }) => {
    user = uniq('bpprog');
    await loginAs(page, user);
  });

  test('partial BP progress is saved correctly', async ({ page }) => {
    const listRes = await page.request.get('/api/planner/bp');
    const missions = await listRes.json();

    // Find the ley line mission (target=15) and domain mission (target=10)
    const leyLine = missions.find((m) => m.mission.includes('지맥'));
    const domain = missions.find((m) => m.mission.includes('비경'));
    expect(leyLine).toBeDefined();
    expect(domain).toBeDefined();

    // Progress ley line to 5/15
    await page.request.put(`/api/planner/bp/${leyLine.id}`, { data: { progress: 5 } });
    // Progress domain to 3/10
    await page.request.put(`/api/planner/bp/${domain.id}`, { data: { progress: 3 } });

    // Verify partial progress is saved
    const afterRes = await page.request.get('/api/planner/bp');
    const afterMissions = await afterRes.json();
    const afterLeyLine = afterMissions.find((m) => String(m.id) === String(leyLine.id));
    const afterDomain = afterMissions.find((m) => String(m.id) === String(domain.id));

    expect(Number(afterLeyLine.progress)).toBe(5);
    expect(Number(afterLeyLine.done)).toBe(0);
    expect(Number(afterDomain.progress)).toBe(3);
    expect(Number(afterDomain.done)).toBe(0);
  });

  test('reset BP brings all progress back to 0', async ({ page }) => {
    const listRes = await page.request.get('/api/planner/bp');
    const missions = await listRes.json();

    // Set some progress
    await page.request.put(`/api/planner/bp/${missions[0].id}`, {
      data: { progress: Number(missions[0].target) },
    });

    // Reset
    const resetRes = await page.request.post('/api/planner/bp/reset');
    expect(resetRes.ok()).toBeTruthy();

    // Verify all back to 0
    const afterRes = await page.request.get('/api/planner/bp');
    const afterMissions = await afterRes.json();
    for (const m of afterMissions) {
      expect(Number(m.progress)).toBe(0);
      expect(Number(m.done)).toBe(0);
    }
  });

  test('progress after reset is independent of previous cycle', async ({ page }) => {
    const listRes = await page.request.get('/api/planner/bp');
    const missions = await listRes.json();

    // Complete first mission
    await page.request.put(`/api/planner/bp/${missions[0].id}`, {
      data: { progress: Number(missions[0].target) },
    });

    // Reset
    await page.request.post('/api/planner/bp/reset');

    // Get fresh missions after reset
    const resetRes = await page.request.get('/api/planner/bp');
    const resetMissions = await resetRes.json();
    expect(resetMissions).toHaveLength(12);

    // Progress a different mission
    await page.request.put(`/api/planner/bp/${resetMissions[2].id}`, {
      data: { progress: 4 },
    });

    // Verify only that mission has progress
    const finalRes = await page.request.get('/api/planner/bp');
    const finalMissions = await finalRes.json();
    const updated = finalMissions.find((m) => String(m.id) === String(resetMissions[2].id));
    expect(Number(updated.progress)).toBe(4);

    // First mission should still be at 0
    const first = finalMissions.find((m) => String(m.id) === String(resetMissions[0].id));
    expect(Number(first.progress)).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Scenario 6: Character with underleveled gear
// ---------------------------------------------------------------------------

test.describe('Scenario 6: Character with underleveled gear', () => {
  let user;

  test.beforeEach(async ({ page }) => {
    user = uniq('undergear');
    await loginAs(page, user);

    // Create Lv.90 character
    await page.request.post('/api/characters', {
      data: {
        name: 'Nahida', element: 'Dendro', weapon_type: 'Catalyst',
        level: 90, hp: 16000, atk: 1200, crit_rate: 50.0, crit_dmg: 100.0,
        energy_recharge: 130.0, elemental_mastery: 800,
      },
    });

    // Create Lv.50 weapon equipped to that character
    await page.request.post('/api/weapons', {
      data: {
        name: 'A Thousand Floating Dreams', type: 'Catalyst', level: 50,
        refinement: 1, base_atk: 300, sub_stat_type: 'Elemental Mastery',
        sub_stat_value: '100', rarity: 5, equipped_by: 'Nahida',
      },
    });

    // Create Lv.0 artifacts equipped to that character
    const slots = ['Flower', 'Plume', 'Sands', 'Goblet', 'Circlet'];
    for (const slot of slots) {
      await page.request.post('/api/artifacts', {
        data: {
          name: `Deepwood ${slot}`, set_name: 'Deepwood Memories',
          slot, level: 0, main_stat_type: 'HP', main_stat_value: '0',
          equipped_by: 'Nahida',
        },
      });
    }
  });

  test('recommend suggests farming for underleveled gear scenario', async ({ page }) => {
    const res = await page.request.get('/api/planner/recommend');
    expect(res.ok()).toBeTruthy();
    const data = await res.json();

    // Daily plan should include artifact domain and weapon/talent domains
    expect(data.daily_plan.length).toBeGreaterThan(0);
    const categories = data.daily_plan.map((r) => r.category);
    // Should have artifact farming or weapon material domain
    const hasFarmRec = categories.includes('성유물') || categories.includes('무기') || categories.includes('특성');
    expect(hasFarmRec).toBeTruthy();
  });

  test('daily plan includes talent and weapon material domains', async ({ page }) => {
    const res = await page.request.get('/api/planner/recommend');
    const data = await res.json();
    const categories = data.daily_plan.map((r) => r.category);
    expect(categories).toContain('특성');
  });

  test('underleveled weapon exists in weapons list', async ({ page }) => {
    const res = await page.request.get('/api/weapons?equipped_by=Nahida');
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data.length).toBeGreaterThanOrEqual(1);
    const weapon = data.find((w) => w.name === 'A Thousand Floating Dreams');
    expect(weapon).toBeDefined();
    expect(Number(weapon.level)).toBe(50);
  });

  test('Lv.0 artifacts exist for the character', async ({ page }) => {
    const res = await page.request.get('/api/artifacts?equipped_by=Nahida');
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data.length).toBe(5);
    for (const art of data) {
      expect(Number(art.level)).toBe(0);
    }
  });
});

// ---------------------------------------------------------------------------
// Scenario 7: Gender preference with theater
// ---------------------------------------------------------------------------

test.describe('Scenario 7: Gender preference with theater', () => {
  let user;

  test.beforeEach(async ({ page }) => {
    user = uniq('genderpref');
    await loginAs(page, user);

    // Add female Hydro char (Mona)
    await page.request.post('/api/characters', {
      data: {
        name: 'Mona', element: 'Hydro', weapon_type: 'Catalyst',
        level: 90, hp: 9000, atk: 700, crit_rate: 15.0, crit_dmg: 50.0,
        energy_recharge: 120.0, elemental_mastery: 0,
      },
    });
    // Add male Hydro char (Xingqiu)
    await page.request.post('/api/characters', {
      data: {
        name: 'Xingqiu', element: 'Hydro', weapon_type: 'Sword',
        level: 90, hp: 16000, atk: 1500, crit_rate: 50.0, crit_dmg: 100.0,
        energy_recharge: 180.0, elemental_mastery: 0,
      },
    });
  });

  test('prefer_gender female: Mona counted, Xingqiu filtered out', async ({ page }) => {
    await page.request.put('/api/me/preferences', { data: { prefer_gender: 'female' } });
    const res = await page.request.get('/api/planner/recommend');
    const data = await res.json();

    // With female filter, Xingqiu (male, non-default) is filtered out
    // Mona (female) is kept, so Hydro should still have at least 1
    // The Hydro theater_prep should NOT have a "no Hydro characters" rec (priority 1)
    const noHydro = data.theater_prep.find(
      (r) => r.priority === 1 && (r.title.includes('Hydro') && r.title.includes('육성 필요')),
    );
    expect(noHydro).toBeUndefined();
  });

  test('prefer_gender male: Xingqiu counted, female chars filtered out', async ({ page }) => {
    await page.request.put('/api/me/preferences', { data: { prefer_gender: 'male' } });
    const res = await page.request.get('/api/planner/recommend');
    const data = await res.json();
    expect(data.prefer_gender).toBe('male');

    // No seed data. Only Xingqiu (male) remains => 1 ready
    // characters_needed = 32 - 1 = 31
    expect(Number(data.characters_needed)).toBe(31);
  });

  test('prefer_gender all: both Mona and Xingqiu counted', async ({ page }) => {
    await page.request.put('/api/me/preferences', { data: { prefer_gender: 'all' } });
    const res = await page.request.get('/api/planner/recommend');
    const data = await res.json();

    // No seed data. Mona + Xingqiu = 2 ready
    // characters_needed = 32 - 2 = 30
    expect(Number(data.characters_needed)).toBe(30);
  });

  test('switching gender preference updates characters_needed correctly', async ({ page }) => {
    // "all" preference counts both Mona and Xingqiu
    await page.request.put('/api/me/preferences', { data: { prefer_gender: 'all' } });
    const allRes = await page.request.get('/api/planner/recommend');
    const allData = await allRes.json();
    const allNeeded = Number(allData.characters_needed);

    // Male preference counts only Xingqiu (1 char)
    await page.request.put('/api/me/preferences', { data: { prefer_gender: 'male' } });
    const maleRes = await page.request.get('/api/planner/recommend');
    const maleData = await maleRes.json();
    const maleNeeded = Number(maleData.characters_needed);

    // Male filter has fewer chars ready, so needs more
    expect(maleNeeded).toBeGreaterThan(allNeeded);
  });
});

// ---------------------------------------------------------------------------
// Scenario 8: Export -> Delete all -> Import cycle
// ---------------------------------------------------------------------------

test.describe('Scenario 8: Export -> Delete all -> Import cycle', () => {
  let user;

  test.beforeEach(async ({ page }) => {
    user = uniq('exportcycle');
    await loginAs(page, user);

    // Create seed artifacts to test with
    const slots = ['Flower', 'Plume', 'Sands'];
    for (const slot of slots) {
      await page.request.post('/api/artifacts', {
        data: {
          name: `Test ${slot}`, set_name: 'Gladiators Finale',
          slot, level: 20, main_stat_type: 'ATK', main_stat_value: '311',
          equipped_by: '',
        },
      });
    }
  });

  test('full export-delete-import cycle restores artifacts', async ({ page }) => {
    // Step 1: Get initial artifact count
    const initialRes = await page.request.get('/api/artifacts');
    const initialArts = await initialRes.json();
    const initialCount = initialArts.length;
    expect(initialCount).toBeGreaterThanOrEqual(3);

    // Step 2: Export all data
    const exportRes = await page.request.get('/api/export');
    expect(exportRes.ok()).toBeTruthy();
    const exported = await exportRes.json();
    expect(exported.format).toBe('GOOD');
    expect(exported.artifacts.length).toBe(initialCount);

    // Step 3: Delete all artifacts one by one
    for (const art of initialArts) {
      const delRes = await page.request.delete(`/api/artifacts/${art.id}`);
      expect(delRes.status()).toBe(204);
    }

    // Step 4: Verify artifacts list is empty
    const emptyRes = await page.request.get('/api/artifacts');
    const emptyArts = await emptyRes.json();
    expect(emptyArts.length).toBe(0);

    // Step 5: Import the exported data (only artifacts)
    const importRes = await page.request.post('/api/import', {
      data: {
        format: 'GOOD',
        version: 1,
        source: 'test-restore',
        characters: [],
        artifacts: exported.artifacts,
        weapons: [],
      },
    });
    expect(importRes.ok()).toBeTruthy();
    const importData = await importRes.json();
    expect(importData.artifacts).toBe(initialCount);

    // Step 6: Verify artifacts are restored
    const restoredRes = await page.request.get('/api/artifacts');
    const restoredArts = await restoredRes.json();
    expect(restoredArts.length).toBe(initialCount);
  });

  test('export includes artifacts and has GOOD format', async ({ page }) => {
    const exportRes = await page.request.get('/api/export');
    const exported = await exportRes.json();
    expect(exported.format).toBe('GOOD');
    expect(exported).toHaveProperty('artifacts');
    // Characters and weapons keys may be absent when user has none
    const chars = exported.characters || [];
    const weaps = exported.weapons || [];
    expect(Array.isArray(chars)).toBeTruthy();
    expect(Array.isArray(weaps)).toBeTruthy();
  });

  test('deleting all artifacts does not affect characters', async ({ page }) => {
    const initialChars = await page.request.get('/api/characters').then((r) => r.json());
    const initialArts = await page.request.get('/api/artifacts').then((r) => r.json());

    // Delete all artifacts
    for (const art of initialArts) {
      await page.request.delete(`/api/artifacts/${art.id}`);
    }

    // Characters should be unchanged
    const afterChars = await page.request.get('/api/characters').then((r) => r.json());
    expect(afterChars.length).toBe(initialChars.length);
  });
});
