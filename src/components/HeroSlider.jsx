import { useState, useEffect, useRef } from 'react';
import HeroSlide from './HeroSlide';
import { fetchTMDB } from '../api/tmdb';

// ─── Slide data ──────────────────────────────────────────────────────────────
const HERO_MOVIES = [
  {
    id: "stranger-things",
    tmdbId: 66732,
    tmdbType: "tv",
    title: "Stranger Things",
    description: "In the quiet town of Hawkins, a group of friends faces terrifying creatures and dark mysteries from a world beyond imagination. What starts as a search for a missing boy uncovers a secret government lab and an alternate dimension.",
    poster: "/images/stranger-things-hero.jpg",
    video: "/videos/The Final Scene of Stranger Things 4 Volume 2 (Full) - Netflix.mp4",
  },
  {
    id: "extraction-2",
    tmdbId: 697843,
    tmdbType: "movie",
    title: "Extraction 2",
    description: "A black-market mercenary who has a strict code of conduct is hired to rescue the kidnapped son of an international crime lord. The mission tests his limits and pushes him to the edge of survival.",
    poster: "/images/extraction2-hero.jpg",
    video: "/videos/Extraction 2 2023 Trailer 2  4K  without the Netflix logo.mp4",
  },
  {
    id: "peaky-blinders",
    tmdbId: 60574,
    tmdbType: "tv",
    title: "Peaky Blinders",
    description: "A gang of young men in Birmingham, England, struggle to survive and gain power in the aftermath of the Great War. Led by the cunning Tommy Shelby, they expand their criminal empire amidst rising tensions.",
    poster: "/images/peaky-blinders-3840x2160-14932.jpg",
    video: "/videos/Peaky Blinders - Season 1 - Trailer.mp4",
  },
  {
    id: "john-wick-chapter-4",
    tmdbId: 603692,
    tmdbType: "movie",
    title: "John Wick: Chapter 4",
    description: "John Wick is on the run after killing a member of the High Table, and with a $14 million price tag on his head, he must fight his way out of the city with the help of his old friends.",
    poster: "/images/john-wick-chapter-4-3840x2160-18980.jpg",
    video: "/videos/John Wick- Chapter 4 - Trailer (4K 60FPS) 2023.mp4",
  },
  {
    id: "the-boys",
    tmdbId: 76479,
    tmdbType: "tv",
    title: "The Boys",
    description: "A group of vigilantes take down corrupt superheroes who abuse their superpowers. The Boys must expose the truth about Vought International, the multi-billion dollar conglomerate that manages the heroes.",
    poster: "/images/hero.jpg",
    video: "/videos/The Boys – Final Season Trailer _ Prime Video.mp4",
  },
  {
    id: "spider-man-brand-new-day",
    tmdbId: 315635,
    tmdbType: "movie",
    title: "Spider-Man: Brand New Day",
    description: "Peter Parker returns as Spider-Man, facing new challenges, powerful enemies, and the responsibility that comes with protecting New York.",
    poster: "/images/spider-man-brand-new-day-poster-3840x2160-35753.jpg",
    video: "/videos/Spider-Man- Brand New Day - Official Trailer.mp4",
  },
  {
    id: "breaking-bad",
    tmdbId: 1396,
    tmdbType: "tv",
    title: "Breaking Bad",
    description: "A high school chemistry teacher diagnosed with a terminal illness turns to manufacturing and selling methamphetamine in order to secure his family's future.",
    poster: "/images/breaking-bad-hero.jpg",
    video: "/videos/Breaking Bad - Full Series Trailer.mp4",
  }
];

// ─── sessionStorage key ──────────────────────────────────────────────────────
const SESSION_KEY = 'heroSliderIndex';

// Read saved index or fall back to first real slide (1)
function readSavedIndex(slideCount) {
  try {
    const saved = parseInt(sessionStorage.getItem(SESSION_KEY), 10);
    // saved is the raw slider index (1 … slideCount); validate it
    if (!isNaN(saved) && saved >= 1 && saved <= slideCount) return saved;
  } catch (_) {
    // sessionStorage unavailable (private browsing, quota exceeded, etc.)
  }
  return 1;
}

