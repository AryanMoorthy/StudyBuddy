import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { studyService } from '../services/studyService';
import { toast } from 'react-toastify';
import { format, subDays, isSameDay, startOfDay } from 'date-fns';
import { learningEngine } from '../services/learningEngine';

export const StudyContext = createContext();

export const StudyProvider = ({ children }) => {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [mistakes, setMistakes] = useState([]);
  const [userTopicStats, setUserTopicStats] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    
    const [subsRes, topicsRes, sessionsRes, mistakesRes, statsRes] = await Promise.all([
      studyService.getSubjects(user.id),
      studyService.getTopics(user.id),
      studyService.getAllSessions(user.id),
      studyService.getMistakes(user.id),
      studyService.getUserTopicStats(user.id)
    ]);

    if (subsRes.error) toast.error('Failed to load subjects');
    else setSubjects(subsRes.data);

    if (topicsRes.error) toast.error('Failed to load topics');
    else setTopics(topicsRes.data);

    if (sessionsRes.error) console.error('Failed to load sessions for analytics');
    else setSessions(sessionsRes.data);
    
    if (mistakesRes.error) console.error('Failed to load mistakes');
    else setMistakes(mistakesRes.data || []);

    if (statsRes.error) {
       console.error('Failed to load intelligence stats', statsRes.error);
    } else {
       // Convert array to O(1) lookup map
       const statsMap = {};
       statsRes.data?.forEach(s => statsMap[s.topic_id] = s);
       setUserTopicStats(statsMap);
    }

    setLoading(false);
  }, [user]);

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
    fetchData(); // Refresh data
    return { error: null };
  };

  const deleteTopic = async (topicId) => {
    const { error } = await studyService.deleteTopic(topicId);
    if (error) {
      toast.error('Failed to delete topic');
      return { error };
    }
    toast.success('Topic removed from curriculum');
    fetchData();
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

  // --- 🧠 INTELLIGENCE LAYER MEMOIZATION --- //
  const priorityQueue = useMemo(() => {
     if (!topics.length) return [];
     return learningEngine.getPriorityQueue(topics, userTopicStats);
  }, [topics, userTopicStats]);

  const learningPath = useMemo(() => {
     if (!priorityQueue.length) return [];
     return learningEngine.generateLearningPath(priorityQueue);
  }, [priorityQueue]);

  const intelligenceProfile = useMemo(() => {
     if (!priorityQueue.length) return { weakTopics: [], strongTopics: [], avgAccuracy: 0 };
     return learningEngine.computeUserProfile(priorityQueue);
  }, [priorityQueue]);

  const submitIntelligenceFeedback = async (payload) => {
    if (!user) return;
    console.log("🧠 Intelligence Layer: Recording Session Feedback", payload);
    const { error } = await studyService.logIntelligenceSession(user.id, payload);
    if (error) {
       console.error("Intelligence Update Failed", error);
    } else {
       fetchData(); // Refresh the global stats silently
    }
  };

  const value = {
    user,
    subjects,
    topics,
    loading,
    stats,
    mistakes,
    priorityQueue,
    learningPath,
    intelligenceProfile,
    recordStudySession,
    submitIntelligenceFeedback,
    deleteTopic,
    recordMistakeResult,
    removeMistakeManually,
    refreshData: fetchData,
    addSubject: (sub) => studyService.createSubject(user.id, sub).then(r => { fetchData(); return r; }),
    addTopic: (top) => studyService.createTopic(top).then(r => { fetchData(); return r; }),
    updateTopic: (id, ups) => studyService.updateTopic(id, ups).then(r => { fetchData(); return r; })
  };

  return (
    <StudyContext.Provider value={value}>
      {children}
    </StudyContext.Provider>
  );
};
