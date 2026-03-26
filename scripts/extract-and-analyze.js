#!/usr/bin/env node
/**
 * Go 서버 코드에서 캐릭터 데이터를 추출하고, 실제 GOOD 데이터에 스마트 폐기 알고리즘을 실행
 * Usage: node scripts/extract-and-analyze.js <good.json> [threshold]
 */
const fs = require('fs');
const goodPath = process.argv[2];
const threshold = Number(process.argv[3] || 35);

if (!goodPath) { console.error('Usage: node extract-and-analyze.js <good.json> [threshold]'); process.exit(1); }

const go = fs.readFileSync('server/main.go', 'utf8');
const d = JSON.parse(fs.readFileSync(goodPath, 'utf8'));

// ---- Go 소스에서 데이터 추출 ----

// characterBestSets: "CharName": {"Set1", "Set2"}
function parseBestSets(src) {
  const m = src.match(/var characterBestSets[\s\S]*?= map\[string\]\[\]string\{([\s\S]*?)\n\}/);
  if (!m) return {};
  const result = {};
  const re = /"([^"]+)":\s*\{([^}]*)\}/g;
  let match;
  while ((match = re.exec(m[1])) !== null) {
    const sets = match[2].match(/"([^"]+)"/g);
    result[match[1]] = sets ? sets.map(s => s.replace(/"/g, '')) : [];
  }
  return result;
}

// characterStatWeights: "CharName": {"stat": 0.5, ...}
function parseWeights(src) {
  const m = src.match(/var characterStatWeights[\s\S]*?= map\[string\]map\[string\]float64\{([\s\S]*?)\n\}/);
  if (!m) return {};
  const result = {};
  const lines = m[1].split('\n');
  for (const line of lines) {
    const cm = line.match(/"([^"]+)":\s*\{([^}]+)\}/);
    if (!cm) continue;
    const weights = {};
    const pairs = cm[2].matchAll(/"([^"]+)":\s*([\d.]+)/g);
    for (const p of pairs) weights[p[1]] = parseFloat(p[2]);
    result[cm[1]] = weights;
  }
  return result;
}

// characterDesiredMainStats: "CharName": {"slot": {"stat1", "stat2"}, ...}
function parseDesiredMains(src) {
  const m = src.match(/var characterDesiredMainStats[\s\S]*?= map\[string\]map\[string\]\[\]string\{([\s\S]*?)\n\}/);
  if (!m) return {};
  const result = {};
  const lines = m[1].split('\n');
  for (const line of lines) {
    const cm = line.match(/"([^"]+)":\s*\{(.+)\}/);
    if (!cm) continue;
    const charName = cm[1];
    const slotsStr = cm[2];
    const slots = {};
    const slotRe = /"(sands|goblet|circlet)":\s*\{([^}]*)\}/g;
    let sm;
    while ((sm = slotRe.exec(slotsStr)) !== null) {
      const stats = sm[2].match(/"([^"]+)"/g);
      slots[sm[1]] = stats ? stats.map(s => s.replace(/"/g, '')) : [];
    }
    result[charName] = slots;
  }
  return result;
}

const characterBestSets = parseBestSets(go);
const W = parseWeights(go);
const DM = parseDesiredMains(go);

console.log(`추출 완료: ${Object.keys(characterBestSets).length} 세트 매핑, ${Object.keys(W).length} 가중치, ${Object.keys(DM).length} 메인옵`);

// ---- 스코어링 ----

function scoreArtifact(a) {
  let bestScore = 0, bestChar = '';
  const slot = a.slotKey, mainStat = a.mainStatKey;
  const subKeys = a.substats.map(s => s.key);

  for (const [charName, weights] of Object.entries(W)) {
    let score = 0;
    if ((characterBestSets[charName] || []).includes(a.setKey)) score += 30;
    if (slot === 'flower' || slot === 'plume') { score += 30; }
    else {
      const desired = (DM[charName] || {})[slot] || [];
      if (desired.includes(mainStat)) score += 30;
    }
    for (const sk of subKeys) {
      if (sk && weights[sk]) score += weights[sk] * 10;
    }
    if (score > bestScore) { bestScore = score; bestChar = charName; }
  }
  return { bestScore, bestChar };
}

