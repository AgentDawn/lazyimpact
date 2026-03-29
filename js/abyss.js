/**
 * Abyss — Spiral Abyss (나선비경) team optimization
 */

document.addEventListener('DOMContentLoaded', async () => {
  const seasonEl = document.getElementById('abyss-season-info')
  const firstEl = document.getElementById('abyss-first-half')
  const secondEl = document.getElementById('abyss-second-half')
  const overallEl = document.getElementById('abyss-overall')
  const recsEl = document.getElementById('abyss-recommendations')
  if (!seasonEl) return

  // Load latest DFS result
  try {
    const latestRes = await fetch('/api/optimize/latest/abyss')
    if (latestRes.ok) {
      const latestData = await latestRes.json()
      if (latestData && (latestData.teams || latestData.first_half)) {
        const teams = latestData.teams || {}
        renderAbyssData({
          season: latestData.season || {},
          first_half: teams.first_half || latestData.first_half || {},
          second_half: teams.second_half || latestData.second_half || {},
          overall: latestData.overall || { score: latestData.overall_score || 0 },
          recommendations: latestData.recommendations || [],
        })
      } else {
        const msg = emptyState('sync', '데이터를 가져온 후 홈에서 최적화가 자동 실행됩니다.')
        seasonEl.innerHTML = msg
        firstEl.innerHTML = ''
        secondEl.innerHTML = ''
      }
    }
  } catch {
    seasonEl.innerHTML = emptyState('error', '결과를 불러올 수 없습니다.')
  }

  // Wire up DFS button
  const btnDfs = document.getElementById('btn-dfs-optimize')
  if (btnDfs) {
    btnDfs.addEventListener('click', () => startOptimization('abyss'))
  }

  // Wire up gap analysis button
  const btnGap = document.getElementById('btn-gap-analysis')
  if (btnGap) {
    btnGap.addEventListener('click', loadGapAnalysis)
  }

  async function loadGapAnalysis() {
    const resultEl = document.getElementById('gap-analysis-result')
    if (!resultEl) return
    resultEl.innerHTML = emptyState('hourglass_empty', '분석 중...')
    try {
      const res = await fetch('/api/abyss/gap-analysis')
      if (res.status === 401) { window.location.href = '/login.html'; return }
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || 'error')
      }
      const data = await res.json()
      renderGapAnalysis(resultEl, data)
    } catch (e) {
      resultEl.innerHTML = emptyState('error', '갭 분석을 불러올 수 없습니다.')
    }
  }

  function renderAbyssData(data) {
    renderSeasonInfo(seasonEl, data.season || {})
    renderTeamHalf(firstEl, data.first_half || {})
    renderTeamHalf(secondEl, data.second_half || {})
    renderOverall(overallEl, data.overall || {})
    renderRecommendations(recsEl, data.recommendations || [])
  }

  async function startOptimization(type) {
    const progressEl = document.getElementById('optimize-progress')
    const btnDfsEl = document.getElementById('btn-dfs-optimize')
    if (btnDfsEl) btnDfsEl.disabled = true

    try {
      const res = await fetch('/api/optimize/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      })
      if (res.status === 401) { window.location.href = '/login.html'; return }
      if (!res.ok) throw new Error()
      const { job_id } = await res.json()

      pollOptimizeJob(job_id, progressEl, (result) => {
        if (btnDfsEl) btnDfsEl.disabled = false
        renderAbyssData(result)
      })
    } catch {
      if (progressEl) progressEl.innerHTML = '<p style="color:var(--error)">최적화 시작 실패</p>'
      if (btnDfsEl) btnDfsEl.disabled = false
    }
  }
})

