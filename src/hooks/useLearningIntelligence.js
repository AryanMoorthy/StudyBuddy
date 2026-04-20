import { useMemo, useContext } from 'react';
import { StudyContext } from '../context/StudyContext';
import { learningEngine } from '../services/learningEngine';
import { actionEngine } from '../services/actionEngine';

/**
 * 🧠 Advanced Custom Hook: useLearningIntelligence
 * 
 * Extracts complex intelligence logic from the context layer to 
 * improve component performance and demonstrate scalable architecture.
 */
export const useLearningIntelligence = () => {
  const { topics, subjects, userTopicStats, sessions, mistakes, coachInsights } = useContext(StudyContext);

  // 1. Intelligence Queue & Priority
  const priorityQueue = useMemo(() => {
    if (!topics.length) return [];
    return learningEngine.getPriorityQueue(topics, userTopicStats);
  }, [topics, userTopicStats]);

  // 2. DAILY STUDY PLAN (THE ACTION ENGINE)
  const dailyPlan = useMemo(() => {
    return actionEngine.generatePlan(topics, userTopicStats, mistakes, priorityQueue);
  }, [topics, userTopicStats, mistakes, priorityQueue]);

  // 3. Adaptive Learning Path (Legacy fallback for secondary suggestions)
  const learningPath = useMemo(() => {
    if (!priorityQueue.length) return [];
    return learningEngine.generateLearningPath(priorityQueue);
  }, [priorityQueue]);

  // 3. User Intelligence Profile (Strengths/Weaknesses)
  const profile = useMemo(() => {
    if (!priorityQueue.length) return { weakTopics: [], strongTopics: [], avgAccuracy: 0 };
    return learningEngine.computeUserProfile(priorityQueue);
  }, [priorityQueue]);

  // 4. Behavioral Efficiency Stats (Time vs Mastery per Subject)
  const subjectEfficiency = useMemo(() => {
    if (!subjects.length || !topics.length) return [];

    return subjects.map(subject => {
      const subjectTopics = topics.filter(t => t.subject_id === subject.id);
      
      // Calculate average repetitions (proxy for time) and average mastery
      const totalReps = subjectTopics.reduce((acc, t) => acc + t.repetitions, 0);
      const totalMastered = subjectTopics.filter(t => t.repetitions > 3).length;
      
      const avgMastery = subjectTopics.length > 0 
        ? Math.round((totalMastered / subjectTopics.length) * 100) 
        : 0;

      return {
        name: subject.name,
        time: totalReps, // Using repetitions as a weight for "Time Invested"
        mastery: avgMastery,
        fullMark: 100
      };
    }).filter(s => s.time > 0 || s.mastery > 0);
  }, [subjects, topics]);

  // 5. Smart Recommendation Suggestion
  const smartSuggestion = useMemo(() => {
    if (!learningPath.length) return null;

    const urgent = learningPath[0];
    if (urgent.topic?.reason === 'Low accuracy') {
      return {
        title: "Focus on Precision",
        message: `Your accuracy in ${urgent.topic.name} is currently low. A quick quiz session could help solidify these concepts.`,
        action: "Start Quiz"
      };
    }
    if (urgent.topic?.reason === 'Frequently missed') {
      return {
        title: "Tackle your Mistakes",
        message: `You've missed ${urgent.topic.name} multiple times recently. Let's try the Mistake Mastery tool.`,
        action: "Practice Mistakes"
      };
    }
    return {
      title: "Optimized Path Found",
      message: `The AI suggests moving to ${urgent.topic.name} to maximize your retention window.`,
      action: "Resume Path"
    };
  }, [learningPath]);

  return {
    priorityQueue,
    learningPath,
    dailyPlan,
    profile,
    subjectEfficiency,
    smartSuggestion,
    coachInsights,
    totalTopics: topics.length,
    masteredTopics: topics.filter(t => t.repetitions > 3).length
  };
};
