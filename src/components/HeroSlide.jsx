import { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const HeroSlide = ({ movie }) => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const hoverTimeoutRef = useRef(null);

  const handleMouseEnter = () => {
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
    setIsMuted(!isMuted);
  };

  const handleNavigate = (e) => {
    // Navigate unless clicking the info button
    if (!e.target.closest('.btn-info') && !e.target.closest('.mute-btn')) {
      navigate(`/player?movie=${movie.id}`);
    }
  };

  const handlePlayBtn = (e) => {
    e.stopPropagation();
    navigate(`/player?movie=${movie.id}`);
  };

  return (
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
          opacity: isHovered ? 1 : 0,
          pointerEvents: isHovered ? 'auto' : 'none'
        }}
      >
        <i className={`fas ${isMuted ? 'fa-volume-mute' : 'fa-volume-up'}`}></i>
      </button>

      <div className="hero-overlay"></div>

      <div className="hero-content">
        <h1 className="hero-title">{movie.title}</h1>
        <p className="hero-description">{movie.description}</p>
        <div className="hero-button">
          <button className="btn btn-play" onClick={handlePlayBtn}>
            <i className="fa fa-play"></i> Play
          </button>
          <button className="btn btn-info">
            <i className="fa fa-info-circle"></i> More Info
          </button>
        </div>
      </div>
    </header>
  );
};

export default HeroSlide;
