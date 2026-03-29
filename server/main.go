package main

import (
	"bytes"
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"math"
	"net/http"
	"os"
	"sort"
	"strconv"
	"strings"
	"time"

	"golang.org/x/crypto/bcrypt"
)

var rqliteURL string

func main() {
	rqliteURL = envOrDefault("RQLITE_URL", "http://localhost:4001")
	port := envOrDefault("PORT", "3000")

	initDB()

	mux := http.NewServeMux()

	// Auth routes (public)
	mux.HandleFunc("POST /api/register", handleRegister)
	mux.HandleFunc("POST /api/login", handleLogin)
	mux.HandleFunc("POST /api/logout", handleLogout)
	mux.HandleFunc("POST /api/guest", handleGuest)
	mux.HandleFunc("GET /api/me", handleMe)
	mux.HandleFunc("PUT /api/me/lang", auth(handleUpdateLang))
	mux.HandleFunc("PUT /api/me/preferences", auth(handleUpdatePreferences))

	// Protected API routes
	mux.HandleFunc("GET /api/characters", auth(handleListCharacters))
	mux.HandleFunc("GET /api/characters/{id}", auth(handleGetCharacter))
	mux.HandleFunc("POST /api/characters", auth(handleCreateCharacter))

	mux.HandleFunc("GET /api/artifacts", auth(handleListArtifacts))
	mux.HandleFunc("POST /api/artifacts", auth(handleCreateArtifact))
	mux.HandleFunc("DELETE /api/artifacts/{id}", auth(handleDeleteArtifact))
	mux.HandleFunc("GET /api/artifacts/smart-discard", auth(handleSmartDiscard))
	mux.HandleFunc("GET /api/artifacts/{id}/character-scores", auth(handleArtifactCharScores))
	mux.HandleFunc("PUT /api/artifacts/{id}/dismiss", auth(handleToggleDismiss))
	mux.HandleFunc("POST /api/artifacts/batch-delete", auth(handleBatchDeleteArtifacts))

	mux.HandleFunc("GET /api/weapons", auth(handleListWeapons))
	mux.HandleFunc("POST /api/weapons", auth(handleCreateWeapon))

	mux.HandleFunc("GET /api/teams", auth(handleListTeams))
	mux.HandleFunc("POST /api/teams", auth(handleCreateTeam))

	mux.HandleFunc("GET /api/builds", auth(handleListBuilds))
	mux.HandleFunc("POST /api/builds", auth(handleCreateBuild))

	// Character names dictionary (public)
	mux.HandleFunc("GET /api/character-names", handleCharacterNames)

	// Import/Export
	mux.HandleFunc("GET /api/export", auth(handleExport))
	mux.HandleFunc("POST /api/import", auth(handleImport))

	// Planner
	mux.HandleFunc("GET /api/theater/seasons", handleTheaterSeasons)
	mux.HandleFunc("GET /api/planner/recommend", auth(handlePlannerRecommend))
	mux.HandleFunc("GET /api/planner/bp", auth(handleBPList))
	mux.HandleFunc("PUT /api/planner/bp/{id}", auth(handleBPToggle))
	mux.HandleFunc("POST /api/planner/bp/reset", auth(handleBPReset))

	// Abyss
	mux.HandleFunc("GET /api/abyss/seasons", handleAbyssSeasons)
	mux.HandleFunc("GET /api/abyss/optimize", auth(handleAbyssOptimize))
	mux.HandleFunc("GET /api/abyss/gap-analysis", auth(handleAbyssGapAnalysis))

	// Async DFS optimization
	mux.HandleFunc("POST /api/optimize/start", auth(handleOptimizeStart))
	mux.HandleFunc("GET /api/optimize/status/{id}", auth(handleOptimizeStatus))
	mux.HandleFunc("GET /api/optimize/latest/{type}", auth(handleOptimizeLatest))

	// Weekly bosses
	mux.HandleFunc("GET /api/weekly-bosses", handleListWeeklyBosses)
	mux.HandleFunc("GET /api/planner/weekly-bosses", auth(handleGetUserWeeklyBosses))
	mux.HandleFunc("PUT /api/planner/weekly-bosses/{id}", auth(handleToggleWeeklyBoss))

	// Static files
	static := http.FileServer(http.Dir("/app/static"))
	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Cache-Control", "no-cache, no-store, must-revalidate")
		w.Header().Set("Pragma", "no-cache")
		w.Header().Set("Expires", "0")
		static.ServeHTTP(w, r)
	})

	log.Printf("Server listening on :%s", port)
	log.Fatal(http.ListenAndServe(":"+port, mux))
}

// --- DB Init ---

func initDB() {
	for i := 0; i < 30; i++ {
		_, err := rqliteQuery("SELECT 1")
		if err == nil {
			break
		}
		log.Printf("Waiting for rqlite... (%v)", err)
		time.Sleep(time.Second)
	}

	stmts := []string{
		`CREATE TABLE IF NOT EXISTS characters (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			name TEXT NOT NULL,
			name_ko TEXT DEFAULT '',
			element TEXT NOT NULL,
			weapon_type TEXT NOT NULL,
			level INTEGER DEFAULT 1,
			weapon_name TEXT,
			hp INTEGER DEFAULT 0,
			atk INTEGER DEFAULT 0,
			crit_rate REAL DEFAULT 0,
			crit_dmg REAL DEFAULT 0,
			energy_recharge REAL DEFAULT 0,
			elemental_mastery INTEGER DEFAULT 0,
			icon TEXT,
			tier TEXT DEFAULT 'B',
			constellation INTEGER DEFAULT 0,
			user_id INTEGER DEFAULT 0
		)`,
		`CREATE TABLE IF NOT EXISTS character_names (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			name_en TEXT NOT NULL UNIQUE,
			name_ko TEXT NOT NULL
		)`,
		`CREATE TABLE IF NOT EXISTS artifacts (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			name TEXT NOT NULL,
			set_name TEXT NOT NULL,
			slot TEXT NOT NULL,
			level INTEGER DEFAULT 0,
			rarity INTEGER DEFAULT 5,
			lock INTEGER DEFAULT 0,
			dismissed INTEGER DEFAULT 0,
			main_stat_type TEXT,
			main_stat_value TEXT,
			sub1_name TEXT, sub1_value TEXT, sub1_rolls INTEGER DEFAULT 0,
			sub2_name TEXT, sub2_value TEXT, sub2_rolls INTEGER DEFAULT 0,
			sub3_name TEXT, sub3_value TEXT, sub3_rolls INTEGER DEFAULT 0,
			sub4_name TEXT, sub4_value TEXT, sub4_rolls INTEGER DEFAULT 0,
			equipped_by TEXT,
			icon TEXT,
			user_id INTEGER DEFAULT 0
		)`,
		`CREATE TABLE IF NOT EXISTS weapons (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			name TEXT NOT NULL,
			type TEXT NOT NULL,
			level INTEGER DEFAULT 1,
			refinement INTEGER DEFAULT 1,
			base_atk INTEGER DEFAULT 0,
			sub_stat_type TEXT,
			sub_stat_value TEXT,
			rarity INTEGER DEFAULT 4,
			equipped_by TEXT,
			icon TEXT,
			user_id INTEGER DEFAULT 0
		)`,
		`CREATE TABLE IF NOT EXISTS teams (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			name TEXT NOT NULL,
			description TEXT,
			member1 TEXT, member2 TEXT, member3 TEXT, member4 TEXT,
			user_id INTEGER DEFAULT 0
		)`,
		`CREATE TABLE IF NOT EXISTS builds (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			character_name TEXT NOT NULL,
			build_name TEXT NOT NULL,
			description TEXT,
			est_dmg INTEGER DEFAULT 0,
			icon TEXT,
			user_id INTEGER DEFAULT 0
		)`,
		`CREATE TABLE IF NOT EXISTS users (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			username TEXT NOT NULL UNIQUE,
			password_hash TEXT NOT NULL,
			lang TEXT DEFAULT 'ko',
			prefer_gender TEXT DEFAULT 'all',
			include_default_males INTEGER DEFAULT 1,
			theater_difficulty TEXT DEFAULT 'transcendence',
			created_at TEXT DEFAULT (datetime('now'))
		)`,
		`CREATE TABLE IF NOT EXISTS sessions (
			id TEXT PRIMARY KEY,
			user_id INTEGER NOT NULL,
			username TEXT NOT NULL,
			created_at TEXT DEFAULT (datetime('now')),
			expires_at TEXT NOT NULL
		)`,
		`CREATE TABLE IF NOT EXISTS theater_seasons (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			title TEXT NOT NULL,
			date TEXT,
			elements TEXT,
			cast_characters TEXT,
			guest_characters TEXT,
			bosses TEXT
		)`,
		`CREATE TABLE IF NOT EXISTS bp_missions (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			user_id INTEGER NOT NULL,
			week TEXT NOT NULL,
			mission TEXT NOT NULL,
			target INTEGER DEFAULT 0,
			progress INTEGER DEFAULT 0,
			done INTEGER DEFAULT 0
		)`,
		`CREATE TABLE IF NOT EXISTS daily_plans (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			user_id INTEGER NOT NULL,
			date TEXT NOT NULL,
			tasks TEXT NOT NULL,
			resin_used INTEGER DEFAULT 0
		)`,
		`CREATE TABLE IF NOT EXISTS weekly_bosses (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			name TEXT NOT NULL,
			region TEXT NOT NULL,
			sort_order INTEGER DEFAULT 0
		)`,
		`CREATE TABLE IF NOT EXISTS user_weekly_bosses (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			user_id INTEGER NOT NULL,
			week TEXT NOT NULL,
			boss_id INTEGER NOT NULL,
			done INTEGER DEFAULT 0
		)`,
		`CREATE TABLE IF NOT EXISTS abyss_seasons (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			period TEXT NOT NULL,
			blessing TEXT,
			floor12_data TEXT
		)`,
		`CREATE TABLE IF NOT EXISTS optimize_jobs (
			id TEXT PRIMARY KEY,
			user_id INTEGER NOT NULL,
			type TEXT NOT NULL,
			status TEXT DEFAULT 'pending',
			progress INTEGER DEFAULT 0,
			result TEXT,
			created_at TEXT DEFAULT (datetime('now')),
			finished_at TEXT
		)`,
	}
	rqliteExec(stmts)

	// Migrations: add rarity/lock columns to artifacts for existing DBs
	rqliteExec([]string{`ALTER TABLE artifacts ADD COLUMN rarity INTEGER DEFAULT 5`})
	rqliteExec([]string{`ALTER TABLE artifacts ADD COLUMN lock INTEGER DEFAULT 0`})
	rqliteExec([]string{`ALTER TABLE artifacts ADD COLUMN dismissed INTEGER DEFAULT 0`})

	// Always ensure character dictionary is fully seeded (uses INSERT OR IGNORE)
	seed()

	// Seed theater seasons if empty
	theaterResult, _ := rqliteQuery("SELECT COUNT(*) AS cnt FROM theater_seasons")
	if getCount(theaterResult) == 0 {
		seedTheater()
	}

	// Seed weekly bosses if empty
	wbResult, _ := rqliteQuery("SELECT COUNT(*) AS cnt FROM weekly_bosses")
	if getCount(wbResult) == 0 {
		seedWeeklyBosses()
	}

	// Seed abyss seasons if empty
	abyssResult, _ := rqliteQuery("SELECT COUNT(*) AS cnt FROM abyss_seasons")
	if getCount(abyssResult) == 0 {
		seedAbyss()
	}
}

func seed() {
	log.Println("Seeding character name dictionary...")
	names := []struct{ en, ko string }{
		{"Amber", "엠버"}, {"Xiangling", "향릉"}, {"Bennett", "베넷"}, {"Diluc", "다이루크"},
		{"Klee", "클레"}, {"Yanfei", "연비"}, {"Hu Tao", "호두"}, {"Yoimiya", "요이미야"},
		{"Thoma", "토마"}, {"Dehya", "데히야"}, {"Lyney", "리니"}, {"Chevreuse", "슈브르즈"},
		{"Gaming", "가명"}, {"Arlecchino", "아를레키노"}, {"Mavuika", "마비카"}, {"Columbina", "콜롬비나"},
		{"Barbara", "바바라"}, {"Xingqiu", "행추"}, {"Mona", "모나"}, {"Tartaglia", "타르탈리아"},
		{"Sangonomiya Kokomi", "산고노미야 코코미"}, {"Kokomi", "산고노미야 코코미"}, {"Kamisato Ayato", "카미사토 아야토"}, {"Ayato", "카미사토 아야토"}, {"Yelan", "야란"}, {"Candace", "캔디스"},
		{"Nilou", "닐루"}, {"Neuvillette", "느비예트"}, {"Furina", "푸리나"}, {"Sigewinne", "시그윈"},
		{"Mualani", "말라니"}, {"Dahlia", "달리아"}, {"Lisa", "리사"}, {"Fischl", "피슬"},
		{"Beidou", "북두"}, {"Keqing", "각청"}, {"Kujou Sara", "쿠조 사라"},
		{"Raiden Shogun", "라이덴 쇼군"}, {"Yae Miko", "야에 미코"}, {"Kuki Shinobu", "쿠키 시노부"},
		{"Dori", "도리"}, {"Cyno", "사이노"}, {"Sethos", "세토스"}, {"Clorinde", "클로린드"},
		{"Ororon", "올로룬"}, {"Iansan", "얀사"}, {"Varesa", "바레사"},
		{"Qiqi", "치치"}, {"Chongyun", "중운"}, {"Diona", "디오나"}, {"Ganyu", "감우"},
		{"Rosaria", "로자리아"}, {"Shenhe", "신학"}, {"Kamisato Ayaka", "카미사토 아야카"}, {"Ayaka", "카미사토 아야카"}, {"Aloy", "에일로이"}, {"Eula", "유라"},
		{"Layla", "레일라"}, {"Mika", "미카"}, {"Freminet", "프레미네"}, {"Wriothesley", "라이오슬리"},
		{"Charlotte", "샤를롯"}, {"Citlali", "시틀라리"},
		{"Collei", "콜레이"}, {"Tighnari", "타이나리"}, {"Nahida", "나히다"}, {"Yaoyao", "요요"},
		{"Alhaitham", "알하이탐"}, {"Kaveh", "카베"}, {"Baizhu", "백출"}, {"Kirara", "키라라"},
		{"Emilie", "에밀리"}, {"Kinich", "키니치"}, {"Xilonen", "실로닌"},
		{"Sucrose", "설탕"}, {"Jean", "진"}, {"Venti", "벤티"}, {"Xiao", "소"},
		{"Kaedehara Kazuha", "카에데하라 카즈하"}, {"Sayu", "사유"}, {"Shikanoin Heizou", "시카노인 헤이조"}, {"Heizou", "시카노인 헤이조"},
		{"Faruzan", "파루잔"}, {"Wanderer", "방랑자"}, {"Lynette", "리넷"}, {"Xianyun", "한운"},
		{"Chasca", "차스카"}, {"Yumemizuki Mizuki", "유메미즈키 미즈키"},
		{"Kachina", "카치나"}, {"Noelle", "노엘"}, {"Zhongli", "종려"}, {"Albedo", "알베도"},
		{"Gorou", "고로"}, {"Arataki Itto", "아라타키 이토"}, {"Itto", "아라타키 이토"},
		{"Navia", "나비아"}, {"Chiori", "치오리"}, {"Ningguang", "응광"}, {"Razor", "레이저"},
		{"Kaeya", "케이아"}, {"Xinyan", "신염"}, {"Yun Jin", "운근"},
		{"Lan Yan", "남연"}, {"Skirk", "스커크"}, {"Nefer", "네페르"}, {"Zibai", "자백"},
		{"Lauma", "라우마"}, {"Aino", "아이노"}, {"Ineffa", "이네파"}, {"Escoffier", "에스코피에"},
		{"Ifa", "이파"}, {"Durin", "두린"}, {"Illuga", "일루가"}, {"Manekin", "마네킨"},
	}
	stmts := []string{}
	for _, n := range names {
		stmts = append(stmts, fmt.Sprintf(
			"INSERT OR IGNORE INTO character_names (name_en, name_ko) VALUES ('%s', '%s')",
			esc(n.en), esc(n.ko),
		))
	}
	rqliteExec(stmts)
}

// seedForUser copies the shared demo data (user_id=0) into rows owned by the given user.
func seedTheater() {
	log.Println("Seeding theater seasons...")
	rqliteExec([]string{
		`INSERT INTO theater_seasons (title,date,elements,cast_characters,guest_characters,bosses) VALUES
		 ('2026년 4월차 환상극','2026.04','물,얼음,바위',
		  '모나,행추,라이오슬리,로자리아,나비아,카치나',
		  '유메미즈키 미즈키,클레,라우마,설탕',
		  '용암철갑 제왕:90,달빛 바위 도마뱀붙이:92,황금불꽃의 깃룡 폭군:95,고대 바위 용 도마뱀:100')`,
		`INSERT INTO theater_seasons (title,date,elements,cast_characters,guest_characters,bosses) VALUES
		 ('2026년 3월차 환상극','2026.03','번개,얼음,바람',
		  '바레사,도리,유라,미카,시카노인 헤이조,사유',
		  '푸리나,콜롬비나,두린,베넷',
		  '공포의 취령 버섯:90,노련한 파도잡이:92,16배 큰 만드라고라:95,영구 장치 진영:100')`,
	})
}

func seedWeeklyBosses() {
	log.Println("Seeding weekly bosses...")
	bosses := []struct {
		name   string
		region string
	}{
		{"풍마룡 드발린", "몬드"},
		{"안드리우스", "몬드"},
		{"타르탈리아", "리월"},
		{"야타용왕", "리월"},
		{"시뇨라", "이나즈마"},
		{"마가츠 미타케 나루카미노 미코토", "이나즈마"},
		{"칠엽 적조의 비밀주", "수메르"},
		{"아펩의 오아시스 파수꾼", "수메르"},
		{"별을 삼킨 고래", "폰타인"},
		{"아를레키노", "폰타인"},
		{"침식된 근원의 불꽃 주인", "나타"},
		{"도토레", "노드크라이"},
	}
	for i, b := range bosses {
		rqliteExec([]string{fmt.Sprintf(
			"INSERT INTO weekly_bosses (name, region, sort_order) VALUES ('%s', '%s', %d)",
			esc(b.name), esc(b.region), i+1,
		)})
	}
}

func seedAbyss() {
	log.Println("Seeding abyss seasons...")
	floor12 := `{"chambers":[{"chamber":1,"first_half":{"enemies":["보스A","엘리트B"],"elements":["불","번개"]},"second_half":{"enemies":["보스C","엘리트D"],"elements":["물","얼음"]}},{"chamber":2,"first_half":{"enemies":["보스E"],"elements":["바람","불"]},"second_half":{"enemies":["보스F"],"elements":["바위","풀"]}},{"chamber":3,"first_half":{"enemies":["보스G"],"elements":["번개","물"]},"second_half":{"enemies":["보스H"],"elements":["얼음","불"]}}]}`
	rqliteExec([]string{fmt.Sprintf(
		"INSERT INTO abyss_seasons (period, blessing, floor12_data) VALUES ('%s', '%s', '%s')",
		esc("2026년 3월 하반기"),
		esc("심연의 축복: 전투 시작 후 원소 폭발을 발동하면 모든 파티원의 원소 마스터리가 60 증가"),
		esc(floor12),
	)})
}

func seedForUser(userID int) {
	// No seed data to copy
}

// --- Auth Middleware ---

const sessionCookie = "session_id"
const sessionTTL = 7 * 24 * time.Hour // 7 days

func auth(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		cookie, err := r.Cookie(sessionCookie)
		if err != nil || cookie.Value == "" {
			http.Error(w, `{"error":"unauthorized"}`, 401)
			return
		}
		result, err := rqliteQueryParam(
			"SELECT user_id, username, expires_at FROM sessions WHERE id = ?", cookie.Value,
		)
		if err != nil {
			http.Error(w, `{"error":"unauthorized"}`, 401)
			return
		}
		var qr queryResponse
		json.Unmarshal(result, &qr)
		if len(qr.Results) == 0 || len(qr.Results[0].Values) == 0 {
			http.Error(w, `{"error":"session not found"}`, 401)
			return
		}
		expiresAt, _ := qr.Results[0].Values[0][2].(string)
		t, _ := time.Parse("2006-01-02 15:04:05", expiresAt)
		if time.Now().UTC().After(t) {
			rqliteExecParam("DELETE FROM sessions WHERE id = ?", cookie.Value)
			http.Error(w, `{"error":"session expired"}`, 401)
			return
		}
		// Pass user identity to downstream handlers via headers
		userIDVal := qr.Results[0].Values[0][0]
		username, _ := qr.Results[0].Values[0][1].(string)
		r.Header.Set("X-User-ID", fmt.Sprintf("%v", userIDVal))
		r.Header.Set("X-Username", username)
		next(w, r)
	}
}

// getUserID extracts the authenticated user's ID from the request header set by auth().
func getUserID(r *http.Request) string {
	return r.Header.Get("X-User-ID")
}

func generateSessionID() string {
	b := make([]byte, 32)
	rand.Read(b)
	return hex.EncodeToString(b)
}

func setSessionCookie(w http.ResponseWriter, sid string) {
	setSessionCookieWithTTL(w, sid, sessionTTL)
}

func setSessionCookieWithTTL(w http.ResponseWriter, sid string, ttl time.Duration) {
	http.SetCookie(w, &http.Cookie{
		Name:     sessionCookie,
		Value:    sid,
		Path:     "/",
		HttpOnly: true,
		SameSite: http.SameSiteStrictMode,
		MaxAge:   int(ttl.Seconds()),
	})
}

func clearSessionCookie(w http.ResponseWriter) {
	http.SetCookie(w, &http.Cookie{
		Name:     sessionCookie,
		Value:    "",
		Path:     "/",
		HttpOnly: true,
		MaxAge:   -1,
	})
}

// --- Auth Handlers ---

func handleRegister(w http.ResponseWriter, r *http.Request) {
	var body struct {
		Username string `json:"username"`
		Password string `json:"password"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil || body.Username == "" || body.Password == "" {
		http.Error(w, `{"error":"username and password required"}`, 400)
		return
	}
	if len(body.Password) < 8 {
		http.Error(w, `{"error":"password must be at least 8 characters"}`, 400)
		return
	}

	// Check if username exists
	result, _ := rqliteQueryParam("SELECT id FROM users WHERE username = ?", body.Username)
	var qr queryResponse
	json.Unmarshal(result, &qr)
	if len(qr.Results) > 0 && len(qr.Results[0].Values) > 0 {
		http.Error(w, `{"error":"username already taken"}`, 409)
		return
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(body.Password), bcrypt.DefaultCost)
	if err != nil {
		http.Error(w, `{"error":"internal error"}`, 500)
		return
	}

	_, err = rqliteExec([]string{
		fmt.Sprintf("INSERT INTO users (username, password_hash) VALUES ('%s', '%s')", body.Username, string(hash)),
	})
	if err != nil {
		http.Error(w, `{"error":"failed to create user"}`, 500)
		return
	}

	// Retrieve the new user's ID so we can seed their data
	result2, _ := rqliteQueryParam("SELECT id FROM users WHERE username = ?", body.Username)
	var qr2 queryResponse
	json.Unmarshal(result2, &qr2)
	if len(qr2.Results) > 0 && len(qr2.Results[0].Values) > 0 {
		if uid, ok := qr2.Results[0].Values[0][0].(float64); ok {
			seedForUser(int(uid))
		}
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(201)
	json.NewEncoder(w).Encode(map[string]string{"status": "registered"})
}

func handleLogin(w http.ResponseWriter, r *http.Request) {
	var body struct {
		Username string `json:"username"`
		Password string `json:"password"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil || body.Username == "" || body.Password == "" {
		http.Error(w, `{"error":"username and password required"}`, 400)
		return
	}

	result, _ := rqliteQueryParam("SELECT id, password_hash FROM users WHERE username = ?", body.Username)
	var qr queryResponse
	json.Unmarshal(result, &qr)
	if len(qr.Results) == 0 || len(qr.Results[0].Values) == 0 {
		http.Error(w, `{"error":"invalid credentials"}`, 401)
		return
	}

	userID := qr.Results[0].Values[0][0]
	storedHash, _ := qr.Results[0].Values[0][1].(string)

	if err := bcrypt.CompareHashAndPassword([]byte(storedHash), []byte(body.Password)); err != nil {
		http.Error(w, `{"error":"invalid credentials"}`, 401)
		return
	}

	sid := generateSessionID()
	expires := time.Now().UTC().Add(sessionTTL).Format("2006-01-02 15:04:05")
	rqliteExec([]string{
		fmt.Sprintf("INSERT INTO sessions (id, user_id, username, expires_at) VALUES ('%s', %v, '%s', '%s')",
			sid, userID, body.Username, expires),
	})

	setSessionCookie(w, sid)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "ok", "username": body.Username})
}

func handleLogout(w http.ResponseWriter, r *http.Request) {
	cookie, err := r.Cookie(sessionCookie)
	if err == nil && cookie.Value != "" {
		rqliteExecParam("DELETE FROM sessions WHERE id = ?", cookie.Value)
	}
	clearSessionCookie(w)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "logged out"})
}

const guestSessionTTL = 365 * 24 * time.Hour // 1 year

func handleGuest(w http.ResponseWriter, r *http.Request) {
	// Generate random guest username — no password needed, session cookie is auth
	b := make([]byte, 8)
	rand.Read(b)
	username := "guest_" + hex.EncodeToString(b)

	_, err := rqliteExec([]string{fmt.Sprintf(
		"INSERT INTO users (username, password_hash) VALUES ('%s', '')",
		esc(username),
	)})
	if err != nil {
		http.Error(w, `{"error":"failed to create guest"}`, 500)
		return
	}

	// Get user ID
	result, _ := rqliteQueryParam("SELECT id FROM users WHERE username = ?", username)
	rows := parseRows(result)
	if len(rows) == 0 {
		http.Error(w, `{"error":"failed to create guest"}`, 500)
		return
	}
	userID := str(rows[0]["id"])

	// Create session with 1-year TTL
	sid := generateSessionID()
	expires := time.Now().UTC().Add(guestSessionTTL).Format("2006-01-02 15:04:05")
	rqliteExec([]string{
		fmt.Sprintf("INSERT INTO sessions (id, user_id, username, expires_at) VALUES ('%s', %s, '%s', '%s')",
			sid, userID, esc(username), expires),
	})

	setSessionCookieWithTTL(w, sid, guestSessionTTL)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "ok", "username": username, "guest": "true"})
}

func handleMe(w http.ResponseWriter, r *http.Request) {
	cookie, err := r.Cookie(sessionCookie)
	if err != nil || cookie.Value == "" {
		http.Error(w, `{"error":"not logged in"}`, 401)
		return
	}
	result, _ := rqliteQueryParam(
		"SELECT user_id, username, expires_at FROM sessions WHERE id = ?", cookie.Value,
	)
	var qr queryResponse
	json.Unmarshal(result, &qr)
	if len(qr.Results) == 0 || len(qr.Results[0].Values) == 0 {
		http.Error(w, `{"error":"session not found"}`, 401)
		return
	}
	expiresAt, _ := qr.Results[0].Values[0][2].(string)
	t, _ := time.Parse("2006-01-02 15:04:05", expiresAt)
	if time.Now().UTC().After(t) {
		rqliteExecParam("DELETE FROM sessions WHERE id = ?", cookie.Value)
		clearSessionCookie(w)
		http.Error(w, `{"error":"session expired"}`, 401)
		return
	}
	username, _ := qr.Results[0].Values[0][1].(string)
	userID := fmt.Sprintf("%v", qr.Results[0].Values[0][0])

	// Fetch lang and preferences from users table
	prefResult, _ := rqliteQueryParam("SELECT lang, prefer_gender, include_default_males, theater_difficulty FROM users WHERE id = ?", userID)
	lang := "ko"
	preferGender := "all"
	includeDefaultMales := 1
	theaterDifficulty := "transcendence"
	var prefQR queryResponse
	json.Unmarshal(prefResult, &prefQR)
	if len(prefQR.Results) > 0 && len(prefQR.Results[0].Values) > 0 {
		if l, ok := prefQR.Results[0].Values[0][0].(string); ok && l != "" {
			lang = l
		}
		if g, ok := prefQR.Results[0].Values[0][1].(string); ok && g != "" {
			preferGender = g
		}
		if dm, ok := prefQR.Results[0].Values[0][2].(float64); ok {
			includeDefaultMales = int(dm)
		}
		if td, ok := prefQR.Results[0].Values[0][3].(string); ok && td != "" {
			theaterDifficulty = td
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"username":              username,
		"lang":                  lang,
		"prefer_gender":         preferGender,
		"include_default_males": includeDefaultMales,
		"theater_difficulty":    theaterDifficulty,
	})
}

func handleUpdateLang(w http.ResponseWriter, r *http.Request) {
	userID := getUserID(r)

	var body struct {
		Lang string `json:"lang"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil || (body.Lang != "ko" && body.Lang != "en") {
		http.Error(w, `{"error":"lang must be 'ko' or 'en'"}`, 400)
		return
	}

	rqliteExecParam("UPDATE users SET lang = ? WHERE id = ?", body.Lang, userID)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "ok", "lang": body.Lang})
}

func handleUpdatePreferences(w http.ResponseWriter, r *http.Request) {
	userID := getUserID(r)

	var body struct {
		PreferGender       string `json:"prefer_gender"`
		IncludeDefaultMales *int  `json:"include_default_males"`
		TheaterDifficulty  string `json:"theater_difficulty"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		http.Error(w, `{"error":"invalid JSON"}`, 400)
		return
	}

	validGender := map[string]bool{"all": true, "male": true, "female": true}
	validDifficulty := map[string]bool{"normal": true, "hard": true, "transcendence": true}

	if body.PreferGender != "" && !validGender[body.PreferGender] {
		http.Error(w, `{"error":"prefer_gender must be 'all', 'male', or 'female'"}`, 400)
		return
	}
	if body.TheaterDifficulty != "" && !validDifficulty[body.TheaterDifficulty] {
		http.Error(w, `{"error":"theater_difficulty must be 'normal', 'hard', or 'transcendence'"}`, 400)
		return
	}

	if body.PreferGender != "" {
		rqliteExecParam("UPDATE users SET prefer_gender = ? WHERE id = ?", body.PreferGender, userID)
	}
	if body.IncludeDefaultMales != nil {
		val := "0"
		if *body.IncludeDefaultMales != 0 {
			val = "1"
		}
		rqliteExecParam("UPDATE users SET include_default_males = ? WHERE id = ?", val, userID)
	}
	if body.TheaterDifficulty != "" {
		rqliteExecParam("UPDATE users SET theater_difficulty = ? WHERE id = ?", body.TheaterDifficulty, userID)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
}

// --- Data Handlers ---

func handleListCharacters(w http.ResponseWriter, r *http.Request) {
	uid := getUserID(r)
	allowed := map[string]string{
		"element":     "element",
		"weapon_type": "weapon_type",
		"name":        "name",
	}
	where, params := buildFilterQuery(r, allowed, uid)
	result, err := rqliteQueryParam("SELECT * FROM characters"+where, params...)
	writeResult(w, result, err)
}

func handleGetCharacter(w http.ResponseWriter, r *http.Request) {
	uid := getUserID(r)
	id := r.PathValue("id")
	result, err := rqliteQueryParam("SELECT * FROM characters WHERE id = ? AND user_id = ?", id, uid)
	writeResult(w, result, err)
}

func handleCreateCharacter(w http.ResponseWriter, r *http.Request) {
	uid := getUserID(r)
	var c map[string]interface{}
	if err := json.NewDecoder(r.Body).Decode(&c); err != nil {
		http.Error(w, err.Error(), 400)
		return
	}
	cons := intVal(c["constellation"])
	stmt := fmt.Sprintf(
		`INSERT INTO characters (name,element,weapon_type,level,weapon_name,hp,atk,crit_rate,crit_dmg,energy_recharge,elemental_mastery,icon,constellation,user_id) VALUES ('%s','%s','%s',%v,'%s',%v,%v,%v,%v,%v,%v,'%s',%d,%s)`,
		c["name"], c["element"], c["weapon_type"], c["level"], c["weapon_name"],
		c["hp"], c["atk"], c["crit_rate"], c["crit_dmg"], c["energy_recharge"], c["elemental_mastery"], c["icon"], cons, uid,
	)
	_, err := rqliteExec([]string{stmt})
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}
	w.WriteHeader(201)
	json.NewEncoder(w).Encode(map[string]string{"status": "created"})
}

