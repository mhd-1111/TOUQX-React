const SeasonCard = ({ season, isActive, onClick }) => {
  return (
    <div 
      className={`season-card ${isActive ? 'season-active' : ''}`}
      onClick={onClick}
    >
      <h3>{season.name}</h3>
      <p>{season.episode_count} Episodes</p>
      <small>{season.air_date ? season.air_date.slice(0, 4) : ""}</small>
    </div>
  );
};

export default SeasonCard;
