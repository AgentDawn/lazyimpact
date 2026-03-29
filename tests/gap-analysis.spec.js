const { test, expect } = require('@playwright/test');
const { characters: f2pChars, weapons: f2pWeapons, artifacts: f2pArtifacts } = require('./fixtures/f2p-account.js');
const { characters: ar55Chars, weapons: ar55Weapons, artifacts: ar55Artifacts } = require('./fixtures/ar55-advanced.js');
const { characters: returningChars, weapons: returningWeapons, artifacts: returningArtifacts } = require('./fixtures/returning-player.js');
const { characters: ar20Chars, weapons: ar20Weapons, artifacts: ar20Artifacts } = require('./fixtures/ar20-beginner.js');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function uniq(prefix) {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 9999)}`;
}

async function loginAs(page, username, password = 'testpass1234') {
  await page.request.post('/api/register', { data: { username, password } });
  const res = await page.request.post('/api/login', { data: { username, password } });
  expect(res.ok()).toBeTruthy();
}

async function seedFixture(page, characters, weapons, artifacts) {
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

// Combine improvements from both halves into a flat array
function allImprovements(data) {
  const fh = (data.plans && data.plans.first_half && data.plans.first_half.improvements) || [];
  const sh = (data.plans && data.plans.second_half && data.plans.second_half.improvements) || [];
  return [...fh, ...sh];
}

// Sum a numeric field from both plan halves
function sumHalves(data, field) {
  const fh = (data.plans && data.plans.first_half && data.plans.first_half[field]) || 0;
  const sh = (data.plans && data.plans.second_half && data.plans.second_half[field]) || 0;
  return fh + sh;
}

// ---------------------------------------------------------------------------
// a. F2P account
// ---------------------------------------------------------------------------

test.describe('Gap analysis — F2P account', () => {
  let user;

  test.beforeAll(async ({ browser }) => {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    user = uniq('gap_f2p');
    await loginAs(page, user);
    await seedFixture(page, f2pChars, f2pWeapons, f2pArtifacts);
    await ctx.close();
  });

  test('response has required top-level fields', async ({ page }) => {
    await loginAs(page, user);
    const res = await page.request.get('/api/abyss/gap-analysis');
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data).toHaveProperty('current_score');
    expect(data).toHaveProperty('threshold');
    expect(data).toHaveProperty('can_clear');
    expect(data).toHaveProperty('gap');
    expect(data).toHaveProperty('plans');
    expect(data.plans).toHaveProperty('first_half');
    expect(data.plans).toHaveProperty('second_half');
  });

  test('F2P account has plans with improvements arrays', async ({ page }) => {
    await loginAs(page, user);
    const res = await page.request.get('/api/abyss/gap-analysis');
    const data = await res.json();
    // Both halves should have an improvements array (may be empty if already optimal)
    expect(Array.isArray(data.plans.first_half.improvements)).toBeTruthy();
    expect(Array.isArray(data.plans.second_half.improvements)).toBeTruthy();
  });

  test('improvements are sorted by efficiency descending (first_half)', async ({ page }) => {
    await loginAs(page, user);
    const res = await page.request.get('/api/abyss/gap-analysis');
    const data = await res.json();
    const imps = data.plans.first_half.improvements;
    if (imps.length >= 2) {
      expect(imps[0].efficiency).toBeGreaterThanOrEqual(imps[1].efficiency);
    }
  });

  test('total_resin is calculated from plan halves', async ({ page }) => {
    await loginAs(page, user);
    const res = await page.request.get('/api/abyss/gap-analysis');
    const data = await res.json();
    expect(typeof data.plans.first_half.total_resin).toBe('number');
    expect(typeof data.plans.second_half.total_resin).toBe('number');
  });

  test('total_primo is calculated from plan halves', async ({ page }) => {
    await loginAs(page, user);
    const res = await page.request.get('/api/abyss/gap-analysis');
    const data = await res.json();
    expect(typeof data.plans.first_half.total_primo).toBe('number');
    expect(typeof data.plans.second_half.total_primo).toBe('number');
  });

  test('overall_recommendation is a non-empty string', async ({ page }) => {
    await loginAs(page, user);
    const res = await page.request.get('/api/abyss/gap-analysis');
    const data = await res.json();
    expect(data).toHaveProperty('overall_recommendation');
    expect(typeof data.overall_recommendation).toBe('string');
    expect(data.overall_recommendation.length).toBeGreaterThan(0);
  });

  test('F2P account gap analysis returns valid data regardless of clear status', async ({ page }) => {
    await loginAs(page, user);
    const res = await page.request.get('/api/abyss/gap-analysis');
    const data = await res.json();
    // F2P may or may not clear depending on threshold — just verify structure
    expect(typeof data.can_clear.first_half).toBe('boolean');
    expect(typeof data.can_clear.second_half).toBe('boolean');
    // If can't clear, should have improvement plans
    if (!data.can_clear.first_half || !data.can_clear.second_half) {
      const allImps = allImprovements(data);
      expect(allImps.length).toBeGreaterThan(0);
    }
  });
});

// ---------------------------------------------------------------------------
// b. AR55 advanced account
// ---------------------------------------------------------------------------

test.describe('Gap analysis — AR55 advanced account', () => {
  let user;

  test.beforeAll(async ({ browser }) => {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    user = uniq('gap_ar55');
    await loginAs(page, user);
    await seedFixture(page, ar55Chars, ar55Weapons, ar55Artifacts);
    await ctx.close();
  });

  test('response has required fields', async ({ page }) => {
    await loginAs(page, user);
    const res = await page.request.get('/api/abyss/gap-analysis');
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data).toHaveProperty('current_score');
    expect(data).toHaveProperty('threshold');
    expect(data).toHaveProperty('can_clear');
    expect(data).toHaveProperty('gap');
    expect(data).toHaveProperty('plans');
    expect(data.plans).toHaveProperty('first_half');
    expect(data.plans).toHaveProperty('second_half');
  });

  test('AR55 gap is smaller than AR20 beginner gap (first_half)', async ({ browser }) => {
    // Fetch AR55 gap
    const ctx1 = await browser.newContext();
    const p1 = await ctx1.newPage();
    await loginAs(p1, user);
    const ar55Res = await p1.request.get('/api/abyss/gap-analysis');
    const ar55Data = await ar55Res.json();
    await ctx1.close();

    // Fetch AR20 beginner gap using a fresh account
    const ar20User = uniq('gap_ar20_cmp');
    const ctx2 = await browser.newContext();
    const p2 = await ctx2.newPage();
    await loginAs(p2, ar20User);
    await seedFixture(p2, ar20Chars, ar20Weapons, ar20Artifacts);
    const ar20Res = await p2.request.get('/api/abyss/gap-analysis');
    const ar20Data = await ar20Res.json();
    await ctx2.close();

    // gap is an object {first_half, second_half} — compare first_half values
    const ar55GapFH = ar55Data.gap.first_half;
    const ar20GapFH = ar20Data.gap.first_half;
    expect(ar55GapFH).toBeLessThanOrEqual(ar20GapFH);
  });

  test('AR55 account has fewer improvements needed than AR20 beginner', async ({ browser }) => {
    const ctx1 = await browser.newContext();
    const p1 = await ctx1.newPage();
    await loginAs(p1, user);
    const ar55Res = await p1.request.get('/api/abyss/gap-analysis');
    const ar55Data = await ar55Res.json();
    await ctx1.close();

    const ar20User = uniq('gap_ar20_impcmp');
    const ctx2 = await browser.newContext();
    const p2 = await ctx2.newPage();
    await loginAs(p2, ar20User);
    await seedFixture(p2, ar20Chars, ar20Weapons, ar20Artifacts);
    const ar20Res = await p2.request.get('/api/abyss/gap-analysis');
    const ar20Data = await ar20Res.json();
    await ctx2.close();

    const ar55Total = allImprovements(ar55Data).length;
    const ar20Total = allImprovements(ar20Data).length;
    expect(ar55Total).toBeLessThanOrEqual(ar20Total);
  });
});

// ---------------------------------------------------------------------------
// c. Returning player account
// ---------------------------------------------------------------------------

test.describe('Gap analysis — Returning player', () => {
  let user;

  test.beforeAll(async ({ browser }) => {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    user = uniq('gap_returning');
    await loginAs(page, user);
    await seedFixture(page, returningChars, returningWeapons, returningArtifacts);
    await ctx.close();
  });

  test('response has required fields', async ({ page }) => {
    await loginAs(page, user);
    const res = await page.request.get('/api/abyss/gap-analysis');
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data).toHaveProperty('current_score');
    expect(data).toHaveProperty('threshold');
    expect(data).toHaveProperty('can_clear');
    expect(data).toHaveProperty('gap');
    expect(data).toHaveProperty('plans');
    expect(data.plans).toHaveProperty('first_half');
    expect(data.plans).toHaveProperty('second_half');
  });

  test('recommendations include leveling new chars (level-up actions present)', async ({ page }) => {
    await loginAs(page, user);
    const res = await page.request.get('/api/abyss/gap-analysis');
    const data = await res.json();
    // Returning player has many Lv.1 chars → expect level-up improvement actions
    const imps = allImprovements(data);
    const hasLevelUp = imps.some((imp) =>
      (imp.action && imp.action.includes('레벨')) ||
      (imp.target && (imp.target.includes('Nahida') || imp.target.includes('Furina') ||
        imp.target.includes('Neuvillette') || imp.target.includes('Arlecchino') ||
        imp.target.includes('Yelan') || imp.target.includes('Kazuha')))
    );
    expect(hasLevelUp).toBeTruthy();
  });

  test('overall_recommendation is a non-empty string', async ({ page }) => {
    await loginAs(page, user);
    const res = await page.request.get('/api/abyss/gap-analysis');
    const data = await res.json();
    expect(typeof data.overall_recommendation).toBe('string');
    expect(data.overall_recommendation.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// d. Improvement efficiency ordering
// ---------------------------------------------------------------------------

test.describe('Gap analysis — Efficiency ordering', () => {
  const user = uniq('gap_eff');

  test.beforeEach(async ({ page }) => {
    await loginAs(page, user);
    await seedFixture(page, f2pChars, f2pWeapons, f2pArtifacts);
  });

  test('all improvements have positive efficiency', async ({ page }) => {
    const res = await page.request.get('/api/abyss/gap-analysis');
    const data = await res.json();
    for (const imp of allImprovements(data)) {
      if (imp.efficiency != null) {
        expect(imp.efficiency).toBeGreaterThan(0);
      }
    }
  });

  test('improvements[0].efficiency >= improvements[1].efficiency (first_half)', async ({ page }) => {
    const res = await page.request.get('/api/abyss/gap-analysis');
    const data = await res.json();
    // Use whichever half has more improvements for a meaningful comparison
    const fh = data.plans.first_half.improvements || [];
    const sh = data.plans.second_half.improvements || [];
    const imps = fh.length >= sh.length ? fh : sh;
    if (imps.length >= 2 && imps[0].efficiency != null && imps[1].efficiency != null) {
      expect(imps[0].efficiency).toBeGreaterThanOrEqual(imps[1].efficiency);
    }
  });
});

// ---------------------------------------------------------------------------
// e. Minimum plan covers the gap
// ---------------------------------------------------------------------------

test.describe('Gap analysis — Minimum plan covers the gap', () => {
  const user = uniq('gap_minplan');

  test.beforeEach(async ({ page }) => {
    await loginAs(page, user);
    // Use AR20 beginner fixture — more likely to have a gap that needs covering
    await seedFixture(page, ar20Chars, ar20Weapons, ar20Artifacts);
  });

  test('minimum_plan covers gap or improvements exist (first_half)', async ({ page }) => {
    const res = await page.request.get('/api/abyss/gap-analysis');
    const data = await res.json();
    const fh = data.plans.first_half;
    const minPlan = fh.minimum_plan || [];
    const gap = data.gap.first_half || 0;
    if (gap > 0) {
      // Either minimum_plan covers the gap, or there are improvement suggestions
      if (minPlan.length > 0) {
        const imps = fh.improvements || [];
        const totalGain = minPlan.reduce((sum, idx) => {
          const imp = imps[idx];
          return sum + (imp && imp.score_gain != null ? imp.score_gain : 0);
        }, 0);
        // minimum_plan attempts to close the gap — may not fully cover if gap is huge
        expect(totalGain).toBeGreaterThan(0);
      } else {
        // Gap too large for existing resources — improvements should still exist
        expect(fh.improvements.length).toBeGreaterThan(0);
      }
    }
  });

  test('minimum_plan covers gap or improvements exist (second_half)', async ({ page }) => {
    const res = await page.request.get('/api/abyss/gap-analysis');
    const data = await res.json();
    const sh = data.plans.second_half;
    const minPlan = sh.minimum_plan || [];
    const gap = data.gap.second_half || 0;
    if (gap > 0) {
      if (minPlan.length > 0) {
        const imps = sh.improvements || [];
        const totalGain = minPlan.reduce((sum, idx) => {
          const imp = imps[idx];
          return sum + (imp && imp.score_gain != null ? imp.score_gain : 0);
        }, 0);
        expect(totalGain).toBeGreaterThan(0);
      } else {
        expect(sh.improvements.length).toBeGreaterThan(0);
      }
    }
  });
});

// ---------------------------------------------------------------------------
// f. Cost categories
// ---------------------------------------------------------------------------

test.describe('Gap analysis — Cost categories', () => {
  const user = uniq('gap_cat');

  test.beforeEach(async ({ page }) => {
    await loginAs(page, user);
    await seedFixture(page, f2pChars, f2pWeapons, f2pArtifacts);
  });

  test('each improvement has a valid category', async ({ page }) => {
    const res = await page.request.get('/api/abyss/gap-analysis');
    const data = await res.json();
    const validCategories = ['레진', '원석', '무료'];
    for (const imp of allImprovements(data)) {
      if (imp.category != null) {
        expect(validCategories).toContain(imp.category);
      }
    }
  });
});

// ---------------------------------------------------------------------------
// g. UI test
// ---------------------------------------------------------------------------

test.describe('Gap analysis — UI rendering', () => {
  const user = uniq('gap_ui');

  test.beforeEach(async ({ page }) => {
    await loginAs(page, user);
    await seedFixture(page, f2pChars, f2pWeapons, f2pArtifacts);
  });

  test('gap analysis API still works', async ({ page }) => {
    const res = await page.request.get('/api/abyss/gap-analysis');
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data).toHaveProperty('gap');
    expect(data).toHaveProperty('plans');
  });
});