func handleListArtifacts(w http.ResponseWriter, r *http.Request) {
	uid := getUserID(r)
	allowed := map[string]string{
		"slot":           "slot",
		"set_name":       "set_name",
		"main_stat":      "main_stat_type",
		"main_stat_type": "main_stat_type",
		"equipped_by":    "equipped_by",
	}
	where, params := buildFilterQuery(r, allowed, uid)
	result, err := rqliteQueryParam("SELECT * FROM artifacts"+where, params...)
	writeResult(w, result, err)
}

func handleCreateArtifact(w http.ResponseWriter, r *http.Request) {
	uid := getUserID(r)
	var a map[string]interface{}
	if err := json.NewDecoder(r.Body).Decode(&a); err != nil {
		http.Error(w, err.Error(), 400)
		return
	}
	stmt := fmt.Sprintf(
		`INSERT INTO artifacts (name,set_name,slot,level,main_stat_type,main_stat_value,equipped_by,icon,user_id) VALUES ('%s','%s','%s',%v,'%s','%s','%s','%s',%s)`,
		a["name"], a["set_name"], a["slot"], a["level"], a["main_stat_type"], a["main_stat_value"], a["equipped_by"], a["icon"], uid,
	)
	_, err := rqliteExec([]string{stmt})
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}
	w.WriteHeader(201)
	json.NewEncoder(w).Encode(map[string]string{"status": "created"})
}

func handleDeleteArtifact(w http.ResponseWriter, r *http.Request) {
	uid := getUserID(r)
	id := r.PathValue("id")
	_, err := rqliteExecParam(
		"DELETE FROM artifacts WHERE id = ? AND user_id = ?", id, uid,
	)
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}
	w.WriteHeader(204)
}

// --- Smart Discard ---

func handleSmartDiscard(w http.ResponseWriter, r *http.Request) {
	uid := getUserID(r)
	result, err := rqliteQueryParam("SELECT * FROM artifacts WHERE user_id = ?", uid)
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}
	artifacts := parseRows(result)

	// Parse threshold from query param (default 35, range 10-80)
	threshold := 35.0
	if tStr := r.URL.Query().Get("threshold"); tStr != "" {
		if t, err := strconv.ParseFloat(tStr, 64); err == nil {
			if t >= 10 && t <= 100 {
				threshold = t
			}
		}
	}

	// Load character name map (EN → KO) for display
	nameResult, _ := rqliteQuery("SELECT name_en, name_ko FROM character_names")
	nameRows := parseRows(nameResult)
	charNameKo := map[string]string{}
	for _, row := range nameRows {
		charNameKo[str(row["name_en"])] = str(row["name_ko"])
	}

	type discardCandidate struct {
		Artifact      map[string]interface{} `json:"artifact"`
		Score         float64                `json:"score"`
		BestCharacter string                 `json:"best_character"`
		BestCharScore float64                `json:"best_character_score"`
		Reasons       []string               `json:"reasons"`
	}

	candidates := []discardCandidate{}

	for _, a := range artifacts {
		// Only 5-star + 4-star Instructor
		rarity := intVal(a["rarity"])
		if rarity == 0 { rarity = 5 }
		if rarity < 5 && str(a["set_name"]) != "Instructor" {
			continue
		}

		setName := str(a["set_name"])
		slot := str(a["slot"])
		mainStat := str(a["main_stat_type"])

		// Collect substat keys
		subKeys := []string{
			str(a["sub1_name"]),
			str(a["sub2_name"]),
			str(a["sub3_name"]),
			str(a["sub4_name"]),
		}

		bestScore := 0.0
		bestChar := ""

		// Score against every character
		for charName, weights := range characterStatWeights {
			score := 0.0

			// 1. Set bonus (0 or 30)
			charSets := characterBestSets[charName]
			setMatch := false
			for _, s := range charSets {
				if s == setName {
					setMatch = true
					break
				}
			}
			if setMatch {
				score += 30
			}

			// 2. Main stat (0-30, auto 30 for flower/plume)
			if slot == "flower" || slot == "plume" {
				score += 30
			} else {
				desiredSlots := characterDesiredMainStats[charName]
				if desiredSlots != nil {
					desired := desiredSlots[slot]
					mainMatch := false
					for _, d := range desired {
						if d == mainStat {
							mainMatch = true
							break
						}
					}
					if mainMatch {
						score += 30
					}
				}
			}

			// 3. Substats (0-40): weight * 10 per sub
			totalSubs := 0
			usefulSubs := 0
			for _, sk := range subKeys {
				if sk == "" {
					continue
				}
				totalSubs++
				if w, ok := weights[sk]; ok && w > 0 {
					score += w * 10
					usefulSubs++
				}
			}

			// 4. Wasted upgrade penalty: leveled artifacts with useless subs get penalized
			level := intVal(a["level"])
			upgrades := float64(level / 4)
			if upgrades > 0 && totalSubs > 0 {
				wasteRatio := float64(totalSubs-usefulSubs) / float64(totalSubs)
				score -= upgrades * wasteRatio * 2
			}

			percentScore := score // max is 100

			if percentScore > bestScore {
				bestScore = percentScore
				bestChar = charName
			}
		}

		// Build reasons
		if bestScore < threshold {
			reasons := []string{}

			// Check set match for best char
			charSets := characterBestSets[bestChar]
			setMatch := false
			for _, s := range charSets {
				if s == setName {
					setMatch = true
					break
				}
			}
			if !setMatch {
				reasons = append(reasons, "추천 세트 아님")
			}

			// Check main stat for best char
			if slot != "flower" && slot != "plume" {
				mainMatch := false
				if desiredSlots := characterDesiredMainStats[bestChar]; desiredSlots != nil {
					for _, d := range desiredSlots[slot] {
						if d == mainStat {
							mainMatch = true
							break
						}
					}
				}
				if !mainMatch {
					reasons = append(reasons, "메인 옵션 부적합")
				}
			}

			// Check crit substats — only relevant if best char actually needs crit
			bestWeights := characterStatWeights[bestChar]
			critNeeded := bestWeights["critRate_"] >= 0.5 || bestWeights["critDMG_"] >= 0.5
			if critNeeded {
				hasCrit := false
				for _, sk := range subKeys {
					if sk == "critRate_" || sk == "critDMG_" {
						hasCrit = true
						break
					}
				}
				if !hasCrit {
					reasons = append(reasons, "치명타 부옵 없음")
				}
			}

			bestCharDisplay := bestChar
			if ko := charNameKo[bestChar]; ko != "" {
				bestCharDisplay = ko
			}
			candidates = append(candidates, discardCandidate{
				Artifact:      a,
				Score:         math.Round(bestScore*10) / 10,
				BestCharacter: bestCharDisplay,
				BestCharScore: math.Round(bestScore*10) / 10,
				Reasons:       reasons,
			})
		}
	}

	// Sort by score ascending (worst first)
	sort.Slice(candidates, func(i, j int) bool {
		return candidates[i].Score < candidates[j].Score
	})

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"candidates": candidates,
		"total":      len(artifacts),
		"analyzed":   len(artifacts),
		"threshold":  threshold,
	})
}

func handleToggleDismiss(w http.ResponseWriter, r *http.Request) {
	uid := getUserID(r)
	id := r.PathValue("id")
	// Toggle: if dismissed=0 → set 1, if 1 → set 0
	_, err := rqliteExecParam(
		"UPDATE artifacts SET dismissed = CASE WHEN dismissed = 1 THEN 0 ELSE 1 END WHERE id = ? AND user_id = ?", id, uid,
	)
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "toggled"})
}

func handleArtifactCharScores(w http.ResponseWriter, r *http.Request) {
	uid := getUserID(r)
	id := r.PathValue("id")
	result, err := rqliteQueryParam("SELECT * FROM artifacts WHERE id = ? AND user_id = ?", id, uid)
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}
	rows := parseRows(result)
	if len(rows) == 0 {
		http.Error(w, `{"error":"not found"}`, 404)
		return
	}
	a := rows[0]
	slot := str(a["slot"])
	mainStat := str(a["main_stat_type"])
	subKeys := []string{str(a["sub1_name"]), str(a["sub2_name"]), str(a["sub3_name"]), str(a["sub4_name"])}

	// Load Korean names
	nameResult, _ := rqliteQuery("SELECT name_en, name_ko FROM character_names")
	nameRows := parseRows(nameResult)
	charNameKo := map[string]string{}
	for _, row := range nameRows {
		charNameKo[str(row["name_en"])] = str(row["name_ko"])
	}

	type charScore struct {
		Character string  `json:"character"`
		Score     float64 `json:"score"`
		SetBonus  float64 `json:"set_bonus"`
		MainStat  float64 `json:"main_stat"`
		Substats  float64 `json:"substats"`
		Penalty   float64 `json:"penalty"`
	}

	scores := []charScore{}
	setName := str(a["set_name"])
	level := intVal(a["level"])

	for charName, weights := range characterStatWeights {
		setBonus := 0.0
		for _, s := range characterBestSets[charName] {
			if s == setName {
				setBonus = 30
				break
			}
		}
		mainStatScore := 0.0
		if slot == "flower" || slot == "plume" {
			mainStatScore = 30
		} else if desiredSlots := characterDesiredMainStats[charName]; desiredSlots != nil {
			for _, d := range desiredSlots[slot] {
				if d == mainStat {
					mainStatScore = 30
					break
				}
			}
		}
		substatScore := 0.0
		totalSubs := 0
		usefulSubs := 0
		for _, sk := range subKeys {
			if sk != "" {
				totalSubs++
				if w, ok := weights[sk]; ok && w > 0 {
					substatScore += w * 10
					usefulSubs++
				}
			}
		}
		penalty := 0.0
		upgrades := float64(level / 4)
		if upgrades > 0 && totalSubs > 0 {
			wasteRatio := float64(totalSubs-usefulSubs) / float64(totalSubs)
			penalty = math.Round(upgrades*wasteRatio*2*10) / 10
		}
		total := setBonus + mainStatScore + substatScore - penalty
		displayName := charName
		if ko := charNameKo[charName]; ko != "" {
			displayName = ko
		}
		scores = append(scores, charScore{
			Character: displayName,
			Score:     math.Round(total*10) / 10,
			SetBonus:  setBonus,
			MainStat:  mainStatScore,
			Substats:  math.Round(substatScore*10) / 10,
			Penalty:   penalty,
		})
	}

	sort.Slice(scores, func(i, j int) bool {
		return scores[i].Score > scores[j].Score
	})

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(scores)
}

func countEquipped(artifacts []map[string]interface{}) int {
	n := 0
	for _, a := range artifacts {
		if str(a["equipped_by"]) != "" {
			n++
		}
	}
	return n
}

