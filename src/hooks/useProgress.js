import { useMemo } from 'react';
import { useTasks } from './useTasks';
import { useSubjects } from './useSubjects';

export const useProgress = () => {
  const { tasks } = useTasks();
  const { subjects, topics } = useSubjects();

  const stats = useMemo(() => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'Completed').length;
    const pendingTasks = tasks.filter(t => t.status === 'Pending').length;
    const revisionTasks = tasks.filter(t => t.status === 'Revision').length;
    
    const overallCompletion = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    const subjectProgress = subjects.map(subject => {
      const subjectTasks = tasks.filter(t => t.subject === subject.name);
      const completed = subjectTasks.filter(t => t.status === 'Completed').length;
      return {
        name: subject.name,
        total: subjectTasks.length,
        completed,
        percentage: subjectTasks.length > 0 ? (completed / subjectTasks.length) * 100 : 0
      };
    });

    return {
      totalTasks,
      completedTasks,
      pendingTasks,
      revisionTasks,
      overallCompletion,
      subjectProgress
    };
  }, [tasks, subjects]);

  return stats;
};
