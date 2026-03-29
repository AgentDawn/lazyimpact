/**
 * Planner — Theater Prep + Daily Resin + Weekly BP
 */

document.addEventListener('DOMContentLoaded', async () => {
  const prepEl = document.getElementById('theater-prep-content')
  const dailyEl = document.getElementById('daily-plan')
  const bpEl = document.getElementById('weekly-bp')
  const rosterEl = document.getElementById('theater-roster')
  if (!prepEl) return

  let plannerData = null

  try {
    const res = await fetch('/api/planner/recommend')
    if (res.status === 401) { window.location.href = '/login.html'; return }
    if (!res.ok) throw new Error()
    plannerData = await res.json()

    renderRoster(rosterEl, plannerData.roster_status || {}, plannerData.characters_needed || 0, plannerData.difficulty || 'transcendence')
    renderTheaterPrep(prepEl, plannerData.theater_prep || [])
    renderDailyPlan(dailyEl, plannerData.daily_plan || [], plannerData.resin_total || 160)
    renderBP(bpEl, plannerData.bp_missions || [])

    const resinDisplay = document.getElementById('resin-display')
    if (resinDisplay) resinDisplay.textContent = `${plannerData.resin_total || 160}/${plannerData.resin_total || 160}`
  } catch (e) {
    prepEl.innerHTML = '<p style="color:var(--error)">데이터를 불러올 수 없습니다.</p>'
  }

  // Gender preference
  const genderSelect = document.getElementById('pref-gender')
  if (genderSelect && plannerData) {
    genderSelect.value = plannerData.prefer_gender || 'all'
    genderSelect.addEventListener('change', async () => {
      await fetch('/api/me/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prefer_gender: genderSelect.value }),
      })
      location.reload()
    })
  }

  // Load last theater optimization result
  const resultEl = document.getElementById('theater-optimize-result')
  try {
    const latestRes = await fetch('/api/optimize/latest/theater')
    if (latestRes.ok) {
      const latestData = await latestRes.json()
      if (latestData && latestData.members && latestData.members.length > 0) {
        renderTheaterResult(resultEl, latestData)
      }
    }
  } catch {}

  // Wire up theater DFS optimize button
  const btnTheater = document.getElementById('btn-theater-optimize')
  if (btnTheater) {
    btnTheater.addEventListener('click', async () => {
      const progressEl = document.getElementById('theater-optimize-progress')
      btnTheater.disabled = true
      btnTheater.textContent = '최적화 실행 중...'
      try {
        const res = await fetch('/api/optimize/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'theater' }),
        })
        if (res.status === 401) { window.location.href = '/login.html'; return }
        if (!res.ok) throw new Error()
        const { job_id } = await res.json()

        pollOptimizeJob(job_id, progressEl, (result) => {
          btnTheater.disabled = false
          btnTheater.textContent = '환상극 최적화 (DFS 완전탐색)'
          if (resultEl) renderTheaterResult(resultEl, result)
        })
      } catch {
        if (progressEl) progressEl.innerHTML = '<p style="color:var(--error)">최적화 시작 실패</p>'
        btnTheater.disabled = false
        btnTheater.textContent = '환상극 최적화 (DFS 완전탐색)'
      }
    })
  }
})

