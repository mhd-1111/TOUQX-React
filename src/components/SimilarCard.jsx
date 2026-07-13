import { useNavigate } from 'react-router-dom';
import { POSTER_342 } from '../config';

const SimilarCard = ({ item }) => {
  const navigate = useNavigate();
  const title = item.title || item.name;
  const type = item.title ? "movie" : "tv";
  const year = (item.release_date || item.first_air_date || '').slice(0, 4);

  return (
    <div 
      className="similar-card" 
      onClick={() => navigate(`/player?tmdb=${item.id}&type=${type}`)}
    >
      <img
        src={`${POSTER_342}${item.poster_path}`}
        alt={title}
      />
      <div className="similar-info">
        {item.vote_average !== undefined && (
          <div className="similar-meta">
            <span>⭐ {item.vote_average.toFixed(1)}</span>
            <span>📅 {year || "N/A"}</span>
          </div>
        )}
        <h4>{title}</h4>
      </div>
    </div>
  );
};

export default SimilarCard;
