import { POSTER_500 } from '../config';

const EpisodeCard = ({ episode, onPlayClick }) => {
  const imageSrc = episode.still_path 
    ? `${POSTER_500}${episode.still_path}` 
    : "/images/no-image.jpg"; // note: image doesn't exist originally but matches logic

  return (
    <div className="episode-card" onClick={onPlayClick} style={{ cursor: 'pointer' }}>
      <img src={imageSrc} alt={episode.name} />
      <div className="episode-info">
        <h3>Episode {episode.episode_number} • {episode.name}</h3>
        <div className="episode-runtime">
          ⏱ {episode.runtime || "--"} min
        </div>
        <p>{episode.overview || "No description."}</p>
      </div>
    </div>
  );
};

export default EpisodeCard;