func handleBatchDeleteArtifacts(w http.ResponseWriter, r *http.Request) {
	uid := getUserID(r)
	var body struct {
		IDs []int `json:"ids"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		http.Error(w, `{"error":"invalid body"}`, 400)
		return
	}
	if len(body.IDs) == 0 {
		http.Error(w, `{"error":"no ids provided"}`, 400)
		return
	}
	if len(body.IDs) > 200 {
		http.Error(w, `{"error":"max 200 at once"}`, 400)
		return
	}

	stmts := []string{}
	for _, id := range body.IDs {
		stmts = append(stmts, fmt.Sprintf(
			"DELETE FROM artifacts WHERE id = %d AND user_id = %s", id, uid,
		))
	}
	_, err := rqliteExec(stmts)
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"deleted": len(body.IDs),
	})
}

func handleListWeapons(w http.ResponseWriter, r *http.Request) {
	uid := getUserID(r)
	allowed := map[string]string{
		"type":        "type",
		"rarity":      "rarity",
		"name":        "name",
		"equipped_by": "equipped_by",
	}
	where, params := buildFilterQuery(r, allowed, uid)
	result, err := rqliteQueryParam("SELECT * FROM weapons"+where, params...)
	writeResult(w, result, err)
}

func handleCreateWeapon(w http.ResponseWriter, r *http.Request) {
	uid := getUserID(r)
	var a map[string]interface{}
	if err := json.NewDecoder(r.Body).Decode(&a); err != nil {
		http.Error(w, err.Error(), 400)
		return
	}
	stmt := fmt.Sprintf(
		`INSERT INTO weapons (name,type,level,refinement,base_atk,sub_stat_type,sub_stat_value,rarity,equipped_by,icon,user_id) VALUES ('%s','%s',%v,%v,%v,'%s','%s',%v,'%s','%s',%s)`,
		a["name"], a["type"], a["level"], a["refinement"], a["base_atk"], a["sub_stat_type"], a["sub_stat_value"], a["rarity"], a["equipped_by"], a["icon"], uid,
	)
	_, err := rqliteExec([]string{stmt})
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}
	w.WriteHeader(201)
	json.NewEncoder(w).Encode(map[string]string{"status": "created"})
}

func handleListTeams(w http.ResponseWriter, r *http.Request) {
	uid := getUserID(r)
	result, err := rqliteQueryParam("SELECT * FROM teams WHERE user_id = ?", uid)
	writeResult(w, result, err)
}

func handleCreateTeam(w http.ResponseWriter, r *http.Request) {
	uid := getUserID(r)
	var t map[string]interface{}
	if err := json.NewDecoder(r.Body).Decode(&t); err != nil {
		http.Error(w, err.Error(), 400)
		return
	}
	stmt := fmt.Sprintf(
		`INSERT INTO teams (name,description,member1,member2,member3,member4,user_id) VALUES ('%s','%s','%s','%s','%s','%s',%s)`,
		t["name"], t["description"], t["member1"], t["member2"], t["member3"], t["member4"], uid,
	)
	_, err := rqliteExec([]string{stmt})
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}
	w.WriteHeader(201)
	json.NewEncoder(w).Encode(map[string]string{"status": "created"})
}

func handleListBuilds(w http.ResponseWriter, r *http.Request) {
	uid := getUserID(r)
	result, err := rqliteQueryParam("SELECT * FROM builds WHERE user_id = ?", uid)
	writeResult(w, result, err)
}

func handleCreateBuild(w http.ResponseWriter, r *http.Request) {
	uid := getUserID(r)
	var b map[string]interface{}
	if err := json.NewDecoder(r.Body).Decode(&b); err != nil {
		http.Error(w, err.Error(), 400)
		return
	}
	stmt := fmt.Sprintf(
		`INSERT INTO builds (character_name,build_name,description,est_dmg,icon,user_id) VALUES ('%s','%s','%s',%v,'%s',%s)`,
		b["character_name"], b["build_name"], b["description"], b["est_dmg"], b["icon"], uid,
	)
	_, err := rqliteExec([]string{stmt})
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}
	w.WriteHeader(201)
	json.NewEncoder(w).Encode(map[string]string{"status": "created"})
}

// --- Import/Export Handlers ---

// GOOD format structs (Genshin Open Object Description) - matches genshin-optimizer spec
type GOODData struct {
	Format     string          `json:"format"`
	Version    int             `json:"version"`
	Source     string          `json:"source"`
	Characters []GOODCharacter `json:"characters,omitempty"`
	Artifacts  []GOODArtifact  `json:"artifacts,omitempty"`
	Weapons    []GOODWeapon    `json:"weapons,omitempty"`
}

type GOODTalent struct {
	Auto  int `json:"auto"`
	Skill int `json:"skill"`
	Burst int `json:"burst"`
}

type GOODCharacter struct {
	Key           string     `json:"key"`
	Level         int        `json:"level"`
	Constellation int        `json:"constellation"`
	Ascension     int        `json:"ascension"`
	Talent        GOODTalent `json:"talent"`
}

type GOODArtifact struct {
	SetKey      string        `json:"setKey"`
	SlotKey     string        `json:"slotKey"`
	Level       int           `json:"level"`
	Rarity      int           `json:"rarity"`
	MainStatKey string        `json:"mainStatKey"`
	Location    string        `json:"location"`
	Lock        bool          `json:"lock"`
	Substats    []GOODSubstat `json:"substats"`
}

type GOODSubstat struct {
	Key   string  `json:"key"`
	Value float64 `json:"value"`
}

type GOODWeapon struct {
	Key        string `json:"key"`
	Level      int    `json:"level"`
	Ascension  int    `json:"ascension"`
	Refinement int    `json:"refinement"`
	Location   string `json:"location"`
	Lock       bool   `json:"lock"`
}

// toPascalKey converts a display name like "Raiden Shogun" to a PascalCase key like "RaidenShogun".
func toPascalKey(name string) string {
	return strings.ReplaceAll(name, " ", "")
}

func handleExport(w http.ResponseWriter, r *http.Request) {
	uid := getUserID(r)

	charsRaw, _ := rqliteQueryParam("SELECT * FROM characters WHERE user_id = ?", uid)
	artsRaw, _ := rqliteQueryParam("SELECT * FROM artifacts WHERE user_id = ?", uid)
	weapRaw, _ := rqliteQueryParam("SELECT * FROM weapons WHERE user_id = ?", uid)

	chars := parseRows(charsRaw)
	arts := parseRows(artsRaw)
	weaps := parseRows(weapRaw)

	goodChars := []GOODCharacter{}
	for _, c := range chars {
		goodChars = append(goodChars, GOODCharacter{
			Key:           toPascalKey(str(c["name"])),
			Level:         intVal(c["level"]),
			Constellation: intVal(c["constellation"]),
			Ascension:     levelToAscension(intVal(c["level"])),
			Talent:        GOODTalent{Auto: 1, Skill: 1, Burst: 1},
		})
	}

	goodArts := []GOODArtifact{}
	for _, a := range arts {
		subs := []GOODSubstat{}
		for i := 1; i <= 4; i++ {
			k := str(a[fmt.Sprintf("sub%d_name", i)])
			v := str(a[fmt.Sprintf("sub%d_value", i)])
			if k != "" {
				subs = append(subs, GOODSubstat{Key: k, Value: parseSubstatValue(v)})
			}
		}
		goodArts = append(goodArts, GOODArtifact{
			SetKey:      toPascalKey(str(a["set_name"])),
			SlotKey:     strings.ToLower(str(a["slot"])),
			Level:       intVal(a["level"]),
			Rarity:      5,
			MainStatKey: str(a["main_stat_type"]),
			Location:    toPascalKey(str(a["equipped_by"])),
			Lock:        false,
			Substats:    subs,
		})
	}

	goodWeaps := []GOODWeapon{}
	for _, wp := range weaps {
		goodWeaps = append(goodWeaps, GOODWeapon{
			Key:        toPascalKey(str(wp["name"])),
			Level:      intVal(wp["level"]),
			Ascension:  levelToAscension(intVal(wp["level"])),
			Refinement: intVal(wp["refinement"]),
			Location:   toPascalKey(str(wp["equipped_by"])),
			Lock:       false,
		})
	}

	data := GOODData{
		Format: "GOOD", Version: 1, Source: "LazyImpact",
		Characters: goodChars, Artifacts: goodArts, Weapons: goodWeaps,
	}

	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Content-Disposition", "attachment; filename=genshin-data-export.json")
	json.NewEncoder(w).Encode(data)
}

// levelToAscension estimates the ascension phase from character/weapon level.
func levelToAscension(level int) int {
	switch {
	case level > 80:
		return 6
	case level > 70:
		return 5
	case level > 60:
		return 4
	case level > 50:
		return 3
	case level > 40:
		return 2
	case level > 20:
		return 1
	default:
		return 0
	}
}

// parseSubstatValue converts a substat string like "10.5%" or "42" to a float64.
func parseSubstatValue(s string) float64 {
	s = strings.TrimSuffix(s, "%")
	s = strings.ReplaceAll(s, ",", "")
	f, _ := strconv.ParseFloat(strings.TrimSpace(s), 64)
	return f
}

func handleImport(w http.ResponseWriter, r *http.Request) {
	uid := getUserID(r)

	rawBody, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, `{"error":"failed to read body"}`, 400)
		return
	}

	// Peek at format field to decide which path to take
	var peek struct {
		Format string `json:"format"`
	}
	if err := json.Unmarshal(rawBody, &peek); err != nil {
		http.Error(w, `{"error":"invalid JSON"}`, 400)
		return
	}

	if peek.Format != "GOOD" {
		http.Error(w, `{"error":"unsupported format, use GOOD"}`, 400)
		return
	}
	handleImportGOOD(w, rawBody, uid)
}

// handleImportGOOD imports data in the real GOOD format from genshin-optimizer.
func handleImportGOOD(w http.ResponseWriter, rawBody []byte, uid string) {
	var data GOODData
	if err := json.Unmarshal(rawBody, &data); err != nil {
		http.Error(w, `{"error":"invalid GOOD JSON"}`, 400)
		return
	}

	imported := map[string]int{"characters": 0, "artifacts": 0, "weapons": 0}

	for _, c := range data.Characters {
		name := c.Key // PascalCase key is the name in GOOD format
		element := characterElements[c.Key]
		icon := fmt.Sprintf("assets/chars/%s.png", strings.ToLower(c.Key))
		rqliteExec([]string{fmt.Sprintf(
			`INSERT INTO characters (name,element,weapon_type,level,weapon_name,hp,atk,crit_rate,crit_dmg,energy_recharge,elemental_mastery,icon,constellation,user_id) VALUES ('%s','%s','', %d,'',0,0,0,0,0,0,'%s',%d,%s)`,
			esc(name), esc(element), c.Level, esc(icon), c.Constellation, uid,
		)})
		imported["characters"]++
	}

	for _, a := range data.Artifacts {
		name := a.SetKey + " " + a.SlotKey
		sub := func(i int) (string, string) {
			if i < len(a.Substats) {
				return a.Substats[i].Key, fmt.Sprintf("%g", a.Substats[i].Value)
			}
			return "", ""
		}
		s1k, s1v := sub(0)
		s2k, s2v := sub(1)
		s3k, s3v := sub(2)
		s4k, s4v := sub(3)
		lockVal := 0
		if a.Lock {
			lockVal = 1
		}
		rarity := a.Rarity
		if rarity == 0 {
			rarity = 5
		}
		rqliteExec([]string{fmt.Sprintf(
			`INSERT INTO artifacts (name,set_name,slot,level,rarity,lock,main_stat_type,main_stat_value,sub1_name,sub1_value,sub1_rolls,sub2_name,sub2_value,sub2_rolls,sub3_name,sub3_value,sub3_rolls,sub4_name,sub4_value,sub4_rolls,equipped_by,icon,user_id) VALUES ('%s','%s','%s',%d,%d,%d,'%s','','%s','%s',0,'%s','%s',0,'%s','%s',0,'%s','%s',0,'%s','',%s)`,
			esc(name), esc(a.SetKey), esc(a.SlotKey), a.Level, rarity, lockVal, esc(a.MainStatKey),
			esc(s1k), esc(s1v), esc(s2k), esc(s2v),
			esc(s3k), esc(s3v), esc(s4k), esc(s4v),
			esc(a.Location), uid,
		)})
		imported["artifacts"]++
	}

	for _, wp := range data.Weapons {
		name := wp.Key
		icon := fmt.Sprintf("assets/weapons/%s.png", strings.ToLower(wp.Key))
		rqliteExec([]string{fmt.Sprintf(
			`INSERT INTO weapons (name,type,level,refinement,base_atk,sub_stat_type,sub_stat_value,rarity,equipped_by,icon,user_id) VALUES ('%s','',%d,%d,0,'','',0,'%s','%s',%s)`,
			esc(name), wp.Level, wp.Refinement, esc(wp.Location), esc(icon), uid,
		)})
		imported["weapons"]++
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(imported)
}

// helpers for export/import
func parseRows(raw []byte) []map[string]interface{} {
	var qr queryResponse
	json.Unmarshal(raw, &qr)
	rows := []map[string]interface{}{}
	if len(qr.Results) > 0 && len(qr.Results[0].Values) > 0 {
		cols := qr.Results[0].Columns
		for _, vals := range qr.Results[0].Values {
			row := map[string]interface{}{}
			for i, col := range cols {
				if i < len(vals) { row[col] = vals[i] }
			}
			rows = append(rows, row)
		}
	}
	return rows
}

func str(v interface{}) string {
	if v == nil { return "" }
	if s, ok := v.(string); ok { return s }
	return fmt.Sprintf("%v", v)
}

func intVal(v interface{}) int {
	if v == nil { return 0 }
	if f, ok := v.(float64); ok { return int(f) }
	return 0
}

func floatVal(v interface{}) float64 {
	if v == nil { return 0 }
	if f, ok := v.(float64); ok { return f }
	return 0
}

func esc(s string) string {
	return strings.ReplaceAll(s, "'", "''")
}

// --- Character Gender & Tier Helpers ---

var maleCharacters = map[string]bool{
	"Xingqiu": true, "Bennett": true, "Kaeya": true, "Diluc": true,
	"Tartaglia": true, "Xiao": true, "Zhongli": true, "Albedo": true,
	"Venti": true, "Mika": true, "Wriothesley": true, "Gaming": true,
	"Aether": true, "Thoma": true, "Gorou": true, "Razor": true,
	"Chongyun": true, "Tighnari": true, "Alhaitham": true, "Kaveh": true,
	"Cyno": true, "Scaramouche": true, "Baizhu": true, "Neuvillette": true,
	"Lyney": true, "Freminet": true, "Sethos": true, "Kinich": true,
	"Capitano": true, "Itto": true, "Heizou": true, "Ayato": true,
}

var defaultMaleCharacters = map[string]bool{
	"Aether": true, "Kaeya": true,
}

// --- Known Healers ---

var knownHealers = map[string]bool{
	"Barbara": true, "Bennett": true, "Jean": true, "Qiqi": true,
	"Diona": true, "Kokomi": true, "Sayu": true, "Yaoyao": true,
	"Baizhu": true, "Xianyun": true, "Sigewinne": true, "Mika": true,
}

// Elemental Resonance bonuses (when team has 2 of same element)
// Score bonuses represent approximate DPS impact
var resonanceBonus = map[string]struct {
	name  string
	score float64
}{
	"Pyro":    {name: "열정의 불", score: 2500},     // ATK +25%
	"Hydro":   {name: "치유의 물", score: 1500},     // HP +25% (valuable for HP scalers)
	"Anemo":   {name: "신속의 바람", score: 1000},    // CD -5%, speed +10%
	"Geo":     {name: "부동의 바위", score: 2000},    // Shield +15%, DMG +15%, enemy Geo RES -20%
	"Electro": {name: "고에너지의 번개", score: 1200}, // Energy particles
	"Cryo":    {name: "분쇄의 얼음", score: 2000},    // CR +15% on frozen/cryo enemies
	"Dendro":  {name: "만생의 풀", score: 1500},      // EM +50~100
}

// Moonlight Omen (달빛 징조) - Khaenri'ah characters
var khaenriahCharacters = map[string]bool{
	"Lauma": true, "라우마": true,
	"Flins": true, "플린스": true,
	"Aino": true, "아이노": true,
	"Inepha": true, "이네파": true,
	"Escoffier": true, "에스코피에": true,
	"Skirk": true, "스커크": true,
}

// Moonlight bonuses
const moonlightCrescentScore = 1500.0 // 초승: 1 Khaenri'ah char — Bloom/Burgeon/Hyperbloom can crit
const moonlightFullScore = 3000.0     // 보름: 2 Khaenri'ah chars — Lunar Bloom crit rate/dmg up + EM +60

func calculateResonanceBonus(teamElements []string) (string, float64) {
	// Count elements
	elementCount := map[string]int{}
	for _, el := range teamElements {
		// Normalize Korean to English for lookup
		normalized := el
		if en, ok := elementKoToEn[el]; ok {
			normalized = en
		}
		elementCount[normalized]++
	}

	// Check for resonance (2 of same element)
	bestName := ""
	bestScore := 0.0
	for el, count := range elementCount {
		if count >= 2 {
			if res, ok := resonanceBonus[el]; ok {
				if res.score > bestScore {
					bestName = res.name
					bestScore = res.score
				}
			}
		}
	}

	// Check for 4-element diversity bonus
	if len(elementCount) >= 4 && bestScore == 0 {
		bestName = "뒤엉킨 수호"
		bestScore = 800 // All RES +15%, defensive
	}

	return bestName, bestScore
}

func calculateMoonlightBonus(teamNames []string) (string, float64) {
	count := 0
	for _, name := range teamNames {
		if khaenriahCharacters[name] {
			count++
		}
	}
	if count >= 2 {
		return "달빛 징조·보름", moonlightFullScore
	}
	if count >= 1 {
		return "달빛 징조·초승", moonlightCrescentScore
	}
	return "", 0
}

// --- Enemy Resistance Data ---

var enemyResistance = map[string]map[string]float64{
	"default":                        {"Physical": 10, "Pyro": 10, "Hydro": 10, "Electro": 10, "Cryo": 10, "Anemo": 10, "Geo": 10, "Dendro": 10},
	// 유적 기계 계열 — 물리 70%
	"Perpetual Mechanical Array":     {"Physical": 70, "Pyro": 10, "Hydro": 10, "Electro": 10, "Cryo": 10, "Anemo": 10, "Geo": 10, "Dendro": 10},
	"영구 장치 진영":                  {"Physical": 70, "Pyro": 10, "Hydro": 10, "Electro": 10, "Cryo": 10, "Anemo": 10, "Geo": 10, "Dendro": 10},
	"Ruin Guard":                     {"Physical": 70, "Pyro": 10, "Hydro": 10, "Electro": 10, "Cryo": 10, "Anemo": 10, "Geo": 10, "Dendro": 10},
	"Ruin Serpent":                   {"Physical": 70, "Pyro": 10, "Hydro": 10, "Electro": 10, "Cryo": 10, "Anemo": 10, "Geo": 10, "Dendro": 10},
	"유적의 뱀":                       {"Physical": 70, "Pyro": 10, "Hydro": 10, "Electro": 10, "Cryo": 10, "Anemo": 10, "Geo": 10, "Dendro": 10},
	"Aeonblight Drake":               {"Physical": 70, "Pyro": 10, "Hydro": 10, "Electro": 10, "Cryo": 10, "Anemo": 10, "Geo": 10, "Dendro": 10},
	"영겁의 드레이크":                 {"Physical": 70, "Pyro": 10, "Hydro": 10, "Electro": 10, "Cryo": 10, "Anemo": 10, "Geo": 10, "Dendro": 10},
	// 원소 면역
	"Thunder Manifestation":          {"Physical": 10, "Pyro": 10, "Hydro": 10, "Electro": 100, "Cryo": 10, "Anemo": 10, "Geo": 10, "Dendro": 10},
	"뇌음의 권현":                     {"Physical": 10, "Pyro": 10, "Hydro": 10, "Electro": 100, "Cryo": 10, "Anemo": 10, "Geo": 10, "Dendro": 10},
	// 페이즈 기반
	"All-Devouring Narwhal":          {"Physical": 10, "Pyro": 10, "Hydro": 70, "Electro": 10, "Cryo": 10, "Anemo": 10, "Geo": 10, "Dendro": 10},
	"별을 삼킨 고래":                  {"Physical": 10, "Pyro": 10, "Hydro": 70, "Electro": 10, "Cryo": 10, "Anemo": 10, "Geo": 10, "Dendro": 10},
	// 심해 용 도마뱀 — 물리 30%
	"Bathysmal Vishap":               {"Physical": 30, "Pyro": 10, "Hydro": 10, "Electro": 10, "Cryo": 10, "Anemo": 10, "Geo": 10, "Dendro": 10},
	"심해 용 도마뱀":                  {"Physical": 30, "Pyro": 10, "Hydro": 10, "Electro": 10, "Cryo": 10, "Anemo": 10, "Geo": 10, "Dendro": 10},
	// 바람 침식 모래 벌레 — 바람 90%
	"Setekh Wenut":                   {"Physical": 55, "Pyro": 55, "Hydro": 55, "Electro": 55, "Cryo": 55, "Anemo": 90, "Geo": 55, "Dendro": 55},
	"바람 침식 모래 벌레":              {"Physical": 55, "Pyro": 55, "Hydro": 55, "Electro": 55, "Cryo": 55, "Anemo": 90, "Geo": 55, "Dendro": 55},
	// 비밀근원 기계 — 10% (투명 시 면역)
	"ASIMON":                          {"Physical": 10, "Pyro": 10, "Hydro": 10, "Electro": 10, "Cryo": 10, "Anemo": 10, "Geo": 10, "Dendro": 10},
	"비밀근원 기계·구축기":             {"Physical": 10, "Pyro": 10, "Hydro": 10, "Electro": 10, "Cryo": 10, "Anemo": 10, "Geo": 10, "Dendro": 10},
	"반영구 제어 매트릭스":             {"Physical": 10, "Pyro": 10, "Hydro": 10, "Electro": 10, "Cryo": 10, "Anemo": 10, "Geo": 10, "Dendro": 10},
	"비밀근원 기계·통솔기":             {"Physical": 10, "Pyro": 10, "Hydro": 10, "Electro": 10, "Cryo": 10, "Anemo": 10, "Geo": 10, "Dendro": 10},
	// 꼭두각시 검귀 — 전 원소 10%
	"Maguu Kenki":                    {"Physical": 10, "Pyro": 10, "Hydro": 10, "Electro": 10, "Cryo": 10, "Anemo": 10, "Geo": 10, "Dendro": 10},
	"꼭두각시 검귀":                   {"Physical": 10, "Pyro": 10, "Hydro": 10, "Electro": 10, "Cryo": 10, "Anemo": 10, "Geo": 10, "Dendro": 10},
	// 돌연변이 마수 — 10% (탐식 형태 시 자원소 +60%, 기타 +30%)
	"Consecrated":                    {"Physical": 10, "Pyro": 10, "Hydro": 10, "Electro": 10, "Cryo": 10, "Anemo": 10, "Geo": 10, "Dendro": 10},
	"돌연변이 마수":                   {"Physical": 10, "Pyro": 10, "Hydro": 10, "Electro": 10, "Cryo": 10, "Anemo": 10, "Geo": 10, "Dendro": 10},
	// 얼음 바람 모음곡 — 10% (실드 메카닉)
	"Icewind Suite":                  {"Physical": 10, "Pyro": 10, "Hydro": 10, "Electro": 10, "Cryo": 10, "Anemo": 10, "Geo": 10, "Dendro": 10},
	"얼음 바람 모음곡":                {"Physical": 10, "Pyro": 10, "Hydro": 10, "Electro": 10, "Cryo": 10, "Anemo": 10, "Geo": 10, "Dendro": 10},
	// 심연 사도/영장 — 전 원소 10%
	"Abyss Herald":                   {"Physical": 10, "Pyro": 10, "Hydro": 10, "Electro": 10, "Cryo": 10, "Anemo": 10, "Geo": 10, "Dendro": 10},
	"Abyss Lector":                   {"Physical": 10, "Pyro": 10, "Hydro": 10, "Electro": 10, "Cryo": 10, "Anemo": 10, "Geo": 10, "Dendro": 10},
	// 식탐의 숲룡 산왕 — 전 원소 10%
	"Gluttonous Yumkasaur":           {"Physical": 10, "Pyro": 10, "Hydro": 10, "Electro": 10, "Cryo": 10, "Anemo": 10, "Geo": 10, "Dendro": 10},
	"식탐의 숲룡 산왕":                {"Physical": 10, "Pyro": 10, "Hydro": 10, "Electro": 10, "Cryo": 10, "Anemo": 10, "Geo": 10, "Dendro": 10},
	// 황금 늑대왕 — 얼음 30%
	"Radiant Glacial Wolf":           {"Physical": 10, "Pyro": 10, "Hydro": 10, "Electro": 10, "Cryo": 30, "Anemo": 10, "Geo": 10, "Dendro": 10},
	"황금 늑대왕":                     {"Physical": 10, "Pyro": 10, "Hydro": 10, "Electro": 10, "Cryo": 30, "Anemo": 10, "Geo": 10, "Dendro": 10},
	"Secret Source Automaton":        {"Physical": 10, "Pyro": 10, "Hydro": 10, "Electro": 10, "Cryo": 10, "Anemo": 10, "Geo": 10, "Dendro": 10},
}

// Resin cost model (all costs normalized to resin)
var resinCost = map[string]int{
	"char_70_80":       120,  // Character level 70→80
	"char_80_90":       170,  // Character level 80→90
	"char_1_70":        300,  // Character level 1→70
	"talent_1_6":       60,   // Talent 1→6
	"talent_6_8":       60,   // Talent 6→8
	"talent_8_9":       40,   // Talent 8→9 + weekly boss mat
	"artifact_set_5pc":  2000, // Farm a full 5pc artifact set +20
	"artifact_0_16":    80,   // Enhance one artifact 0→+16
	"artifact_0_20":    100,  // Enhance one artifact 0→+20
	"artifact_16_20":   30,   // Enhance one artifact +16→+20
	"weapon_4star_90":  200,  // Craft + level a 4-star weapon to 90
	"weapon_80_90":     80,   // Weapon level 80→90
	"weapon_1_80":      200,  // Weapon level 1→80
}

// Primogem costs
var primoCost = map[string]int{
	"char_5star":   12000, // Average 80 pulls
	"char_4star":   2400,  // Average 10 pulls
	"weapon_5star": 12000, // Weapon banner average
}

// Base constellation bonus per level (C0=0, C1=+500, C2=+1000, etc.)
// Some characters have key constellations worth more
var constellationKeyBreakpoints = map[string]map[int]float64{
	// C1 breakpoints (massive power spike)
	"Bennett":    {1: 2000},  // C1 removes HP condition on burst ATK buff
	"Xingqiu":    {6: 3000},  // C6 dramatically increases burst damage
	"Xiangling":  {4: 2000},  // C4 extends burst duration by 40%
	// C2 breakpoints
	"Raiden Shogun": {2: 4000}, // C2 ignores 60% DEF
	"Nahida":        {2: 2500}, // C2 enables crit on reactions
	"Yelan":         {2: 2000}, // C2 extra Hydro arrow
	"Furina":        {1: 2500}, // C1 max Fanfare stacks faster
	"Hu Tao":        {1: 2000}, // C1 removes stamina cost on charged attack
	"Neuvillette":   {1: 2000}, // C1 extra Hydro res shred
	// C6 breakpoints (whale territory)
	"Ganyu":      {6: 3000},
	"Xiao":       {6: 4000},
	"Ayaka":      {6: 3000},
}

func constellationScore(charName string, constellation int) float64 {
	if constellation <= 0 {
		return 0
	}
	// Base: 500 per constellation
	score := float64(constellation) * 500.0

	// Add key breakpoint bonuses
	if breakpoints, ok := constellationKeyBreakpoints[charName]; ok {
		for level, bonus := range breakpoints {
			if constellation >= level {
				score += bonus
			}
		}
	}
	return score
}

// --- Artifact Set & Weapon Recommendation Data ---

// artifactSetKoreanNames maps GOOD format key → Korean display name
var artifactSetKoreanNames = map[string]string{
	"GladiatorsFinale": "검투사의 피날레", "WanderersTroupe": "대지를 유랑하는 악단",
	"ThunderingFury": "번개 같은 분노", "Thundersoother": "뇌명을 평정한 존자",
	"ViridescentVenerer": "청록색 그림자", "MaidenBeloved": "사랑받는 소녀",
	"NoblesseOblige": "옛 왕실의 의식", "RetracingBolide": "날아오르는 유성",
	"CrimsonWitchOfFlames": "불타오르는 화염의 마녀", "Lavawalker": "불 위를 걷는 현인",
	"BloodstainedChivalry": "피에 물든 기사도", "ArchaicPetra": "유구한 반암",
	"BlizzardStrayer": "얼음바람 속에서 길잃은 용사", "HeartOfDepth": "몰락한 마음",
	"TenacityOfTheMillelith": "견고한 천암", "PaleFlame": "창백의 화염",
	"ShimenawasReminiscence": "추억의 시메나와", "EmblemOfSeveredFate": "절연의 기치",
	"OceanHuedClam": "바다에 물든 거대 조개", "HuskOfOpulentDreams": "풍요로운 꿈의 껍데기",
	"VermillionHereafter": "진사 왕생록", "EchoesOfAnOffering": "제사의 여운",
	"DeepwoodMemories": "숲의 기억", "GildedDreams": "도금된 꿈",
	"DesertPavilionChronicle": "모래 위 누각의 역사", "FlowerOfParadiseLost": "잃어버린 낙원의 꽃",
	"NymphsDream": "님프의 꿈", "VourukashasGlow": "감로빛 꽃바다",
	"MarechausseeHunter": "그림자 사냥꾼", "GoldenTroupe": "황금 극단",
	"SongOfDaysPast": "지난날의 노래", "NighttimeWhispersInTheEchoingWoods": "메아리숲의 야화",
	"FragmentOfHarmonicWhimsy": "조화로운 공상의 단편", "UnfinishedReverie": "미완의 몽상",
	"ScrollOfTheHeroOfCinderCity": "잿더미성 용사의 두루마리", "ObsidianCodex": "흑요석 비전",
	"LongNightsOath": "긴 밤의 맹세", "FinaleOfTheDeepGalleries": "깊은 회랑의 피날레",
	"SilkenMoonsSerenade": "달을 엮는 밤노래",
	"AubadeOfMorningstarAndMoon": "샛별과 달의 여명",
	"NightOfTheSkysUnveiling": "하늘 경계가 드러난 밤",
	"ADayCarvedFromRisingWinds": "바람이 시작되는 날",
	// 4성 세트
	"Instructor": "교관", "TheExile": "유배자", "Berserker": "전투광",
	"ResolutionOfSojourner": "행자의 마음", "BraveHeart": "용사의 마음",
	"DefendersWill": "수호자의 마음", "TinyMiracle": "기적",
	"MartialArtist": "무인", "Gambler": "노름꾼", "Scholar": "학사",
}

// Maps character name → recommended artifact sets (GOOD format PascalCase keys)
// characterElements maps GOOD PascalCase key → element (Korean)
var characterElements = map[string]string{
	// 불
	"Amber": "불", "Xiangling": "불", "Bennett": "불", "Diluc": "불", "Klee": "불",
	"Yanfei": "불", "HuTao": "불", "Yoimiya": "불", "Thoma": "불", "Dehya": "불",
	"Lyney": "불", "Chevreuse": "불", "Gaming": "불", "Arlecchino": "불", "Mavuika": "불",
	"Xinyan": "불",
	// 물
	"Barbara": "물", "Xingqiu": "물", "Mona": "물", "Tartaglia": "물", "Kokomi": "물",
	"Ayato": "물", "Yelan": "물", "Candace": "물", "Nilou": "물", "Neuvillette": "물",
	"Furina": "물", "Sigewinne": "물", "Mualani": "물",
	// 번개
	"Lisa": "번개", "Fischl": "번개", "Beidou": "번개", "Keqing": "번개",
	"KujouSara": "번개", "RaidenShogun": "번개", "YaeMiko": "번개",
	"KukiShinobu": "번개", "Dori": "번개", "Cyno": "번개", "Sethos": "번개",
	"Clorinde": "번개", "Ororon": "번개", "Iansan": "번개", "Varesa": "번개", "Razor": "번개",
	// 얼음
	"Qiqi": "얼음", "Chongyun": "얼음", "Diona": "얼음", "Ganyu": "얼음", "Rosaria": "얼음",
	"Shenhe": "얼음", "KamisatoAyaka": "얼음", "Aloy": "얼음", "Layla": "얼음",
	"Mika": "얼음", "Freminet": "얼음", "Wriothesley": "얼음", "Charlotte": "얼음",
	"Citlali": "얼음", "Kaeya": "얼음", "Eula": "얼음", "Skirk": "얼음",
	// 바람
	"Sucrose": "바람", "Jean": "바람", "Venti": "바람", "Xiao": "바람",
	"KaedeharaKazuha": "바람", "Sayu": "바람", "ShikanoinHeizou": "바람",
	"Faruzan": "바람", "Wanderer": "바람", "Lynette": "바람", "LanYan": "바람",
	"Chasca": "바람", "Xianyun": "바람", "YumemizukiMizuki": "바람", "Durin": "바람",
	// 바위
	"Noelle": "바위", "Zhongli": "바위", "Albedo": "바위", "Gorou": "바위",
	"AratakiItto": "바위", "Navia": "바위", "Chiori": "바위", "Ningguang": "바위",
	"YunJin": "바위", "Kachina": "바위", "Xilonen": "바위", "Illuga": "바위", "Zibai": "바위",
	// 풀
	"Collei": "풀", "Tighnari": "풀", "Nahida": "풀", "Yaoyao": "풀",
	"Alhaitham": "풀", "Kaveh": "풀", "Baizhu": "풀", "Kirara": "풀",
	"Emilie": "풀", "Kinich": "풀",
	// 6.0+ (달/Moonsign 등 신규 캐릭터)
	"Nefer": "풀", "Lauma": "물", "Aino": "얼음", "Ineffa": "바람",
	"Escoffier": "얼음", "Ifa": "풀", "Manekin": "바람", "Manekina": "바람",
	"Columbina": "물", "Dahlia": "물",
}

var characterBestSets = map[string][]string{
	// Pyro
	"Amber": {"CrimsonWitchOfFlames", "WanderersTroupe"}, "Xiangling": {"EmblemOfSeveredFate"},
	"Bennett": {"NoblesseOblige"}, "Diluc": {"CrimsonWitchOfFlames"},
	"Klee": {"CrimsonWitchOfFlames"}, "Yanfei": {"CrimsonWitchOfFlames", "WanderersTroupe"},
	"Hu Tao": {"CrimsonWitchOfFlames", "ShimenawasReminiscence"},
	"Yoimiya": {"ShimenawasReminiscence", "CrimsonWitchOfFlames"},
	"Thoma": {"EmblemOfSeveredFate", "NoblesseOblige"}, "Dehya": {"VourukashasGlow"},
	"Lyney": {"MarechausseeHunter"}, "Chevreuse": {"NoblesseOblige"},
	"Gaming": {"CrimsonWitchOfFlames", "MarechausseeHunter"},
	"Arlecchino": {"FragmentOfHarmonicWhimsy"}, "Mavuika": {"ObsidianCodex", "FinaleOfTheDeepGalleries"},
	"Columbina": {"AubadeOfMorningstarAndMoon", "EmblemOfSeveredFate"},
	// Hydro
	"Barbara": {"OceanHuedClam", "MaidenBeloved"}, "Xingqiu": {"EmblemOfSeveredFate"},
	"Mona": {"EmblemOfSeveredFate", "NoblesseOblige"}, "Tartaglia": {"HeartOfDepth"},
	"Kokomi": {"OceanHuedClam", "TenacityOfTheMillelith"},
	"Ayato": {"HeartOfDepth", "GladiatorsFinale", "EchoesOfAnOffering"}, "Yelan": {"EmblemOfSeveredFate"},
	"Candace": {"EmblemOfSeveredFate", "NoblesseOblige"},
	"Nilou": {"TenacityOfTheMillelith", "FlowerOfParadiseLost"},
	"Neuvillette": {"MarechausseeHunter", "NymphsDream"}, "Furina": {"GoldenTroupe"},
	"Sigewinne": {"OceanHuedClam", "SongOfDaysPast"}, "Mualani": {"ObsidianCodex"},
	"Dahlia": {"NoblesseOblige", "TenacityOfTheMillelith"},
	// Electro
	"Lisa": {"EmblemOfSeveredFate", "ThunderingFury"}, "Fischl": {"GoldenTroupe", "ThunderingFury"},
	"Beidou": {"EmblemOfSeveredFate"}, "Keqing": {"ThunderingFury", "GildedDreams"},
	"Kujou Sara": {"EmblemOfSeveredFate", "NoblesseOblige"},
	"Raiden Shogun": {"EmblemOfSeveredFate"}, "Yae Miko": {"GoldenTroupe", "GildedDreams"},
	"Kuki Shinobu": {"FlowerOfParadiseLost", "GildedDreams", "Instructor"},
	"Dori": {"NoblesseOblige"}, "Cyno": {"GildedDreams", "ThunderingFury"},
	"Sethos": {"WanderersTroupe", "ThunderingFury"}, "Clorinde": {"FragmentOfHarmonicWhimsy"},
	"Ororon": {"NoblesseOblige", "GoldenTroupe"},
	"Iansan": {"ScrollOfTheHeroOfCinderCity", "NoblesseOblige"},
	"Varesa": {"LongNightsOath", "ObsidianCodex"},
	// Cryo
	"Qiqi": {"OceanHuedClam"}, "Chongyun": {"NoblesseOblige", "BlizzardStrayer"},
	"Diona": {"NoblesseOblige", "TenacityOfTheMillelith", "Instructor"},
	"Ganyu": {"BlizzardStrayer", "WanderersTroupe"}, "Rosaria": {"EmblemOfSeveredFate", "BlizzardStrayer"},
	"Shenhe": {"NoblesseOblige", "GladiatorsFinale"}, "Ayaka": {"BlizzardStrayer"},
	"Aloy": {"BlizzardStrayer"}, "Layla": {"TenacityOfTheMillelith"},
	"Mika": {"NoblesseOblige", "OceanHuedClam"}, "Freminet": {"PaleFlame", "BlizzardStrayer"},
	"Wriothesley": {"MarechausseeHunter"}, "Charlotte": {"OceanHuedClam", "NoblesseOblige"},
	"Citlali": {"ScrollOfTheHeroOfCinderCity", "TenacityOfTheMillelith", "Instructor"},
	// Dendro
	"Collei": {"DeepwoodMemories", "NoblesseOblige", "Instructor"}, "Tighnari": {"DeepwoodMemories", "GildedDreams"},
	"Nahida": {"DeepwoodMemories", "GildedDreams"}, "Yaoyao": {"DeepwoodMemories", "TenacityOfTheMillelith", "Instructor"},
	"Alhaitham": {"GildedDreams"}, "Kaveh": {"DeepwoodMemories", "FlowerOfParadiseLost"},
	"Baizhu": {"DeepwoodMemories", "OceanHuedClam"}, "Kirara": {"TenacityOfTheMillelith"},
	"Emilie": {"UnfinishedReverie", "GildedDreams"}, "Kinich": {"ObsidianCodex", "UnfinishedReverie"},
	"Xilonen": {"ScrollOfTheHeroOfCinderCity", "TenacityOfTheMillelith"},
	// Anemo
	"Sucrose": {"ViridescentVenerer", "Instructor"}, "Jean": {"ViridescentVenerer"},
	"Venti": {"ViridescentVenerer"}, "Xiao": {"VermillionHereafter", "DesertPavilionChronicle"},
	"Kaedehara Kazuha": {"ViridescentVenerer"}, "Sayu": {"ViridescentVenerer", "Instructor"},
	"Heizou": {"ViridescentVenerer"}, "Faruzan": {"ViridescentVenerer", "NoblesseOblige"},
	"Wanderer": {"DesertPavilionChronicle"}, "Lynette": {"ViridescentVenerer"},
	"Lan Yan": {"ViridescentVenerer"}, "Chasca": {"ObsidianCodex", "MarechausseeHunter"},
	"Yumemizuki Mizuki": {"ViridescentVenerer"},
	// Geo / Physical
	"Kachina": {"ScrollOfTheHeroOfCinderCity", "HuskOfOpulentDreams"},
	"Noelle": {"HuskOfOpulentDreams"}, "Zhongli": {"TenacityOfTheMillelith", "ArchaicPetra"},
	"Albedo": {"HuskOfOpulentDreams"}, "Gorou": {"HuskOfOpulentDreams", "NoblesseOblige"},
	"Arataki Itto": {"HuskOfOpulentDreams"}, "Xianyun": {"ViridescentVenerer", "SongOfDaysPast"},
	"Navia": {"NighttimeWhispersInTheEchoingWoods"}, "Chiori": {"GoldenTroupe", "HuskOfOpulentDreams"},
	"Ningguang": {"ArchaicPetra", "NoblesseOblige"},
	"Razor": {"PaleFlame", "GladiatorsFinale"}, "Kaeya": {"BlizzardStrayer", "EmblemOfSeveredFate"},
	"Xinyan": {"PaleFlame", "BloodstainedChivalry"}, "Yun Jin": {"HuskOfOpulentDreams", "NoblesseOblige"},
	// New 5.5+ sets & characters
	"Skirk": {"FinaleOfTheDeepGalleries"}, "Eula": {"PaleFlame", "FinaleOfTheDeepGalleries"},
	"Nefer": {"NightOfTheSkysUnveiling"}, "Zibai": {"NightOfTheSkysUnveiling"},
	"Lauma": {"SilkenMoonsSerenade", "NightOfTheSkysUnveiling", "Instructor"},
	"Aino": {"SilkenMoonsSerenade", "NoblesseOblige"},
	"Ineffa": {"SilkenMoonsSerenade", "Instructor"},
	"Escoffier": {"SilkenMoonsSerenade", "NoblesseOblige"},
	"Ifa": {"NightOfTheSkysUnveiling", "SilkenMoonsSerenade"},
	"Durin": {"ADayCarvedFromRisingWinds"},
	"Illuga": {"ObsidianCodex", "ScrollOfTheHeroOfCinderCity"},
	"Manekin": {"ADayCarvedFromRisingWinds", "NoblesseOblige"},
}

// characterStatWeights maps character name → substat key → weight (0.0-1.0)
// Used by smart discard to score artifacts per-character (Fribbels-style relative scoring)
var characterStatWeights = map[string]map[string]float64{
	// --- DPS (crit 1.0, atk 0.75, er 0.25) ---
	"Diluc":       {"critRate_": 1.0, "critDMG_": 1.0, "atk_": 0.75, "hp_": 0, "def_": 0, "enerRech_": 0.25, "eleMas": 0.25},
	"Klee":        {"critRate_": 1.0, "critDMG_": 1.0, "atk_": 0.75, "hp_": 0, "def_": 0, "enerRech_": 0.25, "eleMas": 0.25},
	"Yanfei":      {"critRate_": 1.0, "critDMG_": 1.0, "atk_": 0.75, "hp_": 0, "def_": 0, "enerRech_": 0.25, "eleMas": 0.25},
	"Yoimiya":     {"critRate_": 1.0, "critDMG_": 1.0, "atk_": 0.75, "hp_": 0, "def_": 0, "enerRech_": 0.25, "eleMas": 0.25},
	"Lyney":       {"critRate_": 1.0, "critDMG_": 1.0, "atk_": 0.75, "hp_": 0, "def_": 0, "enerRech_": 0.25, "eleMas": 0},
	"Gaming":      {"critRate_": 1.0, "critDMG_": 1.0, "atk_": 0.75, "hp_": 0, "def_": 0, "enerRech_": 0.25, "eleMas": 0.25},
	"Arlecchino":  {"critRate_": 1.0, "critDMG_": 1.0, "atk_": 0.75, "hp_": 0, "def_": 0, "enerRech_": 0.25, "eleMas": 0},
	"Mavuika":     {"critRate_": 1.0, "critDMG_": 1.0, "atk_": 0.75, "hp_": 0, "def_": 0, "enerRech_": 0.25, "eleMas": 0},
	"Tartaglia":   {"critRate_": 1.0, "critDMG_": 1.0, "atk_": 0.75, "hp_": 0, "def_": 0, "enerRech_": 0.25, "eleMas": 0.25},
	"Ayato":       {"critRate_": 1.0, "critDMG_": 1.0, "atk_": 0.75, "hp_": 0, "def_": 0, "enerRech_": 0.25, "eleMas": 0},
	"Keqing":      {"critRate_": 1.0, "critDMG_": 1.0, "atk_": 0.75, "hp_": 0, "def_": 0, "enerRech_": 0.25, "eleMas": 0.25},
	"Ganyu":       {"critRate_": 1.0, "critDMG_": 1.0, "atk_": 0.75, "hp_": 0, "def_": 0, "enerRech_": 0.25, "eleMas": 0.25},
	"Ayaka":       {"critRate_": 1.0, "critDMG_": 1.0, "atk_": 0.75, "hp_": 0, "def_": 0, "enerRech_": 0.25, "eleMas": 0},
	"Wriothesley": {"critRate_": 1.0, "critDMG_": 1.0, "atk_": 0.75, "hp_": 0, "def_": 0, "enerRech_": 0.25, "eleMas": 0},
	"Wanderer":    {"critRate_": 1.0, "critDMG_": 1.0, "atk_": 0.75, "hp_": 0, "def_": 0, "enerRech_": 0.25, "eleMas": 0},
	"Xiao":        {"critRate_": 1.0, "critDMG_": 1.0, "atk_": 0.75, "hp_": 0, "def_": 0, "enerRech_": 0.5, "eleMas": 0},
	"Heizou":      {"critRate_": 1.0, "critDMG_": 1.0, "atk_": 0.75, "hp_": 0, "def_": 0, "enerRech_": 0.25, "eleMas": 0.5},
	"Navia":       {"critRate_": 1.0, "critDMG_": 1.0, "atk_": 0.75, "hp_": 0, "def_": 0, "enerRech_": 0.25, "eleMas": 0},
	"Ningguang":   {"critRate_": 1.0, "critDMG_": 1.0, "atk_": 0.75, "hp_": 0, "def_": 0, "enerRech_": 0.25, "eleMas": 0},
	"Razor":       {"critRate_": 1.0, "critDMG_": 1.0, "atk_": 0.75, "hp_": 0, "def_": 0, "enerRech_": 0.25, "eleMas": 0},
	"Xinyan":      {"critRate_": 1.0, "critDMG_": 1.0, "atk_": 0.75, "hp_": 0, "def_": 0, "enerRech_": 0.25, "eleMas": 0},
	"Freminet":    {"critRate_": 1.0, "critDMG_": 1.0, "atk_": 0.75, "hp_": 0, "def_": 0, "enerRech_": 0.25, "eleMas": 0},
	"Amber":       {"critRate_": 1.0, "critDMG_": 1.0, "atk_": 0.75, "hp_": 0, "def_": 0, "enerRech_": 0.25, "eleMas": 0.25},
	"Aloy":        {"critRate_": 1.0, "critDMG_": 1.0, "atk_": 0.75, "hp_": 0, "def_": 0, "enerRech_": 0.25, "eleMas": 0},
	"Chasca":      {"critRate_": 1.0, "critDMG_": 1.0, "atk_": 0.75, "hp_": 0, "def_": 0, "enerRech_": 0.25, "eleMas": 0.5},
	"Varesa":      {"critRate_": 1.0, "critDMG_": 1.0, "atk_": 0.75, "hp_": 0, "def_": 0, "enerRech_": 0.25, "eleMas": 0.25},
	"Tighnari":    {"critRate_": 1.0, "critDMG_": 1.0, "atk_": 0.5, "hp_": 0, "def_": 0, "enerRech_": 0.25, "eleMas": 0.75},
	"Kaeya":       {"critRate_": 1.0, "critDMG_": 1.0, "atk_": 0.75, "hp_": 0, "def_": 0, "enerRech_": 0.5, "eleMas": 0},
	// --- HP scalers ---
	"Hu Tao":      {"critRate_": 1.0, "critDMG_": 1.0, "atk_": 0, "hp_": 1.0, "def_": 0, "enerRech_": 0, "eleMas": 0.75},
	"Zhongli":     {"critRate_": 0.5, "critDMG_": 0.5, "atk_": 0, "hp_": 1.0, "def_": 0, "enerRech_": 0.25, "eleMas": 0},
	"Yelan":       {"critRate_": 1.0, "critDMG_": 1.0, "atk_": 0, "hp_": 1.0, "def_": 0, "enerRech_": 0.5, "eleMas": 0},
	"Kokomi":      {"critRate_": 0, "critDMG_": 0, "atk_": 0, "hp_": 1.0, "def_": 0, "enerRech_": 0.75, "eleMas": 0},
	"Neuvillette": {"critRate_": 1.0, "critDMG_": 1.0, "atk_": 0, "hp_": 1.0, "def_": 0, "enerRech_": 0.25, "eleMas": 0},
	"Furina":      {"critRate_": 1.0, "critDMG_": 1.0, "atk_": 0, "hp_": 1.0, "def_": 0, "enerRech_": 0.5, "eleMas": 0},
	"Nilou":       {"critRate_": 0.5, "critDMG_": 0.5, "atk_": 0, "hp_": 1.0, "def_": 0, "enerRech_": 0.25, "eleMas": 0.75},
	"Sigewinne":   {"critRate_": 0.25, "critDMG_": 0.25, "atk_": 0, "hp_": 1.0, "def_": 0, "enerRech_": 0.5, "eleMas": 0},
	"Mualani":     {"critRate_": 1.0, "critDMG_": 1.0, "atk_": 0, "hp_": 1.0, "def_": 0, "enerRech_": 0.25, "eleMas": 0},
	"Candace":     {"critRate_": 0.5, "critDMG_": 0.5, "atk_": 0, "hp_": 1.0, "def_": 0, "enerRech_": 0.5, "eleMas": 0},
	"Layla":       {"critRate_": 0.25, "critDMG_": 0.25, "atk_": 0, "hp_": 1.0, "def_": 0, "enerRech_": 0.5, "eleMas": 0},
	"Dahlia":      {"critRate_": 0.25, "critDMG_": 0.25, "atk_": 0, "hp_": 1.0, "def_": 0, "enerRech_": 0.75, "eleMas": 0},
	"Columbina":   {"critRate_": 1.0, "critDMG_": 1.0, "atk_": 0, "hp_": 1.0, "def_": 0, "enerRech_": 0.5, "eleMas": 0},
	// --- DEF scalers ---
	"Albedo":       {"critRate_": 1.0, "critDMG_": 1.0, "atk_": 0, "hp_": 0, "def_": 1.0, "enerRech_": 0.25, "eleMas": 0},
	"Noelle":       {"critRate_": 1.0, "critDMG_": 1.0, "atk_": 0, "hp_": 0, "def_": 1.0, "enerRech_": 0.25, "eleMas": 0},
	"Arataki Itto": {"critRate_": 1.0, "critDMG_": 1.0, "atk_": 0, "hp_": 0, "def_": 1.0, "enerRech_": 0.25, "eleMas": 0},
	"Gorou":        {"critRate_": 0.25, "critDMG_": 0.25, "atk_": 0, "hp_": 0, "def_": 1.0, "enerRech_": 0.75, "eleMas": 0},
	"Yun Jin":      {"critRate_": 0.25, "critDMG_": 0.25, "atk_": 0, "hp_": 0, "def_": 1.0, "enerRech_": 0.75, "eleMas": 0},
	"Chiori":       {"critRate_": 1.0, "critDMG_": 1.0, "atk_": 0, "hp_": 0, "def_": 1.0, "enerRech_": 0.25, "eleMas": 0},
	"Kachina":      {"critRate_": 0.5, "critDMG_": 0.5, "atk_": 0, "hp_": 0, "def_": 1.0, "enerRech_": 0.5, "eleMas": 0},
	// --- EM scalers ---
	"Kaedehara Kazuha": {"critRate_": 0.5, "critDMG_": 0.5, "atk_": 0.25, "hp_": 0, "def_": 0, "enerRech_": 0.5, "eleMas": 1.0},
	"Nahida":            {"critRate_": 1.0, "critDMG_": 1.0, "atk_": 0.25, "hp_": 0, "def_": 0, "enerRech_": 0.25, "eleMas": 1.0},
	"Sucrose":           {"critRate_": 0.25, "critDMG_": 0.25, "atk_": 0.25, "hp_": 0, "def_": 0, "enerRech_": 0.5, "eleMas": 1.0},
	"Alhaitham":         {"critRate_": 1.0, "critDMG_": 1.0, "atk_": 0.25, "hp_": 0, "def_": 0, "enerRech_": 0.25, "eleMas": 1.0},
	"Cyno":              {"critRate_": 1.0, "critDMG_": 1.0, "atk_": 0.25, "hp_": 0, "def_": 0, "enerRech_": 0.25, "eleMas": 1.0},
	"Kuki Shinobu":      {"critRate_": 0.5, "critDMG_": 0.5, "atk_": 0, "hp_": 0.5, "def_": 0, "enerRech_": 0.25, "eleMas": 1.0},
	"Kaveh":             {"critRate_": 0.5, "critDMG_": 0.5, "atk_": 0.25, "hp_": 0, "def_": 0, "enerRech_": 0.5, "eleMas": 1.0},
	"Sethos":            {"critRate_": 1.0, "critDMG_": 1.0, "atk_": 0.25, "hp_": 0, "def_": 0, "enerRech_": 0.25, "eleMas": 1.0},
	"Citlali":           {"critRate_": 0.25, "critDMG_": 0.25, "atk_": 0, "hp_": 0, "def_": 0, "enerRech_": 0.5, "eleMas": 1.0},
	"Yumemizuki Mizuki": {"critRate_": 0.25, "critDMG_": 0.25, "atk_": 0, "hp_": 0.5, "def_": 0, "enerRech_": 0.5, "eleMas": 1.0},
	"Kinich":            {"critRate_": 1.0, "critDMG_": 1.0, "atk_": 0.5, "hp_": 0, "def_": 0, "enerRech_": 0.25, "eleMas": 0.75},
	"Emilie":            {"critRate_": 1.0, "critDMG_": 1.0, "atk_": 0.75, "hp_": 0, "def_": 0, "enerRech_": 0.25, "eleMas": 0.5},
	// --- Support / Healers (ER primary) ---
	"Bennett":    {"critRate_": 0.25, "critDMG_": 0.25, "atk_": 0.25, "hp_": 0.75, "def_": 0, "enerRech_": 1.0, "eleMas": 0},
	"Barbara":    {"critRate_": 0.25, "critDMG_": 0.25, "atk_": 0, "hp_": 0.75, "def_": 0, "enerRech_": 1.0, "eleMas": 0},
	"Diona":      {"critRate_": 0.25, "critDMG_": 0.25, "atk_": 0, "hp_": 0.75, "def_": 0, "enerRech_": 1.0, "eleMas": 0},
	"Qiqi":       {"critRate_": 0.25, "critDMG_": 0.25, "atk_": 0.75, "hp_": 0, "def_": 0, "enerRech_": 1.0, "eleMas": 0},
	"Mika":       {"critRate_": 0.25, "critDMG_": 0.25, "atk_": 0, "hp_": 0.75, "def_": 0, "enerRech_": 1.0, "eleMas": 0},
	"Charlotte":  {"critRate_": 0.25, "critDMG_": 0.25, "atk_": 0.5, "hp_": 0, "def_": 0, "enerRech_": 1.0, "eleMas": 0},
	"Baizhu":     {"critRate_": 0.25, "critDMG_": 0.25, "atk_": 0, "hp_": 0.75, "def_": 0, "enerRech_": 1.0, "eleMas": 0},
	"Yaoyao":     {"critRate_": 0.25, "critDMG_": 0.25, "atk_": 0, "hp_": 0.75, "def_": 0, "enerRech_": 1.0, "eleMas": 0.5},
	"Kirara":     {"critRate_": 0.25, "critDMG_": 0.25, "atk_": 0, "hp_": 0.75, "def_": 0, "enerRech_": 1.0, "eleMas": 0},
	"Dori":       {"critRate_": 0.25, "critDMG_": 0.25, "atk_": 0, "hp_": 0.75, "def_": 0, "enerRech_": 1.0, "eleMas": 0},
	"Xianyun":    {"critRate_": 0.25, "critDMG_": 0.25, "atk_": 0.75, "hp_": 0, "def_": 0, "enerRech_": 1.0, "eleMas": 0},
	"Chevreuse":  {"critRate_": 0.25, "critDMG_": 0.25, "atk_": 0, "hp_": 0.75, "def_": 0, "enerRech_": 1.0, "eleMas": 0},
	"Lynette":    {"critRate_": 0.25, "critDMG_": 0.25, "atk_": 0.5, "hp_": 0, "def_": 0, "enerRech_": 1.0, "eleMas": 0},
	"Lan Yan":    {"critRate_": 0.25, "critDMG_": 0.25, "atk_": 0, "hp_": 0, "def_": 0, "enerRech_": 1.0, "eleMas": 0.75},
	// --- Anemo VV supports (EM primary) ---
	"Venti": {"critRate_": 0.25, "critDMG_": 0.25, "atk_": 0, "hp_": 0, "def_": 0, "enerRech_": 0.75, "eleMas": 1.0},
	"Jean":  {"critRate_": 0.5, "critDMG_": 0.5, "atk_": 0.5, "hp_": 0, "def_": 0, "enerRech_": 0.75, "eleMas": 0.75},
	"Sayu":  {"critRate_": 0.25, "critDMG_": 0.25, "atk_": 0, "hp_": 0, "def_": 0, "enerRech_": 0.75, "eleMas": 1.0},
	// --- Sub-DPS / burst DPS (crit + ER) ---
	"Xiangling":    {"critRate_": 1.0, "critDMG_": 1.0, "atk_": 0.75, "hp_": 0, "def_": 0, "enerRech_": 0.75, "eleMas": 0.5},
	"Xingqiu":      {"critRate_": 1.0, "critDMG_": 1.0, "atk_": 0.75, "hp_": 0, "def_": 0, "enerRech_": 0.75, "eleMas": 0},
	"Beidou":       {"critRate_": 1.0, "critDMG_": 1.0, "atk_": 0.75, "hp_": 0, "def_": 0, "enerRech_": 0.75, "eleMas": 0.25},
	"Fischl":       {"critRate_": 1.0, "critDMG_": 1.0, "atk_": 0.75, "hp_": 0, "def_": 0, "enerRech_": 0.25, "eleMas": 0.25},
	"Yae Miko":     {"critRate_": 1.0, "critDMG_": 1.0, "atk_": 0.75, "hp_": 0, "def_": 0, "enerRech_": 0.5, "eleMas": 0.5},
	"Raiden Shogun": {"critRate_": 1.0, "critDMG_": 1.0, "atk_": 0.75, "hp_": 0, "def_": 0, "enerRech_": 1.0, "eleMas": 0},
	"Lisa":         {"critRate_": 1.0, "critDMG_": 1.0, "atk_": 0.75, "hp_": 0, "def_": 0, "enerRech_": 0.75, "eleMas": 0.5},
	"Mona":         {"critRate_": 0.5, "critDMG_": 0.5, "atk_": 0.5, "hp_": 0, "def_": 0, "enerRech_": 1.0, "eleMas": 0.25},
	"Rosaria":      {"critRate_": 1.0, "critDMG_": 1.0, "atk_": 0.75, "hp_": 0, "def_": 0, "enerRech_": 0.5, "eleMas": 0},
	"Chongyun":     {"critRate_": 1.0, "critDMG_": 1.0, "atk_": 0.75, "hp_": 0, "def_": 0, "enerRech_": 0.25, "eleMas": 0},
	"Shenhe":       {"critRate_": 0.25, "critDMG_": 0.25, "atk_": 1.0, "hp_": 0, "def_": 0, "enerRech_": 0.75, "eleMas": 0},
	"Thoma":        {"critRate_": 0.25, "critDMG_": 0.25, "atk_": 0, "hp_": 0.75, "def_": 0, "enerRech_": 0.75, "eleMas": 0},
	"Dehya":        {"critRate_": 1.0, "critDMG_": 1.0, "atk_": 0.75, "hp_": 0.5, "def_": 0, "enerRech_": 0.25, "eleMas": 0.25},
	"Kujou Sara":   {"critRate_": 0.5, "critDMG_": 0.5, "atk_": 0.75, "hp_": 0, "def_": 0, "enerRech_": 0.75, "eleMas": 0},
	"Clorinde":     {"critRate_": 1.0, "critDMG_": 1.0, "atk_": 0.75, "hp_": 0, "def_": 0, "enerRech_": 0.25, "eleMas": 0.25},
	"Ororon":       {"critRate_": 0.5, "critDMG_": 0.5, "atk_": 0.25, "hp_": 0, "def_": 0, "enerRech_": 0.75, "eleMas": 0.75},
	"Iansan":       {"critRate_": 0.5, "critDMG_": 0.5, "atk_": 0.75, "hp_": 0, "def_": 0, "enerRech_": 0.75, "eleMas": 0},
	"Collei":       {"critRate_": 0.5, "critDMG_": 0.5, "atk_": 0.5, "hp_": 0, "def_": 0, "enerRech_": 0.75, "eleMas": 0.5},
	"Faruzan":      {"critRate_": 0.25, "critDMG_": 0.25, "atk_": 0.5, "hp_": 0, "def_": 0, "enerRech_": 1.0, "eleMas": 0},
	"Xilonen":      {"critRate_": 0.25, "critDMG_": 0.25, "atk_": 0, "hp_": 0, "def_": 1.0, "enerRech_": 0.75, "eleMas": 0},
	// --- New 5.5+ characters ---
	"Skirk":    {"critRate_": 1.0, "critDMG_": 1.0, "atk_": 0.75, "hp_": 0, "def_": 0, "enerRech_": 0, "eleMas": 0},
	"Eula":     {"critRate_": 1.0, "critDMG_": 1.0, "atk_": 0.75, "hp_": 0, "def_": 0, "enerRech_": 0.5, "eleMas": 0},
	"Nefer":    {"critRate_": 1.0, "critDMG_": 1.0, "atk_": 0.25, "hp_": 0, "def_": 0, "enerRech_": 0.25, "eleMas": 1.0},
	"Zibai":    {"critRate_": 1.0, "critDMG_": 1.0, "atk_": 0.5, "hp_": 0, "def_": 0, "enerRech_": 0.25, "eleMas": 0.75},
	"Lauma":    {"critRate_": 0.25, "critDMG_": 0.25, "atk_": 0, "hp_": 0.75, "def_": 0, "enerRech_": 0.75, "eleMas": 1.0},
	"Aino":     {"critRate_": 0.25, "critDMG_": 0.25, "atk_": 0, "hp_": 0.75, "def_": 0, "enerRech_": 1.0, "eleMas": 0.5},
	"Ineffa":   {"critRate_": 0.25, "critDMG_": 0.25, "atk_": 0, "hp_": 0, "def_": 0, "enerRech_": 0.75, "eleMas": 1.0},
	"Escoffier": {"critRate_": 0.25, "critDMG_": 0.25, "atk_": 0, "hp_": 0.75, "def_": 0, "enerRech_": 1.0, "eleMas": 0},
	"Ifa":      {"critRate_": 0.5, "critDMG_": 0.5, "atk_": 0.25, "hp_": 0, "def_": 0, "enerRech_": 0.5, "eleMas": 1.0},
	"Durin":    {"critRate_": 1.0, "critDMG_": 1.0, "atk_": 0.75, "hp_": 0, "def_": 0, "enerRech_": 0.25, "eleMas": 0.25},
	"Illuga":   {"critRate_": 1.0, "critDMG_": 1.0, "atk_": 0.75, "hp_": 0, "def_": 0, "enerRech_": 0.25, "eleMas": 0},
	"Manekin":  {"critRate_": 0.5, "critDMG_": 0.5, "atk_": 0.75, "hp_": 0, "def_": 0, "enerRech_": 0.75, "eleMas": 0},
}

// characterDesiredMainStats maps character name → slot → acceptable main stat keys
var characterDesiredMainStats = map[string]map[string][]string{
	// --- DPS (ATK% sands, elem goblet, crit circlet) ---
	"Diluc":       {"sands": {"atk_"}, "goblet": {"pyro_dmg_"}, "circlet": {"critRate_", "critDMG_"}},
	"Klee":        {"sands": {"atk_"}, "goblet": {"pyro_dmg_"}, "circlet": {"critRate_", "critDMG_"}},
	"Yanfei":      {"sands": {"atk_"}, "goblet": {"pyro_dmg_"}, "circlet": {"critRate_", "critDMG_"}},
	"Yoimiya":     {"sands": {"atk_"}, "goblet": {"pyro_dmg_"}, "circlet": {"critRate_", "critDMG_"}},
	"Lyney":       {"sands": {"atk_"}, "goblet": {"pyro_dmg_"}, "circlet": {"critRate_", "critDMG_"}},
	"Gaming":      {"sands": {"atk_"}, "goblet": {"pyro_dmg_"}, "circlet": {"critRate_", "critDMG_"}},
	"Arlecchino":  {"sands": {"atk_"}, "goblet": {"pyro_dmg_"}, "circlet": {"critRate_", "critDMG_"}},
	"Mavuika":     {"sands": {"atk_"}, "goblet": {"pyro_dmg_"}, "circlet": {"critRate_", "critDMG_"}},
	"Tartaglia":   {"sands": {"atk_"}, "goblet": {"hydro_dmg_"}, "circlet": {"critRate_", "critDMG_"}},
	"Ayato":       {"sands": {"atk_"}, "goblet": {"hydro_dmg_"}, "circlet": {"critRate_", "critDMG_"}},
	"Keqing":      {"sands": {"atk_"}, "goblet": {"electro_dmg_"}, "circlet": {"critRate_", "critDMG_"}},
	"Ganyu":       {"sands": {"atk_"}, "goblet": {"cryo_dmg_"}, "circlet": {"critRate_", "critDMG_"}},
	"Ayaka":       {"sands": {"atk_"}, "goblet": {"cryo_dmg_"}, "circlet": {"critRate_", "critDMG_"}},
	"Wriothesley": {"sands": {"atk_"}, "goblet": {"cryo_dmg_"}, "circlet": {"critRate_", "critDMG_"}},
	"Wanderer":    {"sands": {"atk_"}, "goblet": {"anemo_dmg_"}, "circlet": {"critRate_", "critDMG_"}},
	"Xiao":        {"sands": {"atk_"}, "goblet": {"anemo_dmg_"}, "circlet": {"critRate_", "critDMG_"}},
	"Heizou":      {"sands": {"atk_"}, "goblet": {"anemo_dmg_"}, "circlet": {"critRate_", "critDMG_"}},
	"Navia":       {"sands": {"atk_"}, "goblet": {"geo_dmg_"}, "circlet": {"critRate_", "critDMG_"}},
	"Ningguang":   {"sands": {"atk_"}, "goblet": {"geo_dmg_"}, "circlet": {"critRate_", "critDMG_"}},
	"Razor":       {"sands": {"atk_"}, "goblet": {"physical_dmg_"}, "circlet": {"critRate_", "critDMG_"}},
	"Xinyan":      {"sands": {"atk_"}, "goblet": {"physical_dmg_"}, "circlet": {"critRate_", "critDMG_"}},
	"Freminet":    {"sands": {"atk_"}, "goblet": {"physical_dmg_", "cryo_dmg_"}, "circlet": {"critRate_", "critDMG_"}},
	"Amber":       {"sands": {"atk_"}, "goblet": {"pyro_dmg_"}, "circlet": {"critRate_", "critDMG_"}},
	"Aloy":        {"sands": {"atk_"}, "goblet": {"cryo_dmg_"}, "circlet": {"critRate_", "critDMG_"}},
	"Chasca":      {"sands": {"atk_"}, "goblet": {"anemo_dmg_"}, "circlet": {"critRate_", "critDMG_"}},
	"Varesa":      {"sands": {"atk_", "eleMas"}, "goblet": {"electro_dmg_"}, "circlet": {"critRate_", "critDMG_"}},
	"Tighnari":    {"sands": {"eleMas", "atk_"}, "goblet": {"dendro_dmg_"}, "circlet": {"critRate_", "critDMG_"}},
	"Kaeya":       {"sands": {"atk_"}, "goblet": {"cryo_dmg_"}, "circlet": {"critRate_", "critDMG_"}},
	// --- HP scalers ---
	"Hu Tao":      {"sands": {"hp_", "eleMas"}, "goblet": {"pyro_dmg_"}, "circlet": {"critRate_", "critDMG_"}},
	"Zhongli":     {"sands": {"hp_"}, "goblet": {"hp_"}, "circlet": {"hp_", "critRate_", "critDMG_"}},
	"Yelan":       {"sands": {"hp_"}, "goblet": {"hydro_dmg_"}, "circlet": {"critRate_", "critDMG_"}},
	"Kokomi":      {"sands": {"hp_", "enerRech_"}, "goblet": {"hydro_dmg_", "hp_"}, "circlet": {"heal_"}},
	"Neuvillette": {"sands": {"hp_"}, "goblet": {"hydro_dmg_"}, "circlet": {"critRate_", "critDMG_"}},
	"Furina":      {"sands": {"hp_"}, "goblet": {"hp_"}, "circlet": {"critRate_", "critDMG_"}},
	"Nilou":       {"sands": {"hp_"}, "goblet": {"hp_"}, "circlet": {"hp_"}},
	"Sigewinne":   {"sands": {"hp_"}, "goblet": {"hp_"}, "circlet": {"hp_", "heal_"}},
	"Mualani":     {"sands": {"hp_"}, "goblet": {"hydro_dmg_"}, "circlet": {"critRate_", "critDMG_"}},
	"Candace":     {"sands": {"hp_", "enerRech_"}, "goblet": {"hp_"}, "circlet": {"hp_", "critRate_"}},
	"Layla":       {"sands": {"hp_"}, "goblet": {"hp_"}, "circlet": {"hp_"}},
	"Dahlia":      {"sands": {"hp_", "enerRech_"}, "goblet": {"hp_"}, "circlet": {"hp_"}},
	"Columbina":   {"sands": {"hp_", "enerRech_"}, "goblet": {"hp_"}, "circlet": {"critRate_", "critDMG_"}},
	// --- DEF scalers ---
	"Albedo":       {"sands": {"def_"}, "goblet": {"geo_dmg_", "def_"}, "circlet": {"critRate_", "critDMG_"}},
	"Noelle":       {"sands": {"def_"}, "goblet": {"geo_dmg_"}, "circlet": {"critRate_", "critDMG_"}},
	"Arataki Itto": {"sands": {"def_"}, "goblet": {"geo_dmg_"}, "circlet": {"critRate_", "critDMG_"}},
	"Gorou":        {"sands": {"def_", "enerRech_"}, "goblet": {"def_"}, "circlet": {"def_"}},
	"Yun Jin":      {"sands": {"def_", "enerRech_"}, "goblet": {"def_"}, "circlet": {"def_"}},
	"Chiori":       {"sands": {"def_"}, "goblet": {"geo_dmg_"}, "circlet": {"critRate_", "critDMG_"}},
	"Kachina":      {"sands": {"def_"}, "goblet": {"geo_dmg_", "def_"}, "circlet": {"critRate_", "critDMG_", "def_"}},
	// --- EM scalers ---
	"Kaedehara Kazuha": {"sands": {"eleMas"}, "goblet": {"eleMas"}, "circlet": {"eleMas"}},
	"Nahida":            {"sands": {"eleMas"}, "goblet": {"dendro_dmg_", "eleMas"}, "circlet": {"critRate_", "critDMG_"}},
	"Sucrose":           {"sands": {"eleMas"}, "goblet": {"eleMas"}, "circlet": {"eleMas"}},
	"Alhaitham":         {"sands": {"eleMas"}, "goblet": {"dendro_dmg_"}, "circlet": {"critRate_", "critDMG_"}},
	"Cyno":              {"sands": {"eleMas"}, "goblet": {"electro_dmg_"}, "circlet": {"critRate_", "critDMG_"}},
	"Kuki Shinobu":      {"sands": {"eleMas"}, "goblet": {"eleMas"}, "circlet": {"eleMas"}},
	"Kaveh":             {"sands": {"eleMas", "enerRech_"}, "goblet": {"eleMas"}, "circlet": {"eleMas"}},
	"Sethos":            {"sands": {"eleMas"}, "goblet": {"electro_dmg_"}, "circlet": {"critRate_", "critDMG_"}},
	"Citlali":           {"sands": {"eleMas"}, "goblet": {"eleMas"}, "circlet": {"eleMas"}},
	"Yumemizuki Mizuki": {"sands": {"eleMas"}, "goblet": {"eleMas"}, "circlet": {"eleMas"}},
	"Kinich":            {"sands": {"atk_"}, "goblet": {"dendro_dmg_"}, "circlet": {"critRate_", "critDMG_"}},
	"Emilie":            {"sands": {"atk_"}, "goblet": {"dendro_dmg_"}, "circlet": {"critRate_", "critDMG_"}},
	// --- Supports / Healers ---
	"Bennett":    {"sands": {"enerRech_", "hp_"}, "goblet": {"hp_"}, "circlet": {"hp_", "heal_"}},
	"Barbara":    {"sands": {"hp_", "enerRech_"}, "goblet": {"hp_"}, "circlet": {"hp_", "heal_"}},
	"Diona":      {"sands": {"hp_", "enerRech_"}, "goblet": {"hp_"}, "circlet": {"hp_", "heal_"}},
	"Qiqi":       {"sands": {"atk_", "enerRech_"}, "goblet": {"atk_"}, "circlet": {"heal_", "atk_"}},
	"Mika":       {"sands": {"hp_", "enerRech_"}, "goblet": {"hp_"}, "circlet": {"hp_", "heal_"}},
	"Charlotte":  {"sands": {"atk_", "enerRech_"}, "goblet": {"atk_"}, "circlet": {"atk_", "heal_"}},
	"Baizhu":     {"sands": {"hp_", "enerRech_"}, "goblet": {"hp_"}, "circlet": {"hp_", "heal_"}},
	"Yaoyao":     {"sands": {"hp_", "enerRech_"}, "goblet": {"hp_"}, "circlet": {"hp_", "heal_"}},
	"Kirara":     {"sands": {"hp_", "enerRech_"}, "goblet": {"hp_"}, "circlet": {"hp_"}},
	"Dori":       {"sands": {"hp_", "enerRech_"}, "goblet": {"hp_"}, "circlet": {"hp_", "heal_"}},
	"Xianyun":    {"sands": {"atk_", "enerRech_"}, "goblet": {"atk_"}, "circlet": {"atk_", "heal_"}},
	"Chevreuse":  {"sands": {"hp_", "enerRech_"}, "goblet": {"hp_"}, "circlet": {"hp_"}},
	"Lynette":    {"sands": {"atk_", "enerRech_"}, "goblet": {"anemo_dmg_"}, "circlet": {"critRate_", "critDMG_"}},
	"Lan Yan":    {"sands": {"enerRech_", "eleMas"}, "goblet": {"eleMas"}, "circlet": {"eleMas"}},
	// --- Anemo VV supports ---
	"Venti": {"sands": {"eleMas", "enerRech_"}, "goblet": {"eleMas"}, "circlet": {"eleMas"}},
	"Jean":  {"sands": {"atk_", "enerRech_"}, "goblet": {"anemo_dmg_"}, "circlet": {"critRate_", "critDMG_", "heal_"}},
	"Sayu":  {"sands": {"eleMas", "enerRech_"}, "goblet": {"eleMas"}, "circlet": {"eleMas"}},
	// --- Sub-DPS / burst DPS ---
	"Xiangling":    {"sands": {"atk_", "enerRech_"}, "goblet": {"pyro_dmg_"}, "circlet": {"critRate_", "critDMG_"}},
	"Xingqiu":      {"sands": {"atk_", "enerRech_"}, "goblet": {"hydro_dmg_"}, "circlet": {"critRate_", "critDMG_"}},
	"Beidou":       {"sands": {"atk_", "enerRech_"}, "goblet": {"electro_dmg_"}, "circlet": {"critRate_", "critDMG_"}},
	"Fischl":       {"sands": {"atk_"}, "goblet": {"electro_dmg_"}, "circlet": {"critRate_", "critDMG_"}},
	"Yae Miko":     {"sands": {"atk_"}, "goblet": {"electro_dmg_"}, "circlet": {"critRate_", "critDMG_"}},
	"Raiden Shogun": {"sands": {"enerRech_", "atk_"}, "goblet": {"electro_dmg_"}, "circlet": {"critRate_", "critDMG_"}},
	"Lisa":         {"sands": {"atk_", "enerRech_"}, "goblet": {"electro_dmg_"}, "circlet": {"critRate_", "critDMG_"}},
	"Mona":         {"sands": {"enerRech_", "atk_"}, "goblet": {"hydro_dmg_"}, "circlet": {"critRate_", "critDMG_"}},
	"Rosaria":      {"sands": {"atk_"}, "goblet": {"cryo_dmg_", "physical_dmg_"}, "circlet": {"critRate_", "critDMG_"}},
	"Chongyun":     {"sands": {"atk_"}, "goblet": {"cryo_dmg_"}, "circlet": {"critRate_", "critDMG_"}},
	"Shenhe":       {"sands": {"atk_"}, "goblet": {"atk_"}, "circlet": {"atk_"}},
	"Thoma":        {"sands": {"hp_", "enerRech_"}, "goblet": {"hp_"}, "circlet": {"hp_"}},
	"Dehya":        {"sands": {"atk_", "hp_"}, "goblet": {"pyro_dmg_"}, "circlet": {"critRate_", "critDMG_"}},
	"Kujou Sara":   {"sands": {"atk_", "enerRech_"}, "goblet": {"electro_dmg_"}, "circlet": {"critRate_", "critDMG_"}},
	"Clorinde":     {"sands": {"atk_"}, "goblet": {"electro_dmg_"}, "circlet": {"critRate_", "critDMG_"}},
	"Ororon":       {"sands": {"enerRech_", "eleMas"}, "goblet": {"electro_dmg_", "eleMas"}, "circlet": {"critRate_", "critDMG_"}},
	"Iansan":       {"sands": {"atk_", "enerRech_"}, "goblet": {"electro_dmg_"}, "circlet": {"critRate_", "critDMG_"}},
	"Collei":       {"sands": {"atk_", "enerRech_"}, "goblet": {"dendro_dmg_"}, "circlet": {"critRate_", "critDMG_"}},
	"Faruzan":      {"sands": {"atk_", "enerRech_"}, "goblet": {"anemo_dmg_"}, "circlet": {"critRate_", "critDMG_"}},
	"Xilonen":      {"sands": {"def_", "enerRech_"}, "goblet": {"def_"}, "circlet": {"def_"}},
	// --- New 5.5+ characters ---
	"Skirk":     {"sands": {"atk_"}, "goblet": {"cryo_dmg_"}, "circlet": {"critRate_", "critDMG_"}},
	"Eula":      {"sands": {"atk_"}, "goblet": {"physical_dmg_"}, "circlet": {"critRate_", "critDMG_"}},
	"Nefer":     {"sands": {"eleMas"}, "goblet": {"eleMas"}, "circlet": {"critRate_", "critDMG_"}},
	"Zibai":     {"sands": {"atk_", "eleMas"}, "goblet": {"geo_dmg_"}, "circlet": {"critRate_", "critDMG_"}},
	"Lauma":     {"sands": {"eleMas", "enerRech_"}, "goblet": {"eleMas"}, "circlet": {"eleMas"}},
	"Aino":      {"sands": {"hp_", "enerRech_"}, "goblet": {"hp_"}, "circlet": {"hp_", "heal_"}},
	"Ineffa":    {"sands": {"eleMas", "enerRech_"}, "goblet": {"eleMas"}, "circlet": {"eleMas"}},
	"Escoffier": {"sands": {"hp_", "enerRech_"}, "goblet": {"hp_"}, "circlet": {"hp_", "heal_"}},
	"Ifa":       {"sands": {"eleMas"}, "goblet": {"eleMas"}, "circlet": {"critRate_", "critDMG_"}},
	"Durin":     {"sands": {"atk_"}, "goblet": {"anemo_dmg_"}, "circlet": {"critRate_", "critDMG_"}},
	"Illuga":    {"sands": {"atk_"}, "goblet": {"geo_dmg_"}, "circlet": {"critRate_", "critDMG_"}},
	"Manekin":   {"sands": {"atk_", "enerRech_"}, "goblet": {"atk_"}, "circlet": {"critRate_", "critDMG_"}},
}

// weaponRecommendation holds best weapons for a character
type weaponRecommendation struct {
	Signature   string
	Recommended []string
}

// characterBestWeapons maps character name → weapon recommendations (GOOD format keys)
var characterBestWeapons = map[string]weaponRecommendation{
	// Pyro
	"Amber":      {Recommended: []string{"AmosBow", "SkywardHarp"}},
	"Xiangling":  {Recommended: []string{"TheCatch", "EngulfingLightning", "StaffOfHoma"}},
	"Bennett":    {Recommended: []string{"AquilaFavonia", "SkywardBlade", "SacrificialSword"}},
	"Diluc":      {Recommended: []string{"WolfsGravestone", "SerpentSpine"}},
	"Klee":       {Recommended: []string{"LostPrayerToTheSacredWinds", "SkywardAtlas"}},
	"Yanfei":     {Recommended: []string{"LostPrayerToTheSacredWinds", "TheWidsith"}},
	"Hu Tao":     {Signature: "StaffOfHoma", Recommended: []string{"DragonsBane", "DeathMatch"}},
	"Yoimiya":    {Signature: "ThunderingPulse", Recommended: []string{"Rust", "SkywardHarp"}},
	"Thoma":      {Recommended: []string{"FavoniusLance", "TheCatch"}},
	"Dehya":      {Signature: "BeaconOfTheReedSea", Recommended: []string{"WolfsGravestone"}},
	"Lyney":      {Signature: "TheFirstGreatMagic", Recommended: []string{"AquaSimulacra", "SkywardHarp"}},
	"Chevreuse":  {Recommended: []string{"FavoniusLance"}},
	"Gaming":     {Recommended: []string{"SerpentSpine", "WolfsGravestone"}},
	"Arlecchino": {Signature: "CrimsonMoonsSemblance", Recommended: []string{"PrimordialJadeWingedSpear", "StaffOfHoma"}},
	"Mavuika":    {Signature: "AThousandBlazingSuns", Recommended: []string{"SerpentSpine", "WolfsGravestone"}},
	"Columbina":  {Signature: "NocturnesCurtainCall", Recommended: []string{"PrototypeAmber", "FavoniusCodex"}},
	// Hydro
	"Barbara":     {Recommended: []string{"ThrillingTalesOfDragonSlayers", "PrototypeAmber"}},
	"Xingqiu":     {Recommended: []string{"SacrificialSword", "FavoniusSword"}},
	"Mona":        {Recommended: []string{"ThrillingTalesOfDragonSlayers", "TheWidsith"}},
	"Tartaglia":   {Signature: "PolarStar", Recommended: []string{"ThunderingPulse", "SkywardHarp"}},
	"Kokomi":      {Signature: "EverlastingMoonglow", Recommended: []string{"ThrillingTalesOfDragonSlayers", "PrototypeAmber"}},
	"Ayato":       {Signature: "HaranGeppakuFutsu", Recommended: []string{"TheBlackSword", "PrimordialJadeCutter"}},
	"Yelan":       {Signature: "AquaSimulacra", Recommended: []string{"FavoniusWarbow", "RecurveBow"}},
	"Candace":     {Recommended: []string{"FavoniusLance"}},
	"Nilou":       {Signature: "KeyOfKhajNisut", Recommended: []string{"FavoniusSword", "IronSting"}},
	"Neuvillette": {Signature: "TomeOfTheEternalFlow", Recommended: []string{"CashflowSupervision"}},
	"Furina":      {Signature: "SplendorOfTranquilWaters", Recommended: []string{"FavoniusSword", "FleuveCendreFerryman"}},
	"Sigewinne":   {Signature: "SilvershowerHeartStrings", Recommended: []string{"FavoniusWarbow", "SacrificialBow"}},
	"Mualani":     {Signature: "SurfsUp", Recommended: []string{"CashflowSupervision", "TheWidsith"}},
	"Dahlia":      {Recommended: []string{"FavoniusSword", "SacrificialSword", "KeyOfKhajNisut"}},
	// Electro
	"Lisa":          {Recommended: []string{"ThrillingTalesOfDragonSlayers", "SacrificialFragments"}},
	"Fischl":        {Recommended: []string{"SkywardHarp", "TheStringless", "AlleyHunter"}},
	"Beidou":        {Recommended: []string{"WolfsGravestone", "SerpentSpine", "SacrificialGreatsword"}},
	"Keqing":        {Recommended: []string{"MistsplitterReforged", "PrimordialJadeCutter"}},
	"Kujou Sara":    {Recommended: []string{"SkywardHarp", "ElegyForTheEnd", "FavoniusWarbow"}},
	"Raiden Shogun": {Signature: "EngulfingLightning", Recommended: []string{"TheCatch", "StaffOfHoma"}},
	"Yae Miko":      {Signature: "KagurasTruth", Recommended: []string{"LostPrayerToTheSacredWinds", "TheWidsith"}},
	"Kuki Shinobu":  {Recommended: []string{"FreedomSworn", "IronSting", "KeyOfKhajNisut"}},
	"Dori":          {Recommended: []string{"FavoniusGreatsword", "SacrificialGreatsword"}},
	"Cyno":          {Signature: "StaffOfTheScarletSands", Recommended: []string{"PrimordialJadeWingedSpear", "DeathMatch"}},
	"Sethos":        {Recommended: []string{"HuntersPath", "Slingshot"}},
	"Clorinde":      {Signature: "Absolution", Recommended: []string{"MistsplitterReforged", "FinaleOfTheDeep"}},
	"Ororon":        {Recommended: []string{"FavoniusWarbow", "ElegyForTheEnd"}},
	"Iansan":        {Recommended: []string{"CalamityQueller", "FavoniusLance", "EngulfingLightning"}},
	"Varesa":        {Signature: "VividNotions", Recommended: []string{"KagurasTruth", "TheWidsith"}},
	// Cryo
	"Qiqi":        {Recommended: []string{"SacrificialSword", "FavoniusSword"}},
	"Chongyun":    {Recommended: []string{"WolfsGravestone", "SerpentSpine"}},
	"Diona":       {Recommended: []string{"SacrificialBow", "FavoniusWarbow"}},
	"Ganyu":       {Signature: "AmosBow", Recommended: []string{"PrototypeCrescent", "Hamayumi"}},
	"Rosaria":     {Recommended: []string{"FavoniusLance", "PrimordialJadeWingedSpear"}},
	"Shenhe":      {Signature: "CalamityQueller", Recommended: []string{"FavoniusLance"}},
	"Ayaka":       {Signature: "MistsplitterReforged", Recommended: []string{"AmenomaKageuchi", "PrimordialJadeCutter"}},
	"Aloy":        {Recommended: []string{"ThunderingPulse", "AmosBow"}},
	"Layla":       {Recommended: []string{"FavoniusSword", "KeyOfKhajNisut"}},
	"Mika":        {Recommended: []string{"FavoniusLance"}},
	"Freminet":    {Recommended: []string{"SerpentSpine", "WolfsGravestone"}},
	"Wriothesley": {Signature: "CashflowSupervision", Recommended: []string{"TulaytullahsRemembrance"}},
	"Charlotte":   {Recommended: []string{"PrototypeAmber", "ThrillingTalesOfDragonSlayers"}},
	"Citlali":     {Signature: "StarcallersWatch", Recommended: []string{"AThousandFloatingDreams", "SacrificialFragments"}},
	// Dendro
	"Collei":    {Recommended: []string{"FavoniusWarbow", "ElegyForTheEnd"}},
	"Tighnari":  {Signature: "HuntersPath", Recommended: []string{"AmosBow", "SkywardHarp"}},
	"Nahida":    {Signature: "AThousandFloatingDreams", Recommended: []string{"SacrificialFragments", "MagicGuide"}},
	"Yaoyao":    {Recommended: []string{"FavoniusLance"}},
	"Alhaitham": {Signature: "LightOfFoliarIncision", Recommended: []string{"PrimordialJadeCutter", "IronSting"}},
	"Kaveh":     {Recommended: []string{"FavoniusGreatsword", "MakhairaAquamarine"}},
	"Baizhu":    {Signature: "JadefallsSplendor", Recommended: []string{"PrototypeAmber", "ThrillingTalesOfDragonSlayers"}},
	"Kirara":    {Recommended: []string{"FavoniusSword"}},
	"Emilie":    {Signature: "LumidouceElegy", Recommended: []string{"StaffOfHoma", "DeathMatch"}},
	"Kinich":    {Signature: "FangOfTheMountainKing", Recommended: []string{"SerpentSpine", "EarthShaker"}},
	"Xilonen":   {Signature: "PeakPatrolSong", Recommended: []string{"FavoniusSword", "FreedomSworn"}},
	// Anemo
	"Sucrose":           {Recommended: []string{"SacrificialFragments", "ThrillingTalesOfDragonSlayers"}},
	"Jean":              {Recommended: []string{"AquilaFavonia", "FavoniusSword"}},
	"Venti":             {Recommended: []string{"ElegyForTheEnd", "TheStringless", "SkywardHarp"}},
	"Xiao":              {Signature: "PrimordialJadeWingedSpear", Recommended: []string{"StaffOfHoma", "CalamityQueller"}},
	"Kaedehara Kazuha":  {Signature: "FreedomSworn", Recommended: []string{"IronSting", "FavoniusSword"}},
	"Sayu":              {Recommended: []string{"FavoniusGreatsword", "WolfsGravestone"}},
	"Heizou":            {Recommended: []string{"LostPrayerToTheSacredWinds", "TheWidsith"}},
	"Faruzan":           {Recommended: []string{"FavoniusWarbow", "ElegyForTheEnd"}},
	"Wanderer":          {Signature: "TulaytullahsRemembrance", Recommended: []string{"LostPrayerToTheSacredWinds", "TheWidsith"}},
	"Lynette":           {Recommended: []string{"FavoniusSword"}},
	"Lan Yan":           {Recommended: []string{"FavoniusGreatsword"}},
	"Chasca":            {Signature: "AstralVulturesCrimsonPlumage", Recommended: []string{"TheFirstGreatMagic", "AquaSimulacra"}},
	"Yumemizuki Mizuki": {Signature: "SunnyMorningSleepIn", Recommended: []string{"AThousandFloatingDreams", "SacrificialFragments"}},
	// Geo / Physical
	"Kachina":      {Recommended: []string{"FavoniusLance"}},
	"Noelle":       {Recommended: []string{"RedhornStonethresher", "Whiteblind", "SerpentSpine"}},
	"Zhongli":      {Signature: "VortexVanquisher", Recommended: []string{"StaffOfHoma", "BlackTassel"}},
	"Albedo":       {Signature: "CinnabarSpindle", Recommended: []string{"HarbingerOfDawn"}},
	"Gorou":        {Recommended: []string{"FavoniusWarbow"}},
	"Arataki Itto": {Signature: "RedhornStonethresher", Recommended: []string{"SerpentSpine", "Whiteblind"}},
	"Xianyun":      {Recommended: []string{"FavoniusCodex"}},
	"Navia":        {Signature: "Verdict", Recommended: []string{"SerpentSpine", "SkywardPride"}},
	"Chiori":       {Signature: "UrakuMisugiri", Recommended: []string{}},
	"Ningguang":    {Recommended: []string{"LostPrayerToTheSacredWinds", "TheWidsith", "SolarPearl"}},
	"Razor":        {Recommended: []string{"WolfsGravestone", "SerpentSpine"}},
	"Kaeya":        {Recommended: []string{"MistsplitterReforged", "PrimordialJadeCutter"}},
	"Xinyan":       {Recommended: []string{"WolfsGravestone", "SerpentSpine"}},
	"Yun Jin":      {Recommended: []string{"FavoniusLance"}},
}

// calculateSetBonus computes artifact set completion + recommendation bonus
func calculateSetBonus(charName string, artifacts []map[string]interface{}) float64 {
	setCounts := map[string]int{}
	for _, a := range artifacts {
		sn := str(a["set_name"])
		if sn != "" {
			setCounts[sn]++
		}
	}
	bestSets := characterBestSets[charName]
	var setBonus float64
	for sn, count := range setCounts {
		var bonus float64
		if count >= 4 {
			bonus = 2500
		} else if count >= 2 {
			bonus = 800
		} else {
			continue
		}
		// Recommended set multiplier
		for _, bs := range bestSets {
			if sn == bs {
				bonus *= 1.5
				break
			}
		}
		setBonus += bonus
	}
	return setBonus
}

// calculateWeaponScore computes weapon score with rarity scaling + recommendation bonus
func calculateWeaponScore(charName string, weapon map[string]interface{}) float64 {
	if weapon == nil {
		return 0
	}
	wl := float64(intVal(weapon["level"]))
	rarity := intVal(weapon["rarity"])
	var multiplier float64
	switch rarity {
	case 5:
		multiplier = 1.2
	case 4:
		multiplier = 0.8
	case 3:
		multiplier = 0.5
	default:
		multiplier = 0.3
	}
	score := wl * wl * multiplier
	// Weapon match bonus
	weaponName := str(weapon["name"])
	if rec, ok := characterBestWeapons[charName]; ok {
		if weaponName != "" && weaponName == rec.Signature {
			score += 3000
		} else {
			for _, rw := range rec.Recommended {
				if weaponName == rw {
					score += 1500
					break
				}
			}
		}
	}
	return score
}

// Abyss Floor 12 clear threshold score (per half)
// Floor 12 enemies are Lv.95-100. Requires 4 well-built chars (~20k each) + resonance.
const abyssClearThreshold = 80000   // per half team score
const abyssComfortThreshold = 100000 // comfortable 36-star with buffs to spare

// getEnemyResistance returns the resistance map for a given enemy name.
// Falls back to "default" if the enemy is not explicitly listed.
func getEnemyResistance(enemyName string) map[string]float64 {
	if res, ok := enemyResistance[enemyName]; ok {
		return res
	}
	// Partial match: check if enemy name contains a known key
	for key, res := range enemyResistance {
		if key != "default" && strings.Contains(enemyName, key) {
			return res
		}
	}
	return enemyResistance["default"]
}

// calcResPenalty computes a resistance penalty multiplier.
// For resistance 0-75: penalty = 1.0 - (res / 100)
// For resistance >= 75: penalty = 1.0 / (1.0 + 3.0*(res/100)) (diminishing)
// For negative resistance: penalty = 1.0 - (res / 200) (bonus)
func calcResPenalty(res float64) float64 {
	if res < 0 {
		return 1.0 - (res / 200.0)
	}
	if res >= 75 {
		return 1.0 / (1.0 + 3.0*(res/100.0))
	}
	return 1.0 - (res / 100.0)
}

// elementToResKey maps character element names to resistance key names
func elementToResKey(element string) string {
	// Normalize Korean element names to English for resistance lookup
	if en, ok := elementKoToEn[element]; ok {
		return en
	}
	return element
}

// --- Desired Main Stats for Artifact Filtering ---

// getDesiredMainStats returns the set of preferred main stat keywords
// based on character element and weapon type for artifact scoring.
func getDesiredMainStats(element, weaponType string) map[string]bool {
	desired := map[string]bool{}

	// Universal: CRIT is always desired
	desired["crit"] = true

	// Anemo characters often scale on EM
	if element == "Anemo" || element == "바람" {
		desired["elemental mastery"] = true
		desired["em"] = true
		desired["atk"] = true
	} else {
		// Default: ATK-based DPS
		desired["atk"] = true
		desired["elemental dmg"] = true
		desired["energy recharge"] = true
	}

	_ = weaponType // reserved for future weapon-type-specific filtering
	return desired
}

// hpScalingCharacters are characters that prefer HP% main stats
var hpScalingCharacters = map[string]bool{
	"Hu Tao": true, "Zhongli": true, "Yelan": true, "Kokomi": true,
	"Barbara": true, "Diona": true, "Nilou": true, "Neuvillette": true,
	"Furina": true, "Sigewinne": true, "Baizhu": true,
}

// emScalingCharacters are characters that prefer EM main stats
var emScalingCharacters = map[string]bool{
	"Kazuha": true, "Sucrose": true, "Nahida": true, "Tighnari": true,
	"Alhaitham": true, "Yaoyao": true,
}

// defScalingCharacters are characters that prefer DEF% main stats
var defScalingCharacters = map[string]bool{
	"Albedo": true, "Noelle": true, "Gorou": true, "Itto": true,
}

// Element name mapping (EN <-> KO)
var elementEnToKo = map[string]string{
	"Pyro": "불", "Hydro": "물", "Electro": "번개", "Cryo": "얼음",
	"Anemo": "바람", "Geo": "바위", "Dendro": "풀",
}
var elementKoToEn = map[string]string{
	"불": "Pyro", "물": "Hydro", "번개": "Electro", "얼음": "Cryo",
	"바람": "Anemo", "바위": "Geo", "풀": "Dendro",
}

// normalizeElement converts element name to match regardless of language
func elementsMatch(charElement, theaterElement string) bool {
	if charElement == theaterElement { return true }
	if ko, ok := elementEnToKo[charElement]; ok && ko == theaterElement { return true }
	if en, ok := elementKoToEn[charElement]; ok && en == theaterElement { return true }
	return false
}

func getCharGender(name string) string {
	// Normalize: remove spaces for matching
	normalized := strings.ReplaceAll(name, " ", "")
	for k := range maleCharacters {
		if strings.EqualFold(strings.ReplaceAll(k, " ", ""), normalized) {
			return "male"
		}
	}
	return "female"
}

func isDefaultMale(name string) bool {
	normalized := strings.ReplaceAll(name, " ", "")
	for k := range defaultMaleCharacters {
		if strings.EqualFold(strings.ReplaceAll(k, " ", ""), normalized) {
			return true
		}
	}
	return false
}

var tierPriority = map[string]int{
	"SS": 1, "S": 2, "A": 3, "B": 4, "C": 5,
}

func getTierPriority(tier string) int {
	if p, ok := tierPriority[tier]; ok {
		return p
	}
	return 4 // default to B
}

// --- Planner Handlers ---

func handleTheaterSeasons(w http.ResponseWriter, r *http.Request) {
	result, err := rqliteQuery("SELECT * FROM theater_seasons ORDER BY date DESC")
	writeResult(w, result, err)
}

// Cumulative EXP required to reach each level (1-90)
// Source: Genshin Impact wiki character EXP table
var cumulativeEXP = [91]int{
	0, 0, 1000, 2325, 4025, 6175, 8800, 11950, 15675, 20025, 25025, // 0-10
	30725, 37175, 44400, 52450, 61375, 71200, 81950, 93675, 106400, 120175, // 11-20
	135050, 151850, 169850, 189100, 209650, 231525, 254775, 279425, 305525, 333100, // 21-30
	362200, 392850, 425100, 458975, 494525, 531775, 570750, 611500, 654075, 698500, // 31-40
	744800, 795425, 848125, 902900, 959800, 1018875, 1080150, 1143675, 1209475, 1277575, // 41-50
	1348000, 1424575, 1503625, 1585200, 1669325, 1756050, 1845400, 1937400, 2032100, 2129525, // 51-60
	2229725, 2341550, 2455825, 2572550, 2691750, 2813425, 2937600, 3064300, 3193525, 3325300, // 61-70
	3459625, 3602675, 3748500, 3897125, 4048575, 4202875, 4360050, 4520125, 4683125, 4849075, // 71-80
	5018000, 5189925, 5364875, 5542875, 5723950, 5908125, 6095425, 6285875, 6479500, 6676325, // 81-90
}

// expToLevel80 returns EXP needed to go from current level to 80
func expToLevel80(currentLevel int) int {
	if currentLevel >= 80 || currentLevel < 1 { return 0 }
	return cumulativeEXP[80] - cumulativeEXP[currentLevel]
}

func handlePlannerRecommend(w http.ResponseWriter, r *http.Request) {
	uid := getUserID(r)

	// Read user preferences
	prefRaw, _ := rqliteQueryParam("SELECT prefer_gender, include_default_males, theater_difficulty FROM users WHERE id = ?", uid)
	prefRows := parseRows(prefRaw)
	preferGender := "all"
	includeDefaultMales := 1
	theaterDifficulty := "transcendence"
	if len(prefRows) > 0 {
		if g := str(prefRows[0]["prefer_gender"]); g != "" {
			preferGender = g
		}
		if dm := prefRows[0]["include_default_males"]; dm != nil {
			includeDefaultMales = intVal(dm)
		}
		if td := str(prefRows[0]["theater_difficulty"]); td != "" {
			theaterDifficulty = td
		}
	}

	// Characters needed per difficulty
	difficultyChars := map[string]int{
		"normal":        8,
		"hard":          16,
		"transcendence": 32,
	}
	charsNeededTotal := difficultyChars[theaterDifficulty]
	if charsNeededTotal == 0 {
		charsNeededTotal = 32
	}

	// Get user's characters (include tier)
	charsRaw, _ := rqliteQueryParam("SELECT name, element, level, tier FROM characters WHERE user_id = ?", uid)
	chars := parseRows(charsRaw)

	// Apply gender filter to characters for recommendation
	filteredChars := []map[string]interface{}{}
	for _, c := range chars {
		name := str(c["name"])
		gender := getCharGender(name)
		if preferGender == "all" {
			filteredChars = append(filteredChars, c)
		} else if gender == preferGender {
			filteredChars = append(filteredChars, c)
		} else if preferGender == "female" && includeDefaultMales == 1 && isDefaultMale(name) {
			filteredChars = append(filteredChars, c)
		}
	}

	// Get theater seasons
	seasonsRaw, _ := rqliteQuery("SELECT * FROM theater_seasons ORDER BY date DESC LIMIT 2")
	seasons := parseRows(seasonsRaw)

	// Day of week for domain rotation (0=Sun, 1=Mon...)
	now := time.Now()
	weekday := int(now.Weekday())

	// Day of week for scheduling

	type recommendation struct {
		Category string `json:"category"`
		Title    string `json:"title"`
		Reason   string `json:"reason"`
		Resin    int    `json:"resin"`
		Priority int    `json:"priority"` // 1=highest
		Tier     string `json:"tier,omitempty"`
		Details  []string `json:"details,omitempty"`
	}

	recs := []recommendation{}

	// Build roster status: per-element count of ready characters (level >= 80)
	// Elements needed per difficulty: normal=1 per element, hard=2, transcendence=4
	charsPerElement := map[string]int{
		"normal": 1, "hard": 2, "transcendence": 4,
	}
	neededPerEl := charsPerElement[theaterDifficulty]
	if neededPerEl == 0 {
		neededPerEl = 4
	}

	// Roster status tracking
	type elementStatus struct {
		Have   int `json:"have"`
		Needed int `json:"needed"`
	}
	rosterStatus := map[string]*elementStatus{}

	// Analyze theater prep needs
	for _, season := range seasons {
		elements := strings.Split(str(season["elements"]), ",")
		castStr := str(season["cast_characters"])
		title := str(season["title"])

		// Check which theater characters user has and their levels
		for _, el := range elements {
			el = strings.TrimSpace(el)
			if _, exists := rosterStatus[el]; !exists {
				rosterStatus[el] = &elementStatus{Have: 0, Needed: neededPerEl}
			}

			hasHighLevel := false
			hasAny := false
			highLevelCount := 0
			for _, c := range filteredChars {
				if elementsMatch(str(c["element"]), el) {
					hasAny = true
					if intVal(c["level"]) >= 80 {
						hasHighLevel = true
						highLevelCount++
					}
				}
			}
			rosterStatus[el].Have = highLevelCount

			if !hasAny {
				recs = append(recs, recommendation{
					Category: "환상극",
					Title:    fmt.Sprintf("%s 원소 캐릭터 육성 필요", el),
					Reason:   fmt.Sprintf("%s에 %s 원소가 필요하지만 보유 캐릭터가 없습니다", title, el),
					Resin:    0,
					Priority: 1,
				})
			} else if !hasHighLevel {
				// Find characters below 80 for this element with detailed level-up costs
				type charLevelInfo struct {
					Name  string
					Level int
					Books int
					Resin int
				}
				var charsToLevel []charLevelInfo
				for _, c := range filteredChars {
					if elementsMatch(str(c["element"]), el) && intVal(c["level"]) < 80 {
						lv := intVal(c["level"])
						expNeeded := expToLevel80(lv)
						books := (expNeeded + 19999) / 20000 // 영웅의 지혜 = 20000 EXP
						resin := (books / 4) * 20           // 지맥 1회(20레진) = ~4권
						if resin < 20 { resin = 20 }
						name := str(c["name"])
						charsToLevel = append(charsToLevel, charLevelInfo{name, lv, books, resin})
					}
				}
				details := []string{}
				totalResin := 0
				for _, ci := range charsToLevel {
					details = append(details, fmt.Sprintf("%s Lv.%d→80: 영웅의 지혜 %d개, 지맥 %d 레진", ci.Name, ci.Level, ci.Books, ci.Resin))
					totalResin += ci.Resin
				}
				if totalResin == 0 { totalResin = 40 }
				recs = append(recs, recommendation{
					Category: "환상극",
					Title:    fmt.Sprintf("%s 캐릭터 레벨업 필요 (%d명)", el, len(charsToLevel)),
					Reason:   fmt.Sprintf("%s 대비 — 경험치 지맥 총 %d 레진 필요", title, totalResin),
					Resin:    totalResin,
					Priority: 2,
					Details:  details,
				})
			}
		}

	// Load name dictionary Ko->En mapping
	nameResult, _ := rqliteQuery("SELECT name_en, name_ko FROM character_names")
	koToEn := make(map[string]string)
	enToKo := make(map[string]string)
	for _, row := range parseRows(nameResult) {
		en := strings.ReplaceAll(str(row["name_en"]), " ", "")
		ko := strings.ReplaceAll(str(row["name_ko"]), " ", "")
		koToEn[ko] = en
		enToKo[en] = ko
	}

		// Check if user has the featured cast characters
		castNames := strings.Split(castStr, ",")
		for _, cn := range castNames {
			rawCn := strings.TrimSpace(cn)
			if rawCn == "" {
				continue
			}
			cnStripped := strings.ReplaceAll(rawCn, " ", "")
			cnEn := cnStripped
			if en, ok := koToEn[cnStripped]; ok {
				cnEn = en
			}

			// Apply gender filter to cast recommendations
			cnGender := getCharGender(cnEn)
			if preferGender != "all" && cnGender != preferGender {
				if !(preferGender == "female" && includeDefaultMales == 1 && isDefaultMale(cnEn)) {
					continue
				}
			}
			found := false
			for _, c := range filteredChars {
				cName := strings.ReplaceAll(str(c["name"]), " ", "")
				if cName == cnStripped || cName == cnEn || enToKo[cName] == cnStripped {
					found = true
					break
				}
			}
			if !found {
				recs = append(recs, recommendation{
					Category: "환상극",
					Title:    fmt.Sprintf("출연 캐릭터 %s 미보유", rawCn),
					Reason:   fmt.Sprintf("%s 출연 캐릭터", title),
					Resin:    0,
					Priority: 3,
				})
			}
		}
	}

	// Sort recommendations by tier priority (SS/S first) then by priority number
	for i := 0; i < len(recs); i++ {
		for j := i + 1; j < len(recs); j++ {
			swapNeeded := false
			if recs[i].Priority > recs[j].Priority {
				swapNeeded = true
			} else if recs[i].Priority == recs[j].Priority && recs[i].Tier != "" && recs[j].Tier != "" {
				if getTierPriority(recs[i].Tier) > getTierPriority(recs[j].Tier) {
					swapNeeded = true
				}
			}
			if swapNeeded {
				recs[i], recs[j] = recs[j], recs[i]
			}
		}
	}

	// Calculate characters_needed
	readyCount := 0
	for _, c := range filteredChars {
		if intVal(c["level"]) >= 80 {
			readyCount++
		}
	}
	charactersNeeded := charsNeededTotal - readyCount
	if charactersNeeded < 0 {
		charactersNeeded = 0
	}

	// Daily resin plan (160 resin) — based on optimization results
	dailyPlan := []recommendation{}
	resinLeft := 160

	// Load latest theater + abyss optimization results
	type optMember struct {
		Character map[string]interface{} `json:"character"`
		Score     float64                `json:"score"`
		Weapon    map[string]interface{} `json:"weapon"`
		Improvements []string            `json:"improvements"`
	}
	type optResult struct {
		Members []optMember `json:"members"`
	}
	type taggedMember struct {
		optMember
		Source string // "환상극" or "나선비경"
	}
	var selectedChars []taggedMember

	for _, jobType := range []string{"theater", "abyss"} {
		raw, _ := rqliteQueryParam(
			"SELECT result FROM optimize_jobs WHERE user_id = ? AND type = ? AND status = 'done' ORDER BY finished_at DESC LIMIT 1",
			uid, jobType,
		)
		rows := parseRows(raw)
		if len(rows) > 0 && str(rows[0]["result"]) != "" {
			var res optResult
			json.Unmarshal([]byte(str(rows[0]["result"])), &res)
			src := "환상극"
			if jobType == "abyss" { src = "나선비경" }
			for _, m := range res.Members {
				selectedChars = append(selectedChars, taggedMember{m, src})
			}
		}
	}

	// Deduplicate by character name (keep first = theater priority)
	seen := map[string]bool{}
	var uniqueSelected []taggedMember
	for _, m := range selectedChars {
		name := str(m.Character["name"])
		if name != "" && !seen[name] {
			seen[name] = true
			uniqueSelected = append(uniqueSelected, m)
		}
	}

	// 1. Weekly boss check (Mon-Wed recommended)
	wbY, wbW := now.ISOWeek()
	wbWeek := fmt.Sprintf("%d-W%02d", wbY, wbW)
	wbCountRaw, _ := rqliteQueryParam(
		"SELECT COUNT(*) AS cnt FROM user_weekly_bosses WHERE user_id = ? AND week = ? AND done = 1",
		uid, wbWeek,
	)
	wbDoneCount := getCount(wbCountRaw)
	wbDiscountRemaining := 3 - wbDoneCount
	if wbDiscountRemaining < 0 {
		wbDiscountRemaining = 0
	}
	if weekday >= 1 && weekday <= 3 && wbDiscountRemaining > 0 {
		dailyPlan = append(dailyPlan, recommendation{
			Category: "보스",
			Title:    fmt.Sprintf("주간 보스 처치 (할인 %d회 남음)", wbDiscountRemaining),
			Reason:   "돌파 소재 수급 — 할인 기간 내 처치 권장",
			Resin:    30,
			Priority: 1,
		})
		resinLeft -= 30
	}

	// 2. From optimizer-selected characters, find those needing level-up
	type charNeed struct {
		Name   string
		Level  int
		Books  int
		Source string
	}
	var charsNeedLevel []charNeed
	for _, m := range uniqueSelected {
		lv := intVal(m.Character["level"])
		name := str(m.Character["name"])
		if lv < 80 && name != "" {
			exp := expToLevel80(lv)
			books := (exp + 19999) / 20000
			charsNeedLevel = append(charsNeedLevel, charNeed{name, lv, books, m.Source})
		}
	}

	if len(charsNeedLevel) > 0 && resinLeft >= 20 {
		sort.Slice(charsNeedLevel, func(i, j int) bool { return charsNeedLevel[i].Level < charsNeedLevel[j].Level })
		// Show top 1-2 characters
		for idx := 0; idx < len(charsNeedLevel) && idx < 2 && resinLeft >= 20; idx++ {
			c := charsNeedLevel[idx]
			resinForLeyLine := 60
			if resinForLeyLine > resinLeft {
				resinForLeyLine = (resinLeft / 20) * 20
			}
			booksFromRun := (resinForLeyLine / 20) * 4
			dailyPlan = append(dailyPlan, recommendation{
				Category: "경험치",
				Title:    fmt.Sprintf("[%s] %s Lv.%d→80 육성", c.Source, c.Name, c.Level),
				Reason:   fmt.Sprintf("영웅의 지혜 %d개 부족, 지맥 %d회 = 약 %d개", c.Books, resinForLeyLine/20, booksFromRun),
				Resin:    resinForLeyLine,
				Priority: 1,
			})
			resinLeft -= resinForLeyLine
		}
	}

	// 3. From optimizer-selected characters, find weapons needing level-up
	for _, m := range uniqueSelected {
		if resinLeft < 40 { break }
		if m.Weapon != nil && intVal(m.Weapon["level"]) < 80 {
			wpName := str(m.Weapon["name"])
			wpLevel := intVal(m.Weapon["level"])
			charName := str(m.Character["name"])
			if wpName != "" {
				dailyPlan = append(dailyPlan, recommendation{
					Category: "무기",
					Title:    fmt.Sprintf("[%s] %s의 무기 돌파 소재", m.Source, charName),
					Reason:   fmt.Sprintf("%s Lv.%d → 무기 소재 비경", wpName, wpLevel),
					Resin:    40,
					Priority: 2,
				})
				resinLeft -= 40
				break
			}
		}
	}

	// 4. From optimizer-selected characters, recommend artifact farming
	if resinLeft >= 40 {
		for _, m := range uniqueSelected {
			charName := str(m.Character["name"])
			if sets, ok := characterBestSets[charName]; ok && len(sets) > 0 {
				setKo := sets[0]
				if ko, ok2 := artifactSetKoreanNames[sets[0]]; ok2 {
					setKo = ko
				}
				dailyPlan = append(dailyPlan, recommendation{
					Category: "성유물",
					Title:    fmt.Sprintf("[%s] %s 성유물 파밍", m.Source, charName),
					Reason:   fmt.Sprintf("%s 세트 비경", setKo),
					Resin:    40,
					Priority: 3,
				})
				resinLeft -= 40
				break
			}
		}
	}

	// 5. No optimization results → prompt to run optimizer
	if len(uniqueSelected) == 0 {
		dailyPlan = append(dailyPlan, recommendation{
			Category: "최적화",
			Title:    "환상극/나선비경 최적화를 먼저 실행하세요",
			Reason:   "최적화 결과를 기반으로 구체적인 파밍 계획을 세울 수 있습니다",
			Resin:    0,
			Priority: 1,
		})
	}

	// 6. Fill remaining with mora ley line
	if resinLeft > 0 {
		dailyPlan = append(dailyPlan, recommendation{
			Category: "모라",
			Title:    "지맥 — 모라",
			Reason:   fmt.Sprintf("남은 레진 %d 소진 — 육성에 필요한 모라 수급", resinLeft),
			Resin:    resinLeft,
			Priority: 4,
		})
	}

	// Weekly BP missions
	bpY, bpW := now.ISOWeek()
	week := fmt.Sprintf("%d-W%02d", bpY, bpW)
	bpRaw, _ := rqliteQueryParam("SELECT COUNT(*) AS cnt FROM bp_missions WHERE user_id = ? AND week = ?", uid, week)
	if getCount(bpRaw) == 0 {
		seedBPMissions(uid, week)
	}
	bpResult, _ := rqliteQueryParam("SELECT * FROM bp_missions WHERE user_id = ? AND week = ? ORDER BY id", uid, week)
	bpMissions := parseRows(bpResult)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"theater_prep":     recs,
		"daily_plan":       dailyPlan,
		"resin_total":      160,
		"weekday":          weekday,
		"bp_missions":      bpMissions,
		"characters_needed": charactersNeeded,
		"roster_status":    rosterStatus,
		"difficulty":       theaterDifficulty,
		"prefer_gender":    preferGender,
	})
}

// --- Abyss Handlers ---

func handleAbyssSeasons(w http.ResponseWriter, r *http.Request) {
	result, err := rqliteQuery("SELECT * FROM abyss_seasons ORDER BY id DESC")
	writeResult(w, result, err)
}

// handleAbyssOptimize is the quick synchronous version (greedy).
// The async DFS version with pruning is available via POST /api/optimize/start.
func handleAbyssOptimize(w http.ResponseWriter, r *http.Request) {
	uid := getUserID(r)

	// --- (a) Read all user data ---
	charsRaw, _ := rqliteQueryParam("SELECT * FROM characters WHERE user_id = ?", uid)
	artsRaw, _ := rqliteQueryParam("SELECT * FROM artifacts WHERE user_id = ?", uid)
	weapRaw, _ := rqliteQueryParam("SELECT * FROM weapons WHERE user_id = ?", uid)

	chars := parseRows(charsRaw)
	arts := parseRows(artsRaw)
	weaps := parseRows(weapRaw)

	// Get latest abyss season
	seasonRaw, _ := rqliteQuery("SELECT * FROM abyss_seasons ORDER BY id DESC LIMIT 1")
	seasons := parseRows(seasonRaw)
	if len(seasons) == 0 {
		http.Error(w, `{"error":"no abyss season data"}`, 404)
		return
	}
	season := seasons[0]

	// Parse floor12_data
	type halfData struct {
		Enemies  []string `json:"enemies"`
		Elements []string `json:"elements"`
	}
	type chamberData struct {
		Chamber    int      `json:"chamber"`
		FirstHalf  halfData `json:"first_half"`
		SecondHalf halfData `json:"second_half"`
	}
	type floor12Data struct {
		Chambers []chamberData `json:"chambers"`
	}
	var floor12 floor12Data
	json.Unmarshal([]byte(str(season["floor12_data"])), &floor12)

	// Collect all recommended elements per half across all chambers
	firstHalfElements := map[string]bool{}
	secondHalfElements := map[string]bool{}
	for _, ch := range floor12.Chambers {
		for _, el := range ch.FirstHalf.Elements {
			firstHalfElements[el] = true
		}
		for _, el := range ch.SecondHalf.Elements {
			secondHalfElements[el] = true
		}
	}

	// --- (b) Scoring function ---
	type scoredChar struct {
		Data         map[string]interface{}
		Score        float64
		WeaponData   map[string]interface{}
		ArtifactData []map[string]interface{}
	}

	scoredChars := []scoredChar{}
	for _, c := range chars {
		charName := str(c["name"])
		level := intVal(c["level"])

		// Base score from character level (exponential scaling)
		baseScore := float64(level) * float64(level) * 1.5

		// Weapon score (rarity-weighted + recommendation bonus)
		var matchedWeapon map[string]interface{}
		for _, wp := range weaps {
			if str(wp["equipped_by"]) == charName {
				matchedWeapon = wp
				break
			}
		}
		weaponScore := calculateWeaponScore(charName, matchedWeapon)

		// Artifact score (5 slots, total levels up to 100)
		var artifactScore float64
		var totalArtifactLevels float64
		charArtifacts := []map[string]interface{}{}
		for _, a := range arts {
			if str(a["equipped_by"]) == charName {
				totalArtifactLevels += float64(intVal(a["level"]))
				charArtifacts = append(charArtifacts, a)
			}
		}
		artifactScore = totalArtifactLevels * totalArtifactLevels * 0.3
		setBonus := calculateSetBonus(charName, charArtifacts)

		// Stat-based scoring (actual combat stats)
		atk := floatVal(c["atk"])
		critRate := floatVal(c["crit_rate"])
		critDmg := floatVal(c["crit_dmg"])
		er := floatVal(c["energy_recharge"])
		em := floatVal(c["elemental_mastery"])
		statScore := atk*0.5 + (critRate*critDmg/100.0)*5.0 + er*0.2 + em*0.1

		consScore := constellationScore(charName, intVal(c["constellation"]))
		totalScore := baseScore + weaponScore + artifactScore + setBonus + statScore + consScore

		scoredChars = append(scoredChars, scoredChar{
			Data:         c,
			Score:        totalScore,
			WeaponData:   matchedWeapon,
			ArtifactData: charArtifacts,
		})
	}

	// Sort by score descending
	for i := 0; i < len(scoredChars); i++ {
		for j := i + 1; j < len(scoredChars); j++ {
			if scoredChars[j].Score > scoredChars[i].Score {
				scoredChars[i], scoredChars[j] = scoredChars[j], scoredChars[i]
			}
		}
	}

	// --- (c) Team optimization (greedy assignment) ---
	used := map[int]bool{}

	pickTeam := func(recommendedElements map[string]bool) []scoredChar {
		team := []scoredChar{}
		// First pass: pick characters matching recommended elements
		for idx, sc := range scoredChars {
			if used[idx] || len(team) >= 4 {
				continue
			}
			charElement := str(sc.Data["element"])
			for el := range recommendedElements {
				if elementsMatch(charElement, el) {
					team = append(team, sc)
					used[idx] = true
					break
				}
			}
		}
		// Second pass: fill remaining slots with highest score
		for idx, sc := range scoredChars {
			if used[idx] || len(team) >= 4 {
				continue
			}
			team = append(team, sc)
			used[idx] = true
		}
		return team
	}

	firstHalfTeam := pickTeam(firstHalfElements)
	secondHalfTeam := pickTeam(secondHalfElements)

	// --- (c2) Resonance swap: try swapping an unused char into each team if it gains resonance ---
	tryResonanceSwap := func(team []scoredChar) []scoredChar {
		teamElements := []string{}
		for _, sc := range team {
			teamElements = append(teamElements, str(sc.Data["element"]))
		}
		_, currentRes := calculateResonanceBonus(teamElements)
		if currentRes > 0 {
			return team // already has resonance
		}
		bestGain := 0.0
		bestSwapIn := -1
		bestSwapOut := -1
		for ui, usc := range scoredChars {
			if used[ui] {
				continue
			}
			for ti := range team {
				// Try swapping usc into position ti
				trial := make([]string, len(team))
				for k, sc := range team {
					trial[k] = str(sc.Data["element"])
				}
				trial[ti] = str(usc.Data["element"])
				_, newRes := calculateResonanceBonus(trial)
				scoreLoss := team[ti].Score - usc.Score
				gain := newRes - scoreLoss
				if newRes > 0 && gain > bestGain {
					bestGain = gain
					bestSwapIn = ui
					bestSwapOut = ti
				}
			}
		}
		if bestSwapIn >= 0 && bestSwapOut >= 0 {
			// Find the index of the swapped-out char in scoredChars and unmark it
			swappedOutName := str(team[bestSwapOut].Data["name"])
			for idx := range scoredChars {
				if str(scoredChars[idx].Data["name"]) == swappedOutName && used[idx] {
					used[idx] = false
					break
				}
			}
			used[bestSwapIn] = true
			team[bestSwapOut] = scoredChars[bestSwapIn]
		}
		return team
	}
	firstHalfTeam = tryResonanceSwap(firstHalfTeam)
	secondHalfTeam = tryResonanceSwap(secondHalfTeam)

	// --- (d) Artifact optimization ---
	type artifactRec struct {
		Slot     string                 `json:"slot"`
		Current  map[string]interface{} `json:"current,omitempty"`
		Suggest  map[string]interface{} `json:"suggest,omitempty"`
		Reason   string                 `json:"reason"`
	}

	// Collect unequipped artifacts
	unequippedArts := []map[string]interface{}{}
	for _, a := range arts {
		if str(a["equipped_by"]) == "" {
			unequippedArts = append(unequippedArts, a)
		}
	}

	scoreArtifactForChar := func(a map[string]interface{}, charName string) float64 {
		score := 0.0
		mainStat := str(a["main_stat_type"])
		// Simple main stat match scoring
		if strings.Contains(strings.ToLower(mainStat), "atk") {
			score += 100
		} else if strings.Contains(strings.ToLower(mainStat), "hp") {
			score += 100
		}
		// Substat scoring
		for i := 1; i <= 4; i++ {
			subName := str(a[fmt.Sprintf("sub%d_name", i)])
			subRolls := intVal(a[fmt.Sprintf("sub%d_rolls", i)])
			if subRolls == 0 {
				subRolls = 1
			}
			if strings.Contains(strings.ToLower(subName), "crit") && strings.Contains(strings.ToLower(subName), "rate") {
				score += 50.0 * float64(subRolls)
			} else if strings.Contains(strings.ToLower(subName), "crit") && strings.Contains(strings.ToLower(subName), "dmg") {
				score += 50.0 * float64(subRolls)
			}
		}
		// Set bonus consideration
		score += 30
		return score
	}

	artifactSlots := []string{"flower", "plume", "sands", "goblet", "circlet"}

	optimizeArtifacts := func(sc scoredChar) []artifactRec {
		recs := []artifactRec{}
		charName := str(sc.Data["name"])
		equippedSlots := map[string]map[string]interface{}{}
		for _, a := range sc.ArtifactData {
			equippedSlots[strings.ToLower(str(a["slot"]))] = a
		}

		for _, slot := range artifactSlots {
			current := equippedSlots[slot]
			bestScore := 0.0
			var bestArt map[string]interface{}
			for _, ua := range unequippedArts {
				if strings.ToLower(str(ua["slot"])) != slot {
					continue
				}
				s := scoreArtifactForChar(ua, charName)
				if s > bestScore {
					bestScore = s
					bestArt = ua
				}
			}
			if bestArt != nil {
				recs = append(recs, artifactRec{
					Slot:    slot,
					Current: current,
					Suggest: bestArt,
					Reason:  fmt.Sprintf("점수 %.0f (미장착 성유물 중 최고)", bestScore),
				})
			}
		}
		return recs
	}

	// --- (e) Improvement recommendations ---
	type improvement struct {
		Text string `json:"text"`
	}

	getImprovements := func(sc scoredChar, recommendedElements map[string]bool) []string {
		imps := []string{}
		level := intVal(sc.Data["level"])
		if level < 80 {
			imps = append(imps, "캐릭터 레벨업 필요")
		}
		if sc.WeaponData != nil && intVal(sc.WeaponData["level"]) < 80 {
			imps = append(imps, "무기 레벨업 필요")
		}
		if sc.WeaponData == nil {
			imps = append(imps, "무기 장착 필요")
		}
		// Check empty artifact slots
		equippedSlots := map[string]bool{}
		for _, a := range sc.ArtifactData {
			equippedSlots[strings.ToLower(str(a["slot"]))] = true
		}
		for _, slot := range artifactSlots {
			if !equippedSlots[slot] {
				imps = append(imps, fmt.Sprintf("성유물 파밍 필요 (%s)", slot))
			}
		}
		// Average artifact level
		if len(sc.ArtifactData) > 0 {
			totalLevel := 0
			for _, a := range sc.ArtifactData {
				totalLevel += intVal(a["level"])
			}
			avg := totalLevel / len(sc.ArtifactData)
			if avg < 16 {
				imps = append(imps, "성유물 강화 필요")
			}
		}
		return imps
	}

	// Build response members
	type memberResponse struct {
		Character    map[string]interface{} `json:"character"`
		Score        float64                `json:"score"`
		Weapon       map[string]interface{} `json:"weapon"`
		Artifacts    []map[string]interface{} `json:"artifacts"`
		Improvements []string               `json:"improvements"`
		ArtifactRecs []artifactRec          `json:"artifact_recommendations,omitempty"`
	}

	type teamResponse struct {
		Members         []memberResponse `json:"members"`
		TeamScore       float64          `json:"team_score"`
		ElementCoverage []string         `json:"element_coverage"`
		Resonance       string           `json:"resonance"`
		Moonlight       string           `json:"moonlight,omitempty"`
	}

	buildTeamResponse := func(team []scoredChar, recElements map[string]bool) teamResponse {
		members := []memberResponse{}
		teamScore := 0.0
		elements := []string{}
		teamElements := []string{}
		teamNames := []string{}

		for _, sc := range team {
			imps := getImprovements(sc, recElements)
			artRecs := optimizeArtifacts(sc)
			members = append(members, memberResponse{
				Character:    sc.Data,
				Score:        sc.Score,
				Weapon:       sc.WeaponData,
				Artifacts:    sc.ArtifactData,
				Improvements: imps,
				ArtifactRecs: artRecs,
			})
			teamScore += sc.Score
			el := str(sc.Data["element"])
			if el != "" {
				teamElements = append(teamElements, el)
				found := false
				for _, e := range elements {
					if e == el {
						found = true
						break
					}
				}
				if !found {
					elements = append(elements, el)
				}
			}
			teamNames = append(teamNames, str(sc.Data["name"]))
		}

		// Resonance bonus
		resName, resScore := calculateResonanceBonus(teamElements)
		resonance := ""
		if resName != "" {
			resonance = fmt.Sprintf("%s (+%.0f)", resName, resScore)
			teamScore += resScore
		}

		// Moonlight bonus
		moonName, moonScore := calculateMoonlightBonus(teamNames)
		moonlight := ""
		if moonName != "" {
			moonlight = fmt.Sprintf("%s (+%.0f)", moonName, moonScore)
			teamScore += moonScore
		}

		// Check missing elements
		for el := range recElements {
			found := false
			for _, sc := range team {
				if elementsMatch(str(sc.Data["element"]), el) {
					found = true
					break
				}
			}
			if !found {
				if len(members) > 0 {
					members[0].Improvements = append(members[0].Improvements, fmt.Sprintf("원소 부족 - %s 캐릭터 육성 필요", el))
				}
			}
		}

		return teamResponse{
			Members:         members,
			TeamScore:       teamScore,
			ElementCoverage: elements,
			Resonance:       resonance,
			Moonlight:       moonlight,
		}
	}

	firstHalf := buildTeamResponse(firstHalfTeam, firstHalfElements)
	secondHalf := buildTeamResponse(secondHalfTeam, secondHalfElements)

	// --- Overall recommendations ---
	type overallRec struct {
		Priority int    `json:"priority"`
		Title    string `json:"title"`
		Reason   string `json:"reason"`
	}
	overallRecs := []overallRec{}
	priority := 1

	// Gather all improvements as overall recommendations
	allTeams := []teamResponse{firstHalf, secondHalf}
	halfNames := []string{"전반", "후반"}
	for hi, tr := range allTeams {
		for _, m := range tr.Members {
			charName := str(m.Character["name"])
			for _, imp := range m.Improvements {
				overallRecs = append(overallRecs, overallRec{
					Priority: priority,
					Title:    fmt.Sprintf("%s %s", charName, imp),
					Reason:   fmt.Sprintf("%s팀 최적화", halfNames[hi]),
				})
				priority++
			}
		}
	}

	// --- (f) Response ---
	overallScore := firstHalf.TeamScore + secondHalf.TeamScore

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"season": map[string]interface{}{
			"period":   str(season["period"]),
			"blessing": str(season["blessing"]),
		},
		"teams": map[string]interface{}{
			"first_half":  firstHalf,
			"second_half": secondHalf,
		},
		"overall_score":   overallScore,
		"recommendations": overallRecs,
	})
}

// --- Gap Analysis ---

type improvementOption struct {
	Action     string  `json:"action"`
	Target     string  `json:"target"`
	Detail     string  `json:"detail"`
	ScoreGain  float64 `json:"score_gain"`
	ResinCost  int     `json:"resin_cost"`
	PrimoCost  int     `json:"primo_cost"`
	Efficiency float64 `json:"efficiency"`
	Category   string  `json:"category"`
}

func handleAbyssGapAnalysis(w http.ResponseWriter, r *http.Request) {
	uid := getUserID(r)

	// --- (a) Read all user data ---
	charsRaw, _ := rqliteQueryParam("SELECT * FROM characters WHERE user_id = ?", uid)
	artsRaw, _ := rqliteQueryParam("SELECT * FROM artifacts WHERE user_id = ?", uid)
	weapRaw, _ := rqliteQueryParam("SELECT * FROM weapons WHERE user_id = ?", uid)

	chars := parseRows(charsRaw)
	arts := parseRows(artsRaw)
	weaps := parseRows(weapRaw)

	// Get latest abyss season
	seasonRaw, _ := rqliteQuery("SELECT * FROM abyss_seasons ORDER BY id DESC LIMIT 1")
	seasons := parseRows(seasonRaw)
	if len(seasons) == 0 {
		http.Error(w, `{"error":"no abyss season data"}`, 404)
		return
	}
	season := seasons[0]

	// Parse floor12_data
	type halfData struct {
		Enemies  []string `json:"enemies"`
		Elements []string `json:"elements"`
	}
	type chamberData struct {
		Chamber    int      `json:"chamber"`
		FirstHalf  halfData `json:"first_half"`
		SecondHalf halfData `json:"second_half"`
	}
	type floor12Data struct {
		Chambers []chamberData `json:"chambers"`
	}
	var floor12 floor12Data
	json.Unmarshal([]byte(str(season["floor12_data"])), &floor12)

	// Collect recommended elements per half
	firstHalfElements := map[string]bool{}
	secondHalfElements := map[string]bool{}
	for _, ch := range floor12.Chambers {
		for _, el := range ch.FirstHalf.Elements {
			firstHalfElements[el] = true
		}
		for _, el := range ch.SecondHalf.Elements {
			secondHalfElements[el] = true
		}
	}

	// --- (b) Score characters (same as handleAbyssOptimize) ---
	type scoredChar struct {
		Data         map[string]interface{}
		Score        float64
		WeaponData   map[string]interface{}
		ArtifactData []map[string]interface{}
	}

	scoredChars := []scoredChar{}
	for _, c := range chars {
		charName := str(c["name"])
		level := intVal(c["level"])
		// Base score from character level (exponential scaling)
		baseScore := float64(level) * float64(level) * 1.5

		// Weapon score (rarity-weighted + recommendation bonus)
		var matchedWeapon map[string]interface{}
		for _, wp := range weaps {
			if str(wp["equipped_by"]) == charName {
				matchedWeapon = wp
				break
			}
		}
		weaponScore := calculateWeaponScore(charName, matchedWeapon)

		// Artifact score (5 slots, total levels up to 100)
		var artifactScore float64
		var totalArtifactLevels float64
		charArtifacts := []map[string]interface{}{}
		for _, a := range arts {
			if str(a["equipped_by"]) == charName {
				totalArtifactLevels += float64(intVal(a["level"]))
				charArtifacts = append(charArtifacts, a)
			}
		}
		artifactScore = totalArtifactLevels * totalArtifactLevels * 0.3
		setBonus := calculateSetBonus(charName, charArtifacts)

		// Stat-based scoring (actual combat stats)
		atk := floatVal(c["atk"])
		critRate := floatVal(c["crit_rate"])
		critDmg := floatVal(c["crit_dmg"])
		er := floatVal(c["energy_recharge"])
		em := floatVal(c["elemental_mastery"])
		statScore := atk*0.5 + (critRate*critDmg/100.0)*5.0 + er*0.2 + em*0.1

		consScore := constellationScore(charName, intVal(c["constellation"]))
		totalScore := baseScore + weaponScore + artifactScore + setBonus + statScore + consScore

		scoredChars = append(scoredChars, scoredChar{
			Data:         c,
			Score:        totalScore,
			WeaponData:   matchedWeapon,
			ArtifactData: charArtifacts,
		})
	}

	// Sort by score descending
	sort.Slice(scoredChars, func(i, j int) bool {
		return scoredChars[i].Score > scoredChars[j].Score
	})

	// --- (c) Greedy team assignment (same as handleAbyssOptimize) ---
	used := map[int]bool{}

	pickTeam := func(recommendedElements map[string]bool) []scoredChar {
		team := []scoredChar{}
		for idx, sc := range scoredChars {
			if used[idx] || len(team) >= 4 {
				continue
			}
			charElement := str(sc.Data["element"])
			for el := range recommendedElements {
				if elementsMatch(charElement, el) {
					team = append(team, sc)
					used[idx] = true
					break
				}
			}
		}
		for idx, sc := range scoredChars {
			if used[idx] || len(team) >= 4 {
				continue
			}
			team = append(team, sc)
			used[idx] = true
		}
		return team
	}

	firstHalfTeam := pickTeam(firstHalfElements)
	secondHalfTeam := pickTeam(secondHalfElements)

	// Calculate team scores (including resonance and moonlight bonuses)
	calcTeamScore := func(team []scoredChar) (float64, string, string) {
		total := 0.0
		teamElements := []string{}
		teamNames := []string{}
		for _, sc := range team {
			total += sc.Score
			el := str(sc.Data["element"])
			if el != "" {
				teamElements = append(teamElements, el)
			}
			teamNames = append(teamNames, str(sc.Data["name"]))
		}
		resName, resScore := calculateResonanceBonus(teamElements)
		moonName, moonScore := calculateMoonlightBonus(teamNames)
		total += resScore + moonScore
		resonance := ""
		if resName != "" {
			resonance = fmt.Sprintf("%s (+%.0f)", resName, resScore)
		}
		moonlight := ""
		if moonName != "" {
			moonlight = fmt.Sprintf("%s (+%.0f)", moonName, moonScore)
		}
		return total, resonance, moonlight
	}

	firstHalfScore, firstResonance, firstMoonlight := calcTeamScore(firstHalfTeam)
	secondHalfScore, secondResonance, secondMoonlight := calcTeamScore(secondHalfTeam)

	// --- (d) Generate improvement options per half ---
	artifactSlots := []string{"flower", "plume", "sands", "goblet", "circlet"}
	slotNameKo := map[string]string{
		"flower": "꽃", "plume": "깃털", "sands": "모래시계", "goblet": "성배", "circlet": "왕관",
	}

	generateImprovements := func(team []scoredChar, recElements map[string]bool) []improvementOption {
		options := []improvementOption{}

		for _, sc := range team {
			charName := str(sc.Data["name"])
			level := intVal(sc.Data["level"])

			// Character level-up options (quadratic scaling: level*level*1.5)
			if level < 70 {
				// gain = 70*70*1.5 - level*level*1.5
				gain := 70.0*70.0*1.5 - float64(level)*float64(level)*1.5
				cost := resinCost["char_1_70"]
				options = append(options, improvementOption{
					Action:     "캐릭터 레벨업",
					Target:     charName,
					Detail:     fmt.Sprintf("Lv.%d→70", level),
					ScoreGain:  gain,
					ResinCost:  cost,
					PrimoCost:  0,
					Efficiency: gain / float64(cost),
					Category:   "레진",
				})
			} else if level >= 70 && level < 80 {
				// gain = 80*80*1.5 - 70*70*1.5 = 9600 - 7350 = 2250
				gain := 80.0*80.0*1.5 - float64(level)*float64(level)*1.5
				cost := resinCost["char_70_80"]
				options = append(options, improvementOption{
					Action:     "캐릭터 레벨업",
					Target:     charName,
					Detail:     "Lv.70→80",
					ScoreGain:  gain,
					ResinCost:  cost,
					PrimoCost:  0,
					Efficiency: gain / float64(cost),
					Category:   "레진",
				})
			} else if level >= 80 && level < 90 {
				// gain = 90*90*1.5 - 80*80*1.5 = 12150 - 9600 = 2550
				gain := 90.0*90.0*1.5 - float64(level)*float64(level)*1.5
				cost := resinCost["char_80_90"]
				options = append(options, improvementOption{
					Action:     "캐릭터 레벨업",
					Target:     charName,
					Detail:     "Lv.80→90",
					ScoreGain:  gain,
					ResinCost:  cost,
					PrimoCost:  0,
					Efficiency: gain / float64(cost),
					Category:   "레진",
				})
			}

			// Weapon options (quadratic scaling: level*level*0.8)
			if sc.WeaponData == nil {
				// No weapon -> Lv.80 weapon: 80*80*0.8 = 5120
				gain := 80.0 * 80.0 * 0.8
				cost := resinCost["weapon_1_80"]
				options = append(options, improvementOption{
					Action:     "무기 교체",
					Target:     charName,
					Detail:     "4성 무기 제작 + Lv.80",
					ScoreGain:  gain,
					ResinCost:  cost,
					PrimoCost:  0,
					Efficiency: gain / float64(cost),
					Category:   "레진",
				})
			} else {
				wLevel := intVal(sc.WeaponData["level"])
				if wLevel < 80 {
					// gain = 80*80*0.8 - wLevel*wLevel*0.8
					gain := 80.0*80.0*0.8 - float64(wLevel)*float64(wLevel)*0.8
					cost := resinCost["weapon_1_80"]
					options = append(options, improvementOption{
						Action:     "무기 레벨업",
						Target:     charName,
						Detail:     fmt.Sprintf("무기 Lv.%d→80", wLevel),
						ScoreGain:  gain,
						ResinCost:  cost,
						PrimoCost:  0,
						Efficiency: gain / float64(cost),
						Category:   "레진",
					})
				} else if wLevel >= 80 && wLevel < 90 {
					// gain = 90*90*0.8 - wLevel*wLevel*0.8
					gain := 90.0*90.0*0.8 - float64(wLevel)*float64(wLevel)*0.8
					cost := resinCost["weapon_80_90"]
					options = append(options, improvementOption{
						Action:     "무기 레벨업",
						Target:     charName,
						Detail:     "무기 Lv.80→90",
						ScoreGain:  gain,
						ResinCost:  cost,
						PrimoCost:  0,
						Efficiency: gain / float64(cost),
						Category:   "레진",
					})
				}
			}

			// Artifact options
			equippedSlots := map[string]map[string]interface{}{}
			for _, a := range sc.ArtifactData {
				equippedSlots[strings.ToLower(str(a["slot"]))] = a
			}

			// Calculate current total artifact levels for this character
			currentTotalArtLevels := 0.0
			for _, a := range sc.ArtifactData {
				currentTotalArtLevels += float64(intVal(a["level"]))
			}

			for _, slot := range artifactSlots {
				slotKo := slotNameKo[slot]
				current, hasSlot := equippedSlots[slot]
				if !hasSlot {
					// Empty slot: farm a new +20 artifact
					// gain = (currentTotal+20)^2*0.3 - currentTotal^2*0.3
					newTotal := currentTotalArtLevels + 20.0
					gain := newTotal*newTotal*0.3 - currentTotalArtLevels*currentTotalArtLevels*0.3
					cost := resinCost["artifact_0_20"]
					options = append(options, improvementOption{
						Action:     "성유물 파밍",
						Target:     charName,
						Detail:     fmt.Sprintf("%s 파밍 + 강화", slotKo),
						ScoreGain:  gain,
						ResinCost:  cost,
						PrimoCost:  0,
						Efficiency: gain / float64(cost),
						Category:   "레진",
					})
				} else {
					artLevel := intVal(current["level"])
					if artLevel < 16 {
						// gain from leveling this piece to +16
						levelGain := 16.0 - float64(artLevel)
						newTotal := currentTotalArtLevels + levelGain
						gain := newTotal*newTotal*0.3 - currentTotalArtLevels*currentTotalArtLevels*0.3
						cost := resinCost["artifact_0_16"]
						options = append(options, improvementOption{
							Action:     "성유물 강화",
							Target:     charName,
							Detail:     fmt.Sprintf("%s +%d→+16", slotKo, artLevel),
							ScoreGain:  gain,
							ResinCost:  cost,
							PrimoCost:  0,
							Efficiency: gain / float64(cost),
							Category:   "레진",
						})
					} else if artLevel >= 16 && artLevel < 20 {
						// gain from leveling this piece to +20
						levelGain := 20.0 - float64(artLevel)
						newTotal := currentTotalArtLevels + levelGain
						gain := newTotal*newTotal*0.3 - currentTotalArtLevels*currentTotalArtLevels*0.3
						cost := resinCost["artifact_16_20"]
						options = append(options, improvementOption{
							Action:     "성유물 강화",
							Target:     charName,
							Detail:     fmt.Sprintf("%s +%d→+20", slotKo, artLevel),
							ScoreGain:  gain,
							ResinCost:  cost,
							PrimoCost:  0,
							Efficiency: gain / float64(cost),
							Category:   "레진",
						})
					}
				}
			}

			// Check artifact set bonus (count pieces per set)
			setCount := map[string]int{}
			for _, a := range sc.ArtifactData {
				sn := str(a["set_name"])
				if sn != "" {
					setCount[sn]++
				}
			}
			has4pc := false
			hasRecommended4pc := false
			bestSets := characterBestSets[charName]
			for sn, cnt := range setCount {
				if cnt >= 4 {
					has4pc = true
					for _, bs := range bestSets {
						if sn == bs {
							hasRecommended4pc = true
							break
						}
					}
					break
				}
			}
			if !has4pc && len(sc.ArtifactData) > 0 {
				gain := 2500.0
				if len(bestSets) > 0 {
					gain = 3750.0 // recommended set 4pc = 2500 * 1.5
				}
				cost := resinCost["artifact_set_5pc"]
				options = append(options, improvementOption{
					Action:     "성유물 파밍",
					Target:     charName,
					Detail:     "4세트 효과 맞추기",
					ScoreGain:  gain,
					ResinCost:  cost,
					PrimoCost:  0,
					Efficiency: gain / float64(cost),
					Category:   "레진",
				})
			} else if has4pc && !hasRecommended4pc && len(bestSets) > 0 {
				gain := 1250.0 // switching from generic 4pc (2500) to recommended (3750)
				cost := resinCost["artifact_set_5pc"]
				options = append(options, improvementOption{
					Action:     "성유물 파밍",
					Target:     charName,
					Detail:     "추천 세트로 변경 (" + func() string {
					if kr, ok := artifactSetKoreanNames[bestSets[0]]; ok {
						return kr
					}
					return bestSets[0]
				}() + ")",
					ScoreGain:  gain,
					ResinCost:  cost,
					PrimoCost:  0,
					Efficiency: gain / float64(cost),
					Category:   "레진",
				})
			}

			// Talent options (estimate based on level)
			if level >= 70 {
				gain := 1000.0
				cost := resinCost["talent_1_6"] + resinCost["talent_6_8"]
				options = append(options, improvementOption{
					Action:     "특성 레벨업",
					Target:     charName,
					Detail:     "주요 특성 1→8",
					ScoreGain:  gain,
					ResinCost:  cost,
					PrimoCost:  0,
					Efficiency: gain / float64(cost),
					Category:   "레진",
				})
			}

			// --- Constellation recommendations ---
			charCons := intVal(sc.Data["constellation"])
			if breakpoints, ok := constellationKeyBreakpoints[charName]; ok {
				for level, bonus := range breakpoints {
					if charCons < level {
						cost := primoCost["char_4star"]
						costLabel := "4성"
						fiveStarBreakpointChars := map[string]bool{
							"Raiden Shogun": true, "Nahida": true, "Yelan": true,
							"Furina": true, "Hu Tao": true, "Neuvillette": true,
							"Ganyu": true, "Xiao": true, "Ayaka": true,
						}
						if fiveStarBreakpointChars[charName] {
							cost = primoCost["char_5star"]
							costLabel = "5성"
						}
						consNeeded := level - charCons
						totalCost := cost * consNeeded
						gain := bonus
						options = append(options, improvementOption{
							Action:     "돌파 (명함)",
							Target:     charName,
							Detail:     fmt.Sprintf("C%d→C%d (%s, 약 %d 원석)", charCons, level, costLabel, totalCost),
							ScoreGain:  gain,
							ResinCost:  0,
							PrimoCost:  totalCost,
							Efficiency: gain / float64(totalCost/10),
							Category:   "원석",
						})
					}
				}
			}
		}

		// --- Element gap detection ---
		for el := range recElements {
			found := false
			for _, sc := range team {
				if elementsMatch(str(sc.Data["element"]), el) {
					found = true
					break
				}
			}
			if !found {
				// Check if user has any character of this element (not in team)
				elKo := el
				if en, ok := elementEnToKo[el]; ok {
					elKo = en
				}
				var bestUnused *scoredChar
				for i := range scoredChars {
					sc := &scoredChars[i]
					if elementsMatch(str(sc.Data["element"]), el) {
						bestUnused = sc
						break
					}
				}
				if bestUnused != nil {
					unusedLevel := intVal(bestUnused.Data["level"])
					charName := str(bestUnused.Data["name"])
					if unusedLevel < 70 {
						// gain = 70*70*1.5 - unusedLevel*unusedLevel*1.5
						gain := 70.0*70.0*1.5 - float64(unusedLevel)*float64(unusedLevel)*1.5
						cost := resinCost["char_1_70"]
						options = append(options, improvementOption{
							Action:     "캐릭터 레벨업",
							Target:     charName,
							Detail:     fmt.Sprintf("4성 %s를 육성하면 %s 원소 해결 (Lv.%d→70)", charName, elKo, unusedLevel),
							ScoreGain:  gain,
							ResinCost:  cost,
							PrimoCost:  0,
							Efficiency: gain / float64(cost),
							Category:   "무료",
						})
					}
				} else {
					// No character of this element exists at all
					// Lv.70 character from scratch: 70*70*1.5 = 7350
					gain := 70.0 * 70.0 * 1.5
					options = append(options, improvementOption{
						Action:     "캐릭터 뽑기",
						Target:     elKo + " 원소 캐릭터",
						Detail:     fmt.Sprintf("%s 원소 캐릭터 확보 필요 (약 12,000 원석)", elKo),
						ScoreGain:  gain,
						ResinCost:  resinCost["char_1_70"],
						PrimoCost:  primoCost["char_5star"],
						Efficiency: gain / float64(resinCost["char_1_70"]+primoCost["char_5star"]/10),
						Category:   "원석",
					})
				}
			}
		}

		// Sort by efficiency descending
		sort.Slice(options, func(i, j int) bool {
			return options[i].Efficiency > options[j].Efficiency
		})

		return options
	}

	firstHalfImprovements := generateImprovements(firstHalfTeam, firstHalfElements)
	secondHalfImprovements := generateImprovements(secondHalfTeam, secondHalfElements)

	// --- (e) Calculate minimum plan to close gap ---
	type halfPlan struct {
		Improvements []improvementOption `json:"improvements"`
		MinimumPlan  []int               `json:"minimum_plan"`
		TotalResin   int                 `json:"total_resin"`
		TotalPrimo   int                 `json:"total_primo"`
	}

	buildPlan := func(improvements []improvementOption, gap float64) halfPlan {
		plan := halfPlan{
			Improvements: improvements,
			MinimumPlan:  []int{},
			TotalResin:   0,
			TotalPrimo:   0,
		}
		if gap <= 0 {
			return plan
		}
		remaining := gap
		for i, imp := range improvements {
			if remaining <= 0 {
				break
			}
			plan.MinimumPlan = append(plan.MinimumPlan, i)
			plan.TotalResin += imp.ResinCost
			plan.TotalPrimo += imp.PrimoCost
			remaining -= imp.ScoreGain
		}
		return plan
	}

	firstGap := float64(abyssClearThreshold) - firstHalfScore
	secondGap := float64(abyssClearThreshold) - secondHalfScore
	if firstGap < 0 {
		firstGap = 0
	}
	if secondGap < 0 {
		secondGap = 0
	}

	firstPlan := buildPlan(firstHalfImprovements, firstGap)
	secondPlan := buildPlan(secondHalfImprovements, secondGap)

	// --- (f) Generate overall recommendation ---
	canClearFirst := firstHalfScore >= float64(abyssClearThreshold)
	canClearSecond := secondHalfScore >= float64(abyssClearThreshold)

	overallRec := ""
	if canClearFirst && canClearSecond {
		overallRec = "현재 로스터로 클리어 가능합니다"
	} else {
		parts := []string{}
		halves := []struct {
			name  string
			can   bool
			plan  halfPlan
			gap   float64
		}{
			{"전반", canClearFirst, firstPlan, firstGap},
			{"후반", canClearSecond, secondPlan, secondGap},
		}
		for _, h := range halves {
			if h.can {
				continue
			}
			if h.plan.TotalPrimo > 0 {
				// Needs gacha
				elParts := []string{}
				for _, imp := range h.plan.Improvements {
					if imp.Category == "원석" {
						elParts = append(elParts, imp.Target)
					}
				}
				detail := strings.Join(elParts, ", ")
				if detail == "" {
					detail = "캐릭터"
				}
				parts = append(parts, fmt.Sprintf("%s: %s 확보 필요 (약 %d 원석) + 육성 비용 %d 레진",
					h.name, detail, h.plan.TotalPrimo, h.plan.TotalResin))
			} else if h.plan.TotalResin <= 300 {
				parts = append(parts, fmt.Sprintf("%s: 성유물 강화만으로 클리어 가능 (총 %d 레진)", h.name, h.plan.TotalResin))
			} else {
				days := (h.plan.TotalResin + 179) / 180
				parts = append(parts, fmt.Sprintf("%s: 캐릭터 육성 + 성유물 파밍 필요 (총 %d 레진, 약 %d일)", h.name, h.plan.TotalResin, days))
			}
		}
		overallRec = strings.Join(parts, ". ")
	}

	// --- (g) Response ---
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"current_score": map[string]interface{}{
			"first_half":  firstHalfScore,
			"second_half": secondHalfScore,
			"total":       firstHalfScore + secondHalfScore,
		},
		"threshold": map[string]interface{}{
			"clear":   abyssClearThreshold,
			"comfort": abyssComfortThreshold,
		},
		"can_clear": map[string]interface{}{
			"first_half":  canClearFirst,
			"second_half": canClearSecond,
		},
		"gap": map[string]interface{}{
			"first_half":  firstGap,
			"second_half": secondGap,
		},
		"plans": map[string]interface{}{
			"first_half":  firstPlan,
			"second_half": secondPlan,
		},
		"bonuses": map[string]interface{}{
			"first_half": map[string]interface{}{
				"resonance": firstResonance,
				"moonlight": firstMoonlight,
			},
			"second_half": map[string]interface{}{
				"resonance": secondResonance,
				"moonlight": secondMoonlight,
			},
		},
		"overall_recommendation": overallRec,
	})
}

// --- Async DFS Optimization ---

// Job progress helpers

func updateJobProgress(jobID string, progress int) {
	rqliteExec([]string{fmt.Sprintf(
		"UPDATE optimize_jobs SET progress = %d WHERE id = '%s'", progress, esc(jobID),
	)})
}

func updateJobDone(jobID string, result string) {
	rqliteExec([]string{fmt.Sprintf(
		"UPDATE optimize_jobs SET status = 'done', progress = 100, result = '%s', finished_at = datetime('now') WHERE id = '%s'",
		esc(result), esc(jobID),
	)})
}

func updateJobError(jobID string, errMsg string) {
	rqliteExec([]string{fmt.Sprintf(
		"UPDATE optimize_jobs SET status = 'error', result = '%s' WHERE id = '%s'",
		esc(errMsg), esc(jobID),
	)})
}

func handleOptimizeStart(w http.ResponseWriter, r *http.Request) {
	uid := getUserID(r)

	var body struct {
		Type string `json:"type"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil || (body.Type != "abyss" && body.Type != "theater" && body.Type != "all") {
		http.Error(w, `{"error":"type must be 'abyss', 'theater', or 'all'"}`, 400)
		return
	}

	jobID := generateSessionID()
	userIDInt, _ := strconv.Atoi(uid)

	rqliteExec([]string{fmt.Sprintf(
		"INSERT INTO optimize_jobs (id, user_id, type, status, progress) VALUES ('%s', %d, '%s', 'pending', 0)",
		esc(jobID), userIDInt, esc(body.Type),
	)})

	go func() {
		defer func() {
			if rv := recover(); rv != nil {
				log.Printf("optimize job %s panicked: %v", jobID, rv)
				updateJobError(jobID, fmt.Sprintf("internal error: %v", rv))
			}
		}()

		if body.Type == "all" {
			// Run both sequentially — each gets its own sub-job for result storage
			theaterJobID := generateSessionID()
			abyssJobID := generateSessionID()
			rqliteExec([]string{
				fmt.Sprintf("INSERT INTO optimize_jobs (id, user_id, type, status, progress) VALUES ('%s', %d, 'theater', 'pending', 0)", esc(theaterJobID), userIDInt),
				fmt.Sprintf("INSERT INTO optimize_jobs (id, user_id, type, status, progress) VALUES ('%s', %d, 'abyss', 'pending', 0)", esc(abyssJobID), userIDInt),
			})
			updateJobProgress(jobID, 10)
			runTheaterDFS(theaterJobID, uid)
			updateJobProgress(jobID, 55)
			runAbyssDFS(abyssJobID, uid)
			updateJobDone(jobID, `{"theater_job":"`+theaterJobID+`","abyss_job":"`+abyssJobID+`"}`)
		} else if body.Type == "abyss" {
			runAbyssDFS(jobID, uid)
		} else {
			runTheaterDFS(jobID, uid)
		}
	}()

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"job_id": jobID})
}

