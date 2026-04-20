import React, {
  createContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  useContext,
} from 'react';
import { studyService } from '../services/studyService';
import { useAuth } from './AuthContext';

export const FocusContext = createContext();

// ── Constants ─────────────────────────────────────────────────────────────────

export const PLAYLISTS = {
  lofi: {
    key: 'lofi',
    name: 'Lo-fi Beats',
    videoId: 'jfKfPfyJRdk',
    desc: 'Chilled beats to study',
    emoji: '🎵',
  },
  nature: {
    key: 'nature',
    name: 'Nature Sounds',
    videoId: 'eKFTSSKCzWA',
    desc: 'Rain & forest ambience',
    emoji: '🌿',
  },
  classical: {
    key: 'classical',
    name: 'Classical Focus',
    videoId: '91wom14Eyb4',
    desc: 'Bach, Mozart & Vivaldi',
    emoji: '🎻',
  },
  white_noise: {
    key: 'white_noise',
    name: 'White Noise',
    videoId: 'nMfPqeZjc2c',
    desc: 'Pure concentration',
    emoji: '🌊',
  },
};

export const MODES = {
  work: { key: 'work', label: 'Focus', duration: 25 * 60 },
  short_break: { key: 'short_break', label: 'Short Break', duration: 5 * 60 },
  long_break: { key: 'long_break', label: 'Long Break', duration: 15 * 60 },
};

const LS_KEY = 'sb_focus_timer_v2';

// ── localStorage helpers ───────────────────────────────────────────────────────

const saveTimerState = (state) => {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify({ ...state, savedAt: Date.now() }));
  } catch {}
};

const loadTimerState = () => {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    const saved = JSON.parse(raw);
    // If it was running when saved, calculate elapsed and adjust
    if (saved.isRunning && saved.savedAt) {
      const elapsed = Math.floor((Date.now() - saved.savedAt) / 1000);
      const timeLeft = Math.max(0, (saved.timeLeft || 0) - elapsed);
      // If the session would have ended, don't restore as running
      return { ...saved, timeLeft, isRunning: timeLeft > 0 };
    }
    return { ...saved, isRunning: false };
  } catch {
    return null;
  }
};

// ── Provider ──────────────────────────────────────────────────────────────────

