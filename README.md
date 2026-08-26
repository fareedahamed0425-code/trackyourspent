# 💵 trackyourspent

<div align="center">
  <img src="public/logo.svg" alt="trackyourspent logo" width="128" height="128" />
  <br/>
  <br/>

![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)
![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript_Strict-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-37_Tests_Passing-6E9F18?style=for-the-badge&logo=vitest&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-Security_Enforced-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)
![WCAG](https://img.shields.io/badge/Accessibility-WCAG_2.1_AA-10B981?style=for-the-badge)

</div>

**trackyourspent** is an enterprise-grade, high-performance financial management web application with day-wise expense logging, PDF/CSV bank statement reconciliation, financial auto-calculation, AI financial advisory, and end-to-end cloud synchronization.

---

## 🏛️ System Architecture

```
+--------------------------------------------------------------------+
|                         TrackYourSpent UI                          |
|  (React 19 + TypeScript Strict + Tailwind CSS + Motion + Lucide)   |
+---------------------------------+----------------------------------+
                                  |
            +---------------------+---------------------+
            |                     |                     |
     [React Router DOM]    [Custom Hooks Layer]  [Local Storage Cache]
            |             (useExpenses/useBanks)        |
     +------+------+              |              +------+------+
     | 9 Core Views|       [Cloud Sync Engine]   | Offline-1st |
     | - Dashboard |              |              | Fast Resync |
     | - Day-Wise  |       +------+------+       +-------------+
     | - AI Advisor|       | Firestore DB|
     | - Banks/PDF |       |SecurityRules|
     | - Auto-Calc |       +-------------+
     | - Categories|
     | - History   |
     | - Export    |
     | - Settings  |
     +-------------+
            |
    [Vite Reverse Proxy]
            |
    +-------+-------+
    | NVIDIA AI API | (Nemotron-3-Ultra 550B SSE Streaming)
    +---------------+
```

For detailed architectural specifications, refer to [Architecture Documentation](docs/ARCHITECTURE.md).

---

## 🔒 Security Architecture & Cloud Rules

1. **Firestore & Storage Security Rules:** Strict tenant isolation (`request.auth.uid == userId`) in `firestore.rules` and `storage.rules`. No user can view or alter other users' data.
2. **Reverse Proxy Protection:** AI requests pass through a server-side proxy (`/api/nvidia`) in `vite.config.ts`, avoiding client-side credential exposure and bypassing CORS issues safely.
3. **Expression Sandboxing:** `evaluateMathExpression()` strictly allows characters `[0-9+\-*/().%\s]` and rejects arbitrary JavaScript execution, prototype pollution, or code injection.
4. **Vulnerability Audit:** `npm audit` reports **0 known vulnerabilities**.

For complete threat modeling, refer to [Security Model Documentation](docs/SECURITY.md).

---

## 🤖 AI Financial Advisor Pipeline

- **Model:** `nvidia/nemotron-3-ultra-550b-a55b` via NVIDIA AI Foundation Endpoints.
- **Protocol:** Real-time Server-Sent Events (SSE) streaming with buffer parsing.
- **Context Injection:** Injects live serialized financial JSON (ledger, budgets, category aggregates) into prompt context for actionable budgeting insights.
- **Clean Markdown Engine:** Custom parsing converts `**bold**` into `<strong>` and displays cleanly formatted lists without raw markdown symbols.

For pipeline details, refer to [AI Pipeline Documentation](docs/AI_PIPELINE.md).

---

## ⚡ Performance & Bundle Optimization

- **Granular Code Splitting (`manualChunks`):**
  - `react-vendor`: 49.43 kB (17.46 kB gzip)
  - `motion-vendor`: 96.80 kB (32.00 kB gzip)
  - `firebase-vendor`: 670.62 kB (166.17 kB gzip)
  - `icons`: 852.32 kB (157.45 kB gzip)
  - `index`: 916.03 kB (264.32 kB gzip)
- **Memoization:** `useMemo` applied to 7-day variance loops and search filters; `useCallback` on all state mutators; `React.memo` on atomic components.
- **Zero Cumulative Layout Shift:** Responsive layouts locked with `overflow-x: hidden`.

For detailed benchmark comparisons, refer to [Performance Documentation](docs/PERFORMANCE.md).

---

## 🧪 Testing Metrics & Coverage

- **Runner:** Vitest with jsdom and `@testing-library/react`.
- **Suite Count:** **18 complete test suites** across unit, component, failure-path, security, and performance dimensions.
- **Test Count:** **37 / 37 passing tests (100%)**.

```bash
# Run test suite
npm test

# Run tests in watch mode
npm run test:watch

# Build production bundle
npm run build

# Type check & lint
npm run lint
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm.

### Installation

```bash
# 1. Clone repository
git clone https://github.com/fareedahamed0425-code/trackyourspent.git
cd trackyourspent

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env

# 4. Start local development server
npm run dev
```

---

<p align="center">Built with ❤️ for High Performance & Precision Financial Engineering.</p>
