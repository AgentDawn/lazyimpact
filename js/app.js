/**
 * LazyImpact — API-driven Vanilla JS
 */

// --- Auth Check ---
async function checkAuth() {
  try {
    const res = await fetch('/api/me')
    if (!res.ok) throw new Error()
    const data = await res.json()
    // Apply user's language preference from server
    if (data.lang && typeof setLang === 'function') {
      setLang(data.lang, false) // false = don't save back to server
    }
    // Show username in nav
    const navActions = document.querySelector('.nav__actions')
    if (navActions && data.username) {
      navActions.innerHTML = `
        <span style="font-size:0.75rem;color:var(--on-surface-variant)">${data.username}</span>
        <button class="nav__icon-btn" id="btn-logout">
          <span class="material-symbols-outlined">logout</span>
        </button>`
      document.getElementById('btn-logout').addEventListener('click', async () => {
        await fetch('/api/logout', { method: 'POST' })
        window.location.href = '/login.html'
      })
    }
    return data
  } catch {
    window.location.href = '/login.html'
    return null
  }
}

// --- API Client ---
const api = {
  async get(path) {
    const res = await fetch(`/api${path}`)
    if (res.status === 401) { window.location.href = '/login.html'; return }
    if (!res.ok) throw new Error(`GET ${path}: ${res.status}`)
    return res.json()
  },
  async post(path, data) {
    const res = await fetch(`/api${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (res.status === 401) { window.location.href = '/login.html'; return }
    if (!res.ok) throw new Error(`POST ${path}: ${res.status}`)
    return res.json()
  },
  async del(path) {
    const res = await fetch(`/api${path}`, { method: 'DELETE' })
    if (res.status === 401) { window.location.href = '/login.html'; return }
    if (!res.ok) throw new Error(`DELETE ${path}: ${res.status}`)
  },
}

// --- Nav active state ---
const rawPage = window.location.pathname.split('/').pop() || ''
const currentPage = rawPage.replace('.html', '') || 'index'
document.querySelectorAll('.nav__link').forEach((link) => {
  link.classList.remove('nav__link--active')
  const href = (link.getAttribute('href') || '').replace('.html', '') || 'index'
  if (href === currentPage || (currentPage === 'index' && (href === 'index' || href === ''))) {
    link.classList.add('nav__link--active')
  }
})

// --- Helpers ---
function $(sel, parent = document) { return parent.querySelector(sel) }
function $$(sel, parent = document) { return [...parent.querySelectorAll(sel)] }
function el(tag, cls, html) {
  const e = document.createElement(tag)
  if (cls) e.className = cls
  if (html) e.innerHTML = html
  return e
}
function fmt(n) {
  return typeof n === 'number' ? n.toLocaleString() : n
}

// --- Inline Import Handler (shared by artifacts + home empty states) ---
function bindInlineImport(dropZoneId, fileInputId, resultDivId, onSuccess) {
  const dropZone = document.getElementById(dropZoneId)
  const fileInput = document.getElementById(fileInputId)
  const resultDiv = document.getElementById(resultDivId)
  if (!dropZone || !fileInput) return

  dropZone.addEventListener('click', () => fileInput.click())

  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault()
    dropZone.style.borderColor = 'var(--primary)'
    dropZone.style.background = 'rgba(175,198,255,0.05)'
  })

  dropZone.addEventListener('dragleave', () => {
    dropZone.style.borderColor = ''
    dropZone.style.background = ''
  })

  dropZone.addEventListener('drop', (e) => {
    e.preventDefault()
    dropZone.style.borderColor = ''
    dropZone.style.background = ''
    const file = e.dataTransfer.files[0]
    if (file) handleInlineImport(file, dropZone, resultDiv, onSuccess)
  })

  fileInput.addEventListener('change', (e) => {
    if (e.target.files[0]) handleInlineImport(e.target.files[0], dropZone, resultDiv, onSuccess)
    fileInput.value = ''
  })
}

async function handleInlineImport(file, dropZone, resultDiv, onSuccess) {
  if (!resultDiv) return
  resultDiv.style.display = 'block'
  dropZone.style.display = 'none'
  resultDiv.innerHTML = '<div style="display:flex;align-items:center;gap:0.75rem;">' +
    '<span class="material-symbols-outlined" style="color:var(--primary);">sync</span>' +
    '<span style="font-weight:600;font-size:0.875rem;">데이터 가져오는 중...</span></div>'
  const icon = resultDiv.querySelector('span')
  icon.animate([{ transform: 'rotate(0deg)' }, { transform: 'rotate(360deg)' }], { duration: 1000, iterations: Infinity })

  try {
    const text = await file.text()
    const data = JSON.parse(text)

    if (data.format !== 'GOOD') {
      throw new Error('GOOD 포맷이 아닙니다. Irminsul에서 GOOD 포맷으로 내보내세요.')
    }

    const res = await fetch('/api/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: text,
    })

    if (res.status === 401) {
      window.location.href = '/login.html'
      return
    }
    if (!res.ok) throw new Error('Import 실패')

    const result = await res.json()
    resultDiv.innerHTML = '<div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.75rem">' +
      '<span class="material-symbols-outlined" style="color:var(--secondary)">check_circle</span>' +
      '<span style="font-weight:700;font-size:0.875rem">Import 완료!</span></div>' +
      '<div style="font-size:0.875rem;color:var(--on-surface-variant);">' +
      '캐릭터 ' + (result.characters || 0) + '개, 성유물 ' + (result.artifacts || 0) + '개, 무기 ' + (result.weapons || 0) + '개 가져오기 완료!</div>'

    if (onSuccess) {
      setTimeout(() => onSuccess(result), 1200)
    }
  } catch (err) {
    dropZone.style.display = ''
    resultDiv.innerHTML = '<div style="display:flex;align-items:center;gap:0.5rem">' +
      '<span class="material-symbols-outlined" style="color:var(--error)">error</span>' +
      '<span style="color:var(--error);font-size:0.875rem">' + err.message + '</span></div>'
  }
}

// --- Toast notification ---
function showToast(message) {
  const toast = document.createElement('div')
  toast.style.cssText = 'position:fixed;bottom:2rem;left:50%;transform:translateX(-50%);background:var(--surface-highest);color:var(--on-surface);padding:0.75rem 1.5rem;border-radius:var(--r-md);font-size:0.875rem;font-weight:600;box-shadow:0 4px 24px rgba(0,0,0,0.3);z-index:9999;display:flex;align-items:center;gap:0.5rem;'
  toast.innerHTML = '<span class="material-symbols-outlined" style="color:var(--secondary);font-size:1.25rem;">check_circle</span>' + message
  document.body.appendChild(toast)
  setTimeout(() => {
    toast.style.transition = 'opacity 0.4s'
    toast.style.opacity = '0'
    setTimeout(() => toast.remove(), 400)
  }, 3000)
}

// --- Page: Home (index) ---
async function initHome() {
  const container = $('#home-grid')
  if (!container) return

  const [chars, artifacts, weapons] = await Promise.all([
    api.get('/characters'),
    api.get('/artifacts'),
    api.get('/weapons'),
  ])
  if (!chars || !artifacts || !weapons) return

  const homeEmpty = $('#home-empty-state')
  const homeActions = $('#home-actions')

  // No data → show onboarding guide
  if (chars.length === 0 && artifacts.length === 0 && weapons.length === 0) {
    if (homeEmpty) {
      homeEmpty.style.display = ''
      bindInlineImport('home-drop-zone', 'home-import-file', 'home-import-result', async (result) => {
        showToast('Import 완료! 성유물 ' + (result.artifacts || 0) + '개가 추가되었습니다')
        // Auto-trigger optimizations
        await autoOptimizeAfterImport()
        initHome()
      })
    }
    return
  }

  // Has data → show action guide
  if (homeEmpty) homeEmpty.style.display = 'none'
  if (homeActions) homeActions.style.display = ''

  // Fetch planner recommendations for actionable items
  let planner = null
  try { planner = await api.get('/planner/recommend') } catch {}

  // Fetch smart discard count
  let discardCount = 0
  try {
    const sd = await api.get('/artifacts/smart-discard?threshold=35')
    discardCount = (sd && sd.candidates) ? sd.candidates.length : 0
  } catch {}

  // Build action cards
  const todoEl = $('#home-todo-cards')
  if (todoEl) {
    let cards = ''

    // 1. Smart discard
    if (discardCount > 0) {
      cards += actionCard('auto_delete', '폐기할 성유물 ' + discardCount + '개 발견',
        '기준 35점 이하 · 클릭하여 기준 조절 및 상세 확인',
        'smart-discard.html', 'var(--error)')
    }

    // 2. Theater prep — show each item with details inline (priority 1-2 only, skip 3=참고)
    if (planner && planner.theater_prep && planner.theater_prep.length > 0) {
      const isKo = (typeof getLang === 'function' && getLang() === 'ko')
      planner.theater_prep.filter(r => r.priority <= 2).forEach(r => {
        let detailsHTML = ''
        if (r.details && r.details.length > 0) {
          const localizedDetails = r.details.map(d => {
            if (isKo && typeof charNameEnToKo !== 'undefined') {
              Object.entries(charNameEnToKo).forEach(([en, ko]) => { d = d.replace(en, ko) })
            }
            return d
          })
          detailsHTML = '<div style="margin-top:0.375rem">' + localizedDetails.map(d =>
            `<div style="font-size:0.6875rem;color:var(--on-surface-variant);padding:0.25rem 0 0.25rem 0.5rem;border-left:2px solid var(--outline-variant)">${d}</div>`
          ).join('') + '</div>'
        }
        const prioColors = { 1: 'var(--error)', 2: 'var(--tertiary)', 3: 'var(--on-surface-variant)' }
        cards += `<div style="padding:1rem;background:var(--surface-container);border-radius:var(--r-xl);border-left:3px solid ${prioColors[r.priority] || 'var(--tertiary)'}">
          <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.25rem">
            <span class="material-symbols-outlined" style="font-size:1.25rem;color:var(--tertiary)">theater_comedy</span>
            <span style="font-size:0.875rem;font-weight:700">${r.title}</span>
            ${r.resin > 0 ? `<span style="font-size:0.75rem;color:var(--primary);font-weight:700;margin-left:auto">${r.resin} 레진</span>` : ''}
          </div>
          <div style="font-size:0.75rem;color:var(--on-surface-variant)">${r.reason}</div>
          ${detailsHTML}
        </div>`
      })
    } else if (planner) {
      cards += `<div style="padding:1rem;background:var(--surface-container);border-radius:var(--r-xl);border-left:3px solid var(--secondary)">
        <div style="display:flex;align-items:center;gap:0.5rem">
          <span class="material-symbols-outlined" style="font-size:1.25rem;color:var(--secondary)">check_circle</span>
          <span style="font-size:0.875rem;font-weight:700;color:var(--secondary)">환상극 준비 완료</span>
        </div>
        <div style="font-size:0.75rem;color:var(--on-surface-variant);margin-top:0.25rem">모든 원소 캐릭터가 충분합니다. 아래에서 최적 조합을 확인하세요.</div>
      </div>`
    }

    // 3. Daily resin — show all items inline
    if (planner && planner.daily_plan && planner.daily_plan.length > 0) {
      const isKoHome = (typeof getLang === 'function' && getLang() === 'ko')
      function localizeText(text) {
        if (!isKoHome || !text) return text
        // Weapon names first (longer keys like PrototypeAmber before Amber)
        if (typeof weaponNameKo !== 'undefined') {
          Object.entries(weaponNameKo).sort((a, b) => b[0].length - a[0].length).forEach(([en, ko]) => { text = text.replace(en, ko) })
        }
        if (typeof charNameEnToKo !== 'undefined') {
          Object.entries(charNameEnToKo).sort((a, b) => b[0].length - a[0].length).forEach(([en, ko]) => { text = text.replace(en, ko) })
        }
        return text
      }
      let resinItems = planner.daily_plan.map(p =>
        `<div style="display:flex;align-items:center;gap:0.75rem;padding:0.5rem 0;border-bottom:1px solid var(--outline-variant)">
          <span style="font-size:0.8125rem;flex:1">${localizeText(p.title)}</span>
          <span style="font-size:0.6875rem;color:var(--on-surface-variant)">${localizeText(p.reason)}</span>
          <span style="font-size:0.75rem;font-weight:700;color:var(--primary);white-space:nowrap">${p.resin} 레진</span>
        </div>`
      ).join('')
      const totalResin = planner.daily_plan.reduce((s, p) => s + p.resin, 0)
      cards += `<div style="padding:1rem;background:var(--surface-container);border-radius:var(--r-xl);border-left:3px solid var(--primary)">
        <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.5rem">
          <span class="material-symbols-outlined" style="font-size:1.25rem;color:var(--primary)">bolt</span>
          <span style="font-size:0.875rem;font-weight:700">오늘의 레진 계획</span>
          <span style="font-size:0.75rem;color:var(--primary);font-weight:700;margin-left:auto">${totalResin}/160</span>
        </div>
        ${resinItems}
      </div>`
    }

    // 4. Summary line
    cards += `<div style="font-size:0.75rem;color:var(--on-surface-variant);padding:0.5rem 0">
      캐릭터 ${chars.length}명 · 성유물 ${fmt(artifacts.length)}개 · 무기 ${weapons.length}개 보유 중
    </div>`

    todoEl.innerHTML = cards
  }

  // Build shortcuts
  const shortcutsEl = $('#home-shortcuts')
  if (shortcutsEl) {
    shortcutsEl.innerHTML = [
      shortcut('diamond', '성유물', 'artifacts.html', 'var(--secondary)'),
      shortcut('auto_delete', '스마트 폐기', 'smart-discard.html', 'var(--error)'),
      shortcut('swords', '나선비경', 'abyss.html', 'var(--hydro)'),
    ].join('')
  }

}

async function autoOptimizeAfterImport() {
  // Save gender preference if set
  const genderSelect = document.getElementById('home-pref-gender')
  if (genderSelect && genderSelect.value !== 'all') {
    await fetch('/api/me/preferences', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prefer_gender: genderSelect.value }),
    }).catch(() => {})
  }

  // Show progress overlay
  const overlay = document.createElement('div')
  overlay.style.cssText = 'position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,0.8);backdrop-filter:blur(8px);display:flex;flex-direction:column;align-items:center;justify-content:center;color:#fff;font-family:var(--font,sans-serif)'
  overlay.innerHTML = `
    <div style="width:3rem;height:3rem;border:3px solid rgba(255,255,255,0.2);border-top-color:#fff;border-radius:50%;animation:spin 0.8s linear infinite;margin-bottom:1.5rem"></div>
    <h2 id="opt-status" style="font-size:1.25rem;font-weight:700;margin:0">최적화 실행 중...</h2>
    <p id="opt-detail" style="color:rgba(255,255,255,0.6);margin-top:0.5rem;font-size:0.875rem">환상극 + 나선비경 팀을 분석하고 있습니다</p>
    <div style="width:16rem;height:6px;background:rgba(255,255,255,0.1);border-radius:3px;margin-top:1.5rem;overflow:hidden">
      <div id="opt-bar" style="width:0%;height:100%;background:linear-gradient(90deg,var(--primary,#afc6ff),var(--secondary,#4ddbce));border-radius:3px;transition:width 0.5s"></div>
    </div>
    <span id="opt-pct" style="font-size:0.75rem;color:rgba(255,255,255,0.4);margin-top:0.5rem">0%</span>
  `
  document.body.appendChild(overlay)
  const statusEl = overlay.querySelector('#opt-status')
  const detailEl = overlay.querySelector('#opt-detail')
  const barEl = overlay.querySelector('#opt-bar')
  const pctEl = overlay.querySelector('#opt-pct')

  try {
    const res = await fetch('/api/optimize/start', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({type:'all'}) })
    if (res.ok) {
      const { job_id } = await res.json()
      for (let i = 0; i < 60; i++) {
        await new Promise(r => setTimeout(r, 1000))
        try {
          const status = await (await fetch(`/api/optimize/status/${job_id}`)).json()
          const pct = status.progress || 0
          barEl.style.width = pct + '%'
          pctEl.textContent = pct + '%'
          if (pct < 50) {
            detailEl.textContent = '환상극 팀을 분석하고 있습니다'
          } else {
            detailEl.textContent = '나선비경 팀을 분석하고 있습니다'
          }
          if (status.status === 'done') {
            statusEl.textContent = '최적화 완료!'
            detailEl.textContent = '잠시 후 결과를 표시합니다'
            barEl.style.width = '100%'
            pctEl.textContent = '100%'
            await new Promise(r => setTimeout(r, 1000))
            break
          }
          if (status.status === 'error') break
        } catch { break }
      }
    }
  } catch {}
  document.body.removeChild(overlay)
}

function actionCard(icon, title, desc, href, color) {
  return `<a href="${href}" style="display:flex;align-items:center;gap:1rem;padding:1rem;background:var(--surface-container);border-radius:var(--r-xl);text-decoration:none;transition:transform 0.15s,background 0.15s;border-left:3px solid ${color}" onmouseover="this.style.transform='translateX(4px)';this.style.background='var(--surface-high)'" onmouseout="this.style.transform='';this.style.background=''">
    <span class="material-symbols-outlined" style="font-size:1.5rem;color:${color};flex-shrink:0">${icon}</span>
    <div style="flex:1;min-width:0">
      <div style="font-size:0.875rem;font-weight:700;color:var(--on-surface)">${title}</div>
      <div style="font-size:0.75rem;color:var(--on-surface-variant);margin-top:0.125rem">${desc}</div>
    </div>
    <span class="material-symbols-outlined" style="font-size:1rem;color:var(--outline);flex-shrink:0">chevron_right</span>
  </a>`
}

function shortcut(icon, label, href, color) {
  return `<a href="${href}" style="display:flex;flex-direction:column;align-items:center;gap:0.5rem;padding:1rem;background:var(--surface-container);border-radius:var(--r-xl);text-decoration:none;transition:transform 0.15s" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform=''">
    <span class="material-symbols-outlined" style="font-size:1.5rem;color:${color}">${icon}</span>
    <span style="font-size:0.75rem;font-weight:600;color:var(--on-surface)">${label}</span>
  </a>`
}

// --- Page: Characters ---
async function initCharacters() {
  const nameEl = $('.character-name')
  if (!nameEl) return

  // charNameEnToKo loaded statically

  const params = new URLSearchParams(window.location.search)
  const charId = params.get('id') || '1'

  const chars = await api.get('/characters')
  if (!chars) return
  const char = chars.find((c) => String(c.id) === charId) || chars[0]
  if (!char) return

  nameEl.textContent = localizeCharName(char.name)
  $('.character-subtitle').textContent = `${localizeElement(char.element)} • ${localizeWeaponType(char.weapon_type)}`
  const portrait = $('.character-portrait img')
  if (portrait) { portrait.src = charIconPath(char.name) || char.icon; portrait.alt = localizeCharName(char.name) }
  if ($('.weapon-slot__name')) $('.weapon-slot__name').textContent = localizeWeaponName(char.weapon_name) || '—'

  // Stats
  const statValues = $$('.stat__value')
  const stats = [
    { v: char.hp, diff: null },
    { v: char.atk },
    { v: char.crit_rate, unit: '%' },
    { v: char.crit_dmg, unit: '%' },
    { v: char.energy_recharge, unit: '%', highlight: true },
    { v: char.elemental_mastery },
  ]
  stats.forEach((s, i) => {
    if (!statValues[i]) return
    let html = fmt(s.v)
    if (s.unit) html += `<span class="stat__unit">${s.unit}</span>`
    if (s.highlight) statValues[i].classList.add('stat__value--highlight')
    statValues[i].innerHTML = html
  })

  // Optimizer results (from builds)
  const builds = await api.get('/builds')
  if (!builds) return
  const charBuilds = builds.filter((b) => b.character_name === char.name)
  const resultsContainer = $('#results-list')
  if (resultsContainer && charBuilds.length > 0) {
    resultsContainer.innerHTML = ''
    const countEl = $('.results-header__count')
    if (countEl) countEl.textContent = `Found ${charBuilds.length} build(s)`

    charBuilds.forEach((build, idx) => {
      resultsContainer.innerHTML += `
        <div class="result-card">
          <div class="result-card__inner">
            <div class="result-card__rank">
              <div class="result-card__avatar">
                <img alt="${build.character_name}" src="${build.icon || char.icon}"/>
                <div class="result-card__badge${idx > 0 ? ' result-card__badge--dim' : ''}">#${idx + 1}</div>
              </div>
              <div style="text-align:center">
                <div class="result-card__dmg-label">Est. DMG</div>
                <div class="result-card__dmg-value${idx > 0 ? ' result-card__dmg-value--dim' : ''}">${fmt(build.est_dmg)}</div>
              </div>
            </div>
            <div style="flex-grow:1">
              <h3 style="font-weight:700;font-size:0.875rem">${build.build_name}</h3>
              <p style="font-size:0.75rem;color:var(--on-surface-variant);margin-top:0.25rem">${build.description || ''}</p>
            </div>
            <div class="result-card__action">
              <button class="btn-apply">Load Build</button>
            </div>
          </div>
        </div>`
    })
  }

  // Range sliders
  $$('input[type="range"]').forEach((range) => {
    range.addEventListener('input', () => {
      const header = range.previousElementSibling
      if (!header) return
      const valueEl = header.querySelector('.range-header__value')
      if (valueEl) valueEl.textContent = range.value + '%'
    })
  })
}

// --- Artifact Dictionaries ---
const statNameKo = {
  hp: 'HP', hp_: 'HP%', atk: '공격력', atk_: '공격력%', def: '방어력', def_: '방어력%',
  eleMas: '원소 마스터리', enerRech_: '원소 충전 효율', critRate_: '치명타 확률', critDMG_: '치명타 피해',
  heal_: '치유 보너스', physical_dmg_: '물리 피해 보너스', pyro_dmg_: '불 원소 피해 보너스',
  hydro_dmg_: '물 원소 피해 보너스', cryo_dmg_: '얼음 원소 피해 보너스', electro_dmg_: '번개 원소 피해 보너스',
  anemo_dmg_: '바람 원소 피해 보너스', geo_dmg_: '바위 원소 피해 보너스', dendro_dmg_: '풀 원소 피해 보너스'
}
const statNameEn = {
  hp: 'HP', hp_: 'HP%', atk: 'ATK', atk_: 'ATK%', def: 'DEF', def_: 'DEF%',
  eleMas: 'Elemental Mastery', enerRech_: 'Energy Recharge', critRate_: 'CRIT Rate', critDMG_: 'CRIT DMG',
  heal_: 'Healing Bonus', physical_dmg_: 'Physical DMG', pyro_dmg_: 'Pyro DMG',
  hydro_dmg_: 'Hydro DMG', cryo_dmg_: 'Cryo DMG', electro_dmg_: 'Electro DMG',
  anemo_dmg_: 'Anemo DMG', geo_dmg_: 'Geo DMG', dendro_dmg_: 'Dendro DMG'
}
const slotNameKo = {
  flower: '생명의 꽃', plume: '죽음의 깃털', sands: '시간의 모래', goblet: '공간의 성배', circlet: '이성의 왕관'
}
const setNameKo = {
  GladiatorsFinale: '검투사의 피날레', WanderersTroupe: '대지를 유랑하는 악단',
  ThunderingFury: '번개 같은 분노', Thundersoother: '뇌명을 평정한 존자',
  ViridescentVenerer: '청록색 그림자', MaidenBeloved: '사랑받는 소녀',
  NoblesseOblige: '옛 왕실의 의식', RetracingBolide: '날아오르는 유성',
  CrimsonWitchOfFlames: '불타오르는 화염의 마녀', Lavawalker: '불 위를 걷는 현인',
  BloodstainedChivalry: '피에 물든 기사도', ArchaicPetra: '유구한 반암',
  BlizzardStrayer: '얼음바람 속에서 길잃은 용사', HeartOfDepth: '몰락한 마음',
  TenacityOfTheMillelith: '견고한 천암', PaleFlame: '창백의 화염',
  ShimenawasReminiscence: '추억의 시메나와', EmblemOfSeveredFate: '절연의 기치',
  OceanHuedClam: '바다에 물든 거대 조개', HuskOfOpulentDreams: '풍요로운 꿈의 껍데기',
  VermillionHereafter: '진사 왕생록', EchoesOfAnOffering: '제사의 여운',
  DeepwoodMemories: '숲의 기억', GildedDreams: '도금된 꿈',
  DesertPavilionChronicle: '모래 위 누각의 역사', FlowerOfParadiseLost: '잃어버린 낙원의 꽃',
  NymphsDream: '님프의 꿈', VourukashasGlow: '감로빛 꽃바다',
  MarechausseeHunter: '그림자 사냥꾼', GoldenTroupe: '황금 극단',
  SongOfDaysPast: '지난날의 노래', NighttimeWhispersInTheEchoingWoods: '메아리숲의 야화',
  FragmentOfHarmonicWhimsy: '조화로운 공상의 단편', UnfinishedReverie: '미완의 몽상',
  ScrollOfTheHeroOfCinderCity: '잿더미성 용사의 두루마리', ObsidianCodex: '흑요석 비전',
  LongNightsOath: '긴 밤의 맹세',
  FinaleOfTheDeepGalleries: '깊은 회랑의 피날레',
  NightOfTheSkysUnveiling: '하늘 경계가 드러난 밤',
  SilkenMoonsSerenade: '달을 엮는 밤노래',
  AubadeOfMorningstarAndMoon: '샛별과 달의 여명',
  ADayCarvedFromRisingWinds: '바람이 시작되는 날',
  Instructor: '교관', TheExile: '유배자', Berserker: '전투광',
  ResolutionOfSojourner: '행자의 마음', BraveHeart: '용사의 마음',
  DefendersWill: '수호자의 마음', TinyMiracle: '기적',
  MartialArtist: '무인', Gambler: '노름꾼', Scholar: '학사',
}

const charNameEnToKo = {
  KamisatoAyaka:'카미사토 아야카',Jean:'진',Lisa:'리사',Barbara:'바바라',Kaeya:'케이아',
  Diluc:'다이루크',Razor:'레이저',Amber:'엠버',Venti:'벤티',Xiangling:'향릉',Beidou:'북두',
  Xingqiu:'행추',Xiao:'소',Ningguang:'응광',Klee:'클레',Zhongli:'종려',Fischl:'피슬',
  Bennett:'베넷',Tartaglia:'타르탈리아',Noelle:'노엘',Qiqi:'치치',Chongyun:'중운',
  Ganyu:'감우',Albedo:'알베도',Diona:'디오나',Mona:'모나',Keqing:'각청',Sucrose:'설탕',
  Xinyan:'신염',Rosaria:'로자리아',HuTao:'호두',KaedeharaKazuha:'카에데하라 카즈하',
  Yanfei:'연비',Yoimiya:'요이미야',Thoma:'토마',Eula:'유라',RaidenShogun:'라이덴 쇼군',
  Sayu:'사유',SangonomiyaKokomi:'산고노미야 코코미',Gorou:'고로',KujouSara:'쿠죠 사라',
  AratakiItto:'아라타키 이토',YaeMiko:'야에 미코',ShikanoinHeizou:'시카노인 헤이조',
  Yelan:'야란',Kirara:'키라라',Aloy:'에일로이',Shenhe:'신학',YunJin:'운근',
  KukiShinobu:'쿠키 시노부',KamisatoAyato:'카미사토 아야토',Collei:'콜레이',Dori:'도리',
  Tighnari:'타이나리',Nilou:'닐루',Cyno:'사이노',Candace:'캔디스',Nahida:'나히다',
  Layla:'레일라',Wanderer:'방랑자',Faruzan:'파루잔',Yaoyao:'요요',Alhaitham:'알하이탐',
  Dehya:'데히야',Mika:'미카',Kaveh:'카베',Baizhu:'백출',Lynette:'리넷',Lyney:'리니',
  Freminet:'프레미네',Wriothesley:'라이오슬리',Neuvillette:'느비예트',Charlotte:'샤를로트',
  Furina:'푸리나',Chevreuse:'슈브르즈',Navia:'나비아',Gaming:'가명',Xianyun:'한운',
  Chiori:'치오리',Sigewinne:'시그윈',Arlecchino:'아를레키노',Sethos:'세토스',
  Clorinde:'클로린드',Emilie:'에밀리',Kachina:'카치나',Kinich:'키니치',Mualani:'말라니',
  Xilonen:'실로닌',Chasca:'차스카',Ororon:'올로룬',Mavuika:'마비카',Citlali:'시틀라리',
  LanYan:'남연',YumemizukiMizuki:'유메미즈키 미즈키',Iansan:'얀사',Varesa:'바레사',
  Escoffier:'에스코피에',Ifa:'이파',Skirk:'스커크',Dahlia:'달리아',Ineffa:'이네파',
  Lauma:'라우마',Flins:'플린스',Aino:'아이노',Nefer:'네페르',Durin:'두린',
  Jahoda:'야호다',Columbina:'콜롬비나',Zibai:'자백',Illuga:'일루가',Varka:'바르카',
}

const weaponNameKo = {
  DullBlade:"무인검",
  SilverSword:"실버 소드",
  CoolSteel:"차가운 칼날",
  HarbingerOfDawn:"여명신검",
  TravelersHandySword:"여행자의 검",
  DarkIronSword:"암철검",
  FilletBlade:"흘호 생선회칼",
  SkyriderSword:"비천어검",
  FavoniusSword:"페보니우스 검",
  TheFlute:"피리검",
  SacrificialSword:"제례검",
  RoyalLongsword:"왕실의 장검",
  LionsRoar:"용의 포효",
  PrototypeRancour:"참암 프로토타입",
  IronSting:"강철 벌침",
  BlackcliffLongsword:"흑암 장검",
  TheBlackSword:"칠흑검",
  TheAlleyFlash:"뒷골목의 섬광",
  SwordOfDescension:"강림의 검",
  FesteringDesire:"부식의 검",
  AmenomaKageuchi:"아메노마 카게우치가타나",
  CinnabarSpindle:"진사의 방추",
  KagotsurubeIsshin:"카고츠루베 잇신",
  SapwoodBlade:"원목 검",
  XiphosMoonlight:"크시포스의 달빛",
  ToukabouShigure:"꽃잎비",
  WolfFang:"늑대 송곳니",
  FinaleOfTheDeep:"해연의 피날레",
  FleuveCendreFerryman:"잿빛의 강 뱃사공",
  TheDockhandsAssistant:"뱃도랑 장검",
  SwordOfNarzissenkreuz:"수선화 십자검",
  SturdyBone:"견고한 골검",
  FluteOfEzpitzal:"에스피찰의 피리",
  CalamityOfEshu:"에슈의 재앙",
  SerenitysCall:"고요한 휘파람",
  MoonweaversDawn:"달을 엮는 자의 새벽빛",
  AquilaFavonia:"매의 검",
  SkywardBlade:"천공의 검",
  FreedomSworn:"오래된 자유의 서약",
  SummitShaper:"참봉의 칼날",
  PrimordialJadeCutter:"반암결록",
  MistsplitterReforged:"안개를 가르는 회광",
  HaranGeppakuFutsu:"하란 월백의 후츠",
  KeyOfKhajNisut:"성현의 열쇠",
  LightOfFoliarIncision:"잎을 가르는 빛",
  SplendorOfTranquilWaters:"고요히 샘솟는 빛",
  UrakuMisugiri:"우라쿠의 미스기리",
  Absolution:"사면",
  PeakPatrolSong:"바위산을 맴도는 노래",
  Azurelight:"창백한 섬광",
  AthameArtis:"검은 침식",
  LightbearingMoonshard:"신월의 달빛",
  WasterGreatsword:"훈련용 대검",
  OldMercsPal:"용병 중검",
  FerrousShadow:"강철의 그림자",
  BloodtaintedGreatsword:"드래곤 블러드 소드",
  WhiteIronGreatsword:"백철 대검",
  DebateClub:"훌륭한 대화수단",
  SkyriderGreatsword:"비천대어검",
  FavoniusGreatsword:"페보니우스 대검",
  TheBell:"시간의 검",
  SacrificialGreatsword:"제례 대검",
  RoyalGreatsword:"왕실의 대검",
  Rainslasher:"빗물 베기",
  PrototypeArchaic:"고화 프로토타입",
  Whiteblind:"백영검",
  BlackcliffSlasher:"흑암참도",
  SerpentSpine:"이무기 검",
  LithicBlade:"천암고검",
  SnowTombedStarsilver:"설장의 성은",
  LuxuriousSeaLord:"진주를 문 해황",
  KatsuragikiriNagamasa:"카츠라기를 벤 나가마사",
  MakhairaAquamarine:"물빛 마카이라",
  Akuoumaru:"아쿠오마루",
  ForestRegalia:"숲의 리게일리어",
  MailedFlower:"꽃 장식 대검",
  TalkingStick:"대화봉",
  TidalShadow:"파도 그림자 대검",
  UltimateOverlordsMegaMagicSword:"「슈퍼 울트라 패왕 마검」",
  PortablePowerSaw:"휴대용 체인톱",
  FruitfulHook:"수확의 갈고리",
  EarthShaker:"대지를 울리는 자",
  FlameForgedInsight:"불로 벼린 지혜",
  MasterKey:"만능 열쇠",
  SkywardPride:"천공의 긍지",
  WolfsGravestone:"늑대의 말로",
  SongOfBrokenPines:"송뢰가 울릴 무렵",
  TheUnforged:"무공의 검",
  RedhornStonethresher:"쇄석의 붉은 뿔",
  BeaconOfTheReedSea:"갈대 바다의 등대",
  Verdict:"판정",
  FangOfTheMountainKing:"산왕의 엄니",
  AThousandBlazingSuns:"타오르는 천 개의 태양",
  GestOfTheMightyWolf:"늑대의 무용담",
  BeginnersProtector:"초보자의 장창",
  IronPoint:"철촉창",
  WhiteTassel:"백술창",
  Halberd:"미늘창",
  BlackTassel:"흑술창",
  DragonsBane:"용학살창",
  PrototypeStarglitter:"별의 낫 프로토타입",
  CrescentPike:"유월창",
  BlackcliffPole:"흑암창",
  Deathmatch:"결투의 창",
  LithicSpear:"천암장창",
  FavoniusLance:"페보니우스 장창",
  RoyalSpear:"왕실의 장창",
  DragonspineSpear:"용의 척추",
  KitainCrossSpear:"키타인 십자창",
  TheCatch:"「어획」",
  WavebreakersFin:"파도 베는 지느러미",
  Moonpiercer:"달을 꿰뚫는 화살",
  MissiveWindspear:"날카로운 바람의 서신",
  BalladOfTheFjords:"협만의 노래",
  RightfulReward:"공의의 보상",
  DialoguesOfTheDesertSages:"위대한 사막 현자의 대답",
  ProspectorsDrill:"탐사용 드릴",
  MountainBracingBolt:"산을 고정하는 못",
  FootprintOfTheRainbow:"무지개의 행적",
  TamayurateiNoOhanashi:"쉼터의 이야기꾼",
  ProspectorsShovel:"채굴의 삽",
  SacrificersStaff:"신성한 제사의 지팡이",
  StaffOfHoma:"호마의 지팡이",
  SkywardSpine:"천공의 마루",
  VortexVanquisher:"관홍의 창",
  PrimordialJadeWingedSpear:"화박연",
  CalamityQueller:"식재",
  EngulfingLightning:"예초의 번개",
  StaffOfTheScarletSands:"적색 사막의 지팡이",
  CrimsonMoonsSemblance:"붉은 달의 형상",
  LumidouceElegy:"등방울꽃의 애가",
  SymphonistOfScents:"맛의 지휘자",
  FracturedHalo:"파멸의 빛고리",
  BloodsoakedRuins:"피로 물든 성",
  ApprenticesNotes:"학도의 노트",
  PocketGrimoire:"포켓 주술서",
  MagicGuide:"마도 서론",
  ThrillingTalesOfDragonSlayers:"드래곤 슬레이어 영웅담",
  OtherworldlyStory:"이세계 여행기",
  EmeraldOrb:"비취 오브",
  TwinNephrite:"1급 보옥",
  FavoniusCodex:"페보니우스 비전",
  TheWidsith:"음유시인의 악장",
  SacrificialFragments:"제례의 악장",
  RoyalGrimoire:"왕실의 비전록",
  SolarPearl:"일월의 정수",
  PrototypeAmber:"황금 호박 프로토타입",
  MappaMare:"만국 항해용해도",
  BlackcliffAgate:"흑암 홍옥",
  EyeOfPerception:"소심",
  WineAndSong:"뒷골목의 술과 시",
  Frostbearer:"인동의 열매",
  DodocoTales:"도도코 이야기집",
  HakushinRing:"하쿠신의 고리",
  OathswornEye:"맹세의 눈동자",
  WanderingEvenstar:"방랑하는 저녁별",
  FruitOfFulfillment:"충만의 열매",
  SacrificialJade:"제사의 옥",
  FlowingPurity:"순수한 달빛 물결",
  BalladOfTheBoundlessBlue:"끝없는 쪽빛의 노래",
  AshGravenDrinkingHorn:"푸른 문양 뿔잔",
  WaveridingWhirl:"돌아오는 파도",
  RingOfYaxche:"약스체의 고리",
  EtherlightSpindlelute:"금빛 류트",
  BlackmarrowLantern:"검은 골수의 등불",
  DawningFrost:"서릿빛 새벽",
  SkywardAtlas:"천공의 두루마리",
  LostPrayerToTheSacredWinds:"사풍 원서",
  MemoryOfDust:"속세의 자물쇠",
  JadefallsSplendor:"벽락의 옥",
  EverlastingMoonglow:"불멸의 달빛",
  KagurasVerity:"카구라의 진의",
  AThousandFloatingDreams:"떠오르는 천일 밤의 꿈",
  TulaytullahsRemembrance:"툴레이툴라의 기억",
  CashflowSupervision:"현금 흐름 감독",
  TomeOfTheEternalFlow:"영원히 샘솟는 법전",
  CranesEchoingCall:"학의 여음",
  SurfsUp:"서핑 타임",
  StarcallersWatch:"별지기의 시선",
  SunnyMorningSleepIn:"나른한 새해",
  VividNotions:"빛나는 마음",
  NightweaversLookingGlass:"밤을 엮는 거울",
  ReliquaryOfTruth:"진실의 함",
  NocturnesCurtainCall:"막간의 야상곡",
  HuntersBow:"사냥활",
  SeasonedHuntersBow:"노련의 사냥활",
  RavenBow:"까마귀깃 활",
  SharpshootersOath:"신궁의 서약",
  RecurveBow:"곡궁",
  Slingshot:"탄궁",
  Messenger:"전령",
  FavoniusWarbow:"페보니우스 활",
  TheStringless:"절현",
  SacrificialBow:"제례활",
  RoyalBow:"왕실의 장궁",
  Rust:"녹슨 활",
  PrototypeCrescent:"담월 프로토타입",
  CompoundBow:"강철궁",
  BlackcliffWarbow:"흑암 배틀 보우",
  TheViridescentHunt:"청록의 사냥활",
  AlleyHunter:"뒷골목 사냥꾼",
  FadingTwilight:"노을",
  MitternachtsWaltz:"유야의 왈츠",
  WindblumeOde:"바람 꽃의 노래",
  Hamayumi:"파마궁",
  Predator:"포식자",
  MouunsMoon:"모운의 달",
  KingsSquire:"왕의 측근",
  EndOfTheLine:"메마른 연못",
  IbisPiercer:"꿰뚫는 따오기 부리",
  ScionOfTheBlazingSun:"뜨거운 태양의 후손",
  SongOfStillness:"고요한 노래",
  Cloudforged:"축운",
  RangeGauge:"거리 측정기",
  FlowerWreathedFeathers:"꽃장식 깃",
  ChainBreaker:"사슬 파괴자",
  SequenceOfSolitude:"침묵의 사격",
  SnareHook:"그물을 뚫는 화살",
  RainbowSerpentsRainBow:"무지개뱀의 현",
  SkywardHarp:"천공의 날개",
  AmosBow:"아모스의 활",
  ElegyForTheEnd:"종말 탄식의 노래",
  PolarStar:"극지의 별",
  AquaSimulacra:"약수",
  ThunderingPulse:"비뢰의 고동",
  HuntersPath:"사냥꾼의 길",
  TheFirstGreatMagic:"최초의 대마술",
  SilvershowerHeartstrings:"심금을 울리는 하얀 비",
  AstralVulturesCrimsonPlumage:"붉은 깃 별독수리",
  TheDaybreakChronicles:"여명이 트는 역사",
  QuantumCatalyst:"Quantum Cat-alyst",
}

// --- Page: Artifacts ---
async function initArtifacts() {
  const grid = $('#artifact-grid')
  if (!grid) return

  // charNameEnToKo loaded statically

  const artifacts = await api.get('/artifacts')
  if (!artifacts) return

  // Update archive counts
  const archiveVal = $('.archive-total__value')
  if (archiveVal) archiveVal.textContent = fmt(artifacts.length)
  const archiveLv20 = $('#archive-lv20')
  if (archiveLv20) archiveLv20.textContent = artifacts.filter((a) => Number(a.level) >= 20).length
  const countDisplay = $('#artifact-count-display')

  // Empty state: show inline import banner
  const emptyState = $('#artifact-empty-state')
  if (artifacts.length === 0) {
    grid.innerHTML = ''
    if (emptyState) {
      emptyState.style.display = ''
      grid.appendChild(emptyState)
      bindInlineImport('artifact-drop-zone', 'artifact-import-file', 'artifact-import-result', (result) => {
        showToast('Import 완료! 성유물 ' + (result.artifacts || 0) + '개가 추가되었습니다')
        initArtifacts()
      })
    }
    return
  }

  // Hide empty state if it exists (re-entry after import)
  if (emptyState) emptyState.style.display = 'none'

  grid.innerHTML = ''
  const accents = ['primary', 'secondary', 'tertiary', 'error']
  const iconTints = ['gold', 'green', 'purple', 'red']

  const PAGE_SIZE = 50
  let rendered = 0
  const isKo = (typeof getLang === 'function' && getLang() === 'ko')

  function renderBatch() {
    const batch = artifacts.slice(rendered, rendered + PAGE_SIZE)
    if (batch.length === 0) return false
    let html = ''
    batch.forEach((a, idx) => {
      const i = rendered + idx
    const accent = accents[i % accents.length]
    const tint = iconTints[i % iconTints.length]

    const displaySet = isKo ? (setNameKo[a.set_name] || a.set_name) : a.set_name
    const displaySlot = isKo ? (slotNameKo[a.slot] || a.slot) : a.slot
    const displayMainStat = isKo ? (statNameKo[a.main_stat_type] || a.main_stat_type) : (statNameEn[a.main_stat_type] || a.main_stat_type)

    const subs = [
      { name: a.sub1_name, value: a.sub1_value, rolls: a.sub1_rolls },
      { name: a.sub2_name, value: a.sub2_value, rolls: a.sub2_rolls },
      { name: a.sub3_name, value: a.sub3_value, rolls: a.sub3_rolls },
      { name: a.sub4_name, value: a.sub4_value, rolls: a.sub4_rolls },
    ].filter((s) => s.name)

    const subsHTML = subs.map((s) => {
      const rolls = Math.max(0, parseInt(s.rolls) || 0)
      const barClass = rolls >= 3 ? 'high' : rolls >= 2 ? 'mid' : 'low'
      const dots = Array(rolls).fill('<div class="substat__dot"></div>').join('')
      const subDisplay = isKo ? (statNameKo[s.name] || s.name) : (statNameEn[s.name] || s.name)
      return `
        <div class="substat">
          <div class="substat__left">
            <div class="substat__bar substat__bar--${barClass}"></div>
            <span class="substat__name">${subDisplay}</span>
          </div>
          <div class="substat__right">
            <span class="substat__value">${s.value}</span>
            <div class="substat__rolls">${dots}</div>
          </div>
        </div>`
    }).join('')

    html += `
      <div class="artifact-card">
        <div class="artifact-card__accent artifact-card__accent--${accent}"></div>
        <div class="artifact-card__body">
          <div class="artifact-card__top">
            <div class="artifact-card__icon-wrap">
              <div class="artifact-card__icon artifact-card__icon--${tint}">
                <img alt="${a.name}" src="assets/artifacts/${a.set_name}/${a.slot}.png" onerror="this.src='${a.icon || `assets/slots/icon_slot_${a.slot}.png`}'" style="width:2rem;height:2rem;object-fit:contain"/>
              </div>
              <span class="artifact-card__level">+${a.level}</span>
            </div>
            <div class="artifact-card__main-stat">
              <p class="artifact-card__main-stat-label" data-i18n="art.mainstat">Main Stat</p>
              <p class="artifact-card__main-stat-value">${a.main_stat_value}</p>
              <p class="artifact-card__main-stat-type" style="font-size:0.7rem;opacity:0.8">${displayMainStat}</p>
            </div>
          </div>
          <div>
            <h3 class="artifact-card__name" style="font-size:1rem">${displaySet}</h3>
            <p class="artifact-card__set" style="font-size:0.75rem">${displaySlot}</p>
          </div>
          <div class="substats">${subsHTML}</div>
          <div class="artifact-card__footer">
            ${a.equipped_by ? `
              <div style="display:flex;align-items:center;gap:0.375rem;background:var(--surface-highest);padding:0.25rem 0.5rem 0.25rem 0.25rem;border-radius:1rem;color:var(--on-surface);">
                <img src="${charIconPath(a.equipped_by)}" alt="${localizeCharName(a.equipped_by)}" onerror="this.style.display='none'" style="width:1.25rem;height:1.25rem;border-radius:50%;object-fit:cover;background:var(--outline-variant);"/>
                <span style="font-size:0.75rem;font-weight:600;padding-right:0.25rem">${isKo ? localizeCharName(a.equipped_by) : a.equipped_by}</span>
              </div>
            ` : '<span></span>'}
            <button class="artifact-card__edit" data-id="${a.id}">
              <span class="material-symbols-outlined" style="font-size:1.125rem">delete</span>
            </button>
          </div>
        </div>
      </div>`
  })

    grid.insertAdjacentHTML('beforeend', html)
    // Bind delete handlers for newly added cards
    grid.querySelectorAll('.artifact-card__edit:not([data-bound])').forEach((btn) => {
      btn.dataset.bound = '1'
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id
        if (!id) return
        await api.del(`/artifacts/${id}`)
        initArtifacts()
      })
    })
    rendered += batch.length
    if (countDisplay) countDisplay.textContent = `${fmt(rendered)} / ${fmt(artifacts.length)}개 표시`
    return true
  }

  // Initial render
  renderBatch()

  // Infinite scroll: load more when near bottom
  const scrollHandler = () => {
    if (rendered >= artifacts.length) return
    const scrollBottom = window.innerHeight + window.scrollY
    if (scrollBottom >= document.body.offsetHeight - 400) {
      renderBatch()
    }
  }
  // Remove previous scroll handler if re-entering
  if (window._artifactScrollHandler) {
    window.removeEventListener('scroll', window._artifactScrollHandler)
  }
  window._artifactScrollHandler = scrollHandler
  window.addEventListener('scroll', scrollHandler)

  // Filter interactivity
  bindFilters()
}

// --- Page: Weapons ---
async function initWeapons() {
  const grid = $('#weapon-grid')
  if (!grid) return

  const weapons = await api.get('/weapons')
  if (!weapons) return
  grid.innerHTML = ''

  weapons.forEach((w) => {
    grid.innerHTML += `
      <div class="artifact-card">
        <div class="artifact-card__accent artifact-card__accent--tertiary"></div>
        <div class="artifact-card__body">
          <div class="artifact-card__top">
            <div class="artifact-card__icon-wrap">
              <div class="artifact-card__icon artifact-card__icon--purple">
                <img alt="${w.name}" src="${w.icon}"/>
              </div>
              <span class="artifact-card__level">R${w.refinement}</span>
            </div>
            <div class="artifact-card__main-stat">
              <p class="artifact-card__main-stat-label">Base ATK</p>
              <p class="artifact-card__main-stat-value">${w.base_atk}</p>
              <p class="artifact-card__main-stat-type">${w.type}</p>
            </div>
          </div>
          <div>
            <h3 class="artifact-card__name">${w.name}</h3>
            <p class="artifact-card__set">LVL ${w.level}/90 &bull; ${w.rarity}-Star</p>
          </div>
          <div class="substats">
            <div class="substat">
              <div class="substat__left">
                <div class="substat__bar substat__bar--high"></div>
                <span class="substat__name">${w.sub_stat_type || ''}</span>
              </div>
              <div class="substat__right">
                <span class="substat__value">${w.sub_stat_value || ''}</span>
              </div>
            </div>
          </div>
          <div class="artifact-card__footer">
            <span style="font-size:0.625rem;color:var(--on-surface-variant)">${w.equipped_by || ''}</span>
            <button class="artifact-card__edit"><span class="material-symbols-outlined" style="font-size:1.125rem">edit_note</span></button>
          </div>
        </div>
      </div>`
  })

  grid.innerHTML += `
    <button class="artifact-add">
      <span class="material-symbols-outlined">add_circle</span>
      <span>Add Weapon</span>
    </button>`
}

// --- Page: Teams ---
async function initTeams() {
  const list = $('#team-list')
  if (!list) return

  const teams = await api.get('/teams')
  const chars = await api.get('/characters')
  if (!teams || !chars) return

  list.innerHTML = ''
  teams.forEach((t) => {
    const members = [t.member1, t.member2, t.member3, t.member4].filter(Boolean)
    const avatars = members.map((name) => {
      const c = chars.find((ch) => ch.name === name)
      const icon = c ? c.icon : 'assets/chars/raiden.png'
      return `<div class="result-card__avatar"><img alt="${name}" src="${icon}"/></div>`
    }).join('')

    list.innerHTML += `
      <div class="result-card">
        <div class="result-card__inner">
          <div style="display:flex;gap:1rem;align-items:center;flex-grow:1">
            ${avatars}
            <div style="margin-left:1rem">
              <h3 style="font-weight:700;font-size:1rem">${t.name}</h3>
              <p style="font-size:0.75rem;color:var(--on-surface-variant)">${t.description || ''}</p>
            </div>
          </div>
          <div class="result-card__action">
            <button class="btn-apply">Edit Team</button>
          </div>
        </div>
      </div>`
  })

  list.innerHTML += `
    <button class="artifact-add" style="padding:3rem">
      <span class="material-symbols-outlined">add_circle</span>
      <span>Create New Team</span>
    </button>`
}

// --- Page: Builds ---
async function initBuilds() {
  const list = $('#build-list')
  if (!list) return

  const builds = await api.get('/builds')
  if (!builds) return
  list.innerHTML = ''

  builds.forEach((b) => {
    list.innerHTML += `
      <div class="result-card">
        <div class="result-card__inner">
          <div class="result-card__rank">
            <div class="result-card__avatar">
              <img alt="${b.character_name}" src="${b.icon}"/>
            </div>
            <div style="text-align:center">
              <div class="result-card__dmg-label">Est. DMG</div>
              <div class="result-card__dmg-value">${fmt(b.est_dmg)}</div>
            </div>
          </div>
          <div style="flex-grow:1">
            <h3 style="font-weight:700;font-size:1rem">${b.character_name} — ${b.build_name}</h3>
            <p style="font-size:0.75rem;color:var(--on-surface-variant);margin-top:0.25rem">${b.description || ''}</p>
          </div>
          <div class="result-card__action">
            <button class="btn-apply">Load Build</button>
          </div>
        </div>
      </div>`
  })

  list.innerHTML += `
    <button class="artifact-add" style="padding:3rem">
      <span class="material-symbols-outlined">add_circle</span>
      <span>Save Current Build</span>
    </button>`
}

// --- Filter / Sort interactivity ---
function bindFilters() {
  $$('.filter-slot').forEach((slot) => {
    slot.addEventListener('click', () => {
      $$('.filter-slot').forEach((s) => s.classList.remove('filter-slot--active'))
      slot.classList.toggle('filter-slot--active')
    })
  })

  $$('.filter-tag').forEach((tag) => {
    tag.addEventListener('click', () => {
      tag.classList.toggle('filter-tag--active')
    })
  })

  $$('.sort-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      $$('.sort-tab').forEach((t) => t.classList.remove('sort-tab--active'))
      tab.classList.add('sort-tab--active')
    })
  })
}

// --- Mobile Nav ---
function initMobileNav() {
  const nav = document.querySelector('.nav__inner')
  if (!nav) return

  // Build hamburger button
  const hamburger = el('button', 'nav__hamburger')
  hamburger.setAttribute('aria-label', 'Toggle menu')
  hamburger.setAttribute('aria-expanded', 'false')
  hamburger.innerHTML = `
    <span class="nav__hamburger__line"></span>
    <span class="nav__hamburger__line"></span>
    <span class="nav__hamburger__line"></span>`

  // Build backdrop
  const backdrop = el('div', 'nav__mobile-backdrop')

  // Build drawer with same links as desktop nav
  const mobileMenu = el('nav', 'nav__mobile-menu')
  mobileMenu.setAttribute('aria-label', 'Mobile navigation')

  // Clone links from desktop nav
  const desktopLinks = document.querySelectorAll('.nav__links .nav__link')
  desktopLinks.forEach((link) => {
    const a = el('a', 'nav__mobile-link')
    a.href = link.getAttribute('href') || '#'
    a.textContent = link.textContent
    if (link.classList.contains('nav__link--active')) {
      a.classList.add('nav__mobile-link--active')
    }
    mobileMenu.appendChild(a)
  })

  // Insert into DOM
  nav.appendChild(hamburger)
  document.body.appendChild(backdrop)
  document.body.appendChild(mobileMenu)

  function openMenu() {
    hamburger.classList.add('is-open')
    hamburger.setAttribute('aria-expanded', 'true')
    mobileMenu.classList.add('is-open')
    backdrop.style.display = 'block'
    // Force reflow so transition fires
    backdrop.getBoundingClientRect()
    backdrop.classList.add('is-visible')
    document.body.style.overflow = 'hidden'
  }

  function closeMenu() {
    hamburger.classList.remove('is-open')
    hamburger.setAttribute('aria-expanded', 'false')
    mobileMenu.classList.remove('is-open')
    backdrop.classList.remove('is-visible')
    document.body.style.overflow = ''
    backdrop.addEventListener('transitionend', () => {
      backdrop.style.display = ''
    }, { once: true })
  }

  hamburger.addEventListener('click', () => {
    if (mobileMenu.classList.contains('is-open')) closeMenu()
    else openMenu()
  })

  backdrop.addEventListener('click', closeMenu)

  mobileMenu.querySelectorAll('.nav__mobile-link').forEach((link) => {
    link.addEventListener('click', closeMenu)
  })
}

// --- Modal System ---
function openModal(title, fields, onSubmit) {
  let backdrop = document.querySelector('.modal-backdrop')
  if (backdrop) backdrop.remove()

  backdrop = el('div', 'modal-backdrop')
  const fieldsHTML = fields.map((f) => {
    if (f.type === 'select') {
      const opts = f.options.map((o) => `<option value="${o}">${o}</option>`).join('')
      return `<div class="form-group"><label>${f.label}</label><select class="form-select" name="${f.name}">${opts}</select></div>`
    }
    return `<div class="form-group"><label>${f.label}</label><input class="form-input" type="${f.type || 'text'}" name="${f.name}" placeholder="${f.placeholder || ''}" value="${f.value || ''}" ${f.required ? 'required' : ''}/></div>`
  }).join('')

  backdrop.innerHTML = `
    <div class="modal">
      <div class="modal__header">
        <h3 class="modal__title">${title}</h3>
        <button class="modal__close"><span class="material-symbols-outlined">close</span></button>
      </div>
      <form class="modal__form">
        ${fieldsHTML}
        <button type="submit" class="btn-primary" style="margin-top:0.5rem">Save</button>
      </form>
    </div>`

  document.body.appendChild(backdrop)
  requestAnimationFrame(() => backdrop.classList.add('is-open'))

  const close = () => { backdrop.classList.remove('is-open'); setTimeout(() => backdrop.remove(), 300) }
  backdrop.querySelector('.modal__close').addEventListener('click', close)
  backdrop.addEventListener('click', (e) => { if (e.target === backdrop) close() })

  backdrop.querySelector('.modal__form').addEventListener('submit', async (e) => {
    e.preventDefault()
    const data = {}
    new FormData(e.target).forEach((v, k) => { data[k] = isNaN(v) || v === '' ? v : Number(v) })
    await onSubmit(data)
    close()
  })
}

// --- CRUD: Add Character ---
function showAddCharacterForm() {
  openModal('Add Character', [
    { name: 'name', label: 'Name', required: true },
    { name: 'element', label: 'Element', type: 'select', options: ['Pyro','Hydro','Electro','Cryo','Anemo','Geo','Dendro'] },
    { name: 'weapon_type', label: 'Weapon Type', type: 'select', options: ['Sword','Claymore','Polearm','Bow','Catalyst'] },
    { name: 'level', label: 'Level', type: 'number', value: '90' },
    { name: 'weapon_name', label: 'Weapon Name' },
    { name: 'hp', label: 'HP', type: 'number', value: '0' },
    { name: 'atk', label: 'ATK', type: 'number', value: '0' },
    { name: 'crit_rate', label: 'Crit Rate %', type: 'number', value: '5' },
    { name: 'crit_dmg', label: 'Crit DMG %', type: 'number', value: '50' },
    { name: 'energy_recharge', label: 'Energy Recharge %', type: 'number', value: '100' },
    { name: 'elemental_mastery', label: 'Elemental Mastery', type: 'number', value: '0' },
  ], async (data) => {
    data.icon = `assets/chars/${data.name.replace(/\s+/g, '')}.png`
    await api.post('/characters', data)
    initCharacters()
  })
}

// --- CRUD: Add Artifact ---
function showAddArtifactForm() {
  openModal(t('art.add'), [
    { name: 'name', label: 'Artifact Name', required: true },
    { name: 'set_name', label: 'Set Name', required: true },
    { name: 'slot', label: 'Slot', type: 'select', options: ['Flower','Plume','Sands','Goblet','Circlet'] },
    { name: 'level', label: 'Level', type: 'number', value: '20' },
    { name: 'main_stat_type', label: 'Main Stat Type' },
    { name: 'main_stat_value', label: 'Main Stat Value' },
    { name: 'equipped_by', label: 'Equipped By' },
  ], async (data) => {
    data.icon = ''
    await api.post('/artifacts', data)
    initArtifacts()
  })
}

// --- CRUD: Add Weapon ---
function showAddWeaponForm() {
  openModal(t('weap.add'), [
    { name: 'name', label: 'Weapon Name', required: true },
    { name: 'type', label: 'Type', type: 'select', options: ['Sword','Claymore','Polearm','Bow','Catalyst'] },
    { name: 'level', label: 'Level', type: 'number', value: '90' },
    { name: 'refinement', label: 'Refinement', type: 'number', value: '1' },
    { name: 'base_atk', label: 'Base ATK', type: 'number', value: '0' },
    { name: 'sub_stat_type', label: 'Sub Stat Type' },
    { name: 'sub_stat_value', label: 'Sub Stat Value' },
    { name: 'rarity', label: 'Rarity', type: 'select', options: ['3','4','5'] },
    { name: 'equipped_by', label: 'Equipped By' },
  ], async (data) => {
    data.icon = `assets/weapons/${data.name.replace(/\s+/g, '')}.png`
    await api.post('/weapons', data)
    initWeapons()
  })
}

// --- CRUD: Add Team ---
function showAddTeamForm() {
  openModal(t('team.create'), [
    { name: 'name', label: 'Team Name', required: true },
    { name: 'description', label: 'Description' },
    { name: 'member1', label: 'Member 1' },
    { name: 'member2', label: 'Member 2' },
    { name: 'member3', label: 'Member 3' },
    { name: 'member4', label: 'Member 4' },
  ], async (data) => {
    await api.post('/teams', data)
    initTeams()
  })
}

// --- CRUD: Add Build ---
function showAddBuildForm() {
  openModal(t('build.save'), [
    { name: 'character_name', label: 'Character Name', required: true },
    { name: 'build_name', label: 'Build Name', required: true },
    { name: 'description', label: 'Description' },
    { name: 'est_dmg', label: 'Est. DMG', type: 'number', value: '0' },
  ], async (data) => {
    data.icon = `assets/chars/${data.character_name.replace(/\s+/g, '')}.png`
    await api.post('/builds', data)
    initBuilds()
  })
}

// --- Name Translation Maps (reverse from charNameEnToKo) ---
const charNameKoToEn = {}
Object.entries(charNameEnToKo).forEach(([en, ko]) => {
  charNameKoToEn[ko] = en
  charNameKoToEn[en] = en
})

const elementMap = {
  Pyro: '불', Hydro: '물', Electro: '번개', Cryo: '얼음',
  Anemo: '바람', Geo: '바위', Dendro: '풀',
}
const weaponTypeMap = {
  Sword: '한손검', Claymore: '양손검', Polearm: '장병기', Bow: '활', Catalyst: '법구',
}
const weaponNameMap = {
  'Engulfing Lightning': '예초의 번개', 'Staff of Homa': '호마의 지팡이',
  'Freedom-Sworn': '창백의 검', 'Amos\' Bow': '아모스의 활',
  'Staff of the Scarlet Sands': '적사의 지팡이', 'Mistsplitter Reforged': '안개를 가르는 회광',
  'Primordial Jade Winged-Spear': '화박연', 'Aqua Simulacra': '약수',
  'Thundering Pulse': '비뢰의 고동', 'Skyward Harp': '천공의 날개',
  'Wolf\'s Gravestone': '늑대의 말로', 'The Catch': '어획',
  'Favonius Lance': '페보니우스 장창', 'Favonius Sword': '페보니우스 한손검',
  'Sacrificial Sword': '제례검', 'Sacrificial Fragments': '제례의 악장',
}

function localizeCharName(name) {
  if (getLang() === 'ko') return charNameEnToKo[name] || name
  return charNameKoToEn[name] || name
}

function localizeElement(el) {
  if (getLang() === 'ko') return elementMap[el] || el
  return el
}

function localizeWeaponType(wt) {
  if (getLang() === 'ko') return weaponTypeMap[wt] || wt
  return wt
}

function localizeWeaponName(name) {
  if (getLang() === 'ko') return weaponNameMap[name] || name
  return name
}

// --- Page: Theater (Imaginarium Theater) ---

function charIconPath(name) {
  const en = charNameKoToEn[name] || name
  return `assets/chars/${en.replace(/\s+/g, '')}.png`
}

async function initTheater() {
  const container = $('#theater-content')
  if (!container) return

  // charNameEnToKo loaded statically

  try {
    const res = await fetch('/api/theater')
    if (!res.ok) throw new Error()
    const seasons = await res.json()
    if (!seasons || seasons.length === 0) throw new Error('empty')
    renderTheater(container, seasons)
  } catch {
    renderTheaterFallback(container)
  }
}

function renderTheater(container, seasons) {
  container.innerHTML = ''
  seasons.forEach((season) => {
    const actsHTML = (season.acts || []).map((act) => {
      const charsHTML = (act.characters || []).map((c) => {
        const icon = charIconPath(c.name)
        const bonusCls = c.bonus ? ' theater-char__icon--bonus' : ''
        return `<div class="theater-char">
          <div class="theater-char__icon${bonusCls}"><img src="${icon}" alt="${c.name}" onerror="this.src='assets/chars/TravelerF.png'"/></div>
          <span class="theater-char__name">${c.name}</span>
        </div>`
      }).join('')
      return `<div class="theater-act">
        <div class="theater-act__title">${act.name}</div>
        <div class="theater-chars">${charsHTML}</div>
      </div>`
    }).join('')

    const elementsHTML = (season.elements || []).map((e) =>
      `<span class="theater-element">${e}</span>`
    ).join('')

    container.innerHTML += `<div class="theater-season">
      <div class="theater-season__header">
        <h2 class="theater-season__title">${season.title}</h2>
        <span class="theater-season__date">${season.date || ''}</span>
      </div>
      ${elementsHTML ? `<div class="theater-elements">${elementsHTML}</div>` : ''}
      ${actsHTML}
    </div>`
  })
}

function renderTheaterFallback(container) {
  const seasons = [
    {
      title: '2026년 4월차 환상극',
      date: '2026.04',
      elements: ['물', '얼음', '바위'],
      acts: [
        { name: '출연 캐릭터',
          characters: [
            { name: '모나' }, { name: '행추' }, { name: '라이오슬리' },
            { name: '로자리아' }, { name: '나비아' }, { name: '카치나' },
          ]
        },
        { name: '특별 초대',
          characters: [
            { name: '유메미즈키 미즈키', bonus: true }, { name: '클레', bonus: true },
            { name: '라우마', bonus: true }, { name: '설탕', bonus: true },
          ]
        },
      ],
    },
    {
      title: '2026년 3월차 환상극',
      date: '2026.03',
      elements: ['번개', '얼음', '바람'],
      acts: [
        { name: '출연 캐릭터',
          characters: [
            { name: '바레사' }, { name: '도리' }, { name: '유라' },
            { name: '미카' }, { name: '시카노인 헤이조' }, { name: '사유' },
          ]
        },
        { name: '특별 초대',
          characters: [
            { name: '푸리나', bonus: true }, { name: '콜롬비나', bonus: true },
            { name: '두린', bonus: true }, { name: '베넷', bonus: true },
          ]
        },
      ],
    },
  ]
  renderTheater(container, seasons)
}

// --- Async Optimize: Shared polling ---
async function pollOptimizeJob(jobId, progressContainer, onDone) {
  progressContainer.style.display = 'block'
  const poll = async () => {
    try {
      const res = await fetch(`/api/optimize/status/${jobId}`)
      if (!res.ok) throw new Error()
      const data = await res.json()
      renderProgressBar(progressContainer, data.progress || 0, data.status)
      if (data.status === 'done') {
        progressContainer.style.display = 'none'
        onDone(data.result)
      } else if (data.status === 'error') {
        progressContainer.innerHTML = `<p style="color:var(--error)">최적화 실패: ${data.result || '알 수 없는 오류'}</p>`
      } else {
        setTimeout(poll, 1000)
      }
    } catch {
      progressContainer.innerHTML = '<p style="color:var(--error)">상태 확인 실패</p>'
    }
  }
  poll()
}

function renderProgressBar(container, progress, status) {
  container.innerHTML = `
    <div style="text-align:center;padding:1.5rem">
      <p style="font-size:0.875rem;color:var(--on-surface-variant);margin-bottom:1rem">
        ${status === 'running' ? '최적화 진행 중...' : '준비 중...'}
      </p>
      <div style="width:100%;height:0.5rem;background:var(--surface-highest);border-radius:var(--r-full);overflow:hidden">
        <div style="width:${progress}%;height:100%;background:linear-gradient(90deg,var(--primary),var(--secondary));border-radius:var(--r-full);transition:width 0.5s"></div>
      </div>
      <p style="font-size:0.75rem;color:var(--on-surface-variant);margin-top:0.5rem">${progress}%</p>
    </div>`
}

// --- Wire up Add buttons ---
function wireAddButtons() {
  const addArt = document.getElementById('btn-add-artifact')
  if (addArt) addArt.addEventListener('click', showAddArtifactForm)

  $$('.artifact-add').forEach((btn) => {
    const text = btn.textContent.trim()
    if (text.includes('Weapon')) btn.addEventListener('click', showAddWeaponForm)
    else if (text.includes('Team') || text.includes('Create')) btn.addEventListener('click', showAddTeamForm)
    else if (text.includes('Build') || text.includes('Save')) btn.addEventListener('click', showAddBuildForm)
  })
}

// --- Page: Smart Discard ---
async function initSmartDiscard() {
  const grid = document.getElementById('sd-grid')
  const loading = document.getElementById('sd-loading')
  const empty = document.getElementById('sd-empty')
  const totalEl = document.getElementById('sd-total')
  const analyzedEl = document.getElementById('sd-analyzed')
  const candidatesEl = document.getElementById('sd-candidates')
  const slider = document.getElementById('sd-threshold')
  const sliderVal = document.getElementById('sd-threshold-val')
  if (!grid) return

  // Modal close handlers
  const modalOverlay = document.getElementById('sd-modal-overlay')
  const modalClose = document.getElementById('sd-modal-close')
  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) modalOverlay.classList.remove('active')
    })
  }
  if (modalClose) {
    modalClose.addEventListener('click', () => modalOverlay.classList.remove('active'))
  }

  const slotIcons = {
    flower: 'local_florist', plume: 'flight', sands: 'hourglass_empty',
    goblet: 'wine_bar', circlet: 'crown',
  }

  async function fetchAndRender(thresholdValue) {
    loading.style.display = ''
    grid.style.display = 'none'
    empty.style.display = 'none'

    let data
    try {
      data = await api.get(`/artifacts/smart-discard?threshold=${thresholdValue}`)
    } catch (e) {
      loading.innerHTML = '<p style="color:var(--error)">분석 실패. 다시 시도해주세요.</p>'
      return
    }

    let candidates = data.candidates || []

    // Rebuild set filter dropdown every time
    const setFilter = document.getElementById('sd-set-filter')
    if (setFilter) {
      const prevValue = setFilter.value
      const sets = {}
      candidates.forEach(c => { sets[c.artifact.set_name] = (sets[c.artifact.set_name] || 0) + 1 })
      const isKo = (typeof getLang === 'function' && getLang() === 'ko')
      setFilter.innerHTML = '<option value="">전체</option>'
      Object.entries(sets).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => {
        const label = isKo ? (setNameKo[k] || k) : k
        const opt = document.createElement('option')
        opt.value = k
        opt.textContent = `${label} (${v})`
        setFilter.appendChild(opt)
      })
      // Restore previous selection if still valid
      if (prevValue && sets[prevValue]) setFilter.value = prevValue

      // Apply set filter
      if (setFilter.value) {
        candidates = candidates.filter(c => c.artifact.set_name === setFilter.value)
      }
    }

    // Dismiss filter
    const dismissFilter = document.getElementById('sd-dismiss-filter')
    if (dismissFilter && dismissFilter.value !== 'all') {
      if (dismissFilter.value === 'dismissed') {
        candidates = candidates.filter(c => c.artifact.dismissed === 1)
      } else {
        candidates = candidates.filter(c => !c.artifact.dismissed || c.artifact.dismissed === 0)
      }
    }

    if (!sortAsc) candidates.sort((a, b) => b.score - a.score)

    totalEl.textContent = data.total || 0
    analyzedEl.textContent = data.analyzed || 0
    candidatesEl.textContent = candidates.length

    loading.style.display = 'none'

    if (candidates.length === 0) {
      empty.style.display = 'block'
      return
    }

    grid.style.display = ''
    const isKo = (typeof getLang === 'function' && getLang() === 'ko')

    let html = ''
    candidates.forEach((c) => {
      const a = c.artifact
      const subs = [
        { name: a.sub1_name, value: a.sub1_value },
        { name: a.sub2_name, value: a.sub2_value },
        { name: a.sub3_name, value: a.sub3_value },
        { name: a.sub4_name, value: a.sub4_value },
      ].filter(s => s.name)

      const subsHTML = subs.map(s => {
        const displayName = isKo ? (statNameKo[s.name] || s.name) : (statNameEn[s.name] || s.name)
        return `
        <div class="substat">
          <div class="substat__left">
            <div class="substat__bar substat__bar--low"></div>
            <span class="substat__name">${displayName}</span>
          </div>
          <div class="substat__right">
            <span class="substat__value">${s.value}</span>
          </div>
        </div>`
      }).join('')

      const reasonsHTML = c.reasons.map(r => `
        <div class="sd-reason">
          <span class="material-symbols-outlined" style="font-size:0.75rem">warning</span>
          <span>${r}</span>
        </div>`).join('')

      const displaySet = isKo ? (setNameKo[a.set_name] || a.set_name) : a.set_name
      const displayMain = isKo ? (statNameKo[a.main_stat_type] || a.main_stat_type) : (statNameEn[a.main_stat_type] || a.main_stat_type)
      const slotIcon = slotIcons[a.slot] || 'help'
      const bestCharHTML = c.best_character
        ? `<p class="sd-best-char">최적 캐릭터: ${c.best_character} (${c.best_character_score}점)</p>`
        : ''

      const isDismissed = a.dismissed === 1
      const displaySlot = isKo ? (slotNameKo[a.slot] || a.slot) : a.slot
      html += `
        <div class="artifact-card sd-card${isDismissed ? ' dismissed' : ''}" data-id="${a.id}">
          <div class="artifact-card__accent artifact-card__accent--error"></div>
          <div class="artifact-card__body">
            <div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:0.5rem">
              <div class="artifact-card__icon-wrap">
                <div class="artifact-card__icon artifact-card__icon--red">
                  <img src="assets/artifacts/${a.set_name}/${a.slot}.png" alt="${displaySlot}" style="width:2rem;height:2rem;object-fit:contain" onerror="this.style.display='none';this.parentElement.innerHTML='<span class=\\'material-symbols-outlined\\' style=\\'font-size:1.5rem\\'>${slotIcon}</span>'"/>
                </div>
                <span class="artifact-card__level">+${a.level}</span>
              </div>
              <div style="flex:1;min-width:0">
                <h3 style="font-size:0.8125rem;font-weight:700;margin:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${displaySet}</h3>
                <p style="font-size:0.6875rem;color:var(--on-surface-variant);margin:0.125rem 0 0">${displaySlot} · ${displayMain}</p>
              </div>
            </div>
            <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.25rem">
              <span class="sd-score-badge">점수 ${c.score}</span>
              ${a.rarity && a.rarity < 5 ? `<span style="font-size:0.625rem;color:var(--on-surface-variant)">${a.rarity}★</span>` : ''}
            </div>
            ${bestCharHTML}
            <div class="substats">${subsHTML}</div>
            <div class="sd-reasons">${reasonsHTML}</div>
            <button class="sd-dismiss-btn" data-dismiss-id="${a.id}">
              <span class="material-symbols-outlined" style="font-size:0.875rem">${isDismissed ? 'undo' : 'check_circle'}</span>
              <span>${isDismissed ? '제거 취소' : '제거됨 표시'}</span>
            </button>
          </div>
        </div>`
    })
    grid.innerHTML = html

    // Dismiss toggle handler
    grid.querySelectorAll('.sd-dismiss-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation()
        const artId = btn.dataset.dismissId
        if (!artId) return
        await fetch(`/api/artifacts/${artId}/dismiss`, { method: 'PUT' })
        fetchAndRender(slider ? slider.value : 35)
      })
    })

    // Click handler: show character scores modal
    grid.querySelectorAll('.sd-card[data-id]').forEach(card => {
      card.addEventListener('click', async () => {
        const artId = card.dataset.id
        if (!artId) return
        const overlay = document.getElementById('sd-modal-overlay')
        const body = document.getElementById('sd-modal-body')
        const title = document.getElementById('sd-modal-title')
        if (!overlay || !body) return

        body.innerHTML = '<div style="text-align:center;padding:2rem"><div style="width:2rem;height:2rem;border:3px solid var(--outline-variant);border-top-color:var(--primary);border-radius:50%;animation:spin 0.8s linear infinite;margin:0 auto"></div></div>'
        overlay.classList.add('active')

        try {
          const res = await fetch(`/api/artifacts/${artId}/character-scores`)
          if (!res.ok) throw new Error()
          const scores = await res.json()
          const maxScore = scores.length > 0 ? scores[0].score : 1

          title.textContent = `캐릭터별 점수 (${scores.length}명)`
          let html = ''
          scores.forEach(s => {
            const pct = Math.max(0, Math.min(100, s.score / 100 * 100))
            const color = s.score >= 60 ? 'var(--secondary)' : s.score >= 35 ? 'var(--primary)' : 'var(--error)'
            html += `<div class="sd-modal__row">
              <div style="flex:1;min-width:0">
                <div class="sd-modal__char">${s.character}</div>
                <div class="sd-modal__breakdown">세트 ${s.set_bonus} + 메인 ${s.main_stat} + 서브 ${s.substats}${s.penalty ? ` - 감점 ${s.penalty}` : ''}</div>
              </div>
              <div style="display:flex;align-items:center;gap:0.5rem;flex-shrink:0">
                <div class="sd-modal__bar"><div class="sd-modal__bar-fill" style="width:${pct}%;background:${color}"></div></div>
                <span class="sd-modal__total" style="color:${color}">${s.score}</span>
              </div>
            </div>`
          })
          body.innerHTML = html
        } catch {
          body.innerHTML = '<p style="text-align:center;padding:2rem;color:var(--error)">조회 실패</p>'
        }
      })
    })
  }

  // Sort state
  let sortAsc = true
  const btnAsc = document.getElementById('sd-sort-asc')
  const btnDesc = document.getElementById('sd-sort-desc')

  if (btnAsc && btnDesc) {
    btnAsc.addEventListener('click', () => {
      if (sortAsc) return
      sortAsc = true
      btnAsc.classList.add('sort-tab--active')
      btnDesc.classList.remove('sort-tab--active')
      fetchAndRender(slider ? slider.value : 35)
    })
    btnDesc.addEventListener('click', () => {
      if (!sortAsc) return
      sortAsc = false
      btnDesc.classList.add('sort-tab--active')
      btnAsc.classList.remove('sort-tab--active')
      fetchAndRender(slider ? slider.value : 35)
    })
  }

  // Set filter change
  const setFilterEl = document.getElementById('sd-set-filter')
  if (setFilterEl) {
    setFilterEl.addEventListener('change', () => fetchAndRender(slider ? slider.value : 35))
  }
  // Dismiss filter change
  const dismissFilterEl = document.getElementById('sd-dismiss-filter')
  if (dismissFilterEl) {
    dismissFilterEl.addEventListener('change', () => fetchAndRender(slider ? slider.value : 35))
  }

  // Initial fetch
  await fetchAndRender(slider ? slider.value : 35)

  // Slider change with debounce
  if (slider) {
    let debounceTimer = null
    slider.addEventListener('input', () => {
      if (sliderVal) sliderVal.textContent = slider.value
      clearTimeout(debounceTimer)
      debounceTimer = setTimeout(() => fetchAndRender(slider.value), 400)
    })
  }
}

// --- Router ---
document.addEventListener('DOMContentLoaded', async () => {
  const page = currentPage
  initMobileNav()
  if (typeof initLangToggle === 'function') initLangToggle()
  if (typeof applyTranslations === 'function') applyTranslations()

  // Skip auth check on login page
  if (page === 'login') return
  const user = await checkAuth()
  if (!user) return

  if (page === 'index') initHome()
  else if (page === 'characters') { await initCharacters(); wireAddButtons() }
  else if (page === 'artifacts') { await initArtifacts(); wireAddButtons() }
  else if (page === 'weapons') { await initWeapons(); wireAddButtons() }
  else if (page === 'teams') { await initTeams(); wireAddButtons() }
  else if (page === 'builds') { await initBuilds(); wireAddButtons() }
  else if (page === 'theater') initTheater()
  else if (page === 'smart-discard') initSmartDiscard()

  // Re-apply translations after dynamic content is loaded
  if (typeof applyTranslations === 'function') applyTranslations()
})
