const { test, expect } = require('@playwright/test');

// =============================================================================
// GOOD 포맷 키 기준 테스트 데이터
// 모든 set_name, main_stat_type, sub*_name은 GOOD 포맷 PascalCase/camelCase 키 사용
// =============================================================================

// ---------------------------------------------------------------------------
// 1. MUST KEEP — 프로게이머가 절대 버리면 안 되는 성유물
// ---------------------------------------------------------------------------

const KEEPER_ARTIFACTS = {
  // 라이덴 쇼군 최적 세팅: 절연 원소 충전 효율 모래시계 + 치명타 확률 + 치명타 피해 서브옵션
  // Score: set=30 + main=30 + critRate(10)+critDMG(10)+atk(7.5)+enerRech(10) = 97.5
  raidenEmblemSands: {
    name: 'Raiden Emblem ER Sands', set_name: 'EmblemOfSeveredFate', slot: 'sands',
    level: 20, main_stat_type: 'enerRech_', main_stat_value: '51.8%',
    sub1_name: 'critRate_', sub1_value: '10.5', sub1_rolls: 3,
    sub2_name: 'critDMG_', sub2_value: '21.0', sub2_rolls: 3,
    sub3_name: 'atk_', sub3_value: '11.7', sub3_rolls: 2,
    sub4_name: 'enerRech_', sub4_value: '6.5', sub4_rolls: 1,
  },

  // 호두 최적 세팅: 마녀 HP% 모래시계 + 치명타 확률/치명타 피해/원소 마스터리
  // 초보자가 "HP% 모래시계? 버려야지" 하기 쉽지만 호두의 핵심
  // Score(Hu Tao): set=30 + main=30 + critRate(10)+critDMG(10)+eleMas(7.5) = 87.5
  huTaoCrimsonSands: {
    name: 'Hu Tao CW HP Sands', set_name: 'CrimsonWitchOfFlames', slot: 'sands',
    level: 20, main_stat_type: 'hp_', main_stat_value: '46.6%',
    sub1_name: 'critRate_', sub1_value: '10.9', sub1_rolls: 3,
    sub2_name: 'critDMG_', sub2_value: '14.8', sub2_rolls: 2,
    sub3_name: 'eleMas', sub3_value: '23', sub3_rolls: 1,
    sub4_name: 'atk_', sub4_value: '5.8', sub4_rolls: 1,
  },

  // 알베도 최적 세팅: 화관꿈 방어력% 모래시계 + 치명타 확률 + 치명타 피해
  // "방어력% 모래시계? 쓰레기 아님?" → 알베도/이토에게 핵심
  // Score(Albedo): set=30 + main=30 + critRate(10)+critDMG(10) = 80
  albedoHuskSands: {
    name: 'Albedo Husk DEF Sands', set_name: 'HuskOfOpulentDreams', slot: 'sands',
    level: 20, main_stat_type: 'def_', main_stat_value: '58.3%',
    sub1_name: 'critRate_', sub1_value: '7.8', sub1_rolls: 2,
    sub2_name: 'critDMG_', sub2_value: '15.5', sub2_rolls: 2,
    sub3_name: 'hp_', sub3_value: '4.7', sub3_rolls: 1,
    sub4_name: 'enerRech_', sub4_value: '5.8', sub4_rolls: 1,
  },

  // 카즈하 최적 세팅: 청록 원소 마스터리 성배
  // Score(Kazuha): set=30 + main=30 + enerRech(5)+eleMas(10) = 75
  kazuhaVVGoblet: {
    name: 'Kazuha VV EM Goblet', set_name: 'ViridescentVenerer', slot: 'goblet',
    level: 20, main_stat_type: 'eleMas', main_stat_value: '187',
    sub1_name: 'enerRech_', sub1_value: '11.0', sub1_rolls: 2,
    sub2_name: 'eleMas', sub2_value: '23', sub2_rolls: 1,
    sub3_name: 'hp_', sub3_value: '9.3', sub3_rolls: 2,
    sub4_name: 'atk_', sub4_value: '5.8', sub4_rolls: 1,
  },

  // 코코미 최적 세팅: 조개 치유보너스 왕관
  // "치유보너스? 쓰레기!" → 코코미 전용 핵심 옵션
  // Score(Kokomi): set=30 + main=30 + hp(10)+enerRech(7.5) = 77.5
  kokomiClamCirclet: {
    name: 'Kokomi Clam Heal Circlet', set_name: 'OceanHuedClam', slot: 'circlet',
    level: 20, main_stat_type: 'heal_', main_stat_value: '35.9%',
    sub1_name: 'hp_', sub1_value: '14.0', sub1_rolls: 3,
    sub2_name: 'enerRech_', sub2_value: '11.0', sub2_rolls: 2,
    sub3_name: 'def_', sub3_value: '7.3', sub3_rolls: 1,
    sub4_name: 'atk_', sub4_value: '5.8', sub4_rolls: 1,
  },

  // 좋은 오프피스: 랜덤 세트지만 치명타 확률 + 치명타 피해 서브옵션 치명타 피해 왕관
  // 세트 안 맞아도 서브가 미쳤으면 오프피스로 충분히 가치
  // Score(any DPS): set=0 + main=30 + critRate(10)+atk(7.5)+enerRech(2.5) = 50
  godlyOffPieceCirclet: {
    name: 'Godly Off-Piece CD Circlet', set_name: 'Lavawalker', slot: 'circlet',
    level: 20, main_stat_type: 'critDMG_', main_stat_value: '62.2%',
    sub1_name: 'critRate_', sub1_value: '12.4', sub1_rolls: 4,
    sub2_name: 'atk_', sub2_value: '14.0', sub2_rolls: 3,
    sub3_name: 'enerRech_', sub3_value: '6.5', sub3_rolls: 1,
    sub4_name: 'hp_', sub4_value: '4.7', sub4_rolls: 1,
  },

  // 예란 최적 세팅: 절연 HP% 모래시계 + 치명타 확률 + 치명타 피해
  // Score(Yelan): set=30 + main=30 + critRate(10)+critDMG(10)+hp(10)+enerRech(5) = 95
  yelanEmblemSands: {
    name: 'Yelan Emblem HP Sands', set_name: 'EmblemOfSeveredFate', slot: 'sands',
    level: 20, main_stat_type: 'hp_', main_stat_value: '46.6%',
    sub1_name: 'critRate_', sub1_value: '7.0', sub1_rolls: 2,
    sub2_name: 'critDMG_', sub2_value: '14.0', sub2_rolls: 2,
    sub3_name: 'hp_', sub3_value: '9.9', sub3_rolls: 2,
    sub4_name: 'enerRech_', sub4_value: '5.8', sub4_rolls: 1,
  },

  // 나히다 최적 세팅: 숲기억 원소 마스터리 모래시계 + 치명타 확률/치명타 피해
  // Score(Nahida): set=30 + main=30 + critRate(10)+critDMG(10)+eleMas(10) = 90
  nahidaDWMemSands: {
    name: 'Nahida DW EM Sands', set_name: 'DeepwoodMemories', slot: 'sands',
    level: 20, main_stat_type: 'eleMas', main_stat_value: '187',
    sub1_name: 'critRate_', sub1_value: '7.8', sub1_rolls: 2,
    sub2_name: 'critDMG_', sub2_value: '15.5', sub2_rolls: 2,
    sub3_name: 'eleMas', sub3_value: '23', sub3_rolls: 1,
    sub4_name: 'enerRech_', sub4_value: '5.8', sub4_rolls: 1,
  },

  // 푸리나 최적 세팅: 황금극단 HP% 성배 + 치명타 확률/치명타 피해
  // Score(Furina): set=30 + main=30 + critRate(10)+critDMG(10)+hp(10) = 90
  furinaGoldenGoblet: {
    name: 'Furina GT HP Goblet', set_name: 'GoldenTroupe', slot: 'goblet',
    level: 20, main_stat_type: 'hp_', main_stat_value: '46.6%',
    sub1_name: 'critRate_', sub1_value: '6.2', sub1_rolls: 2,
    sub2_name: 'critDMG_', sub2_value: '13.2', sub2_rolls: 2,
    sub3_name: 'hp_', sub3_value: '9.3', sub3_rolls: 2,
    sub4_name: 'enerRech_', sub4_value: '5.8', sub4_rolls: 1,
  },
};

