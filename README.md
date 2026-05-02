# SyncBoard 🚀

> Real-time team coordination with AI-powered standup summaries

**Live Demo:** [https://team-collab-tool-12114.web.app](https://team-collab-tool-12114.web.app)

---

## ✨ Features

- **Real-time Kanban Board** — Drag-and-drop tasks with instant sync via Firestore `onSnapshot()`
- **AI Standup Summaries** — Gemini 1.5 Flash generates 3-bullet summaries in seconds
- **Task Visibility Metrics** — Bottleneck detection, completion rate, priority bars
- **Keyboard Accessible** — Full WCAG 2.1 AA: skip links, ARIA labels, focus rings
- **Dark Mode** — System preference detection + toggle with localStorage persistence
- **Offline Support** — Firestore IndexedDB persistence for offline reads

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + TypeScript 5 (strict) |
| Styling | Tailwind CSS 3 |
| Build | Vite 6 |
| Database | Firebase Firestore 10 (real-time) |
| AI | Google Gemini 1.5 Flash |
| Drag & Drop | @dnd-kit (multi-sensor) |
| Validation | Zod 3 |
| Testing | Vitest + Testing Library |
| Hosting | Firebase Hosting |

---

## 🚀 Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env.local
# Fill in your Firebase config and Gemini API key

# 3. Run development server
npm run dev

# 4. Run tests
npm test

# 5. Build for production
npm run build
```

---

## 🏛️ Architecture

```
src/
├── components/
│   ├── Board.tsx          # DnD context + column layout
│   ├── Column.tsx         # Droppable column with sortable tasks
│   ├── TaskCard.tsx       # Draggable card (React.memo)
│   ├── TaskModal.tsx      # Create/edit form with Zod validation
│   ├── StandupModal.tsx   # Gemini AI summary modal
│   ├── VisibilityPanel.tsx # Metrics sidebar
│   └── Header.tsx         # Nav with live indicator
├── hooks/
│   ├── useTasks.ts        # Firestore real-time hook
│   └── useDarkMode.ts     # Theme persistence
├── lib/
│   ├── firebase.ts        # Firebase init + offline persistence
│   ├── gemini.ts          # Gemini API + rate limiting
│   ├── metrics.ts         # Pure metric computation
│   ├── utils.ts           # Sanitization, Zod schema, helpers
│   └── constants.ts       # Column/priority config
├── types/index.ts         # TypeScript interfaces
└── test/                  # Vitest test suites
```

**Data Flow:**
1. User creates/edits task → Zod validates → Firestore `addDoc/updateDoc`
2. `onSnapshot()` listener fires → all connected clients update instantly
3. Drag end → optimistic status update → Firestore `updateDoc`
4. Standup click → Gemini prompt with board snapshot → 3-bullet JSON summary

---

## 🔒 Security

| Layer | Mechanism |
|-------|-----------|
| Client | Zod schema validation + `sanitizeString()` |
| Server | Firestore Security Rules validate all fields |
| AI | Gemini rate limiting (5 calls/min) + safety settings |
| XSS | No `dangerouslySetInnerHTML`, input sanitization |
| Secrets | `.env.local` gitignored |
| Headers | X-Frame-Options, CSP, X-XSS-Protection via Firebase Hosting |

---

## ♿ Accessibility (WCAG 2.1 AA)

- Skip-to-content link
- ARIA roles: `dialog`, `region`, `list`, `listitem`, `progressbar`
- `aria-live` on standup modal for screen reader announcements
- Visible focus rings (`:focus-visible`)
- All interactive elements keyboard accessible
- Color contrast ≥ 4.5:1

---

## 🧪 Testing

```bash
npm test             # Run all tests (13 cases across 3 suites)
npm run test:coverage # Generate coverage report
```

| Suite | Tests |
|-------|-------|
| `metrics.test.ts` | 7 — empty state, status counts, completion %, bottleneck, priority, cycle time |
| `utils.test.ts` | 6 — XSS sanitization, Zod schema validation |
| `TaskCard.test.tsx` | 5 — rendering, ARIA labels |

---

## 🚀 Deploy

```bash
# Build
npm run build

# Deploy to Firebase Hosting + Firestore rules
firebase deploy
```
