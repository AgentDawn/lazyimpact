/**
 * i18n — Korean (default) / English toggle
 */
const translations = {
  // Nav
  'nav.home': { ko: '홈', en: 'Home' },
  'nav.characters': { ko: '캐릭터', en: 'Characters' },
  'nav.weapons': { ko: '무기', en: 'Weapons' },
  'nav.artifacts': { ko: '성유물', en: 'Artifacts' },
  'nav.teams': { ko: '팀', en: 'Teams' },
  'nav.builds': { ko: '빌드', en: 'Builds' },
  'nav.theater': { ko: '환상극', en: 'Theater' },
  'nav.scanner': { ko: '스캐너', en: 'Scanner' },

  // Home
  'home.title': { ko: 'LazyImpact', en: 'LazyImpact' },
  'home.subtitle': { ko: '빌드 최적화, 성유물 관리, 팀 구성을 통해 최대 데미지를 달성하세요.', en: 'Optimize your builds, manage artifacts, and plan team compositions for maximum damage output.' },
  'home.export': { ko: '데이터 내보내기', en: 'Export Data' },
  'home.import': { ko: '데이터 가져오기', en: 'Import Data' },
  'home.characters': { ko: '캐릭터', en: 'Characters' },
  'home.characters.desc': { ko: '캐릭터 빌드, 스탯 확인 및 성유물 옵티마이저를 실행하세요.', en: 'View character builds, stats, and run the artifact optimizer.' },
  'home.artifacts': { ko: '성유물', en: 'Artifacts' },
  'home.artifacts.desc': { ko: '성유물 컬렉션을 탐색, 필터링, 평가하세요.', en: 'Browse, filter, and evaluate your artifact collection.' },
  'home.artifacts.total': { ko: '전체 성유물', en: 'total artifacts' },
  'home.weapons': { ko: '무기', en: 'Weapons' },
  'home.weapons.desc': { ko: '무기 인벤토리 및 재련을 관리하세요.', en: 'Manage your weapon inventory and refinements.' },
  'home.teams': { ko: '팀', en: 'Teams' },
  'home.teams.desc': { ko: '나선 비경을 위한 팀 구성을 관리하세요.', en: 'Build and manage your Abyss-ready team compositions.' },
  'home.builds': { ko: '저장된 빌드', en: 'Saved Builds' },
  'home.builds.desc': { ko: '저장된 최적화 빌드를 확인하세요.', en: 'Access your saved and optimized loadouts.' },

  // Characters
  'char.attributes': { ko: '캐릭터 속성', en: 'Character Attributes' },
  'char.hp': { ko: 'HP', en: 'Health Points' },
  'char.atk': { ko: '공격력', en: 'Attack Power' },
  'char.critrate': { ko: '치명타 확률', en: 'Crit Rate' },
  'char.critdmg': { ko: '치명타 피해', en: 'Crit Damage' },
  'char.er': { ko: '원소 충전 효율', en: 'Energy Recharge' },
  'char.em': { ko: '원소 마스터리', en: 'Elemental Mastery' },
  'char.constraints': { ko: '최적화 조건', en: 'Optimization Constraints' },
  'char.target': { ko: '목표 계산', en: 'Target Calculation' },
  'char.min.er': { ko: '최소 원충', en: 'Min. Energy Recharge' },
  'char.min.cr': { ko: '최소 치확', en: 'Min. Crit Rate' },
  'char.run': { ko: '옵티마이저 실행', en: 'Run Optimizer' },
  'char.results': { ko: '최적화 결과', en: 'Optimization Results' },
  'char.weapon': { ko: '장착 무기', en: 'Equipped Weapon' },

  // Artifacts
  'art.title': { ko: '성유물 인벤토리', en: 'Artifacts Inventory' },
  'art.subtitle': { ko: '성유물을 관리하고 최적화하세요', en: 'Manage and optimize your celestial equipment' },
  'art.filters': { ko: '필터', en: 'Filters' },
  'art.clearall': { ko: '전체 해제', en: 'Clear All' },
  'art.set': { ko: '성유물 세트', en: 'Artifact Set' },
  'art.search': { ko: '세트 검색...', en: 'Search sets...' },
  'art.slot': { ko: '부위', en: 'Slot' },
  'art.mainstat': { ko: '메인 옵션', en: 'Main Stat' },
  'art.any': { ko: '전체', en: 'Any Main Stat' },
  'art.substats': { ko: '원하는 부옵션', en: 'Desired Substats' },
  'art.total': { ko: '보유 총계', en: 'Archive Total' },
  'art.lv20': { ko: '+20 성유물:', en: 'Level 20 Artifacts:' },
  'art.sortby': { ko: '정렬', en: 'Sort By' },
  'art.quality': { ko: '품질', en: 'Quality' },
  'art.newest': { ko: '최신', en: 'Newest' },
  'art.add': { ko: '성유물 추가', en: 'Add Artifact' },
  'art.loadmore': { ko: '더 보기', en: 'Load More Data' },

  // Weapons
  'weap.title': { ko: '무기 인벤토리', en: 'Weapons Inventory' },
  'weap.subtitle': { ko: '무기를 관리하고 재련하세요', en: 'Manage and refine your arsenal' },
  'weap.add': { ko: '무기 추가', en: 'Add Weapon' },

  // Teams
  'team.title': { ko: '팀 구성', en: 'Team Compositions' },
  'team.subtitle': { ko: '나선 비경용 팀을 구성하고 관리하세요', en: 'Build and manage your Abyss-ready squads' },
  'team.create': { ko: '새 팀 만들기', en: 'Create New Team' },
  'team.edit': { ko: '팀 편집', en: 'Edit Team' },

  // Builds
  'build.title': { ko: '저장된 빌드', en: 'Saved Builds' },
  'build.subtitle': { ko: '최적화된 빌드 및 장비 세트', en: 'Your optimized builds and loadouts' },
  'build.save': { ko: '현재 빌드 저장', en: 'Save Current Build' },
  'build.load': { ko: '빌드 불러오기', en: 'Load Build' },

  // Theater
  'theater.title': { ko: '환상극', en: 'Imaginarium Theater' },
  'theater.subtitle': { ko: '현실 속 환상극 — 시즌별 캐릭터 라인업 및 일정', en: 'Imaginarium Theater — Season character lineup and schedule' },
  'theater.cast': { ko: '출연 캐릭터', en: 'Featured Characters' },
  'theater.guest': { ko: '특별 초대', en: 'Special Guests' },

  // Scanner
  'scanner.title': { ko: '스캐너 — Irminsul', en: 'Scanner — Irminsul' },
  'scanner.subtitle': { ko: 'Irminsul 패킷 캡처 스캐너로 게임 데이터를 가져오세요', en: 'Import your game data using the Irminsul packet capture scanner' },
  'scanner.desc': { ko: 'Irminsul은 패킷 캡처 기반의 원신 데이터 스캐너입니다. OCR 방식보다 빠르고 정확하게 캐릭터, 성유물, 무기 데이터를 추출합니다.', en: 'Irminsul is a packet capture-based Genshin Impact data scanner. Faster and more accurate than OCR for extracting character, artifact, and weapon data.' },
  'scanner.download': { ko: 'GitHub에서 다운로드', en: 'Download from GitHub' },
  'scanner.import': { ko: '데이터 가져오기', en: 'Import Data' },
  'scanner.import.desc': { ko: 'GOOD 포맷 JSON 파일 업로드', en: 'Upload GOOD format JSON file' },
  'scanner.drop': { ko: '클릭하거나 파일을 드래그하세요', en: 'Click or drag file here' },
  'scanner.howto': { ko: '사용 방법', en: 'How to Use' },
  'scanner.step1': { ko: 'Irminsul 다운로드', en: 'Download Irminsul' },
  'scanner.step1.desc': { ko: 'GitHub에서 최신 릴리즈를 다운받아 관리자 권한으로 실행합니다.', en: 'Download the latest release from GitHub and run as administrator.' },
  'scanner.step2': { ko: '원신 시작과 함께 스캔', en: 'Scan with game launch' },
  'scanner.step2.desc': { ko: 'Irminsul을 먼저 실행한 후 원신을 시작하면 자동으로 데이터를 캡처합니다.', en: 'Run Irminsul first, then launch Genshin Impact to automatically capture data.' },
  'scanner.step3': { ko: 'GOOD JSON 내보내기', en: 'Export GOOD JSON' },
  'scanner.step3.desc': { ko: '스캔 완료 후 GOOD 포맷으로 JSON 파일을 내보냅니다.', en: 'After scanning, export the JSON file in GOOD format.' },
  'scanner.step4': { ko: '여기서 Import', en: 'Import here' },
  'scanner.step4.desc': { ko: '내보낸 JSON 파일을 위 Import 영역에 업로드하면 데이터가 자동으로 등록됩니다.', en: 'Upload the exported JSON file to the Import area above to register data automatically.' },

  // Auth
  'auth.signin': { ko: '로그인', en: 'Sign In' },
  'auth.register': { ko: '회원가입', en: 'Register' },
  'auth.create': { ko: '계정 만들기', en: 'Create Account' },
  'auth.username': { ko: '사용자 이름', en: 'Username' },
  'auth.password': { ko: '비밀번호', en: 'Password' },
  'auth.no.account': { ko: '계정이 없으신가요?', en: "Don't have an account?" },
  'auth.has.account': { ko: '이미 계정이 있으신가요?', en: 'Already have an account?' },

  // Common
  'filter': { ko: '필터', en: 'Filter' },
  'sort.dps': { ko: '정렬: DPS', en: 'Sort: DPS' },
  'est.dmg': { ko: '예상 피해량', en: 'Est. DMG' },
  'apply': { ko: '적용', en: 'Apply Build' },
  'save': { ko: '저장', en: 'Save' },
  'footer.disclaimer': { ko: '이론 계산 목적으로 제공됩니다. HoYoverse와 관련이 없습니다.', en: 'Data provided for theorycrafting purposes. Not affiliated with HoYoverse.' },
}

