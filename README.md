# 📚 StudyBuddy — AI-Augmented Intelligence Portal

[![React](https://img.shields.io/badge/React-18-blue?logo=react)](https://reactjs.org/)
[![PostgreSQL](https://img.shields.io/badge/Database-Supabase-green?logo=supabase)](https://supabase.com/)
[![AI](https://img.shields.io/badge/AI-Gemini_2.5_Flash-orange?logo=google-gemini)](https://aistudio.google.com/)
[![License](https://img.shields.io/badge/License-MIT-purple)](LICENSE)

> **StudyBuddy** is a high-fidelity, neuro-scientific study management system. It merges modern UI/UX principles with the **SM-2 Spaced Repetition Algorithm** and **Generative AI** to transform passive learning into an active mastery loop.

---

## 🧠 The Intellectual Core

Most study tools are static lists. **StudyBuddy** is a dynamic engine that evolves with your brain's retention patterns.

### 🌓 1. SM-2 Spaced Repetition Engine
Integrated into the **Revision Engine**, the SM-2 algorithm calculates exactly when you'll forget a topic. 
- **Dynamic Intervals**: Based on your self-assessment (1-5), the system schedules the next review between 1 to 30 days.
- **Easiness Factor (EF)**: Every topic carries an internal "EF" that shifts based on how easily you recall the material, ensuring "Hard" topics appear significantly more often than "Easy" ones.

### 🚨 2. Proprietary Mistake Mastery Loop
The **AI Intelligence Portal** doesn't just give you answers; it captures your logical flaws.
- **Automatic Persistence**: Incorrectly answered quiz questions are instantly moved to a persistent **Mistakes Queue** in Supabase.
- **Verification Threshold**: A question is only retired from your practice queue after **two consecutive correct attempts**, ensuring true mastery rather than a lucky guess.

---

## 🚀 Core Pillars

### 📊 Tactical Dashboard
A high-level command center providing a holistic view of your academic progress.
- **Real-time Analytics**: Mastery trends and subject-wise progress bars powered by `recharts`.
- **Active Pipeline**: High-priority topics due for revision are surfaced instantly.

### ✅ Study Tasks & Focus Areas
A granular planning tool to define your daily study targets.
- **Fluid Toggles**: Mark tasks as "Mastered" or "Reviewed" with one tap.
- **Metadata Tagging**: Categorize topics by difficulty and subject to filter your focus.

### 🤖 AI Intelligence Portal
Augment your study materials using the world's most advanced synthetic reasoning.
- **Flashcard Synthesis**: Generate 3D-flipping cards for active recall.
- **Logic Assessments**: Take AI-generated quizzes with deep explanatory feedback.
- **Topic Distillation**: Create structured markdown summaries of complex topics in seconds.

---

## 🎨 Design System: "Obsidian Glass"

StudyBuddy follows a **Dark Glassmorphism** aesthetic designed to minimize eye strain and maximize focus during long sessions.

- **Semantic Tokens**: The entire UI is built on a theme-aware token system (e.g., `bg-background`, `bg-card`).
- **Mode Persistence**: A floating theme toggle allows instant switching between deep obsidian and clean linear modes, with preference stored in `localStorage`.
- **Micro-Animations**: Powered by `framer-motion` for a premium, tactile feel.

---

## 🏗️ Technical Infrastructure

| Layer | Implementation |
|-------|----------------|
| **Framework** | React 18 (Vite) |
| **Database** | Supabase (PostgreSQL) |
| **Logic** | Custom Hooks + Context API |
| **AI Model** | Gemini 2.5 Flash |
| **Security** | Row Level Security (RLS) |

### 🔐 Security & Persistence
Unlike standard educational apps, StudyBuddy uses **Cloud-Grade Persistence**. All your subjects, topics, and study sessions are synced to a Supabase backend with user-specific isolation.

> [!IMPORTANT]
> **Developer Bypass**: To facilitate testing without API rate-limits, developers can run `localStorage.setItem("devBypass", "true")` in the console to enter a secure sandbox mode.

---

## ⚙️ Installation & Setup

1. **Clone the Repository**
   ```bash
   git clone https://github.com/your-username/study-buddy.git
   ```

2. **Initialize Dependencies**
   ```bash
   npm install
   ```

3. **Database Setup**
   Run the SQL scripts located in `C:\Users\aryan\.gemini\antigravity\brain\...\supabase_setup.sql.md` in your Supabase SQL Editor.

4. **Launch Portal**
   ```bash
   npm run dev
   ```

---

## 📱 Responsiveness
| Device | Strategy |
|--------|----------|
| **Desktop** | Fixed premium sidebar with max-width content container. |
| **Tablet** | Collapsible sidebar drawer with grid-based layout shift. |
| **Mobile** | Single-column stack with touch-optimized floating toggles. |

---

## 👨‍💻 Author

**Aryan Moorthy**  
Developed as part of the **Scaler School of Technology** React Curriculum.
"Transforming the way developers and students master complexity."
