import { supabase } from './supabaseClient';

export const studyService = {
  // Subjects
  async getSubjects(userId) {
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .eq('user_id', userId)
      .order('name');
    return { data, error };
  },

  async createSubject(userId, subject) {
    const { data, error } = await supabase
      .from('subjects')
      .insert([{ ...subject, user_id: userId }])
      .select()
      .single();
    return { data, error };
  },

  // Topics
  async getTopics(userId) {
    // We join with subjects to ensure we only get topics for this user
    // However, if topics table has user_id, it's simpler
    const { data, error } = await supabase
      .from('topics')
      .select('*, subjects!inner(user_id)')
      .eq('subjects.user_id', userId);
    return { data, error };
  },

  async createTopic(topic) {
    const { data, error } = await supabase
      .from('topics')
      .insert([topic])
      .select()
      .single();
    return { data, error };
  },

  async updateTopic(topicId, updates) {
    const { data, error } = await supabase
      .from('topics')
      .update(updates)
      .eq('id', topicId)
      .select()
      .single();
    return { data, error };
  },

  async deleteTopic(topicId) {
    const { error } = await supabase
      .from('topics')
      .delete()
      .eq('id', topicId);
    return { error };
  },

  // Study Sessions
  async logSession(session) {
    const { data, error } = await supabase
      .from('study_sessions')
      .insert([session])
      .select()
      .single();
    return { data, error };
  },

  async getSessions(topicId) {
    const { data, error } = await supabase
      .from('study_sessions')
      .select('*')
      .eq('topic_id', topicId)
      .order('date', { ascending: false });
    return { data, error };
  },

  async getAllSessions(userId) {
    const { data, error } = await supabase
      .from('study_sessions')
      .select('*, topics!inner(subjects!inner(user_id))')
      .eq('topics.subjects.user_id', userId)
      .order('date', { ascending: true });
    return { data, error };
  },

  // Mistake Mastery System
  generateQuestionHash(question, options) {
    const str = question + options.join("");
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return hash.toString();
  },

  async getMistakes(userId) {
    const { data, error } = await supabase
      .from('mistakes')
      .select('*')
      .eq('user_id', userId);
    
    // Sort by priority logic: times_wrong / (times_correct + 1)
    const sortedData = data?.sort((a, b) => {
      const priorityA = a.times_wrong / (a.times_correct + 1);
      const priorityB = b.times_wrong / (b.times_correct + 1);
      return priorityB - priorityA;
    });

    return { data: sortedData, error };
  },
  // Mistake Mastery System: Unified Persistence Logic
  async upsertMistakeAttempt(user, q, isCorrect) {
    const userId = user?.id || "dev-user";

    if (!user || !user.id) {
      console.warn("⚠️ Mistake Mastery: No authenticated user — using dev-user fallback");
    }

    if (!q.question || !q.options || q.options.length !== 4) {
      console.error("❌ Mistake Mastery: Invalid question format", q);
      return { error: new Error("Invalid question format") };
    }

    const questionHash = this.generateQuestionHash(q.question, q.options);
    console.log("📡 Mistake Mastery: Sending attempt to Supabase", { questionHash, isCorrect });

    // 1. Check if record exists by question_hash
    const { data: existing, error: fetchError } = await supabase
      .from("mistakes")
      .select("*")
      .eq("user_id", userId)
      .eq("question_hash", questionHash)
      .maybeSingle();

    if (fetchError) {
      console.error("❌ Mistake Mastery: Fetch error", fetchError);
      return { error: fetchError };
    }

    if (!existing) {
      // FIRST ATTEMPT — only persist if wrong
      if (!isCorrect) {
        console.log("📡 Mistake Mastery: First wrong answer. Inserting new record.");

        const payload = {
          user_id: userId,
          question_hash: questionHash,
          question: q.question,
          options: q.options,
          correct_answer: q.correctAnswer,
          explanation: q.explanation || null,
          topic: q.topic || "General",
          times_wrong: 1,
          times_correct: 0,
          last_attempt_correct: false,
          last_attempted: new Date().toISOString()
        };

        console.log("📦 Saving mistake payload:", payload);

        const { data, error } = await supabase
          .from("mistakes")
          .insert([payload])
          .select();

        console.log("📡 Supabase response:", { data, error });

        if (error) {
          console.error("❌ Insert failed:", error.message);
        } else {
          console.log("✅ Mistake saved successfully", data);
        }

        return { data, error };
      }
      // Got it right first try — nothing to persist
      console.log("✅ Correct on first attempt — no mistake record needed.");
      return { data: null, error: null };
    }

    // 2. UPDATE EXISTING RECORD
    console.log("📡 Mistake Mastery: Existing record found. Updating statistics.");
    let updates = {
      last_attempted: new Date().toISOString()
    };

    if (isCorrect) {
      updates.times_correct = existing.times_correct + 1;
      updates.last_attempt_correct = true;
    } else {
      updates.times_wrong = existing.times_wrong + 1;
      updates.last_attempt_correct = false;
    }

    // 3. MASTERY CONDITION (Threshold = 2 correct)
    if (isCorrect && (existing.times_correct + 1) >= 2) {
      console.log("🎉 Mistake Mastery: Mastery threshold (2) reached. Removing from practice queue.");
      const { error } = await supabase.from("mistakes").delete().eq("id", existing.id);
      if (error) console.error("❌ Mistake Mastery: Delete error", error);
      else console.log("✅ Mistake Mastery: Achievement unlocked & record retired.");
      return { data: null, error };
    }

    // 4. COMMIT UPDATES
    const { data, error } = await supabase
      .from("mistakes")
      .update(updates)
      .eq("id", existing.id)
      .select();

    console.log("📡 Supabase update response:", { data, error });

    if (error) console.error("❌ Mistake Mastery: Update error", error);
    else console.log("✅ Mistake Mastery: Attempt synchronized", data);

    return { data, error };
  },

  async deleteMistake(id) {
    return await supabase.from('mistakes').delete().eq('id', id);
  },

  // ── Pomodoro Session Logging ─────────────────────────────────────────────
  async logPomodoroSession(userId, topicId, duration, type = 'work') {
    try {
      // Guard: skip invalid/empty sessions
      if (!userId || !duration || duration < 1) {
        console.warn('⚠️ Pomodoro: Invalid session params — skipping', { userId, duration, type });
        return { data: null, error: null };
      }

      const { data, error } = await supabase
        .from('pomodoro_sessions')
        .insert([{
          user_id: userId,
          topic_id: topicId || null,
          duration,
          type,
          completed_at: new Date().toISOString(),
        }])
        .select();

      if (error) {
        console.error('❌ Pomodoro: Session log failed', error);
        return { data: null, error };
      }

      console.log('✅ Pomodoro: Session logged', { duration, type, topicId });
      return { data, error: null };
    } catch (err) {
      console.error('🔥 Pomodoro: Unexpected fatal log error', err);
      return { data: null, error: err };
    }
  },

  // ── Topic Time Summary (aggregate seconds per topic) ─────────────────────
  async getTopicTimeSummary(userId) {
    if (!userId) return { data: {}, error: null };

    try {
      const { data, error } = await supabase
        .from('pomodoro_sessions')
        .select('topic_id, duration')
        .eq('user_id', userId)
        .eq('type', 'work')
        .not('topic_id', 'is', null);

      if (error) {
        console.error('❌ Pomodoro: Failed to fetch time summary (Table might be missing or RLS error)', error);
        return { data: {}, error };
      }

      // Aggregate: { [topic_id]: totalSeconds }
      const summary = {};
      if (data) {
        data.forEach(s => {
          summary[s.topic_id] = (summary[s.topic_id] || 0) + (s.duration || 0);
        });
      }

      return { data: summary, error: null };
    } catch (err) {
      console.error('🔥 Pomodoro: Critical fetch error', err);
      return { data: {}, error: err };
    }
  },

  // SM-2 Algorithm Logic
  calculateNextReview(rating, previousEF = 2.5, previousInterval = 0, repetitionCount = 0) {
    let ef = previousEF;
    let interval = 0;
    let count = repetitionCount;

    if (rating >= 3) {
      if (count === 0) {
        interval = 1;
      } else if (count === 1) {
        interval = 6;
      } else {
        interval = Math.round(previousInterval * ef);
      }
      count++;
      ef = ef + (0.1 - (5 - rating) * (0.08 + (5 - rating) * 0.02));
    } else {
      count = 0;
      interval = 1;
      ef = previousEF; // Keep EF or slightly reduce
    }

    if (ef < 1.3) ef = 1.3;

    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + interval);

    return {
      next_review: nextDate.toISOString(),
      easiness_factor: ef,
      interval: interval,
      repetitions: count
    };
  },

  // --- 🧠 INTELLIGENCE LAYER DB OPS --- //

  // 1. Fetch User Topic Stats
  async getUserTopicStats(userId) {
     const { data, error } = await supabase
       .from('user_topic_stats')
       .select('*')
       .eq('user_id', userId);
     return { data, error };
  },

  // 2. Upsert Individual Topic Stat
  async upsertUserTopicStats(userId, topicId, updates) {
    if (!userId || !topicId) return { error: new Error('Missing IDs for upsert') };
    
    // We use standard upsert. Supabase uses the unique constraint on (user_id, topic_id) or id.
    // If the table doesn't have a unique constraint on (user_id, topic_id), we might need to check first.
    // Since we created it with UNIQUE(user_id, topic_id), this is safe.
    const { data, error } = await supabase
      .from('user_topic_stats')
      .upsert({
         user_id: userId,
         topic_id: topicId,
         ...updates
      }, { onConflict: 'user_id,topic_id' })
      .select();

    return { data, error };
  },

  // 3. Batch Log Learning Session
  async logIntelligenceSession(userId, payload) {
    if (!userId) return;
    
    // Log the unified session
    const { error } = await supabase
      .from('learning_sessions')
      .insert([{
         user_id: userId,
         topics_covered: payload.topics,   // Array of topic ids or summaries
         performance_score: payload.accuracy, // Average accuracy of the session
         session_date: new Date().toISOString()
      }]);
    
    if (error) console.error("Session Log Failed:", error);

    // After logging the session, iterate through topics and upsert their individual stats
    if (payload.topicUpdates) {
       for (const update of payload.topicUpdates) {
          // This requires fetching the current stat to increment, or we just rely on state.
          // In this implementation, the context layer passes the full updated object.
          await this.upsertUserTopicStats(userId, update.topic_id, update.stats);
       }
    }
    
    return { error };
  }
};
