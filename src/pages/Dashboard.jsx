import React from 'react';
import { useProgress } from '../hooks/useProgress';
import { useTasks } from '../hooks/useTasks';
import ProgressChart from '../components/ProgressChart';
import RevisionList from '../components/RevisionList';
import { MdAssignment, MdCheckCircle, MdPendingActions, MdRotateRight } from 'react-icons/md';

const Dashboard = () => {
  const { totalTasks, completedTasks, pendingTasks, revisionTasks, overallCompletion, subjectProgress } = useProgress();
  const { getCategorizedTasks, updateTask } = useTasks();
  const { revision: upcomingRevisions } = getCategorizedTasks();

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
          <h3>Upcoming Revisions</h3>
          <RevisionList 
            revisions={upcomingRevisions.slice(0, 5)} 
            onAction={(task) => updateTask(task.id, { status: task.status === 'Completed' ? 'Revision' : 'Completed' })}
          />
        </div>
      </div>

      <style jsx>{`
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