// --- Roster Status ---
function renderRoster(el, status, needed, difficulty) {
  if (!el) return
  const diffLabel = { normal: '보통', hard: '하드', transcendence: '초월' }
  const elColors = {
    '불': 'var(--pyro)', '물': 'var(--hydro)', '번개': 'var(--electro)',
    '얼음': 'var(--cryo)', '바람': 'var(--anemo)', '바위': 'var(--geo)', '풀': 'var(--dendro)',
  }

  const entries = Object.entries(status)
  if (entries.length === 0) {
    el.innerHTML = '<p style="font-size:0.8125rem;color:var(--on-surface-variant)">시즌 원소 정보 없음</p>'
    return
  }

  let html = `<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.75rem">
    <span style="font-size:0.75rem;color:var(--on-surface-variant)">난이도: <strong style="color:var(--on-surface)">${diffLabel[difficulty] || difficulty}</strong></span>
    ${needed > 0 ? `<span style="font-size:0.75rem;color:var(--error);font-weight:600">${needed}캐릭터 부족</span>` : `<span style="font-size:0.75rem;color:var(--secondary);font-weight:600">준비 완료</span>`}
  </div>`

  html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(8rem,1fr));gap:0.5rem">'
  entries.forEach(([el, s]) => {
    const have = s.have || 0
    const need = s.needed || 0
    const ok = have >= need
    const pct = need > 0 ? Math.min((have / need) * 100, 100) : 100
    const color = elColors[el] || 'var(--primary)'
    html += `<div style="padding:0.625rem;background:var(--surface-highest);border-radius:var(--r-md);border-left:3px solid ${color}">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.375rem">
        <span style="font-size:0.75rem;font-weight:700;color:${color}">${el}</span>
        <span style="font-size:0.6875rem;font-weight:600;color:${ok ? 'var(--secondary)' : 'var(--error)'}">${have}/${need}</span>
      </div>
      <div style="height:4px;background:var(--surface-low);border-radius:2px;overflow:hidden">
        <div style="width:${pct}%;height:100%;background:${ok ? 'var(--secondary)' : color};border-radius:2px;transition:width 0.3s"></div>
      </div>
    </div>`
  })
  html += '</div>'
  el.innerHTML = html
}

// --- Theater Prep Recommendations ---
function renderTheaterPrep(el, recs) {
  if (recs.length === 0) {
    el.innerHTML = `<div style="display:flex;align-items:center;gap:0.75rem;padding:1rem;background:rgba(77,219,206,0.08);border:1px solid rgba(77,219,206,0.2);border-radius:var(--r-md)">
      <span class="material-symbols-outlined" style="color:var(--secondary)">check_circle</span>
      <div>
        <div style="font-size:0.875rem;font-weight:600;color:var(--secondary)">환상극 준비 완료!</div>
        <div style="font-size:0.75rem;color:var(--on-surface-variant);margin-top:0.125rem">모든 원소 캐릭터가 충분합니다. 아래 최적화 버튼으로 최적 조합을 확인하세요.</div>
      </div>
    </div>`
    return
  }

  const isKo = (typeof getLang === 'function' && getLang() === 'ko')
  const lName = (n) => (isKo && typeof charNameEnToKo !== 'undefined' && charNameEnToKo[n]) ? charNameEnToKo[n] : n

  el.innerHTML = recs.map((r) => {
    const prioColors = { 1: 'var(--error)', 2: 'var(--tertiary)', 3: 'var(--on-surface-variant)' }
    const prioLabels = { 1: '긴급', 2: '권장', 3: '참고' }
    const details = (r.details || []).map(d => {
      // Localize character names in detail strings
      if (isKo && typeof charNameEnToKo !== 'undefined') {
        Object.entries(charNameEnToKo).forEach(([en, ko]) => { d = d.replace(en, ko) })
      }
      return `<div style="font-size:0.6875rem;color:var(--on-surface-variant);padding-left:0.5rem;border-left:2px solid var(--outline-variant);margin-top:0.25rem">${d}</div>`
    }).join('')
    return `<div style="padding:0.75rem;background:var(--surface-highest);border-radius:var(--r-md);margin-bottom:0.5rem;border-left:3px solid ${prioColors[r.priority] || 'var(--outline)'}">
      <div style="display:flex;align-items:center;gap:1rem">
        <div style="flex-grow:1">
          <div style="font-size:0.875rem;font-weight:600">${r.title}</div>
          <div style="font-size:0.75rem;color:var(--on-surface-variant);margin-top:0.125rem">${r.reason}</div>
        </div>
        <span style="font-size:0.625rem;font-weight:700;padding:0.25rem 0.5rem;border-radius:var(--r-full);background:${prioColors[r.priority]};color:var(--on-primary)">${prioLabels[r.priority] || ''}</span>
        ${r.resin > 0 ? `<span style="font-size:0.75rem;color:var(--primary);font-weight:700">${r.resin} 레진</span>` : ''}
      </div>
      ${details}
    </div>`
  }).join('')
}

