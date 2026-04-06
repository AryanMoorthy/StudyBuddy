import React, { useState } from 'react';
import { useProgress } from '../hooks/useProgress';
import { useTasks } from '../hooks/useTasks';
import { useSubjects } from '../hooks/useSubjects';
import ProgressChart from '../components/ProgressChart';
import RevisionList from '../components/RevisionList';
import { MdAssignment, MdCheckCircle, MdPendingActions, MdRotateRight, MdEventNote, MdClose, MdTopic, MdAccessTime, MdFilterList } from 'react-icons/md';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { toast } from 'react-toastify';

const Dashboard = () => {
  const { totalTasks, completedTasks, pendingTasks, revisionTasks, overallCompletion, subjectProgress } = useProgress();
  const { tasks, updateTask, deleteTask, getCategorizedTasks, addTask } = useTasks();
  const { revision: upcomingRevisions } = getCategorizedTasks();
  const { subjects, topics } = useSubjects();

  const [showModal, setShowModal] = useState(false);
  const [editingRevision, setEditingRevision] = useState(null);
  const [newRevision, setNewRevision] = useState({ title: '', subject: '', topic: '', deadline: '', priority: 'Medium' });

  const handleEditRevision = (revision) => {
    setEditingRevision(revision);
    setNewRevision({
      title: revision.title,
      subject: revision.subject,
      topic: revision.topic,
      deadline: revision.deadline,
      priority: revision.priority
    });
    setShowModal(true);
  };

  const handleUpdateRevision = (e) => {
    e.preventDefault();
    updateTask(editingRevision.id, newRevision);
    toast.success('Revision updated!');
    handleCloseModal();
  };

  const handleDeleteRevision = (id) => {
    if (window.confirm('Delete this revision?')) {
      deleteTask(id);
      toast.success('Revision deleted');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingRevision(null);
    setNewRevision({ title: '', subject: '', topic: '', deadline: '', priority: 'Medium' });
  };

  const statCards = [
    { label: 'Total Tasks', value: totalTasks, icon: <MdAssignment />, color: '#6366f1' },
    { label: 'Completed', value: completedTasks, icon: <MdCheckCircle />, color: '#10b981' },
    { label: 'Pending', value: pendingTasks, icon: <MdPendingActions />, color: '#f59e0b' },
    { label: 'To Revise', value: revisionTasks, icon: <MdRotateRight />, color: '#ec4899' },
  ];

  return (
    <div className="dashboard-page">
      <header className="page-header">
        <h1>Welcome back, Scholar!</h1>
        <p>Here's your study progress for today.</p>
      </header>

      <div className="stats-grid">
        {statCards.map((stat, i) => (
          <div key={i} className="card stat-card">
            <div className="stat-icon" style={{ background: `${stat.color}20`, color: stat.color }}>
              {stat.icon}
            </div>
            <div className="stat-info">
              <span className="stat-label">{stat.label}</span>
              <h2 className="stat-value">{stat.value}</h2>
            </div>
          </div>
        ))}
      </div>

      <div className="content-grid">
        <div className="card chart-section">
          <div className="section-header">
            <h3>Subject Progress</h3>
            <span className="completion-badge">{Math.round(overallCompletion)}% Overall</span>
          </div>
          <ProgressChart data={subjectProgress} />
        </div>

        <div className="card revision-section">
          <div className="section-header">
            <h3>Upcoming Revisions</h3>
          </div>
          <RevisionList 
            revisions={upcomingRevisions.slice(0, 5)} 
            onAction={(task) => updateTask(task.id, { status: task.status === 'Completed' ? 'Revision' : 'Completed' })}
            onEdit={handleEditRevision}
            onDelete={handleDeleteRevision}
          />
        </div>
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
                <MdEventNote className="header-icon" />
                <h2>Edit Revision</h2>
              </div>
              <button className="close-btn" onClick={handleCloseModal}><MdClose /></button>
            </div>

            <form onSubmit={handleUpdateRevision} className="premium-form">
              <div className="form-section">
                <label><MdAssignment /> Revision Topic/Goal</label>
                <input 
                  type="text" 
                  value={newRevision.title} 
                  onChange={(e) => setNewRevision({...newRevision, title: e.target.value})} 
                />
              </div>

              <div className="form-row">
                <div className="form-section">
                  <label><MdFilterList /> Subject</label>
                  <select value={newRevision.subject} onChange={(e) => setNewRevision({...newRevision, subject: e.target.value, topic: ''})}>
                    <option value="">Select Subject</option>
                    {subjects?.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                  </select>
                </div>
                <div className="form-section">
                  <label><MdTopic /> Topic</label>
                  <select value={newRevision.topic} onChange={(e) => setNewRevision({...newRevision, topic: e.target.value})}>
                    <option value="">Select Topic</option>
                    {topics?.filter(t => t.subjectId === subjects?.find(s => s.name === newRevision.subject)?.id).map(t => (
                      <option key={t.id} value={t.name}>{t.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-section">
                  <label><MdAccessTime /> Revision Date</label>
                  <input type="date" value={newRevision.deadline} onChange={(e) => setNewRevision({...newRevision, deadline: e.target.value})} />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={handleCloseModal}>Discard</button>
                <button type="submit" className="btn btn-primary btn-glow">Update</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      <style jsx>{`
        /* Reusing Modal Styles for consistency */
        .modal-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.8); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 10000; }
        .premium-modal { width: 90%; max-width: 650px; padding: 0; background: linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.95)); border: 1px solid rgba(255, 255, 255, 0.1); }
        .modal-header { padding: 1.5rem 2rem; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; }
        .header-title { display: flex; align-items: center; gap: 0.75rem; }
        .header-icon { color: var(--primary); font-size: 1.5rem; }
        .close-btn { background: transparent; border: none; color: var(--text-muted); cursor: pointer; font-size: 1.5rem; }
        .premium-form { padding: 2rem; display: flex; flex-direction: column; gap: 1.5rem; }
        .form-section { display: flex; flex-direction: column; gap: 0.5rem; flex: 1; }
        .form-section label { font-size: 0.85rem; font-weight: 600; color: var(--text-muted); display: flex; align-items: center; gap: 0.5rem; }
        .form-section input, .form-section select { background: rgba(15, 23, 42, 0.5); border: 1px solid var(--border); border-radius: 10px; padding: 0.85rem; color: white; outline: none; }
        .form-row { display: flex; gap: 1.5rem; }
        .modal-footer { margin-top: 1rem; display: flex; justify-content: flex-end; gap: 1rem; }

        .dashboard-page { display: flex; flex-direction: column; gap: 2rem; }
        .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5rem; }
        .stat-card { display: flex; align-items: center; gap: 1rem; padding: 1.25rem; }
        .stat-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; }
        .stat-label { font-size: 0.85rem; color: var(--text-muted); }
        .stat-value { font-size: 1.5rem; font-weight: 700; margin: 0; }
        
        .content-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 1.5rem; }
        .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
        .completion-badge { background: var(--primary); color: white; padding: 4px 12px; border-radius: 20px; font-size: 0.8rem; font-weight: 600; }
        
        @media (max-width: 1024px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
          .content-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 640px) {
          .stats-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
