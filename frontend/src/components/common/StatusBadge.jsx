import './StatusBadge.css';

export const StatusBadge = ({ status }) => {
  // Map standard status strings to badge classes
  const getBadgeClass = (status) => {
    if (!status) return '';
    const normalized = status.toLowerCase().replace(/\s+/g, '');
    return `badge badge-${normalized}`;
  };

  return (
    <span className={getBadgeClass(status)}>
      {status}
    </span>
  );
};