// --- Theater DFS Result ---
function renderTheaterResult(el, result) {
  if (!el || !result) return

  const members = result.members || []
  if (members.length === 0) {
    el.innerHTML = '<p style="color:var(--on-surface-variant);font-size:0.875rem">최적화 결과 없음</p>'
    return
  }

  const season = result.season || {}
  const totalScore = Math.round(result.total_score || 0)

  let html = `<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1rem;padding:0.75rem;background:rgba(175,198,255,0.08);border:1px solid rgba(175,198,255,0.2);border-radius:var(--r-md)">
    <div>
      <div style="font-size:0.875rem;font-weight:700">${season.title || '환상극'} 최적 조합</div>
      <div style="font-size:0.75rem;color:var(--on-surface-variant)">DFS 완전탐색 · ${members.length}캐릭터 선택</div>
    </div>
    <div style="text-align:right">
      <div style="font-size:1.25rem;font-weight:800;color:var(--primary)">${totalScore.toLocaleString()}</div>
      <div style="font-size:0.625rem;color:var(--on-surface-variant)">종합 점수</div>
    </div>
  </div>`

  // Borrow recommendation
  const borrow = result.borrow_recommendation
  if (borrow) {
    const isKo = (typeof getLang === 'function' && getLang() === 'ko')
    const borrowName = (isKo && typeof charNameEnToKo !== 'undefined' && charNameEnToKo[borrow.name]) ? charNameEnToKo[borrow.name] : borrow.name
    html += `<div style="display:flex;align-items:center;gap:1rem;padding:0.75rem;margin-bottom:1rem;background:rgba(77,219,206,0.08);border:1px solid rgba(77,219,206,0.2);border-radius:var(--r-md)">
      <span class="material-symbols-outlined" style="font-size:1.5rem;color:var(--secondary)">person_add</span>
      <div style="flex:1">
        <div style="font-size:0.875rem;font-weight:700;color:var(--secondary)">빌려올 추천: ${borrowName}</div>
        <div style="font-size:0.75rem;color:var(--on-surface-variant)">${borrow.element} 원소 · ${borrow.reason}</div>
      </div>
    </div>`
  }

  // Localization helpers (from app.js globals)
  const isKo = (typeof getLang === 'function' && getLang() === 'ko')
  const lChar = (name) => {
    if (!isKo) return name
    if (typeof charNameEnToKo !== 'undefined' && charNameEnToKo[name]) return charNameEnToKo[name]
    if (typeof localizeCharName === 'function') return localizeCharName(name)
    return name
  }
  const lSet = (key) => (isKo && typeof setNameKo !== 'undefined') ? (setNameKo[key] || key) : key
  const lSlot = (key) => {
    const ko = { flower: '꽃', plume: '깃털', sands: '모래', goblet: '성배', circlet: '왕관' }
    return isKo ? (ko[key] || key) : key
  }
  const lWeapon = (name) => {
    if (!name) return ''
    if (isKo && typeof weaponNameKo !== 'undefined' && weaponNameKo[name]) return weaponNameKo[name]
    if (typeof localizeWeaponName === 'function') { const r = localizeWeaponName(name); if (r && r !== name) return r }
    return name.replace(/([A-Z])/g, ' $1').trim()
  }

  const elColors = {
    '불': 'var(--pyro)', '물': 'var(--hydro)', '번개': 'var(--electro)',
    '얼음': 'var(--cryo)', '바람': 'var(--anemo)', '바위': 'var(--geo)', '풀': 'var(--dendro)',
  }

  html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(16rem,1fr));gap:0.75rem">'
  members.forEach((m) => {
    const char = m.character || {}
    const charName = lChar(char.name || '?')
    const charLevel = char.level || 0
    const charElement = char.element || ''
    const score = Math.round(m.score || 0)
    const weapon = m.weapon || {}
    const artifacts = m.artifacts || []
    const imps = m.improvements || []

    const borderColor = elColors[charElement] || 'var(--outline-variant)'

    // Artifact set summary (localized)
    const setCounts = {}
    artifacts.forEach(a => {
      const sn = a.set_name || ''
      if (sn) setCounts[sn] = (setCounts[sn] || 0) + 1
    })
    const setHTML = Object.entries(setCounts).map(([k, v]) => {
      return `<span style="font-size:0.625rem;padding:0.125rem 0.375rem;background:var(--surface-low);border-radius:var(--r-sm)">${lSet(k)} ×${v}</span>`
    }).join(' ')

    // Improvements
    const impHTML = imps.length > 0
      ? imps.map(imp => `<div style="font-size:0.625rem;color:var(--error);display:flex;align-items:center;gap:0.25rem"><span class="material-symbols-outlined" style="font-size:0.75rem">warning</span>${imp}</div>`).join('')
      : ''

    // Artifact slot thumbnails
    const slotOrder = ['flower', 'plume', 'sands', 'goblet', 'circlet']
    const artBySlot = {}
    artifacts.forEach(a => { if (a.slot) artBySlot[a.slot] = a })
    const artThumbHTML = slotOrder.map(slot => {
      const a = artBySlot[slot]
      if (!a) return `<div style="width:2rem;height:2rem;border-radius:var(--r-sm);background:var(--surface-low);display:flex;align-items:center;justify-content:center"><span class="material-symbols-outlined" style="font-size:0.875rem;color:var(--outline)">close</span></div>`
      return `<img src="assets/artifacts/${a.set_name}/${slot}.png" alt="${lSlot(slot)}" title="${lSet(a.set_name)} · ${lSlot(slot)}" style="width:2rem;height:2rem;object-fit:contain;border-radius:var(--r-sm);background:var(--surface-low)" onerror="this.style.display='none'"/>`
    }).join('')

    html += `<div style="background:var(--surface-container);border-radius:var(--r-xl);overflow:hidden;border-top:3px solid ${borderColor}">
      <div style="padding:0.875rem">
        <div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:0.5rem">
          <img src="assets/chars/${(char.name||'').replace(/\s+/g,'')}.png" alt="${charName}" onerror="this.style.display='none'" style="width:2.5rem;height:2.5rem;border-radius:50%;object-fit:cover;background:var(--surface-low);flex-shrink:0;border:2px solid ${borderColor}"/>
          <div style="flex:1;min-width:0">
            <div style="display:flex;align-items:center;gap:0.375rem">
              ${charElement ? `<span style="font-size:0.5625rem;font-weight:700;padding:0.0625rem 0.3rem;border-radius:var(--r-sm);background:${borderColor};color:var(--surface)">${charElement}</span>` : ''}
              <span style="font-size:0.875rem;font-weight:700">${charName}</span>
              <span style="font-size:0.6875rem;color:var(--on-surface-variant)">Lv.${charLevel}</span>
            </div>
          </div>
          <span style="font-size:0.875rem;font-weight:800;color:var(--primary);flex-shrink:0">${score.toLocaleString()}</span>
        </div>
        ${weapon.name ? `<div style="font-size:0.6875rem;color:var(--on-surface-variant);margin-bottom:0.5rem">무기: ${lWeapon(weapon.name)} Lv.${weapon.level || 0}</div>` : ''}
        <div style="display:flex;gap:0.25rem;margin-bottom:0.5rem">${artThumbHTML}</div>
        <div style="display:flex;flex-wrap:wrap;gap:0.25rem;margin-bottom:0.375rem">${setHTML}</div>
        ${impHTML}
      </div>
    </div>`
  })
  html += '</div>'

  el.innerHTML = html
  el.style.display = ''
}