// ---- 분석 ----

const arts = d.artifacts || [];
const analyzable = arts.filter(a => !a.location && !a.lock);
const candidates = [];

for (const a of analyzable) {
  const { bestScore, bestChar } = scoreArtifact(a);
  if (bestScore < threshold) candidates.push({ a, bestScore, bestChar });
}
candidates.sort((a, b) => a.bestScore - b.bestScore);

console.log(`\n=== 스마트 폐기 분석 결과 (기준값=${threshold}) ===`);
console.log(`전체: ${arts.length}`);
console.log(`분석 대상 (미장착+미잠금): ${analyzable.length}`);
console.log(`폐기 후보: ${candidates.length}`);
console.log(`보관 대상: ${analyzable.length - candidates.length}`);
console.log(`폐기 비율: ${(candidates.length / analyzable.length * 100).toFixed(1)}%`);

// 세트별
const discardSets = {};
candidates.forEach(c => { discardSets[c.a.setKey] = (discardSets[c.a.setKey] || 0) + 1 });
console.log('\n=== 폐기 후보 세트 분포 (상위 10) ===');
Object.entries(discardSets).sort((a, b) => b[1] - a[1]).slice(0, 10)
  .forEach(([k, v]) => console.log(`  ${k}: ${v}`));

// 슬롯별
const discardSlots = {};
candidates.forEach(c => { discardSlots[c.a.slotKey] = (discardSlots[c.a.slotKey] || 0) + 1 });
console.log('\n=== 폐기 후보 슬롯 분포 ===');
Object.entries(discardSlots).sort((a, b) => b[1] - a[1])
  .forEach(([k, v]) => console.log(`  ${k}: ${v}`));

// 메인옵별
const discardMains = {};
candidates.forEach(c => { discardMains[c.a.mainStatKey] = (discardMains[c.a.mainStatKey] || 0) + 1 });
console.log('\n=== 폐기 후보 메인 옵션 분포 ===');
Object.entries(discardMains).sort((a, b) => b[1] - a[1])
  .forEach(([k, v]) => console.log(`  ${k}: ${v}`));

// 최악 15개
console.log('\n=== 최악의 폐기 후보 15개 ===');
candidates.slice(0, 15).forEach((c, i) => {
  const subs = c.a.substats.map(s => s.key).filter(Boolean).join(', ');
  console.log(`${i + 1}. [${c.bestScore}점] ${c.a.setKey} ${c.a.slotKey} (메인: ${c.a.mainStatKey}) 서브: [${subs}] → 최적: ${c.bestChar}`);
});

// 경계선
const borderline = [];
for (const a of analyzable) {
  const { bestScore, bestChar } = scoreArtifact(a);
  if (bestScore >= threshold && bestScore < threshold + 15) borderline.push({ a, bestScore, bestChar });
}
borderline.sort((a, b) => a.bestScore - b.bestScore);
console.log(`\n=== 보관 중 경계선 성유물 (${threshold}~${threshold + 14}점, 상위 10개) ===`);
borderline.slice(0, 10).forEach((c, i) => {
  const subs = c.a.substats.map(s => s.key).filter(Boolean).join(', ');
  console.log(`${i + 1}. [${c.bestScore}점] ${c.a.setKey} ${c.a.slotKey} (메인: ${c.a.mainStatKey}) 서브: [${subs}] → 최적: ${c.bestChar}`);
});

// 미인식 세트 확인
const allSetsInData = new Set(arts.map(a => a.setKey));
const allSetsInCode = new Set();
Object.values(characterBestSets).forEach(sets => sets.forEach(s => allSetsInCode.add(s)));
const unrecognized = [...allSetsInData].filter(s => !allSetsInCode.has(s));
if (unrecognized.length > 0) {
  console.log('\n=== 미인식 세트 (characterBestSets에 없음) ===');
  unrecognized.forEach(s => {
    const count = arts.filter(a => a.setKey === s).length;
    console.log(`  ${s}: ${count}개`);
  });
}
