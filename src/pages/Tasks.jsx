import React, { useState, useContext, useMemo } from 'react';
import { StudyContext } from '../context/StudyContext';
import { 
  Plus, 
  Search, 
  CheckCircle2, 
  Circle, 
  Clock, 
  MoreVertical,
  SearchX,
  Target,
  X,
  BookOpen,
  Trash2,
  Edit2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';

const Tasks = () => {
  const { subjects, topics, addTopic, deleteTopic, updateTopic, refreshData } = useContext(StudyContext);
  const [search, setSearch] = useState('');
  const [filterSubject, setFilterSubject] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTopic, setEditingTopic] = useState(null);
  const [newTopic, setNewTopic] = useState({ name: '', subject_id: '', difficulty: 'Medium' });
  const [activeMenu, setActiveMenu] = useState(null);

  const filteredTopics = useMemo(() => {
    return topics.filter(t => {
      const matchSearch = t.name.toLowerCase().includes(search.toLowerCase());
      const matchSubject = filterSubject === 'All' || t.subject_id === filterSubject;
      const matchStatus = filterStatus === 'All' || t.status === filterStatus;
      return matchSearch && matchSubject && matchStatus;
    });
  }, [topics, search, filterSubject, filterStatus]);

  const stats = useMemo(() => {
    return {
      total: topics.length,
      started: topics.filter(t => t.status !== 'Not Started').length,
      mastered: topics.filter(t => t.repetitions > 3).length,
    };
  }, [topics]);

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTopic.name || !newTopic.subject_id) return toast.error('Name and Subject are required');
    
    const { error } = await addTopic({
      ...newTopic,
      status: 'Not Started',
      easiness_factor: 2.5,
      interval: 0,
      repetitions: 0
    });

    if (!error) {
      toast.success('Task added to curriculum!');
      setNewTopic({ name: '', subject_id: '', difficulty: 'Medium' });
      setShowAddModal(false);
      refreshData();
    }
  };

  const handleEditTask = async (e) => {
    e.preventDefault();
    const { error } = await updateTopic(editingTopic.id, {
      name: editingTopic.name,
      difficulty: editingTopic.difficulty,
      subject_id: editingTopic.subject_id
    });

    if (!error) {
       toast.success('Topic updated');
       setShowEditModal(false);
       setEditingTopic(null);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to remove this topic? All study history for it will be lost.')) {
      await deleteTopic(id);
      setActiveMenu(null);
    }
  };

  const handleToggleStatus = async (topic) => {
    const newStatus = topic.status === 'Mastered' ? 'Not Started' : 'Mastered';
    const { error } = await updateTopic(topic.id, { 
      status: newStatus,
      repetitions: newStatus === 'Mastered' ? Math.max(topic.repetitions, 4) : topic.repetitions 
    });
    if (!error) {
      toast.success(`Task marked as ${newStatus}`);
    }
  };

  return (
    <div className="space-y-10 animate-fade-in">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl lg:text-5xl font-black tracking-tight text-foreground">Study Tasks</h1>
          <p className="text-muted-foreground mt-2 text-lg font-medium">Plan and execute your daily study focus.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-primary text-primary-foreground px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-2 shadow-premium hover:shadow-lg hover:-translate-y-0.5 transition-all"
        >
          <Plus className="w-5 h-5" /> New focus task
        </button>
      </header>

      {/* Stats Summary Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { label: 'Total Curated', value: stats.total, icon: BookOpen, color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'In Progress', value: stats.started, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10' },
          { label: 'High Retention', value: stats.mastered, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
        ].map((s, i) => (
          <div key={i} className="card-premium p-6 flex items-center gap-6">
            <div className={`w-12 h-12 ${s.bg} ${s.color} rounded-2xl flex items-center justify-center shadow-soft`}>
              <s.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{s.label}</p>
              <p className="text-3xl font-black text-foreground tracking-tighter mt-1">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Toolbar */}
      <div className="card-premium p-4 flex flex-col lg:flex-row items-center gap-4 bg-card">
        <div className="flex-1 relative w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            type="text"
            placeholder="Search topics..."
            className="w-full bg-muted/20 border border-border rounded-xl pl-11 pr-4 py-3 text-sm font-bold text-foreground outline-none focus:ring-2 focus:ring-primary focus:bg-card transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <select 
            className="flex-1 lg:flex-none bg-muted/20 border border-border rounded-xl px-4 py-3 text-sm font-bold text-foreground outline-none hover:bg-muted transition-all cursor-pointer"
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
          >
            <option value="All">All Subjects</option>
            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <select 
            className="flex-1 lg:flex-none bg-muted/20 border border-border rounded-xl px-4 py-3 text-sm font-bold text-foreground outline-none hover:bg-muted transition-all cursor-pointer"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="All">All Status</option>
            <option>Not Started</option>
            <option>Reviewed</option>
            <option>Mastered</option>
          </select>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-4">
        {filteredTopics.map((topic) => (
          <motion.div 
            layout
            key={topic.id}
            className="card-premium p-6 group flex items-center gap-6 hover:border-primary/30 relative"
          >
            <button 
              onClick={() => handleToggleStatus(topic)}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-soft hover:scale-110 active:scale-95
              ${topic.status === 'Mastered' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary border border-transparent'}
            `}>
              {topic.status === 'Mastered' ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
            </button>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <span className="text-[9px] font-black uppercase tracking-widest text-primary bg-primary/5 px-2 py-0.5 rounded border border-primary/10">
                  {subjects.find(s => s.id === topic.subject_id)?.name}
                </span>
                <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border
                  ${topic.difficulty === 'Hard' ? 'text-rose-500 bg-rose-500/5 border-rose-500/20' : 
                    topic.difficulty === 'Medium' ? 'text-amber-500 bg-amber-500/5 border-amber-500/20' : 
                    'text-emerald-500 bg-emerald-500/5 border-emerald-500/20'}
                `}>
                  {topic.difficulty}
                </span>
              </div>
              <h4 className="text-xl font-black text-foreground tracking-tight truncate">{topic.name}</h4>
            </div>
            <div className="hidden lg:flex items-center gap-8">
               <div className="text-right">
                  <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest leading-none">Next Review</p>
                  <p className="text-sm font-bold text-foreground uppercase mt-1">{new Date(topic.next_review).toLocaleDateString()}</p>
               </div>
               <div className="h-10 w-px bg-border/50" />
               <div className="text-center w-20">
                  <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest leading-none">Reps</p>
                  <p className="text-xl font-black text-primary tracking-tighter mt-1">{topic.repetitions}</p>
               </div>
            </div>
            <div className="relative">
              <button 
                onClick={() => setActiveMenu(activeMenu === topic.id ? null : topic.id)}
                className="p-2 text-muted-foreground/30 hover:text-foreground transition-all"
              >
                <MoreVertical className="w-5 h-5" />
              </button>

              <AnimatePresence>
                {activeMenu === topic.id && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setActiveMenu(null)} />
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-xl shadow-xl z-20 py-2 overflow-hidden"
                    >
                      <button 
                        onClick={() => { setEditingTopic(topic); setShowEditModal(true); setActiveMenu(null); }}
                        className="flex items-center gap-3 w-full px-4 py-3 text-sm font-bold text-foreground hover:bg-muted transition-colors"
                      >
                        <Edit2 className="w-4 h-4 text-primary" /> Edit Topic
                      </button>
                      <button 
                        onClick={() => handleDelete(topic.id)}
                        className="flex items-center gap-3 w-full px-4 py-3 text-sm font-bold text-rose-500 hover:bg-rose-500/5 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" /> Delete Topic
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        ))}

        {filteredTopics.length === 0 && (
          <div className="text-center py-32 opacity-20 card-premium bg-muted/10 border-dashed">
            <SearchX className="w-20 h-20 mx-auto mb-6" />
            <p className="text-2xl font-black uppercase tracking-tight text-foreground">No focus areas found.</p>
          </div>
        )}
      </div>

      {/* Add Task Modal */}
      <AnimatePresence>
        {(showAddModal || showEditModal) && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setShowAddModal(false); setShowEditModal(false); }}
              className="fixed inset-0 bg-background/80 backdrop-blur-md z-[150]"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 50 }}
              className="fixed inset-0 m-auto w-full max-w-xl h-fit bg-card p-10 rounded-[3rem] z-[160] border border-border shadow-2xl"
            >
              <div className="flex items-center justify-between mb-10">
                <h2 className="text-3xl font-black text-foreground flex items-center gap-4 tracking-tight uppercase italic underline decoration-primary decoration-4 underline-offset-8">
                  {showEditModal ? 'Update focus area' : 'Add focus task'}
                </h2>
                <button onClick={() => { setShowAddModal(false); setShowEditModal(false); }} className="p-2 hover:bg-muted rounded-full">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={showEditModal ? handleEditTask : handleAddTask} className="space-y-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-1">Task Name</label>
                  <input 
                    type="text"
                    required
                    placeholder="e.g., Deep Learning Architecture"
                    className="w-full bg-muted/20 border border-border rounded-2xl px-6 py-5 text-foreground font-bold outline-none focus:ring-2 focus:ring-primary shadow-soft transition-all"
                    value={showEditModal ? editingTopic?.name : newTopic.name}
                    onChange={(e) => showEditModal 
                      ? setEditingTopic({...editingTopic, name: e.target.value})
                      : setNewTopic({...newTopic, name: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-1">Related Subject</label>
                  <select 
                    required
                    className="w-full bg-muted/20 border border-border rounded-2xl px-6 py-5 text-foreground font-bold outline-none focus:ring-2 focus:ring-primary shadow-soft transition-all cursor-pointer"
                    value={showEditModal ? editingTopic?.subject_id : newTopic.subject_id}
                    onChange={(e) => showEditModal
                      ? setEditingTopic({...editingTopic, subject_id: e.target.value})
                      : setNewTopic({...newTopic, subject_id: e.target.value})}
                  >
                    <option value="">Select a subject...</option>
                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground px-1">Initial Difficulty</label>
                  <div className="grid grid-cols-3 gap-4">
                    {['Easy', 'Medium', 'Hard'].map(d => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => showEditModal
                          ? setEditingTopic({...editingTopic, difficulty: d})
                          : setNewTopic({...newTopic, difficulty: d})}
                        className={`py-4 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all border shadow-sm
                          ${(showEditModal ? editingTopic?.difficulty : newTopic.difficulty) === d 
                            ? 'bg-primary text-primary-foreground border-primary' 
                            : 'bg-muted text-muted-foreground border-border hover:bg-muted/50'}
                        `}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4 pt-6">
                   <button 
                    type="submit"
                    className="flex-1 px-8 py-5 rounded-2xl font-black uppercase tracking-widest text-xs bg-primary text-primary-foreground shadow-premium hover:shadow-lg hover:-translate-y-1 transition-all"
                   >
                    {showEditModal ? 'Update curriculum' : 'Commit to curriculum'}
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

export default Tasks;
