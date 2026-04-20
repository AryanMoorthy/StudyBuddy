/**
 * 🧠 Intelligence Layer: Learning Engine
 * 
 * Pure mathematical engine defining how the system prioritizes topics,
 * calculates decays, and generates adaptive study paths.
 */

// 1. Core Utilities
const clamp = (val, min = 0, max = 1) => Math.min(max, Math.max(min, val));

const TOPIC_KEYWORDS = {
  'linear algebra': ['matrix', 'vector', 'eigen', 'determinant', 'space', 'transformation', 'basis'],
  'hashing': ['collision', 'map', 'hash', 'table', 'key', 'slot', 'bucket'],
  'bfs': ['breadth', 'search', 'graph', 'queue', 'level', 'traverse'],
  'reactive programming': ['react', 'state', 'observable', 'stream', 'event', 'flow', 'subscribe', 'subject'],
};

export const learningEngine = {
  // Utility for smart matching mistakes to topics
  matchMistakeToTopic(m, topic) {
    if (!topic || !m) return false;
    const topicId = String(topic.id);
    const topicName = topic.name.toLowerCase().trim();
    
    // 1. Direct ID or Name Match
    if (String(m.topic_id) === topicId) return true;
    if (m.topic && m.topic.toLowerCase().trim() === topicName) return true;

    // 2. Keyword Match for Legacy/General Data
    const label = (m.topic || "").toLowerCase();
    if (label === 'general' || !m.topic) {
      const questionText = (m.question || "").toLowerCase();
      const keywords = TOPIC_KEYWORDS[topicName] || [];
      return questionText.includes(topicName) || keywords.some(kw => questionText.includes(kw));
    }

    return false;
  },

  // 2. Compute Topic Performance Stat Object
  computeTopicStats(topic, rawStats) {
    // Cold Start Strategy: if tracking doesn't exist, we fallback
    const statItem = rawStats || {};
    
    // Total attempts, default to 1 to prevent division by zero
    const total = (statItem.times_correct || 0) + (statItem.times_wrong || 0) || 1;

    return {
      accuracy: clamp((statItem.times_correct || 0) / total),
      mistakeRate: clamp((statItem.times_wrong || 0) / total),
      times_wrong: statItem.times_wrong || 0,
      difficulty: topic.easiness_factor,
      lastSeen: statItem.last_seen || null,
      nextReview: topic.next_review,
      times_seen: statItem.times_seen || 0
    };
  },

  // 3. Overdue Penalty (Linear Decay normalized over 7 days)
  getOverdueFactor(nextReview) {
    if (!nextReview) return 0;

    const now = Date.now();
    const diff = now - new Date(nextReview).getTime();

    if (diff <= 0) return 0; // Not overdue

    const MAX_WINDOW = 7 * 24 * 60 * 60 * 1000;
    return clamp(diff / MAX_WINDOW);
  },

  // 4. Recency Decay (Exponential Decay model)
  // Ensures topics you haven't seen in a while gain slight priority creep
  getRecencyDecay(lastSeen) {
    if (!lastSeen) return 1; // Never seen = max priority factor

    const days = (Date.now() - new Date(lastSeen).getTime()) / 86400000;
    return Math.exp(-days / 7);
  },

  // 5. Intelligent Priority Profiler
  // Calculates a 0-1 scale score ensuring optimal study patterns
  computePriority(stats) {
    if (!stats.times_seen) return 0.5; // Cold start defaults to neutral priority

    const score =
      (1 - stats.accuracy) * 0.4 +               // 40% Weight: High if accuracy is low
      this.getOverdueFactor(stats.nextReview) * 0.3 + // 30% Weight: High if overdue
      stats.mistakeRate * 0.2 +                  // 20% Weight: High if historically missed often
      this.getRecencyDecay(stats.lastSeen) * 0.1;     // 10% Weight: High if untouched recently

    return clamp(score);
  },

  // 6. Queue Generator
  // Sorts topics intelligently by priority
  getPriorityQueue(topics, userTopicStatsMap) {
    return topics
      .map(t => {
        const stats = this.computeTopicStats(t, userTopicStatsMap[t.id]);
        const priority = this.computePriority(stats);
        
        let reason = null;
        if (stats.accuracy < 0.4 && stats.times_seen > 0) reason = "Low accuracy";
        else if (stats.times_wrong >= 2) reason = "Frequently missed";
        else if (this.getOverdueFactor(stats.nextReview) > 0.5) reason = "Overdue";
        else if (!stats.times_seen) reason = "New Topic";

        return { ...t, priority, stats, reason };
      })
      .sort((a, b) => b.priority - a.priority);
  },

  // 7. Modality Engine
  // Determines what kind of study behavior should be assigned
  selectLearningMode(stats) {
    if (stats.times_wrong >= 2) return "mistake_mastery";
    if (stats.accuracy < 0.4) return "concept";
    if (stats.accuracy < 0.7) return "guided_quiz";
    if (stats.accuracy < 0.85) return "standard_quiz";
    return "rapid_review";
  },

  // 8. Adaptive Learning Path Generator
  // Selects top 3 varied difficulty topics so study is rarely monotonous
  generateLearningPath(queue) {
    const path = [];

    const high = queue.filter(t => t.priority > 0.7);
    const mid = queue.filter(t => t.priority > 0.4 && t.priority <= 0.7);
    const low = queue.filter(t => t.priority <= 0.4);

    if (high.length) path.push({ type: "mistake_mastery", topic: high[0] });
    if (mid.length) path.push({ type: "practice", topic: mid[0] });
    if (low.length) path.push({ type: "rapid_review", topic: low[0] });

    return path;
  },

  // 9. AI Context Extraction
  // Pulls limited prompt context ensuring no scale limits are breached
  computeUserProfile(queue) {
    const attempted = queue.filter(t => t.stats.times_seen > 0);

    // Cold Start Fix: If no sessions exist, suggest the highest priority new topics
    if (attempted.length === 0) {
      return {
        weakTopics: queue.slice(0, 3).map(t => t.name), // Show first 3 topics as focus areas
        strongTopics: [],
        avgAccuracy: null // Signal data pending
      };
    }

    const weakTopics = attempted.filter(t => t.stats.accuracy < 0.5).slice(0, 5).map(t => t.name);
    const strongTopics = attempted.filter(t => t.stats.accuracy > 0.8).slice(0, 3).map(t => t.name);
    
    const avgAccuracy = attempted.reduce((acc, curr) => acc + curr.stats.accuracy, 0) / attempted.length;

    return {
      weakTopics,
      strongTopics,
      avgAccuracy: Math.round(avgAccuracy * 100) / 100
    };
  }
};