// ---------------------------------------------------------------------------
// 2. MUST DISCARD — 어떤 캐릭터에게도 쓸모없는 확실한 쓰레기 (threshold=35)
// ---------------------------------------------------------------------------

const TRASH_ARTIFACTS = {
  // 용암 세트 방어력% 성배 + 고정옵만
  // Best: Gorou wants def_ goblet → set=0+main=30+subs=0 = 30 < 35
  lavawalkerDefGoblet: {
    name: 'Trash Lava DEF Goblet', set_name: 'Lavawalker', slot: 'goblet',
    level: 0, main_stat_type: 'def_', main_stat_value: '7.9%',
    sub1_name: 'hp', sub1_value: '209', sub1_rolls: 0,
    sub2_name: 'def', sub2_value: '16', sub2_rolls: 0,
  },

  // 뇌명 세트 HP% 왕관 + 고정옵만
  // Best: HP scaler with hp_ circlet → set=0+main=30+subs=0 = 30 < 35
  thundersootherHPCirclet: {
    name: 'Trash Thunder HP Circlet', set_name: 'Thundersoother', slot: 'circlet',
    level: 0, main_stat_type: 'hp_', main_stat_value: '7.0%',
    sub1_name: 'def', sub1_value: '16', sub1_rolls: 0,
    sub2_name: 'hp', sub2_value: '209', sub2_rolls: 0,
    sub3_name: 'atk', sub3_value: '14', sub3_rolls: 0,
  },

  // 불현인 세트 공격력% 모래시계 + 고정 방어/HP
  // Best: DPS with atk_ sands → set=0+main=30+subs=0 = 30 < 35
  lavawalkerAtkSands: {
    name: 'Trash Lava ATK Sands', set_name: 'Lavawalker', slot: 'sands',
    level: 0, main_stat_type: 'atk_', main_stat_value: '7.0%',
    sub1_name: 'def', sub1_value: '16', sub1_rolls: 0,
    sub2_name: 'hp', sub2_value: '209', sub2_rolls: 0,
  },

  // 유성 세트 물리피해 성배 + 고정옵
  // Best: Razor/Xinyan with physical_dmg_ goblet → set=0+main=30+subs=0 = 30 < 35
  bolidePhysGoblet: {
    name: 'Trash Bolide Phys Goblet', set_name: 'RetracingBolide', slot: 'goblet',
    level: 4, main_stat_type: 'physical_dmg_', main_stat_value: '8.7%',
    sub1_name: 'hp', sub1_value: '269', sub1_rolls: 0,
    sub2_name: 'def', sub2_value: '19', sub2_rolls: 0,
    sub3_name: 'atk', sub3_value: '14', sub3_rolls: 0,
  },

  // 뇌분노 꽃 + 고정옵만 (세트 자체는 피슐 등이 사용하지만 서브가 전부 고정)
  // Best: set=30(Fischl)+main=30+subs=0 = 60 → NOT discard!
  // → 이건 세트 매칭 때문에 살아남음. 올바른 동작.
  // 대신 완전 무관 세트 꽃으로 교체:
  bolideFlower: {
    name: 'Trash Bolide Flower', set_name: 'RetracingBolide', slot: 'flower',
    level: 0, main_stat_type: 'hp', main_stat_value: '717',
    sub1_name: 'def', sub1_value: '16', sub1_rolls: 0,
    sub2_name: 'hp', sub2_value: '209', sub2_rolls: 0,
  },

  // 소녀 세트 원소 마스터리 모래시계 + 고정옵
  // MaidenBeloved: Barbara/Kokomi 옛날에 썼지만 현재 characterBestSets에 없음 → set=0
  // Best: EM scaler → set=0+main=30+subs=0 = 30 < 35
  maidenEMSands: {
    name: 'Trash Maiden EM Sands', set_name: 'MaidenBeloved', slot: 'sands',
    level: 0, main_stat_type: 'eleMas', main_stat_value: '28',
    sub1_name: 'hp', sub1_value: '209', sub1_rolls: 0,
    sub2_name: 'def', sub2_value: '16', sub2_rolls: 0,
  },
};

