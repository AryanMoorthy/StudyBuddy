import React from 'react';
import { MdEdit, MdDelete, MdTopic } from 'react-icons/md';

const SubjectCard = ({ subject, topicCount, onEdit, onDelete, onClick }) => {
  return (
    <div className="card subject-card" onClick={onClick}>
      <div className="subject-header">
        <div className="subject-color" style={{ backgroundColor: subject.color || '#6366f1' }}></div>
        <h3>{subject.name}</h3>
      </div>
      <p className="subject-desc">{subject.description}</p>
      <div className="subject-footer">
        <div className="topic-badge">
          <MdTopic />
          <span>{topicCount} Topics</span>
        </div>
        <div className="actions">
          <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="action-btn">
            <MdEdit />
          </button>
          <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="action-btn delete">
            <MdDelete />
          </button>
        </div>
      </div>
      <style jsx>{`
        .subject-card {
          cursor: pointer;
          position: relative;
          overflow: hidden;
        }
        .subject-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }
        .subject-color {
          width: 12px;
          height: 12px;
          border-radius: 50%;
        }
        .subject-desc {
          color: var(--text-muted);
          font-size: 0.9rem;
          margin-bottom: 1.5rem;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .subject-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .topic-badge {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.85rem;
          color: var(--primary);
          background: rgba(99, 102, 241, 0.1);
          padding: 0.25rem 0.6rem;
          border-radius: 20px;
        }
        .actions {
          display: flex;
          gap: 0.5rem;
        }
        .action-btn {
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          font-size: 1.1rem;
          transition: var(--transition);
        }
        .action-btn:hover {
          color: var(--text-main);
        }
        .action-btn.delete:hover {
          color: #ef4444;
        }
      `}</style>
    </div>
  );
};

export default SubjectCard;
