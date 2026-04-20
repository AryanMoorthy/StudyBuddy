/**
 * 🤖 AI Coach: Personalized Learning Insights
 * 
 * Returns deterministic insights instantly. Attempts a Gemini upgrade
 * in the background — never blocks the UI on API calls.
 */

import { generateStudyMaterial } from './aiService';

export const aiCoach = {
  /**
   * Generates coaching insights based on user performance data.
   * Always returns at least 2 deterministic insights immediately.
   */
  async getInsights(topics = [], statsMap = {}, mistakes = [], sessions = []) {
    const safeTopics = Array.isArray(topics) ? topics : [];
    const safeMistakes = Array.isArray(mistakes) ? mistakes : [];
    const safeStats = statsMap || {};

    // ── 1. Feature Engineering ──────────────────────────────────────────────
    const overdueTopics = safeTopics.filter(t => t.next_review && new Date(t.next_review) < new Date());
    const seen = safeTopics.filter(t => safeStats[t.id]?.times_seen > 0);
    const struggling = safeTopics.filter(t => (safeStats[t.id]?.times_wrong || 0) > 2).slice(0, 3);
    const newTopics = safeTopics.filter(t => !safeStats[t.id]?.times_seen);
    const mistakeCount = safeMistakes.length;

    // ── 2. Deterministic Insights (always populated) ─────────────────────────
    const insights = [];

    if (safeTopics.length === 0) {
      insights.push("Welcome to StudyBuddy! Add your first subject in the Curriculum tab to begin.");
      insights.push("Once you add topics, I'll guide you through the smartest study path every day.");
    } else if (newTopics.length === safeTopics.length) {
      // Cold start: user has topics but hasn't studied any
      insights.push(`Let's kick off! Start with "${safeTopics[0]?.name}" — it's first in your queue.`);
      insights.push(`You have ${safeTopics.length} topic${safeTopics.length > 1 ? 's' : ''} ready. Aim for one 25-min session to build momentum.`);
      if (safeTopics.length > 1) {
        insights.push(`After your first session, I'll personalize your study order based on performance.`);
      }
    } else {
      // Has some session history
      if (overdueTopics.length > 0) {
        insights.push(`${overdueTopics.length} topic${overdueTopics.length > 1 ? 's are' : ' is'} overdue for review — tackle them first today.`);
      }
      if (struggling.length > 0) {
        insights.push(`"${struggling[0].name}" is tricky for you. Try breaking it into smaller sub-topics.`);
      }
      if (mistakeCount > 0) {
        insights.push(`You have ${mistakeCount} logged mistake${mistakeCount > 1 ? 's' : ''} — reviewing them regularly closes knowledge gaps fast.`);
      }
      if (seen.length > 0 && overdueTopics.length === 0 && struggling.length === 0) {
        insights.push(`Great job — no overdue topics! Keep your streak alive with today's plan.`);
      }
      if (newTopics.length > 0) {
        insights.push(`${newTopics.length} topic${newTopics.length > 1 ? 's are' : ' is'} yet to be studied. Start one after your review session.`);
      }
    }

    // Guarantee at least 2 insights
    if (insights.length < 2) {
      insights.push("Consistency is key — even 20 minutes of focused study each day builds lasting mastery.");
    }

    // ── 3. Attempt AI Enhancement (non-blocking, background upgrade) ─────────
    // Only make API call if there's meaningful data to analyze
    if (safeTopics.length > 0 && seen.length > 0) {
      try {
        const prompt = `
          You are a highly encouraging AI Study Coach. Analyze this student data and return 2-3 very concise coaching insights (max 18 words each).
          
          DATA:
          - Topics mastered (seen > 0): ${seen.length}/${safeTopics.length}
          - Struggling topics: ${struggling.map(t => t.name).join(', ') || 'None'}
          - Overdue topics: ${overdueTopics.length}
          - Logged mistakes: ${mistakeCount}
          - Sessions completed: ${sessions.length}
          
          Focus on specific, actionable, motivating insights. Do NOT be generic.
          FORMAT: Return ONLY a JSON array of strings, no other text.
          Example: ["You're 80% through Linear Algebra — finish strong!", "Review Binary Trees before Friday's deadline."]
        `;

        const aiResponse = await generateStudyMaterial('Coaching Analysis', prompt);

        if (Array.isArray(aiResponse) && aiResponse.length > 0) {
          return aiResponse.map(s => String(s).trim()).filter(Boolean);
        }
      } catch (error) {
        // Silent fail — fallbacks already populated
        console.warn('AI Coach: Using deterministic insights (API unavailable)');
      }
    }

    return insights.slice(0, 3);
  }
};
