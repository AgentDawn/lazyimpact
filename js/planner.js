/**
 * Planner — Theater Prep + Daily Resin + Weekly BP
 */

document.addEventListener('DOMContentLoaded', async () => {
  const prepEl = document.getElementById('theater-prep-content')
  const dailyEl = document.getElementById('daily-plan')
  const bpEl = document.getElementById('weekly-bp')
  if (!prepEl) return

  try {
    const res = await fetch('/api/planner/recommend')
    if (res.status === 401) { window.location.href = '/login.html'; return }
    if (!res.ok) throw new Error()
    const data = await res.json()

    renderTheaterPrep(prepEl, data.theater_prep || [])
    renderDailyPlan(dailyEl, data.daily_plan || [], data.resin_total || 160)
    renderBP(bpEl, data.bp_missions || [])

    // Update resin display
    const resinDisplay = document.getElementById('resin-display')
    if (resinDisplay) resinDisplay.textContent = `${data.resin_total || 160}/${data.resin_total || 160}`
  } catch (e) {
    prepEl.innerHTML = '<p style="color:var(--error)">데이터를 불러올 수 없습니다.</p>'
  }

  // Wire up theater DFS optimize button
  const btnTheater = document.getElementById('btn-theater-optimize')
  if (btnTheater) {
    btnTheater.addEventListener('click', async () => {
      const progressEl = document.getElementById('theater-optimize-progress')
      btnTheater.disabled = true
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
          renderTheaterPrep(prepEl, result.theater_prep || [])
        })
      } catch {
        if (progressEl) progressEl.innerHTML = '<p style="color:var(--error)">최적화 시작 실패</p>'
        btnTheater.disabled = false
      }
    })
  }
})

function renderTheaterPrep(el, recs) {
  if (recs.length === 0) {
    el.innerHTML = `<div style="display:flex;align-items:center;gap:0.75rem;padding:1rem;background:var(--surface-highest);border-radius:var(--r-md)">
      <span class="material-symbols-outlined" style="color:var(--secondary)">check_circle</span>
      <span style="font-size:0.875rem">환상극 준비 완료! 모든 원소 캐릭터가 충분합니다.</span>
    </div>`
    return
  }

  el.innerHTML = recs.map((r) => {
    const prioColors = { 1: 'var(--error)', 2: 'var(--tertiary)', 3: 'var(--on-surface-variant)' }
    const prioLabels = { 1: '긴급', 2: '권장', 3: '참고' }
    return `<div style="display:flex;align-items:center;gap:1rem;padding:0.75rem;background:var(--surface-highest);border-radius:var(--r-md);margin-bottom:0.5rem;border-left:3px solid ${prioColors[r.priority] || 'var(--outline)'}">
      <div style="flex-grow:1">
        <div style="font-size:0.875rem;font-weight:600">${r.title}</div>
        <div style="font-size:0.75rem;color:var(--on-surface-variant);margin-top:0.125rem">${r.reason}</div>
      </div>
      <span style="font-size:0.625rem;font-weight:700;padding:0.25rem 0.5rem;border-radius:var(--r-full);background:${prioColors[r.priority]};color:var(--on-primary)">${prioLabels[r.priority] || ''}</span>
      ${r.resin > 0 ? `<span style="font-size:0.75rem;color:var(--primary);font-weight:700">${r.resin} 레진</span>` : ''}
    </div>`
  }).join('')
}

function renderDailyPlan(el, plan, total) {
  let used = 0
  const rows = plan.map((p) => {
    used += p.resin
    return `<div style="display:flex;align-items:center;gap:1rem;padding:0.75rem;background:var(--surface-container);border-radius:var(--r-md);margin-bottom:0.5rem">
      <span class="material-symbols-outlined" style="font-size:1.25rem;color:var(--primary)">${getCategoryIcon(p.category)}</span>
      <div style="flex-grow:1">
        <div style="font-size:0.875rem;font-weight:600">${p.title}</div>
        <div style="font-size:0.75rem;color:var(--on-surface-variant)">${p.reason}</div>
      </div>
      <span style="font-size:0.875rem;font-weight:700;color:var(--primary)">${p.resin}</span>
    </div>`
  }).join('')

  // Resin bar
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
