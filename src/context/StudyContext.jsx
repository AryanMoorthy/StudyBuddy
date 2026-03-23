import React, { createContext, useState, useEffect } from 'react';

export const StudyContext = createContext();

export const StudyProvider = ({ children }) => {
  const [subjects, setSubjects] = useState(() => {
    const saved = localStorage.getItem('study_subjects');
    if (saved) return JSON.parse(saved);
    return [
      { id: '1', name: 'Computer Science', description: 'Core principles and algorithms', color: '#6366f1' },
      { id: '2', name: 'Mathematics', description: 'Calculus and Linear Algebra', color: '#ec4899' }
    ];
  });

  const [topics, setTopics] = useState(() => {
    const saved = localStorage.getItem('study_topics');
    if (saved) return JSON.parse(saved);
    return [
      { id: '101', subjectId: '1', name: 'Binary Search Trees', difficulty: 'Medium', status: 'In Progress', notes: '' },
      { id: '102', subjectId: '1', name: 'Graph Traversal', difficulty: 'Hard', status: 'Not Started', notes: '' }
    ];
  });

  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('study_tasks');
    if (saved) return JSON.parse(saved);
    const today = new Date().toISOString().split('T')[0];
    return [
      { id: '201', title: 'Implement BST Delete', subject: 'Computer Science', topic: 'Binary Search Trees', deadline: today, priority: 'High', status: 'Pending' },
      { id: '202', title: 'Revise BFS/DFS', subject: 'Computer Science', topic: 'Graph Traversal', deadline: today, priority: 'Medium', status: 'Revision', isRevision: true }
    ];
  });

  useEffect(() => {
    localStorage.setItem('study_subjects', JSON.stringify(subjects));
  }, [subjects]);

  useEffect(() => {
    localStorage.setItem('study_topics', JSON.stringify(topics));
  }, [topics]);

  useEffect(() => {
    localStorage.setItem('study_tasks', JSON.stringify(tasks));
  }, [tasks]);

  const value = {
    subjects,
    setSubjects,
    topics,
    setTopics,
    tasks,
    setTasks,
  };

  return (
    <StudyContext.Provider value={value}>
      {children}
    </StudyContext.Provider>
  );
};
