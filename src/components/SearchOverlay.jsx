import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchTMDB } from '../api/tmdb';

const SearchOverlay = ({ isActive, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isActive, onClose]);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      try {
        const data = await fetchTMDB(`/search/multi?query=${encodeURIComponent(query)}`);
        const filtered = data.results.filter(
          (item) => item.media_type === 'movie' || item.media_type === 'tv'
        );
        setResults(filtered);
      } catch (error) {
        console.error('Search Error:', error);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  if (!isActive) return null;

  return (
    <div className="search-overlay active" id="searchOverlay" onClick={(e) => {
      if (e.target.className.includes('search-overlay')) onClose();
    }}>
      <div className="search-box">
        <input
          type="text"
          id="searchInput"
          placeholder="Search movies and TV shows..."
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div id="searchResults" className="search-results">
          {results.map((item) => {
            const title = item.title || item.name;
            const poster = item.poster_path
              ? `https://image.tmdb.org/t/p/w342${item.poster_path}`
              : '/images/no-poster.png'; // Will fix later if missing
            const year = (item.release_date || item.first_air_date || '').slice(0, 4);
            const type = item.media_type === 'movie' ? 'Movie' : 'TV Show';

            return (
              <div
                key={item.id}
                className="search-card"
                onClick={() => {
                  navigate(`/player?tmdb=${item.id}&type=${item.media_type}`);
                  onClose();
                }}
              >
                <img src={poster} alt={title} />
                <div className="search-info">
                  <h3>{title}</h3>
                  <p>{type} {year ? `• ${year}` : ''}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SearchOverlay;
