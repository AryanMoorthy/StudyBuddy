# 🎓 StudyBuddy: Production-Grade Adaptive Learning Ecosystem

![StudyBuddy Banner](file:///C:/Users/aryan/.gemini/antigravity/brain/48bc78de-c334-4bcc-8122-42bf9746dcbc/studybuddy_readme_banner_1776698727223.png)

StudyBuddy is a next-generation education platform designed to optimize long-term retention through **behavioral analytics**, **mathematical priority modeling**, and **resilient AI integration**. It transforms raw study data into a personalized "Learning OS" that tells you exactly what to study, when, and why.

---

## 🚨 The Challenge: Knowledge Decay
Traditional studying suffers from two major bottlenecks:
1.  **The Forgetting Curve**: Without timed intervention, 70% of new information is lost within 24 hours.
2.  **Decision Fatigue**: Students spend more time deciding *what* to study than actually studying.
3.  **Mistake Fragmentation**: Failed attempts in practice quizzes are rarely tracked, leaving critical knowledge gaps wide open.

---

## 💡 The Solution: Bionic Studying
StudyBuddy bridges the gap between raw data and cognitive mastery using a triple-layer orchestration engine.

### 1. The Mathematical Brain (`learningEngine.js`)
The core engine implements a modified **SM-2 algorithm** combined with a custom **Priority Scoring Model**:
- **Dynamic Weighting**: Topics are ranked (0.0 to 1.0) using a weighted average of **Accuracy (40%)**, **Overdue Factor (30%)**, and **Mistake Density (20%)**.
- **The Smart Matcher**: A heuristic keyword engine that bridges legacy/uncategorized mistakes with your current subjects. It ensures that even "General" mistakes are correctly attributed to their relevant topics (e.g., "Matrix" errors are automatically linked to "Linear Algebra").

### 2. The Decision Layer (`actionEngine.js`)
Converts complex scores into human-centric study paths:
- **Today's Plan**: Generates a 4-step actionable study plan every 24 hours.
- **Adaptive Mix**: Maintains a **70/20/10 time split** (70% Growth on weak areas, 20% Revision on overdue topics, 10% Polishing strong areas).

### 3. The Resilient AI Channel (`aiService.js`)
Designed for **100% Uptime** using a proprietary failover strategy:
- **Triple-Key Rotation**: Systematically cycles through `Primary → Secondary → Tertiary` Gemini API keys to bypass free-tier rate limits (429 errors).
- **Self-Healing Failover**: If the AI Cloud is entirely at capacity, the system automatically triggers the **Local Synthetic Engine**, generating high-fidelity mock material instantly.

---

## ✨ Premium Features

- **Intelligence Portal**: A dedicated hub for AI-generated summaries, practice quizzes, and "Mistake Mastery" drills.
- **Mistake Mastery System**: Automatically captures failed quiz attempts and transforms them into targeted practice sessions via the Smart Matcher.
- **AI Coach**: A background analytics layer providing proactive, cached coaching insights every 10 minutes.
- **Deep Focus Mode**: A Pomodoro-integrated study environment with spatial audio and distraction-free UIs.
- **State-of-the-Art UX**: Built with Framer Motion for spring-physics animations and a premium, glassmorphic aesthetic.

---

## 🛠️ Technical Decisions & Rationale

| Decision | Rationale |
| :--- | :--- |
| **Triple-Key Cyclic Rotation** | Solved the 429 bottleneck of AI Free Tiers, effectively tripling request quota for zero cost. |
| **Supabase Architecture** | Chose for **Real-time subscriptions** and **PostgREST**, enabling a highly responsive, serverless sync between analytics and the UI. |
| **Spring-Physics Animations** | Leveraged Framer Motion to reduce "Study Friction"—making the interface feel alive and rewarding to interact with. |
| **Throttled Intelligence** | Implemented a 10-minute cache/cooldown for the AI Coach to preserve token quota while maintaining helpfulness. |

---

## 🚀 Technical Stack

- **Frontend**: React 18 (Vite), TailwindCSS, Framer Motion
- **Backend**: Supabase (Auth, DB, Realtime)
- **Intelligence**: Gemini 1.5 Flash / Pro (Resilient Multi-Key Logic)
- **Analytics**: Recharts (Responsive & Mount-Guarded)

---

## 📂 Repository Structure

```bash
src/
├── services/     # Core Logic: AI failover, Smart Matcher, SM-2 Engine
├── hooks/        # UI-Logic: Intelligence hooks, Audio control, Auth
├── context/      # Global State: StudyContext orchestration
├── pages/        # Premium analytical and study views
└── components/   # Atomic UI elements: Glassmorphism & Feedback loops
```

---

> [!IMPORTANT]
> This platform is engineered for **High-Resilience**. Even in offline or API-limited environments, the **Local Synthetic Engine** ensures that your learning momentum never stops.

---

**Built with ❤️ for the future of learning.**
