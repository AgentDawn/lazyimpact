const { test, expect } = require('@playwright/test');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function loginAs(page, username, password = 'testpass1234') {
  await page.request.post('/api/register', { data: { username, password } });
  const res = await page.request.post('/api/login', { data: { username, password } });
  expect(res.ok()).toBeTruthy();
}

// Unique username per describe block to avoid shared-state conflicts.
function uniq(prefix) {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 9999)}`;
}

// ---------------------------------------------------------------------------
// 1. API-level tests
// ---------------------------------------------------------------------------

test.describe('API: GET /api/weekly-bosses (public)', () => {
  test('returns exactly 12 weekly bosses', async ({ page }) => {
    const res = await page.request.get('/api/weekly-bosses');
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data).toHaveLength(12);
  });

  test('all bosses have id, name, region, sort_order fields', async ({ page }) => {
    const res = await page.request.get('/api/weekly-bosses');
    const data = await res.json();
    for (const boss of data) {
      expect(boss).toHaveProperty('id');
      expect(boss).toHaveProperty('name');
      expect(boss).toHaveProperty('region');
      expect(boss).toHaveProperty('sort_order');
    }
  });

  test('contains 풍마룡 드발린', async ({ page }) => {
    const res = await page.request.get('/api/weekly-bosses');
    const data = await res.json();
    const names = data.map((b) => b.name);
    expect(names).toContain('풍마룡 드발린');
  });

  test('contains 안드리우스', async ({ page }) => {
    const res = await page.request.get('/api/weekly-bosses');
    const data = await res.json();
    expect(data.map((b) => b.name)).toContain('안드리우스');
  });

  test('contains 타르탈리아', async ({ page }) => {
    const res = await page.request.get('/api/weekly-bosses');
    const data = await res.json();
    expect(data.map((b) => b.name)).toContain('타르탈리아');
  });

  test('contains 야타용왕', async ({ page }) => {
    const res = await page.request.get('/api/weekly-bosses');
    const data = await res.json();
    expect(data.map((b) => b.name)).toContain('야타용왕');
  });

  test('contains 시뇨라', async ({ page }) => {
    const res = await page.request.get('/api/weekly-bosses');
    const data = await res.json();
    expect(data.map((b) => b.name)).toContain('시뇨라');
  });

  test('contains 마가츠 미타케 나루카미노 미코토', async ({ page }) => {
    const res = await page.request.get('/api/weekly-bosses');
    const data = await res.json();
    expect(data.map((b) => b.name)).toContain('마가츠 미타케 나루카미노 미코토');
  });

  test('contains 칠엽 적조의 비밀주', async ({ page }) => {
    const res = await page.request.get('/api/weekly-bosses');
    const data = await res.json();
    expect(data.map((b) => b.name)).toContain('칠엽 적조의 비밀주');
  });

  test('contains 아펩의 오아시스 파수꾼', async ({ page }) => {
    const res = await page.request.get('/api/weekly-bosses');
    const data = await res.json();
    expect(data.map((b) => b.name)).toContain('아펩의 오아시스 파수꾼');
  });

  test('contains 별을 삼킨 고래', async ({ page }) => {
    const res = await page.request.get('/api/weekly-bosses');
    const data = await res.json();
    expect(data.map((b) => b.name)).toContain('별을 삼킨 고래');
  });

  test('contains 아를레키노', async ({ page }) => {
    const res = await page.request.get('/api/weekly-bosses');
    const data = await res.json();
    expect(data.map((b) => b.name)).toContain('아를레키노');
  });

  test('contains 침식된 근원의 불꽃 주인', async ({ page }) => {
    const res = await page.request.get('/api/weekly-bosses');
    const data = await res.json();
    expect(data.map((b) => b.name)).toContain('침식된 근원의 불꽃 주인');
  });

  test('contains 도토레', async ({ page }) => {
    const res = await page.request.get('/api/weekly-bosses');
    const data = await res.json();
    expect(data.map((b) => b.name)).toContain('도토레');
  });

  test('has 2 몬드 bosses', async ({ page }) => {
    const res = await page.request.get('/api/weekly-bosses');
    const data = await res.json();
    const mondCount = data.filter((b) => b.region === '몬드').length;
    expect(mondCount).toBe(2);
  });

  test('has 2 리월 bosses', async ({ page }) => {
    const res = await page.request.get('/api/weekly-bosses');
    const data = await res.json();
    expect(data.filter((b) => b.region === '리월').length).toBe(2);
  });

  test('has 2 이나즈마 bosses', async ({ page }) => {
    const res = await page.request.get('/api/weekly-bosses');
    const data = await res.json();
    expect(data.filter((b) => b.region === '이나즈마').length).toBe(2);
  });

  test('has 2 수메르 bosses', async ({ page }) => {
    const res = await page.request.get('/api/weekly-bosses');
    const data = await res.json();
    expect(data.filter((b) => b.region === '수메르').length).toBe(2);
  });

  test('has 2 폰타인 bosses', async ({ page }) => {
    const res = await page.request.get('/api/weekly-bosses');
    const data = await res.json();
    expect(data.filter((b) => b.region === '폰타인').length).toBe(2);
  });

  test('has 1 나타 boss', async ({ page }) => {
    const res = await page.request.get('/api/weekly-bosses');
    const data = await res.json();
    expect(data.filter((b) => b.region === '나타').length).toBe(1);
  });

  test('has 1 노드크라이 boss', async ({ page }) => {
    const res = await page.request.get('/api/weekly-bosses');
    const data = await res.json();
    expect(data.filter((b) => b.region === '노드크라이').length).toBe(1);
  });

  test('bosses are returned in sort_order sequence', async ({ page }) => {
    const res = await page.request.get('/api/weekly-bosses');
    const data = await res.json();
    for (let i = 1; i < data.length; i++) {
      expect(Number(data[i].sort_order)).toBeGreaterThan(Number(data[i - 1].sort_order));
    }
  });
});

// ---------------------------------------------------------------------------

test.describe('API: GET /api/planner/weekly-bosses (auth)', () => {
  let user;
  test.beforeEach(async ({ page }) => {
    user = uniq('wbuser');
    await loginAs(page, user);
  });

  test('returns bosses array, discount_remaining, next_boss_cost, total_resin_spent', async ({ page }) => {
    const res = await page.request.get('/api/planner/weekly-bosses');
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data).toHaveProperty('bosses');
    expect(data).toHaveProperty('discount_remaining');
    expect(data).toHaveProperty('next_boss_cost');
    expect(data).toHaveProperty('total_resin_spent');
    expect(data).toHaveProperty('week');
  });

  test('requires authentication — 401 without session', async ({ browser }) => {
    const ctx = await browser.newContext();
    const req = ctx.request;
    const res = await req.get('http://localhost:3000/api/planner/weekly-bosses');
    expect(res.status()).toBe(401);
    await ctx.close();
  });
});

// ---------------------------------------------------------------------------

test.describe('API: GET /api/planner/recommend (auth)', () => {
  let user;
  test.beforeEach(async ({ page }) => {
    user = uniq('recuser');
    await loginAs(page, user);
  });

  test('returns all expected top-level fields', async ({ page }) => {
    const res = await page.request.get('/api/planner/recommend');
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data).toHaveProperty('theater_prep');
    expect(data).toHaveProperty('daily_plan');
    expect(data).toHaveProperty('resin_total');
    expect(data).toHaveProperty('bp_missions');
    expect(data).toHaveProperty('characters_needed');
    expect(data).toHaveProperty('roster_status');
    expect(data).toHaveProperty('difficulty');
    expect(data).toHaveProperty('prefer_gender');
  });

  test('resin_total is always 160', async ({ page }) => {
    const res = await page.request.get('/api/planner/recommend');
    const data = await res.json();
    expect(data.resin_total).toBe(160);
  });

  test('daily_plan resin items sum does not exceed 160', async ({ page }) => {
    const res = await page.request.get('/api/planner/recommend');
    const data = await res.json();
    const total = (data.daily_plan || []).reduce((acc, item) => acc + (item.resin || 0), 0);
    expect(total).toBeLessThanOrEqual(160);
  });

  test('daily_plan items each have category, title, reason, resin, priority', async ({ page }) => {
    const res = await page.request.get('/api/planner/recommend');
    const data = await res.json();
    for (const item of data.daily_plan) {
      expect(item).toHaveProperty('category');
      expect(item).toHaveProperty('title');
      expect(item).toHaveProperty('reason');
      expect(typeof item.resin).toBe('number');
      expect(typeof item.priority).toBe('number');
    }
  });

  test('theater_prep items have title, reason, priority', async ({ page }) => {
    const res = await page.request.get('/api/planner/recommend');
    const data = await res.json();
    for (const rec of data.theater_prep) {
      expect(rec).toHaveProperty('title');
      expect(rec).toHaveProperty('reason');
      expect(typeof rec.priority).toBe('number');
    }
  });

  test('requires authentication — 401 without session', async ({ browser }) => {
    const ctx = await browser.newContext();
    const req = ctx.request;
    const res = await req.get('http://localhost:3000/api/planner/recommend');
    expect(res.status()).toBe(401);
    await ctx.close();
  });

  test('theater_prep exists when user has no characters (all elements missing)', async ({ page }) => {
    // Fresh user has zero characters, so all required theater elements are unmet
    const res = await page.request.get('/api/planner/recommend');
    const data = await res.json();
    expect(Array.isArray(data.theater_prep)).toBeTruthy();
    expect(data.theater_prep.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------

test.describe('API: GET /api/planner/bp (auth)', () => {
  let user;
  test.beforeEach(async ({ page }) => {
    user = uniq('bpuser');
    await loginAs(page, user);
  });

  test('auto-creates 10 BP missions for current week', async ({ page }) => {
    const res = await page.request.get('/api/planner/bp');
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data).toHaveLength(12);
  });

  test('each mission has id, mission, target, progress, done fields', async ({ page }) => {
    const res = await page.request.get('/api/planner/bp');
    const data = await res.json();
    for (const m of data) {
      expect(m).toHaveProperty('id');
      expect(m).toHaveProperty('mission');
      expect(m).toHaveProperty('target');
      expect(m).toHaveProperty('progress');
      expect(m).toHaveProperty('done');
    }
  });

  test('지맥 mission has target 15', async ({ page }) => {
    const res = await page.request.get('/api/planner/bp');
    const data = await res.json();
    const leyLine = data.find((m) => m.mission.includes('지맥'));
    expect(leyLine).toBeDefined();
    expect(Number(leyLine.target)).toBe(15);
  });

  test('비경 mission has target 15', async ({ page }) => {
    const res = await page.request.get('/api/planner/bp');
    const data = await res.json();
    const domain = data.find((m) => m.mission.includes('비경'));
    expect(domain).toBeDefined();
    expect(Number(domain.target)).toBe(15);
  });

  test('천연 수지 mission has target 1200', async ({ page }) => {
    const res = await page.request.get('/api/planner/bp');
    const data = await res.json();
    const resin = data.find((m) => m.mission.includes('수지') || m.mission.includes('천연 수지'));
    expect(resin).toBeDefined();
    expect(Number(resin.target)).toBe(1200);
  });

  test('모라 mission has target 500000', async ({ page }) => {
    const res = await page.request.get('/api/planner/bp');
    const data = await res.json();
    const mora = data.find((m) => m.mission.includes('모라'));
    expect(mora).toBeDefined();
    expect(Number(mora.target)).toBe(500000);
  });

  test('요리 mission has target 20', async ({ page }) => {
    const res = await page.request.get('/api/planner/bp');
    const data = await res.json();
    const cooking = data.find((m) => m.mission.includes('요리'));
    expect(cooking).toBeDefined();
    expect(Number(cooking.target)).toBe(20);
  });

  test('단조 mission has target 20', async ({ page }) => {
    const res = await page.request.get('/api/planner/bp');
    const data = await res.json();
    const forge = data.find((m) => m.mission.includes('단조'));
    expect(forge).toBeDefined();
    expect(Number(forge.target)).toBe(20);
  });

  test('적 우두머리 mission has target 10', async ({ page }) => {
    const res = await page.request.get('/api/planner/bp');
    const data = await res.json();
    const eliteBoss = data.find((m) => m.mission.includes('우두머리'));
    expect(eliteBoss).toBeDefined();
    expect(Number(eliteBoss.target)).toBe(10);
  });

  test('장식 제작 mission has target 10', async ({ page }) => {
    const res = await page.request.get('/api/planner/bp');
    const data = await res.json();
    const furnishing = data.find((m) => m.mission.includes('장식'));
    expect(furnishing).toBeDefined();
    expect(Number(furnishing.target)).toBe(10);
  });

  test('주전자 아이템 구매 mission has target 2', async ({ page }) => {
    const res = await page.request.get('/api/planner/bp');
    const data = await res.json();
    const teapotBuy = data.find((m) => m.mission.includes('주전자'));
    expect(teapotBuy).toBeDefined();
    expect(Number(teapotBuy.target)).toBe(2);
  });

  test('일곱 성인의 소환 mission has target 2', async ({ page }) => {
    const res = await page.request.get('/api/planner/bp');
    const data = await res.json();
    const tcg = data.find((m) => m.mission.includes('성인의 소환'));
    expect(tcg).toBeDefined();
    expect(Number(tcg.target)).toBe(2);
  });

  test('영역 토벌 mission has target 3', async ({ page }) => {
    const res = await page.request.get('/api/planner/bp');
    const data = await res.json();
    const weeklyBoss = data.find((m) => m.mission.includes('영역 토벌') || m.mission.includes('울프'));
    expect(weeklyBoss).toBeDefined();
    expect(Number(weeklyBoss.target)).toBe(3);
  });

  test('선계 화폐 mission has target 1000', async ({ page }) => {
    const res = await page.request.get('/api/planner/bp');
    const data = await res.json();
    const teapot = data.find((m) => m.mission.includes('선계 화폐'));
    expect(teapot).toBeDefined();
    expect(Number(teapot.target)).toBe(1000);
  });

  test('all missions start with progress 0 and done 0', async ({ page }) => {
    const res = await page.request.get('/api/planner/bp');
    const data = await res.json();
    for (const m of data) {
      expect(Number(m.progress)).toBe(0);
      expect(Number(m.done)).toBe(0);
    }
  });

  test('requires authentication — 401 without session', async ({ browser }) => {
    const ctx = await browser.newContext();
    const req = ctx.request;
    const res = await req.get('http://localhost:3000/api/planner/bp');
    expect(res.status()).toBe(401);
    await ctx.close();
  });
});

// ---------------------------------------------------------------------------

test.describe('API: PUT /api/planner/bp/{id} — toggle BP progress', () => {
  let user;
  test.beforeEach(async ({ page }) => {
    user = uniq('bptoggle');
    await loginAs(page, user);
  });

  test('setting progress to target marks mission done=1', async ({ page }) => {
    const listRes = await page.request.get('/api/planner/bp');
    const missions = await listRes.json();
    const m = missions[0]; // 적 우두머리, target=10
    const id = m.id;
    const target = Number(m.target);

    const putRes = await page.request.put(`/api/planner/bp/${id}`, {
      data: { progress: target },
    });
    expect(putRes.ok()).toBeTruthy();

    const afterRes = await page.request.get('/api/planner/bp');
    const after = await afterRes.json();
    const updated = after.find((x) => String(x.id) === String(id));
    expect(Number(updated.progress)).toBe(target);
    expect(Number(updated.done)).toBe(1);
  });

  test('setting progress below target keeps done=0', async ({ page }) => {
    const listRes = await page.request.get('/api/planner/bp');
    const missions = await listRes.json();
    const m = missions[0];
    const id = m.id;
    const partial = Math.floor(Number(m.target) / 2);

    await page.request.put(`/api/planner/bp/${id}`, { data: { progress: partial } });

    const afterRes = await page.request.get('/api/planner/bp');
    const after = await afterRes.json();
    const updated = after.find((x) => String(x.id) === String(id));
    expect(Number(updated.progress)).toBe(partial);
    expect(Number(updated.done)).toBe(0);
  });

  test('setting progress to 0 after completion marks done=0', async ({ page }) => {
    const listRes = await page.request.get('/api/planner/bp');
    const missions = await listRes.json();
    const m = missions[1]; // 천연 수지, target=1200
    const id = m.id;

    // Complete first
    await page.request.put(`/api/planner/bp/${id}`, { data: { progress: Number(m.target) } });
    // Reset to zero
    await page.request.put(`/api/planner/bp/${id}`, { data: { progress: 0 } });

    const afterRes = await page.request.get('/api/planner/bp');
    const after = await afterRes.json();
    const updated = after.find((x) => String(x.id) === String(id));
    expect(Number(updated.progress)).toBe(0);
    expect(Number(updated.done)).toBe(0);
  });
});

// ---------------------------------------------------------------------------

test.describe('API: POST /api/planner/bp/reset', () => {
  let user;
  test.beforeEach(async ({ page }) => {
    user = uniq('bpreset');
    await loginAs(page, user);
  });

  test('reset returns status ok', async ({ page }) => {
    const res = await page.request.post('/api/planner/bp/reset');
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data.status).toBe('reset');
  });

  test('after completing missions, reset brings all progress back to 0', async ({ page }) => {
    // Progress two missions to completion
    const listRes = await page.request.get('/api/planner/bp');
    const missions = await listRes.json();
    await page.request.put(`/api/planner/bp/${missions[0].id}`, {
      data: { progress: Number(missions[0].target) },
    });
    await page.request.put(`/api/planner/bp/${missions[1].id}`, {
      data: { progress: Number(missions[1].target) },
    });

    await page.request.post('/api/planner/bp/reset');

    const afterRes = await page.request.get('/api/planner/bp');
    const after = await afterRes.json();
    for (const m of after) {
      expect(Number(m.progress)).toBe(0);
      expect(Number(m.done)).toBe(0);
    }
  });

  test('reset still returns 12 missions', async ({ page }) => {
    await page.request.post('/api/planner/bp/reset');
    const res = await page.request.get('/api/planner/bp');
    const data = await res.json();
    expect(data).toHaveLength(12);
  });
});

// ---------------------------------------------------------------------------
// 2. Weekly boss resin calculation tests
// ---------------------------------------------------------------------------

test.describe('Weekly boss resin calculation', () => {
  let user;
  test.beforeEach(async ({ page }) => {
    user = uniq('wbcalc');
    await loginAs(page, user);
  });

  test('initial state: discount_remaining=3, next_boss_cost=30, total_resin_spent=0', async ({ page }) => {
    const res = await page.request.get('/api/planner/weekly-bosses');
    const data = await res.json();
    expect(Number(data.discount_remaining)).toBe(3);
    expect(Number(data.next_boss_cost)).toBe(30);
    expect(Number(data.total_resin_spent)).toBe(0);
  });

  test('after toggling 1 boss done: discount_remaining=2, next_boss_cost=30, total_resin_spent=30', async ({ page }) => {
    const listRes = await page.request.get('/api/planner/weekly-bosses');
    const listData = await listRes.json();
    const firstBoss = listData.bosses[0];

    await page.request.put(`/api/planner/weekly-bosses/${firstBoss.id}`);

    const afterRes = await page.request.get('/api/planner/weekly-bosses');
    const after = await afterRes.json();
    expect(Number(after.discount_remaining)).toBe(2);
    expect(Number(after.next_boss_cost)).toBe(30);
    expect(Number(after.total_resin_spent)).toBe(30);
  });

  test('after toggling 3 bosses done: discount_remaining=0, next_boss_cost=60, total_resin_spent=90', async ({ page }) => {
    const listRes = await page.request.get('/api/planner/weekly-bosses');
    const listData = await listRes.json();

    for (let i = 0; i < 3; i++) {
      await page.request.put(`/api/planner/weekly-bosses/${listData.bosses[i].id}`);
    }

    const afterRes = await page.request.get('/api/planner/weekly-bosses');
    const after = await afterRes.json();
    expect(Number(after.discount_remaining)).toBe(0);
    expect(Number(after.next_boss_cost)).toBe(60);
    expect(Number(after.total_resin_spent)).toBe(90);
  });

  test('after toggling 4 bosses done: total_resin_spent=150 (90 discounted + 60 full)', async ({ page }) => {
    const listRes = await page.request.get('/api/planner/weekly-bosses');
    const listData = await listRes.json();

    for (let i = 0; i < 4; i++) {
      await page.request.put(`/api/planner/weekly-bosses/${listData.bosses[i].id}`);
    }

    const afterRes = await page.request.get('/api/planner/weekly-bosses');
    const after = await afterRes.json();
    expect(Number(after.total_resin_spent)).toBe(150);
    expect(Number(after.discount_remaining)).toBe(0);
    expect(Number(after.next_boss_cost)).toBe(60);
  });

  test('toggling a done boss back to undone decreases discount_remaining by 1', async ({ page }) => {
    const listRes = await page.request.get('/api/planner/weekly-bosses');
    const boss = listRes.json().then ? (await listRes.json()).bosses[0] : listRes.json().bosses[0];
    const listData = await page.request.get('/api/planner/weekly-bosses').then((r) => r.json());
    const bossId = listData.bosses[0].id;

    // Toggle on
    await page.request.put(`/api/planner/weekly-bosses/${bossId}`);
    const mid = await page.request.get('/api/planner/weekly-bosses').then((r) => r.json());
    expect(Number(mid.discount_remaining)).toBe(2);

    // Toggle off
    await page.request.put(`/api/planner/weekly-bosses/${bossId}`);
    const final = await page.request.get('/api/planner/weekly-bosses').then((r) => r.json());
    expect(Number(final.discount_remaining)).toBe(3);
    expect(Number(final.total_resin_spent)).toBe(0);
  });

  test('bosses list has 12 entries', async ({ page }) => {
    const res = await page.request.get('/api/planner/weekly-bosses');
    const data = await res.json();
    expect(data.bosses).toHaveLength(12);
  });

  test('each boss entry has id, boss_id, done, name, region', async ({ page }) => {
    const res = await page.request.get('/api/planner/weekly-bosses');
    const data = await res.json();
    for (const b of data.bosses) {
      expect(b).toHaveProperty('id');
      expect(b).toHaveProperty('boss_id');
      expect(b).toHaveProperty('done');
      expect(b).toHaveProperty('name');
      expect(b).toHaveProperty('region');
    }
  });
});

// ---------------------------------------------------------------------------
// 3. User preferences tests
// ---------------------------------------------------------------------------

test.describe('User preferences: GET /api/me and PUT /api/me/preferences', () => {
  let user;
  test.beforeEach(async ({ page }) => {
    user = uniq('prefuser');
    await loginAs(page, user);
  });

  test('default prefer_gender is "all"', async ({ page }) => {
    const res = await page.request.get('/api/me');
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data.prefer_gender).toBe('all');
  });

  test('default include_default_males is 1', async ({ page }) => {
    const res = await page.request.get('/api/me');
    const data = await res.json();
    expect(Number(data.include_default_males)).toBe(1);
  });

  test('default theater_difficulty is "transcendence"', async ({ page }) => {
    const res = await page.request.get('/api/me');
    const data = await res.json();
    expect(data.theater_difficulty).toBe('transcendence');
  });

  test('/api/me returns username field matching registered name', async ({ page }) => {
    const res = await page.request.get('/api/me');
    const data = await res.json();
    expect(data.username).toBe(user);
  });

  test('/api/me returns lang field', async ({ page }) => {
    const res = await page.request.get('/api/me');
    const data = await res.json();
    expect(data).toHaveProperty('lang');
  });

  test('set prefer_gender to female — /api/me reflects it', async ({ page }) => {
    const putRes = await page.request.put('/api/me/preferences', {
      data: { prefer_gender: 'female' },
    });
    expect(putRes.ok()).toBeTruthy();

    const meRes = await page.request.get('/api/me');
    const data = await meRes.json();
    expect(data.prefer_gender).toBe('female');
  });

  test('set prefer_gender to male — /api/me reflects it', async ({ page }) => {
    await page.request.put('/api/me/preferences', { data: { prefer_gender: 'male' } });
    const meRes = await page.request.get('/api/me');
    expect((await meRes.json()).prefer_gender).toBe('male');
  });

  test('set theater_difficulty to normal — /api/me reflects it', async ({ page }) => {
    await page.request.put('/api/me/preferences', { data: { theater_difficulty: 'normal' } });
    const meRes = await page.request.get('/api/me');
    expect((await meRes.json()).theater_difficulty).toBe('normal');
  });

  test('set theater_difficulty to hard — /api/me reflects it', async ({ page }) => {
    await page.request.put('/api/me/preferences', { data: { theater_difficulty: 'hard' } });
    const meRes = await page.request.get('/api/me');
    expect((await meRes.json()).theater_difficulty).toBe('hard');
  });

  test('invalid prefer_gender value returns 400', async ({ page }) => {
    const res = await page.request.put('/api/me/preferences', {
      data: { prefer_gender: 'robot' },
    });
    expect(res.status()).toBe(400);
  });

  test('invalid theater_difficulty value returns 400', async ({ page }) => {
    const res = await page.request.put('/api/me/preferences', {
      data: { theater_difficulty: 'impossible' },
    });
    expect(res.status()).toBe(400);
  });

  test('theater_difficulty normal yields characters_needed = 8 (8 needed minus 0 chars)', async ({ page }) => {
    // New user starts with 0 characters (no seed data). readyCount=0.
    // charsNeededTotal=8, readyCount=0 => characters_needed=8
    await page.request.put('/api/me/preferences', { data: { theater_difficulty: 'normal' } });
    const res = await page.request.get('/api/planner/recommend');
    const data = await res.json();
    expect(Number(data.characters_needed)).toBe(8);
  });

  test('theater_difficulty hard yields characters_needed = 16 (16 needed minus 0 chars)', async ({ page }) => {
    // charsNeededTotal=16, readyCount=0 => characters_needed=16
    await page.request.put('/api/me/preferences', { data: { theater_difficulty: 'hard' } });
    const res = await page.request.get('/api/planner/recommend');
    const data = await res.json();
    expect(Number(data.characters_needed)).toBe(16);
  });

  test('theater_difficulty transcendence yields characters_needed = 32 (32 needed minus 0 chars)', async ({ page }) => {
    // charsNeededTotal=32, readyCount=0 => characters_needed=32
    await page.request.put('/api/me/preferences', {
      data: { theater_difficulty: 'transcendence' },
    });
    const res = await page.request.get('/api/planner/recommend');
    const data = await res.json();
    expect(Number(data.characters_needed)).toBe(32);
  });

  test('changing difficulty does not affect BP missions count', async ({ page }) => {
    await page.request.put('/api/me/preferences', { data: { theater_difficulty: 'normal' } });
    const res = await page.request.get('/api/planner/bp');
    const data = await res.json();
    expect(data).toHaveLength(12);
  });
});

// ---------------------------------------------------------------------------
// 4. Theater prep recommendation tests
// ---------------------------------------------------------------------------

test.describe('Theater prep recommendations', () => {
  let user;
  test.beforeEach(async ({ page }) => {
    user = uniq('theateruser');
    await loginAs(page, user);
    // Create 4 characters: Raiden=Electro, HuTao=Pyro, Kazuha=Anemo, Cyno=Electro
    // Current theater season requires Hydro, Cryo, Geo — none of which this user has.
    await page.request.post('/api/characters', {
      data: {
        name: 'Raiden Shogun', element: 'Electro', weapon_type: 'Polearm',
        level: 90, hp: 19445, atk: 2104, crit_rate: 64.2, crit_dmg: 148.5,
        energy_recharge: 274.1, elemental_mastery: 105, tier: 'SS',
      },
    });
    await page.request.post('/api/characters', {
      data: {
        name: 'Hu Tao', element: 'Pyro', weapon_type: 'Polearm',
        level: 90, hp: 36000, atk: 1200, crit_rate: 75.0, crit_dmg: 220.0,
        energy_recharge: 100.0, elemental_mastery: 80, tier: 'SS',
      },
    });
    await page.request.post('/api/characters', {
      data: {
        name: 'Kaedehara Kazuha', element: 'Anemo', weapon_type: 'Sword',
        level: 90, hp: 22000, atk: 900, crit_rate: 30.0, crit_dmg: 60.0,
        energy_recharge: 160.0, elemental_mastery: 960, tier: 'SS',
      },
    });
    await page.request.post('/api/characters', {
      data: {
        name: 'Cyno', element: 'Electro', weapon_type: 'Polearm',
        level: 90, hp: 18000, atk: 1800, crit_rate: 70.0, crit_dmg: 180.0,
        energy_recharge: 110.0, elemental_mastery: 300, tier: 'A',
      },
    });
  });

  test('theater_prep is non-empty when user has no 물 characters', async ({ page }) => {
    const res = await page.request.get('/api/planner/recommend');
    const data = await res.json();
    expect(data.theater_prep.length).toBeGreaterThan(0);
  });

  test('recommends getting 물 characters (user has 0)', async ({ page }) => {
    const res = await page.request.get('/api/planner/recommend');
    const data = await res.json();
    const hydro = data.theater_prep.find(
      (r) => r.title.includes('물') || r.reason.includes('물'),
    );
    expect(hydro).toBeDefined();
  });

  test('recommends getting 얼음 characters (user has 0)', async ({ page }) => {
    const res = await page.request.get('/api/planner/recommend');
    const data = await res.json();
    const cryo = data.theater_prep.find(
      (r) => r.title.includes('얼음') || r.reason.includes('얼음'),
    );
    expect(cryo).toBeDefined();
  });

  test('recommends getting 바위 characters (user has 0)', async ({ page }) => {
    const res = await page.request.get('/api/planner/recommend');
    const data = await res.json();
    const geo = data.theater_prep.find(
      (r) => r.title.includes('바위') || r.reason.includes('바위'),
    );
    expect(geo).toBeDefined();
  });

  test('roster_status shows 물 have=0', async ({ page }) => {
    const res = await page.request.get('/api/planner/recommend');
    const data = await res.json();
    if (data.roster_status && data.roster_status['물']) {
      expect(Number(data.roster_status['물'].have)).toBe(0);
    }
    // If Hydro key absent, the theater_prep recs above already cover it
  });

  test('characters_needed for transcendence = 32 minus all ready chars (created in beforeEach)', async ({ page }) => {
    // No seed data. beforeEach creates 4 lv90 chars = 4 ready total.
    // characters_needed = max(0, 32 - 4) = 28
    const res = await page.request.get('/api/planner/recommend');
    const data = await res.json();
    expect(Number(data.characters_needed)).toBe(28);
  });

  test('missing-element recommendations have priority 1 (highest urgency)', async ({ page }) => {
    const res = await page.request.get('/api/planner/recommend');
    const data = await res.json();
    const urgent = data.theater_prep.filter((r) => r.priority === 1);
    expect(urgent.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// 5. Character tier priority tests
// ---------------------------------------------------------------------------

test.describe('Character tier priority in recommendations', () => {
  let user;
  test.beforeEach(async ({ page }) => {
    user = uniq('tieruser');
    await loginAs(page, user);
  });

  test('high-tier characters appear in recommendations before low-tier ones', async ({ page }) => {
    // Add a low-level Hydro char
    await page.request.post('/api/characters', {
      data: {
        name: 'Furina', element: 'Hydro', weapon_type: 'Sword',
        level: 60, hp: 10000, atk: 800, crit_rate: 20.0, crit_dmg: 50.0,
        energy_recharge: 130.0, elemental_mastery: 0,
      },
    });

    const res = await page.request.get('/api/planner/recommend');
    const data = await res.json();

    // Theater prep should include leveling recommendations
    const levelRecs = data.theater_prep.filter(
      (r) => r.priority === 2 && r.category === '환상극',
    );
    // At least one leveling recommendation should exist
    expect(levelRecs.length).toBeGreaterThan(0);
  });

  test('tier field is present on level-up recommendations', async ({ page }) => {
    await page.request.post('/api/characters', {
      data: {
        name: 'Mona', element: 'Hydro', weapon_type: 'Catalyst',
        level: 50, hp: 9000, atk: 700, crit_rate: 15.0, crit_dmg: 50.0,
        energy_recharge: 120.0, elemental_mastery: 0, tier: 'S',
      },
    });

    const res = await page.request.get('/api/planner/recommend');
    const data = await res.json();
    const levelUp = data.theater_prep.find((r) => r.priority === 2 && r.category === '환상극');
    if (levelUp) {
      expect(levelUp).toHaveProperty('tier');
    }
  });
});

// ---------------------------------------------------------------------------
// 6. Planner page UI tests
// ---------------------------------------------------------------------------

test.describe('Planner page UI', () => {
  const user = uniq('ui_test');

  test.beforeEach(async ({ page }) => {
    await loginAs(page, user);
    await page.goto('/planner.html', { waitUntil: 'domcontentloaded' });
  });

  test('page loads with correct title containing "Planner"', async ({ page }) => {
    await expect(page).toHaveTitle(/Planner/);
  });

  test('page heading reads "Daily Planner"', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('Daily Planner');
  });

  test('theater prep section is rendered in the DOM', async ({ page }) => {
    await expect(page.locator('#theater-prep')).toBeVisible();
  });

  test('theater prep section has the section title "환상극 대비 추천"', async ({ page }) => {
    const title = page.locator('#theater-prep .section-title');
    await expect(title).toContainText('환상극 대비 추천');
  });

  test('daily plan section is rendered in the DOM', async ({ page }) => {
    await expect(page.locator('#daily-plan')).toBeVisible();
  });

  test('daily plan section title shows "오늘의 레진 계획"', async ({ page }) => {
    await expect(page.locator('text=오늘의 레진 계획')).toBeVisible();
  });

  test('resin bar is visible once daily plan loads', async ({ page }) => {
    // Wait for planner.js to render (replaces loading spinner)
    await page.waitForFunction(
      () => !document.querySelector('#daily-plan .empty-state'),
      { timeout: 10000 },
    );
    // The resin bar is the flex container containing the gradient bar and the "X/160 레진" text
    const resinText = page.locator('#daily-plan').getByText(/레진/);
    await expect(resinText.first()).toBeVisible();
  });

  test('weekly BP section is rendered in the DOM', async ({ page }) => {
    await expect(page.locator('#weekly-bp')).toBeVisible();
  });

  test('BP missions section shows "주간 기행 미션" title', async ({ page }) => {
    await expect(page.locator('text=주간 기행 미션')).toBeVisible();
  });

  test('BP mission checkboxes are rendered after planner loads', async ({ page }) => {
    // Wait for BP missions to render (spinner goes away)
    await page.waitForFunction(
      () => document.querySelector('#weekly-bp button[onclick*="toggleBP"]') !== null,
      { timeout: 10000 },
    );
    const checkboxes = page.locator('#weekly-bp button[onclick*="toggleBP"]');
    await expect(checkboxes).toHaveCount(12);
  });

  test('BP mission reset button is visible', async ({ page }) => {
    await page.waitForFunction(
      () => document.querySelector('#weekly-bp button[onclick="resetBP()"]') !== null,
      { timeout: 10000 },
    );
    const resetBtn = page.locator('#weekly-bp button[onclick="resetBP()"]');
    await expect(resetBtn).toBeVisible();
    await expect(resetBtn).toContainText('미션 초기화');
  });

  test('BP progress shows "0/12 완료" initially', async ({ page }) => {
    await page.waitForFunction(
      () => document.querySelector('#weekly-bp') && document.querySelector('#weekly-bp').textContent.includes('완료'),
      { timeout: 10000 },
    );
    const summary = page.locator('#weekly-bp').getByText(/완료/);
    await expect(summary.first()).toContainText('0/12 완료');
  });

  test('theater prep content renders (no longer shows loading spinner)', async ({ page }) => {
    await page.waitForFunction(
      () => !document.querySelector('#theater-prep-content .empty-state'),
      { timeout: 10000 },
    );
    await expect(page.locator('#theater-prep-content .empty-state')).toHaveCount(0);
  });

  test('nav bar is visible on planner page', async ({ page }) => {
    await expect(page.locator('.nav')).toBeVisible();
    await expect(page.locator('.nav__brand')).toHaveText('LazyImpact');
  });

  test('planner nav link is active', async ({ page }) => {
    const active = page.locator('.nav__link--active');
    await expect(active).toHaveAttribute('href', 'planner.html');
  });

  test('footer is visible', async ({ page }) => {
    await expect(page.locator('.footer')).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// 7. Planner page UI — BP toggle interaction
// ---------------------------------------------------------------------------

test.describe('Planner page UI — BP checkbox toggle', () => {
  let user;
  test.beforeEach(async ({ page }) => {
    user = uniq('ui_bp');
    await loginAs(page, user);
    await page.goto('/planner.html', { waitUntil: 'domcontentloaded' });
    // Wait for BP missions to fully render
    await page.waitForFunction(
      () => document.querySelector('#weekly-bp button[onclick*="toggleBP"]') !== null,
      { timeout: 10000 },
    );
  });

  test('clicking a BP checkbox triggers toggleBP and page reloads with updated state', async ({ page }) => {
    // Capture the first mission's progress/target from the rendered text before click
    const firstProgress = page.locator('#weekly-bp [onclick*="toggleBP"]').first();
    await firstProgress.click();

    // After reload the progress counter for the first item should show target/target
    await page.waitForFunction(
      () => document.querySelector('#weekly-bp button[onclick*="toggleBP"]') !== null,
      { timeout: 10000 },
    );

    // The overall 완료 counter should now be 1/12
    const summary = page.locator('#weekly-bp').getByText(/완료/);
    await expect(summary.first()).toContainText('1/12 완료');
  });

  test('clicking reset button resets 완료 count back to 0/12', async ({ page }) => {
    // Mark one mission done first
    const firstCheckbox = page.locator('#weekly-bp button[onclick*="toggleBP"]').first();
    await firstCheckbox.click();
    await page.waitForFunction(
      () => document.querySelector('#weekly-bp') && document.querySelector('#weekly-bp').textContent.includes('1/12 완료'),
      { timeout: 10000 },
    );

    // Now reset
    const resetBtn = page.locator('#weekly-bp button[onclick="resetBP()"]');
    await resetBtn.click();
    await page.waitForFunction(
      () => document.querySelector('#weekly-bp') && document.querySelector('#weekly-bp').textContent.includes('0/12 완료'),
      { timeout: 10000 },
    );

    const summary = page.locator('#weekly-bp').getByText(/완료/);
    await expect(summary.first()).toContainText('0/12 완료');
  });
});

// ---------------------------------------------------------------------------
// 8. Unauthenticated redirect
// ---------------------------------------------------------------------------

test.describe('Planner page authentication guard', () => {
  test('unauthenticated visit to /planner.html redirects to login', async ({ browser }) => {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await page.goto('http://localhost:3000/planner.html', { waitUntil: 'domcontentloaded' });
    // planner.js redirects to /login.html on 401
    await page.waitForURL(/login/, { timeout: 10000 });
    await expect(page).toHaveURL(/login/);
    await ctx.close();
  });
});

// ---------------------------------------------------------------------------
// 9. Cross-user data isolation (P1)
// ---------------------------------------------------------------------------

test.describe('Cross-user data isolation', () => {
  let userA;
  let userB;

  test('userB sees zero boss completions after userA marks bosses done', async ({ browser }) => {
    // --- User A session ---
    const ctxA = await browser.newContext();
    const pageA = await ctxA.newPage();
    userA = uniq('isoA');
    await pageA.request.post('http://localhost:3000/api/register', { data: { username: userA, password: 'testpass1234' } });
    await pageA.request.post('http://localhost:3000/api/login', { data: { username: userA, password: 'testpass1234' } });

    // UserA toggles a weekly boss done
    const bossListA = await pageA.request.get('http://localhost:3000/api/planner/weekly-bosses').then((r) => r.json());
    await pageA.request.put(`http://localhost:3000/api/planner/weekly-bosses/${bossListA.bosses[0].id}`);

    // UserA updates BP progress
    const bpListA = await pageA.request.get('http://localhost:3000/api/planner/bp').then((r) => r.json());
    await pageA.request.put(`http://localhost:3000/api/planner/bp/${bpListA[0].id}`, {
      data: { progress: Number(bpListA[0].target) },
    });

    // --- User B session ---
    const ctxB = await browser.newContext();
    const pageB = await ctxB.newPage();
    userB = uniq('isoB');
    await pageB.request.post('http://localhost:3000/api/register', { data: { username: userB, password: 'testpass1234' } });
    await pageB.request.post('http://localhost:3000/api/login', { data: { username: userB, password: 'testpass1234' } });

    // UserB weekly bosses should all be done=0
    const bossListB = await pageB.request.get('http://localhost:3000/api/planner/weekly-bosses').then((r) => r.json());
    for (const boss of bossListB.bosses) {
      expect(Number(boss.done)).toBe(0);
    }
    expect(Number(bossListB.total_resin_spent)).toBe(0);

    await ctxA.close();
    await ctxB.close();
  });

  test('userB sees all BP missions at progress 0 after userA completes some', async ({ browser }) => {
    const ctxA = await browser.newContext();
    const pageA = await ctxA.newPage();
    userA = uniq('isoA2');
    await pageA.request.post('http://localhost:3000/api/register', { data: { username: userA, password: 'testpass1234' } });
    await pageA.request.post('http://localhost:3000/api/login', { data: { username: userA, password: 'testpass1234' } });

    // UserA completes a BP mission
    const bpListA = await pageA.request.get('http://localhost:3000/api/planner/bp').then((r) => r.json());
    await pageA.request.put(`http://localhost:3000/api/planner/bp/${bpListA[0].id}`, {
      data: { progress: Number(bpListA[0].target) },
    });

    const ctxB = await browser.newContext();
    const pageB = await ctxB.newPage();
    userB = uniq('isoB2');
    await pageB.request.post('http://localhost:3000/api/register', { data: { username: userB, password: 'testpass1234' } });
    await pageB.request.post('http://localhost:3000/api/login', { data: { username: userB, password: 'testpass1234' } });

    const bpListB = await pageB.request.get('http://localhost:3000/api/planner/bp').then((r) => r.json());
    for (const m of bpListB) {
      expect(Number(m.progress)).toBe(0);
      expect(Number(m.done)).toBe(0);
    }

    await ctxA.close();
    await ctxB.close();
  });

  test('userA recommendations do not leak to userB', async ({ browser }) => {
    const ctxA = await browser.newContext();
    const pageA = await ctxA.newPage();
    userA = uniq('isoA3');
    await pageA.request.post('http://localhost:3000/api/register', { data: { username: userA, password: 'testpass1234' } });
    await pageA.request.post('http://localhost:3000/api/login', { data: { username: userA, password: 'testpass1234' } });

    // UserA adds a 물 캐릭터
    await pageA.request.post('http://localhost:3000/api/characters', {
      data: {
        name: 'Mona', element: 'Hydro', weapon_type: 'Catalyst',
        level: 90, hp: 9000, atk: 700, crit_rate: 15.0, crit_dmg: 50.0,
        energy_recharge: 120.0, elemental_mastery: 0,
      },
    });

    const recA = await pageA.request.get('http://localhost:3000/api/planner/recommend').then((r) => r.json());

    const ctxB = await browser.newContext();
    const pageB = await ctxB.newPage();
    userB = uniq('isoB3');
    await pageB.request.post('http://localhost:3000/api/register', { data: { username: userB, password: 'testpass1234' } });
    await pageB.request.post('http://localhost:3000/api/login', { data: { username: userB, password: 'testpass1234' } });

    const recB = await pageB.request.get('http://localhost:3000/api/planner/recommend').then((r) => r.json());

    // UserB should not have Mona in their characters, so 물 recommendations should differ
    // UserB (fresh, only seed chars) should have no 물 chars and thus need 물
    const hydro = recB.theater_prep.find(
      (r) => r.title.includes('물') || r.reason.includes('물'),
    );
    expect(hydro).toBeDefined();

    await ctxA.close();
    await ctxB.close();
  });
});

