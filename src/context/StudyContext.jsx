import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { studyService } from '../services/studyService';
import { toast } from 'react-toastify';
import { format, subDays, isSameDay, startOfDay } from 'date-fns';
import { learningEngine } from '../services/learningEngine';
import { actionEngine } from '../services/actionEngine';
import { aiCoach } from '../services/aiCoach';

export const StudyContext = createContext({
  subjects: [], topics: [], sessions: [], mistakes: [],
  userTopicStats: {}, stats: {}, coachInsights: [], loading: true,
  recordStudySession: async () => ({}),
  submitIntelligenceFeedback: async () => {},
  deleteTopic: async () => ({}),
  recordMistakeResult: async () => {},
  removeMistakeManually: async () => {},
  refreshData: async () => {},
  addSubject: async () => ({}),
  addTopic: async () => ({}),
  updateTopic: async () => ({})
});

const AI_COOLDOWN = 10 * 60 * 1000; // 10 minutes cache/cooldown
const INSIGHTS_CACHE_KEY = 'sb_coach_insights_v2';
const INSIGHTS_TIMESTAMP_KEY = 'sb_coach_insights_ts_v2';

export const StudyProvider = ({ children }) => {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [mistakes, setMistakes] = useState([]);
  const [userTopicStats, setUserTopicStats] = useState({});
  const [coachInsights, setCoachInsights] = useState(() => {
    try {
      const cached = localStorage.getItem(INSIGHTS_CACHE_KEY);
      return cached ? JSON.parse(cached) : [];
    } catch { return []; }
  });
  const [lastAiUpdate, setLastAiUpdate] = useState(() => {
    try {
      const ts = localStorage.getItem(INSIGHTS_TIMESTAMP_KEY);
      return ts ? parseInt(ts, 10) : 0;
    } catch { return 0; }
  });
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async (silent = false) => {
    if (!user) return;
    if (!silent) setLoading(true);
    
    try {
      const results = await Promise.allSettled([
        studyService.getSubjects(user.id),
        studyService.getTopics(user.id),
        studyService.getAllSessions(user.id),
        studyService.getMistakes(user.id),
        studyService.getUserTopicStats(user.id)
      ]);

      const subjectsRes = results[0].status === 'fulfilled' ? results[0].value : { data: [] };
      const topicsRes   = results[1].status === 'fulfilled' ? results[1].value : { data: [] };
      const sessionsRes = results[2].status === 'fulfilled' ? results[2].value : { data: [] };
      const mistakesRes = results[3].status === 'fulfilled' ? results[3].value : { data: [] };
      const statsRes    = results[4].status === 'fulfilled' ? results[4].value : { data: [] };

      setSubjects(subjectsRes.data || []);
      setTopics(topicsRes.data || []);
      setSessions(sessionsRes.data || []);
      setMistakes(mistakesRes.data || []);

      const statsMap = {};
      if (statsRes.data) {
        statsRes.data.forEach(s => statsMap[s.topic_id] = s);
      }
      setUserTopicStats(statsMap);
    } catch (err) {
      console.error('🔥 Systemic Fetch Failure:', err);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [user]);

  // Reactive and stable statsMap for components
  const currentStatsMap = useMemo(() => {
    return userTopicStats || {};
  }, [userTopicStats]);

  // AI Insights - Secured non-blocking call with throttling
  useEffect(() => {
    if (loading || !topics.length) return;
    
    const triggerInsights = async () => {
      const now = Date.now();
      const timeSinceLastUpdate = now - lastAiUpdate;

      // Only fetch if insights are empty OR cooldown has passed (10 mins)
      if (coachInsights.length > 0 && timeSinceLastUpdate < AI_COOLDOWN) {
        console.log(`🧠 AI Coach: Using cached insights (${Math.round(timeSinceLastUpdate/1000)}s old)`);
        return;
      }

      try {
        console.log("🤖 AI Coach: Requesting fresh insights from Gemini...");
        const insights = await aiCoach.getInsights(topics, currentStatsMap, mistakes, sessions);
        
        if (insights && insights.length > 0) {
          setCoachInsights(insights);
          setLastAiUpdate(now);
          localStorage.setItem(INSIGHTS_CACHE_KEY, JSON.stringify(insights));
          localStorage.setItem(INSIGHTS_TIMESTAMP_KEY, now.toString());
        }
      } catch (err) {
        console.error("🤖 AI Coach Failure:", err);
      }
    };

    triggerInsights();
  }, [loading, topics, currentStatsMap, mistakes, sessions, lastAiUpdate, coachInsights.length]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // SM-2 Update Logic
  const recordStudySession = async (topicId, rating, duration) => {
    const topic = topics.find(t => t.id === topicId);
    if (!topic) return { error: { message: "Topic not found" } };

    const sm2Update = studyService.calculateNextReview(
      rating,
      topic.easiness_factor,
      topic.interval,
      topic.repetitions
    );

    const { error: sessionError } = await studyService.logSession({
      topic_id: topicId,
      rating,
      duration,
      date: new Date().toISOString()
    });

    if (sessionError) {
      toast.error('Failed to log session');
      return { error: sessionError };
    }

    const { error: topicError } = await studyService.updateTopic(topicId, {
      ...sm2Update,
      last_reviewed: new Date().toISOString(),
      status: rating >= 3 ? 'Reviewed' : 'Needs Focus'
    });

    if (topicError) {
      toast.error('Failed to update topic schedule');
      return { error: topicError };
    }

    toast.success('Strategy updated and revision scheduled!');
    fetchData(true); // Silent background refresh
    return { error: null };
  };

  const deleteTopic = async (topicId) => {
    const { error } = await studyService.deleteTopic(topicId);
    if (error) {
      toast.error('Failed to delete topic');
      return { error };
    }
    toast.success('Topic removed from curriculum');
    fetchData(true);
    return { error: null };
  };

  const recordMistakeResult = async (mistake, isCorrect) => {
    if (!user) {
      console.warn("⚠️ Mistake Mastery: No authenticated user session found. Request will likely fail.");
    }
    
    console.log("📦 Mistake Mastery: recordMistakeResult called", { isCorrect });
    
    const { error } = await studyService.upsertMistakeAttempt(user, mistake, isCorrect);
    
    if (error) {
      console.error("📦 Mistake Mastery: Service Error", error);
    } else {
      console.log("📦 Mistake Mastery: Persistence synchronized. Refreshing global state.");
      const { data } = await studyService.getMistakes(user?.id);
      setMistakes(data || []);
    }
  };

  const removeMistakeManually = async (id) => {
    const { error } = await studyService.deleteMistake(id);
    if (!error) {
      setMistakes(prev => prev.filter(m => m.id !== id));
      toast.success('Question removed from practice');
    }
  };

  // Analytics Logic: Calculate Streak
  const streak = useMemo(() => {
    if (!sessions.length) return 0;
    
    // Get unique dates sorted descending
    const dates = [...new Set(sessions.map(s => startOfDay(new Date(s.date)).getTime()))]
      .sort((a, b) => b - a);

    let currentStreak = 0;
    let today = startOfDay(new Date()).getTime();
    let yesterday = startOfDay(subDays(new Date(), 1)).getTime();

    // If latest session is not today OR yesterday, streak is 0
    if (dates[0] !== today && dates[0] !== yesterday) return 0;

    let checkDate = dates[0];
    for (let i = 0; i < dates.length; i++) {
      if (dates[i] === checkDate) {
        currentStreak++;
        checkDate = startOfDay(subDays(new Date(checkDate), 1)).getTime();
      } else {
        break;
      }
    }
    return currentStreak;
  }, [sessions]);

  // Analytics Logic: Mastery Trend (Last 7 days)
  const masteryTrend = useMemo(() => {
    const last7Days = [...Array(7)].map((_, i) => {
      const date = subDays(new Date(), 6 - i);
      const daySessions = sessions.filter(s => isSameDay(new Date(s.date), date));
      const avgRating = daySessions.length 
        ? daySessions.reduce((acc, curr) => acc + curr.rating, 0) / daySessions.length 
        : 0;
      
      return {
        name: format(date, 'EEE'),
        score: Math.round((avgRating / 5) * 100)
      };
    });
    return last7Days;
  }, [sessions]);

  // Dashboard Statistics
  const stats = useMemo(() => {
    const completed = topics.filter(t => t.repetitions > 3).length;
    const total = topics.length || 1;
    const mastery = Math.round((completed / total) * 100);
    
    return {
      mastery,
      streak,
      trend: masteryTrend,
      totalTopics: topics.length,
      needsReview: topics.filter(t => new Date(t.next_review) <= new Date()).length
    };
  }, [topics, streak, masteryTrend]);

  // --- Intelligence Logic now handled by useLearningIntelligence hook --- //

  // --- After Quiz: Update topic stats so AI Coach reflects actual quiz performance ---
  const recordQuizResult = async (topicId, correctCount, totalCount) => {
    if (!user || !topicId) return;

    const { data: existing, error: fetchError } = await studyService.getUserTopicStats(user.id);
    
    if (fetchError) {
      console.error("📊 Stats Engine: Failed to fetch existing record", fetchError);
      return;
    }

    const current = (existing || []).find(s => s.topic_id === topicId) || {};

    const newTimesCorrect = (current.times_correct || 0) + correctCount;
    const newTimesWrong  = (current.times_wrong  || 0) + (totalCount - correctCount);
    const newTimesSeen   = (current.times_seen   || 0) + totalCount;

    const { error: upsertError } = await studyService.upsertUserTopicStats(user.id, topicId, {
      times_correct: newTimesCorrect,
      times_wrong: newTimesWrong,
      times_seen: newTimesSeen,
      last_seen: new Date().toISOString()
    });

    if (upsertError) {
      console.error("📊 Stats Engine: Database Write Failed!", upsertError);
      toast.error("Intelligence Update Failed: Database Sync Error.");
      return;
    }

    console.log("📊 Stats Engine: Successfully synchronized quiz results to Intelligence Profile.");
    
    // Invalidate AI Coach cache so next visit gets fresh coaching based on new stats
    setCoachInsights([]); // Clear in-memory state to force re-fetch
    setLastAiUpdate(0);   // Reset timestamp to bypass cooldown
    localStorage.removeItem('sb_coach_insights_v2');
    localStorage.removeItem('sb_coach_insights_ts_v2');

    fetchData(true); // Silent background refresh
  };

  const submitIntelligenceFeedback = async (payload) => {
    if (!user) return;
    console.log("🧠 Intelligence Layer: Recording Session Feedback", payload);
    const { error } = await studyService.logIntelligenceSession(user.id, payload);
    if (error) {
       console.error("Intelligence Update Failed", error);
    } else {
       fetchData(true); // Refresh silently
    }
  };

  const value = {
    user,
    subjects,
    topics,
    sessions,
    mistakes,
    userTopicStats,
    loading,
    stats,
    coachInsights,
    recordStudySession,
    recordQuizResult,
    submitIntelligenceFeedback,
    deleteTopic,
    recordMistakeResult,
    removeMistakeManually,
    refreshData: fetchData,
    addSubject: (sub) => studyService.createSubject(user.id, sub).then(r => { fetchData(true); return r; }),
    addTopic: (top) => studyService.createTopic(top).then(r => { fetchData(true); return r; }),
    updateTopic: (id, ups) => studyService.updateTopic(id, ups).then(r => { fetchData(true); return r; })
  };

  return (
    <StudyContext.Provider value={value}>
      {children}
    </StudyContext.Provider>
  );
};
