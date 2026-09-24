# Explanation Tutor (`explanation-tutor.ai.studio`)

> **"AI that helps people understand deeply, not just gives answers."**

An AI-powered cognitive educational platform designed to build deep, first-principles mental models for complex technical, scientific, and mathematical concepts.

---

## 🌟 The Three Core Modes

### Mode A: Explain a Concept
- **Pedagogy First:** Breaks down any topic from first principles.
- **3-Layer Depth Structure:**
  1. *In Simple Words:* A 2-sentence analogy anyone can grasp.
  2. *First-Principles Explanation:* How it works under the hood (causal mechanics, equations, state transitions).
  3. *Real-World Example:* Grounded scenario demonstrating practical relevance.
- **Auto-Generated Clean Visuals:** Process flow diagrams, side-by-side comparison tables, architecture stacks, or concept maps.
- **"Try it Yourself" Challenge:** Question, hint, and rubric-based code/text evaluation.
- **Micro-Tuning Actions:** "Go Deeper", "Make Simpler", "Show Another Analogy", or "Step-by-Step Breakdown".

### Mode B: Real-Time Information
- **Live Verified Feeds:** Directly queries Open-Meteo for global meteorological conditions, CoinGecko for live crypto/financial telemetry, macroeconomic rate indices, and current news topics.
- **First-Principles Synthesis:** Explains the physical or economic causal mechanism behind the live numbers.
- **Telemetry UI:** Live KPI stat tiles (value, change %, subtext), source citations, and timestamps.
- **Live Interactive Refresh:** Dedicated refresh button that queries the latest data instantly.
- **Visual Trendlines:** SVG trend diagrams with hover indicators and summary insights.

### Mode C: Build Something (Software & Product Architect)
- **Interactive System Architect:** Turn any app idea into a production-grade working blueprint.
- **Complete Blueprint Deliverable:**
  1. *Project Brief:* Tagline, target audience, core goal, key functional features.
  2. *Architecture Diagram:* Multi-layer stack (Client UI → Gateway → Business Logic → Relational DB) with technology badges and sequential data pipelines.
  3. *Tech Stack Justification:* Categorized decisions (Frontend, Backend, DB, Auth, DevOps) with concrete rationales.
  4. *Project File Tree:* Directory organization and component hierarchy.
  5. *Phased Implementation Plan:* Numbered milestones with checklists and estimated hours.
  6. *Working Code Scaffolds:* Complete starter code for React components, Express API routes, and SQL schemas.
  7. *Copy & Export:* Per-file copy, "Copy All Scaffolds", and export to Markdown.
- **Blueprint Storage:** Save architectures to local storage for quick access across sessions.

---

## 🚀 Key Architecture & Capabilities

### 1. Robust API Gateway (`server.ts`)
- `POST /api/explain` → Pedagogical explanations with integrated visual diagram schema.
- `POST /api/realtime` → External live telemetry fetching + Gemini synthesis + pedagogical fallback.
- `POST /api/build` → Product architecture & working code scaffold generation.
- `POST /api/code-tutor` → Deep diagnostics on runtime complexity, memory leaks, and logic errors.
- `POST /api/evaluate-challenge` → Rubric-based evaluation of user code submissions.
- `POST /api/analyze-material` → Document & PDF study material analysis.

### 2. High-Performance Frontend
- **React 18 + TypeScript + Vite + Tailwind CSS**
- **Lazy Route Splitting:** Non-critical views lazy-loaded via `React.lazy()` + `<Suspense>`.
- **Skeleton Loaders:** Custom skeleton layouts mirroring output structures, eliminating layout shifts.
- **Persistent State:** Local storage hooks (`useExplanation`, `useRealTime`, `useBuild`) preserve active sessions and history.

---

## 🏃 Local Run & Development

```bash
# 1. Install dependencies
npm install

# 2. Run in development mode (starts Node/Express + Vite on port 3000)
npm run dev

# 3. Type-check & lint codebase
npm run lint

# 4. Compile and verify production build
npm run build
```

---

## 🚀 Performance & Bundle Optimization

