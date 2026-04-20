/**
 * 🧠 Action Engine: The Final Decision Layer
 * 
 * Converts raw analytics and intelligence scores into a structured, 
 * actionable "Today's Plan" for the user.
 */

import { learningEngine } from './learningEngine';

export const actionEngine = {
  /**
   * Generates a unified study plan based on multiple inputs
   */
  generatePlan(topics, statsMap, mistakes, priorityQueue) {
    if (!topics.length) return { recommendedProblems: [], revisionTopics: [], studyPlan: [] };

    // 1. CLASSIFY TOPICS
    const classified = topics.map(topic => {
      const stats = learningEngine.computeTopicStats(topic, statsMap[topic.id]);
      const priority = learningEngine.computePriority(stats);
      
      // Calculate specific densities
      const mistakeCount = mistakes.filter(m => m.topic === topic.name || m.topic_id === topic.id).length;
      const overdueFactor = learningEngine.getOverdueFactor(topic.next_review);
      
      // Recency penalty (normalized 0-1) - increases if NOT seen recently
      const recencyPenalty = 1 - learningEngine.getRecencyDecay(stats.lastSeen);

      // Unified Action Score
      const actionScore = (
        (0.4 * priority) +
        (0.3 * overdueFactor) +
        (0.2 * Math.min(mistakeCount / 5, 1)) + // 5 mistakes = max density
        (0.1 * recencyPenalty)
      );

      let group = 'strong';
      if (stats.accuracy < 0.6 || mistakeCount > 2) group = 'weak';
      else if (overdueFactor > 0) group = 'revision';
      else if (stats.accuracy > 0.85 && stats.times_seen > 0) group = 'strong';

      return {
        ...topic,
        actionScore,
        group,
        stats,
        mistakeCount
      };
    }).sort((a, b) => b.actionScore - a.actionScore);

    // 2. DISTRIBUTION (70% Weak, 20% Revision, 10% Strong)
    // For new users, 'weak' and 'revision' might be empty.
    const weakPool = classified.filter(t => t.group === 'weak');
    const revisionPool = classified.filter(t => t.group === 'revision');
    const strongPool = classified.filter(t => t.group === 'strong');

    const recommended = [];
    
    // Fill strategy: Prioritize Weak -> Revision -> Strong (New)
    const combinedPool = [...weakPool, ...revisionPool, ...strongPool];
    
    // Take top 4 from combinedPool to ensure the plan is never empty
    const top4 = combinedPool.slice(0, 4);
    
    top4.forEach((t, i) => {
      let type = 'practice';
      let duration = 25;
      
      if (t.group === 'revision') {
        type = 'revision';
        duration = 15;
      } else if (t.group === 'strong' && t.stats.times_seen > 0) {
        type = 'retention';
        duration = 10;
      } else if (t.stats.times_seen === 0) {
        type = 'practice'; // New topics are always practice
        duration = 25;
      }
      
      recommended.push({ ...t, type, duration });
    });

    return {
      recommendedProblems: weakPool.slice(0, 3).map(t => t.id),
      revisionTopics: revisionPool.map(t => t.id),
      studyPlan: recommended
    };
  }
};