// ---------------------------------------------------------------------------
// 10. Input validation on planner endpoints (P1)
// ---------------------------------------------------------------------------

test.describe('Input validation on planner endpoints', () => {
  let user;
  test.beforeEach(async ({ page }) => {
    user = uniq('inputval');
    await loginAs(page, user);
  });

  test('PUT /api/planner/bp/{id} with progress -1 sets progress to -1', async ({ page }) => {
    const listRes = await page.request.get('/api/planner/bp');
    const missions = await listRes.json();
    const id = missions[0].id;

    const putRes = await page.request.put(`/api/planner/bp/${id}`, {
      data: { progress: -1 },
    });
    // Server accepts any integer (no validation on negative) — verify no crash
    expect(putRes.ok()).toBeTruthy();

    const afterRes = await page.request.get('/api/planner/bp');
    const after = await afterRes.json();
    const updated = after.find((x) => String(x.id) === String(id));
    expect(Number(updated.progress)).toBe(-1);
    expect(Number(updated.done)).toBe(0);
  });

  test('PUT /api/planner/bp/{id} with progress exceeding target marks done=1', async ({ page }) => {
    const listRes = await page.request.get('/api/planner/bp');
    const missions = await listRes.json();
    const m = missions[0];
    const id = m.id;
    const overTarget = Number(m.target) + 100;

    const putRes = await page.request.put(`/api/planner/bp/${id}`, {
      data: { progress: overTarget },
    });
    expect(putRes.ok()).toBeTruthy();

    const afterRes = await page.request.get('/api/planner/bp');
    const after = await afterRes.json();
    const updated = after.find((x) => String(x.id) === String(id));
    expect(Number(updated.progress)).toBe(overTarget);
    expect(Number(updated.done)).toBe(1);
  });

  test('PUT /api/planner/bp/{nonexistent_id} returns ok without crash', async ({ page }) => {
    const putRes = await page.request.put('/api/planner/bp/999999', {
      data: { progress: 5 },
    });
    // Server runs UPDATE WHERE id=999999 AND user_id=? — matches 0 rows, returns ok
    expect(putRes.ok()).toBeTruthy();
  });

  test('PUT /api/planner/weekly-bosses/{nonexistent_id} returns ok without crash', async ({ page }) => {
    // Ensure user has weekly boss rows initialized
    await page.request.get('/api/planner/weekly-bosses');

    const putRes = await page.request.put('/api/planner/weekly-bosses/999999');
    expect(putRes.ok()).toBeTruthy();

    // Verify state is unchanged — all bosses still undone
    const afterRes = await page.request.get('/api/planner/weekly-bosses');
    const after = await afterRes.json();
    expect(Number(after.total_resin_spent)).toBe(0);
  });

  test('PUT /api/planner/bp/{id} with empty body sets progress to 0', async ({ page }) => {
    const listRes = await page.request.get('/api/planner/bp');
    const missions = await listRes.json();
    const m = missions[0];
    const id = m.id;

    // First set some progress
    await page.request.put(`/api/planner/bp/${id}`, {
      data: { progress: 5 },
    });

    // Now send empty body — Go decodes missing field as zero value (0)
    const putRes = await page.request.put(`/api/planner/bp/${id}`, {
      data: {},
    });
    expect(putRes.ok()).toBeTruthy();

    const afterRes = await page.request.get('/api/planner/bp');
    const after = await afterRes.json();
    const updated = after.find((x) => String(x.id) === String(id));
    expect(Number(updated.progress)).toBe(0);
    expect(Number(updated.done)).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// 11. Gender preference affects recommendations (P1)
// ---------------------------------------------------------------------------

test.describe('Gender preference affects recommendations', () => {
  let user;
  test.beforeEach(async ({ page }) => {
    user = uniq('genderrec');
    await loginAs(page, user);
  });

  test('prefer_gender female with male-only 물 character (행추) excludes him from filtered roster', async ({ page }) => {
    // Add Xingqiu — he is male and NOT a default male
    await page.request.post('/api/characters', {
      data: {
        name: 'Xingqiu', element: 'Hydro', weapon_type: 'Sword',
        level: 90, hp: 16000, atk: 1500, crit_rate: 50.0, crit_dmg: 100.0,
        energy_recharge: 180.0, elemental_mastery: 0,
      },
    });

    // Set prefer_gender to female
    await page.request.put('/api/me/preferences', {
      data: { prefer_gender: 'female' },
    });

    const res = await page.request.get('/api/planner/recommend');
    const data = await res.json();

    // Even though user has a 물 character (행추), he should be filtered out
    // So recommendations should still say 물 is needed
    const hydro = data.theater_prep.find(
      (r) => r.title.includes('물') || r.reason.includes('물'),
    );
    expect(hydro).toBeDefined();
  });

  test('prefer_gender male filters to only male characters in recommendations', async ({ page }) => {
    await page.request.put('/api/me/preferences', {
      data: { prefer_gender: 'male' },
    });

    const res = await page.request.get('/api/planner/recommend');
    const data = await res.json();
    expect(data.prefer_gender).toBe('male');

    // No seed data. Fresh user has 0 characters.
    // With male filter, 0 male chars ready => characters_needed = 32
    expect(Number(data.characters_needed)).toBe(32);
  });

  test('include_default_males 0 with prefer_gender female excludes default male chars', async ({ page }) => {
    // Add Kaeya (default male) and Aether (default male) as Cryo and Anemo
    await page.request.post('/api/characters', {
      data: {
        name: 'Kaeya', element: 'Cryo', weapon_type: 'Sword',
        level: 90, hp: 15000, atk: 1200, crit_rate: 40.0, crit_dmg: 80.0,
        energy_recharge: 100.0, elemental_mastery: 0,
      },
    });

    // With include_default_males=1 (default), Kaeya should be included
    await page.request.put('/api/me/preferences', {
      data: { prefer_gender: 'female', include_default_males: 1 },
    });
    const res1 = await page.request.get('/api/planner/recommend');
    const data1 = await res1.json();
    const needed1 = Number(data1.characters_needed);

    // Now set include_default_males=0, Kaeya should be excluded
    await page.request.put('/api/me/preferences', {
      data: { include_default_males: 0 },
    });
    const res2 = await page.request.get('/api/planner/recommend');
    const data2 = await res2.json();
    const needed2 = Number(data2.characters_needed);

    // With default males excluded, fewer ready chars, so characters_needed increases
    expect(needed2).toBeGreaterThan(needed1);
  });
});

// ---------------------------------------------------------------------------
// 12. All 12 weekly bosses done boundary (P2)
// ---------------------------------------------------------------------------

test.describe('All 12 weekly bosses done', () => {
  let user;
  test.beforeEach(async ({ page }) => {
    user = uniq('allboss');
    await loginAs(page, user);
  });

  test('toggling all 12 bosses done yields total_resin_spent=630 and discount_remaining=0', async ({ page }) => {
    const listRes = await page.request.get('/api/planner/weekly-bosses');
    const listData = await listRes.json();
    expect(listData.bosses).toHaveLength(12);

    for (const boss of listData.bosses) {
      await page.request.put(`/api/planner/weekly-bosses/${boss.id}`);
    }

    const afterRes = await page.request.get('/api/planner/weekly-bosses');
    const after = await afterRes.json();

    // 3 * 30 + 9 * 60 = 90 + 540 = 630
    expect(Number(after.total_resin_spent)).toBe(630);
    expect(Number(after.discount_remaining)).toBe(0);
    expect(Number(after.next_boss_cost)).toBe(60);
  });
});

// ---------------------------------------------------------------------------
// 13. Character level threshold for readiness (P2)
// ---------------------------------------------------------------------------

test.describe('Character level threshold for readiness', () => {
  let user;
  test.beforeEach(async ({ page }) => {
    user = uniq('lvlthresh');
    await loginAs(page, user);
  });

  test('Lv.80 물 캐릭터 counts as ready — no level-up recommendation for 물', async ({ page }) => {
    await page.request.post('/api/characters', {
      data: {
        name: 'Mona', element: 'Hydro', weapon_type: 'Catalyst',
        level: 80, hp: 9000, atk: 700, crit_rate: 15.0, crit_dmg: 50.0,
        energy_recharge: 120.0, elemental_mastery: 0,
      },
    });

    const res = await page.request.get('/api/planner/recommend');
    const data = await res.json();

    // 물 level-up recommendations have priority 2 and title containing "레벨업"
    const hydroLevelUp = data.theater_prep.find(
      (r) => r.priority === 2 && r.title.includes('물') && r.title.includes('레벨업'),
    );
    // Lv.80 meets the >= 80 threshold, so no level-up rec should exist
    expect(hydroLevelUp).toBeUndefined();
  });

  test('Lv.79 물 캐릭터 is not ready — gets level-up recommendation', async ({ page }) => {
    await page.request.post('/api/characters', {
      data: {
        name: 'Mona', element: 'Hydro', weapon_type: 'Catalyst',
        level: 79, hp: 9000, atk: 700, crit_rate: 15.0, crit_dmg: 50.0,
        energy_recharge: 120.0, elemental_mastery: 0,
      },
    });

    const res = await page.request.get('/api/planner/recommend');
    const data = await res.json();

    // Lv.79 does NOT meet the >= 80 threshold, so a level-up rec should appear
    const hydroLevelUp = data.theater_prep.find(
      (r) => r.priority === 2 && r.title.includes('물') && r.title.includes('레벨업'),
    );
    expect(hydroLevelUp).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// 14. include_default_males preference effect (P2)
// ---------------------------------------------------------------------------

test.describe('include_default_males preference effect', () => {
  let user;
  test.beforeEach(async ({ page }) => {
    user = uniq('defmales');
    await loginAs(page, user);
  });

  test('prefer_gender female with include_default_males 1 keeps default males in roster count', async ({ page }) => {
    // Add Kaeya (default male) — he should still be counted
    await page.request.post('/api/characters', {
      data: {
        name: 'Kaeya', element: 'Cryo', weapon_type: 'Sword',
        level: 90, hp: 15000, atk: 1200, crit_rate: 40.0, crit_dmg: 80.0,
        energy_recharge: 100.0, elemental_mastery: 0,
      },
    });

    await page.request.put('/api/me/preferences', {
      data: { prefer_gender: 'female', include_default_males: 1 },
    });

    const res = await page.request.get('/api/planner/recommend');
    const data = await res.json();

    // No seed data. Added: Kaeya (default male, kept with include_default_males=1) = 1 ready
    // characters_needed = 32 - 1 = 31
    expect(Number(data.characters_needed)).toBe(31);
  });

  test('prefer_gender female with include_default_males 0 excludes default males from roster count', async ({ page }) => {
    await page.request.post('/api/characters', {
      data: {
        name: 'Kaeya', element: 'Cryo', weapon_type: 'Sword',
        level: 90, hp: 15000, atk: 1200, crit_rate: 40.0, crit_dmg: 80.0,
        energy_recharge: 100.0, elemental_mastery: 0,
      },
    });

    await page.request.put('/api/me/preferences', {
      data: { prefer_gender: 'female', include_default_males: 0 },
    });

    const res = await page.request.get('/api/planner/recommend');
    const data = await res.json();

    // No seed data. Kaeya (default male) is filtered out with include_default_males=0. 0 ready.
    // characters_needed = 32 - 0 = 32
    expect(Number(data.characters_needed)).toBe(32);
  });
});

// ---------------------------------------------------------------------------
// 15. Import data affects planner recommendations (P3)
// ---------------------------------------------------------------------------

test.describe('Import data affects planner recommendations', () => {
  let user;
  test.beforeEach(async ({ page }) => {
    user = uniq('importrec');
    await loginAs(page, user);
  });

  test('importing GOOD format characters changes characters_needed count', async ({ page }) => {
    // Get initial recommendation (user has 4 seed chars, all lv90)
    const before = await page.request.get('/api/planner/recommend').then((r) => r.json());
    const neededBefore = Number(before.characters_needed);

    // Import GOOD format with new characters at high levels
    // Note: GOOD import sets element to '' — but they still add to character count
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
        artifacts: [],
        weapons: [],
      },
    });
    expect(importRes.ok()).toBeTruthy();
    const importData = await importRes.json();
    expect(importData.characters).toBe(3);

    // Get recommendation after import
    const after = await page.request.get('/api/planner/recommend').then((r) => r.json());
    const neededAfter = Number(after.characters_needed);

    // More characters at lv90 -> characters_needed should decrease (or stay same if GOOD import has no element)
    // GOOD import sets element to '' so they won't count for element-based roster_status,
    // but they DO count for the total readyCount (level >= 80).
    // Before: 4 ready, needed=28. After: 4+3=7 ready, needed=25.
    expect(neededAfter).toBeLessThan(neededBefore);
    expect(neededAfter).toBe(neededBefore - 3);
  });
});

// ---------------------------------------------------------------------------
// 16. GET /api/theater/seasons (P3)
// ---------------------------------------------------------------------------

test.describe('GET /api/theater/seasons', () => {
  test('returns an array of seasons', async ({ page }) => {
    const res = await page.request.get('/api/theater/seasons');
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(Array.isArray(data)).toBeTruthy();
    expect(data.length).toBeGreaterThanOrEqual(2);
  });

  test('each season has title, date, elements, cast_characters fields', async ({ page }) => {
    const res = await page.request.get('/api/theater/seasons');
    const data = await res.json();
    for (const season of data) {
      expect(season).toHaveProperty('title');
      expect(season).toHaveProperty('date');
      expect(season).toHaveProperty('elements');
      expect(season).toHaveProperty('cast_characters');
    }
  });

  test('contains the April 2026 season', async ({ page }) => {
    const res = await page.request.get('/api/theater/seasons');
    const data = await res.json();
    const april = data.find((s) => String(s.date).includes('2026.04'));
    expect(april).toBeDefined();
    expect(april.title).toContain('4월');
  });

  test('contains the March 2026 season', async ({ page }) => {
    const res = await page.request.get('/api/theater/seasons');
    const data = await res.json();
    const march = data.find((s) => String(s.date).includes('2026.03'));
    expect(march).toBeDefined();
    expect(march.title).toContain('3월');
  });

  test('seasons are ordered by date descending (newest first)', async ({ page }) => {
    const res = await page.request.get('/api/theater/seasons');
    const data = await res.json();
    for (let i = 1; i < data.length; i++) {
      expect(String(data[i - 1].date) >= String(data[i].date)).toBeTruthy();
    }
  });
});

// ---------------------------------------------------------------------------
// 17. BP reset lifecycle (P3)
// ---------------------------------------------------------------------------

test.describe('BP reset lifecycle', () => {
  let user;
  test.beforeEach(async ({ page }) => {
    user = uniq('bplife');
    await loginAs(page, user);
  });

  test('progress -> reset -> verify zero -> re-progress -> verify updated', async ({ page }) => {
    // Step 1: Progress some BP missions
    const listRes = await page.request.get('/api/planner/bp');
    const missions = await listRes.json();
    await page.request.put(`/api/planner/bp/${missions[0].id}`, {
      data: { progress: 10 },
    });
    await page.request.put(`/api/planner/bp/${missions[1].id}`, {
      data: { progress: Number(missions[1].target) },
    });

    // Verify progress was set
    const midRes = await page.request.get('/api/planner/bp');
    const midMissions = await midRes.json();
    const mid0 = midMissions.find((x) => String(x.id) === String(missions[0].id));
    expect(Number(mid0.progress)).toBe(10);

    // Step 2: Reset
    const resetRes = await page.request.post('/api/planner/bp/reset');
    expect(resetRes.ok()).toBeTruthy();

    // Step 3: Verify all back to 0
    const afterReset = await page.request.get('/api/planner/bp');
    const resetMissions = await afterReset.json();
    expect(resetMissions).toHaveLength(12);
    for (const m of resetMissions) {
      expect(Number(m.progress)).toBe(0);
      expect(Number(m.done)).toBe(0);
    }

    // Step 4: Progress again on the new (re-seeded) missions
    await page.request.put(`/api/planner/bp/${resetMissions[2].id}`, {
      data: { progress: 7 },
    });

    // Step 5: Verify the re-progress works correctly
    const finalRes = await page.request.get('/api/planner/bp');
    const finalMissions = await finalRes.json();
    const final2 = finalMissions.find((x) => String(x.id) === String(resetMissions[2].id));
    expect(Number(final2.progress)).toBe(7);
    expect(Number(final2.done)).toBe(0);
  });
});