// --- Daily Plan ---
function renderDailyPlan(el, plan, total) {
  const isKo = (typeof getLang === 'function' && getLang() === 'ko')
  // Localize character/weapon names in title and reason strings
  function localize(text) {
    if (!isKo || !text) return text
    if (typeof weaponNameKo !== 'undefined') {
      Object.entries(weaponNameKo).sort((a, b) => b[0].length - a[0].length).forEach(([en, ko]) => { text = text.replace(en, ko) })
    }
    if (typeof charNameEnToKo !== 'undefined') {
      Object.entries(charNameEnToKo).sort((a, b) => b[0].length - a[0].length).forEach(([en, ko]) => { text = text.replace(en, ko) })
    }
    return text
  }

  let used = 0
  const rows = plan.map((p) => {
    used += p.resin
    return `<div style="display:flex;align-items:center;gap:1rem;padding:0.75rem;background:var(--surface-container);border-radius:var(--r-md);margin-bottom:0.5rem">
      <span class="material-symbols-outlined" style="font-size:1.25rem;color:var(--primary)">${getCategoryIcon(p.category)}</span>
      <div style="flex-grow:1">
        <div style="font-size:0.875rem;font-weight:600">${localize(p.title)}</div>
        <div style="font-size:0.75rem;color:var(--on-surface-variant)">${localize(p.reason)}</div>
      </div>
      <span style="font-size:0.875rem;font-weight:700;color:var(--primary)">${p.resin}</span>
    </div>`
  }).join('')

  const pct = Math.min((used / total) * 100, 100)
  el.innerHTML = `
    <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:1rem">
      <div style="flex-grow:1;height:0.5rem;background:var(--surface-highest);border-radius:var(--r-full);overflow:hidden">
        <div style="width:${pct}%;height:100%;background:linear-gradient(90deg,var(--primary),var(--secondary));border-radius:var(--r-full);transition:width 0.5s"></div>
      </div>
      <span style="font-size:0.75rem;color:var(--on-surface-variant);white-space:nowrap">${used}/${total} 레진</span>
    </div>
    ${rows}`
}

