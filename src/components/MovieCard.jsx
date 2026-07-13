import { useNavigate } from 'react-router-dom';
import { POSTER_500 } from '../config';
import TiltedCard from './TiltedCard';

const MovieCard = ({ movie }) => {
  const navigate = useNavigate();
  const mediaType = movie.title ? "movie" : "tv";
  const title = movie.title || movie.name;

  const handlePlayClick = (e) => {
    e.stopPropagation();
    navigate(`/player?tmdb=${movie.id}&type=${mediaType}`);
  };

  const handleCardClick = () => {
    navigate(`/player?tmdb=${movie.id}&type=${mediaType}`);
  };

  const overlayContent = (
    <>
      <div className="touqx-badge">T</div>
      <div className="card-overlay">
        <div className="overlay-top"></div>
        <div className="overlay-bottom">
          <div className="overlay-title">{title}</div>
          <div className="overlay-controls">
            <div className="control-btn play-btn" onClick={handlePlayClick}></div>
            <div className="control-btn check-btn"></div>
            <div className="control-btn thumbs-btn"></div>
            <div className="control-btn more-btn"></div>
            <div className="control-btn save-btn"></div>
          </div>
          <div className="overlay-info">
            <div className="info-badge">
              ⭐ {movie.vote_average ? movie.vote_average.toFixed(1) : "N/A"}
            </div>
            <div className="info-badge">
              📅 {movie.release_date || movie.first_air_date ? (movie.release_date || movie.first_air_date).substring(0, 4) : "N/A"}
            </div>
            <div className="info-badge">HD</div>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className="content-card" onClick={handleCardClick} data-id={movie.id}>
      <TiltedCard
        imageSrc={`${POSTER_500}${movie.poster_path}`}
        altText={title}
        captionText=""
        containerHeight="100%"
        containerWidth="100%"
        imageHeight="100%"
        imageWidth="100%"
        rotateAmplitude={14}
        scaleOnHover={1.04}
        showMobileWarning={false}
        showTooltip={false}
        displayOverlayContent={true}
        overlayContent={overlayContent}
      />
    </div>
  );
};

export default MovieCard;