// ─── Component ───────────────────────────────────────────────────────────────
const HeroSlider = () => {
  // ── Enrich hero movies with TMDB poster_path (runs once at mount) ─────────
  // This makes poster_path available when addToHistory saves hero items,
  // so they display proper TMDB posters in History/Liked/Saved.
  const [heroMovies, setHeroMovies] = useState(HERO_MOVIES);

  useEffect(() => {
    Promise.all(
      HERO_MOVIES.map(movie =>
        movie.tmdbId
          ? fetchTMDB(`/${movie.tmdbType}/${movie.tmdbId}`)
              .then(data => ({ ...movie, poster_path: data.poster_path }))
              .catch(() => movie)
          : Promise.resolve(movie)
      )
    ).then(setHeroMovies);
  }, []);

  // Infinite-loop clone array: [lastReal, ...reals, firstReal]
  const slides = [heroMovies[heroMovies.length - 1], ...heroMovies, heroMovies[0]];
  const realSlideCount = heroMovies.length;

  // Restore index from sessionStorage immediately so the correct slide is
  // rendered on the very first paint — no jump, no flicker.
  const [index, setIndex] = useState(() => readSavedIndex(realSlideCount));

  // Start WITHOUT animation so the restored slide appears instantly.
  // We enable transitions on the first user interaction / autoplay tick.
  const [isTransitioning, setIsTransitioning] = useState(false);

  const sliderRef    = useRef(null);
  const autoplayRef  = useRef(null);

  // Ref (not state) — readable inside intervals without stale closures,
  // and changes don't trigger re-renders.
  const isHoveringRef = useRef(false);

  // ── Autoplay helpers ───────────────────────────────────────────────────────
  const stopAutoplay = () => {
    if (autoplayRef.current) {
      clearInterval(autoplayRef.current);
      autoplayRef.current = null;
    }
  };

  const startAutoplay = () => {
    // Guard: never stack two intervals
    if (autoplayRef.current) return;

    autoplayRef.current = setInterval(() => {
      // Double-check hover inside the tick so a stale interval can't slide
      // while the user is hovering (defensive, belt-and-suspenders).
      if (isHoveringRef.current) return;
      // Enable transition for the autoplay advance
      setIsTransitioning(true);
      setIndex(prev => {
        const next = prev + 1;
        // Clamp: handleTransitionEnd will perform the seamless loop jump
        return next >= slides.length ? prev : next;
      });
    }, 3000);
  };

  // ── Persist index every time it changes ───────────────────────────────────
  useEffect(() => {
    try {
      sessionStorage.setItem(SESSION_KEY, String(index));
    } catch (_) { /* ignore */ }
  }, [index]);

  // ── Mount-time setup (runs once after the first render) ───────────────────
  useEffect(() => {
    // 1. Correct the hover ref if the cursor is already inside the wrapper.
    //    Browsers don't re-fire mouseenter for elements under the cursor on
    //    mount, so we check CSS :hover state directly.
    const wrapper = document.querySelector('.hero-wrapper');
    if (wrapper && wrapper.matches(':hover')) {
      isHoveringRef.current = true;
    }

    // 2. Start autoplay only when the cursor is NOT already hovering.
    if (!isHoveringRef.current) {
      startAutoplay();
    }

    // 3. Enable CSS transition after the first paint so position restore is
    //    instant but subsequent movements are animated.
    const transitionTimer = setTimeout(() => setIsTransitioning(true), 50);

    return () => {
      clearTimeout(transitionTimer);
      stopAutoplay();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Navigation helpers ────────────────────────────────────────────────────
  const handleNext = () => {
    if (index >= slides.length - 1) return;
    setIsTransitioning(true);
    setIndex(prev => prev + 1);
  };

  const handlePrev = () => {
    if (index <= 0) return;
    setIsTransitioning(true);
    setIndex(prev => prev - 1);
  };

  // Seamless infinite loop: when the clone slides are reached, silently jump
  // back to the real counterpart without animation.
  const handleTransitionEnd = () => {
    if (index === 0) {
      setIsTransitioning(false);
      setIndex(realSlideCount); // clone of last → real last
    } else if (index === slides.length - 1) {
      setIsTransitioning(false);
      setIndex(1);              // clone of first → real first
    }
  };

  // ── Touch / swipe ─────────────────────────────────────────────────────────
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd,   setTouchEnd]   = useState(null);
  const MIN_SWIPE_DISTANCE = 50;

  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
    setTouchEnd(null);
    stopAutoplay();
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStart !== null && touchEnd !== null) {
      const distance = touchStart - touchEnd;
      if (Math.abs(distance) >= MIN_SWIPE_DISTANCE) {
        distance > 0 ? handleNext() : handlePrev();
      }
    }
    if (!isHoveringRef.current) startAutoplay();
  };

  // ── Keyboard navigation ───────────────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (document.activeElement.tagName === 'INPUT' ||
          document.activeElement.tagName === 'TEXTAREA') return;
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft')  handlePrev();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [index]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Dot indicator ────────────────────────────────────────────────────────
  let activeDot = index - 1;
  if (activeDot < 0)                activeDot = realSlideCount - 1;
  if (activeDot >= realSlideCount)  activeDot = 0;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div
      className="hero-wrapper"
      onMouseEnter={() => { isHoveringRef.current = true;  stopAutoplay(); }}
      onMouseLeave={() => { isHoveringRef.current = false; startAutoplay(); }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <button className="arrow left"  onClick={handlePrev}>&#10094;</button>
      <button className="arrow right" onClick={handleNext}>&#10095;</button>

      <div
        className="hero-slider"
        ref={sliderRef}
        onTransitionEnd={handleTransitionEnd}
        style={{
          transform: `translateX(-${index * 100}vw)`,
          transition: isTransitioning ? 'transform 0.4s ease' : 'none',
        }}
      >
        {slides.map((movie, i) => (
          <HeroSlide key={`${movie.id}-${i}`} movie={movie} />
        ))}
      </div>

      <div className="hero-dots">
        {heroMovies.map((_, i) => (
          <span
            key={i}
            className={`dot ${i === activeDot ? 'active' : ''}`}
            onClick={() => {
              setIsTransitioning(true);
              setIndex(i + 1);
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroSlider;
