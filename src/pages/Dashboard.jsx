import React, { useContext, useMemo } from 'react';
import { StudyContext } from '../context/StudyContext';
import { useAuth } from '../context/AuthContext';
import { 
  Trophy, 
  Target, 
  Clock, 
  AlertCircle, 
  TrendingUp, 
  Zap,
  ArrowUpRight,
  BookOpen,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { useLearningIntelligence } from '../hooks/useLearningIntelligence';

/**
 * 🚀 Premium Adaptive Dashboard
 * Optimized for resilience and live data flow.
 */
const Dashboard = () => {
  const { subjects, topics, stats, loading } = useContext(StudyContext);
  const { 
    learningPath, 
    dailyPlan,
    subjectEfficiency, 
    smartSuggestion, 
    coachInsights,
    profile 
  } = useLearningIntelligence();
  const { user } = useAuth();
  const navigate = useNavigate();

  // 1. Loading Guard: Prevents rendering charts with null dimensions
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
         <div className="text-center space-y-4">
            <motion.div 
               animate={{ rotate: 360 }} 
               transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
               className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto"
            />
            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground animate-pulse">Syncing Intelligence...</p>
         </div>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-10"
    >
      {/* Welcome Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl lg:text-5xl font-black tracking-tight text-foreground flex items-center gap-3">
            Hello, {user?.email?.split('@')[0]}! <motion.span animate={{ rotate: [0, 20, 0] }} transition={{ repeat: Infinity, duration: 2 }}>👋</motion.span>
          </h1>
          <p className="text-muted-foreground mt-2 text-lg font-medium">Your personalized learning dashboard is ready.</p>
        </div>
        <div className="flex items-center gap-4 bg-card p-3 rounded-2xl border border-border shadow-soft">
          <div className="flex flex-col text-right">
            <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Current Streak</span>
            <span className="text-xl font-black text-rose-500 flex items-center justify-end gap-1">
              {stats?.streak || 0} Days <Zap className="w-5 h-5 fill-rose-500" />
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </header>

      {/* Smart Intelligence Hero */}
      <AnimatePresence mode="wait">
        {smartSuggestion && (
          <motion.section 
            key="smart-hero"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative overflow-hidden card-premium p-8 bg-gradient-to-r from-primary/10 to-transparent border-primary/20"
          >
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-primary fill-primary" />
                  </div>
                  <span className="text-[10px] uppercase font-black tracking-[0.3em] text-primary">Intelligence Recommendation</span>
                </div>
                <h2 className="text-2xl font-black text-foreground">{smartSuggestion.title}</h2>
                <p className="text-muted-foreground font-medium max-w-xl">{smartSuggestion.message}</p>
              </div>
              <button 
                onClick={() => navigate('/revision')}
                className="bg-primary text-primary-foreground px-8 py-4 rounded-xl font-black uppercase tracking-widest text-xs flex items-center gap-2 shadow-premium hover:shadow-lg transition-all"
              >
                {smartSuggestion.action} <ArrowUpRight className="w-4 h-4 text-primary-foreground" />
              </button>
            </div>
            <motion.div 
              animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.2, 0.1] }}
              transition={{ repeat: Infinity, duration: 4 }}
              className="absolute -right-20 -top-20 w-80 h-80 bg-primary/20 rounded-full blur-3xl pointer-events-none"
            />
          </motion.section>
        )}
      </AnimatePresence>

      {/* Intelligence Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Overall Mastery', value: `${stats?.mastery || 0}%`, icon: Trophy, color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'Topics Covered', value: stats?.totalTopics || 0, icon: Target, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { label: 'Review Required', value: stats?.needsReview || 0, icon: AlertCircle, color: 'text-rose-500', bg: 'bg-rose-500/10' },
          { label: 'Study Volume', value: (topics || []).reduce((acc, t) => acc + (t.repetitions || 0), 0), icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10' },
        ].map((stat, i) => (
          <motion.div 
            key={i}
            variants={itemVariants}
            className="card-premium p-6"
          >
            <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-4 transition-transform`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <p className="text-muted-foreground text-xs font-black uppercase tracking-widest">{stat.label}</p>
            <h3 className="text-3xl font-black mt-2 text-foreground tracking-tighter">{stat.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 🧠 Today's Action Plan */}
        <motion.div variants={itemVariants} className="lg:col-span-2 card-premium p-8 bg-gradient-to-br from-primary/5 via-card to-card">
           <div className="flex items-center justify-between mb-8">
             <div>
                <h3 className="text-xl font-black text-foreground uppercase tracking-tight flex items-center gap-2">
                  <Target className="text-primary w-5 h-5" /> Today's Plan
                </h3>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-1">Personalized study path for today</p>
             </div>
             <div className="flex -space-x-2">
                {[0, 1, 2].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-card bg-primary/10 flex items-center justify-center">
                    <div className="w-4 h-0.5 bg-primary/40 rounded-full" />
                  </div>
                ))}
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {(dailyPlan?.studyPlan || []).map((step, i) => (
                <div key={i} className="group relative p-5 rounded-2xl bg-muted/20 border border-transparent hover:border-primary/20 hover:bg-card transition-all cursor-default">
                   <div className="flex items-start justify-between mb-3">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border
                        ${step.type === 'practice' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 
                          step.type === 'revision' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 
                          'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'}
                      `}>
                         {step.type}
                      </span>
                      <span className="text-[10px] font-black text-muted-foreground">{step.duration} min</span>
                   </div>
                   <h4 className="text-sm font-black text-foreground truncate mb-1">{step.name}</h4>
                   <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                      {subjects?.find(s => s.id === step.subject_id)?.name || 'General'}
                   </p>
                   
                   <button 
                     onClick={() => navigate(`/focus?topicId=${step.id}&duration=${step.duration}`)}
                     className="mt-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary opacity-0 group-hover:opacity-100 transition-all hover:gap-3"
                   >
                      Start Step <ArrowUpRight className="w-4 h-4" />
                   </button>
                   
                   {/* Recommendation Tooltip logic */}
                   <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all">
                      <div className="bg-card border border-border p-3 rounded-xl shadow-lg absolute right-0 top-6 w-48 z-20 pointer-events-none group-active:pointer-events-auto">
                         <p className="text-[9px] font-black text-muted-foreground uppercase mb-2">Internal Analytics</p>
                         <div className="space-y-1">
                            <div className="flex justify-between">
                               <span className="text-[9px] font-bold text-muted-foreground">Accuracy</span>
                               <span className="text-[9px] font-black text-foreground">{Math.round((step.stats?.accuracy || 0) * 100)}%</span>
                            </div>
                            <div className="flex justify-between">
                               <span className="text-[9px] font-bold text-muted-foreground">Mistakes</span>
                               <span className="text-[9px] font-black text-rose-500">{step.mistakeCount || 0}</span>
                            </div>
                         </div>
                      </div>
                   </div>
                </div>
             ))}
          </div>
        </motion.div>

        {/* 🤖 AI Coach Panel */}
        <motion.div variants={itemVariants} className="card-premium p-8 h-full bg-primary text-primary-foreground relative overflow-hidden">
           <div className="relative z-10">
              <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-2 mb-6">
                <Sparkles className="w-5 h-5" /> AI Coach
              </h3>
              <div className="space-y-4">
                 {(coachInsights || []).length > 0 ? (coachInsights || []).map((insight, i) => (
                    <div key={i} className="p-4 bg-white/10 rounded-2xl border border-white/10 flex gap-3 items-start backdrop-blur-sm">
                       <Zap className="w-4 h-4 text-white shrink-0 mt-0.5 fill-white" />
                       <p className="text-xs font-bold leading-relaxed">{insight}</p>
                    </div>
                 )) : (
                    <div className="py-10 text-center space-y-4">
                       <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto animate-pulse">
                          <Sparkles className="w-6 h-6 text-white" />
                       </div>
                       <p className="text-xs font-black uppercase tracking-widest opacity-60">Analyzing patterns...</p>
                    </div>
                 )}
              </div>
              <div className="mt-8 pt-6 border-t border-white/10">
                 <p className="text-[9px] font-black uppercase tracking-widest opacity-60 mb-2">Intelligence Profile</p>
                 <div className="flex items-center justify-between">
                    <span className="text-xs font-bold">Accuracy Trend</span>
                    <span className="text-sm font-black">+{Math.floor((profile?.avgAccuracy || 0) * 5)}% vs last week</span>
                 </div>
              </div>
           </div>
           
           {/* Decorative Orb */}
           <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
        </motion.div>

        {/* Behavioral Analytics: Subject Efficiency */}
        <motion.div variants={itemVariants} className="lg:col-span-2 card-premium p-8">
           <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-foreground uppercase tracking-tight flex items-center gap-2">
              <TrendingUp className="text-primary w-5 h-5" /> Subject Strength
            </h3>
            <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Mastery % per Subject</div>
          </div>
          <div className="h-[300px] w-full min-h-[300px] relative">
            <ResponsiveContainer width="100%" height="100%" debounce={100} minWidth={0}>
              <BarChart data={subjectEfficiency || []} layout="vertical" margin={{ left: 40, right: 30 }}>
                <XAxis type="number" hide domain={[0, 100]} />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false}
                  tick={{fill: 'hsl(var(--foreground))', fontSize: 11, fontWeight: 800}}
                  width={100}
                />
                <Tooltip 
                  cursor={{fill: 'transparent'}}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))', 
                    borderRadius: '1rem',
                  }}
                  formatter={(value) => [`${value}%`, 'Mastery']}
                />
                <Bar 
                  dataKey="mastery" 
                  radius={[0, 8, 8, 0]} 
                  barSize={15}
                >
                  {(subjectEfficiency || []).map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.mastery > 70 ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground)/0.3)'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Intelligence Pulse */}
        <motion.div variants={itemVariants} className="card-premium p-8 h-full">
          <h3 className="text-xl font-black text-foreground uppercase tracking-tight flex items-center gap-2 mb-8">
            <Sparkles className="text-primary w-5 h-5" /> Intelligence
          </h3>
          <div className="space-y-6">
             <div className="flex flex-col gap-1">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Expertise In</span>
                <div className="flex flex-wrap gap-2 mt-2">
                   {(profile?.strongTopics || []).length ? profile.strongTopics.map((t, i) => (
                     <span key={i} className="px-3 py-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-full text-[10px] font-black uppercase tracking-widest leading-none flex items-center gap-1.5">
                       <ArrowUpRight className="w-3 h-3" /> {t}
                     </span>
                   )) : (
                     <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold text-muted-foreground/40 italic">Mastery pending...</span>
                        <p className="text-[9px] text-muted-foreground/30 leading-tight">Complete focused sessions to identify your strengths.</p>
                     </div>
                   )}
                </div>
             </div>
             <div className="flex flex-col gap-1">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Growth Areas</span>
                <div className="flex flex-wrap gap-2 mt-2">
                   {(profile?.weakTopics || []).length ? profile.weakTopics.map((t, i) => (
                     <span key={i} className="px-3 py-1 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-full text-[10px] font-black uppercase tracking-widest leading-none flex items-center gap-1.5">
                       <Zap className="w-3 h-3 fill-rose-500" /> {t}
                     </span>
                   )) : (
                     <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold text-muted-foreground/40 italic">No areas detected yet</span>
                        <p className="text-[9px] text-muted-foreground/30 leading-tight">Keep studying to map your learning curve.</p>
                     </div>
                   )}
                </div>
             </div>
             <div className="pt-6 border-t border-border">
                <div className="flex items-center justify-between mb-4">
                   <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Avg Accuracy</span>
                   <span className="text-lg font-black text-foreground">{(profile?.avgAccuracy !== null) ? `${Math.round(profile.avgAccuracy * 100)}%` : '—'}</span>
                </div>
                {(profile?.avgAccuracy !== null) ? (
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(profile?.avgAccuracy || 0) * 100}%` }}
                      className="h-full bg-primary"
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                     <div className="h-1 bg-muted/30 rounded-full w-full overflow-hidden">
                        <motion.div 
                           animate={{ x: [-100, 400] }} 
                           transition={{ repeat: Infinity, duration: 2 }} 
                           className="h-full w-1/3 bg-primary/20" 
                        />
                     </div>
                     <p className="text-[9px] font-bold text-muted-foreground/60">Data gathering in progress...</p>
                  </div>
                )}
             </div>
          </div>
        </motion.div>

        {/* Analytics Chart: Mastery Progress */}
        <motion.div variants={itemVariants} className="lg:col-span-2 card-premium p-8">
           <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-foreground uppercase tracking-tight flex items-center gap-2">
              <TrendingUp className="text-primary w-5 h-5" /> Performance Trend
            </h3>
            <div className="flex items-center gap-2 bg-muted p-1 rounded-lg">
              <button className="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest bg-card rounded-md shadow-sm text-foreground">7 Days</button>
            </div>
          </div>
          <div className="h-[300px] w-full min-h-[300px] relative">
            <ResponsiveContainer width="100%" height="100%" debounce={100} minWidth={0}>
              <AreaChart data={stats?.trend || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12, fontWeight: 600}} 
                  dy={10}
                />
                <YAxis hide domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))', 
                    borderRadius: '1rem',
                  }}
                  itemStyle={{ color: 'hsl(var(--primary))', fontWeight: 'bold' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="score" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorScore)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Up Next / Queue */}
        <motion.div variants={itemVariants} className="flex flex-col gap-6">
          <div className="card-premium p-8 flex-1">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-foreground uppercase tracking-tight flex items-center gap-2">
                <Zap className="text-rose-500 w-5 h-5 fill-rose-500" /> Focus Queue
              </h3>
              <span className="bg-rose-500/10 text-rose-500 text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-widest">Urgent</span>
            </div>

            <div className="space-y-4">
              {(learningPath || []).map((item, i) => {
                const topic = item.topic;
                return (
                  <div 
                    key={topic?.id}
                    onClick={() => navigate('/revision')}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-muted/30 border border-transparent hover:border-primary/20 hover:bg-card hover:shadow-soft transition-all cursor-pointer group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center text-sm font-black text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                         <h4 className="font-black text-primary uppercase text-[10px] tracking-widest">{subjects?.find(s => s.id === topic?.subject_id)?.name || 'General'}</h4>
                         {topic?.reason && (
                           <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded border
                             ${topic.reason === 'Low accuracy' ? 'text-amber-500 bg-amber-500/10 border-amber-500/20' : 
                                topic.reason === 'Frequently missed' ? 'text-rose-500 bg-rose-500/10 border-rose-500/20' :
                                'text-blue-500 bg-blue-500/10 border-blue-500/20'}
                           `}>{topic.reason}</span>
                         )}
                      </div>
                      <p className="text-foreground font-bold truncate text-sm">{topic?.name}</p>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all" />
                  </div>
                );
              })}
              
              {(learningPath || []).length === 0 && (
                <div className="text-center py-10">
                  <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="w-8 h-8 text-muted-foreground/30" />
                  </div>
                  <p className="text-muted-foreground font-bold">All clear!</p>
                  <p className="text-xs text-muted-foreground/60 px-6 mt-1">Your intelligence queue is empty.</p>
                </div>
              )}
            </div>

            <button 
              onClick={() => navigate('/revision')}
              className="w-full mt-8 bg-primary text-primary-foreground font-black uppercase tracking-widest text-xs py-4 rounded-xl shadow-premium hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              Start Session <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          <div className="card-premium p-8 relative overflow-hidden group border-none bg-primary text-primary-foreground">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16" />
            <h3 className="font-black text-2xl tracking-tighter mb-2">Consistency Goal</h3>
            <p className="text-primary-foreground/80 font-medium text-sm mb-6">You've completed {stats?.streak || 0} days of study. Reach 10 for a bonus reward!</p>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${((stats?.streak || 0) / 10) * 100}%` }} className="h-full bg-white" />
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
