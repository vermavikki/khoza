# Khoza (खोजा) — AI-Powered Indian Search Engine

Khoza is a production-oriented, India-first search engine inspired by the minimalism and usability of Google Search, with an original Indian identity and AI-powered cited answers.

## Architecture & Product Vision

- **India-First Identity:** Built with an authentic palette (Navy `#14213D`, Saffron `#F28C28`, Indian Green `#16845B`) and Hindi / English bilingual intelligence.
- **Search Orchestration Engine:** Multi-tiered search pipeline incorporating query normalization, language detection, Firestore intent-based caching, external search providers (Wikipedia API, DuckDuckGo, Google Grounding), and Gemini 3.8 Flash synthesis.
- **No Hallucinated Citations:** Every inline citation `[1]`, `[2]` is cross-checked against actual retrieved sources. Unverified claims or out-of-bound citation indices are discarded.
- **Persistent Caching:** Reusable searches are cached with category-specific TTL (evergreen knowledge: 14 days, news: 15 mins, live scores/prices: 2 mins).
- **Dual Platforms:**
  1. **Live Interactive Web & Android Simulator:** Runs out-of-the-box with Express + React, supporting voice input, language switching, instant search suggestions, and a Material 3 phone view.
  2. **Native Android Flutter App:** Feature-first Flutter application in `/flutter_app` with Riverpod, GoRouter, Material 3, and Firebase Authentication/Firestore.
  3. **Firebase Cloud Functions:** Backend in `/functions` with Firebase Admin SDK, Mumbai region (`asia-south1`), and scheduled cache maintenance.

---

## Repository Structure

```
├── server.ts                  # Express server & Search API endpoints
├── src/                       # Live Web & Simulator Application
│   ├── App.tsx                # Main search UI & view switcher
│   ├── components/            # UI components (AI answer, results, logo, drawers)
│   ├── services/              # Server-side search orchestrator
│   ├── utils/                 # Normalization, cache policy & unit tests
│   └── types/                 # TypeScript interfaces
├── flutter_app/               # Complete Native Android Flutter Application
│   ├── lib/                   # Flutter source code (Riverpod, Material 3, Dio)
│   ├── test/                  # Flutter widget and unit test suites
│   └── pubspec.yaml           # Flutter dependencies
├── functions/                 # Complete Firebase Cloud Functions
│   ├── src/                   # Search controller, providers, and cache service
│   └── package.json           # Cloud Functions dependencies
├── firestore.rules            # Cloud Firestore security rules
├── firestore.indexes.json     # Firestore compound indexes
├── firebase.json              # Firebase project configuration
├── ANDROID_BUILD.md           # Android release & build guide
├── SECURITY_PRIVACY.md        # Privacy controls and RBAC documentation
└── API_COSTS_USAGE.md         # API usage quotas and cost optimization
```

---

## Quickstart & Local Development

### 1. Running the Live Search Engine
```bash
npm install
npm run dev
```
Open `http://localhost:3000` to interact with Khoza in your browser or toggle the Android Material 3 Phone Simulator.

### 2. Running Automated Unit Tests
```bash
npx tsx --test src/utils/normalizer.test.ts
```

### 3. Deploying Firebase Cloud Functions
```bash
firebase deploy --only functions,firestore
```

---

## Key Features

1. **AI Answer Synthesis with Sources:** Direct answers with numbered citations that highlight corresponding sources when clicked.
2. **Indian Trending Topics:** Real-time updates for Cricket, ISRO/Chandrayaan, UPI/Digital India, Economy, and Green Energy.
3. **Bilingual Search:** Instant switching between English and Hindi with Devanagari script rendering.
4. **Voice Search:** Web Speech API integration in Hindi and English.
5. **Private History & Bookmarks:** Per-user isolated storage with one-click purge capabilities.