func handleOptimizeLatest(w http.ResponseWriter, r *http.Request) {
	uid := getUserID(r)
	jobType := r.PathValue("type")
	if jobType != "abyss" && jobType != "theater" && jobType != "all" {
		http.Error(w, `{"error":"type must be 'abyss', 'theater', or 'all'"}`, 400)
		return
	}
	result, err := rqliteQueryParam(
		"SELECT result FROM optimize_jobs WHERE user_id = ? AND type = ? AND status = 'done' ORDER BY finished_at DESC LIMIT 1",
		uid, jobType,
	)
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}
	rows := parseRows(result)
	if len(rows) == 0 || str(rows[0]["result"]) == "" {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`null`))
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.Write([]byte(str(rows[0]["result"])))
}

func handleOptimizeStatus(w http.ResponseWriter, r *http.Request) {
	uid := getUserID(r)
	jobID := r.PathValue("id")

	result, err := rqliteQueryParam(
		"SELECT id, user_id, type, status, progress, result, created_at, finished_at FROM optimize_jobs WHERE id = ?",
		jobID,
	)
	if err != nil {
		http.Error(w, `{"error":"internal error"}`, 500)
		return
	}
	rows := parseRows(result)
	if len(rows) == 0 {
		http.Error(w, `{"error":"job not found"}`, 404)
		return
	}
	job := rows[0]

	// Verify user_id matches
	jobUserID := fmt.Sprintf("%v", job["user_id"])
	// Handle float64 from JSON
	if f, ok := job["user_id"].(float64); ok {
		jobUserID = fmt.Sprintf("%d", int(f))
	}
	if jobUserID != uid {
		http.Error(w, `{"error":"job not found"}`, 404)
		return
	}

	resp := map[string]interface{}{
		"status":   str(job["status"]),
		"progress": intVal(job["progress"]),
	}

	if str(job["status"]) == "done" {
		var parsedResult interface{}
		if err := json.Unmarshal([]byte(str(job["result"])), &parsedResult); err == nil {
			resp["result"] = parsedResult
		} else {
			resp["result"] = str(job["result"])
		}
	} else if str(job["status"]) == "error" {
		resp["error"] = str(job["result"])
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}

// --- DFS Types ---

type dfsCharacter struct {
	Data       map[string]interface{}
	Name       string
	Element    string
	Score      float64
	WeaponData map[string]interface{}
	Artifacts  []map[string]interface{}
}

type dfsArtifact struct {
	Data     map[string]interface{}
	Slot     string
	SetName  string
	Score    float64
	ID       string
}

// --- Abyss DFS ---

func runAbyssDFS(jobID, uid string) {
	// (a) Load user data
	charsRaw, _ := rqliteQueryParam("SELECT * FROM characters WHERE user_id = ?", uid)
	artsRaw, _ := rqliteQueryParam("SELECT * FROM artifacts WHERE user_id = ?", uid)
	weapRaw, _ := rqliteQueryParam("SELECT * FROM weapons WHERE user_id = ?", uid)

	chars := parseRows(charsRaw)
	arts := parseRows(artsRaw)
	weaps := parseRows(weapRaw)

	if len(chars) == 0 {
		updateJobError(jobID, "no characters found")
		return
	}

	// (b) Update to running
	rqliteExec([]string{fmt.Sprintf(
		"UPDATE optimize_jobs SET status = 'running' WHERE id = '%s'", esc(jobID),
	)})

	// Get latest abyss season
	seasonRaw, _ := rqliteQuery("SELECT * FROM abyss_seasons ORDER BY id DESC LIMIT 1")
	seasons := parseRows(seasonRaw)
	if len(seasons) == 0 {
		updateJobError(jobID, "no abyss season data")
		return
	}
	season := seasons[0]

	// Parse floor12_data
	type halfData struct {
		Enemies  []string `json:"enemies"`
		Elements []string `json:"elements"`
	}
	type chamberData struct {
		Chamber    int      `json:"chamber"`
		FirstHalf  halfData `json:"first_half"`
		SecondHalf halfData `json:"second_half"`
	}
	type floor12Data struct {
		Chambers []chamberData `json:"chambers"`
	}
	var floor12 floor12Data
	json.Unmarshal([]byte(str(season["floor12_data"])), &floor12)

	firstHalfElements := map[string]bool{}
	secondHalfElements := map[string]bool{}
	firstHalfEnemies := []string{}
	secondHalfEnemies := []string{}
	firstHalfNeedsHealer := false
	secondHalfNeedsHealer := false
	for _, ch := range floor12.Chambers {
		for _, el := range ch.FirstHalf.Elements {
			firstHalfElements[el] = true
		}
		for _, el := range ch.SecondHalf.Elements {
			secondHalfElements[el] = true
		}
		firstHalfEnemies = append(firstHalfEnemies, ch.FirstHalf.Enemies...)
		secondHalfEnemies = append(secondHalfEnemies, ch.SecondHalf.Enemies...)
		// Heuristic: if there are many enemies or bosses, a healer is recommended
		if len(ch.FirstHalf.Enemies) >= 3 {
			firstHalfNeedsHealer = true
		}
		if len(ch.SecondHalf.Enemies) >= 3 {
			secondHalfNeedsHealer = true
		}
	}

	// Score each character
	scored := scoreDFSCharacters(chars, weaps, arts)

	// scoreForHalf computes a context-aware score for a character in a specific half.
	// contextScore = baseScore * resMod + elementMatchBonus + enemyWeaknessBonus + healerBonus
	scoreForHalf := func(charIdx int, recElements map[string]bool, enemies []string, needsHealer bool) float64 {
		sc := scored[charIdx]
		baseScore := sc.Score
		charElement := elementToResKey(sc.Element)

		// Resistance modifier: average across enemies in this half
		resMod := 1.0
		if len(enemies) > 0 {
			totalPenalty := 0.0
			for _, enemy := range enemies {
				resMap := getEnemyResistance(enemy)
				res, ok := resMap[charElement]
				if !ok {
					res = 10.0
				}
				totalPenalty += calcResPenalty(res)
			}
			resMod = totalPenalty / float64(len(enemies))
		}

		contextScore := baseScore * resMod

		// Element match bonus: +3000 if character's element is in recommended elements
		for rel := range recElements {
			if elementsMatch(sc.Element, rel) {
				contextScore += 3000.0
				break
			}
		}

		// Enemy weakness bonus: +2000 if element is strong against enemies
		// (element in recommended elements for this half implies weakness)
		for _, enemy := range enemies {
			resMap := getEnemyResistance(enemy)
			if res, ok := resMap[charElement]; ok && res < 10 {
				contextScore += 2000.0
				break
			}
		}

		// Healer bonus: +2500 if this half needs a healer and character is a known healer
		if needsHealer && knownHealers[sc.Name] {
			contextScore += 2500.0
		}

		return contextScore
	}

	// Pre-filter if too many characters
	if len(scored) > 20 {
		sort.Slice(scored, func(i, j int) bool {
			return scored[i].Score > scored[j].Score
		})
		scored = scored[:20]
	}

	updateJobProgress(jobID, 5)

	// (c) Phase 1: Team DFS — find best 4+4 split
	n := len(scored)
	if n < 8 {
		// Not enough characters, pad with what we have
		// Just do greedy split
		half := n / 2
		if half < 1 {
			half = 1
		}
		firstTeam := scored[:half]
		secondTeam := scored[half:]
		updateJobProgress(jobID, 60)
		finishAbyssDFS(jobID, uid, firstTeam, secondTeam, firstHalfElements, secondHalfElements, arts, season)
		return
	}

	bestScore := math.Inf(-1)
	var bestFirst []int
	var bestSecond []int

	// Precompute sorted scores for upper bound calculation (use max possible context score)
	maxContextBonus := 3000.0 + 2000.0 + 2500.0 + 2500.0 + 3000.0 // elementMatch + enemyWeakness + healer + resonance + moonlight
	allScores := make([]float64, n)
	for i, sc := range scored {
		allScores[i] = sc.Score + maxContextBonus
	}
	sortedScores := make([]float64, n)
	copy(sortedScores, allScores)
	sort.Float64s(sortedScores)
	// Reverse for descending
	for i, j := 0, len(sortedScores)-1; i < j; i, j = i+1, j-1 {
		sortedScores[i], sortedScores[j] = sortedScores[j], sortedScores[i]
	}

	// Track total combinations for progress
	totalCombinations := 0
	processedCombinations := 0
	for i := 0; i < n; i++ {
		for j := i + 1; j < n; j++ {
			for k := j + 1; k < n; k++ {
				for l := k + 1; l < n; l++ {
					totalCombinations++
					_ = l
				}
			}
		}
	}
	if totalCombinations == 0 {
		totalCombinations = 1
	}

	// DFS: try all combinations of 4 chars for first_half
	firstPick := make([]int, 0, 4)

	var dfsTeam func(start, depth int, currentScore float64)
	dfsTeam = func(start, depth int, currentScore float64) {
		if depth == 4 {
			// First half team is chosen, calculate second half from remaining
			remaining := []int{}
			usedSet := map[int]bool{}
			for _, idx := range firstPick {
				usedSet[idx] = true
			}
			for i := 0; i < n; i++ {
				if !usedSet[i] {
					remaining = append(remaining, i)
				}
			}

			// Pick top 4 from remaining for second half (using context-aware scoring)
			sort.Slice(remaining, func(a, b int) bool {
				sa := scoreForHalf(remaining[a], secondHalfElements, secondHalfEnemies, secondHalfNeedsHealer)
				sb := scoreForHalf(remaining[b], secondHalfElements, secondHalfEnemies, secondHalfNeedsHealer)
				return sa > sb
			})
			secondPick := remaining
			if len(secondPick) > 4 {
				secondPick = secondPick[:4]
			}

			secondScore := 0.0
			for _, idx := range secondPick {
				secondScore += scoreForHalf(idx, secondHalfElements, secondHalfEnemies, secondHalfNeedsHealer)
			}

			// Resonance and moonlight bonuses for first half
			firstElements := []string{}
			firstNames := []string{}
			for _, idx := range firstPick {
				firstElements = append(firstElements, scored[idx].Element)
				firstNames = append(firstNames, scored[idx].Name)
			}
			_, firstResBonus := calculateResonanceBonus(firstElements)
			_, firstMoonBonus := calculateMoonlightBonus(firstNames)

			// Resonance and moonlight bonuses for second half
			secondElements := []string{}
			secondNames := []string{}
			for _, idx := range secondPick {
				secondElements = append(secondElements, scored[idx].Element)
				secondNames = append(secondNames, scored[idx].Name)
			}
			_, secondResBonus := calculateResonanceBonus(secondElements)
			_, secondMoonBonus := calculateMoonlightBonus(secondNames)

			totalScore := currentScore + firstResBonus + firstMoonBonus + secondScore + secondResBonus + secondMoonBonus
			if totalScore > bestScore {
				bestScore = totalScore
				bestFirst = make([]int, len(firstPick))
				copy(bestFirst, firstPick)
				bestSecond = make([]int, len(secondPick))
				copy(bestSecond, secondPick)
			}

			processedCombinations++
			if totalCombinations > 0 && processedCombinations%(totalCombinations/20+1) == 0 {
				pct := 5 + int(float64(processedCombinations)/float64(totalCombinations)*55.0)
				if pct > 60 {
					pct = 60
				}
				updateJobProgress(jobID, pct)
			}
			return
		}

		for i := start; i < n; i++ {
			charScore := scoreForHalf(i, firstHalfElements, firstHalfEnemies, firstHalfNeedsHealer)
			newScore := currentScore + charScore

			// Pruning: estimate upper bound for remaining picks
			slotsLeft := (4 - depth - 1) + 4 // remaining first half + full second half
			upperBound := newScore
			for ub := 0; ub < slotsLeft && ub < len(sortedScores); ub++ {
				upperBound += sortedScores[ub]
			}
			if upperBound < bestScore {
				continue // prune
			}

			firstPick = append(firstPick, i)
			dfsTeam(i+1, depth+1, newScore)
			firstPick = firstPick[:len(firstPick)-1]
		}
	}

	dfsTeam(0, 0, 0.0)
	updateJobProgress(jobID, 60)

	// Build result teams from indices
	var firstTeam, secondTeam []dfsCharacter
	for _, idx := range bestFirst {
		firstTeam = append(firstTeam, scored[idx])
	}
	for _, idx := range bestSecond {
		secondTeam = append(secondTeam, scored[idx])
	}

	finishAbyssDFS(jobID, uid, firstTeam, secondTeam, firstHalfElements, secondHalfElements, arts, season)
}

func scoreDFSCharacters(chars []map[string]interface{}, weaps []map[string]interface{}, arts []map[string]interface{}) []dfsCharacter {
	result := []dfsCharacter{}
	for _, c := range chars {
		charName := str(c["name"])
		level := intVal(c["level"])

		// Base score from character level (exponential scaling)
		baseScore := float64(level) * float64(level) * 1.5

		// Weapon score (rarity-weighted + recommendation bonus)
		var matchedWeapon map[string]interface{}
		for _, wp := range weaps {
			if str(wp["equipped_by"]) == charName {
				matchedWeapon = wp
				break
			}
		}
		weaponScore := calculateWeaponScore(charName, matchedWeapon)

		// Artifact score (5 slots, total levels up to 100)
		var artifactScore float64
		var totalArtifactLevels float64
		charArtifacts := []map[string]interface{}{}
		for _, a := range arts {
			if str(a["equipped_by"]) == charName {
				totalArtifactLevels += float64(intVal(a["level"]))
				charArtifacts = append(charArtifacts, a)
			}
		}
		artifactScore = totalArtifactLevels * totalArtifactLevels * 0.3
		setBonus := calculateSetBonus(charName, charArtifacts)

		// Stat-based scoring (actual combat stats)
		atk := floatVal(c["atk"])
		critRate := floatVal(c["crit_rate"])
		critDmg := floatVal(c["crit_dmg"])
		er := floatVal(c["energy_recharge"])
		em := floatVal(c["elemental_mastery"])
		statScore := atk*0.5 + (critRate*critDmg/100.0)*5.0 + er*0.2 + em*0.1

		consScore := constellationScore(charName, intVal(c["constellation"]))
		totalScore := baseScore + weaponScore + artifactScore + setBonus + statScore + consScore

		result = append(result, dfsCharacter{
			Data:       c,
			Name:       charName,
			Element:    str(c["element"]),
			Score:      totalScore,
			WeaponData: matchedWeapon,
			Artifacts:  charArtifacts,
		})
	}
	return result
}

func finishAbyssDFS(jobID, uid string, firstTeam, secondTeam []dfsCharacter,
	firstHalfElements, secondHalfElements map[string]bool,
	allArts []map[string]interface{}, season map[string]interface{}) {

	// (d) Phase 2: Artifact optimization DFS for each team member
	usedArtifactIDs := map[string]bool{}
	allMembers := append(append([]dfsCharacter{}, firstTeam...), secondTeam...)

	artifactSlots := []string{"flower", "plume", "sands", "goblet", "circlet"}

	type artifactRec struct {
		Slot    string                 `json:"slot"`
		Current map[string]interface{} `json:"current,omitempty"`
		Suggest map[string]interface{} `json:"suggest,omitempty"`
		Reason  string                 `json:"reason"`
	}

	type memberArtResult struct {
		Recs          []artifactRec
		BestArtifacts []map[string]interface{}
	}

	memberArtResults := make([]memberArtResult, len(allMembers))

	for mi, member := range allMembers {
		// Determine character's scaling type for main stat relevance filtering
		charName := member.Name
		charElement := member.Element
		charWeaponType := str(member.Data["weapon_type"])
		isHPScaler := hpScalingCharacters[charName]
		isEMScaler := emScalingCharacters[charName]
		isDEFScaler := defScalingCharacters[charName]

		// scoreArtifactForChar scores an artifact with main stat relevance for this character
		scoreArtifactForChar := func(a map[string]interface{}, slot string) float64 {
			score := scoreArtifactDFS(a)
			mainStat := strings.ToLower(str(a["main_stat_type"]))

			// Main stat relevance filtering for sands/goblet/circlet (variable main stats)
			if slot == "sands" || slot == "goblet" || slot == "circlet" {
				hasDesiredStat := false

				if isHPScaler {
					if strings.Contains(mainStat, "hp") {
						hasDesiredStat = true
					}
				} else if isEMScaler {
					if strings.Contains(mainStat, "mastery") || strings.Contains(mainStat, "em") {
						hasDesiredStat = true
					}
				} else if isDEFScaler {
					if strings.Contains(mainStat, "def") {
						hasDesiredStat = true
					}
				} else {
					// ATK-scaling (most DPS): prefer ATK%/CRIT/Elemental DMG
					if strings.Contains(mainStat, "atk") ||
						strings.Contains(mainStat, "crit") ||
						strings.Contains(mainStat, "dmg") {
						hasDesiredStat = true
					}
				}

				// Penalty for completely wrong main stats
				if !hasDesiredStat {
					wrongStat := false
					if !isHPScaler && strings.Contains(mainStat, "hp") && slot == "sands" {
						wrongStat = true
					}
					if !isDEFScaler && strings.Contains(mainStat, "def") {
						wrongStat = true
					}
					if !isEMScaler && strings.Contains(mainStat, "mastery") && slot == "sands" {
						wrongStat = true
					}
					if wrongStat {
						score -= 50.0
					}
				}
			}
			_ = charElement
			_ = charWeaponType
			return score
		}

		// Collect candidate artifacts per slot
		candidatesBySlot := map[string][]dfsArtifact{}
		for _, slot := range artifactSlots {
			candidates := []dfsArtifact{}
			// Currently equipped artifacts for this character
			for _, a := range member.Artifacts {
				if strings.ToLower(str(a["slot"])) == slot {
					aid := fmt.Sprintf("%v", a["id"])
					if !usedArtifactIDs[aid] {
						score := scoreArtifactForChar(a, slot)
						candidates = append(candidates, dfsArtifact{
							Data: a, Slot: slot, SetName: str(a["set_name"]),
							Score: score, ID: aid,
						})
					}
				}
			}
			// Unequipped artifacts
			for _, a := range allArts {
				if str(a["equipped_by"]) == "" && strings.ToLower(str(a["slot"])) == slot {
					aid := fmt.Sprintf("%v", a["id"])
					if !usedArtifactIDs[aid] {
						score := scoreArtifactForChar(a, slot)
						candidates = append(candidates, dfsArtifact{
							Data: a, Slot: slot, SetName: str(a["set_name"]),
							Score: score, ID: aid,
						})
					}
				}
			}
			// Sort candidates by score descending
			sort.Slice(candidates, func(i, j int) bool {
				return candidates[i].Score > candidates[j].Score
			})
			// Limit to top 8 per slot to keep DFS tractable (8^5 = 32,768 max per character)
			if len(candidates) > 8 {
				candidates = candidates[:8]
			}
			candidatesBySlot[slot] = candidates
		}

		// DFS over 5 slots
		bestArtScore := math.Inf(-1)
		bestAssignment := make([]int, 5) // index into candidatesBySlot[slot]
		currentAssignment := make([]int, 5)
		for i := range currentAssignment {
			currentAssignment[i] = -1
		}

		// Precompute max possible score per remaining slot
		maxPerSlot := make([]float64, 5)
		for si, slot := range artifactSlots {
			if len(candidatesBySlot[slot]) > 0 {
				maxPerSlot[si] = candidatesBySlot[slot][0].Score + 200.0 // include max set bonus
			}
		}

		var dfsArt func(slotIdx int, currentScore float64, setCounts map[string]int)
		dfsArt = func(slotIdx int, currentScore float64, setCounts map[string]int) {
			if slotIdx == 5 {
				// Check 4-piece set bonus
				finalScore := currentScore
				for _, count := range setCounts {
					if count >= 4 {
						finalScore += 200.0
					}
				}
				if finalScore > bestArtScore {
					bestArtScore = finalScore
					copy(bestAssignment, currentAssignment)
				}
				return
			}

			slot := artifactSlots[slotIdx]
			candidates := candidatesBySlot[slot]

			// Pruning: upper bound check
			remainingMax := 0.0
			for ri := slotIdx; ri < 5; ri++ {
				remainingMax += maxPerSlot[ri]
			}
			if currentScore+remainingMax < bestArtScore {
				return
			}

			if len(candidates) == 0 {
				// No candidates for this slot, skip
				currentAssignment[slotIdx] = -1
				dfsArt(slotIdx+1, currentScore, setCounts)
				return
			}

			for ci, cand := range candidates {
				// Pruning per candidate
				if currentScore+cand.Score+200.0 < bestArtScore {
					// Even with max set bonus, remaining slots can't help
					remainingAfter := 0.0
					for ri := slotIdx + 1; ri < 5; ri++ {
						remainingAfter += maxPerSlot[ri]
					}
					if currentScore+cand.Score+remainingAfter+200.0 < bestArtScore {
						continue
					}
				}

				currentAssignment[slotIdx] = ci
				newCounts := make(map[string]int)
				for k, v := range setCounts {
					newCounts[k] = v
				}
				if cand.SetName != "" {
					newCounts[cand.SetName]++
				}
				dfsArt(slotIdx+1, currentScore+cand.Score, newCounts)
			}
		}

		dfsArt(0, 0.0, map[string]int{})

		// Collect results
		recs := []artifactRec{}
		bestArts := []map[string]interface{}{}
		for si, slot := range artifactSlots {
			ci := bestAssignment[si]
			candidates := candidatesBySlot[slot]

			// Find currently equipped
			var currentArt map[string]interface{}
			for _, a := range member.Artifacts {
				if strings.ToLower(str(a["slot"])) == slot {
					currentArt = a
					break
				}
			}

			if ci >= 0 && ci < len(candidates) {
				chosen := candidates[ci]
				usedArtifactIDs[chosen.ID] = true
				bestArts = append(bestArts, chosen.Data)
				if currentArt == nil || fmt.Sprintf("%v", currentArt["id"]) != chosen.ID {
					recs = append(recs, artifactRec{
						Slot:    slot,
						Current: currentArt,
						Suggest: chosen.Data,
						Reason:  fmt.Sprintf("DFS 최적화 점수 %.0f", chosen.Score),
					})
				}
			}
		}

		memberArtResults[mi] = memberArtResult{Recs: recs, BestArtifacts: bestArts}

		// Progress: 60-90% across 8 members
		pct := 60 + int(float64(mi+1)/float64(len(allMembers))*30.0)
		if pct > 90 {
			pct = 90
		}
		updateJobProgress(jobID, pct)
	}

	// (e) Phase 3: Generate recommendations (90-100%)
	updateJobProgress(jobID, 90)

	type memberResponse struct {
		Character    map[string]interface{}   `json:"character"`
		Score        float64                  `json:"score"`
		Weapon       map[string]interface{}   `json:"weapon"`
		Artifacts    []map[string]interface{}  `json:"artifacts"`
		Improvements []string                 `json:"improvements"`
		ArtifactRecs interface{}              `json:"artifact_recommendations,omitempty"`
	}

	type teamResponse struct {
		Members         []memberResponse `json:"members"`
		TeamScore       float64          `json:"team_score"`
		ElementCoverage []string         `json:"element_coverage"`
		Resonance       string           `json:"resonance"`
		Moonlight       string           `json:"moonlight,omitempty"`
	}

	buildResp := func(team []dfsCharacter, recElements map[string]bool, artResults []memberArtResult) teamResponse {
		members := []memberResponse{}
		teamScore := 0.0
		elements := []string{}
		teamElements := []string{}
		teamNames := []string{}

		for ti, sc := range team {
			imps := []string{}
			level := intVal(sc.Data["level"])
			if level < 80 {
				imps = append(imps, "캐릭터 레벨업 필요")
			}
			if sc.WeaponData != nil && intVal(sc.WeaponData["level"]) < 80 {
				imps = append(imps, "무기 레벨업 필요")
			}
			if sc.WeaponData == nil {
				imps = append(imps, "무기 장착 필요")
			}
			equippedSlots := map[string]bool{}
			for _, a := range sc.Artifacts {
				equippedSlots[strings.ToLower(str(a["slot"]))] = true
			}
			for _, slot := range artifactSlots {
				if !equippedSlots[slot] {
					imps = append(imps, fmt.Sprintf("성유물 파밍 필요 (%s)", slot))
				}
			}
			if len(sc.Artifacts) > 0 {
				totalLevel := 0
				for _, a := range sc.Artifacts {
					totalLevel += intVal(a["level"])
				}
				avg := totalLevel / len(sc.Artifacts)
				if avg < 16 {
					imps = append(imps, "성유물 강화 필요")
				}
			}

			members = append(members, memberResponse{
				Character:    sc.Data,
				Score:        sc.Score,
				Weapon:       sc.WeaponData,
				Artifacts:    sc.Artifacts,
				Improvements: imps,
				ArtifactRecs: artResults[ti].Recs,
			})
			teamScore += sc.Score
			el := sc.Element
			if el != "" {
				teamElements = append(teamElements, el)
				found := false
				for _, e := range elements {
					if e == el {
						found = true
						break
					}
				}
				if !found {
					elements = append(elements, el)
				}
			}
			teamNames = append(teamNames, sc.Name)
		}

		// Resonance bonus
		resName, resScore := calculateResonanceBonus(teamElements)
		resonance := ""
		if resName != "" {
			resonance = fmt.Sprintf("%s (+%.0f)", resName, resScore)
			teamScore += resScore
		}

		// Moonlight bonus
		moonName, moonScore := calculateMoonlightBonus(teamNames)
		moonlight := ""
		if moonName != "" {
			moonlight = fmt.Sprintf("%s (+%.0f)", moonName, moonScore)
			teamScore += moonScore
		}

		return teamResponse{
			Members:         members,
			TeamScore:       teamScore,
			ElementCoverage: elements,
			Resonance:       resonance,
			Moonlight:       moonlight,
		}
	}

	firstArtResults := memberArtResults[:len(firstTeam)]
	secondArtResults := memberArtResults[len(firstTeam):]

	firstHalf := buildResp(firstTeam, firstHalfElements, firstArtResults)
	secondHalf := buildResp(secondTeam, secondHalfElements, secondArtResults)

	// Overall recommendations
	type overallRec struct {
		Priority int    `json:"priority"`
		Title    string `json:"title"`
		Reason   string `json:"reason"`
	}
	overallRecs := []overallRec{}
	priority := 1
	halfNames := []string{"전반", "후반"}
	for hi, tr := range []teamResponse{firstHalf, secondHalf} {
		for _, m := range tr.Members {
			charName := str(m.Character["name"])
			for _, imp := range m.Improvements {
				overallRecs = append(overallRecs, overallRec{
					Priority: priority,
					Title:    fmt.Sprintf("%s %s", charName, imp),
					Reason:   fmt.Sprintf("%s팀 최적화", halfNames[hi]),
				})
				priority++
			}
		}
	}

	updateJobProgress(jobID, 95)

	overallScore := firstHalf.TeamScore + secondHalf.TeamScore
	resultData := map[string]interface{}{
		"season": map[string]interface{}{
			"period":   str(season["period"]),
			"blessing": str(season["blessing"]),
		},
		"teams": map[string]interface{}{
			"first_half":  firstHalf,
			"second_half": secondHalf,
		},
		"overall_score":   overallScore,
		"recommendations": overallRecs,
		"method":          "dfs_with_pruning",
	}

	resultJSON, _ := json.Marshal(resultData)
	updateJobDone(jobID, string(resultJSON))
}

func scoreArtifactDFS(a map[string]interface{}) float64 {
	score := 0.0
	mainStat := str(a["main_stat_type"])
	if strings.Contains(strings.ToLower(mainStat), "atk") ||
		strings.Contains(strings.ToLower(mainStat), "hp") {
		score += 100
	}
	for i := 1; i <= 4; i++ {
		subName := str(a[fmt.Sprintf("sub%d_name", i)])
		subRolls := intVal(a[fmt.Sprintf("sub%d_rolls", i)])
		if subRolls == 0 {
			subRolls = 1
		}
		lower := strings.ToLower(subName)
		if strings.Contains(lower, "crit") && strings.Contains(lower, "rate") {
			score += 50.0 * float64(subRolls)
		} else if strings.Contains(lower, "crit") && strings.Contains(lower, "dmg") {
			score += 50.0 * float64(subRolls)
		}
	}
	score += 30 // set bonus consideration
	return score
}

// --- Theater DFS ---

func runTheaterDFS(jobID, uid string) {
	// Load user data
	charsRaw, _ := rqliteQueryParam("SELECT * FROM characters WHERE user_id = ?", uid)
	artsRaw, _ := rqliteQueryParam("SELECT * FROM artifacts WHERE user_id = ?", uid)
	weapRaw, _ := rqliteQueryParam("SELECT * FROM weapons WHERE user_id = ?", uid)

	chars := parseRows(charsRaw)
	arts := parseRows(artsRaw)
	weaps := parseRows(weapRaw)

	if len(chars) == 0 {
		updateJobError(jobID, "no characters found")
		return
	}

	rqliteExec([]string{fmt.Sprintf(
		"UPDATE optimize_jobs SET status = 'running' WHERE id = '%s'", esc(jobID),
	)})

	// Read user preferences for theater difficulty + gender
	prefRaw, _ := rqliteQueryParam("SELECT theater_difficulty, prefer_gender, include_default_males FROM users WHERE id = ?", uid)
	prefRows := parseRows(prefRaw)
	theaterDifficulty := "transcendence"
	preferGender := "all"
	includeDefaultMales := 1
	if len(prefRows) > 0 {
		if td := str(prefRows[0]["theater_difficulty"]); td != "" {
			theaterDifficulty = td
		}
		if g := str(prefRows[0]["prefer_gender"]); g != "" {
			preferGender = g
		}
		if dm := prefRows[0]["include_default_males"]; dm != nil {
			includeDefaultMales = intVal(dm)
		}
	}

	// Apply gender filter
	if preferGender != "all" {
		filtered := []map[string]interface{}{}
		for _, c := range chars {
			name := str(c["name"])
			gender := getCharGender(name)
			if gender == preferGender {
				filtered = append(filtered, c)
			} else if preferGender == "female" && includeDefaultMales == 1 && isDefaultMale(name) {
				filtered = append(filtered, c)
			}
		}
		chars = filtered
	}

	difficultyChars := map[string]int{
		"normal": 8, "hard": 16, "transcendence": 32,
	}
	charsNeeded := difficultyChars[theaterDifficulty]
	if charsNeeded == 0 {
		charsNeeded = 32
	}

	// Get latest theater season
	seasonRaw, _ := rqliteQuery("SELECT * FROM theater_seasons ORDER BY date DESC LIMIT 1")
	theaterSeasons := parseRows(seasonRaw)
	if len(theaterSeasons) == 0 {
		updateJobError(jobID, "no theater season data")
		return
	}
	tSeason := theaterSeasons[0]
	requiredElements := strings.Split(str(tSeason["elements"]), ",")
	for i := range requiredElements {
		requiredElements[i] = strings.TrimSpace(requiredElements[i])
	}

	updateJobProgress(jobID, 5)

	// Score all characters
	scored := scoreDFSCharacters(chars, weaps, arts)

	// Score with element bonus for theater
	type theaterScored struct {
		Char         dfsCharacter
		TotalScore   float64
		MatchElement bool
	}
	theaterChars := []theaterScored{}
	for _, sc := range scored {
		matchEl := false
		bonus := 0.0
		for _, el := range requiredElements {
			if elementsMatch(sc.Element, el) {
				matchEl = true
				bonus = 2000.0
				break
			}
		}
		theaterChars = append(theaterChars, theaterScored{
			Char: sc, TotalScore: sc.Score + bonus, MatchElement: matchEl,
		})
	}

	// Sort by total score descending
	sort.Slice(theaterChars, func(i, j int) bool {
		return theaterChars[i].TotalScore > theaterChars[j].TotalScore
	})

	// Select best characters per element, then fill remaining
	selected := []dfsCharacter{}
	usedIdx := map[int]bool{}

	// First pass: pick characters matching required elements
	for _, el := range requiredElements {
		el = strings.TrimSpace(el)
		count := 0
		perElementTarget := charsNeeded / len(requiredElements)
		if perElementTarget < 1 {
			perElementTarget = 1
		}
		for i, tc := range theaterChars {
			if usedIdx[i] || count >= perElementTarget {
				continue
			}
			if elementsMatch(tc.Char.Element, el) {
				selected = append(selected, tc.Char)
				usedIdx[i] = true
				count++
			}
		}
	}

	// Second pass: fill remaining slots with highest scoring characters
	for i, tc := range theaterChars {
		if len(selected) >= charsNeeded {
			break
		}
		if !usedIdx[i] {
			selected = append(selected, tc.Char)
			usedIdx[i] = true
		}
	}

	updateJobProgress(jobID, 40)

	// Phase 2: Artifact optimization DFS for selected characters
	artifactSlots := []string{"flower", "plume", "sands", "goblet", "circlet"}
	usedArtifactIDs := map[string]bool{}

	type artifactRec struct {
		Slot    string                 `json:"slot"`
		Current map[string]interface{} `json:"current,omitempty"`
		Suggest map[string]interface{} `json:"suggest,omitempty"`
		Reason  string                 `json:"reason"`
	}

	type memberResponse struct {
		Character    map[string]interface{}   `json:"character"`
		Score        float64                  `json:"score"`
		Weapon       map[string]interface{}   `json:"weapon"`
		Artifacts    []map[string]interface{}  `json:"artifacts"`
		Improvements []string                 `json:"improvements"`
		ArtifactRecs []artifactRec            `json:"artifact_recommendations,omitempty"`
	}

	members := []memberResponse{}

	for mi, member := range selected {
		// Artifact DFS per character (same logic as abyss)
		candidatesBySlot := map[string][]dfsArtifact{}
		for _, slot := range artifactSlots {
			candidates := []dfsArtifact{}
			for _, a := range member.Artifacts {
				if strings.ToLower(str(a["slot"])) == slot {
					aid := fmt.Sprintf("%v", a["id"])
					if !usedArtifactIDs[aid] {
						score := scoreArtifactDFS(a)
						candidates = append(candidates, dfsArtifact{
							Data: a, Slot: slot, SetName: str(a["set_name"]),
							Score: score, ID: aid,
						})
					}
				}
			}
			for _, a := range arts {
				if str(a["equipped_by"]) == "" && strings.ToLower(str(a["slot"])) == slot {
					aid := fmt.Sprintf("%v", a["id"])
					if !usedArtifactIDs[aid] {
						score := scoreArtifactDFS(a)
						candidates = append(candidates, dfsArtifact{
							Data: a, Slot: slot, SetName: str(a["set_name"]),
							Score: score, ID: aid,
						})
					}
				}
			}
			sort.Slice(candidates, func(i, j int) bool {
				return candidates[i].Score > candidates[j].Score
			})
			if len(candidates) > 10 {
				candidates = candidates[:10]
			}
			candidatesBySlot[slot] = candidates
		}

		bestArtScore := math.Inf(-1)
		bestAssignment := make([]int, 5)
		currentAssignment := make([]int, 5)
		for i := range currentAssignment {
			currentAssignment[i] = -1
		}

		maxPerSlot := make([]float64, 5)
		for si, slot := range artifactSlots {
			if len(candidatesBySlot[slot]) > 0 {
				maxPerSlot[si] = candidatesBySlot[slot][0].Score + 200.0
			}
		}

		var dfsArt func(slotIdx int, currentScore float64, setCounts map[string]int)
		dfsArt = func(slotIdx int, currentScore float64, setCounts map[string]int) {
			if slotIdx == 5 {
				finalScore := currentScore
				for _, count := range setCounts {
					if count >= 4 {
						finalScore += 200.0
					}
				}
				if finalScore > bestArtScore {
					bestArtScore = finalScore
					copy(bestAssignment, currentAssignment)
				}
				return
			}

			slot := artifactSlots[slotIdx]
			candidates := candidatesBySlot[slot]

			remainingMax := 0.0
			for ri := slotIdx; ri < 5; ri++ {
				remainingMax += maxPerSlot[ri]
			}
			if currentScore+remainingMax < bestArtScore {
				return
			}

			if len(candidates) == 0 {
				currentAssignment[slotIdx] = -1
				dfsArt(slotIdx+1, currentScore, setCounts)
				return
			}

			for ci, cand := range candidates {
				remainingAfter := 0.0
				for ri := slotIdx + 1; ri < 5; ri++ {
					remainingAfter += maxPerSlot[ri]
				}
				if currentScore+cand.Score+remainingAfter+200.0 < bestArtScore {
					continue
				}

				currentAssignment[slotIdx] = ci
				newCounts := make(map[string]int)
				for k, v := range setCounts {
					newCounts[k] = v
				}
				if cand.SetName != "" {
					newCounts[cand.SetName]++
				}
				dfsArt(slotIdx+1, currentScore+cand.Score, newCounts)
			}
		}

		dfsArt(0, 0.0, map[string]int{})

		// Collect artifact recs
		artRecs := []artifactRec{}
		for si, slot := range artifactSlots {
			ci := bestAssignment[si]
			candidates := candidatesBySlot[slot]

			var currentArt map[string]interface{}
			for _, a := range member.Artifacts {
				if strings.ToLower(str(a["slot"])) == slot {
					currentArt = a
					break
				}
			}

			if ci >= 0 && ci < len(candidates) {
				chosen := candidates[ci]
				usedArtifactIDs[chosen.ID] = true
				if currentArt == nil || fmt.Sprintf("%v", currentArt["id"]) != chosen.ID {
					artRecs = append(artRecs, artifactRec{
						Slot:    slot,
						Current: currentArt,
						Suggest: chosen.Data,
						Reason:  fmt.Sprintf("DFS 최적화 점수 %.0f", chosen.Score),
					})
				}
			}
		}

		// Improvements
		imps := []string{}
		level := intVal(member.Data["level"])
		if level < 80 {
			imps = append(imps, "캐릭터 레벨업 필요")
		}
		if member.WeaponData != nil && intVal(member.WeaponData["level"]) < 80 {
			imps = append(imps, "무기 레벨업 필요")
		}
		if member.WeaponData == nil {
			imps = append(imps, "무기 장착 필요")
		}

		members = append(members, memberResponse{
			Character:    member.Data,
			Score:        member.Score,
			Weapon:       member.WeaponData,
			Artifacts:    member.Artifacts,
			Improvements: imps,
			ArtifactRecs: artRecs,
		})

		// Progress: 40-90%
		pct := 40 + int(float64(mi+1)/float64(len(selected))*50.0)
		if pct > 90 {
			pct = 90
		}
		updateJobProgress(jobID, pct)
	}

	updateJobProgress(jobID, 95)

	// Build result
	totalScore := 0.0
	for _, m := range members {
		totalScore += m.Score
	}

	// Borrow recommendation: find high-tier characters the user doesn't own
	// that match the required elements
	ownedNames := map[string]bool{}
	for _, c := range chars {
		ownedNames[str(c["name"])] = true
	}

	type borrowRec struct {
		Name    string `json:"name"`
		Element string `json:"element"`
		Reason  string `json:"reason"`
	}
	var borrowRecommendation *borrowRec

	// High-tier characters per element that are commonly borrowed
	borrowCandidates := []struct{ name, element, reason string }{
		// 물
		{"Neuvillette", "물", "최강 물 원소 딜러 — 높은 HP 스케일링"},
		{"Furina", "물", "범용 서포터 — HP 기반 팀 버프"},
		{"Yelan", "물", "서브 딜러 — HP 스케일링 + 높은 피해"},
		{"Mualani", "물", "물 원소 메인 딜러"},
		// 얼음
		{"Ayaka", "얼음", "얼음 메인 딜러 — 높은 폭발 피해"},
		{"Skirk", "얼음", "얼음 메인 딜러 — 0 에너지 빌드"},
		{"Wriothesley", "얼음", "얼음 근접 딜러"},
		{"Ganyu", "얼음", "얼음 원거리 딜러"},
		// 바위
		{"Navia", "바위", "바위 메인 딜러"},
		{"Zhongli", "바위", "최강 실드 서포터"},
		{"Albedo", "바위", "서브 딜러 — 방어력 스케일링"},
		// 불
		{"Arlecchino", "불", "불 메인 딜러 — 높은 지속 피해"},
		{"Mavuika", "불", "불 메인 딜러"},
		{"Hu Tao", "불", "불 메인 딜러 — HP 스케일링"},
		// 번개
		{"Raiden Shogun", "번개", "번개 메인/서브 딜러 + 에너지 서포트"},
		{"Clorinde", "번개", "번개 메인 딜러"},
		{"Varesa", "번개", "번개 메인 딜러"},
		// 바람
		{"Kaedehara Kazuha", "바람", "최강 바람 서포터 — 원소 마스터리 버프"},
		{"Venti", "바람", "CC + 에너지 서포트"},
		{"Xianyun", "바람", "힐러 + 낙하 공격 버프"},
		// 풀
		{"Nahida", "풀", "풀 원소 서브 딜러 — 원소 마스터리 공유"},
		{"Alhaitham", "풀", "풀 메인 딜러"},
		{"Kinich", "풀", "풀 메인 딜러"},
	}

	for _, bc := range borrowCandidates {
		if ownedNames[bc.name] {
			continue
		}
		// Check if this element is needed for theater
		needed := false
		for _, el := range requiredElements {
			if el == bc.element {
				needed = true
				break
			}
		}
		if needed {
			borrowRecommendation = &borrowRec{Name: bc.name, Element: bc.element, Reason: bc.reason}
			break
		}
	}

	resultData := map[string]interface{}{
		"season": map[string]interface{}{
			"title":    str(tSeason["title"]),
			"elements": requiredElements,
		},
		"difficulty":            theaterDifficulty,
		"characters_needed":     charsNeeded,
		"selected_count":        len(members),
		"members":               members,
		"total_score":           totalScore,
		"method":                "dfs_with_pruning",
		"borrow_recommendation": borrowRecommendation,
	}

	resultJSON, _ := json.Marshal(resultData)
	updateJobDone(jobID, string(resultJSON))
}

func handleListWeeklyBosses(w http.ResponseWriter, r *http.Request) {
	result, err := rqliteQuery("SELECT * FROM weekly_bosses ORDER BY sort_order")
	writeResult(w, result, err)
}

func handleGetUserWeeklyBosses(w http.ResponseWriter, r *http.Request) {
	uid := getUserID(r)
	now := time.Now()
	iy, iw := now.ISOWeek()
	week := fmt.Sprintf("%d-W%02d", iy, iw)

	// Auto-create rows for this week if none exist
	countRaw, _ := rqliteQueryParam("SELECT COUNT(*) AS cnt FROM user_weekly_bosses WHERE user_id = ? AND week = ?", uid, week)
	if getCount(countRaw) == 0 {
		bossesRaw, _ := rqliteQuery("SELECT id FROM weekly_bosses ORDER BY sort_order")
		bossRows := parseRows(bossesRaw)
		for _, b := range bossRows {
			bossID := fmt.Sprintf("%v", b["id"])
			rqliteExec([]string{fmt.Sprintf(
				"INSERT INTO user_weekly_bosses (user_id, week, boss_id, done) VALUES (%s, '%s', %s, 0)",
				uid, esc(week), bossID,
			)})
		}
	}

	// Fetch joined data
	result, err := rqliteQueryParam(
		"SELECT uwb.id, uwb.user_id, uwb.week, uwb.boss_id, uwb.done, wb.name, wb.region FROM user_weekly_bosses uwb JOIN weekly_bosses wb ON uwb.boss_id = wb.id WHERE uwb.user_id = ? AND uwb.week = ? ORDER BY wb.sort_order",
		uid, week,
	)
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}
	rows := parseRows(result)

	// Calculate resin info
	doneCount := 0
	for _, row := range rows {
		if intVal(row["done"]) == 1 {
			doneCount++
		}
	}

	totalResinSpent := 0
	for i := 0; i < doneCount; i++ {
		if i < 3 {
			totalResinSpent += 30
		} else {
			totalResinSpent += 60
		}
	}

	discountRemaining := 3 - doneCount
	if discountRemaining < 0 {
		discountRemaining = 0
	}

	nextBossCost := 30
	if doneCount >= 3 {
		nextBossCost = 60
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"bosses":             rows,
		"total_resin_spent":  totalResinSpent,
		"discount_remaining": discountRemaining,
		"next_boss_cost":     nextBossCost,
		"week":               week,
	})
}