function renderSeasonInfo(el, season) {
  if (!season.blessing && !season.period) {
    el.innerHTML = emptyState('info', '현재 시즌 정보가 없습니다.')
    return
  }
  el.innerHTML = `
    <div style="display:flex;flex-wrap:wrap;gap:1.5rem;align-items:flex-start">
      ${season.blessing ? `
        <div style="flex:1;min-width:12rem;padding:1rem;background:var(--surface-highest);border-radius:var(--r-md)">
          <div style="font-size:0.75rem;color:var(--on-surface-variant);margin-bottom:0.25rem">이번 달 축복</div>
          <div style="font-size:0.9375rem;font-weight:600">${season.blessing}</div>
        </div>` : ''}
      ${season.period ? `
        <div style="flex:1;min-width:12rem;padding:1rem;background:var(--surface-highest);border-radius:var(--r-md)">
          <div style="font-size:0.75rem;color:var(--on-surface-variant);margin-bottom:0.25rem">기간</div>
          <div style="font-size:0.9375rem;font-weight:600">${season.period}</div>
        </div>` : ''}
      ${season.floor ? `
        <div style="flex:1;min-width:12rem;padding:1rem;background:var(--surface-highest);border-radius:var(--r-md)">
          <div style="font-size:0.75rem;color:var(--on-surface-variant);margin-bottom:0.25rem">목표 층수</div>
          <div style="font-size:0.9375rem;font-weight:600">${season.floor}</div>
        </div>` : ''}
    </div>`
}

function renderTeamHalf(el, half) {
  const rawChars = half.members || half.characters || []
  if (rawChars.length === 0) {
    el.innerHTML = emptyState('group_off', '팀 구성을 위한 캐릭터가 부족합니다.')
    return
  }

  // Normalize DFS member format to flat format for renderCharCard
  const chars = rawChars.map(c => {
    if (c.character) {
      // DFS format: { character: {name, element, level, ...}, score, weapon: {name, ...}, artifacts, improvements }
      return {
        name: c.character.name || '',
        element: c.character.element || '',
        level: c.character.level || 0,
        weapon: c.weapon ? c.weapon.name || '' : '',
        weapon_level: c.weapon ? c.weapon.level || 0 : 0,
        score: c.score,
        artifacts: (c.artifacts || []).map(a => ({ slot: a.slot, set: a.set_name, level: a.level })),
        improvements: (c.improvements || []).map(imp => typeof imp === 'string' ? { label: imp, priority: 'medium' } : imp),
      }
    }
    return c // already flat (greedy format)
  })

  const cardsHtml = chars.map((c) => renderCharCard(c)).join('')

  const resonanceHtml = half.resonance
    ? `<div style="display:flex;align-items:center;gap:0.5rem;padding:0.5rem 0.75rem;background:rgba(77,219,206,0.08);border-radius:var(--r-md);border:1px solid rgba(77,219,206,0.2)">
        <span class="material-symbols-outlined" style="font-size:1rem;color:var(--secondary)">bolt</span>
        <span style="font-size:0.8125rem;font-weight:600;color:var(--secondary)">${half.resonance}</span>
       </div>`
    : ''

  const elemCoverageHtml = (half.element_coverage || []).length > 0
    ? `<div style="display:flex;gap:0.5rem;flex-wrap:wrap">
        ${half.element_coverage.map((e) =>
          `<span style="font-size:0.75rem;padding:0.25rem 0.625rem;border-radius:var(--r-full);background:var(--surface-highest);color:var(--on-surface-variant)">${e}</span>`
        ).join('')}
       </div>`
    : ''

  const teamScore = half.team_score != null
    ? `<div style="display:flex;align-items:center;gap:0.75rem">
        <span style="font-size:0.8125rem;color:var(--on-surface-variant)">팀 점수</span>
        <span style="font-size:1.125rem;font-weight:700;color:var(--primary)">${half.team_score}</span>
       </div>`
    : ''

  el.innerHTML = `
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(13rem,1fr));gap:1rem;margin-bottom:1rem">
      ${cardsHtml}
    </div>
    <div style="display:flex;flex-wrap:wrap;align-items:center;gap:1rem;padding-top:0.75rem;border-top:1px solid var(--outline-variant)">
      ${teamScore}
      ${resonanceHtml}
      ${elemCoverageHtml}
    </div>`
}

