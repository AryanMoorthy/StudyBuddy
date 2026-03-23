import React, { useState } from 'react';
import { useSubjects } from '../hooks/useSubjects';
import SubjectCard from '../components/SubjectCard';
import { MdAdd, MdClose } from 'react-icons/md';
import { toast } from 'react-toastify';

const Subjects = () => {
  const { subjects, addSubject, deleteSubject, topics, addTopic, deleteTopic, updateTopic } = useSubjects();
  const [showModal, setShowModal] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [newSubject, setNewSubject] = useState({ name: '', description: '', color: '#6366f1' });
  const [newTopic, setNewTopic] = useState({ name: '', difficulty: 'Medium', notes: '' });

  const handleAddSubject = (e) => {
    e.preventDefault();
    if (!newSubject.name) return toast.error('Subject name is required');
    addSubject(newSubject);
    setNewSubject({ name: '', description: '', color: '#6366f1' });
    setShowModal(false);
    toast.success('Subject added!');
  };

  const handleAddTopic = (e) => {
    e.preventDefault();
    if (!newTopic.name) return toast.error('Topic name is required');
    addTopic({ ...newTopic, subjectId: selectedSubject.id, status: 'Not Started' });
    setNewTopic({ name: '', difficulty: 'Medium', notes: '' });
    toast.success('Topic added!');
  };

  return (
    <div className="subjects-page">
      <header className="page-header">
        <div>
          <h1>Subjects & Topics</h1>
          <p>Organize your curriculum</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <MdAdd /> Add Subject
        </button>
      </header>

      <div className="grid grid-3">
        {subjects.map(subject => (
          <SubjectCard 
            key={subject.id} 
            subject={subject} 
            topicCount={topics.filter(t => t.subjectId === subject.id).length}
            onClick={() => setSelectedSubject(subject)}
            onDelete={() => {
              if (window.confirm('Delete subject and all its topics?')) {
                deleteSubject(subject.id);
                if (selectedSubject?.id === subject.id) setSelectedSubject(null);
              }
            }}
            onEdit={() => {}}
          />
        ))}
      </div>

      {selectedSubject && (
        <section className="topics-section card">
          <div className="section-header">
            <h2>Topics for {selectedSubject.name}</h2>
            <button className="btn btn-outline" onClick={() => setSelectedSubject(null)}>Close</button>
          </div>
          
          <form className="add-topic-form" onSubmit={handleAddTopic}>
            <input 
              type="text" 
              placeholder="New Topic Name" 
              value={newTopic.name}
              onChange={(e) => setNewTopic({...newTopic, name: e.target.value})}
            />
            <select 
              value={newTopic.difficulty}
              onChange={(e) => setNewTopic({...newTopic, difficulty: e.target.value})}
            >
              <option>Easy</option>
              <option>Medium</option>
              <option>Hard</option>
            </select>
            <button type="submit" className="btn btn-primary">Add Topic</button>
          </form>

          <div className="topics-list">
            {topics.filter(t => t.subjectId === selectedSubject.id).map(topic => (
              <div key={topic.id} className="topic-item">
                <div className="topic-info">
                  <h4>{topic.name}</h4>
                  <span className={`difficulty ${topic.difficulty.toLowerCase()}`}>{topic.difficulty}</span>
                </div>
                <div className="topic-actions">
                  <select 
                    value={topic.status} 
                    onChange={(e) => updateTopic(topic.id, { status: e.target.value })}
                  >
                    <option>Not Started</option>
                    <option>In Progress</option>
                    <option>Completed</option>
                    <option>Needs Revision</option>
                  </select>
                  <button onClick={() => deleteTopic(topic.id)} className="delete-btn">
                    <MdClose />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal card">
            <h2>Add New Subject</h2>
            <form onSubmit={handleAddSubject}>
              <div className="form-group">
                <label>Subject Name</label>
                <input 
                  type="text" 
                  value={newSubject.name} 
                  onChange={(e) => setNewSubject({...newSubject, name: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea 
                  value={newSubject.description} 
                  onChange={(e) => setNewSubject({...newSubject, description: e.target.value})}
                ></textarea>
              </div>
              <div className="form-group">
                <label>Color</label>
                <input 
                  type="color" 
                  value={newSubject.color} 
                  onChange={(e) => setNewSubject({...newSubject, color: e.target.value})}
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Subject</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }
        .topics-section {
          margin-top: 3rem;
          animation: slideUp 0.3s ease-out;
        }
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }
        .add-topic-form {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
        }
        .add-topic-form input {
          flex: 1;
          padding: 0.75rem;
          background: var(--glass);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          color: white;
        }
        .add-topic-form select {
          padding: 0.75rem;
          background: var(--bg-dark);
          color: white;
          border: 1px solid var(--border);
          border-radius: var(--radius);
        }
        .topic-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          border-bottom: 1px solid var(--border);
        }
        .topic-info {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }
        .difficulty {
          font-size: 0.7rem;
          text-transform: uppercase;
          font-weight: 700;
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
        }
        .difficulty.easy { color: #10b981; border: 1px solid #10b981; }
        .difficulty.medium { color: #f59e0b; border: 1px solid #f59e0b; }
        .difficulty.hard { color: #ef4444; border: 1px solid #ef4444; }
        
        .topic-actions {
          display: flex;
          gap: 1rem;
          align-items: center;
        }
        .topic-actions select {
          background: transparent;
          color: var(--text-muted);
          border: 1px solid var(--border);
          font-size: 0.85rem;
          padding: 0.25rem;
        }
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        .modal {
          width: 100%;
          max-width: 500px;
          padding: 2rem;
        }
        .form-group {
          margin-bottom: 1.5rem;
        }
        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          color: var(--text-muted);
        }
        .form-group input, .form-group textarea {
          width: 100%;
          padding: 0.75rem;
          background: var(--bg-dark);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          color: white;
        }
        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          margin-top: 2rem;
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default Subjects;
