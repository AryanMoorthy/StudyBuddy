<div align="center">
  <h1>🎓 StudyBuddy</h1>
  <p><i>The intelligent Learning OS for high-retention mastery.</i></p>
  
  <h3>
    <a href="https://study-buddy-one-omega.vercel.app/">🚀 Live Demo</a>
    &nbsp; • &nbsp;
    <a href="https://youtu.be/69_bcCJlhN0">📺 Video Tour</a>
  </h3>
</div>

---

## 📺 Project Demo
Experience the full power of StudyBuddy in action. This walkthrough covers the adaptive engine, mistake mastery, and the deep-focus study environment.

[![Watch the Demo](https://img.youtube.com/vi/69_bcCJlhN0/maxresdefault.jpg)](https://youtu.be/69_bcCJlhN0)

> [!TIP]
> **Check out the video** to see the glassmorphic UI and real-time AI generation in motion.

---

## 🧠 Core Intelligence

### 1. The Mathematical Engine
Powered by `learningEngine.js`, StudyBuddy uses a hybrid of the **SM-2 Spaced Repetition Algorithm** and a custom **Priority Scoring Model**.
- **Dynamic Weighting**: Calculates topic priority based on Accuracy (40%), Overdue Factor (30%), and Mistake Density (20%).
- **Smart Matcher**: Automatically bridges the gap between historical mistakes and current subjects using heuristic keyword mapping.

### 2. Resilient AI Layer
Engineered for **100% Reliability** through a multi-layered failover strategy.
- **Triple-Key Rotation**: Automatically cycles between primary, secondary, and tertiary Gemini API keys to bypass rate limits.
- **Local Synthetic Engine**: If the cloud is at capacity, the system triggers a local fallback to generate high-fidelity mock material instantly.

---

## ✨ Key Features

- **🛡️ Mistake Mastery**: A dedicated portal that captures every failed quiz attempt and transforms them into targeted "Mistake Drills."
- **📊 AI Coach**: Proactive analytics layer that provides cached coaching insights every 10 minutes based on your performance.
- **⏳ Deep Focus Mode**: Integrated Pomodoro timer with spatial audio and a distraction-free, glassmorphic interface.
- **📝 Today's Plan**: Automatically generates a 4-step actionable study path every 24 hours using a 70/20/10 growth split.

---

## 🛠️ Technical Stack

### **Frontend Architecture**
- **React 19 (Vite)**: Leveraging the latest React features for optimal state management and performance.
- **Tailwind CSS**: Utility-first styling with the **Typography plugin** for beautiful, readable study content.
- **Framer Motion**: Premium spring-physics animations and layout transitions for a "liquid" feel.
- **Lucide & React Icons**: Comprehensive iconography for clear visual hierarchy.

### **Intelligence & Data**
- **Gemini 2.5 Flash**: Orchestrating complex content generation with high efficiency and tokens-per-second.
- **Supabase**: Real-time PostgreSQL database with built-in Auth and local-sync capabilities.
- **Recharts**: Responsive, mount-guarded analytics for tracking long-term retention trends.
- **Date-fns**: Precision scheduling for the SM-2 revision cycles.

### **Tools & Workflow**
- **Axios**: Robust HTTP client for handling AI API failovers and timeouts.
- **React Hook Form & Yup**: Typed, schema-based validation for study state persistence.
- **React Router DOM**: Client-side routing for the Intelligence Portal and Dashboard.

---

## 📂 Repository Layout

```bash
src/
├── services/     # Core Logic: AI failover, Smart Matcher, SM-2 Engine
├── components/   # Atomic UI: Glassmorphism, Feedback Loops, Modals
├── hooks/        # UI-Logic: Intelligence hooks, Audio control, Auth
├── context/      # State: Global StudyContext orchestration
└── pages/        # High-level analytical and study views
```

---

> [!IMPORTANT]
> **StudyBuddy** is designed to never let you stop. Even with API limitations or offline state, the architecture prioritizes learning momentum through heavy caching and local failovers.

**Built with ❤️ for the future of learning.**
