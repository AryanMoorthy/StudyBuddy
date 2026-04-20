import React, { useState, useContext, useMemo } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { StudyContext } from '../context/StudyContext';
import { 
  Calendar as CalendarIcon, 
  CheckCircle2, 
  Play,
  RotateCcw,
  Target,
  ArrowRight,
  X,
  Zap
} from 'lucide-react';
import { format, isSameDay } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';

const Revision = () => {
  const { subjects, topics, recordStudySession } = useContext(StudyContext);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeSessionTopic, setActiveSessionTopic] = useState(null);

  const dueTopics = useMemo(() => {
    return topics.filter(t => {
      const nextReview = new Date(t.next_review);
      return isSameDay(nextReview, selectedDate) || 
             (isSameDay(selectedDate, new Date()) && nextReview < new Date());
    });
  }, [topics, selectedDate]);

  const handleRateSession = async (rating) => {
    const { error } = await recordStudySession(activeSessionTopic.id, rating, 25);
    if (!error) {
      setActiveSessionTopic(null);
    }
  };

  const getDayClass = ({ date }) => {
    const hasTopic = topics.some(t => isSameDay(new Date(t.next_review), date));
    return hasTopic ? 'has-revision-indicator relative' : '';
  };

  return (
    <div className="space-y-10 animate-fade-in text-foreground">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl lg:text-5xl font-black tracking-tight text-foreground uppercase italic underline decoration-primary decoration-4 underline-offset-8">
            Revision Engine
          </h1>
          <p className="text-muted-foreground mt-6 text-lg font-medium">Maximize retention with Spaced Repetition (SM-2).</p>
        </div>
        <div className="flex items-center gap-4 bg-primary/5 border border-primary/10 px-6 py-3 rounded-2xl">
          <Zap className="w-5 h-5 text-primary fill-primary/20" />
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-black tracking-widest text-primary">Daily Goal</span>
            <span className="text-sm font-black text-foreground">{topics.filter(t => new Date(t.next_review) <= new Date()).length} Topics Due Today</span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Calendar Selection Card */}
        <div className="lg:col-span-4 space-y-6">
          <div className="card-premium p-8 bg-card shadow-lg">
            <h3 className="text-xl font-black text-foreground uppercase tracking-tight mb-6 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-primary" /> Review Schedule
            </h3>
            <div className="premium-calendar">
              <Calendar 
                onChange={setSelectedDate} 
                value={selectedDate}
                className="rounded-2xl"
                tileClassName={getDayClass}
              />
            </div>
          </div>

          <div className="card-premium p-8 bg-primary text-primary-foreground border-none shadow-premium relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-white/20 transition-all" />
            <h4 className="text-xl font-black tracking-tighter mb-2">Power Hour</h4>
            <p className="text-primary-foreground/80 text-sm font-medium leading-relaxed mb-6">
              Concentrated revision session for high-priority topics due today. 
            </p>
            <button className="w-full bg-primary-foreground text-primary font-black uppercase tracking-widest text-xs py-4 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all">
              Initialize System
            </button>
          </div>
        </div>

        {/* Study Portal */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          <div className="card-premium p-10 bg-card overflow-hidden relative flex-1 min-h-[500px]">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-muted">
              <motion.div 
                className="h-full bg-primary shadow-[0_0_15px_rgba(139,92,246,0.5)]" 
                initial={{ width: '0%' }}
                animate={{ width: `${(topics.filter(t => t.repetitions > 0).length / Math.max(topics.length, 1)) * 100}%` }}
              />
            </div>

            <div className="flex items-center justify-between mb-12">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center">
                  <Play className="w-5 h-5 text-primary fill-primary/10" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-foreground tracking-tight">Active Portal</h3>
                  <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest">{format(selectedDate, 'MMMM dd, yyyy')}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Topics Pipeline</span>
                <p className="text-2xl font-black text-foreground tracking-tighter">{dueTopics.length}</p>
              </div>
            </div>

            <div className="space-y-4">
              {dueTopics.map((topic, i) => (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  key={topic.id}
                  className="flex items-center gap-6 p-6 rounded-[2.5rem] bg-muted/20 border border-border hover:bg-muted/40 transition-all group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-card border border-border flex items-center justify-center text-sm font-black text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-1">{subjects.find(s => s.id === topic.subject_id)?.name}</p>
                    <h4 className="text-xl font-black text-foreground tracking-tight truncate">{topic.name}</h4>
                  </div>
                  <button 
                    onClick={() => setActiveSessionTopic(topic)}
                    className="px-6 py-3 bg-card border border-border rounded-xl font-black uppercase tracking-widest text-[10px] text-foreground hover:bg-primary hover:text-white hover:border-primary hover:shadow-premium transition-all"
                  >
                    Engage
                  </button>
                </motion.div>
              ))}

              {dueTopics.length === 0 && (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle2 className="w-10 h-10 text-emerald-500/30" />
                  </div>
                  <h3 className="text-2xl font-black text-foreground uppercase tracking-tight">Schedule Clear</h3>
                  <p className="text-muted-foreground max-w-xs mt-2 font-medium">Select another date or relax. You're completely up to date!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* High-Focus Study Session Modal */}
      <AnimatePresence>
        {activeSessionTopic && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveSessionTopic(null)}
              className="absolute inset-0 bg-background/90 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 50 }}
              className="relative w-full max-w-4xl bg-card rounded-[4rem] shadow-2xl border border-border overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-muted overflow-hidden">
                <motion.div 
                  className="h-full bg-primary shadow-[0_0_15px_rgba(139,92,246,0.6)]"
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 1500, ease: 'linear' }}
                />
              </div>

              <div className="p-16 flex flex-col items-center text-center">
                <button 
                  onClick={() => setActiveSessionTopic(null)}
                  className="absolute top-10 right-10 w-12 h-12 bg-muted/50 rounded-full flex items-center justify-center hover:bg-muted text-foreground transition-all"
                >
                  <X className="w-6 h-6" />
                </button>

                <div className="mb-12">
                   <div className="w-24 h-24 bg-primary/10 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-premium">
                      <Target className="w-12 h-12 text-primary" />
                   </div>
                   <p className="text-xs font-black uppercase tracking-[0.4em] text-primary mb-4 text-primary">Internal Focus Engine</p>
                   <h2 className="text-6xl font-black text-foreground tracking-tighter leading-none mb-6">{activeSessionTopic.name}</h2>
                   <div className="flex items-center justify-center gap-3">
                     <span className="bg-muted px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-muted-foreground">Repetition #{activeSessionTopic.repetitions}</span>
                     <span className="bg-muted px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-muted-foreground">SM-2 Optimized</span>
                   </div>
                </div>

                <div className="w-full max-w-2xl space-y-12">
                   <div className="space-y-4">
                      <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground">Self-Assessment Performance</h3>
                      <div className="flex justify-between items-center gap-4">
                        {[
                          { val: 1, color: 'hover:bg-rose-500', label: 'Forgotten' },
                          { val: 2, color: 'hover:bg-orange-500', label: 'Struggled' },
                          { val: 3, color: 'hover:bg-amber-500', label: 'Average' },
                          { val: 4, color: 'hover:bg-emerald-500', label: 'Good' },
                          { val: 5, color: 'hover:bg-primary', label: 'Perfect' }
                        ].map((r) => (
                           <button
                            key={r.val}
                            onClick={() => handleRateSession(r.val)}
                            className={`flex-1 h-20 rounded-3xl bg-muted text-2xl font-black text-muted-foreground transition-all group relative ${r.color} hover:text-white hover:shadow-lg hover:-translate-y-2`}
                           >
                             {r.val}
                             <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-[9px] font-black uppercase tracking-widest text-muted-foreground w-full">
                               {r.label}
                             </span>
                           </button>
                        ))}
                      </div>
                   </div>

                   <p className="text-muted-foreground font-medium italic text-sm pt-8">
                     "Assessment updates the Spaced Repetition interval for this topic."
                   </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Revision;
