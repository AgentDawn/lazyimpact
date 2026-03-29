# LazyImpact

원신(Genshin Impact) 게으른 유저를 위한 플래너. 데이터를 업로드하면 무엇을 해야 하는지 알려줍니다.

## 핵심 기능

- **스마트 폐기** — 캐릭터별 상대 점수로 불필요한 성유물 자동 분석 (Fribbels 방식)
- **나선비경 최적화** — gcsim 기반 DPS 시뮬레이션으로 최적 팀 추천
- **환상극 플래너** — 원소별 로스터 현황, DFS 최적 조합, 빌려올 캐릭터 추천
- **일일 레진 계획** — 최적화 결과 기반 구체적 파밍 가이드
- **비회원 모드** — 회원가입 없이 바로 사용 (365일 세션)

## 실행

```bash
docker compose up -d
open http://localhost:3000
```

## 종료

```bash
docker compose down       # 데이터 유지
docker compose down -v    # 데이터 초기화
```

## 사용 흐름

1. 비회원으로 시작 (또는 회원가입)
2. [Irminsul](https://github.com/konkers/irminsul) 스캐너로 GOOD 포맷 JSON 내보내기
3. 홈에서 JSON 업로드 → 자동으로 환상극 + 나선비경 DFS 최적화 실행
4. 홈의 "오늘 뭐 하지?"에서 할 일 확인

## 아키텍처

```
Docker Compose
├── rqlite (:4001)     — 분산 SQLite DB
└── Go API  (:3000)    — REST API + 정적 파일 서빙
    ├── 인증: /api/register, /api/login, /api/guest
    ├── 데이터: /api/characters, /api/artifacts, /api/weapons
    ├── Import/Export: /api/import, /api/export (GOOD 포맷)
    ├── 스마트 폐기: /api/artifacts/smart-discard, /api/artifacts/{id}/character-scores
    ├── 플래너: /api/planner/recommend, /api/theater/seasons
    ├── 최적화: /api/optimize/start (theater/abyss/all), /api/optimize/status/{id}
    └── gcsim 내장: DPS 시뮬레이션 (server/gcsim/)
```

## 페이지

| 경로 | 설명 |
|---|---|
| `/` | 홈 — "오늘 뭐 하지?" 액션 가이드 + 레진 계획 |
| `/smart-discard` | 스마트 폐기 — 캐릭터별 점수, 세트 필터, 제거됨 토글 |
| `/abyss` | 나선비경 — DFS 팀 최적화 + gcsim DPS 시뮬레이션 |
| `/planner` | 환상극 — 로스터 현황, 최적 조합, 빌려올 추천 |
| `/login` | 로그인 / 회원가입 / 비회원 |

## 스마트 폐기 알고리즘

각 성유물을 109명 캐릭터에 대해 개별 점수 산정:
- 세트 보너스 (0/30) + 메인옵 적합성 (0/30) + 서브옵 가중치 (0-40) - 강화 낭비 감점
- 모든 캐릭터 중 최고 점수가 기준값 미만이면 폐기 후보
- 기준값 슬라이더로 조절 가능 (기본 35, 범위 10-100)

## gcsim DPS 시뮬레이션

[gcsim](https://github.com/genshinsim/gcsim) (MIT 라이선스)을 내재화하여 프레임 단위 몬테카를로 DPS 시뮬레이션 제공:
- Go 라이브러리로 직접 호출 (외부 의존성 없음)
- 메타 팀 로테이션 템플릿 8종 (내셔널, 빙결, 하이퍼블룸, 증발, 모노파이로, 감전 등)
- 유저 실제 캐릭터/무기/성유물 데이터로 시뮬레이션
- 50회 반복, ~200ms 소요

## 데이터 소스

- 캐릭터/무기/성유물 한글명: [genshin-optimizer](https://github.com/frzyc/genshin-optimizer) 로컬라이제이션
- 성유물 썸네일 이미지: genshin-optimizer 에셋 (59세트 × 5슬롯 = 279개)
- DPS 시뮬레이션: gcsim (MIT, 내재화)
- GOOD 포맷: [Genshin Open Object Description](https://frzyc.github.io/genshin-optimizer/#/doc)

## 개발

| 변경 대상 | 반영 방법 |
|---|---|
| HTML / CSS / JS | 브라우저 새로고침 (`Ctrl+Shift+R`) |
| Go 서버 | `docker compose up -d --build` |
| DB 스키마 | `docker compose down -v && docker compose up -d --build` |

## 테스트

```bash
# Docker가 실행 중인 상태에서
npx playwright test
```

382개 Playwright E2E 테스트: 스마트 폐기 시나리오, 인증, API, UI 검증.

## 기술 스택

- **Frontend**: Vanilla HTML / CSS / JS (프레임워크 없음)
- **Backend**: Go 1.26 (net/http, bcrypt)
- **Database**: rqlite 8.x (분산 SQLite)
- **DPS Simulation**: gcsim (내재화, MIT)
- **Test**: Playwright (Chromium)
- **Infra**: Docker Compose
- **CI/CD**: GitHub Actions → GHCR (`ghcr.io/agentdawn/lazyimpact`)

## 라이선스

- LazyImpact: MIT
- gcsim (server/gcsim/): MIT — Copyright (c) 2021 genshinsim
