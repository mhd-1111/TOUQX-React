import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import HeroSlider from '../components/HeroSlider';
import ContentRow from '../components/ContentRow';
import MovieCard from '../components/MovieCard';
import ViewAllCard from '../components/ViewAllCard';
import { fetchTMDB } from '../api/tmdb';

const ROW_CONFIGS = [
  { id: 'trendingSection', title: 'Trending Now', endpoint: '/trending/movie/week', category: 'trending' },
  { id: 'topRatedSection', title: 'Top Rated', endpoint: '/movie/top_rated', category: 'top_rated' },
  { id: 'popularSection', title: 'Popular', endpoint: '/movie/popular', category: 'popular' },
  { id: 'upcomingSection', title: 'Upcoming', endpoint: '/movie/upcoming', category: 'upcoming' },
  { id: 'nowPlayingSection', title: 'Now Playing', endpoint: '/movie/now_playing', category: 'now_playing' },
  { id: 'popularTvSection', title: 'Popular TV Shows', endpoint: '/tv/popular', category: 'popular_tv' },
  { id: 'actionSection', title: 'Action Movies', endpoint: '/discover/movie?with_genres=28', category: 'action' },
  { id: 'horrorSection', title: 'Horror', endpoint: '/discover/movie?with_genres=27', category: 'horror' },
  { id: 'comedySection', title: 'Comedy', endpoint: '/discover/movie?with_genres=35', category: 'comedy' },
  { id: 'topRatedTvSection', title: 'Top Rated TV Shows', endpoint: '/tv/top_rated', category: 'top_rated_tv' }
];

const MovieRow = ({ config }) => {
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    fetchTMDB(config.endpoint)
      .then(data => setMovies(data.results))
      .catch(console.error);
  }, [config.endpoint]);

  return (
    <section id={config.id} className="content-section">
      <div className="section-header">
        <h2 className="section-title">{config.title}</h2>
      </div>
      <ContentRow id={config.id + 'Row'}>
        {movies.map(movie => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
        {movies.length > 0 && <ViewAllCard category={config.category} />}
      </ContentRow>
    </section>
  );
};

const HomePage = () => {
  const scrollToSection = (id) => {
    if (id === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    document.getElementById(id)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  };

  return (
    <div>
      <Navbar showNavLinks={true} onNavClick={scrollToSection} />
      <HeroSlider />
      
      <div className="container">
        {ROW_CONFIGS.map(config => (
          <MovieRow key={config.id} config={config} />
        ))}
      </div>
    </div>
  );
};

export default HomePage;
