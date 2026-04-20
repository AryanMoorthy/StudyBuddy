# 🎓 StudyBuddy: Production-Grade Adaptive Learning Ecosystem

StudyBuddy is a next-generation education platform built to optimize long-term retention using adaptive analytics and AI-driven decision-making.

## 🚀 The Intelligence Layer

The application features a sophisticated three-tier decision layer that transforms tracking data into actionable guidance:

### 1. The Brain (`learningEngine.js`)
At the core is a mathematical engine that calculates:
- **Spaced Repetition (SM-2)**: Predictive scheduling for optimal revision windows.
- **Priority Scoring**: A 0.0 - 1.0 score based on accuracy, recency, and mistake density.
- **Overdue Penalty**: Linear decay models that ensure forgotten topics surface to the top of your queue.

### 2. The Decision Layer (`actionEngine.js`)
Converts mathematical scores into human study paths:
- **Today's Plan**: A deterministic 4-step plan generated daily.
- **Strategic Distribution**: Automatically balances your time: **70% Growth** (Weak Topics), **20% Revision** (Overdue), and **10% Polishing** (Strong).

### 3. The AI Coach (`aiCoach.js`)
A semantic intelligence layer powered by Gemini:
- **Behavioral Insights**: Synthesizes your session history into concise, actionable coaching tips.
- **Deterministic Fallbacks**: Robust rule-based fallbacks ensure you receive guidance even without API connectivity.

---

## ✨ Core Features

*   **Actionable Dashboard**: One-click "Start Step" buttons that deep-link directly into Focus Mode.
*   **Mistake Mastery**: A dedicated persistence system that extracts failed questions for targeted re-practice.
*   **Immersive Focus Mode**: A Pomodoro-driven environment with integrated Study Music (Lofi, Nature, Classical).
*   **Curriculum Management**: Structured organization of Subjects and Topics with granular performance tracking.
*   **Adaptive Theme**: Premium Dark/Glassmorphism UI designed for long study sessions without eye strain.

---

## 📂 Architecture

- **`src/services/`**: logic and data layer (Supabase, Action Engine, AI Service).
- **`src/context/`**: Global state management (Study, Focus, Auth).
- **`src/hooks/`**: Specialized logic extraction (e.g., `useLearningIntelligence`).
- **`src/pages/`**: Premium UI views built with React and Framer Motion.

---

## 🛠️ Tech Stack
- **React 18** + **Vite**
- **Supabase** (Auth, PostgREST, Realtime)
- **Gemini 1.5 Pro** (Intelligence Generation)
- **Framer Motion** (Micro-animations)
- **TailwindCSS** (High-fidelity design)
- **Recharts** (Performance visualization)

---

> [!IMPORTANT]
> To enable AI Coaching, ensure your `VITE_GEMINI_API_KEY` is configured in your environment variables.
