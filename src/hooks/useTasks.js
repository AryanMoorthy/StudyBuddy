import { useContext } from 'react';
import { StudyContext } from '../context/StudyContext';
import { isAfter, isBefore, startOfDay } from 'date-fns';

export const useTasks = () => {
  const { tasks, setTasks } = useContext(StudyContext);

  const addTask = (task) => {
    const newTask = { 
      ...task, 
      id: Date.now().toString(),
      status: task.status || 'Pending',
      createdAt: new Date().toISOString()
    };
    setTasks([...tasks, newTask]);
    return newTask;
  };

  const updateTask = (id, updatedTask) => {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, ...updatedTask } : t)));
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter((t) => t.id !== id));
  };

  const getFilteredTasks = (filters = {}) => {
    return tasks.filter((task) => {
      let match = true;
      if (filters.status && filters.status !== 'All') {
        match = match && task.status === filters.status;
      }
      if (filters.priority && filters.priority !== 'All') {
        match = match && task.priority === filters.priority;
      }
      if (filters.subject && filters.subject !== 'All') {
        match = match && task.subject === filters.subject;
      }
      if (filters.search) {
        match = match && task.title.toLowerCase().includes(filters.search.toLowerCase());
      }
      return match;
    });
  };

  const getCategorizedTasks = () => {
    const today = startOfDay(new Date());
    return {
      all: tasks,
      pending: tasks.filter(t => t.status === 'Pending'),
      completed: tasks.filter(t => t.status === 'Completed'),
      overdue: tasks.filter(t => t.status === 'Pending' && isBefore(new Date(t.deadline), today)),
      revision: tasks.filter(t => t.status === 'Revision' || t.isRevision)
    };
  };

  return {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    getFilteredTasks,
    getCategorizedTasks,
  };
};
