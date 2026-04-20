import React, { useContext, useMemo } from 'react';
import { StudyContext } from '../context/StudyContext';
import { useAuth } from '../context/AuthContext';
import { 
  Trophy, 
  Target, 
  Clock, 
  AlertCircle, 
  TrendingUp, 
  ChevronRight,
  Zap,
  ArrowUpRight,
  BookOpen
} from 'lucide-react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { subjects, topics, stats, learningPath } = useContext(StudyContext);
  const { user } = useAuth();
  const navigate = useNavigate();

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
              {stats.streak} Days <Zap className="w-5 h-5 fill-rose-500" />
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Overall Mastery', value: `${stats.mastery}%`, icon: Trophy, color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'Topics Covered', value: stats.totalTopics, icon: Target, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { label: 'Review Required', value: stats.needsReview, icon: AlertCircle, color: 'text-rose-500', bg: 'bg-rose-500/10' },
          { label: 'Study Volume', value: topics.reduce((acc, t) => acc + t.repetitions, 0), icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10' },
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
        {/* Analytics Chart */}
        <motion.div variants={itemVariants} className="lg:col-span-2 card-premium p-8">
           <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-foreground uppercase tracking-tight flex items-center gap-2">
              <TrendingUp className="text-primary w-5 h-5" /> Mastery Progress
            </h3>
            <div className="flex items-center gap-2 bg-muted p-1 rounded-lg">
              <button className="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest bg-card rounded-md shadow-sm text-foreground">Week</button>
              <button disabled className="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground/30">Month</button>
            </div>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.trend}>
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
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' 
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
              {learningPath.map((item, i) => {
                const topic = item.topic;
                return (
                  <div 
                    key={topic.id}
                    onClick={() => navigate('/revision')}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-muted/30 border border-transparent hover:border-primary/20 hover:bg-card hover:shadow-soft transition-all cursor-pointer group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center text-sm font-black text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                         <h4 className="font-black text-primary uppercase text-[10px] tracking-widest">{subjects.find(s => s.id === topic.subject_id)?.name}</h4>
                         {topic.reason && (
                           <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded border
                             ${topic.reason === 'Low accuracy' ? 'text-amber-500 bg-amber-500/10 border-amber-500/20' : 
                               topic.reason === 'Frequently missed' ? 'text-rose-500 bg-rose-500/10 border-rose-500/20' :
                               'text-blue-500 bg-blue-500/10 border-blue-500/20'}
                           `}>{topic.reason}</span>
                         )}
                      </div>
                      <p className="text-foreground font-bold truncate text-sm">{topic.name}</p>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all" />
                  </div>
                );
              })}
              
              {learningPath.length === 0 && (
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
            <p className="text-primary-foreground/80 font-medium text-sm mb-6">You've completed {stats.streak} days of study. Reach 10 for a bonus reward!</p>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${(stats.streak / 10) * 100}%` }} className="h-full bg-white" />
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
