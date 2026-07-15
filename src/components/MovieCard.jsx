import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMoviePosterSrc } from '../utils/posterUtils';
import TiltedCard from './TiltedCard';
import MoreInfoModal from './MoreInfoModal';
import { useUserActivity } from '../context/UserActivityContext';

const MovieCard = ({ movie }) => {
  const navigate = useNavigate();
  const { toggleLike, toggleSave, toggleWatched, addToHistory, isLiked, isSaved, isWatched } = useUserActivity();
  const [showMoreInfo, setShowMoreInfo] = useState(false);

  const mediaType = movie.tmdbType || (movie.title ? "movie" : "tv");
  const title = movie.title || movie.name;
  const tmdbIdentifier = movie.tmdbId || movie.id;

  const liked   = isLiked(movie.id);
  const saved   = isSaved(movie.id);
  const watched = isWatched(movie.id);

  const handlePlayClick = (e) => {
    e.stopPropagation();
    addToHistory(movie);
    navigate(`/player?tmdb=${tmdbIdentifier}&type=${mediaType}`);
  };

  const handleLikeClick = (e) => {
    e.stopPropagation();
    toggleLike(movie);
  };

  const handleSaveClick = (e) => {
    e.stopPropagation();
    toggleSave(movie);
  };

  const handleWatchedClick = (e) => {
    e.stopPropagation();
    toggleWatched(movie);
  };

  const handleMoreClick = (e) => {
    e.stopPropagation();
    setShowMoreInfo(true);
  };

  const handleCardClick = () => {
    addToHistory(movie);
    navigate(`/player?tmdb=${tmdbIdentifier}&type=${mediaType}`);
  };

  const overlayContent = (
    <>
      <div className="touqx-badge">T</div>
      <div className="card-overlay">
        <div className="overlay-top"></div>
        <div className="overlay-bottom">
          <div className="overlay-title">{title}</div>
          <div className="overlay-controls">
            {/* Play */}
            <div
              className="control-btn play-btn"
              onClick={handlePlayClick}
              title="Play"
            ></div>

            {/* Watched (check) */}
            <div
              className={`control-btn check-btn ${watched ? 'btn-active-green' : ''}`}
              onClick={handleWatchedClick}
              title={watched ? 'Mark unwatched' : 'Mark watched'}
              style={watched ? { borderColor: '#22c55e', color: '#22c55e' } : {}}
            ></div>

            {/* Like (thumbs) */}
            <div
              className={`control-btn thumbs-btn ${liked ? 'btn-active-red' : ''}`}
              onClick={handleLikeClick}
              title={liked ? 'Unlike' : 'Like'}
              style={liked ? { borderColor: '#e50914', color: '#e50914' } : {}}
            ></div>

            {/* More Info */}
            <div
              className="control-btn more-btn"
              onClick={handleMoreClick}
              title="More Info"
            ></div>

            {/* Save */}
            <div
              className={`control-btn save-btn ${saved ? 'btn-active-blue' : ''}`}
              onClick={handleSaveClick}
              title={saved ? 'Remove from My List' : 'Save to My List'}
              style={saved ? { borderColor: '#3b82f6', color: '#3b82f6' } : {}}
            ></div>
          </div>
          <div className="overlay-info">
            <div className="info-badge">
              ⭐ {movie.vote_average ? movie.vote_average.toFixed(1) : "N/A"}
            </div>
            <div className="info-badge">
              📅 {(movie.release_date || movie.first_air_date)
                ? (movie.release_date || movie.first_air_date).substring(0, 4)
                : "N/A"}
            </div>
            <div className="info-badge">HD</div>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      <div className="content-card" onClick={handleCardClick} data-id={movie.id}>
        <TiltedCard
          imageSrc={getMoviePosterSrc(movie)}
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

      {showMoreInfo && (
        <MoreInfoModal
          item={{ ...movie, media_type: mediaType }}
          onClose={() => setShowMoreInfo(false)}
        />
      )}
    </>
  );
};

export default MovieCard;