func handleToggleWeeklyBoss(w http.ResponseWriter, r *http.Request) {
	uid := getUserID(r)
	id := r.PathValue("id")

	// Toggle done: 0->1, 1->0
	rqliteExecParam(
		"UPDATE user_weekly_bosses SET done = CASE WHEN done = 0 THEN 1 ELSE 0 END WHERE id = ? AND user_id = ?",
		id, uid,
	)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
}

func handleBPList(w http.ResponseWriter, r *http.Request) {
	uid := getUserID(r)
	now := time.Now()
	iy, iw := now.ISOWeek()
	week := fmt.Sprintf("%d-W%02d", iy, iw)

	bpRaw, _ := rqliteQueryParam("SELECT COUNT(*) AS cnt FROM bp_missions WHERE user_id = ? AND week = ?", uid, week)
	if getCount(bpRaw) == 0 {
		seedBPMissions(uid, week)
	}

	result, err := rqliteQueryParam("SELECT * FROM bp_missions WHERE user_id = ? AND week = ? ORDER BY id", uid, week)
	writeResult(w, result, err)
}

func handleBPToggle(w http.ResponseWriter, r *http.Request) {
	uid := getUserID(r)
	id := r.PathValue("id")

	var body struct {
		Progress int `json:"progress"`
	}
	json.NewDecoder(r.Body).Decode(&body)

	rqliteExecParam(
		"UPDATE bp_missions SET progress = ?, done = CASE WHEN ? >= target THEN 1 ELSE 0 END WHERE id = ? AND user_id = ?",
		fmt.Sprintf("%d", body.Progress), fmt.Sprintf("%d", body.Progress), id, uid,
	)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
}