function renderCharCard(c) {
  const icon = charIconPath(c.name)
  const displayName = localizeCharName(c.name)
  const weaponName = localizeWeaponName(c.weapon || '')
  const element = localizeElement(c.element || '')

  const slotOrder = ['flower', 'plume', 'sands', 'goblet', 'circlet']
  const slotKo = { flower: '꽃', plume: '깃털', sands: '모래', goblet: '성배', circlet: '왕관' }
  const sortedArtifacts = [...(c.artifacts || [])].sort((a, b) => slotOrder.indexOf(a.slot) - slotOrder.indexOf(b.slot))
  const artifactRows = sortedArtifacts.map((a) => {
    const setDisplay = (typeof setNameKo !== 'undefined' && setNameKo[a.set]) ? setNameKo[a.set] : (a.set || '')
    const slotDisplay = slotKo[a.slot] || a.slot || ''
    return `<div style="display:flex;justify-content:space-between;align-items:center;font-size:0.75rem;padding:0.125rem 0">
      <span style="color:var(--on-surface-variant)">${slotDisplay}</span>
      <span style="font-weight:500">${setDisplay} ${a.level != null ? `+${a.level}` : ''}</span>
     </div>`
  }).join('')

  const improvementsHtml = (c.improvements || []).map((imp) => {
    const prioColors = { high: 'var(--error)', medium: 'var(--tertiary)', low: 'var(--on-surface-variant)' }
    const color = prioColors[imp.priority] || 'var(--on-surface-variant)'
    return `<span style="font-size:0.625rem;font-weight:700;padding:0.1875rem 0.4375rem;border-radius:var(--r-full);background:${color};color:var(--on-primary);white-space:nowrap">${imp.label}</span>`
  }).join('')

  const scoreBadge = c.score != null
    ? `<span style="font-size:0.75rem;font-weight:700;color:var(--primary)">${c.score}</span>`
    : ''

  return `
    <div style="background:var(--surface-container);border-radius:var(--r-lg);overflow:hidden">
      <div style="padding:0.75rem;display:flex;align-items:center;gap:0.75rem;background:var(--surface-highest)">
        <div style="width:2.5rem;height:2.5rem;border-radius:50%;overflow:hidden;background:var(--surface-low);flex-shrink:0">
          <img src="${icon}" alt="${displayName}" style="width:100%;height:100%;object-fit:cover" onerror="this.src='assets/chars/TravelerF.png'"/>
        </div>
        <div style="flex-grow:1;min-width:0">
          <div style="font-size:0.875rem;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${displayName}</div>
          <div style="font-size:0.75rem;color:var(--on-surface-variant)">${element}</div>
        </div>
        ${scoreBadge}
      </div>
      <div style="padding:0.75rem;display:flex;flex-direction:column;gap:0.5rem">
        ${weaponName ? `
          <div style="font-size:0.75rem;display:flex;align-items:center;gap:0.375rem">
            <span class="material-symbols-outlined" style="font-size:0.875rem;color:var(--on-surface-variant)">swords</span>
            <span style="color:var(--on-surface-variant)">${weaponName}</span>
          </div>` : ''}
        ${artifactRows ? `<div style="display:flex;flex-direction:column;gap:0.125rem">${artifactRows}</div>` : ''}
        ${improvementsHtml ? `<div style="display:flex;flex-wrap:wrap;gap:0.375rem;margin-top:0.25rem">${improvementsHtml}</div>` : ''}
      </div>
    </div>`
}

function renderOverall(el, overall) {
  // Removed: 종합 점수 section (meaningless to users)
  el.innerHTML = ''
}

function renderRecommendations(el, recs) {
  if (recs.length === 0) {
    el.innerHTML = `<div style="display:flex;align-items:center;gap:0.75rem;padding:1rem;background:var(--surface-highest);border-radius:var(--r-md)">
      <span class="material-symbols-outlined" style="color:var(--secondary)">check_circle</span>
      <span style="font-size:0.875rem">현재 팀 구성이 최적화되어 있습니다!</span>
    </div>`
    return
  }

  const prioColors = { 1: 'var(--error)', 2: 'var(--tertiary)', 3: 'var(--on-surface-variant)' }
  const prioLabels = { 1: '긴급', 2: '권장', 3: '참고' }

  el.innerHTML = recs.map((r) => {
    // Localize character names in title/reason
    let title = r.title || ''
    let reason = r.reason || ''
    if (typeof charNameEnToKo !== 'undefined') {
      Object.entries(charNameEnToKo).sort((a,b) => b[0].length - a[0].length).forEach(([en, ko]) => {
        title = title.replace(en, ko)
        reason = reason.replace(en, ko)
      })
    }
    return `<div style="display:flex;align-items:center;gap:1rem;padding:0.75rem;background:var(--surface-highest);border-radius:var(--r-md);margin-bottom:0.5rem;border-left:3px solid ${prioColors[r.priority] || 'var(--outline)'}">
      <div style="flex-grow:1">
        <div style="font-size:0.875rem;font-weight:600">${title}</div>
        <div style="font-size:0.75rem;color:var(--on-surface-variant);margin-top:0.125rem">${reason}</div>
      </div>
      <span style="font-size:0.625rem;font-weight:700;padding:0.25rem 0.5rem;border-radius:var(--r-full);background:${prioColors[r.priority]};color:var(--on-primary);white-space:nowrap">${prioLabels[r.priority] || ''}</span>
    </div>`
  }).join('')
}

