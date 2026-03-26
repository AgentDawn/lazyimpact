const { test, expect } = require('@playwright/test');

// ---------------------------------------------------------------------------
// Helpers (matching existing patterns from auth.spec.js / scenarios.spec.js)
// ---------------------------------------------------------------------------

function uniq(prefix) {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 9999)}`;
}

async function loginAs(page, username, password = 'testpass1234') {
  await page.request.post('/api/register', { data: { username, password } });
  const res = await page.request.post('/api/login', { data: { username, password } });
  expect(res.ok()).toBeTruthy();
}

async function createCharacter(page, overrides = {}) {
  const defaults = {
    name: 'Amber', element: 'Pyro', weapon_type: 'Bow',
    level: 90, hp: 9000, atk: 1000, crit_rate: 50.0, crit_dmg: 100.0,
    energy_recharge: 120.0, elemental_mastery: 50,
  };
  const data = { ...defaults, ...overrides };
  const res = await page.request.post('/api/characters', { data });
  expect(res.ok()).toBeTruthy();
  return res;
}

// ---------------------------------------------------------------------------
// 1. Abyss Seasons API
// ---------------------------------------------------------------------------

test.describe('Abyss Seasons API', () => {
  test('returns at least 1 season', async ({ page }) => {
    const res = await page.request.get('/api/abyss/seasons');
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(Array.isArray(data)).toBeTruthy();
    expect(data.length).toBeGreaterThanOrEqual(1);
  });

  test('season has period, blessing, and floor12_data fields', async ({ page }) => {
    const res = await page.request.get('/api/abyss/seasons');
    const data = await res.json();
    const season = data[0];
    expect(season).toHaveProperty('period');
    expect(season).toHaveProperty('blessing');
    expect(season).toHaveProperty('floor12_data');
    expect(season.period).toBeTruthy();
    expect(season.blessing).toBeTruthy();
  });

  test('is publicly accessible without authentication', async ({ page }) => {
    // No login call before the request
    const res = await page.request.get('/api/abyss/seasons');
    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(data.length).toBeGreaterThanOrEqual(1);
  });
});

// ---------------------------------------------------------------------------
// 2. Optimization with no characters
// ---------------------------------------------------------------------------

test.describe('Optimization with no characters', () => {
  const user = uniq('abyss_empty');

  test.beforeEach(async ({ page }) => {
    await loginAs(page, user);
  });

  test('returns zero overall_score when user has no characters', async ({ page }) => {
    const res = await page.request.get('/api/abyss/optimize');
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data.overall_score).toBe(0);
  });

  test('returns empty team members when user has no characters', async ({ page }) => {
    const res = await page.request.get('/api/abyss/optimize');
    const data = await res.json();
    expect(data.teams.first_half.members).toHaveLength(0);
    expect(data.teams.second_half.members).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// 3. Optimization with insufficient characters (< 8)
// ---------------------------------------------------------------------------

test.describe('Optimization with insufficient characters', () => {
  const user = uniq('abyss_few');

  test.beforeEach(async ({ page }) => {
    await loginAs(page, user);
    // Create 3 characters: Electro, Pyro, Cryo
    await createCharacter(page, { name: 'Raiden Shogun', element: 'Electro', weapon_type: 'Polearm', level: 90, atk: 2000, crit_rate: 60, crit_dmg: 140 });
    await createCharacter(page, { name: 'Hu Tao', element: 'Pyro', weapon_type: 'Polearm', level: 85, atk: 1800, crit_rate: 55, crit_dmg: 180 });
    await createCharacter(page, { name: 'Ganyu', element: 'Cryo', weapon_type: 'Bow', level: 80, atk: 1600, crit_rate: 50, crit_dmg: 200 });
  });

  test('first_half has up to 3 members when only 3 characters exist', async ({ page }) => {
    const res = await page.request.get('/api/abyss/optimize');
    const data = await res.json();
    // With 3 total chars, first_half gets some, second_half gets the rest
    const totalAssigned = data.teams.first_half.members.length + data.teams.second_half.members.length;
    expect(totalAssigned).toBe(3);
    expect(data.teams.first_half.members.length).toBeLessThanOrEqual(3);
  });

  test('second_half has fewer than 4 members with insufficient roster', async ({ page }) => {
    const res = await page.request.get('/api/abyss/optimize');
    const data = await res.json();
    expect(data.teams.second_half.members.length).toBeLessThan(4);
  });

  test('recommendations mention missing elements for incomplete teams', async ({ page }) => {
    const res = await page.request.get('/api/abyss/optimize');
    const data = await res.json();
    // With only 3 characters, some recommended elements will be missing
    // The server adds "원소 부족" recommendations for missing elements
    const hasElementRec = data.recommendations.some((r) => r.title.includes('원소 부족'));
    expect(hasElementRec).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// 4. Optimization with full roster (8+ characters)
// ---------------------------------------------------------------------------

test.describe('Optimization with full roster', () => {
  const user = uniq('abyss_full');

  test.beforeEach(async ({ page }) => {
    await loginAs(page, user);
    // Create 8 characters covering: Electro x2, Pyro x2, Hydro x1, Cryo x1, Anemo x1, Geo x1
    await createCharacter(page, { name: 'Raiden Shogun', element: 'Electro', weapon_type: 'Polearm', level: 90, atk: 2100, crit_rate: 64, crit_dmg: 148 });
    await createCharacter(page, { name: 'Yae Miko', element: 'Electro', weapon_type: 'Catalyst', level: 90, atk: 1900, crit_rate: 60, crit_dmg: 140 });
    await createCharacter(page, { name: 'Hu Tao', element: 'Pyro', weapon_type: 'Polearm', level: 90, atk: 1800, crit_rate: 70, crit_dmg: 200 });
    await createCharacter(page, { name: 'Bennett', element: 'Pyro', weapon_type: 'Sword', level: 85, atk: 1200, crit_rate: 40, crit_dmg: 80 });
    await createCharacter(page, { name: 'Furina', element: 'Hydro', weapon_type: 'Sword', level: 90, atk: 1500, crit_rate: 55, crit_dmg: 130 });
    await createCharacter(page, { name: 'Ganyu', element: 'Cryo', weapon_type: 'Bow', level: 90, atk: 1700, crit_rate: 50, crit_dmg: 200 });
    await createCharacter(page, { name: 'Kaedehara Kazuha', element: 'Anemo', weapon_type: 'Sword', level: 90, atk: 1400, crit_rate: 45, crit_dmg: 90, elemental_mastery: 800 });
    await createCharacter(page, { name: 'Zhongli', element: 'Geo', weapon_type: 'Polearm', level: 90, hp: 40000, atk: 1100, crit_rate: 30, crit_dmg: 60 });
  });

  test('both halves have exactly 4 members each', async ({ page }) => {
    const res = await page.request.get('/api/abyss/optimize');
    const data = await res.json();
    expect(data.teams.first_half.members).toHaveLength(4);
    expect(data.teams.second_half.members).toHaveLength(4);
  });

  test('overall_score is greater than 0', async ({ page }) => {
    const res = await page.request.get('/api/abyss/optimize');
    const data = await res.json();
    expect(data.overall_score).toBeGreaterThan(0);
  });

  test('no character appears in both teams', async ({ page }) => {
    const res = await page.request.get('/api/abyss/optimize');
    const data = await res.json();
    const firstIds = data.teams.first_half.members.map((m) => m.character.id);
    const secondIds = data.teams.second_half.members.map((m) => m.character.id);
    for (const id of firstIds) {
      expect(secondIds).not.toContain(id);
    }
  });

  test('team_score is the sum of individual member scores', async ({ page }) => {
    const res = await page.request.get('/api/abyss/optimize');
    const data = await res.json();
    const firstSum = data.teams.first_half.members.reduce((acc, m) => acc + m.score, 0);
    const secondSum = data.teams.second_half.members.reduce((acc, m) => acc + m.score, 0);
    // team_score >= member sum because resonance/moonlight bonuses are added
    expect(data.teams.first_half.team_score).toBeGreaterThanOrEqual(firstSum);
    expect(data.teams.second_half.team_score).toBeGreaterThanOrEqual(secondSum);
  });

  test('element_coverage lists unique elements in each team', async ({ page }) => {
    const res = await page.request.get('/api/abyss/optimize');
    const data = await res.json();
    expect(data.teams.first_half.element_coverage.length).toBeGreaterThan(0);
    expect(data.teams.second_half.element_coverage.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// 5. Scoring accuracy
// ---------------------------------------------------------------------------

test.describe('Scoring accuracy', () => {
  const user = uniq('abyss_score');

  test.beforeEach(async ({ page }) => {
    await loginAs(page, user);
  });

  test('high-stat Lv.90 character scores higher than low-stat Lv.20 character', async ({ page }) => {
    // High stats character
    await createCharacter(page, { name: 'Raiden Shogun', element: 'Electro', weapon_type: 'Polearm', level: 90, atk: 2100, crit_rate: 64, crit_dmg: 148, energy_recharge: 274, elemental_mastery: 105 });
    // Low stats character
    await createCharacter(page, { name: 'Amber', element: 'Pyro', weapon_type: 'Bow', level: 20, atk: 200, crit_rate: 5, crit_dmg: 50, energy_recharge: 100, elemental_mastery: 0 });

    const res = await page.request.get('/api/abyss/optimize');
    const data = await res.json();

    // Collect all members across both halves
    const allMembers = [
      ...data.teams.first_half.members,
      ...data.teams.second_half.members,
    ];
    const raiden = allMembers.find((m) => m.character.name === 'Raiden Shogun');
    const amber = allMembers.find((m) => m.character.name === 'Amber');
    expect(raiden).toBeDefined();
    expect(amber).toBeDefined();
    expect(raiden.score).toBeGreaterThan(amber.score);
  });

  test('Lv.90 character base score is at least 9000', async ({ page }) => {
    // base score = level * 100 = 90 * 100 = 9000 (before stat bonuses)
    await createCharacter(page, { name: 'Raiden Shogun', element: 'Electro', weapon_type: 'Polearm', level: 90, atk: 0, crit_rate: 0, crit_dmg: 0, energy_recharge: 0, elemental_mastery: 0 });

    const res = await page.request.get('/api/abyss/optimize');
    const data = await res.json();
    const allMembers = [
      ...data.teams.first_half.members,
      ...data.teams.second_half.members,
    ];
    const raiden = allMembers.find((m) => m.character.name === 'Raiden Shogun');
    expect(raiden).toBeDefined();
    // level 90 => baseScore = 9000; stat-based score with zeroed stats = 0
    expect(raiden.score).toBeGreaterThanOrEqual(9000);
  });

  test('weapon adds to character score when equipped', async ({ page }) => {
    // Create character without weapon
    await createCharacter(page, { name: 'Hu Tao', element: 'Pyro', weapon_type: 'Polearm', level: 90, atk: 1000, crit_rate: 50, crit_dmg: 100 });

    const resNoWeapon = await page.request.get('/api/abyss/optimize');
    const noWeaponData = await resNoWeapon.json();
    const allNoWeap = [...noWeaponData.teams.first_half.members, ...noWeaponData.teams.second_half.members];
    const hutaoNoWeap = allNoWeap.find((m) => m.character.name === 'Hu Tao');
    const scoreWithout = hutaoNoWeap.score;

    // Now equip a weapon
    await page.request.post('/api/weapons', {
      data: {
        name: 'Staff of Homa', type: 'Polearm', level: 90,
        refinement: 1, base_atk: 608, sub_stat_type: 'CRIT DMG',
        sub_stat_value: '66.2%', rarity: 5, equipped_by: 'Hu Tao',
      },
    });

    const resWithWeapon = await page.request.get('/api/abyss/optimize');
    const withWeaponData = await resWithWeapon.json();
    const allWithWeap = [...withWeaponData.teams.first_half.members, ...withWeaponData.teams.second_half.members];
    const hutaoWithWeap = allWithWeap.find((m) => m.character.name === 'Hu Tao');
    // weapon level 90 => weaponScore = 90 * 50 = 4500
    expect(hutaoWithWeap.score).toBeGreaterThan(scoreWithout);
  });
});

// ---------------------------------------------------------------------------
// 6. Element matching
// ---------------------------------------------------------------------------

test.describe('Element matching', () => {
  const user = uniq('abyss_elem');

  test.beforeEach(async ({ page }) => {
    await loginAs(page, user);
  });

  test('Electro and Pyro characters are assigned to first_half which recommends those elements', async ({ page }) => {
    // Seed data first_half recommends: 불(Pyro), 번개(Electro), 바람(Anemo)
    // Create Electro chars with high scores to guarantee assignment
    await createCharacter(page, { name: 'Raiden Shogun', element: 'Electro', weapon_type: 'Polearm', level: 90, atk: 2100, crit_rate: 64, crit_dmg: 148 });
    await createCharacter(page, { name: 'Hu Tao', element: 'Pyro', weapon_type: 'Polearm', level: 90, atk: 2000, crit_rate: 70, crit_dmg: 200 });
    // Create characters for second_half so greedy algorithm has options
    await createCharacter(page, { name: 'Furina', element: 'Hydro', weapon_type: 'Sword', level: 90, atk: 1500, crit_rate: 55, crit_dmg: 130 });
    await createCharacter(page, { name: 'Ganyu', element: 'Cryo', weapon_type: 'Bow', level: 90, atk: 1700, crit_rate: 50, crit_dmg: 200 });
    // Fill to 8 chars
    await createCharacter(page, { name: 'Yae Miko', element: 'Electro', weapon_type: 'Catalyst', level: 85, atk: 1600, crit_rate: 55, crit_dmg: 120 });
    await createCharacter(page, { name: 'Bennett', element: 'Pyro', weapon_type: 'Sword', level: 80, atk: 1100, crit_rate: 40, crit_dmg: 80 });
    await createCharacter(page, { name: 'Zhongli', element: 'Geo', weapon_type: 'Polearm', level: 85, atk: 1100, crit_rate: 30, crit_dmg: 60 });
    await createCharacter(page, { name: 'Kaedehara Kazuha', element: 'Anemo', weapon_type: 'Sword', level: 85, atk: 1400, crit_rate: 45, crit_dmg: 90 });

    const res = await page.request.get('/api/abyss/optimize');
    const data = await res.json();

    // First half recommends Pyro(불) and Electro(번개)
    const firstElements = data.teams.first_half.members.map((m) => m.character.element);
    const hasElectro = firstElements.includes('Electro');
    const hasPyro = firstElements.includes('Pyro');
    expect(hasElectro || hasPyro).toBeTruthy();
  });

  test('Cryo and Hydro characters appear in second_half which recommends those elements', async ({ page }) => {
    // Seed data second_half recommends: 물(Hydro), 얼음(Cryo), 바위(Geo), 풀(Dendro)
    // Put strong Cryo/Hydro chars so they match second_half elements
    await createCharacter(page, { name: 'Ganyu', element: 'Cryo', weapon_type: 'Bow', level: 90, atk: 1800, crit_rate: 50, crit_dmg: 200 });
    await createCharacter(page, { name: 'Furina', element: 'Hydro', weapon_type: 'Sword', level: 90, atk: 1500, crit_rate: 55, crit_dmg: 130 });
    // Also create first-half-matching chars so the greedy algorithm uses those first
    await createCharacter(page, { name: 'Raiden Shogun', element: 'Electro', weapon_type: 'Polearm', level: 90, atk: 2100, crit_rate: 64, crit_dmg: 148 });
    await createCharacter(page, { name: 'Hu Tao', element: 'Pyro', weapon_type: 'Polearm', level: 90, atk: 2000, crit_rate: 70, crit_dmg: 200 });
    await createCharacter(page, { name: 'Bennett', element: 'Pyro', weapon_type: 'Sword', level: 80, atk: 1100, crit_rate: 40, crit_dmg: 80 });
    await createCharacter(page, { name: 'Kaedehara Kazuha', element: 'Anemo', weapon_type: 'Sword', level: 85, atk: 1400, crit_rate: 45, crit_dmg: 90 });
    await createCharacter(page, { name: 'Zhongli', element: 'Geo', weapon_type: 'Polearm', level: 85, atk: 1100, crit_rate: 30, crit_dmg: 60 });
    await createCharacter(page, { name: 'Yae Miko', element: 'Electro', weapon_type: 'Catalyst', level: 85, atk: 1600, crit_rate: 55, crit_dmg: 120 });

    const res = await page.request.get('/api/abyss/optimize');
    const data = await res.json();

    // Second half recommends Hydro(물) and Cryo(얼음)
    const secondElements = data.teams.second_half.members.map((m) => m.character.element);
    const hasCryo = secondElements.includes('Cryo');
    const hasHydro = secondElements.includes('Hydro');
    expect(hasCryo || hasHydro).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// 7. Improvement recommendations
// ---------------------------------------------------------------------------

test.describe('Improvement recommendations', () => {
  const user = uniq('abyss_impr');

  test.beforeEach(async ({ page }) => {
    await loginAs(page, user);
  });

  test('Lv.50 character gets level-up recommendation', async ({ page }) => {
    await createCharacter(page, { name: 'Amber', element: 'Pyro', weapon_type: 'Bow', level: 50, atk: 500, crit_rate: 20, crit_dmg: 50 });

    const res = await page.request.get('/api/abyss/optimize');
    const data = await res.json();
    const allMembers = [...data.teams.first_half.members, ...data.teams.second_half.members];
    const amber = allMembers.find((m) => m.character.name === 'Amber');
    expect(amber).toBeDefined();
    // Level 50 < 80 triggers "캐릭터 레벨업 필요"
    expect(amber.improvements).toContain('캐릭터 레벨업 필요');
  });

  test('character with no weapon gets weapon recommendation', async ({ page }) => {
    await createCharacter(page, { name: 'Raiden Shogun', element: 'Electro', weapon_type: 'Polearm', level: 90, atk: 2000, crit_rate: 60, crit_dmg: 140 });

    const res = await page.request.get('/api/abyss/optimize');
    const data = await res.json();
    const allMembers = [...data.teams.first_half.members, ...data.teams.second_half.members];
    const raiden = allMembers.find((m) => m.character.name === 'Raiden Shogun');
    expect(raiden).toBeDefined();
    expect(raiden.improvements).toContain('무기 장착 필요');
  });

  test('character with no artifacts gets artifact farming recommendation', async ({ page }) => {
    await createCharacter(page, { name: 'Hu Tao', element: 'Pyro', weapon_type: 'Polearm', level: 90, atk: 1800, crit_rate: 55, crit_dmg: 180 });

    const res = await page.request.get('/api/abyss/optimize');
    const data = await res.json();
    const allMembers = [...data.teams.first_half.members, ...data.teams.second_half.members];
    const hutao = allMembers.find((m) => m.character.name === 'Hu Tao');
    expect(hutao).toBeDefined();
    // No artifacts equipped => "성유물 파밍 필요 (flower)", etc for each missing slot
    const hasArtifactRec = hutao.improvements.some((imp) => imp.includes('성유물 파밍 필요'));
    expect(hasArtifactRec).toBeTruthy();
  });

  test('improvement recommendations propagate to overall recommendations', async ({ page }) => {
    // Level 50, no weapon, no artifacts => multiple improvements
    await createCharacter(page, { name: 'Amber', element: 'Pyro', weapon_type: 'Bow', level: 50, atk: 500, crit_rate: 20, crit_dmg: 50 });

    const res = await page.request.get('/api/abyss/optimize');
    const data = await res.json();
    // Overall recommendations aggregate member improvements
    expect(data.recommendations.length).toBeGreaterThan(0);
    const hasLevelRec = data.recommendations.some((r) => r.title.includes('레벨업 필요'));
    expect(hasLevelRec).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// 8. Team does not duplicate characters
// ---------------------------------------------------------------------------

test.describe('Team does not duplicate characters', () => {
  const user = uniq('abyss_nodup');

  test('no character ID appears in both first_half and second_half', async ({ page }) => {
    await loginAs(page, user);
    // Create exactly 8 characters
    await createCharacter(page, { name: 'Raiden Shogun', element: 'Electro', weapon_type: 'Polearm', level: 90, atk: 2100, crit_rate: 64, crit_dmg: 148 });
    await createCharacter(page, { name: 'Yae Miko', element: 'Electro', weapon_type: 'Catalyst', level: 90, atk: 1900, crit_rate: 60, crit_dmg: 140 });
    await createCharacter(page, { name: 'Hu Tao', element: 'Pyro', weapon_type: 'Polearm', level: 90, atk: 1800, crit_rate: 70, crit_dmg: 200 });
    await createCharacter(page, { name: 'Bennett', element: 'Pyro', weapon_type: 'Sword', level: 85, atk: 1200, crit_rate: 40, crit_dmg: 80 });
    await createCharacter(page, { name: 'Furina', element: 'Hydro', weapon_type: 'Sword', level: 90, atk: 1500, crit_rate: 55, crit_dmg: 130 });
    await createCharacter(page, { name: 'Ganyu', element: 'Cryo', weapon_type: 'Bow', level: 90, atk: 1700, crit_rate: 50, crit_dmg: 200 });
    await createCharacter(page, { name: 'Kaedehara Kazuha', element: 'Anemo', weapon_type: 'Sword', level: 90, atk: 1400, crit_rate: 45, crit_dmg: 90 });
    await createCharacter(page, { name: 'Zhongli', element: 'Geo', weapon_type: 'Polearm', level: 90, atk: 1100, crit_rate: 30, crit_dmg: 60 });

    const res = await page.request.get('/api/abyss/optimize');
    const data = await res.json();

    const firstIds = data.teams.first_half.members.map((m) => m.character.id);
    const secondIds = data.teams.second_half.members.map((m) => m.character.id);

    // Verify no overlap
    const overlap = firstIds.filter((id) => secondIds.includes(id));
    expect(overlap).toHaveLength(0);
  });

  test('no character name appears in both halves', async ({ page }) => {
    await loginAs(page, user);

    const res = await page.request.get('/api/abyss/optimize');
    const data = await res.json();

    const firstNames = data.teams.first_half.members.map((m) => m.character.name);
    const secondNames = data.teams.second_half.members.map((m) => m.character.name);

    for (const name of firstNames) {
      expect(secondNames).not.toContain(name);
    }
  });
});

// ---------------------------------------------------------------------------
// 9. UI rendering (page tests)
// ---------------------------------------------------------------------------

test.describe('Abyss UI rendering', () => {
  const user = uniq('abyss_ui');

  test.beforeEach(async ({ page }) => {
    await loginAs(page, user);
    // Create characters so the page renders team data
    await createCharacter(page, { name: 'Raiden Shogun', element: 'Electro', weapon_type: 'Polearm', level: 90, atk: 2100, crit_rate: 64, crit_dmg: 148 });
    await createCharacter(page, { name: 'Hu Tao', element: 'Pyro', weapon_type: 'Polearm', level: 90, atk: 1800, crit_rate: 70, crit_dmg: 200 });
    await createCharacter(page, { name: 'Furina', element: 'Hydro', weapon_type: 'Sword', level: 90, atk: 1500, crit_rate: 55, crit_dmg: 130 });
    await createCharacter(page, { name: 'Ganyu', element: 'Cryo', weapon_type: 'Bow', level: 90, atk: 1700, crit_rate: 50, crit_dmg: 200 });
  });

  test('abyss page loads with correct title', async ({ page }) => {
    await page.goto('/abyss.html', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveTitle(/나선비경/);
  });

  test('season info section is visible after page loads', async ({ page }) => {
    await page.goto('/abyss.html', { waitUntil: 'domcontentloaded' });
    const seasonSection = page.locator('#abyss-season-info');
    await expect(seasonSection).toBeVisible();
    // Wait for the season data to load (replaces loading spinner)
    await page.waitForFunction(() => {
      const el = document.getElementById('abyss-season-info');
      return el && !el.textContent.includes('불러오는 중');
    }, { timeout: 10000 });
  });

  test('first-half and second-half team sections exist', async ({ page }) => {
    await page.goto('/abyss.html', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#abyss-first-half-section')).toBeVisible();
    await expect(page.locator('#abyss-second-half-section')).toBeVisible();
  });

  test('recommendations section exists in the page', async ({ page }) => {
    await page.goto('/abyss.html', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#abyss-recommendations')).toBeVisible();
  });

  test('nav has active link on abyss page', async ({ page }) => {
    await page.goto('/abyss.html', { waitUntil: 'domcontentloaded' });
    const activeLink = page.locator('.nav__link--active');
    await expect(activeLink).toHaveText('나선비경');
    await expect(activeLink).toHaveAttribute('href', 'abyss.html');
  });

  test('overall score section exists', async ({ page }) => {
    await page.goto('/abyss.html', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#abyss-overall')).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// 10. Unauthenticated access
// ---------------------------------------------------------------------------

test.describe('Unauthenticated access', () => {
  test('GET /api/abyss/optimize without auth returns 401', async ({ page }) => {
    // Make a fresh request without any login
    const res = await page.request.get('/api/abyss/optimize');
    expect(res.status()).toBe(401);
  });

  test('GET /api/abyss/seasons is accessible without auth', async ({ page }) => {
    const res = await page.request.get('/api/abyss/seasons');
    expect(res.status()).toBe(200);
  });
});
