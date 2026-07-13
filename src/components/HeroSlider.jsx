import { useState, useEffect, useRef } from 'react';
import HeroSlide from './HeroSlide';

const HERO_MOVIES = [
  {
    id: "breaking-bad",
    title: "Breaking Bad",
    description: "A chemistry teacher's desperate decision leads him into the ruthless world of drug manufacturing, where power, family, and survival collide.",
    poster: "/images/breaking-bad-hero.jpg",
    video: "/videos/Breaking Bad - Full Series Trailer.mp4"
  },
  {
    id: "peaky-blinders",
    title: "Peaky Blinders",
    description: "A ruthless gang led by the brilliant Tommy Shelby fights for power, respect, and survival in the streets of post-war England.",
    poster: "/images/peaky-blinders-3840x2160-14932.jpg",
    video: "/videos/Peaky Blinders - Season 1 - Trailer.mp4"
  },
  {
    id: "john-wick-chapter-4",
    title: "John Wick: Chapter 4",
    description: "Hunted by the world's deadliest killers, John Wick risks everything for one final chance at freedom.",
    poster: "/images/john-wick-chapter-4-3840x2160-18980.jpg",
    video: "/videos/John Wick- Chapter 4 - Trailer (4K 60FPS) 2023.mp4"
  },
  {
    id: "extraction-2",
    title: "Extraction 2",
    description: "Mercenary Tyler Rake takes on his deadliest mission yet, risking everything to save a family trapped in a brutal criminal empire.",
    poster: "/images/extraction2-hero.jpg",
    video: "/videos/Extraction 2 2023 Trailer 2  4K  without the Netflix logo.mp4"
  },
  {
    id: "the-boys",
    title: "The Boys",
    description: "A group of vigilantes set out to take down corrupt superheroes who abuse their superpowers.",
    poster: "/images/hero.jpg",
    video: "/videos/The Boys – Final Season Trailer _ Prime Video.mp4"
  },
  {
    id: "stranger-things",
    title: "Stranger Things",
    description: "In the quiet town of Hawkins, a group of friends faces terrifying creatures and dark mysteries from a world beyond imagination.",
    poster: "/images/stranger-things-hero.jpg",
    video: "/videos/The Final Scene of Stranger Things 4 Volume 2 (Full) - Netflix.mp4"
  },
  {
    id: "spider-man-brand-new-day",
    title: "Spider-Man: Brand New Day",
    description: "Peter Parker returns as Spider-Man, facing new challenges, powerful enemies, and the responsibility that comes with protecting New York.",
    poster: "/images/spider-man-brand-new-day-poster-3840x2160-35753.jpg",
    video: "/videos/Spider-Man- Brand New Day - Official Trailer.mp4"
  }
];

const HeroSlider = () => {
  // To simulate the infinite loop clone effect seamlessly in React, 
  // we add a clone of the last element to the front, and clone of first to back
  const slides = [HERO_MOVIES[HERO_MOVIES.length - 1], ...HERO_MOVIES, HERO_MOVIES[0]];
  
  const [index, setIndex] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const sliderRef = useRef(null);
  const autoplayRef = useRef(null);

  const realSlideCount = HERO_MOVIES.length;

  const startAutoplay = () => {
    stopAutoplay();
    autoplayRef.current = setInterval(() => {
      handleNext();
    }, 3000);
  };

  const stopAutoplay = () => {
    if (autoplayRef.current) {
      clearInterval(autoplayRef.current);
    }
  };

  useEffect(() => {
    startAutoplay();
    return () => stopAutoplay();
  }, [index]);

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

  const handleTransitionEnd = () => {
    if (index === 0) {
      setIsTransitioning(false);
      setIndex(realSlideCount); // jump to the last real slide
    } else if (index === slides.length - 1) {
      setIsTransitioning(false);
      setIndex(1); // jump to the first real slide
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (document.activeElement.tagName === "INPUT" || document.activeElement.tagName === "TEXTAREA") return;
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [index]);

  // The active dot is index-1, wrapping around if needed
  let activeDot = index - 1;
  if (activeDot < 0) activeDot = realSlideCount - 1;
  if (activeDot >= realSlideCount) activeDot = 0;

  return (
    <div 
      className="hero-wrapper"
      onMouseEnter={stopAutoplay}
      onMouseLeave={startAutoplay}
    >
      <button className="arrow left" onClick={handlePrev}>&#10094;</button>
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
        {HERO_MOVIES.map((_, i) => (
          <span 
            key={i} 
            className={`dot ${i === activeDot ? 'active' : ''}`}
            onClick={() => {
              setIsTransitioning(true);
              setIndex(i + 1);
            }}
          ></span>
        ))}
      </div>
    </div>
  );
};

export default HeroSlider;
