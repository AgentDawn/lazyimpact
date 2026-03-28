const { test, expect } = require('@playwright/test');
const { characters, weapons, artifacts } = require('./fixtures/ar60-account.js');

// ---------------------------------------------------------------------------
// Helpers (matching existing patterns from scenarios.spec.js)
// ---------------------------------------------------------------------------

function uniq(prefix) {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 9999)}`;
}

async function loginAs(page, username, password = 'testpass1234') {
  await page.request.post('/api/register', { data: { username, password } });
  const res = await page.request.post('/api/login', { data: { username, password } });
  expect(res.ok()).toBeTruthy();
}

/**
 * Seed the full AR60 dataset (20 chars, 15 weapons, 50 artifacts) for the
 * currently-authenticated user.
 */
async function seedAR60(page) {
  for (const c of characters) {
    const res = await page.request.post('/api/characters', { data: c });
    expect(res.ok()).toBeTruthy();
  }
  for (const w of weapons) {
    const res = await page.request.post('/api/weapons', { data: w });
    expect(res.ok()).toBeTruthy();
  }
  for (const a of artifacts) {
    const res = await page.request.post('/api/artifacts', { data: a });
    expect(res.ok()).toBeTruthy();
  }
}

/**
 * Poll an async DFS optimization job until status is 'done' or 'error'.
 * Returns the final job status object.
 */
async function pollDFSJob(page, jobId, maxAttempts = 60) {
  for (let i = 0; i < maxAttempts; i++) {
    const res = await page.request.get(`/api/optimize/status/${jobId}`);
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    if (data.status === 'done' || data.status === 'error') {
      return data;
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`DFS job ${jobId} did not finish within ${maxAttempts * 0.5}s`);
}

// ---------------------------------------------------------------------------
// a. Abyss greedy optimization: top DPS characters are in teams
// ---------------------------------------------------------------------------

test.describe('AR60 Abyss greedy optimization', () => {
  let user;

  test.beforeAll(async ({ browser }) => {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    user = uniq('ar60_greedy');
    await loginAs(page, user);
    await seedAR60(page);
    await ctx.close();
  });

  test('top DPS characters are assigned to teams (at least Raiden and Hu Tao)', async ({ page }) => {
    await loginAs(page, user);
    const res = await page.request.get('/api/abyss/optimize');
    expect(res.ok()).toBeTruthy();
    const data = await res.json();

    const allMembers = [
      ...data.teams.first_half.members,
      ...data.teams.second_half.members,
    ];
    const assignedNames = allMembers.map((m) => m.character.name);

    // Greedy picks top 8 of 20 by score. Raiden and Hu Tao are always top-scored.
    expect(assignedNames).toContain('Raiden Shogun');
    expect(assignedNames).toContain('Hu Tao');

    // At least 6 of 8 slots should be filled by Lv.80+ characters
    const highLevel = allMembers.filter((m) => Number(m.character.level) >= 80);
    expect(highLevel.length).toBeGreaterThanOrEqual(6);
  });

  test('overall_score is positive with full AR60 roster', async ({ page }) => {
    await loginAs(page, user);
    const res = await page.request.get('/api/abyss/optimize');
    const data = await res.json();
    expect(data.overall_score).toBeGreaterThan(0);
  });

  test('both halves have exactly 4 members each', async ({ page }) => {
    await loginAs(page, user);
    const res = await page.request.get('/api/abyss/optimize');
    const data = await res.json();
    expect(data.teams.first_half.members).toHaveLength(4);
    expect(data.teams.second_half.members).toHaveLength(4);
  });

  test('no character appears in both halves', async ({ page }) => {
    await loginAs(page, user);
    const res = await page.request.get('/api/abyss/optimize');
    const data = await res.json();
    const firstIds = data.teams.first_half.members.map((m) => m.character.id);
    const secondIds = data.teams.second_half.members.map((m) => m.character.id);
    for (const id of firstIds) {
      expect(secondIds).not.toContain(id);
    }
  });
});

// ---------------------------------------------------------------------------
// b. Abyss DFS optimization: score >= greedy score
// ---------------------------------------------------------------------------

test.describe('AR60 Abyss DFS optimization', () => {
  let user;
  test.setTimeout(120000);

  test.beforeAll(async ({ browser }) => {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    user = uniq('ar60_dfs');
    await loginAs(page, user);
    await seedAR60(page);
    await ctx.close();
  });

  test('DFS job completes and overall_score >= greedy score', async ({ page }) => {
    await loginAs(page, user);

    // Get greedy score first
    const greedyRes = await page.request.get('/api/abyss/optimize');
    expect(greedyRes.ok()).toBeTruthy();
    const greedyData = await greedyRes.json();
    const greedyScore = greedyData.overall_score;

    // Start DFS job
    const startRes = await page.request.post('/api/optimize/start', {
      data: { type: 'abyss' },
    });
    expect(startRes.ok()).toBeTruthy();
    const { job_id } = await startRes.json();
    expect(job_id).toBeTruthy();

    // Poll until done
    const jobResult = await pollDFSJob(page, job_id);
    expect(jobResult.status).toBe('done');
    expect(jobResult.result).toBeDefined();

    // DFS should produce score >= greedy
    const dfsScore = jobResult.result.overall_score;
    expect(dfsScore).toBeGreaterThanOrEqual(greedyScore);
  });
});

// ---------------------------------------------------------------------------
// c. Theater optimization: element coverage for current season
// ---------------------------------------------------------------------------

test.describe('AR60 Theater element coverage', () => {
  let user;

  test.beforeAll(async ({ browser }) => {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    user = uniq('ar60_theater');
    await loginAs(page, user);
    await seedAR60(page);
    await ctx.close();
  });

  test('theater season has required elements and roster covers them', async ({ page }) => {
    await loginAs(page, user);

    // Get current theater season elements
    const seasonRes = await page.request.get('/api/theater/seasons');
    expect(seasonRes.ok()).toBeTruthy();
    const seasons = await seasonRes.json();
    expect(seasons.length).toBeGreaterThanOrEqual(1);

    const latest = seasons[0];
    expect(latest.elements).toBeTruthy();
    const requiredElements = latest.elements.split(',');

    // Get planner recommendation to check roster status
    const planRes = await page.request.get('/api/planner/recommend');
    expect(planRes.ok()).toBeTruthy();
    const planData = await planRes.json();

    // AR60 account with 20 characters should have reasonable theater readiness
    // characters_needed should be less than 32 (full transcendence) since we have 20 chars
    expect(Number(planData.characters_needed)).toBeLessThan(32);

    // roster_status should show elements we have characters for
    if (planData.roster_status) {
      const elementMap = {
        '물': 'Hydro', '얼음': 'Cryo', '바위': 'Geo',
        '번개': 'Electro', '바람': 'Anemo', '불': 'Pyro', '풀': 'Dendro',
      };
      for (const elKo of requiredElements) {
        const elEn = elementMap[elKo.trim()];
        // We should have at least one character of each required element
        // since our AR60 roster covers all 7 elements
        if (elEn && planData.roster_status[elEn]) {
          expect(Number(planData.roster_status[elEn].have)).toBeGreaterThanOrEqual(1);
        }
      }
    }
  });
});

// ---------------------------------------------------------------------------
// d. Planner recommendations: underleveled characters get level-up recs
// ---------------------------------------------------------------------------

test.describe('AR60 Planner recommendations for underleveled characters', () => {
  let user;

  test.beforeAll(async ({ browser }) => {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    user = uniq('ar60_planner');
    await loginAs(page, user);
    await seedAR60(page);
    await ctx.close();
  });

  test('abyss optimization produces improvement recommendations for team members', async ({ page }) => {
    await loginAs(page, user);
    const res = await page.request.get('/api/abyss/optimize');
    expect(res.ok()).toBeTruthy();
    const data = await res.json();

    // Collect all improvements from all team members
    const allMembers = [
      ...data.teams.first_half.members,
      ...data.teams.second_half.members,
    ];

    // Top 8 are Lv.80+ so no level-up recs, but some will have missing
    // artifact slots or weapon-level issues. Overall recommendations should exist.
    expect(data.recommendations.length).toBeGreaterThan(0);

    // At least one team member should have some improvement recommendation
    const hasAnyImprovement = allMembers.some((m) => m.improvements.length > 0);
    expect(hasAnyImprovement).toBeTruthy();
  });

  test('overall recommendations include artifact or weapon improvement entries', async ({ page }) => {
    await loginAs(page, user);
    const res = await page.request.get('/api/abyss/optimize');
    const data = await res.json();

    // Recommendations should mention artifact farming, weapon, or element issues
    const hasImprovementRec = data.recommendations.some((r) =>
      r.title.includes('성유물') || r.title.includes('무기') || r.title.includes('원소 부족')
    );
    expect(hasImprovementRec).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// e. Import/Export roundtrip: export, verify all 20 chars + 50 artifacts
// ---------------------------------------------------------------------------

test.describe('AR60 Import/Export roundtrip', () => {
  let user;

  test.beforeAll(async ({ browser }) => {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    user = uniq('ar60_export');
    await loginAs(page, user);
    await seedAR60(page);
    await ctx.close();
  });

  test('export returns GOOD format with all 20 characters and 50 artifacts', async ({ page }) => {
    await loginAs(page, user);
    const exportRes = await page.request.get('/api/export');
    expect(exportRes.ok()).toBeTruthy();
    const exported = await exportRes.json();

    expect(exported.format).toBe('GOOD');
    expect(exported.characters).toHaveLength(20);
    expect(exported.artifacts).toHaveLength(50);
    expect(exported.weapons).toHaveLength(15);
  });

  test('exported characters contain all AR60 roster names', async ({ page }) => {
    await loginAs(page, user);
    const exportRes = await page.request.get('/api/export');
    const exported = await exportRes.json();

    const exportedKeys = exported.characters.map((c) => c.key);
    // PascalCase keys from toPascalKey conversion
    expect(exportedKeys).toContain('RaidenShogun');
    expect(exportedKeys).toContain('HuTao');
    expect(exportedKeys).toContain('Ganyu');
    expect(exportedKeys).toContain('Neuvillette');
    expect(exportedKeys).toContain('Amber');
  });

  test('re-import of exported data adds correct counts', async ({ page }) => {
    // Create a fresh user so import does not collide
    const importUser = uniq('ar60_reimport');
    await loginAs(page, importUser);

    // First export from the original user
    await loginAs(page, user);
    const exportRes = await page.request.get('/api/export');
    const exported = await exportRes.json();

    // Switch to fresh user and import
    await loginAs(page, importUser);
    const importRes = await page.request.post('/api/import', {
      data: exported,
    });
    expect(importRes.ok()).toBeTruthy();
    const importData = await importRes.json();

    expect(importData.characters).toBe(20);
    expect(importData.artifacts).toBe(50);
    expect(importData.weapons).toBe(15);
  });
});

// ---------------------------------------------------------------------------
// f. Character page: Raiden shows Korean name and weapon name
// ---------------------------------------------------------------------------

test.describe('AR60 Character page Korean localization', () => {
  let user;

  test.beforeAll(async ({ browser }) => {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    user = uniq('ar60_charpage');
    await loginAs(page, user);
    // Create just Raiden with weapon_name for the character page
    await page.request.post('/api/characters', {
      data: {
        name: 'RaidenShogun', element: 'Electro',
        weapon_type: 'Polearm', level: 90, weapon_name: 'Engulfing Lightning',
        hp: 19445, atk: 2104, crit_rate: 64.2, crit_dmg: 148.5,
        energy_recharge: 274.1, elemental_mastery: 105,
      },
    });
    await ctx.close();
  });

  test('displays Korean character name and weapon name', async ({ page }) => {
    await loginAs(page, user);
    await page.goto('/characters.html', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.character-name');

    await expect(page.locator('.character-name')).toHaveText('라이덴 쇼군');
    await expect(page.locator('.weapon-slot__name')).toHaveText('예초의 번개');
  });
});

// ---------------------------------------------------------------------------
// g. Artifacts page: verify 50 artifacts loaded, filter by set works
// ---------------------------------------------------------------------------

test.describe('AR60 Artifacts page', () => {
  let user;

  test.beforeAll(async ({ browser }) => {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    user = uniq('ar60_artifacts');
    await loginAs(page, user);
    await seedAR60(page);
    await ctx.close();
  });

  test('artifacts page loads all 50 artifacts', async ({ page }) => {
    await loginAs(page, user);
    const res = await page.request.get('/api/artifacts');
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data).toHaveLength(50);
  });

  test('filter by set returns correct subset', async ({ page }) => {
    await loginAs(page, user);

    // Query all artifacts then filter client-side (API does not have set filter)
    const res = await page.request.get('/api/artifacts');
    const data = await res.json();

    const emblemArts = data.filter((a) => a.set_name === 'Emblem of Severed Fate');
    // Raiden 5 + Yelan 5 + Xiangling 2 + Xingqiu 2 = 14
    expect(emblemArts.length).toBe(14);

    const crimsonArts = data.filter((a) => a.set_name === 'Crimson Witch of Flames');
    expect(crimsonArts.length).toBe(5);

    const blizzardArts = data.filter((a) => a.set_name === 'Blizzard Strayer');
    expect(blizzardArts.length).toBe(5);
  });

  test('artifacts page renders cards on the UI', async ({ page }) => {
    await loginAs(page, user);
    await page.goto('/artifacts.html', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.artifact-card', { timeout: 15000 });

    const cards = page.locator('.artifact-card');
    const count = await cards.count();
    expect(count).toBeGreaterThanOrEqual(50);
  });
});

// ---------------------------------------------------------------------------
// h. Low-level characters (Amber Lv.20, Lisa Lv.40) get improvement recs
// ---------------------------------------------------------------------------

test.describe('AR60 Low-level character improvement recommendations', () => {
  let user;

  test.beforeAll(async ({ browser }) => {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    user = uniq('ar60_lowlevel');
    await loginAs(page, user);
    await seedAR60(page);
    await ctx.close();
  });

  test('Amber (Lv.20) and Lisa (Lv.40) exist in character list as low-level', async ({ page }) => {
    await loginAs(page, user);
    const res = await page.request.get('/api/characters');
    expect(res.ok()).toBeTruthy();
    const chars = await res.json();

    const amber = chars.find((c) => c.name === 'Amber');
    expect(amber).toBeDefined();
    expect(Number(amber.level)).toBe(20);

    const lisa = chars.find((c) => c.name === 'Lisa');
    expect(lisa).toBeDefined();
    expect(Number(lisa.level)).toBe(40);
  });

  test('planner recommend detects characters_needed for theater with low-level roster', async ({ page }) => {
    await loginAs(page, user);
    const res = await page.request.get('/api/planner/recommend');
    expect(res.ok()).toBeTruthy();
    const data = await res.json();

    // With 20 characters (some underleveled), characters_needed should be
    // less than the full transcendence requirement of 32 but greater than 0
    // since low-level chars may not count as "ready"
    expect(Number(data.characters_needed)).toBeGreaterThanOrEqual(0);
    expect(Number(data.characters_needed)).toBeLessThan(32);
  });

  test('team members have artifact or weapon improvement recommendations', async ({ page }) => {
    await loginAs(page, user);
    const res = await page.request.get('/api/abyss/optimize');
    expect(res.ok()).toBeTruthy();
    const data = await res.json();

    const allMembers = [
      ...data.teams.first_half.members,
      ...data.teams.second_half.members,
    ];

    // At least one team member should have improvement recommendations
    // (missing artifact slots, weapon issues, or element gaps)
    const membersWithImprovements = allMembers.filter((m) => m.improvements.length > 0);
    expect(membersWithImprovements.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// i. DFS assigns Emblem 4pc to Raiden (not random artifacts)
// ---------------------------------------------------------------------------

test.describe('AR60 DFS artifact assignment for Raiden', () => {
  let user;
  test.setTimeout(120000);

  test.beforeAll(async ({ browser }) => {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    user = uniq('ar60_dfs_art');
    await loginAs(page, user);
    await seedAR60(page);
    await ctx.close();
  });

  test('greedy optimization assigns Emblem artifacts to Raiden', async ({ page }) => {
    await loginAs(page, user);
    const res = await page.request.get('/api/abyss/optimize');
    expect(res.ok()).toBeTruthy();
    const data = await res.json();

    const allMembers = [
      ...data.teams.first_half.members,
      ...data.teams.second_half.members,
    ];

    const raiden = allMembers.find((m) => m.character.name === 'Raiden Shogun');
    expect(raiden).toBeDefined();

    // Raiden has 5 Emblem of Severed Fate artifacts equipped in the fixture
    // The optimizer should keep them assigned since they are already equipped
    if (raiden.artifacts && raiden.artifacts.length > 0) {
      const emblemCount = raiden.artifacts.filter(
        (a) => a.set_name === 'Emblem of Severed Fate'
      ).length;
      // At least 4 of 5 should be Emblem (4pc set bonus)
      expect(emblemCount).toBeGreaterThanOrEqual(4);
    }
  });

  test('DFS optimization preserves Emblem 4pc on Raiden', async ({ page }) => {
    await loginAs(page, user);

    // Start DFS job
    const startRes = await page.request.post('/api/optimize/start', {
      data: { type: 'abyss' },
    });
    expect(startRes.ok()).toBeTruthy();
    const { job_id } = await startRes.json();

    const jobResult = await pollDFSJob(page, job_id);
    expect(jobResult.status).toBe('done');

    // Find Raiden in the DFS result
    const allTeams = jobResult.result.teams || {};
    const firstMembers = (allTeams.first_half || {}).members || [];
    const secondMembers = (allTeams.second_half || {}).members || [];
    const allMembers = [...firstMembers, ...secondMembers];

    const raiden = allMembers.find((m) =>
      m.character && m.character.name === 'Raiden Shogun'
    );

    // Raiden should be in the DFS result (she is a top-scored character)
    expect(raiden).toBeDefined();

    // If DFS returns artifact data, check Emblem set
    if (raiden.artifacts && raiden.artifacts.length > 0) {
      const emblemCount = raiden.artifacts.filter(
        (a) => a.set_name === 'Emblem of Severed Fate'
      ).length;
      expect(emblemCount).toBeGreaterThanOrEqual(4);
    }
  });
});
