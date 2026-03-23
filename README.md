# 📚 StudyBuddy — AI Powered Study Companion

> A fully-featured, React-based study management system with AI-powered learning assistance, built as part of the Scaler curriculum.

---

## 🚀 Live Demo

Run locally with:
```bash
npm install
npm run dev
```
Then open **https://study-buddy-one-omega.vercel.app/dashboard** in your browser.

---

## 🏗️ Tech Stack

| Category | Technology |
|----------|-----------|
| Framework | React 18 (Vite) |
| Routing | React Router DOM v6 |
| State Management | Context API + Custom Hooks |
| AI Integration | Google Gemini 2.5 Flash |
| Charts | Recharts |
| Calendar | React Calendar |
| Animations | Framer Motion |
| HTTP Client | Axios |
| Notifications | React Toastify |
| Date Utilities | date-fns |
| Icons | React Icons (Material Design) |
| Styling | Vanilla CSS (Dark Glassmorphism Theme) |

---

## ✨ Features

### 📊 Dashboard (`/dashboard`)
- Overview of all study statistics (total, completed, pending, revision tasks)
- Subject-wise progress bar chart powered by **Recharts**
- Upcoming revision reminders panel
- Fully responsive 4-column stats grid

### 📖 Subject Management (`/subjects`)
- Create subjects with custom **color labels** and descriptions
- Add nested **topics** per subject with difficulty levels (Easy / Medium / Hard)
- Topic status tracking: **Not Started → In Progress → Completed → Needs Revision**
- Delete subjects (automatically removes all associated topics)

### ✅ Task Management (`/tasks`)
- Create study tasks with subject, topic, deadline, and priority
- **Tabbed view**: All · Pending · Completed · Overdue · Revision
- Priority selector with colour-coded buttons (🟢 Low · 🟡 Medium · 🔴 High)
- Search bar with real-time filtering
- Filter by subject and priority
- Toggle task completion status in one click

### 🗓️ Revision Planner (`/revision`)
- Interactive dark-themed calendar (react-calendar)
- Revision sessions displayed per selected date
- Magenta dot indicator on days with scheduled revisions
- Click a revision to mark it as completed

### 🤖 AI Study Assistant (`/ai-tools`)
- Powered by **Google Gemini 2.5 Flash**
- Generate content for any of your topics:
  - 📝 **Topic Summary** — condensed bullet-point review
  - ❓ **Practice Quiz** — 5 questions with answers
  - 🃏 **Flashcards** — 5 Q&A cards for spaced repetition
- Results rendered as **formatted Markdown** (bold, headings, lists, dividers)
- One-click copy to clipboard

---

## 🗂️ Project Structure

```
src/
├── components/
│   ├── Layout.jsx          # Sidebar + Outlet wrapper
│   ├── SearchBar.jsx       # Reusable search input
│   ├── SubjectCard.jsx     # Subject display card
│   ├── TaskCard.jsx        # Task display card with status toggle
│   ├── ProgressChart.jsx   # Recharts bar/pie chart wrapper
│   └── RevisionList.jsx    # Revision items list
├── pages/
│   ├── Dashboard.jsx       # /dashboard
│   ├── Subjects.jsx        # /subjects
│   ├── Tasks.jsx           # /tasks
│   ├── Revision.jsx        # /revision
│   └── AITools.jsx         # /ai-tools
├── context/
│   └── StudyContext.jsx    # Global state (subjects, topics, tasks)
├── hooks/
│   ├── useTasks.js         # Task CRUD + categorization
│   ├── useSubjects.js      # Subject & topic CRUD
│   ├── useProgress.js      # Analytics calculations
│   └── useDebounce.js      # Search debouncing
├── services/
│   └── aiService.js        # Gemini API integration
├── utils/
│   └── helpers.js          # Shared utility functions
└── styles/
    └── global.css          # Design system + dark theme tokens
```

---

## ⚛️ React Concepts Used

| Concept | Usage |
|---------|-------|
| `useState` | Form inputs, modal visibility, active tabs, filters |
| `useEffect` | localStorage persistence, analytics |
| `useContext` | Accessing global state across all pages |
| `useMemo` | Optimised progress calculations in `useProgress` |
| **Context API** | `StudyContext` provides subjects, topics, tasks app-wide |
| **Custom Hooks** | `useTasks`, `useSubjects`, `useProgress`, `useDebounce` |
| **React Router DOM** | 5 routes with nested layout and `<Outlet>` |
| **Lazy Loading** | Pages loaded with `React.lazy` + `Suspense` |
| **Framer Motion** | Animated modal entry (`scale` + `y` transitions) |

---

## 📦 Installation

```bash
# Clone or navigate to the project folder
cd "Study Companion"

# Install dependencies
npm install

# Start the development server
npm run dev
```

---

## 🔑 AI API Key

The project uses the **Google Gemini API**. The API key is pre-configured in:

```
src/services/aiService.js
```

To use your own key, replace the value of `GEMINI_API_KEY` in that file.  
Get a free key at: **https://aistudio.google.com/apikey**

---

## 💾 Data Persistence

All data (subjects, topics, tasks) is stored in the browser's **localStorage**, so your data persists across page refreshes without needing a backend.

---

## 📱 Responsive Design

| Breakpoint | Layout |
|-----------|--------|
| > 1024px | Full sidebar + multi-column grids |
| 768–1024px | Collapsed icon-only sidebar |
| < 768px | Bottom navigation bar, single-column layout |

---

## 👨‍💻 Author

**Aryan**  
Built as part of the Scaler Academy React curriculum — RD 3 Project.