export const FocusProvider = ({ children }) => {
  const { user } = useAuth();

  // ── Refs (for stable callbacks that avoid stale closures) ─────────────────
  const iframeRef         = useRef(null);
  const sessionLoggedRef  = useRef(false);   // prevent double-log per work cycle
  const pendingSessionsRef = useRef([]);      // fail-safe queue for Supabase errors
  const sessionStartRef   = useRef(null);     // epoch ms when current session started

  // Mutable refs kept in sync with state (avoid stale closures in timer callback)
  const modeRef           = useRef('work');
  const cycleCountRef     = useRef(0);
  const linkedTopicIdRef  = useRef(null);
  const userRef           = useRef(null);

  // Keep mutable refs in sync
  useEffect(() => { if (user) userRef.current = user; }, [user]);

  // ── Music State ───────────────────────────────────────────────────────────
  const [currentPlaylist, setCurrentPlaylistState] = useState('lofi');
  const [isMusicPlaying,  setIsMusicPlaying]        = useState(false);
  const [volume,          setVolume]                 = useState(70);
  const [iframeReady,     setIframeReady]            = useState(false);

  // ── Timer State ───────────────────────────────────────────────────────────
  const saved = useRef(loadTimerState()).current; // read once

  const [mode,          setMode]          = useState(saved?.mode          || 'work');
  const [timeLeft,      setTimeLeft]      = useState(saved?.timeLeft      ?? MODES.work.duration);
  const [isRunning,     setIsRunning]     = useState(false); // never auto-start on reload
  const [cycleCount,    setCycleCount]    = useState(saved?.cycleCount    || 0);
  const [linkedTopicId, setLinkedTopicId] = useState(saved?.linkedTopicId || null);
  const [isFocusMode,   setIsFocusMode]   = useState(false);

  // Keep mutable refs in sync with state
  useEffect(() => { modeRef.current        = mode;          }, [mode]);
  useEffect(() => { cycleCountRef.current  = cycleCount;    }, [cycleCount]);
  useEffect(() => { linkedTopicIdRef.current = linkedTopicId; }, [linkedTopicId]);

  // Persist timer state to localStorage on every relevant change
  useEffect(() => {
    saveTimerState({ mode, timeLeft, isRunning, cycleCount, linkedTopicId });
  }, [mode, timeLeft, isRunning, cycleCount, linkedTopicId]);

  // ── YouTube postMessage control ────────────────────────────────────────────
  const sendToPlayer = useCallback((func, args = '') => {
    try {
      iframeRef.current?.contentWindow?.postMessage(
        JSON.stringify({ event: 'command', func, args }),
        '*'
      );
    } catch (e) {
      console.warn('YouTube postMessage failed', e);
    }
  }, []);

  // Apply volume once iframe is ready
  useEffect(() => {
    if (iframeReady) {
      setTimeout(() => sendToPlayer('setVolume', [volume]), 300);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [iframeReady]);

  const playMusic  = useCallback(() => { sendToPlayer('playVideo');  setIsMusicPlaying(true);  }, [sendToPlayer]);
  const pauseMusic = useCallback(() => { sendToPlayer('pauseVideo'); setIsMusicPlaying(false); }, [sendToPlayer]);
  const toggleMusic = useCallback(() => {
    if (isMusicPlaying) pauseMusic(); else playMusic();
  }, [isMusicPlaying, playMusic, pauseMusic]);

  const changeVolume = useCallback((vol) => {
    setVolume(vol);
    sendToPlayer('setVolume', [vol]);
  }, [sendToPlayer]);

  const setCurrentPlaylist = useCallback((playlist) => {
    setCurrentPlaylistState(playlist);
    setIsMusicPlaying(false);
    setIframeReady(false);
  }, []);

  // ── Session persistence (fail-safe queue) ─────────────────────────────────
  const logSessionInternal = useCallback(async (userId, topicId, duration, type) => {
    if (sessionLoggedRef.current) return; // hard duplicate guard
    sessionLoggedRef.current = true;

    try {
      await studyService.logPomodoroSession(userId, topicId, duration, type);
      // Flush any queued sessions while we're here
      const pending = [...pendingSessionsRef.current];
      pendingSessionsRef.current = [];
      for (const s of pending) {
        await studyService.logPomodoroSession(s.userId, s.topicId, s.duration, s.type);
      }
    } catch {
      // Queue for retry
      pendingSessionsRef.current.push({ userId, topicId, duration, type });
    }
  }, []);

  // ── Timer: session completion handler (uses refs — truly stable) ──────────
  const handleSessionComplete = useCallback(() => {
    const completedMode  = modeRef.current;
    const count          = cycleCountRef.current;
    const topicId        = linkedTopicIdRef.current;
    const currentUser    = userRef.current;

    if (completedMode === 'work') {
      // Log completed work session
      logSessionInternal(
        currentUser?.id || 'dev-user',
        topicId,
        MODES.work.duration,
        'work'
      );

      // Advance cycle and auto-switch to break
      const newCount = count + 1;
      setCycleCount(newCount);
      cycleCountRef.current = newCount;

      if (newCount % 4 === 0) {
        setMode('long_break');
        modeRef.current = 'long_break';
        setTimeLeft(MODES.long_break.duration);
      } else {
        setMode('short_break');
        modeRef.current = 'short_break';
        setTimeLeft(MODES.short_break.duration);
      }
    } else {
      // Break finished → back to work
      setMode('work');
      modeRef.current = 'work';
      setTimeLeft(MODES.work.duration);
      sessionLoggedRef.current = false; // ready for next work session
    }

    setIsRunning(false);
    sessionStartRef.current = null;
  }, [logSessionInternal]); // logSessionInternal is stable

  // ── Timer tick (setTimeout pattern to avoid stale closures) ───────────────
  useEffect(() => {
    if (!isRunning) return;

    const id = setTimeout(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsRunning(false);
          handleSessionComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearTimeout(id);
  }, [isRunning, timeLeft, handleSessionComplete]);

  // ── Public Timer Actions ──────────────────────────────────────────────────
  const startTimer = useCallback(() => {
    sessionLoggedRef.current = false;
    sessionStartRef.current  = Date.now();
    setIsRunning(true);
  }, []);

  const pauseTimer = useCallback(() => setIsRunning(false), []);

  const resetTimer = useCallback(() => {
    setIsRunning(false);
    setTimeLeft(MODES[modeRef.current].duration);
    sessionLoggedRef.current = false;
    sessionStartRef.current  = null;
  }, []);

  const switchMode = useCallback((newMode) => {
    // Log partial work session (> 30 s) before switching
    if (modeRef.current === 'work' && sessionStartRef.current) {
      const elapsed = Math.floor((Date.now() - sessionStartRef.current) / 1000);
      if (elapsed > 30) {
        logSessionInternal(
          userRef.current?.id || 'dev-user',
          linkedTopicIdRef.current,
          elapsed,
          'work'
        );
      }
    }
    setIsRunning(false);
    setMode(newMode);
    modeRef.current = newMode;
    setTimeLeft(MODES[newMode].duration);
    sessionLoggedRef.current = false;
    sessionStartRef.current  = null;
  }, [logSessionInternal]);

  const linkTopic = useCallback((topicId) => {
    // Log partial session before topic switch
    if (modeRef.current === 'work' && sessionStartRef.current) {
      const elapsed = Math.floor((Date.now() - sessionStartRef.current) / 1000);
      if (elapsed > 30) {
        logSessionInternal(
          userRef.current?.id || 'dev-user',
          linkedTopicIdRef.current,
          elapsed,
          'work'
        );
        sessionLoggedRef.current = false;
        sessionStartRef.current  = Date.now(); // start fresh for new topic
      }
    }
    setLinkedTopicId(topicId);
    linkedTopicIdRef.current = topicId;
  }, [logSessionInternal]);

  // ── Context Value ─────────────────────────────────────────────────────────
  const value = {
    // Music
    PLAYLISTS,
    currentPlaylist,
    setCurrentPlaylist,
    isMusicPlaying,
    volume,
    playMusic,
    pauseMusic,
    toggleMusic,
    changeVolume,
    iframeRef,
    iframeReady,
    setIframeReady,
    // Timer
    MODES,
    mode,
    timeLeft,
    isRunning,
    cycleCount,
    linkedTopicId,
    isFocusMode,
    setIsFocusMode,
    startTimer,
    pauseTimer,
    resetTimer,
    switchMode,
    linkTopic,
  };

  return (
    <FocusContext.Provider value={value}>
      {children}

      {/*
       * Persistent YouTube iframe — mounted ONCE at app root, above BrowserRouter.
       * key={currentPlaylist} causes remount only when user explicitly switches playlist.
       * Route changes do NOT remount this, so music continues across navigation.
       */}
      <iframe
        ref={iframeRef}
        key={currentPlaylist}
        src={`https://www.youtube.com/embed/${PLAYLISTS[currentPlaylist].videoId}?enablejsapi=1&loop=1&playlist=${PLAYLISTS[currentPlaylist].videoId}&rel=0&modestbranding=1&controls=0&iv_load_policy=3`}
        allow="autoplay; encrypted-media"
        onLoad={() => setIframeReady(true)}
        title="Study Music Player"
        style={{
          position: 'fixed',
          bottom: '-9999px',
          left: '-9999px',
          width: '1px',
          height: '1px',
          opacity: 0,
          pointerEvents: 'none',
          border: 'none',
          zIndex: -1,
        }}
      />
    </FocusContext.Provider>
  );
};

export const useFocus = () => useContext(FocusContext);