// ---------------------------------------------------------------------------
// 3. EDGE CASES — 프로게이머 사이에서도 의견이 갈리는 미묘한 케이스
// ---------------------------------------------------------------------------

const EDGE_ARTIFACTS = {
  // 절연 방어력% 모래시계: 세트는 좋지만 메인옵이 방어력%
  // 절연 사용 캐릭터(라이덴, 향릉 등)는 방어력% 안 씀
  // Best match: Xilonen(def_ sands + 절연 아님) or someone else
  // Raiden: set=30, main=0 (wants enerRech_/atk_), subs depends
  // With critRate_+critDMG_: Raiden gets 30+0+10+10=50 → KEEP
  emblemDefSandsWithCrit: {
    name: 'Edge Emblem DEF Sands CritSub', set_name: 'EmblemOfSeveredFate', slot: 'sands',
    level: 0, main_stat_type: 'def_', main_stat_value: '7.9%',
    sub1_name: 'critRate_', sub1_value: '3.9', sub1_rolls: 1,
    sub2_name: 'critDMG_', sub2_value: '7.8', sub2_rolls: 1,
    sub3_name: 'atk_', sub3_value: '5.8', sub3_rolls: 1,
  },

  // 절연 방어력% 모래시계 + 고정옵만: 세트 좋아도 메인+서브 둘 다 안 맞으면
  // Raiden: set=30, main=0, subs=0 → 30 < 35 → DISCARD
  emblemDefSandsNoSub: {
    name: 'Edge Emblem DEF Sands Flat', set_name: 'EmblemOfSeveredFate', slot: 'sands',
    level: 0, main_stat_type: 'def_', main_stat_value: '7.9%',
    sub1_name: 'hp', sub1_value: '209', sub1_rolls: 0,
    sub2_name: 'def', sub2_value: '16', sub2_rolls: 0,
  },

  // 마녀 공격력% 모래시계 + 치명타 확률 + 치명타 피해: 디루크, 클레 등이 원하는 조합
  // Score(Diluc): set=30 + main=30 + critRate(10)+critDMG(10) = 80 → KEEP
  crimsonAtkSandsGoodSub: {
    name: 'Edge CW ATK Sands DualCrit', set_name: 'CrimsonWitchOfFlames', slot: 'sands',
    level: 12, main_stat_type: 'atk_', main_stat_value: '34.8%',
    sub1_name: 'critRate_', sub1_value: '7.0', sub1_rolls: 2,
    sub2_name: 'critDMG_', sub2_value: '14.0', sub2_rolls: 2,
    sub3_name: 'eleMas', sub3_value: '23', sub3_rolls: 1,
    sub4_name: 'enerRech_', sub4_value: '5.8', sub4_rolls: 1,
  },

  // 오프피스 원소피해 성배 + 치명타 확률 1개: 세트 무관하지만 원소 성배는 귀해서 보통 보관
  // Best DPS: set=0 + main=30(elem goblet) + critRate(10) = 40 → KEEP
  offPieceElemGobletOneCrit: {
    name: 'Edge OffPiece Pyro Goblet', set_name: 'Thundersoother', slot: 'goblet',
    level: 0, main_stat_type: 'pyro_dmg_', main_stat_value: '7.0%',
    sub1_name: 'critRate_', sub1_value: '3.9', sub1_rolls: 1,
    sub2_name: 'hp', sub2_value: '209', sub2_rolls: 0,
    sub3_name: 'def', sub3_value: '16', sub3_rolls: 0,
  },

  // 오프피스 원소피해 성배 + 서브 전부 고정: 원소 성배이지만 서브가 쓸모없음
  // Best DPS: set=0 + main=30 + subs=0 = 30 < 35 → DISCARD
  offPieceElemGobletTrashSub: {
    name: 'Edge OffPiece Hydro Goblet Flat', set_name: 'Lavawalker', slot: 'goblet',
    level: 0, main_stat_type: 'hydro_dmg_', main_stat_value: '7.0%',
    sub1_name: 'hp', sub1_value: '209', sub1_rolls: 0,
    sub2_name: 'def', sub2_value: '16', sub2_rolls: 0,
  },
};

