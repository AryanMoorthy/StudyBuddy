import React, { useState, useContext, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { useFocus, PLAYLISTS, MODES } from '../context/FocusContext';
import { StudyContext } from '../context/StudyContext';
import { useAuth } from '../context/AuthContext';
import { studyService } from '../services/studyService';
import {
  Play, Pause, RotateCcw, Timer, BookOpen,
  Volume2, VolumeX, Maximize2, Minimize2,
  Coffee, Brain, Waves, Wind, Music2, ChevronDown,
  Zap, Target, Clock, CheckCircle2,
} from 'lucide-react';
import { toast } from 'react-toastify';

// ── Utility helpers ────────────────────────────────────────────────────────────

const formatTime = (s) => {
  const m = Math.floor(s / 60).toString().padStart(2, '0');
  const sec = (s % 60).toString().padStart(2, '0');
  return `${m}:${sec}`;
};

const formatDuration = (seconds) => {
  if (!seconds || seconds < 60) return seconds ? `${seconds}s` : '—';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
};

const PLAYLIST_ICONS = {
  lofi:        Music2,
  nature:      Waves,
  classical:   Brain,
  white_noise: Wind,
};

const MODE_META = {
  work:        { color: 'var(--tw-color-primary)',   label: 'Focus',       bg: 'bg-primary/10',     text: 'text-primary',     ring: 'ring-primary/30'   },
  short_break: { color: '#10b981',                   label: 'Short Break', bg: 'bg-emerald-500/10', text: 'text-emerald-500', ring: 'ring-emerald-500/30' },
  long_break:  { color: '#3b82f6',                   label: 'Long Break',  bg: 'bg-blue-500/10',    text: 'text-blue-500',    ring: 'ring-blue-500/30'  },
};

// ── Circular Timer SVG ─────────────────────────────────────────────────────────

const CircularTimer = ({ timeLeft, totalTime, mode }) => {
  const radius        = 88;
  const circumference = 2 * Math.PI * radius;
  const progress      = totalTime > 0 ? timeLeft / totalTime : 0;
  const offset        = circumference * (1 - progress);

  const strokeColors = {
    work:        '#8b5cf6',
    short_break: '#10b981',
    long_break:  '#3b82f6',
  };
  const stroke = strokeColors[mode] || '#8b5cf6';

  return (
    <svg width="200" height="200" className="absolute inset-0 m-auto transform -rotate-90">
      {/* Track */}
      <circle cx="100" cy="100" r={radius} fill="none" stroke="currentColor" strokeWidth="6"
        className="text-muted/20" />
      {/* Progress */}
      <circle
        cx="100" cy="100" r={radius}
        fill="none"
        stroke={stroke}
        strokeWidth="6"
        strokeLinecap="round"
        style={{
          strokeDasharray: circumference,
          strokeDashoffset: offset,
          transition: 'stroke-dashoffset 1s linear, stroke 0.4s ease',
          filter: `drop-shadow(0 0 8px ${stroke}60)`,
        }}
      />
    </svg>
  );
};

// ── Sub-components ─────────────────────────────────────────────────────────────

const CycleIndicators = ({ cycleCount }) => (
  <div className="flex items-center gap-1.5">
    {[0, 1, 2, 3].map(i => (
      <div
        key={i}
        className={`w-2 h-2 rounded-full transition-all duration-300 ${
          i < (cycleCount % 4)
            ? 'bg-primary scale-110'
            : 'bg-muted-foreground/20'
        }`}
      />
    ))}
    {cycleCount > 0 && (
      <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">
        {Math.floor(cycleCount / 4) > 0 ? `×${Math.floor(cycleCount / 4) + 1}` : ''}
      </span>
    )}
  </div>
);

// ── Main Page ──────────────────────────────────────────────────────────────────

const Focus = () => {
  const { user } = useAuth();
  const { topics, subjects } = useContext(StudyContext);
  const {
    PLAYLISTS: playlists, MODES: modes,
    currentPlaylist, setCurrentPlaylist,
    isMusicPlaying, volume, playMusic, pauseMusic, toggleMusic, changeVolume,
    mode, timeLeft, isRunning, cycleCount, linkedTopicId,
    isFocusMode, setIsFocusMode,
    startTimer, pauseTimer, resetTimer, switchMode, linkTopic,
  } = useFocus();

  const [searchParams] = useSearchParams();
  const initRef = useRef(false);

  // Auto-launch from Today's Plan
  useEffect(() => {
    if (!topics.length || initRef.current) return;

    const topicId = searchParams.get('topicId');
    const durationParam = searchParams.get('duration');

    if (topicId) {
       linkTopic(topicId);
       if (durationParam && !isRunning) {
          startTimer();
       }
       initRef.current = true;
    }
  }, [topics, searchParams, isRunning, linkTopic, startTimer]);

  const [timeSummary, setTimeSummary] = useState({});
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  // Fetch topic time summary on mount
  useEffect(() => {
    if (!user?.id) return;
    studyService.getTopicTimeSummary(user.id).then(({ data }) => {
      if (data) setTimeSummary(data);
    });
  }, [user?.id, isRunning]); // refetch when timer state changes

  const totalTime   = modes[mode]?.duration || MODES.work.duration;
  const percentage  = totalTime > 0 ? Math.round(((totalTime - timeLeft) / totalTime) * 100) : 0;
  const meta        = MODE_META[mode] || MODE_META.work;

  // Sorted topics with time spent
  const topicsWithTime = useMemo(() => topics.map(t => ({
    ...t,
    totalTime: timeSummary[t.id] || 0,
    subjectName: subjects.find(s => s.id === t.subject_id)?.name || '',
  })).sort((a, b) => b.totalTime - a.totalTime), [topics, subjects, timeSummary]);

  const linkedTopic = useMemo(() =>
    topics.find(t => t.id === linkedTopicId), [topics, linkedTopicId]);

  const handleLinkTopic = (topicId) => {
    linkTopic(topicId || null);
    if (topicId) {
      const t = topics.find(t => t.id === topicId);
      if (t) toast.info(`⏱️ Timer linked to "${t.name}"`);
    }
  };

  const currentPlaylistMeta = playlists[currentPlaylist];
  const PlaylistIcon = PLAYLIST_ICONS[currentPlaylist] || Music2;

  // ── Focus Mode Overlay ─────────────────────────────────────────────────────
  if (isFocusMode) {
    return (
      <div className="fixed inset-0 bg-background z-[200] flex flex-col items-center justify-center gap-8 p-8">
        <button
          onClick={() => setIsFocusMode(false)}
          className="fixed top-6 right-6 p-3 bg-card border border-border rounded-2xl text-muted-foreground hover:text-foreground transition-all shadow-soft z-10"
        >
          <Minimize2 className="w-5 h-5" />
        </button>

        {/* Minimal timer */}
        <div className="flex flex-col items-center gap-6">
          <span className={`text-[10px] font-black uppercase tracking-[0.4em] ${meta.text} px-4 py-1.5 ${meta.bg} rounded-full`}>
            {meta.label}
            {linkedTopic && <span className="ml-2 opacity-70">— {linkedTopic.name}</span>}
          </span>

          <div className="relative w-64 h-64 flex items-center justify-center">
            <CircularTimer timeLeft={timeLeft} totalTime={totalTime} mode={mode} />
            <span className="text-7xl font-black tracking-tighter text-foreground tabular-nums z-10 select-none">
              {formatTime(timeLeft)}
            </span>
          </div>

          <CycleIndicators cycleCount={cycleCount} />

          <div className="flex items-center gap-4">
            <button onClick={resetTimer}
              className="p-4 bg-muted text-muted-foreground rounded-2xl hover:bg-muted/80 transition-all">
              <RotateCcw className="w-5 h-5" />
            </button>
            <button
              onClick={isRunning ? pauseTimer : startTimer}
              className={`px-12 py-5 rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-premium hover:-translate-y-0.5 ${
                isRunning ? 'bg-muted text-foreground' : 'bg-primary text-primary-foreground'
              }`}
            >
              {isRunning ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
            </button>
          </div>

          {/* Minimal music control */}
          <div className="flex items-center gap-3 px-6 py-4 bg-card border border-border rounded-2xl shadow-soft">
            <PlaylistIcon className={`w-4 h-4 ${meta.text}`} />
            <span className="text-xs font-black uppercase tracking-widest text-foreground">
              {currentPlaylistMeta.name}
            </span>
            <button onClick={toggleMusic}
              className="p-2 bg-primary text-primary-foreground rounded-xl ml-2 hover:bg-primary/80 transition-all">
              {isMusicPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Full Page Layout ───────────────────────────────────────────────────────
  return (
    <div className="space-y-8 animate-fade-in pb-20">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl lg:text-5xl font-black tracking-tight text-foreground flex items-center gap-3">
            <Timer className="w-10 h-10 text-primary" />
            Focus Mode
          </h1>
          <p className="text-muted-foreground mt-2 text-lg font-medium">
            Deep work sessions with music. Every second tracked.
          </p>
        </div>
        <button
          onClick={() => setIsFocusMode(true)}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-2xl font-black uppercase tracking-widest text-xs shadow-premium hover:-translate-y-0.5 transition-all"
        >
          <Maximize2 className="w-4 h-4" /> Enter Focus Mode
        </button>
      </header>

      {/* Three-panel grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr_300px] gap-6 items-start">

        {/* ── LEFT: Task Linker ──────────────────────────────────────────── */}
        <div className="card-premium p-6 space-y-6">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">
              Link Task
            </h2>
          </div>

          <div className="relative">
            <select
              value={linkedTopicId || ''}
              onChange={(e) => handleLinkTopic(e.target.value || null)}
              className="w-full bg-muted/20 border border-border rounded-2xl px-4 py-4 text-sm font-bold text-foreground outline-none focus:ring-2 focus:ring-primary cursor-pointer appearance-none pr-8"
            >
              <option value="" disabled hidden>No task linked</option>
              {topicsWithTime.map(t => (
                <option key={t.id} value={t.id}>
                  [{t.subjectName}] {t.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>

          {linkedTopic && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-primary/5 border border-primary/20 rounded-2xl"
            >
              <p className="text-[9px] font-black uppercase tracking-widest text-primary mb-1">Active Task</p>
              <p className="text-sm font-black text-foreground">{linkedTopic.name}</p>
              <p className="text-[10px] text-muted-foreground mt-1 font-bold">
                {subjects.find(s => s.id === linkedTopic.subject_id)?.name}
              </p>
            </motion.div>
          )}

          {/* Topic time leaderboard */}
          <div className="space-y-2">
            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Time Invested</p>
            <div className="space-y-2 max-h-72 overflow-y-auto custom-scrollbar">
              {topicsWithTime.filter(t => t.totalTime > 0).length === 0 ? (
                <p className="text-xs text-muted-foreground font-medium text-center py-4 opacity-60">
                  Complete a session to see time tracking here.
                </p>
              ) : (
                topicsWithTime.filter(t => t.totalTime > 0).map((t, i) => (
                  <div
                    key={t.id}
                    onClick={() => handleLinkTopic(t.id)}
                    className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${
                      linkedTopicId === t.id
                        ? 'bg-primary/10 border border-primary/20'
                        : 'bg-muted/20 hover:bg-muted/40'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-[9px] font-black text-muted-foreground w-4">{i + 1}</span>
                      <div className="min-w-0">
                        <p className="text-xs font-black text-foreground truncate">{t.name}</p>
                        <p className="text-[9px] text-muted-foreground">{t.subjectName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 ml-2">
                      <Clock className="w-3 h-3 text-primary" />
                      <span className="text-[10px] font-black text-primary">{formatDuration(t.totalTime)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* ── CENTER: Pomodoro Timer ─────────────────────────────────────── */}
        <div className="card-premium p-8 flex flex-col items-center gap-8">

          {/* Mode switcher */}
          <div className="flex items-center gap-2 p-1.5 bg-muted/30 rounded-2xl w-full max-w-sm">
            {Object.values(modes).map((m) => (
              <button
                key={m.key}
                onClick={() => switchMode(m.key)}
                className={`flex-1 py-2.5 px-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  mode === m.key
                    ? 'bg-card text-foreground shadow-soft'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {m.key === 'work' && <Brain className="w-3 h-3 inline mr-1" />}
                {m.key === 'short_break' && <Coffee className="w-3 h-3 inline mr-1" />}
                {m.key === 'long_break' && <Waves className="w-3 h-3 inline mr-1" />}
                {m.label}
              </button>
            ))}
          </div>

          {/* Circular countdown */}
          <div className="flex flex-col items-center gap-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={mode}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                className="relative w-[200px] h-[200px] flex items-center justify-center"
              >
                <CircularTimer timeLeft={timeLeft} totalTime={totalTime} mode={mode} />

                <div className="flex flex-col items-center z-10 select-none">
                  <span className={`text-[9px] font-black uppercase tracking-widest ${meta.text} mb-1`}>
                    {meta.label}
                  </span>
                  <span className="text-5xl font-black tracking-tighter text-foreground tabular-nums">
                    {formatTime(timeLeft)}
                  </span>
                  <span className="text-xs font-bold text-muted-foreground mt-1">
                    {percentage}% complete
                  </span>
                </div>
              </motion.div>
            </AnimatePresence>

            <CycleIndicators cycleCount={cycleCount} />

            {cycleCount > 0 && (
              <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">
                {cycleCount} session{cycleCount !== 1 ? 's' : ''} completed today
              </p>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4">
            <button
              onClick={resetTimer}
              className="p-4 bg-muted text-muted-foreground rounded-2xl hover:bg-muted/80 hover:text-foreground transition-all shadow-soft"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            <button
              onClick={isRunning ? pauseTimer : startTimer}
              className={`px-16 py-5 rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-premium hover:-translate-y-1 flex items-center gap-3 ${
                isRunning
                  ? 'bg-muted text-foreground hover:bg-muted/80'
                  : 'bg-primary text-primary-foreground hover:bg-primary/90'
              }`}
            >
              {isRunning ? (
                <><Pause className="w-5 h-5" /> Pause</>
              ) : (
                <><Play className="w-5 h-5" /> {timeLeft === totalTime ? 'Start' : 'Resume'}</>
              )}
            </button>
          </div>

          {/* Session info */}
          {linkedTopic && (
            <div className="flex items-center gap-2 px-4 py-2 bg-primary/5 border border-primary/20 rounded-xl">
              <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-widest text-primary">
                Tracking: {linkedTopic.name}
              </span>
            </div>
          )}

          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-3 w-full max-w-sm">
            {[
              { label: 'Session',  value: formatTime(totalTime - timeLeft) },
              { label: 'Cycles',   value: cycleCount },
              { label: 'Today',    value: linkedTopicId ? formatDuration(timeSummary[linkedTopicId] || 0) : '—' },
            ].map(({ label, value }) => (
              <div key={label} className="flex flex-col items-center p-3 bg-muted/20 rounded-2xl">
                <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">{label}</p>
                <p className="text-lg font-black text-foreground mt-0.5">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT: Study Music ─────────────────────────────────────────── */}
        <div className="card-premium p-6 space-y-6">
          <div className="flex items-center gap-2">
            <Music2 className="w-5 h-5 text-primary" />
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">
              Study Music
            </h2>
          </div>

          {/* Playlist tabs */}
          <div className="grid grid-cols-2 gap-2">
            {Object.values(playlists).map((pl) => {
              const Icon = PLAYLIST_ICONS[pl.key] || Music2;
              const isActive = currentPlaylist === pl.key;
              return (
                <button
                  key={pl.key}
                  onClick={() => setCurrentPlaylist(pl.key)}
                  className={`flex flex-col items-start gap-1.5 p-3 rounded-2xl border text-left transition-all ${
                    isActive
                      ? 'bg-primary/10 border-primary/30 shadow-premium'
                      : 'bg-muted/20 border-transparent hover:bg-muted/40'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                  <p className={`text-[10px] font-black uppercase tracking-wide leading-tight ${
                    isActive ? 'text-primary' : 'text-foreground'
                  }`}>
                    {pl.name}
                  </p>
                  <p className="text-[8px] font-bold text-muted-foreground">{pl.desc}</p>
                </button>
              );
            })}
          </div>

          {/* Now playing indicator */}
          <div className={`p-4 rounded-2xl border transition-all ${
            isMusicPlaying
              ? 'bg-primary/5 border-primary/20'
              : 'bg-muted/20 border-transparent'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                isMusicPlaying ? 'bg-primary text-primary-foreground shadow-premium' : 'bg-muted text-muted-foreground'
              }`}>
                <PlaylistIcon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black text-foreground truncate">{currentPlaylistMeta.name}</p>
                <p className="text-[9px] text-muted-foreground font-medium">
                  {isMusicPlaying ? '♪ Now playing' : 'Paused'}
                </p>
              </div>
              {/* Animated bars when playing */}
              {isMusicPlaying && (
                <div className="flex items-end gap-0.5 h-5">
                  {[0.6, 1, 0.7, 0.9, 0.5].map((h, i) => (
                    <div
                      key={i}
                      className="w-1 bg-primary rounded-full"
                      style={{
                        height: `${h * 100}%`,
                        animation: `equalizer 0.8s ease-in-out infinite alternate`,
                        animationDelay: `${i * 0.1}s`,
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Playback controls */}
          <div className="flex flex-col gap-4">
            <button
              onClick={toggleMusic}
              className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 shadow-soft ${
                isMusicPlaying
                  ? 'bg-muted text-foreground hover:bg-muted/80'
                  : 'bg-foreground text-background hover:bg-foreground/90'
              }`}
            >
              {isMusicPlaying ? <><Pause className="w-4 h-4" /> Pause</> : <><Play className="w-4 h-4" /> Play</>}
            </button>

            {/* Volume slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setShowVolumeSlider(v => !v)}
                  className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
                >
                  {volume === 0 ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                  Volume
                </button>
                <span className="text-[9px] font-black text-muted-foreground">{volume}%</span>
              </div>
              <AnimatePresence>
                {showVolumeSlider && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={volume}
                      onChange={(e) => changeVolume(Number(e.target.value))}
                      className="w-full accent-primary cursor-pointer"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Tip */}
          <div className="p-3 bg-muted/20 rounded-2xl">
            <p className="text-[9px] text-muted-foreground font-bold leading-relaxed">
              💡 Music continues playing when you switch pages. Use the mini-player in the sidebar to control it from anywhere.
            </p>
          </div>
        </div>
      </div>

      {/* CSS for equalizer animation */}
      <style>{`
        @keyframes equalizer {
          from { transform: scaleY(0.3); }
          to   { transform: scaleY(1); }
        }
      `}</style>
    </div>
  );
};

export default Focus;
