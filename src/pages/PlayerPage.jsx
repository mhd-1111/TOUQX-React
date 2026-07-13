import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import WatchModal from '../components/WatchModal';
import ContentRow from '../components/ContentRow';
import SimilarCard from '../components/SimilarCard';
import CastCard from '../components/CastCard';
import ReviewCard from '../components/ReviewCard';
import SeasonCard from '../components/SeasonCard';
import EpisodeCard from '../components/EpisodeCard';
import { fetchTMDB } from '../api/tmdb';
import { POSTER_500 } from '../config';

const LOCAL_MOVIES = {
  "the-boys": {
    title: "The Boys",
    description: "A group of vigilantes take down corrupt superheroes with the help of a mysterious figure.",
    poster: "/images/hero.jpg",
    video: "/videos/The Boys – Final Season Trailer _ Prime Video.mp4"
  },
  "breaking-bad": {
    title: "Breaking Bad",
    description: "A high school chemistry teacher diagnosed with a terminal illness turns to manufacturing and selling methamphetamine in order to secure his family's future.",
    poster: "/images/breaking-bad-hero.jpg",
    video: "/videos/Breaking Bad - Full Series Trailer.mp4"
  },
  "peaky-blinders": {
    title: "Peaky Blinders",
    description: "A gang of young men in Birmingham, England, struggle to survive and gain power in the aftermath of the Great War.",
    poster: "/images/peaky-blinders-3840x2160-14932.jpg",
    video: "/videos/Peaky Blinders - Season 1 - Trailer.mp4"
  },
  "john-wick-chapter-4": {
    title: "John Wick: Chapter 4",
    description: "John Wick is on the run after killing a member of the High Table, and with a $14 million price tag on his head, he must fight his way out of the city with the help of his old friends.",
    poster: "/images/john-wick-chapter-4-3840x2160-18980.jpg",
    video: "/videos/John Wick- Chapter 4 - Trailer (4K 60FPS) 2023.mp4"
  },
  "extraction-2": {
    title: "Extraction 2",
    description: "A black-market mercenary who has a strict code of conduct is hired to rescue the kidnapped son of an international crime lord.",
    poster: "/images/extraction2-hero.jpg",
    video: "/videos/Extraction 2 2023 Trailer 2  4K  without the Netflix logo.mp4"
  },
  "stranger-things": {
    title: "Stranger Things",
    description: "In the quiet town of Hawkins, a group of friends faces terrifying creatures and dark mysteries from a world beyond imagination.",
    poster: "/images/stranger-things-hero.jpg",
    video: "/videos/The Final Scene of Stranger Things 4 Volume 2 (Full) - Netflix.mp4"
  },
  "spider-man-brand-new-day": {
    title: "Spider-Man: Brand New Day",
    description: "Peter Parker returns as Spider-Man, facing new challenges, powerful enemies, and the responsibility that comes with protecting New York.",
    poster: "/images/spider-man-brand-new-day-poster-3840x2160-35753.jpg",
    video: "/videos/Spider-Man- Brand New Day - Official Trailer.mp4"
  }
};

const PlayerPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const localMovieId = searchParams.get('movie');
  const tmdbId = searchParams.get('tmdb');
  const mediaType = searchParams.get('type') || 'movie';

  const [movie, setMovie] = useState(null);
  const [trailerKey, setTrailerKey] = useState("");
  const [similar, setSimilar] = useState([]);
  const [cast, setCast] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [director, setDirector] = useState(null);
  const [directorMovies, setDirectorMovies] = useState([]);
  const [studio, setStudio] = useState(null);
  const [studioMovies, setStudioMovies] = useState([]);
  const [collection, setCollection] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  
  const [isPlayingTrailer, setIsPlayingTrailer] = useState(false);
  const [isWatchModalActive, setIsWatchModalActive] = useState(false);
  const [openedSeason, setOpenedSeason] = useState(null);

  const videoRef = useRef(null);
  const fireTransitionRef = useRef(null);
  const episodeSectionRef = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);

    if (localMovieId) {
      const localData = LOCAL_MOVIES[localMovieId];
      if (localData) {
        setMovie({
          isLocal: true,
          title: localData.title,
          description: localData.description,
          poster: localData.poster,
          video: localData.video,
        });
      }
    } else if (tmdbId) {
      // Load TMDB Data
      fetchTMDB(`/${mediaType}/${tmdbId}`)
        .then(data => {
          setMovie({
            isLocal: false,
            ...data
          });

          // Studio
          if (data.production_companies && data.production_companies.length > 0) {
            setStudio(data.production_companies[0]);
            fetchTMDB(`/discover/${mediaType}?with_companies=${data.production_companies[0].id}`)
              .then(res => setStudioMovies(res.results.slice(0, 10).filter(m => m.poster_path && m.id != tmdbId)))
              .catch(console.error);
          }

          // Collection
          if (mediaType === 'movie' && data.belongs_to_collection) {
            fetchTMDB(`/collection/${data.belongs_to_collection.id}`)
              .then(res => setCollection(res))
              .catch(console.error);
          }
        })
        .catch(console.error);

      // Videos
      fetchTMDB(`/${mediaType}/${tmdbId}/videos`)
        .then(data => {
          const trailer = data.results.find(v => v.type === "Trailer" && v.site === "YouTube") ||
                          data.results.find(v => v.type === "Teaser" && v.site === "YouTube") ||
                          data.results.find(v => v.site === "YouTube");
          if (trailer) setTrailerKey(trailer.key);
        })
        .catch(console.error);

      // Similar
      fetchTMDB(`/${mediaType}/${tmdbId}/similar`)
        .then(data => setSimilar(data.results.slice(0, 10).filter(m => m.poster_path && m.id != tmdbId)))
        .catch(console.error);

      // Credits (Cast & Director)
      fetchTMDB(`/${mediaType}/${tmdbId}/credits`)
        .then(data => {
          setCast(data.cast.slice(0, 10).filter(a => a.profile_path));
          
          let person = mediaType === "movie" 
            ? data.crew.find(m => m.job === "Director")
            : data.crew.find(m => m.job === "Creator") || data.crew.find(m => m.job === "Executive Producer");
            
          if (person) {
            setDirector(person);
            const endpoint = mediaType === "movie" ? "movie_credits" : "tv_credits";
            fetchTMDB(`/person/${person.id}/${endpoint}`)
              .then(res => {
                const works = mediaType === "movie" ? res.crew.filter(item => item.job === "Director") : res.crew;
                const uniqueWorks = works
                  .filter((item, idx, self) => idx === self.findIndex(w => w.id === item.id))
                  .filter(item => item.poster_path && item.id != tmdbId)
                  .sort((a, b) => new Date(b.release_date || b.first_air_date) - new Date(a.release_date || a.first_air_date))
                  .slice(0, 12);
                setDirectorMovies(uniqueWorks);
              })
              .catch(console.error);
          }
        })
        .catch(console.error);

      // Reviews
      fetchTMDB(`/${mediaType}/${tmdbId}/reviews`)
        .then(data => setReviews(data.results.slice(0, 3)))
        .catch(console.error);
    }
  }, [localMovieId, tmdbId, mediaType]);

  const handlePlayTrailer = () => {
    if (movie?.isLocal) {
      setIsPlayingTrailer(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.play().catch(() => {});
          videoRef.current.setAttribute("controls", "");
        }
      }, 100);
    } else {
      if (!trailerKey) {
        alert("Trailer not available.");
        return;
      }
      if (fireTransitionRef.current) {
        fireTransitionRef.current.classList.add("active");
        setTimeout(() => {
          setIsPlayingTrailer(true);
        }, 650);
      } else {
        setIsPlayingTrailer(true);
      }
    }
  };

  const handleCloseTrailer = () => {
    setIsPlayingTrailer(false);
    if (fireTransitionRef.current) fireTransitionRef.current.classList.remove("active");
    if (movie?.isLocal && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      videoRef.current.removeAttribute("controls");
    }
  };

  const handleSeasonClick = (seasonNum) => {
    if (openedSeason === seasonNum) {
      setOpenedSeason(null);
      setEpisodes([]);
      return;
    }
    setOpenedSeason(seasonNum);
    setEpisodes([]); // loading state
    fetchTMDB(`/tv/${tmdbId}/season/${seasonNum}`)
      .then(data => {
        setEpisodes(data.episodes);
        if (episodeSectionRef.current) {
          episodeSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      })
      .catch(console.error);
  };

  if (!movie) return <div style={{ color: 'white', padding: '100px' }}>Loading...</div>;

  const title = movie.isLocal ? movie.title : (movie.title || movie.name);
  const description = movie.isLocal ? movie.description : movie.overview;
  const poster = movie.isLocal ? movie.poster : `https://image.tmdb.org/t/p/w780${movie.poster_path}`;
  
  let rating, year, runtime, genres;
  if (!movie.isLocal) {
    rating = `⭐ ${movie.vote_average.toFixed(1)}`;
    const releaseDate = movie.release_date || movie.first_air_date;
    year = `📅 ${releaseDate ? releaseDate.slice(0,4) : "N/A"}`;
    if (mediaType === "movie") {
      runtime = `⏱ ${movie.runtime || "--"} min`;
    } else {
      const seasons = movie.number_of_seasons || 0;
      const eps = movie.number_of_episodes || 0;
      runtime = `📺 ${seasons} Season${seasons !== 1 ? 's' : ''} • ${eps} Episode${eps !== 1 ? 's' : ''}`;
    }
    genres = `🎭 ${movie.genres?.map(g => g.name).join(" • ")}`;
  } else {
    rating = "⭐ --"; year = "📅 ----"; runtime = "⏱ -- min"; genres = "🎭 ---";
  }

  return (
    <>
      <Navbar />
      <button className="back-btn" onClick={() => navigate(-1)}>
        <i className="fa-solid fa-arrow-left"></i>
      </button>

      <div className="media-container">
        <img src={poster} alt={title} className="movie-poster" id="moviePoster" />
        
        <div className="trailer-container" style={{ display: isPlayingTrailer ? 'flex' : 'none' }}>
          <div className="fire-transition" ref={fireTransitionRef}></div>
          
          {movie.isLocal ? (
            <video id="movieTrailer" ref={videoRef} src={movie.video} poster={movie.poster} style={{ display: 'block' }} onEnded={handleCloseTrailer}></video>
          ) : (
            <iframe
              id="youtubeTrailer"
              className={isPlayingTrailer ? 'show' : ''}
              src={isPlayingTrailer ? `https://www.youtube.com/embed/${trailerKey}?autoplay=1&rel=0&modestbranding=1&playsinline=1` : ''}
              allow="autoplay; encrypted-media"
              allowFullScreen
              style={{ display: isPlayingTrailer ? 'block' : 'none' }}
            ></iframe>
          )}
          <button id="closeTrailerBtn" style={{ display: isPlayingTrailer ? 'flex' : 'none' }} onClick={handleCloseTrailer}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
      </div>

      <div className="player-container">
        <h1 id="movieTitle">{title}</h1>
        <div className="movie-meta">
          <span id="movieRating">{rating}</span>
          <span id="movieYear">{year}</span>
          <span id="movieRuntime">{runtime}</span>
          <span id="movieGenres">{genres}</span>
        </div>
        <p id="movieDescription">{description}</p>
        
        <button id="playTrailerBtn" onClick={handlePlayTrailer} disabled={!movie.isLocal && !trailerKey}>
          ▶ {(!movie.isLocal && !trailerKey) ? "Trailer Unavailable" : "Play Trailer"}
        </button>
        <button id="watchMovieBtn" onClick={() => setIsWatchModalActive(true)}>🎬 Watch Now</button>

        {!movie.isLocal && mediaType === 'tv' && movie.seasons && (
          <section className="season-section" style={{ display: 'block' }}>
            <h2 id="seasonTitle">📺 Seasons</h2>
            <div id="seasonRow" className="season-row">
              {movie.seasons.map(s => (
                <SeasonCard key={s.id} season={s} isActive={openedSeason === s.season_number} onClick={() => handleSeasonClick(s.season_number)} />
              ))}
            </div>
          </section>
        )}

        {!movie.isLocal && mediaType === 'tv' && openedSeason !== null && (
          <section className="episode-section" ref={episodeSectionRef} style={{ display: 'block' }}>
            <h2 id="episodeTitle">Season {openedSeason} Episodes</h2>
            <div id="episodeRow" className="episode-row">
              {episodes.length === 0 ? "Loading..." : episodes.map(ep => (
                <EpisodeCard key={ep.id} episode={ep} onPlayClick={() => setIsWatchModalActive(true)} />
              ))}
            </div>
          </section>
        )}

        {!movie.isLocal && cast.length > 0 && (
          <section className="cast-section">
            <div className="section-header"><h2>Top Cast</h2></div>
            <ContentRow id="castRow">
              {cast.map(c => <CastCard key={c.id} actor={c} />)}
            </ContentRow>
          </section>
        )}

        {!movie.isLocal && (
          <section className="reviews-section">
            <h2>User Reviews</h2>
            <div id="reviewsContainer">
              {reviews.length === 0 ? <p>No reviews available.</p> : reviews.map(r => <ReviewCard key={r.id} review={r} />)}
            </div>
          </section>
        )}

        {!movie.isLocal && similar.length > 0 && (
          <section className="similar-section">
            <div className="section-header"><h2>More Like This</h2></div>
            <ContentRow id="similarMovies">
              {similar.map(m => <SimilarCard key={m.id} item={m} />)}
            </ContentRow>
          </section>
        )}

        {!movie.isLocal && studio && studioMovies.length > 0 && (
          <section id="studioSection" className="studio-section">
            <div className="section-header"><h2 id="studioTitle">🎬 Explore {studio.name}</h2></div>
            <ContentRow id="studioMovies">
              {studioMovies.map(m => <SimilarCard key={m.id} item={m} />)}
            </ContentRow>
          </section>
        )}

        {!movie.isLocal && collection && (
          <section id="collectionSection" className="collection-section">
            <div className="section-header"><h2 id="collectionTitle">{collection.name}</h2></div>
            <ContentRow id="collectionRow">
              {collection.parts.filter(m => m.poster_path && m.id != tmdbId).map(m => <SimilarCard key={m.id} item={m} />)}
            </ContentRow>
          </section>
        )}

        {!movie.isLocal && director && directorMovies.length > 0 && (
          <section id="directorSection" className="director-section">
            <div className="section-header">
              <h2 id="directorTitle">{mediaType === 'movie' ? `Films by ${director.name}` : `More from ${director.name}`}</h2>
            </div>
            <ContentRow id="directorRow">
              {directorMovies.map(m => <SimilarCard key={m.id} item={m} />)}
            </ContentRow>
          </section>
        )}
      </div>

      <WatchModal isActive={isWatchModalActive} onClose={() => setIsWatchModalActive(false)} />
    </>
  );
};

export default PlayerPage;
