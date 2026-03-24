import React, { useState } from 'react';
import { useTasks } from '../hooks/useTasks';
import { useSubjects } from '../hooks/useSubjects';
import TaskCard from '../components/TaskCard';
import SearchBar from '../components/SearchBar';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { MdAdd, MdFilterList, MdAssignment, MdTopic, MdAccessTime, MdPriorityHigh, MdClose } from 'react-icons/md';

const Tasks = () => {
  const { tasks, addTask, updateTask, deleteTask, getCategorizedTasks } = useTasks();
  const { subjects, topics } = useSubjects();
  const [activeTab, setActiveTab] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ subject: 'All', priority: 'All' });
  const [newTask, setNewTask] = useState({ title: '', subject: '', topic: '', deadline: '', priority: 'Medium', isRevision: false });
  const [editingTask, setEditingTask] = useState(null);

  const categorized = getCategorizedTasks();
  const currentTasks = categorized[activeTab].filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(search.toLowerCase());
    const matchesSubject = filters.subject === 'All' || task.subject === filters.subject;
    const matchesPriority = filters.priority === 'All' || task.priority === filters.priority;
    return matchesSearch && matchesSubject && matchesPriority;
  });

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTask.title || !newTask.subject || !newTask.topic || !newTask.deadline) {
      return toast.error('Please fill all required fields');
    }
    
    if (editingTask) {
      updateTask(editingTask.id, newTask);
      toast.success('Task updated successfully!');
    } else {
      addTask(newTask);
      toast.success('Task added successfully!');
    }
    
    setEditingTask(null);
    setNewTask({ title: '', subject: '', topic: '', deadline: '', priority: 'Medium', isRevision: false });
    setShowModal(false);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setNewTask({
      title: task.title,
      subject: task.subject,
      topic: task.topic,
      deadline: task.deadline,
      priority: task.priority,
      isRevision: task.isRevision || task.status === 'Revision'
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTask(null);
    setNewTask({ title: '', subject: '', topic: '', deadline: '', priority: 'Medium', isRevision: false });
  };

  return (
    <div className="tasks-page">
      <header className="page-header">
        <h1>Study Tasks</h1>
        <button className="btn btn-primary" onClick={() => { setEditingTask(null); setShowModal(true); }}>
          <MdAdd /> New Task
        </button>
      </header>

      <div className="tasks-controls card">
        <SearchBar value={search} onChange={setSearch} placeholder="Search tasks..." />
        <div className="filters">
          <select value={filters.subject} onChange={(e) => setFilters({...filters, subject: e.target.value})}>
            <option>All Subjects</option>
            {subjects.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
          </select>
          <select value={filters.priority} onChange={(e) => setFilters({...filters, priority: e.target.value})}>
            <option>All Priorities</option>
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>
        </div>
      </div>

      <div className="tabs">
        {['all', 'pending', 'completed', 'overdue', 'revision'].map(tab => (
          <button 
            key={tab} 
            className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
            <span className="count">{categorized[tab].length}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-3">
        {currentTasks.length > 0 ? (
          currentTasks.map(task => (
            <TaskCard 
              key={task.id} 
              task={task} 
              onStatusToggle={() => updateTask(task.id, { status: task.status === 'Completed' ? 'Pending' : 'Completed' })}
              onEdit={handleEditTask}
              onDelete={() => {
                if(window.confirm('Are you sure you want to delete this task?')) {
                  deleteTask(task.id);
                  toast.success('Task deleted');
                }
              }}
            />
          ))
        ) : (
          <div className="empty-state">No tasks found</div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="modal card premium-modal"
          >
            <div className="modal-header">
              <div className="header-title">
                <MdAdd className="header-icon" />
                <h2>{editingTask ? 'Edit Task' : 'Create New Task'}</h2>
              </div>
              <button className="close-btn" onClick={handleCloseModal}><MdClose /></button>
            </div>

            <form onSubmit={handleAddTask} className="premium-form">
              <div className="form-section">
                <label><MdAssignment /> Task Title</label>
                <input 
                  type="text" 
                  placeholder="e.g., Solve 10 Dynamic Programming problems"
                  value={newTask.title} 
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})} 
                />
              </div>

              <div className="form-row">
                <div className="form-section">
                  <label><MdFilterList /> Subject</label>
                  <select value={newTask.subject} onChange={(e) => setNewTask({...newTask, subject: e.target.value, topic: ''})}>
                    <option value="">Select Subject</option>
                    {subjects.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                  </select>
                </div>
                <div className="form-section">
                  <label><MdTopic /> Topic</label>
                  <select value={newTask.topic} onChange={(e) => setNewTask({...newTask, topic: e.target.value})}>
                    <option value="">Select Topic</option>
                    {topics.filter(t => t.subjectId === subjects.find(s => s.name === newTask.subject)?.id).map(t => (
                      <option key={t.id} value={t.name}>{t.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-section">
                  <label><MdAccessTime /> Deadline</label>
                  <input type="date" value={newTask.deadline} onChange={(e) => setNewTask({...newTask, deadline: e.target.value})} />
                </div>
                <div className="form-section">
                  <label><MdPriorityHigh /> Priority</label>
                  <div className="priority-selector">
                    {['Low', 'Medium', 'High'].map(p => (
                      <button 
                        key={p}
                        type="button"
                        className={`p-btn ${newTask.priority === p ? 'active' : ''} ${p.toLowerCase()}`}
                        onClick={() => setNewTask({...newTask, priority: p})}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-section">
                  <label className="checkbox-label">
                    <input 
                      type="checkbox" 
                      checked={newTask.isRevision} 
                      onChange={(e) => setNewTask({...newTask, isRevision: e.target.checked, status: e.target.checked ? 'Revision' : 'Pending'})} 
                    />
                    <span>Mark as Revision Task</span>
                  </label>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={handleCloseModal}>Discard</button>
                <button type="submit" className="btn btn-primary btn-glow">{editingTask ? 'Update Task' : 'Create Task'}</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      <style jsx>{`
        .tasks-page { display: flex; flex-direction: column; gap: 2rem; }
        .page-header { display: flex; justify-content: space-between; align-items: center; }
        .tasks-controls { display: flex; justify-content: space-between; align-items: center; gap: 1rem; padding: 1rem; }
        .filters { display: flex; gap: 1rem; }
        @media (max-width: 768px) {
          .tasks-controls { flex-direction: column; align-items: stretch; }
          .filters { flex-direction: column; }
        }
        .filters select { background: var(--bg-dark); color: white; border: 1px solid var(--border); padding: 0.5rem; border-radius: 8px; }
        .tabs { display: flex; gap: 0.5rem; overflow-x: auto; padding-bottom: 0.5rem; }
        .tab-btn {
          background: var(--glass);
          border: 1px solid var(--border);
          color: var(--text-muted);
          padding: 0.5rem 1.25rem;
          border-radius: 20px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          white-space: nowrap;
          transition: var(--transition);
        }
        .tab-btn.active { background: var(--primary); color: white; border-color: var(--primary); }
        .count { background: rgba(0,0,0,0.2); padding: 2px 8px; border-radius: 10px; font-size: 0.75rem; }
        .empty-state { grid-column: 1 / -1; text-align: center; padding: 4rem; color: var(--text-muted); }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          cursor: pointer;
          color: var(--text-main);
          font-weight: 500;
        }
        .checkbox-label input {
          width: 18px;
          height: 18px;
          cursor: pointer;
          accent-color: var(--primary);
        }
        
        /* Premium Modal Styles */
        .modal-overlay { 
          position: fixed; 
          inset: 0; 
          background: rgba(15, 23, 42, 0.8); 
          backdrop-filter: blur(8px);
          display: flex; 
          align-items: center; 
          justify-content: center; 
          z-index: 1000; 
        }
        .premium-modal { 
          width: 90%;
          max-width: 650px; 
          padding: 0;
          overflow: hidden;
          background: linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.95));
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
        }
        .modal-header {
          padding: 1.5rem 2rem;
          background: rgba(255, 255, 255, 0.03);
          border-bottom: 1px solid var(--border);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .header-title { display: flex; align-items: center; gap: 0.75rem; }
        .header-icon { color: var(--primary); font-size: 1.5rem; }
        .close-btn { background: transparent; border: none; color: var(--text-muted); cursor: pointer; font-size: 1.5rem; transition: var(--transition); }
        .close-btn:hover { color: white; transform: rotate(90deg); }

        .premium-form { padding: 2rem; display: flex; flex-direction: column; gap: 1.5rem; }
        .form-section { display: flex; flex-direction: column; gap: 0.5rem; flex: 1; }
        .form-section label { font-size: 0.85rem; font-weight: 600; color: var(--text-muted); display: flex; align-items: center; gap: 0.5rem; }
        .form-section input, .form-section select {
          background: rgba(15, 23, 42, 0.5);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 0.85rem;
          color: white;
          outline: none;
          transition: var(--transition);
        }
        .form-section input:focus, .form-section select:focus { border-color: var(--primary); box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2); }
        
        .form-row { display: flex; gap: 1.5rem; }
        
        .priority-selector { display: flex; gap: 0.5rem; background: rgba(15, 23, 42, 0.5); padding: 0.25rem; border-radius: 10px; border: 1px solid var(--border); }
        .p-btn { flex: 1; padding: 0.6rem; border-radius: 8px; border: none; background: transparent; color: var(--text-muted); cursor: pointer; font-weight: 600; font-size: 0.85rem; transition: var(--transition); }
        .p-btn:hover { background: rgba(255, 255, 255, 0.05); }
        .p-btn.active.low { background: rgba(16, 185, 129, 0.2); color: #10b981; }
        .p-btn.active.medium { background: rgba(245, 158, 11, 0.2); color: #f59e0b; }
        .p-btn.active.high { background: rgba(239, 68, 68, 0.2); color: #ef4444; }

        .modal-footer { margin-top: 1rem; display: flex; justify-content: flex-end; gap: 1rem; }
        .btn-glow:hover { box-shadow: 0 0 15px rgba(99, 102, 241, 0.5); }

        @media (max-width: 640px) {
          .form-row { flex-direction: column; }
        }
      `}</style>

    </div>
  );
};

export default Tasks;
