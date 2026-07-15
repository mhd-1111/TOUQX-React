import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const ProfileMenu = () => {
  const [isActive, setIsActive] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsActive(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const toggleMenu = (e) => {
    e.stopPropagation();
    setIsActive(!isActive);
  };

  const goTo = (path) => {
    setIsActive(false);
    navigate(path);
  };

  return (
    <div className="profile-container" ref={menuRef} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      <img
        src="https://upload.wikimedia.org/wikipedia/commons/0/0b/Netflix-avatar.png?_=20201013161117"
        alt="profile image"
        className="profile-icon"
        onClick={toggleMenu}
      />

      <div className={`profile-menu ${isActive ? 'active' : ''}`} id="profileMenu">
        <div className="profile-name">Guest</div>

        <div className="profile-item" onClick={() => goTo('/viewall?list=liked')}>
          <i className="fa-solid fa-heart"></i> Liked
        </div>
        <div className="profile-item" onClick={() => goTo('/viewall?list=saved')}>
          <i className="fa-solid fa-bookmark"></i> Saved
        </div>
        <div className="profile-item" onClick={() => goTo('/viewall?list=watched')}>
          <i className="fa-solid fa-circle-check"></i> Watched
        </div>
        <div className="profile-item" onClick={() => goTo('/viewall?list=history')}>
          <i className="fa-solid fa-clock-rotate-left"></i> History
        </div>
        <div className="profile-item" onClick={() => alert('Settings coming soon!')}>
          <i className="fa-solid fa-gear"></i> Settings
        </div>
      </div>
    </div>
  );
};

export default ProfileMenu;
