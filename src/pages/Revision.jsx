import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { useTasks } from '../hooks/useTasks';
import RevisionList from '../components/RevisionList';
import { format, isSameDay } from 'date-fns';
import { MdEventNote } from 'react-icons/md';

const Revision = () => {
  const { tasks, updateTask } = useTasks();
  const [selectedDate, setSelectedDate] = useState(new Date());

  const revisionTasks = tasks.filter(t => t.status === 'Revision' || t.isRevision);
  const tasksOnSelectedDate = revisionTasks.filter(t => isSameDay(new Date(t.deadline), selectedDate));

  const tileClassName = ({ date, view }) => {
    if (view === 'month') {
      if (revisionTasks.some(t => isSameDay(new Date(t.deadline), date))) {
        return 'has-revision';
      }
    }
    return null;
  };

  return (
    <div className="revision-page">
      <header className="page-header">
        <h1>Revision Planner</h1>
        <p>Spaced repetition for better retention</p>
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
            onAction={(task) => updateTask(task.id, { status: 'Completed', isRevision: false })}
          />
        </div>
      </div>

      <style jsx>{`
        .revision-page { display: flex; flex-direction: column; gap: 2rem; }
        .planner-container { display: grid; grid-template-columns: 1.2fr 1fr; gap: 2rem; align-items: start; }
        
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
        }
        :global(.react-calendar__tile--active) {
          background: var(--primary) !important;
          color: white !important;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4) !important;
        }
        :global(.react-calendar__month-view__days__day--neighboringMonth) {
          opacity: 0.3 !important;
          background: rgba(15, 23, 42, 0.3) !important;
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

        @media (max-width: 1024px) {
          .planner-container { grid-template-columns: 1fr; }
        }
      `}</style>

    </div>
  );
};

export default Revision;
