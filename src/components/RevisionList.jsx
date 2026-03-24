import React from 'react';
import { MdCalendarToday, MdChevronRight, MdCheckCircle } from 'react-icons/md';
import { format } from 'date-fns';

const RevisionList = ({ revisions, onAction }) => {
  return (
    <div className="revision-list">
      {revisions.length > 0 ? (
        revisions.map((rev) => (
          <div key={rev.id} className={`revision-item card ${rev.status === 'Completed' ? 'completed' : ''}`}>
            <div className="rev-icon">
              {rev.status === 'Completed' ? <MdCheckCircle /> : <MdCalendarToday />}
            </div>
            <div className="rev-info">
              <h4 className={rev.status === 'Completed' ? 'strikethrough' : ''}>{rev.title}</h4>
              <p>{rev.subject} • {format(new Date(rev.deadline), 'MMM dd')}</p>
            </div>
            <button className="rev-btn" onClick={() => onAction(rev)} title={rev.status === 'Completed' ? "Mark as Pending" : "Mark as Completed"}>
              {rev.status === 'Completed' ? <MdCheckCircle color="#10b981" /> : <MdChevronRight />}
            </button>
          </div>
        ))
      ) : (
        <p className="empty-text">No revisions scheduled.</p>
      )}

      <style jsx>{`
        .revision-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .revision-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: var(--glass);
        }
        .revision-item.completed {
          opacity: 0.7;
          border-color: #10b98140;
        }
        .rev-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: rgba(99, 102, 241, 0.1);
          color: var(--primary);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
        }
        .revision-item.completed .rev-icon {
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
        }
        .rev-info {
          flex: 1;
        }
        .rev-info h4 {
          font-size: 0.95rem;
          margin-bottom: 0.2rem;
        }
        .strikethrough {
          text-decoration: line-through;
          color: var(--text-muted);
        }
        .rev-info p {
          font-size: 0.8rem;
          color: var(--text-muted);
        }
        .rev-btn {
          background: transparent;
          border: none;
          color: var(--text-muted);
          font-size: 1.5rem;
          cursor: pointer;
          transition: var(--transition);
        }
        .rev-btn:hover {
          color: var(--primary);
          transform: translateX(4px);
        }
        .empty-text {
          color: var(--text-muted);
          text-align: center;
          padding: 1rem;
        }
      `}</style>
    </div>
  );
};

export default RevisionList;
