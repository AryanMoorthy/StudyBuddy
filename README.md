# 🎓 StudyBuddy: Production-Grade Adaptive Learning Ecosystem

![StudyBuddy Banner](file:///C:/Users/aryan/.gemini/antigravity/brain/48bc78de-c334-4bcc-8122-42bf9746dcbc/studybuddy_readme_banner_1776698727223.png)

StudyBuddy is a next-generation education platform designed to optimize long-term retention through **behavioral analytics**, **mathematical priority modeling**, and **resilient AI integration**. It transforms raw study data into a personalized "Learning OS" that tells you exactly what to study, when, and why.

---

## 🧠 The Intelligence Architecture

StudyBuddy operates on a three-tier decision layer that eliminates "decision fatigue" for the student.

### 1. The Mathematical Brain (`learningEngine.js`)
The core engine implements a modified **SM-2 algorithms** and frequency-based decay models:
- **Priority Scoring**: Every topic receives a real-time priority score (0.0 - 1.0) weighted by:
  - **40% Accuracy**: Historic performance.
  - **30% Overdue Factor**: Time elapsed since the last review (Linear decay).
  - **20% Mistake Density**: Frequency of recent errors.
  - **10% Recency Decay**: Exponential decay ensuring cold topics aren't forgotten.
- **Smart Matcher**: A unique keyword-based heuristics engine that bridges legacy/uncategorized mistakes with current topics, ensuring 100% data visibility.

### 2. The Decision Layer (`actionEngine.js`)
Converts raw mathematical scores into human-centric study paths:
- **Today's Plan**: Generates a 4-step actionable study plan every 24 hours.
- **Mastery Distribution**: Automatically maintains a 70/20/10 time split:
  - **70% Growth**: Focused practice on weak topics.
  - **20% Revision**: Spaced repetition for overdue topics.
  - **10% Polishing**: Rapid review for high-mastery subjects.

### 3. The AI Coach & Resilience Channel
Powered by Gemini 1.5 Pro, optimized for high reliability:
- **Resilience Channel**: Built-in dual-key rotation and exponential backoff to handle API rate limits (429/503 errors).
- **Deterministic Failovers**: If the AI API is exhausted, the system seamlessly switches to local rule-based insights, ensuring the UI remains interactive and helpful 100% of the time.

---

## ✨ Features

- **Intelligence Portal**: A dedicated hub for AI-generated summaries, practice quizzes, and "Mistake Mastery" drills.
- **Advanced Dashboard**: Real-time Recharts-powered visualizations showing performance trends, subject efficiency, and mastery pulse.
- **Mistake Mastery System**: Automatically captures failed quiz attempts and transforms them into targeted practice sessions.
- **Deep Focus Mode**: A Pomodoro-integrated study environment with spatial audio (Study Music) and distraction-free UIs.
- **Smart Learning Profile**: A persistent intelligence profile that tracks your strong and weak topics over time.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 18 (Vite), TailwindCSS, Framer Motion |
| **Backend/DB** | Supabase (Auth, PostgREST, Realtime) |
| **Intelligence** | Gemini 1.5 Flash / Pro (via Vertex AI logic) |
| **Analytics** | Recharts (Responsive/Mount-Guarded) |
| **Deployment** | production-optimized static build |

---

## 📂 Repository Structure

```bash
src/
├── services/     # The "Heavy Lifting" (AI, DB, Logic Engines)
├── hooks/        # UI-Logic abstraction (Intelligence, Audio, Auth)
├── context/      # Global State Orchestration
├── components/   # Atomic & Molecular UI elements (Glassmorphism)
└── pages/        # Premium analytical views
```

---

## 🚀 Getting Started

1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/AryanMoorthy/StudyBuddy.git
    ```
2.  **Configure Environment**:
    Create a `.env` file with your credentials:
    ```env
    VITE_SUPABASE_URL=your_url
    VITE_SUPABASE_ANON_KEY=your_key
    VITE_GEMINI_API_KEY=your_key
    ```
3.  **Install & Launch**:
    ```bash
    npm install
    npm run dev
    ```

---

> [!TIP]
> Use the **Simulation Mode** (the Zap icon) in the Intelligence Portal to generate study material locally without consuming AI API credits.

---

**Built with ❤️ for better learning.**
