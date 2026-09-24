# Explanation Tutor — Design System & Visual Specification

A comprehensive reference for the design philosophy, typographic hierarchy, color palette, component library, and visual grammar of **Explanation Tutor**.

---

## 1. Core Philosophy & Tone

- **Pedagogy First:** Never provide flat answers. Always explain *why* before *how*.
- **Layered Depth:** Every major concept and data point is explained in 3 progressive tiers:
  1. **In Simple Words:** A 2-sentence intuitive analogy that anyone can grasp immediately.
  2. **First-Principles Breakdown:** The causal mechanisms, physics, atmospheric dynamics, or algorithmic steps operating under the hood.
  3. **Real-World Context / Example:** Grounded, concrete scenarios detailing practical relevance and consequences.
- **Visual-First Grammar:** No intimidating walls of text. Every concept is accompanied by clean SVG diagrams, structured comparison matrices, or layered architecture blocks.
- **Tone:** Confident, warm, encouraging, intellectually rigorous, and jargon-free.

---

## 2. Typography

| Role | Font Family | Fallback | Weights | Usage |
| :--- | :--- | :--- | :--- | :--- |
| **Primary UI & Headings** | `Plus Jakarta Sans` | `system-ui, -apple-system, sans-serif` | 400, 500, 600, 700, 800 | Headings, button labels, body text, badges |
| **Code & Technical Data** | `JetBrains Mono` | `ui-monospace, monospace` | 400, 500, 600 | Code scaffolds, timestamps, telemetry figures, file paths |

Font rendering is optimized with `font-display: swap`, subpixel antialiasing, and tight tracking on headings (`tracking-tight`).

---

## 3. Color Palette & Semantics

The palette uses a modern, high-contrast "vibe-coding" indigo aesthetic with dark mode parity.

### Primary & Accents
- **Brand Primary:** `indigo-600` (`#4f46e5`) / Dark mode: `indigo-400` (`#818cf8`)
- **Telemetry Sky:** `sky-500` (`#0ea5e9`) / Dark mode: `sky-400` (`#38bdf8`)
- **Success / Validated:** `emerald-500` (`#10b981`) / `emerald-400` (`#34d399`)
- **Warning / Attention:** `amber-500` (`#f59e0b`) / `amber-400` (`#fbbf24`)
- **Error / Failure:** `rose-600` (`#e11d48`) / `rose-400` (`#fb7185`)

### Neutral Surface Hierarchy
| Level | Light Mode | Dark Mode | Usage |
| :--- | :--- | :--- | :--- |
| **Canvas Background** | `slate-50` (`#f8fafc`) | `slate-950` (`#020617`) | Main application canvas |
| **Card / Surface** | `white` (`#ffffff`) | `slate-900` (`#0f172a`) | Primary content cards, modals, tabs |
| **Sub-surface / Wells**| `slate-100` (`#f1f5f9`)| `slate-800/80` (`#1e293b`)| Stat tiles, code preview backgrounds |
| **Borders** | `slate-200/90` (`#e2e8f0`)| `slate-800` (`#1e293b`) | Clean 1px structural dividers |
| **Text Primary** | `slate-950` (`#020617`) | `slate-100` (`#f1f5f9`) | Headings and high-contrast titles |
| **Text Secondary** | `slate-600` (`#475569`) | `slate-400` (`#94a3b8`) | Body explanations, descriptions |
| **Text Tertiary** | `slate-400` (`#94a3b8`) | `slate-500` (`#64748b`) | Timestamps, attribution, file paths |

---

## 4. Visual Grammar for Explanations

1. **Sequential Mechanisms & Processes:**
   - Visualized through numbered SVG flow nodes (`1 → 2 → 3`), connected with directed directional arrows and pulse indicators.
2. **Contrasts & Comparisons:**
   - Multi-column side-by-side matrices contrasting Trade-offs, Pros vs. Cons, or Legacy vs. Modern approaches.
3. **Layered System Stacks (Build Mode):**
   - Color-banded vertical tiers (Client UI → API Gateway → Domain Logic → Relational DB) annotated with runtime responsibilities and verified technology badges.
4. **Real-Time Telemetry (Mode B):**
   - Live KPI cards with instant status badges (`Live Telemetry`, `Clear`, `+2.1%`), source badges, last-updated timestamps, and animated SVG trendline bars.
5. **Architectural Scaffolding (Mode C):**
   - Tabbed IDE-style code viewer with per-file copy, syntax badges, directory tree hierarchies, and complete starter code implementations.

---

## 5. Animation & Motion Standards

- Fast and subtle: transitions stay between `150ms` and `250ms` (`ease-out`).
- Loading states utilize layout-mirroring skeletons (`animate-pulse`) instead of generic centered spinners.
- Rotation animations (`animate-spin`) are reserved for live refresh actions and API calls.
- Full respect for `prefers-reduced-motion` via Tailwind utility conventions.

---

## 6. Accessibility (a11y)

- **Contrast:** Exceeds WCAG AA guidelines (> 4.5:1 for normal text, > 3:1 for large text and interactive components).
- **Keyboard Navigation:** Full tab order with visible ring focus states (`focus-visible:ring-2 focus-visible:ring-indigo-500`).
- **Screen Reader Announcements:** `aria-live="polite"` and `aria-live="assertive"` on dynamically loaded explanations and error notifications.
- **Touch Targets:** All interactive buttons and chips adhere to minimum 40px–44px touch boundaries.