// ---------------------------------------------------------------------------
// 4. SPECIAL STATUS — 장착/잠금으로 반드시 제외
// ---------------------------------------------------------------------------

const PROTECTED_ARTIFACTS = {
  // 장착된 쓰레기 성유물 → 어떤 경우에도 제외
  equippedTrash: {
    name: 'Equipped Trash', set_name: 'Lavawalker', slot: 'circlet',
    level: 0, main_stat_type: 'def_', main_stat_value: '7.9%',
    equipped_by: 'Amber',
  },
  // 잠금된 쓰레기 성유물 → 어떤 경우에도 제외
  lockedTrash: {
    name: 'Locked Trash', set_name: 'Lavawalker', slot: 'goblet',
    level: 0, main_stat_type: 'def_', main_stat_value: '7.9%',
    lock: 1,
  },
};

// =============================================================================
// TESTS
// =============================================================================

const ALL_ARTIFACTS = [
  ...Object.values(KEEPER_ARTIFACTS),
  ...Object.values(TRASH_ARTIFACTS),
  ...Object.values(EDGE_ARTIFACTS),
  ...Object.values(PROTECTED_ARTIFACTS),
];

test.describe('Smart Discard — 프로게이머 검증 시나리오', () => {
  test.beforeEach(async ({ request }) => {
    await request.post('/api/register', { data: { username: 'sd_test', password: 'testpass1234' } });
    await request.post('/api/login', { data: { username: 'sd_test', password: 'testpass1234' } });
    for (const art of ALL_ARTIFACTS) {
      await request.post('/api/artifacts', { data: art });
    }
  });

  // ---------------------------------------------------------------------------
  // API 응답 구조 검증
  // ---------------------------------------------------------------------------

  test('API returns valid response structure', async ({ request }) => {
    const res = await request.get('/api/artifacts/smart-discard');
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data).toHaveProperty('candidates');
    expect(data).toHaveProperty('total');
    expect(data).toHaveProperty('analyzed');
    expect(data).toHaveProperty('threshold');
    expect(Array.isArray(data.candidates)).toBeTruthy();
  });

  test('candidates include per-character score info', async ({ request }) => {
    const res = await request.get('/api/artifacts/smart-discard');
    const data = await res.json();
    if (data.candidates.length > 0) {
      const c = data.candidates[0];
      expect(c).toHaveProperty('artifact');
      expect(c).toHaveProperty('score');
      expect(c).toHaveProperty('best_character');
      expect(c).toHaveProperty('best_character_score');
      expect(c).toHaveProperty('reasons');
      expect(typeof c.score).toBe('number');
      expect(typeof c.best_character).toBe('string');
      expect(c.best_character.length).toBeGreaterThan(0);
    }
  });

  // ---------------------------------------------------------------------------
  // MUST KEEP — 절대 폐기되면 안 되는 핵심 성유물
  // ---------------------------------------------------------------------------

  test.describe('MUST KEEP — 최적 세팅 세트+메인옵+서브옵 성유물은 절대 폐기 안 됨', () => {
    test('라이덴 절연 원소 충전 효율 모래시계 (치명타 확률 + 치명타 피해 서브옵션)', async ({ request }) => {
      const data = await getDiscard(request);
      assertNotDiscarded(data, 'Raiden Emblem ER Sands');
    });

    test('호두 마녀 HP% 모래시계 — 초보자 함정 (HP%는 호두 핵심)', async ({ request }) => {
      const data = await getDiscard(request);
      assertNotDiscarded(data, 'Hu Tao CW HP Sands');
    });

    test('알베도 화관꿈 방어력% 모래시계 — 방어력%는 알베도/이토 핵심', async ({ request }) => {
      const data = await getDiscard(request);
      assertNotDiscarded(data, 'Albedo Husk DEF Sands');
    });

    test('카즈하 청록 원소 마스터리 성배 — 원소 마스터리 풀세트 빌드', async ({ request }) => {
      const data = await getDiscard(request);
      assertNotDiscarded(data, 'Kazuha VV EM Goblet');
    });

    test('코코미 조개 치유보너스 왕관 — 치유보너스는 코코미 전용 최적 세팅', async ({ request }) => {
      const data = await getDiscard(request);
      assertNotDiscarded(data, 'Kokomi Clam Heal Circlet');
    });

    test('예란 절연 HP% 모래시계 — HP% + 절연은 예란/콜롬비나 최적 세팅', async ({ request }) => {
      const data = await getDiscard(request);
      assertNotDiscarded(data, 'Yelan Emblem HP Sands');
    });

    test('나히다 숲기억 원소 마스터리 모래시계 — 원소 마스터리 모래시계는 원소 반응 캐릭터 핵심', async ({ request }) => {
      const data = await getDiscard(request);
      assertNotDiscarded(data, 'Nahida DW EM Sands');
    });

    test('푸리나 황금극단 HP% 성배 — HP% 성배은 푸리나/종려 핵심', async ({ request }) => {
      const data = await getDiscard(request);
      assertNotDiscarded(data, 'Furina GT HP Goblet');
    });

    test('갓롤 오프피스 치명타 피해 왕관 — 세트 무관하게 서브가 우수하면 보관', async ({ request }) => {
      const data = await getDiscard(request);
      assertNotDiscarded(data, 'Godly Off-Piece CD Circlet');
    });
  });

  // ---------------------------------------------------------------------------
  // MUST DISCARD — 어떤 캐릭터에게도 쓸모없는 확실한 쓰레기
  // ---------------------------------------------------------------------------

  test.describe('MUST DISCARD — 추천 세트 아닌 + 고정 서브옵만 있는 성유물', () => {
    test('용암 세트 방어력% 성배에 고정 수치 서브옵션만 있으면 어떤 캐릭터도 사용하지 않음', async ({ request }) => {
      const data = await getDiscard(request);
      assertDiscarded(data, 'Trash Lava DEF Goblet');
    });

    test('뇌명을 평정한 존자 HP% 왕관에 고정 수치 서브옵션만 있으면 세트와 서브옵션 모두 가치 없음', async ({ request }) => {
      const data = await getDiscard(request);
      assertDiscarded(data, 'Trash Thunder HP Circlet');
    });

    test('용암 세트 공격력% 모래시계에 고정 방어력/HP 서브옵션만 있으면 오프피스로도 가치 없음', async ({ request }) => {
      const data = await getDiscard(request);
      assertDiscarded(data, 'Trash Lava ATK Sands');
    });

    test('날아오르는 유성 물리 피해 보너스 성배에 고정 수치만 있으면 세트도 서브옵션도 쓸모없음', async ({ request }) => {
      const data = await getDiscard(request);
      assertDiscarded(data, 'Trash Bolide Phys Goblet');
    });

    test('날아오르는 유성 꽃에 고정 수치 서브옵션만 있으면 세트도 서브옵션도 가치 없음', async ({ request }) => {
      const data = await getDiscard(request);
      assertDiscarded(data, 'Trash Bolide Flower');
    });

    test('사랑받는 소녀 원소 마스터리 모래시계에 고정 수치만 있으면 현재 메타에서 사용하는 캐릭터 없음', async ({ request }) => {
      const data = await getDiscard(request);
      assertDiscarded(data, 'Trash Maiden EM Sands');
    });
  });

  // ---------------------------------------------------------------------------
  // EDGE CASES — 미묘한 경계선 케이스
  // ---------------------------------------------------------------------------

  test.describe('EDGE CASES — 세트 좋지만 메인 안 맞는 케이스 등', () => {
    test('절연 방어력% 모래시계라도 치명타 확률/치명타 피해 서브옵션이 있으면 세트 보너스 덕분에 살아남음', async ({ request }) => {
      const data = await getDiscard(request);
      assertNotDiscarded(data, 'Edge Emblem DEF Sands CritSub');
    });

    test('절연 방어력% 모래시계에 고정 수치만 있으면 세트가 좋아도 메인옵션과 서브옵션 모두 안 맞아 폐기', async ({ request }) => {
      const data = await getDiscard(request);
      assertDiscarded(data, 'Edge Emblem DEF Sands Flat');
    });

    test('마녀 공격력% 모래시계에 치명타 확률/치명타 피해가 있으면 디루크와 클레의 완벽한 조합', async ({ request }) => {
      const data = await getDiscard(request);
      assertNotDiscarded(data, 'Edge CW ATK Sands DualCrit');
    });

    test('오프피스 불 원소 피해 보너스 성배에 치명타 확률이 1개라도 있으면 보관 가치 있음', async ({ request }) => {
      const data = await getDiscard(request);
      assertNotDiscarded(data, 'Edge OffPiece Pyro Goblet');
    });

    test('오프피스 물 원소 피해 보너스 성배이라도 서브옵션이 전부 고정 수치면 폐기', async ({ request }) => {
      const data = await getDiscard(request);
      assertDiscarded(data, 'Edge OffPiece Hydro Goblet Flat');
    });
  });

  // ---------------------------------------------------------------------------
  // 장착/잠금 보호
  // ---------------------------------------------------------------------------

  test.describe('PROTECTION — 장착/잠금 성유물은 절대 폐기 목록에 포함 안 됨', () => {
    test('장착된 쓰레기 성유물 → 장착 상태이므로 분석에서 제외', async ({ request }) => {
      const data = await getDiscard(request);
      assertNotDiscarded(data, 'Equipped Trash');
    });

    test('잠금된 쓰레기 성유물 → 잠금 상태이므로 분석에서 제외', async ({ request }) => {
      const data = await getDiscard(request);
      assertNotDiscarded(data, 'Locked Trash');
    });
  });

  // ---------------------------------------------------------------------------
  // Threshold 동적 조정 테스트
  // ---------------------------------------------------------------------------

  test.describe('THRESHOLD — 기준값에 따라 결과가 달라져야 함', () => {
    test('threshold=10이면 거의 모든 성유물이 살아남음', async ({ request }) => {
      const data = await getDiscardAt(request, 10);
      // 모든 성유물은 최소 30점 (main stat match) → threshold 10이면 대부분 통과
      expect(data.candidates.length).toBeLessThanOrEqual(0);
    });

    test('threshold=70이면 세트+메인+서브 모두 완벽해야 살아남음', async ({ request }) => {
      const data = await getDiscardAt(request, 70);
      // 70점 이하 성유물이 많아져야 함
      expect(data.candidates.length).toBeGreaterThan(
        (await getDiscard(request)).candidates.length
      );
    });

    test('threshold 올리면 폐기 후보 수가 증가함', async ({ request }) => {
      const low = await getDiscardAt(request, 20);
      const mid = await getDiscardAt(request, 40);
      const high = await getDiscardAt(request, 60);
      expect(low.candidates.length).toBeLessThanOrEqual(mid.candidates.length);
      expect(mid.candidates.length).toBeLessThanOrEqual(high.candidates.length);
    });
  });

  // ---------------------------------------------------------------------------
  // 폐기 사유 검증
  // ---------------------------------------------------------------------------

  test.describe('REASONS — 폐기 사유가 정확해야 함', () => {
    test('추천 세트가 아닌 성유물에 "추천 세트 아님" 사유 포함', async ({ request }) => {
      const data = await getDiscard(request);
      const trash = findCandidate(data, 'Trash Lava DEF Goblet');
      expect(trash).toBeTruthy();
      expect(trash.reasons).toContain('추천 세트 아님');
    });

    test('메인옵 부적합 성유물에 "메인 옵션 부적합" 사유 포함', async ({ request }) => {
      const data = await getDiscard(request);
      const edge = findCandidate(data, 'Edge Emblem DEF Sands Flat');
      expect(edge).toBeTruthy();
      expect(edge.reasons.some(r => r.includes('메인 옵션 부적합'))).toBeTruthy();
    });

    test('치명타 없는 성유물에 "치명타 부옵션 없음" 사유 포함', async ({ request }) => {
      const data = await getDiscard(request);
      const trash = findCandidate(data, 'Trash Lava DEF Goblet');
      expect(trash).toBeTruthy();
      expect(trash.reasons.some(r => r.includes('치명타'))).toBeTruthy();
    });
  });

  // ---------------------------------------------------------------------------
  // 빈 상태/대량 데이터 테스트
  // ---------------------------------------------------------------------------

  test('성유물 0개일 때 빈 결과 반환', async ({ request }) => {
    // 새 유저로 테스트
    await request.post('/api/register', { data: { username: 'sd_empty', password: 'testpass1234' } });
    await request.post('/api/login', { data: { username: 'sd_empty', password: 'testpass1234' } });
    const res = await request.get('/api/artifacts/smart-discard');
    const data = await res.json();
    expect(data.candidates).toHaveLength(0);
    expect(data.total).toBe(0);
  });

  test('모든 성유물이 장착 상태면 폐기 후보 0개', async ({ request }) => {
    await request.post('/api/register', { data: { username: 'sd_equipped', password: 'testpass1234' } });
    await request.post('/api/login', { data: { username: 'sd_equipped', password: 'testpass1234' } });
    for (let i = 0; i < 5; i++) {
      await request.post('/api/artifacts', { data: {
        name: `eq${i}`, set_name: 'Lavawalker', slot: 'flower',
        level: 0, main_stat_type: 'hp', equipped_by: 'Amber',
      }});
    }
    const data = await (await request.get('/api/artifacts/smart-discard')).json();
    expect(data.candidates).toHaveLength(0);
    expect(data.analyzed).toBe(0);
  });

  test('batch-delete endpoint works', async ({ request }) => {
    await request.post('/api/artifacts', { data: TRASH_ARTIFACTS.bolideFlower });
    const list = await (await request.get('/api/artifacts')).json();
    const target = list[list.length - 1];
    const res = await request.post('/api/artifacts/batch-delete', {
      data: { ids: [Number(target.id)] },
    });
    expect(res.ok()).toBeTruthy();
    expect((await res.json()).deleted).toBe(1);
  });

  test('batch-delete rejects empty ids', async ({ request }) => {
    const res = await request.post('/api/artifacts/batch-delete', { data: { ids: [] } });
    expect(res.ok()).toBeFalsy();
  });
});

