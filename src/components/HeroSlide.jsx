import { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MoreInfoModal from './MoreInfoModal';
import { useUserActivity } from '../context/UserActivityContext';

const HeroSlide = ({ movie }) => {
  const navigate = useNavigate();
  const { addToHistory } = useUserActivity();

  const videoRef        = useRef(null);
  const hoverTimeoutRef = useRef(null);

  const [isHovered,    setIsHovered]    = useState(false);
  const [isMuted,      setIsMuted]      = useState(true);
  const [showMoreInfo, setShowMoreInfo] = useState(false);

  // ── Cleanup on unmount ───────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
        hoverTimeoutRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
    };
  }, []);

  // ── Hover handlers ───────────────────────────────────────────────────────
  const handleMouseEnter = () => {
    // Clear any existing timeout to avoid stacking
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);

    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(true);
      if (videoRef.current) {
        videoRef.current.play().catch(() => {});
      }
    }, 2000);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setIsHovered(false);
    setIsMuted(true);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  const handleToggleMute = (e) => {
    e.stopPropagation();
    setIsMuted(prev => !prev);
  };

  // ── Navigation ───────────────────────────────────────────────────────────
  const navigateToPlayer = () => {
    // Stop hover timer and video before leaving
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
    setIsHovered(false);
    setIsMuted(true);

    addToHistory(movie);

    let url = `/player?movie=${movie.id}`;
    if (movie.tmdbId) {
      url += `&tmdb=${movie.tmdbId}&type=${movie.tmdbType}`;
    }
    navigate(url);
  };

  const handleNavigate = (e) => {
    // Let button click handlers deal with btn-info and mute-btn
    if (e.target.closest('.btn-info') ||
        e.target.closest('.mute-btn') ||
        e.target.closest('.btn')) return;
    navigateToPlayer();
  };

  const handlePlayBtn = (e) => {
    e.stopPropagation();
    navigateToPlayer();
  };

  const handleMoreInfoBtn = (e) => {
    e.stopPropagation();
    setShowMoreInfo(true);
  };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <>
      <header
        className="hero"
        onClick={handleNavigate}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <img
          className="hero-poster"
          src={movie.poster}
          alt={movie.title}
          style={{ opacity: isHovered ? 0 : 1 }}
        />
        <video
          ref={videoRef}
          className="hero-video"
          muted={isMuted}
          loop
          preload="metadata"
          style={{ opacity: isHovered ? 1 : 0 }}
        >
          <source src={movie.video} type="video/mp4" />
        </video>

        <button
          className="mute-btn"
          onClick={handleToggleMute}
          style={{
            opacity:       isHovered ? 1 : 0,
            pointerEvents: isHovered ? 'auto' : 'none',
          }}
        >
          <i className={`fas ${isMuted ? 'fa-volume-mute' : 'fa-volume-up'}`} />
        </button>

        <div className="hero-overlay" />

        <div className="hero-content">
          <h1 className="hero-title">{movie.title}</h1>
          <p className="hero-description">{movie.description}</p>
          <div className="hero-button">
            <button className="btn btn-play" onClick={handlePlayBtn}>
              <i className="fa fa-play" /> Play
            </button>
            <button className="btn btn-info" onClick={handleMoreInfoBtn}>
              <i className="fa fa-info-circle" /> More Info
            </button>
          </div>
        </div>
      </header>

      {showMoreInfo && (
        <MoreInfoModal
          item={{
            tmdbId:      movie.tmdbId,
            tmdbType:    movie.tmdbType,
            title:       movie.title,
            description: movie.description,
            poster:      movie.poster,
          }}
          onClose={() => setShowMoreInfo(false)}
        />
      )}
    </>
  );
};

export default HeroSlide;
