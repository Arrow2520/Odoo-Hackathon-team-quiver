import './KPICard.css';

export const KPICard = ({ title, value, accentColor = 'blue' }) => {
  return (
    <div className={`kpi-card accent-${accentColor}`}>
      <h4 className="kpi-title">{title}</h4>
      <div className="kpi-value">{value}</div>
    </div>
  );
};
