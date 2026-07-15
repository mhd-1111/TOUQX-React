import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchTMDB } from '../api/tmdb';
import { PROFILE_185 } from '../config';
import { getMoviePosterSrc, getTmdbPosterUrl } from '../utils/posterUtils';
import { useUserActivity } from '../context/UserActivityContext';
import './MoreInfoModal.css';

const MoreInfoModal = ({ item, onClose }) => {
  const navigate = useNavigate();
  const { toggleLike, toggleSave, toggleWatched, addToHistory, isLiked, isSaved, isWatched } = useUserActivity();

  const [details, setDetails]   = useState(null);
  const [cast, setCast]         = useState([]);
  const [similar, setSimilar]   = useState([]);
  const [trailerKey, setTrailerKey] = useState('');
  const [loading, setLoading]   = useState(true);

  /* item shape: { id, title/name, media_type, poster_path, ... }
     OR a hero item: { tmdbId, tmdbType, title, poster, description }  */
  const id   = item?.tmdbId  || item?.id;
  // Prefer explicit type fields; fall back to title/name heuristic
  const type = item?.tmdbType || item?.media_type || (item?.name && !item?.title ? 'tv' : 'movie');
  const movieObj = details || item;

  useEffect(() => {
    if (!id) return;
    setLoading(true);

    Promise.all([
      fetchTMDB(`/${type}/${id}`),
      fetchTMDB(`/${type}/${id}/credits`),
      fetchTMDB(`/${type}/${id}/similar`),
      fetchTMDB(`/${type}/${id}/videos`),
    ])
      .then(([det, cred, sim, vids]) => {
        setDetails(det);
        setCast((cred.cast || []).slice(0, 6).filter(a => a.profile_path));
        setSimilar((sim.results || []).slice(0, 6).filter(m => m.poster_path));
        const trailer = (vids.results || []).find(v => v.type === 'Trailer' && v.site === 'YouTube')
          || (vids.results || []).find(v => v.site === 'YouTube');
        if (trailer) setTrailerKey(trailer.key);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id, type]);

  // Close on ESC
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handlePlay = () => {
    if (id && movieObj) addToHistory(movieObj);
    navigate(`/player?tmdb=${id}&type=${type}`);
    onClose();
  };

  if (!id) return null;

  const title       = details?.title || details?.name || item?.title || item?.name || '';
  const overview    = details?.overview || item?.description || '';
  const posterSrc   = getMoviePosterSrc(details || item);
  const rating      = details?.vote_average ? details.vote_average.toFixed(1) : null;
  const releaseDate = details?.release_date || details?.first_air_date || '';
  const year        = releaseDate ? releaseDate.slice(0, 4) : '';
  const runtime     = type === 'movie'
    ? (details?.runtime ? `${details.runtime} min` : null)
    : (details?.number_of_seasons ? `${details.number_of_seasons} Season${details.number_of_seasons !== 1 ? 's' : ''}` : null);
  const genres      = (details?.genres || []).map(g => g.name).join(' • ');

  const liked   = isLiked(id);
  const savedOk = isSaved(id);
  const watched = isWatched(id);

  return (
    <div className="more-info-backdrop" onClick={handleBackdrop}>
      <div className="more-info-modal">
        <button className="more-info-close" onClick={onClose}>
          <i className="fa-solid fa-xmark"></i>
        </button>

        {loading ? (
          <div className="more-info-loading">
            <div className="more-info-spinner"></div>
            <p>Loading details…</p>
          </div>
        ) : (
          <>
            {/* Hero poster */}
            <div className="more-info-hero">
              {posterSrc && (
                <img src={posterSrc} alt={title} className="more-info-poster-bg" />
              )}
              <div className="more-info-hero-overlay"></div>
              <div className="more-info-hero-content">
                <h2 className="more-info-title">{title}</h2>
                <div className="more-info-badges">
                  {rating   && <span className="mi-badge">⭐ {rating}</span>}
                  {year     && <span className="mi-badge">📅 {year}</span>}
                  {runtime  && <span className="mi-badge">⏱ {runtime}</span>}
                </div>
                {genres && <p className="more-info-genres">{genres}</p>}
                <div className="more-info-actions">
                  <button className="mi-btn mi-play" onClick={handlePlay}>
                    <i className="fa fa-play"></i> Play
                  </button>
                  {trailerKey && (
                    <button className="mi-btn mi-trailer" onClick={() => window.open(`https://www.youtube.com/watch?v=${trailerKey}`, '_blank')}>
                      <i className="fa fa-film"></i> Trailer
                    </button>
                  )}
                  <button
                    className={`mi-icon-btn ${liked ? 'active' : ''}`}
                    title={liked ? 'Unlike' : 'Like'}
                    onClick={() => toggleLike(movieObj)}
                  >
                    <i className={`${liked ? 'fa-solid' : 'fa-regular'} fa-heart`}></i>
                  </button>
                  <button
                    className={`mi-icon-btn ${savedOk ? 'active' : ''}`}
                    title={savedOk ? 'Remove from list' : 'Save to My List'}
                    onClick={() => toggleSave(movieObj)}
                  >
                    <i className={`${savedOk ? 'fa-solid' : 'fa-regular'} fa-bookmark`}></i>
                  </button>
                  <button
                    className={`mi-icon-btn ${watched ? 'active-green' : ''}`}
                    title={watched ? 'Mark as unwatched' : 'Mark as watched'}
                    onClick={() => toggleWatched(movieObj)}
                  >
                    <i className={`${watched ? 'fa-solid' : 'fa-regular'} fa-circle-check`}></i>
                  </button>
                </div>
              </div>
            </div>

            {/* Overview */}
            {overview && (
              <div className="more-info-section">
                <h3 className="mi-section-title">Overview</h3>
                <p className="more-info-overview">{overview}</p>
              </div>
            )}

            {/* Cast */}
            {cast.length > 0 && (
              <div className="more-info-section">
                <h3 className="mi-section-title">Cast</h3>
                <div className="mi-cast-row">
                  {cast.map(actor => (
                    <div key={actor.id} className="mi-cast-card">
                      <img src={`${PROFILE_185}${actor.profile_path}`} alt={actor.name} />
                      <p className="mi-actor-name">{actor.name}</p>
                      <p className="mi-actor-char">{actor.character}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Similar */}
            {similar.length > 0 && (
              <div className="more-info-section">
                <h3 className="mi-section-title">More Like This</h3>
                <div className="mi-similar-row">
                  {similar.map(m => {
                    const simType = m.title ? 'movie' : 'tv';
                    return (
                      <div
                        key={m.id}
                        className="mi-similar-card"
                        onClick={() => { navigate(`/player?tmdb=${m.id}&type=${simType}`); onClose(); }}
                      >
                        <img src={getMoviePosterSrc(m, 'w342')} alt={m.title || m.name} />
                        <p>{m.title || m.name}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MoreInfoModal;
