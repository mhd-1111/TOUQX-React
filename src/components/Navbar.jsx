import { useState } from 'react';
import { Link } from 'react-router-dom';
import ProfileMenu from './ProfileMenu';
import SearchOverlay from './SearchOverlay';

const Navbar = ({ showNavLinks = false, onNavClick }) => {
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNavClick = (section) => {
    setIsMobileMenuOpen(false);
    onNavClick(section);
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-left">
          {showNavLinks && (
            <i
              className="fas fa-bars mobile-menu-btn"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            ></i>
          )}
          <Link to="/" className="navbar-brand">
            <img src="/images/touqx_logo.svg" alt="TOUQX Logo" className="logo" />
          </Link>
        </div>

        {showNavLinks && (
          <div className={`navbar-nav ${isMobileMenuOpen ? 'active' : ''}`}>
            <a href="#" className="nav-link" onClick={(e) => { e.preventDefault(); handleNavClick('home'); }}>Home</a>
            <a href="#" className="nav-link" onClick={(e) => { e.preventDefault(); handleNavClick('topRatedTvSection'); }}>TV Shows</a>
            <a href="#" className="nav-link" onClick={(e) => { e.preventDefault(); handleNavClick('trendingSection'); }}>Movies</a>
            <a href="#" className="nav-link" onClick={(e) => { e.preventDefault(); handleNavClick('popularSection'); }}>New & Popular</a>
            <Link to="/viewall?list=saved" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>My List</Link>
          </div>
        )}

        <div className="navbar-right" style={!showNavLinks ? { flexDirection: 'row' } : {}}>
          <ProfileMenu />
          <i className="fas fa-search" onClick={() => setIsSearchActive(true)}></i>
          {showNavLinks && <i className="fas fa-bell"></i>}
        </div>
      </nav>

      <SearchOverlay isActive={isSearchActive} onClose={() => setIsSearchActive(false)} />
    </>
  );
};

export default Navbar;
