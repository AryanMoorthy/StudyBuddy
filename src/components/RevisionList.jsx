import { MdCalendarToday, MdChevronRight, MdCheckCircle, MdEdit, MdDelete, MdSchool, MdTopic } from 'react-icons/md';
import { format } from 'date-fns';

const RevisionList = ({ revisions, onAction, onEdit, onDelete }) => {
  return (
    <div className="revision-list">
      {revisions.length > 0 ? (
        revisions.map((rev) => {
          const isCompleted = rev.status === 'Completed';
          return (
            <div key={rev.id} className={`revision-item card ${isCompleted ? 'completed' : ''}`}>
              <div className="rev-icon">
                {isCompleted ? <MdCheckCircle /> : <MdCalendarToday />}
              </div>
              <div className="rev-info">
                <h4 className={isCompleted ? 'strikethrough' : ''}>{rev.title}</h4>
                <div className="rev-meta">
                  <span className="meta-item"><MdSchool /> {rev.subject}</span>
                  <span className="meta-item"><MdTopic /> {rev.topic}</span>
                  <span className="meta-item"><MdCalendarToday /> {format(new Date(rev.deadline), 'MMM dd')}</span>
                </div>
              </div>
              <div className="rev-actions">
                <button 
                  className="action-btn edit" 
                  onClick={(e) => { e.stopPropagation(); onEdit(rev); }}
                  title="Edit Revision"
                >
                  <MdEdit />
                </button>
                <button 
                  className="action-btn delete" 
                  onClick={(e) => { e.stopPropagation(); onDelete(rev.id); }}
                  title="Delete Revision"
                >
                  <MdDelete />
                </button>
                <button 
                  className="rev-btn" 
                  onClick={() => onAction(rev)} 
                  title={isCompleted ? "Mark as Pending" : "Mark as Completed"}
                >
                  {isCompleted ? <MdCheckCircle color="#10b981" /> : <MdChevronRight />}
                </button>
              </div>
            </div>
          );
        })
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
          font-size: 1.1rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          color: white;
        }
        .strikethrough {
          text-decoration: line-through;
          color: var(--text-muted);
        }
        .rev-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
        }
        .meta-item {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.8rem;
          color: var(--text-muted);
          background: rgba(255, 255, 255, 0.03);
          padding: 2px 8px;
          border-radius: 6px;
          white-space: nowrap;
        }
        .meta-item svg {
          color: var(--primary);
          font-size: 0.9rem;
        }
        .rev-actions {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          opacity: 0;
          transition: var(--transition);
        }
        .revision-item:hover .rev-actions {
          opacity: 1;
        }
        .action-btn {
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          font-size: 1.1rem;
          padding: 0.25rem;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          transition: var(--transition);
        }
        .action-btn:hover { background: var(--glass); color: white; }
        .action-btn.delete:hover { color: #ef4444; }

        .rev-btn {
          background: transparent;
          border: none;
          color: var(--text-muted);
          font-size: 1.5rem;
          cursor: pointer;
          transition: var(--transition);
          margin-left: 0.5rem;
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