// ---------------------------------------------------------------------------
// UI 테스트
// ---------------------------------------------------------------------------

test.describe('Smart Discard — UI', () => {
  test.beforeEach(async ({ page }) => {
    await page.request.post('/api/register', { data: { username: 'sd_ui', password: 'testpass1234' } });
    await page.request.post('/api/login', { data: { username: 'sd_ui', password: 'testpass1234' } });
    for (const art of ALL_ARTIFACTS) {
      await page.request.post('/api/artifacts', { data: art });
    }
  });

  test('page loads with correct title', async ({ page }) => {
    await page.goto('/smart-discard.html', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveTitle(/Smart Discard/);
  });

  test('displays analysis summary after loading', async ({ page }) => {
    await page.goto('/smart-discard.html', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#sd-loading', { state: 'hidden', timeout: 10000 });
    const total = await page.locator('#sd-total').textContent();
    expect(Number(total)).toBeGreaterThanOrEqual(ALL_ARTIFACTS.length);
  });

  test('shows discard candidate cards with reasons', async ({ page }) => {
    await page.goto('/smart-discard.html', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#sd-loading', { state: 'hidden', timeout: 10000 });
    await page.waitForSelector('.sd-card', { timeout: 5000 });
    const cards = page.locator('.sd-card');
    expect(await cards.count()).toBeGreaterThan(0);
    const reasons = page.locator('.sd-reason');
    expect(await reasons.count()).toBeGreaterThan(0);
  });

  test('score badges show numeric values', async ({ page }) => {
    await page.goto('/smart-discard.html', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.sd-score-badge', { timeout: 10000 });
    const badge = page.locator('.sd-score-badge').first();
    const text = await badge.textContent();
    expect(text).toMatch(/\d+/);
  });

  test('threshold slider changes results', async ({ page }) => {
    await page.goto('/smart-discard.html', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#sd-loading', { state: 'hidden', timeout: 10000 });
    const countBefore = await page.locator('#sd-candidates').textContent();

    // Drag slider to max (80) — more artifacts should be flagged
    await page.locator('#sd-threshold').fill('80');
    await page.locator('#sd-threshold').dispatchEvent('input');
    // Wait for debounce + refetch
    await page.waitForTimeout(600);
    await page.waitForSelector('#sd-loading', { state: 'hidden', timeout: 10000 });
    const countAfter = await page.locator('#sd-candidates').textContent();
    expect(Number(countAfter)).toBeGreaterThanOrEqual(Number(countBefore));
  });

  test('artifacts page has smart discard FAB', async ({ page }) => {
    await page.goto('/artifacts.html', { waitUntil: 'domcontentloaded' });
    const fab = page.locator('a[href="smart-discard.html"]');
    await expect(fab).toBeVisible();
  });

  test('FAB navigates to smart discard', async ({ page }) => {
    await page.goto('/artifacts.html', { waitUntil: 'domcontentloaded' });
    await page.click('a[href="smart-discard.html"]');
    await expect(page).toHaveURL(/smart-discard/);
  });

  test('back link returns to artifacts', async ({ page }) => {
    await page.goto('/smart-discard.html', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#sd-loading', { state: 'hidden', timeout: 10000 });
    await page.click('a[href="artifacts.html"]');
    await expect(page).toHaveURL(/artifacts/);
  });
});

// =============================================================================
// Helpers
// =============================================================================

async function getDiscard(request) {
  const res = await request.get('/api/artifacts/smart-discard');
  return res.json();
}

async function getDiscardAt(request, threshold) {
  const res = await request.get(`/api/artifacts/smart-discard?threshold=${threshold}`);
  return res.json();
}

function findCandidate(data, name) {
  return data.candidates.find(c => c.artifact.name === name);
}

function assertDiscarded(data, name) {
  const found = findCandidate(data, name);
  expect(found, `"${name}" should be in discard list but was NOT found`).toBeTruthy();
}

function assertNotDiscarded(data, name) {
  const found = findCandidate(data, name);
  expect(found, `"${name}" should NOT be in discard list but WAS found with score=${found?.score}`).toBeFalsy();
}
