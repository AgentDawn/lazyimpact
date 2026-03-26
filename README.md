# Genshin Dashboard

Genshin Impact 빌드 최적화 및 인벤토리 관리 대시보드.
Docker Compose로 Go API 서버 + rqlite DB를 실행하고, 바닐라 HTML/CSS/JS 프론트엔드를 제공합니다.

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

## 아키텍처

```
Docker Compose
├── rqlite (:4001)     — 분산 SQLite DB
└── Go API  (:3000)    — REST API + 정적 파일 서빙
    ├── /api/register, /api/login, /api/logout, /api/me
    ├── /api/characters, /api/artifacts, /api/weapons
    ├── /api/teams, /api/builds
    └── /api/export, /api/import (GOOD 포맷)
```

## 페이지

| 경로 | 설명 |
|---|---|
| `/` | 홈 대시보드 (카운트, Export/Import) |
| `/characters` | 캐릭터 상세, 스탯, 옵티마이저 컨트롤 |
| `/artifacts` | 아티팩트 인벤토리, 필터, 추가/삭제 |
| `/weapons` | 무기 인벤토리 |
| `/teams` | 팀 구성 |
| `/builds` | 저장된 빌드 |
| `/theater` | 환상극 시즌 라인업 (2026년 3~4월) |
| `/scanner` | Irminsul 스캐너 연동 + GOOD JSON Import |
| `/login` | 로그인 / 회원가입 |

## 인증

- 비밀번호: bcrypt 해싱
- 세션: `crypto/rand` 32바이트 토큰, HTTP-only 쿠키 (7일 TTL)
- 모든 `/api/*` (auth 제외) 인증 필수

## Import / Export

[GOOD (Genshin Open Object Description)](https://github.com/frzyc/genshin-optimizer) 포맷 지원.
genshin-optimizer 또는 Irminsul 스캐너에서 내보낸 JSON을 그대로 Import 가능.

```bash
# Export
curl -b cookie.txt http://localhost:3000/api/export -o data.json

# Import
curl -b cookie.txt -X POST http://localhost:3000/api/import \
  -H 'Content-Type: application/json' -d @data.json
```

## 에셋

genshin-optimizer 레포에서 가져온 로컬 이미지 643개:

- `assets/chars/` — 캐릭터 아이콘 (123개)
- `assets/weapons/` — 무기 아이콘 (232개)
- `assets/artifacts/` — 아티팩트 아이콘 (283개, 59세트)
- `assets/slots/` — 슬롯 아이콘 (5개)

## 개발

소스 수정 후 반영 방법:

| 변경 대상 | 반영 방법 |
|---|---|
| HTML / CSS / JS | 브라우저 새로고침 |
| Go 서버 | `docker compose build api && docker compose up -d` |
| docker-compose.yml | `docker compose down && docker compose up -d` |
| DB 스키마 | `docker compose down -v && docker compose up -d` |

## 테스트

```bash
# Docker가 실행 중인 상태에서
npx playwright test
```

Playwright 56개 테스트: 인증, 네비게이션, API 연동, CRUD, 버튼 클릭.

## 기술 스택

- **Frontend**: Vanilla HTML / CSS / JS
- **Backend**: Go 1.23 (net/http, bcrypt)
- **Database**: rqlite 8.x (분산 SQLite)
- **Test**: Playwright (Chromium)
- **Infra**: Docker Compose