function emptyState(icon, msg) {
  return `<div class="empty-state">
    <span class="material-symbols-outlined">${icon}</span>
    <p>${msg}</p>
  </div>`
}

function renderGapAnalysis(el, data) {
  const halves = ['first_half', 'second_half']
  const halfLabels = { first_half: '전반', second_half: '후반' }

  const halvesHtml = halves.map((key) => {
    const half = data[key] || {}
    const currentScore = half.current_score != null ? half.current_score : (data.current_score || 0)
    const threshold = half.threshold != null ? half.threshold : (data.threshold || 0)
    const canClear = half.can_clear != null ? half.can_clear : (data.can_clear || false)
    const gap = half.gap != null ? half.gap : (data.gap || 0)

    const clearPct = threshold > 0 ? Math.min((currentScore / threshold) * 100, 100) : 0
    const comfortPct = threshold > 0 ? Math.min(((currentScore - threshold) / threshold) * 100 + 100, 100) : 0

    const clearIcon = canClear
      ? `<span class="material-symbols-outlined" style="color:var(--secondary);font-size:1.25rem">check_circle</span>`
      : `<span class="material-symbols-outlined" style="color:var(--error);font-size:1.25rem">cancel</span>`

    return `
      <div style="padding:1rem;background:var(--surface-highest);border-radius:var(--r-md);margin-bottom:0.75rem">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.75rem">
          <span style="font-size:0.9375rem;font-weight:700">${halfLabels[key] || key}</span>
          <div style="display:flex;align-items:center;gap:0.5rem">
            ${clearIcon}
            <span style="font-size:0.8125rem;font-weight:600;color:${canClear ? 'var(--secondary)' : 'var(--error)'}">${canClear ? '클리어 가능' : '클리어 불가'}</span>
          </div>
        </div>
        <div style="display:flex;gap:2rem;flex-wrap:wrap;margin-bottom:0.75rem">
          <div>
            <div style="font-size:0.75rem;color:var(--on-surface-variant);margin-bottom:0.25rem">현재 점수</div>
            <div style="font-size:1.125rem;font-weight:700;color:var(--primary)">${currentScore}</div>
          </div>
          <div>
            <div style="font-size:0.75rem;color:var(--on-surface-variant);margin-bottom:0.25rem">클리어 기준</div>
            <div style="font-size:1.125rem;font-weight:700">${threshold}</div>
          </div>
          ${gap > 0 ? `
          <div>
            <div style="font-size:0.75rem;color:var(--on-surface-variant);margin-bottom:0.25rem">부족한 점수</div>
            <div style="font-size:1.125rem;font-weight:700;color:var(--error)">-${gap}</div>
          </div>` : ''}
        </div>
        <div style="margin-bottom:0.375rem">
          <div style="display:flex;justify-content:space-between;font-size:0.75rem;color:var(--on-surface-variant);margin-bottom:0.25rem">
            <span>클리어 진행도</span><span>${Math.round(clearPct)}%</span>
          </div>
          <div style="height:0.5rem;background:var(--surface-low);border-radius:var(--r-full);overflow:hidden">
            <div style="width:${clearPct}%;height:100%;background:${canClear ? 'linear-gradient(90deg,var(--secondary),var(--primary))' : 'linear-gradient(90deg,var(--error),var(--tertiary))'};border-radius:var(--r-full);transition:width 0.5s"></div>
          </div>
        </div>
      </div>`
  }).join('')

  const improvements = data.improvements || []
  const minPlan = data.minimum_plan || []

  const categoryColors = { '레진': 'var(--primary)', '원석': 'var(--secondary)', '무료': 'var(--tertiary)' }

  const improvementsHtml = improvements.length === 0
    ? `<div style="font-size:0.8125rem;color:var(--on-surface-variant);padding:0.75rem 0">개선 항목이 없습니다.</div>`
    : improvements.map((imp, idx) => {
        const isMinPlan = minPlan.includes(idx)
        const catColor = categoryColors[imp.category] || 'var(--on-surface-variant)'
        const efficiencyBadge = imp.efficiency != null
          ? `<span style="font-size:0.625rem;font-weight:700;padding:0.1875rem 0.4375rem;border-radius:var(--r-full);background:var(--surface-low);color:var(--on-surface-variant)">효율 ${typeof imp.efficiency === 'number' ? imp.efficiency.toFixed(1) : imp.efficiency}</span>`
          : ''
        const minBadge = isMinPlan
          ? `<span style="font-size:0.625rem;font-weight:700;padding:0.1875rem 0.4375rem;border-radius:var(--r-full);background:var(--error);color:var(--on-primary)">최소 필요</span>`
          : ''
        const resinCost = imp.resin_cost != null ? `<span style="font-size:0.75rem;color:var(--on-surface-variant)">레진 ${imp.resin_cost}</span>` : ''

        return `
        <div style="display:flex;align-items:center;gap:0.75rem;padding:0.75rem;background:${isMinPlan ? 'rgba(var(--error-rgb,239,68,68),0.06)' : 'var(--surface-highest)'};border-radius:var(--r-md);margin-bottom:0.5rem;border-left:3px solid ${catColor}">
          <div style="flex-grow:1;min-width:0">
            <div style="font-size:0.875rem;font-weight:600;margin-bottom:0.25rem">${imp.action || ''}</div>
            ${imp.target ? `<div style="font-size:0.75rem;color:var(--on-surface-variant)">${imp.target}</div>` : ''}
          </div>
          <div style="display:flex;flex-direction:column;align-items:flex-end;gap:0.25rem;flex-shrink:0">
            ${imp.score_gain != null ? `<span style="font-size:0.875rem;font-weight:700;color:var(--secondary)">+${imp.score_gain}</span>` : ''}
            <div style="display:flex;gap:0.25rem;flex-wrap:wrap;justify-content:flex-end">
              ${imp.category ? `<span style="font-size:0.625rem;font-weight:700;padding:0.1875rem 0.4375rem;border-radius:var(--r-full);background:${catColor};color:var(--on-primary)">${imp.category}</span>` : ''}
              ${efficiencyBadge}
              ${resinCost}
              ${minBadge}
            </div>
          </div>
        </div>`
      }).join('')

  const totalResin = data.total_resin != null ? data.total_resin : null
  const totalPrimo = data.total_primo != null ? data.total_primo : null

  const costSummaryHtml = (totalResin != null || totalPrimo != null)
    ? `<div style="display:flex;gap:1.5rem;flex-wrap:wrap;padding:0.75rem;background:var(--surface-highest);border-radius:var(--r-md);margin-top:0.75rem">
        ${totalResin != null ? `<div><div style="font-size:0.75rem;color:var(--on-surface-variant)">총 레진 비용</div><div style="font-size:1rem;font-weight:700;color:var(--primary)">${totalResin}</div></div>` : ''}
        ${totalPrimo != null ? `<div><div style="font-size:0.75rem;color:var(--on-surface-variant)">총 원석 비용</div><div style="font-size:1rem;font-weight:700;color:var(--secondary)">${totalPrimo}</div></div>` : ''}
      </div>`
    : ''

  const recommendationHtml = data.overall_recommendation
    ? `<div style="display:flex;align-items:flex-start;gap:0.75rem;padding:1rem;background:var(--surface-highest);border-radius:var(--r-md);margin-top:1rem;border-left:3px solid var(--primary)">
        <span class="material-symbols-outlined" style="color:var(--primary);flex-shrink:0">lightbulb</span>
        <p style="font-size:0.875rem;color:var(--on-surface-variant);margin:0">${data.overall_recommendation}</p>
      </div>`
    : ''

  el.innerHTML = `
    <div>
      <div style="margin-bottom:1rem">${halvesHtml}</div>
      ${improvements.length > 0 ? `
      <div style="font-size:0.875rem;font-weight:700;margin-bottom:0.75rem">개선 계획 (효율순)</div>
      ${improvementsHtml}
      ${costSummaryHtml}` : ''}
      ${recommendationHtml}
    </div>`
}
