const StatCard = ({ title, value, icon, accent }) => (
  <div className="stat-card">
    <div className="stat-card__icon" style={{ backgroundColor: accent }}>
      {icon}
    </div>
    <div className="stat-card__content">
      <p>{title}</p>
      <h3>{value}</h3>
    </div>
  </div>
)

export default StatCard