- **Dynamic Code Splitting**: Heavy components (`LearningPathView`, `CodeTutorView`, `MyMaterialsView`, `SettingsView`, `LearningFlowVisual`) are lazy-loaded via `React.lazy()` + `<Suspense>`.
- **Skeleton Screens**: Responsive skeleton screens (`animate-pulse`) mirror explanation and diagram card structures, eliminating layout shift and replacing generic spinners.
- **Vendor Chunk Splitting**: Vite Rollup config splits vendor dependencies into isolated cacheable chunks (`vendor-react`, `vendor-icons`, `vendor-motion`).
- **Font & Asset Optimization**: Preconnected font origins, `font-display: swap` for `Plus Jakarta Sans` and `JetBrains Mono`, and SVGs for zero raster overhead.
- **SEO & Social Metadata**: Rich JSON-LD structured data (`SoftwareApplication`, `EducationalApplication`), OpenGraph 1200×630 cards, canonical link, and PWA Web Manifest.

---

## ♿ Accessibility (a11y) & UI/UX Standards

- **WCAG AA Compliance**: High-contrast slate and indigo palette verified across light and dark modes.
- **Focus Management**: Screen-reader and keyboard focus is automatically shifted to the explanation panel (`aria-live="polite"`, `tabIndex={-1}`) upon generation.
- **Mobile-First Responsive Layout**: Single column layout on small viewports with horizontal scrolling for diagrams/code blocks; touch targets meet or exceed 44×44px.
- **Persistent Theme System**: Light and dark mode support with automatic `localStorage` synchronization and system `prefers-color-scheme` fallback.
- **Full Keyboard Operability**: Complete keyboard accessibility (Tab, Enter, Space) for interactive nodes, mode selectors, audio controls, and modal triggers.

---

## 🛠️ Project Structure

```
├── public/
│   ├── favicon.svg             # Brand vector icon
│   ├── og-image.svg            # 1200x630 social preview card
│   └── site.webmanifest        # Progressive Web App manifest
├── src/
│   ├── components/             # Reusable UI & view components
│   │   ├── CodeTutorView.tsx   # Code debugging & challenge evaluator
│   │   ├── DashboardView.tsx   # Learning dashboard & history
│   │   ├── ExplanationSkeleton.tsx # Layout-mirroring pulse skeleton
│   │   ├── ExplanationWorkspace.tsx # Multi-depth cognitive explanation view
│   │   ├── HeroIllustration.tsx# Visual concept graphic
│   │   ├── HeroInput.tsx       # Search query & voice input bar
│   │   ├── LearningFlowVisual.tsx # Methodology pipeline
│   │   ├── LearningPathView.tsx# Structured curriculum trees
│   │   ├── MyMaterialsView.tsx # Saved topics & document upload
│   │   ├── Navbar.tsx          # Accessible sticky header & theme toggle
│   │   ├── SettingsView.tsx    # User preferences & reset
│   │   └── VisualDiagram.tsx   # Polymorphic visual diagrams
│   ├── data/
│   │   └── mockData.ts         # Multi-depth presets & curated backups
│   ├── hooks/
│   │   ├── useSpeech.ts        # Browser SpeechSynthesis hook
│   │   └── useTheme.ts         # Persistent light/dark theme hook
│   ├── services/
│   │   ├── api.ts              # Resilient API client with backoff & validation
│   │   ├── storage.ts          # LocalStorage persistence layer
│   │   └── tutorService.ts     # Backward-compatible service facade
│   ├── App.tsx                 # Main application state & route coordinator
│   ├── index.css               # Tailwind CSS v4 entry point
│   ├── main.tsx                # React DOM mount point
│   └── types.ts                # TypeScript strict interface definitions
├── index.html                  # HTML entry point with JSON-LD & meta
├── server.ts                   # Express server proxy with Google GenAI SDK
├── tsconfig.json               # TypeScript strict configuration
└── vite.config.ts              # Vite configuration with chunk splitting
```

---

## 💻 Getting Started Locally

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Gemini API Key**: Set `GEMINI_API_KEY` in your environment (optional; offline curated fallback presets are built-in for key concepts).

### Installation
```bash
# 1. Clone repository
git clone <repo-url>
cd explanation-tutor

# 2. Install dependencies
npm install

# 3. Start development server (Node + Vite on Port 3000)
npm run dev
```

The application will be running at `http://localhost:3000`.

---

## 🧪 Testing & Quality Assurance

```bash
# Type check and syntax validation
npm run lint

# Production build bundle
npm run build

# Preview production build locally
npm run preview
```

---

## 🚢 Deployment

To build and run in a production environment:

```bash
# Build the client bundle
npm run build

# Start the full-stack server
npm run start
```
