import React from 'react';
import { MdAccessTime, MdPriorityHigh, MdCheckCircle, MdRadioButtonUnchecked } from 'react-icons/md';
import { format } from 'date-fns';

const TaskCard = ({ task, onStatusToggle, onDelete }) => {
  const priorityColors = {
    High: '#ef4444',
    Medium: '#f59e0b',
    Low: '#10b981'
  };

  const isCompleted = task.status === 'Completed';

  return (
    <div className={`card task-card ${isCompleted ? 'completed' : ''}`}>
      <div className="task-header">
        <button className="status-toggle" onClick={() => onStatusToggle()}>
          {isCompleted ? <MdCheckCircle color="#10b981" /> : <MdRadioButtonUnchecked />}
        </button>
        <div className="task-title-group">
          <h4 className={isCompleted ? 'strikethrough' : ''}>{task.title}</h4>
          <span className="task-meta">{task.subject} • {task.topic}</span>
        </div>
      </div>
      
      <div className="task-details">
        <div className="task-tag" style={{ color: priorityColors[task.priority], background: `${priorityColors[task.priority]}15` }}>
          <MdPriorityHigh size={14} />
          <span>{task.priority}</span>
        </div>
        <div className="task-tag deadline">
          <MdAccessTime size={14} />
          <span>{format(new Date(task.deadline), 'MMM dd')}</span>
        </div>
      </div>

      <style jsx>{`
        .task-card {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          padding: 1.25rem;
        }
        .task-card.completed {
          opacity: 0.7;
        }
        .task-header {
          display: flex;
          gap: 0.75rem;
          align-items: flex-start;
        }
        .status-toggle {
          background: transparent;
          border: none;
          cursor: pointer;
          font-size: 1.5rem;
          color: var(--text-muted);
          padding-top: 2px;
        }
        .task-title-group {
          display: flex;
          flex-direction: column;
        }
        .strikethrough {
          text-decoration: line-through;
          color: var(--text-muted);
        }
        .task-meta {
          font-size: 0.8rem;
          color: var(--text-muted);
        }
        .task-details {
          display: flex;
          gap: 0.75rem;
          margin-left: 2.25rem;
        }
        .task-tag {
          display: flex;
          align-items: center;
          gap: 0.3rem;
          font-size: 0.75rem;
          font-weight: 600;
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
        }
        .task-tag.deadline {
          background: var(--glass);
          color: var(--text-muted);
        }
      `}</style>
    </div>
  );
};

export default TaskCard;