func handleBPReset(w http.ResponseWriter, r *http.Request) {
	uid := getUserID(r)
	now := time.Now()
	iy, iw := now.ISOWeek()
	week := fmt.Sprintf("%d-W%02d", iy, iw)
	rqliteExecParam("DELETE FROM bp_missions WHERE user_id = ? AND week = ?", uid, week)
	seedBPMissions(uid, week)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "reset"})
}

func seedBPMissions(uid string, week string) {
	missions := []struct{ name string; target int }{
		{"적 우두머리 10회 처치", 10},
		{"천연 수지 1200 소모", 1200},
		{"50만 모라 누적 소모", 500000},
		{"비경 도전 15회 클리어", 15},
		{"지맥 침적 포인트 15회 완료", 15},
		{"선계 화폐 1000개 누적 획득", 1000},
		{"장식 10개 제작", 10},
		{"타인의 주전자에서 아이템 2개 구매", 2},
		{"일곱 성인의 소환 대전 2회 승리", 2},
		{"요리 20회 제작", 20},
		{"단조 20회 완료", 20},
		{"영역 토벌/울프의 영주 3회 완료", 3},
	}
	for _, m := range missions {
		rqliteExec([]string{fmt.Sprintf(
			"INSERT INTO bp_missions (user_id, week, mission, target, progress, done) VALUES (%s, '%s', '%s', %d, 0, 0)",
			uid, esc(week), esc(m.name), m.target,
		)})
	}
}

