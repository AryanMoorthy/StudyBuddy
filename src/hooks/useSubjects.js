import { useContext } from 'react';
import { StudyContext } from '../context/StudyContext';

export const useSubjects = () => {
  const { subjects, setSubjects, topics, setTopics } = useContext(StudyContext);

  const addSubject = (subject) => {
    const newSubject = { ...subject, id: Date.now().toString() };
    setSubjects([...subjects, newSubject]);
    return newSubject;
  };

  const updateSubject = (id, updatedSubject) => {
    setSubjects(subjects.map((s) => (s.id === id ? { ...s, ...updatedSubject } : s)));
  };

  const deleteSubject = (id) => {
    setSubjects(subjects.filter((s) => s.id !== id));
    setTopics(topics.filter((t) => t.subjectId !== id));
  };

  const addTopic = (topic) => {
    const newTopic = { ...topic, id: Date.now().toString() };
    setTopics([...topics, newTopic]);
    return newTopic;
  };

  const updateTopic = (id, updatedTopic) => {
    setTopics(topics.map((t) => (t.id === id ? { ...t, ...updatedTopic } : t)));
  };

  const deleteTopic = (id) => {
    setTopics(topics.filter((t) => t.id !== id));
  };

  return {
    subjects,
    topics,
    addSubject,
    updateSubject,
    deleteSubject,
    addTopic,
    updateTopic,
    deleteTopic,
  };
};