// --- BP ---
function renderBP(el, missions) {
  if (missions.length === 0) {
    el.innerHTML = '<p style="font-size:0.875rem;color:var(--on-surface-variant)">기행 미션 없음</p>'
    return
  }

  const total = missions.length
  const done = missions.filter((m) => intV(m.done)).length

  el.innerHTML = `
    <div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:1rem">
      <span style="font-size:0.875rem;font-weight:700">${done}/${total} 완료</span>
      <div style="flex-grow:1;height:0.375rem;background:var(--surface-highest);border-radius:var(--r-full);overflow:hidden">
        <div style="width:${(done/total)*100}%;height:100%;background:var(--secondary);border-radius:var(--r-full)"></div>
      </div>
    </div>
    ${missions.map((m) => {
      const isDone = intV(m.done)
      const pct = intV(m.target) > 0 ? Math.min((intV(m.progress) / intV(m.target)) * 100, 100) : 0
      return `<div style="display:flex;align-items:center;gap:1rem;padding:0.625rem;margin-bottom:0.375rem;background:${isDone ? 'rgba(77,219,206,0.08)' : 'var(--surface-highest)'};border-radius:var(--r-md)">
        <button onclick="toggleBP(${intV(m.id)}, ${intV(m.progress)}, ${intV(m.target)})" style="width:1.25rem;height:1.25rem;border-radius:var(--r-sm);border:2px solid ${isDone ? 'var(--secondary)' : 'var(--outline)'};background:${isDone ? 'var(--secondary)' : 'transparent'};display:flex;align-items:center;justify-content:center;flex-shrink:0;cursor:pointer">
          ${isDone ? '<span class="material-symbols-outlined" style="font-size:0.875rem;color:var(--on-secondary)">check</span>' : ''}
        </button>
        <div style="flex-grow:1">
          <div style="font-size:0.8125rem;${isDone ? 'text-decoration:line-through;color:var(--on-surface-variant)' : ''}">${strV(m.mission)}</div>
          <div style="height:0.25rem;background:var(--surface-low);border-radius:var(--r-full);margin-top:0.375rem;overflow:hidden">
            <div style="width:${pct}%;height:100%;background:${isDone ? 'var(--secondary)' : 'var(--primary)'};border-radius:var(--r-full)"></div>
          </div>
        </div>
        <span style="font-size:0.75rem;color:var(--on-surface-variant);white-space:nowrap">${intV(m.progress)}/${intV(m.target)}</span>
      </div>`
    }).join('')}
    <button onclick="resetBP()" style="margin-top:0.75rem;font-size:0.75rem;color:var(--on-surface-variant);text-decoration:underline;cursor:pointer;background:none;border:none">미션 초기화</button>`
}

function getCategoryIcon(cat) {
  const icons = {
    '환상극': 'theater_comedy', '성유물': 'diamond', '특성': 'menu_book',
    '보스': 'skull', '무기': 'swords', '경험치': 'trending_up',
  }
  return icons[cat] || 'task'
}

function intV(v) { return typeof v === 'number' ? v : parseInt(v) || 0 }
function strV(v) { return v == null ? '' : String(v) }

async function toggleBP(id, current, target) {
  const newProgress = current >= target ? 0 : target
  await fetch(`/api/planner/bp/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ progress: newProgress }),
  })
  location.reload()
}

async function resetBP() {
  await fetch('/api/planner/bp/reset', { method: 'POST' })
  location.reload()
}
