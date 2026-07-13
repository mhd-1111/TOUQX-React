import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import MovieCard from '../components/MovieCard';
import { fetchTMDB } from '../api/tmdb';

const CATEGORIES = {
  trending: { title: "Trending Movies", endpoint: "/trending/movie/week" },
  popular: { title: "Popular Movies", endpoint: "/movie/popular" },
  top_rated: { title: "Top Rated Movies", endpoint: "/movie/top_rated" },
  upcoming: { title: "Upcoming Movies", endpoint: "/movie/upcoming" },
  now_playing: { title: "Now Playing", endpoint: "/movie/now_playing" },
  action: { title: "Action Movies", endpoint: "/discover/movie?with_genres=28" },
  horror: { title: "Horror Movies", endpoint: "/discover/movie?with_genres=27" },
  comedy: { title: "Comedy Movies", endpoint: "/discover/movie?with_genres=35" },
  top_rated_tv: { title: "Top Rated TV Shows", endpoint: "/tv/top_rated" },
  popular_tv: { title: "Popular TV Shows", endpoint: "/tv/popular" }
};

const ViewAllPage = () => {
  const [searchParams] = useSearchParams();
  const categoryKey = searchParams.get('category');
  const navigate = useNavigate();
  
  const [movies, setMovies] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentGroup, setCurrentGroup] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const category = CATEGORIES[categoryKey] || { title: "All Movies", endpoint: "/trending/movie/week" };

  useEffect(() => {
    const separator = category.endpoint.includes('?') ? '&' : '?';
    
    fetchTMDB(`${category.endpoint}${separator}page=${currentPage}`)
      .then(data => {
        setMovies(data.results);
        setTotalPages(data.total_pages);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      })
      .catch(console.error);
  }, [category.endpoint, currentPage]);

  const startPage = (currentGroup - 1) * 5 + 1;
  const endPage = Math.min(startPage + 4, totalPages);

  const pages = [];
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <>
      <Navbar />
      
      <header className="view-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <i className="fa-solid fa-arrow-left"></i>
        </button>
        <h1 id="pageTitle">{category.title}</h1>
      </header>

      <main>
        <div id="movieGrid" className="movie-grid">
          {movies.map(movie => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>

        <div className="pagination">
          <button 
            id="prevBtn" 
            className={`page-btn ${startPage === 1 ? 'hidden' : ''}`}
            style={{ display: startPage === 1 ? 'none' : 'flex' }}
            onClick={() => setCurrentGroup(prev => prev - 1)}
          >
            <i className="fa-solid fa-chevron-left"></i> Previous
          </button>

          <div id="pageNumbers" className="page-numbers">
            {pages.map(pageNum => (
              <div 
                key={pageNum}
                className={`page-number ${pageNum === currentPage ? 'active' : ''}`}
                onClick={() => setCurrentPage(pageNum)}
              >
                {pageNum}
              </div>
            ))}
          </div>

          <button 
            id="nextBtn" 
            className={`page-btn ${endPage >= totalPages ? 'hidden' : ''}`}
            style={{ display: endPage >= totalPages ? 'none' : 'flex' }}
            onClick={() => {
              setCurrentGroup(prev => prev + 1);
              setCurrentPage(endPage + 1);
            }}
          >
            Next <i className="fa-solid fa-chevron-right"></i>
          </button>
        </div>
      </main>
    </>
  );
};

export default ViewAllPage;
