import React, { useState, useContext } from 'react';
import { StudyContext } from '../context/StudyContext';
import { 
  Plus, 
  BookOpen, 
  Trash2, 
  Target, 
  BarChart2,
  X,
  Palette,
  AlignLeft,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';

const Subjects = () => {
  const { subjects, addSubject, topics, addTopic, deleteSubject, deleteTopic, refreshData } = useContext(StudyContext);
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [newSubject, setNewSubject] = useState({ name: '', description: '', color: '#8b5cf6' });
  const [newTopic, setNewTopic] = useState({ name: '', difficulty: 'Medium', notes: '' });

  const handleAddSubject = async (e) => {
    e.preventDefault();
    if (!newSubject.name) return toast.error('Subject name is required');
    const { error } = await addSubject(newSubject);
    if (!error) {
      toast.success('Subject added successfully!');
      setNewSubject({ name: '', description: '', color: '#8b5cf6' });
      setShowSubjectModal(false);
    } else {
      toast.error(error.message || 'Failed to add subject');
    }
  };

  const handleAddTopic = async (e) => {
    e.preventDefault();
    if (!newTopic.name) return toast.error('Topic name is required');
    const { error } = await addTopic({ 
      name: newTopic.name, 
      difficulty: newTopic.difficulty, 
      subject_id: selectedSubject.id,
      status: 'Not Started',
      easiness_factor: 2.5,
      interval: 0,
      repetitions: 0
    });
    if (!error) {
      toast.success('Topic added!');
      setNewTopic({ name: '', difficulty: 'Medium', notes: '' });
      refreshData();
    } else {
      toast.error(error.message || 'Failed to add topic');
    }
  };

  const handleDeleteTopic = async (e, topicId) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this topic? All progress will be lost.')) {
      const { error } = await deleteTopic(topicId);
      if (!error) {
        refreshData();
      }
    }
  };

  return (
    <div className="space-y-10 animate-fade-in">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl lg:text-5xl font-black tracking-tight text-foreground">Curriculum</h1>
          <p className="text-muted-foreground mt-2 text-lg font-medium">Manage your areas of study and specific topics.</p>
        </div>
        <button 
          onClick={() => setShowSubjectModal(true)}
          className="bg-primary text-primary-foreground px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-2 shadow-premium hover:shadow-lg hover:-translate-y-0.5 transition-all"
        >
          <Plus className="w-5 h-5" /> Add Subject
        </button>
      </header>

      {/* Subjects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {subjects.map((subject) => {
          const subjectTopics = topics.filter(t => t.subject_id === subject.id);
          const completion = subjectTopics.length 
            ? Math.round((subjectTopics.filter(t => t.repetitions > 3).length / subjectTopics.length) * 100) 
            : 0;

          return (
            <motion.div
              layoutId={subject.id}
              key={subject.id}
              onClick={() => setSelectedSubject(subject)}
              className="card-premium p-8 cursor-pointer group relative overflow-hidden flex flex-col h-full"
            >
              <div 
                className="absolute top-0 right-0 w-32 h-32 blur-[60px] opacity-[0.08] transition-opacity group-hover:opacity-[0.15]"
                style={{ backgroundColor: subject.color }}
              />
              
              <div className="flex items-start justify-between mb-8">
                <div 
                  className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-soft transition-transform group-hover:scale-110"
                  style={{ backgroundColor: `${subject.color}15`, color: subject.color }}
                >
                  <BookOpen className="w-7 h-7" />
                </div>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full border border-border">
                  <Target className="w-3.5 h-3.5" /> {subjectTopics.length} Topics
                </div>
              </div>

              <h3 className="text-2xl font-black text-foreground mb-3 group-hover:text-primary transition-colors capitalize tracking-tight">{subject.name}</h3>
              <p className="text-muted-foreground text-sm font-medium line-clamp-2 mb-8 h-10">{subject.description || 'No description provided.'}</p>

              <div className="mt-auto space-y-4">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                  <span className="text-muted-foreground">Mastery</span>
                  <span className={completion === 100 ? 'text-emerald-500' : 'text-primary'}>{completion}%</span>
                </div>
                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${completion}%` }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: subject.color }}
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
        {subjects.length === 0 && (
          <div className="col-span-full py-32 text-center card-premium border-dashed bg-muted/20">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen className="w-10 h-10 text-muted-foreground/30" />
            </div>
            <h3 className="text-xl font-black text-foreground uppercase tracking-tight">Empty Curriculum</h3>
            <p className="text-muted-foreground max-w-sm mx-auto mt-2 font-medium">Start building your knowledge by adding your first subject.</p>
          </div>
        )}
      </div>

      {/* Selected Subject Detail Modal */}
      <AnimatePresence>
        {selectedSubject && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedSubject(null)}
              className="fixed inset-0 bg-background/80 backdrop-blur-md z-[100]"
            />
            <motion.div 
              layoutId={selectedSubject.id}
              className="fixed inset-x-4 inset-y-6 lg:inset-x-20 lg:inset-y-12 bg-card z-[110] rounded-[3rem] shadow-2xl overflow-hidden flex flex-col border border-border"
            >
              <div className="flex flex-col lg:flex-row h-full">
                {/* Left Sidebar in Modal */}
                <div className="lg:w-1/3 p-12 border-r border-border flex flex-col bg-muted/10">
                  <button 
                    onClick={() => setSelectedSubject(null)}
                    className="w-12 h-12 bg-card border border-border rounded-full flex items-center justify-center mb-10 hover:bg-muted transition-colors shadow-soft"
                  >
                    <X className="w-6 h-6 text-foreground" />
                  </button>

                  <div 
                    className="w-20 h-20 rounded-3xl flex items-center justify-center mb-8 shadow-premium"
                    style={{ backgroundColor: selectedSubject.color }}
                  >
                    <BookOpen className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-5xl font-black text-foreground mb-6 capitalize tracking-tighter leading-none">{selectedSubject.name}</h2>
                  <p className="text-muted-foreground text-lg mb-12 leading-relaxed font-medium">{selectedSubject.description}</p>

                  <div className="mt-auto space-y-6">
                    <div className="p-8 bg-card rounded-[2rem] border border-border shadow-soft">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-6 flex items-center gap-2">
                        <BarChart2 className="w-4 h-4 text-primary" /> Metrics
                      </p>
                      <div className="grid grid-cols-2 gap-8">
                        <div>
                          <p className="text-4xl font-black text-foreground tracking-tighter">{topics.filter(t => t.subject_id === selectedSubject.id).length}</p>
                          <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mt-1">Total Topics</p>
                        </div>
                        <div>
                          <p className="text-4xl font-black text-emerald-500 tracking-tighter">{topics.filter(t => t.subject_id === selectedSubject.id && t.repetitions > 3).length}</p>
                          <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mt-1">Mastered</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Content in Modal */}
                <div className="flex-1 p-12 overflow-y-auto flex flex-col">
                   <div className="flex items-center justify-between mb-10">
                     <h3 className="text-3xl font-black text-foreground uppercase tracking-tight">Curriculum Breakdown</h3>
                   </div>

                   {/* Add Topic Form */}
                   <form onSubmit={handleAddTopic} className="flex flex-wrap gap-4 p-8 bg-muted/20 rounded-[2.5rem] border border-border mb-12">
                      <div className="flex-1 min-w-[280px]">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-3 px-1">New Topic Name</label>
                        <input 
                          type="text"
                          placeholder="e.g., Quantum Mechanics Principles"
                          className="w-full bg-card border border-border outline-none rounded-2xl px-6 py-4 text-foreground font-bold shadow-soft focus:ring-2 focus:ring-primary transition-all"
                          value={newTopic.name}
                          onChange={(e) => setNewTopic({...newTopic, name: e.target.value})}
                        />
                      </div>
                      <div className="w-full md:w-auto">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-3 px-1">Initial Strategy</label>
                        <select 
                          className="w-full bg-card border border-border outline-none rounded-2xl px-6 py-4 text-foreground font-bold shadow-soft focus:ring-2 focus:ring-primary transition-all"
                          value={newTopic.difficulty}
                          onChange={(e) => setNewTopic({...newTopic, difficulty: e.target.value})}
                        >
                          <option>Easy</option>
                          <option>Medium</option>
                          <option>Hard</option>
                        </select>
                      </div>
                      <div className="w-full flex items-end">
                        <button className="w-full bg-primary text-primary-foreground px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-premium hover:shadow-lg active:scale-[0.98] flex items-center justify-center gap-3">
                          <Plus className="w-5 h-5" /> Add Topic
                        </button>
                      </div>
                   </form>

                   {/* Topics List */}
                   <div className="space-y-4">
                      {topics.filter(t => t.subject_id === selectedSubject.id).map((topic, i) => (
                        <div key={topic.id} className="flex items-center gap-8 p-6 rounded-[2rem] bg-card hover:bg-muted/10 transition-all group border border-border shadow-soft">
                           <div className="w-12 h-12 rounded-2xl bg-muted/50 flex items-center justify-center text-xs font-black text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                              {i + 1}
                           </div>
                           <div className="flex-1 min-w-0">
                              <h4 className="text-xl font-black text-foreground tracking-tight truncate">{topic.name}</h4>
                              <div className="flex items-center gap-6 mt-2">
                                <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg ${
                                  topic.difficulty === 'Hard' ? 'text-rose-500 bg-rose-500/10' :
                                  topic.difficulty === 'Medium' ? 'text-amber-500 bg-amber-500/10' :
                                  'text-emerald-500 bg-emerald-500/10'
                                }`}>
                                  {topic.difficulty}
                                </span>
                                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 bg-muted px-2 py-1 rounded-md">
                                  {topic.status}
                                </span>
                              </div>
                           </div>
                           <div className="flex items-center gap-6">
                              {topic.last_reviewed && (
                                <div className="text-right hidden sm:block">
                                  <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Last Review</p>
                                  <p className="text-sm text-foreground font-bold">{new Date(topic.last_reviewed).toLocaleDateString()}</p>
                                </div>
                              )}
                              <button 
                                onClick={(e) => handleDeleteTopic(e, topic.id)}
                                className="w-10 h-10 flex items-center justify-center text-muted-foreground/30 hover:text-rose-500 hover:bg-rose-500/5 rounded-xl transition-all"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                           </div>
                        </div>
                      ))}
                      {topics.filter(t => t.subject_id === selectedSubject.id).length === 0 && (
                        <div className="text-center py-24 opacity-20">
                          <BookOpen className="w-20 h-20 mx-auto mb-6" />
                          <p className="text-2xl font-black uppercase tracking-tight">No topics drafted.</p>
                        </div>
                      )}
                   </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Add Subject Modal */}
      <AnimatePresence>
        {showSubjectModal && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSubjectModal(false)}
              className="fixed inset-0 bg-background/80 backdrop-blur-md z-[150]"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 50 }}
              className="fixed inset-0 m-auto w-full max-w-xl h-fit bg-card p-10 rounded-[3rem] z-[160] border border-border shadow-2xl"
            >
              <div className="flex items-center justify-between mb-10">
                <h2 className="text-3xl font-black text-foreground flex items-center gap-4 tracking-tight">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                    <BookOpen className="text-primary w-6 h-6" />
                  </div> 
                  New Subject
                </h2>
                <button onClick={() => setShowSubjectModal(false)} className="w-10 h-10 border border-border rounded-full flex items-center justify-center hover:bg-muted transition-colors">
                  <X className="w-5 h-5 text-foreground" />
                </button>
              </div>

              <form onSubmit={handleAddSubject} className="space-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2 px-1">
                    <AlignLeft className="w-3.5 h-3.5" /> Subject Title
                  </label>
                  <input 
                    type="text"
                    required
                    placeholder="e.g., Computer Science"
                    className="w-full bg-muted/20 border border-border rounded-2xl px-6 py-5 text-foreground font-bold outline-none focus:ring-2 focus:ring-primary shadow-soft transition-all"
                    value={newSubject.name}
                    onChange={(e) => setNewSubject({...newSubject, name: e.target.value})}
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2 px-1">
                    <Info className="w-3.5 h-3.5" /> Short Description
                  </label>
                  <textarea 
                    rows={3}
                    placeholder="What will you learn in this subject?"
                    className="w-full bg-muted/20 border border-border rounded-2xl px-6 py-5 text-foreground font-bold outline-none focus:ring-2 focus:ring-primary shadow-soft transition-all resize-none"
                    value={newSubject.description}
                    onChange={(e) => setNewSubject({...newSubject, description: e.target.value})}
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2 px-1">
                    <Palette className="w-3.5 h-3.5" /> Theme Color
                  </label>
                  <div className="flex flex-wrap gap-4">
                    {['#8b5cf6', '#f43f5e', '#10b981', '#f59e0b', '#06b6d4', '#ec4899', '#3b82f6'].map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setNewSubject({...newSubject, color: c})}
                        className={`w-12 h-12 rounded-xl transition-all relative ${newSubject.color === c ? 'ring-4 ring-primary shadow-lg ring-offset-4 ring-offset-card scale-110' : 'hover:scale-110 opacity-60 hover:opacity-100'}`}
                        style={{ backgroundColor: c }}
                      >
                        {newSubject.color === c && <div className="absolute inset-0 flex items-center justify-center text-white"><X className="w-5 h-5 opacity-50" /></div>}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4 pt-6">
                   <button 
                    type="submit"
                    className="w-full px-8 py-5 rounded-2xl font-black uppercase tracking-widest text-xs bg-primary text-primary-foreground shadow-premium hover:shadow-lg transition-all"
                   >
                    Create Subject
                   </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Subjects;