// Get/set language
function getLang() {
  return document.cookie.replace(/(?:(?:^|.*;\s*)lang\s*=\s*([^;]*).*$)|^.*$/, '$1') || 'ko'
}

function setLang(lang, saveToServer = true) {
  document.cookie = `lang=${lang};path=/;max-age=${365 * 24 * 3600};SameSite=Strict`
  applyTranslations()
  if (saveToServer) {
    fetch('/api/me/lang', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lang }),
    }).catch(() => {})
  }
}

function t(key) {
  const entry = translations[key]
  if (!entry) return key
  return entry[getLang()] || entry['ko'] || key
}

function applyTranslations() {
  const lang = getLang()
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.dataset.i18n
    const entry = translations[key]
    if (!entry) return
    const text = entry[lang] || entry['ko']
    if (el.tagName === 'INPUT' && el.placeholder !== undefined) {
      el.placeholder = text
    } else {
      el.textContent = text
    }
  })
  // Update toggle button
  const toggle = document.getElementById('lang-toggle')
  if (toggle) toggle.textContent = lang === 'ko' ? 'EN' : '한'
}

function initLangToggle() {
  const navActions = document.querySelector('.nav__actions')
  if (!navActions) return
  const btn = document.createElement('button')
  btn.id = 'lang-toggle'
  btn.className = 'nav__icon-btn'
  btn.style.cssText = 'font-size:0.75rem;font-weight:700;width:2rem;height:2rem;display:flex;align-items:center;justify-content:center'
  btn.textContent = getLang() === 'ko' ? 'EN' : '한'
  btn.addEventListener('click', () => {
    setLang(getLang() === 'ko' ? 'en' : 'ko')
  })
  navActions.prepend(btn)
}
