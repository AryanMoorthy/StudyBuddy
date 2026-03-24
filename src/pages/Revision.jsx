import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { useTasks } from '../hooks/useTasks';
import RevisionList from '../components/RevisionList';
import { format, isSameDay } from 'date-fns';
import { MdEventNote, MdAdd, MdClose, MdTopic, MdAccessTime, MdFilterList, MdAssignment } from 'react-icons/md';
import { useSubjects } from '../hooks/useSubjects';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';

const Revision = () => {
  const { tasks, updateTask, addTask } = useTasks();
  const { subjects, topics } = useSubjects();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [newRevision, setNewRevision] = useState({ title: '', subject: '', topic: '', deadline: format(new Date(), 'yyyy-MM-dd'), priority: 'Medium' });

  const revisionTasks = tasks.filter(t => t.status === 'Revision' || t.isRevision);
  const tasksOnSelectedDate = revisionTasks.filter(t => isSameDay(new Date(t.deadline), selectedDate));

  const handleAddRevision = (e) => {
    e.preventDefault();
    if (!newRevision.title || !newRevision.subject || !newRevision.topic || !newRevision.deadline) {
      return toast.error('Please fill all required fields');
    }
    addTask({ ...newRevision, status: 'Revision', isRevision: true });
    setShowModal(false);
    setNewRevision({ title: '', subject: '', topic: '', deadline: format(new Date(), 'yyyy-MM-dd'), priority: 'Medium' });
    toast.success('Revision scheduled!');
  };

  const tileClassName = ({ date, view }) => {
    if (view === 'month') {
      const dayRevisions = revisionTasks.filter(t => isSameDay(new Date(t.deadline), date));
      if (dayRevisions.length > 0) {
        const allDone = dayRevisions.every(t => t.status === 'Completed');
        return allDone ? 'revisions-done' : 'has-revision';
      }
    }
    return null;
  };

  return (
    <div className="revision-page">
      <header className="page-header">
        <div>
          <h1>Revision Planner</h1>
          <p>Spaced repetition for better retention</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <MdAdd /> New Revision
        </button>
      </header>

      <div className="planner-container">
        <div className="calendar-card card">
          <Calendar 
            onChange={setSelectedDate} 
            value={selectedDate}
            tileClassName={tileClassName}
          />
        </div>

        <div className="revision-details card">
          <div className="details-header">
            <MdEventNote />
            <h3>Revisions for {format(selectedDate, 'MMMM dd, yyyy')}</h3>
          </div>
          
          <RevisionList 
            revisions={tasksOnSelectedDate}
            onAction={(task) => updateTask(task.id, { status: task.status === 'Completed' ? 'Revision' : 'Completed' })}
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
                <h2>Schedule Revision</h2>
              </div>
              <button className="close-btn" onClick={() => setShowModal(false)}><MdClose /></button>
            </div>

            <form onSubmit={handleAddRevision} className="premium-form">
              <div className="form-section">
                <label><MdAssignment /> Revision Topic/Goal</label>
                <input 
                  type="text" 
                  placeholder="e.g., Active recall on Time Complexity"
                  value={newRevision.title} 
                  onChange={(e) => setNewRevision({...newRevision, title: e.target.value})} 
                />
              </div>

              <div className="form-row">
                <div className="form-section">
                  <label><MdFilterList /> Subject</label>
                  <select value={newRevision.subject} onChange={(e) => setNewRevision({...newRevision, subject: e.target.value, topic: ''})}>
                    <option value="">Select Subject</option>
                    {subjects.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                  </select>
                </div>
                <div className="form-section">
                  <label><MdTopic /> Topic</label>
                  <select value={newRevision.topic} onChange={(e) => setNewRevision({...newRevision, topic: e.target.value})}>
                    <option value="">Select Topic</option>
                    {topics.filter(t => t.subjectId === subjects.find(s => s.name === newRevision.subject)?.id).map(t => (
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
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Discard</button>
                <button type="submit" className="btn btn-primary btn-glow">Schedule</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      <style jsx>{`
        .revision-page { display: flex; flex-direction: column; gap: 2rem; }
        .page-header { display: flex; justify-content: space-between; align-items: center; }
        .planner-container { display: grid; grid-template-columns: 1.2fr 1fr; gap: 2rem; align-items: start; }
        
        /* Modal Styles (Reused from Tasks for consistency) */
        .modal-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.8); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 1000; }
        .premium-modal { width: 90%; max-width: 650px; padding: 0; background: linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.95)); border: 1px solid rgba(255, 255, 255, 0.1); box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); }
        .modal-header { padding: 1.5rem 2rem; background: rgba(255, 255, 255, 0.03); border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; }
        .header-title { display: flex; align-items: center; gap: 0.75rem; }
        .header-icon { color: var(--primary); font-size: 1.5rem; }
        .close-btn { background: transparent; border: none; color: var(--text-muted); cursor: pointer; font-size: 1.5rem; }

        .premium-form { padding: 2rem; display: flex; flex-direction: column; gap: 1.5rem; }
        .form-section { display: flex; flex-direction: column; gap: 0.5rem; flex: 1; }
        .form-section label { font-size: 0.85rem; font-weight: 600; color: var(--text-muted); display: flex; align-items: center; gap: 0.5rem; }
        .form-section input, .form-section select { background: rgba(15, 23, 42, 0.5); border: 1px solid var(--border); border-radius: 10px; padding: 0.85rem; color: white; outline: none; }
        .form-row { display: flex; gap: 1.5rem; }
        .modal-footer { margin-top: 1rem; display: flex; justify-content: flex-end; gap: 1rem; }
        .btn-glow:hover { box-shadow: 0 0 15px rgba(99, 102, 241, 0.5); }
        
        .calendar-card { 
          padding: 2rem; 
          background: linear-gradient(135deg, rgba(30, 41, 59, 0.7), rgba(15, 23, 42, 0.7));
          border-radius: var(--radius);
          border: 1px solid var(--border);
          box-shadow: var(--shadow);
        }
        .revision-details { min-height: 400px; padding: 2rem; display: flex; flex-direction: column; gap: 1.5rem; }
        .details-header { display: flex; align-items: center; gap: 0.75rem; color: var(--primary); }
        .details-header h3 { color: var(--text-main); margin: 0; font-size: 1.25rem; }

        /* Custom Calendar Overrides - Premium Dark Theme */
        :global(.react-calendar) {
          background: transparent !important;
          border: none !important;
          width: 100% !important;
          color: var(--text-main) !important;
          font-family: inherit !important;
        }
        :global(.react-calendar__navigation) {
          margin-bottom: 2rem !important;
          display: flex;
          gap: 0.5rem;
        }
        :global(.react-calendar__navigation button) {
          color: white !important;
          min-width: 44px !important;
          background: rgba(255, 255, 255, 0.05) !important;
          border-radius: 8px !important;
          font-weight: 600 !important;
        }
        :global(.react-calendar__navigation button:enabled:hover) {
          background: var(--primary) !important;
        }
        :global(.react-calendar__month-view__weekdays) {
          text-align: center !important;
          text-transform: uppercase !important;
          font-weight: 800 !important;
          font-size: 0.75rem !important;
          color: var(--text-muted) !important;
          padding-bottom: 1rem !important;
        }
        :global(.react-calendar__month-view__weekdays__weekday abbr) {
          text-decoration: none !important;
        }
        :global(.react-calendar__tile) {
          color: rgba(255, 255, 255, 0.75) !important;
          padding: 1.5rem 0.5rem !important;
          background: rgba(15, 23, 42, 0.6) !important;
          border-radius: 12px !important;
          transition: var(--transition) !important;
          font-weight: 500 !important;
          position: relative;
        }
        :global(.react-calendar__tile:enabled:hover) {
          background: rgba(99, 102, 241, 0.25) !important;
          color: white !important;
        }
        :global(.react-calendar__tile--now) {
          background: rgba(99, 102, 241, 0.15) !important;
          color: var(--primary) !important;
          font-weight: 800 !important;
          font-size: 1.1rem !important;
        }
        :global(.react-calendar__tile--active) {
          background: var(--primary) !important;
          color: white !important;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4) !important;
        }
        :global(.react-calendar__month-view__days__day--neighboringMonth) {
          opacity: 0.1 !important;
          pointer-events: none !important;
        }
        
        :global(.has-revision) {
          color: var(--secondary) !important;
          font-weight: 700 !important;
        }
        :global(.has-revision::after) {
          content: '';
          position: absolute;
          bottom: 12px;
          left: 50%;
          transform: translateX(-50%);
          width: 5px;
          height: 5px;
          background: var(--secondary);
          border-radius: 50%;
          box-shadow: 0 0 8px var(--secondary);
        }

        :global(.revisions-done) {
          color: #10b981 !important;
          font-weight: 700 !important;
        }
        :global(.revisions-done::after) {
          content: '✓';
          position: absolute;
          bottom: 10px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 0.7rem;
          color: #10b981;
        }

        @media (max-width: 1024px) {
          .planner-container { grid-template-columns: 1fr; }
        }
      `}</style>

    </div>
  );
};

export default Revision;
