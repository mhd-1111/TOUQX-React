import { useEffect } from 'react';

const WatchModal = ({ isActive, onClose }) => {
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isActive, onClose]);

  return (
    <div 
      className={`watch-modal ${isActive ? 'active' : ''}`} 
      id="watchModal"
      onClick={(e) => {
        if (e.target.className.includes('watch-modal')) onClose();
      }}
    >
      <div className="watch-card">
        <div className="watch-icon">
          <i className="fa-solid fa-tv"></i>
        </div>
        <h2>Playback Unavailable</h2>
        <p>
          This title isn't currently available to stream on TOUQX.
          <br /><br />
          We're continuously expanding our library.
          Please check back soon for future availability.
        </p>
        <button id="closeWatchModal" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

export default WatchModal;