// --- Character Names Dictionary ---

func handleCharacterNames(w http.ResponseWriter, r *http.Request) {
	result, err := rqliteQuery("SELECT name_en, name_ko FROM character_names ORDER BY name_en")
	writeResult(w, result, err)
}

// --- Search/Filter helpers ---

// buildFilterQuery constructs a WHERE clause from query parameters using parameterized values.
// allowedColumns maps query-param names to actual DB column names (whitelist for SQL injection safety).
// The user_id filter is always included as the first condition.
func buildFilterQuery(r *http.Request, allowedColumns map[string]string, userID string) (string, []string) {
	params := []string{userID}
	clauses := []string{"user_id = ?"}

	for qp, col := range allowedColumns {
		val := r.URL.Query().Get(qp)
		if val == "" {
			continue
		}
		clauses = append(clauses, col+" = ?")
		params = append(params, val)
	}

	return " WHERE " + strings.Join(clauses, " AND "), params
}

// --- rqlite helpers ---

func rqliteExec(stmts []string) ([]byte, error) {
	body, _ := json.Marshal(stmts)
	resp, err := http.Post(rqliteURL+"/db/execute", "application/json", bytes.NewReader(body))
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	return io.ReadAll(resp.Body)
}

// rqliteExecParam executes a single parameterized statement (for safe INSERT/UPDATE/DELETE).
func rqliteExecParam(q string, params ...string) ([]byte, error) {
	stmt := []interface{}{q}
	for _, p := range params {
		stmt = append(stmt, p)
	}
	body, _ := json.Marshal([][]interface{}{stmt})
	resp, err := http.Post(rqliteURL+"/db/execute", "application/json", bytes.NewReader(body))
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	return io.ReadAll(resp.Body)
}

