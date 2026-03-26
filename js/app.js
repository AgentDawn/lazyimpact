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

// --- Page: Home (index) ---
async function initHome() {
  const container = $('#home-grid')
  if (!container) return

  const [chars, artifacts, weapons, teams, builds] = await Promise.all([
    api.get('/characters'),
    api.get('/artifacts'),
    api.get('/weapons'),
    api.get('/teams'),
    api.get('/builds'),
  ])

  $('#home-char-count').textContent = chars.length
  $('#home-artifact-count').textContent = fmt(artifacts.length)
  $('#home-weapon-count').textContent = weapons.length
  $('#home-team-count').textContent = teams.length
  $('#home-build-count').textContent = builds.length

  // Character avatars
  const avatarBox = $('#home-char-avatars')
  if (avatarBox) {
    avatarBox.innerHTML = ''
    chars.slice(0, 4).forEach((c) => {
      avatarBox.innerHTML += `<div style="width:2rem;height:2rem;border-radius:50%;overflow:hidden;background:var(--surface-highest)"><img src="${c.icon}" alt="${c.name}" style="width:100%;height:100%;object-fit:cover"/></div>`
    })
  }

  // Export
  const btnExport = $('#btn-export')
  if (btnExport) {
    btnExport.addEventListener('click', async () => {
      const res = await fetch('/api/export')
      if (!res.ok) return
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'genshin-data-export.json'
      a.click()
      URL.revokeObjectURL(url)
    })
  }

  // Import
  const btnImport = $('#btn-import')
  const fileInput = $('#import-file')
  if (btnImport && fileInput) {
    btnImport.addEventListener('click', () => fileInput.click())
    fileInput.addEventListener('change', async (e) => {
      const file = e.target.files[0]
      if (!file) return
      const text = await file.text()
      try {
        const data = JSON.parse(text)
        const res = await fetch('/api/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })
        if (!res.ok) throw new Error('Import failed')
        const result = await res.json()
        alert(`Imported: ${result.characters || 0} characters, ${result.artifacts || 0} artifacts, ${result.weapons || 0} weapons`)
        location.reload()
      } catch (err) {
        alert('Import error: ' + err.message)
      }
      fileInput.value = ''
    })
  }
}

// --- Page: Characters ---
async function initCharacters() {
  const nameEl = $('.character-name')
  if (!nameEl) return

  await loadCharNameMap()

  const params = new URLSearchParams(window.location.search)
  const charId = params.get('id') || '1'

  const chars = await api.get('/characters')
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

// --- Page: Artifacts ---
async function initArtifacts() {
  const grid = $('#artifact-grid')
  if (!grid) return

  const artifacts = await api.get('/artifacts')

  // Update archive counts
  const archiveVal = $('.archive-total__value')
  if (archiveVal) archiveVal.textContent = fmt(artifacts.length)
  const archiveLv20 = $('#archive-lv20')
  if (archiveLv20) archiveLv20.textContent = artifacts.filter((a) => Number(a.level) >= 20).length
  const countDisplay = $('#artifact-count-display')
  if (countDisplay) countDisplay.textContent = `전체 ${fmt(artifacts.length)}개 표시`

  grid.innerHTML = ''
  const accents = ['primary', 'secondary', 'tertiary', 'error']
  const iconTints = ['gold', 'green', 'purple', 'red']

  artifacts.forEach((a, i) => {
    const accent = accents[i % accents.length]
    const tint = iconTints[i % iconTints.length]

    const subs = [
      { name: a.sub1_name, value: a.sub1_value, rolls: a.sub1_rolls },
      { name: a.sub2_name, value: a.sub2_value, rolls: a.sub2_rolls },
      { name: a.sub3_name, value: a.sub3_value, rolls: a.sub3_rolls },
      { name: a.sub4_name, value: a.sub4_value, rolls: a.sub4_rolls },
    ].filter((s) => s.name)

    const subsHTML = subs.map((s) => {
      const barClass = s.rolls >= 3 ? 'high' : s.rolls >= 2 ? 'mid' : 'low'
      const dots = Array(s.rolls).fill('<div class="substat__dot"></div>').join('')
      return `
        <div class="substat">
          <div class="substat__left">
            <div class="substat__bar substat__bar--${barClass}"></div>
            <span class="substat__name">${s.name}</span>
          </div>
          <div class="substat__right">
            <span class="substat__value">${s.value}</span>
            <div class="substat__rolls">${dots}</div>
          </div>
        </div>`
    }).join('')

    grid.innerHTML += `
      <div class="artifact-card">
        <div class="artifact-card__accent artifact-card__accent--${accent}"></div>
        <div class="artifact-card__body">
          <div class="artifact-card__top">
            <div class="artifact-card__icon-wrap">
              <div class="artifact-card__icon artifact-card__icon--${tint}">
                <img alt="${a.name}" src="${a.icon}"/>
              </div>
              <span class="artifact-card__level">+${a.level}</span>
            </div>
            <div class="artifact-card__main-stat">
              <p class="artifact-card__main-stat-label">Main Stat</p>
              <p class="artifact-card__main-stat-value">${a.main_stat_value}</p>
              <p class="artifact-card__main-stat-type">${a.main_stat_type}</p>
            </div>
          </div>
          <div>
            <h3 class="artifact-card__name">${a.name}</h3>
            <p class="artifact-card__set">${a.set_name}</p>
          </div>
          <div class="substats">${subsHTML}</div>
          <div class="artifact-card__footer">
            <span style="font-size:0.625rem;color:var(--on-surface-variant)">${a.equipped_by || ''}</span>
            <button class="artifact-card__edit" data-id="${a.id}">
              <span class="material-symbols-outlined" style="font-size:1.125rem">delete</span>
            </button>
          </div>
        </div>
      </div>`
  })

  // Add artifact placeholder
  grid.innerHTML += `
    <button class="artifact-add" id="btn-add-artifact">
      <span class="material-symbols-outlined">add_circle</span>
      <span>Add Artifact</span>
    </button>`

  // Delete handlers
  $$('.artifact-card__edit', grid).forEach((btn) => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.id
      if (!id) return
      await api.del(`/artifacts/${id}`)
      initArtifacts()
    })
  })

  // Filter interactivity
  bindFilters()
}

// --- Page: Weapons ---
async function initWeapons() {
  const grid = $('#weapon-grid')
  if (!grid) return

  const weapons = await api.get('/weapons')
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

// --- Name Translation Maps ---
let charNameKoToEn = {}
let charNameEnToKo = {}

async function loadCharNameMap() {
  try {
    const res = await fetch('/api/character-names')
    if (!res.ok) return
    const names = await res.json()
    names.forEach((n) => {
      charNameKoToEn[n.name_ko] = n.name_en
      charNameKoToEn[n.name_en] = n.name_en
      charNameEnToKo[n.name_en] = n.name_ko
      charNameEnToKo[n.name_ko] = n.name_ko
    })
  } catch {}
}

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

  await loadCharNameMap()

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

  // Re-apply translations after dynamic content is loaded
  if (typeof applyTranslations === 'function') applyTranslations()
})
