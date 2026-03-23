export const formatPercentage = (val) => Math.round(val) + '%';

export const getStatusColor = (status) => {
  switch (status) {
    case 'Completed': return '#10b981';
    case 'In Progress': return '#3b82f6';
    case 'Needs Revision': return '#ef4444';
    default: return '#94a3b8';
  }
};

export const generateId = () => Math.random().toString(36).substr(2, 9);