func rqliteQuery(q string) ([]byte, error) {
	body, _ := json.Marshal([]string{q})
	resp, err := http.Post(rqliteURL+"/db/query", "application/json", bytes.NewReader(body))
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	return io.ReadAll(resp.Body)
}

func rqliteQueryParam(q string, params ...string) ([]byte, error) {
	stmt := []interface{}{q}
	for _, p := range params {
		stmt = append(stmt, p)
	}
	body, _ := json.Marshal([][]interface{}{stmt})
	resp, err := http.Post(rqliteURL+"/db/query", "application/json", bytes.NewReader(body))
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	return io.ReadAll(resp.Body)
}

// --- Response helpers ---

type queryResponse struct {
	Results []struct {
		Columns []string        `json:"columns"`
		Types   []string        `json:"types"`
		Values  [][]interface{} `json:"values"`
	} `json:"results"`
}

func writeResult(w http.ResponseWriter, raw []byte, err error) {
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}
	var qr queryResponse
	json.Unmarshal(raw, &qr)

	rows := []map[string]interface{}{}
	if len(qr.Results) > 0 && len(qr.Results[0].Values) > 0 {
		cols := qr.Results[0].Columns
		for _, vals := range qr.Results[0].Values {
			row := map[string]interface{}{}
			for i, col := range cols {
				if i < len(vals) {
					row[col] = vals[i]
				}
			}
			rows = append(rows, row)
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(rows)
}

func getCount(raw []byte) int {
	var qr queryResponse
	json.Unmarshal(raw, &qr)
	if len(qr.Results) > 0 && len(qr.Results[0].Values) > 0 {
		if v, ok := qr.Results[0].Values[0][0].(float64); ok {
			return int(v)
		}
	}
	return 0
}

func envOrDefault(key, def string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return def
}
